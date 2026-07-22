import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';

// Páginas
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Assets from './pages/Assets';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Rota raiz que carrega o Layout (Sidebar + Header) */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="wallets" element={<Wallets />} />
              <Route path="assets" element={<Assets />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="goals" element={<Goals />} />
              {/* Redireciona rotas desconhecidas para o Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;