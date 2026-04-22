export type LogEntry = {
    id: string;
    ts: number;
    kind: 'info' | 'ok' | 'fail';
    message: string;
};

type Listener = (entries: LogEntry[]) => void;

const entries: LogEntry[] = [];
const listeners = new Set<Listener>();

function emit() {
    const snapshot = [...entries];
    for (const listener of listeners) {
        listener(snapshot);
    }
}

export function subscribeLogs(listener: Listener): () => void {
    listeners.add(listener);
    listener([...entries]);
    return () => {
        listeners.delete(listener);
    };
}

export function addLog(
    message: string,
    kind: LogEntry['kind'] = 'info',
) {
    entries.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        ts: Date.now(),
        kind,
        message,
    });
    emit();
}

export function clearLogs() {
    entries.length = 0;
    emit();
}
