# Full Stack AI Finance Platform with Next.js, Supabase, Tailwind, Prisma, Inngest, ArcJet, Shadcn UI Tutorial 🔥🔥


<img width="1470" alt="Screenshot 2024-12-10 at 9 45 45 AM" src="https://github.com/user-attachments/assets/1bc50b85-b421-4122-8ba4-ae68b2b61432">

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up your environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

---

## 📁 Project Structure

```
actions/         # Server actions (account, budget, etc.)
app/             # Next.js app directory (routes, layouts, API)
components/      # UI components
data/            # Static data
emails/          # Email templates
hooks/           # Custom React hooks
lib/             # Utilities, Prisma client
prisma/          # Prisma schema & migrations
public/          # Static assets
```

---

## 🛠️ Tech Stack

- Next.js
- Supabase
- Tailwind CSS
- Prisma
- Inngest
- ArcJet
- Shadcn UI

---

## 📝 Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=

RESEND_API_KEY=

ARCJET_KEY=
```
