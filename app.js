// ============================================
// J.A.R.V.I.S. v4.0
// Just A Rather Very Intelligent System
// By Gaurav Kumar — Revived 2026
// ============================================

class Jarvis {
  constructor() {
    // ---- DOM ----
    this.micBtn        = document.getElementById("micBtn");
    this.textInput     = document.getElementById("textInput");
    this.sendBtn       = document.getElementById("sendBtn");
    this.conversation  = document.getElementById("conversation");
    this.voiceWave     = document.getElementById("voiceWave");
    this.bootOverlay   = document.getElementById("bootOverlay");
    this.bootText      = document.getElementById("bootText");
    this.bootProgress  = document.getElementById("bootProgress");
    this.statusBadge   = document.getElementById("statusBadge");
    this.clockEl       = document.querySelector("#clock .status-value");
    this.batteryEl     = document.getElementById("battery");
    this.networkEl     = document.querySelector("#network .status-value");
    // Sidebar
    this.sidebar        = document.getElementById("sidebar");
    this.sidebarOverlay = document.getElementById("sidebarOverlay");
    this.sidebarToggle  = document.getElementById("sidebarToggle");
    this.chatList       = document.getElementById("chatList");

    // ---- State ----
    this.isListening    = false;
    this.isSpeaking     = false;
    this.recognition    = null;
    this.synth          = window.speechSynthesis;
    this.preferredVoice = null;
    this.notes          = JSON.parse(localStorage.getItem("jarvis_notes") || "[]");
    this.activeTimers   = [];
    this.userTitle      = localStorage.getItem("jarvis_title") || "Sir";
    // Chat history
    this.chats          = [];
    this.currentChatId  = null;
    this.currentMessages = [];
    this.sidebarOpen    = false;
    this._chatRestored  = false;

    // ---- Data ----
    this.jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs.",
      "There are only 10 types of people in the world: those who understand binary and those who don't.",
      "A SQL query walks into a bar, walks up to two tables and asks: Can I join you?",
      "Why do Java developers wear glasses? Because they can't C#.",
      "I told my computer I needed a break. Now it won't stop showing me Kit-Kat ads.",
      "How many programmers does it take to change a light bulb? None. That's a hardware problem.",
      "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
      "There's no place like 127.0.0.1.",
      "!false — it's funny because it's true.",
      "A programmer's wife tells him: Go to the store and buy a loaf of bread. If they have eggs, buy a dozen. He came back with 12 loaves.",
      "What's a programmer's favorite hangout place? Foo Bar.",
      "Why did the developer go broke? Because he used up all his cache.",
      "Debugging: being the detective in a crime movie where you are also the murderer.",
      "It works on my machine. Then we'll ship your machine.",
      "To understand what recursion is, you must first understand recursion.",
    ];

    this.quotes = [
      "The only way to do great work is to love what you do. — Steve Jobs",
      "Innovation distinguishes between a leader and a follower. — Steve Jobs",
      "Stay hungry, stay foolish. — Steve Jobs",
      "The best way to predict the future is to invent it. — Alan Kay",
      "Talk is cheap. Show me the code. — Linus Torvalds",
      "First, solve the problem. Then, write the code. — John Johnson",
      "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
      "Code is like humor. When you have to explain it, it's bad. — Cory House",
      "Simplicity is the soul of efficiency. — Austin Freeman",
      "The function of good software is to make the complex appear simple. — Grady Booch",
      "It's not a bug, it's an undocumented feature. — Anonymous",
      "The computer was born to solve problems that did not exist before. — Bill Gates",
    ];

