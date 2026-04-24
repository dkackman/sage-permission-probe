import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BridgePage } from './pages/BridgePage';
import { NetworkPage } from './pages/NetworkPage';
import { WebSocketPage } from './pages/WebSocketPage';
import {StoragePage} from "./pages/StoragePage.tsx";
import {WalletPage} from "./pages/WalletPage.tsx";
import {PermissionsPage} from "./pages/PermissionsPage.tsx";
import {Suspense} from "react";

export default function App() {
    return (
        <Suspense fallback={<div>Connecting to Sage…</div>}>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/bridge' element={<BridgePage />} />
                <Route path='/network' element={<NetworkPage />} />
                <Route path='/websocket' element={<WebSocketPage />} />
                <Route path='/storage' element={<StoragePage />} />
                <Route path='/wallet' element={<WalletPage />} />
                <Route path='/permissions' element={<PermissionsPage />} />
            </Routes>
        </Suspense>
    );
}
