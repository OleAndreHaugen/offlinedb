function OfflineDB(dbname) {
    const me = this;

    (async function initializeIDB(tries = 0) {
        const indexDBAll = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
        try {
            me.DB = await openIDB(indexDBAll, dbname, 1);
        } catch (e) {
            console.error("Failed to open IDB databases", e);
            if (tries < 10) {
                console.log("Retrying...");
                return setTimeout(() => initializeIDB(++tries), 10);
            }
            console.log("Could not open IDB databases.");
        }
    })();

    //---------------------------------------------------
    // PUBLIC
    //---------------------------------------------------
    this.save = async function (key, value) {
        await waitForIDB();
        return new Promise((resolve, reject) => {
            try {
                const transaction = me.DB.transaction("content", "readwrite");
                transaction.onerror = (event) => reject(event.target.error);
                const store = transaction.objectStore("content");
                const request = store.put({ key, value });
                request.onsuccess = () => resolve(true);
            } catch (e) {
                reject(e);
            }
        });
    };

    this.get = async function (key) {
        await waitForIDB();
        return new Promise((resolve, reject) => {
            const transaction = me.DB.transaction("content", "readonly");
            transaction.onerror = (event) => reject(event.target.error);
            const store = transaction.objectStore("content");
            const request = store.get(key);
            request.onsuccess = () => {
                var _a;
                return resolve((_a = request.result) == null ? void 0 : _a.value);
            };
        });
    };

    this.delete = async function (key) {
        await waitForIDB();
        return new Promise((resolve, reject) => {
            const transaction = me.DB.transaction("content", "readwrite");
            transaction.onerror = (event) => reject(event.target.error);
            const store = transaction.objectStore("content");
            const request = store.delete(key);
            request.onsuccess = () => resolve(true);
        });
    };

    this.list = async function () {
        await waitForIDB();
        return new Promise((resolve, reject) => {
            const transaction = me.DB.transaction("content", "readonly");
            transaction.onerror = (event) => reject(event.target.error);
            const store = transaction.objectStore("content");
            const request = store.getAllKeys();
            request.onsuccess = () => {
                var _a;
                return resolve((_a = request.result) == null ? void 0 : _a);
            };
        });
    };

    this.clear = async function () {
        const keys = await me.list();

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            await me.delete(key);
        }
    };

    //---------------------------------------------------
    // PRIVATE
    //---------------------------------------------------
    function waitForIDB() {
        return new Promise((resolve, reject) => {
            (function check(tries = 0) {
                if (me.DB) return resolve();
                if (tries < 100) {
                    console.log("IDB not open. Retrying", tries + 1);
                    return setTimeout(() => check(++tries), 1);
                }
                reject(`IndexedDB could not be initialized`);
            })();
        });
    }

    function openIDB(db, name, version) {
        return new Promise((resolve, reject) => {
            const dbOpenRequest = db.open(name, version);
            dbOpenRequest.onupgradeneeded = () => {
                const db2 = dbOpenRequest.result;
                db2.createObjectStore("content", { keyPath: "key" });
                resolve(dbOpenRequest.result);
            };
            dbOpenRequest.onerror = (e) => {
                reject(e.target.error);
            };
            dbOpenRequest.onsuccess = () => resolve(dbOpenRequest.result);
            dbOpenRequest.addEventListener("close", (e) => {
                console.error(`IDB '${name}' closed`);
                reject(e.target.error);
            });
            dbOpenRequest.addEventListener("blocked", (e) => {
                console.error(`IDB '${name}' blocked`);
                reject(e.target.error);
            });
            dbOpenRequest.addEventListener("versionchange", (e) => {
                console.error(`IDB '${name}' versionchange`);
                reject(e.target.error);
            });
        });
    }
}
