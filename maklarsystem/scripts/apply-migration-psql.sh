#!/bin/bash

# Script to apply property_images RLS fix migration using psql
# This fixes the RLS policies to reference objekt instead of properties table

echo "==================================="
echo "Property Images RLS Fix Migration"
echo "==================================="

# Database connection string
# Format: postgresql://[user]:[password]@[host]:[port]/[database]
DATABASE_URL="${DATABASE_URL:-}"

# If DATABASE_URL is not set, construct it from individual components
if [ -z "$DATABASE_URL" ]; then
    # Read from .env.local if it exists
    if [ -f "../.env.local" ]; then
        source "../.env.local"
    fi
    
    # Try to construct from Supabase environment variables
    if [ -n "$SUPABASE_DB_URL" ]; then
        DATABASE_URL="$SUPABASE_DB_URL"
    elif [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        # Extract project ID from URL
        PROJECT_ID=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed -n 's/https:\/\/\([^.]*\).*/\1/p')
        DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[YOUR_DB_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
        echo "Please update DATABASE_URL with your actual database password"
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL is not set"
    echo ""
    echo "To apply this migration, you need to:"
    echo "1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/kwxxpypgtdfimmxnipaz/settings/database"
    echo "2. Copy the connection string (URI) from the Connection String section"
    echo "3. Run this command with the connection string:"
    echo ""
    echo "   DATABASE_URL='your-connection-string' ./apply-migration-psql.sh"
    echo ""
    echo "Or set it in your .env.local file as DATABASE_URL="
    exit 1
fi

# Path to migration file
MIGRATION_FILE="../supabase/migrations/20250816000000_fix_property_images_policies.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "Error: Migration file not found at $MIGRATION_FILE"
    exit 1
fi

echo "Applying migration from: $MIGRATION_FILE"
echo "Database: [connection details hidden for security]"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "psql command not found. Installing PostgreSQL client tools..."
    
    # Detect OS and install psql
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install postgresql
        else
            echo "Please install Homebrew first: https://brew.sh"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update && sudo apt-get install -y postgresql-client
    else
        echo "Please install PostgreSQL client tools for your operating system"
        exit 1
    fi
fi

# Apply the migration
echo "Executing migration..."
psql "$DATABASE_URL" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Verifying policies..."
    psql "$DATABASE_URL" -c "SELECT policyname FROM pg_policies WHERE tablename = 'property_images';"
else
    echo ""
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi