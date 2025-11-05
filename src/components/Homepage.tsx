import { Globe, Shield, Zap, Unlock } from 'lucide-react';
import { useNavigate } from './Router';

export default function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-slate-900">VerGen Browser</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('login')}
                className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('register')}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition shadow-sm"
              >
                Inizia Ora
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-slate-900 mb-6">
            Naviga il Web Senza Confini
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Accedi a siti web dal Canada usando il nostro proxy server.
            <br />
            Nessuna VPN necessaria. Veloce, sicuro, privato.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('register')}
              className="px-8 py-4 bg-emerald-600 text-white text-lg rounded-lg hover:bg-emerald-700 font-semibold transition shadow-lg"
            >
              Prova Gratis 7 Giorni
            </button>
            <button
              onClick={() => navigate('payment')}
              className="px-8 py-4 bg-white text-slate-900 text-lg rounded-lg hover:bg-slate-50 font-semibold transition shadow-lg border-2 border-slate-200"
            >
              Sottoscrivi Ora
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">IP da Canada 🇨🇦</h3>
            <p className="text-slate-600">
              Naviga con un indirizzo IP canadese. I siti web vedono la tua posizione in Canada, non quella reale.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Unlock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nessuna VPN</h3>
            <p className="text-slate-600">
              Non serve installare VPN sul tuo dispositivo. Tutto funziona direttamente nel browser.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Navigazione Privata</h3>
            <p className="text-slate-600">
              Le tue richieste passano attraverso il nostro server proxy sicuro in Canada.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Ultra Veloce</h3>
            <p className="text-slate-600">
              Server ottimizzati per prestazioni elevate. Naviga senza rallentamenti.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">Piano Mensile</h3>
          <div className="text-6xl font-extrabold text-emerald-600 mb-2">€0,50</div>
          <p className="text-slate-600 mb-8">al mese</p>
          <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-emerald-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-slate-700">Accesso illimitato al proxy</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-emerald-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-slate-700">IP Canadese garantito</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-emerald-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-slate-700">Rinnovo automatico</span>
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-emerald-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-slate-700">Cancella quando vuoi</span>
            </li>
          </ul>
          <div className="flex justify-center space-x-4 text-3xl mb-8">
            <span>💳</span>
            <span>🍎</span>
            <span>🔵</span>
          </div>
          <button
            onClick={() => navigate('register')}
            className="px-10 py-4 bg-emerald-600 text-white text-lg rounded-lg hover:bg-emerald-700 font-semibold transition shadow-lg"
          >
            Inizia Ora
          </button>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-6 h-6 text-emerald-400" />
                <span className="text-lg font-bold">VerGen Browser</span>
              </div>
              <p className="text-slate-400">Naviga il web senza confini con il nostro proxy server canadese.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legale</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Termini di Servizio</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Supporto</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Contattaci</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© 2025 VerGen Browser. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
