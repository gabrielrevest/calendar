module.exports = {
  apps: [{
    name: 'calendar-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/calendar',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Clés Clerk - À mettre à jour avec vos vraies clés
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_bW9kZXN0LXJlZGJpcmQtMjAuY2xlcmsuYWNjb3VudHMuZGV2JA',
      CLERK_SECRET_KEY: 'sk_test_VFN0XYMl2fqTFRTrGYyUDDq5YVzObBsnNR5eF6LDYr',
      DATABASE_URL: 'file:./prisma/database.db',
      // Corriger l'erreur UntrustedHost de NextAuth
      AUTH_URL: 'http://157.245.69.178',
      AUTH_TRUST_HOST: 'true',
      NEXTAUTH_URL: 'http://157.245.69.178'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}

