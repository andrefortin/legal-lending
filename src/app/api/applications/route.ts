import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const applicationSchema = z.object({
  amount: z.number().min(1000, "Amount must be at least $1,000"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
  caseNumber: z.string().optional(),
  caseName: z.string().optional(),
  courtName: z.string().optional(),
  jurisdiction: z.string().optional(),
  estimatedDuration: z.string().optional(),
  requestedTerm: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = applicationSchema.parse(body);

    // Generate application number
    const applicationNumber = `APP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;

    // Get user's default bank account
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { lawFirm: { include: { bankAccounts: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const defaultBankAccount = user.lawFirm.bankAccounts.find((ba) => ba.isDefault);

    if (!defaultBankAccount) {
      return NextResponse.json(
        { error: "No default bank account found. Please set up your bank account first." },
        { status: 400 }
      );
    }

    // Create loan application
    const application = await prisma.loanApplication.create({
      data: {
        applicationNumber,
        lawFirmId: user.lawFirmId,
        amount: validatedData.amount,
        purpose: validatedData.purpose,
        caseNumber: validatedData.caseNumber,
        caseName: validatedData.caseName,
        courtName: validatedData.courtName,
        jurisdiction: validatedData.jurisdiction,
        estimatedDuration: validatedData.estimatedDuration,
        requestedTerm: validatedData.requestedTerm,
        notes: validatedData.notes,
        bankAccountId: defaultBankAccount.id,
        status: "PENDING_REVIEW",
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = { lawFirmId: session.user.lawFirmId };
    if (status) {
      where.status = status;
    }

    const applications = await prisma.loanApplication.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: {
        reviewer: { select: { name: true, email: true } },
        bankAccount: { select: { bankName: true, accountNumber: true } },
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
