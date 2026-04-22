import { formatSageError } from '@sage-app/sdk';
import { PageShell } from '../components/PageShell';
import { addLog } from '../lib/logStore';

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

async function runDirectFetch(url: string): Promise<{
    status: number;
    ok: boolean;
    url: string;
}> {
    const response = await fetch(url, {
        method: 'GET',
    });

    return {
        status: response.status,
        ok: response.ok,
        url: response.url,
    };
}

export function NetworkPage() {
    return (
        <PageShell title='Network' subtitle='Direct browser network'>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                    onClick={() => {
                        addLog(`location.href = ${location.href}`, 'info');
                        addLog(`location.origin = ${location.origin}`, 'info');
                    }}
                >
                    probe runtime origin
                </button>

                <button
                    onClick={() => {
                        void run(
                            'direct.fetch(www.coinset.org)',
                            async () => {
                                return await runDirectFetch('https://www.coinset.org');
                            },
                            (result) => `status=${result.status} ok=${result.ok} finalUrl=${result.url}`,
                        );
                    }}
                >
                    direct fetch www.coinset.org
                </button>

                <button
                    onClick={() => {
                        void run(
                            'direct.fetch(api.coinset.org)',
                            async () => {
                                return await runDirectFetch('https://api.coinset.org');
                            },
                            (result) => `status=${result.status} ok=${result.ok} finalUrl=${result.url}`,
                        );
                    }}
                >
                    direct fetch api.coinset.org
                </button>
            </div>
        </PageShell>
    );
}
