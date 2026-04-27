import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";

/* ── constants ────────────────────────────────────────────────────────────── */

const QUICK_PROMPTS = [
  "I'm feeling hungry 🍽️",
  "Had a breakup, comfort food 💔",
  "Cheap food under ₹200",
  "Suggest healthy options 🥗",
  "Best biryani near me",
  "Spicy food 🌶️",
  "Something sweet 🍰",
  "Quick meal for party 🎉",
];

// Maps ordinal words to 0-based restaurant index
const ORDINAL_IDX = {
  first: 0, "1st": 0, second: 1, "2nd": 1, third: 2, "3rd": 2,
  top: 0, this: 0, that: 0, it: 0, one: 0,
};

/* ── helpers ──────────────────────────────────────────────────────────────── */

const formatPrice = (paise) => `₹${Math.round(paise / 100)}`;

function getSavedLocation() {
  try {
    const saved = localStorage.getItem("quickbite_location");
    if (saved) {
      const loc = JSON.parse(saved);
      if (loc && !isNaN(Number(loc.lat)) && !isNaN(Number(loc.lng)))
        return { lat: Number(loc.lat), lng: Number(loc.lng) };
    }
  } catch {}
  return { lat: null, lng: null };
}

function isLoggedIn() {
  return !!(
    localStorage.getItem("accessToken") ||
    localStorage.getItem("userData")
  );
}

// Detect order confirmation / placement intent locally (has conversation context)
function detectLocalIntent(message, hasPendingOrder) {
  const lower = message.toLowerCase().trim();

  if (hasPendingOrder) {
    if (/\b(yes|yeah|yep|ok|okay|sure|confirm|go ahead|place it|do it|absolutely|proceed)\b/.test(lower))
      return { action: "confirm_order" };
    if (/\b(no|nope|cancel|don.t|skip|never|never mind|stop)\b/.test(lower))
      return { action: "cancel_order" };
  }

  if (
    /\b(order|buy|get me|place order)\b.{0,30}\b(first|second|third|1st|2nd|3rd|this|that|it|one)\b/i.test(lower) ||
    /\border (the )?(first|second|third|1st|2nd|3rd|top|this|that)\b/i.test(lower)
  ) {
    const m = lower.match(/\b(first|second|third|1st|2nd|3rd|top|this|that|it|one)\b/);
    return { action: "place_order", restaurantIndex: m ? (ORDINAL_IDX[m[1]] ?? 0) : 0 };
  }

  return { action: "chat" };
}

/* ── CSS injected once for voice waveform animation ─────────────────────── */

const VOICE_STYLES = `
  @keyframes qbVoiceBar {
    0%, 100% { transform: scaleY(0.3); }
    50% { transform: scaleY(1); }
  }
  .qb-voice-bar {
    display: inline-block;
    width: 3px;
    border-radius: 999px;
    background: currentColor;
    transform-origin: bottom;
    animation: qbVoiceBar 0.6s ease-in-out infinite;
  }
`;

/* ── sub-components ───────────────────────────────────────────────────────── */

const VoiceWaveform = ({ className = "" }) => (
  <span className={`inline-flex items-end gap-0.5 ${className}`}>
    {[10, 16, 22, 16, 10].map((h, i) => (
      <span
        key={i}
        className="qb-voice-bar"
        style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
      />
    ))}
  </span>
);

