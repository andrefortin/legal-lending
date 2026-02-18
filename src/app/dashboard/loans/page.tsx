import Link from "next/link";

async function LoansPage() {
  // Placeholder - in production, this would fetch from database
  const loans = [];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Active Loans</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage funded loans and track repayments
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
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
                Pending Implementation
              </h3>
              <p className="mt-2 text-sm text-yellow-700">
                This page will show all active loans across all borrowers. Loans will
                appear here once applications are approved, signed, and funded.
              </p>
            </div>
          </div>
        </div>

        {loans.length === 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-md">
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Active Loans
              </h3>
              <p className="text-sm mb-6">
                Funded loans will appear here once applications are approved and funded.
              </p>
              <Link
                href="/dashboard/review-applications"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Review Applications
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loan #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {loan.loanNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loan.borrower}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{loan.caseName}</div>
                      <div className="text-xs text-gray-500">{loan.caseNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${loan.principal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {loan.nextPayment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/loans/${loan.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoansPage;
