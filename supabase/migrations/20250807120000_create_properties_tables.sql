-- Migration: Create Properties Tables
-- Description: Creates properties, property_images, and related tables for the Swedish real estate system
-- Author: Claude Code SuperClaude
-- Date: 2025-08-07

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA extensions;

-- Create custom types and enums
CREATE TYPE property_type AS ENUM ('villa', 'lagenhet', 'radhus', 'tomt', 'fritidshus');
CREATE TYPE property_status AS ENUM ('kommande', 'till_salu', 'under_kontrakt', 'sald');
CREATE TYPE energy_class AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G');
CREATE TYPE heating_type AS ENUM ('fjärrvärme', 'el', 'gas', 'olja', 'pellets', 'bergvärme', 'annat');

-- ============================================================
-- MAIN PROPERTIES TABLE
-- ============================================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  fastighetsbeteckning VARCHAR(100) UNIQUE NOT NULL,
  
  -- Basic property information
  property_type property_type NOT NULL,
  status property_status NOT NULL DEFAULT 'kommande',
  
  -- Address information
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  municipality VARCHAR(100),
  county VARCHAR(50),
  coordinates POINT, -- PostGIS point for lat/lng
  
  -- Specifications
  living_area INTEGER NOT NULL CHECK (living_area > 0),
  total_area INTEGER CHECK (total_area >= living_area),
  plot_area INTEGER CHECK (plot_area >= 0),
  rooms DECIMAL(3,1) NOT NULL CHECK (rooms >= 0.5),
  bedrooms INTEGER CHECK (bedrooms >= 0),
  bathrooms INTEGER CHECK (bathrooms >= 0),
  build_year INTEGER NOT NULL CHECK (build_year >= 1800 AND build_year <= EXTRACT(year FROM CURRENT_DATE) + 2),
  floor INTEGER CHECK (floor >= 0),
  floors INTEGER CHECK (floors >= 1),
  
  -- Features (stored as boolean flags for performance)
  has_elevator BOOLEAN DEFAULT false,
  has_balcony BOOLEAN DEFAULT false,
  has_garden BOOLEAN DEFAULT false,
  has_parking BOOLEAN DEFAULT false,
  energy_class energy_class,
  heating_type heating_type,
  
  -- Pricing information
  asking_price BIGINT NOT NULL CHECK (asking_price >= 0),
  accepted_price BIGINT CHECK (accepted_price >= 0),
  monthly_fee INTEGER CHECK (monthly_fee >= 0),
  operating_cost INTEGER CHECK (operating_cost >= 0),
  property_tax INTEGER CHECK (property_tax >= 0),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  short_description VARCHAR(500),
  full_description TEXT NOT NULL,
  features JSONB DEFAULT '[]', -- Array of feature strings
  
  -- SEO and metadata
  seo_title VARCHAR(255),
  seo_description VARCHAR(300),
  seo_keywords TEXT[],
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  
  -- Timestamps and ownership
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT valid_coordinates CHECK (
    coordinates IS NULL OR (
      ST_X(coordinates) BETWEEN -180 AND 180 AND 
      ST_Y(coordinates) BETWEEN -90 AND 90
    )
  ),
  CONSTRAINT valid_price_relationship CHECK (
    accepted_price IS NULL OR accepted_price <= asking_price * 2
  ),
  CONSTRAINT valid_area_relationship CHECK (
    total_area IS NULL OR total_area >= living_area
  )
);

-- ============================================================
-- PROPERTY IMAGES TABLE
-- ============================================================

CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Image URLs and metadata
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption VARCHAR(255),
  
  -- Image classification
  is_primary BOOLEAN DEFAULT false,
  is_floorplan BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 1,
  
  -- Image technical details
  width INTEGER CHECK (width > 0),
  height INTEGER CHECK (height > 0),
  size_bytes BIGINT CHECK (size_bytes > 0),
  mime_type VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_display_order CHECK (display_order BETWEEN 1 AND 50),
  CONSTRAINT valid_dimensions CHECK (
    (width IS NULL AND height IS NULL) OR (width IS NOT NULL AND height IS NOT NULL)
  )
);

