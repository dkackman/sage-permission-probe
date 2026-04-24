import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { HomePage } from './pages/HomePage';
import { ExploitPage } from './pages/ExploitPage';

export default function App() {
    return (
        <Suspense fallback={<div>Connecting to Sage…</div>}>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/approval-flood' element={<ExploitPage />} />
            </Routes>
        </Suspense>
    );
}
