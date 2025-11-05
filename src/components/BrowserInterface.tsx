import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Globe,
  LogOut,
  User,
  Calendar,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from './Router';

interface SubscriptionStatus {
  active: boolean;
  daysLeft: number;
  expiresAt: string | null;
}

export default function BrowserInterface() {
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadTime, setLoadTime] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/subscription/status');
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const handleNavigate = async () => {
    if (!url.trim()) {
      setError('Inserisci un URL valido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/proxy', { url });
      setHtmlContent(response.data.html);
      setCurrentUrl(url);
      setLoadTime(response.data.loadTime);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Errore durante il caricamento');
      if (err.response?.status === 403) {
        await fetchSubscriptionStatus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    if (currentUrl) {
      setUrl(currentUrl);
      handleNavigate();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">VerGen Browser</h1>
          </div>

          <div className="flex items-center space-x-4">
            {subscription && subscription.active && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  {subscription.daysLeft} giorni rimasti
                </span>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <User className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-medium text-slate-700">{user?.username}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <button
                    onClick={() => {
                      navigate('dashboard');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>

            <button
              onClick={() => window.history.forward()}
              className="p-2 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              <ArrowRight className="w-5 h-5 text-slate-600" />
            </button>

            <button
              onClick={handleReload}
              className="p-2 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
              disabled={loading || !currentUrl}
            >
              <RotateCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
                placeholder="Inserisci sito web... (es: example.com)"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                disabled={loading}
              />
              <button
                onClick={handleNavigate}
                disabled={loading || !subscription?.active}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Caricamento...' : 'Vai'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-emerald-700">Connesso da Canada 🇨🇦</span>
            </div>
            {currentUrl && loadTime > 0 && (
              <span className="text-xs text-slate-500">Caricato in {loadTime}ms</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border-t border-slate-200 overflow-hidden">
        {error && (
          <div className="p-8 text-center">
            <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-700 font-medium mb-2">❌ {error}</p>
              {error.includes('Abbonamento') && (
                <button
                  onClick={() => navigate('payment')}
                  className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition"
                >
                  Rinnova Abbonamento
                </button>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RotateCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Caricamento pagina...</p>
              <p className="text-sm text-slate-500 mt-2">Connessione tramite proxy Canada 🇨🇦</p>
            </div>
          </div>
        )}

        {!loading && !error && htmlContent && (
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title="Proxy Browser Content"
          />
        )}

        {!loading && !error && !htmlContent && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Globe className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Benvenuto su VerGen Browser</h2>
              <p className="text-slate-500 max-w-md">
                Inserisci un URL nella barra sopra per iniziare a navigare tramite il nostro proxy canadese.
              </p>
            </div>
          </div>
        )}
      </div>

      {currentUrl && (
        <div className="bg-white border-t border-slate-200 px-4 py-2">
          <p className="text-xs text-slate-500 truncate">
            <span className="font-medium">URL visitato:</span> {currentUrl}
          </p>
        </div>
      )}
    </div>
  );
}
