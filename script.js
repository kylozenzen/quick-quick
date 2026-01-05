const { useState, useEffect, useMemo } = React;

    // ========== PWA SETUP ==========
    // Create and inject manifest
    const MANIFEST = {
      "name": "Planet Strength",
      "short_name": "PlanetStr",
      "description": "Track your strength progress",
      "start_url": "./",
      "display": "standalone",
      "background_color": "#7e22ce",
      "theme_color": "#7e22ce",
      "orientation": "portrait",
      "icons": [{
        "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%237e22ce' width='100' height='100' rx='20'/%3E%3Ctext x='50' y='70' font-size='60' text-anchor='middle' fill='white'%3E💪%3C/text%3E%3C/svg%3E",
        "sizes": "512x512",
        "type": "image/svg+xml",
        "purpose": "any maskable"
      }]
    };
    const manifestBlob = new Blob([JSON.stringify(MANIFEST)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);
    // Some hosts/templates may omit the placeholder link; guard to avoid hard crashes.
    const manifestLink = document.getElementById('manifest-placeholder');
    if (manifestLink) manifestLink.setAttribute('href', manifestURL);

    // Register service worker
    // Register service worker only on supported origins (not file://)
    const isSecureContextOk = location.protocol === 'https:' || location.hostname === 'localhost';
    if (isSecureContextOk && 'serviceWorker' in navigator) {
      const SW_CODE = `
        const CACHE = 'ps-v2';
        self.addEventListener('install', e => {
          e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['./', 'https://cdn.tailwindcss.com'])));
        });
        self.addEventListener('fetch', e => {
          e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
        });
      `;
      const swBlob = new Blob([SW_CODE], { type: 'application/javascript' });
      const swURL = URL.createObjectURL(swBlob);
      navigator.serviceWorker.register(swURL).catch(() => {});
    }

    // PWA Install Prompt Component
    const InstallPrompt = () => {
      const [show, setShow] = useState(false);
      const [prompt, setPrompt] = useState(null);

      useEffect(() => {
        const handler = (e) => {
          e.preventDefault();
          setPrompt(e);
          setShow(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
      }, []);

      const install = async () => {
        if (!prompt) return;
        prompt.prompt();
        await prompt.userChoice;
        setShow(false);
      };

      if (!show) return null;

      return ReactDOM.createPortal(
        <div className="install-prompt">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📱</div>
            <div className="flex-1">
              <div className="font-bold text-sm">Install App</div>
              <div className="text-xs opacity-80">Add to home screen</div>
            </div>
            <button onClick={install} className="bg-white/20 px-4 py-2 rounded-lg font-bold text-sm">
              Install
            </button>
            <button onClick={() => setShow(false)} className="text-white/60 text-xl px-2">×</button>
          </div>
        </div>,
        document.getElementById('install-prompt')
      );
    };


    // ========== ICONS ==========
    const Icon = ({ name, className }) => {
      const icons = {
        Dumbbell: <path d="m6.5 6.5 11 11m4.5 3.5-1-1m-17-17 1 1m14 19 4-4m-20-16 4-4m-3 8 7-7m11 11 7-7" />,
        TrendingUp: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />,
        User: <g><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></g>,
        Home: <path d="M3 9.5 12 3l9 6.5V21a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2V9.5Z" />,
        X: <path d="M18 6 6 18M6 6l12 12" />,
        ChevronLeft: <path d="m15 18-6-6 6-6" />,
        ChevronRight: <path d="m9 18 6-6-6-6" />,
        ChevronDown: <path d="m6 9 6 6 6-6" />,
        Clock: <g><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></g>,
        Check: <polyline points="20 6 9 17 4 12" />,
        Trash: <g><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></g>,
        Activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
        Sparkles: <g><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></g>,
        Target: <g><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></g>,
        Info: <g><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></g>,
        Trophy: <g><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></g>,
        Lightbulb: <g><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></g>,
        Flame: <path d="M8.5 14.5c0 2 1.5 3.5 3.5 3.5s3.5-1.5 3.5-3.5c0-1.5-1-2.6-2-3.6-.8-.8-1.2-1.5-1.5-2.9-.6 1.1-1.4 1.8-2.2 2.5-1 .9-1.3 2-1.3 4Z" />,
        BookOpen: <g><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></g>,
        BarChart: <g><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></g>,
        Moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
        List: <g><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></g>,
        Settings: <g><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></g>,
        Search: <g><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></g>,
        Star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
        Droplet: <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />,
      };
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={className}>
          {icons[name]}
        </svg>
      );
    };

    // ========== STORAGE FIX FOR IOS ==========
    // In-memory fallback if localStorage does not work
    const memoryStorage = {};
    
    const storage = {
      get: (key, fallback) => { 
        try { 
          const v = localStorage.getItem(key); 
          return v ? JSON.parse(v) : (memoryStorage[key] || fallback); 
        } catch { 
          return memoryStorage[key] || fallback; 
        } 
      },
      set: (key, val) => { 
        try { 
          localStorage.setItem(key, JSON.stringify(val)); 
          memoryStorage[key] = val;
        } catch {
          memoryStorage[key] = val;
        } 
      }
    };

    // ========== CONSTANTS ==========
    const AVATARS = ["🦁","🦍","🦖","💪","🏃","🧘","🤖","👽","🦊","⚡"];

    const GYM_TYPES = {
      planet: { 
        label: "Planet Fitness",
        emoji: "🟣",
        machines: true,
        dumbbells: { available: true, max: 75, increments: [5] },
        barbells: { available: true, standardBar: 45 },
        machineStackCap: 260
      },
      commercial: {
        label: "Commercial Gym",
        emoji: "🏋️",
        desc: "LA Fitness, Golds, 24 Hour, etc",
        machines: true,
        dumbbells: { available: true, max: 120, increments: [2.5, 5] },
        barbells: { available: true, standardBar: 45 },
        machineStackCap: 300
      },
      iron: {
        label: "Powerlifting Gym",
        emoji: "⚡",
        desc: "Serious iron, heavy weights",
        machines: false,
        dumbbells: { available: true, max: 150, increments: [2.5, 5, 10] },
        barbells: { available: true, standardBar: 45 },
        machineStackCap: null
      },
      home: {
        label: "Home Gym",
        emoji: "🏠",
        machines: false,
        dumbbells: { available: true, max: 100, increments: [5] },
        barbells: { available: true, standardBar: 45 },
        machineStackCap: null
      }
    };

    const EXPERIENCE_LEVELS = [
      { label: 'Beginner', desc: '0–3 months', detail: 'New to lifting or restarting' },
      { label: 'Novice', desc: '3–9 months', detail: 'Learning form + consistency' },
      { label: 'Intermediate', desc: '1–2 years', detail: 'Progressing steadily' },
      { label: 'Advanced', desc: '3+ years', detail: 'Dialed in + consistent' }
    ];

    const ACTIVITY_LEVELS = [
      { label: 'Sedentary', emoji: '🪑', desc: 'Desk job, minimal movement', multiplier: 0.85 },
      { label: 'Lightly Active', emoji: '🚶', desc: 'Some walking', multiplier: 0.95 },
      { label: 'Moderately Active', emoji: '🏃', desc: 'Regular movement', multiplier: 1.0 },
      { label: 'Very Active', emoji: '💪', desc: 'Physical + training', multiplier: 1.1 },
      { label: 'Athlete', emoji: '🏆', desc: 'High volume training', multiplier: 1.2 }
    ];

    const GOALS = [
      { id: 'strength', label: 'Strength Gain', emoji: '💪', desc: 'Push weight up, focus on PRs', bias: { reps: 'lower', cardio: 'lower' } },
      { id: 'recomp', label: 'Body Recomp', emoji: '🔄', desc: 'Build strength while leaning out', bias: { reps: 'middle', cardio: 'middle' } },
      { id: 'fatloss', label: 'Fat Loss', emoji: '🔥', desc: 'Consistency + reps + recovery', bias: { reps: 'higher', cardio: 'higher' } },
      { id: 'health', label: 'General Health', emoji: '❤️', desc: 'Keep it simple and sustainable', bias: { reps: 'middle', cardio: 'middle' } },
    ];

    const DIFFICULTY_LEVELS = [
      { value: 'easy', label: 'Easy', emoji: '✅', desc: 'Could do 3+ more reps' },
      { value: 'good', label: 'Good', emoji: '💪', desc: '1–2 reps in tank' },
      { value: 'hard', label: 'Hard', emoji: '😤', desc: 'Barely finished' },
      { value: 'failed', label: 'Failed', emoji: '❌', desc: "Could not complete" }
    ];

    // ========== BEGINNER STARTER EXERCISES ==========
    const BEGINNER_EXERCISES = [
      { id: 'chest_press', name: 'Chest Press', emoji: '⚙️', desc: 'Great for building chest strength', why: 'Machine guides your movement' },
      { id: 'lat_pulldown', name: 'Lat Pulldown', emoji: '⚙️', desc: 'Builds a strong back', why: 'Easier than pull-ups' },
      { id: 'leg_press', name: 'Leg Press', emoji: '⚙️', desc: 'Powerful legs, safe form', why: 'No balance required' },
      { id: 'seated_row', name: 'Seated Row', emoji: '⚙️', desc: 'Posture and back strength', why: 'Simple pulling motion' },
      { id: 'shoulder_press', name: 'Shoulder Press', emoji: '⚙️', desc: 'Strong shoulders', why: 'Machine stabilizes weight' },
      { id: 'leg_curl', name: 'Leg Curl', emoji: '⚙️', desc: 'Hamstring strength', why: 'Isolates one muscle group' },
      { id: 'ab_crunch', name: 'Ab Crunch Machine', emoji: '⚙️', desc: 'Core strength', why: 'Controlled movement' },
      { id: 'pec_fly', name: 'Pec Fly', emoji: '⚙️', desc: 'Chest definition', why: 'Isolated chest work' },
    ];

    // ========== CARDIO TYPES ==========
const CARDIO_TYPES = {
  swimming: {
    name: 'Swimming',
    emoji: '🏊',
    color: 'cyan',
        regularActivities: [
          { id: 'laps', label: 'Swimming Laps', emoji: '🏊' },
          { id: 'water_walk', label: 'Water Walking', emoji: '🚶' },
          { id: 'water_aerobics', label: 'Water Aerobics', emoji: '💃' },
          { id: 'treading', label: 'Treading Water', emoji: '🌊' },
          { id: 'casual', label: 'Casual Swim', emoji: '😎' },
        ],
        proMetrics: ['distance', 'pace', 'strokes']
      },
      running: {
        name: 'Running',
        emoji: '🏃',
        color: 'orange',
        regularActivities: [
          { id: 'treadmill', label: 'Treadmill', emoji: '🏃' },
          { id: 'outdoor', label: 'Outdoor Run', emoji: '🌳' },
          { id: 'walk', label: 'Walking', emoji: '🚶' },
          { id: 'hiit', label: 'HIIT/Intervals', emoji: '⚡' },
          { id: 'cooldown', label: 'Cool Down Walk', emoji: '🧘' },
        ],
        proMetrics: ['distance', 'pace', 'elevation']
      }
    };

const motivationalQuotes = [
  { quote: "Get busy living, or get busy dying.", author: "The Shawshank Redemption" },
  { quote: "It’s not about how hard you hit. It’s about how hard you can get hit and keep moving forward.", author: "Rocky Balboa" },
  { quote: "Do, or do not. There is no try.", author: "Star Wars: The Empire Strikes Back" },
  { quote: "Why do we fall? So we can learn to pick ourselves up.", author: "Batman Begins" },
  { quote: "Great men are not born great, they grow great.", author: "The Godfather" },
  { quote: "You’re capable of more than you know.", author: "A League of Their Own" },
  { quote: "The future is not set. There is no fate but what we make for ourselves.", author: "Terminator 2: Judgment Day" },
  { quote: "Sometimes it is the people no one expects anything from who do things no one can imagine.", author: "The Imitation Game" },
  { quote: "It’s what you do right now that makes a difference.", author: "Black Hawk Down" },
  { quote: "Carpe diem. Seize the day, boys. Make your lives extraordinary.", author: "Dead Poets Society" },
  { quote: "We are who we choose to be. Now choose.", author: "Spider-Man" },
  { quote: "Our lives are defined by opportunities, even the ones we miss.", author: "The Curious Case of Benjamin Button" },
  { quote: "Hope is a good thing. Maybe the best of things.", author: "The Shawshank Redemption" },
  { quote: "You have power over your mind—not outside events. Realize this, and you will find strength.", author: "Gladiator" },
  { quote: "It ain’t about how fast I get there. It ain’t about what I see along the way. It’s the climb.", author: "Hannah Montana: The Movie" },
  { quote: "Every man dies. Not every man really lives.", author: "Braveheart" },
  { quote: "You are what you choose to be.", author: "Iron Giant" },
  { quote: "It matters not what someone is born, but what they grow to be.", author: "Harry Potter and the Goblet of Fire" },
  { quote: "Even the smallest person can change the course of the future.", author: "The Lord of the Rings: The Fellowship of the Ring" },
  { quote: "You mustn’t be afraid to dream a little bigger, darling.", author: "Inception" },
  { quote: "The moment you doubt whether you can fly, you cease forever to be able to do it.", author: "Peter Pan" },
  { quote: "It’s only after we’ve lost everything that we’re free to do anything.", author: "Fight Club" },
  { quote: "Sometimes you gotta run before you can walk.", author: "Iron Man" },
  { quote: "No one knows what they’re capable of until they try.", author: "Gattaca" },
  { quote: "What we do in life echoes in eternity.", author: "Gladiator" },
  { quote: "Your destiny is within you. You just have to be brave enough to see it.", author: "Brave" },
  { quote: "We are not meant to save the world. We are meant to live in it.", author: "Interstellar" },
  { quote: "Life moves pretty fast. If you don’t stop and look around once in a while, you could miss it.", author: "Ferris Bueller’s Day Off" },
  { quote: "Today, we celebrate our independence!", author: "Independence Day" },
  { quote: "You have to believe in yourself.", author: "Rocky II" }
];


    const EQUIPMENT_DB = {
      // ========== MACHINES ==========
      "chest_press": { 
        type: 'machine',
        name: "Chest Press", 
        target: "Chest", 
        muscles: "Chest, Triceps, Front Delts", 
        tags: ["Push","Upper","Full Body"], 
        stackCap: 260, 
        multipliers: { Male: [0.3,0.55,0.85,1.15], Female: [0.2,0.35,0.55,0.75] }, 
        cues: ["Handles mid-chest.", "Elbows ~45°.", "Shoulder blades back."], 
        progression: "Add weight when you can do 12+ controlled reps." 
      },
      "pec_fly": { 
        type: 'machine',
        name: "Pec Fly", 
        target: "Chest", 
        muscles: "Chest, Front Delts", 
        tags: ["Push","Upper"], 
        stackCap: 200, 
        multipliers: { Male: [0.2,0.35,0.55,0.8], Female: [0.12,0.25,0.4,0.6] }, 
        cues: ["Soft bend in elbows.", "Move from shoulders."], 
        progression: "Increase when 12+ reps feel easy with full ROM." 
      },
      "shoulder_press": { 
        type: 'machine',
        name: "Shoulder Press", 
        target: "Shoulders", 
        muscles: "Delts, Triceps", 
        tags: ["Push","Upper","Full Body"], 
        stackCap: 200, 
        multipliers: { Male: [0.2,0.4,0.65,0.95], Female: [0.12,0.25,0.4,0.6] }, 
        cues: ["Start at ear level.", "Press straight up.", "Brace core."], 
        progression: "Increase when 10–12 reps feel solid." 
      },
      "cable_tricep": { 
        type: 'machine',
        name: "Cable Tricep Push", 
        target: "Triceps", 
        muscles: "Triceps", 
        tags: ["Push","Upper"], 
        stackCap: 70, 
        ratio: 0.5, 
        multipliers: { Male: [0.25,0.4,0.6,0.85], Female: [0.18,0.3,0.45,0.65] }, 
        cues: ["Elbows pinned.", "Full extension."], 
        progression: "Increase when 12+ reps feel clean." 
      },
      "lat_pulldown": { 
        type: 'machine',
        name: "Lat Pulldown", 
        target: "Back", 
        muscles: "Lats, Biceps", 
        tags: ["Pull","Upper","Full Body"], 
        stackCap: 250, 
        multipliers: { Male: [0.35,0.6,0.9,1.2], Female: [0.25,0.4,0.65,0.9] }, 
        cues: ["Pull to clavicle.", "No swinging.", "Back does the work."], 
        progression: "Add weight when 12+ reps are controlled." 
      },
      "seated_row": { 
        type: 'machine',
        name: "Seated Row", 
        target: "Back", 
        muscles: "Back, Biceps", 
        tags: ["Pull","Upper"], 
        stackCap: 250, 
        multipliers: { Male: [0.4,0.65,1.0,1.35], Female: [0.28,0.45,0.7,0.95] }, 
        cues: ["Chest to pad.", "Pull to lower ribs."], 
        progression: "Progress when all sets are clean." 
      },
      "cable_bicep": { 
        type: 'machine',
        name: "Cable Bicep Curl", 
        target: "Biceps", 
        muscles: "Biceps, Forearms", 
        tags: ["Pull","Upper"], 
        stackCap: 60, 
        ratio: 0.5, 
        multipliers: { Male: [0.15,0.25,0.4,0.55], Female: [0.1,0.2,0.3,0.4] }, 
        cues: ["Elbows fixed.", "Slow negative."], 
        progression: "Increase when 12+ strict reps are easy." 
      },
      "leg_press": { 
        type: 'machine',
        name: "Leg Press", 
        target: "Legs", 
        muscles: "Quads, Glutes, Hamstrings", 
        tags: ["Push","Legs","Full Body"], 
        stackCap: 700, 
        multipliers: { Male: [1.0,1.6,2.3,3.0], Female: [0.7,1.1,1.6,2.2] }, 
        cues: ["No knee lockout.", "Controlled depth."], 
        progression: "Add weight when 15+ reps are strong and safe." 
      },
      "leg_extension": { 
        type: 'machine',
        name: "Leg Extension", 
        target: "Quads", 
        muscles: "Quadriceps", 
        tags: ["Push","Legs"], 
        stackCap: 200, 
        multipliers: { Male: [0.35,0.6,0.9,1.2], Female: [0.25,0.45,0.7,0.95] }, 
        cues: ["Align knee with pivot.", "Control descent."], 
        progression: "Increase when 12–15 reps are easy." 
      },
      "leg_curl": { 
        type: 'machine',
        name: "Leg Curl", 
        target: "Hamstrings", 
        muscles: "Hamstrings", 
        tags: ["Pull","Legs"], 
        stackCap: 200, 
        multipliers: { Male: [0.35,0.55,0.8,1.05], Female: [0.25,0.4,0.6,0.8] }, 
        cues: ["Hips down.", "Smooth reps."], 
        progression: "Increase when reps are controlled." 
      },
      "back_extension": { 
        type: 'machine',
        name: "Back Extension", 
        target: "Lower Back", 
        muscles: "Lower Back, Glutes", 
        tags: ["Pull","Legs","Core"], 
        stackCap: 200, 
        multipliers: { Male: [0.35,0.55,0.8,1.05], Female: [0.25,0.4,0.6,0.8] }, 
        cues: ["Pivot at hips.", "No hyperextension.", "Controlled movement."], 
        progression: "Increase when 15+ reps feel strong." 
      },
      "ab_crunch": { 
        type: 'machine',
        name: "Ab Crunch", 
        target: "Core", 
        muscles: "Abs", 
        tags: ["Core","Full Body"], 
        stackCap: 200, 
        multipliers: { Male: [0.3,0.5,0.75,1.0], Female: [0.2,0.35,0.55,0.75] }, 
        cues: ["Ribs to pelvis.", "Exhale."], 
        progression: "Increase when 20+ reps are clean." 
      },
      "hip_abduction": {
        type: 'machine',
        name: "Hip Abduction",
        target: "Glutes",
        muscles: "Glutes, Hip Abductors",
        tags: ["Push","Legs"],
        stackCap: 200,
        multipliers: { Male: [0.3,0.5,0.75,1.0], Female: [0.25,0.45,0.7,0.95] },
        cues: ["Press knees out.", "Control the return.", "Don't lean forward."],
        progression: "Add weight when 15+ reps feel controlled."
      },
      "hip_adduction": {
        type: 'machine',
        name: "Hip Adduction",
        target: "Inner Thighs",
        muscles: "Adductors, Inner Thighs",
        tags: ["Push","Legs"],
        stackCap: 200,
        multipliers: { Male: [0.3,0.5,0.75,1.0], Female: [0.25,0.45,0.7,0.95] },
        cues: ["Squeeze knees together.", "Controlled movement.", "Don't use momentum."],
        progression: "Add weight when 15+ reps feel strong."
      },
      "calf_raise": {
        type: 'machine',
        name: "Calf Raise",
        target: "Calves",
        muscles: "Calves",
        tags: ["Push","Legs"],
        stackCap: 300,
        multipliers: { Male: [0.5,0.8,1.2,1.6], Female: [0.35,0.6,0.9,1.2] },
        cues: ["Full stretch at bottom.", "Rise onto toes.", "Squeeze at top."],
        progression: "Add weight when 15-20 reps feel easy."
      },
      "smith_machine": {
        type: 'machine',
        name: "Smith Machine Squat",
        target: "Legs",
        muscles: "Quads, Glutes",
        tags: ["Push","Legs","Full Body"],
        stackCap: 500,
        multipliers: { Male: [0.6,1.0,1.5,2.0], Female: [0.4,0.7,1.1,1.5] },
        cues: ["Feet forward.", "Bar on traps.", "Controlled descent."],
        progression: "Add weight when 10+ reps are solid."
      },
      "cable_wood_chop": {
        type: 'machine',
        name: "Cable Wood Chop",
        target: "Core",
        muscles: "Obliques, Core, Shoulders",
        tags: ["Core","Full Body"],
        stackCap: 150,
        ratio: 0.5,
        multipliers: { Male: [0.2,0.35,0.55,0.75], Female: [0.15,0.25,0.4,0.55] },
        cues: ["Rotate from core.", "Arms extended.", "Control both directions."],
        progression: "Increase when 12-15 reps per side feel controlled."
      },
      "preacher_curl": {
        type: 'machine',
        name: "Preacher Curl",
        target: "Biceps",
        muscles: "Biceps, Forearms",
        tags: ["Pull","Upper"],
        stackCap: 120,
        multipliers: { Male: [0.2,0.35,0.5,0.7], Female: [0.12,0.22,0.35,0.5] },
        cues: ["Arms flat on pad.", "Full extension at bottom.", "Strict form."],
        progression: "Add weight when 10-12 strict reps are easy."
      },

      // ========== DUMBBELLS ==========
      "db_bench_press": {
        type: 'dumbbell',
        name: "Dumbbell Bench Press",
        target: "Chest",
        muscles: "Chest, Triceps, Front Delts",
        tags: ["Push","Upper"],
        multipliers: { Male: [0.15, 0.25, 0.4, 0.55], Female: [0.1, 0.18, 0.28, 0.38] },
        cues: ["Dumbbells at chest level.", "Press up and slightly in.", "Control the descent."],
        progression: "Increase weight when you can do 12 reps with good form."
      },
      "db_row": {
        type: 'dumbbell',
        name: "Dumbbell Row",
        target: "Back",
        muscles: "Back, Biceps",
        tags: ["Pull","Upper"],
        multipliers: { Male: [0.2, 0.35, 0.5, 0.7], Female: [0.12, 0.22, 0.35, 0.48] },
        cues: ["Row to hip.", "Elbow stays close.", "Squeeze at top."],
        progression: "Add weight when 10-12 reps feel controlled."
      },
      "db_shoulder_press": {
        type: 'dumbbell',
        name: "Dumbbell Shoulder Press",
        target: "Shoulders",
        muscles: "Delts, Triceps",
        tags: ["Push","Upper"],
        multipliers: { Male: [0.12, 0.22, 0.35, 0.5], Female: [0.08, 0.15, 0.25, 0.35] },
        cues: ["Start at shoulders.", "Press straight up.", "Control the descent."],
        progression: "Increase when 10-12 reps are solid."
      },
      "db_goblet_squat": {
        type: 'dumbbell',
        name: "Goblet Squat",
        target: "Legs",
        muscles: "Quads, Glutes",
        tags: ["Push","Legs"],
        multipliers: { Male: [0.25, 0.4, 0.6, 0.8], Female: [0.18, 0.3, 0.45, 0.6] },
        cues: ["Hold at chest.", "Squat deep.", "Drive through heels."],
        progression: "Add weight when 15+ reps feel strong."
      },
      "db_lunge": {
        type: 'dumbbell',
        name: "Dumbbell Lunges",
        target: "Legs",
        muscles: "Quads, Glutes, Hamstrings",
        tags: ["Push","Legs"],
        multipliers: { Male: [0.15, 0.25, 0.4, 0.55], Female: [0.1, 0.18, 0.28, 0.4] },
        cues: ["Step forward.", "Knee at 90°.", "Push back to start."],
        progression: "Increase when all reps are controlled."
      },
      "db_curl": {
        type: 'dumbbell',
        name: "Dumbbell Curl",
        target: "Biceps",
        muscles: "Biceps, Forearms",
        tags: ["Pull","Upper"],
        multipliers: { Male: [0.1, 0.18, 0.28, 0.4], Female: [0.06, 0.12, 0.2, 0.28] },
        cues: ["Elbows fixed.", "Curl to shoulder.", "Slow negative."],
        progression: "Add weight when 12+ strict reps are easy."
      },
      "db_incline_bench": {
        type: 'dumbbell',
        name: "Incline Dumbbell Bench",
        target: "Chest",
        muscles: "Upper Chest, Front Delts",
        tags: ["Push","Upper"],
        multipliers: { Male: [0.12, 0.22, 0.35, 0.5], Female: [0.08, 0.15, 0.25, 0.35] },
        cues: ["Bench at 30-45°.", "Press up and in.", "Control the descent."],
        progression: "Add weight when 10-12 reps feel solid."
      },
      "db_lateral_raise": {
        type: 'dumbbell',
        name: "Lateral Raise",
        target: "Shoulders",
        muscles: "Side Delts",
        tags: ["Push","Upper"],
        multipliers: { Male: [0.06, 0.12, 0.2, 0.3], Female: [0.04, 0.08, 0.14, 0.22] },
        cues: ["Slight bend in elbows.", "Lift to shoulder height.", "Control down."],
        progression: "Increase when 12-15 reps are controlled."
      },
      "db_front_raise": {
        type: 'dumbbell',
        name: "Front Raise",
        target: "Shoulders",
        muscles: "Front Delts",
        tags: ["Push","Upper"],
        multipliers: { Male: [0.06, 0.12, 0.2, 0.3], Female: [0.04, 0.08, 0.14, 0.22] },
        cues: ["Arms straight.", "Raise to eye level.", "Controlled movement."],
        progression: "Add weight when 12-15 reps feel easy."
      },
      "db_shrug": {
        type: 'dumbbell',
        name: "Dumbbell Shrug",
        target: "Traps",
        muscles: "Traps, Upper Back",
        tags: ["Pull","Upper"],
        multipliers: { Male: [0.2, 0.35, 0.5, 0.7], Female: [0.12, 0.22, 0.35, 0.5] },
        cues: ["Shrug straight up.", "Hold at top.", "Control down."],
        progression: "Increase when 12+ reps are strong."
      },
      "db_rdl": {
        type: 'dumbbell',
        name: "Dumbbell Romanian DL",
        target: "Hamstrings",
        muscles: "Hamstrings, Glutes, Lower Back",
        tags: ["Pull","Legs"],
        multipliers: { Male: [0.2, 0.35, 0.5, 0.7], Female: [0.15, 0.25, 0.4, 0.55] },
        cues: ["Hinge at hips.", "Slight knee bend.", "Feel hamstring stretch."],
        progression: "Add weight when 10-12 reps feel controlled."
      },
      "db_hammer_curl": {
        type: 'dumbbell',
        name: "Hammer Curl",
        target: "Biceps",
        muscles: "Biceps, Forearms, Brachialis",
        tags: ["Pull","Upper"],
        multipliers: { Male: [0.1, 0.18, 0.28, 0.4], Female: [0.06, 0.12, 0.2, 0.28] },
        cues: ["Palms facing in.", "Curl up.", "Keep elbows still."],
        progression: "Increase when 12+ reps are strict."
      },
      "db_tricep_kickback": {
        type: 'dumbbell',
        name: "Tricep Kickback",
        target: "Triceps",
        muscles: "Triceps",
        tags: ["Push","Upper"],
        multipliers: { Male: [0.06, 0.12, 0.2, 0.3], Female: [0.04, 0.08, 0.14, 0.22] },
        cues: ["Elbow fixed at side.", "Extend arm back.", "Squeeze at top."],
        progression: "Add weight when 12-15 reps feel controlled."
      },

      // ========== BARBELLS ==========
      "bb_squat": {
        type: 'barbell',
        name: "Barbell Squat",
        target: "Legs",
        muscles: "Quads, Glutes, Hamstrings",
        tags: ["Push","Legs"],
        needsBarWeight: true,
        plateOptions: [45, 35, 25, 10, 5, 2.5],
        multipliers: { Male: [0.8, 1.2, 1.7, 2.2], Female: [0.5, 0.9, 1.3, 1.7] },
        cues: ["Bar on traps.", "Depth to parallel.", "Drive through heels."],
        progression: "Add weight when you hit 8+ reps with good depth."
      },
      "bb_bench": {
        type: 'barbell',
        name: "Barbell Bench Press",
        target: "Chest",
        muscles: "Chest, Triceps, Front Delts",
        tags: ["Push","Upper"],
        needsBarWeight: true,
        plateOptions: [45, 35, 25, 10, 5, 2.5],
        multipliers: { Male: [0.5, 0.8, 1.1, 1.4], Female: [0.25, 0.45, 0.65, 0.85] },
        cues: ["Bar to mid-chest.", "Elbows 45°.", "Feet planted."],
        progression: "Increase when you can do 8-10 solid reps."
      },
      "bb_deadlift": {
        type: 'barbell',
        name: "Barbell Deadlift",
        target: "Back",
        muscles: "Back, Glutes, Hamstrings",
        tags: ["Pull","Legs"],
        needsBarWeight: true,
        plateOptions: [45, 35, 25, 10, 5, 2.5],
        multipliers: { Male: [1.0, 1.5, 2.0, 2.5], Female: [0.6, 1.0, 1.4, 1.8] },
        cues: ["Bar over mid-foot.", "Chest up.", "Drive through floor."],
        progression: "Add weight when 6-8 reps are strong."
      },
      "bb_row": {
        type: 'barbell',
        name: "Barbell Row",
        target: "Back",
        muscles: "Back, Biceps",
        tags: ["Pull","Upper"],
        needsBarWeight: true,
        plateOptions: [45, 35, 25, 10, 5, 2.5],
        multipliers: { Male: [0.4, 0.65, 0.9, 1.2], Female: [0.25, 0.45, 0.65, 0.85] },
        cues: ["Hinge at hips.", "Row to belly.", "No swinging."],
        progression: "Increase when 10+ reps are controlled."
      },
      "bb_overhead_press": {
        type: 'barbell',
        name: "Overhead Press",
        target: "Shoulders",
        muscles: "Delts, Triceps",
        tags: ["Push","Upper"],
        needsBarWeight: true,
        plateOptions: [45, 35, 25, 10, 5, 2.5],
        multipliers: { Male: [0.3, 0.5, 0.7, 0.95], Female: [0.18, 0.3, 0.45, 0.6] },
        cues: ["Bar at clavicle.", "Press straight up.", "Lockout overhead."],
        progression: "Add weight when 8-10 reps are solid."
      },
      "bb_rdl": {
        type: 'barbell',
        name: "Romanian Deadlift",
        target: "Hamstrings",
        muscles: "Hamstrings, Glutes, Lower Back",
        tags: ["Pull","Legs"],
        needsBarWeight: true,
        plateOptions: [45, 35, 25, 10, 5, 2.5],
        multipliers: { Male: [0.6, 1.0, 1.4, 1.8], Female: [0.4, 0.7, 1.0, 1.3] },
        cues: ["Hinge at hips.", "Bar close to legs.", "Feel hamstring stretch."],
        progression: "Add weight when 8-10 reps feel strong."
      },
      "bb_front_squat": {
        type: 'barbell',
        name: "Front Squat",
        target: "Quads",
        muscles: "Quads, Core, Upper Back",
        tags: ["Push","Legs"],
        needsBarWeight: true,
        plateOptions: [45, 35, 25, 10, 5, 2.5],
        multipliers: { Male: [0.6, 1.0, 1.4, 1.8], Female: [0.4, 0.7, 1.0, 1.3] },
        cues: ["Bar on front delts.", "Elbows high.", "Chest up."],
        progression: "Increase when 8+ reps are solid."
      },
      "bb_sumo_deadlift": {
        type: 'barbell',
        name: "Sumo Deadlift",
        target: "Legs",
        muscles: "Glutes, Quads, Hamstrings",
        tags: ["Pull","Legs"],
        needsBarWeight: true,
        plateOptions: [45, 35, 25, 10, 5, 2.5],
        multipliers: { Male: [0.9, 1.4, 1.9, 2.4], Female: [0.55, 0.95, 1.35, 1.75] },
        cues: ["Wide stance.", "Bar over mid-foot.", "Drive through floor."],
        progression: "Add weight when 6-8 reps are strong."
      },
      "bb_close_grip_bench": {
        type: 'barbell',
        name: "Close-Grip Bench",
        target: "Triceps",
        muscles: "Triceps, Chest",
        tags: ["Push","Upper"],
        needsBarWeight: true,
        plateOptions: [45, 35, 25, 10, 5, 2.5],
        multipliers: { Male: [0.4, 0.7, 1.0, 1.3], Female: [0.22, 0.4, 0.6, 0.8] },
        cues: ["Hands shoulder-width.", "Elbows in.", "Touch lower chest."],
        progression: "Increase when 8-10 reps are controlled."
      },
      "bb_incline_bench": {
        type: 'barbell',
        name: "Incline Barbell Bench",
        target: "Upper Chest",
        muscles: "Upper Chest, Front Delts, Triceps",
        tags: ["Push","Upper"],
        needsBarWeight: true,
        plateOptions: [45, 35, 25, 10, 5, 2.5],
        multipliers: { Male: [0.4, 0.7, 1.0, 1.3], Female: [0.22, 0.4, 0.6, 0.8] },
        cues: ["Bench at 30-45°.", "Bar to upper chest.", "Press straight up."],
        progression: "Add weight when 8-10 reps feel solid."
      },
      "bb_curl": {
        type: 'barbell',
        name: "Barbell Curl",
        target: "Biceps",
        muscles: "Biceps, Forearms",
        tags: ["Pull","Upper"],
        needsBarWeight: true,
        plateOptions: [25, 10, 5, 2.5],
        multipliers: { Male: [0.2, 0.35, 0.5, 0.7], Female: [0.12, 0.22, 0.35, 0.5] },
        cues: ["Elbows at sides.", "Curl to shoulders.", "Control down."],
        progression: "Increase when 10-12 strict reps are easy."
      },
      "bb_shrug": {
        type: 'barbell',
        name: "Barbell Shrug",
        target: "Traps",
        muscles: "Traps, Upper Back",
        tags: ["Pull","Upper"],
        needsBarWeight: true,
        plateOptions: [45, 35, 25, 10, 5, 2.5],
        multipliers: { Male: [0.4, 0.7, 1.0, 1.4], Female: [0.25, 0.45, 0.7, 0.95] },
        cues: ["Shrug straight up.", "Hold at top.", "Don't roll shoulders."],
        progression: "Add weight when 12+ reps are strong."
      },
    };

    const WORKOUT_PLANS = {
      Push: {
        machines: ["chest_press","shoulder_press","pec_fly","cable_tricep"],
        dumbbells: ["db_bench_press","db_shoulder_press"],
        barbells: ["bb_bench","bb_overhead_press"]
      },
      Pull: {
        machines: ["lat_pulldown","seated_row","cable_bicep","ab_crunch"],
        dumbbells: ["db_row","db_curl"],
        barbells: ["bb_deadlift","bb_row"]
      },
      Legs: {
        machines: ["leg_press","leg_extension","leg_curl","ab_crunch"],
        dumbbells: ["db_goblet_squat","db_lunge"],
        barbells: ["bb_squat"]
      }
    };

    // ========== BIG BASICS - Core exercises shown by default ==========
    const BIG_BASICS = [
      // Machines (6 core)
      "chest_press", "lat_pulldown", "seated_row", "shoulder_press", "leg_press", "leg_curl",
      // Dumbbells (4 core)
      "db_bench_press", "db_row", "db_shoulder_press", "db_curl",
      // Barbells (5 core)
      "bb_squat", "bb_bench", "bb_deadlift", "bb_row", "bb_overhead_press"
    ];

    // ========== UTILITIES ==========
    const clampTo5 = (n) => Math.max(10, Math.round(n / 5) * 5);

    const toDayKey = (date = new Date()) => {
      const y = date.getFullYear();
      const m = String(date.getMonth()+1).padStart(2,'0');
      const d = String(date.getDate()).padStart(2,'0');
      return `${y}-${m}-${d}`;
    };

    const uniqueDayKeysFromHistory = (history, cardioHistory = {}, restDays = []) => {
      const keys = new Set();
      // Add workout days
      Object.values(history || {}).forEach(arr => {
        (arr || []).forEach(s => {
          if (s?.date) keys.add(toDayKey(new Date(s.date)));
        });
      });
      // Add cardio days
      Object.values(cardioHistory || {}).forEach(arr => {
        (arr || []).forEach(s => {
          if (s?.date) keys.add(toDayKey(new Date(s.date)));
        });
      });
      // Add rest days
      (restDays || []).forEach(d => keys.add(d));
      return Array.from(keys).sort();
    };

    const computeStreak = (history, cardioHistory = {}, restDays = []) => {
      const days = uniqueDayKeysFromHistory(history, cardioHistory, restDays);
      if (days.length === 0) return { current: 0, best: 0, lastDayKey: null, hasToday: false };

      let best = 1, run = 1;
      for (let i=1;i<days.length;i++){
        const prev = new Date(days[i-1]);
        const cur = new Date(days[i]);
        const diff = (cur - prev) / 86400000;
        if (diff === 1) { run++; best = Math.max(best, run); }
        else run = 1;
      }

      const todayKey = toDayKey(new Date());
      let current = 1;
      let i = days.length - 1;
      let anchor = days[i];

      while (i > 0) {
        const a = new Date(days[i-1]);
        const b = new Date(days[i]);
        const diff = (b - a) / 86400000;
        if (diff === 1) current++;
        else break;
        i--;
      }

      return { current, best, lastDayKey: anchor, hasToday: anchor === todayKey };
    };

    const calculatePlateLoading = (targetWeight, barWeight = 45) => {
      const plateOptions = [45, 35, 25, 10, 5, 2.5];
      const perSide = (targetWeight - barWeight) / 2;
      
      if (perSide <= 0) return { plates: [], perSide: 0, total: barWeight, display: 'Empty bar' };
      
      const plates = [];
      let remaining = perSide;
      
      for (const plate of plateOptions) {
        while (remaining >= plate) {
          plates.push(plate);
          remaining -= plate;
        }
      }
      
      const totalPerSide = plates.reduce((sum, p) => sum + p, 0);
      const total = barWeight + (totalPerSide * 2);
      
      return {
        plates,
        perSide: totalPerSide,
        total,
        display: plates.length > 0 ? plates.join(' + ') + ' per side' : 'Empty bar'
      };
    };

    const getProgressionAdvice = (sessions, currentBest) => {
      if (!sessions || sessions.length < 2) return null;
      const recentSessions = sessions.slice(-3);
      let easyCount = 0, goodCount = 0, hardCount = 0, atBest = 0;

      recentSessions.forEach(session => {
        (session.sets || []).forEach(set => {
          if (set.weight === currentBest) {
            atBest++;
            if (set.difficulty === 'easy') easyCount++;
            if (set.difficulty === 'good') goodCount++;
            if (set.difficulty === 'hard') hardCount++;
          }
        });
      });

      if (atBest >= 3 && (easyCount >= 2 || (easyCount + goodCount >= 3))) return { type: 'ready', message: 'Ready to bump weight next time' };
      if (atBest >= 2 && (goodCount + hardCount >= 2)) return { type: 'building', message: 'Keep building - you are close' };
      return null;
    };

    const Card = ({ children, className = '', onClick }) => (
      <div onClick={onClick} className={`bg-white p-4 rounded-xl border border-gray-200 ${className}`}>{children}</div>
    );

    const TabBar = ({ currentTab, setTab }) => (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around items-center h-16 px-2">
          {[
            { id: 'home', label: 'Home', icon: 'Home' },
            { id: 'workout', label: 'Workout', icon: 'Dumbbell' },
            { id: 'progress', label: 'Progress', icon: 'TrendingUp' },
            { id: 'profile', label: 'Profile', icon: 'User' }
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setTab(t.id)} 
              className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${
                currentTab === t.id 
                  ? 'text-purple-600' 
                  : 'text-gray-400'
              }`}
            >
              <Icon name={t.icon} className="w-6 h-6" />
              <span className="text-xs font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    );

    // ========== ONBOARDING ==========
    const IntroScreen = ({ onComplete }) => {
      const [card, setCard] = useState(0);
      const cards = [
        { icon: "💪", title: "Track Your Strength", body: "Simple logging. Real progress. No calorie police." },
        { icon: "Sparkles", title: "Made for Your Gym", body: "Planet Fitness? Commercial gym? Home setup? We've got you." },
        { icon: "Trophy", title: "Watch Progress Stack", body: "Every session builds strength. We'll show you how much." }
      ];
      const current = cards[card];
      const isLast = card === cards.length - 1;

      return (
        <div className="min-h-screen bg-purple-600 flex flex-col p-6">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8 text-center text-white mb-8 flex flex-col justify-center" style={{minHeight: '240px'}}>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  {typeof current.icon === 'string' && current.icon.length <= 2 ? current.icon : <Icon name={current.icon} className="w-7 h-7" />}
                </div>
                <h1 className="text-xl font-bold mb-2">{current.title}</h1>
                <p className="text-white/80 leading-relaxed text-sm">{current.body}</p>
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {cards.map((_, i) => (
                  <button key={i} onClick={() => setCard(i)} className={`h-1.5 rounded-full transition-all ${i === card ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
                ))}
              </div>

              <button onClick={() => isLast ? onComplete() : setCard(c => c + 1)} className="w-full bg-white text-purple-600 font-semibold py-3 rounded-xl">
                {isLast ? "Let's Go" : "Next"}
              </button>
            </div>
          </div>
        </div>
      );
    };

    const ProfileSetup = ({ profile, setProfile, settings, setSettings, onComplete }) => {
      const [step, setStep] = useState(0);
      const [selectedStarters, setSelectedStarters] = useState([]);

      const toggleStarter = (id) => {
        setSelectedStarters(prev => 
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
      };

      const baseSteps = [
        {
          title: "What's your name?",
          canProgress: profile.username.length > 0,
          content: (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center text-4xl">
                      {profile.avatar}
                    </div>
                    <select className="absolute inset-0 opacity-0 cursor-pointer" value={profile.avatar} onChange={e => setProfile({...profile, avatar: e.target.value})}>
                      {AVATARS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs shadow-md">✎</div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Your Name</label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={e => setProfile({...profile, username: e.target.value})}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:border-purple-400 focus:bg-white transition-all"
                      placeholder="Enter your name"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        },
        {
          title: "Where do you train?",
          canProgress: profile.gymType && profile.gymType.length > 0,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Select your gym type so we can show you the right exercises for your equipment.</p>
              {Object.entries(GYM_TYPES).map(([key, gym]) => (
                <button
                  key={key}
                  onClick={() => setProfile({...profile, gymType: key})}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                    profile.gymType === key ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl flex-shrink-0">{gym.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base ${profile.gymType === key ? 'text-purple-700' : 'text-gray-900'}`}>
                      {gym.label}
                    </div>
                    {gym.desc && <div className="text-xs text-gray-500 mt-0.5">{gym.desc}</div>}
                  </div>
                  {profile.gymType === key && (
                    <Icon name="Check" className="w-5 h-5 text-purple-600" />
                  )}
                </button>
              ))}
            </div>
          )
        },
        {
          title: "How are you feeling about the gym?",
          canProgress: profile.vibeChecked === true,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Be honest — we'll customize your experience based on your comfort level.</p>
              
              <button
                onClick={() => setProfile({...profile, isNervous: true, beginnerMode: true, vibeChecked: true})}
                className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                  profile.isNervous === true ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">😰</div>
                  <div className="flex-1">
                    <div className={`font-bold text-base ${profile.isNervous === true ? 'text-purple-700' : 'text-gray-900'}`}>
                      A bit nervous / First time
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      That's okay! We'll start you with simple, beginner-friendly exercises
                    </div>
                  </div>
                  {profile.isNervous === true && <Icon name="Check" className="w-5 h-5 text-purple-600" />}
                </div>
              </button>

              <button
                onClick={() => setProfile({...profile, isNervous: false, beginnerMode: false, vibeChecked: true})}
                className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                  profile.isNervous === false && profile.vibeChecked ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">💪</div>
                  <div className="flex-1">
                    <div className={`font-bold text-base ${profile.isNervous === false && profile.vibeChecked ? 'text-purple-700' : 'text-gray-900'}`}>
                      I'm comfortable / Been before
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Great! You'll have full access to all exercises right away
                    </div>
                  </div>
                  {profile.isNervous === false && profile.vibeChecked && <Icon name="Check" className="w-5 h-5 text-purple-600" />}
                </div>
              </button>
            </div>
          )
        }
      ];

      // Beginner starter selection step (only if nervous)
      const beginnerStep = {
        title: "Pick your starter exercises",
        canProgress: selectedStarters.length >= 3,
        content: (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-green-800">
                <strong>🌱 Beginner Mode:</strong> Pick at least 3 exercises to start with. These will be your "pinned" favorites. Complete your first workout to unlock more!
              </p>
            </div>
            
            <p className="text-sm text-gray-600">
              Selected: {selectedStarters.length}/8 (minimum 3)
            </p>

            <div className="grid grid-cols-2 gap-3">
              {BEGINNER_EXERCISES.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => toggleStarter(ex.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedStarters.includes(ex.id) 
                      ? 'border-purple-400 bg-purple-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{ex.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm ${selectedStarters.includes(ex.id) ? 'text-purple-700' : 'text-gray-900'}`}>
                        {ex.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{ex.why}</div>
                    </div>
                    {selectedStarters.includes(ex.id) && (
                      <Icon name="Check" className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      };

      const finalStep = {
        title: "You're all set!",
        canProgress: true,
        content: (
          <div className="space-y-6">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-3">{profile.avatar}</div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.username}</h2>
              <p className="text-sm text-gray-600">
                Training at {GYM_TYPES[profile.gymType]?.emoji} {GYM_TYPES[profile.gymType]?.label}
              </p>
              {profile.beginnerMode && (
                <div className="mt-3 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  🌱 Beginner Mode
                </div>
              )}
            </div>

            {profile.beginnerMode ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong className="text-green-700">You're starting with {selectedStarters.length} exercises.</strong> Complete your first workout to unlock more!
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong className="text-blue-700">Quick tip:</strong> You can add your weight and experience later in your profile for personalized targets. For now, let's get you logging!
                </p>
              </div>
            )}
          </div>
        )
      };

      // Build steps array dynamically
      const steps = profile.beginnerMode 
        ? [...baseSteps, beginnerStep, finalStep]
        : [...baseSteps, finalStep];

      const handleComplete = () => {
        // Save pinned exercises if in beginner mode
        if (profile.beginnerMode && selectedStarters.length > 0 && setSettings) {
          setSettings(prev => ({
            ...prev,
            pinnedExercises: selectedStarters,
            workoutViewMode: 'favorites'
          }));
        }
        onComplete();
      };

      const currentStep = steps[step];
      const isLast = step === steps.length - 1;

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <div className="flex-1 overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="bg-white px-6 pt-8 pb-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)} className="text-gray-500 hover:text-gray-700">
                    <Icon name="ChevronLeft" className="w-6 h-6" />
                  </button>
                )}
                <div className="flex-1">
                  <div className="flex gap-1 mb-3">
                    {steps.map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-purple-600' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <h1 className="text-2xl font-black text-gray-900">{currentStep.title}</h1>
                </div>
              </div>
            </div>

            <div className="p-6 animate-slide-up">
              {currentStep.content}
            </div>
          </div>

          <div className="bg-white border-t border-gray-100 p-4 shadow-2xl" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <button
              onClick={() => isLast ? handleComplete() : setStep(s => s + 1)}
              disabled={!currentStep.canProgress}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                currentStep.canProgress ? 'bg-purple-600' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isLast ? 'Start Logging 🚀' : 'Next'}
            </button>
          </div>
        </div>
      );
    };

    // ========== CALCULATIONS ==========
    const getBestForEquipment = (sessions = []) => {
      let best = 0;
      sessions.forEach(s => {
        (s.sets || []).forEach(set => { if (set.weight > best) best = set.weight; });
      });
      return best || null;
    };

    const getStrongWeightForEquipment = (profile, equipId) => {
      const eq = EQUIPMENT_DB[equipId];
      const advancedIdx = 3;
      // Removed activity multiplier - science says it's not relevant for strength standards
      
      let w = (profile.weight || 0) * (eq.multipliers?.[profile.gender]?.[advancedIdx] || 0) * (eq.ratio || 1);
      
      if (eq.type === 'machine' && eq.stackCap) w = Math.min(w, eq.stackCap);
      
      return clampTo5(w || 10);
    };

    const getNextTarget = (profile, equipId, best) => {
      const eq = EQUIPMENT_DB[equipId];
      
      if (best) {
        const increment = eq.tags.includes('Legs') ? 10 : 5;
        return clampTo5(best + increment);
      }
      
      const expIdx = EXPERIENCE_LEVELS.findIndex(e => e.label === profile.experience);
      // Removed activity multiplier - science says it's not relevant for strength standards
      let w = (profile.weight || 0) * (eq.multipliers?.[profile.gender]?.[expIdx] || 0) * (eq.ratio || 1);
      
      if (eq.type === 'machine' && eq.stackCap) w = Math.min(w, eq.stackCap);
      
      return clampTo5(w || 10);
    };

    const computeStrengthScore = (profile, history) => {
      const ids = Object.keys(EQUIPMENT_DB);
      const logged = ids.filter(id => (history[id] || []).length > 0);

      if (logged.length === 0) {
        return { score: 0, avgPct: 0, coveragePct: 0, loggedCount: 0, total: ids.length };
      }

      const ratios = logged.map(id => {
        const best = getBestForEquipment(history[id] || []);
        const strong = getStrongWeightForEquipment(profile, id);
        return best ? Math.min(1, best / strong) : 0;
      });

      const avg = ratios.reduce((a,b)=>a+b,0) / ratios.length;
      const coverage = logged.length / ids.length;
      const score01 = (avg * 0.8) + (coverage * 0.2);
      const score = Math.round(score01 * 100);

      return { score, avgPct: Math.round(avg*100), coveragePct: Math.round(coverage*100), loggedCount: logged.length, total: ids.length };
    };

    const computeAchievements = ({ history, strengthScoreObj, streakObj }) => {
      const days = uniqueDayKeysFromHistory(history);
      const sessionsTotal = Object.values(history || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
      const equipmentLogged = Object.keys(EQUIPMENT_DB).filter(id => (history[id] || []).length > 0).length;

      const unlocks = [
        { id: 'first', title: 'First Log', desc: 'Logged your first session', unlocked: sessionsTotal >= 1, emoji: '✅' },
        { id: '3days', title: '3-Day Streak', desc: '3 consecutive training days', unlocked: streakObj.best >= 3, emoji: '🔥' },
        { id: '7days', title: '7-Day Streak', desc: '7 consecutive training days', unlocked: streakObj.best >= 7, emoji: '🏆' },
        { id: 'score50', title: 'Strength Tier 50', desc: 'Strength Score hit 50', unlocked: strengthScoreObj.score >= 50, emoji: '💪' },
        { id: 'score75', title: 'Strength Tier 75', desc: 'Strength Score hit 75', unlocked: strengthScoreObj.score >= 75, emoji: '⚡' },
        { id: 'equipment5', title: 'Explorer', desc: 'Logged 5+ exercises', unlocked: equipmentLogged >= 5, emoji: '🧭' },
        { id: 'days10', title: 'Show Up Club', desc: 'Trained on 10 different days', unlocked: days.length >= 10, emoji: '📅' },
      ];

      return unlocks;
    };

    const getTodaysWorkoutType = (history, appState) => {
      const order = ["Push","Pull","Legs"];
      const lastType = appState?.lastWorkoutType || null;
      const lastDayKey = appState?.lastWorkoutDayKey || null;
      const todayKey = toDayKey(new Date());

      if (lastDayKey === todayKey && lastType) return lastType;
      if (!lastType) return "Push";
      
      const idx = order.indexOf(lastType);
      return order[(idx + 1) % order.length] || "Push";
    };

    // ========== HOME SCREEN ==========
    const Home = ({ profile, setProfile, history, cardioHistory, appState, setAppState, onGoWorkout, onStartSuggestedWorkout, onGoProfile, onOpenCardio, streakObj, achievements, todayWorkoutType, settings }) => {
      const [showAchievements, setShowAchievements] = useState(false);
      const [workoutCollapsed, setWorkoutCollapsed] = useState(settings?.suggestedWorkoutCollapsed ?? true);
      
      const todayKey = toDayKey(new Date());
      const doneToday = useMemo(() => {
        const days = uniqueDayKeysFromHistory(history, cardioHistory, appState?.restDays);
        return days.includes(todayKey);
      }, [history, cardioHistory, appState?.restDays]);

      const isRestDayToday = appState?.restDays?.includes(todayKey);

      const lastWorkoutInfo = useMemo(() => {
        const allSessions = [];
        Object.entries(history).forEach(([equipId, sessions]) => {
          sessions.forEach(s => allSessions.push({ ...s, equipId }));
        });
        
        if (allSessions.length === 0) return null;
        
        allSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
        const last = allSessions[0];
        const date = new Date(last.date);
        const daysAgo = Math.floor((new Date() - date) / 86400000);
        
        return {
          equipment: EQUIPMENT_DB[last.equipId]?.name || 'Unknown',
          daysAgo,
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
      }, [history]);

      const gymType = GYM_TYPES[profile.gymType];
      const availableTypes = [];
      if (gymType?.machines) availableTypes.push('machines');
      if (gymType?.dumbbells?.available) availableTypes.push('dumbbells');
      if (gymType?.barbells?.available) availableTypes.push('barbells');

      const getSuggestedExercises = () => {
        const plan = WORKOUT_PLANS[todayWorkoutType];
        const suggested = [];
        
        availableTypes.forEach(type => {
          const exercises = plan[type] || [];
          suggested.push(...exercises);
        });
        
        return suggested.slice(0, 4);
      };

      const suggestedExercises = getSuggestedExercises();
      const pinnedIds = settings?.pinnedExercises || [];
      const shouldShowPinnedOnHome = pinnedIds.length > 0 && pinnedIds.length <= 6;
      const homeWorkoutIds = shouldShowPinnedOnHome ? pinnedIds : suggestedExercises;
      const homeWorkoutTitle = shouldShowPinnedOnHome ? "Pinned Workout" : `${todayWorkoutType} Day`;
      const homeWorkoutCount = shouldShowPinnedOnHome ? pinnedIds.length : suggestedExercises.length;
      const starterIds = (pinnedIds || []).slice(0, 3);

      const unlockedCount = achievements.filter(a => a.unlocked).length;

      const handleLogRestDay = () => {
        setAppState(prev => ({
          ...prev,
          restDays: [...(prev.restDays || []), todayKey]
        }));
      };

      return (
        <div className="flex flex-col h-full bg-gray-50">
          <div className="bg-white border-b border-gray-100 sticky top-0 z-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="p-4 py-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">Planet Strength</div>
                <h1 className="text-2xl font-black text-gray-900">Hey, {profile.username}</h1>
              </div>
              <button 
                onClick={onGoProfile}
                className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl active:scale-95 transition-transform"
              >
                {profile.avatar}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <div className="text-sm font-medium italic leading-relaxed text-purple-900 dark-mode-quote-text">
                "{motivationalQuotes[Math.floor((new Date().getDate() + new Date().getMonth()) % motivationalQuotes.length)].quote}"
              </div>
              <div className="text-xs font-semibold mt-2 text-purple-600 dark-mode-quote-author">
                — {motivationalQuotes[Math.floor((new Date().getDate() + new Date().getMonth()) % motivationalQuotes.length)].author}
              </div>
            </Card>

            {/* Streak Card with Rest Day Button */}
            {streakObj.current > 0 && (
              <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🔥</div>
                    <div>
                      <div className="text-2xl font-black text-orange-600">{streakObj.current} Day Streak</div>
                      <div className="text-xs text-gray-500">Best: {streakObj.best} days</div>
                    </div>
                  </div>
                  {!doneToday && !isRestDayToday && (
                    <button
                      onClick={handleLogRestDay}
                      className="px-4 py-2 bg-white border border-orange-200 rounded-xl text-sm font-semibold text-orange-600 active:scale-95 transition-all"
                    >
                      😴 Rest Day
                    </button>
                  )}
                </div>
                {isRestDayToday && (
                  <div className="mt-3 pt-3 border-t border-orange-200 text-center text-sm text-orange-600 font-medium">
                    ✓ Rest day logged — streak protected!
                  </div>
                )}
              </Card>
            )}

            {/* Rest Day Button for users without streak */}
            {streakObj.current === 0 && !doneToday && !isRestDayToday && (
              <button
                onClick={handleLogRestDay}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold border border-gray-200 active:scale-95 transition-all"
              >
                😴 Log Rest Day
              </button>
            )}

            {!profile.gymType && (
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">⚠️</div>
                  <div>
                    <h3 className="text-base font-bold text-orange-900 mb-1">Select Your Gym</h3>
                    <p className="text-sm text-orange-700 leading-relaxed">
                      Choose your gym type so we can show you exercises that match your equipment.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(GYM_TYPES).map(([key, gym]) => (
                    <button
                      key={key}
                      onClick={() => setProfile({...profile, gymType: key})}
                      className="w-full p-3 rounded-xl border-2 border-orange-200 bg-white hover:border-orange-400 transition-all flex items-center gap-3"
                    >
                      <div className="text-2xl">{gym.emoji}</div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-sm text-gray-900">{gym.label}</div>
                        {gym.desc && <div className="text-xs text-gray-500">{gym.desc}</div>}
                      </div>
                      <Icon name="ChevronRight" className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {(() => {
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              
              const recentWorkouts = Object.entries(history).flatMap(([equipId, sessions]) =>
                sessions.map(s => ({ equipId, ...s }))
              ).filter(w => new Date(w.date) >= sevenDaysAgo)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
              
              const workoutDays = [...new Set(recentWorkouts.map(w => 
                new Date(w.date).toLocaleDateString()
              ))].length;
              
              if (recentWorkouts.length === 0) return null;
              
              return (
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-gray-400 font-bold uppercase">Last 7 Days</div>
                      <div className="text-2xl font-black text-gray-900">{workoutDays} {workoutDays === 1 ? 'Day' : 'Days'}</div>
                      <div className="text-xs text-gray-500">{recentWorkouts.length} total sets</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 font-semibold">Exercises Hit</div>
                      <div className="text-2xl font-black text-purple-600">
                        {[...new Set(recentWorkouts.map(w => w.equipId))].length}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mt-3">
                    {[...Array(7)].map((_, i) => {
                      const day = new Date();
                      day.setDate(day.getDate() - (6 - i));
                      const dayStr = day.toLocaleDateString();
                      const hasWorkout = recentWorkouts.some(w => 
                        new Date(w.date).toLocaleDateString() === dayStr
                      );
                      return (
                        <div key={i} className="text-center">
                          <div className="text-xs text-gray-400 font-semibold mb-1">
                            {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
                          </div>
                          <div className={`h-8 rounded-lg ${
                            hasWorkout ? 'bg-purple-600' : 'bg-gray-200'
                          }`}></div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })()}

            {/* Today's Workout / Starters */}
            {profile.beginnerMode && !profile.beginnerUnlocked ? (
              <Card>
                <div className="text-xs text-gray-400 font-bold uppercase mb-2">Starter Exercises</div>
                <div className="text-lg font-black text-gray-900 mb-1">Your first 3</div>
                <div className="text-xs text-gray-500 mb-3">Log 1 strength or cardio session to unlock everything.</div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {starterIds.map(id => {
                    const eq = EQUIPMENT_DB[id];
                    return (
                      <div key={id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center shadow-sm">
                        <div className="text-2xl mb-2">
                          {eq.type === 'machine' ? '⚙️' : eq.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'}
                        </div>
                        <div className="font-bold text-gray-900 text-xs leading-tight mb-1">{eq.name}</div>
                        <div className="text-xs text-gray-500">{eq.target}</div>
                      </div>
                    );
                  })}
                </div>
                <button 
                  onClick={onGoWorkout}
                  className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl"
                >
                  Start Workout
                </button>
              </Card>
            ) : (
              <Card>
                <button 
                  onClick={() => setWorkoutCollapsed(!workoutCollapsed)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="text-left">
                    <div className="text-xs text-gray-400 font-bold uppercase">Today's Workout</div>
                    <div className="text-lg font-black text-gray-900">{homeWorkoutTitle}</div>
                    <div className="text-xs text-gray-500">{homeWorkoutCount} exercises ready</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!shouldShowPinnedOnHome && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const order = ["Push","Pull","Legs"];
                          const idx = order.indexOf(todayWorkoutType);
                          const next = order[(idx + 1) % order.length];
                          setAppState(prev => ({ ...prev, lastWorkoutType: next, lastWorkoutDayKey: toDayKey(new Date()) }));
                        }}
                        className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 active:scale-95 transition-transform"
                      >
                        Swap
                      </button>
                    )}
                    <Icon name="ChevronDown" className={`w-5 h-5 text-gray-500 transition-transform ${workoutCollapsed ? '' : 'rotate-180'}`} />
                  </div>
                </button>

                {!workoutCollapsed && (
                  <div className="mt-3 animate-expand">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {(shouldShowPinnedOnHome ? homeWorkoutIds.slice(0, 6) : suggestedExercises.slice(0, 4)).map(id => {
                        const eq = EQUIPMENT_DB[id];
                        return (
                          <div key={id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center shadow-sm">
                            <div className="text-2xl mb-2">
                              {eq.type === 'machine' ? '⚙️' : eq.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'}
                            </div>
                            <div className="font-bold text-gray-900 text-xs leading-tight mb-1">{eq.name}</div>
                            <div className="text-xs text-gray-500">{eq.target}</div>
                          </div>
                        );
                      })}
                    </div>

                    <button 
                      onClick={shouldShowPinnedOnHome ? onGoWorkout : onStartSuggestedWorkout}
                      className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl mb-2"
                    >
                      {shouldShowPinnedOnHome ? "Start Workout" : (doneToday ? "Start Another Set" : "Start Workout")}
                    </button>

                    <button 
                      onClick={onGoWorkout}
                      className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm border border-gray-200"
                    >
                      Browse All Exercises
                    </button>
                  </div>
                )}
              </Card>
            )}

            


            
<div className="text-center text-xs text-gray-400">
              Tiny progress today is still progress. Keep showing up.
            </div>
          </div>
        </div>
      );
    };

    // ========== CARDIO LOGGER ==========
    const CardioLogger = ({ type, onSave, onClose }) => {
      const cardio = CARDIO_TYPES[type];
      const [mode, setMode] = useState('regular');
      const [duration, setDuration] = useState('');
      const [activity, setActivity] = useState(cardio.regularActivities[0].id);
      const [distance, setDistance] = useState('');
      const [distanceUnit, setDistanceUnit] = useState(type === 'swimming' ? 'yards' : 'miles');
      const [hours, setHours] = useState('');
      const [minutes, setMinutes] = useState('');
      const [seconds, setSeconds] = useState('');
      const [notes, setNotes] = useState('');

      const calculatePace = () => {
        if (!distance || distance <= 0) return null;
        const totalSeconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60 + (Number(seconds) || 0);
        if (totalSeconds <= 0) return null;
        
        if (type === 'swimming') {
          const per100 = totalSeconds / (Number(distance) / 100);
          const paceMin = Math.floor(per100 / 60);
          const paceSec = Math.round(per100 % 60);
          return `${paceMin}:${paceSec.toString().padStart(2, '0')}/100${distanceUnit === 'yards' ? 'y' : 'm'}`;
        } else {
          const perUnit = totalSeconds / Number(distance);
          const paceMin = Math.floor(perUnit / 60);
          const paceSec = Math.round(perUnit % 60);
          return `${paceMin}:${paceSec.toString().padStart(2, '0')}/${distanceUnit === 'miles' ? 'mi' : 'km'}`;
        }
      };

      const handleSave = () => {
        const session = { date: new Date().toISOString(), mode, type };
        if (mode === 'regular') {
          session.duration = Number(duration);
          session.activity = activity;
        } else {
          session.distance = Number(distance);
          session.distanceUnit = distanceUnit;
          session.timeSeconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60 + (Number(seconds) || 0);
          session.pace = calculatePace();
        }
        if (notes) session.notes = notes;
        onSave(type, session);
      };

      const canSave = mode === 'regular' ? duration && Number(duration) > 0 : distance && Number(distance) > 0;

      return (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[100]" onClick={onClose}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg animate-slide-up" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-8 overflow-y-auto" style={{ maxHeight: '90vh' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cardio.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{cardio.name}</h2>
                    <p className="text-sm text-gray-500">Log your session</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                  <Icon name="X" className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setMode('regular')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'regular' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Regular
                </button>
                <button
                  onClick={() => setMode('pro')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    mode === 'pro' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Pro 🎯
                </button>
              </div>

              {mode === 'regular' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      placeholder="30"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg font-bold focus:border-purple-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Activity</label>
                    <div className="grid grid-cols-2 gap-2">
                      {cardio.regularActivities.map(act => (
                        <button
                          key={act.id}
                          onClick={() => setActivity(act.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            activity === act.id ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <span className="text-xl mr-2">{act.emoji}</span>
                          <span className="font-medium text-sm">{act.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Distance</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={distance}
                        onChange={e => setDistance(e.target.value)}
                        placeholder={type === 'swimming' ? '1000' : '3.1'}
                        step={type === 'swimming' ? '25' : '0.1'}
                        className="flex-1 p-4 border-2 border-gray-200 rounded-xl text-lg font-bold focus:border-purple-400 outline-none"
                      />
                      <select
                        value={distanceUnit}
                        onChange={e => setDistanceUnit(e.target.value)}
                        className="p-4 border-2 border-gray-200 rounded-xl font-semibold bg-white"
                      >
                        {type === 'swimming' ? (
                          <><option value="yards">yards</option><option value="meters">meters</option></>
                        ) : (
                          <><option value="miles">miles</option><option value="km">km</option></>
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Time</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="0" className="w-full p-3 border-2 border-gray-200 rounded-xl text-center font-bold focus:border-purple-400 outline-none" />
                        <div className="text-xs text-gray-500 text-center mt-1">hrs</div>
                      </div>
                      <div className="flex-1">
                        <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="30" className="w-full p-3 border-2 border-gray-200 rounded-xl text-center font-bold focus:border-purple-400 outline-none" />
                        <div className="text-xs text-gray-500 text-center mt-1">min</div>
                      </div>
                      <div className="flex-1">
                        <input type="number" value={seconds} onChange={e => setSeconds(e.target.value)} placeholder="00" className="w-full p-3 border-2 border-gray-200 rounded-xl text-center font-bold focus:border-purple-400 outline-none" />
                        <div className="text-xs text-gray-500 text-center mt-1">sec</div>
                      </div>
                    </div>
                  </div>
                  {calculatePace() && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                      <div className="text-xs text-gray-500 font-semibold uppercase">Pace</div>
                      <div className="text-2xl font-black text-purple-600">{calculatePace()}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <label className="text-sm font-semibold text-gray-700 block mb-2">Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it feel?" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none resize-none" rows={2} />
              </div>

              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`w-full py-4 rounded-xl font-bold text-white mt-6 transition-all ${canSave ? 'bg-purple-600 active:scale-[0.98]' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Save Session
              </button>
            </div>
          </div>
        </div>
      );
    };

    // ========== SUGGESTED WORKOUT SCREEN ==========
    const SuggestedWorkout = ({ profile, history, suggestedExercises, todayWorkoutType, onEquipmentSelect, onBack }) => {
      return (
        <div className="flex flex-col h-full bg-gray-50">
          <div className="bg-white border-b border-gray-100 sticky top-0 z-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="p-4 py-5 flex items-center gap-4">
              <button onClick={onBack} className="text-gray-600">
                <Icon name="ChevronLeft" className="w-6 h-6" />
              </button>
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase">Today's Workout</div>
                <h1 className="text-2xl font-black text-gray-900">{todayWorkoutType} Day</h1>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-24">
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-xl">🎯</div>
                <div className="font-semibold text-gray-900">Your Workout Plan</div>
              </div>
              <p className="text-sm text-gray-600">
                {suggestedExercises.length} exercises for {todayWorkoutType.toLowerCase()}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {suggestedExercises.map((id, index) => {
                const eq = EQUIPMENT_DB[id];
                const sessions = history[id] || [];
                const lastSession = sessions[sessions.length - 1];
                let bestWeight = 0;
                sessions.forEach(s => {
                  (s.sets || []).forEach(set => {
                    if (set.weight > bestWeight) bestWeight = set.weight;
                  });
                });

                return (
                  <button
                    key={id}
                    onClick={() => onEquipmentSelect(id)}
                    className="bg-white p-3 rounded-xl border-2 border-gray-100 active:scale-[0.98] transition-all text-center hover:border-purple-200 shadow-sm"
                  >
                    <div className="mb-2">
                      <span className="inline-block text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded mb-2">
                        #{index + 1}
                      </span>
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-2xl mx-auto mb-2">
                        {eq.type === 'machine' ? '⚙️' : eq.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'}
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{eq.name}</h3>
                      <p className="text-xs text-gray-500">{eq.target}</p>
                    </div>
                    
                    {bestWeight > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-400 font-semibold">BEST</div>
                        <div className="text-lg font-black text-gray-900">
                          {bestWeight}<span className="text-xs text-gray-400 font-normal ml-1">lbs</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 text-purple-600 font-semibold text-sm">
                      Log →
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded-2xl">
              <div className="text-xs font-bold text-gray-400 uppercase mb-2">💡 Pro Tip</div>
              <p className="text-sm text-gray-600">
                Focus on form over weight. Each exercise should feel challenging on the last 2-3 reps.
              </p>
            </div>
          </div>
        </div>
      );
    };

    // ========== WORKOUT SCREEN ==========
    const Workout = ({ profile, setProfile, history, onEquipmentSelect, onOpenCardio, settings, setSettings, todayWorkoutType }) => {
      const [filter, setFilter] = useState('All');
      const [showMore, setShowMore] = useState(false);
      const [showGymPicker, setShowGymPicker] = useState(false);
      const [searchQuery, setSearchQuery] = useState('');
      const [viewMode, setViewMode] = useState(settings?.workoutViewMode || 'all');

      const gymType = GYM_TYPES[profile.gymType];
      
      const availableEquipment = useMemo(() => {
        const ids = Object.keys(EQUIPMENT_DB);
        return ids.filter(id => {
          const eq = EQUIPMENT_DB[id];
          if (eq.type === 'machine') return gymType?.machines;
          if (eq.type === 'dumbbell') return gymType?.dumbbells?.available;
          if (eq.type === 'barbell') return gymType?.barbells?.available;
      return false;
    });
  }, [gymType]);

  const visibleCardio = useMemo(() => {
    if (!(filter === 'All' || filter === 'Cardio')) return [];

    const query = searchQuery.trim().toLowerCase();

    const matchesQuery = (cardio) => {
      if (!query) return true;
      const haystack = [
        cardio.name,
        'cardio',
        ...(cardio.regularActivities || []).map(a => a.label)
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    };

    return Object.entries(CARDIO_TYPES)
      .filter(([, data]) => matchesQuery(data))
      .map(([key, data]) => ({ key, ...data }));
  }, [filter, searchQuery]);

  const filteredEquipment = useMemo(() => {
    const allEquipment = Object.keys(EQUIPMENT_DB);
    
    let result = [];
    
        if (filter === 'All') result = availableEquipment;
        else if (filter === 'Machines') result = allEquipment.filter(id => EQUIPMENT_DB[id].type === 'machine');
        else if (filter === 'Dumbbells') result = allEquipment.filter(id => EQUIPMENT_DB[id].type === 'dumbbell');
        else if (filter === 'Barbells') result = allEquipment.filter(id => EQUIPMENT_DB[id].type === 'barbell');
        else if (filter === 'Cardio') result = [];
        else if (filter === 'Today') {
          const plan = WORKOUT_PLANS[todayWorkoutType];
          const todayIds = [];
          if (gymType?.machines) todayIds.push(...(plan.machines || []));
          if (gymType?.dumbbells?.available) todayIds.push(...(plan.dumbbells || []));
          if (gymType?.barbells?.available) todayIds.push(...(plan.barbells || []));
          result = todayIds;
        } else {
          result = availableEquipment.filter(id => EQUIPMENT_DB[id].tags.includes(filter));
        }
        
        // Apply beginner mode filter
        if (profile.beginnerMode && !profile.beginnerUnlocked) {
          const pinnedIds = settings?.pinnedExercises || [];
          result = result.filter(id => pinnedIds.includes(id));
        }
        // Apply BIG_BASICS filter if setting is off and filter is 'All'
        else if (!settings?.showAllExercises && !showMore && filter === 'All') {
          result = result.filter(id => BIG_BASICS.includes(id));
        }

        // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(id => 
        EQUIPMENT_DB[id].name.toLowerCase().includes(query) ||
        EQUIPMENT_DB[id].target.toLowerCase().includes(query)
          );
        }

        // Apply favorites filter
        if (viewMode === 'favorites') {
          const pinnedIds = settings?.pinnedExercises || [];
        result = result.filter(id => pinnedIds.includes(id));
      }
      
      return result;
  }, [filter, availableEquipment, todayWorkoutType, gymType, settings?.showAllExercises, showMore, searchQuery, viewMode, settings?.pinnedExercises, profile.beginnerMode, profile.beginnerUnlocked]);

  const filters = ['All', 'Today', 'Cardio', 'Machines', 'Dumbbells', 'Barbells', 'Push', 'Pull', 'Legs'];
  const totalVisibleExercises = filteredEquipment.length + visibleCardio.length;

  const getLastDate = (id) => {
    const sessions = history[id] || [];
    if (sessions.length === 0) return null;
    return new Date(sessions[sessions.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      };

      const togglePin = (id, e) => {
        e.stopPropagation();
        const current = settings?.pinnedExercises || [];
        const updated = current.includes(id) 
          ? current.filter(x => x !== id)
          : [...current, id];
        setSettings(prev => ({ ...prev, pinnedExercises: updated }));
      };

      const isPinned = (id) => (settings?.pinnedExercises || []).includes(id);

      const getEquipmentIcon = (type) => {
        if (type === 'machine') return <Icon name="Activity" className="w-6 h-6" />;
        if (type === 'dumbbell') return <span className="text-xl">🏋️</span>;
        if (type === 'barbell') return <span className="text-xl">🏋️‍♂️</span>;
        return null;
      };

      return (
        <div className="flex flex-col h-full bg-gray-50">
          <div className="bg-white border-b border-gray-100 sticky top-0 z-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="px-4">
              <div className="flex justify-between items-center py-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Workout</h1>
                  <div className="text-xs text-gray-400 font-bold">
                    {filter === 'Today' ? `Today: ${todayWorkoutType} Day` : `${totalVisibleExercises} exercises`}
                  </div>
                </div>
                <button 
                  onClick={() => setShowGymPicker(true)}
                  className="text-right active:scale-95 transition-transform"
                >
                  <div className="text-xs text-purple-600 font-bold uppercase flex items-center gap-1">
                    {gymType?.emoji} {gymType?.label}
                    <Icon name="ChevronDown" className="w-3 h-3" />
                  </div>
                  {profile.weight > 0 && (
                    <div className="text-sm font-bold text-gray-700">{profile.weight} lbs</div>
                  )}
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
                {filters.map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      filter === f ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2 pb-3">
                <button
                  onClick={() => setViewMode('all')}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                    viewMode === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setViewMode('favorites')}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1 ${
                    viewMode === 'favorites' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  ⭐ Favorites
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-24">
            {/* Beginner Mode Banner */}
            {profile.beginnerMode && !profile.beginnerUnlocked && (
              <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🌱</span>
                  <span className="font-bold text-green-800 text-sm">Beginner Mode Active</span>
                </div>
                <p className="text-xs text-green-700">
                  Complete your first workout to unlock all exercises! For now, focus on your pinned starters.
                </p>
              </div>
            )}

            <div className="p-4 grid grid-cols-3 gap-2">
              {visibleCardio.map(cardio => (
                <button
                  key={cardio.key}
                  onClick={() => onOpenCardio(cardio.key)}
                  className="bg-white p-2 rounded-xl border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer shadow-sm relative text-center"
                >
                  <div className="text-center mb-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600 mx-auto mb-1 text-lg">
                      <span className="text-xl">{cardio.emoji}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-[10px] leading-tight mb-0.5">{cardio.name}</h3>
                    <p className="text-[9px] text-gray-400">Cardio</p>
                  </div>

                  <div className="text-center pt-1 border-t border-gray-100">
                    <div className="text-[9px] font-bold text-gray-400 uppercase">Track</div>
                    <div className="text-sm font-black text-purple-600">Time + Distance</div>
                  </div>
                </button>
              ))}
              {filteredEquipment.map(id => {
                const eq = EQUIPMENT_DB[id];
                const sessions = history[id] || [];
                const best = getBestForEquipment(sessions);
                const nextTarget = getNextTarget(profile, id, best);
                const advice = best && settings?.showSuggestions ? getProgressionAdvice(sessions, best) : null;

                return (
                  <div key={id} onClick={() => onEquipmentSelect(id)} className="bg-white p-2 rounded-xl border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer shadow-sm relative">
                    {/* Pin Button */}
                    <button
                      onClick={(e) => togglePin(id, e)}
                      className={`absolute top-1 right-1 p-1 rounded-full transition-all z-10 ${
                        isPinned(id) ? 'text-yellow-500' : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <span className="text-sm">{isPinned(id) ? '⭐' : '☆'}</span>
                    </button>

                    <div className="text-center mb-1">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600 mx-auto mb-1 text-lg">
                        {getEquipmentIcon(eq.type)}
                      </div>
                      <h3 className="font-bold text-gray-900 text-[10px] leading-tight mb-0.5">{eq.name}</h3>
                      <p className="text-[9px] text-gray-400">{eq.target}</p>
                    </div>

                    <div className="text-center pt-1 border-t border-gray-100">
                      {best ? (
                        <>
                          <div className="text-[9px] font-bold text-gray-400 uppercase">Best</div>
                          <div className="text-sm font-black text-gray-900">
                            {best}<span className="text-[9px] font-medium text-gray-400 ml-0.5">lbs</span>
                          </div>
                          <div className="text-[9px] text-purple-600 font-bold">Next: {nextTarget}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-[9px] font-bold text-gray-400 uppercase">Start</div>
                          <div className="text-sm font-black text-purple-600">
                            {nextTarget}<span className="text-[9px] font-medium text-gray-400 ml-0.5">lbs</span>
                          </div>
                        </>
                      )}
                    </div>

                    {advice && (
                      <div className={`mt-1 p-1 rounded text-center ${
                        advice.type === 'ready' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
                      }`}>
                        <span className={`text-[8px] font-semibold ${advice.type === 'ready' ? 'text-green-700' : 'text-blue-700'}`}>
                          {advice.message}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {totalVisibleExercises === 0 && (
                <div className="col-span-3 text-center py-12 px-4">
                  <div className="text-4xl mb-3">{viewMode === 'favorites' ? '⭐' : searchQuery ? '🔍' : '🤔'}</div>
                  {viewMode === 'favorites' ? (
                    <>
                      <p className="text-gray-900 font-bold mb-2">No Favorites Yet</p>
                      <p className="text-sm text-gray-500">Tap the star on any exercise to pin it here.</p>
                    </>
                  ) : searchQuery ? (
                    <>
                      <p className="text-gray-900 font-bold mb-2">No Results</p>
                      <p className="text-sm text-gray-500">Try a different search term.</p>
                    </>
                  ) : !gymType ? (
                    <>
                      <p className="text-gray-900 font-bold mb-2">No Gym Selected</p>
                      <p className="text-sm text-gray-500 mb-4">Select your gym type to see available exercises</p>
                      <button
                        onClick={() => setShowGymPicker(true)}
                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl active:scale-95 transition-all"
                      >
                        Select Gym Type
                      </button>
                    </>
                  ) : filter === 'Barbells' && !gymType?.barbells?.available ? (
                    <>
                      <p className="text-gray-900 font-bold mb-2">No Barbells Available</p>
                      <p className="text-sm text-gray-500">Your gym doesn't have barbells. Try Machines or Dumbbells.</p>
                    </>
                  ) : filter === 'Machines' && !gymType?.machines ? (
                    <>
                      <p className="text-gray-900 font-bold mb-2">No Machines Available</p>
                      <p className="text-sm text-gray-500">Your gym doesn't have machines. Try Barbells or Dumbbells.</p>
                    </>
                  ) : (
                    <p className="text-gray-500">No exercises match this filter</p>
                  )}
                </div>
              )}
            </div>
            
            {!settings.showAllExercises && !showMore && filter === 'All' && availableEquipment.length > BIG_BASICS.filter(id => availableEquipment.includes(id)).length && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => setShowMore(true)}
                  className="w-full py-3 bg-white border-2 border-purple-200 text-purple-600 font-bold rounded-xl active:scale-95 transition-all hover:bg-purple-50"
                >
                  Show More Exercises ({availableEquipment.length - BIG_BASICS.filter(id => availableEquipment.includes(id)).length} more)
                </button>
              </div>
            )}
          </div>
          
          {showGymPicker && (
            <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[100]" onClick={() => setShowGymPicker(false)}>
              <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Switch Gym</h2>
                  <button onClick={() => setShowGymPicker(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <Icon name="X" className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(GYM_TYPES).map(([key, gym]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setProfile({...profile, gymType: key});
                        setShowGymPicker(false);
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        profile.gymType === key ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl flex-shrink-0">{gym.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-base ${profile.gymType === key ? 'text-purple-700' : 'text-gray-900'}`}>
                          {gym.label}
                        </div>
                        {gym.desc && <div className="text-xs text-gray-500 mt-0.5">{gym.desc}</div>}
                      </div>
                      {profile.gymType === key && (
                        <Icon name="Check" className="w-5 h-5 text-purple-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    // ========== PLATE CALCULATOR ==========
    const PlateCalculator = ({ targetWeight, barWeight, onClose }) => {
      const [displayWeight, setDisplayWeight] = useState(targetWeight || barWeight || '');
      
      const plates = [45, 35, 25, 10, 5, 2.5];
      
      const calculatePlates = (weight) => {
        const w = Number(weight) || 0;
        const weightPerSide = (w - barWeight) / 2;
        if (weightPerSide <= 0) return [];
        
        const result = [];
        let remaining = weightPerSide;
        
        for (const plate of plates) {
          while (remaining >= plate) {
            result.push(plate);
            remaining -= plate;
          }
        }
        
        return result;
      };
      
      const platesToLoad = calculatePlates(displayWeight);
      const actualWeight = barWeight + (platesToLoad.reduce((sum, p) => sum + p, 0) * 2);
      
      return (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-[100] animate-slide-up" onClick={onClose}>
          <div className="bg-white dark-mode-modal rounded-t-3xl w-full max-w-lg p-6 pb-8" style={{ maxHeight: '80vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Plate Calculator</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <Icon name="X" className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Target Weight</label>
              <input
                type="number"
                value={displayWeight}
                onChange={(e) => setDisplayWeight(e.target.value)}
                placeholder="Enter weight"
                className="w-full text-2xl font-bold text-center p-4 border-2 border-purple-200 rounded-xl focus:border-purple-600 outline-none bg-white text-gray-900 dark-mode-input"
              />
              <div className="text-center text-xs text-gray-500 mt-2">Bar weight: {barWeight} lbs</div>
            </div>
            
            {platesToLoad.length > 0 ? (
              <>
                <div className="bg-purple-50 rounded-xl p-4 mb-4">
                  <div className="text-center mb-3">
                    <div className="text-sm font-semibold text-purple-700">Actual Weight</div>
                    <div className="text-3xl font-black text-purple-600">{actualWeight} lbs</div>
                  </div>
                  
                  <div className="flex justify-center items-center gap-2 my-6">
                    <div className="text-xs text-gray-500 transform -rotate-90 whitespace-nowrap">Each Side</div>
                    <div className="flex flex-col gap-1">
                      {platesToLoad.map((plate, i) => (
                        <div
                          key={i}
                          className="bg-purple-600 text-white rounded px-3 py-2 text-center font-bold text-sm"
                          style={{ width: `${60 + plate}px` }}
                        >
                          {plate}
                        </div>
                      ))}
                    </div>
                    <div className="w-16 h-3 bg-gray-800 rounded"></div>
                  </div>
                  
                  <div className="text-center text-xs text-gray-600">
                    Put these plates on <span className="font-bold">each side</span> of the bar
                  </div>
                </div>
                
                <div className="grid grid-cols-6 gap-2">
                  {plates.map(p => {
                    const count = platesToLoad.filter(plate => plate === p).length;
                    return (
                      <div key={p} className={`text-center p-2 rounded-lg border-2 ${
                        count > 0 ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="text-xs font-bold text-gray-900">{p}</div>
                        {count > 0 && <div className="text-xs text-purple-600">×{count}</div>}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏋️</div>
                <div className="text-sm">Just the bar ({barWeight} lbs)</div>
              </div>
            )}
          </div>
        </div>
      );
    };

    // ========== EQUIPMENT DETAIL ==========
    const EquipmentDetail = ({ id, profile, history, onSave, onClose }) => {
      const eq = EQUIPMENT_DB[id];
      const sessions = history || [];
      const [activeTab, setActiveTab] = useState('workout');
      const [showLogger, setShowLogger] = useState(true);
      const [showPlateCalc, setShowPlateCalc] = useState(false);

      // Quick Log Mode: reduces taps without sacrificing strength tracking.
      // Uses anchored (sticky) weight + reps, and one-tap set logging.
      const [quickLogEnabled, setQuickLogEnabled] = useState(false);
      const [anchorWeight, setAnchorWeight] = useState('');
      const [anchorReps, setAnchorReps] = useState('');
      const [restDefaultSec, setRestDefaultSec] = useState(90);
      const [restRemainingSec, setRestRemainingSec] = useState(0);
      const [restRunning, setRestRunning] = useState(false);

      const [sets, setSets] = useState([
        { weight: '', reps: '', difficulty: '', showDifficulty: false },
        { weight: '', reps: '', difficulty: '', showDifficulty: false },
        { weight: '', reps: '', difficulty: '', showDifficulty: false },
        { weight: '', reps: '', difficulty: '', showDifficulty: false }
      ]);

      const best = useMemo(() => getBestForEquipment(sessions), [sessions]);
      const strongWeight = useMemo(() => getStrongWeightForEquipment(profile, id), [profile, id]);
      const nextTarget = useMemo(() => getNextTarget(profile, id, best), [profile, id, best]);

      const expIdx = EXPERIENCE_LEVELS.findIndex(e => e.label === profile.experience);
      const activityMultiplier = ACTIVITY_LEVELS.find(a => a.label === profile.activityLevel)?.multiplier || 1.0;

      const goalWeightRaw = (profile.weight || 0) * (eq.multipliers?.[profile.gender]?.[expIdx] || 0) * (eq.ratio || 1) * activityMultiplier;
      const goal = clampTo5(eq.stackCap ? Math.min(goalWeightRaw, eq.stackCap) : goalWeightRaw);

      const r5 = (n) => Math.max(10, Math.round(n / 5) * 5);

      const goalBias = (GOALS.find(g => g.id === profile.goal)?.bias?.reps) || 'middle';
      const repBase = goalBias === 'higher' ? 12 : goalBias === 'lower' ? 8 : 10;

      const recommendedSets = [
        { weight: r5(goal * 0.5), reps: repBase + 5 },
        { weight: r5(goal * 0.85), reps: repBase + 2 },
        { weight: goal, reps: repBase },
        { weight: r5(goal * 1.05), reps: Math.max(6, repBase - 1) }
      ];

      const handleUseRecommended = () => {
        setSets(recommendedSets.map(s => ({
          weight: String(s.weight),
          reps: String(s.reps),
          difficulty: '',
          showDifficulty: false
        })));
      };

      useEffect(() => {
        handleUseRecommended();
      }, [id]);

      // --- Last session micro-context (for confidence, not guilt) ---
      const lastSessionInfo = useMemo(() => {
        if (!sessions || sessions.length === 0) return null;
        const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
        const last = sorted[0];
        const lastSets = last?.sets || [];
        if (lastSets.length === 0) return null;
        const maxW = Math.max(...lastSets.map(s => s.weight || 0));
        const avgR = Math.round(lastSets.reduce((sum, s) => sum + (s.reps || 0), 0) / lastSets.length);
        return {
          date: last.date,
          weight: maxW,
          reps: avgR,
          setCount: lastSets.length
        };
      }, [sessions]);

      // Initialize anchored values for Quick Log when exercise changes.
      useEffect(() => {
        // Prefer last session; otherwise use recommended third set.
        if (lastSessionInfo) {
          setAnchorWeight(String(lastSessionInfo.weight || ''));
          setAnchorReps(String(lastSessionInfo.reps || ''));
        } else {
          const fallback = recommendedSets?.[2] || recommendedSets?.[1] || recommendedSets?.[0];
          setAnchorWeight(fallback ? String(fallback.weight) : '');
          setAnchorReps(fallback ? String(fallback.reps) : '');
        }
        // Reset rest timer when switching exercises.
        setRestRunning(false);
        setRestRemainingSec(0);
      }, [id]);

      // Rest timer tick
      useEffect(() => {
        if (!restRunning) return;
        if (restRemainingSec <= 0) {
          setRestRunning(false);
          return;
        }
        const t = setInterval(() => {
          setRestRemainingSec(prev => {
            const next = Math.max(0, (prev || 0) - 1);
            return next;
          });
        }, 1000);
        return () => clearInterval(t);
      }, [restRunning, restRemainingSec]);

      const startRest = () => {
        const sec = Number(restDefaultSec) || 90;
        setRestRemainingSec(sec);
        setRestRunning(true);
      };

      const formatRest = (sec) => {
        const s = Math.max(0, sec || 0);
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${m}:${String(r).padStart(2, '0')}`;
      };

      const handleQuickAddSet = () => {
        const w = Number(anchorWeight);
        const r = Number(anchorReps);
        if (!w || !r || w <= 0 || r <= 0) return;
        const next = [...sets];
        const idx = next.findIndex(s => !s.weight && !s.reps);
        const targetIdx = idx >= 0 ? idx : next.length;
        if (targetIdx === next.length) {
          next.push({ weight: '', reps: '', difficulty: '', showDifficulty: false });
        }
        next[targetIdx] = {
          ...next[targetIdx],
          weight: String(w),
          reps: String(r),
          difficulty: next[targetIdx].difficulty || '',
          showDifficulty: false
        };
        setSets(next);
        startRest();
      };

      const handleSaveSession = () => {
        const validSets = sets
          .filter(s => s.weight && s.reps && Number(s.weight) > 0 && Number(s.reps) > 0)
          .map(s => ({
            weight: Number(s.weight),
            reps: Number(s.reps),
            difficulty: s.difficulty || undefined
          }));

        if (validSets.length > 0) {
          onSave(id, { date: new Date().toISOString(), sets: validSets });
        }
      };

      const percentToStrong = best ? Math.min(100, Math.round((best / strongWeight) * 100)) : 0;

      const getPlateLoadingForSet = (weight) => {
        if (eq.type !== 'barbell' || !weight) return null;
        return calculatePlateLoading(Number(weight), profile.barWeight || 45);
      };

      return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl shadow-2xl flex flex-col animate-slide-up" style={{maxHeight: '90vh'}}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <Icon name="ChevronLeft" className="w-6 h-6"/>
                </button>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{eq.name}</h2>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {eq.type === 'machine' ? '⚙️' : eq.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'} {eq.muscles}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <Icon name="X" className="w-5 h-5"/>
              </button>
            </div>

            <div className="flex border-b border-gray-100 bg-white flex-shrink-0">
              <button
                onClick={() => setActiveTab('workout')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  activeTab === 'workout' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'
                }`}
              >
                Log
              </button>
              <button
                onClick={() => setActiveTab('cues')}
                className={`flex-1 py-3 text-sm font-bold transition-colors ${
                  activeTab === 'cues' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'
                }`}
              >
                Tips
              </button>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ minHeight: '500px', maxHeight: '500px' }}>
              <div className="p-5 space-y-5 h-full">
                {activeTab === 'workout' ? (
                  <>
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-purple-600 uppercase">Your Best</div>
                          <div className="text-2xl font-black text-gray-900">{best ? `${best} lbs` : '—'}</div>
                          {profile.weight > 0 && (
                            <div className="text-xs text-gray-500">Strong level: <span className="font-bold">{strongWeight} lbs</span></div>
                          )}
                        </div>
                        {profile.weight > 0 && (
                          <div className="text-right">
                            <div className="text-xs font-bold text-gray-500 uppercase">Progress</div>
                            <div className="text-2xl font-black text-gray-700">{percentToStrong}%</div>
                          </div>
                        )}
                      </div>
                      {profile.weight > 0 && (
                        <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600 rounded-full" style={{ width: `${percentToStrong}%` }} />
                        </div>
                      )}
                      
                      {eq.type === 'barbell' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPlateCalc(true);
                          }}
                          className="w-full mt-3 py-2 px-3 rounded-lg text-xs font-bold bg-white text-purple-700 border-2 border-purple-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          🏋️ Plate Calculator
                        </button>
                      )}
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setShowLogger(!showLogger)}
                        className="w-full p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Icon name="Trophy" className="w-5 h-5 text-purple-600"/>
                          <h3 className="text-xs font-black uppercase text-gray-900">Log Today</h3>
                        </div>
                        <Icon name="ChevronDown" className={`w-5 h-5 text-gray-600 transition-transform ${showLogger ? 'rotate-180' : ''}`}/>
                      </button>

                      {showLogger && (
                        <div className="px-4 pb-4 space-y-3 animate-expand">
                          {profile.weight > 0 && (
                            <button
                              onClick={handleUseRecommended}
                              className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 active:scale-95 transition-all"
                            >
                              Use Recommended Sets
                            </button>
                          )}

                          {/* Last session micro-context */}
                          {lastSessionInfo && (
                            <div className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                              <div className="text-[10px] font-bold text-gray-400 uppercase">Last session</div>
                              <div className="text-xs text-gray-700 font-semibold">
                                {new Date(lastSessionInfo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {lastSessionInfo.weight} lbs × {lastSessionInfo.reps} · {lastSessionInfo.setCount} sets
                              </div>
                            </div>
                          )}

                          {/* Quick Log Toggle */}
                          <button
                            onClick={() => setQuickLogEnabled(v => !v)}
                            className={`w-full px-3 py-2 rounded-xl border flex items-center justify-between transition-all active:scale-[0.99] ${
                              quickLogEnabled ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="text-left">
                              <div className={`text-xs font-black uppercase ${quickLogEnabled ? 'text-purple-700' : 'text-gray-700'}`}>Quick Log</div>
                              <div className="text-[11px] text-gray-500">One tap logs a set using your last weight.</div>
                            </div>
                            <div className={`w-11 h-6 rounded-full p-1 transition-all ${quickLogEnabled ? 'bg-purple-600' : 'bg-gray-300'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full transition-all ${quickLogEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                          </button>

                          {/* Quick Log Panel */}
                          {quickLogEnabled && (
                            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-black uppercase text-purple-700">Anchored set</div>
                                <div className="text-[10px] text-purple-600 font-semibold">Change weight anytime</div>
                              </div>
                              <div className="flex gap-3 mb-3">
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    value={anchorWeight}
                                    onChange={(e) => setAnchorWeight(e.target.value)}
                                    className="w-full p-2 rounded-lg font-bold text-center bg-white border border-purple-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 outline-none transition-all text-gray-700"
                                    placeholder="lbs"
                                  />
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    value={anchorReps}
                                    onChange={(e) => setAnchorReps(e.target.value)}
                                    className="w-full p-2 rounded-lg font-bold text-center bg-white border border-purple-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 outline-none transition-all text-gray-700"
                                    placeholder="reps"
                                  />
                                </div>
                              </div>

                              <button
                                onClick={handleQuickAddSet}
                                disabled={!anchorWeight || !anchorReps}
                                className={`w-full py-3 rounded-xl font-black text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                  anchorWeight && anchorReps ? 'bg-purple-600 shadow-lg' : 'bg-purple-200 cursor-not-allowed'
                                }`}
                              >
                                <span className="text-lg">＋</span>
                                Add Set
                              </button>

                              <div className="mt-3 flex items-center justify-between bg-white border border-purple-100 rounded-xl px-3 py-2">
                                <div>
                                  <div className="text-[10px] font-bold text-gray-400 uppercase">Rest</div>
                                  <div className="text-sm font-black text-gray-900">
                                    {restRunning ? formatRest(restRemainingSec) : formatRest(restDefaultSec)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setRestDefaultSec(s => Math.max(15, (Number(s) || 90) - 15))}
                                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 font-bold active:scale-95"
                                    title="-15s"
                                  >
                                    −15
                                  </button>
                                  <button
                                    onClick={() => setRestDefaultSec(s => Math.min(600, (Number(s) || 90) + 15))}
                                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 font-bold active:scale-95"
                                    title="+15s"
                                  >
                                    +15
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (restRunning) setRestRunning(false);
                                      else startRest();
                                    }}
                                    className={`px-3 py-2 rounded-lg border font-bold active:scale-95 ${restRunning ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-700'}`}
                                  >
                                    {restRunning ? 'Pause' : 'Start'}
                                  </button>
                                </div>
                              </div>

                              <div className="mt-2 text-[10px] text-purple-700/80 font-semibold">
                                Tip: this keeps your strength trends accurate—just fewer taps.
                              </div>
                            </div>
                          )}

                          {sets.map((set, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                              <div className="text-xs font-bold text-gray-500 uppercase mb-2">Set {i + 1}</div>
                              <div className="flex gap-3 mb-2">
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    value={set.weight}
                                    onChange={e => {
                                      const next = [...sets];
                                      next[i].weight = e.target.value;
                                      setSets(next);
                                    }}
                                    className="w-full p-2 rounded-lg font-bold text-center bg-white border border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 outline-none transition-all text-gray-700"
                                    placeholder="lbs"
                                  />
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="number"
                                    value={set.reps}
                                    onChange={e => {
                                      const next = [...sets];
                                      next[i].reps = e.target.value;
                                      setSets(next);
                                    }}
                                    className="w-full p-2 rounded-lg font-bold text-center bg-white border border-gray-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-100 outline-none transition-all text-gray-700"
                                    placeholder="reps"
                                  />
                                </div>
                              </div>

                              {eq.type === 'barbell' && set.weight && (
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                  <div className="text-xs font-bold text-blue-700 mb-1">
                                    {(() => {
                                      const loading = getPlateLoadingForSet(set.weight);
                                      return loading ? loading.display : 'Loading...';
                                    })()}
                                  </div>
                                  <div className="text-xs text-blue-600">
                                    Total: {(() => {
                                      const loading = getPlateLoadingForSet(set.weight);
                                      return loading ? `${loading.total} lbs` : '—';
                                    })()}
                                  </div>
                                </div>
                              )}

                              {set.weight && set.reps && (
                                <>
                                  <button
                                    onClick={() => {
                                      const next = [...sets];
                                      next[i].showDifficulty = !next[i].showDifficulty;
                                      setSets(next);
                                    }}
                                    className="w-full text-xs text-purple-600 font-semibold py-1 hover:bg-purple-50 rounded transition-colors"
                                  >
                                    {set.showDifficulty ? 'Hide' : 'How did it feel?'} {set.showDifficulty ? '▲' : '▼'}
                                  </button>

                                  {set.showDifficulty && (
                                    <div className="grid grid-cols-2 gap-2 mt-2 animate-expand">
                                      {DIFFICULTY_LEVELS.map(diff => (
                                        <button
                                          key={diff.value}
                                          onClick={() => {
                                            const next = [...sets];
                                            next[i].difficulty = diff.value;
                                            setSets(next);
                                          }}
                                          className={`p-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                                            set.difficulty === diff.value ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white text-gray-600'
                                          }`}
                                        >
                                          <div className="text-base mb-1">{diff.emoji}</div>
                                          <div>{diff.label}</div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))}

                          <button
                            onClick={handleSaveSession}
                            disabled={!sets.some(s => s.weight && s.reps)}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${
                              sets.some(s => s.weight && s.reps) ? 'bg-purple-600 shadow-lg' : 'bg-gray-300 cursor-not-allowed'
                            }`}
                          >
                            <Icon name="Check" className="w-5 h-5"/>
                            Save Session
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="Check" className="w-5 h-5 text-green-600"/>
                        <h3 className="text-xs font-black uppercase text-green-700">Cues</h3>
                      </div>
                      <ul className="space-y-2">
                        {eq.cues.map((cue, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-900">
                            <span className="text-green-600 font-bold">•</span>
                            <span>{cue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="Info" className="w-5 h-5 text-blue-600"/>
                        <h3 className="text-xs font-black uppercase text-blue-700">Progression</h3>
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed">{eq.progression}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {showPlateCalc && (
            <PlateCalculator
              targetWeight={nextTarget}
              barWeight={profile.barWeight || 45}
              onClose={() => setShowPlateCalc(false)}
            />
          )}
        </div>
      );
    };

    // ========== PROGRESS TAB ==========
    const Progress = ({ profile, history, strengthScoreObj }) => {
      const [selectedEquipment, setSelectedEquipment] = useState(null);
      const [showHistory, setShowHistory] = useState(false);

      const allEquipment = Object.keys(EQUIPMENT_DB);

      const equipmentWithHistory = allEquipment.filter(id => {
        const best = getBestForEquipment(history[id] || []);
        return best && best > 0;
      }).length;

      const MiniChart = ({ equipId }) => {
        const sessions = history[equipId] || [];
        if (sessions.length < 2) return <p className="text-sm text-gray-400 text-center py-8">Log at least 2 sessions to chart progress</p>;

        const dataPoints = sessions.map(s => {
          let maxWeight = 0;
          (s.sets || []).forEach(set => { if (set.weight > maxWeight) maxWeight = set.weight; });
          return { date: new Date(s.date), weight: maxWeight };
        }).filter(d => d.weight > 0).slice(-10);

        if (dataPoints.length < 2) return <p className="text-sm text-gray-400 text-center py-8">Need more data points</p>;

        const weights = dataPoints.map(d => d.weight);
        const minW = Math.min(...weights) - 10;
        const maxW = Math.max(...weights) + 10;
        const range = (maxW - minW) || 1;

        const width = 280, height = 120, padding = 20;
        const points = dataPoints.map((d, i) => {
          const x = padding + (i / (dataPoints.length - 1)) * (width - padding * 2);
          const y = height - padding - ((d.weight - minW) / range) * (height - padding * 2);
          return { x, y };
        });
        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        const firstWeight = dataPoints[0].weight;
        const lastWeight = dataPoints[dataPoints.length - 1].weight;
        const change = lastWeight - firstWeight;

        return (
          <div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#9333ea" strokeWidth="2" />
              ))}
            </svg>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gray-500">{firstWeight} lbs</span>
              <span className={`font-bold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{change} lbs
              </span>
              <span className="text-gray-900 font-bold">{lastWeight} lbs</span>
            </div>
          </div>
        );
      };

      return (
        <div className="flex flex-col h-full bg-gray-50">
          <div className="bg-white border-b border-gray-100 sticky top-0 z-10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="p-4">
              <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
              <div className="text-xs text-gray-400 font-bold">Your strength journey</div>
            </div>
            
            <div className="flex gap-2 px-4 pb-3">
              <button
                onClick={() => {
                  setSelectedEquipment(null);
                  setShowHistory(false);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  !selectedEquipment && !showHistory ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  setSelectedEquipment(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  showHistory ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'
                }`}
              >
                History
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
            {showHistory ? (
              <>
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">Workout History</h3>
                    <Icon name="Clock" className="w-4 h-4 text-gray-400" />
                  </div>
                  {(() => {
                    const allSessions = [];
                    Object.entries(history).forEach(([equipId, sessions]) => {
                      sessions.forEach(s => allSessions.push({ ...s, equipId }));
                    });
                    
                    const sortedSessions = allSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
                    
                    if (sortedSessions.length === 0) {
                      return <p className="text-sm text-gray-500 text-center py-8">No workouts logged yet</p>;
                    }
                    
                    return (
                      <div className="space-y-2">
                        {sortedSessions.map((session, idx) => {
                          const eq = EQUIPMENT_DB[session.equipId];
                          const maxWeight = Math.max(...(session.sets || []).map(s => s.weight || 0));
                          const totalReps = (session.sets || []).reduce((sum, s) => sum + (s.reps || 0), 0);
                          const sets = (session.sets || []).length;
                          
                          return (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="text-xl">{eq?.type === 'machine' ? '⚙️' : eq?.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'}</div>
                                  <div>
                                    <div className="text-sm font-bold text-gray-900">{eq?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-purple-600">{maxWeight} lbs</div>
                                  <div className="text-xs text-gray-500">{sets} × {Math.round(totalReps / sets)} reps</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-4 gap-1 mt-2">
                                {(session.sets || []).map((set, i) => (
                                  <div key={i} className="text-center p-1 bg-white rounded border border-gray-100">
                                    <div className="text-xs font-bold text-gray-900">{set.weight}</div>
                                    <div className="text-[10px] text-gray-500">×{set.reps}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </Card>
              </>
            ) : !selectedEquipment ? (
              <>
                {/* Streak Card */}
                {(() => {
                  const streakObj = computeStreak(history);
                  return (
                    <Card>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-400 font-bold uppercase">Current Streak</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Icon name="Flame" className="w-6 h-6 text-orange-500" />
                            <span className="text-3xl font-black text-gray-900">{streakObj.current}</span>
                            <span className="text-sm text-gray-500">days</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400 font-semibold">Best</div>
                          <div className="text-2xl font-black text-purple-600">{streakObj.best}</div>
                        </div>
                      </div>
                    </Card>
                  );
                })()}

                {/* Workout Summary Cards - Compact Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <Card className="p-3">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Score</div>
                    <div className="text-2xl font-black text-purple-600">{strengthScoreObj.score}</div>
                    <div className="text-[9px] text-gray-500">/ 100</div>
                  </Card>
                  
                  <Card className="p-3">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Tracked</div>
                    <div className="text-2xl font-black text-gray-900">{equipmentWithHistory}</div>
                    <div className="text-[9px] text-gray-500">/ {allEquipment.length}</div>
                  </Card>
                  
                  <Card className="p-3">
                    <div className="text-xs text-gray-400 font-bold uppercase mb-1">Avg</div>
                    <div className="text-2xl font-black text-gray-900">{strengthScoreObj.avgPct}%</div>
                    <div className="text-[9px] text-gray-500">strength</div>
                  </Card>
                </div>

                {/* Recent Workout History */}
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">Recent Workouts</h3>
                    <Icon name="Clock" className="w-4 h-4 text-gray-400" />
                  </div>
                  {(() => {
                    const allSessions = [];
                    Object.entries(history).forEach(([equipId, sessions]) => {
                      sessions.forEach(s => allSessions.push({ ...s, equipId }));
                    });
                    
                    const recentSessions = allSessions
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 10);
                    
                    if (recentSessions.length === 0) {
                      return <p className="text-sm text-gray-500 text-center py-4">No workouts logged yet</p>;
                    }
                    
                    return (
                      <div className="space-y-2">
                        {recentSessions.map((session, idx) => {
                          const eq = EQUIPMENT_DB[session.equipId];
                          const maxWeight = Math.max(...(session.sets || []).map(s => s.weight || 0));
                          const totalReps = (session.sets || []).reduce((sum, s) => sum + (s.reps || 0), 0);
                          return (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="text-lg">{eq?.type === 'machine' ? '⚙️' : eq?.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'}</div>
                                <div>
                                  <div className="text-xs font-bold text-gray-900">{eq?.name || 'Unknown'}</div>
                                  <div className="text-[10px] text-gray-500">
                                    {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-bold text-purple-600">{maxWeight} lbs</div>
                                <div className="text-[10px] text-gray-500">{totalReps} reps</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </Card>

                {/* Exercise Progress List */}
                <Card>
                  <h3 className="font-bold text-gray-900 mb-3">Exercise Progress</h3>
                  <div className="space-y-2">
                    {allEquipment.filter(id => {
                      const best = getBestForEquipment(history[id] || []);
                      return best && best > 0;
                    }).slice(0, 5).map(id => {
                      const eq = EQUIPMENT_DB[id];
                      const best = getBestForEquipment(history[id] || []);
                      const strong = profile.weight > 0 ? getStrongWeightForEquipment(profile, id) : null;
                      const pct = best && strong ? Math.min(100, Math.round((best / strong) * 100)) : 0;
                      
                      return (
                        <div key={id} onClick={() => { setSelectedEquipment(id); setShowHistory(false); }} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:border-purple-200 transition-all">
                          <div className="flex items-center gap-2">
                            <div className="text-lg">{eq.type === 'machine' ? '⚙️' : eq.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'}</div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{eq.name}</div>
                              <div className="text-[10px] text-gray-500">{best} lbs • {pct}% to goal</div>
                            </div>
                          </div>
                          <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {equipmentWithHistory === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">Start logging to track progress</p>
                  )}
                </Card>
              </>
            ) : (
              <Card>
                <button onClick={() => setSelectedEquipment(null)} className="flex items-center gap-2 mb-4 text-purple-600 font-semibold text-sm">
                  <Icon name="ChevronLeft" className="w-4 h-4" />
                  Back to Overview
                </button>
                
                {(() => {
                  const eq = EQUIPMENT_DB[selectedEquipment];
                  const sessions = history[selectedEquipment] || [];
                  if (sessions.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">{eq.type === 'machine' ? '⚙️' : eq.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'}</div>
                        <h3 className="font-bold text-gray-900 mb-1">{eq.name}</h3>
                        <p className="text-sm text-gray-500">No sessions logged yet</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{eq.name}</h3>
                      <MiniChart equipId={selectedEquipment} />
                    </div>
                  );
                })()}
              </Card>
            )}
          </div>
        </div>
      );
    };

    // ========== PROFILE TAB ==========
    const ProfileView = ({ profile, setProfile, settings, setSettings, onReset, onExportData, onImportData }) => {
      const [showLearn, setShowLearn] = useState(false);
      const [expandedTopic, setExpandedTopic] = useState(null);
      const [showAvatarPicker, setShowAvatarPicker] = useState(false);
      const [showUpdateProfile, setShowUpdateProfile] = useState(false);

      const avatarOptions = ['🦁','🐻','🦅','🐺','🦈','🦖','🐯','🦍','🐉','⚡','🔥','💪','🎯','🚀'];

      const activityLevel = ACTIVITY_LEVELS.find(a => a.label === profile.activityLevel);
      const goalMeta = GOALS.find(g => g.id === profile.goal);
      const gymType = GYM_TYPES[profile.gymType];

      const learnTopics = [
        {
          id: 'rest-days',
          title: 'Why Rest Days Matter',
          emoji: '😴',
          short: 'Muscles grow when you rest',
          content: 'Your muscles do not grow in the gym - they grow during rest. Training creates micro-tears in muscle fibers. Rest days allow repair and growth. Aim for 1-2 full rest days per week. Sleep 7-9 hours. Overtraining leads to injury, burnout, and slower progress.'
        },
        {
          id: 'fat-loss',
          title: 'How Fat Loss Really Works',
          emoji: '🔥',
          short: 'The truth about losing fat',
          content: 'Fat loss requires a calorie deficit - eating less than you burn. There are no shortcuts. Strength training preserves muscle while losing fat. Expect 0.5-1% bodyweight loss per week. Faster = more muscle loss. Focus on sustainable habits, not crash diets. Lift weights, eat enough protein, be patient.'
        },
        {
          id: 'muscle-gain',
          title: 'Building Muscle Takes Time',
          emoji: '💪',
          short: 'Realistic expectations',
          content: 'Natural muscle gain is slow. Beginners: 1-2 lbs/month. Intermediate: 0.5-1 lb/month. Advanced: 0.25-0.5 lb/month. You need a small calorie surplus and high protein (0.8-1g per lb bodyweight). Progressive overload is essential. Be consistent for months, not weeks. Trust the process.'
        },
        {
          id: 'progressive-overload',
          title: 'Progressive Overload',
          emoji: '📈',
          short: 'The foundation of getting stronger',
          content: 'Progressive overload means gradually increasing the stress on your muscles over time. Add weight or reps each session. Even small increases (2.5-5 lbs) add up to massive gains over months.'
        },
        {
          id: 'push-pull-legs',
          title: 'Push/Pull/Legs Split',
          emoji: '🔄',
          short: 'How we organize workouts',
          content: 'Push: Chest, shoulders, triceps (pressing movements). Pull: Back, biceps (pulling movements). Legs: Everything below the waist. This split ensures balanced development and adequate recovery.'
        },
        {
          id: 'targets',
          title: 'How We Calculate Targets',
          emoji: '🎯',
          short: 'Personalized to your body',
          content: 'Targets are based on your body weight, gender, and experience level. "Strong" weight = what an experienced lifter your size typically lifts. These are realistic goals based on science, not elite performance. As you log workouts, your targets automatically increase.'
        },
        {
          id: 'rep-ranges',
          title: 'Rep Ranges by Goal',
          emoji: '🔢',
          short: 'Different goals, different reps',
          content: 'Strength: 5-8 reps with heavy weight. Muscle building: 8-12 reps. Endurance/fat loss: 12-15+ reps. All ranges build strength, but emphasis shifts.'
        },
        {
          id: 'when-to-increase',
          title: 'When to Add Weight',
          emoji: '⬆️',
          short: 'Progress safely',
          content: 'Increase weight when all sets feel "easy" (2+ reps left in the tank). Small, consistent jumps beat big jumps. Better to add 5 lbs you can handle than 10 lbs you struggle with.'
        },
        {
          id: 'equipment-types',
          title: 'Machines vs Free Weights',
          emoji: '⚖️',
          short: 'Each has benefits',
          content: 'Machines: Safer, easier to learn, great for isolation. Dumbbells: Build stabilizers, natural movement. Barbells: Move the most weight, best for strength. Use what you have access to - consistency matters more than equipment.'
        }
      ];

      return (
        <div className="flex flex-col h-full bg-gray-50">
          <div className="bg-white border-b border-gray-100 sticky top-0 z-10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <h1 className="text-2xl font-black text-gray-900 p-4 py-5">Profile</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-24">
            <Card className="mb-6 text-center">
              <button 
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="text-6xl mb-2 mx-auto active:scale-95 transition-transform"
              >
                {profile.avatar}
              </button>
              <div className="text-xs text-purple-600 font-semibold mb-3">Tap to change avatar</div>
              
              {showAvatarPicker && (
                <div className="grid grid-cols-7 gap-2 mb-4 p-3 bg-purple-50 rounded-xl animate-expand">
                  {avatarOptions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setProfile({...profile, avatar: emoji});
                        setShowAvatarPicker(false);
                      }}
                      className={`text-3xl p-2 rounded-lg transition-all ${
                        profile.avatar === emoji ? 'bg-purple-600 scale-110' : 'hover:bg-white active:scale-95'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              
              <h2 className="text-xl font-bold text-gray-900">{profile.username}</h2>
              <p className="text-sm text-gray-500">
                {gymType?.label}
                {profile.weight > 0 && ` • ${profile.weight} lbs`}
                {profile.age > 0 && ` • ${profile.age} years`}
              </p>

              <div className="flex gap-2 justify-center mt-3 flex-wrap">
                {profile.experience && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">
                    {profile.experience}
                  </span>
                )}
                {activityLevel && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                    {activityLevel.emoji} {profile.activityLevel}
                  </span>
                )}
                {goalMeta && (
                  <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">
                    {goalMeta.emoji} {goalMeta.label}
                  </span>
                )}
              </div>
            </Card>

            {profile.weight === 0 && (
              <Card className="mb-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">✨</div>
                  <div>
                    <h3 className="text-base font-bold text-orange-900 mb-1">Get Personalized Targets</h3>
                    <p className="text-sm text-orange-700 leading-relaxed mb-2">
                      Add your <strong>weight, gender, and experience</strong> to get custom strength targets tailored to your body.
                    </p>
                    <p className="text-xs text-orange-600 mb-3">
                      Activity Level and Goal are optional - only set them if you want!
                    </p>
                    <button
                      onClick={() => setShowUpdateProfile(true)}
                      className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg text-sm active:scale-95 transition-all"
                    >
                      Complete Profile
                    </button>
                  </div>
                </div>
              </Card>
            )}

            <Card className="mb-4">
              <button 
                onClick={() => setShowLearn(!showLearn)} 
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Icon name="BookOpen" className="w-5 h-5 text-purple-600"/>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-sm">Learn</div>
                    <div className="text-xs text-gray-500">Training fundamentals</div>
                  </div>
                </div>
                <Icon name="ChevronDown" className={`w-5 h-5 text-gray-400 transition-transform ${showLearn ? 'rotate-180' : ''}`} />
              </button>

              {showLearn && (
                <div className="mt-4 space-y-2 animate-expand">
                  {learnTopics.map(topic => (
                    <div key={topic.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                        className="w-full p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-2xl flex-shrink-0">{topic.emoji}</div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-gray-900 text-sm">{topic.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{topic.short}</div>
                        </div>
                        <Icon name="ChevronDown" className={`w-4 h-4 text-gray-400 transition-transform ${expandedTopic === topic.id ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {expandedTopic === topic.id && (
                        <div className="px-3 pb-3 animate-expand">
                          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                            {topic.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <h3 className={`text-xs font-bold uppercase mb-2 px-1 ${settings.darkMode ? "text-gray-400" : "text-gray-400"}`}>Quick Toggles</h3>

            <Card className="mb-4">
              <button
                onClick={() => setSettings({...settings, showSuggestions: !settings.showSuggestions})}
                className="w-full flex items-center justify-between py-2 border-b border-gray-100 pb-4 mb-4"
              >
                <div className="flex items-center gap-3">
                  <Icon name="Lightbulb" className="w-5 h-5 text-purple-600"/>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-sm">Smart Suggestions</div>
                    <div className="text-xs text-gray-500">Show progression advice</div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${settings.showSuggestions ? 'bg-purple-600' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${settings.showSuggestions ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </button>
              
              <button
                onClick={() => setSettings({...settings, darkMode: !settings.darkMode})}
                className="w-full flex items-center justify-between py-2 border-b border-gray-100 pb-4 mb-4"
              >
                <div className="flex items-center gap-3">
                  <Icon name="Moon" className="w-5 h-5 text-indigo-600"/>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-sm">Dark Mode</div>
                    <div className="text-xs text-gray-500">Neon-themed dark interface</div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${settings.darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </button>
              
              <button
                onClick={() => setSettings({...settings, showAllExercises: !settings.showAllExercises})}
                className="w-full flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <Icon name="List" className="w-5 h-5 text-purple-600"/>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-sm">Show All Exercises</div>
                    <div className="text-xs text-gray-500">Display all 50 exercises by default</div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${settings.showAllExercises ? 'bg-purple-600' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${settings.showAllExercises ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </button>
            </Card>

            <Card className="mb-4">
              <button 
                onClick={() => setShowUpdateProfile(!showUpdateProfile)} 
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Icon name="User" className="w-5 h-5 text-purple-600"/>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-sm">Update Profile</div>
                    <div className="text-xs text-gray-500">Weight, age, experience, goals</div>
                  </div>
                </div>
                <Icon name="ChevronDown" className={`w-5 h-5 text-gray-400 transition-transform ${showUpdateProfile ? 'rotate-180' : ''}`} />
              </button>

              {showUpdateProfile && (
                <div className="mt-4 space-y-4 animate-expand">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <strong className="font-bold">💡 How this works:</strong> Add your weight, gender, and experience to get personalized strength targets. Activity Level and Goal are optional - only set them if you want.
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Weight (lbs)</label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-200 rounded-xl font-bold outline-none bg-white focus:border-purple-400 transition-colors"
                      value={profile.weight || ''}
                      onChange={e => setProfile({...profile, weight: Number(e.target.value)})}
                      placeholder="Enter your weight"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Age</label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-200 rounded-xl font-bold outline-none bg-white focus:border-purple-400 transition-colors"
                      value={profile.age || ''}
                      onChange={e => setProfile({...profile, age: Number(e.target.value)})}
                      placeholder="Your age"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Male','Female'].map(g => (
                        <button
                          key={g}
                          onClick={() => setProfile({...profile, gender: g})}
                          className={`py-3 rounded-xl font-semibold border-2 transition-all ${
                            profile.gender === g ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-400 bg-white'
                          }`}
                        >
                          <span className="text-xl mr-2">{g === 'Male' ? '♂' : '♀'}</span>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Experience</label>
                    <div className="grid grid-cols-2 gap-2">
                      {EXPERIENCE_LEVELS.map(l => (
                        <button
                          key={l.label}
                          onClick={() => setProfile({...profile, experience: l.label})}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            profile.experience === l.label ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className={`font-semibold text-sm ${profile.experience === l.label ? 'text-purple-700' : 'text-gray-700'}`}>
                            {l.label}
                          </div>
                          <div className="text-xs text-gray-400">{l.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                      Activity Level <span className="text-[10px] text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setProfile({...profile, activityLevel: null})}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                          profile.activityLevel === null ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="text-xl flex-shrink-0">⏭️</div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${profile.activityLevel === null ? 'text-purple-700' : 'text-gray-700'}`}>
                            Skip for now
                          </div>
                          <div className="text-xs text-gray-400 truncate">You can set this later</div>
                        </div>
                      </button>
                      {ACTIVITY_LEVELS.map(l => (
                        <button
                          key={l.label}
                          onClick={() => setProfile({...profile, activityLevel: l.label})}
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                            profile.activityLevel === l.label ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="text-xl flex-shrink-0">{l.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-sm ${profile.activityLevel === l.label ? 'text-purple-700' : 'text-gray-700'}`}>
                              {l.label}
                            </div>
                            <div className="text-xs text-gray-400 truncate">{l.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                      Goal <span className="text-[10px] text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setProfile({...profile, goal: null})}
                        className={`p-3 rounded-xl border-2 text-left transition-all col-span-2 ${
                          profile.goal === null ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-lg">⏭️</div>
                          <div className="flex-1">
                            <div className={`text-sm font-black ${profile.goal === null ? 'text-purple-700' : 'text-gray-800'}`}>Skip for now</div>
                            <div className="text-[11px] text-gray-500">You can set this later</div>
                          </div>
                        </div>
                      </button>
                      {GOALS.map(g => (
                        <button
                          key={g.id}
                          onClick={() => setProfile({...profile, goal: g.id})}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            profile.goal === g.id ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="text-lg">{g.emoji}</div>
                          <div className={`text-sm font-black ${profile.goal === g.id ? 'text-purple-700' : 'text-gray-800'}`}>{g.label}</div>
                          <div className="text-[11px] text-gray-500">{g.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Gym Type</label>
                    <div className="space-y-2">
                      {Object.entries(GYM_TYPES).map(([key, gym]) => (
                        <button
                          key={key}
                          onClick={() => setProfile({...profile, gymType: key})}
                          className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                            profile.gymType === key ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="text-xl flex-shrink-0">{gym.emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-sm ${profile.gymType === key ? 'text-purple-700' : 'text-gray-700'}`}>
                              {gym.label}
                            </div>
                            {gym.desc && <div className="text-xs text-gray-400 truncate">{gym.desc}</div>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {GYM_TYPES[profile.gymType]?.barbells?.available && (
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Bar Weight</label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {[45, 35, 25, 15].map(weight => (
                          <button
                            key={weight}
                            onClick={() => setProfile({...profile, barWeight: weight})}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              profile.barWeight === weight ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className={`text-lg font-black ${profile.barWeight === weight ? 'text-purple-700' : 'text-gray-900'}`}>
                              {weight} lbs
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {weight === 45 ? 'Standard' : weight === 35 ? 'Women\'s' : weight === 25 ? 'Training' : 'Light'}
                            </div>
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={profile.barWeight || ''}
                        onChange={e => setProfile({...profile, barWeight: Number(e.target.value)})}
                        className="w-full p-3 border border-gray-200 rounded-xl font-bold outline-none bg-white focus:border-purple-400 transition-colors"
                        placeholder="Custom bar weight"
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card className="mb-4">
              <details className="group">
                <summary className="list-none cursor-pointer select-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="Settings" className="w-5 h-5 text-purple-600"/>
                      <div className="text-left">
                        <div className={`font-semibold text-sm ${settings.darkMode ? 'text-gray-100' : 'text-gray-900'}`}>More Settings</div>
                        <div className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Reset, recalculation, and advanced options</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-xs font-bold ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Details</div>
                      <Icon name="ChevronDown" className={`w-5 h-5 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} transition-transform duration-200 group-open:rotate-180`}/>
                    </div>
                  </div>
                </summary>

                <div className="mt-4 space-y-3">
                  {showUpdateProfile && profile.weight > 0 && (
                    <button
                      onClick={() => {
                        // Force recalculation by updating a timestamp
                        setProfile({...profile, lastRecalc: Date.now()});
                      }}
                      className={`w-full p-4 rounded-xl font-bold active:scale-95 transition-all shadow-md ${settings.darkMode ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'}`}
                    >
                      ♻️ Recalculate Strength Targets
                    </button>
                  )}

                  <button
                    onClick={onExportData}
                    className={`w-full p-4 rounded-xl font-bold flex items-center justify-between transition-colors ${settings.darkMode ? 'bg-gray-900 border border-gray-700 text-blue-400 hover:bg-gray-800' : 'bg-white border border-gray-200 text-blue-600 hover:bg-blue-50'}`}
                  >
                    <span>💾 Export Data</span><Icon name="ChevronDown" className="w-4 h-4"/>
                  </button>

                  <button
                    onClick={onImportData}
                    className={`w-full p-4 rounded-xl font-bold flex items-center justify-between transition-colors ${settings.darkMode ? 'bg-gray-900 border border-gray-700 text-green-400 hover:bg-gray-800' : 'bg-white border border-gray-200 text-green-600 hover:bg-green-50'}`}
                  >
                    <span>📂 Import Data</span><Icon name="ChevronRight" className="w-4 h-4"/>
                  </button>

                  <button
                    onClick={onReset}
                    className={`w-full p-4 rounded-xl font-bold flex items-center justify-between transition-colors ${settings.darkMode ? 'bg-gray-900 border border-gray-700 text-red-400 hover:bg-gray-800' : 'bg-white border border-gray-200 text-red-600 hover:bg-red-50'}`}
                  >
                    <span>Reset All Data</span><Icon name="Trash" className="w-4 h-4"/>
                  </button>
                </div>
              </details>
            </Card>
          </div>
        </div>
      );
    };

    // ========== MAIN APP ==========
    const App = () => {
      const [loaded, setLoaded] = useState(false);

      const [profile, setProfile] = useState({
        username: '',
        weight: 0,
        age: 0,
        gender: 'Male',
        experience: 'Beginner',
        activityLevel: null,
        avatar: '🦁',
        goal: null,
        gymType: '',
        barWeight: 45,
        onboarded: false
      });

      const [settings, setSettings] = useState({ showSuggestions: true, darkMode: false, showAllExercises: false, pinnedExercises: [], workoutViewMode: 'all', suggestedWorkoutCollapsed: false });
      const [history, setHistory] = useState({});
      const [cardioHistory, setCardioHistory] = useState({});
      const [tab, setTab] = useState('home');
      const [activeEquipment, setActiveEquipment] = useState(null);
      const [activeCardio, setActiveCardio] = useState(null);
      const [view, setView] = useState('intro');
      const [showSuggestedWorkout, setShowSuggestedWorkout] = useState(false);

      const [appState, setAppState] = useState({
        lastWorkoutType: null,
        lastWorkoutDayKey: null,
        restDays: []
      });

      useEffect(() => {
        const savedV2 = storage.get('ps_v2_profile', null);
        
        if (savedV2) {
          // Ensure gymType has a value (migration for old profiles)
          // Clear old default activityLevel and goal values (these should be user-selected, not defaults)
          const migratedProfile = {
            ...savedV2,
            gymType: savedV2.gymType || 'commercial',
            barWeight: savedV2.barWeight || 45,
            // Clear old defaults - users should explicitly choose these
            activityLevel: savedV2.activityLevel === 'Moderately Active' ? null : savedV2.activityLevel,
            goal: savedV2.goal === 'recomp' ? null : savedV2.goal
          };
          setProfile(migratedProfile);
          // Save migrated profile back to storage
          if (!savedV2.gymType || !savedV2.barWeight || savedV2.activityLevel === 'Moderately Active' || savedV2.goal === 'recomp') {
            storage.set('ps_v2_profile', migratedProfile);
          }
          if (savedV2.onboarded) setView('app');
        } else {
          const savedV1 = storage.get('ps_profile', null);
          if (savedV1 && savedV1.onboarded) {
            const migrated = {
              ...savedV1,
              gymType: savedV1.gymType || 'commercial',
              barWeight: savedV1.barWeight || 45,
              // Clear old defaults
              activityLevel: savedV1.activityLevel === 'Moderately Active' ? null : savedV1.activityLevel,
              goal: savedV1.goal === 'recomp' ? null : savedV1.goal
            };
            setProfile(migrated);
            setView('app');
            storage.set('ps_v2_profile', migrated);
          }
        }
        
        setSettings(storage.get('ps_v2_settings', { showSuggestions: true, showAllExercises: false, pinnedExercises: [], workoutViewMode: 'all', suggestedWorkoutCollapsed: false }));
        setHistory(storage.get('ps_v2_history', {}));
        setCardioHistory(storage.get('ps_v2_cardio', {}));
        setAppState(storage.get('ps_v2_state', { lastWorkoutType: null, lastWorkoutDayKey: null, restDays: [] }));
        setLoaded(true);
      }, []);

      useEffect(() => { if(loaded) storage.set('ps_v2_profile', profile); }, [profile, loaded]);
      useEffect(() => { if(loaded) storage.set('ps_v2_settings', settings); }, [settings, loaded]);
      useEffect(() => { if(loaded) storage.set('ps_v2_history', history); }, [history, loaded]);
      useEffect(() => { if(loaded) storage.set('ps_v2_cardio', cardioHistory); }, [cardioHistory, loaded]);
      useEffect(() => { if(loaded) storage.set('ps_v2_state', appState); }, [appState, loaded]);
      
      useEffect(() => {
        if (settings.darkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      }, [settings.darkMode]);

      const todayWorkoutType = useMemo(() => getTodaysWorkoutType(history, appState), [history, appState]);

      const strengthScoreObj = useMemo(() => {
        if (!profile?.onboarded || profile.weight === 0) return { score: 0, avgPct: 0, coveragePct: 0, loggedCount: 0, total: Object.keys(EQUIPMENT_DB).length };
        return computeStrengthScore(profile, history);
      }, [profile, history]);

      const streakObj = useMemo(() => computeStreak(history, cardioHistory, appState?.restDays || []), [history, cardioHistory, appState?.restDays]);

      const achievements = useMemo(() => computeAchievements({ history, strengthScoreObj, streakObj }), [history, strengthScoreObj, streakObj]);

      const suggestedExercises = useMemo(() => {
        const gymType = GYM_TYPES[profile.gymType];
        if (!gymType) return [];
        
        const availableTypes = [];
        if (gymType.machines) availableTypes.push('machines');
        if (gymType.dumbbells?.available) availableTypes.push('dumbbells');
        if (gymType.barbells?.available) availableTypes.push('barbells');

        const plan = WORKOUT_PLANS[todayWorkoutType];
        const suggested = [];
        
        availableTypes.forEach(type => {
          const exercises = plan[type] || [];
          suggested.push(...exercises);
        });
        
        return suggested.slice(0, 4);
      }, [profile.gymType, todayWorkoutType]);

      const handleSaveSession = (id, session) => {
        setHistory(prev => ({
          ...prev,
          [id]: [...(prev[id] || []), session]
        }));

        setAppState(prev => ({
          ...prev,
          lastWorkoutType: todayWorkoutType,
          lastWorkoutDayKey: toDayKey(new Date())
        }));

        // Unlock beginner mode after first workout
        if (profile.beginnerMode && !profile.beginnerUnlocked) {
          setProfile(prev => ({ ...prev, beginnerUnlocked: true }));
        }

        setActiveEquipment(null);
        // Stay on suggested workout screen if user is there
      };

      const handleSaveCardioSession = (type, session) => {
        setCardioHistory(prev => ({
          ...prev,
          [type]: [...(prev[type] || []), session]
        }));
        // Unlock beginner mode after first logged strength OR cardio session
        if (profile.beginnerMode && !profile.beginnerUnlocked) {
          setProfile(prev => ({ ...prev, beginnerUnlocked: true }));
        }
        setActiveCardio(null);
      };

      const handleReset = () => {
        if(confirm("Reset all data? This can't be undone.")) {
          const freshProfile = { 
            username: '', 
            weight: 0, 
            age: 0, 
            gender: 'Male', 
            experience: 'Beginner', 
            activityLevel: 'Moderately Active', 
            avatar: '🦁', 
            goal: 'recomp',
            gymType: '',
            barWeight: 45,
            onboarded: false,
            beginnerMode: false,
            beginnerUnlocked: false,
            isNervous: undefined,
            vibeChecked: false
          };
          setProfile(freshProfile);
          setHistory({});
          setCardioHistory({});
          setView('intro');
          setTab('home');
          setAppState({ lastWorkoutType: null, lastWorkoutDayKey: null, restDays: [] });
          setSettings({ showSuggestions: true, darkMode: false, showAllExercises: false, pinnedExercises: [], workoutViewMode: 'all', suggestedWorkoutCollapsed: false });
          storage.set('ps_v2_profile', null);
          storage.set('ps_v2_history', {});
          storage.set('ps_v2_cardio', {});
          storage.set('ps_v2_state', { lastWorkoutType: null, lastWorkoutDayKey: null, restDays: [] });
          storage.set('ps_v2_settings', { showSuggestions: true, darkMode: false, showAllExercises: false, pinnedExercises: [], workoutViewMode: 'all', suggestedWorkoutCollapsed: false });
        }
      };

      const completeOnboarding = () => {
        setProfile(prev => ({
          ...prev,
          onboarded: true,
          activityLevel: prev.activityLevel || 'Moderately Active',
          goal: prev.goal || 'recomp'
        }));
        setView('app');
        setTab('home');
      };

      const handleExportData = () => {
        try {
          const exportData = {
            version: 'v2',
            exportDate: new Date().toISOString(),
            profile,
            settings,
            history,
            cardioHistory,
            appState
          };

          const dataStr = JSON.stringify(exportData, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `planet-strength-backup-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          alert('✅ Data exported successfully! Your backup file has been downloaded.');
        } catch (error) {
          alert('❌ Export failed: ' + error.message);
        }
      };

      const handleImportData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';

        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const importedData = JSON.parse(event.target.result);

              // Validate the imported data
              if (!importedData.profile || !importedData.settings) {
                alert('❌ Invalid backup file format.');
                return;
              }

              if (confirm('⚠️ Import will replace all current data. Continue?')) {
                // Restore all data
                if (importedData.profile) {
                  setProfile(importedData.profile);
                  storage.set('ps_v2_profile', importedData.profile);
                }
                if (importedData.settings) {
                  setSettings(importedData.settings);
                  storage.set('ps_v2_settings', importedData.settings);
                }
                if (importedData.history) {
                  setHistory(importedData.history);
                  storage.set('ps_v2_history', importedData.history);
                }
                if (importedData.cardioHistory) {
                  setCardioHistory(importedData.cardioHistory);
                  storage.set('ps_v2_cardio', importedData.cardioHistory);
                }
                if (importedData.appState) {
                  setAppState(importedData.appState);
                  storage.set('ps_v2_state', importedData.appState);
                }

                alert('✅ Data imported successfully! Your backup has been restored.');
              }
            } catch (error) {
              alert('❌ Import failed: Invalid JSON file or corrupted data.');
            }
          };
          reader.readAsText(file);
        };

        input.click();
      };

      if (!loaded) return null;

      if (view === 'intro') return <IntroScreen onComplete={() => setView('setup')} />;
      if (view === 'setup') return <ProfileSetup profile={profile} setProfile={setProfile} settings={settings} setSettings={setSettings} onComplete={completeOnboarding} />;

      return (
        <>
          <InstallPrompt />
          <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              {showSuggestedWorkout ? (
                <SuggestedWorkout
                  profile={profile}
                  history={history}
                  suggestedExercises={suggestedExercises}
                  todayWorkoutType={todayWorkoutType}
                  onEquipmentSelect={setActiveEquipment}
                  onBack={() => setShowSuggestedWorkout(false)}
                />
              ) : (
                <>
                  {tab === 'home' && (
                    <Home
                      profile={profile}
                      setProfile={setProfile}
                      history={history}
                      cardioHistory={cardioHistory}
                      appState={appState}
                      setAppState={setAppState}
                      onGoWorkout={() => setTab('workout')}
                      onStartSuggestedWorkout={() => setShowSuggestedWorkout(true)}
                      onGoProfile={() => setTab('profile')}
                      onOpenCardio={(type) => setActiveCardio(type)}
                      streakObj={streakObj}
                      achievements={achievements}
                      todayWorkoutType={todayWorkoutType}
                      settings={settings}
                    />
                  )}
                  {tab === 'workout' && (
                    <Workout
                      profile={profile}
                      setProfile={setProfile}
                      history={history}
                      onEquipmentSelect={setActiveEquipment}
                      onOpenCardio={(type) => setActiveCardio(type)}
                      settings={settings}
                      setSettings={setSettings}
                      todayWorkoutType={todayWorkoutType}
                    />
                  )}
                  {tab === 'progress' && (
                    <Progress
                      profile={profile}
                      history={history}
                      strengthScoreObj={strengthScoreObj}
                    />
                  )}
                  {tab === 'profile' && (
                    <ProfileView
                      profile={profile}
                      setProfile={setProfile}
                      settings={settings}
                      setSettings={setSettings}
                      onReset={handleReset}
                      onExportData={handleExportData}
                      onImportData={handleImportData}
                    />
                  )}
                </>
              )}
            </div>

            {!showSuggestedWorkout && <TabBar currentTab={tab} setTab={setTab} />}

            {activeEquipment && (
              <EquipmentDetail
                id={activeEquipment}
                profile={profile}
                history={history[activeEquipment] || []}
                onSave={handleSaveSession}
                onClose={() => setActiveEquipment(null)}
              />
            )}

            {activeCardio && (
              <CardioLogger
                type={activeCardio}
                onSave={handleSaveCardioSession}
                onClose={() => setActiveCardio(null)}
              />
            )}
          </div>
        </>
      );
    };

    ReactDOM.render(<App />, document.getElementById('root'));
