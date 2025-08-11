# Global Investment Clock

A production-ready Next.js application that visualizes each country's current position within the Merrill Lynch Investment Clock framework, providing real-time economic positioning across global markets.

## Features

- **Interactive Investment Clock**: Four-quadrant visualization showing Recovery, Overheat, Stagflation, and Recession phases
- **Real-time Economic Indicators**: Latest PMI, CPI, Core PCE, and GDPNow data with historical sparklines
- **Country Positioning**: Visual representation of countries on the investment clock with flag icons
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Live Data Updates**: Automatic data refresh every 5 minutes with SWR
- **Type-safe**: Built with TypeScript and Zod for runtime validation

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: Supabase PostgreSQL
- **Data Fetching**: SWR for real-time updates
- **Charts**: Recharts with D3 scales
- **UI Components**: Headless UI, Heroicons
- **Validation**: Zod schemas
- **Deployment**: Optimized for Vercel Edge

## Setup Instructions

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script from `database-setup.sql` in your Supabase SQL Editor
3. Get your project URL and anon key from the Supabase dashboard

### 2. Environment Configuration

1. Copy `env.example` to `.env.local`:

   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Management

The application uses three main database tables:

- **economic_indicators**: Current economic indicator values
- **historical_indicators**: Historical data for sparkline charts
- **investment_clock_positions**: Country positions on the investment clock

### Adding New Countries

1. Insert economic indicators for the new country in the database
2. Add the country to the `COUNTRIES` array in `src/types/index.ts`
3. Ensure flag emoji mapping exists in `src/components/country-selector.tsx`

### Updating Data

Currently, data is updated manually through the Supabase dashboard. You can:

1. Use the Supabase dashboard to update indicator values
2. Insert new historical data points for sparklines
3. Update investment clock positions

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your domain)
3. Deploy automatically on push to main branch

### Other Platforms

The application is optimized for Edge Runtime and should work on any platform supporting Next.js 14.

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
└── types/               # TypeScript types and Zod schemas

public/                  # Static assets
database-setup.sql       # Database schema
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

- Check the GitHub Issues
- Review the database setup instructions
- Ensure environment variables are configured correctly
