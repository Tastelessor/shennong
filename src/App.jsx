import React, { useState, useEffect, useRef } from 'react';
import { User, Calendar, MessageSquare, Shield, Headset, LogOut, Send, X, ArrowUp, Facebook, Instagram, Linkedin, ChevronDown, Globe } from 'lucide-react';
import io from 'socket.io-client';

const socket = io("http://localhost:3000");

// --- Translation Dictionary ---
const translations = {
  zh: {
    "app.name": "神农",
    "nav.appt": "立即预约",
    "nav.history": "预约记录",
    "nav.login": "登录",
    "nav.register": "注册",
    "hero.title": "草本精粹 · 调理身心",
    "hero.subtitle": "神农中医：自然健康，平衡生活。",
    "stats.visits": "每年接待人次",
    "stats.doctors": "资深名医团队人数",
    "stats.clinics": "连锁机构数量",
    "tips.title": "中医健康科普",
    "tips.more": "更多",
    "tips.less": "收起",
    "tips.content": '中医认为“药食同源”，日常饮食与穴位按压即可调和气血、预防亚健康。快节奏生活更易打破阴阳平衡，需顺四时、按经络细微养护，以食为药、以手为针，让身心常葆充沛舒畅。顺应四时更迭调整饮食，春宜温补、夏宜清暑、秋宜润燥、冬宜滋补；循经络走向按压穴位，晨起揉按合谷提振精神，睡前轻按涌泉安神助眠。三餐与日常细微养护，使身体回归阴平阳秘的健康本态。',
    "map.title": "医馆地址",
    "map.subtitle": "点击下方网点，在地图中快速定位",
    "map.nav": "点击导航 →",
    "doc.title": "名医风采 · 杏林圣手",
    "doc.subtitle": "汇聚中医泰斗与行业精英，以精湛医术传承千年中医智慧。",
    "doc.readmore": "了解更多",
    "qa.title": "为什么选择 SHEN NONG?",
    "footer.contact": "联系我们",
    "chat.title": "咨询客服",
    "chat.btn": "在线会话",
    "chat.placeholder": "输入回复内容...",
    "modal.login.title": "用户登录",
    "modal.login.btn": "立即登录",
    "modal.reg.title": "新用户注册",
    "modal.reg.btn": "提交注册",
    "modal.appt.title": "门诊预约",
    "modal.appt.quick": "一键选择常用就诊人：",
    "modal.appt.save": "保存为常用就诊人",
    "modal.appt.btn": "提交预约",
    "modal.history.title": "我的预约记录",
    "agent.title": "SHEN NONG 客服工作台",
    "agent.exit": "退出",
    "agent.waiting": "待处理咨询",
    "agent.empty": "暂无在线咨询",
    "admin.title": "管理员后台",
    "admin.users": "用户列表",
    "admin.appts": "预约记录",
    "admin.logs": "全站聊天记录 (审计)",
  },
  en: {
    "app.name": "SHEN NONG",
    "nav.appt": "Book Now",
    "nav.history": "My History",
    "nav.login": "Login",
    "nav.register": "Register",
    "hero.title": "Herbal Essence · Body & Mind",
    "hero.subtitle": "Shen Nong TCM: Natural Health, Balanced Life.",
    "stats.visits": "Annual Visits",
    "stats.doctors": "Expert Doctors",
    "stats.clinics": "Clinic Locations",
    "tips.title": "TCM Health Tips",
    "tips.more": "Read More",
    "tips.less": "Show Less",
    "tips.content": "TCM believes that 'medicine and food share the same origin'. Daily diet and acupoint pressure can harmonize Qi and blood. Fast-paced life easily breaks the balance of Yin and Yang. We need to nourish ourselves according to the four seasons and meridians. Adjust your diet with the seasons: warm tonics in spring, clearing heat in summer, moisturizing in autumn, and nourishing in winter. Press acupoints along the meridians: massage Hegu in the morning to boost energy, and Yongquan before bed for better sleep.",
    "map.title": "Clinic Locations",
    "map.subtitle": "Click a location below to locate on map",
    "map.nav": "Navigate →",
    "doc.title": "Our Experts",
    "doc.subtitle": "Gathering TCM masters and industry elites to inherit thousands of years of wisdom.",
    "doc.readmore": "Read More",
    "qa.title": "Why Choose SHEN NONG?",
    "footer.contact": "Contact Us",
    "chat.title": "Customer Service",
    "chat.btn": "Live Chat",
    "chat.placeholder": "Type a message...",
    "modal.login.title": "User Login",
    "modal.login.btn": "Login Now",
    "modal.reg.title": "New User Registration",
    "modal.reg.btn": "Register",
    "modal.appt.title": "Appointment",
    "modal.appt.quick": "Quick Select Visitor:",
    "modal.appt.save": "Save as frequent visitor",
    "modal.appt.btn": "Submit",
    "modal.history.title": "My Appointments",
    "agent.title": "Agent Dashboard",
    "agent.exit": "Exit",
    "agent.waiting": "Pending Chats",
    "agent.empty": "No active chats",
    "admin.title": "Admin Dashboard",
    "admin.users": "Users List",
    "admin.appts": "Appointments",
    "admin.logs": "Chat Logs (Audit)",
  },
  bn: {
    "app.name": "শেন নং",
    "nav.appt": "বুক করুন",
    "nav.history": "আমার ইতিহাস",
    "nav.login": "লগইন",
    "nav.register": "নিবন্ধন",
    "hero.title": "ভেষজ নির্যাস · শরীর ও মন",
    "hero.subtitle": "শেন নং টিসিএম: প্রাকৃতিক স্বাস্থ্য, ভারসাম্যপূর্ণ জীবন।",
    "stats.visits": "বার্ষিক পরিদর্শন",
    "stats.doctors": "বিশেষজ্ঞ ডাক্তার",
    "stats.clinics": "ক্লিনিকের অবস্থান",
    "tips.title": "টিসিএম স্বাস্থ্য টিপস",
    "tips.more": "আরও পড়ুন",
    "tips.less": "কম দেখুন",
    "tips.content": "টিসিএম বিশ্বাস করে যে 'ঔষধ এবং খাদ্যের উৎস একই'। প্রতিদিনের খাদ্যতালিকা এবং আকুপয়েন্ট চাপ কিউই এবং রক্তের ভারসাম্য বজায় রাখতে পারে। ঋতু অনুযায়ী আপনার খাদ্যতালিকা সামঞ্জস্য করুন: বসন্তে উষ্ণ টনিক, গ্রীষ্মে শরীর ঠান্ডা রাখা, শরতে আর্দ্রতা বজায় রাখা এবং শীতে পুষ্টিকর খাবার। সকালে শক্তি বাড়াতে হেগু এবং ভালো ঘুমের জন্য রাতে ইয়ংকুয়ান ম্যাসাজ করুন।",
    "map.title": "ক্লিনিকের অবস্থান",
    "map.subtitle": "মানচিত্রে দেখতে নিচে ক্লিক করুন",
    "map.nav": "নেভিগেট →",
    "doc.title": "আমাদের বিশেষজ্ঞরা",
    "doc.subtitle": "হাজার বছরের জ্ঞান আহরণের জন্য টিসিএম মাস্টার এবং শিল্প বিশেষজ্ঞদের সমাবেশ।",
    "doc.readmore": "আরও জানুন",
    "qa.title": "কেন শেন নং বেছে নেবেন?",
    "footer.contact": "যোগাযোগ করুন",
    "chat.title": "গ্রাহক সেবা",
    "chat.btn": "লাইভ চ্যাট",
    "chat.placeholder": "বার্তা লিখুন...",
    "modal.login.title": "ব্যবহারকারী লগইন",
    "modal.login.btn": "লগইন করুন",
    "modal.reg.title": "নতুন ব্যবহারকারী নিবন্ধন",
    "modal.reg.btn": "নিবন্ধন করুন",
    "modal.appt.title": "অ্যাপয়েন্টমেন্ট",
    "modal.appt.quick": "ভিজিটর নির্বাচন করুন:",
    "modal.appt.save": "নিয়মিত ভিজিটর হিসেবে সংরক্ষণ করুন",
    "modal.appt.btn": "জমা দিন",
    "modal.history.title": "আমার অ্যাপয়েন্টমেন্ট",
    "agent.title": "এজেন্ট ড্যাশবোর্ড",
    "agent.exit": "প্রস্থান",
    "agent.waiting": "অপেক্ষমান চ্যাট",
    "agent.empty": "কোন সক্রিয় চ্যাট নেই",
    "admin.title": "অ্যাডমিন ড্যাশবোর্ড",
    "admin.users": "ব্যবহারকারীর তালিকা",
    "admin.appts": "অ্যাপয়েন্টমেন্ট",
    "admin.logs": "চ্যাট লগ (অডিট)",
  }
};

