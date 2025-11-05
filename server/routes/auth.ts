import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password richiesti' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimo 6 caratteri' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: 'Username già esistente' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        email: email || null,
        active: true,
      })
      .select()
      .single();

    if (error || !newUser) {
      return res.status(500).json({ error: 'Errore creazione utente' });
    }

    await supabase.from('subscriptions').insert({
      user_id: newUser.id,
      status: 'expired',
    });

    res.json({
      success: true,
      message: 'Registrazione completata',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password richiesti' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    if (!user.active) {
      return res.status(403).json({ error: 'Account disabilitato' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    const token = generateToken(user.id, user.username);

    res.json({
      success: true,
      token,
      expiresIn: '7d',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, username, email, created_at, last_login, active')
      .eq('id', req.user!.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});

export default router;
