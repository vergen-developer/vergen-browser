module.exports = {
  apps: [{
    name: 'vergen-api',
    script: './dist/server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      VITE_SUPABASE_URL: 'https://qxxfwoxtxscryithamlo.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE0NDgsImV4cCI6MjA3NzkxNzQ0OH0.c0HA-Y0DFrtqbLrFvuT3nZUqZ8_VvmbTjc_wKSzJWsU',
      SUPABASE_URL: 'https://qxxfwoxtxscryithamlo.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDE0NDgsImV4cCI6MjA3NzkxNzQ0OH0.c0HA-Y0DFrtqbLrFvuT3nZUqZ8_VvmbTjc_wKSzJWsU',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4eGZ3b3h0eHNjcnlpdGhhbWxvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM0MTQ0OCwiZXhwIjoyMDc3OTE3NDQ4fQ.y_RWQZpztOz3jYIx5cqOg7CyS8UkNELaR9b_tGxdNcc',
      JWT_SECRET: 'da93175701d2f4fea65d69b955907edd9a25c02ad8cfacb2adcd6f8e3b945c96'
    }
  }]
};
