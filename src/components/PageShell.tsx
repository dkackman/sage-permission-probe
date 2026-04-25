import { Link } from 'react-router-dom';
import { LogPanel } from './LogPanel';
import { EXPLOITS } from '../exploits';
import type { ReactNode } from 'react';

export function PageShell(props: {
    title: string;
    subtitle?: string;
    children: ReactNode;
}) {
    return (
        <div
            style={{
                margin: '0 auto',
                maxWidth: 1100,
                padding: 24,
                color: '#e8ecf1',
            }}
        >
            <div
                style={{
                    background: '#171a21',
                    border: '1px solid #2a2f3a',
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                }}
            >
                <h1 style={{ margin: '0 0 8px', fontSize: 28 }}>{props.title}</h1>
                {props.subtitle ? (
                    <div style={{ color: '#9aa4b2', marginBottom: 20 }}>
                        {props.subtitle}
                    </div>
                ) : null}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    <Link to='/'><button>Home</button></Link>
                    {EXPLOITS.map((e) => (
                        <Link key={e.path} to={e.path}>
                            <button style={{ borderColor: '#f87171', color: '#fecaca' }}>
                                {e.title}
                            </button>
                        </Link>
                    ))}
                </div>

                <div style={{ marginBottom: 24 }}>{props.children}</div>

                <h2 style={{ fontSize: 16, marginBottom: 10 }}>Log</h2>
                <LogPanel />
            </div>
        </div>
    );
}