const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-3">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      AI
    </div>
    <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const RestaurantCard = ({ restaurant, index, onNavigate, onQuickOrder }) => {
  const hasOrderableItem = restaurant.dishes?.some((d) => d.id);
  return (
    <div className="bg-orange-50 dark:bg-gray-700 rounded-xl p-3 border border-orange-100 dark:border-gray-600">
      <div
        className="cursor-pointer hover:bg-orange-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
        onClick={() => onNavigate(restaurant.id)}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                #{index + 1}
              </span>
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">
                {restaurant.name}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                ⭐ {restaurant.rating?.toFixed(1)}
              </span>
              {restaurant.deliveryTime && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  🕐 {restaurant.deliveryTime} min
                </span>
              )}
              {restaurant.costForTwo && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatPrice(restaurant.costForTwo)} for 2
                </span>
              )}
              {restaurant.distance != null && (
                <span className="text-xs text-blue-500 dark:text-blue-400">
                  📍 {restaurant.distance} km
                </span>
              )}
            </div>
          </div>
        </div>
        {restaurant.dishes?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {restaurant.dishes.map((d, i) => (
              <span
                key={i}
                className="text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600"
              >
                {d.isVeg ? "🟢" : "🔴"} {d.name} · {formatPrice(d.price)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-2">
        {hasOrderableItem && (
          <button
            onClick={() => onQuickOrder(restaurant)}
            className="flex-1 text-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1.5 rounded-lg transition-colors"
          >
            🛒 Quick Order
          </button>
        )}
        <button
          onClick={() => onNavigate(restaurant.id)}
          className="flex-1 text-xs bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-500 font-medium py-1.5 rounded-lg transition-colors"
        >
          View Menu →
        </button>
      </div>
    </div>
  );
};

const MessageBubble = ({ msg, onNavigate, onQuickOrder }) => {
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
          {isUser && msg.isVoice && (
            <span className="mr-1 opacity-70 text-xs">🎤</span>
          )}
          {msg.content}
        </div>

        {!isUser && msg.restaurants?.length > 0 && (
          <div className="mt-2 space-y-2">
            {msg.restaurants.map((r, idx) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                index={idx}
                onNavigate={onNavigate}
                onQuickOrder={onQuickOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Sticky banner shown above input when an order is pending confirmation
const PendingOrderBanner = ({ order, onConfirm, onCancel, isSpeaking }) => (
  <div className="px-3 pb-2 flex-shrink-0">
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-wide">
            🛒 Confirm Order
          </p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
            {order.restaurant.name}
          </p>
          {order.dish && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {order.dish.isVeg ? "🟢" : "🔴"} {order.dish.name} ·{" "}
              {formatPrice(order.dish.price)} × 1
            </p>
          )}
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none flex-shrink-0"
          aria-label="Cancel order"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          ✅ Place Order
        </button>
        <button
          onClick={onCancel}
          className="flex-1 text-sm bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1.5">
        {isSpeaking ? "🔊 Listening for yes / no…" : 'Say "Yes" to confirm or "No" to cancel'}
      </p>
    </div>
  </div>
);

/* ── main component ───────────────────────────────────────────────────────── */

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! 👋 I'm your AI food assistant. Tell me what you're craving, your mood, or budget — I'll find the perfect options! Tap 🎤 to speak.",
      restaurants: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Voice state
  const [voiceState, setVoiceState] = useState("idle"); // "idle" | "listening"
  const [voiceTranscript, setVoiceTranscript] = useState(""); // live preview only
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Pending order awaiting confirmation (displayed as sticky banner)
  const [pendingOrder, setPendingOrder] = useState(null);

  // Refs — avoid stale closures in async recognition callbacks
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(""); // only isFinal results
  const conversationContextRef = useRef({ lastRestaurants: [] });
  const sendMessageRef = useRef(null); // updated each render
  const isMountedRef = useRef(true);

  const navigate = useNavigate();
  const reduxIsAuth = useSelector((state) => state.auth.isAuthenticated);
  const userLoggedIn = reduxIsAuth || isLoggedIn();

  /* ── lifecycle ──────────────────────────────────────────────────────────── */

  useEffect(() => {
    isMountedRef.current = true;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!(SR && window.speechSynthesis));

    // Inject voice animation styles once
    if (!document.getElementById("qb-voice-styles")) {
      const style = document.createElement("style");
      style.id = "qb-voice-styles";
      style.textContent = VOICE_STYLES;
      document.head.appendChild(style);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Cleanup voice resources when widget closes
  useEffect(() => {
    if (!isOpen) {
      try { recognitionRef.current?.abort(); } catch {}
      window.speechSynthesis?.cancel();
      if (isMountedRef.current) {
        setVoiceState("idle");
        setVoiceTranscript("");
        setIsSpeaking(false);
      }
    }
  }, [isOpen]);

  // Auto scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, pendingOrder]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  /* ── TTS ────────────────────────────────────────────────────────────────── */

  const speak = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    // Strip emojis/symbols for clean speech
    const clean = text.replace(/[^\w\s.,!?₹%\-']/g, " ").replace(/\s+/g, " ").trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const v =
        voices.find((v) => v.lang === "en-IN") ||
        voices.find((v) => v.lang.startsWith("en") && v.localService) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (v) utterance.voice = v;
    };
    pickVoice();
    if (window.speechSynthesis.getVoices().length === 0)
      window.speechSynthesis.onvoiceschanged = pickVoice;

    utterance.onstart = () => { if (isMountedRef.current) setIsSpeaking(true); };
    utterance.onend = () => { if (isMountedRef.current) setIsSpeaking(false); };
    utterance.onerror = () => { if (isMountedRef.current) setIsSpeaking(false); };
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    if (isMountedRef.current) setIsSpeaking(false);
  };

  /* ── Voice Recognition ──────────────────────────────────────────────────── */

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    stopSpeaking();
    try { recognitionRef.current?.abort(); } catch {}

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true; // for live preview only
    recognition.lang = "en-IN";
    recognitionRef.current = recognition;
    finalTranscriptRef.current = ""; // reset before each session

    if (isMountedRef.current) {
      setVoiceState("listening");
      setVoiceTranscript("");
    }

    recognition.onresult = (event) => {
      let interim = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += t; // accumulate confirmed speech only
        } else {
          interim += t;
        }
      }
      if (finalChunk) finalTranscriptRef.current += finalChunk;
      // Update preview: show final so far + current interim
      if (isMountedRef.current)
        setVoiceTranscript((finalTranscriptRef.current + " " + interim).trim());
    };

    recognition.onend = () => {
      const transcript = finalTranscriptRef.current.trim();
      if (isMountedRef.current) {
        setVoiceState("idle");
        setVoiceTranscript("");
      }
      // Only send if we got confirmed final speech
      if (transcript && sendMessageRef.current) {
        sendMessageRef.current(transcript, true);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted")
        console.warn("Speech recognition error:", event.error);
      if (isMountedRef.current) {
        setVoiceState("idle");
        setVoiceTranscript("");
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    if (isMountedRef.current) {
      setVoiceState("idle");
      setVoiceTranscript("");
    }
  };

  /* ── Order Execution ────────────────────────────────────────────────────── */

  const executeOrder = async (order, wasVoice) => {
    if (!userLoggedIn) {
      const text =
        "Please sign in first to place orders! 🔐 Your selection is ready — just log in and come back.";
      if (isMountedRef.current)
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", content: text, restaurants: [] },
        ]);
      if (wasVoice) speak(text);
      setPendingOrder(null);
      setIsLoading(false);
      return;
    }

    const dish = order.dish;
    if (!dish?.id) {
      // No orderable dish ID — send to restaurant page instead
      const text = `Let me take you to ${order.restaurant.name}'s menu so you can pick your items! 🍽️`;
      if (isMountedRef.current) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", content: text, restaurants: [] },
        ]);
      }
      if (wasVoice) speak(text);
      setPendingOrder(null);
      setIsLoading(false);
      navigate(`/home/restaurants/${order.restaurant.id}`);
      setIsOpen(false);
      return;
    }

    try {
      await api.post("/orders", {
        restaurantId: order.restaurant.id,
        items: [{ menuItemId: dish.id, quantity: 1 }],
        notes: "Placed via QuickBite AI voice assistant",
      });
      const successText = `🎉 Order placed from ${order.restaurant.name}! Your food is being prepared. Track it in Orders!`;
      if (isMountedRef.current) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", content: successText, restaurants: [] },
        ]);
      }
      speak(successText);
    } catch (err) {
      const text =
        err.response?.status === 401
          ? "Please sign in to place orders! 🔐"
          : "Couldn't place the order right now — please try from the restaurant page. 🙏";
      if (isMountedRef.current) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", content: text, restaurants: [] },
        ]);
      }
      if (wasVoice) speak(text);
    } finally {
      if (isMountedRef.current) {
        setPendingOrder(null);
        setIsLoading(false);
      }
    }
  };

  /* ── Message Sending ────────────────────────────────────────────────────── */

  const sendMessage = async (text, isVoice = false) => {
    const trimmed = (typeof text === "string" ? text : input).trim();
    if (!trimmed || isLoading) return;
    if (!isVoice) setInput("");

    const { action, restaurantIndex } = detectLocalIntent(trimmed, !!pendingOrder);

    // ── Order confirmation responses ──────────────────────────────────────
    if (action === "confirm_order" && pendingOrder) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "user", content: trimmed, isVoice },
      ]);
      setIsLoading(true);
      await executeOrder(pendingOrder, isVoice);
      return;
    }

    if (action === "cancel_order" && pendingOrder) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "user", content: trimmed, isVoice },
      ]);
      setPendingOrder(null);
      const cancelText = "No worries! Let me know if you'd like to explore more options. 😊";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", content: cancelText, restaurants: [] },
      ]);
      if (isVoice) speak(cancelText);
      return;
    }

    // ── Voice-triggered order initiation ──────────────────────────────────
    if (action === "place_order") {
      const lastRest = conversationContextRef.current.lastRestaurants;
      if (lastRest.length > 0) {
        const target = lastRest[Math.min(restaurantIndex, lastRest.length - 1)];
        const dish = target.dishes?.find((d) => d.id) || null;
        const order = { restaurant: target, dish };
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: "user", content: trimmed, isVoice },
        ]);
        setPendingOrder(order);
        const confirmText = dish
          ? `I'll order ${dish.name} from ${target.name} (${formatPrice(dish.price)}). Confirm below! 🛒`
          : `I'll take you to ${target.name}'s menu — tap a dish to order. 🍽️`;
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", content: confirmText, restaurants: [] },
        ]);
        speak(confirmText);
        return;
      }
    }

    // ── Regular AI chat ───────────────────────────────────────────────────
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: trimmed, isVoice },
    ]);
    setIsLoading(true);

    // Clear stale context before each new recommendation request
    conversationContextRef.current.lastRestaurants = [];

    try {
      const { lat, lng } = getSavedLocation();
      const { data } = await api.post("/ai/chat", { message: trimmed, lat, lng });

      if (data.restaurants?.length > 0)
        conversationContextRef.current.lastRestaurants = data.restaurants;

      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message || "Here are some options for you!",
        restaurants: data.restaurants || [],
      };
      if (isMountedRef.current) setMessages((prev) => [...prev, aiMsg]);
      if (isVoice) speak(aiMsg.content);
    } catch {
      const errMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again! 🙏",
        restaurants: [],
      };
      if (isMountedRef.current) setMessages((prev) => [...prev, errMsg]);
      if (isVoice) speak(errMsg.content);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  // Keep sendMessageRef current on every render (avoids stale closure in onend)
  sendMessageRef.current = sendMessage;

  /* ── Handlers ───────────────────────────────────────────────────────────── */

  const handleNavigate = (restaurantId) => {
    navigate(`/home/restaurants/${restaurantId}`);
    setIsOpen(false);
  };

  const handleQuickOrder = (restaurant) => {
    const dish = restaurant.dishes?.find((d) => d.id) || null;
    const order = { restaurant, dish };
    setPendingOrder(order);
    const confirmText = dish
      ? `Ready to order ${dish.name} from ${restaurant.name} (${formatPrice(dish.price)}). Confirm below or say "Yes"! 🛒`
      : `Let me open ${restaurant.name}'s menu for you! 🍽️`;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "assistant", content: confirmText, restaurants: [] },
    ]);
    speak(confirmText);
    if (!dish) {
      setTimeout(() => {
        navigate(`/home/restaurants/${restaurant.id}`);
        setIsOpen(false);
      }, 1500);
    }
  };

  const handleConfirmOrder = () => {
    if (!pendingOrder) return;
    setIsLoading(true);
    executeOrder(pendingOrder, false);
  };

  const handleCancelOrder = () => {
    if (!pendingOrder) return;
    setPendingOrder(null);
    const text = "Order cancelled — no worries! Let me know what else you'd like. 😊";
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "assistant", content: text, restaurants: [] },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMicClick = () => {
    if (voiceState === "listening") stopListening();
    else startListening();
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] max-h-[620px] flex flex-col bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                🤖
              </div>
              <div>
                <p className="text-white font-semibold text-sm">QuickBite AI</p>
                <div className="flex items-center gap-1.5 h-4">
                  {voiceState === "listening" ? (
                    <span className="flex items-center gap-1.5 text-orange-100 text-xs">
                      <VoiceWaveform className="text-white" />
                      Listening…
                    </span>
                  ) : isSpeaking ? (
                    <span className="text-orange-100 text-xs animate-pulse">🔊 Speaking…</span>
                  ) : (
                    <p className="text-orange-100 text-xs">Smart food recommendations</p>
                  )}
                </div>
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

          {/* Live transcript banner during listening */}
          {voiceState === "listening" && voiceTranscript && (
            <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-300 italic flex-shrink-0">
              🎤 "{voiceTranscript}"
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ maxHeight: "360px" }}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onNavigate={handleNavigate}
                onQuickOrder={handleQuickOrder}
              />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts — shown only when conversation has just started */}
          {messages.length <= 2 && !isLoading && !pendingOrder && (
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

          {/* Pending Order Banner — sticky above input */}
          {pendingOrder && (
            <PendingOrderBanner
              order={pendingOrder}
              onConfirm={handleConfirmOrder}
              onCancel={handleCancelOrder}
              isSpeaking={isSpeaking}
            />
          )}

          {/* Input */}
          <div className="px-3 pb-3 flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex gap-2 items-center bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 px-3 py-2 shadow-sm focus-within:border-orange-400 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={voiceState === "listening" ? voiceTranscript : input}
                onChange={(e) => {
                  if (voiceState !== "listening") setInput(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  voiceState === "listening"
                    ? "Listening…"
                    : pendingOrder
                    ? 'Say "Yes" to confirm or "No" to cancel…'
                    : "Ask me anything about food…"
                }
                className="flex-1 text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none min-w-0"
                disabled={isLoading || voiceState === "listening"}
                readOnly={voiceState === "listening"}
              />

              {/* Mic Button */}
              {voiceSupported && (
                <button
                  onClick={handleMicClick}
                  disabled={isLoading}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    voiceState === "listening"
                      ? "bg-red-500 hover:bg-red-600 shadow-[0_0_0_4px_rgba(239,68,68,0.25)] animate-pulse"
                      : "bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300"
                  }`}
                  aria-label={voiceState === "listening" ? "Stop listening" : "Start voice input"}
                >
                  {voiceState === "listening" ? (
                    // Stop icon
                    <span className="w-2.5 h-2.5 bg-white rounded-sm block" />
                  ) : (
                    // Mic icon
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
                    </svg>
                  )}
                </button>
              )}

              {/* Send Button */}
              <button
                onClick={() => sendMessage()}
                disabled={(!input.trim() && voiceState !== "listening") || isLoading}
                className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {voiceSupported && (
              <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
                🎤 Tap mic to speak · 🔊 AI replies with voice
              </p>
            )}
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
        {isOpen ? (
          <span className="text-xl text-white font-bold">✕</span>
        ) : voiceState === "listening" ? (
          <VoiceWaveform className="text-white" />
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>
    </>
  );
};

export default ChatWidget;
