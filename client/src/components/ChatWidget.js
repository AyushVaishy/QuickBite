import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const QUICK_PROMPTS = [
  "I'm feeling hungry 🍽️",
  "Cheap food under ₹200",
  "Suggest healthy options 🥗",
  "Best biryani near me",
  "Something sweet 🍰",
  "Quick meal for party 🎉",
];

const formatPrice = (paise) => `₹${Math.round(paise / 100)}`;

const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-3">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      AI
    </div>
    <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </div>
);

const RestaurantCard = ({ restaurant, onNavigate }) => (
  <div
    className="bg-orange-50 dark:bg-gray-700 rounded-xl p-3 cursor-pointer hover:bg-orange-100 dark:hover:bg-gray-600 transition-colors border border-orange-100 dark:border-gray-600"
    onClick={() => onNavigate(restaurant.id)}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">{restaurant.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">⭐ {restaurant.rating?.toFixed(1)}</span>
          {restaurant.deliveryTime && (
            <span className="text-xs text-gray-500 dark:text-gray-400">🕐 {restaurant.deliveryTime} min</span>
          )}
          {restaurant.costForTwo && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatPrice(restaurant.costForTwo)} for 2</span>
          )}
        </div>
      </div>
    </div>
    {restaurant.dishes && restaurant.dishes.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-1">
        {restaurant.dishes.map((dish, i) => (
          <span key={i} className="text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600">
            {dish.isVeg ? "🟢" : "🔴"} {dish.name} · {formatPrice(dish.price)}
          </span>
        ))}
      </div>
    )}
  </div>
);

const MessageBubble = ({ msg, onNavigate }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 mb-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          AI
        </div>
      )}
      <div className="max-w-[85%]">
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-sm"
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm"
          }`}
        >
          {msg.content}
        </div>
        {!isUser && msg.restaurants && msg.restaurants.length > 0 && (
          <div className="mt-2 space-y-2">
            {msg.restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hi! 👋 I'm your AI food assistant. Tell me what you're craving, your mood, or budget — and I'll find the best options for you!",
      restaurants: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;
    setInput("");

    const userMsg = { id: Date.now(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data } = await api.post("/ai/chat", {
        message: trimmed,
        lat: null,
        lng: null,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.message || "Here are some options for you!",
          restaurants: data.restaurants || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again! 🙏",
          restaurants: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (restaurantId) => {
    navigate(`/home/restaurants/${restaurantId}`);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] max-h-[600px] flex flex-col bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                🤖
              </div>
              <div>
                <p className="text-white font-semibold text-sm">QuickBite AI</p>
                <p className="text-orange-100 text-xs">Smart food recommendations</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ maxHeight: "380px" }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} onNavigate={handleNavigate} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts — shown only when few messages */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2 flex-shrink-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-xs bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700 rounded-full px-2.5 py-1 hover:bg-orange-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex gap-2 items-center bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 px-3 py-2 shadow-sm focus-within:border-orange-400 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about food..."
                className="flex-1 text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none min-w-0"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-gray-700 dark:bg-gray-600 scale-90"
            : "bg-gradient-to-br from-orange-500 to-orange-600 hover:scale-110"
        }`}
        aria-label="AI Food Assistant"
      >
        <span className="text-2xl">{isOpen ? "✕" : "🤖"}</span>
      </button>
    </>
  );
};

export default ChatWidget;
