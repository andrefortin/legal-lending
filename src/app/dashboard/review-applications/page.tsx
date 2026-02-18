import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

async function ReviewApplicationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Only lenders can review applications
  if (!session.user.role.startsWith("LENDER")) {
    redirect("/dashboard");
  }

  const applications = await prisma.loanApplication.findMany({
    where: {
      status: { in: ["PENDING_REVIEW", "UNDER_REVIEW", "APPROVED"] },
    },
    orderBy: { submittedAt: "desc" },
    include: {
      lawFirm: { select: { name: true, email: true, phone: true } },
      reviewer: { select: { name: true, email: true } },
      bankAccount: { select: { bankName: true, accountNumber: true } },
    },
  });

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Review Loan Applications
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and act on pending loan applications
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-md">
          {applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pending applications to review.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Law Firm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {app.applicationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.lawFirm.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{app.caseName || "N/A"}</div>
                      <div className="text-xs text-gray-500">{app.purpose}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${app.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[app.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href={`/dashboard/review-applications/${app.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Review
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewApplicationsPage;
