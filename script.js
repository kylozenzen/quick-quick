const { useState, useEffect, useMemo, useRef } = React;

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
        RefreshCw: <g><path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 8.7 6"/><path d="M21 3v6h-6"/></g>,
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

    const APP_STYLES = {
      just: { id: 'just_lift', label: 'Just Lift', desc: 'Log sets fast. No insights. No commentary.' },
      progress: { id: 'lift_progress', label: 'Lift + Progress', desc: 'Track progress and see simple trends. Still fast.' },
      new: { id: 'new_gym', label: 'New to the Gym', desc: 'Extra guidance, tips, and reassurance. Nothing is locked in.' }
    };

    const REASSURANCE_LINES = [
      "Form > weight.",
      "Lighter is okay.",
      "Showing up counts.",
      "You can adjust anytime.",
      "Small jumps add up."
    ];

    const QUICK_GLOSSARY = {
      Set: "One round of reps before resting.",
      Rep: "One full movement of the exercise.",
      Weight: "Load used for this set."
    };

    const APP_STYLE_KEY = 'ps_app_style';
    const STYLE_ONBOARD_KEY = 'ps_style_onboarded';

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

    const STORAGE_VERSION = 3;
    const STORAGE_KEY = 'ps_v3_meta';
    const SESSION_TIMEOUT_MS = 90 * 60 * 1000;

    const DEFAULT_SETTINGS = {
      showSuggestions: true,
      darkMode: false,
      showAllExercises: false,
      pinnedExercises: [],
      workoutViewMode: 'all',
      suggestedWorkoutCollapsed: true,
      appStyle: APP_STYLES.just.id,
      showLastTime: true,
      showDeltas: true,
      showTips: true,
      weeklySummarySeenWeek: null,
      welcomeShownDay: null
    };

    const DEFAULT_APP_STATE = {
      lastWorkoutType: null,
      lastWorkoutDayKey: null,
      restDays: [],
      activeSession: null,
      lastWelcomeBackDay: null
    };

    const uniqueDayKeysFromHistory = (history, cardioHistory = {}, restDays = [], dayEntries = null) => {
      if (dayEntries && Object.keys(dayEntries).length > 0) {
        return Object.keys(dayEntries).sort();
      }

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

    const computeStreak = (history, cardioHistory = {}, restDays = [], dayEntries = null) => {
      const days = uniqueDayKeysFromHistory(history, cardioHistory, restDays, dayEntries);
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

    const getWeekKey = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-w${String(weekNo).padStart(2, '0')}`;
    };

    const computeWeeklySummaryLine = (dayEntries = {}) => {
      const countsByWeek = {};
      Object.values(dayEntries || {}).forEach(entry => {
        if (entry.type !== 'workout') return;
        const key = getWeekKey(new Date(entry.date));
        countsByWeek[key] = (countsByWeek[key] || 0) + 1;
      });
      const weeks = Object.keys(countsByWeek).sort();
      const currentWeek = getWeekKey(new Date());
      const currentCount = countsByWeek[currentWeek] || 0;
      const prevWeekKey = weeks.length > 0 ? weeks[weeks.length - 2] : null;
      const prevCount = prevWeekKey ? (countsByWeek[prevWeekKey] || 0) : 0;

      if (currentCount === 0 && prevCount === 0) return null;
      if (currentCount > 0 && prevCount === 0) return `${currentCount} workout${currentCount === 1 ? '' : 's'} this week`;
      const delta = currentCount - prevCount;
      const deltaText = delta > 0 ? `↑ ${delta} vs last week` : delta < 0 ? `↓ ${Math.abs(delta)} vs last week` : 'Same as last week';
      return `${currentCount} workout${currentCount === 1 ? '' : 's'} this week · ${deltaText}`;
    };

    const flattenSessions = (history = {}, cardioHistory = {}) => {
      const sessions = [];
      Object.entries(history || {}).forEach(([equipId, arr]) => {
        (arr || []).forEach(s => sessions.push({ ...s, equipId, type: s.type || 'strength', cardioType: s.cardioType }));
      });
      Object.entries(cardioHistory || {}).forEach(([cardioType, arr]) => {
        (arr || []).forEach(s => sessions.push({ ...s, cardioType, equipId: `cardio_${cardioType}`, type: 'cardio' }));
      });
      return sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const getLastWorkoutDate = (dayEntries = {}) => {
      const workoutDays = Object.values(dayEntries || {}).filter(e => e.type === 'workout').map(e => e.date);
      if (workoutDays.length === 0) return null;
      const sorted = workoutDays.sort((a, b) => new Date(b) - new Date(a));
      return new Date(sorted[0]);
    };

    const detectRecentTrend = (sessions = []) => {
      if (!sessions || sessions.length < 3) return null;
      const weights = sessions
        .slice(0, 3)
        .map(s => {
          const maxWeight = Math.max(...(s.sets || []).map(set => set.weight || 0));
          return isNaN(maxWeight) ? 0 : maxWeight;
        })
        .filter(Boolean);
      if (weights.length < 3) return null;
      const isUp = weights[0] < weights[1] && weights[1] <= weights[2];
      if (isUp) return "Trending up over last 3 sessions.";
      return null;
    };

    const buildDayEntriesFromHistory = (history = {}, cardioHistory = {}, restDays = []) => {
      const entries = {};
      Object.values(history || {}).forEach(arr => {
        (arr || []).forEach(s => {
          if (!s?.date) return;
          const key = toDayKey(new Date(s.date));
          entries[key] = entries[key] || { type: 'workout', date: key, exercises: [] };
        });
      });
      Object.values(cardioHistory || {}).forEach(arr => {
        (arr || []).forEach(s => {
          if (!s?.date) return;
          const key = toDayKey(new Date(s.date));
          entries[key] = entries[key] || { type: 'workout', date: key, exercises: [] };
        });
      });
      (restDays || []).forEach(d => {
        entries[d] = entries[d] || { type: 'rest', date: d, exercises: [] };
      });
      return entries;
    };

    const deriveRecentExercises = (history = {}, limit = 12) => {
      const flat = [];
      Object.entries(history || {}).forEach(([id, sessions]) => {
        (sessions || []).forEach(s => {
          if (s?.date) flat.push({ id, date: s.date });
        });
      });
      flat.sort((a, b) => new Date(b.date) - new Date(a.date));
      const seen = new Set();
      const result = [];
      for (const item of flat) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        result.push(item.id);
        if (result.length >= limit) break;
      }
      return result;
    };

    const deriveUsageCountsFromHistory = (history = {}) => {
      const counts = {};
      Object.entries(history || {}).forEach(([id, sessions]) => {
        (sessions || []).forEach(s => {
          const increment = Math.max(1, (s?.sets || []).length);
          counts[id] = (counts[id] || 0) + increment;
        });
      });
      return counts;
    };

    const normalizeSearch = (value = '') => value.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const SEARCH_ALIASES = {
      rdl: 'romanian deadlift',
      ohp: 'overhead press',
      bp: 'bench press',
      'lat pulldown': 'lat pulldown lat pull-down lat pull down',
      dl: 'deadlift',
      squat: 'squat back squat',
      row: 'row bent-over row',
    };

    const fuzzyMatchExercises = (query, pool) => {
      const normalized = normalizeSearch(query);
      if (!normalized) return pool.slice(0, 20);

      const scores = pool.map((id) => {
        const eq = EQUIPMENT_DB[id];
        const haystack = [
          eq?.name || '',
          eq?.target || '',
          (eq?.tags || []).join(' '),
          Object.entries(SEARCH_ALIASES)
            .filter(([alias]) => normalized.includes(alias))
            .map(([, str]) => str)
            .join(' ')
        ].join(' ').toLowerCase();

        const baseScore = haystack.startsWith(normalized) ? 2 : (haystack.includes(normalized) ? 1 : 0);
        return { id, score: baseScore };
      }).filter(item => item.score > 0);

      return scores.sort((a, b) => b.score - a.score).map(s => s.id).slice(0, 20);
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

    const StyleOnboarding = ({ onSelect, defaultStyle = APP_STYLES.just.id }) => {
      const [selected, setSelected] = useState(defaultStyle);

      const styles = [
        { ...APP_STYLES.just, note: "Log sets fast. No insights. No commentary." },
        { ...APP_STYLES.progress, note: "Track progress and see simple trends. Still fast." },
        { ...APP_STYLES.new, note: "Extra guidance, tips, and reassurance. Nothing is locked in." }
      ];

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="p-6 pb-3">
            <div className="text-xs font-bold text-purple-600 uppercase">Planet Strength</div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight mt-1">How do you want the app to show up for you?</h1>
            <p className="text-sm text-gray-600 mt-2">Choose your vibe. Change anytime in Settings.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3 pb-10">
            {styles.map(style => {
              const isActive = selected === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => { setSelected(style.id); onSelect(style.id); }}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all shadow-sm ${isActive ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl" aria-hidden>💫</div>
                    <div className="flex-1">
                      <div className={`font-black text-base ${isActive ? 'text-purple-700' : 'text-gray-900'}`}>{style.label}</div>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{style.desc}</p>
                      <p className="text-xs text-gray-500 mt-1">{style.note}</p>
                    </div>
                    {isActive && <Icon name="Check" className="w-5 h-5 text-purple-600" />}
                  </div>
                </button>
              );
            })}

            <div className="text-center text-xs text-gray-500 mt-4">
              Change anytime in Settings.
            </div>
          </div>
        </div>
      );
    };

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

    const computeAchievements = ({ history, cardioHistory = {}, strengthScoreObj, streakObj }) => {
      const days = uniqueDayKeysFromHistory(history, cardioHistory);
      const strengthSessions = Object.values(history || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
      const cardioSessions = Object.values(cardioHistory || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
      const sessionsTotal = strengthSessions + cardioSessions;
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
    
const Home = ({
  profile,
  streakObj,
  onStartWorkout,
  onGenerate,
  quoteIndex,
  onRefreshQuote,
  appStyle,
  weeklySummary,
  onWeeklySeen,
  reassuranceLine,
  onReassuranceNext,
  showWelcomeBack,
  onDismissWelcome,
  tipsEnabled
}) => {
  const quote = motivationalQuotes[quoteIndex % motivationalQuotes.length];
  const [glossaryTerm, setGlossaryTerm] = useState(null);
  const showTips = appStyle === APP_STYLES.new.id && tipsEnabled;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="p-4 py-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">Planet Strength</div>
            <h1 className="text-2xl font-black text-gray-900">Hi, {profile.username || 'Athlete'}</h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">
            {profile.avatar}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 relative">
          <button
            onClick={onRefreshQuote}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/70 text-purple-700 hover:bg-white"
            aria-label="Refresh quote"
          >
            <Icon name="RefreshCw" className="w-4 h-4" />
          </button>
          <div className="text-sm font-medium italic leading-relaxed text-purple-900 dark-mode-quote-text">
            “{quote.quote}”
          </div>
          <div className="text-xs font-semibold mt-2 text-purple-600 dark-mode-quote-author">
            — {quote.author}
          </div>
        </Card>

        {weeklySummary && (
          <Card className="bg-blue-50 border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Activity" className="w-5 h-5 text-blue-600" />
              <div className="text-sm font-semibold text-blue-800">{weeklySummary}</div>
            </div>
            <button onClick={() => onWeeklySeen && onWeeklySeen()} className="text-xs font-bold text-blue-700 underline">Got it</button>
          </Card>
        )}

        {showWelcomeBack && (
          <Card className="bg-green-50 border-green-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👋</span>
              <div>
                <div className="text-sm font-bold text-green-800">Welcome back.</div>
                <div className="text-xs text-green-700">Pick any lift and log a quick set.</div>
              </div>
            </div>
            <button onClick={() => onDismissWelcome && onDismissWelcome()} className="text-xs font-bold text-green-700 underline">Dismiss</button>
          </Card>
        )}

        <Card className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔥</div>
            <div>
              <div className="text-sm font-semibold text-gray-600 uppercase">Streak</div>
              <div className="text-2xl font-black text-orange-600">{streakObj.current} days</div>
              <div className="text-xs text-gray-500">Best: {streakObj.best} days</div>
            </div>
          </div>
        </Card>

        <button
          onClick={onStartWorkout}
          className="w-full py-4 rounded-2xl bg-purple-600 text-white font-bold text-lg shadow-lg active:scale-95 transition-all"
        >
          Log a Set
        </button>

        {showTips && reassuranceLine && (
          <Card className="bg-purple-50 border-purple-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-purple-600 uppercase">You're good</div>
              <div className="text-sm font-semibold text-purple-900">{reassuranceLine}</div>
            </div>
            <button onClick={() => onReassuranceNext && onReassuranceNext()} className="text-xs font-bold text-purple-700 underline">New line</button>
          </Card>
        )}

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase">Quick Generator</div>
              <div className="text-base font-black text-gray-900">Pick a focus</div>
            </div>
            <span className="text-xl">⚡️</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { label: 'Get a Leg Workout', id: 'legs' },
              { label: 'Get a Push Workout', id: 'push' },
              { label: 'Get a Pull Workout', id: 'pull' },
              { label: 'Get a Full Body Workout', id: 'full' },
              { label: 'Surprise Me', id: 'surprise' },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => onGenerate(pill.id)}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200 active:scale-95 transition-all"
              >
                {pill.label}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-gray-500">
            Generated workouts will open in the Workout tab for quick edits.
          </div>
        </Card>

        {showTips && (
          <Card className="space-y-2">
            <div className="text-xs font-bold text-purple-700 uppercase">Quick glossary</div>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(QUICK_GLOSSARY).map(term => (
                <button
                  key={term}
                  onClick={() => setGlossaryTerm(glossaryTerm === term ? null : term)}
                  className={`px-3 py-2 rounded-full text-xs font-bold border ${glossaryTerm === term ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-700 border-purple-200'}`}
                >
                  {term}
                </button>
              ))}
            </div>
            {glossaryTerm && (
              <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3">
                {QUICK_GLOSSARY[glossaryTerm]}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

const Workout = ({
  profile,
  history,
  onEquipmentSelect,
  onOpenCardio,
  settings,
  setSettings,
  todayWorkoutType,
  pinnedExercises,
  setPinnedExercises,
  recentExercises,
  generatedWorkout,
  onRegenerateGeneratedWorkout,
  onSwapGeneratedExercise,
  onStartGeneratedWorkout,
  onLogRestDay,
  restDayLogged,
  hasWorkoutToday,
  appStyle,
  activeSession,
  onEndSession,
  recentSessions = [],
  trendText,
  reassuranceLine
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLibrary, setShowLibrary] = useState(false);
  const [swapIndex, setSwapIndex] = useState(null);
  const [showRecent, setShowRecent] = useState(false);
  const showTips = appStyle === APP_STYLES.new.id && settings.showTips !== false;

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

  const filteredPinned = pinnedExercises.filter(id => availableEquipment.includes(id));
  const filteredRecents = recentExercises.filter(id => availableEquipment.includes(id)).slice(0, 12);

  const searchResults = useMemo(() => {
    const pool = availableEquipment;
    if (!searchQuery.trim()) return [];
    return fuzzyMatchExercises(searchQuery, pool);
  }, [searchQuery, availableEquipment]);

  const togglePin = (id) => {
    const exists = pinnedExercises.includes(id);
    const updated = exists ? pinnedExercises.filter(x => x !== id) : [...pinnedExercises, id];
    setPinnedExercises(updated);
    setSettings(prev => ({ ...(prev || {}), pinnedExercises: updated }));
  };

  const renderExerciseRow = (id, actionLabel = 'Log') => {
    const eq = EQUIPMENT_DB[id];
    if (!eq) return null;
    return (
      <button
        key={id}
        onClick={() => onEquipmentSelect(id)}
        className="w-full p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between active:scale-[0.98] transition"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-lg">
            {eq.type === 'machine' ? '⚙️' : eq.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">{eq.name}</div>
            <div className="text-xs text-gray-500">{eq.target}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); togglePin(id); }}
            className={`px-2 py-1 rounded-full text-xs font-bold ${pinnedExercises.includes(id) ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}
          >
            {pinnedExercises.includes(id) ? 'Pinned' : 'Pin'}
          </button>
          <div className="text-purple-600 font-semibold text-sm">{actionLabel}</div>
        </div>
      </button>
    );
  };

  const swapOptions = useMemo(() => {
    if (swapIndex === null || !generatedWorkout) return [];
    const currentId = generatedWorkout.exercises[swapIndex];
    const current = EQUIPMENT_DB[currentId];
    const pool = availableEquipment.filter(id => id !== currentId && (!current || (EQUIPMENT_DB[id]?.target === current.target || EQUIPMENT_DB[id]?.tags?.some(t => current.tags?.includes(t)))));
    return pool.slice(0, 20);
  }, [swapIndex, generatedWorkout, availableEquipment]);

  const displayedSessions = useMemo(() => (recentSessions || []).slice(0, showRecent ? 3 : 1), [recentSessions, showRecent]);

  const formatSession = (session) => {
    const dateLabel = session.date ? new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent';
    if (session.type === 'cardio') {
      const title = CARDIO_TYPES[session.cardioType]?.name || 'Cardio';
      const duration = session.duration ? `${session.duration} min` : 'Logged';
      return `${dateLabel} • ${title} • ${duration}`;
    }
    const eq = EQUIPMENT_DB[session.equipId];
    const weights = (session.sets || []).map(s => s.weight || 0);
    const maxWeight = weights.length ? Math.max(...weights) : 0;
    const reps = (session.sets || []).reduce((sum, set) => sum + (set.reps || 0), 0);
    const sets = session.sets?.length || 0;
    return `${dateLabel} • ${eq?.name || 'Lift'} • ${maxWeight || '—'} lb · ${sets} sets · ${reps || 0} reps`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Workout</h1>
            <div className="text-xs text-gray-500 font-bold">Search + pins + recents</div>
          </div>
          <button
            onClick={onLogRestDay}
            disabled={restDayLogged || hasWorkoutToday}
            className={`px-3 py-2 rounded-xl text-sm font-bold border ${restDayLogged ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-purple-700 border-purple-200'}`}
          >
            😴 Log Rest Day
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="relative">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          {!showLibrary && (
            <button
              onClick={() => setShowLibrary(true)}
              className="mt-2 text-xs font-bold text-purple-700 underline"
            >
              Browse full library
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-4 space-y-4">
        {activeSession && (
          <Card className="flex items-center justify-between bg-green-50 border-green-200">
            <div>
              <div className="text-xs font-bold text-green-700 uppercase">Session active</div>
              <div className="text-sm font-semibold text-gray-800">Auto-ends after quiet time.</div>
            </div>
            <button onClick={onEndSession} className="text-xs font-bold text-green-700 underline">End</button>
          </Card>
        )}

        {recentSessions.length > 0 && (
          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-500 uppercase">Recent Lifts</div>
              <button onClick={() => setShowRecent(!showRecent)} className="text-xs font-bold text-purple-700 underline">
                {showRecent ? 'Hide' : 'Expand'}
              </button>
            </div>
            {displayedSessions.map((session, idx) => (
              <div key={idx} className="text-sm font-semibold text-gray-800">
                {formatSession(session)}
              </div>
            ))}
            {appStyle === APP_STYLES.progress.id && trendText && (
              <div className="text-xs text-blue-700 font-semibold">{trendText}</div>
            )}
          </Card>
        )}

        {showTips && reassuranceLine && (
          <Card className="bg-purple-50 border-purple-200 text-sm text-purple-900">
            {reassuranceLine}
          </Card>
        )}

        {generatedWorkout && (
          <Card className="space-y-3 border-purple-200 bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-purple-600 uppercase">Generated</div>
                <div className="text-lg font-black text-gray-900">{generatedWorkout.label}</div>
              </div>
              <button onClick={onRegenerateGeneratedWorkout} className="text-sm font-bold text-purple-700">Regenerate</button>
            </div>
            <div className="space-y-2">
              {generatedWorkout.exercises.map((id, idx) => {
                const eq = EQUIPMENT_DB[id];
                return (
                  <div key={`${id}-${idx}`} className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{eq?.name || 'Exercise'}</div>
                      <div className="text-xs text-gray-500">{eq?.target}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => togglePin(id)} className={`px-2 py-1 rounded-full text-xs font-bold ${pinnedExercises.includes(id) ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                        {pinnedExercises.includes(id) ? 'Pinned' : 'Pin'}
                      </button>
                      <button onClick={() => setSwapIndex(idx)} className="px-3 py-1 rounded-full border border-purple-200 text-purple-700 text-xs font-bold">Swap</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={onStartGeneratedWorkout}
              className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold active:scale-[0.98]"
            >
              Start This Workout
            </button>
          </Card>
        )}

        {filteredPinned.length > 0 && (
          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-500 uppercase">Pinned Exercises</div>
              <div className="text-xs text-gray-400">Tap to log</div>
            </div>
            <div className="space-y-2">
              {filteredPinned.map(id => renderExerciseRow(id, 'Log'))}
            </div>
          </Card>
        )}

        {filteredRecents.length > 0 && (
          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-500 uppercase">Recent</div>
              <div className="text-xs text-gray-400">Last used</div>
            </div>
            <div className="space-y-2">
              {filteredRecents.map(id => renderExerciseRow(id, 'Resume'))}
            </div>
          </Card>
        )}

        {searchQuery && searchResults.length > 0 && (
          <Card className="space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase">Search Results</div>
            <div className="space-y-2">
              {searchResults.map(id => renderExerciseRow(id, 'Log'))}
            </div>
          </Card>
        )}

        {showLibrary && (
          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-gray-500 uppercase">Full Library</div>
              <button onClick={() => setShowLibrary(false)} className="text-xs text-purple-700 font-bold">Hide</button>
            </div>
            <div className="space-y-2">
              {availableEquipment.map(id => renderExerciseRow(id, 'Log'))}
            </div>
          </Card>
        )}

        {Object.keys(CARDIO_TYPES).length > 0 && (
          <Card className="space-y-2">
            <div className="text-xs font-bold text-gray-500 uppercase">Cardio</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CARDIO_TYPES).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => onOpenCardio(key)}
                  className="p-3 rounded-xl border border-gray-200 bg-white text-left active:scale-[0.98] transition"
                >
                  <div className="text-lg">{data.emoji}</div>
                  <div className="font-bold text-gray-900 text-sm">{data.name}</div>
                  <div className="text-[11px] text-gray-500">Track time + distance</div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {swapIndex !== null && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-end justify-center" onClick={() => setSwapIndex(null)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl p-4 animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Swap Exercise</h3>
              <button onClick={() => setSwapIndex(null)} className="p-2 rounded-full bg-gray-100 text-gray-600">
                <Icon name="X" className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {swapOptions.map(id => (
                <button
                  key={id}
                  onClick={() => { onSwapGeneratedExercise(swapIndex, id); setSwapIndex(null); }}
                  className="w-full p-3 rounded-xl border border-gray-200 text-left bg-gray-50 active:scale-[0.98]"
                >
                  <div className="font-bold text-gray-900 text-sm">{EQUIPMENT_DB[id]?.name}</div>
                  <div className="text-xs text-gray-500">{EQUIPMENT_DB[id]?.target}</div>
                </button>
              ))}
              {swapOptions.length === 0 && (
                <div className="text-sm text-gray-500">No similar exercises available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
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
const EquipmentDetail = ({ id, profile, history, onSave, onClose, settings, appStyle, onEndSession }) => {
      const eq = EQUIPMENT_DB[id];
      const sessions = history || [];
      const [activeTab, setActiveTab] = useState('workout');
      const [showLogger, setShowLogger] = useState(true);
      const [showPlateCalc, setShowPlateCalc] = useState(false);
      const [anchorWeight, setAnchorWeight] = useState('');
      const [anchorReps, setAnchorReps] = useState('');
      const [anchorAdjusted, setAnchorAdjusted] = useState(false);
      const [showAdjust, setShowAdjust] = useState(false);
      const [loggedSets, setLoggedSets] = useState([]);
      const [editingIndex, setEditingIndex] = useState(null);
      const [editValues, setEditValues] = useState({ weight: '', reps: '' });
      const [baselineInputs, setBaselineInputs] = useState({ weight: '', reps: '' });
      const [baselineConfirmed, setBaselineConfirmed] = useState(sessions.length > 0);
      const [note, setNote] = useState('');
      const [historyExpanded, setHistoryExpanded] = useState(false);
      const savedRef = useRef(false);
      const latestDraftRef = useRef({ loggedSets: [], anchorWeight: '', anchorReps: '', anchorAdjusted: false, note: '' });
      const currentStyle = appStyle || settings?.appStyle || APP_STYLES.just.id;
      const showLastRef = settings?.showLastTime !== false;
      const showDeltas = settings?.showDeltas !== false;
      const isProgressStyle = currentStyle === APP_STYLES.progress.id;
      const isNewStyle = currentStyle === APP_STYLES.new.id && settings?.showTips !== false;

      const best = useMemo(() => getBestForEquipment(sessions), [sessions]);
      const strongWeight = useMemo(() => getStrongWeightForEquipment(profile, id), [profile, id]);
      const nextTarget = useMemo(() => getNextTarget(profile, id, best), [profile, id, best]);
      const sessionNumber = sessions.length + 1;

      const deriveSessionAnchor = (session) => {
        if (!session) return { weight: null, reps: null };
        const weights = (session.sets || []).map(s => s.weight || 0).filter(Boolean);
        const reps = (session.sets || []).map(s => s.reps || 0).filter(Boolean);
        return {
          weight: session.anchorWeight || (weights.length ? Math.max(...weights) : null),
          reps: session.anchorReps || (reps.length ? Math.round(reps.reduce((a, b) => a + b, 0) / reps.length) : null)
        };
      };

      const baselineFromHistory = useMemo(() => {
        if (!sessions || sessions.length === 0) return null;
        const first = sessions[0];
        const anchor = deriveSessionAnchor(first);
        if (first?.baselineWeight && first?.baselineReps) {
          return { weight: first.baselineWeight, reps: first.baselineReps };
        }
        if (anchor.weight && anchor.reps) return { weight: anchor.weight, reps: anchor.reps };
        return null;
      }, [sessions]);

      const recentAnchor = useMemo(() => {
        const recent = (sessions || []).slice(-3);
        if (recent.length === 0) return { weight: null, reps: null };
        const weights = recent.map(s => deriveSessionAnchor(s).weight).filter(Boolean);
        const reps = recent.map(s => deriveSessionAnchor(s).reps).filter(Boolean);
        return {
          weight: weights.length ? Math.max(...weights) : null,
          reps: reps.length ? Math.round(reps.sort((a,b) => a-b)[Math.floor(reps.length/2)]) : null
        };
      }, [sessions]);

      const lastSessionInfo = useMemo(() => {
        if (!sessions || sessions.length === 0) return null;
        const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
        const last = sorted[0];
        const anchor = deriveSessionAnchor(last);
        const lastSets = last?.sets || [];
        if (lastSets.length === 0) return null;
        const maxW = Math.max(...lastSets.map(s => s.weight || 0));
        const avgR = Math.round(lastSets.reduce((sum, s) => sum + (s.reps || 0), 0) / lastSets.length);
        return {
          date: last.date,
          weight: anchor.weight || maxW,
          reps: anchor.reps || avgR,
          setCount: lastSets.length
        };
      }, [sessions]);
      const recentHistory = useMemo(() => {
        const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
        return sorted.slice(0, 5);
      }, [sessions]);
      const deltaFromLast = useMemo(() => {
        if (!lastSessionInfo || !anchorWeight) return null;
        const diff = Number(anchorWeight) - Number(lastSessionInfo.weight || 0);
        if (!isFinite(diff)) return null;
        if (diff === 0) return 'Even vs last time';
        return `${diff > 0 ? '+' : ''}${diff} lbs vs last time`;
      }, [lastSessionInfo, anchorWeight]);

      const lastSession = sessions[sessions.length - 1];
      const defaultAnchor = useMemo(() => {
        const anchor = deriveSessionAnchor(lastSession);
        if (anchor.weight && anchor.reps) return anchor;
        if (baselineFromHistory) return baselineFromHistory;
        return { weight: null, reps: null };
      }, [lastSession, baselineFromHistory]);

      useEffect(() => {
        const weight = defaultAnchor.weight ? String(defaultAnchor.weight) : '';
        const reps = defaultAnchor.reps ? String(defaultAnchor.reps) : '';
        setAnchorWeight(weight);
        setAnchorReps(reps);
        setAnchorAdjusted(false);
        setShowAdjust(false);
        setLoggedSets([]);
        setNote('');
        setBaselineInputs({
          weight: baselineFromHistory?.weight ? String(baselineFromHistory.weight) : '',
          reps: baselineFromHistory?.reps ? String(baselineFromHistory.reps) : ''
        });
        setBaselineConfirmed(sessions.length > 0);
        savedRef.current = false;
      }, [id, defaultAnchor, baselineFromHistory, sessions.length]);

      const handleQuickAddSet = () => {
        const w = Number(anchorWeight);
        const r = Number(anchorReps);
        if (!w || !r || w <= 0 || r <= 0) return;
        setLoggedSets(prev => [...prev, { weight: w, reps: r }]);
        setEditingIndex(null);
      };

      const startEditSet = (idx) => {
        const target = loggedSets[idx];
        if (!target) return;
        setEditingIndex(idx);
        setEditValues({ weight: String(target.weight || ''), reps: String(target.reps || '') });
      };

      const saveEditedSet = () => {
        const w = Number(editValues.weight);
        const r = Number(editValues.reps);
        if (!w || !r || w <= 0 || r <= 0 || editingIndex === null) return;
        setLoggedSets(prev => prev.map((set, idx) => idx === editingIndex ? { weight: w, reps: r } : set));
        setEditingIndex(null);
      };

      const deleteSet = (idx) => {
        setLoggedSets(prev => prev.filter((_, i) => i !== idx));
        setEditingIndex(null);
      };

      const buildSessionPayload = (draft) => {
        const source = draft || { loggedSets, anchorWeight, anchorReps, anchorAdjusted, note };
        const sets = source.loggedSets || [];
        if (sets.length === 0) return null;
        const basePayload = {
          date: new Date().toISOString(),
          type: 'strength',
          sets,
          anchorWeight: Number(source.anchorWeight),
          anchorReps: Number(source.anchorReps),
          adjustedToday: source.anchorAdjusted || false,
          note: source.note || undefined
        };
        if (sessions.length === 0) {
          return {
            ...basePayload,
            baselineWeight: Number(source.anchorWeight),
            baselineReps: Number(source.anchorReps)
          };
        }
        return basePayload;
      };

      const handleSaveSession = () => {
        const payload = buildSessionPayload();
        if (payload) {
          onSave(id, payload);
          savedRef.current = true;
          return true;
        }
        return false;
      };

      useEffect(() => {
        latestDraftRef.current = { loggedSets, anchorWeight, anchorReps, anchorAdjusted, note };
      }, [loggedSets, anchorWeight, anchorReps, anchorAdjusted, note]);

      useEffect(() => {
        return () => {
          if (!savedRef.current) {
            const payload = buildSessionPayload(latestDraftRef.current);
            if (payload) {
              onSave(id, payload);
              savedRef.current = true;
            }
          }
        };
      }, [id, onSave]);

      const handleClose = () => {
        const saved = handleSaveSession();
        onClose();
        if (saved) alert('Workout logged.');
      };

      const isBaselineMode = sessions.length === 0 && !baselineConfirmed;

      const weightBump = (w) => {
        if (!w) return 5;
        if (w < 50) return 2.5;
        if (w < 120) return 5;
        return 10;
      };

      const overloadSuggestion = useMemo(() => {
        if (sessions.length < 2) return null;
        const numericAnchorWeight = Number(anchorWeight) || Number(baselineInputs.weight);
        const numericAnchorReps = Number(anchorReps) || Number(baselineInputs.reps);
        const baseWeight = recentAnchor.weight || numericAnchorWeight;
        const baseReps = recentAnchor.reps || numericAnchorReps;
        if (!baseWeight || !baseReps) return null;
        const bump = weightBump(baseWeight);
        return {
          nextWeight: clampTo5(baseWeight + bump),
          reps: baseReps,
          rationale: `${sessions.length >= 2 ? '2 consistent sessions' : 'Recent consistency'} → try +${bump} lb`
        };
      }, [sessions.length, anchorWeight, anchorReps, baselineInputs, recentAnchor]);

      const handleConfirmBaseline = () => {
        const w = Number(baselineInputs.weight);
        const r = Number(baselineInputs.reps);
        if (!w || !r || w <= 0 || r <= 0) return;
        setAnchorWeight(String(w));
        setAnchorReps(String(r));
        setBaselineConfirmed(true);
        setAnchorAdjusted(false);
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
                <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <Icon name="ChevronLeft" className="w-6 h-6"/>
                </button>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{eq.name}</h2>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {eq.type === 'machine' ? '⚙️' : eq.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'} {eq.muscles}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
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
                Cues & Info
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
                          {isBaselineMode && (
                            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">🧭</div>
                                <div className="flex-1">
                                  <div className="text-[10px] font-black uppercase text-purple-700">Set your starting point</div>
                                  <p className="text-sm text-purple-900 font-semibold leading-relaxed">
                                    Set a weight and reps to begin. You can change these anytime.
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  value={baselineInputs.weight}
                                  onChange={(e) => setBaselineInputs(prev => ({ ...prev, weight: e.target.value }))}
                                  placeholder="lbs"
                                  className="w-full p-3 rounded-xl border-2 border-purple-200 bg-white font-black text-center text-gray-900 focus:border-purple-500 outline-none"
                                />
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  value={baselineInputs.reps}
                                  onChange={(e) => setBaselineInputs(prev => ({ ...prev, reps: e.target.value }))}
                                  placeholder="reps"
                                  className="w-full p-3 rounded-xl border-2 border-purple-200 bg-white font-black text-center text-gray-900 focus:border-purple-500 outline-none"
                                />
                              </div>
                              <button
                                onClick={handleConfirmBaseline}
                                disabled={!baselineInputs.weight || !baselineInputs.reps}
                                className={`w-full py-3 rounded-xl font-black text-white transition-all active:scale-95 ${
                                  baselineInputs.weight && baselineInputs.reps ? 'bg-purple-600 shadow-lg' : 'bg-purple-200 cursor-not-allowed'
                                }`}
                              >
                                Set baseline & start logging
                              </button>
                            </div>
                          )}

                          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-black uppercase text-purple-700">Anchored weight</div>
                                <div className="text-base font-black text-purple-900">
                                  {anchorWeight && anchorReps ? `${anchorWeight} lb × ${anchorReps} reps` : 'Set your anchor'}
                                </div>
                                {anchorAdjusted && <div className="text-[11px] text-purple-700 font-semibold">Adjusted today</div>}
                                {showLastRef && lastSessionInfo && (
                                  <div className="text-[11px] text-gray-600 mt-1">
                                    Last time: {lastSessionInfo.weight} lb × {lastSessionInfo.reps}
                                    {showDeltas && deltaFromLast && (
                                      <span className={`ml-1 font-bold ${deltaFromLast.includes('+') ? 'text-green-600' : deltaFromLast.includes('-') ? 'text-orange-600' : 'text-gray-700'}`}>
                                        {deltaFromLast}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => setShowAdjust(v => !v)}
                                className="px-3 py-2 rounded-lg bg-white border border-purple-200 text-purple-700 font-bold active:scale-95 text-xs"
                              >
                                {showAdjust ? 'Done' : 'Adjust'}
                              </button>
                            </div>

                            {showAdjust && (
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  value={anchorWeight}
                                  onChange={(e) => { setAnchorWeight(e.target.value); setAnchorAdjusted(true); }}
                                  placeholder="lbs"
                                  className="w-full p-3 rounded-xl border-2 border-purple-200 bg-white font-black text-center text-gray-900 focus:border-purple-500 outline-none"
                                />
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  value={anchorReps}
                                  onChange={(e) => { setAnchorReps(e.target.value); setAnchorAdjusted(true); }}
                                  placeholder="reps"
                                  className="w-full p-3 rounded-xl border-2 border-purple-200 bg-white font-black text-center text-gray-900 focus:border-purple-500 outline-none"
                                />
                              </div>
                            )}

                            <div className="flex items-center justify-between text-sm font-semibold text-purple-900">
                              <span>Sets completed: {loggedSets.length}</span>
                              {anchorWeight && anchorReps && (
                                <span className="text-[11px] text-purple-700 font-bold">Using: {anchorWeight} lb × {anchorReps} reps</span>
                              )}
                            </div>

                            <button
                              onClick={handleQuickAddSet}
                              disabled={!anchorWeight || !anchorReps || isBaselineMode}
                              className={`w-full py-3 rounded-xl font-black text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${
                                (!anchorWeight || !anchorReps || isBaselineMode) ? 'bg-purple-200 cursor-not-allowed' : 'bg-purple-600 shadow-lg'
                              }`}
                            >
                              <span className="text-lg">＋</span>
                              Add Set
                            </button>

                            <div className="text-[10px] text-purple-700/80 font-semibold">
                              Add sets fast. You can edit or delete any set below.
                            </div>
                          </div>

                          <div className="p-3 rounded-2xl bg-white border border-gray-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] font-black uppercase text-gray-500">Logged sets</div>
                              {loggedSets.length > 0 && (
                                <div className="text-[11px] text-purple-700 font-semibold">{loggedSets.length} sets</div>
                              )}
                            </div>
                            {loggedSets.length === 0 ? (
                              <div className="text-sm text-gray-500">No sets logged yet.</div>
                            ) : (
                              <div className="space-y-2">
                                {loggedSets.map((s, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-xl border ${editingIndex === idx ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-gray-50'} flex items-center justify-between gap-3`}
                                  >
                                    {editingIndex === idx ? (
                                      <div className="flex-1 grid grid-cols-2 gap-2">
                                        <input
                                          type="number"
                                          inputMode="numeric"
                                          value={editValues.weight}
                                          onChange={(e) => setEditValues(prev => ({ ...prev, weight: e.target.value }))}
                                          className="w-full p-2 rounded-lg border-2 border-purple-200 bg-white font-bold text-center text-gray-900 focus:border-purple-500 outline-none"
                                        />
                                        <input
                                          type="number"
                                          inputMode="numeric"
                                          value={editValues.reps}
                                          onChange={(e) => setEditValues(prev => ({ ...prev, reps: e.target.value }))}
                                          className="w-full p-2 rounded-lg border-2 border-purple-200 bg-white font-bold text-center text-gray-900 focus:border-purple-500 outline-none"
                                        />
                                        <button
                                          onClick={saveEditedSet}
                                          className="col-span-2 py-2 rounded-lg bg-purple-600 text-white font-bold active:scale-95"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex-1 cursor-pointer" onClick={() => startEditSet(idx)}>
                                        <div className="text-xs font-black text-gray-900">Set {idx + 1}</div>
                                        <div className="text-sm font-semibold text-gray-800">{s.weight} lb × {s.reps} reps</div>
                                      </div>
                                    )}
                                    {editingIndex === idx ? (
                                      <button
                                        onClick={() => setEditingIndex(null)}
                                        className="text-gray-500 text-sm font-semibold px-2 py-1"
                                      >
                                        Cancel
                                      </button>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => startEditSet(idx)}
                                          className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 active:scale-95"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => deleteSet(idx)}
                                          className="px-3 py-1 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-600 active:scale-95"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="p-3 rounded-2xl bg-white border border-gray-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-black uppercase text-gray-500">Finish</div>
                                <div className="text-[11px] text-gray-500">Auto-saves when you close.</div>
                              </div>
                              <button
                                onClick={handleClose}
                                className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold active:scale-95"
                              >
                                Workout logged
                              </button>
                            </div>
                            <label className="text-[11px] text-gray-500 font-semibold">Add note (optional)</label>
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="How did this feel?"
                              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:border-purple-400 outline-none"
                              rows={2}
                            />
                            {onEndSession && (
                              <button
                                onClick={() => { handleClose(); onEndSession(); }}
                                className="text-xs font-bold text-gray-500 underline mt-2"
                              >
                                End session now
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="bg-white border border-gray-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon name="Clock" className="w-5 h-5 text-gray-600"/>
                            <h3 className="text-xs font-black uppercase text-gray-600">Last Session</h3>
                          </div>
                          <div className="text-[10px] text-gray-500 font-semibold">Read-only</div>
                        </div>
                        {lastSessionInfo ? (
                          <div className="text-sm font-semibold text-gray-900">
                            {new Date(lastSessionInfo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {lastSessionInfo.weight} lb × {lastSessionInfo.reps} · {lastSessionInfo.setCount} sets
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Log one session to see your last numbers.</div>
                        )}
                      </div>

                      {isProgressStyle && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="Target" className="w-5 h-5 text-blue-600"/>
                            <h3 className="text-xs font-black uppercase text-blue-700">Progressive Overload</h3>
                          </div>
                          {overloadSuggestion ? (
                            <div className="space-y-1">
                              <div className="text-sm font-black text-gray-900">Suggested next: {overloadSuggestion.nextWeight} lb × {overloadSuggestion.reps}</div>
                              <div className="text-xs text-gray-600">Why: {overloadSuggestion.rationale}</div>
                              <div className="text-[11px] text-blue-700 font-semibold">Suggestions stay optional—log what really happened.</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-700">Complete 2 sessions to unlock a suggestion.</div>
                          )}
                        </div>
                      )}

                      {isProgressStyle && recentHistory.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-4">
                          <button
                            className="w-full flex items-center justify-between"
                            onClick={() => setHistoryExpanded(!historyExpanded)}
                          >
                            <div className="flex items-center gap-2">
                              <Icon name="Clock" className="w-5 h-5 text-gray-600"/>
                              <h3 className="text-xs font-black uppercase text-gray-600">Recent sessions</h3>
                            </div>
                            <Icon name="ChevronDown" className={`w-4 h-4 text-gray-500 transition-transform ${historyExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          {historyExpanded && (
                            <div className="mt-3 space-y-2">
                              {recentHistory.map((session, idx) => {
                                const maxWeight = Math.max(...(session.sets || []).map(s => s.weight || 0));
                                const dateLabel = new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                const reps = (session.sets || []).reduce((sum, s) => sum + (s.reps || 0), 0);
                                return (
                                  <div key={idx} className="text-sm text-gray-800">
                                    {dateLabel}: {maxWeight || '—'} lb · {(session.sets || []).length} sets · {reps} reps
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon name="Check" className="w-5 h-5 text-green-600"/>
                          <h3 className="text-xs font-black uppercase text-green-700">Form Cues</h3>
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

                      <div className="bg-white border border-gray-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon name="Info" className="w-5 h-5 text-blue-600"/>
                          <h3 className="text-xs font-black uppercase text-blue-700">Progression notes</h3>
                        </div>
                        <p className="text-sm text-gray-900 leading-relaxed">{eq.progression}</p>
                      </div>
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
    const Progress = ({ profile, history, strengthScoreObj, cardioHistory }) => {
      const [selectedEquipment, setSelectedEquipment] = useState(null);
      const [showHistory, setShowHistory] = useState(false);

      const allEquipment = Object.keys(EQUIPMENT_DB);
      const combinedSessions = useMemo(() => {
        const sessions = [];
        const seen = new Set();
        Object.entries(history || {}).forEach(([equipId, arr]) => {
          (arr || []).forEach(s => {
            const cardioType = s.type === 'cardio' ? (s.cardioType || equipId.replace('cardio_', '')) : null;
            const id = s.type === 'cardio'
              ? `${s.date}-${cardioType}-cardio`
              : `${s.date}-${equipId}-strength`;
            if (seen.has(id)) return;
            seen.add(id);
            sessions.push({ ...s, equipId, cardioType: cardioType || s.cardioType, type: s.type || 'strength' });
          });
        });
        Object.entries(cardioHistory || {}).forEach(([cardioType, arr]) => {
          (arr || []).forEach(s => {
            const id = `${s.date}-${s.cardioType || cardioType}-cardio`;
            if (seen.has(id)) return;
            seen.add(id);
            sessions.push({ ...s, cardioType: s.cardioType || cardioType, type: 'cardio' });
          });
        });
        return sessions;
      }, [history, cardioHistory]);

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
                    const sortedSessions = [...combinedSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
                    
                    if (sortedSessions.length === 0) {
                      return <p className="text-sm text-gray-500 text-center py-8">No workouts logged yet</p>;
                    }
                    
                    return (
                      <div className="space-y-2">
                        {sortedSessions.map((session, idx) => {
                          const eq = session.type === 'cardio' ? null : EQUIPMENT_DB[session.equipId];
                          const maxWeight = session.type === 'cardio' ? null : Math.max(...(session.sets || []).map(s => s.weight || 0));
                          const totalReps = session.type === 'cardio' ? null : (session.sets || []).reduce((sum, s) => sum + (s.reps || 0), 0);
                          const sets = session.type === 'cardio' ? 0 : (session.sets || []).length;
                          const cardioLabel = session.type === 'cardio' ? (CARDIO_TYPES[session.cardioType]?.name || 'Cardio') : null;
                          const durationLabel = session.type === 'cardio' ? (session.duration ? `${session.duration} min` : 'Cardio logged') : null;

                          return (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="text-xl">{session.type === 'cardio' ? '🏃' : eq?.type === 'machine' ? '⚙️' : eq?.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'}</div>
                                  <div>
                                    <div className="text-sm font-bold text-gray-900">{cardioLabel || eq?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                  </div>
                                </div>
                                {session.type === 'cardio' ? (
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-purple-600">{durationLabel}</div>
                                    {session.pace && <div className="text-xs text-gray-500">{session.pace}</div>}
                                  </div>
                                ) : (
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-purple-600">{maxWeight} lbs</div>
                                    <div className="text-xs text-gray-500">{sets} × {Math.round(totalReps / (sets || 1))} reps</div>
                                  </div>
                                )}
                              </div>
                              
                              {session.type === 'cardio' ? (
                                <div className="text-xs text-gray-600">
                                  {session.activity && <div className="font-semibold text-gray-700 mb-1">{session.activity}</div>}
                                  {session.notes && <div className="text-gray-500">{session.notes}</div>}
                                </div>
                              ) : (
                                <div className="grid grid-cols-4 gap-1 mt-2">
                                  {(session.sets || []).map((set, i) => (
                                    <div key={i} className="text-center p-1 bg-white rounded border border-gray-100">
                                      <div className="text-xs font-bold text-gray-900">{set.weight}</div>
                                      <div className="text-[10px] text-gray-500">×{set.reps}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
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
                  const streakObj = computeStreak(history, cardioHistory);
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
                    const recentSessions = [...combinedSessions]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 10);
                    
                    if (recentSessions.length === 0) {
                      return <p className="text-sm text-gray-500 text-center py-4">No workouts logged yet</p>;
                    }
                    
                    return (
                      <div className="space-y-2">
                        {recentSessions.map((session, idx) => {
                          const isCardio = session.type === 'cardio';
                          const eq = isCardio ? null : EQUIPMENT_DB[session.equipId];
                          const maxWeight = isCardio ? null : Math.max(...(session.sets || []).map(s => s.weight || 0));
                          const totalReps = isCardio ? null : (session.sets || []).reduce((sum, s) => sum + (s.reps || 0), 0);
                          return (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="text-lg">{isCardio ? '🏃' : eq?.type === 'machine' ? '⚙️' : eq?.type === 'dumbbell' ? '🏋️' : '🏋️‍♂️'}</div>
                                <div>
                                  <div className="text-xs font-bold text-gray-900">{isCardio ? (CARDIO_TYPES[session.cardioType]?.name || 'Cardio') : (eq?.name || 'Unknown')}</div>
                                  <div className="text-[10px] text-gray-500">
                                    {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </div>
                                </div>
                              </div>
                              {isCardio ? (
                                <div className="text-right">
                                  <div className="text-xs font-bold text-purple-600">{session.duration ? `${session.duration} min` : 'Cardio logged'}</div>
                                  {session.pace && <div className="text-[10px] text-gray-500">{session.pace}</div>}
                                </div>
                              ) : (
                                <div className="text-right">
                                  <div className="text-xs font-bold text-purple-600">{maxWeight} lbs</div>
                                  <div className="text-[10px] text-gray-500">{totalReps} reps</div>
                                </div>
                              )}
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
    const ProfileView = ({ profile, setProfile, settings, setSettings, onReset, onExportData, onImportData, streakObj, workoutCount = 0, restDayCount = 0, onViewAnalytics, onStyleChange, onResetOnboarding }) => {
      const [showLearn, setShowLearn] = useState(false);
      const [expandedTopic, setExpandedTopic] = useState(null);
      const [showAvatarPicker, setShowAvatarPicker] = useState(false);
      const [showUpdateProfile, setShowUpdateProfile] = useState(false);
      const currentStyle = settings?.appStyle || APP_STYLES.just.id;

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
            <Card className="mb-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Streak</div>
                  <div className="text-2xl font-black text-purple-700">{streakObj?.current || 0} days</div>
                  <div className="text-[11px] text-gray-500">Best: {streakObj?.best || 0}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-500 uppercase">Workouts</div>
                  <div className="text-2xl font-black text-gray-900">{workoutCount}</div>
                  <div className="text-[11px] text-gray-500">Rest days: {restDayCount}</div>
                </div>
              </div>
              <button
                onClick={onViewAnalytics}
                className="w-full mt-4 py-3 rounded-xl bg-purple-600 text-white font-bold active:scale-[0.98] transition"
              >
                View Analytics
              </button>
            </Card>

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

            <Card className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase">App Style</div>
                  <div className="text-sm font-semibold text-gray-900">Change anytime</div>
                </div>
                <button onClick={() => onResetOnboarding && onResetOnboarding()} className="text-xs font-bold text-purple-700 underline">Reset onboarding</button>
              </div>
              <div className="space-y-2">
                {Object.values(APP_STYLES).map(style => {
                  const active = currentStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => {
                        onStyleChange ? onStyleChange(style.id) : setSettings(prev => ({ ...(prev || {}), appStyle: style.id }));
                      }}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all ${active ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="font-bold text-sm text-gray-900">{style.label}</div>
                      <div className="text-xs text-gray-500">{style.desc}</div>
                    </button>
                  );
                })}
              </div>
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

              <div className="border-t border-gray-100 my-3"></div>

              <button
                onClick={() => setSettings({...settings, showLastTime: settings.showLastTime === false})}
                className="w-full flex items-center justify-between py-2 border-b border-gray-100 pb-3 mb-3"
              >
                <div className="flex items-center gap-3">
                  <Icon name="Clock" className="w-5 h-5 text-purple-600"/>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-sm">Show "Last time"</div>
                    <div className="text-xs text-gray-500">Reference last logged set</div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${settings.showLastTime === false ? 'bg-gray-300' : 'bg-purple-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${settings.showLastTime === false ? 'translate-x-0' : 'translate-x-6'}`}></div>
                </div>
              </button>

              <button
                onClick={() => setSettings({...settings, showDeltas: settings.showDeltas === false})}
                className="w-full flex items-center justify-between py-2 border-b border-gray-100 pb-3 mb-3"
              >
                <div className="flex items-center gap-3">
                  <Icon name="TrendingUp" className="w-5 h-5 text-purple-600"/>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-sm">Show deltas</div>
                    <div className="text-xs text-gray-500">Tiny changes near the logger</div>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${settings.showDeltas === false ? 'bg-gray-300' : 'bg-purple-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${settings.showDeltas === false ? 'translate-x-0' : 'translate-x-6'}`}></div>
                </div>
              </button>

              {currentStyle === APP_STYLES.new.id && (
                <button
                  onClick={() => setSettings({...settings, showTips: settings.showTips === false})}
                  className="w-full flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Info" className="w-5 h-5 text-purple-600"/>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 text-sm">Show tips</div>
                      <div className="text-xs text-gray-500">Reassurance + glossary</div>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-colors ${settings.showTips === false ? 'bg-gray-300' : 'bg-purple-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform m-0.5 ${settings.showTips === false ? 'translate-x-0' : 'translate-x-6'}`}></div>
                  </div>
                </button>
              )}
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

      const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS }));
      const [history, setHistory] = useState({});
      const [cardioHistory, setCardioHistory] = useState({});
      const [tab, setTab] = useState('home');
      const [activeEquipment, setActiveEquipment] = useState(null);
      const [activeCardio, setActiveCardio] = useState(null);
      const [view, setView] = useState('style');
      const [showAnalytics, setShowAnalytics] = useState(false);

      const [appState, setAppState] = useState(() => ({ ...DEFAULT_APP_STATE }));
      const [styleOnboarded, setStyleOnboarded] = useState(false);

      const [pinnedExercises, setPinnedExercises] = useState([]);
      const [recentExercises, setRecentExercises] = useState([]);
      const [exerciseUsageCounts, setExerciseUsageCounts] = useState({});
      const [dayEntries, setDayEntries] = useState({});
      const [lastExerciseStats, setLastExerciseStats] = useState({});
      const [generatedWorkout, setGeneratedWorkout] = useState(null);
      const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * motivationalQuotes.length));
      const [reassuranceIndex, setReassuranceIndex] = useState(() => Math.floor(Math.random() * REASSURANCE_LINES.length));

      useEffect(() => {
        const savedV2 = storage.get('ps_v2_profile', null);
        const rawSettings = storage.get('ps_v2_settings', DEFAULT_SETTINGS);
        const savedStyle = storage.get(APP_STYLE_KEY, rawSettings.appStyle || APP_STYLES.just.id);
        const savedSettings = { ...DEFAULT_SETTINGS, ...rawSettings, appStyle: savedStyle };
        const savedHistory = storage.get('ps_v2_history', {});
        const savedCardio = storage.get('ps_v2_cardio', {});
        const savedState = { ...DEFAULT_APP_STATE, ...storage.get('ps_v2_state', DEFAULT_APP_STATE) };
        let savedV1 = null;
        const storedFlag = storage.get(STYLE_ONBOARD_KEY, null);
        let styleDone = storedFlag;
        
        if (savedV2) {
          const migratedProfile = {
            ...savedV2,
            gymType: savedV2.gymType || 'commercial',
            barWeight: savedV2.barWeight || 45,
            activityLevel: savedV2.activityLevel === 'Moderately Active' ? null : savedV2.activityLevel,
            goal: savedV2.goal === 'recomp' ? null : savedV2.goal
          };
          setProfile(migratedProfile);
          if (!savedV2.gymType || !savedV2.barWeight || savedV2.activityLevel === 'Moderately Active' || savedV2.goal === 'recomp') {
            storage.set('ps_v2_profile', migratedProfile);
          }
        } else {
          savedV1 = storage.get('ps_profile', null);
          if (savedV1 && savedV1.onboarded) {
            const migrated = {
              ...savedV1,
              gymType: savedV1.gymType || 'commercial',
              barWeight: savedV1.barWeight || 45,
              activityLevel: savedV1.activityLevel === 'Moderately Active' ? null : savedV1.activityLevel,
              goal: savedV1.goal === 'recomp' ? null : savedV1.goal
            };
            setProfile(migrated);
            storage.set('ps_v2_profile', migrated);
          }
        }

        if (styleDone === null) {
          styleDone = Boolean(savedV2 || savedV1);
        }
        styleDone = Boolean(styleDone);
        
        setSettings(savedSettings);
        setHistory(savedHistory);
        setCardioHistory(savedCardio);
        setAppState(savedState);
        setStyleOnboarded(styleDone);
        setView(styleDone ? 'app' : 'style');

        const savedMeta = storage.get(STORAGE_KEY, null);
        const baseMeta = {
          version: STORAGE_VERSION,
          pinnedExercises: savedSettings?.pinnedExercises || [],
          recentExercises: [],
          exerciseUsageCounts: {},
          dayEntries: {},
          lastExerciseStats: {}
        };

        let metaToUse = baseMeta;
        if (savedMeta?.version === STORAGE_VERSION) {
          metaToUse = { ...baseMeta, ...savedMeta };
        } else {
          metaToUse = {
            ...baseMeta,
            recentExercises: deriveRecentExercises(savedHistory, 12),
            exerciseUsageCounts: deriveUsageCountsFromHistory(savedHistory),
            dayEntries: buildDayEntriesFromHistory(savedHistory, savedCardio, savedState?.restDays || [])
          };
          storage.set(STORAGE_KEY, metaToUse);
        }

        setPinnedExercises(metaToUse.pinnedExercises || []);
        setRecentExercises(metaToUse.recentExercises || []);
        setExerciseUsageCounts(metaToUse.exerciseUsageCounts || {});
        setDayEntries(metaToUse.dayEntries || {});
        setLastExerciseStats(metaToUse.lastExerciseStats || {});
        setLoaded(true);
      }, []);

      useEffect(() => { if(loaded) storage.set('ps_v2_profile', profile); }, [profile, loaded]);
      useEffect(() => {
        if(!loaded) return;
        storage.set('ps_v2_settings', settings);
        storage.set(APP_STYLE_KEY, settings.appStyle || APP_STYLES.just.id);
      }, [settings, loaded]);
      useEffect(() => { if(loaded) storage.set('ps_v2_history', history); }, [history, loaded]);
      useEffect(() => { if(loaded) storage.set('ps_v2_cardio', cardioHistory); }, [cardioHistory, loaded]);
      useEffect(() => { if(loaded) storage.set('ps_v2_state', appState); }, [appState, loaded]);
      useEffect(() => { if(loaded) storage.set(STYLE_ONBOARD_KEY, styleOnboarded); }, [styleOnboarded, loaded]);
      useEffect(() => {
        if (!loaded) return;
        storage.set(STORAGE_KEY, {
          version: STORAGE_VERSION,
          pinnedExercises,
          recentExercises,
          exerciseUsageCounts,
          dayEntries,
          lastExerciseStats
        });
      }, [loaded, pinnedExercises, recentExercises, exerciseUsageCounts, dayEntries, lastExerciseStats]);

      useEffect(() => {
        if (!loaded) return;
        const pinnedInSettings = settings?.pinnedExercises || [];
        const different = pinnedInSettings.length !== pinnedExercises.length || pinnedInSettings.some(id => !pinnedExercises.includes(id));
        if (different) {
          setSettings(prev => ({ ...(prev || {}), pinnedExercises }));
        }
      }, [pinnedExercises, loaded]); 

      useEffect(() => {
        if (!loaded) return;
        const pinnedInSettings = settings?.pinnedExercises || [];
        const different = pinnedInSettings.length !== pinnedExercises.length || pinnedExercises.some(id => !pinnedInSettings.includes(id));
        if (different) {
          setPinnedExercises(pinnedInSettings);
        }
      }, [settings?.pinnedExercises, loaded]);
      
      useEffect(() => {
        if (settings.darkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      }, [settings.darkMode]);

      useEffect(() => {
        if (!loaded) return;
        const active = appState?.activeSession;
        const expired = active && (Date.now() - (active.lastActivity || 0) > SESSION_TIMEOUT_MS);
        if (expired) {
          setAppState(prev => ({ ...(prev || {}), activeSession: null }));
          setActiveEquipment(null);
        } else if (active?.equipId && !activeEquipment) {
          setActiveEquipment(active.equipId);
        }
      }, [loaded, appState?.activeSession]);

      useEffect(() => {
        if (!loaded) return;
        const timer = setInterval(() => {
          setAppState(prev => {
            const active = prev?.activeSession;
            if (active && (Date.now() - (active.lastActivity || 0) > SESSION_TIMEOUT_MS)) {
              setActiveEquipment(null);
              return { ...(prev || {}), activeSession: null };
            }
            return prev;
          });
        }, 60000);
        return () => clearInterval(timer);
      }, [loaded]);

      const currentStyle = settings.appStyle || APP_STYLES.just.id;
      const weeklySummaryLine = useMemo(() => computeWeeklySummaryLine(dayEntries), [dayEntries]);
      const todayKey = toDayKey(new Date());
      const lastWorkoutDate = useMemo(() => getLastWorkoutDate(dayEntries), [dayEntries]);
      const showWeeklySummary = currentStyle === APP_STYLES.progress.id && weeklySummaryLine && settings.weeklySummarySeenWeek !== getWeekKey(new Date());
      const showWelcomeBack = currentStyle === APP_STYLES.new.id && lastWorkoutDate && ((new Date() - lastWorkoutDate) / 86400000 >= 5) && settings.welcomeShownDay !== todayKey;
      const reassuranceLine = currentStyle === APP_STYLES.new.id && settings.showTips !== false ? REASSURANCE_LINES[reassuranceIndex % REASSURANCE_LINES.length] : null;

      const todayWorkoutType = useMemo(() => getTodaysWorkoutType(history, appState), [history, appState]);

      const strengthScoreObj = useMemo(() => {
        if (!profile?.onboarded || profile.weight === 0) return { score: 0, avgPct: 0, coveragePct: 0, loggedCount: 0, total: Object.keys(EQUIPMENT_DB).length };
        return computeStrengthScore(profile, history);
      }, [profile, history]);

      const streakObj = useMemo(() => computeStreak(history, cardioHistory, appState?.restDays || [], dayEntries), [history, cardioHistory, appState?.restDays, dayEntries]);

      const recentSessions = useMemo(() => flattenSessions(history, cardioHistory), [history, cardioHistory]);
      const trendText = useMemo(() => {
        if (currentStyle !== APP_STYLES.progress.id) return null;
        const strengthSessions = recentSessions.filter(s => s.type === 'strength');
        return detectRecentTrend(strengthSessions);
      }, [currentStyle, recentSessions]);

      const recordDayEntry = (dayKey, type = 'workout', extras = {}) => {
        setDayEntries(prev => {
          const existing = prev[dayKey];
          const resolvedType = existing?.type === 'workout' ? 'workout' : type;
          return { ...prev, [dayKey]: { ...(existing || {}), ...extras, type: resolvedType, date: dayKey } };
        });
      };

      const recordExerciseUse = (exerciseId, sets = []) => {
        if (!exerciseId) return;
        setRecentExercises(prev => {
          const filtered = prev.filter(id => id !== exerciseId);
          return [exerciseId, ...filtered].slice(0, 12);
        });
        setExerciseUsageCounts(prev => ({ ...prev, [exerciseId]: (prev[exerciseId] || 0) + Math.max(1, sets.length || 1) }));
        if (sets && sets.length > 0) {
          const lastSet = sets[sets.length - 1];
          setLastExerciseStats(prev => ({ ...prev, [exerciseId]: { weight: lastSet.weight, reps: lastSet.reps } }));
        }
      };

      const hasWorkoutToday = dayEntries?.[todayKey]?.type === 'workout';
      const restDayLogged = dayEntries?.[todayKey]?.type === 'rest';

      const ensureWorkoutDayEntry = (exercises = []) => {
        if (!profile.onboarded) return;
        recordDayEntry(todayKey, 'workout', { exercises: Array.from(new Set([...(dayEntries[todayKey]?.exercises || []), ...exercises])) });
      };

      const buildGeneratedWorkout = (type) => {
        const gymType = GYM_TYPES[profile.gymType];
        const planKey = type === 'legs' ? 'Legs' : type === 'push' ? 'Push' : type === 'pull' ? 'Pull' : type === 'full' ? 'Full Body' : todayWorkoutType;
        const plan = WORKOUT_PLANS[planKey] || {};
        const pool = [];
        if (gymType?.machines) pool.push(...(plan.machines || []));
        if (gymType?.dumbbells?.available) pool.push(...(plan.dumbbells || []));
        if (gymType?.barbells?.available) pool.push(...(plan.barbells || []));
        const uniquePool = Array.from(new Set(pool));
        if (uniquePool.length === 0) {
          uniquePool.push(...Object.keys(EQUIPMENT_DB).slice(0, 12));
        }
        while (uniquePool.length < 4) {
          const fallback = Object.keys(EQUIPMENT_DB).filter(id => (EQUIPMENT_DB[id]?.tags || []).includes(planKey.toLowerCase()) || EQUIPMENT_DB[id]?.tags?.includes(planKey));
          if (fallback.length === 0) {
            uniquePool.push(...Object.keys(EQUIPMENT_DB).filter(id => uniquePool.indexOf(id) === -1).slice(0, 4 - uniquePool.length));
          } else {
            uniquePool.push(...fallback);
          }
          uniquePool.splice(4);
          if (uniquePool.length >= 4 || fallback.length === 0) break;
        }
        const picks = [];
        const poolCopy = [...uniquePool];
        for (let i = 0; i < 4 && poolCopy.length > 0; i++) {
          const idx = Math.floor(Math.random() * poolCopy.length);
          picks.push(poolCopy.splice(idx, 1)[0]);
        }
        return { type, label: planKey === 'Full Body' ? 'Full Body' : `${planKey} Day`, exercises: picks };
      };

      const triggerGenerator = (type) => {
        const generated = buildGeneratedWorkout(type === 'surprise' ? ['legs','push','pull','full'][Math.floor(Math.random()*4)] : type);
        setGeneratedWorkout(generated);
        setTab('workout');
      };

      const regenerateGeneratedWorkout = () => {
        if (!generatedWorkout) return;
        const regenerated = buildGeneratedWorkout(generatedWorkout.type);
        setGeneratedWorkout(regenerated);
      };

      const swapGeneratedExercise = (index, newId) => {
        setGeneratedWorkout(prev => {
          if (!prev) return prev;
          const updated = [...prev.exercises];
          updated[index] = newId;
          return { ...prev, exercises: updated };
        });
      };

      const startGeneratedWorkout = () => {
        if (!generatedWorkout) return;
        ensureWorkoutDayEntry(generatedWorkout.exercises);
        setActiveEquipment(generatedWorkout.exercises[0]);
      };

      const handleLogRestDay = () => {
        if (hasWorkoutToday || restDayLogged) return;
        recordDayEntry(todayKey, 'rest');
        setAppState(prev => ({
          ...(prev || {}),
          restDays: Array.from(new Set([...(prev?.restDays || []), todayKey]))
        }));
      };

      const handleStartWorkout = () => {
        ensureWorkoutDayEntry();
        setTab('workout');
      };

      const handleSaveSession = (id, session) => {
        const sessionDay = toDayKey(new Date(session.date));
        const now = Date.now();
        setHistory(prev => {
          const prevSessions = prev[id] || [];
          const existingIdx = prevSessions.findIndex(s => toDayKey(new Date(s.date)) === sessionDay);
          const updated = [...prevSessions];
          if (existingIdx >= 0) updated[existingIdx] = session;
          else updated.push(session);
          return { ...prev, [id]: updated };
        });

        setAppState(prev => ({
          ...prev,
          lastWorkoutType: todayWorkoutType,
          lastWorkoutDayKey: toDayKey(new Date()),
          activeSession: { startedAt: prev?.activeSession?.startedAt || now, lastActivity: now, equipId: id }
        }));

        // Unlock beginner mode after first workout
        if (profile.beginnerMode && !profile.beginnerUnlocked) {
          setProfile(prev => ({ ...prev, beginnerUnlocked: true }));
        }

        recordExerciseUse(id, session.sets || []);
        recordDayEntry(sessionDay, 'workout', { exercises: Array.from(new Set([...(dayEntries[sessionDay]?.exercises || []), id])) });

        setActiveEquipment(null);
        // Stay on suggested workout screen if user is there
      };

      const handleSaveCardioSession = (type, session) => {
        const durationMinutes = session.duration || (session.timeSeconds ? Math.round(session.timeSeconds / 60) : null);
        const enriched = { ...session, duration: durationMinutes, type: 'cardio', cardioType: type, sets: [] };
        const now = Date.now();
        setCardioHistory(prev => ({
          ...prev,
          [type]: [...(prev[type] || []), enriched]
        }));
        setHistory(prev => ({
          ...prev,
          [`cardio_${type}`]: [...(prev[`cardio_${type}`] || []), enriched]
        }));
        const dayKey = toDayKey(session.date ? new Date(session.date) : new Date());
        recordDayEntry(dayKey, 'workout');
        // Unlock beginner mode after first logged strength OR cardio session
        if (profile.beginnerMode && !profile.beginnerUnlocked) {
          setProfile(prev => ({ ...prev, beginnerUnlocked: true }));
        }
        setAppState(prev => ({
          ...(prev || {}),
          lastWorkoutType: todayWorkoutType,
          lastWorkoutDayKey: dayKey,
          activeSession: { startedAt: prev?.activeSession?.startedAt || now, lastActivity: now, equipId: `cardio_${type}` }
        }));
        setActiveCardio(null);
      };

      const endActiveSession = () => {
        setAppState(prev => ({ ...(prev || {}), activeSession: null }));
        setActiveEquipment(null);
      };

      const enterApp = (profilePatch = {}) => {
        setProfile(prev => ({
          ...prev,
          ...profilePatch,
          onboarded: true,
          activityLevel: prev.activityLevel || 'Moderately Active',
          goal: prev.goal || 'recomp'
        }));
        setView('app');
        setTab('home');
      };

      const handleReset = () => {
        if(confirm("Reset all data? This can't be undone.")) {
          const freshProfile = { 
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
            onboarded: false,
            beginnerMode: false,
            beginnerUnlocked: false,
            isNervous: undefined,
            vibeChecked: false
          };
          setProfile(freshProfile);
          setHistory({});
          setCardioHistory({});
          setView('style');
          setTab('home');
          setAppState({ ...DEFAULT_APP_STATE });
          setStyleOnboarded(false);
          setSettings({ ...DEFAULT_SETTINGS });
          setPinnedExercises([]);
          setRecentExercises([]);
          setExerciseUsageCounts({});
          setDayEntries({});
          setLastExerciseStats({});
          setGeneratedWorkout(null);
          storage.set('ps_v2_profile', null);
          storage.set('ps_v2_history', {});
          storage.set('ps_v2_cardio', {});
          storage.set('ps_v2_state', { ...DEFAULT_APP_STATE });
          storage.set('ps_v2_settings', { ...DEFAULT_SETTINGS });
          storage.set(APP_STYLE_KEY, APP_STYLES.just.id);
          storage.set(STYLE_ONBOARD_KEY, false);
          storage.set(STORAGE_KEY, { version: STORAGE_VERSION, pinnedExercises: [], recentExercises: [], exerciseUsageCounts: {}, dayEntries: {}, lastExerciseStats: {} });
        }
      };

      const completeOnboarding = () => {
        enterApp();
      };

      const persistStyleChoice = (styleId) => {
        const style = styleId || APP_STYLES.just.id;
        setSettings(prev => ({ ...(prev || {}), appStyle: style }));
        setStyleOnboarded(true);
        storage.set(STYLE_ONBOARD_KEY, true);
        storage.set(APP_STYLE_KEY, style);
      };

      const handleStyleSelect = (styleId) => {
        persistStyleChoice(styleId);
        enterApp();
      };

      const resetStyleOnboarding = () => {
        setStyleOnboarded(false);
        setView('style');
        storage.set(STYLE_ONBOARD_KEY, false);
      };

      const markWeeklySummarySeen = () => {
        setSettings(prev => ({ ...(prev || {}), weeklySummarySeenWeek: getWeekKey(new Date()) }));
      };

      const acknowledgeWelcome = () => {
        setSettings(prev => ({ ...(prev || {}), welcomeShownDay: todayKey }));
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
            appState,
            meta: {
              version: STORAGE_VERSION,
              pinnedExercises,
              recentExercises,
              exerciseUsageCounts,
              dayEntries,
              lastExerciseStats
            }
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
                  const mergedState = { ...DEFAULT_APP_STATE, ...importedData.appState };
                  setAppState(mergedState);
                  storage.set('ps_v2_state', mergedState);
                }
                if (importedData.meta) {
                  const meta = {
                    version: STORAGE_VERSION,
                    pinnedExercises: importedData.meta.pinnedExercises || [],
                    recentExercises: importedData.meta.recentExercises || [],
                    exerciseUsageCounts: importedData.meta.exerciseUsageCounts || {},
                    dayEntries: importedData.meta.dayEntries || {},
                    lastExerciseStats: importedData.meta.lastExerciseStats || {}
                  };
                  setPinnedExercises(meta.pinnedExercises);
                  setRecentExercises(meta.recentExercises);
                  setExerciseUsageCounts(meta.exerciseUsageCounts);
                  setDayEntries(meta.dayEntries);
                  setLastExerciseStats(meta.lastExerciseStats);
                  storage.set(STORAGE_KEY, meta);
                } else {
                  const derivedMeta = {
                    version: STORAGE_VERSION,
                    pinnedExercises: importedData.settings?.pinnedExercises || [],
                    recentExercises: deriveRecentExercises(importedData.history || {}),
                    exerciseUsageCounts: deriveUsageCountsFromHistory(importedData.history || {}),
                    dayEntries: buildDayEntriesFromHistory(importedData.history || {}, importedData.cardioHistory || {}, importedData.appState?.restDays || []),
                    lastExerciseStats: {}
                  };
                  setPinnedExercises(derivedMeta.pinnedExercises);
                  setRecentExercises(derivedMeta.recentExercises);
                  setExerciseUsageCounts(derivedMeta.exerciseUsageCounts);
                  setDayEntries(derivedMeta.dayEntries);
                  setLastExerciseStats(derivedMeta.lastExerciseStats);
                  storage.set(STORAGE_KEY, derivedMeta);
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

      if (!styleOnboarded) return <StyleOnboarding onSelect={handleStyleSelect} defaultStyle={settings.appStyle || APP_STYLES.just.id} />;

      if (view === 'intro') return <IntroScreen onComplete={() => setView('setup')} />;
      if (view === 'setup') return <ProfileSetup profile={profile} setProfile={setProfile} settings={settings} setSettings={setSettings} onComplete={completeOnboarding} />;

      
return (
        <>
          <InstallPrompt />
          <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              {showAnalytics ? (
                <div className="h-full flex flex-col bg-gray-50">
                  <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
                    <button onClick={() => setShowAnalytics(false)} className="p-2 rounded-full bg-gray-100">
                      <Icon name="ChevronLeft" className="w-5 h-5 text-gray-700" />
                    </button>
                    <div>
                      <div className="text-xs font-bold text-gray-500 uppercase">Analytics</div>
                      <div className="text-lg font-black text-gray-900">Progress</div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <Progress
                      profile={profile}
                      history={history}
                      strengthScoreObj={strengthScoreObj}
                      cardioHistory={cardioHistory}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {tab === 'home' && (
                    <Home
                      profile={profile}
                      streakObj={streakObj}
                      onStartWorkout={handleStartWorkout}
                      onGenerate={triggerGenerator}
                      quoteIndex={quoteIndex}
                      onRefreshQuote={() => setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length)}
                      appStyle={currentStyle}
                      weeklySummary={showWeeklySummary ? weeklySummaryLine : null}
                      onWeeklySeen={markWeeklySummarySeen}
                      reassuranceLine={reassuranceLine}
                      onReassuranceNext={() => setReassuranceIndex((prev) => (prev + 1) % REASSURANCE_LINES.length)}
                      showWelcomeBack={showWelcomeBack}
                      onDismissWelcome={acknowledgeWelcome}
                      tipsEnabled={settings.showTips !== false}
                    />
                  )}
                  {tab === 'workout' && (
                    <Workout
                      profile={profile}
                      history={history}
                      onEquipmentSelect={setActiveEquipment}
                      onOpenCardio={(type) => setActiveCardio(type)}
                      settings={settings}
                      setSettings={setSettings}
                      todayWorkoutType={todayWorkoutType}
                      pinnedExercises={pinnedExercises}
                      setPinnedExercises={setPinnedExercises}
                      recentExercises={recentExercises}
                      generatedWorkout={generatedWorkout}
                      onRegenerateGeneratedWorkout={regenerateGeneratedWorkout}
                      onSwapGeneratedExercise={swapGeneratedExercise}
                      onStartGeneratedWorkout={startGeneratedWorkout}
                      onLogRestDay={handleLogRestDay}
                      restDayLogged={restDayLogged}
                      hasWorkoutToday={hasWorkoutToday}
                      appStyle={currentStyle}
                      activeSession={appState?.activeSession}
                      onEndSession={endActiveSession}
                      recentSessions={recentSessions}
                      trendText={trendText}
                      reassuranceLine={reassuranceLine}
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
                      streakObj={streakObj}
                      workoutCount={Object.values(history || {}).reduce((sum, sessions) => sum + (sessions?.length || 0), 0)}
                      restDayCount={Object.values(dayEntries || {}).filter(d => d.type === 'rest').length}
                      onViewAnalytics={() => setShowAnalytics(true)}
                      onStyleChange={persistStyleChoice}
                      onResetOnboarding={resetStyleOnboarding}
                    />
                  )}
                </>
              )}
            </div>

            {!showAnalytics && <TabBar currentTab={tab} setTab={setTab} />}

            {activeEquipment && (
              <EquipmentDetail
                id={activeEquipment}
                profile={profile}
                history={history[activeEquipment] || []}
                onSave={handleSaveSession}
                onClose={() => setActiveEquipment(null)}
                settings={settings}
                appStyle={currentStyle}
                onEndSession={endActiveSession}
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

    ReactDOM.render(
      React.createElement(App),
      document.getElementById('root')
    );
