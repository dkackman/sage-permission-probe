import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { initSageRuntimeBridge } from '@sage-app/sdk';
import App from './App';
import './index.css';
import {SageRequired} from "./SageRequired.tsx";

const runningInSage = initSageRuntimeBridge();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {runningInSage ? (
            <HashRouter>
                <App />
            </HashRouter>
        ) : (
            <SageRequired />
        )}
    </React.StrictMode>,
);