const TaiChiLoader = ({ className }) => (
  // viewBox defines canvas size
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="48" fill="currentColor" />
    <path d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,0 50,50 A24,24 0 0,1 50,2 Z" fill="#fdfbf7" />
    <circle cx="50" cy="26" r="8" fill="#fdfbf7" />
    <circle cx="50" cy="74" r="8" fill="currentColor" />
  </svg>
);

const TcmTips = ({ lang }) => {
  const t = translations[lang];
  const fullText = t["tips.content"];

  const [open, setOpen] = useState(false);
  // First 100 chars approx
  const preview = fullText.slice(0, 100);

  return (
    <section className="max-w-4xl mx-auto py-16 px-4">
      <h3 className="text-3xl font-bold text-[#4a6741] mb-6">{t["tips.title"]}</h3>

      <p className="text-gray-600 leading-relaxed mb-4">
        {open ? fullText : preview}
        {!open && '……'}
      </p>

      <button
        onClick={() => setOpen(v => !v)}
        className="text-[#8c4b37] font-bold border-b-2 border-[#8c4b37]"
      >
        {open ? t["tips.less"] : t["tips.more"]}
      </button>
    </section>
  );
};

// Number scrolling component
const RollingNumber = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Use easeOut effect, allow numbers to increase quickly then slowly
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const MapSection = ({ lang }) => {
  const t = translations[lang];
  const [locations, setLocations] = useState([]);
  const mapRef = useRef(null);      // Store map instance
  const markersRef = useRef({});   // Store all marker references for lookup by ID

  useEffect(() => {
    fetch('http://localhost:3000/api/clinic-locations')
      .then(res => res.json())
      .then(data => {
        setLocations(data);
        if (data.length === 0) return;

        // Initialize map
        const map = L.map('map-container').setView([data[0].lat, data[0].lng], 12);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '©OpenStreetMap, ©CartoDB',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        mapRef.current = map;

        // Iterate to add markers
        data.forEach(loc => {
          const marker = L.marker([loc.lat, loc.lng]).addTo(map);
          const popupContent = `
            <div class="p-1">
              <h4 style="margin:0; color:#4a6741; font-weight:bold;">${loc.name}</h4>
              <p style="margin:4px 0 0; font-size:11px; color:#666;">${loc.address}</p>
              <a href="https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}" target="_blank" 
                 style="display:inline-block; margin-top:8px; color:#8c4b37; text-decoration:none; font-size:11px; font-weight:bold;">
                 ${t["map.nav"]}
              </a>
            </div>
          `;
          marker.bindPopup(popupContent);

          // Save marker instance to ref, Key uses location ID
          markersRef.current[loc.id] = marker;
        });
      });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [lang]); // Re-run if lang changes to update popup text

  // Core function: Handle left list click
  const handleLocationClick = (loc) => {
    if (!mapRef.current) return;

    // 1. Pan map center (flyTo has smooth animation)
    mapRef.current.flyTo([loc.lat, loc.lng], 15, {
      animate: true,
      duration: 1.5 // Animation lasts 1.5s
    });

    // 2. Find corresponding marker and open popup
    const targetMarker = markersRef.current[loc.id];
    if (targetMarker) {
      targetMarker.openPopup();
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#4a6741] font-serif">{t["map.title"]}</h2>
          <p className="text-gray-500 mt-2">{t["map.subtitle"]}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left side: List display */}
          <div className="lg:col-span-1 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {locations.map(loc => (
              <div
                key={loc.id}
                onClick={() => handleLocationClick(loc)}
                className="p-4 border border-gray-100 rounded-xl hover:border-[#4a6741] hover:shadow-md transition-all cursor-pointer bg-gray-50 group"
              >
                <h3 className="font-bold text-gray-700 group-hover:text-[#4a6741] transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#4a6741] rounded-full"></span>
                  {loc.name}
                </h3>
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">{loc.address}</p>
              </div>
            ))}
          </div>

          {/* Right side: Map container */}
          <div className="lg:col-span-3">
            <div id="map-container" className="h-[450px] w-full rounded-2xl shadow-lg border-4 border-white z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- New Feature: Doctor Gallery Component ---
