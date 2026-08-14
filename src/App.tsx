import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/ui/Toast";
import { AppLayout } from "./components/layout/AppLayout";

// Paginas
import Dashboard from "./pages/Dashboard/Dashboard";
import Wallets from "./pages/Wallets/WalletsPage";
import Transactions from "./pages/Transactions/TransactionsPage";
import Assets from "./pages/Assets/AssetsPage";
import Goals from "./pages/Goals/GoalsPage";
import Websites from "./pages/Websites/WebsitesPage";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="wallets" element={<Wallets />} />
              <Route path="assets" element={<Assets />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="goals" element={<Goals />} />
              <Route path="websites" element={<Websites />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App