import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import jsPDF from "jspdf";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const application = await prisma.loanApplication.findUnique({
      where: { id },
      include: {
        lawFirm: true,
        bankAccount: true,
        reviewer: { select: { name: true } },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Application must be approved to generate agreement" },
        { status: 400 }
      );
    }

    // Generate PDF loan agreement
    const doc = new jsPDF();

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("LOAN AGREEMENT", margin, margin);
    doc.text(`#${application.applicationNumber}`, pageWidth - margin, margin, {
      align: "right",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth - margin,
      margin + 10,
      { align: "right" }
    );

    doc.line(margin, margin + 20, pageWidth - margin, margin + 20);

    // Lender Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LENDER", margin, margin + 30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Capital Legal Funding", margin, margin + 40);
    doc.text("123 Financial District", margin, margin + 47);
    doc.text("New York, NY 10005", margin, margin + 54);

    // Borrower Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BORROWER", margin, margin + 70);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(application.lawFirm.name, margin, margin + 80);
    doc.text(application.lawFirm.email || "", margin, margin + 87);
    doc.text(application.lawFirm.address || "", margin, margin + 94);

    // Loan Details Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LOAN DETAILS", margin, margin + 110);
    doc.line(margin, margin + 118, pageWidth - margin, margin + 118);

    const loanDetails = [
      ["Principal Amount", `$${application.amount.toLocaleString()}`],
      ["Interest Rate", "7.5% per annum"],
      ["Term", application.requestedTerm || "12 months"],
      ["Purpose", application.purpose],
    ];

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    let yPosition = margin + 125;
    loanDetails.forEach(([label, value]) => {
      doc.text(label, margin, yPosition);
      doc.text(value, margin + 100, yPosition);
      yPosition += 10;
    });

    // Case Information
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CASE INFORMATION", margin, yPosition);
    doc.line(margin, yPosition + 8, pageWidth - margin, yPosition + 8);

    const caseDetails = [
      ["Case Number", application.caseNumber || "N/A"],
      ["Case Name", application.caseName || "N/A"],
      ["Court", application.courtName || "N/A"],
      ["Jurisdiction", application.jurisdiction || "N/A"],
    ];

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    yPosition += 15;
    caseDetails.forEach(([label, value]) => {
      doc.text(label, margin, yPosition);
      doc.text(value, margin + 100, yPosition);
      yPosition += 10;
    });

    // Disbursement
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DISBURSEMENT", margin, yPosition);
    doc.line(margin, yPosition + 8, pageWidth - margin, yPosition + 8);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    yPosition += 15;
    doc.text("Funds will be disbursed to:", margin, yPosition);

    yPosition += 10;
    doc.text(
      `Bank: ${application.bankAccount?.bankName || "N/A"}`,
      margin + 5,
      yPosition
    );
    doc.text(
      `Account Type: ${application.bankAccount?.accountType || "N/A"}${
        application.bankAccount?.isTrust ? " (Trust Account)" : ""
      }`,
      margin + 5,
      yPosition + 7
    );
    doc.text(
      `Account Ending: ****${application.bankAccount?.accountNumber || "N/A"}`,
      margin + 5,
      yPosition + 14
    );

    // Terms
    yPosition += 25;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TERMS AND CONDITIONS", margin, yPosition);
    doc.line(margin, yPosition + 8, pageWidth - margin, yPosition + 8);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    yPosition += 15;
    const terms = [
      "1. Borrower agrees to repay the principal amount plus accrued interest at rate of 7.5% per annum.",
      "2. Repayment shall be made according to schedule mutually agreed upon by both parties.",
      "3. Borrower warrants that the loan will be used exclusively for case-related expenses.",
      "4. Lender may require proof of proper use of funds upon reasonable request.",
      "5. This agreement is governed by laws of jurisdiction specified in the application.",
      "6. Borrower agrees to sign all necessary documents to disburse funds.",
      "7. Any default in payment may result in additional fees and legal action.",
    ];

    terms.forEach((term) => {
      const lines = doc.splitTextToSize(term, pageWidth - 2 * margin, 10);
      (lines as string[]).forEach((line: string) => {
        doc.text(line, margin, yPosition);
        yPosition +=5;
      });
      yPosition += 5;
    });

    // Signature Section
    yPosition += 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("SIGNATURES", margin, yPosition);
    doc.line(margin, yPosition + 8, pageWidth - margin, yPosition + 8);

    yPosition += 20;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    // Lender Signature
    doc.text("Lender Signature:", margin, yPosition);
    doc.line(margin, yPosition + 15, margin + 80, yPosition + 15);
    doc.text("Capital Legal Funding", margin, yPosition + 25);
    doc.text("Date: _________________", margin, yPosition + 32);

    // Borrower Signature
    doc.text("Borrower Signature:", pageWidth / 2, yPosition);
    doc.line(pageWidth / 2, yPosition + 15, pageWidth - margin, yPosition + 15);
    doc.text(application.lawFirm.name, pageWidth / 2, yPosition + 25);
    doc.text("Date: _________________", pageWidth / 2, yPosition + 32);

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This is a digitally generated document for prototype purposes only.",
      margin,
      pageHeight - 15
    );

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="loan-agreement-${application.applicationNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}
