"use client";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

export default function Chat() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false); // ✅ Tracks if bot is "typing"
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ✅ Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
    
        setMessages((prev) => [...prev, { role: "user", content: input }]);
        setInput(""); // ✅ Clear the input immediately
        setIsTyping(true); // ✅ Show typing animation
    
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input, history: messages }), // ✅ Send chat history
            });
    
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch response");
    
            setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { role: "bot", content: "Error fetching response." }]);
        } finally {
            setIsTyping(false); // ✅ Hide typing animation
        }
    };
    

    return (
        <div className="w-full space-y-4">
            <div className="h-80 overflow-y-auto border border-gray-700 p-4 rounded-xl bg-gray-700">
                {messages.length === 0 ? (
                    <p className="text-gray-400 text-center">Start chatting about F1! 🏎️</p>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-2`}>
                                <span
                                    className={`px-4 py-2 rounded-xl ${
                                        msg.role === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-600 text-white"
                                    }`}
                                >
                                    {msg.content}
                                </span>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start mb-2">
                                <div className="bg-gray-500 px-4 py-2 rounded-xl flex space-x-2">
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-400"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} /> {/* ✅ Auto-scroll target */}
                    </>
                )}
            </div>
            <div className="flex items-center space-x-2">
                <input
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white outline-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask me about F1..."
                />
                <button onClick={sendMessage} className="bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition">
                    <Send className="text-white w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
