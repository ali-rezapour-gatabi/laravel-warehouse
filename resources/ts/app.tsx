import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

const rootElement = document.getElementById('react-root');

if (!rootElement) {
    throw new Error('React root element not found');
}
const pages: Record<string, React.ComponentType> = {
    '/': Dashboard,
    '/login': Login,
};

const path = window.location.pathname;
const Page = pages[path] ?? Dashboard;

createRoot(rootElement).render(
    <StrictMode>
        <Page />
    </StrictMode>
);
