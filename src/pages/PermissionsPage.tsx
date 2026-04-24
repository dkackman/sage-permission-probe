import { useEffect, useMemo, useState } from 'react';
import {
    type AppGetInfoResult,
    formatSageError, type GrantedCapabilitiesChangeEvent, type GrantedNetworkWhitelistChangeEvent,
    hasSageBridge, type SageNetworkPermissionTarget,
    type SageRequestedCapabilities, type SageRequestedNetworkWhitelist, type UserBridgeCapability,
} from '@sage-app/sdk';
import { PageShell } from '../components/PageShell';
import { addLog } from '../lib/logStore';
import {useSageClient} from "../hooks/useSageClient.ts";

function entryKey(e: SageNetworkPermissionTarget) {
    return `${e.scheme}://${e.host}`;
}

function sectionStyle(): React.CSSProperties {
    return {
        display: 'grid',
        gap: 8,
        padding: 12,
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
    };
}

function preStyle(): React.CSSProperties {
    return {
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    };
}

export function PermissionsPage() {
    const [info, setInfo] = useState<AppGetInfoResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [requestingCapability, setRequestingCapability] = useState<string | null>(null);
    const [requestingNetwork, setRequestingNetwork] = useState<string | null>(null);

    const sage = useSageClient();

    const requestedCaps: SageRequestedCapabilities = useMemo(
        () => info?.requestedPermissions?.capabilities ?? {
            required: [],
            optional: []
        },
        [info],
    );

    const requestedNetwork: SageRequestedNetworkWhitelist = useMemo(
        () => info?.requestedPermissions?.network?.whitelist ?? {
            required: [],
            optional: []
        },
        [info],
    );

    const grantedCaps = useMemo(
        () => info?.capabilities ?? [],
        [info],
    );

    const grantedNetwork = useMemo(
        () =>
            (info?.network ?? []).map((x) => ({
                scheme: x.scheme,
                host: x.host,
            })),
        [info],
    );

    async function refresh() {
        if (!hasSageBridge()) {
            throw new Error('Sage bridge is unavailable');
        }

        setLoading(true);

        try {
            addLog('permissions.refresh: START', 'info');
            const next = await sage.app.getInfo();
            setInfo(next);
            addLog(
                `permissions.refresh: SUCCESS ${JSON.stringify(next, null, 2)}`,
                'ok',
            );
            return next;
        } catch (err) {
            addLog(`permissions.refresh: FAIL ${formatSageError(err)}`, 'fail');
            throw err;
        } finally {
            setLoading(false);
        }
    }

    async function requestCapability(capability: UserBridgeCapability) {
        setRequestingCapability(capability);

        try {
            addLog(`requestCapabilityGrant(${capability}): START`, 'info');

            const result = await sage.app.requestCapabilityGrant({
                capability,
            });

            addLog(
                `requestCapabilityGrant(${capability}): RESOLVED ${JSON.stringify(result, null, 2)}`,
                'ok',
            );

            await refresh();
        } catch (err) {
            addLog(
                `requestCapabilityGrant(${capability}): FAIL ${formatSageError(err)}`,
                'fail',
            );
        } finally {
            setRequestingCapability(null);
        }
    }

    async function requestNetwork(entry: SageNetworkPermissionTarget) {
        const key = entryKey(entry);
        setRequestingNetwork(key);

        try {
            addLog(`requestNetworkWhitelistGrant(${key}): START`, 'info');

            const result = await sage.app.requestNetworkWhitelistGrant({
                entry,
            });

            addLog(
                `requestNetworkWhitelistGrant(${key}): RESOLVED ${JSON.stringify(result, null, 2)}`,
                'ok',
            );

            await refresh();
        } catch (err) {
            addLog(
                `requestNetworkWhitelistGrant(${key}): FAIL ${formatSageError(err)}`,
                'fail',
            );
        } finally {
            setRequestingNetwork(null);
        }
    }

    useEffect(() => {
        if (!hasSageBridge()) {
            addLog('permissions.init: Sage bridge unavailable', 'fail');
            return;
        }

        addLog('permissions.init: bridge detected', 'info');

        void refresh().catch(() => {
            //
        });
    }, []);

    useEffect(() => {
        if (!hasSageBridge()) {
            return;
        }

        addLog('permissions.listeners: subscribing', 'info');

        const offCaps = sage.app.onGrantedCapabilitiesChange(
            (event: GrantedCapabilitiesChangeEvent) => {
                addLog(
                    `onGrantedCapabilitiesChange: ${JSON.stringify(event, null, 2)}`,
                    'info',
                );

                setInfo((prev) =>
                    prev
                        ? {
                            ...prev,
                            capabilities: event.fullGrantedCapabilities,
                        }
                        : prev,
                );
            },
        );

        const offNet = sage.app.onGrantedNetworkWhitelistChange(
            (event: GrantedNetworkWhitelistChangeEvent) => {
                addLog(
                    `onGrantedNetworkWhitelistChange: ${JSON.stringify(event, null, 2)}`,
                    'info',
                );

                setInfo((prev) =>
                    prev
                        ? {
                            ...prev,
                            network: event.fullGrantedNetworkWhitelist.map((e) => ({
                                scheme: e.scheme,
                                host: e.host,
                                required: false,
                            })),
                        }
                        : prev,
                );
            },
        );

        return () => {
            addLog('permissions.listeners: unsubscribing', 'info');
            offCaps();
            offNet();
        };
    }, []);

    return (
        <PageShell
            title='Permissions'
            subtitle='Requested vs granted + live listeners'
        >
            <div style={{ display: 'grid', gap: 16 }}>
                <div style={sectionStyle()}>
                    <strong>Status</strong>
                    <div>hasSageBridge: {String(hasSageBridge())}</div>
                    <div>loading: {String(loading)}</div>
                    <div>requestingCapability: {requestingCapability ?? '(none)'}</div>
                    <div>requestingNetwork: {requestingNetwork ?? '(none)'}</div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                        disabled={!hasSageBridge() || loading}
                        onClick={() => {
                            void refresh().catch(() => {
                                //
                            });
                        }}
                    >
                        {loading ? 'refreshing...' : 'refresh'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={sectionStyle()}>
                        <strong>Requested capabilities</strong>
                        <pre style={preStyle()}>
                            {JSON.stringify(requestedCaps, null, 2)}
                        </pre>
                    </div>

                    <div style={sectionStyle()}>
                        <strong>Granted capabilities</strong>
                        <pre style={preStyle()}>
                            {JSON.stringify(grantedCaps, null, 2)}
                        </pre>
                    </div>
                </div>

                <div style={sectionStyle()}>
                    <strong>Request optional capabilities</strong>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(requestedCaps.optional ?? []).map((cap) => {
                            const granted = grantedCaps.includes(cap);
                            const busy = requestingCapability === cap;

                            return (
                                <button
                                    key={cap}
                                    disabled={granted || busy}
                                    onClick={() => {
                                        void requestCapability(cap);
                                    }}
                                >
                                    {granted
                                        ? `✓ ${cap}`
                                        : busy
                                            ? `requesting ${cap}...`
                                            : `request ${cap}`}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={sectionStyle()}>
                        <strong>Requested network</strong>
                        <pre style={preStyle()}>
                            {JSON.stringify(requestedNetwork, null, 2)}
                        </pre>
                    </div>

                    <div style={sectionStyle()}>
                        <strong>Granted network</strong>
                        <pre style={preStyle()}>
                            {JSON.stringify(grantedNetwork, null, 2)}
                        </pre>
                    </div>
                </div>

                <div style={sectionStyle()}>
                    <strong>Request optional network</strong>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(requestedNetwork.optional ?? []).map((entry) => {
                            const key = entryKey(entry);

                            const granted = grantedNetwork.some(
                                (g) => entryKey(g) === key,
                            );

                            const busy = requestingNetwork === key;

                            return (
                                <button
                                    key={key}
                                    disabled={granted || busy}
                                    onClick={() => {
                                        void requestNetwork(entry);
                                    }}
                                >
                                    {granted
                                        ? `✓ ${key}`
                                        : busy
                                            ? `requesting ${key}...`
                                            : `request ${key}`}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div style={sectionStyle()}>
                    <strong>Raw info</strong>
                    <pre style={preStyle()}>{JSON.stringify(info, null, 2)}</pre>
                </div>
            </div>
        </PageShell>
    );
}
