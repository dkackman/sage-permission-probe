import { Link } from 'react-router-dom';
import { LogPanel } from '../components/LogPanel';

type Severity = 'high' | 'medium' | 'low';

type ExploitEntry = {
    title: string;
    path: string;
    severity: Severity;
    description: string;
    hostLocation: string;
};

type Category = {
    label: string;
    exploits: ExploitEntry[];
};

// Registry of all exploit demonstrations, grouped by vulnerability class.
// Add a new entry here when adding a new exploit page.
const CATEGORIES: Category[] = [
    {
        label: 'Dialog / Approval',
        exploits: [
            {
                title: 'Approval Dialog Flood',
                path: '/approval-flood',
                severity: 'high',
                description:
                    'Fires N simultaneous requestCapabilityGrant calls before the user can dismiss the first dialog. No server-side rate limiting or deduplication.',
                hostLocation: 'sage-apps/src/bridge/mod.rs:427–442',
            },
        ],
    },
    // Future categories — uncomment and populate as exploits are added:
    // { label: 'Capability Escalation', exploits: [] },
    // { label: 'Network / SSRF', exploits: [] },
    // { label: 'Storage', exploits: [] },
    // { label: 'DoS / Resource Exhaustion', exploits: [] },
];

const SEVERITY_COLOR: Record<Severity, string> = {
    high: '#f87171',
    medium: '#fbbf24',
    low: '#4ade80',
};

function ExploitCard({ exploit }: { exploit: ExploitEntry }) {
    return (
        <div
            style={{
                background: '#11151d',
                border: '1px solid #242b38',
                borderRadius: 10,
                padding: 16,
                display: 'grid',
                gap: 10,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                    style={{
                        fontSize: '0.72em',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: SEVERITY_COLOR[exploit.severity],
                        border: `1px solid ${SEVERITY_COLOR[exploit.severity]}`,
                        borderRadius: 4,
                        padding: '2px 6px',
                    }}
                >
                    {exploit.severity}
                </span>
                <strong style={{ fontSize: '1.05em' }}>{exploit.title}</strong>
            </div>

            <p style={{ margin: 0, color: '#9aa4b2', lineHeight: 1.6, fontSize: '0.93em' }}>
                {exploit.description}
            </p>

            <code
                style={{
                    fontSize: '0.8em',
                    color: '#6b7a99',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    alignSelf: 'start',
                }}
            >
                {exploit.hostLocation}
            </code>

            <Link to={exploit.path}>
                <button
                    style={{
                        borderColor: SEVERITY_COLOR[exploit.severity],
                        color: SEVERITY_COLOR[exploit.severity],
                        alignSelf: 'start',
                    }}
                >
                    Run exploit →
                </button>
            </Link>
        </div>
    );
}

export function HomePage() {
    return (
        <div style={{ margin: '0 auto', maxWidth: 1100, padding: 24, color: '#e8ecf1' }}>
            <div
                style={{
                    background: '#171a21',
                    border: '1px solid #2a2f3a',
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                }}
            >
                <h1 style={{ margin: '0 0 6px', fontSize: 28 }}>Exploiticon</h1>
                <p style={{ margin: '0 0 28px', color: '#9aa4b2', lineHeight: 1.6 }}>
                    Authorized security research harness for the Sage wallet host. Each
                    entry demonstrates a specific vulnerability class — showing the attack,
                    the vulnerable host location, and a proposed mitigation.
                </p>

                <div style={{ display: 'grid', gap: 28 }}>
                    {CATEGORIES.map((cat) =>
                        cat.exploits.length === 0 ? null : (
                            <div key={cat.label}>
                                <div
                                    style={{
                                        fontSize: '0.78em',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        color: '#6b7a99',
                                        marginBottom: 10,
                                    }}
                                >
                                    {cat.label}
                                </div>
                                <div style={{ display: 'grid', gap: 12 }}>
                                    {cat.exploits.map((e) => (
                                        <ExploitCard key={e.path} exploit={e} />
                                    ))}
                                </div>
                            </div>
                        ),
                    )}
                </div>

                <h2 style={{ fontSize: 16, margin: '28px 0 10px' }}>Log</h2>
                <LogPanel />
            </div>
        </div>
    );
}
