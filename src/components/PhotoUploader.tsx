"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePhotoContext } from "@/components/PhotoContext";

const META_KEY = "posture_photo_meta";

type PhotoKey = "front" | "side" | "back";

const slots: { key: PhotoKey; title: string; hint: string }[] = [
  { key: "front", title: "Front", hint: "Face the camera, arms relaxed" },
  { key: "side", title: "Side", hint: "Profile view, natural stance" },
  { key: "back", title: "Back", hint: "Show shoulders and hips" },
];

type PhotoMeta = Record<PhotoKey, boolean>;
const emptyMeta: PhotoMeta = { front: false, side: false, back: false };

export default function PhotoUploader() {
  const { photos, setPhoto } = usePhotoContext();
  const [meta, setMeta] = useState<PhotoMeta>(emptyMeta);
  const [objectUrls, setObjectUrls] = useState<Record<PhotoKey, string | null>>({
    front: null,
    side: null,
    back: null,
  });
  const lastFilesRef = useRef<Record<PhotoKey, File | null>>({
    front: null,
    side: null,
    back: null,
  });

  useEffect(() => {
    return () => {
      Object.values(objectUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [objectUrls]);

  const saveMeta = (next: PhotoMeta) => {
    setMeta(next);
    localStorage.setItem(META_KEY, JSON.stringify(next));
  };

  useEffect(() => {
    setObjectUrls((prev) => {
      const next = { ...prev };
      (Object.keys(photos) as PhotoKey[]).forEach((key) => {
        const file = photos[key];
        const lastFile = lastFilesRef.current[key];
        if (file !== lastFile) {
          if (prev[key]) URL.revokeObjectURL(prev[key] as string);
          next[key] = file ? URL.createObjectURL(file) : null;
          lastFilesRef.current[key] = file ?? null;
        }
      });
      return next;
    });
  }, [photos]);

  useEffect(() => {
    const nextMeta: PhotoMeta = {
      front: Boolean(photos.front),
      side: Boolean(photos.side),
      back: Boolean(photos.back),
    };
    saveMeta(nextMeta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.front, photos.side, photos.back]);

  const handleFile = async (key: PhotoKey, file: File) => {
    setObjectUrls((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key] as string);
      return { ...prev, [key]: URL.createObjectURL(file) };
    });
    lastFilesRef.current[key] = file;
    await setPhoto(key, file);
  };

  const handleDelete = async (key: PhotoKey) => {
    setObjectUrls((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key] as string);
      return { ...prev, [key]: null };
    });
    lastFilesRef.current[key] = null;
    await setPhoto(key, null);
  };

  const filledCount = useMemo(
    () => Object.values(photos).filter((entry) => entry !== null).length,
    [photos]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <p className="font-semibold">Note</p>
        <p className="mt-1">
          Photos are stored on this device. Clearing site data will remove them.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
        <p>
          Filled slots:{" "}
          <span className="font-semibold text-slate-900">
            {filledCount} / 3
          </span>
        </p>
        <p className="text-slate-500">
          Lightweight metadata is saved locally for quick status.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {slots.map((slot) => {
          const value = photos[slot.key];
          const previewUrl = objectUrls[slot.key];
        return (
          <div
            key={slot.key}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {slot.title} photo
                </p>
                <p className="text-xs text-slate-500">{slot.hint}</p>
              </div>
              {value ? (
                <button
                  type="button"
                  onClick={() => handleDelete(slot.key)}
                  className="text-xs font-semibold text-rose-600"
                >
                  Delete
                </button>
              ) : null}
            </div>

            <div className="mt-4">
              {value && previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`${slot.title} preview`}
                  className="h-48 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                  No photo yet
                </div>
              )}
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
              {value ? "Replace photo" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleFile(slot.key, file);
                }}
              />
            </label>
          </div>
        );
      })}
      </div>
    </div>
  );
}
