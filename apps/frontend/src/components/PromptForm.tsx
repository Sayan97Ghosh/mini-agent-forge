import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { runPrompt } from "../services/api";
import { parseSearchResults } from "../utils/commonHelperFunctions";
import PromptInput from "./PromptInput";
import StopTypingButton from "./StopTypingButton";
import ErrorMessage from "./ErrorMessage";
import HistoryList from "./HistoryList";
import type { HistoryEntry } from "../utils/validator";

export default function PromptForm() {
  const [prompt, setPrompt] = useState("");
  const [tool, setTool] = useState<"web-search" | "calculator">("web-search");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stopTyping, setStopTyping] = useState(false);
  const [timings, setTimings] = useState({ render: 0, query: 0, response: 0 });
  const responseContainerRef = useRef<HTMLDivElement>(null);

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
        <HistoryList history={history} isTyping={isTyping} />
      </div>

      {error && <ErrorMessage message={error} />}

      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        tool={tool}
        setTool={setTool }
        onSubmit={handleSubmit}
        loading={loading}
        isTyping={isTyping}
      />

      {isTyping && !stopTyping && (
        <StopTypingButton
          onClick={() => {
            setStopTyping(true);
            setHistory((prev) =>
              prev.map((item) => ({
                ...item,
                displayedResponse: item.response || "",
              }))
            );
          }}
        />
      )}
    </div>
  );
}
