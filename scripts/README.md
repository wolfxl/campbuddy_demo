# Location Data Seeding

This directory contains scripts to seed location data into the Supabase database.

## Running the seed-location.js script

To run the script and seed the iCode McKinney location with proper coordinates:

1. Make sure your Supabase environment variables are set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Run the script with Node.js:

```bash
# From the project root directory
node -r dotenv/config scripts/seed-location.js
```

This will:
1. Check if the location "iCode mckinney" already exists in your database
2. If it exists, update its coordinates
3. If it doesn't exist, create a new entry with the proper coordinates

## Coordinates

The coordinates used for iCode McKinney are:
- Latitude: 33.1983
- Longitude: -96.6389

These are the actual coordinates for the iCode McKinney location at 3001 S Hardin Blvd, McKinney, TX 75070.
