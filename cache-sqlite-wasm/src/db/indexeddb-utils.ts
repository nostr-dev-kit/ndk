export function openIndexedDB(dbName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error('IndexedDB not available'));
            return;
        }
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore("db", { keyPath: "id" });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function loadFromIndexedDB(dbName: string): Promise<ArrayBuffer | null> {
    try {
        const db = await openIndexedDB(dbName);
        return new Promise((resolve, reject) => {
            const tx = db.transaction("db", "readonly");
            const store = tx.objectStore("db");
            const getReq = store.get("main");
            getReq.onsuccess = () => resolve(getReq.result ? getReq.result.data : null);
            getReq.onerror = () => reject(getReq.error);
        });
    } catch (e) {
        return null;
    }
}

export async function saveToIndexedDB(dbName: string, data: Uint8Array): Promise<void> {
    try {
        const db = await openIndexedDB(dbName);
        return new Promise((resolve, reject) => {
            const tx = db.transaction("db", "readwrite");
            const store = tx.objectStore("db");
            const putReq = store.put({ id: "main", data });
            putReq.onsuccess = () => {
                resolve();
            };
            putReq.onerror = () => reject(putReq.error);
        });
    } catch (e) {
        // IndexedDB not available, silently fail
        return;
    }
}
