export type PhotoSlot = "front" | "side" | "back";

type StoredPhoto = {
  slot: PhotoSlot;
  namespace: string;
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
const DB_VERSION = 2;
const STORE_PHOTOS = "photos";

/**
 * Photo isolation (Phase 6e, Commit 1 / SR-6e, ED-6e.1 — "Option A refined").
 *
 * Photos stay device-local and are namespaced by account id rather than
 * wiped on login/logout/account-switch — this is the whole isolation
 * mechanism. `setActivePhotoNamespace` is called by `PhotoProvider` with the
 * server session's user id (or null for guest/signed-out use) on every page
 * load. Every read/write below keys off it, so switching accounts on the
 * same device instantly hides the previous account's photos without
 * deleting them; they only go away via the explicit "Erase all local data"
 * button (which deletes this whole database).
 */
const GUEST_PHOTO_NAMESPACE = "guest";
let activeNamespace = GUEST_PHOTO_NAMESPACE;

export const setActivePhotoNamespace = (id: string | null | undefined) => {
  activeNamespace = id && id.trim() ? id : GUEST_PHOTO_NAMESPACE;
};

export const getActivePhotoNamespace = () => activeNamespace;

const buildRecordId = (namespace: string, slot: PhotoSlot) => `${namespace}:${slot}`;

let dbPromise: Promise<IDBDatabase> | null = null;

const openDbRequest = (version?: number) =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request =
      typeof version === "number"
        ? indexedDB.open(DB_NAME, version)
        : indexedDB.open(DB_NAME);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(STORE_PHOTOS)) {
        // Pre-6e schema keyed records by bare `slot` with no per-account
        // namespace — there is no safe way to attribute those legacy blobs
        // to a single account, so this one-time migration drops them rather
        // than risk showing one user's photos to another.
        db.deleteObjectStore(STORE_PHOTOS);
      }
      db.createObjectStore(STORE_PHOTOS, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const ensurePhotoStore = async (db: IDBDatabase) => {
  if (db.objectStoreNames.contains(STORE_PHOTOS)) {
    return db;
  }
  const targetVersion = Math.max(db.version, DB_VERSION) + 1;
  db.close();
  return openDbRequest(targetVersion);
};

const openDb = () => {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    try {
      const db = await openDbRequest(DB_VERSION);
      return ensurePhotoStore(db);
    } catch (error) {
      // Recover when local browser already has a newer photo DB schema version.
      if (error instanceof DOMException && error.name === "VersionError") {
        const db = await openDbRequest();
        return ensurePhotoStore(db);
      }
      throw error;
    }
  })();
  return dbPromise;
};

const withStore = async <T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => Promise<T>
) => {
  const runWithDb = async (db: IDBDatabase) =>
    new Promise<T>((resolve, reject) => {
      let tx: IDBTransaction;
      try {
        tx = db.transaction(STORE_PHOTOS, mode);
      } catch (error) {
        reject(error);
        return;
      }
      const store = tx.objectStore(STORE_PHOTOS);
      handler(store)
        .then((result) => {
          tx.oncomplete = () => resolve(result);
        })
        .catch((error) => reject(error));
      tx.onerror = () => reject(tx.error);
    });

  let db = await openDb();
  try {
    return await runWithDb(db);
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotFoundError") {
      db.close();
      dbPromise = null;
      db = await openDb();
      return runWithDb(db);
    }
    throw error;
  }
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
        const item = await requestToPromise(
          store.get(buildRecordId(activeNamespace, slot))
        );
        return (item as StoredPhoto) ?? null;
      }),
    set: async (record) =>
      withStore("readwrite", async (store) => {
        await requestToPromise(
          store.put({ ...record, id: buildRecordId(record.namespace, record.slot) })
        );
      }),
    remove: async (slot) =>
      withStore("readwrite", async (store) => {
        await requestToPromise(store.delete(buildRecordId(activeNamespace, slot)));
      }),
    list: async () =>
      withStore("readonly", async (store) => {
        const items = (await requestToPromise(store.getAll())) as StoredPhoto[];
        return (items ?? []).filter((item) => item.namespace === activeNamespace);
      }),
  };
};

export const createPhotoStore = (
  adapter: PhotoStoreAdapter = createIndexedDbAdapter()
) => {
  const setPhoto = async (slot: PhotoSlot, file: File) => {
    const record: StoredPhoto = {
      slot,
      namespace: activeNamespace,
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
