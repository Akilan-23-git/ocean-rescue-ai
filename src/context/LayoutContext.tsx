import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/constants';

interface LayoutContextValue {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  sidebarWidth: number;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <LayoutContext.Provider value={{ sidebarCollapsed, toggleSidebar, sidebarWidth }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
}
