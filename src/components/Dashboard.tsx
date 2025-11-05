import { useState, useEffect } from 'react';
import {
  Globe,
  User,
  CreditCard,
  History,
  LogOut,
  Calendar,
  ExternalLink,
  Clock,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from './Router';

interface SubscriptionStatus {
  active: boolean;
  daysLeft: number;
  expiresAt: string | null;
  status: string;
}

interface ProxySession {
  id: string;
  url_visited: string;
  timestamp: string;
  load_time_ms: number;
  ip_location: string;
}

export default function Dashboard() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [history, setHistory] = useState<ProxySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subResponse, historyResponse] = await Promise.all([
        api.get('/subscription/status'),
        api.get('/proxy/history?limit=20'),
      ]);
      setSubscription(subResponse.data);
      setHistory(historyResponse.data.sessions);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const response = await api.get('/subscription/portal');
      window.location.href = response.data.url;
    } catch (error: any) {
      console.error('Failed to open portal:', error);
      alert(error.response?.data?.error || 'Errore apertura portale');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-slate-900">VerGen Browser</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('browser')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition shadow-sm"
              >
                Apri Browser
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
          <p className="text-slate-600">Benvenuto, {user?.username}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Il Mio Account</h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">Username</p>
                <p className="text-lg font-medium text-slate-900">{user?.username}</p>
              </div>
              {user?.email && (
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="text-lg font-medium text-slate-900">{user.email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Abbonamento</h3>
            </div>

            {subscription?.active ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-lg font-semibold text-emerald-600">Attivo</span>
                </div>

                <div>
                  <p className="text-sm text-slate-500 mb-1">Scade il</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <p className="text-lg font-medium text-slate-900">
                      {subscription.expiresAt
                        ? new Date(subscription.expiresAt).toLocaleDateString('it-IT')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-emerald-700 font-medium">
                    {subscription.daysLeft} giorni rimasti
                  </p>
                </div>

                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{portalLoading ? 'Caricamento...' : 'Gestisci Abbonamento'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-lg font-semibold text-red-600">Scaduto</span>
                </div>

                <p className="text-slate-600">
                  Il tuo abbonamento è scaduto. Rinnova per continuare a utilizzare il proxy browser.
                </p>

                <button
                  onClick={() => navigate('payment')}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition"
                >
                  Rinnova Abbonamento
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Storico Navigazione</h3>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nessuna navigazione ancora</p>
              <p className="text-sm text-slate-400 mt-1">
                Inizia a navigare per vedere lo storico qui
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Data e Ora
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      URL Visitato
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Posizione
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                      Tempo Caricamento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((session) => (
                    <tr key={session.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{formatDate(session.timestamp)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900 font-medium max-w-md truncate">
                        {session.url_visited}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{session.ip_location}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 text-right">
                        {session.load_time_ms}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