    this.init();
  }

  // ---- Initialization ----

  init() {
    this.setupSpeechRecognition();
    this.setupEventListeners();
    this.startClock();
    this.updateBattery();
    this.updateNetwork();
    this.loadVoice();
    this.initChatHistory();
    this.boot();
  }

  // ---- Chat History ----

  loadChatIndex() {
    try {
      return JSON.parse(localStorage.getItem("jarvis_chats") || "[]");
    } catch { return []; }
  }

  saveChatIndex() {
    localStorage.setItem("jarvis_chats", JSON.stringify(this.chats));
  }

  loadChatMessages(id) {
    try {
      return JSON.parse(localStorage.getItem(`jarvis_chat_${id}`) || "[]");
    } catch { return []; }
  }

  saveChatMessages(id, messages) {
    localStorage.setItem(`jarvis_chat_${id}`, JSON.stringify(messages));
  }

  initChatHistory() {
    this.chats = this.loadChatIndex();
    const lastId = localStorage.getItem("jarvis_current");
    const existing = lastId && this.chats.find((c) => c.id === lastId);

    if (existing) {
      this.currentChatId  = lastId;
      this.currentMessages = this.loadChatMessages(lastId);
      if (this.currentMessages.length > 0) {
        this._chatRestored = true;
        this.currentMessages.forEach((m) => {
          this._renderMessage(m.content, m.role, m.time);
        });
        this.conversation.scrollTop = this.conversation.scrollHeight;
      }
    } else if (this.chats.length > 0) {
      const first = this.chats[0];
      this.currentChatId   = first.id;
      this.currentMessages = this.loadChatMessages(first.id);
      if (this.currentMessages.length > 0) {
        this._chatRestored = true;
        this.currentMessages.forEach((m) => {
          this._renderMessage(m.content, m.role, m.time);
        });
        this.conversation.scrollTop = this.conversation.scrollHeight;
      }
    } else {
      this._initFirstChat();
    }

    localStorage.setItem("jarvis_current", this.currentChatId);
    this.renderChatList();
  }

  _initFirstChat() {
    const id = `chat_${Date.now()}`;
    this.chats = [{ id, title: "New Chat", updatedAt: Date.now(), messageCount: 0 }];
    this.saveChatIndex();
    this.currentChatId   = id;
    this.currentMessages = [];
  }

  _updateChatMeta(sender, rawContent) {
    const chat = this.chats.find((c) => c.id === this.currentChatId);
    if (!chat) return;

    chat.updatedAt    = Date.now();
    chat.messageCount = this.currentMessages.length;

    if (chat.title === "New Chat" && sender === "user") {
      const plain = rawContent.replace(/<[^>]*>/g, "").trim();
      chat.title = plain.length > 52 ? plain.substring(0, 49) + "..." : plain || "New Chat";
    }

    // Keep current chat at top of list
    this.chats = [chat, ...this.chats.filter((c) => c.id !== this.currentChatId)];
    this.saveChatIndex();
    this.renderChatList();
  }

  createNewChat() {
    const id   = `chat_${Date.now()}`;
    const chat = { id, title: "New Chat", updatedAt: Date.now(), messageCount: 0 };
    this.chats.unshift(chat);
    this.saveChatIndex();
    this.currentChatId   = id;
    this.currentMessages = [];
    localStorage.setItem("jarvis_current", id);
    this.clearConversationUI();
    this.renderChatList();
    this.closeSidebar();

    const greeting = this.getGreeting();
    this.addMessage(greeting, "jarvis");
    this.speak(greeting);
  }

  switchToChat(id) {
    if (id === this.currentChatId) { this.closeSidebar(); return; }
    this.currentChatId   = id;
    this.currentMessages = this.loadChatMessages(id);
    localStorage.setItem("jarvis_current", id);
    this.clearConversationUI();
    this.currentMessages.forEach((m) => this._renderMessage(m.content, m.role, m.time));
    this.conversation.scrollTop = this.conversation.scrollHeight;
    this.renderChatList();
    this.closeSidebar();
  }

  deleteChat(id) {
    this.chats = this.chats.filter((c) => c.id !== id);
    localStorage.removeItem(`jarvis_chat_${id}`);
    this.saveChatIndex();

    if (id === this.currentChatId) {
      if (this.chats.length > 0) {
        this.switchToChat(this.chats[0].id);
      } else {
        this._initFirstChat();
        this.clearConversationUI();
        this.renderChatList();
        const greeting = this.getGreeting();
        this.addMessage(greeting, "jarvis");
        this.speak(greeting);
      }
    } else {
      this.renderChatList();
    }
  }

  renameChat(id) {
    const chat = this.chats.find((c) => c.id === id);
    if (!chat) return;
    const newTitle = prompt("Rename chat:", chat.title);
    if (newTitle && newTitle.trim()) {
      chat.title = newTitle.trim().substring(0, 60);
      this.saveChatIndex();
      this.renderChatList();
    }
  }

  renderChatList(filter = "") {
    const term     = filter.toLowerCase().trim();
    const filtered = term
      ? this.chats.filter((c) => c.title.toLowerCase().includes(term))
      : this.chats;

    this.chatList.innerHTML = "";

    if (filtered.length === 0) {
      this.chatList.innerHTML = `<div class="chat-empty">${term ? "No chats match." : "No chats yet."}</div>`;
      return;
    }

    filtered.forEach((chat) => {
      const item = document.createElement("div");
      item.className = `chat-item${chat.id === this.currentChatId ? " active" : ""}`;
      item.setAttribute("role", "listitem");

      const date = new Date(chat.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" });
      const count = chat.messageCount || 0;

      item.innerHTML = `
        <div class="chat-item-main">
          <div class="chat-item-title" title="${this.escapeHTML(chat.title)}">${this.escapeHTML(chat.title)}</div>
          <div class="chat-item-meta">${date} &middot; ${count} msg${count !== 1 ? "s" : ""}</div>
        </div>
        <div class="chat-item-actions" role="group" aria-label="Chat actions">
          <button class="chat-action-btn rename-btn" aria-label="Rename chat" title="Rename">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="chat-action-btn delete-btn" aria-label="Delete chat" title="Delete">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      `;

      item.querySelector(".chat-item-main").addEventListener("click", () => this.switchToChat(chat.id));
      item.querySelector(".rename-btn").addEventListener("click", (e) => { e.stopPropagation(); this.renameChat(chat.id); });
      item.querySelector(".delete-btn").addEventListener("click", (e) => { e.stopPropagation(); this.deleteChat(chat.id); });

      this.chatList.appendChild(item);
    });
  }

  toggleSidebar() {
    if (this.sidebarOpen) this.closeSidebar();
    else this.openSidebar();
  }

  openSidebar() {
    this.sidebarOpen = true;
    this.sidebar.classList.add("open");
    this.sidebarOverlay.classList.add("active");
    this.sidebarToggle.setAttribute("aria-expanded", "true");
  }

  closeSidebar() {
    this.sidebarOpen = false;
    this.sidebar.classList.remove("open");
    this.sidebarOverlay.classList.remove("active");
    this.sidebarToggle.setAttribute("aria-expanded", "false");
  }

  clearConversationUI() {
    this.conversation.innerHTML = "";
  }

  // ---- Voice Loading ----

  loadVoice() {
    const pickVoice = () => {
      const voices = this.synth.getVoices();
      const enGbMale = [
        "Google UK English Male",
        "Microsoft Ryan",
        "Microsoft Alfie",
        "Microsoft Oliver",
        "Microsoft George",
        "Daniel",
        "Arthur",
        "Malcolm",
      ];
      this.preferredVoice =
        voices.find((v) => enGbMale.some((name) => v.name.includes(name))) ||
        voices.find((v) => v.lang === "en-GB") ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
    };
    pickVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = pickVoice;
    }
  }

  // ---- Speech Recognition ----

  setupSpeechRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { document.body.classList.add("no-speech"); return; }

    this.recognition = new SR();
    this.recognition.lang            = "en-US";
    this.recognition.interimResults  = false;
    this.recognition.continuous      = false;

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      this.stopListening();
      this.addMessage(this.escapeHTML(transcript), "user");
      this.processCommand(transcript.toLowerCase().trim());
    };

    this.recognition.onerror = (event) => {
      this.stopListening();
      if (event.error === "no-speech") {
        this.addMessage("I didn't catch that. Shall we try again?", "jarvis");
      }
    };

    this.recognition.onend = () => this.stopListening();
  }

  // ---- Event Listeners ----

  setupEventListeners() {
    this.micBtn.addEventListener("click", () => {
      if (this.isListening) this.stopListening();
      else this.startListening();
    });

    this.textInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); this.handleTextInput(); }
    });

    this.sendBtn.addEventListener("click", () => this.handleTextInput());

    document.querySelectorAll(".action-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const command = chip.dataset.command;
        this.addMessage(command, "user");
        this.processCommand(command.toLowerCase());
      });
    });

    // Sidebar
    this.sidebarToggle.addEventListener("click", () => this.toggleSidebar());
    this.sidebarOverlay.addEventListener("click", () => this.closeSidebar());
    document.getElementById("sidebarClose").addEventListener("click", () => this.closeSidebar());
    document.getElementById("newChatBtn").addEventListener("click", () => this.createNewChat());
    document.getElementById("chatSearch").addEventListener("input", (e) => this.renderChatList(e.target.value));

    // Escape key closes sidebar
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.sidebarOpen) this.closeSidebar();
    });
  }

  handleTextInput() {
    const text = this.textInput.value.trim();
    if (!text) return;
    this._bootGreeting = null;
    this.textInput.value = "";
    this.addMessage(this.escapeHTML(text), "user");
    this.processCommand(text.toLowerCase());
  }

  // ---- Boot Sequence ----

  async boot() {
    const lines = [
      ["> Initializing J.A.R.V.I.S. v4.0...", 10],
      ["> Loading core systems...", 22],
      ["> Speech engine: ONLINE", 40],
      ["> Voice recognition: " + (this.recognition ? "ONLINE" : "UNAVAILABLE"), 58],
      ["> Network status: " + (navigator.onLine ? "CONNECTED" : "OFFLINE"), 72],
      ["> Memory: " + this.notes.length + " note(s) found.", 84],
      ["> Chat history: " + this.chats.length + " conversation(s).", 96],
      ["", 96],
      [`Welcome, ${this.userTitle}.`, 100],
    ];

    for (const [line, progress] of lines) {
      this.bootText.textContent += line + "\n";
      if (this.bootProgress) this.bootProgress.style.width = progress + "%";
      await this.delay(280);
    }

    await this.delay(700);
    this.bootOverlay.classList.add("hidden");
    await this.delay(400);

    if (!this._chatRestored) {
      const greeting = this.getGreeting();
      this.addMessage(greeting, "jarvis");

      this._bootGreeting = greeting;
      const speakOnBoot = () => {
        if (this._bootGreeting) { this.speak(this._bootGreeting); this._bootGreeting = null; }
      };
      document.addEventListener("click",   speakOnBoot, { once: true, capture: true });
      document.addEventListener("keydown", speakOnBoot, { once: true, capture: true });
    }
  }

  // ---- Speech ----

  speak(text) {
    this.synth.cancel();
    const utterance    = new SpeechSynthesisUtterance(text);
    utterance.rate     = 0.92;
    utterance.pitch    = 0.85;
    utterance.volume   = 1;
    if (this.preferredVoice) utterance.voice = this.preferredVoice;

    utterance.onstart = () => {
      this.isSpeaking = true;
      document.body.classList.add("speaking");
      this.voiceWave.classList.add("active");
      if (this.statusBadge) {
        this.statusBadge.textContent = "SPEAKING";
        this.statusBadge.className   = "status-badge speaking anim-fade-in";
      }
    };

    const onEnd = () => {
      this.isSpeaking = false;
      document.body.classList.remove("speaking");
      this.voiceWave.classList.remove("active");
      if (this.statusBadge) {
        this.statusBadge.textContent = "STANDBY";
        this.statusBadge.className   = "status-badge anim-fade-in";
      }
    };

    utterance.onend   = onEnd;
    utterance.onerror = onEnd;
    this.synth.speak(utterance);
  }

  startListening() {
    if (!this.recognition) return;
    this._bootGreeting = null;
    this.synth.cancel();
    this.isListening = true;
    document.body.classList.add("listening");
    this.voiceWave.classList.add("active");
    if (this.statusBadge) {
      this.statusBadge.textContent = "LISTENING";
      this.statusBadge.className   = "status-badge listening anim-fade-in";
    }
    this.recognition.start();
  }

  stopListening() {
    this.isListening = false;
    document.body.classList.remove("listening");
    this.voiceWave.classList.remove("active");
    if (this.statusBadge && !this.isSpeaking) {
      this.statusBadge.textContent = "STANDBY";
      this.statusBadge.className   = "status-badge anim-fade-in";
    }
    try { this.recognition?.stop(); } catch (e) { /* already stopped */ }
  }

  // ---- UI ----

  // Internal render only (no persistence) — used when loading saved chats
  _renderMessage(text, sender, providedTime = null) {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;

    if (sender === "system") {
      msg.innerHTML = `<div class="message-body">${text}</div>`;
    } else {
      const time = providedTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      msg.innerHTML = `
        <div class="message-header">
          <span class="sender">${sender === "jarvis" ? "JARVIS" : "You"}</span>
          <span class="timestamp">${time}</span>
        </div>
        <div class="message-body">${text}</div>
      `;
    }

    this.conversation.appendChild(msg);
    this.conversation.scrollTop = this.conversation.scrollHeight;
    return msg;
  }

  addMessage(text, sender = "jarvis") {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const msg  = this._renderMessage(text, sender, time);

    // Persist (skip system messages and empty strings)
    if (sender !== "system" && text && this.currentChatId) {
      this.currentMessages.push({ role: sender, content: text, time });
      this.saveChatMessages(this.currentChatId, this.currentMessages);
      this._updateChatMeta(sender, text);
    }

    return msg;
  }

  showThinking() {
    const msg = document.createElement("div");
    msg.className = "message jarvis";
    msg.id = "thinking";
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    msg.innerHTML = `
      <div class="message-header">
        <span class="sender">JARVIS</span>
        <span class="timestamp">${time}</span>
      </div>
      <div class="message-body">
        <div class="thinking-dots"><span></span><span></span><span></span></div>
      </div>
    `;
    this.conversation.appendChild(msg);
    this.conversation.scrollTop = this.conversation.scrollHeight;
    return msg;
  }

  removeThinking() {
    const el = document.getElementById("thinking");
    if (el) el.remove();
  }

  respond(text, alsoSpeak = true) {
    this.removeThinking();
    this.addMessage(text, "jarvis");
    if (alsoSpeak) {
      const cleanText = text.replace(/<[^>]*>/g, "");
      this.speak(cleanText);
    }
  }

  // ---- Status Bar ----

  startClock() {
    const update = () => {
      this.clockEl.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    };
    update();
    setInterval(update, 1000);
  }

  batteryIcon(level, charging) {
    const fillW     = Math.max(0, Math.min(12, (level / 100) * 12));
    const fillColor = level <= 20 ? "#E84040" : "currentColor";
    const bolt = charging
      ? `<path d="M10 2.5L7 7h3.5l-1.5 3.5 4.5-5.5H10l1-2.5z" fill="#F5A623" stroke="none"/>`
      : "";
    return `<svg aria-hidden="true" class="status-icon" width="18" height="11" viewBox="0 0 18 11" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><rect x="0.6" y="0.6" width="15.8" height="9.8" rx="1.8"/><rect x="16.6" y="3.2" width="1.4" height="4.6" rx="0.7" fill="currentColor" stroke="none"/><rect x="1.5" y="1.5" width="${fillW}" height="8" rx="1" fill="${fillColor}" stroke="none"/>${bolt}</svg>`;
  }

  async updateBattery() {
    try {
      if (!navigator.getBattery) return;
      const battery = await navigator.getBattery();
      const update  = () => {
        const level = Math.round(battery.level * 100);
        this.batteryEl.innerHTML = `${this.batteryIcon(level, battery.charging)}<span class="status-value">${level}%</span>`;
      };
      update();
      battery.addEventListener("levelchange",   update);
      battery.addEventListener("chargingchange", update);
    } catch (e) { /* Battery API not available */ }
  }

  updateNetwork() {
    const update = () => {
      this.networkEl.textContent = navigator.onLine ? "Online" : "Offline";
    };
    update();
    window.addEventListener("online",  update);
    window.addEventListener("offline", update);
  }

  // ---- Command Processing ----

  processCommand(input) {
    if (/^(call me|address me as|refer to me as)\s+/.test(input))           return this.handleSetTitle(input);
    if (/^(hello|hey|hi|howdy|greetings|good\s*(morning|afternoon|evening))/.test(input)) return this.handleGreeting();
    if (/who\s*are\s*you|what\s*are\s*you|your\s*name|about\s*yourself|introduce\s*yourself/.test(input)) return this.handleIdentity();
    if (/who\s*(made|created|built|developed)\s*you|your\s*(creator|developer|maker)/.test(input)) return this.handleCreator();
    if (/what\s*can\s*you\s*do|help|commands|abilities|features/.test(input)) return this.handleHelp();
    if (/what\s*time|current\s*time|time\s*(is\s*it|now|please)/.test(input)) return this.handleTime();
    if (/what.*date|today.*date|what\s*day|current\s*date/.test(input))        return this.handleDate();
    if (/weather|temperature|forecast|how.*outside/.test(input))              return this.handleWeather();
    if (
      /^(calculate|compute|solve)\s+[\d\s+\-*/^.()%]+$/.test(input) ||
      /^(what\s+is\s+)[\d\s+\-*/^.()%]+$/.test(input) ||
      /^[\d\s+\-*/^.()%]+$/.test(input)
    ) return this.handleMath(input);
    if (/^open\s+/.test(input))                                              return this.handleOpenSite(input.replace(/^open\s+/, "").trim());
    if (/^(search|google|look\s*up)\s+/.test(input)) {
      const query = input.replace(/^(search|google|look\s*up)\s+(for\s+)?/, "").trim();
      return this.handleSearch(query);
    }
    if (/^(play|youtube)\s+/.test(input)) {
      const query = input.replace(/^(play|youtube)\s+/, "").trim();
      return this.handleYouTubeSearch(query);
    }
    if (/wikipedia/.test(input))                                              return this.handleWikipedia(input.replace(/wikipedia/, "").trim());
    if (/joke|make\s*me\s*laugh|something\s*funny/.test(input))              return this.handleJoke();
    if (/quote|inspire|motivation|wisdom/.test(input))                       return this.handleQuote();
    if (/^(save\s*note|remember|note\s*down|jot\s*down)\s+/.test(input)) {
      const note = input.replace(/^(save\s*note|remember|note\s*down|jot\s*down)\s+/, "").trim();
      return this.handleSaveNote(note);
    }
    if (/read.*notes|my\s*notes|show.*notes|list.*notes/.test(input))        return this.handleReadNotes();
    if (/clear.*notes|delete.*notes|erase.*notes/.test(input))               return this.handleClearNotes();
    if (/battery/.test(input))                                                return this.handleBatteryInfo();
    if (/network|internet|online|connectivity/.test(input))                  return this.handleNetworkInfo();
    if (/password|passkey/.test(input))                                       return this.handlePassword();
    if (/flip.*coin|coin.*flip|heads\s*or\s*tails/.test(input))             return this.handleCoinFlip();
    if (/roll.*dice|dice.*roll/.test(input))                                  return this.handleDiceRoll();
    if (/random\s*number/.test(input))                                        return this.handleRandomNumber(input);
    if (/set.*timer|timer.*for|remind\s*me\s*in/.test(input))               return this.handleTimer(input);
    if (/full\s*screen/.test(input))                                          return this.handleFullscreen();
    if (/how\s*are\s*you|how.*doing|how.*feel/.test(input))                  return this.handleHowAreYou();
    if (/thank|thanks|appreciate/.test(input))                               return this.handleThanks();
    if (/you.*smart|good\s*job|well\s*done|you.*awesome|you.*amazing|you.*great/.test(input)) return this.handleCompliment();
    if (/bye|goodbye|see\s*you|shut\s*down|exit|sleep|good\s*night/.test(input)) return this.handleGoodbye();
    // Everything else goes to Groq (including what/who/why/how questions)
    this.askGroq(input);
  }

  // ---- Groq AI ----

  async askGroq(question) {
    this.showThinking();
    try {
      // Build conversation history for context (last 20 messages, HTML stripped)
      const history = this.currentMessages
        .slice(-20)
        .filter((m) => m.role === "user" || m.role === "jarvis")
        .map((m) => ({
          role: m.role === "jarvis" ? "assistant" : "user",
          content: m.content.replace(/<[^>]*>/g, "").trim(),
        }));

      const res = await fetch(JARVIS_CONFIG.askEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, userTitle: this.userTitle }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = await res.json();
      this.respond(this.escapeHTML(data.answer));
    } catch (e) {
      this.removeThinking();
      this.respond(
        `My intelligence systems are temporarily unavailable, ${this.userTitle}. ` +
        `<a href="https://www.google.com/search?q=${encodeURIComponent(question)}" ` +
        `target="_blank" style="color:var(--primary)">Search instead</a>.`,
        false
      );
    }
  }

  // ---- Command Handlers ----

  getGreeting() {
    const hour      = new Date().getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    const greetings = [
      `Good ${timeOfDay}, ${this.userTitle}. All systems are operational.`,
      `Good ${timeOfDay}, ${this.userTitle}. J.A.R.V.I.S. online and awaiting your command.`,
      `Good ${timeOfDay}. All systems nominal, ${this.userTitle}.`,
    ];
    return this.pickRandom(greetings);
  }

  handleGreeting() {
    const responses = [
      "Good to hear from you. How may I be of assistance?",
      `Hello, ${this.userTitle}. All systems ready.`,
      "At your service. What do you need?",
      "Always a pleasure. How can I help?",
    ];
    this.respond(this.pickRandom(responses));
  }

  handleIdentity() {
    this.respond(
      `I am J.A.R.V.I.S. — Just A Rather Very Intelligent System, ${this.userTitle}. ` +
      "A web-based AI assistant built as a tribute project by Gaurav Kumar. I run on a large language model and can reason, write, analyse, debug, and advise on most topics. " +
      "To be precise about what I am and am not: I remember everything within our current conversation, but nothing carries over to a new chat. " +
      "I can read your battery level and online status from the browser, but I have no access to CPU, RAM, uptime, files, email, your calendar, or any application — and I cannot take actions on your system. " +
      "I don't browse the live web. What I offer is reasoning, not real-time data. Version 4.0."
    );
  }

  handleSetTitle(input) {
    const raw = input
      .replace(/^(call me|address me as|refer to me as)\s+/i, "")
      .trim()
      .replace(/[^a-zA-Z'\s-]/g, "")
      .trim();
    if (!raw) return this.respond(`I'll need a title to use, ${this.userTitle}.`);
    const title = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    this.userTitle = title;
    localStorage.setItem("jarvis_title", title);
    this.respond(`Understood. I'll address you as "${title}" from now on.`);
  }

  handleCreator() {
    this.respond(
      "Originally built as a college project by Gaurav Kumar and Ameen James. " +
      "Revived and upgraded to the current iteration solo by Gaurav Kumar, several years later. " +
      "Version 4.0, I'm pleased to report."
    );
  }

  handleHelp() {
    const help = `Here's what I can do for you, ${this.userTitle}:<br><br>
      <strong>Conversation & AI:</strong> questions, reasoning, coding, writing, analysis — with full in-session memory<br>
      <strong>General:</strong> time, date, weather<br>
      <strong>Search:</strong> "search [query]", "open [website]", "play [video]", "wikipedia [topic]"<br>
      <strong>Tools:</strong> calculator, password generator, coin flip, dice roll, timer<br>
      <strong>Notes:</strong> "save note [text]", "read my notes", "clear notes"<br>
      <strong>System:</strong> battery status (live), network status (live), fullscreen<br>
      <strong>Fun:</strong> jokes, motivational quotes<br><br>
      <strong>What I cannot do:</strong><br>
      &bull; Browse the internet or access live data<br>
      &bull; Remember anything across separate conversations<br>
      &bull; Access your files, email, calendar, or applications<br>
      &bull; Execute code or take actions on your system<br>
      &bull; Report CPU usage, RAM, uptime, or precise network speed — I only have battery level and online/offline status from the browser<br><br>
      You can speak or type your commands.`;
    this.respond(help, false);
    this.speak(`Here's an overview of my capabilities, ${this.userTitle}. I can handle search, tools, notes, live battery and network status, AI conversation, and more. I should note I cannot browse the web, access files, or remember things between separate chats.`);
  }

  handleTime() {
    const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
    this.respond(`The current time is <strong>${time}</strong>, ${this.userTitle}.`);
  }

  handleDate() {
    const date = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    this.respond(`Today is <strong>${date}</strong>, ${this.userTitle}.`);
  }

  async handleWeather() {
    this.showThinking();
    try {
      const response = await fetch("https://wttr.in/?format=j1", { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("API error");
      const data    = await response.json();
      const current = data.current_condition[0];
      const area    = data.nearest_area[0];
      const city    = area.areaName[0].value;
      const country = area.country[0].value;
      this.respond(
        `Weather for <strong>${city}, ${country}</strong>:<br>` +
        `${current.weatherDesc[0].value}, <strong>${current.temp_C}°C</strong> (feels like ${current.FeelsLikeC}°C)<br>` +
        `Humidity: ${current.humidity}% | Wind: ${current.windspeedKmph} km/h`
      );
    } catch (e) {
      this.respond(`Weather data is unavailable at the moment. You may wish to check your connection, ${this.userTitle}.`);
    }
  }

  handleMath(input) {
    try {
      const expression = input.replace(/^(calculate|compute|solve|what\s*is)\s+/, "").trim();
      const sanitized  = expression.replace(/[^0-9+\-*/.()%\s]/g, "");
      if (!sanitized) return this.respond("I'll need a valid expression to compute, Sir.");
      const result = Function('"use strict"; return (' + sanitized + ")")();
      if (typeof result !== "number" || !isFinite(result)) {
        return this.respond("That expression doesn't resolve to a finite number.");
      }
      this.respond(`<strong>${sanitized}</strong> = <strong>${result}</strong>`);
    } catch (e) {
      this.respond("That expression couldn't be evaluated. Perhaps a simpler form?");
    }
  }

  handleOpenSite(site) {
    const sites = {
      google: "https://google.com", youtube: "https://youtube.com", github: "https://github.com",
      stackoverflow: "https://stackoverflow.com", linkedin: "https://linkedin.com",
      twitter: "https://twitter.com", x: "https://x.com", instagram: "https://instagram.com",
      facebook: "https://facebook.com", reddit: "https://reddit.com", spotify: "https://spotify.com",
      netflix: "https://netflix.com", amazon: "https://amazon.com", whatsapp: "https://web.whatsapp.com",
      gmail: "https://mail.google.com", chatgpt: "https://chat.openai.com", claude: "https://claude.ai",
      maps: "https://maps.google.com", drive: "https://drive.google.com", notion: "https://notion.so",
      figma: "https://figma.com", canva: "https://canva.com",
    };
    const key = site.toLowerCase().replace(/\s+/g, "");
    if (sites[key]) {
      window.open(sites[key], "_blank");
      this.respond(`Opening <strong>${site}</strong>, ${this.userTitle}.`);
    } else {
      const url = site.includes(".") ? `https://${site}` : null;
      if (url) {
        window.open(url, "_blank");
        this.respond(`Opening <strong>${site}</strong>, ${this.userTitle}.`);
      } else {
        this.respond(`I don't recognise that one. Try "open google" or "open youtube"?`);
      }
    }
  }

  handleSearch(query) {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    this.respond(`Searching Google for "<strong>${this.escapeHTML(query)}</strong>", ${this.userTitle}.`);
  }

  handleYouTubeSearch(query) {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
    this.respond(`Searching YouTube for "<strong>${this.escapeHTML(query)}</strong>", ${this.userTitle}.`);
  }

  handleWikipedia(query) {
    const term = query.replace(/^(search|for|about)\s+/i, "").trim() || "Main_Page";
    window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(term)}`, "_blank");
    this.respond(`Opening Wikipedia article on "<strong>${this.escapeHTML(term)}</strong>", ${this.userTitle}.`);
  }

  handleJoke()  { this.respond(this.pickRandom(this.jokes)); }
  handleQuote() { this.respond(`"${this.pickRandom(this.quotes)}"`); }

  handleSaveNote(note) {
    this.notes.push({ text: note, time: new Date().toLocaleString() });
    localStorage.setItem("jarvis_notes", JSON.stringify(this.notes));
    this.respond(`Note saved, ${this.userTitle}. You now have <strong>${this.notes.length}</strong> note${this.notes.length !== 1 ? "s" : ""}.`);
  }

  handleReadNotes() {
    if (this.notes.length === 0) return this.respond(`You have no notes yet, ${this.userTitle}.`);
    const notesList = this.notes
      .map((n, i) => `<strong>${i + 1}.</strong> ${this.escapeHTML(n.text)} <span style="color:var(--text-dim);font-size:0.75rem;">(${n.time})</span>`)
      .join("<br>");
    this.respond(`Your notes, ${this.userTitle}:<br><br>${notesList}`, false);
    this.speak(`You have ${this.notes.length} note${this.notes.length !== 1 ? "s" : ""}, ${this.userTitle}.`);
  }

  handleClearNotes() {
    const count = this.notes.length;
    this.notes  = [];
    localStorage.removeItem("jarvis_notes");
    this.respond(
      count > 0
        ? `All ${count} note${count !== 1 ? "s" : ""} cleared, ${this.userTitle}.`
        : `There were no notes to clear, ${this.userTitle}.`
    );
  }

  async handleBatteryInfo() {
    try {
      if (!navigator.getBattery) return this.respond("Battery information isn't available in this browser.");
      const battery  = await navigator.getBattery();
      const level    = Math.round(battery.level * 100);
      const charging = battery.charging;
      const timeLeft = charging
        ? battery.chargingTime !== Infinity ? `Full charge in ${Math.round(battery.chargingTime / 60)} minutes.` : ""
        : battery.dischargingTime !== Infinity ? `Approximately ${Math.round(battery.dischargingTime / 60)} minutes remaining.` : "";
      this.respond(`Battery level: <strong>${level}%</strong> ${charging ? "(Charging)" : "(On battery)"}. ${timeLeft}`);
    } catch (e) {
      this.respond("Battery data couldn't be accessed.");
    }
  }

  handleNetworkInfo() {
    let info = `You are currently <strong>${navigator.onLine ? "online" : "offline"}</strong>.`;
    if (navigator.connection) {
      const conn = navigator.connection;
      if (conn.effectiveType) info += ` Connection type: <strong>${conn.effectiveType.toUpperCase()}</strong>.`;
      if (conn.downlink)      info += ` Browser-estimated speed: ~${conn.downlink} Mbps (this is an approximation, not a speed test).`;
    }
    info += ` Note: I only have access to online/offline status and the browser's connection hint — I cannot measure actual throughput or ping.`;
    this.respond(info);
  }

  handlePassword() {
    const chars    = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_-+=";
    const length   = 16;
    let password   = "";
    const array    = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) password += chars[array[i] % chars.length];
    navigator.clipboard.writeText(password).catch(() => {});
    this.respond(`Here's a secure 16-character password:<br><code>${password}</code><br>Copied to clipboard, ${this.userTitle}.`);
  }

  handleCoinFlip() {
    this.respond(`The coin shows <strong>${Math.random() < 0.5 ? "Heads" : "Tails"}</strong>, ${this.userTitle}.`);
  }

  handleDiceRoll() {
    this.respond(`You rolled a <strong>${Math.floor(Math.random() * 6) + 1}</strong>, ${this.userTitle}.`);
  }

  handleRandomNumber(input) {
    const nums = input.match(/\d+/g);
    let min = 1, max = 100;
    if (nums && nums.length >= 2) { min = parseInt(nums[0]); max = parseInt(nums[1]); }
    else if (nums && nums.length === 1) { max = parseInt(nums[0]); }
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    this.respond(`Random number between ${min} and ${max}: <strong>${result}</strong>.`);
  }

  handleTimer(input) {
    const match = input.match(/(\d+)\s*(second|sec|minute|min|hour|hr)/i);
    if (!match) return this.respond(`I'll need a duration. For example — "set timer for 5 minutes".`);

    const value     = parseInt(match[1]);
    const unit      = match[2].toLowerCase();
    const ms        = unit.startsWith("sec") ? value * 1000 : unit.startsWith("min") ? value * 60000 : value * 3600000;
    const unitLabel = unit.startsWith("sec") ? "second" : unit.startsWith("min") ? "minute" : "hour";
    const label     = `${value} ${unitLabel}${value !== 1 ? "s" : ""}`;

    this.respond(`Timer set for <strong>${label}</strong>. I'll notify you when it's done, ${this.userTitle}.`);

    const timerId = setTimeout(() => {
      this.respond(`Timer complete! <strong>${label}</strong> have elapsed, ${this.userTitle}.`);
      this.speak(`${this.userTitle}, your ${label} timer is complete.`);
      if (Notification.permission === "granted") {
        new Notification("J.A.R.V.I.S. Timer", { body: `${label} timer complete!` });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }, ms);

    this.activeTimers.push(timerId);
  }

  handleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      this.respond(`Entering fullscreen mode, ${this.userTitle}.`);
    } else {
      document.exitFullscreen();
      this.respond(`Exiting fullscreen mode, ${this.userTitle}.`);
    }
  }

  handleHowAreYou() {
    const responses = [
      `All systems are running optimally. Thank you for asking, ${this.userTitle}.`,
      "Operating within normal parameters. Ready for any task.",
      "Functioning at full capacity. How may I assist?",
      `Never better. My circuits are rather content, ${this.userTitle}.`,
    ];
    this.respond(this.pickRandom(responses));
  }

  handleThanks() {
    const responses = [
      `My pleasure, ${this.userTitle}.`,
      "Always at your service.",
      "Think nothing of it.",
      `Glad I could be of help, ${this.userTitle}.`,
    ];
    this.respond(this.pickRandom(responses));
  }

  handleCompliment() {
    const responses = [
      `You're most kind, ${this.userTitle}. I'm only as capable as my programming allows.`,
      "Thank you. I do try to maintain standards.",
      `I appreciate that, ${this.userTitle}. Your satisfaction is the primary directive.`,
      "Thank you. I'll note that in my performance log.",
    ];
    this.respond(this.pickRandom(responses));
  }

  handleGoodbye() {
    const responses = [
      `Goodbye, ${this.userTitle}. J.A.R.V.I.S. standing by whenever you need me.`,
      "Until next time. I'll keep everything running in your absence.",
      `Signing off. Have a good one, ${this.userTitle}.`,
      "Rest well. I'll be here when you return.",
    ];
    this.respond(this.pickRandom(responses));
  }

  // ---- Utilities ----

  pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
}

// ---- Launch ----
document.addEventListener("DOMContentLoaded", () => { new Jarvis(); });
