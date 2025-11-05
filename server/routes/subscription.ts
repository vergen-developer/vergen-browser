import { Router, Response } from 'express';
import { stripe, STRIPE_ENABLED } from '../config/stripe';
import { supabase } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!subscription) {
      return res.json({
        active: false,
        expiresAt: null,
        daysLeft: 0,
        stripeId: null,
      });
    }

    const now = new Date();
    const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null;
    const isActive = subscription.status === 'active' && expiresAt && expiresAt > now;
    const daysLeft = expiresAt
      ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    res.json({
      active: isActive,
      expiresAt: subscription.expires_at,
      daysLeft,
      stripeId: subscription.stripe_subscription_id,
      status: subscription.status,
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});

router.post('/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!STRIPE_ENABLED || !stripe) {
    return res.status(503).json({ error: 'Stripe non configurato' });
  }

  try {
    const userId = req.user!.id;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!subscription || !subscription.stripe_subscription_id) {
      return res.status(404).json({ error: 'Abbonamento non trovato' });
    }

    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    res.json({
      cancelled: true,
      message: 'Abbonamento cancellato con successo',
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: error.message || 'Errore cancellazione abbonamento' });
  }
});

router.get('/portal', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!STRIPE_ENABLED || !stripe) {
    return res.status(503).json({ error: 'Stripe non configurato' });
  }

  try {
    const userId = req.user!.id;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!subscription || !subscription.stripe_customer_id) {
      return res.status(404).json({ error: 'Cliente Stripe non trovato' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.APP_URL || 'http://localhost:5173'}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Create portal session error:', error);
    res.status(500).json({ error: error.message || 'Errore creazione portale' });
  }
});

export default router;
