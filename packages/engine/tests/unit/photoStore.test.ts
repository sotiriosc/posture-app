import { describe, expect, test } from "vitest";
import { createPhotoStore, type PhotoSlot } from "@/lib/photoStore";

class TestFile extends Blob {
  name: string;
  lastModified: number;
  constructor(
    parts: BlobPart[],
    name: string,
    options?: FilePropertyBag
  ) {
    super(parts, options);
    this.name = name;
    this.lastModified = options?.lastModified ?? Date.now();
  }
}

if (typeof File === "undefined") {
  // @ts-expect-error - provide a minimal File polyfill for node tests
  globalThis.File = TestFile;
}

type StoredPhoto = {
  slot: PhotoSlot;
  namespace: string;
  name: string;
  type: string;
  lastModified: number;
  blob: Blob;
};

const createMemoryAdapter = () => {
  const store = new Map<PhotoSlot, StoredPhoto>();
  return {
    get: async (slot: PhotoSlot) => store.get(slot) ?? null,
    set: async (record: StoredPhoto) => {
      store.set(record.slot, record);
    },
    remove: async (slot: PhotoSlot) => {
      store.delete(slot);
    },
    list: async () => Array.from(store.values()),
  };
};

describe("photoStore", () => {
  test("set/get/remove/list roundtrip", async () => {
    const adapter = createMemoryAdapter();
    const store = createPhotoStore(adapter);
    const file = new File(["hello"], "front.jpg", {
      type: "image/jpeg",
      lastModified: 1234567890,
    });

    await store.setPhoto("front", file);

    const fetched = await store.getPhoto("front");
    expect(fetched).not.toBeNull();
    expect(fetched?.name).toBe("front.jpg");
    expect(fetched?.type).toBe("image/jpeg");
    expect(fetched?.lastModified).toBe(1234567890);
    expect(await fetched?.text()).toBe("hello");

    const list = await store.listPhotos();
    expect(list.front?.name).toBe("front.jpg");
    expect(list.side).toBeNull();
    expect(list.back).toBeNull();

    await store.removePhoto("front");
    const afterRemove = await store.getPhoto("front");
    expect(afterRemove).toBeNull();
  });
});
