#!/bin/bash

# Supabase connection details
DB_HOST="aws-0-eu-north-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.exreuewsrgavzsbdnghv"
DB_PASSWORD="VJpbRNAtkJIsp4heAt4gZu2KZqItxYi7RCJ1XgvETIs"

# Apply the fix
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f scripts/fix-auth-permissions.sql

echo "Permissions fix applied. Testing authentication..."