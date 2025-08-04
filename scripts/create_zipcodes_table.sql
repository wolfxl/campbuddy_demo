-- SQL script to create the zipcodes table and add common zipcodes

-- Create the zipcodes table
CREATE TABLE IF NOT EXISTS public.zipcodes (
    id SERIAL PRIMARY KEY,
    zipcode VARCHAR(10) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(2),
    county VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT zipcode_unique UNIQUE (zipcode)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS zipcode_index ON public.zipcodes (zipcode);

-- Insert common North Texas zipcodes
INSERT INTO public.zipcodes (zipcode, latitude, longitude, city, state, county)
VALUES
    -- Frisco
    ('75034', 33.1360792, -96.8368919, 'Frisco', 'TX', 'Collin'),
    ('75035', 33.1546883, -96.7969912, 'Frisco', 'TX', 'Collin'),
    ('75036', 33.1498776, -96.8238258, 'Frisco', 'TX', 'Collin'),
    -- Plano
    ('75023', 33.0684893, -96.7310709, 'Plano', 'TX', 'Collin'),
    ('75024', 33.0856459, -96.8027802, 'Plano', 'TX', 'Collin'),
    ('75025', 33.0684893, -96.7310709, 'Plano', 'TX', 'Collin'),
    ('75074', 33.0198431, -96.6988856, 'Plano', 'TX', 'Collin'),
    ('75075', 33.0198431, -96.6988856, 'Plano', 'TX', 'Collin'),
    ('75093', 33.0338283, -96.8411487, 'Plano', 'TX', 'Collin'),
    -- McKinney
    ('75069', 33.1972627, -96.6154291, 'McKinney', 'TX', 'Collin'),
    ('75070', 33.1982959, -96.6389645, 'McKinney', 'TX', 'Collin'),
    ('75071', 33.1982959, -96.6389645, 'McKinney', 'TX', 'Collin'),
    -- Allen
    ('75002', 33.0984193, -96.6177634, 'Allen', 'TX', 'Collin'),
    ('75013', 33.0984193, -96.6177634, 'Allen', 'TX', 'Collin'),
    -- Prosper
    ('75078', 33.2389908, -96.8899636, 'Prosper', 'TX', 'Collin'),
    -- Coppell
    ('75019', 32.9545364, -97.0156527, 'Coppell', 'TX', 'Dallas'),
    -- Irving
    ('75038', 32.8813958, -96.9680278, 'Irving', 'TX', 'Dallas'),
    ('75039', 32.8813958, -96.9680278, 'Irving', 'TX', 'Dallas'),
    ('75062', 32.8369645, -96.9480274, 'Irving', 'TX', 'Dallas'),
    ('75063', 32.9156452, -96.9940287, 'Irving', 'TX', 'Dallas')
ON CONFLICT (zipcode) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    county = EXCLUDED.county,
    updated_at = NOW();

-- Instructions:
-- 1. Open your Supabase project
-- 2. Go to the SQL Editor
-- 3. Paste this script and run it
-- 4. The zipcodes table will be created and populated with common North Texas zipcodes
