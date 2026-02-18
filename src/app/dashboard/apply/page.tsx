"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ApplyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    caseNumber: "",
    caseName: "",
    courtName: "",
    jurisdiction: "",
    estimatedDuration: "",
    requestedTerm: "",
    notes: "",
  });

  if (status === "loading") {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!session) {
    signIn();
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      router.push("/dashboard/my-applications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            New Loan Application
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Apply for funding for your case
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Case Information
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="caseNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Case Number *
                </label>
                <input
                  type="text"
                  id="caseNumber"
                  required
                  value={formData.caseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, caseNumber: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="CV-2024-12345"
                />
              </div>

              <div>
                <label
                  htmlFor="caseName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Case Name *
                </label>
                <input
                  type="text"
                  id="caseName"
                  required
                  value={formData.caseName}
                  onChange={(e) =>
                    setFormData({ ...formData, caseName: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Smith v. Johnson"
                />
              </div>

              <div>
                <label
                  htmlFor="courtName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Court Name
                </label>
                <input
                  type="text"
                  id="courtName"
                  value={formData.courtName}
                  onChange={(e) =>
                    setFormData({ ...formData, courtName: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Superior Court of Massachusetts"
                />
              </div>

              <div>
                <label
                  htmlFor="jurisdiction"
                  className="block text-sm font-medium text-gray-700"
                >
                  Jurisdiction
                </label>
                <input
                  type="text"
                  id="jurisdiction"
                  value={formData.jurisdiction}
                  onChange={(e) =>
                    setFormData({ ...formData, jurisdiction: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Massachusetts"
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Loan Details
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Requested Amount ($) *
                </label>
                <input
                  type="number"
                  id="amount"
                  required
                  min="1000"
                  step="1000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="50000"
                />
              </div>

              <div>
                <label
                  htmlFor="purpose"
                  className="block text-sm font-medium text-gray-700"
                >
                  Purpose *
                </label>
                <textarea
                  id="purpose"
                  required
                  rows={2}
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Case expenses and expert witness fees"
                />
              </div>

              <div>
                <label
                  htmlFor="estimatedDuration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Estimated Case Duration
                </label>
                <input
                  type="text"
                  id="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedDuration: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="12 months"
                />
              </div>

              <div>
                <label
                  htmlFor="requestedTerm"
                  className="block text-sm font-medium text-gray-700"
                >
                  Requested Loan Term
                </label>
                <input
                  type="text"
                  id="requestedTerm"
                  value={formData.requestedTerm}
                  onChange={(e) =>
                    setFormData({ ...formData, requestedTerm: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="18 months"
                />
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Additional Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Any additional information about the case or funding needs"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
