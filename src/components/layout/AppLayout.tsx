// src/components/layout/AppLayout.tsx
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar/Sidebar";
import { Header } from "./Header/Header";
import { MobileHeader } from "./Header/MobileHeader";
import { Outlet } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { useTheme } from "../../contexts/ThemeContext"; // ✅ Importar

export function AppLayout() {
  const { theme, toggleTheme } = useTheme(); // ✅ Obter tema e toggle
  const [isMobile, setIsMobile] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const sidebarWidth = isSidebarOpen ? 264 : 72;

  return (
    <div className="min-h-screen flex bg-background text-text-primary">
      {/* ✅ Sidebar com tema real */}
      <Sidebar
        isOpen={isSidebarOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {isMobile && <MobileHeader />}

        {!isMobile && (
          <Header
            isOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
          />
        )}

        <main
          className="flex-1 pt-18 flex flex-col min-w-0 overflow-x-hidden transition-all duration-300"
          style={{
            marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
            width: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
          }}
        >
          <div className="flex-1 min-w-0 mb-8">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
