"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  clearPhotos as clearStoredPhotos,
  listPhotos,
  removePhoto as removeStoredPhoto,
  setActivePhotoNamespace,
  setPhoto as saveStoredPhoto,
  type PhotoSlot,
} from "@/lib/photoStore";

type PhotoKey = PhotoSlot;

type PhotoState = Record<PhotoKey, File | null>;

type PhotoContextValue = {
  photos: PhotoState;
  setPhoto: (key: PhotoKey, file: File | null) => Promise<void>;
  clearPhotos: () => Promise<void>;
};

const emptyState: PhotoState = { front: null, side: null, back: null };

const PhotoContext = createContext<PhotoContextValue | null>(null);

type PhotoProviderProps = {
  /**
   * Server session's user id (or null for guest/signed-out use). Photos are
   * namespaced per account (Phase 6e, Commit 1 / SR-6e, ED-6e.1) — set as a
   * server-rendered prop, not discovered client-side, so the very first
   * hydrate on a fresh page load already reads the right account's photos
   * instead of racing a client-side session fetch.
   */
  userId: string | null;
  children: React.ReactNode;
};

export function PhotoProvider({ userId, children }: PhotoProviderProps) {
  // Set synchronously during render, not inside an effect (Phase 6e, Commit
  // 1). Effects run after commit — too late: a fast interaction right after
  // mount (an automated test's file-input change, or just a quick real
  // user) can reach `setPhoto` before a commit-phase effect has had a
  // chance to run, persisting the photo under the wrong (stale/default)
  // namespace. This module-level assignment doesn't affect this render's
  // output, so doing it in the render body is safe, and it guarantees every
  // descendant (PhotoUploader included) sees the correct namespace from its
  // very first paint.
  setActivePhotoNamespace(userId);

  const [photos, setPhotos] = useState<PhotoState>(emptyState);
  // Reset during render when `userId` changes, rather than in the effect
  // below — React's documented pattern for "adjusting state when a prop
  // changes." An account switch must never show the previous account's
  // photos, even for a single paint while an effect is still scheduled.
  const [namespaceForPhotos, setNamespaceForPhotos] = useState(userId);
  if (namespaceForPhotos !== userId) {
    setNamespaceForPhotos(userId);
    setPhotos(emptyState);
  }
  const hasLocalChanges = useRef(false);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      try {
        const stored = await listPhotos();
        if (!active) return;
        // Merge rather than replace: an upload made between mount and this
        // async read resolving (e.g. a fast setPhoto right after page load)
        // must not be clobbered by a slower IndexedDB read of the (correct,
        // but now stale) prior contents.
        setPhotos((prev) => {
          const next: PhotoState = { ...prev };
          (Object.keys(stored) as PhotoKey[]).forEach((key) => {
            if (!next[key]) {
              next[key] = stored[key];
            }
          });
          return next;
        });
      } catch (error) {
        console.error("Failed to load stored photos", error);
      }
    };
    hydrate();
    return () => {
      active = false;
    };
  }, [userId]);

  const setPhoto = async (key: PhotoKey, file: File | null) => {
    hasLocalChanges.current = true;
    setPhotos((prev) => ({ ...prev, [key]: file }));
    try {
      if (file) {
        await saveStoredPhoto(key, file);
      } else {
        await removeStoredPhoto(key);
      }
    } catch (error) {
      console.error("Failed to persist photo", error);
    }
  };

  const clearPhotos = async () => {
    hasLocalChanges.current = true;
    setPhotos(emptyState);
    try {
      await clearStoredPhotos();
    } catch (error) {
      console.error("Failed to clear stored photos", error);
    }
  };

  const value = useMemo(
    () => ({ photos, setPhoto, clearPhotos }),
    [photos]
  );

  return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>;
}

export const usePhotoContext = () => {
  const ctx = useContext(PhotoContext);
  if (!ctx) {
    throw new Error("usePhotoContext must be used within PhotoProvider");
  }
  return ctx;
};
