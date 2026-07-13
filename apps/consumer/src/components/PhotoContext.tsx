"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  clearPhotos as clearStoredPhotos,
  listPhotos,
  removePhoto as removeStoredPhoto,
  setPhoto as saveStoredPhoto,
  type PhotoSlot,
} from "@praxis/engine";

type PhotoKey = PhotoSlot;

type PhotoState = Record<PhotoKey, File | null>;

type PhotoContextValue = {
  photos: PhotoState;
  setPhoto: (key: PhotoKey, file: File | null) => Promise<void>;
  clearPhotos: () => Promise<void>;
};

const emptyState: PhotoState = { front: null, side: null, back: null };

const PhotoContext = createContext<PhotoContextValue | null>(null);

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<PhotoState>(emptyState);
  const hasLocalChanges = useRef(false);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      try {
        const stored = await listPhotos();
        if (!active) return;
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
  }, []);

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
