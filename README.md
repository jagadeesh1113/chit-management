# ManageChit

A modern, mobile-friendly web application for managing chit funds. Track members, monthly auctions, payments, and generate reports — all in one place.

Built with **Next.js 16**, **Supabase**, and **shadcn/ui**.

---

## Features

### Chit Management
- Create and manage multiple chit funds
- Track chit amount, duration, number of members, and monthly charges
- Edit or delete chits at any time

### Member Management
- Add members to each chit with name and mobile number
- Track per-member payment history, total received, and pending amounts
- Mark a member as the chit owner

### Monthly Auctions
- Record monthly auction details — auction date, auction amount, and winner
- Automatically calculates per-person payable amount and dividend
- Track payments received per month with a running total

### Payment Tracking
- Mark individual member payments as paid, partially paid, or unpaid
- View full payment history per member per month
- Send WhatsApp payment reminders directly from the app with pre-filled message
- Mark payments as unpaid if recorded by mistake

### Reports
- Visual summary charts per chit (powered by Recharts)

### General
- Responsive design — works on mobile and desktop
- Dark mode support
- PWA-ready (installable on mobile)
- Authentication via Supabase (sign up, login, forgot password, update password)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Database & Auth | [Supabase](https://supabase.com) |
| UI Components | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Charts | [Recharts](https://recharts.org) |
| Icons | [Lucide React](https://lucide.dev) |
| Notifications | [Sonner](https://sonner.emilkowal.ski) |
| Drawer | [Vaul](https://vaul.emilkowal.ski) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/manage-chit.git
cd manage-chit
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-or-publishable-key
```

You can find these in your [Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
manage-chit/
├── app/
│   ├── auth/               # Auth pages (login, sign-up, forgot password, etc.)
│   ├── chit/[id]/          # Individual chit detail page
│   ├── api/                # API route handlers
│   ├── layout.tsx          # Root layout with theme & PWA providers
│   └── page.tsx            # Home page (chit list)
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── ChitTable.tsx       # Chit list table (desktop + mobile)
│   ├── ChitDetails.tsx     # Chit detail view with tabs
│   ├── ChitMembers.tsx     # Members tab
│   ├── ChitMonths.tsx      # Monthly auctions tab
│   ├── ChitPaymentsTable.tsx  # Per-month payment tracking
│   └── ...
├── context/                # React context providers (auth, chit, members, months)
├── hooks/                  # Custom data-fetching hooks
├── lib/                    # Utility functions
├── types/                  # TypeScript types
└── public/                 # Static assets & PWA icons
```

---

## Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
npm run generate-icons # Generate PWA icons
```

---

## Deployment

The app can be deployed to [Vercel](https://vercel.com) with zero configuration:

1. Push to GitHub
2. Import the repo in Vercel
3. Set the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
4. Deploy

---

## Supabase Email Templates

Custom branded email templates are configured in the Supabase dashboard under **Authentication → Emails**. The app uses:

- **Confirm signup** — sent when a new user registers (currently disabled)
- **Reset password** — sent when a user requests a password reset

Both templates are styled to match the ManageChit brand.

---

## License

MIT