-- ============================================================
-- USER PROFILES TABLE (if not exists from other migrations)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile information
  display_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'agent', 'admin')),
  
  -- Contact information
  phone VARCHAR(20),
  company VARCHAR(100),
  
  -- Preferences
  preferences JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Properties table indexes
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_municipality ON properties(municipality);
CREATE INDEX idx_properties_asking_price ON properties(asking_price);
CREATE INDEX idx_properties_living_area ON properties(living_area);
CREATE INDEX idx_properties_rooms ON properties(rooms);
CREATE INDEX idx_properties_build_year ON properties(build_year);
CREATE INDEX idx_properties_published_at ON properties(published_at DESC NULLS LAST);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX idx_properties_updated_at ON properties(updated_at DESC);
CREATE INDEX idx_properties_view_count ON properties(view_count DESC);

-- Composite indexes for common queries
CREATE INDEX idx_properties_status_type ON properties(status, property_type);
CREATE INDEX idx_properties_city_status ON properties(city, status);
CREATE INDEX idx_properties_price_range ON properties(asking_price, living_area) WHERE status IN ('kommande', 'till_salu');

-- Text search indexes
CREATE INDEX idx_properties_title_gin ON properties USING gin(to_tsvector('swedish', title));
CREATE INDEX idx_properties_description_gin ON properties USING gin(to_tsvector('swedish', full_description));
CREATE INDEX idx_properties_address_gin ON properties USING gin(to_tsvector('swedish', street || ' ' || city));

-- Geospatial index for location-based searches
CREATE INDEX idx_properties_coordinates_gist ON properties USING gist(coordinates) WHERE coordinates IS NOT NULL;

