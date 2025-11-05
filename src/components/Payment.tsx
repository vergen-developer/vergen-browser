import { useState } from 'react';
import { CreditCard, Check, Globe } from 'lucide-react';
import api from '../lib/api';
import { useNavigate } from './Router';

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/payment/create-checkout');
      window.location.href = response.data.url;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Errore durante la creazione della sessione');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Globe className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">VerGen Browser</h1>
          <p className="text-slate-600">Sottoscrivi il tuo abbonamento mensile</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Browser Proxy Mensile</h2>
            <div className="text-6xl font-extrabold text-emerald-600 mb-2">€0,50</div>
            <p className="text-slate-600 text-lg">al mese</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Accesso Illimitato</h4>
                <p className="text-slate-600 text-sm">
                  Naviga senza limiti attraverso il nostro proxy server canadese
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">IP Canadese Garantito</h4>
                <p className="text-slate-600 text-sm">
                  Tutte le tue richieste provengono dal Canada 🇨🇦
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Rinnovo Automatico</h4>
                <p className="text-slate-600 text-sm">
                  Non preoccuparti, il tuo abbonamento si rinnova automaticamente ogni mese
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Cancella Quando Vuoi</h4>
                <p className="text-slate-600 text-sm">
                  Puoi annullare l'abbonamento in qualsiasi momento dalla dashboard
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Navigazione Privata</h4>
                <p className="text-slate-600 text-sm">
                  I siti web non vedono il tuo vero indirizzo IP
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h4 className="font-semibold text-slate-900 mb-4 text-center">Metodi di Pagamento</h4>
            <div className="flex justify-center items-center space-x-6 text-4xl">
              <span title="Visa">💳</span>
              <span title="Mastercard">💳</span>
              <span title="Apple Pay">🍎</span>
              <span title="Google Pay">🔵</span>
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
              Pagamenti sicuri gestiti da Stripe
            </p>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full px-8 py-4 bg-emerald-600 text-white text-lg rounded-lg hover:bg-emerald-700 font-semibold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            <CreditCard className="w-6 h-6" />
            <span>{loading ? 'Reindirizzamento...' : 'Sottoscrivi con Stripe'}</span>
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            Facendo clic su "Sottoscrivi" verrai reindirizzato a Stripe per completare il pagamento
            in modo sicuro.
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('dashboard')}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            ← Torna alla dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
