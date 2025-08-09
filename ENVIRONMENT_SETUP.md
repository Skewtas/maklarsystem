# Environment Variables Setup Guide

## 🚀 Quick Start

1. **Copy the example file**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Get your Supabase credentials**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to Settings → API
   - Copy the required keys

3. **Update `.env.local`** with your actual values

## 📋 Required Variables

These variables MUST be set for the application to work:

### Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find them:**
- **Project URL**: Settings → API → Project URL
- **Anon Key**: Settings → API → Project API keys → anon public
- **Service Role Key**: Settings → API → Project API keys → service_role (⚠️ Keep this secret!)

## 🔐 Security Best Practices

### Never expose these variables:
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side only, full database access
- `JWT_SECRET` - Used for additional authentication
- `CSRF_SECRET` - Protects against CSRF attacks
- Any `_SECRET` or `_KEY` variables

### Safe to expose (client-side):
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- These are designed to be public (like API URLs)

## 🛠️ Optional Configurations

### Map Integration (Mapbox)
If you want to show properties on a map:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token-here
```
Get a free token at [Mapbox](https://www.mapbox.com/)

### Email Notifications
For sending emails (password resets, notifications):
```env
EMAIL_FROM=noreply@maklarsystem.se
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-app-password
```

### Analytics & Monitoring
Track usage and errors:
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Google Analytics
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx  # Error tracking
```

## 🇸🇪 Swedish Market Defaults

These are pre-configured for Sweden but can be customized:
```env
NEXT_PUBLIC_DEFAULT_CURRENCY=SEK
NEXT_PUBLIC_DEFAULT_LOCALE=sv-SE
NEXT_PUBLIC_DEFAULT_TIMEZONE=Europe/Stockholm
```

## 🧪 Development Settings

For local development:
```env
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEBUG_MODE=true  # Enable debug logging
NEXT_PUBLIC_USE_MOCK_DATA=false  # Use real Supabase data
```

## 📝 Generating Secure Secrets

For production, generate secure random strings:

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Node.js:**
```javascript
require('crypto').randomBytes(32).toString('base64')
```

## 🔄 Environment Variable Loading Order

Next.js loads environment variables in this order:
1. `process.env`
2. `.env.local`
3. `.env.[environment]` (e.g., `.env.development`)
4. `.env`

`.env.local` always overrides others (except on Vercel)

## 🚨 Common Issues

### "Supabase client not initialized"
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart the development server after changing `.env.local`

### "Invalid API key"
- Verify you copied the complete key (they're quite long)
- Ensure no extra spaces or line breaks

### "CORS errors"
- Check that your Supabase URL is correct
- Verify the project is not paused in Supabase

### Changes not taking effect
- Always restart the dev server after changing environment variables:
  ```bash
  # Stop the server (Ctrl+C) then:
  npm run dev
  ```

## 🚀 Deployment

### Vercel
Add environment variables in Project Settings → Environment Variables

### Other Platforms
Most platforms have a way to set environment variables:
- Netlify: Site settings → Environment variables
- Heroku: Settings → Config Vars
- AWS: Use Parameter Store or Secrets Manager

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs#get-the-api-keys)
- [Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)