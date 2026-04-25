import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { HomePage } from './pages/HomePage';
import { EXPLOITS } from './exploits';

export default function App() {
    return (
        <Suspense fallback={<div>Connecting to Sage…</div>}>
            <Routes>
                <Route path='/' element={<HomePage />} />
                {EXPLOITS.map((e) => (
                    <Route key={e.path} path={e.path} element={<e.component />} />
                ))}
            </Routes>
        </Suspense>
    );
}
