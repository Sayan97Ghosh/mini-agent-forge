import { useState } from 'react';
import type { HistoryEntry } from '../utils/validator';
function HistoryEntryComponent({
  entry,
  index,
  isTyping,
}: {
  entry: HistoryEntry;
  index: number;
  isTyping: boolean;
}) {

    const [createdTime] = useState(() => Date.now());

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-5">
      <h3 className="text-lg font-semibold text-gray-800">Prompt: {index + 1}</h3>
      <p className="text-gray-700 mt-1 flex justify-between items-center">
        <span>
          {entry.question} <span className="text-sm text-gray-500">({entry.tool})</span>
        </span>

        <span className="text-sm text-gray-500 ml-4 whitespace-nowrap">
          {new Date(createdTime).toLocaleString()}
        </span>
      </p>

      {entry.loading ? (
        <div className="flex items-center mt-2">
          <svg
            className="animate-spin h-5 w-5 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-2 text-gray-600">Processing...</span>
        </div>
      ) : entry.response ? (
        <>
          <h3 className="text-lg font-semibold text-green-800 mt-4">Response:</h3>
          <div
            className="text-gray-700 mt-2"
            dangerouslySetInnerHTML={{ __html: entry.displayedResponse }}
          />

          {entry.displayedResponse && !isTyping && (
            <span className="text-gray-700 mt-1 flex justify-between items-center">
              <p className="text-sm text-gray-500 mt-2">Total Token : {entry.tokens}</p>
              <span className="text-sm text-gray-500 ml-4 whitespace-nowrap">
                {new Date(entry.responseTimeStamp).toLocaleString()}
              </span>
            </span>
          )}
        </>
      ) : null}
    </div>
  );
}

export default HistoryEntryComponent
