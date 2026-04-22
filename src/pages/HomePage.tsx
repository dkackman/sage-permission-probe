import { PageShell } from '../components/PageShell';

export function HomePage() {
    return (
        <PageShell
            title='Permission Probe'
            subtitle='React/Vite Sage test app using @sage-app/sdk'
        >
            <div style={{ display: 'grid', gap: 12 }}>
                <div>
                    Use the menu above to test bridge, network, and websocket behavior.
                </div>
            </div>
        </PageShell>
    );
}
