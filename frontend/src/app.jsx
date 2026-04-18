import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();

      // Simulated typing effect
      let text = data.reply;
      let current = "";

      for (let i = 0; i < text.length; i++) {
        current += text[i];

        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { role: "assistant", content: current }
            ];
          } else {
            return [...prev, { role: "assistant", content: current }];
          }
        });

        await new Promise(r => setTimeout(r, 10)); // typing speed
      }

    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Error connecting to server" }
      ]);
    }

    setLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white">

      {/* Sidebar */}
      <div className="w-[260px] bg-[#171717] flex flex-col p-3 border-r border-gray-800">

        <button
          onClick={clearChat}
          className="w-full text-left px-3 py-2 rounded-md bg-[#2a2a2a] hover:bg-[#3a3a3a] transition mb-3"
        >
          + New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 text-sm">
          {messages.length > 0 && (
            <div className="px-3 py-2 rounded-md text-gray-400">
              Current Chat
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400 border-t border-gray-800 pt-3">
          Local AI • Ollama
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-10">
          <div className="max-w-3xl mx-auto space-y-6">

            {messages.length === 0 && (
              <div className="text-center mt-24 text-gray-400">
                <h1 className="text-4xl font-semibold mb-3">
                  AI Assistant
                </h1>
                <p className="text-sm">
                  Ask anything. Powered by local AI.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="relative group max-w-2xl">

                  <div
                    className={`px-4 py-3 rounded-xl text-sm leading-relaxed
                    ${
                      msg.role === "user"
                        ? "bg-green-600 text-white"
                        : "bg-[#2a2a2a] text-gray-200"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={() => copyText(msg.content)}
                    className="absolute top-1 right-1 text-xs opacity-0 group-hover:opacity-100 bg-black px-2 py-1 rounded"
                  >
                    Copy
                  </button>

                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="text-gray-500 text-sm">Thinking...</div>
            )}

            <div ref={bottomRef}></div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 bg-[#171717] p-4">
          <div className="max-w-3xl mx-auto">

            <div className="flex items-center bg-[#2a2a2a] rounded-xl px-4 py-3">

              <input
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-sm"
                placeholder="Message AI assistant..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <button
                onClick={sendMessage}
                className="ml-3 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
              >
                Send
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}