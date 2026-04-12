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

export default function PhotoUploader() {
  const { photos, setPhoto } = usePhotoContext();
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
      <div className="ui-card ui-soft-surface rounded-lg border-amber-300/25 p-4 text-xs text-amber-100">
        <p className="font-semibold text-amber-50">Local photo storage</p>
        <p className="mt-1">
          Photos are stored on this device. Clearing site data will remove them.
        </p>
      </div>

      <div className="ui-card ui-soft-surface flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3 text-xs text-slate-300">
        <p>
          Filled slots:{" "}
          <span className="font-semibold text-white">
            {filledCount} / 3
          </span>
        </p>
        <p className="text-slate-400">
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
              className="ui-card ui-soft-surface-raised rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {slot.title} photo
                  </p>
                  <p className="text-xs text-slate-400">{slot.hint}</p>
                </div>
                {value ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(slot.key)}
                    className="text-xs font-semibold text-rose-200"
                  >
                    Delete
                  </button>
                ) : null}
              </div>

              <div className="mt-4">
                {value && previewUrl ? (
                  // Blob/object URLs are local previews and cannot use next/image optimization.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={`${slot.title} preview`}
                    className="h-52 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center rounded-lg border border-dashed border-slate-500/45 bg-slate-950/45 text-xs text-slate-400">
                    No photo yet
                  </div>
                )}
              </div>

              <label className="mt-4 flex h-11 cursor-pointer items-center justify-center rounded-lg border border-sky-300/45 bg-sky-500/18 px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_28px_rgba(14,165,233,0.16)] transition hover:bg-sky-500/26">
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
