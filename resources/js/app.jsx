import { createRoot } from 'react-dom/client';

function App() {
    return (
        <main className="min-h-screen bg-gray-100 p-8 text-gray-900">
            <h1 className="text-2xl font-semibold">React este instalat și funcționează.</h1>
        </main>
    );
}

const rootElement = document.getElementById('react-root');

if (rootElement) {
    createRoot(rootElement).render(<App />);
}
