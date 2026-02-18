import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only lenders can approve/reject
    if (!(session.user as any).role.startsWith("LENDER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const action = formData.get("action") as string;
    const notes = formData.get("notes") as string;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const application = await prisma.loanApplication.findUnique({
      where: { id: params.id },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.status !== "PENDING_REVIEW") {
      return NextResponse.json(
        { error: "Application has already been reviewed" },
        { status: 400 }
      );
    }

    const now = new Date();

    if (action === "approve") {
      // Approve the application
      await prisma.loanApplication.update({
        where: { id: params.id },
        data: {
          status: "APPROVED",
          reviewerId: session.user.id,
          reviewedAt: now,
          approvedAt: now,
          notes,
        },
      });
    } else if (action === "reject") {
      // Reject the application
      await prisma.loanApplication.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          reviewerId: session.user.id,
          reviewedAt: now,
          rejectedAt: now,
          notes,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reviewing application:", error);
    return NextResponse.json(
      { error: "Failed to review application" },
      { status: 500 }
    );
  }
}
