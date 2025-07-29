# Environment Variables Setup - Bergets Ro

This document outlines all required and optional environment variables for the Bergets Ro real estate management system.

## Setup Instructions

1. Copy the template below to create your `.env.local` file:
   ```bash
   cp .env.template .env.local
   ```

2. Update the values with your actual credentials

## Required Environment Variables

### Supabase Configuration
```bash
# Your Supabase project URL (found in Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase anonymous key (safe to expose in client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Service role key (server-side only, keep secret)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Next.js Configuration
```bash
# Application environment
NODE_ENV=development  # or 'production'

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000  # or your production URL
NEXTAUTH_SECRET=your_nextauth_secret_here  # Generate with: openssl rand -base64 32
```

## Optional Environment Variables

### Application Settings
```bash
APP_NAME="Bergets Ro"
APP_URL=http://localhost:3000
```

### Email Configuration (for notifications)
```bash
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@bergets-ro.se
```

### External API Integrations
```bash
# Vitec API for property data
VITEC_API_KEY=your_vitec_api_key_here

# Hemnet API for market data
HEMNET_API_KEY=your_hemnet_api_key_here
```

### File Upload Limits
```bash
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

### Security Settings
```bash
BCRYPT_ROUNDS=12
JWT_SECRET=your_jwt_secret_here
```

### Analytics & Monitoring
```bash
# Google Analytics
GOOGLE_ANALYTICS_ID=your_ga_tracking_id

# Hotjar for user experience tracking
HOTJAR_ID=your_hotjar_id

# Sentry for error tracking
SENTRY_DSN=your_sentry_dsn_here
```

## Environment Variable Template

Create a `.env.local` file with the following template:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Development/Production Environment
NODE_ENV=development

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Application Settings
APP_NAME="Bergets Ro"
APP_URL=http://localhost:3000

# Database URLs (if using direct connections)
DATABASE_URL=your_database_connection_string_here

# Email Configuration (optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@bergets-ro.se

# External API Keys (optional)
VITEC_API_KEY=your_vitec_api_key_here
HEMNET_API_KEY=your_hemnet_api_key_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# Security
BCRYPT_ROUNDS=12
JWT_SECRET=your_jwt_secret_here

# Analytics (optional)
GOOGLE_ANALYTICS_ID=your_ga_tracking_id
HOTJAR_ID=your_hotjar_id

# Error Tracking (optional)
SENTRY_DSN=your_sentry_dsn_here
```

## Security Best Practices

1. **Never commit `.env.local` files to version control**
2. **Use different secrets for development and production**
3. **Rotate secrets regularly**
4. **Limit access to production environment variables**
5. **Use strong, randomly generated secrets**

## Validation

To verify your environment setup, run:
```bash
npm run dev
```

Check the browser console and terminal for any missing environment variable warnings.

## Environment-Specific Notes

### Development
- Use local Supabase instance if available
- Enable debug logging
- Use test API keys when possible

### Production
- Use production Supabase instance
- Enable error tracking
- Use production API keys
- Set appropriate CORS and security headers 