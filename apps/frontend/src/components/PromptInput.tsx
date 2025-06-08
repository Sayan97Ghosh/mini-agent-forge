import React from 'react'
import Spinner from './Spinner';
import sendIcon from '../assets/send.svg';

function PromptInput({
  prompt,
  setPrompt,
  tool,
  setTool,
  onSubmit,
  loading,
  isTyping,
}: {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  tool: "web-search" | "calculator";
  setTool: React.Dispatch<React.SetStateAction<"web-search" | "calculator">>;
  onSubmit: () => void;
  loading: boolean;
  isTyping: boolean;
}) {
  return (
    <div className="sticky bottom-0 bg-white p-4 rounded-lg shadow-lg space-y-4">
      <div className="relative">
        <textarea
          className="w-full p-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y text-gray-800 placeholder-gray-400"
          placeholder="Enter your prompt (max 500 characters)"
          maxLength={500}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          rows={3}
          aria-label="Prompt input"
        />
        <span className="absolute bottom-2 right-2 text-sm text-gray-500">
          {prompt.length}/500
        </span>
      </div>

      <div>
        <label
          htmlFor="tool-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Tool
        </label>
        <select
          id="tool-select"
          value={tool}
          onChange={(e) => setTool(e.target.value as "web-search" | "calculator")}
          className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.9%205.4%2012.9%205.4s9.3-1.8%2012.9-5.4L287%2095.1c3.6-3.6%205.4-7.9%205.4-12.9%200-4.9-1.8-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:1.2em] bg-[right_0.5rem_center]"
          aria-label="Select tool"
        >
          <option value="calculator">Calculator</option>
          <option value="web-search">Web Search</option>
        </select>
      </div>

      <button
        onClick={onSubmit}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        disabled={loading || !prompt.trim() || isTyping}
      >
        {loading ? (
          <Spinner />
        ) : (
          <img
            src={sendIcon}
            alt="Send"
            className="h-5 w-5"
            style={{ filter: "invert(1)" }}
          />
        )}
      </button>
    </div>
  );
}

export default PromptInput;
