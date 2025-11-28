import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

export const APPROVAL_NOTES = [
  { value: 'documents_verified', label: 'All documents verified' },
  { value: 'manual_review_complete', label: 'Manual review complete' },
  { value: 'ready_to_publish', label: 'Ready to publish' }
];

export const REJECTION_REASONS = [
  { value: 'missing_documents', label: 'Missing or incomplete documents' },
  { value: 'identity_mismatch', label: 'Identity information does not match' },
  { value: 'business_info_mismatch', label: 'Business information mismatch' },
  { value: 'illegible_documents', label: 'Documents are illegible' },
  { value: 'fraud_suspected', label: 'Suspected fraudulent submission' }
];

export const RETURN_STEP_OPTIONS = [
  { value: '2', label: 'Step 2 · Business Details' },
  { value: '3', label: 'Step 3 · Account Information' },
  { value: '4', label: 'Step 4 · Identity Verification' },
  { value: '5', label: 'Step 5 · Business Documents' },
  { value: '6', label: 'Step 6 · Final Review' }
];

const AccountActionModal = ({
  open,
  type = 'approve',
  account,
  loading = false,
  onClose,
  onConfirm
}) => {
  const [approvalNote, setApprovalNote] = useState(APPROVAL_NOTES[0].value);
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0].value);
  const [returnToStep, setReturnToStep] = useState(RETURN_STEP_OPTIONS[0].value);

  useEffect(() => {
    if (open) {
      setApprovalNote(APPROVAL_NOTES[0].value);
      setRejectionReason(REJECTION_REASONS[0].value);
      setReturnToStep(RETURN_STEP_OPTIONS[0].value);
    }
  }, [open, type]);

  if (!open) {
    return null;
  }

  const handleConfirm = () => {
    if (type === 'approve') {
      onConfirm?.({ approvalNote });
    } else {
      onConfirm?.({ rejectionReason, returnToStep });
    }
  };

  const isApprove = type === 'approve';
  const actionTitle = isApprove ? 'Approve Account' : 'Reject Account';
  const actionIcon = isApprove ? CheckCircle : XCircle;
  const actionColor = isApprove ? 'text-green-400' : 'text-red-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">Account Action</p>
            <h3 className="text-lg font-semibold text-white">{actionTitle}</h3>
            {account && (
              <p className="text-sm text-gray-400 mt-1">
                {account.business_name || 'N/A'} · {account.service_type?.replace('_', ' ')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          <div className="flex items-center gap-3">
            <actionIcon className={`h-10 w-10 ${actionColor}`} />
            <p className="text-sm text-gray-300">
              {isApprove
                ? 'Confirm that all documents are valid before approving this account.'
                : 'Choose a reason for rejection so the vendor knows what to fix.'}
            </p>
          </div>

          {isApprove ? (
            <div>
              <label className="text-xs uppercase font-semibold text-gray-400 mb-2 block">
                Approval Note
              </label>
              <select
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {APPROVAL_NOTES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs uppercase font-semibold text-gray-400 mb-2 block">
                  Rejection Reason
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={loading}
                >
                  {REJECTION_REASONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase font-semibold text-gray-400 mb-2 block">
                  Send Back To Step
                </label>
                <select
                  value={returnToStep}
                  onChange={(e) => setReturnToStep(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={loading}
                >
                  {RETURN_STEP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white font-semibold inline-flex items-center gap-2 ${
              isApprove ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-red-600 hover:bg-red-500'
            } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Saving...' : isApprove ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountActionModal;

