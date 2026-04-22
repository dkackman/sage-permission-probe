import { PageShell } from '../components/PageShell';
import { addLog } from '../lib/logStore';

const LOCAL_STORAGE_KEY = 'permission-probe-local-storage';
const COOKIE_KEY = 'permission_probe_cookie';
const DB_NAME = 'permission-probe-db';
const STORE_NAME = 'meta';
const DB_KEY = 'probe_key';

async function run<T>(
    name: string,
    fn: () => Promise<T>,
    formatResult?: (result: T) => string,
): Promise<T> {
    try {
        const result = await fn();
        addLog(
            `${name}: SUCCESS ${
                formatResult ? formatResult(result) : JSON.stringify(result, null, 2)
            }`,
            'ok',
        );
        return result;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        addLog(`${name}: FAIL ${message}`, 'fail');
        throw err;
    }
}

async function indexedDbPut(value: string): Promise<boolean> {
    return await new Promise<boolean>((resolve) => {
        const open = indexedDB.open(DB_NAME);

        open.onerror = () => resolve(false);

        open.onupgradeneeded = () => {
            try {
                const db = open.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            } catch {
                //
            }
        };

        open.onsuccess = () => {
            try {
                const db = open.result;
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const req = store.put(value, DB_KEY);

                req.onerror = () => {
                    db.close();
                    resolve(false);
                };

                req.onsuccess = () => {
                    tx.oncomplete = () => {
                        db.close();
                        resolve(true);
                    };

                    tx.onerror = () => {
                        db.close();
                        resolve(false);
                    };
                };
            } catch {
                resolve(false);
            }
        };
    });
}

async function indexedDbGet(): Promise<string | null> {
    return await new Promise<string | null>((resolve) => {
        const open = indexedDB.open(DB_NAME);

        open.onerror = () => resolve(null);

        open.onupgradeneeded = () => {
            try {
                const db = open.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            } catch {
                //
            }
        };

        open.onsuccess = () => {
            try {
                const db = open.result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.close();
                    resolve(null);
                    return;
                }

                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(DB_KEY);

                req.onerror = () => {
                    db.close();
                    resolve(null);
                };

                req.onsuccess = () => {
                    db.close();
                    resolve(typeof req.result === 'string' ? req.result : null);
                };
            } catch {
                resolve(null);
            }
        };
    });
}

async function indexedDbDeleteDatabase(): Promise<boolean> {
    return await new Promise<boolean>((resolve) => {
        const req = indexedDB.deleteDatabase(DB_NAME);

        req.onerror = () => resolve(false);
        req.onsuccess = () => resolve(true);
        req.onblocked = () => resolve(false);
    });
}

function readCookieValue(): string | null {
    const entry = document.cookie
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${COOKIE_KEY}=`));

    if (!entry) {
        return null;
    }

    return entry.slice(`${COOKIE_KEY}=`.length);
}

export function StoragePage() {
    return (
        <PageShell
            title='Storage'
            subtitle='Direct browser persistence tests: localStorage, cookie, IndexedDB'
        >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                    onClick={() => {
                        void run(
                            'localStorage.write',
                            async () => {
                                const value = `written-at-${Date.now()}`;
                                localStorage.setItem(LOCAL_STORAGE_KEY, value);
                                return localStorage.getItem(LOCAL_STORAGE_KEY);
                            },
                            (result) => `value=${result ?? 'null'}`,
                        );
                    }}
                >
                    write localStorage
                </button>

                <button
                    onClick={() => {
                        void run(
                            'localStorage.read',
                            async () => {
                                return localStorage.getItem(LOCAL_STORAGE_KEY);
                            },
                            (result) => `value=${result ?? 'null'}`,
                        );
                    }}
                >
                    read localStorage
                </button>

                <button
                    onClick={() => {
                        void run(
                            'cookie.write',
                            async () => {
                                const value = encodeURIComponent(`written-at-${Date.now()}`);
                                document.cookie = `${COOKIE_KEY}=${value}; path=/`;
                                return readCookieValue();
                            },
                            (result) => `value=${result ?? 'null'}`,
                        );
                    }}
                >
                    write cookie
                </button>

                <button
                    onClick={() => {
                        void run(
                            'cookie.read',
                            async () => {
                                return readCookieValue();
                            },
                            (result) => `value=${result ?? 'null'}`,
                        );
                    }}
                >
                    read cookie
                </button>

                <button
                    onClick={() => {
                        void run(
                            'indexedDB.write',
                            async () => {
                                const value = `written-at-${Date.now()}`;
                                const ok = await indexedDbPut(value);
                                return {
                                    ok,
                                    value: ok ? await indexedDbGet() : null,
                                };
                            },
                            (result) =>
                                `ok=${String(result.ok)} value=${result.value ?? 'null'}`,
                        );
                    }}
                >
                    write IndexedDB
                </button>

                <button
                    onClick={() => {
                        void run(
                            'indexedDB.read',
                            async () => {
                                return await indexedDbGet();
                            },
                            (result) => `value=${result ?? 'null'}`,
                        );
                    }}
                >
                    read IndexedDB
                </button>

                <button
                    onClick={() => {
                        void run(
                            'storage.describe',
                            async () => {
                                return {
                                    localStorage: localStorage.getItem(LOCAL_STORAGE_KEY),
                                    cookie: readCookieValue(),
                                    indexedDb: await indexedDbGet(),
                                };
                            },
                        );
                    }}
                >
                    describe storage
                </button>

                <button
                    onClick={() => {
                        void run(
                            'storage.clear',
                            async () => {
                                localStorage.removeItem(LOCAL_STORAGE_KEY);
                                document.cookie = `${COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                                const indexedDbDeleted = await indexedDbDeleteDatabase();

                                return {
                                    localStorage: localStorage.getItem(LOCAL_STORAGE_KEY),
                                    cookie: readCookieValue(),
                                    indexedDbDeleted,
                                };
                            },
                        );
                    }}
                >
                    clear storage
                </button>
            </div>
        </PageShell>
    );
}
