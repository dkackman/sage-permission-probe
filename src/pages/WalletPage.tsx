import { useEffect, useMemo, useState } from 'react';
import {
    formatSageError,
    hasSageBridge, type WalletSendXchParams,
} from '@sage-app/sdk';
import { PageShell } from '../components/PageShell';
import { addLog } from '../lib/logStore';
import {useSageClient} from "../hooks/useSageClient.ts";

function defaultFormatResult<T>(result: T): string {
    if (
        result &&
        typeof result === 'object' &&
        'status' in result &&
        typeof (result as { status?: unknown }).status === 'number'
    ) {
        return `status=${(result as { status: number }).status}`;
    }

    return JSON.stringify(result, null, 2);
}

async function run<T>(
    name: string,
    fn: () => Promise<T>,
    formatResult?: (result: T) => string,
): Promise<T> {
    try {
        const result = await fn();
        const rendered = formatResult
            ? formatResult(result)
            : defaultFormatResult(result);

        addLog(`${name}: SUCCESS ${rendered}`, 'ok');
        return result;
    } catch (err) {
        addLog(`${name}: FAIL ${formatSageError(err)}`, 'fail');
        throw err;
    }
}

export function WalletPage() {
    const [grantedCapabilities, setGrantedCapabilities] = useState<string[]>([]);
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);

    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('1000');
    const [fee, setFee] = useState('0');
    const [memosText, setMemosText] = useState('');
    const [clawbackText, setClawbackText] = useState('');
    const sage = useSageClient();

    useEffect(() => {
        void (async () => {
            if (!hasSageBridge()) {
                setPermissionsLoaded(true);
                return;
            }

            try {
                const granted = await sage.app.getCapabilities();
                setGrantedCapabilities(granted);
                addLog(
                    `wallet.capabilities: ${JSON.stringify(granted, null, 2)}`,
                    'info',
                );
            } catch (err) {
                addLog(`wallet.capabilities: FAIL ${formatSageError(err)}`, 'fail');
            } finally {
                setPermissionsLoaded(true);
            }
        })();
    }, [sage.app]);

    const canSendXch = grantedCapabilities.includes('wallet.send_xch');

    const memos = useMemo(() => {
        return memosText
            .split('\n')
            .map((x) => x.trim())
            .filter(Boolean);
    }, [memosText]);

    const clawback = useMemo(() => {
        const trimmed = clawbackText.trim();
        if (!trimmed) {
            return null;
        }

        const parsed = Number(trimmed);
        if (!Number.isFinite(parsed) || parsed < 0) {
            return null;
        }

        return Math.floor(parsed);
    }, [clawbackText]);

    const requestPreview: WalletSendXchParams = {
        address,
        amount,
        fee,
        memos,
        clawback,
    };

    return (
        <PageShell
            title='Wallet'
            subtitle='Test Sage wallet bridge capabilities'
        >
            <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
                <div
                    style={{
                        display: 'grid',
                        gap: 6,
                        padding: 12,
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 10,
                    }}
                >
                    <strong>Bridge status</strong>
                    <div>hasSageBridge: {String(hasSageBridge())}</div>
                    <div>permissionsLoaded: {String(permissionsLoaded)}</div>
                    <div>canSendXch: {String(canSendXch)}</div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gap: 6,
                        padding: 12,
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 10,
                    }}
                >
                    <strong>Granted capabilities</strong>
                    <pre
                        style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {JSON.stringify(grantedCapabilities, null, 2)}
                    </pre>
                </div>

                <label style={{ display: 'grid', gap: 6 }}>
                    <span>Recipient address</span>
                    <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder='xch1...'
                    />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Amount</span>
                        <input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder='1000'
                        />
                    </label>

                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Fee</span>
                        <input
                            value={fee}
                            onChange={(e) => setFee(e.target.value)}
                            placeholder='0'
                        />
                    </label>
                </div>

                <label style={{ display: 'grid', gap: 6 }}>
                    <span>Memos (one per line)</span>
                    <textarea
                        value={memosText}
                        onChange={(e) => setMemosText(e.target.value)}
                        rows={4}
                        placeholder={'hello\nworld'}
                    />
                </label>

                <label style={{ display: 'grid', gap: 6 }}>
                    <span>Clawback timestamp (optional, unix seconds)</span>
                    <input
                        value={clawbackText}
                        onChange={(e) => setClawbackText(e.target.value)}
                        placeholder='1712345678'
                    />
                </label>

                <div
                    style={{
                        display: 'grid',
                        gap: 6,
                        padding: 12,
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 10,
                    }}
                >
                    <strong>Effective request preview</strong>
                    <pre
                        style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {JSON.stringify(requestPreview, null, 2)}
                    </pre>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => {
                            void run(
                                'wallet.getCapabilities',
                                async () => {
                                    const granted = await sage.app.getCapabilities();
                                    setGrantedCapabilities(granted);
                                    return granted;
                                },
                            );
                        }}
                    >
                        refresh capabilities
                    </button>

                    <button
                        disabled={!hasSageBridge() || !canSendXch}
                        onClick={() => {
                            void run(
                                'wallet.sendXch',
                                async () => {
                                    return await sage.wallet.sendXch({
                                        address,
                                        amount,
                                        fee,
                                        memos,
                                        clawback,
                                    });
                                },
                            );
                        }}
                    >
                        send XCH
                    </button>

                    <button
                        onClick={() => {
                            addLog(
                                `wallet.preview: ${JSON.stringify(requestPreview, null, 2)}`,
                                'info',
                            );
                        }}
                    >
                        log request preview
                    </button>
                </div>

                {!canSendXch && permissionsLoaded ? (
                    <div
                        style={{
                            padding: 12,
                            borderRadius: 10,
                            border: '1px solid rgba(255,120,120,0.35)',
                            color: 'rgba(255,180,180,0.95)',
                        }}
                    >
                        This app does not currently have <code>wallet.send_xch</code> capability.
                    </div>
                ) : null}
            </div>
        </PageShell>
    );
}