-- Property images indexes
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_primary ON property_images(property_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_property_images_display_order ON property_images(property_id, display_order);

-- ============================================================
-- FULL-TEXT SEARCH FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION search_properties_full_text(search_query TEXT)
RETURNS TABLE(
  property_id UUID,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    ts_rank_cd(
      setweight(to_tsvector('swedish', p.title), 'A') ||
      setweight(to_tsvector('swedish', coalesce(p.short_description, '')), 'B') ||
      setweight(to_tsvector('swedish', p.full_description), 'C') ||
      setweight(to_tsvector('swedish', p.street || ' ' || p.city), 'D'),
      plainto_tsquery('swedish', search_query)
    ) AS rank
  FROM properties p
  WHERE 
    (
      setweight(to_tsvector('swedish', p.title), 'A') ||
      setweight(to_tsvector('swedish', coalesce(p.short_description, '')), 'B') ||
      setweight(to_tsvector('swedish', p.full_description), 'C') ||
      setweight(to_tsvector('swedish', p.street || ' ' || p.city), 'D')
    ) @@ plainto_tsquery('swedish', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- GEOSPATIAL SEARCH FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION search_properties_by_distance(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION
)
RETURNS TABLE(
  property_id UUID,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    ST_Distance(
      p.coordinates,
      ST_Point(center_lng, center_lat)::geometry
    ) / 1000.0 AS distance_km
  FROM properties p
  WHERE 
    p.coordinates IS NOT NULL
    AND ST_DWithin(
      p.coordinates,
      ST_Point(center_lng, center_lat)::geometry,
      radius_km * 1000 -- Convert km to meters
    )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_images_updated_at
  BEFORE UPDATE ON property_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGERS FOR SLUG GENERATION
-- ============================================================

CREATE OR REPLACE FUNCTION generate_property_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title
  base_slug := lower(trim(NEW.title));
  base_slug := regexp_replace(base_slug, '[åä]', 'a', 'g');
  base_slug := regexp_replace(base_slug, '[ö]', 'o', 'g');
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'fastighet';
  END IF;
  
  -- Make slug unique
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM properties WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_property_slug_trigger
  BEFORE INSERT OR UPDATE OF title ON properties
  FOR EACH ROW
  EXECUTE FUNCTION generate_property_slug();

-- ============================================================
-- TRIGGER FOR PRIMARY IMAGE CONSTRAINT
-- ============================================================

CREATE OR REPLACE FUNCTION enforce_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting an image as primary, unset all other primary images for this property
  IF NEW.is_primary = true THEN
    UPDATE property_images 
    SET is_primary = false 
    WHERE property_id = NEW.property_id 
      AND id != NEW.id 
      AND is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_primary_image_trigger
  BEFORE INSERT OR UPDATE OF is_primary ON property_images
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION enforce_single_primary_image();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Public properties are viewable by everyone" ON properties
  FOR SELECT USING (status IN ('till_salu', 'under_kontrakt', 'sald'));

CREATE POLICY "Users can view their own properties" ON properties
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own properties" ON properties
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = updated_by);

CREATE POLICY "Admins can manage all properties" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Property images policies
CREATE POLICY "Property images are viewable if property is viewable" ON property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_images.property_id 
        AND (
          status IN ('till_salu', 'under_kontrakt', 'sald')
          OR created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

CREATE POLICY "Users can manage images for their properties" ON property_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_images.property_id 
        AND (
          created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
          )
        )
    )
  );

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================

-- Insert sample user profile (only if auth.users exists and has data)
-- INSERT INTO user_profiles (user_id, display_name, role, phone, company)
-- SELECT 
--   id,
--   COALESCE(raw_user_meta_data->>'full_name', email),
--   'admin',
--   NULL,
--   'Mäklarsystem Demo'
-- FROM auth.users 
-- WHERE email LIKE '%@%' 
-- LIMIT 1
-- ON CONFLICT (user_id) DO NOTHING;

-- Comment out sample data for production - uncomment for development/testing
/*
-- Sample properties (only insert if we have users)
INSERT INTO properties (
  fastighetsbeteckning,
  property_type,
  status,
  street,
  city,
  postal_code,
  municipality,
  county,
  living_area,
  rooms,
  build_year,
  asking_price,
  title,
  full_description,
  created_by
) VALUES 
(
  'Stockholm 1:23',
  'lagenhet',
  'till_salu',
  'Strandvägen 7A',
  'Stockholm',
  '11456',
  'Stockholm',
  'Stockholm',
  85,
  3.0,
  1925,
  8500000,
  'Elegant 3:a med havsutsikt på Strandvägen',
  'Välkommen till denna exklusiva 3-rumslägenhet på den prestigefulla Strandvägen. Lägenheten erbjuder en fantastisk utsikt över vattnet och har genomgått en smakfull renovering med höga kvalitetsval.',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Göteborg 5:44',
  'villa', 
  'till_salu',
  'Oceanvägen 15',
  'Göteborg',
  '42633',
  'Göteborg',
  'Västra Götaland',
  145,
  5.0,
  1978,
  4200000,
  'Rymlig villa nära havet',
  'Denna charmiga villa ligger bara några minuter från havet och erbjuder generösa ytor för hela familjen. Huset har en härlig trädgård och garage.',
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT (fastighetsbeteckning) DO NOTHING;
*/

-- ============================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE properties IS 'Main properties table for Swedish real estate listings';
COMMENT ON TABLE property_images IS 'Images associated with properties, supporting multiple images per property';
COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond auth.users';

COMMENT ON COLUMN properties.fastighetsbeteckning IS 'Swedish property designation (e.g., "Stockholm 1:23")';
COMMENT ON COLUMN properties.coordinates IS 'PostGIS point storing latitude and longitude';
COMMENT ON COLUMN properties.features IS 'JSON array of property features as strings';
COMMENT ON COLUMN properties.slug IS 'URL-friendly identifier generated from title';

COMMENT ON FUNCTION search_properties_full_text(TEXT) IS 'Full-text search function using Swedish language configuration';
COMMENT ON FUNCTION search_properties_by_distance(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) IS 'Geospatial search within specified radius';

-- ============================================================
-- GRANTS AND PERMISSIONS
-- ============================================================

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION search_properties_full_text(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_properties_by_distance(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;
GRANT EXECUTE ON FUNCTION search_properties_full_text(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION search_properties_by_distance(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO anon;

-- Migration completed successfully
SELECT 'Properties tables created successfully' AS status;