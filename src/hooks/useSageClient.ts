import { getSageClient, hasSageBridge } from '@sage-app/sdk';

type Sage = Awaited<ReturnType<typeof getSageClient>>;

let sageClient: Sage | null = null;
let sageClientPromise: Promise<Sage> | null = null;

export function useSageClient(): Sage {
    if (sageClient) return sageClient;

    if (!hasSageBridge()) {
        throw new Error('Sage bridge is not available');
    }

    sageClientPromise ??= getSageClient().then((client) => {
        sageClient = client;
        return client;
    });

    throw sageClientPromise;
}
