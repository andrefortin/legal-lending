import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const application = await prisma.loanApplication.findUnique({
    where: { id: params.id },
    include: {
      lawFirm: {
        select: {
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
      reviewer: { select: { name: true, email: true } },
      bankAccount: {
        select: {
          bankName: true,
          accountNumber: true,
          accountType: true,
          isTrust: true,
        },
      },
    },
  });

  if (!application) {
    notFound();
  }

  // Borrowers can only view their own applications
  if (
    !session.user.role.startsWith("LENDER") &&
    application.lawFirmId !== session.user.lawFirmId
  ) {
    redirect("/dashboard");
  }

  const isLender = session.user.role.startsWith("LENDER");
  const isOwner = application.lawFirmId === session.user.lawFirmId;

  const statusColors: Record<string, string> = {
    PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
    UNDER_REVIEW: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    FUNDING_IN_PROGRESS: "bg-purple-100 text-purple-800",
    FUNDED: "bg-green-100 text-green-800",
    REPAID: "bg-gray-100 text-gray-800",
    DEFAULTED: "bg-red-100 text-red-800",
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Application {application.applicationNumber}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Submitted{" "}
              {new Date(application.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              statusColors[application.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {application.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Case Information
              </h3>

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Case Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.caseNumber || "N/A"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Case Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.caseName || "N/A"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Court</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.courtName || "N/A"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Jurisdiction</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.jurisdiction || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Loan Details
              </h3>

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Requested Amount
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    ${application.amount.toLocaleString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Estimated Duration
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.estimatedDuration || "N/A"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Requested Term
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.requestedTerm || "N/A"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Interest Rate
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">7.5%</dd>
                </div>
              </dl>

              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.purpose}
                </dd>
              </div>

              {application.notes && (
                <div className="mt-4">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.notes}
                  </dd>
                </div>
              )}
            </div>

            {application.reviewer && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Review Status
                </h3>

                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Reviewed By
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.reviewer.name} ({application.reviewer.email})
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Review Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.reviewedAt &&
                        new Date(application.reviewedAt).toLocaleDateString()}
                    </dd>
                  </div>

                  {application.approvedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Approved Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(application.approvedAt).toLocaleDateString()}
                      </dd>
                    </div>
                  )}

                  {application.rejectedAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Rejected Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(application.rejectedAt).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Law Firm Information
              </h3>

              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Firm Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.lawFirm.name}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.lawFirm.email}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.lawFirm.phone || "N/A"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.lawFirm.address || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Disbursement Account
              </h3>

              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bank</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.bankAccount?.bankName || "N/A"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Account Type
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.bankAccount?.accountType || "N/A"}
                    {application.bankAccount?.isTrust && (
                      <span className="ml-2 text-xs text-green-600 font-medium">
                        (Trust Account)
                      </span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Account Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ****{application.bankAccount?.accountNumber || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>

            {isLender &&
              application.status === "PENDING_REVIEW" && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Review Application
                  </h3>

                  <form
                    action={`/api/applications/${application.id}/approve`}
                    method="POST"
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Review Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Any notes about this review decision..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="submit"
                        name="action"
                        value="approve"
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Approve Application
                      </button>

                      <button
                        type="submit"
                        name="action"
                        value="reject"
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Reject Application
                      </button>
                    </div>
                  </form>
                </div>
              )}

            {isLender && application.status === "APPROVED" && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Next Steps
                </h3>

                <div className="space-y-3">
                  <a
                    href={`/dashboard/applications/${application.id}/signature`}
                    className="block w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center"
                  >
                    Request Signatures
                  </a>

                  <a
                    href={`/dashboard/applications/${application.id}/fund`}
                    className="block w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-center"
                  >
                    Disburse Funds
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetailPage;
