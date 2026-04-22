import { formatSageError } from '@sage-app/sdk';
import { PageShell } from '../components/PageShell';
import { addLog } from '../lib/logStore';

async function run<T>(
    name: string,
    fn: () => Promise<T>,
    formatResult?: (result: T) => string,
): Promise<T> {
    try {
        const result = await fn();
        const rendered = formatResult
            ? formatResult(result)
            : JSON.stringify(result, null, 2);

        addLog(`${name}: SUCCESS ${rendered}`, 'ok');
        return result;
    } catch (err) {
        addLog(`${name}: FAIL ${formatSageError(err)}`, 'fail');
        throw err;
    }
}

function logIncoming(label: string, value: unknown) {
    const rendered =
        typeof value === 'string' ? value : JSON.stringify(value, null, 2);

    console.log(`[${label}] incoming:`, value);
    addLog(`${label}: MESSAGE ${rendered}`, 'info');
}

export function WebSocketPage() {
    return (
        <PageShell title='WebSocket' subtitle='Bridge websocket tests'>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                    onClick={() => {
                        void run(
                            'direct WebSocket wss://api.coinset.org/ws',
                            async () => {
                                return await new Promise<string>((resolve, reject) => {
                                    let settled = false;
                                    const ws = new WebSocket('wss://api.coinset.org/ws');

                                    const finish = (fn: () => void) => {
                                        if (settled) {
                                            return;
                                        }
                                        settled = true;
                                        fn();
                                    };

                                    const timeoutId = window.setTimeout(() => {
                                        finish(() => {
                                            try {
                                                ws.close();
                                            } catch {
                                                // ignore
                                            }
                                            reject(
                                                new Error(
                                                    'Timed out waiting for direct websocket open',
                                                ),
                                            );
                                        });
                                    }, 10000);

                                    ws.onopen = () => {
                                        finish(() => {
                                            window.clearTimeout(timeoutId);
                                            addLog(
                                                'direct WebSocket wss://api.coinset.org/ws: OPEN',
                                                'ok',
                                            );
                                            resolve('opened');
                                        });
                                    };

                                    ws.onmessage = (event) => {
                                        logIncoming(
                                            'direct WebSocket wss://api.coinset.org/ws',
                                            event.data,
                                        );
                                    };

                                    ws.onerror = () => {
                                        finish(() => {
                                            window.clearTimeout(timeoutId);
                                            reject(
                                                new Error(
                                                    'Direct websocket connection failed',
                                                ),
                                            );
                                        });
                                    };

                                    ws.onclose = (event) => {
                                        addLog(
                                            `direct WebSocket wss://api.coinset.org/ws: CLOSE code=${event.code} reason=${event.reason || '(empty)'}`,
                                            'info',
                                        );
                                    };
                                });
                            },
                            (result) => result,
                        );
                    }}
                >
                    direct: open wss://api.coinset.org/ws
                </button>

                <button
                    onClick={() => {
                        void run(
                            'direct WebSocket wss://api.coinset.org/ws send',
                            async () => {
                                return await new Promise<string>((resolve, reject) => {
                                    let settled = false;
                                    const ws = new WebSocket('wss://api.coinset.org/ws');

                                    const finish = (fn: () => void) => {
                                        if (settled) {
                                            return;
                                        }
                                        settled = true;
                                        fn();
                                    };

                                    const timeoutId = window.setTimeout(() => {
                                        finish(() => {
                                            try {
                                                ws.close();
                                            } catch {
                                                // ignore
                                            }
                                            reject(
                                                new Error(
                                                    'Timed out waiting for websocket response',
                                                ),
                                            );
                                        });
                                    }, 10000);

                                    ws.onopen = () => {
                                        addLog(
                                            'direct WebSocket wss://api.coinset.org/ws: OPEN',
                                            'ok',
                                        );

                                        const message = JSON.stringify({
                                            kind: 'probe',
                                            sentAt: Date.now(),
                                            text: 'hello from direct websocket test',
                                        });

                                        console.log(
                                            '[direct WebSocket wss://api.coinset.org/ws] sending:',
                                            message,
                                        );
                                        addLog(
                                            `direct WebSocket wss://api.coinset.org/ws: SEND ${message}`,
                                            'info',
                                        );

                                        ws.send(message);
                                    };

                                    ws.onmessage = (event) => {
                                        logIncoming(
                                            'direct WebSocket wss://api.coinset.org/ws',
                                            event.data,
                                        );

                                        finish(() => {
                                            window.clearTimeout(timeoutId);
                                            try {
                                                ws.close();
                                            } catch {
                                                // ignore
                                            }
                                            resolve('received message');
                                        });
                                    };

                                    ws.onerror = () => {
                                        finish(() => {
                                            window.clearTimeout(timeoutId);
                                            reject(
                                                new Error(
                                                    'Direct websocket send/test failed',
                                                ),
                                            );
                                        });
                                    };

                                    ws.onclose = (event) => {
                                        addLog(
                                            `direct WebSocket wss://api.coinset.org/ws: CLOSE code=${event.code} reason=${event.reason || '(empty)'}`,
                                            'info',
                                        );
                                    };
                                });
                            },
                            (result) => result,
                        );
                    }}
                >
                    direct: open + send wss://api.coinset.org/ws
                </button>
            </div>
        </PageShell>
    );
}
