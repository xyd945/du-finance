# Global Investment Clock - Setup Guide

Follow these steps to get your Global Investment Clock application up and running.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- Git (for version control)

## Step 1: Clone and Install

```bash
# Navigate to your project directory
cd du-finance

# Install dependencies
npm install
```

## Step 2: Database Setup

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be initialized (usually 1-2 minutes)

### 2.2 Run Database Schema

1. Open your Supabase project dashboard
2. Go to the **SQL Editor** (left sidebar)
3. Copy the entire content from `database-setup.sql`
4. Paste it into the SQL Editor and click **Run**
5. Verify that the tables were created successfully

### 2.3 Get API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the **Project URL** and **Anon public** key

## Step 3: Environment Configuration

### 3.1 Create Environment File

```bash
# Copy the example environment file
cp env.example .env.local
```

### 3.2 Update Environment Variables

Edit `.env.local` with your Supabase credentials:

```env
# Replace with your actual Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Replace with your actual Supabase anon key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# For local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Verify Data

After running the database setup, you should have:

- Sample data for the USA in all three tables
- 12 months of historical data for sparklines
- One investment clock position

## Step 5: Run the Application

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Step 6: Add More Countries (Optional)

To add additional countries:

1. **Add economic indicators:**

   ```sql
   INSERT INTO economic_indicators (country_code, country_name, indicator_type, value, previous_value, date)
   VALUES
       ('GBR', 'United Kingdom', 'pmi_composite', 51.5, 50.8, CURRENT_DATE),
       ('GBR', 'United Kingdom', 'pmi_manufacturing', 49.8, 48.9, CURRENT_DATE),
       -- Add more indicators...
   ```

2. **Add investment clock position:**

   ```sql
   INSERT INTO investment_clock_positions (country_code, country_name, growth_trend, inflation_trend, quadrant, date)
   VALUES ('GBR', 'United Kingdom', 8.2, -5.1, 'recovery', CURRENT_DATE);
   ```

3. **Add to the countries list** (optional for manual control):
   Edit `src/types/index.ts` and add the country to the `COUNTRIES` array:
   ```typescript
   {
     code: 'GBR',
     name: 'United Kingdom',
     flag: 'GB',
     enabled: true,
   },
   ```

## Step 7: Production Deployment

### Vercel (Recommended)

1. **Connect to Vercel:**

   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel

   # Or deploy via GitHub integration
   ```

2. **Set Environment Variables:**
   In your Vercel dashboard, add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your domain)

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Other Platforms

The application works on any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- Render

## Troubleshooting

### Common Issues

1. **Build fails with Supabase errors:**
   - Ensure environment variables are set correctly
   - Check that your Supabase project is active

2. **No data showing:**
   - Verify the database setup was completed
   - Check browser console for API errors
   - Ensure Row Level Security policies are applied

3. **TypeScript errors:**

   ```bash
   npm run type-check
   ```

4. **Linting errors:**
   ```bash
   npm run lint:fix
   ```

### Getting Help

- Check the browser console for error messages
- Verify your Supabase dashboard for data
- Ensure your .env.local file is not committed to git
- Test API connections in the Supabase dashboard

## Data Management

### Updating Economic Data

1. **Via Supabase Dashboard:**
   - Go to Table Editor
   - Update values in `economic_indicators` table
   - The app will refresh automatically every 5 minutes

2. **Via SQL:**
   ```sql
   UPDATE economic_indicators
   SET value = 52.3, previous_value = value, updated_at = NOW()
   WHERE country_code = 'USA' AND indicator_type = 'pmi_composite';
   ```

### Historical Data for Sparklines

Add historical data points for better visualization:

```sql
INSERT INTO historical_indicators (country_code, indicator_type, value, date)
VALUES ('USA', 'pmi_composite', 51.8, '2024-01-01');
```

## Security Notes

- The application uses Supabase's Row Level Security
- Only public read access is enabled by default
- Environment variables are safe to expose (anon key is public)
- No sensitive data is stored in the frontend

## Next Steps

1. Set up automated data feeds (external APIs)
2. Add more countries and indicators
3. Implement user authentication for admin features
4. Add data export capabilities
5. Create mobile app version

## Support

For issues or questions:

- Check the main README.md
- Review Supabase documentation
- Check Next.js documentation for deployment issues
