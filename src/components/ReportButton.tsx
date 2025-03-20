import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { reportProgression } from '../services/progressionService';
import { ChordProgression } from '../types';

interface ReportButtonProps {
  progression: ChordProgression;
  onReportSuccess?: () => void;
}

const ReportButton: React.FC<ReportButtonProps> = ({ progression, onReportSuccess }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [isReported, setIsReported] = useState(progression.reported || false);
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleReport = async () => {
    if (isReported) return;
    
    setIsReporting(true);
    try {
      await reportProgression(progression.id, reason);
      setIsReported(true);
      setIsOpen(false);
      if (onReportSuccess) {
        onReportSuccess();
      }
    } catch (error) {
      console.error('Error reporting progression:', error);
    } finally {
      setIsReporting(false);
    }
  };

  const reasons = [
    'Too short (less than 4 chords)',
    'Poor musical quality',
    'Incorrect music theory',
    'Insufficient insights',
    'Not matching requested parameters',
    'Other'
  ];

  return (
    <div className="relative">
      {isReported ? (
        <span className="text-xs text-gray-500">Reported for review</span>
      ) : (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs text-red-500 hover:text-red-700"
            onClick={() => setIsOpen(!isOpen)}
            disabled={isReporting}
          >
            {isReporting ? 'Reporting...' : 'Report Issue'}
          </motion.button>
          
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            >
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900">Report this progression</h3>
                <p className="text-xs text-gray-500 mt-1 mb-2">
                  Please select a reason why this progression should be reviewed:
                </p>
                <div className="space-y-2">
                  {reasons.map((r) => (
                    <div key={r} className="flex items-center">
                      <input
                        type="radio"
                        id={r}
                        name="reportReason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor={r} className="ml-2 text-xs text-gray-700">
                        {r}
                      </label>
                    </div>
                  ))}
                  
                  {reason === 'Other' && (
                    <textarea
                      className="mt-1 block w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Please describe the issue"
                      rows={2}
                      onChange={(e) => setReason(`Other: ${e.target.value}`)}
                    />
                  )}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={handleReport}
                    disabled={!reason || isReporting}
                  >
                    {isReporting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportButton;
