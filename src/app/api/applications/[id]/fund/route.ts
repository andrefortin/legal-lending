import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only lenders can fund
    if (!(session.user as any).role?.startsWith("LENDER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const formData = await request.formData();
    const transferMethod = formData.get("transferMethod") as string;
    const notes = formData.get("notes") as string;
    const confirm = formData.get("confirm");

    if (!transferMethod) {
      return NextResponse.json(
        { error: "Transfer method is required" },
        { status: 400 }
      );
    }

    if (!confirm) {
      return NextResponse.json(
        { error: "Confirmation is required" },
        { status: 400 }
      );
    }

    const application = await prisma.loanApplication.findUnique({
      where: { id },
      include: { lawFirm: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Application must be approved before funding" },
        { status: 400 }
      );
    }

    // In production, this would initiate actual bank transfer
    // For now, we'll create a placeholder transaction and mark as funded

    const transactionNumber = `TXN-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

    await prisma.$transaction(async (tx) => {
      // Create a placeholder transaction
      await tx.transaction.create({
        data: {
          transactionNumber,
          loanId: id, // Will be connected when loan is created
          type: "DISBURSEMENT",
          amount: application.amount,
          status: "COMPLETED", // Simulated completion
          description: `Funding for application ${application.applicationNumber} via ${transferMethod}`,
          provider: transferMethod.toUpperCase(),
          completedAt: new Date(),
        },
      });

      // Update application status
      await tx.loanApplication.update({
        where: { id },
        data: {
          status: "FUNDED",
          fundedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ success: true, transactionNumber });
  } catch (error) {
    console.error("Error funding application:", error);
    return NextResponse.json(
      { error: "Failed to fund application" },
      { status: 500 }
    );
  }
}
