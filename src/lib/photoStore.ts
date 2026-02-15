export type PhotoSlot = "front" | "side" | "back";

type StoredPhoto = {
  slot: PhotoSlot;
  name: string;
  type: string;
  lastModified: number;
  blob: Blob;
};

type PhotoStoreAdapter = {
  get: (slot: PhotoSlot) => Promise<StoredPhoto | null>;
  set: (record: StoredPhoto) => Promise<void>;
  remove: (slot: PhotoSlot) => Promise<void>;
  list: () => Promise<StoredPhoto[]>;
};

const PHOTO_SLOTS: PhotoSlot[] = ["front", "side", "back"];

const DB_NAME = "bodycoach-photos";
const DB_VERSION = 1;
const STORE_PHOTOS = "photos";

let dbPromise: Promise<IDBDatabase> | null = null;

const openDbRequest = (version?: number) =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request =
      typeof version === "number"
        ? indexedDB.open(DB_NAME, version)
        : indexedDB.open(DB_NAME);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: "slot" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const openDb = () => {
  if (dbPromise) return dbPromise;
  dbPromise = openDbRequest(DB_VERSION).catch((error) => {
    // Recover when local browser already has a newer photo DB schema version.
    if (error instanceof DOMException && error.name === "VersionError") {
      return openDbRequest();
    }
    throw error;
  });
  return dbPromise;
};

const withStore = async <T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => Promise<T>
) => {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_PHOTOS, mode);
    const store = tx.objectStore(STORE_PHOTOS);
    handler(store)
      .then((result) => {
        tx.oncomplete = () => resolve(result);
      })
      .catch((error) => reject(error));
    tx.onerror = () => reject(tx.error);
  });
};

const requestToPromise = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const createIndexedDbAdapter = (): PhotoStoreAdapter => {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is not available in this environment.");
  }
  return {
    get: async (slot) =>
      withStore("readonly", async (store) => {
        const item = await requestToPromise(store.get(slot));
        return (item as StoredPhoto) ?? null;
      }),
    set: async (record) =>
      withStore("readwrite", async (store) => {
        await requestToPromise(store.put(record));
      }),
    remove: async (slot) =>
      withStore("readwrite", async (store) => {
        await requestToPromise(store.delete(slot));
      }),
    list: async () =>
      withStore("readonly", async (store) => {
        const items = await requestToPromise(store.getAll());
        return (items as StoredPhoto[]) ?? [];
      }),
  };
};

export const createPhotoStore = (
  adapter: PhotoStoreAdapter = createIndexedDbAdapter()
) => {
  const setPhoto = async (slot: PhotoSlot, file: File) => {
    const record: StoredPhoto = {
      slot,
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      blob: file,
    };
    await adapter.set(record);
  };

  const getPhoto = async (slot: PhotoSlot): Promise<File | null> => {
    const record = await adapter.get(slot);
    if (!record) return null;
    return new File([record.blob], record.name, {
      type: record.type,
      lastModified: record.lastModified,
    });
  };

  const removePhoto = async (slot: PhotoSlot) => {
    await adapter.remove(slot);
  };

  const listPhotos = async (): Promise<Record<PhotoSlot, File | null>> => {
    const items = await adapter.list();
    const map: Record<PhotoSlot, File | null> = {
      front: null,
      side: null,
      back: null,
    };
    items.forEach((item) => {
      map[item.slot] = new File([item.blob], item.name, {
        type: item.type,
        lastModified: item.lastModified,
      });
    });
    return map;
  };

  const clearPhotos = async () => {
    await Promise.all(PHOTO_SLOTS.map((slot) => adapter.remove(slot)));
  };

  return { setPhoto, getPhoto, removePhoto, listPhotos, clearPhotos };
};

let defaultStore: ReturnType<typeof createPhotoStore> | null = null;

const getDefaultStore = () => {
  if (!defaultStore) {
    defaultStore = createPhotoStore();
  }
  return defaultStore;
};

export const setPhoto = (...args: Parameters<ReturnType<typeof createPhotoStore>["setPhoto"]>) =>
  getDefaultStore().setPhoto(...args);
export const getPhoto = (...args: Parameters<ReturnType<typeof createPhotoStore>["getPhoto"]>) =>
  getDefaultStore().getPhoto(...args);
export const removePhoto = (
  ...args: Parameters<ReturnType<typeof createPhotoStore>["removePhoto"]>
) => getDefaultStore().removePhoto(...args);
export const listPhotos = (
  ...args: Parameters<ReturnType<typeof createPhotoStore>["listPhotos"]>
) => getDefaultStore().listPhotos(...args);
export const clearPhotos = (
  ...args: Parameters<ReturnType<typeof createPhotoStore>["clearPhotos"]>
) => getDefaultStore().clearPhotos(...args);
export { PHOTO_SLOTS };
