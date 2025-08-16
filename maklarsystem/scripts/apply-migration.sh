#!/bin/bash

# Script to apply the property_images RLS fix migration to Supabase
# This fixes the RLS policies to reference objekt instead of properties table

echo "Applying property_images RLS fix migration..."

# Read the Supabase URL and service role key from environment or pass as arguments
SUPABASE_URL="${1:-$SUPABASE_URL}"
SUPABASE_SERVICE_ROLE_KEY="${2:-$SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Error: Please provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    echo "Usage: ./apply-migration.sh <SUPABASE_URL> <SUPABASE_SERVICE_ROLE_KEY>"
    echo "Or set them as environment variables"
    exit 1
fi

# Apply the migration using Supabase CLI
npx supabase db push --db-url "${SUPABASE_URL}/rest/v1/" \
    --file ../supabase/migrations/20250816000000_fix_property_images_policies.sql

echo "Migration applied successfully!"