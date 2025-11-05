import { Router, Response } from 'express';
import { stripe, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET, STRIPE_ENABLED } from '../config/stripe';
import { supabase } from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/create-checkout', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!STRIPE_ENABLED || !stripe) {
    return res.status(503).json({ error: 'Stripe non configurato' });
  }
  try {
    const userId = req.user!.id;

    const { data: user } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          user_id: userId,
          username: user.username,
        },
      });
      customerId = customer.id;

      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.APP_URL || 'http://localhost:5173'}/dashboard?payment=success`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:5173'}/payment?payment=cancelled`,
      metadata: {
        user_id: userId,
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: error.message || 'Errore creazione sessione pagamento' });
  }
});

router.post('/webhook', async (req, res) => {
  if (!STRIPE_ENABLED || !stripe) {
    return res.status(503).json({ error: 'Stripe non configurato' });
  }

  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await supabase.from('stripe_events').insert({
      event_type: event.type,
      event_id: event.id,
      data: event.data.object as any,
    });

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        const { data: userSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (userSub) {
          await supabase
            .from('subscriptions')
            .update({
              stripe_subscription_id: subscriptionId,
              status: status === 'active' ? 'active' : 'expired',
              expires_at: currentPeriodEnd.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userSub.user_id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const subscriptionId = subscription.id;

        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
