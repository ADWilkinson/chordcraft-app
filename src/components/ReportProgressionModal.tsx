import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, FlagIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from './ui-kit/button';

interface ReportProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => Promise<void>;
  progressionId: string;
}

const REPORT_REASONS = [
  { id: 'low_quality', label: 'Low Quality Progression' },
  { id: 'incorrect_theory', label: 'Incorrect Music Theory' },
  { id: 'missing_insights', label: 'Missing or Poor Insights' },
  { id: 'other', label: 'Other Issue' },
];

const ReportProgressionModal = ({ isOpen, onClose, onSubmit, progressionId }: ReportProgressionModalProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await onSubmit(selectedReason, details);
      setIsSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setSelectedReason('');
        setDetails('');
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error('Error reporting progression:', progressionId, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-md bg-[#f9f5f1] p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    className="p-1 rounded-full hover:bg-[#e5d8ce]/50 transition-colors"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5 text-[#877a74]" />
                  </button>
                </div>

                <Dialog.Title
                  as="h3"
                  className="flex items-center text-lg font-semibold text-[#49363b] mb-4"
                >
                  <FlagIcon className="h-5 w-5 text-[#49363b] mr-2" />
                  Report Progression
                </Dialog.Title>

                {isSuccess ? (
                  <div className="text-center py-6">
                    <CheckCircleIcon className="h-12 w-12 text-[#49363b] mx-auto mb-4" />
                    <p className="text-[#49363b] font-medium">Thank you for your feedback!</p>
                    <p className="text-[#877a74] text-sm mt-2">
                      We'll review this progression and make improvements.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-[#877a74] mb-4">
                      Please let us know why you're reporting this chord progression. 
                      Your feedback helps us improve our AI-generated content.
                    </p>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#49363b] mb-2">
                        Reason for reporting
                      </label>
                      <div className="space-y-2">
                        {REPORT_REASONS.map((reason) => (
                          <div key={reason.id} className="flex items-center">
                            <input
                              type="radio"
                              id={reason.id}
                              name="reportReason"
                              value={reason.id}
                              checked={selectedReason === reason.id}
                              onChange={() => setSelectedReason(reason.id)}
                              className="h-4 w-4 text-[#49363b] focus:ring-2 focus:ring-[#49363b]/20 focus:border-[#49363b] border-[#877a74]/30"
                            />
                            <label
                              htmlFor={reason.id}
                              className="ml-2 block text-sm text-[#49363b]"
                            >
                              {reason.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="details"
                        className="block text-sm font-medium text-[#49363b] mb-2"
                      >
                        Additional details (optional)
                      </label>
                      <textarea
                        id="details"
                        rows={3}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="w-full p-3 border border-[#877a74]/30 rounded-md bg-[#f9f5f1] focus:ring-2 focus:ring-[#49363b]/20 focus:border-[#49363b] outline-none text-sm"
                        placeholder="Please provide any specific details about the issue..."
                      />
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                      <Button
                        onClick={onClose}
                        className="py-2 px-4 bg-[#f9f5f1] hover:bg-[#e5d8ce]/30 text-[#49363b] rounded-md transition-colors"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="py-2 px-4 bg-[#49363b] hover:bg-[#49363b]/90 text-white rounded-md transition-colors flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FlagIcon className="h-4 w-4 mr-2" />
                            Submit Report
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReportProgressionModal;
