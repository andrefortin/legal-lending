import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function SignaturePage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const application = await prisma.loanApplication.findUnique({
    where: { id: params.id },
    include: {
      loan: true,
      lawFirm: { select: { name: true } },
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
            Digital Signatures
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
                  Integration Required
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  This page is a placeholder for the digital signature integration.
                  In production, this would connect to DocuSign, HelloSign, or PandaDoc
                  to collect legally binding signatures from all parties.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Signature Status
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div>
                  <div className="font-medium text-gray-900">
                    {application.lawFirm.name} (Borrower)
                  </div>
                  <div className="text-sm text-gray-500">
                    Loan Agreement Signature
                  </div>
                </div>
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  PENDING
                </span>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div>
                  <div className="font-medium text-gray-900">
                    Capital Legal Funding (Lender)
                  </div>
                  <div className="text-sm text-gray-500">
                    Loan Agreement Signature
                  </div>
                </div>
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  PENDING
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Documents
            </h3>

            <a
              href={`/api/applications/${params.id}/document`}
              target="_blank"
              className="flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-6-6m6 6l6-6M9 13h6"
                />
              </svg>
              Download Loan Agreement (PDF)
            </a>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Signature Providers
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <a
                href="https://www.docusign.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium text-gray-900">DocuSign</div>
                <div className="text-xs text-gray-500 mt-1">Market Leader</div>
              </a>

              <a
                href="https://www.hellosign.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">✍️</div>
                <div className="font-medium text-gray-900">HelloSign</div>
                <div className="text-xs text-gray-500 mt-1">Dropbox</div>
              </a>

              <a
                href="https://www.pandadoc.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">🐼</div>
                <div className="font-medium text-gray-900">PandaDoc</div>
                <div className="text-xs text-gray-500 mt-1">Modern API</div>
              </a>
            </div>
          </div>

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

export default SignaturePage;
