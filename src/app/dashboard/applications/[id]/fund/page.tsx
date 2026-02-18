import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function FundPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const application = await prisma.loanApplication.findUnique({
    where: { id: params.id },
    include: {
      lawFirm: { select: { name: true } },
      bankAccount: { select: { bankName: true, accountNumber: true } },
    },
  });

  if (!application || application.status !== "APPROVED") {
    redirect("/dashboard/review-applications");
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Disburse Funds
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Application {application.applicationNumber}
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex">
              <svg
                className="h-6 w-6 text-yellow-400 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.718V6.5c0-2.051-1.962-3.718-2.502-3.718H5.836c-1.54 0-2.502 1.667-2.502 3.718v9.282c0 2.051 1.962 3.718 2.502 3.718h1.536v3.282H5.836c-1.54 0-2.502-1.667-2.502-3.718V6.5c0-2.051 1.962-3.718 2.502-3.718h10.856z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-yellow-800">
                  Bank Integration Required
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  This page is a placeholder for bank transfer integration. In production,
                  this would connect to Chase Bank API, Plaid, or other banking
                  services to initiate ACH/WIRE transfers to the borrower's trust
                  account.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Transfer Details
            </h3>

            <dl className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <dt className="text-sm font-medium text-gray-500">
                  Recipient
                </dt>
                <dd className="text-sm text-gray-900">
                  {application.lawFirm.name}
                </dd>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <dt className="text-sm font-medium text-gray-500">
                  Amount to Disburse
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  ${application.amount.toLocaleString()}
                </dd>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <dt className="text-sm font-medium text-gray-500">Bank</dt>
                <dd className="text-sm text-gray-900">
                  {application.bankAccount?.bankName || "N/A"}
                </dd>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <dt className="text-sm font-medium text-gray-500">
                  Account Number
                </dt>
                <dd className="text-sm text-gray-900">
                  ****{application.bankAccount?.accountNumber || "N/A"}
                </dd>
              </div>

              <div className="flex justify-between items-center py-3">
                <dt className="text-sm font-medium text-gray-500">
                  Account Type
                </dt>
                <dd className="text-sm text-gray-900">
                  {application.bankAccount?.accountType || "N/A"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Transfer Options
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                className="flex flex-col items-center p-6 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">🏦</div>
                <div className="font-medium text-gray-900">Chase QuickPay</div>
                <div className="text-xs text-gray-500 mt-1">1-2 Business Days</div>
              </button>

              <button
                className="flex flex-col items-center p-6 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">🏧</div>
                <div className="font-medium text-gray-900">ACH Transfer</div>
                <div className="text-xs text-gray-500 mt-1">1-3 Business Days</div>
              </button>

              <button
                className="flex flex-col items-center p-6 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-medium text-gray-900">Wire Transfer</div>
                <div className="text-xs text-gray-500 mt-1">Same Day</div>
              </button>

              <button
                className="flex flex-col items-center p-6 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">🔗</div>
                <div className="font-medium text-gray-900">Plaid Integration</div>
                <div className="text-xs text-gray-500 mt-1">Automated</div>
              </button>
            </div>
          </div>

          <form
            action={`/api/applications/${params.id}/fund`}
            method="POST"
            className="bg-white shadow rounded-lg p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Process Transfer
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="transferMethod"
                  className="block text-sm font-medium text-gray-700"
                >
                  Transfer Method
                </label>
                <select
                  id="transferMethod"
                  name="transferMethod"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select method...</option>
                  <option value="chase">Chase QuickPay</option>
                  <option value="ach">ACH Transfer</option>
                  <option value="wire">Wire Transfer</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Transfer Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Reference number or memo..."
                />
              </div>

              <div className="flex items-start">
                <input
                  id="confirm"
                  name="confirm"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="confirm"
                  className="ml-2 block text-sm text-gray-900"
                >
                  I confirm that I have reviewed the account details and
                  authorize this transfer of ${application.amount.toLocaleString()}
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Initiate Transfer
              </button>
            </div>
          </form>

          <div className="flex">
            <a
              href={`/dashboard/applications/${params.id}`}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to Application
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FundPage;
