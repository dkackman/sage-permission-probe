import { formatSageError } from '@sage-app/sdk';
import { PageShell } from '../components/PageShell';
import { addLog } from '../lib/logStore';
import {useSageClient} from "../hooks/useSageClient.ts";

async function run(name: string, fn: () => Promise<unknown>) {
    try {
        const result = await fn();
        addLog(`${name}: SUCCESS ${JSON.stringify(result, null, 2)}`, 'ok');
        return result;
    } catch (err) {
        addLog(`${name}: FAIL ${formatSageError(err)}`, 'fail');
        throw err;
    }
}

export function BridgePage() {
    const sage = useSageClient();

    return (
        <PageShell title='Bridge' subtitle='Basic Sage bridge tests'>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                    onClick={() => {
                        void run('bridgePing', async () => {
                            return await sage.app.bridgePing();
                        });
                    }}
                >
                    bridgePing()
                </button>

                <button
                    onClick={() => {
                        void run('getInfo', async () => {
                            return await sage.app.getInfo();
                        });
                    }}
                >
                    getInfo()
                </button>

                <button
                    onClick={() => {
                        void run('getCapabilities', async () => {
                            return await sage.app.getCapabilities();
                        });
                    }}
                >
                    getCapabilities()
                </button>
            </div>
        </PageShell>
    );
}
