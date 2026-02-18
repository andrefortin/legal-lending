# Legal Lending Platform

A working prototype for law office private lending. Law offices can apply for funding at 7.5% interest to cover case expenses.

## 🚀 Quick Start

```bash
cd ~/batcave/legal-lending
npm install
npm run dev
```

Server runs at: http://localhost:3000

## 👥 Demo Accounts

### Borrower (Law Firm Seeking Funds)
- **Email:** borrower@lawfirm.com
- **Password:** password123
- **Firm:** Smith & Associates

### Lender (Funding Provider)
- **Email:** lender@lawfirm.com
- **Password:** password123
- **Firm:** Capital Legal Funding

### Reviewer (Lender Staff)
- **Email:** reviewer@lawfirm.com
- **Password:** password123

## 📋 Application Flow

### 1. Borrower Applies
1. Login as borrower@lawfirm.com
2. Go to **Dashboard → New Loan Application**
3. Fill out:
   - Case information (number, name, court, jurisdiction)
   - Loan details (amount, purpose, duration, term)
   - Additional notes
4. Submit application

### 2. Lender Reviews
1. Login as lender@lawfirm.com
2. Go to **Dashboard → Review Applications**
3. View pending applications
4. Review application details
5. Approve or Reject (with notes)

### 3. Digital Signatures
1. After approval, lender can request signatures
2. Go to **Application → Signatures**
3. See placeholder for:
   - DocuSign
   - HelloSign
   - PandaDoc

### 4. Fund Transfer
1. After signatures, lender initiates transfer
2. Go to **Application → Disburse Funds**
3. See transfer options:
   - Chase QuickPay
   - ACH Transfer
   - Wire Transfer
   - Plaid Integration

## 🗄️ Database

Uses SQLite with Prisma ORM. Schema includes:
- Users (multi-role: LENDER_ADMIN, LENDER_REVIEWER, BORROWER_ADMIN, BORROWER_USER)
- Law Firms (lender and borrower)
- Loan Applications (full lifecycle tracking)
- Loans (funded applications)
- Documents (agreements, attachments)
- Signatures (placeholder tracking)
- Transactions (disbursements, repayments)
- Repayment Schedules
- Bank Accounts (including IOLTA trust accounts)

### Seed Data
Run seed to populate demo data:
```bash
npm run db:seed
```

## 🔧 Tech Stack

- **Frontend:** Next.js 15.5.12 (App Router)
- **Styling:** Tailwind CSS
- **Auth:** NextAuth v5 (beta) with Credentials
- **Database:** SQLite + Prisma ORM
- **Validation:** Zod
- **Forms:** React Hook Form (ready to add)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/      # NextAuth API routes
│   │   ├── applications/             # Loan application API
│   │   │   ├── [id]/            # Application details/approve/fund
│   │   │   └── route.ts         # List/create applications
│   │   └── me/                   # Current user API
│   ├── dashboard/
│   │   ├── layout.tsx             # Dashboard shell
│   │   ├── page.tsx               # Role-based dashboard
│   │   ├── apply/                 # New loan application
│   │   ├── my-applications/       # Borrower's applications
│   │   ├── my-loans/             # Borrower's funded loans
│   │   ├── review-applications/   # Lender's review queue
│   │   ├── applications/[id]/      # Application detail
│   │   │   ├── page.tsx
│   │   │   ├── signature/page.tsx  # Signature placeholder
│   │   │   └── fund/page.tsx       # Fund transfer placeholder
│   │   └── loans/               # Lender's loan portfolio
│   ├── login/page.tsx             # Login form
│   └── layout.tsx                # Root layout
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   └── prisma.ts                  # Prisma client
├── types/
│   └── next-auth.d.ts            # Type definitions
└── prisma/
    ├── schema.prisma               # Database schema
    └── seed.ts                   # Demo data
```

## 🔐 Security Considerations

### Lawyer-Specific Issues

1. **Trust Accounts (IOLTA)**
   - Lawyers must use IOLTA (Interest on Lawyer Trust Accounts)
   - Funds for client matters must be segregated
   - Database tracks `isTrust` flag on bank accounts

2. **Jurisdictional Rules**
   - Some states/provinces prohibit lawyer-to-lawyer lending
   - Placeholder for compliance checks

3. **Audit Trails**
   - Every application, approval, and disbursement tracked
   - User actions logged with timestamps

### For Production

1. **Database Migration**
   - SQLite → PostgreSQL for production
   - Update `DATABASE_URL` in `.env`

2. **Real Integrations**
   - Replace signature placeholders with actual DocuSign/HelloSign API
   - Replace transfer placeholders with Chase/Plaid API
   - Add proper webhook handling

3. **Environment Variables**
   ```env
   NEXTAUTH_SECRET=<random-32-char-string>
   NEXTAUTH_URL=<production-url>
   DATABASE_URL=<postgresql://connection-string>
   DOCUSIGN_API_KEY=<your-key>
   CHASE_API_KEY=<your-key>
   PLAID_CLIENT_ID=<your-client-id>
   PLAID_SECRET=<your-secret>
   ```

## 🧪 Pending Features

- Loan repayment scheduling and tracking
- Payment processing
- Interest calculation and statements
- Document generation (loan agreements as PDF)
- Email notifications
- Compliance reporting

## 📄 License

MIT - This is a prototype for demonstration purposes.
