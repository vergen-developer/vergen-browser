import { RouterProvider, useCurrentPage } from './components/Router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import BrowserInterface from './components/BrowserInterface';
import Payment from './components/Payment';

function AppContent() {
  const currentPage = useCurrentPage();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user && !['home', 'login', 'register'].includes(currentPage)) {
    return <Login />;
  }

  switch (currentPage) {
    case 'home':
      return <Homepage />;
    case 'login':
      return <Login />;
    case 'register':
      return <Register />;
    case 'dashboard':
      return <Dashboard />;
    case 'browser':
      return <BrowserInterface />;
    case 'payment':
      return <Payment />;
    default:
      return <Homepage />;
  }
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
