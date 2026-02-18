import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const passwordHash = await bcrypt.hash("password123", 10);

  // Create lender law firm
  const lenderFirm = await prisma.lawFirm.upsert({
    where: { id: "lender-firm-1" },
    update: {},
    create: {
      id: "lender-firm-1",
      name: "Capital Legal Funding",
      firmType: "LENDER",
      email: "info@capitallegal.com",
      phone: "555-0100",
      address: "123 Financial District, New York, NY 10005",
      isLender: true,
    },
  });

  // Create borrower law firm
  const borrowerFirm = await prisma.lawFirm.upsert({
    where: { id: "borrower-firm-1" },
    update: {},
    create: {
      id: "borrower-firm-1",
      name: "Smith & Associates",
      firmType: "BORROWER",
      email: "contact@smithlaw.com",
      phone: "555-0200",
      address: "456 Main Street, Boston, MA 02108",
      isLender: false,
    },
  });

  // Create lender admin user
  const lenderAdmin = await prisma.user.upsert({
    where: { email: "lender@lawfirm.com" },
    update: {},
    create: {
      email: "lender@lawfirm.com",
      name: "John Lender",
      passwordHash,
      role: "LENDER_ADMIN",
      lawFirmId: lenderFirm.id,
    },
  });

  // Create lender reviewer user
  const lenderReviewer = await prisma.user.upsert({
    where: { email: "reviewer@lawfirm.com" },
    update: {},
    create: {
      email: "reviewer@lawfirm.com",
      name: "Jane Reviewer",
      passwordHash,
      role: "LENDER_REVIEWER",
      lawFirmId: lenderFirm.id,
    },
  });

  // Create borrower admin user
  const borrowerAdmin = await prisma.user.upsert({
    where: { email: "borrower@lawfirm.com" },
    update: {},
    create: {
      email: "borrower@lawfirm.com",
      name: "Bob Borrower",
      passwordHash,
      role: "BORROWER_ADMIN",
      lawFirmId: borrowerFirm.id,
    },
  });

  // Create borrower regular user
  const borrowerUser = await prisma.user.upsert({
    where: { email: "user@lawfirm.com" },
    update: {},
    create: {
      email: "user@lawfirm.com",
      name: "Alice User",
      passwordHash,
      role: "BORROWER_USER",
      lawFirmId: borrowerFirm.id,
    },
  });

  // Create bank account for borrower
  const bankAccount = await prisma.bankAccount.upsert({
    where: { id: "bank-account-1" },
    update: {},
    create: {
      id: "bank-account-1",
      lawFirmId: borrowerFirm.id,
      accountName: "Smith & Associates Trust Account",
      accountNumber: "7890",
      routingNumber: "021000021",
      bankName: "Chase Bank",
      accountType: "CHECKING",
      isDefault: true,
      isTrust: true,
    },
  });

  // Create sample loan applications
  const app1 = await prisma.loanApplication.upsert({
    where: { applicationNumber: "APP-2024-001" },
    update: {},
    create: {
      applicationNumber: "APP-2024-001",
      lawFirmId: borrowerFirm.id,
      reviewerId: lenderReviewer.id,
      amount: 50000,
      purpose: "Case expenses and expert witness fees",
      caseNumber: "CV-2024-12345",
      caseName: "Smith v. Johnson Corp.",
      courtName: "Superior Court of Massachusetts",
      jurisdiction: "Massachusetts",
      estimatedDuration: "12 months",
      requestedTerm: "18 months",
      notes: "Case filed, discovery in progress. Funding needed for expert witness testimony.",
      status: "UNDER_REVIEW",
      reviewedAt: new Date(),
      bankAccountId: bankAccount.id,
    },
  });

  const app2 = await prisma.loanApplication.upsert({
    where: { applicationNumber: "APP-2024-002" },
    update: {},
    create: {
      applicationNumber: "APP-2024-002",
      lawFirmId: borrowerFirm.id,
      amount: 75000,
      purpose: "Trial expenses and court fees",
      caseNumber: "CV-2024-23456",
      caseName: "Williams v. City of Boston",
      courtName: "US District Court, District of Massachusetts",
      jurisdiction: "Federal",
      estimatedDuration: "18 months",
      requestedTerm: "24 months",
      notes: "Complex litigation requiring significant trial preparation.",
      status: "PENDING_REVIEW",
      bankAccountId: bankAccount.id,
    },
  });

  const app3 = await prisma.loanApplication.upsert({
    where: { applicationNumber: "APP-2024-003" },
    update: {},
    create: {
      applicationNumber: "APP-2024-003",
      lawFirmId: borrowerFirm.id,
      reviewerId: lenderAdmin.id,
      amount: 35000,
      purpose: "Settlement negotiation expenses",
      caseNumber: "CV-2024-34567",
      caseName: "Davis v. Tech Startup Inc.",
      courtName: "Superior Court of California",
      jurisdiction: "California",
      estimatedDuration: "6 months",
      requestedTerm: "12 months",
      notes: "Case likely to settle soon. Funding for final negotiations.",
      status: "APPROVED",
      reviewedAt: new Date(),
      approvedAt: new Date(),
      bankAccountId: bankAccount.id,
    },
  });

  console.log("Seed data created successfully!");
  console.log("\nDemo credentials:");
  console.log("Lender Admin: lender@lawfirm.com / password123");
  console.log("Lender Reviewer: reviewer@lawfirm.com / password123");
  console.log("Borrower Admin: borrower@lawfirm.com / password123");
  console.log("Borrower User: user@lawfirm.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
