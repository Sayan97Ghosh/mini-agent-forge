import { useEffect, useRef, useState } from "react";
import Spinner from "./Spinner";
import { v4 as uuidv4 } from "uuid";
import { runPrompt } from "../services/api";
import { parseSearchResults } from "../utils/commonHelperFunctions";
import sendIcon from '../assets/send.svg';


export default function PromptForm() {
  const [prompt, setPrompt] = useState("");
  const [tool, setTool] = useState("web-search");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stopTyping, setStopTyping] = useState(false);
  const [timings, setTimings] = useState({ render: 0, query: 0, response: 0 });
  const responseContainerRef = useRef<HTMLDivElement>(null);

  interface HistoryEntry {
    question: string;
    tool: "web-search" | "calculator";
    response: string;
    displayedResponse: string;
    tokens: number | null;
    loading: boolean;
    responseTimeStamp: string;
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paramId = searchParams.get("userId");
    const existingId = sessionStorage.getItem("userId");
    const idToStore = paramId || existingId || uuidv4();
    sessionStorage.setItem("userId", idToStore);
  }, []);

  const isTyping: boolean = history.some(
    (entry) =>
      entry.response && entry.displayedResponse.length < entry.response.length
  );

  // Handle typing animation for each response

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    history.forEach((entry, index) => {
      if (stopTyping) return;
      if (entry.response && entry.displayedResponse !== entry.response) {
        const timer = setInterval(() => {
          setHistory((prev) =>
            prev.map((item, i) => {
              if (i === index) {
                const nextCharIndex = item.displayedResponse.length + 1;
                if (nextCharIndex <= item.response.length) {
                  return {
                    ...item,
                    displayedResponse: item.response.slice(0, nextCharIndex),
                  };
                }
                clearInterval(timer);
              }
              return item;
            })
          );
        }, 30);
        timers.push(timer);
      }
    });
    return () => timers.forEach(clearInterval);
  }, [history, stopTyping]);

  useEffect(() => {
    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTop =
        responseContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async () => {
    if (!prompt) return;
    const start = performance.now();
    setLoading(true);
    setError(null);
    setStopTyping(false);

    const newEntry = {
      question: prompt,
      tool,
      response: null,
      displayedResponse: "",
      tokens: null,
      loading: true,
      responseTimeStamp: "",
    };

    setHistory((prev) => [...prev, newEntry]);

    const userId = sessionStorage.getItem("userId") || uuidv4();
    sessionStorage.setItem("userId", userId);

    try {
      const queryStart = performance.now();
      const result = await runPrompt({
        prompt,
        tool: tool as "web-search" | "calculator",
        userId,
      });
      const queryEnd = performance.now();

      const parsedResponse =
        tool === "calculator"
          ? result.summary.replace(/\\?[".,\n]/g, "").trim()
          : parseSearchResults(result.summary);

      const finalResponse = Array.isArray(parsedResponse)
        ? `Based on the prompt ${prompt} , here’s what I found:<ul>` +
          parsedResponse
            .map(
              (item, i) =>
                `<li>${i + 1}. <a href='${
                  item.url
                }' class='text-blue-500 underline' target='_blank'>${
                  item.title
                }</a></li>`
            )
            .join("") +
          `</ul>`
        : parsedResponse;

      const end = performance.now();

      setTimings({
        render: end - start,
        query: queryEnd - queryStart,
        response: end - queryEnd,
      });

      setHistory((prev) =>
        prev.map((entry, index) =>
          index === prev.length - 1
            ? {
                ...entry,
                response: finalResponse,
                displayedResponse: "",
                tokens: result.totalTokenCount,
                loading: false,
                responseTimeStamp: result.timestamp,
              }
            : entry
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setHistory((prev) =>
        prev.map((entry, index) =>
          index === prev.length - 1 ? { ...entry, loading: false } : entry
        )
      );
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  return (
    <div className="w-screen min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col ">
      <h2 className="text-3xl sticky font-bold text-center text-gray-800 mb-6">
        Mini Agent Forge
      </h2>

      <div
        ref={responseContainerRef}
        className="flex-grow mb-6 overflow-y-auto max-h-[calc(100vh-300px)] overflow-hidden"
      >
        {history.length > 0 ? (
          <div className="space-y-6">
            {history.map((entry, index) => (
              <div
                key={index}
                className="bg-green-50 border border-green-200 rounded-lg p-5"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  Prompt: {index + 1}
                </h3>
                <p className="text-gray-700 mt-1 flex justify-between items-center">
                  <span>
                    {entry.question}{" "}
                    <span className="text-sm text-gray-500">
                      ({entry.tool})
                    </span>
                  </span>

                  <span className="text-sm text-gray-500 ml-4 whitespace-nowrap">
                    {new Date().toLocaleString()}
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
                    <h3 className="text-lg font-semibold text-green-800 mt-4">
                      Response:
                    </h3>
                    <div
                      className="text-gray-700 mt-2"
                      dangerouslySetInnerHTML={{
                        __html: entry.displayedResponse,
                      }}
                    />

                    {entry.displayedResponse && !isTyping && (
                      <span className="text-gray-700 mt-1 flex justify-between items-center">
                        <p className="text-sm text-gray-500 mt-2">
                          Total Token : {entry.tokens}
                        </p>
                        <span className="text-sm text-gray-500 ml-4 whitespace-nowrap">
                          {new Date(entry.responseTimeStamp).toLocaleString()}
                        </span>
                      </span>
                    )}
                  </>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <h2 className="text-center text-gray-500 italic">
            No questions submitted yet. Enter a query to see results.
          </h2>
        )}
      </div>

      {/* Error Container */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-red-800 mb-6">
          Error: {error}
        </div>
      )}

      {/* Input Container (Fixed at Bottom) */}
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
            onChange={(e) => setTool(e.target.value)}
            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.9%205.4%2012.9%205.4s9.3-1.8%2012.9-5.4L287%2095.1c3.6-3.6%205.4-7.9%205.4-12.9%200-4.9-1.8-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:1.2em] bg-[right_0.5rem_center]"
            aria-label="Select tool"
          >
            <option value="calculator">Calculator</option>
            <option value="web-search">Web Search</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={loading || !prompt.trim() || isTyping}
        >
          {loading ? (
            <Spinner />
          ) : (
            <img
              src={sendIcon} // Replace with your actual path
              alt="Send"
              className="h-5 w-5"
              style={{ filter: 'invert(1)' }}
            />
          )}
        </button>
      </div>
      {isTyping && !stopTyping && (
        <button
          className="fixed bottom-[calc(100vh-380px)] right-6 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition z-50 cursor-pointer"
          onClick={() => {
            setStopTyping(true);
            setHistory((prev) =>
              prev.map((item) => ({
                ...item,
                displayedResponse: item.response || "",
              }))
            );
          }}
        >
          Stop Typing
        </button>
      )}
    </div>
  );
}
