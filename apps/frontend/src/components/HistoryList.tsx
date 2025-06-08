import HistoryEntryComponent from './HistoryEntryComponent';
import type { HistoryEntry } from '../utils/validator';
function HistoryList({
  history,
  isTyping,
}: {
  history: HistoryEntry[];
  isTyping: boolean;
}) {
  if (history.length === 0) {
    return (
      <h2 className="text-center text-gray-500 italic">
        No questions submitted yet. Enter a query to see results.
      </h2>
    );
  }
  return (
    <div className="space-y-6">
      {history.map((entry, index) => (
        <HistoryEntryComponent key={index} entry={entry} index={index} isTyping={isTyping} />
      ))}
    </div>
  );
}

export default HistoryList
