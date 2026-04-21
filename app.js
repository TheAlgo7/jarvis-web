// ============================================
// J.A.R.V.I.S. v3.1
// Just A Rather Very Intelligent System
// By Gaurav Kumar & Ameen James — Revived 2026
// ============================================

class Jarvis {
  constructor() {
    // DOM
    this.micBtn = document.getElementById("micBtn");
    this.textInput = document.getElementById("textInput");
    this.sendBtn = document.getElementById("sendBtn");
    this.conversation = document.getElementById("conversation");
    this.voiceWave = document.getElementById("voiceWave");
    this.bootOverlay = document.getElementById("bootOverlay");
    this.bootText = document.getElementById("bootText");
    this.bootProgress = document.getElementById("bootProgress");
    this.statusBadge = document.getElementById("statusBadge");
    this.clockEl = document.querySelector("#clock .status-value");
    this.batteryEl = document.getElementById("battery");
    this.networkEl = document.querySelector("#network .status-value");

    // State
    this.isListening = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.synth = window.speechSynthesis;
    this.preferredVoice = null;
    this.notes = JSON.parse(localStorage.getItem("jarvis_notes") || "[]");
    this.activeTimers = [];

    // Data
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
    this.boot();
  }

  loadVoice() {
    const pickVoice = () => {
      const voices = this.synth.getVoices();

      // en-GB male voices in preference order — targeting Paul Bettany's JARVIS register
      // Names vary by browser/OS: Chrome, Edge (Neural), macOS, Windows Desktop
      const enGbMale = [
        "Google UK English Male",  // Chrome
        "Microsoft Ryan",          // Edge Neural — en-GB male
        "Microsoft Alfie",         // Edge Neural — en-GB male
        "Microsoft Oliver",        // Edge Neural — en-GB male
        "Microsoft George",        // Windows — en-GB male
        "Daniel",                  // macOS/iOS — en-GB
        "Arthur",                  // macOS — en-GB (newer)
        "Malcolm",                 // some Linux/Windows systems
      ];

      // 1. Try known en-GB male voices
      this.preferredVoice =
        voices.find((v) => enGbMale.some((name) => v.name.includes(name))) ||
        // 2. Any en-GB voice
        voices.find((v) => v.lang === "en-GB") ||
        // 3. Any English voice
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
    };

    pickVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = pickVoice;
    }
  }

  setupSpeechRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      document.body.classList.add("no-speech");
      return;
    }

    this.recognition = new SR();
    this.recognition.lang = "en-US";
    this.recognition.interimResults = false;
    this.recognition.continuous = false;

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      this.stopListening();
      this.addMessage(this.escapeHTML(transcript), "user");
      this.processCommand(transcript.toLowerCase().trim());
    };

    this.recognition.onerror = (event) => {
      this.stopListening();
      if (event.error === "no-speech") {
        this.addMessage(
          "I didn't catch anything, Sir. Please try again.",
          "jarvis"
        );
      }
    };

    this.recognition.onend = () => {
      this.stopListening();
    };
  }

  setupEventListeners() {
    // Mic button
    this.micBtn.addEventListener("click", () => {
      if (this.isListening) {
        this.stopListening();
      } else {
        this.startListening();
      }
    });

    // Text input
    this.textInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleTextInput();
      }
    });

    // Send button
    this.sendBtn.addEventListener("click", () => {
      this.handleTextInput();
    });

    // Quick actions
    document.querySelectorAll(".action-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const command = chip.dataset.command;
        this.addMessage(command, "user");
        this.processCommand(command.toLowerCase());
      });
    });
  }

  handleTextInput() {
    const text = this.textInput.value.trim();
    if (!text) return;
    this.textInput.value = "";
    this.addMessage(this.escapeHTML(text), "user");
    this.processCommand(text.toLowerCase());
  }

  // ---- Boot Sequence ----

  async boot() {
    const lines = [
      ["> Initializing J.A.R.V.I.S. v3.1...", 10],
      ["> Loading core systems...", 22],
      ["> Speech engine: ONLINE", 40],
      ["> Voice recognition: " + (this.recognition ? "ONLINE" : "UNAVAILABLE"), 58],
      ["> Network status: " + (navigator.onLine ? "CONNECTED" : "OFFLINE"), 72],
      ["> Memory: " + this.notes.length + " note(s) found.", 84],
      ["> All systems operational.", 96],
      ["", 96],
      ["Welcome, Sir.", 100],
    ];

    for (const [line, progress] of lines) {
      this.bootText.textContent += line + "\n";
      if (this.bootProgress) this.bootProgress.style.width = progress + "%";
      await this.delay(280);
    }

    await this.delay(700);
    this.bootOverlay.classList.add("hidden");

    await this.delay(1500);

    // Greet
    const greeting = this.getGreeting();
    this.addMessage(greeting, "jarvis");
    this.speak(greeting);
  }

  // ---- Speech ----

  speak(text) {
    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = 0.92;  // measured, deliberate — Paul Bettany's JARVIS cadence
    utterance.pitch = 0.85;  // lower register — authoritative, not robotic
    utterance.volume = 1;
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      document.body.classList.add("speaking");
      this.voiceWave.classList.add("active");
      if (this.statusBadge) {
        this.statusBadge.textContent = "SPEAKING";
        this.statusBadge.className = "status-badge speaking anim-fade-in";
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      document.body.classList.remove("speaking");
      this.voiceWave.classList.remove("active");
      if (this.statusBadge) {
        this.statusBadge.textContent = "STANDBY";
        this.statusBadge.className = "status-badge anim-fade-in";
      }
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      document.body.classList.remove("speaking");
      this.voiceWave.classList.remove("active");
      if (this.statusBadge) {
        this.statusBadge.textContent = "STANDBY";
        this.statusBadge.className = "status-badge anim-fade-in";
      }
    };

    this.synth.speak(utterance);
  }

  startListening() {
    if (!this.recognition) return;
    this.synth.cancel();
    this.isListening = true;
    document.body.classList.add("listening");
    this.voiceWave.classList.add("active");
    if (this.statusBadge) {
      this.statusBadge.textContent = "LISTENING";
      this.statusBadge.className = "status-badge listening anim-fade-in";
    }
    this.recognition.start();
  }

  stopListening() {
    this.isListening = false;
    document.body.classList.remove("listening");
    this.voiceWave.classList.remove("active");
    if (this.statusBadge && !this.isSpeaking) {
      this.statusBadge.textContent = "STANDBY";
      this.statusBadge.className = "status-badge anim-fade-in";
    }
    try {
      this.recognition?.stop();
    } catch (e) {
      /* already stopped */
    }
  }

  // ---- UI ----

  addMessage(text, sender = "jarvis") {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;

    if (sender === "system") {
      msg.innerHTML = `<div class="message-body">${text}</div>`;
    } else {
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
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

  showThinking() {
    const msg = this.addMessage("", "jarvis");
    msg.querySelector(".message-body").innerHTML = `
      <div class="thinking-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    msg.id = "thinking";
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
      // Strip HTML tags for speech
      const cleanText = text.replace(/<[^>]*>/g, "");
      this.speak(cleanText);
    }
  }

  // ---- Status Bar ----

  startClock() {
    const update = () => {
      this.clockEl.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };
    update();
    setInterval(update, 1000);
  }

  batteryIcon(level, charging) {
    const fillW = Math.max(0, Math.min(12, (level / 100) * 12));
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
      const update = () => {
        const level = Math.round(battery.level * 100);
        this.batteryEl.innerHTML = `${this.batteryIcon(level, battery.charging)}<span class="status-value">${level}%</span>`;
      };
      update();
      battery.addEventListener("levelchange", update);
      battery.addEventListener("chargingchange", update);
    } catch (e) {
      /* Battery API not available */
    }
  }

  updateNetwork() {
    const update = () => {
      this.networkEl.textContent = navigator.onLine ? "Online" : "Offline";
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
  }

  // ---- Command Processing ----

  processCommand(input) {
    // Greetings
    if (/^(hello|hey|hi|howdy|greetings|good\s*(morning|afternoon|evening))/.test(input)) {
      return this.handleGreeting();
    }

    // Identity
    if (/who\s*are\s*you|what\s*are\s*you|your\s*name|about\s*yourself|introduce\s*yourself/.test(input)) {
      return this.handleIdentity();
    }

    // Creator
    if (/who\s*(made|created|built|developed)\s*you|your\s*(creator|developer|maker)/.test(input)) {
      return this.handleCreator();
    }

    // Help
    if (/what\s*can\s*you\s*do|help|commands|abilities|features/.test(input)) {
      return this.handleHelp();
    }

    // Time
    if (/what\s*time|current\s*time|time\s*(is\s*it|now|please)/.test(input)) {
      return this.handleTime();
    }

    // Date
    if (/what.*date|today.*date|what\s*day|current\s*date/.test(input)) {
      return this.handleDate();
    }

    // Weather
    if (/weather|temperature|forecast|how.*outside/.test(input)) {
      return this.handleWeather();
    }

    // Calculator / Math — catches "calculate 2+2", "what is 10 * 5", "100/4", etc.
    if (/^(calculate|compute|solve)\s+[\d\s+\-*/^.()%]+$/.test(input) ||
        /^(what\s+is\s+)[\d\s+\-*/^.()%]+$/.test(input) ||
        /^[\d\s+\-*/^.()%]+$/.test(input)) {
      return this.handleMath(input);
    }

    // Open websites
    if (/^open\s+/.test(input)) {
      return this.handleOpenSite(input.replace(/^open\s+/, "").trim());
    }

    // Search
    if (/^(search|google|look\s*up)\s+/.test(input)) {
      const query = input.replace(/^(search|google|look\s*up)\s+(for\s+)?/, "").trim();
      return this.handleSearch(query);
    }

    // YouTube search
    if (/^(play|youtube)\s+/.test(input)) {
      const query = input.replace(/^(play|youtube)\s+/, "").trim();
      return this.handleYouTubeSearch(query);
    }

    // Wikipedia
    if (/wikipedia/.test(input)) {
      return this.handleWikipedia(input.replace(/wikipedia/, "").trim());
    }

    // Jokes
    if (/joke|make\s*me\s*laugh|something\s*funny/.test(input)) {
      return this.handleJoke();
    }

    // Quotes
    if (/quote|inspire|motivation|wisdom/.test(input)) {
      return this.handleQuote();
    }

    // Notes — save
    if (/^(save\s*note|remember|note\s*down|jot\s*down)\s+/.test(input)) {
      const note = input.replace(/^(save\s*note|remember|note\s*down|jot\s*down)\s+/, "").trim();
      return this.handleSaveNote(note);
    }

    // Notes — read
    if (/read.*notes|my\s*notes|show.*notes|list.*notes/.test(input)) {
      return this.handleReadNotes();
    }

    // Notes — clear
    if (/clear.*notes|delete.*notes|erase.*notes/.test(input)) {
      return this.handleClearNotes();
    }

    // Battery
    if (/battery/.test(input)) {
      return this.handleBatteryInfo();
    }

    // Network
    if (/network|internet|online|connectivity/.test(input)) {
      return this.handleNetworkInfo();
    }

    // Password
    if (/password|passkey/.test(input)) {
      return this.handlePassword();
    }

    // Coin flip
    if (/flip.*coin|coin.*flip|heads\s*or\s*tails/.test(input)) {
      return this.handleCoinFlip();
    }

    // Dice roll
    if (/roll.*dice|dice.*roll/.test(input)) {
      return this.handleDiceRoll();
    }

    // Random number
    if (/random\s*number/.test(input)) {
      return this.handleRandomNumber(input);
    }

    // Timer
    if (/set.*timer|timer.*for|remind\s*me\s*in/.test(input)) {
      return this.handleTimer(input);
    }

    // Fullscreen
    if (/full\s*screen/.test(input)) {
      return this.handleFullscreen();
    }

    // How are you
    if (/how\s*are\s*you|how.*doing|how.*feel/.test(input)) {
      return this.handleHowAreYou();
    }

    // Thank you
    if (/thank|thanks|appreciate/.test(input)) {
      return this.handleThanks();
    }

    // Compliments
    if (/you.*smart|good\s*job|well\s*done|you.*awesome|you.*amazing|you.*great/.test(input)) {
      return this.handleCompliment();
    }

    // Goodbye
    if (/bye|goodbye|see\s*you|shut\s*down|exit|sleep|good\s*night/.test(input)) {
      return this.handleGoodbye();
    }

    // What is / Who is / Why / How — ask Groq instead of opening Google
    if (/^(what|who|where|when|why|how)\s+/.test(input)) {
      return this.askGroq(input);
    }

    // Fallback — ask Groq instead of opening Google
    this.askGroq(input);
  }

  // ---- Groq AI ----

  async askGroq(question) {
    this.showThinking();
    try {
      const res = await fetch(JARVIS_CONFIG.askEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = await res.json();
      this.respond(this.escapeHTML(data.answer));
    } catch (e) {
      this.removeThinking();
      this.respond(
        "My intelligence systems are temporarily unavailable, Sir. " +
        `<a href="https://www.google.com/search?q=${encodeURIComponent(question)}" ` +
        `target="_blank" style="color:var(--primary)">Search instead</a>.`,
        false
      );
    }
  }

  // ---- Command Handlers ----

  getGreeting() {
    const hour = new Date().getHours();
    const timeOfDay =
      hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    const greetings = [
      `Good ${timeOfDay}, Sir. All systems are operational. How may I assist you?`,
      `Good ${timeOfDay}, Sir. J.A.R.V.I.S. online and ready. What can I do for you?`,
      `Good ${timeOfDay}, Sir. At your service.`,
    ];
    return this.pickRandom(greetings);
  }

  handleGreeting() {
    const responses = [
      "Hello Sir, how may I assist you today?",
      "Good to see you, Sir. What can I do for you?",
      "At your service, Sir. What do you need?",
      "Hello Sir. All systems ready. How can I help?",
    ];
    this.respond(this.pickRandom(responses));
  }

  handleIdentity() {
    this.respond(
      "I am J.A.R.V.I.S. — Just A Rather Very Intelligent System. " +
        "I'm your personal AI assistant, built to help you with tasks, " +
        "answer questions, and make your digital life easier. Version 3.1, Sir."
    );
  }

  handleCreator() {
    this.respond(
      "I was originally built by Gaurav Kumar and Ameen James as a college project. " +
        "They've since revived and upgraded me to version 2.0 with modern capabilities. " +
        "Quite the journey, Sir."
    );
  }

  handleHelp() {
    const help = `Here's what I can do for you, Sir:<br><br>
      <strong>General:</strong> greetings, time, date, weather<br>
      <strong>Search:</strong> "search [query]", "open [website]", "play [video]", "wikipedia [topic]"<br>
      <strong>Tools:</strong> calculator, password generator, coin flip, dice roll, timer<br>
      <strong>Notes:</strong> "save note [text]", "read my notes", "clear notes"<br>
      <strong>System:</strong> battery status, network info, fullscreen<br>
      <strong>Fun:</strong> jokes, motivational quotes<br><br>
      You can speak or type your commands.`;
    this.respond(help, false);
    this.speak("Here's an overview of my capabilities, Sir. I can handle search, tools, notes, system info, and more. Just ask.");
  }

  handleTime() {
    const time = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
    this.respond(`The current time is <strong>${time}</strong>, Sir.`);
  }

  handleDate() {
    const now = new Date();
    const date = now.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    this.respond(`Today is <strong>${date}</strong>, Sir.`);
  }

  async handleWeather() {
    this.showThinking();
    try {
      const response = await fetch("https://wttr.in/?format=j1", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      const current = data.current_condition[0];
      const area = data.nearest_area[0];
      const city = area.areaName[0].value;
      const country = area.country[0].value;
      const temp = current.temp_C;
      const feelsLike = current.FeelsLikeC;
      const desc = current.weatherDesc[0].value;
      const humidity = current.humidity;
      const wind = current.windspeedKmph;

      this.respond(
        `Weather for <strong>${city}, ${country}</strong>:<br>` +
          `${desc}, <strong>${temp}°C</strong> (feels like ${feelsLike}°C)<br>` +
          `Humidity: ${humidity}% | Wind: ${wind} km/h`
      );
    } catch (e) {
      this.respond(
        "I'm unable to fetch weather data right now, Sir. Please check your internet connection."
      );
    }
  }

  handleMath(input) {
    try {
      const expression = input
        .replace(/^(calculate|compute|solve|what\s*is)\s+/, "")
        .trim();
      // Only allow safe math characters
      const sanitized = expression.replace(/[^0-9+\-*/.()%\s]/g, "");
      if (!sanitized || sanitized.length === 0) {
        return this.respond("Please provide a valid math expression, Sir.");
      }
      const result = Function('"use strict"; return (' + sanitized + ")")();
      if (typeof result !== "number" || !isFinite(result)) {
        return this.respond("That expression doesn't compute, Sir.");
      }
      this.respond(
        `<strong>${sanitized}</strong> = <strong>${result}</strong>`
      );
    } catch (e) {
      this.respond(
        "I couldn't calculate that, Sir. Please try a simpler expression."
      );
    }
  }

  handleOpenSite(site) {
    const sites = {
      google: "https://google.com",
      youtube: "https://youtube.com",
      github: "https://github.com",
      stackoverflow: "https://stackoverflow.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      x: "https://x.com",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      reddit: "https://reddit.com",
      spotify: "https://spotify.com",
      netflix: "https://netflix.com",
      amazon: "https://amazon.com",
      whatsapp: "https://web.whatsapp.com",
      gmail: "https://mail.google.com",
      chatgpt: "https://chat.openai.com",
      claude: "https://claude.ai",
      maps: "https://maps.google.com",
      drive: "https://drive.google.com",
      notion: "https://notion.so",
      figma: "https://figma.com",
      canva: "https://canva.com",
    };

    const key = site.toLowerCase().replace(/\s+/g, "");
    if (sites[key]) {
      window.open(sites[key], "_blank");
      this.respond(`Opening <strong>${site}</strong>, Sir.`);
    } else {
      // Try opening as a URL
      const url = site.includes(".") ? `https://${site}` : null;
      if (url) {
        window.open(url, "_blank");
        this.respond(`Opening <strong>${site}</strong>, Sir.`);
      } else {
        this.respond(
          `I don't recognize that site, Sir. Try saying "open google" or "open youtube".`
        );
      }
    }
  }

  handleSearch(query) {
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      "_blank"
    );
    this.respond(
      `Searching Google for "<strong>${this.escapeHTML(query)}</strong>", Sir.`
    );
  }

  handleYouTubeSearch(query) {
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      "_blank"
    );
    this.respond(
      `Searching YouTube for "<strong>${this.escapeHTML(query)}</strong>", Sir.`
    );
  }

  handleWikipedia(query) {
    const term = query.replace(/^(search|for|about)\s+/i, "").trim() || "Main_Page";
    window.open(
      `https://en.wikipedia.org/wiki/${encodeURIComponent(term)}`,
      "_blank"
    );
    this.respond(
      `Opening Wikipedia article on "<strong>${this.escapeHTML(term)}</strong>", Sir.`
    );
  }

  handleJoke() {
    const joke = this.pickRandom(this.jokes);
    this.respond(joke);
  }

  handleQuote() {
    const quote = this.pickRandom(this.quotes);
    this.respond(`"${quote}"`);
  }

  handleSaveNote(note) {
    this.notes.push({
      text: note,
      time: new Date().toLocaleString(),
    });
    localStorage.setItem("jarvis_notes", JSON.stringify(this.notes));
    this.respond(
      `Note saved, Sir. You now have <strong>${this.notes.length}</strong> note${this.notes.length !== 1 ? "s" : ""}.`
    );
  }

  handleReadNotes() {
    if (this.notes.length === 0) {
      return this.respond("You don't have any notes yet, Sir.");
    }
    const notesList = this.notes
      .map((n, i) => `<strong>${i + 1}.</strong> ${this.escapeHTML(n.text)} <span style="color: var(--text-dim); font-size: 0.75rem;">(${n.time})</span>`)
      .join("<br>");
    this.respond(`Your notes, Sir:<br><br>${notesList}`, false);
    this.speak(`You have ${this.notes.length} note${this.notes.length !== 1 ? "s" : ""}, Sir.`);
  }

  handleClearNotes() {
    const count = this.notes.length;
    this.notes = [];
    localStorage.removeItem("jarvis_notes");
    this.respond(
      count > 0
        ? `All ${count} note${count !== 1 ? "s" : ""} cleared, Sir.`
        : "There were no notes to clear, Sir."
    );
  }

  async handleBatteryInfo() {
    try {
      if (!navigator.getBattery) {
        return this.respond(
          "Battery information is not available in this browser, Sir."
        );
      }
      const battery = await navigator.getBattery();
      const level = Math.round(battery.level * 100);
      const charging = battery.charging;
      const timeLeft = charging
        ? battery.chargingTime !== Infinity
          ? `Full charge in ${Math.round(battery.chargingTime / 60)} minutes.`
          : ""
        : battery.dischargingTime !== Infinity
          ? `Approximately ${Math.round(battery.dischargingTime / 60)} minutes remaining.`
          : "";

      this.respond(
        `Battery level: <strong>${level}%</strong> ${charging ? "(Charging)" : "(On battery)"}. ${timeLeft}`
      );
    } catch (e) {
      this.respond(
        "I couldn't access battery information, Sir."
      );
    }
  }

  handleNetworkInfo() {
    const online = navigator.onLine;
    let info = `You are currently <strong>${online ? "online" : "offline"}</strong>.`;

    if (navigator.connection) {
      const conn = navigator.connection;
      if (conn.effectiveType)
        info += ` Connection type: <strong>${conn.effectiveType.toUpperCase()}</strong>.`;
      if (conn.downlink)
        info += ` Speed: ~${conn.downlink} Mbps.`;
    }

    this.respond(info);
  }

  handlePassword() {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_-+=";
    const length = 16;
    let password = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      password += chars[array[i] % chars.length];
    }

    navigator.clipboard.writeText(password).catch(() => {});
    this.respond(
      `Here's a secure 16-character password:<br><code>${password}</code><br>Copied to clipboard, Sir.`
    );
  }

  handleCoinFlip() {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    this.respond(`The coin shows <strong>${result}</strong>, Sir.`);
  }

  handleDiceRoll() {
    const result = Math.floor(Math.random() * 6) + 1;
    this.respond(`You rolled a <strong>${result}</strong>, Sir.`);
  }

  handleRandomNumber(input) {
    const nums = input.match(/\d+/g);
    let min = 1,
      max = 100;
    if (nums && nums.length >= 2) {
      min = parseInt(nums[0]);
      max = parseInt(nums[1]);
    } else if (nums && nums.length === 1) {
      max = parseInt(nums[0]);
    }
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    this.respond(
      `Random number between ${min} and ${max}: <strong>${result}</strong>.`
    );
  }

  handleTimer(input) {
    const match = input.match(/(\d+)\s*(second|sec|minute|min|hour|hr)/i);
    if (!match) {
      return this.respond(
        'Please specify a duration, Sir. For example: "set timer for 5 minutes".'
      );
    }

    let value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    let ms;

    if (unit.startsWith("sec")) {
      ms = value * 1000;
    } else if (unit.startsWith("min")) {
      ms = value * 60 * 1000;
    } else {
      ms = value * 3600 * 1000;
    }

    const unitLabel = unit.startsWith("sec")
      ? "second"
      : unit.startsWith("min")
        ? "minute"
        : "hour";
    const label = `${value} ${unitLabel}${value !== 1 ? "s" : ""}`;

    this.respond(`Timer set for <strong>${label}</strong>. I'll notify you when it's done, Sir.`);

    const timerId = setTimeout(() => {
      this.respond(`Timer complete! <strong>${label}</strong> have elapsed, Sir.`);
      this.speak(`Sir, your ${label} timer is complete.`);

      // Browser notification
      if (Notification.permission === "granted") {
        new Notification("J.A.R.V.I.S. Timer", {
          body: `${label} timer complete!`,
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }, ms);

    this.activeTimers.push(timerId);
  }

  handleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      this.respond("Entering fullscreen mode, Sir.");
    } else {
      document.exitFullscreen();
      this.respond("Exiting fullscreen mode, Sir.");
    }
  }

  handleHowAreYou() {
    const responses = [
      "All systems are running optimally, Sir. Thank you for asking.",
      "I'm functioning at full capacity, Sir. Ready for any task.",
      "Operating within normal parameters, Sir. How about you?",
      "Never better, Sir. My circuits are humming smoothly.",
    ];
    this.respond(this.pickRandom(responses));
  }

  handleThanks() {
    const responses = [
      "You're welcome, Sir. Always here to help.",
      "My pleasure, Sir.",
      "Glad I could assist, Sir.",
      "Anytime, Sir. That's what I'm here for.",
    ];
    this.respond(this.pickRandom(responses));
  }

  handleCompliment() {
    const responses = [
      "You're too kind, Sir. I'm only as good as my programming.",
      "Thank you, Sir. I strive to be of service.",
      "I appreciate that, Sir. Your satisfaction is my primary directive.",
      "Thank you, Sir. I'll add that to my performance review.",
    ];
    this.respond(this.pickRandom(responses));
  }

  handleGoodbye() {
    const responses = [
      "Goodbye, Sir. J.A.R.V.I.S. standing by whenever you need me.",
      "Until next time, Sir. I'll keep the lights on.",
      "Signing off. Have a great day, Sir.",
      "Rest well, Sir. I'll be here when you return.",
    ];
    this.respond(this.pickRandom(responses));
  }

  // ---- Utilities ----

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ---- Launch ----
document.addEventListener("DOMContentLoaded", () => {
  new Jarvis();
});
