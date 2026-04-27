import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../services/api";

// ─── Utilities ────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 23) return "Good evening";
  return "Good night";
}

const fmtPrice = (p) => `₹${Math.round(p / 100)}`;

function getSavedLocation() {
  try {
    const s = localStorage.getItem("quickbite_location");
    if (s) {
      const l = JSON.parse(s);
      if (!isNaN(+l.lat) && !isNaN(+l.lng)) return { lat: +l.lat, lng: +l.lng };
    }
  } catch {}
  return { lat: null, lng: null };
}

function cleanForSpeech(text) {
  return text
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
    .replace(/[\u2600-\u27BF]/g, "")
    .replace(/[*_~`#[\]]/g, "")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

let _id = 0;
const uid = () => `${++_id}_${Date.now()}`;

// ─── Injected CSS ─────────────────────────────────────────────────────────────

const WIDGET_CSS = `
@keyframes qbWave {
  0%,100% { transform: scaleY(0.3); opacity: 0.5; }
  50%      { transform: scaleY(1);   opacity: 1;   }
}
@keyframes qbDot {
  0%,100% { transform: translateY(0);    opacity: 0.4; }
  50%      { transform: translateY(-5px); opacity: 1;   }
}
@keyframes qbSlide {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
}
.qb-in { animation: qbSlide 0.22s ease both; }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function WaveBar({ i }) {
  const heights = [8, 13, 17, 13, 8];
  return (
    <span
      style={{
        display: "inline-block",
        width: 3,
        height: heights[i],
        borderRadius: 2,
        background: "currentColor",
        animation: `qbWave 0.9s ease-in-out ${i * 0.1}s infinite`,
      }}
    />
  );
}

function Waveform({ cls = "" }) {
  return (
    <span className={`inline-flex items-end gap-0.5 ${cls}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <WaveBar key={i} i={i} />
      ))}
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 0.18, 0.36].map((d, i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#fb923c",
            display: "inline-block",
            animation: `qbDot 1s ease-in-out ${d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function VegBadge({ isVeg }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-sm border-2 shrink-0 ${
        isVeg ? "border-green-500" : "border-red-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isVeg ? "bg-green-500" : "bg-red-500"
        }`}
      />
    </span>
  );
}

function RestaurantCard({ restaurant, idx, onAdd, cart }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden border border-orange-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm mb-2">
      <button
        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-xs font-bold flex items-center justify-center shrink-0">
          {idx + 1}
        </span>
        {restaurant.imageUrl && (
          <img
            src={restaurant.imageUrl}
            alt=""
            className="w-10 h-10 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
            {restaurant.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ⭐ {restaurant.rating?.toFixed(1)} · {restaurant.deliveryTime} min ·{" "}
            {fmtPrice(restaurant.costForTwo)} for 2
          </p>
        </div>
        <span className="text-gray-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
          {(restaurant.dishes || []).length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-1">
              No dishes listed
            </p>
          ) : (
            (restaurant.dishes || []).map((dish) => {
              const added = cart.some((c) => c.dishId === dish.id);
              return (
                <div key={dish.id} className="flex items-center gap-2">
                  <VegBadge isVeg={dish.isVeg} />
                  <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">
                    {dish.name}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">
                    {fmtPrice(dish.price)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd(restaurant, dish);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                      added
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200"
                    }`}
                  >
                    {added ? "✓ Added" : "+ Add"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function PriyaAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
      P
    </div>
  );
}

function ChatBubble({ msg, onAdd, cart }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex gap-2 qb-in mb-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {!isUser && <PriyaAvatar />}
      <div
        className={`flex flex-col gap-1.5 ${
          isUser ? "items-end max-w-[78%]" : "items-start max-w-[85%]"
        }`}
      >
        {msg.content && (
          <div
            className={`text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl ${
              isUser
                ? "bg-gradient-to-br from-orange-500 to-pink-500 text-white rounded-tr-sm"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-sm"
            }`}
          >
            {msg.content}
            {msg.isVoice && (
              <span className="ml-1 text-[10px] opacity-50">🎤</span>
            )}
          </div>
        )}
        {msg.restaurants?.length > 0 && (
          <div className="w-72 sm:w-80">
            {msg.restaurants.map((r, i) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                idx={i}
                onAdd={onAdd}
                cart={cart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatWidget() {
  const authUser = useSelector((s) => s.auth?.user);
  const reduxIsAuth = useSelector((s) => s.auth?.isAuthenticated);

  const [isOpen, setIsOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [inputText, setInputText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceOk, setVoiceOk] = useState(false);
  const [cart, setCart] = useState([]);
  const [lastRestaurants, setLastRestaurants] = useState([]);

  // ── Refs (avoid stale closures across async/voice callbacks) ──────────────
  const mountedRef = useRef(true);
  const msgsRef = useRef([]);
  const cartRef = useRef([]);
  const lastRestaurantsRef = useRef([]);
  // 'en' = English/Hinglish (Roman)  |  'hi' = Hindi (Devanagari)
  const userLangRef = useRef("en");
  const recRef = useRef(null);
  const finalTransRef = useRef("");
  const voiceRef = useRef(null);
  const autoListenTimer = useRef(null);
  const greeted = useRef(false);

  // Forward-declared function refs (filled in below)
  const sendRef = useRef(null);
  const placeOrderRef = useRef(null);
  const startListenRef = useRef(null);
  const scheduleListenRef = useRef(null);

  // ── Sync refs with state ──────────────────────────────────────────────────
  useEffect(() => { msgsRef.current = msgs; }, [msgs]);
  useEffect(() => { cartRef.current = cart; }, [cart]);
  useEffect(() => { lastRestaurantsRef.current = lastRestaurants; }, [lastRestaurants]);

  // ── One-time setup ────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true; // reset on strict-mode remount
    if (!document.getElementById("qb-widget-css")) {
      const el = document.createElement("style");
      el.id = "qb-widget-css";
      el.textContent = WIDGET_CSS;
      document.head.appendChild(el);
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceOk(!!SR);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  // ── TTS: pick female voice ────────────────────────────────────────────────
  const pickVoice = useCallback(() => {
    const all = window.speechSynthesis?.getVoices?.() || [];
    voiceRef.current =
      all.find((v) => v.lang === "en-IN" && /female|heera|raveena/i.test(v.name)) ||
      all.find((v) => /zira|hazel|samantha|victoria|karen|moira|lisa|siri/i.test(v.name)) ||
      all.find((v) => v.lang === "en-IN") ||
      all.find((v) => v.lang.startsWith("en") && /female/i.test(v.name)) ||
      all.find((v) => v.lang.startsWith("en")) ||
      null;
  }, []);

  useEffect(() => {
    pickVoice();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, [pickVoice]);

  // ── speak() ───────────────────────────────────────────────────────────────
  const speak = useCallback(
    (text, onDone) => {
      if (!text || !window.speechSynthesis) { onDone?.(); return; }
      window.speechSynthesis.cancel();
      const clean = cleanForSpeech(text);
      if (!clean) { onDone?.(); return; }

      const isHindi = userLangRef.current === "hi" && /[\u0900-\u097F]/.test(text);
      const utter = new SpeechSynthesisUtterance(clean);

      if (isHindi) {
        const hiVoice = (window.speechSynthesis.getVoices() || []).find((v) =>
          v.lang.startsWith("hi-IN")
        );
        utter.voice = hiVoice || voiceRef.current;
        utter.lang = "hi-IN";
      } else {
        utter.voice = voiceRef.current;
        utter.lang = "en-IN";
      }
      utter.rate = 0.91;
      utter.pitch = 1.15; // slightly higher → more feminine/friendly
      utter.volume = 1;

      if (mountedRef.current) setSpeaking(true);
      utter.onend = () => { if (mountedRef.current) setSpeaking(false); onDone?.(); };
      utter.onerror = () => { if (mountedRef.current) setSpeaking(false); onDone?.(); };
      window.speechSynthesis.speak(utter);
    },
    []
  );

  // ── scheduleAutoListen() ──────────────────────────────────────────────────
  const scheduleAutoListen = useCallback(
    (delayMs = 900) => {
      clearTimeout(autoListenTimer.current);
      if (!voiceOk) return;
      autoListenTimer.current = setTimeout(() => {
        if (mountedRef.current && !window.speechSynthesis?.speaking) {
          startListenRef.current?.();
        }
      }, delayMs);
    },
    [voiceOk]
  );

  // Keep ref up-to-date
  useEffect(() => { scheduleListenRef.current = scheduleAutoListen; }, [scheduleAutoListen]);

  // ── startListening() ──────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !mountedRef.current) return;

    if (recRef.current) { try { recRef.current.abort(); } catch {} }
    window.speechSynthesis?.cancel();

    const rec = new SR();
    recRef.current = rec;
    finalTransRef.current = "";

    // continuous = true so Chrome doesn't cut off mid-sentence.
    // We manage the "done speaking" detection ourselves via a silence timer.
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = userLangRef.current === "hi" ? "hi-IN" : "en-IN";
    rec.maxAlternatives = 1;

    let silenceTimer = null;
    let committed = false; // prevent double-submit if onend fires after commit

    const commit = () => {
      if (committed) return;
      committed = true;
      clearTimeout(silenceTimer);
      try { rec.stop(); } catch {}
      const transcript = finalTransRef.current.trim();
      finalTransRef.current = "";
      if (mountedRef.current) { setListening(false); setInputText(""); }
      if (transcript && mountedRef.current) {
        sendRef.current?.(transcript, true);
      }
    };

    const resetSilenceTimer = () => {
      clearTimeout(silenceTimer);
      // 3.5 s of silence → commit whatever was said
      silenceTimer = setTimeout(commit, 3500);
    };

    rec.onstart = () => { if (mountedRef.current) setListening(true); };

    rec.onresult = (e) => {
      let interim = "";
      let newFinal = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) newFinal += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (newFinal) finalTransRef.current += " " + newFinal;
      if (mountedRef.current) setInputText((finalTransRef.current + " " + interim).trim());
      // Any new speech resets the silence countdown
      resetSilenceTimer();
    };

    rec.onspeechend = () => {
      // Browser detected speech ended — start the silence countdown if not already running
      resetSilenceTimer();
    };

    rec.onend = () => {
      clearTimeout(silenceTimer);
      if (!committed) commit();
    };

    rec.onerror = (e) => {
      clearTimeout(silenceTimer);
      if (e.error === "no-speech") {
        // Timed out with nothing said — just stop quietly
        if (mountedRef.current) { setListening(false); setInputText(""); }
        committed = true;
        return;
      }
      if (mountedRef.current) { setListening(false); setInputText(""); }
    };

    try { rec.start(); } catch {}
  }, []);

  // Keep startListenRef up-to-date
  useEffect(() => { startListenRef.current = startListening; }, [startListening]);

  // ── placeOrder() ──────────────────────────────────────────────────────────
  const placeOrder = useCallback(async () => {
    const isLoggedIn = reduxIsAuth || !!localStorage.getItem("accessToken");
    if (!isLoggedIn) {
      const m = {
        id: uid(), role: "ai",
        content: "You need to be logged in to place an order! Please sign in first. 🔐",
      };
      setMsgs((p) => [...p, m]);
      speak(m.content, () => scheduleListenRef.current?.());
      return;
    }

    const items = cartRef.current;
    if (!items.length) {
      const m = {
        id: uid(), role: "ai",
        content: "There's nothing in the cart yet! Tell me what dishes you'd like and I'll add them for you. 🍽️",
      };
      setMsgs((p) => [...p, m]);
      speak(m.content, () => scheduleListenRef.current?.());
      return;
    }

    // Group items by first restaurant (single-restaurant orders)
    const restId = items[0].restaurantId;
    const orderItems = items
      .filter((i) => i.restaurantId === restId)
      .map((i) => ({ menuItemId: i.dishId, quantity: 1 }));

    try {
      await api.post("/orders", { restaurantId: restId, items: orderItems, addressId: null });
      setCart([]);
      const firstName = (authUser?.name || authUser?.username || "").split(" ")[0] || "friend";
      const names = items.map((i) => i.dishName).join(", ");
      const m = {
        id: uid(), role: "ai",
        content: `🎉 Order confirmed! ${names} from ${items[0].restaurantName} is on its way. Enjoy your meal, ${firstName}! 😊`,
      };
      setMsgs((p) => [...p, m]);
      speak(m.content);
    } catch {
      const m = {
        id: uid(), role: "ai",
        content: "Something went wrong placing your order. Please try again! 🙏",
      };
      setMsgs((p) => [...p, m]);
      speak(m.content, () => scheduleListenRef.current?.());
    }
  }, [reduxIsAuth, authUser, speak]);

  // Keep placeOrderRef up-to-date
  useEffect(() => { placeOrderRef.current = placeOrder; }, [placeOrder]);

  // ── sendMessage() ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text, isVoice = false) => {
      if (!text?.trim() || !mountedRef.current) return;
      const content = text.trim();
      clearTimeout(autoListenTimer.current);

      // Detect user language from message text and update ref for STT + TTS
      const hasDevanagari = /[\u0900-\u097F]/.test(content);
      userLangRef.current = hasDevanagari ? "hi" : "en";

      // Add user message
      const userMsg = { id: uid(), role: "user", content, isVoice };
      const allMsgs = [...msgsRef.current, userMsg];
      if (mountedRef.current) {
        setMsgs(allMsgs);
        setInputText("");
        setThinking(true);
      }

      // Build history for API (role: user|assistant, last 20 turns)
      const history = allMsgs
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content || "",
        }))
        .filter((m) => m.content)
        .slice(-20);

      const { lat, lng } = getSavedLocation();
      const firstName = (authUser?.name || authUser?.username || "").split(" ")[0] || "";
      const savedAddress = localStorage.getItem("quickbite_address") || "";

      // Compact restaurant context — gives Gemini full menu awareness
      const shownRestaurants = (lastRestaurantsRef.current || []).map((r) => ({
        id: r.id,
        name: r.name,
        dishes: (r.dishes || []).map((d) => ({
          id: d.id,
          name: d.name,
          price: d.price,
          isVeg: d.isVeg,
        })),
      }));

      try {
        const res = await api.post("/ai/converse", {
          messages: history,
          userName: firstName,
          savedAddress,
          lat,
          lng,
          shownRestaurants,
          userLanguage: userLangRef.current, // 'en' or 'hi'
        });
        if (!mountedRef.current) return;

        const d = res.data;
        const aiMsg = {
          id: uid(),
          role: "ai",
          content: d.reply || "",
          restaurants: d.action === "RECOMMEND" ? (d.restaurants || []) : null,
        };

        setMsgs((prev) => [...prev, aiMsg]);
        setThinking(false);

        // ── Handle actions ─────────────────────────────────────────────────

        // PLACE_ORDER: execute the cart
        if (d.action === "PLACE_ORDER") {
          await placeOrderRef.current?.();
          return;
        }

        // ADD_TO_CART: Gemini identified the exact dish(es) — auto-add them
        if (d.action === "ADD_TO_CART" && Array.isArray(d.items) && d.items.length > 0) {
          const rMap = {};
          (lastRestaurantsRef.current || []).forEach((r) => { rMap[r.id] = r; });
          d.items.forEach((item) => {
            const r = rMap[item.restaurantId];
            if (!r) return;
            const dish = (r.dishes || []).find((di) => di.id === item.dishId);
            if (!dish) return;
            setCart((prev) => {
              if (prev.some((c) => c.dishId === dish.id)) return prev;
              return [
                ...prev,
                {
                  restaurantId: r.id,
                  restaurantName: r.name,
                  dishId: dish.id,
                  dishName: dish.name,
                  price: dish.price,
                },
              ];
            });
          });
        }

        // RECOMMEND: save the restaurant list so Gemini has context next turn
        if (d.action === "RECOMMEND" && Array.isArray(d.restaurants)) {
          setLastRestaurants(d.restaurants);
        }

        // ── Build TTS speech ───────────────────────────────────────────────
        // Just speak whatever Priya said — she will read out the options herself
        // (no "tap the card" prompts — this is a fully voice-driven flow)
        speak(aiMsg.content, () => {
          if (mountedRef.current) {
            scheduleListenRef.current?.(aiMsg.restaurants?.length > 0 ? 2000 : 900);
          }
        });
      } catch {
        if (!mountedRef.current) return;
        setThinking(false);
        const errMsg = {
          id: uid(), role: "ai",
          content: "Oops, I had a little hiccup! 😅 Could you say that again?",
        };
        setMsgs((prev) => [...prev, errMsg]);
        speak(errMsg.content, () => scheduleListenRef.current?.());
      }
    },
    [authUser, speak]
  );

  // Keep sendRef up-to-date
  useEffect(() => { sendRef.current = sendMessage; }, [sendMessage]);

  // ── Cart toggle ───────────────────────────────────────────────────────────
  const toggleCartItem = useCallback((restaurant, dish) => {
    setCart((prev) => {
      const exists = prev.some((c) => c.dishId === dish.id);
      if (exists) return prev.filter((c) => c.dishId !== dish.id);
      return [
        ...prev,
        {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
        },
      ];
    });
  }, []);

  // ── Open chat → auto greet ────────────────────────────────────────────────
  const openChat = useCallback(async () => {
    setIsOpen(true);
    if (greeted.current) return; // already sent greeting this session
    greeted.current = true;
    if (!mountedRef.current) return;

    setThinking(true);
    await new Promise((r) => setTimeout(r, 650)); // small natural delay
    if (!mountedRef.current) return;

    const firstName = (authUser?.name || authUser?.username || "").split(" ")[0] || "";
    const nameStr = firstName ? `, ${firstName}` : "";
    const greeting = getGreeting();

    const greetMsg = {
      id: uid(),
      role: "ai",
      content: `${greeting}${nameStr}! 😊 What are you craving today?`,
    };
    setMsgs([greetMsg]);
    setThinking(false);

    speak(greetMsg.content, () => {
      if (mountedRef.current) scheduleListenRef.current?.(600);
    });
  }, [authUser, speak]);

  // ── Close chat ────────────────────────────────────────────────────────────
  const closeChat = useCallback(() => {
    setIsOpen(false);
    clearTimeout(autoListenTimer.current);
    window.speechSynthesis?.cancel();
    if (recRef.current) try { recRef.current.abort(); } catch {}
    setListening(false);
    setSpeaking(false);
    // Reset so every new open starts with a fresh greeting + clean conversation
    greeted.current = false;
    setMsgs([]);
    setCart([]);
    setLastRestaurants([]);
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearTimeout(autoListenTimer.current);
      window.speechSynthesis?.cancel();
      if (recRef.current) try { recRef.current.abort(); } catch {}
    };
  }, []);

  // ── Form submit (typed message) ───────────────────────────────────────────
  const handleSubmit = (e) => {
    e?.preventDefault();
    clearTimeout(autoListenTimer.current);
    if (listening) { try { recRef.current?.stop(); } catch {} }
    if (inputText.trim()) sendRef.current?.(inputText);
  };

  // ── Mic button ────────────────────────────────────────────────────────────
  const handleMicClick = () => {
    if (listening) {
      try { recRef.current?.stop(); } catch {}
    } else {
      clearTimeout(autoListenTimer.current);
      window.speechSynthesis?.cancel();
      startListenRef.current?.();
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  const cartTotal = cart.reduce((s, i) => s + i.price, 0);

  return (
    <>
      {/* ── Chat panel ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-80 sm:w-96 flex flex-col bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          style={{ height: 585, animation: "qbSlide 0.2s ease both" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg shrink-0">
              {speaking ? (
                <Waveform cls="text-white" />
              ) : listening ? (
                <Waveform cls="text-white" />
              ) : (
                "P"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Priya · QuickBite AI</p>
              <p className="text-xs opacity-80 truncate">
                {listening
                  ? "Listening… speak now 🎤"
                  : speaking
                  ? "Speaking…"
                  : thinking
                  ? "Thinking…"
                  : "Your personal food assistant"}
              </p>
            </div>
            {speaking && (
              <button
                onClick={() => { window.speechSynthesis?.cancel(); setSpeaking(false); }}
                title="Stop speaking"
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs shrink-0"
              >
                ⏹
              </button>
            )}
            <button
              onClick={closeChat}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Cart bar */}
          {cart.length > 0 && (
            <div className="px-3 py-2 bg-green-50 dark:bg-green-900/30 border-b border-green-100 dark:border-green-800 flex items-center justify-between shrink-0">
              <p className="text-xs font-medium text-green-700 dark:text-green-300">
                🛒 {cart.length} item{cart.length > 1 ? "s" : ""} · {fmtPrice(cartTotal)}
              </p>
              <button
                onClick={() =>
                  sendRef.current?.(
                    `I'd like to order: ${cart.map((i) => i.dishName).join(", ")}`
                  )
                }
                className="text-xs bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded-lg transition-colors"
              >
                Order these →
              </button>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-3 py-3 scroll-smooth">
            {msgs.length === 0 && !thinking && (
              <div className="flex flex-col items-center justify-center h-full opacity-40 gap-3">
                <span className="text-4xl">🤖</span>
                <p className="text-sm text-gray-400">Starting conversation…</p>
              </div>
            )}
            {msgs.map((m) => (
              <ChatBubble key={m.id} msg={m} onAdd={toggleCartItem} cart={cart} />
            ))}
            {thinking && (
              <div className="flex gap-2 items-center mb-2 qb-in">
                <PriyaAvatar />
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Listening indicator bar */}
          {listening && (
            <div className="px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border-t border-orange-100 dark:border-orange-800 flex items-center gap-2 shrink-0">
              <Waveform cls="text-orange-500" />
              <span className="text-xs text-orange-600 dark:text-orange-300 font-medium">
                Listening… speak now
              </span>
              {inputText && (
                <span className="text-xs text-gray-400 truncate max-w-[110px]">
                  {inputText}
                </span>
              )}
            </div>
          )}

          {/* Input row */}
          <form
            onSubmit={handleSubmit}
            className="px-3 py-2.5 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => clearTimeout(autoListenTimer.current)}
              placeholder={listening ? "Listening…" : "Type or tap 🎤 to speak"}
              disabled={listening}
              className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 dark:text-white placeholder-gray-400 disabled:opacity-60"
            />
            {voiceOk && (
              <button
                type="button"
                onClick={handleMicClick}
                title={listening ? "Stop" : "Speak"}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all shrink-0 ${
                  listening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800"
                }`}
              >
                {listening ? <Waveform cls="text-white" /> : "🎤"}
              </button>
            )}
            <button
              type="submit"
              disabled={!inputText.trim() || listening}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* ── FAB ────────────────────────────────────────────────────────── */}
      <button
        onClick={isOpen ? closeChat : openChat}
        className={`fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-gray-700 dark:bg-gray-600 scale-90"
            : "bg-gradient-to-br from-orange-500 to-pink-500 hover:scale-110"
        }`}
        aria-label="Chat with Priya"
      >
        {isOpen ? (
          <span className="text-white text-xl font-bold">✕</span>
        ) : listening ? (
          <Waveform cls="text-white" />
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>
    </>
  );
}
