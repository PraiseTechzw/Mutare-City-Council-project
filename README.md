# Mutare City Council - Water Bill Payment Portal

An online payment portal for Mutare City Council that allows customers to pay water bills and cashiers to manage bills and payments through a secure administrative portal.

## Features

### Customer Portal
- **User Registration**: Customers can create accounts with automatic account number generation
- **View Bills**: Access all water bills with detailed consumption history
- **Make Payments**: Pay bills using multiple payment methods (Mobile Money, Card, Bank Transfer, Cash)
- **Payment History**: View recent payment transactions
- **Account Dashboard**: Overview of outstanding balances and account information

### Cashier Portal
- **Separate Authentication**: Secure login with role-based access control
- **Bill Management**: Create and manage water bills for customers
- **Customer Management**: View all customer accounts and details
- **Payment Processing**: View and track all payment transactions
- **Dashboard Analytics**: Revenue tracking, outstanding balances, and statistics

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- A Supabase account and project
- Git (optional)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd code
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Set Up Supabase

1. Create a new project at [Supabase](https://app.supabase.com)
2. Go to Project Settings > API to get your credentials
3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

Run the SQL scripts in order from the `scripts/` directory in your Supabase SQL Editor:

1. **01-create-profiles-table.sql** - Creates the profiles table and user management functions
2. **02-create-water-bills-table.sql** - Creates the water bills table with RLS policies
3. **03-create-payments-table.sql** - Creates the payments table and triggers
4. **04-seed-sample-data.sql** - Sets up account number generation (optional sample data)
5. **05-fix-user-signup-error.sql** - Fixes database errors when saving new users (run this if you encounter signup errors)
6. **06-fix-payment-trigger.sql** - Improves payment trigger to correctly calculate bill status (recommended)
7. **07-auto-update-overdue-bills.sql** - Automatically marks bills as overdue when due date passes (recommended)

**Important Notes:**
- If you're experiencing "Database error saving new user", run script **05-fix-user-signup-error.sql** to fix RLS policies and account number generation race conditions.
- Run script **06-fix-payment-trigger.sql** to ensure payments properly update bill status and balances. This is recommended for proper payment processing.
- Run script **07-auto-update-overdue-bills.sql** to automatically mark bills as overdue. This ensures accurate bill status tracking.

### 5. Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Creating Test Accounts

### Customer Account

1. Navigate to `/signup`
2. Fill in the registration form with:
   - Full Name
   - Email
   - Phone Number
   - Address
   - Password (minimum 6 characters)
3. The system will automatically:
   - Create your account
   - Generate an account number (format: MCC-YYYY-XXX)
   - Set your role as "customer"

### Cashier Account

1. First, create a regular account through `/signup`
2. Go to your Supabase dashboard > Table Editor > `profiles`
3. Find your user record and update the `role` field from `customer` to `cashier`
4. Alternatively, run this SQL in Supabase:

```sql
UPDATE profiles 
SET role = 'cashier' 
WHERE email = 'your-email@example.com';
```

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── customer/          # Customer dashboard
│   ├── cashier/           # Cashier dashboard
│   ├── login/             # Login pages (customer & cashier)
│   └── signup/            # Customer registration
├── components/            # React components
│   ├── auth/             # Authentication forms
│   ├── customer/         # Customer-specific components
│   ├── cashier/          # Cashier-specific components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
│   └── supabase/         # Supabase client configuration
├── scripts/              # Database SQL scripts
└── public/               # Static assets
```

## Database Schema

### Profiles Table
- User information and role management
- Auto-generated account numbers for customers

### Water Bills Table
- Customer billing information
- Consumption tracking
- Payment status

### Payments Table
- Payment transactions
- Multiple payment methods
- Automatic bill status updates via triggers

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Role-Based Access**: Separate customer and cashier portals
- **Route Protection**: Middleware-based authentication
- **Secure Sessions**: Supabase Auth session management

## Payment Methods

The system supports multiple payment methods:
- Mobile Money
- Debit/Credit Card
- Bank Transfer
- Cash (Pay at Office)

*Note: In production, integrate with actual payment gateways for real transactions.*

## Development

### Build for Production

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | Redirect URL after email confirmation (optional) |

## Support

For issues or questions:
- Email: support@mutare.co.zw
- Create an issue in the repository

## License

This project is created for Mutare City Council.

## Contributing

This is a private project. For changes or improvements, please contact the development team.

---

**Mutare City Council** - Water Services Department

