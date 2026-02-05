"use client";

import { createContext, useContext, useMemo, useState } from "react";

type PhotoKey = "front" | "side" | "back";

type PhotoState = Record<PhotoKey, File | null>;

type PhotoContextValue = {
  photos: PhotoState;
  setPhoto: (key: PhotoKey, file: File | null) => void;
  clearPhotos: () => void;
};

const emptyState: PhotoState = { front: null, side: null, back: null };

const PhotoContext = createContext<PhotoContextValue | null>(null);

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const [photos, setPhotos] = useState<PhotoState>(emptyState);

  const setPhoto = (key: PhotoKey, file: File | null) => {
    setPhotos((prev) => ({ ...prev, [key]: file }));
  };

  const clearPhotos = () => setPhotos(emptyState);

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
