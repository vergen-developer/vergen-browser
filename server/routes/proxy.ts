import { Router, Response } from 'express';
import axios from 'axios';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { supabase } from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { validateURL } from '../middleware/security.js';

const router = Router();

const PROXY_VPS_HOST = process.env.PROXY_VPS_HOST || '';
const PROXY_VPS_PORT = process.env.PROXY_VPS_PORT || '3128';
const PROXY_AUTH_USER = process.env.PROXY_AUTH_USER || '';
const PROXY_AUTH_PASS = process.env.PROXY_AUTH_PASS || '';

const getProxyAgents = () => {
  if (!PROXY_VPS_HOST) {
    return { httpAgent: undefined, httpsAgent: undefined };
  }

  const auth = PROXY_AUTH_USER && PROXY_AUTH_PASS ? `${PROXY_AUTH_USER}:${PROXY_AUTH_PASS}@` : '';
  const proxyUrl = `http://${auth}${PROXY_VPS_HOST}:${PROXY_VPS_PORT}`;

  return {
    httpAgent: new HttpProxyAgent(proxyUrl),
    httpsAgent: new HttpsProxyAgent(proxyUrl),
  };
};

const checkActiveSubscription = async (userId: string): Promise<boolean> => {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, expires_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (!subscription) return false;

  const now = new Date();
  const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;

  return subscription.status === 'active' && expiresAt !== null && expiresAt > now;
};

const logProxySession = async (
  userId: string,
  url: string,
  loadTimeMs: number
): Promise<void> => {
  await supabase.from('proxy_sessions').insert({
    user_id: userId,
    url_visited: url,
    ip_location: 'Canada 🇨🇦',
    load_time_ms: loadTimeMs,
  });
};

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();

  try {
    const { url } = req.body;
    const userId = req.user!.id;

    const urlValidation = validateURL(url);
    if (!urlValidation.valid) {
      return res.status(400).json({ error: urlValidation.error });
    }

    const hasActiveSubscription = await checkActiveSubscription(userId);
    if (!hasActiveSubscription) {
      return res.status(403).json({
        error: 'Abbonamento non attivo',
        message: 'Il tuo abbonamento è scaduto. Rinnova per continuare a navigare.',
      });
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    const { httpAgent, httpsAgent } = getProxyAgents();

    const response = await axios.get(normalizedUrl, {
      httpAgent,
      httpsAgent,
      timeout: 30000,
      maxRedirects: 5,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      validateStatus: (status) => status < 500,
    });

    const loadTimeMs = Date.now() - startTime;

    await logProxySession(userId, normalizedUrl, loadTimeMs);

    res.json({
      html: response.data,
      status: response.status,
      location: 'Canada 🇨🇦',
      loadTime: loadTimeMs,
      headers: response.headers,
    });
  } catch (error: any) {
    const loadTimeMs = Date.now() - startTime;

    console.error('Proxy error:', error.message);

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Timeout connessione',
        message: 'Il sito ha impiegato troppo tempo a rispondere',
      });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(502).json({
        error: 'Sito non raggiungibile',
        message: 'Impossibile connettersi al sito richiesto',
      });
    }

    res.status(500).json({
      error: 'Errore proxy',
      message: error.message || 'Errore durante il caricamento della pagina',
    });
  }
});

router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const { data: sessions, error, count } = await supabase
      .from('proxy_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      sessions: sessions || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Errore recupero storico' });
  }
});

router.get('/history/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.id;

    const { data: session, error } = await supabase
      .from('proxy_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!session) {
      return res.status(404).json({ error: 'Sessione non trovata' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Errore recupero sessione' });
  }
});

export default router;
