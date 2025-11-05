import { createContext, useContext, useState, ReactNode } from 'react';

type Page = 'home' | 'login' | 'register' | 'dashboard' | 'browser' | 'payment';

interface RouterContextType {
  currentPage: Page;
  navigate: (page: Page) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ currentPage, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useNavigate = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useNavigate must be used within RouterProvider');
  }
  return context.navigate;
};

export const useCurrentPage = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useCurrentPage must be used within RouterProvider');
  }
  return context.currentPage;
};