const DoctorGallerySection = ({ lang }) => {
  const t = translations[lang];

  // Doctor data with language support
  // In a real app, this should come from backend with localized fields
  const getDoctors = (l) => [
    {
      id: 1,
      name: l === 'en' ? "Li Shizhen" : (l === 'bn' ? "লি শিজেন" : "李时珍"),
      title: l === 'en' ? "Master of Medicine" : (l === 'bn' ? "মেডিসিন মাস্টার" : "医药大师 / 首席专家"),
      bio: l === 'en' ? "Medical scientist who spent 30 years researching herbs, author of Compendium of Materia Medica." : (l === 'bn' ? "চিকিৎসা বিজ্ঞানী যিনি ভেষজ গবেষণায় ৩০ বছর ব্যয় করেছেন।" : "医药学家，三十年跋山涉水考证草药，著成五十二卷《本草纲目》，收载植物、矿物、生物一千八百九十二种，按性味功效科学分类，至今仍是世界研究中药的经典依据。"),
      photoUrl: "/src/assets/doc1.jpeg"
    },
    {
      id: 2,
      name: l === 'en' ? "Bian Que" : (l === 'bn' ? "বিয়ান কিউ" : "扁鹊"),
      title: l === 'en' ? "Medical Master" : (l === 'bn' ? "মেডিকেল মাস্টার" : "医学大师 / 特聘顾问"),
      bio: l === 'en' ? "Pioneer of the four diagnostic methods: Look, Listen, Question, and Pulse." : (l === 'bn' ? "চারটি ডায়াগনস্টিক পদ্ধতির অগ্রদূত।" : "首创望闻问切四诊合参，提出“治未病”思想；相传能透视脏腑，曾使虢国太子起死回生，被尊为中国历史上第一位有确切记载的医学家。"),
      photoUrl: "/src/assets/doc2.jpeg"
    },
    {
      id: 3,
      name: l === 'en' ? "Hua Tuo" : (l === 'bn' ? "হুয়া তুও" : "华佗"),
      title: l === 'en' ? "Surgical Expert" : (l === 'bn' ? "সার্জিক্যাল বিশেষজ্ঞ" : "外科圣手 / 主任医师"),
      bio: l === 'en' ? "Inventor of Mafeisan for anesthesia, known as the originator of surgery." : (l === 'bn' ? "অ্যানেস্থেশিয়ার জন্য মাফিসান এর উদ্ভাবক।" : "创制麻沸散施行全身麻醉，开腹切瘤、清创缝合，又编五禽戏强身健体；医技精湛、仁心仁术，被后世尊为“外科鼻祖”和医德楷模。"),
      photoUrl: "/src/assets/doc3.jpeg"
    },
    {
      id: 4,
      name: l === 'en' ? "Cream Puff" : (l === 'bn' ? "ক্রিম পাফ" : "熊奶包"),
      title: "Meow Meow",
      bio: "Meow meow meow meow. Meow meow meow...",
      photoUrl: "/src/assets/doc4.jpg"
    }
  ];

  const doctors = getDoctors(lang);

  return (
    <section className="py-20 bg-[#fdfbf7] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-12 text-center">
        <h2 className="text-3xl font-bold text-[#4a6741] font-serif">{t["doc.title"]}</h2>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          {t["doc.subtitle"]}
        </p>
      </div>

      {/* Card Scrolling Container */}
      {/* Use padding-x to ensure whitespace when scrolling to edges */}
      <div className="flex overflow-x-auto pb-8 hide-scrollbar gap-6 px-4 md:px-0 max-w-6xl mx-auto snap-x snap-mandatory">
        {doctors.map((doc) => (
          // Single Card: flex-shrink-0 prevents squeezing, snap-start ensures alignment
          <div
            key={doc.id}
            className="flex-shrink-0 w-[300px] md:w-[340px] bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 group hover:border-[#4a6741] transition-all snap-start"
          >
            {/* Photo Area (Use aspect-ratio) */}
            <div className="relative h-[380px] overflow-hidden">
              <img
                src={doc.photoUrl}
                alt={doc.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient mask at bottom to make text clearer */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-2xl font-bold">{doc.name}</h3>
                <span className="text-sm bg-[#4a6741] px-2 py-0.5 rounded mt-1 inline-block">{doc.title}</span>
              </div>
            </div>

            {/* Bio Content Area */}
            <div className="p-6">
              <div className="h-[1px] w-12 bg-[#8c4b37] mb-4 opacity-50"></div>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                {doc.bio}
              </p>
              <button className="mt-6 w-full py-2 border border-[#4a6741] text-[#4a6741] rounded-full hover:bg-[#4a6741] hover:text-white transition text-sm font-bold flex items-center justify-center gap-1 group-hover:bg-[#4a6741] group-hover:text-white">
                {t["doc.readmore"]} <ArrowUp className="rotate-45" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function App() {
  const [lang, setLang] = useState('zh'); // 'zh' | 'en' | 'bn'
  const t = translations[lang];

  const [user, setUser] = useState(() => {
    // Read from local storage on initialization
    const savedUser = localStorage.getItem('tcm_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      // Don't trust local data blindly, ask server
      fetch(`http://localhost:3000/api/verify?id=${u.id}`)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(realUser => {
          setUser(realUser);
          // Switch view based on role returned by server
          if (realUser.role === 'admin') setView('admin');
          else if (realUser.role === 'agent') setView('agent');
          else setView('home');
        })
        .catch(() => {
          // If verification fails (e.g., fake ID), force logout
          handleLogout();
        });
    }
  }, []);

  const [view, setView] = useState(() => {
    // Decide initial view based on stored user role
    const savedUser = localStorage.getItem('tcm_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      return u.role === 'admin' ? 'admin' : (u.role === 'agent' ? 'agent' : 'home');
    }
    return 'home';
  });
  const [isVerifying, setIsVerifying] = useState(true); // Verifying state
  const [modal, setModal] = useState(null); // 'login' | 'reg' | 'appt'
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [myAppts, setMyAppts] = useState([]);
  const [savedVisitors, setSavedVisitors] = useState([]);

  // ---------------------------------------------------------
  // Logic A: Identity Verification (Runs once on page load)
  // ---------------------------------------------------------
  useEffect(() => {
    const savedUser = localStorage.getItem('tcm_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      // Check identity with backend
      fetch(`http://localhost:3000/api/verify?id=${u.id}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(realUser => {
          setUser(realUser);
          if (realUser.role === 'admin') setView('admin');
          else if (realUser.role === 'agent') setView('agent');
          else setView('home');
        })
        .catch(() => {
          // Illegal identity, clear local storage
          localStorage.removeItem('tcm_user');
          setUser(null);
          setView('home');
        })
        .finally(() => setIsVerifying(false)); // Verification ended
    } else {
      setIsVerifying(false); // No need to verify
    }
  }, []);

  // ---------------------------------------------------------
  // Logic B: Chat Logic (Depends on user and isVerifying)
  // ---------------------------------------------------------
  useEffect(() => {
    // Establish Socket connection only after [Verification Complete]
    if (isVerifying) return;

    // Determine room ID: Login user uses own ID, guest uses fixed guest_room
    const room = user?.id || "guest_room";

    socket.emit('join_room', room);
    console.log(`Joined room: ${room}`);

    // 1. Define a named handler function
    const handleMessage = (msg) => {
      // Trick: Only process messages sent back by server, update UI uniformly
      setMessages(prev => [...prev, msg]);
    };

    // 2. Remove old listener first, then bind new one to prevent doubling
    socket.off('receive_message');
    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('receive_message', handleMessage);
    };
  }, [user, isVerifying]); // Re-run when user info or verification state changes

  // 1. Login/Register Logic
  const handleAuth = async (type, e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const url = type === 'login' ? '/api/login' : '/api/register';
    const res = await fetch(`http://localhost:3000${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(fd))
    });

    const data = await res.json();

    if (res.ok) {
      // --- Core Fix Location ---
      const loggedUser = type === 'login' ? data.user : data;
      setUser(loggedUser);
      setModal(null);

      localStorage.setItem('tcm_user', JSON.stringify(loggedUser));

      // Judge view based on role in returned user object
      if (loggedUser.role === 'admin') {
        setView('admin');
      } else if (loggedUser.role === 'agent') {
        setView('agent');
      } else {
        setView('home');
      }
      // ------------------
    } else {
      alert(data.message);
    }
  };

  const handleLogOut = () => {
    setUser(null);
    setView('home');
    localStorage.removeItem('tcm_user');
  }

  // 2. Appointment Logic (Key Requirement)
  const handleApptSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);

    // 1. If save frequent visitor is checked, send save request first
    // Note: Use checked property of checkbox
    const shouldSave = e.target.saveVisitor.checked;
    if (shouldSave && user) {
      const saveRes = await fetch('http://localhost:3000/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: data.userName,
          phone: data.userPhone
        })
      });
      // If save fails (e.g., limit exceeded), give a small hint
      if (!saveRes.ok) {
        const errorData = await saveRes.json();
        console.warn("Contact save failed:", errorData.message);
        alert("Note: Frequent visitor save failed, Reason: ", errorData.message);
      }
    }

    // 2. Send appointment request
    const res = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userId: user?.id || 'guest' })
    });

    if (res.ok) {
      alert("Appointment Successful!");
      setModal(null); // Close modal
      e.target.reset(); // Reset form
    }
  };

  // Function to handle quick fill
  const quickFill = (v) => {
    // Need to set input value manually or use state binding
    const nameInput = document.querySelector('input[name="userName"]');
    const phoneInput = document.querySelector('input[name="userPhone"]');
    if (nameInput) nameInput.value = v.name;
    if (phoneInput) phoneInput.value = v.phone;
  };

  // --- Frontend: Delete contact function ---
  const deleteVisitor = async (e, visitorId) => {
    e.stopPropagation(); // [Critical] Stop propagation to prevent triggering fill logic

    if (!confirm("Are you sure you want to delete this frequent visitor?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/visitors/${visitorId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Filter out deleted item from state, UI update without refresh
        setSavedVisitors(prev => prev.filter(v => v.id !== visitorId));
      } else {
        alert("Delete failed, please try again later");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Get frequent visitors every time appointment window opens
  useEffect(() => {
    // Add debug log to see if triggered
    console.log("Current modal state:", modal, "User Info:", user?.id);

    if (modal === 'appt' && user?.id) {
      fetch(`http://localhost:3000/api/visitors?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          console.log("Fetched frequent visitors:", data);
          setSavedVisitors(data);
        })
        .catch(err => console.error("Failed to load contacts:", err));
    }
  }, [modal, user?.id]); // Listen to specific User ID

  // Get data when user opens history
  const openHistory = async () => {
    if (!user) return alert("Please login first");
    const res = await fetch(`http://localhost:3000/api/appointments?userId=${user.id}`);
    const data = await res.json();
    setMyAppts(data);
    setModal('history');
  };

  const sendMsg = () => {
    // 1. Intercept if content is empty
    if (!chatInput.trim()) return;

    const msg = {
      roomId: user?.id || "guest_room",
      senderName: user?.name || "Guest",
      senderRole: 'user',
      content: chatInput.trim() // Trim whitespace
    };

    // 2. Clear input immediately (before emit to prevent rapid double click/enter)
    setChatInput("");

    // 3. Send to backend
    socket.emit('send_message', msg);

    // 4. Manually sync to local message list (because server socket.to(room) won't send back to sender)
    setMessages(prev => [...prev, msg]);
  };

  if (isVerifying) {
    // [Modification] Replace entire loading screen
    return (
      <div className="h-screen flex items-center justify-center bg-[#fdfbf7] flex-col gap-6">
        {/* Use defined TaiChiLoader component 
           - w-32 h-32: Set larger size
           - text-tcm-primary: Set main color to herbal green
           - animate-spin: Tailwind built-in spin animation
           - drop-shadow-lg: Add depth
        */}
        <div className="relative">
          <TaiChiLoader className="w-32 h-32 text-tcm-primary animate-spin drop-shadow-xl" />
          {/* Optional: Add a center glow effect */}
          <div className="absolute inset-0 bg-tcm-primary blur-2xl opacity-20 rounded-full animate-pulse"></div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-tcm-primary tracking-[0.2em]">SHEN NONG</h2>
          <p className="text-tcm-secondary font-medium italic text-sm animate-pulse">
            Harmony · Syncing Data...
          </p>
        </div>
      </div>
    );
  }
  if (view === 'admin') return <AdminUI user={user} lang={lang} t={t} onExit={() => { handleLogOut() }} />;
  if (view === 'agent') return <AgentUI user={user} lang={lang} t={t} onExit={() => { handleLogOut() }} />;

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-[#4a6741]">
          <img
            src='/public/logo.svg'
            alt='SHEN NONG LOGO'
            className="w-20 h-20 rounded-full flex items-center justify-center"></img>
          <span className="text-2xl font-bold tracking-tighter">{t["app.name"]}</span>
        </div>
        <div className="flex gap-4 items-center">
          {/* Language Switcher */}
          <div className="flex items-center gap-2 mr-4 border-r pr-4 border-gray-200">
            <Globe size={18} className="text-gray-500" />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
          </div>

          <button onClick={() => setModal('appt')} className="bg-[#8c4b37] text-white px-4 py-2 rounded-md flex items-center gap-2"><Calendar size={18} /> {t["nav.appt"]}</button>
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={openHistory} // Call function to get history and open modal
                className="border border-[#4a6741] text-[#4a6741] px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#4a6741] hover:text-white transition"
              >
                <MessageSquare size={18} /> {t["nav.history"]}
              </button>
              <span className="font-medium">{user.name}</span>
              <button onClick={() => handleLogOut()} className="text-gray-400"><LogOut size={20} /></button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setModal('login')} className="text-[#4a6741] font-medium px-3">{t["nav.login"]}</button>
              <button onClick={() => setModal('reg')} className="border border-[#4a6741] text-[#4a6741] px-3 py-1 rounded">{t["nav.register"]}</button>
            </div>
          )}
        </div>
      </header>

      {/* Body: Hero & Content */}
      <main className="flex-grow">
        <section className="h-[400px] bg-neutral-800 flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-4">{t["hero.title"]}</h2>
            <p className="text-xl opacity-80 italic">{t["hero.subtitle"]}</p>
          </div>
        </section>
        {/* Data Dashboard Section */}
        <section className="bg-[#4a6741] py-16 text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

              {/* Annual Visits */}
              <div className="space-y-2">
                <div className="text-5xl font-bold font-mono">
                  <RollingNumber target={150000} />+
                </div>
                <div className="text-green-100 opacity-80 uppercase tracking-widest text-sm">
                  {t["stats.visits"]}
                </div>
              </div>

              {/* Doctor Count */}
              <div className="space-y-2">
                <div className="text-5xl font-bold font-mono">
                  <RollingNumber target={128} />
                </div>
                <div className="text-green-100 opacity-80 uppercase tracking-widest text-sm">
                  {t["stats.doctors"]}
                </div>
              </div>

              {/* Clinic Count */}
              <div className="space-y-2">
                <div className="text-5xl font-bold font-mono">
                  <RollingNumber target={42} />
                </div>
                <div className="text-green-100 opacity-80 uppercase tracking-widest text-sm">
                  {t["stats.clinics"]}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Tips Section */}
        <TcmTips lang={lang} />
        {/* Map Section */}
        <MapSection lang={lang} />

        {/* Doctor Gallery Section */}
        <DoctorGallerySection lang={lang} />

        {/* QA Section (Collapsible) */}
        <section className="bg-white py-16">
          <div className="max-w-2xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-8">{t["qa.title"]}</h3>
            {[
              { q: "你们的药材来源可靠吗？", a: "我们所有药材均源自神农架及知名药产区，经过严格的农残和重金属检测。" },
              { q: "针灸治疗疼吗？", a: "针灸通常只会有微弱的酸麻胀感，是由我们拥有20年以上经验的专家团队操作。" }
            ].map((item, i) => (
              <div key={i} className="mb-4 border-b pb-4">
                <div className="font-bold flex justify-between cursor-pointer">{item.q} <ChevronDown /></div>
                <p className="mt-2 text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white p-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h4 className="text-xl font-bold mb-4">{t["footer.contact"]}</h4>
            <p className="opacity-70">Phone: +65 8888 9999</p>
            <p className="opacity-70">Email: support@shennong.com</p>
            <div className="flex gap-4 mt-4">
              <Facebook className="hover:text-[#4a6741] cursor-pointer" /> <Instagram className="hover:text-[#4a6741] cursor-pointer" /> <Linkedin className="hover:text-[#4a6741] cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4">General</h4>
            <p className="opacity-70 cursor-pointer">News</p>
            <p className="opacity-70 cursor-pointer mt-2">Contact Us</p>
          </div>
        </div>
      </footer>

      {/* Floating Button */}
      <button onClick={() => window.scrollTo(0, 0)} className="fixed left-6 bottom-10 z-50 bg-[#4a6741] text-white p-3 rounded-full shadow-lg"><ArrowUp /></button>
      <div className="fixed right-6 bottom-10 z-50">
        {isChatOpen && (
          <div className="bg-white w-80 h-96 shadow-2xl rounded-lg mb-4 flex flex-col overflow-hidden border">
            <div className="bg-[#4a6741] p-3 text-white flex justify-between items-center">
              <span>{t["chat.title"]}</span>
              <X onClick={() => setIsChatOpen(false)} className="cursor-pointer" />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2 rounded-lg ${m.senderRole === 'user' ? 'bg-green-100' : 'bg-gray-100'}`}>{m.content}</div>
                </div>
              ))}
            </div>
            <div className="p-2 border-t flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  // [Core Fix] Check if IME composition is active
                  // Only trigger if Enter is pressed and NOT in composition mode
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    sendMsg();
                  }
                }}
                className="flex-1 border p-1"
                placeholder={t["chat.placeholder"]}
              />
              <button onClick={sendMsg} className="bg-[#4a6741] text-white px-2 rounded"><Send size={16} /></button>
            </div>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-[#8c4b37] text-white p-4 rounded-full shadow-lg flex items-center gap-2"><MessageSquare /> {t["chat.btn"]}</button>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg w-full max-w-md relative">
            <X onClick={() => setModal(null)} className="absolute top-4 right-4 cursor-pointer text-gray-400" />

            {/* Login Modal */}
            {modal === 'login' && (
              <form onSubmit={(e) => handleAuth('login', e)}>
                <h3 className="text-2xl font-bold mb-6">{t["modal.login.title"]}</h3>
                <input name="email" type="email" placeholder="Email" className="w-full border p-2 mb-4" required />
                <input name="password" type="password" placeholder="Password" className="w-full border p-2 mb-6" required />
                <button className="w-full bg-[#4a6741] text-white py-2 rounded font-bold">{t["modal.login.btn"]}</button>
              </form>
            )}

            {/* Registration Modal (Key Requirement) */}
            {modal === 'reg' && (
              <form onSubmit={(e) => handleAuth('reg', e)}>
                <h3 className="text-2xl font-bold mb-6">{t["modal.reg.title"]}</h3>
                <input name="name" placeholder="Name" className="w-full border p-2 mb-4" required />
                <input name="email" type="email" placeholder="Email" className="w-full border p-2 mb-4" required />
                <input name="phone" placeholder="Mobile" className="w-full border p-2 mb-4" required />
                <input name="password" type="password" placeholder="Set Password" className="w-full border p-2 mb-6" required />
                <button className="w-full bg-[#8c4b37] text-white py-2 rounded font-bold">{t["modal.reg.btn"]}</button>
              </form>
            )}

            {/* Appointment Modal (Key Requirement: Check login state) */}
            {modal === 'appt' && (
              <form onSubmit={handleApptSubmit}>
                <h3 className="text-2xl font-bold mb-4">{t["modal.appt.title"]}</h3>
                {/* Frequent Visitor Selection Area */}
                {savedVisitors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">{t["modal.appt.quick"]}</p>
                    <div className="flex flex-wrap gap-2">
                      {savedVisitors.map(v => (
                        <button
                          type="button"
                          onClick={() => quickFill(v)}
                          className="text-xs border border-[#4a6741] text-[#4a6741] pl-3 pr-6 py-1 rounded-full hover:bg-[#4a6741] hover:text-white transition relative"
                        >
                          {v.name}

                          {/* Delete tiny button: Absolute positioning on right */}
                          <span
                            onClick={(e) => deleteVisitor(e, v.id)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-500 hover:text-white text-gray-400 transition-colors"
                          >
                            <X size={10} />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mb-4 space-y-3">
                  <input name="userName" placeholder="Name" className="w-full border p-2" required />
                  <input name="userPhone" placeholder="Mobile" className="w-full border p-2" required />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <input type="checkbox" id="saveVisitor" name="saveVisitor" className="accent-[#4a6741]" />
                  <label htmlFor="saveVisitor" className="text-xs text-gray-500">{t["modal.appt.save"]}</label>
                </div>
                <div className="space-y-4">
                  <input name="date" type="datetime-local" className="w-full border p-2" required />
                  <select name="service" className="w-full border p-2">
                    <option>Acupuncture</option>
                    <option>Massage</option>
                    <option>Herbal Therapy</option>
                  </select>
                  <textarea name="description" placeholder="Description" className="w-full border p-2 h-24"></textarea>
                  <button className="w-full bg-black text-white py-3 rounded font-bold">{t["modal.appt.btn"]}</button>
                </div>
              </form>
            )}

            {/* My Appointment History */}
            {modal === 'history' && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                  <div className="p-6 border-b flex justify-between items-center bg-[#4a6741] text-white">
                    <h3 className="text-xl font-bold">{t["modal.history.title"]}</h3>
                    <button onClick={() => setModal(null)}><X /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {myAppts.length === 0 ? (
                      <p className="text-center text-gray-400 py-10">No records found</p>
                    ) : (
                      myAppts.map(a => (
                        <div key={a.id} className="border p-4 rounded-2xl bg-gray-50 hover:border-[#4a6741] transition-colors">
                          <div className="flex justify-between font-bold mb-1">
                            <span className="text-[#4a6741]">{a.service}</span>
                            <span className="text-xs text-gray-400">{a.date.replace('T', ' ')}</span>
                          </div>
                          <p className="text-sm text-gray-600">Visitor: {a.userName} ({a.userPhone})</p>
                          {a.description && <p className="text-xs text-gray-400 mt-2 italic">Note: {a.description}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Admin Dashboard Component ---
function AdminUI({ onExit, t }) {
  const [data, setData] = useState({ users: [], appts: [], msgs: [] });
  useEffect(() => {
    fetch("http://localhost:3000/api/admin/all").then(r => r.json()).then(setData);
  }, []);

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-indigo-700"><Shield /> {t["admin.title"]}</h1>
        <button onClick={onExit} className="bg-red-500 text-white px-4 py-2 rounded">Exit</button>
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">{t["admin.users"]} ({data.users.length})</h2>
          {data.users.map(u => <div key={u.id} className="border-b py-2 text-sm">{u.name} - {u.phone} - {u.email} ({u.role})</div>)}
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">{t["admin.appts"]} ({data.appts.length})</h2>
          {data.appts.map(a => <div key={a.id} className="border-b py-2 text-sm font-medium">{a.userName} | {a.userPhone} | {a.date} | {a.service}</div>)}
        </div>
        <div className="bg-white p-6 rounded shadow col-span-2">
          <h2 className="text-xl font-bold mb-4">{t["admin.logs"]}</h2>
          {data.msgs.map(m => <div key={m.id} className="text-xs border-l-2 border-indigo-200 pl-2 mb-2">
            [{m.timestamp}] <b>{m.senderName} ({m.senderRole})</b>: {m.content}
          </div>)}
        </div>
      </div>
    </div>
  );
}

// --- Agent Dashboard (Full Feature Version) ---
function AgentUI({ user, onExit, t }) {
  const [sessions, setSessions] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Fetch all active sessions
  const fetchSessions = () => {
    fetch("http://localhost:3000/api/agent/sessions")
      .then(res => res.json())
      .then(data => setSessions(data));
  };

  useEffect(() => {
    fetchSessions();
    const timer = setInterval(fetchSessions, 5000); // Refresh list every 5 seconds
    return () => clearInterval(timer);
  }, []);

  // Listen for message push
  useEffect(() => {
    socket.on('receive_message', (msg) => {
      if (msg.roomId === activeRoom) {
        setMessages(prev => [...prev, msg]);
      }
      fetchSessions(); // Refresh list preview on new message
    });
    return () => socket.off('receive_message');
  }, [activeRoom]);

  const selectRoom = (roomId) => {
    setActiveRoom(roomId);
    socket.emit('join_room', roomId);
    // Load history for specific room
    fetch(`http://localhost:3000/api/chat/history?roomId=${roomId}`)
      .then(res => res.json())
      .then(data => setMessages(data));
  };

  const sendReply = () => {
    if (!input.trim() || !activeRoom) return;
    const msg = {
      roomId: activeRoom,
      senderName: user.name,
      senderRole: 'agent',
      content: input
    };
    socket.emit('send_message', msg);
    setMessages(prev => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-[#4a6741] text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <Headset />
          <h1 className="text-xl font-bold">{t["agent.title"]}</h1>
        </div>
        <div className="flex items-center gap-4">
          <span>Agent: {user?.name || "Unknown Agent"}</span>
          <button onClick={onExit} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded">{t["agent.exit"]}</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left side: Session List */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 font-bold border-b bg-gray-50">{t["agent.waiting"]}</div>
          {sessions.map(s => (
            <div key={s.roomId} onClick={() => selectRoom(s.roomId)}
              className={`p-4 border-b cursor-pointer hover:bg-green-50 transition ${activeRoom === s.roomId ? 'bg-green-100 border-r-4 border-green-600' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-gray-800">{s.senderName}</span>
                <span className="text-[10px] text-gray-400">{new Date(s.lastMsgTime).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{s.content}</p>
            </div>
          ))}
          {sessions.length === 0 && <p className="p-10 text-center text-gray-400">{t["agent.empty"]}</p>}
        </div>

        {/* Right side: Chat Details */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {activeRoom ? (
            <>
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.senderRole === 'agent' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${m.senderRole === 'agent' ? 'bg-[#4a6741] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border'}`}>
                      <p className="text-[10px] opacity-70 mb-1">{m.senderName}</p>
                      <p className="text-sm">{m.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-white border-t flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                  placeholder="Type a reply..."
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-[#4a6741]" />
                <button onClick={sendReply} className="bg-[#4a6741] text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#3d5535]">
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={48} className="mb-2 opacity-20" />
              <p>Select a session from the left to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}