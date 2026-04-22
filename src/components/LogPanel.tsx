import { useEffect, useState } from 'react';
import { clearLogs, subscribeLogs, type LogEntry } from '../lib/logStore';

function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString();
}

export function LogPanel() {
    const [entries, setEntries] = useState<LogEntry[]>([]);

    useEffect(() => {
        return subscribeLogs(setEntries);
    }, []);

    return (
        <div
            style={{
                background: '#0b0e13',
                border: '1px solid #242b38',
                borderRadius: 12,
                padding: 14,
                minHeight: 240,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            }}
        >
            <div style={{ marginBottom: 12 }}>
                <button onClick={clearLogs}>Clear log</button>
            </div>

            {entries.length === 0 ? (
                <div style={{ color: '#9aa4b2' }}>No logs yet.</div>
            ) : (
                entries.map((entry) => (
                    <div
                        key={entry.id}
                        style={{
                            color:
                                entry.kind === 'ok'
                                    ? '#73e2a7'
                                    : entry.kind === 'fail'
                                        ? '#ff8f8f'
                                        : '#e8ecf1',
                        }}
                    >
                        [{formatTime(entry.ts)}] {entry.message}
                    </div>
                ))
            )}
        </div>
    );
}
