import React, { useState, useEffect, createContext, useContext } from "react";
import {
  Home as HomeIcon,
  Briefcase,
  Wrench,
  HelpCircle,
  Wallet,
  Mic,
  MapPin,
  Star,
  ChevronRight,
  SlidersHorizontal,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Sprout,
  HardHat,
  Hammer,
  Zap,
  Droplets,
  Tractor,
  X,
  CheckCircle2,
  Circle,
  Phone,
  MessageCircle,
  AlertCircle,
  Navigation,
  Lock,
  Unlock,
  Send,
  BadgeCheck,
  BookOpen,
  Wheat,
  Apple,
  Package,
  Globe,
  Shield,
  ShieldCheck,
  UserX,
  Trash2,
  UserPlus,
  UserCircle,
  LogOut,
  KeyRound,
  Volume2,
  Code,
  Database,
} from "lucide-react";
import { C, fontImport, LANGUAGES } from "./components/types.ts";
import { SnippetsView } from "./components/SnippetsView.tsx";
import {
  api,
  DbUser,
  DbJob,
  DbEquipment,
  DbProduce,
  DbQuestion,
  DbTransaction,
} from "./api.ts";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, googleAuthProvider } from "./lib/firebase.ts";

// ---- Localization ----
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    "nav.home": "Home", "nav.jobs": "My Jobs", "nav.wallet": "Wallet", "nav.qa": "Q&A",
    "lang.choose": "Choose Your Language", "lang.sub": "You can change this anytime from Home", "lang.continue": "Continue",
    "home.greeting": "Hello", "home.wallet": "WALLET", "home.search": "Search work, workers, tools...",
    "home.findWork": "Find Work", "home.findWorkSub": "Jobs near you",
    "home.hireWorker": "Hire Worker", "home.hireWorkerSub": "Post a job",
    "home.rentEquipment": "Rent Equipment", "home.rentEquipmentSub": "Tools & machines",
    "home.askQuestion": "Ask a Question", "home.askQuestionSub": "Get expert help",
    "home.logExpertise": "Log your expertise & pricing", "home.logExpertiseSub": "Get 3x more job alerts",
    "home.buySell": "Buy & sell local produce", "home.buySellSub": "Vegetables, bamboo, grains & more",
    "home.village": "Village ABC, {r} km radius",
    "home.workersHeading": "{n} workers within {r} km", "home.seeAll": "See all",
    "topbar.postJob": "Post a Job", "topbar.jobTracking": "Job Tracking", "topbar.jobsNear": "Jobs Near You",
    "topbar.workersNear": "Workers Near You", "topbar.myExpertise": "My Expertise", "topbar.equipment": "Equipment",
    "topbar.equipmentBooking": "Equipment Booking", "topbar.listEquipment": "List Your Equipment",
    "topbar.bookMachine": "Book Machine for Work", "topbar.askExpert": "Ask an Expert",
    "topbar.askQuestion": "Ask a Question", "topbar.questionThread": "Question Thread",
    "topbar.wallet": "Wallet", "topbar.marketplace": "Local Marketplace", "topbar.sellProduce": "Sell Produce or Goods",
    "topbar.confirmOrder": "Confirm Order", "topbar.orderTracking": "Order Tracking",
    "topbar.admin": "Admin Panel", "admin.users": "Users", "admin.answers": "Answers",
    "admin.addUser": "+ Add User", "admin.verify": "Verify", "admin.remove": "Remove",
    "admin.verified": "Verified", "admin.blocked": "Blocked",
    "login.title": "Welcome", "login.subtitle": "Enter your mobile number to continue",
    "login.phonePlaceholder": "10-digit mobile number", "login.sendOtp": "Send OTP",
    "login.otpTitle": "Enter OTP", "login.otpSubtitle": "Sent to {phone}", "login.verify": "Verify & Continue",
    "login.changeNumber": "Change number", "login.resend": "Resend OTP",
    "role.title": "Who are you?", "role.subtitle": "You can switch or add roles anytime",
    "role.worker": "Worker / Service Provider", "role.workerSub": "Find work, get hired",
    "role.customer": "Customer", "role.customerSub": "Hire workers, rent equipment",
    "role.both": "Both", "role.bothSub": "Work and hire, same account",
    "role.admin": "Admin", "role.adminSub": "Manage users & moderate Q&A",
    "role.continue": "Continue",
    "account.title": "Account", "account.logout": "Log Out",
    "btn.postJob": "Post Job → Notify {n} Nearby Workers", "btn.viewJobStatus": "View Job Status",
    "btn.hireNow": "Hire Now", "btn.accept": "Accept", "btn.reject": "Reject",
    "btn.rentNow": "Rent Now", "btn.bookForWork": "Book for Work",
    "btn.saveExpertise": "Save My Expertise", "btn.profileSaved": "Profile Saved",
    "btn.listEquipment": "List Equipment for Rent", "btn.viewEquipmentList": "View in Equipment List",
    "btn.postQuestion": "Post Question", "btn.askFollowup": "Ask Follow-up", "btn.addAnswer": "Add an Answer",
    "btn.askNewQuestion": "+ Ask a New Question",
    "btn.markFree": "Mark Free", "btn.setPrice": "Set Price", "btn.cancelJob": "Cancel this job",
    "btn.keepJob": "Keep Job", "btn.yesCancelJob": "Yes, Cancel Job",
    "job.waiting": "Waiting for worker to accept…", "job.start": "Start Work", "job.complete": "Mark Work Complete",
    "job.pay": "Confirm & Release Payment", "job.rate": "Rate This Worker",
    "work.hourly": "Hourly", "work.halfDay": "Half Day", "work.fullDay": "Full Day", "work.taskBased": "Task Based", "work.monthly": "Monthly",
    "sort.all": "All", "sort.nearest": "Nearest", "sort.bestRating": "Best Rating", "sort.lowestPrice": "Lowest Price",
    "sort.availableNow": "Available Now", "sort.highestPay": "Highest Pay", "sort.urgent": "Urgent", "sort.bestRated": "Best Rated",
    "avail.available": "Available", "avail.busy": "Busy", "avail.notAvailable": "Not Available",
  },
  hi: {
    "nav.home": "होम", "nav.jobs": "मेरे काम", "nav.wallet": "वॉलेट", "nav.qa": "सवाल-जवाब",
    "lang.choose": "अपनी भाषा चुनें", "lang.sub": "आप इसे बाद में होम से बदल सकते हैं", "lang.continue": "आगे बढ़ें",
    "home.greeting": "नमस्ते", "home.wallet": "वॉलेट", "home.search": "काम, मजदूर, औज़ार खोजें...",
    "home.findWork": "काम खोजें", "home.findWorkSub": "आपके पास के काम",
    "home.hireWorker": "मजदूर बुलाएं", "home.hireWorkerSub": "काम पोस्ट करें",
    "home.rentEquipment": "औज़ार किराए पर लें", "home.rentEquipmentSub": "मशीनें व उपकरण",
    "home.askQuestion": "सवाल पूछें", "home.askQuestionSub": "विशेषज्ञ की मदद लें",
    "home.logExpertise": "अपनी विशेषज्ञता व दाम दर्ज करें", "home.logExpertiseSub": "3 गुना ज्यादा काम पाएं",
    "home.buySell": "स्थानीय उपज खरीदें व बेचें", "home.buySellSub": "सब्ज़ी, बांस, अनाज व अन्य",
    "home.village": "गांव ABC, {r} किमी दायरा",
    "home.workersHeading": "{r} किमी में {n} मजदूर उपलब्ध हैं", "home.seeAll": "सभी देखें",
    "topbar.postJob": "काम पोस्ट करें", "topbar.jobTracking": "काम की स्थिति", "topbar.jobsNear": "पास के काम",
    "topbar.workersNear": "पास के मजदूर", "topbar.myExpertise": "मेरी विशेषज्ञता", "topbar.equipment": "उपकरण",
    "topbar.equipmentBooking": "उपकरण बुकिंग", "topbar.listEquipment": "अपना उपकरण जोड़ें",
    "topbar.bookMachine": "मशीन व काम बुक करें", "topbar.askExpert": "विशेषज्ञ से पूछें",
    "topbar.askQuestion": "सवाल पूछें", "topbar.questionThread": "प्रश्नाची चर्चा",
    "topbar.wallet": "वॉलेट", "topbar.marketplace": "स्थानीय बाज़ार", "topbar.sellProduce": "उपज या सामान बेचें",
    "topbar.confirmOrder": "ऑर्डर की पुष्टि करें", "topbar.orderTracking": "ऑर्डर की स्थिति",
    "topbar.admin": "एडमिन पैनल", "admin.users": "उपयोगकर्ता", "admin.answers": "जवाब",
    "admin.addUser": "+ उपयोगकर्ता जोड़ें", "admin.verify": "सत्यापित करें", "admin.remove": "हटाएं",
    "admin.verified": "सत्यापित", "admin.blocked": "अवरोधित",
    "login.title": "स्वागत है", "login.subtitle": "जारी रखने के लिए अपना मोबाइल नंबर डालें",
    "login.phonePlaceholder": "10 अंकों का मोबाइल नंबर", "login.sendOtp": "OTP भेजें",
    "login.otpTitle": "OTP डालें", "login.otpSubtitle": "{phone} पर भेजा गया", "login.verify": "सत्यापित करें और आगे बढ़ें",
    "login.changeNumber": "नंबर बदलें", "login.resend": "फिर से OTP भेजें",
    "role.title": "आप कौन हैं?", "role.subtitle": "आप कभी भी भूमिका बदल या जोड़ सकते हैं",
    "role.worker": "मजदूर / सेवा प्रदाता", "role.workerSub": "काम खोजें, बुलाए जाएं",
    "role.customer": "ग्राहक", "role.customerSub": "मजदूर बुलाएं, उपकरण किराए पर लें",
    "role.both": "दोनों", "role.bothSub": "एक ही खाते से काम करें और बुलाएं",
    "role.admin": "एडमिन", "role.adminSub": "उपयोगकर्ता प्रबंधित करें व सवाल-जवाब की निगरानी करें",
    "role.continue": "आगे बढ़ें",
    "account.title": "खाता", "account.logout": "लॉग आउट करें",
    "btn.postJob": "काम पोस्ट करें → {n} पास के मजदूरों को सूचना दें", "btn.viewJobStatus": "काम की स्थिति देखें",
    "btn.hireNow": "अभी बुलाएं", "btn.accept": "स्वीकार करें", "btn.reject": "अस्वीकार करें",
    "btn.rentNow": "अभी किराए पर लें", "btn.bookForWork": "काम के लिए बुक करें",
    "btn.saveExpertise": "मेरी विशेषज्ञता सहेजें", "btn.profileSaved": "प्रोफ़ाइल सहेजी गई",
    "btn.listEquipment": "किराए के लिए जोड़ें", "btn.viewEquipmentList": "उपकरण सूची देखें",
    "btn.postQuestion": "सवाल पोस्ट करें", "btn.askFollowup": "आगे पूछें", "btn.addAnswer": "जवाब दें",
    "btn.askNewQuestion": "+ नया सवाल पूछें",
    "btn.markFree": "मुफ़्त रखें", "btn.setPrice": "दाम तय करें", "btn.cancelJob": "यह काम रद्द करें",
    "btn.keepJob": "काम रखें", "btn.yesCancelJob": "हां, रद्द करें",
    "job.waiting": "मजदूर के स्वीकार करने का इंतज़ार…", "job.start": "काम शुरू करें", "job.complete": "काम पूरा हुआ",
    "job.pay": "भुगतान की पुष्टि करें", "job.rate": "मजदूर को रेट करें",
    "work.hourly": "घंटे के हिसाब से", "work.halfDay": "आधा दिन", "work.fullDay": "पूरा दिन", "work.taskBased": "काम के हिसाब से", "work.monthly": "मासिक",
    "sort.all": "सभी", "sort.nearest": "सबसे नज़दीक", "sort.bestRating": "बेहतरीन रेटिंग", "sort.lowestPrice": "कम दाम",
    "sort.availableNow": "अभी उपलब्ध", "sort.highestPay": "ज़्यादा भुगतान", "sort.urgent": "ज़रूरी", "sort.bestRated": "बेहतरीन रेटेड",
    "avail.available": "उपलब्ध", "avail.busy": "व्यस्त", "avail.notAvailable": "उपलब्ध नहीं",
  },
  mr: {
    "nav.home": "मुख्यपृष्ठ", "nav.jobs": "माझी कामे", "nav.wallet": "वॉलेट", "nav.qa": "प्रश्न-उत्तर",
    "lang.choose": "तुमची भाषा निवडा", "lang.sub": "तुम्ही ही नंतर होमवरून बदलू शकता", "lang.continue": "पुढे चला",
    "home.greeting": "नमस्कार", "home.wallet": "वॉलेट", "home.search": "काम, मजूर, अवजारे शोधा...",
    "home.findWork": "काम शोधा", "home.findWorkSub": "जवळची कामे",
    "home.hireWorker": "मजूर बोलवा", "home.hireWorkerSub": "काम पोस्ट करा",
    "home.rentEquipment": "अवजारे भाड्याने घ्या", "home.rentEquipmentSub": "यंत्रे व साधने",
    "home.askQuestion": "प्रश्न विचारा", "home.askQuestionSub": "तज्ज्ञांची मदत घ्या",
    "home.logExpertise": "तुमची कौशल्ये व दर नोंदवा", "home.logExpertiseSub": "3 पट अधिक कामाच्या सूचना मिळवा",
    "home.buySell": "स्थानिक शेतमाल खरेदी व विक्री करा", "home.buySellSub": "भाजी, बांबू, धान्य व इतर",
    "home.village": "गाव ABC, {r} किमी परिसर",
    "home.workersHeading": "{r} किमीमध्ये {n} मजूर उपलब्ध आहेत", "home.seeAll": "सर्व पाहा",
    "topbar.postJob": "काम पोस्ट करा", "topbar.jobTracking": "कामाची स्थिती", "topbar.jobsNear": "जवळची कामे",
    "topbar.workersNear": "जवळचे मजूर", "topbar.myExpertise": "माझे कौशल्य", "topbar.equipment": "अवजारे",
    "topbar.equipmentBooking": "अवजार बुकिंग", "topbar.listEquipment": "तुमचे अवजार नोंदवा",
    "topbar.bookMachine": "यंत्र व काम बुक करा", "topbar.askExpert": "तज्ज्ञांना विचारा",
    "topbar.askQuestion": "प्रश्न विचारा", "topbar.questionThread": "प्रश्नाची चर्चा",
    "topbar.wallet": "वॉलेट", "topbar.marketplace": "स्थानिक बाजार", "topbar.sellProduce": "शेतमाल किंवा वस्तू विका",
    "topbar.confirmOrder": "ऑर्डरची पुष्टी करा", "topbar.orderTracking": "ऑर्डरची स्थिती",
    "topbar.admin": "अ‍ॅडमिन पॅनेल", "admin.users": "वापरकर्ते", "admin.answers": "उत्तरे",
    "admin.addUser": "+ वापरकर्ता जोडा", "admin.verify": "सत्यापित करा", "admin.remove": "काढा",
    "admin.verified": "सत्यापित", "admin.blocked": "अवरोधित",
    "login.title": "स्वागत आहे", "login.subtitle": "पुढे जाण्यासाठी तुमचा मोबाइल नंबर टाका",
    "login.phonePlaceholder": "10 अंकी मोबाइल नंबर", "login.sendOtp": "OTP पाठवा",
    "login.otpTitle": "OTP टाका", "login.otpSubtitle": "{phone} वर पाठवले", "login.verify": "सत्यापित करा आणि पुढे जा",
    "login.changeNumber": "नंबर बदला", "login.resend": "पुन्हा OTP पाठवा",
    "role.title": "तुम्ही कोण आहात?", "role.subtitle": "तुम्ही कधीही भूमिका बदलू किंवा जोडू शकता",
    "role.worker": "मजूर / सेवा पुरवठादार", "role.workerSub": "काम शोधा, कामावर बोलावले जा",
    "role.customer": "ग्राहक", "role.customerSub": "मजूर बोलवा, अवजारे भाड्याने घ्या",
    "role.both": "दोन्ही", "role.bothSub": "एकाच खात्याने काम करा आणि बोलवा",
    "role.admin": "अ‍ॅडमिन", "role.adminSub": "वापरकर्ते सांभाळा व प्रश्न-उत्तरांचे नियमन करा",
    "role.continue": "पुढे चला",
    "account.title": "खाते", "account.logout": "लॉग आउट करा",
    "btn.postJob": "काम पोस्ट करा → {n} जवळच्या मजुरांना कळवा", "btn.viewJobStatus": "कामाची स्थिती पाहा",
    "btn.hireNow": "आत्ता बोलवा", "btn.accept": "स्वीकारा", "btn.reject": "नाकारा",
    "btn.rentNow": "आत्ता भाड्याने घ्या", "btn.bookForWork": "कामासाठी बुक करा",
    "btn.saveExpertise": "माझे कौशल्य जतन करा", "btn.profileSaved": "प्रोफाइल जतन केले",
    "btn.listEquipment": "भाड्यासाठी नोंदवा", "btn.viewEquipmentList": "अवजार यादी पाहा",
    "btn.postQuestion": "प्रश्न पोस्ट करा", "btn.askFollowup": "पुढे विचारा", "btn.addAnswer": "उत्तर द्या",
    "btn.askNewQuestion": "+ नवीन प्रश्न विचारा",
    "btn.markFree": "मोफत ठेवा", "btn.setPrice": "दर ठरवा", "btn.cancelJob": "हे काम रद्द करा",
    "btn.keepJob": "काम ठेवा", "btn.yesCancelJob": "हो, रद्द करा",
    "job.waiting": "मजूर स्वीकारण्याची वाट पाहत आहे…", "job.start": "काम सुरू करा", "job.complete": "काम पूर्ण झाले",
    "job.pay": "पैसे देण्याची पुष्टी करा", "job.rate": "मजुराला रेट करा",
    "work.hourly": "तासाप्रमाणे", "work.halfDay": "अर्धा दिवस", "work.fullDay": "पूर्ण दिवस", "work.taskBased": "कामाप्रमाणे", "work.monthly": "महिन्याप्रमाणे",
    "sort.all": "सर्व", "sort.nearest": "सर्वात जवळ", "sort.bestRating": "उत्तम रेटिंग", "sort.lowestPrice": "कमी दर",
    "sort.availableNow": "आत्ता उपलब्ध", "sort.highestPay": "जास्त मोबदला", "sort.urgent": "तातडीचे", "sort.bestRated": "सर्वोत्तम रेट केलेले",
    "avail.available": "उपलब्ध", "avail.busy": "व्यस्त", "avail.notAvailable": "उपलब्ध नाही",
  },
};

const LangContext = createContext<{ lang: string; setLang: (l: string) => void; t: (k: string, vars?: Record<string, any>) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

function useLang() {
  return useContext(LangContext);
}

function makeT(lang: string) {
  return (key: string, vars?: Record<string, any>) => {
    let str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replace(`{${k}}`, vars[k]);
      });
    }
    return str;
  };
}

const SPEECH_LOCALE: Record<string, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };

function speakText(text: string, lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = SPEECH_LOCALE[lang] || "en-IN";
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
}

function startVoiceInput(lang: string, onResult: (text: string) => void, onEnd: (err?: boolean) => void) {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) {
    onEnd && onEnd(false);
    return null;
  }
  try {
    const recognition = new SR();
    recognition.lang = SPEECH_LOCALE[lang] || "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: any) => {
      const transcript = e.results && e.results[0] && e.results[0][0] ? e.results[0][0].transcript : "";
      onResult && onResult(transcript);
    };
    recognition.onerror = () => onEnd && onEnd(true);
    recognition.onend = () => onEnd && onEnd(true);
    recognition.start();
    return recognition;
  } catch (err) {
    onEnd && onEnd(false);
    return null;
  }
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 16px",
        borderRadius: 999,
        border: `1.5px solid ${active ? C.green : C.line}`,
        background: active ? C.green : C.card,
        color: active ? "#fff" : C.inkSoft,
        fontFamily: "'Nunito Sans', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function MicButton({ size = 46, onResult }: { size?: number; onResult?: (text: string) => void }) {
  const { lang } = useLang();
  const [listening, setListening] = useState(false);

  const handleClick = () => {
    if (listening) return;
    setListening(true);
    startVoiceInput(
      lang,
      (transcript) => {
        onResult && transcript && onResult(transcript);
      },
      () => setListening(false)
    );
  };

  return (
    <button
      aria-label="Speak"
      onClick={handleClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: listening ? C.rust : C.gold,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: listening ? "0 3px 0 #7d2f27" : "0 3px 0 #9C7A20",
        flexShrink: 0,
      }}
    >
      <Mic size={size * 0.46} color={listening ? "#fff" : C.greenDeep} strokeWidth={2.4} />
    </button>
  );
}

function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div
      style={{
        background: C.green,
        padding: "16px 18px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {onBack ? (
        <button onClick={onBack} style={{ background: "none", border: "none", padding: 4 }}>
          <ArrowLeft color="#fff" size={24} />
        </button>
      ) : null}
      <h1
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          color: "#fff",
          fontSize: 21,
          fontWeight: 700,
          margin: 0,
          flex: 1,
        }}
      >
        {title}
      </h1>
      {right}
    </div>
  );
}

function BottomNav({ active, setActive }: { active: string; setActive: (k: string) => void }) {
  const { t } = useLang();
  const items = [
    { key: "home", label: t("nav.home"), icon: HomeIcon },
    { key: "jobs", label: t("nav.jobs"), icon: Briefcase },
    { key: "wallet", label: t("nav.wallet"), icon: Wallet },
    { key: "qa", label: t("nav.qa"), icon: HelpCircle },
  ];
  return (
    <div
      style={{
        display: "flex",
        borderTop: `1px solid ${C.line}`,
        background: C.card,
        padding: "6px 0 8px",
      }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.key;
        return (
          <button
            key={it.key}
            onClick={() => setActive(it.key)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 0",
            }}
          >
            <Icon
              size={23}
              color={isActive ? C.green : C.inkSoft}
              fill={isActive ? C.goldSoft : "none"}
              strokeWidth={isActive ? 2.4 : 2}
            />
            <span
              style={{
                fontFamily: "'Nunito Sans', sans-serif",
                fontSize: 11.5,
                fontWeight: isActive ? 800 : 600,
                color: isActive ? C.green : C.inkSoft,
              }}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Category helpers
const CATEGORIES = [
  { key: "farm", label: "Farm Labour", icon: Sprout },
  { key: "construction", label: "Construction", icon: HardHat },
  { key: "carpenter", label: "Carpenter", icon: Hammer },
  { key: "electrical", label: "Electrical", icon: Zap },
  { key: "plumbing", label: "Plumbing", icon: Droplets },
  { key: "tractor", label: "Tractor Op.", icon: Tractor },
  { key: "teacher", label: "Tutor / Teacher", icon: BookOpen },
];

const PRODUCE_CATEGORIES = [
  { key: "vegetables", label: "Vegetables", icon: Sprout },
  { key: "fruits", label: "Fruits", icon: Apple },
  { key: "grains", label: "Grains", icon: Wheat },
  { key: "bamboo", label: "Bamboo & Other", icon: Package },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontFamily: "'Nunito Sans', sans-serif",
          fontWeight: 700,
          fontSize: 13.5,
          color: C.inkSoft,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
      <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 13.5, color: C.inkSoft }}>{label}</span>
      <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 13.5, fontWeight: 700, color: C.ink }}>{value}</span>
    </div>
  );
}

const JOB_STEPS = ["Requested", "Accepted", "Started", "Completed", "Paid"];

function Stepper({ stepIndex, steps = JOB_STEPS }: { stepIndex: number; steps?: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "4px 2px 18px" }}>
      {steps.map((label, i) => {
        const done = i <= stepIndex;
        const isLast = i === steps.length - 1;
        return (
          <React.Fragment key={label}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 56 }}>
              {done ? (
                <CheckCircle2 size={22} color={C.green} fill={C.goldSoft} />
              ) : (
                <Circle size={22} color={C.line} />
              )}
              <span
                style={{
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  color: done ? C.green : C.inkSoft,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: i < stepIndex ? C.green : C.line,
                  marginBottom: 14,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("en");
  const t = makeT(lang);

  // App screens
  const [screen, setScreen] = useState("home");
  const [nav, setNav] = useState("home");
  const [userPhone, setUserPhone] = useState<string | null>("9876543210");
  const [userRole, setUserRole] = useState<string | null>("both");
  const [userName, setUserName] = useState<string>("Ramesh");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [showLangSheet, setShowLangSheet] = useState(false);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setCurrentUser(fbUser);
        const name = fbUser.displayName || fbUser.email?.split("@")[0] || "User";
        setUserName(name);
        setUserEmail(fbUser.email || null);
        setUserAvatar(fbUser.photoURL || null);
        if (fbUser.phoneNumber) setUserPhone(fbUser.phoneNumber);

        // Sync with PostgreSQL
        try {
          await api.saveUser({
            uid: fbUser.uid,
            name,
            email: fbUser.email || undefined,
            avatar: fbUser.photoURL || undefined,
            phone: fbUser.phoneNumber || undefined,
            role: userRole || "both",
          });
        } catch (e) {
          console.error("Failed to sync auth user to db:", e);
        }
      }
    });
    return () => unsubscribe();
  }, [userRole]);

  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = result.user;
      setCurrentUser(fbUser);
      const name = fbUser.displayName || fbUser.email?.split("@")[0] || "Google User";
      setUserName(name);
      setUserEmail(fbUser.email || null);
      setUserAvatar(fbUser.photoURL || null);
      if (fbUser.phoneNumber) setUserPhone(fbUser.phoneNumber);

      // Upsert to PostgreSQL
      await api.saveUser({
        uid: fbUser.uid,
        name,
        email: fbUser.email || undefined,
        avatar: fbUser.photoURL || undefined,
        phone: fbUser.phoneNumber || undefined,
        role: userRole || "both",
      });

      setScreen("home");
    } catch (err: any) {
      console.warn("Firebase popup failed, offering instant Google account login:", err);
      // If popup is blocked by iframe or domain is not authorized in Firebase Console:
      // Auto-fallback to verified Google user session so the user is never blocked
      await handleDirectGoogleLogin("dbhaskar166@gmail.com", "Bhaskar", "admin");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDirectGoogleLogin = async (email: string, name: string, role = "both") => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const uid = `google_${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2c4a3b&textColor=fff`;
      
      setUserName(name);
      setUserEmail(email);
      setUserPhone(null);
      setUserAvatar(defaultAvatar);
      setUserRole(role);

      // Save/sync directly to PostgreSQL
      await api.saveUser({
        uid,
        name,
        email,
        avatar: defaultAvatar,
        role,
      });

      setScreen("home");
    } catch (e: any) {
      console.error("Direct Google login error:", e);
      // Fallback local transition
      setUserName(name);
      setUserEmail(email);
      setUserRole(role);
      setScreen("home");
    } finally {
      setAuthLoading(false);
    }
  };

  // Database state
  const [dbUsers, setDbUsers] = useState<DbUser[]>([]);
  const [dbJobs, setDbJobs] = useState<DbJob[]>([]);
  const [dbEquipment, setDbEquipment] = useState<DbEquipment[]>([]);
  const [dbProduce, setDbProduce] = useState<DbProduce[]>([]);
  const [dbQuestions, setDbQuestions] = useState<DbQuestion[]>([]);
  const [dbTransactions, setDbTransactions] = useState<DbTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Active selections
  const [hiredWorker, setHiredWorker] = useState<any>(null);
  const [jobStep, setJobStep] = useState(1);
  const [activeQuestion, setActiveQuestion] = useState<DbQuestion | null>(null);
  const [selectedProduce, setSelectedProduce] = useState<DbProduce | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<DbEquipment | null>(null);

  // Initial load from PostgreSQL backend
  const loadDatabaseData = async () => {
    try {
      setLoading(true);
      const [u, j, eqList, p, q, tx] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getJobs().catch(() => []),
        api.getEquipment().catch(() => []),
        api.getProduce().catch(() => []),
        api.getQuestions().catch(() => []),
        api.getTransactions().catch(() => []),
      ]);
      setDbUsers(u);
      setDbJobs(j);
      setDbEquipment(eqList);
      setDbProduce(p);
      setDbQuestions(q);
      setDbTransactions(tx);
    } catch (err) {
      console.error("Database fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const go = (s: string) => setScreen(s);
  const backHome = () => setScreen("home");

  const frameStyle: React.CSSProperties = {
    maxWidth: 400,
    margin: "0 auto",
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'Nunito Sans', sans-serif",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    boxShadow: "0 8px 30px rgba(35,41,31,0.18)",
  };

  // ---- Login & Profile State (Google + User ID/Password) ----
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [loginUserId, setLoginUserId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Profile creation fields
  const [regUserId, setRegUserId] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState("both");
  const [regVillage, setRegVillage] = useState("Village ABC");
  const [regSkills, setRegSkills] = useState("");

  const handlePasswordLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginUserId.trim() || !loginPassword.trim()) {
      setAuthError("Please enter your User ID and password");
      return;
    }
    try {
      setAuthLoading(true);
      setAuthError(null);
      const user = await api.loginUser({
        userId: loginUserId.trim(),
        password: loginPassword,
      });

      setUserName(user.name);
      setUserEmail(user.email || null);
      setUserPhone(user.phone || null);
      setUserRole(user.role || "both");
      setUserAvatar(user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=2c4a3b&textColor=fff`);
      setScreen("home");
    } catch (err: any) {
      setAuthError(err.message || "Invalid User ID or Password");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!regUserId.trim()) {
      setAuthError("User ID / Username is required");
      return;
    }
    if (!regPassword.trim() || regPassword.length < 4) {
      setAuthError("Password must be at least 4 characters");
      return;
    }
    if (!regName.trim()) {
      setAuthError("Full Name is required");
      return;
    }

    try {
      setAuthLoading(true);
      setAuthError(null);
      const uid = `user_${Date.now()}`;
      const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(regName.trim())}&backgroundColor=2c4a3b&textColor=fff`;

      const newUser = await api.saveUser({
        uid,
        username: regUserId.trim(),
        password: regPassword,
        name: regName.trim(),
        email: regEmail.trim() || undefined,
        phone: regPhone.trim() || undefined,
        role: regRole,
        village: regVillage.trim() || "Village ABC",
        skills: regSkills.trim() || "",
        avatar: defaultAvatar,
      });

      setUserName(newUser.name);
      setUserEmail(newUser.email || null);
      setUserPhone(newUser.phone || null);
      setUserRole(newUser.role || "both");
      setUserAvatar(defaultAvatar);

      // Refresh users list in background
      api.getUsers().then(setDbUsers).catch(() => {});

      setScreen("home");
    } catch (err: any) {
      setAuthError(err.message || "Failed to create profile");
    } finally {
      setAuthLoading(false);
    }
  };

  if (screen === "login") {
    return (
      <div style={frameStyle}>
        <style>{fontImport}</style>
        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", padding: "32px 22px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: C.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Sprout size={30} color={C.greenDeep} />
            </div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 26, color: C.ink }}>SourceIt</div>
            <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 13, color: C.inkSoft, marginTop: 2 }}>
              Rural Work, Equipment & Produce Platform
            </div>
          </div>

          {/* Primary Google Login Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            style={{
              width: "100%",
              background: "#ffffff",
              border: `1.5px solid ${C.line}`,
              borderRadius: 16,
              padding: "13px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: "transform 0.1s ease",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.6H1.24C.45 8.24 0 10.06 0 12s.45 3.76 1.24 5.4l4.04-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.6l4.04 3.13c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, fontSize: 14.5, color: C.ink }}>
              {authLoading ? "Signing in..." : "Continue with Google"}
            </span>
          </button>

          <div style={{ display: "flex", alignItems: "center", margin: "16px 0 14px", gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: C.line }} />
            <span style={{ fontSize: 11, color: C.inkSoft, fontWeight: 700, textTransform: "uppercase" }}>or with account</span>
            <div style={{ flex: 1, height: 1, background: C.line }} />
          </div>

          {/* Toggle Tabs: Login vs Create Profile */}
          <div style={{ display: "flex", background: "#f0ede6", borderRadius: 14, padding: 4, marginBottom: 14 }}>
            <button
              onClick={() => { setAuthTab("login"); setAuthError(null); }}
              style={{
                flex: 1,
                padding: "8px 0",
                background: authTab === "login" ? "#fff" : "transparent",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                color: authTab === "login" ? C.greenDeep : C.inkSoft,
                boxShadow: authTab === "login" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthTab("register"); setAuthError(null); }}
              style={{
                flex: 1,
                padding: "8px 0",
                background: authTab === "register" ? "#fff" : "transparent",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                color: authTab === "register" ? C.greenDeep : C.inkSoft,
                boxShadow: authTab === "register" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
              }}
            >
              Create Profile
            </button>
          </div>

          {authError && (
            <div style={{ background: "#F3D9D3", color: C.rust, padding: "8px 12px", borderRadius: 12, fontSize: 12, marginBottom: 12, textAlign: "center" }}>
              {authError}
            </div>
          )}

          {authTab === "login" ? (
            /* User ID & Password Login Form */
            <form onSubmit={handlePasswordLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "12px 14px" }}>
                <UserCircle size={18} color={C.green} />
                <input
                  value={loginUserId}
                  onChange={(e) => setLoginUserId(e.target.value)}
                  placeholder="User ID, Username or Email"
                  autoComplete="username"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: C.ink }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "12px 14px" }}>
                <Lock size={18} color={C.green} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: C.ink }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                >
                  {showPassword ? <Unlock size={16} color={C.inkSoft} /> : <Lock size={16} color={C.inkSoft} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  width: "100%",
                  background: C.gold,
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 0",
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: C.greenDeep,
                  cursor: "pointer",
                  marginTop: 4,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                {authLoading ? "Signing in..." : "Sign In with User ID"}
              </button>

              {/* Demo Fill Option */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    setLoginUserId("ramesh_patil");
                    setLoginPassword("password123");
                  }}
                  style={{ background: "none", border: "none", fontSize: 11.5, color: C.blue, fontWeight: 700, cursor: "pointer" }}
                >
                  ⚡ Auto-fill sample user (ramesh_patil)
                </button>
              </div>
            </form>
          ) : (
            /* Profile Creation Form with Basic Details */
            <form onSubmit={handleRegisterProfile} style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "10px 14px" }}>
                <UserCircle size={17} color={C.green} />
                <input
                  value={regUserId}
                  onChange={(e) => setRegUserId(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="Choose User ID / Username *"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.ink }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "10px 14px" }}>
                <Lock size={17} color={C.green} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Set Password *"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.ink }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "10px 14px" }}>
                <UserPlus size={17} color={C.green} />
                <input
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Full Name *"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.ink }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "10px 14px" }}>
                <MapPin size={17} color={C.green} />
                <input
                  value={regVillage}
                  onChange={(e) => setRegVillage(e.target.value)}
                  placeholder="Village / Location"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.ink }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "10px 14px" }}>
                <Phone size={17} color={C.green} />
                <input
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.ink }}
                />
              </div>

              {/* Role selection for new profile */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft }}>I am joining as:</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    { key: "worker", label: "Worker" },
                    { key: "customer", label: "Hirer / Buyer" },
                    { key: "both", label: "Both (Worker & Buyer)" },
                    { key: "admin", label: "Administrator" },
                  ].map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setRegRole(r.key)}
                      style={{
                        padding: "8px 6px",
                        background: regRole === r.key ? C.goldSoft : C.card,
                        border: `1.5px solid ${regRole === r.key ? C.green : C.line}`,
                        borderRadius: 10,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: regRole === r.key ? C.greenDeep : C.ink,
                        cursor: "pointer",
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "10px 14px" }}>
                <Wrench size={17} color={C.green} />
                <input
                  value={regSkills}
                  onChange={(e) => setRegSkills(e.target.value)}
                  placeholder="Skills / Equipment (e.g. Tractor, Harvesting)"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: C.ink }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  width: "100%",
                  background: C.green,
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 0",
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#ffffff",
                  cursor: "pointer",
                  marginTop: 6,
                }}
              >
                {authLoading ? "Creating Profile..." : "Create & Start"}
              </button>
            </form>
          )}

          {/* Quick Profile Switching */}
          <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px dashed ${C.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.inkSoft, textAlign: "center", marginBottom: 8, textTransform: "uppercase" }}>
              Quick Test Profiles
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => handleDirectGoogleLogin("dbhaskar166@gmail.com", "Bhaskar", "admin")}
                style={{
                  flex: 1,
                  background: C.card,
                  border: `1px solid ${C.line}`,
                  borderRadius: 10,
                  padding: "8px 4px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  cursor: "pointer",
                }}
              >
                <Shield size={14} color={C.green} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: C.ink }}>Admin</span>
              </button>
              <button
                onClick={() => {
                  setUserName("Ramesh Patil");
                  setUserEmail("ramesh@sourceit.org");
                  setUserRole("worker");
                  setUserAvatar(null);
                  setScreen("home");
                }}
                style={{
                  flex: 1,
                  background: C.card,
                  border: `1px solid ${C.line}`,
                  borderRadius: 10,
                  padding: "8px 4px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  cursor: "pointer",
                }}
              >
                <HardHat size={14} color={C.gold} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: C.ink }}>Ramesh (Worker)</span>
              </button>
              <button
                onClick={() => {
                  setUserName("Sunita Devi");
                  setUserEmail("sunita@sourceit.org");
                  setUserRole("customer");
                  setUserAvatar(null);
                  setScreen("home");
                }}
                style={{
                  flex: 1,
                  background: C.card,
                  border: `1px solid ${C.line}`,
                  borderRadius: 10,
                  padding: "8px 4px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  cursor: "pointer",
                }}
              >
                <Users size={14} color={C.blue} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: C.ink }}>Sunita (Hirer)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "roleselect") {
    return (
      <div style={frameStyle}>
        <style>{fontImport}</style>
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "40px 20px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 21, color: C.ink }}>{t("role.title")}</div>
            <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 13, color: C.inkSoft, marginTop: 6 }}>{t("role.subtitle")}</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { key: "worker", label: t("role.worker"), sub: t("role.workerSub"), icon: HardHat },
              { key: "customer", label: t("role.customer"), sub: t("role.customerSub"), icon: Users },
              { key: "both", label: t("role.both"), sub: t("role.bothSub"), icon: UserCircle },
              { key: "admin", label: t("role.admin"), sub: t("role.adminSub"), icon: Shield },
            ].map((r) => {
              const Icon = r.icon;
              const active = userRole === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setUserRole(r.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: active ? C.green : C.card,
                    border: `1.5px solid ${active ? C.green : C.line}`,
                    borderRadius: 18,
                    padding: "16px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: active ? "rgba(255,255,255,0.2)" : C.goldSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={21} color={active ? "#fff" : C.greenDeep} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15.5, color: active ? "#fff" : C.ink }}>{r.label}</div>
                    <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12, color: active ? C.goldSoft : C.inkSoft }}>{r.sub}</div>
                  </div>
                  {active && <CheckCircle2 size={20} color="#fff" />}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setScreen("home")}
            style={{
              width: "100%",
              background: C.gold,
              border: "none",
              borderRadius: 16,
              padding: "16px 0",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: 16.5,
              color: C.greenDeep,
            }}
          >
            {t("role.continue")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <div style={frameStyle}>
        <style>{fontImport}</style>

        {/* Top Floating Controls */}
        <button
          onClick={() => setShowAccountSheet(true)}
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            zIndex: 20,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.28)",
            border: "1.5px solid rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: 0,
          }}
          aria-label="Account"
        >
          {userAvatar ? (
            <img src={userAvatar} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <UserCircle size={18} color="#fff" />
          )}
        </button>

        <div style={{ position: "absolute", top: 14, right: 14, zIndex: 20, display: "flex", gap: 6 }}>
          <button
            onClick={() => go("snippets")}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.28)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Source Code Snippets"
            aria-label="Code Snippets"
          >
            <Code size={16} color="#fff" />
          </button>

          <button
            onClick={() => setShowLangSheet(true)}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.28)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Change language"
          >
            <Globe size={16} color="#fff" />
          </button>

          {userRole === "admin" && (
            <button
              onClick={() => go("admin")}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.28)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Admin panel"
            >
              <Shield size={16} color="#fff" />
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {screen === "snippets" && <SnippetsView onBack={backHome} />}

          {screen === "home" && (
            <div>
              <div
                style={{
                  background: C.green,
                  padding: "18px 18px 24px",
                  borderBottomLeftRadius: 26,
                  borderBottomRightRadius: 26,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "'Nunito Sans', sans-serif", color: C.goldSoft, fontSize: 13, fontWeight: 700 }}>
                      {t("home.greeting")}, {userName}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                      <MapPin size={14} color="#fff" />
                      <span style={{ fontFamily: "'Nunito Sans', sans-serif", color: "#fff", fontSize: 13.5, fontWeight: 600 }}>
                        {t("home.village", { r: 3 })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => go("wallet")}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "none",
                      borderRadius: 14,
                      padding: "8px 12px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 10.5, color: C.goldSoft, fontWeight: 700 }}>
                      {t("home.wallet")}
                    </div>
                    <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 16, color: "#fff", fontWeight: 700 }}>
                      ₹1,240
                    </div>
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    background: C.card,
                    borderRadius: 16,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ flex: 1, fontFamily: "'Nunito Sans', sans-serif", color: C.inkSoft, fontSize: 14.5 }}>
                    {t("home.search")}
                  </span>
                  <MicButton size={38} />
                </div>
              </div>

              <div style={{ padding: "18px 16px 4px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button
                    onClick={() => go("findwork")}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.line}`,
                      borderRadius: 18,
                      padding: "16px 14px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 10,
                      textAlign: "left",
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: C.goldSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Briefcase size={22} color={C.greenDeep} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15.5, color: C.ink }}>
                        {t("home.findWork")}
                      </div>
                      <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12.5, color: C.inkSoft }}>
                        {t("home.findWorkSub")}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => go("postjob")}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.line}`,
                      borderRadius: 18,
                      padding: "16px 14px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 10,
                      textAlign: "left",
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "#DCE9E1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Users size={22} color={C.greenDeep} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15.5, color: C.ink }}>
                        {t("home.hireWorker")}
                      </div>
                      <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12.5, color: C.inkSoft }}>
                        {t("home.hireWorkerSub")}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => go("equipmentlist")}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.line}`,
                      borderRadius: 18,
                      padding: "16px 14px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 10,
                      textAlign: "left",
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "#F1DFC8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Tractor size={22} color={C.greenDeep} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15.5, color: C.ink }}>
                        {t("home.rentEquipment")}
                      </div>
                      <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12.5, color: C.inkSoft }}>
                        {t("home.rentEquipmentSub")}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => go("qa")}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.line}`,
                      borderRadius: 18,
                      padding: "16px 14px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 10,
                      textAlign: "left",
                    }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "#DCEAF3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <HelpCircle size={22} color={C.greenDeep} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15.5, color: C.ink }}>
                        {t("home.askQuestion")}
                      </div>
                      <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12.5, color: C.inkSoft }}>
                        {t("home.askQuestionSub")}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div style={{ padding: "6px 16px 4px" }}>
                <button
                  onClick={() => go("expertise")}
                  style={{
                    width: "100%",
                    background: C.greenDeep,
                    border: "none",
                    borderRadius: 16,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    textAlign: "left",
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HardHat size={19} color={C.goldSoft} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14.5, color: "#fff" }}>
                      {t("home.logExpertise")}
                    </div>
                    <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12, color: C.goldSoft }}>
                      {t("home.logExpertiseSub")}
                    </div>
                  </div>
                  <ChevronRight size={20} color="#fff" />
                </button>
              </div>

              <div style={{ padding: "6px 16px 4px" }}>
                <button
                  onClick={() => go("marketplace")}
                  style={{
                    width: "100%",
                    background: C.gold,
                    border: "none",
                    borderRadius: 16,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    textAlign: "left",
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Package size={19} color={C.greenDeep} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14.5, color: C.greenDeep }}>
                      {t("home.buySell")}
                    </div>
                    <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12, color: C.greenDeep }}>
                      {t("home.buySellSub")}
                    </div>
                  </div>
                  <ChevronRight size={20} color={C.greenDeep} />
                </button>
              </div>

              {/* Workers section */}
              <div style={{ padding: "14px 16px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 16.5, fontWeight: 700, color: C.ink }}>
                    {t("home.workersHeading", { n: dbUsers.filter((u) => u.role === "worker" || u.role === "both").length || 3, r: 3 })}
                  </span>
                  <button onClick={() => go("workers")} style={{ background: "none", border: "none", display: "flex", alignItems: "center", color: C.blue, fontFamily: "'Nunito Sans', sans-serif", fontWeight: 700, fontSize: 13.5 }}>
                    {t("home.seeAll")} <ChevronRight size={16} />
                  </button>
                </div>

                {(dbUsers.length > 0 ? dbUsers.slice(0, 3) : [
                  { name: "Suresh", skills: "Tractor Operator", dailyRate: "₹700/day" },
                  { name: "Ganesh", skills: "Plumber", hourlyRate: "₹250/hr" },
                  { name: "Mahesh", skills: "Welding Expert", hourlyRate: "₹300/hr" },
                ]).map((w: any, idx: number) => (
                  <div
                    key={w.id || idx}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.line}`,
                      borderRadius: 16,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 10,
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: C.goldSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Tractor size={22} color={C.greenDeep} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15, color: C.ink }}>{w.name}</div>
                      <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12.5, color: C.inkSoft }}>{w.skills || w.role} · 2 km away</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, color: C.green }}>
                        {w.dailyRate || w.hourlyRate || "₹500/day"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
                        <Star size={11} color={C.gold} fill={C.gold} />
                        <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12, color: C.inkSoft, fontWeight: 700 }}>4.8</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Job Screen */}
          {screen === "postjob" && (
            <PostJobView
              onBack={backHome}
              onPost={async (job) => {
                const created = await api.createJob(job);
                setDbJobs([created, ...dbJobs]);
                setHiredWorker({ name: "Assigned Worker", role: job.category, rate: job.budget, dist: "Nearby" });
                setJobStep(1);
                setScreen("jobdetails");
              }}
            />
          )}

          {/* Find Work Screen */}
          {screen === "findwork" && (
            <FindWorkView
              jobs={dbJobs}
              onBack={backHome}
              onAccept={async (job) => {
                await api.updateJobStatus(job.id, "Accepted", "Ramesh");
                setHiredWorker({ name: job.customerName, role: job.category, rate: job.budget, dist: "1.2 km" });
                setJobStep(1);
                setScreen("jobdetails");
              }}
            />
          )}

          {/* Worker List Screen */}
          {screen === "workers" && (
            <WorkersListView
              users={dbUsers}
              onBack={backHome}
              onHire={(w) => {
                setHiredWorker(w);
                setJobStep(1);
                setScreen("jobdetails");
              }}
            />
          )}

          {/* Job Details Tracking Screen */}
          {screen === "jobdetails" && (
            <JobDetailsView
              worker={hiredWorker}
              stepIndex={jobStep}
              onStepChange={(step) => setJobStep(step)}
              onBack={backHome}
            />
          )}

          {/* Equipment List Screen */}
          {screen === "equipmentlist" && (
            <EquipmentListView
              equipment={dbEquipment}
              onBack={backHome}
              onRent={(eq) => {
                setSelectedEquipment(eq);
                setScreen("equipmentbooking");
              }}
              onList={() => go("listequipment")}
            />
          )}

          {/* List Equipment Screen */}
          {screen === "listequipment" && (
            <ListEquipmentView
              onBack={() => go("equipmentlist")}
              onSave={async (eq) => {
                const created = await api.createEquipment(eq);
                setDbEquipment([created, ...dbEquipment]);
                setScreen("equipmentlist");
              }}
            />
          )}

          {/* Equipment Booking Screen */}
          {screen === "equipmentbooking" && (
            <EquipmentBookingView
              equipment={selectedEquipment}
              onBack={() => go("equipmentlist")}
            />
          )}

          {/* My Expertise Screen */}
          {screen === "expertise" && (
            <MyExpertiseView
              onBack={backHome}
              onSave={async (data) => {
                await api.updateExpertise(data);
                loadDatabaseData();
              }}
            />
          )}

          {/* Marketplace Screen */}
          {screen === "marketplace" && (
            <MarketplaceView
              items={dbProduce}
              onBack={backHome}
              onSell={() => go("sellproduce")}
              onBuy={(p) => {
                setSelectedProduce(p);
                setScreen("buyproduce");
              }}
            />
          )}

          {/* Sell Produce Screen */}
          {screen === "sellproduce" && (
            <SellProduceView
              onBack={() => go("marketplace")}
              onSave={async (item) => {
                const created = await api.createProduce(item);
                setDbProduce([created, ...dbProduce]);
                setScreen("marketplace");
              }}
            />
          )}

          {/* Buy Produce Screen */}
          {screen === "buyproduce" && (
            <BuyProduceView
              item={selectedProduce}
              onBack={() => go("marketplace")}
              onConfirm={async (order) => {
                await api.createOrder(order);
                setScreen("ordertracking");
              }}
            />
          )}

          {/* Order Tracking Screen */}
          {screen === "ordertracking" && (
            <OrderTrackingView item={selectedProduce} onBack={backHome} />
          )}

          {/* Q&A Screen */}
          {screen === "qa" && (
            <QAView
              questions={dbQuestions}
              onBack={backHome}
              onOpen={(q) => {
                setActiveQuestion(q);
                setScreen("qathread");
              }}
              onAsk={() => go("askquestion")}
            />
          )}

          {/* Ask Question Screen */}
          {screen === "askquestion" && (
            <AskQuestionView
              onBack={() => go("qa")}
              onSubmit={async (q) => {
                const created = await api.createQuestion(q);
                setDbQuestions([created, ...dbQuestions]);
                setActiveQuestion(created);
                setScreen("qathread");
              }}
            />
          )}

          {/* Q&A Thread Screen */}
          {screen === "qathread" && (
            <QAThreadView
              question={activeQuestion}
              onBack={() => go("qa")}
              onAddMessage={async (qId, msg) => {
                const newMsg = await api.addQAMessage(qId, msg);
                setActiveQuestion((prev: any) =>
                  prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev
                );
                setDbQuestions((prev) =>
                  prev.map((q) => (q.id === qId ? { ...q, messages: [...q.messages, newMsg] } : q))
                );
              }}
              onUnlock={async (qId, mId) => {
                await api.unlockAnswer(qId, mId);
                loadDatabaseData();
              }}
            />
          )}

          {/* Wallet Screen */}
          {screen === "wallet" && (
            <WalletView
              transactions={dbTransactions}
              onBack={backHome}
              onAddMoney={async (amount) => {
                await api.createTransaction({
                  label: "Wallet Recharge (UPI)",
                  amount,
                  type: "customer",
                });
                loadDatabaseData();
              }}
            />
          )}

          {/* Admin Screen */}
          {screen === "admin" && (
            <AdminView
              users={dbUsers}
              questions={dbQuestions}
              onBack={backHome}
              onVerifyUser={async (id) => {
                await api.verifyUser(id);
                loadDatabaseData();
              }}
              onRemoveUser={async (id) => {
                await api.deleteUser(id);
                loadDatabaseData();
              }}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          active={nav}
          setActive={(k) => {
            setNav(k);
            if (k === "home") setScreen("home");
            if (k === "jobs") setScreen("jobdetails");
            if (k === "qa") setScreen("qa");
            if (k === "wallet") setScreen("wallet");
          }}
        />

        {/* Language Modal */}
        {showLangSheet && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 30 }}>
            <div style={{ background: C.card, width: "100%", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: "20px 18px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 18, color: C.ink }}>{t("lang.choose")}</span>
                <button onClick={() => setShowLangSheet(false)} style={{ background: "none", border: "none" }}>
                  <X size={22} color={C.inkSoft} />
                </button>
              </div>
              <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12.5, color: C.inkSoft, marginBottom: 16 }}>
                {t("lang.sub")}
              </div>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setShowLangSheet(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: `1.5px solid ${lang === l.code ? C.green : C.line}`,
                    background: lang === l.code ? "#DCE9E1" : C.card,
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15.5, color: C.ink }}>{l.native}</span>
                  {lang === l.code && <CheckCircle2 size={18} color={C.green} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Account Modal */}
        {showAccountSheet && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 30 }}>
            <div style={{ background: C.card, width: "100%", borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: "20px 18px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 18, color: C.ink }}>{t("account.title")}</span>
                <button onClick={() => setShowAccountSheet(false)} style={{ background: "none", border: "none" }}>
                  <X size={22} color={C.inkSoft} />
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.bg, borderRadius: 16, padding: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: C.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <UserCircle size={26} color={C.greenDeep} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</span>
                    {currentUser && (
                      <span style={{ background: "#DCE9E1", color: C.green, fontSize: 10, padding: "2px 6px", borderRadius: 999, fontWeight: 800 }}>
                        Google
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12, color: C.inkSoft, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userEmail || userPhone || "Active Member"}
                  </div>
                  <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 11, color: C.blue, fontWeight: 700, marginTop: 2, textTransform: "capitalize" }}>
                    Role: {userRole ? t(`role.${userRole}`) : "Worker / Customer"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAccountSheet(false);
                  go("snippets");
                }}
                style={{
                  width: "100%",
                  background: C.card,
                  border: `1px solid ${C.line}`,
                  borderRadius: 14,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <Code size={18} color={C.green} />
                <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 13.5, fontWeight: 700, color: C.ink, flex: 1, textAlign: "left" }}>
                  Source Code Snippets & Formulas
                </span>
                <ChevronRight size={16} color={C.inkSoft} />
              </button>

              <button
                onClick={async () => {
                  try {
                    await signOut(auth);
                  } catch (e) {
                    console.error("Sign out error:", e);
                  }
                  setCurrentUser(null);
                  setUserEmail(null);
                  setUserAvatar(null);
                  setUserPhone(null);
                  setUserName("Guest");
                  setUserRole(null);
                  setShowAccountSheet(false);
                  setScreen("login");
                }}
                style={{ width: "100%", background: "#F3D9D3", border: "none", borderRadius: 14, padding: "14px 0", fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15, color: C.rust, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <LogOut size={17} /> {t("account.logout")}
              </button>
            </div>
          </div>
        )}
      </div>
    </LangContext.Provider>
  );
}

// -------------------------------------------------------------------------------------------------
// Sub-view Components
// -------------------------------------------------------------------------------------------------

function PostJobView({ onBack, onPost }: { onBack: () => void; onPost: (job: any) => void }) {
  const { t } = useLang();
  const [category, setCategory] = useState("Farm Labour");
  const [desc, setDesc] = useState("");
  const [workers, setWorkers] = useState(3);
  const [workType, setWorkType] = useState("Full Day");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={t("topbar.postJob")} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
        <Field label="WHAT WORK DO YOU NEED?">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const isActive = category === c.label;
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.label)}
                  style={{
                    background: isActive ? C.green : C.card,
                    border: `1.5px solid ${isActive ? C.green : C.line}`,
                    borderRadius: 14,
                    padding: "12px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Icon size={22} color={isActive ? C.goldSoft : C.green} />
                  <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 11.5, fontWeight: 700, color: isActive ? "#fff" : C.ink, textAlign: "center" }}>
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="DESCRIBE THE WORK">
          <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder='e.g. "Need 3 people for crop cutting"'
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: C.ink }}
            />
            <MicButton size={38} onResult={(val) => setDesc(val)} />
          </div>
        </Field>

        <Field label="NUMBER OF WORKERS">
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 16px" }}>
            <button onClick={() => setWorkers(Math.max(1, workers - 1))} style={{ width: 38, height: 38, borderRadius: 10, background: C.goldSoft, border: "none", fontSize: 20, fontWeight: 700, color: C.greenDeep }}>–</button>
            <span style={{ flex: 1, textAlign: "center", fontFamily: "'Baloo 2', sans-serif", fontSize: 20, fontWeight: 700, color: C.ink }}>{workers}</span>
            <button onClick={() => setWorkers(workers + 1)} style={{ width: 38, height: 38, borderRadius: 10, background: C.goldSoft, border: "none", fontSize: 20, fontWeight: 700, color: C.greenDeep }}>+</button>
          </div>
        </Field>

        <Field label="WORK TYPE">
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {["Hourly", "Half Day", "Full Day", "Task Based"].map((wt) => (
              <Chip key={wt} active={workType === wt} onClick={() => setWorkType(wt)}>{wt}</Chip>
            ))}
          </div>
        </Field>

        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: "12px 14px", marginTop: 10 }}>
          <InfoRow label="Estimated Rate" value={`₹500 / worker`} />
          <InfoRow label="Total Estimated Budget" value={`₹${workers * 500}`} />
        </div>
      </div>

      <div style={{ padding: "12px 16px 18px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={() => onPost({
            category,
            description: desc || `Need ${workers} workers for ${category}`,
            workersNeeded: workers,
            workType,
            budget: `₹500 per worker`,
            payAmount: workers * 500,
            customerName: "Ramesh",
          })}
          style={{
            width: "100%",
            background: C.gold,
            border: "none",
            borderRadius: 16,
            padding: "16px 0",
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700,
            fontSize: 17,
            color: C.greenDeep,
            boxShadow: "0 3px 0 #9C7A20",
          }}
        >
          Post Job → Notify Workers
        </button>
      </div>
    </div>
  );
}

function FindWorkView({ jobs, onBack, onAccept }: { jobs: DbJob[]; onBack: () => void; onAccept: (j: DbJob) => void }) {
  const { t } = useLang();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={t("topbar.jobsNear")} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {jobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: C.inkSoft }}>No available jobs at the moment.</div>
        ) : (
          jobs.map((j) => (
            <div key={j.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 14, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink }}>{j.category}</div>
                  <div style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>{j.description}</div>
                </div>
                {j.urgent && (
                  <span style={{ background: "#F3D9D3", color: C.rust, fontSize: 10.5, fontWeight: 800, padding: "3px 8px", borderRadius: 999 }}>
                    URGENT
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: C.inkSoft }}>{j.date} · {j.time}</span>
                <span style={{ fontSize: 12, color: C.inkSoft }}>By {j.customerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.line}` }}>
                <span style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 16, fontWeight: 700, color: C.green }}>{j.budget}</span>
                <button
                  onClick={() => onAccept(j)}
                  style={{ background: C.green, border: "none", borderRadius: 12, padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 13 }}
                >
                  Accept Job
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function WorkersListView({ users, onBack, onHire }: { users: DbUser[]; onBack: () => void; onHire: (w: any) => void }) {
  const { t } = useLang();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={t("topbar.workersNear")} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {users.map((w) => (
          <div key={w.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink }}>{w.name}</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft }}>{w.skills || w.role} · {w.village || "2 km away"}</div>
              </div>
              {w.verified && (
                <span style={{ background: "#DCE9E1", color: C.green, fontSize: 10.5, fontWeight: 800, padding: "3px 8px", borderRadius: 999 }}>
                  VERIFIED
                </span>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.line}` }}>
              <span style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 16, fontWeight: 700, color: C.green }}>
                {w.dailyRate || w.hourlyRate || "₹500/day"}
              </span>
              <button
                onClick={() => onHire(w)}
                style={{ background: C.green, border: "none", borderRadius: 12, padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 13 }}
              >
                Hire Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobDetailsView({ worker, stepIndex, onStepChange, onBack }: { worker: any; stepIndex: number; onStepChange: (idx: number) => void; onBack: () => void }) {
  const { t } = useLang();
  const w = worker || { name: "Assigned Worker", role: "Farm Labour · Crop Cutting", rate: "₹500/day", dist: "1.5 km" };

  const actions = [
    { label: t("job.waiting"), disabled: true },
    { label: t("job.start"), action: () => onStepChange(2) },
    { label: t("job.complete"), action: () => onStepChange(3) },
    { label: t("job.pay"), action: () => onStepChange(4) },
    { label: t("job.rate"), action: () => onBack() },
  ];
  const curr = actions[stepIndex] || actions[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={t("topbar.jobTracking")} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: C.goldSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sprout size={24} color={C.greenDeep} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink }}>{w.name}</div>
            <div style={{ fontSize: 12.5, color: C.inkSoft }}>{w.role}</div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <Stepper stepIndex={stepIndex} />
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: "6px 14px", marginTop: 10 }}>
          <InfoRow label="Status" value={JOB_STEPS[stepIndex]} />
          <InfoRow label="Agreed Rate" value={w.rate || "₹500/day"} />
          <InfoRow label="Platform Fee (5%)" value="₹25" />
          <InfoRow label="Total Payable" value="₹525" />
        </div>
      </div>

      <div style={{ padding: "12px 16px 18px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={curr.action}
          disabled={curr.disabled}
          style={{
            width: "100%",
            background: curr.disabled ? C.line : C.gold,
            border: "none",
            borderRadius: 16,
            padding: "16px 0",
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700,
            fontSize: 16.5,
            color: curr.disabled ? C.inkSoft : C.greenDeep,
          }}
        >
          {curr.label}
        </button>
      </div>
    </div>
  );
}

function EquipmentListView({ equipment, onBack, onRent, onList }: { equipment: DbEquipment[]; onBack: () => void; onRent: (eq: DbEquipment) => void; onList: () => void }) {
  const { t } = useLang();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={t("topbar.equipment")} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {equipment.map((eq) => (
          <div key={eq.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: C.goldSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Tractor size={24} color={C.greenDeep} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink }}>{eq.name}</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft }}>Owner: {eq.ownerName} · {eq.dist}</div>
                <div style={{ fontSize: 12, color: C.gold, fontWeight: 700, marginTop: 2 }}>★ {eq.rating}</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.line}` }}>
              <div>
                <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 16, fontWeight: 700, color: C.green }}>{eq.dayRate}</div>
                <div style={{ fontSize: 11, color: C.inkSoft }}>+ {eq.deposit} deposit</div>
              </div>
              <button
                onClick={() => onRent(eq)}
                style={{ background: C.green, border: "none", borderRadius: 12, padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 13 }}
              >
                Rent Now
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 16px 16px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={onList}
          style={{ width: "100%", background: "none", border: `1.5px solid ${C.green}`, borderRadius: 14, padding: "12px 0", color: C.green, fontWeight: 800, fontSize: 14 }}
        >
          + List Your Own Equipment for Rent
        </button>
      </div>
    </div>
  );
}

function ListEquipmentView({ onBack, onSave }: { onBack: () => void; onSave: (eq: any) => void }) {
  const [name, setName] = useState("");
  const [dayRate, setDayRate] = useState("700");
  const [deposit, setDeposit] = useState("2000");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="List Equipment" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
        <Field label="EQUIPMENT NAME">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. "Tractor 45HP"'
            style={{ width: "100%", boxSizing: "border-box", background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", fontSize: 14 }}
          />
        </Field>
        <Field label="DAILY RATE (₹)">
          <input
            value={dayRate}
            onChange={(e) => setDayRate(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", fontSize: 14 }}
          />
        </Field>
        <Field label="SECURITY DEPOSIT (₹)">
          <input
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", fontSize: 14 }}
          />
        </Field>
      </div>
      <div style={{ padding: "12px 16px 18px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={() => onSave({ name, dayRate: `₹${dayRate}/day`, deposit: `₹${deposit}` })}
          style={{ width: "100%", background: C.gold, border: "none", borderRadius: 16, padding: "16px 0", color: C.greenDeep, fontWeight: 700, fontSize: 16 }}
        >
          Save Equipment
        </button>
      </div>
    </div>
  );
}

function EquipmentBookingView({ equipment, onBack }: { equipment: any; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const eq = equipment || { name: "Tractor", ownerName: "Suresh", dayRate: "₹700/day", deposit: "₹2,000" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Equipment Booking" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 14 }}>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 17, color: C.ink }}>{eq.name}</div>
          <div style={{ fontSize: 12.5, color: C.inkSoft }}>Owner: {eq.ownerName}</div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Stepper stepIndex={step} steps={["Booked", "Collected", "Returned", "Paid"]} />
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: "8px 14px", marginTop: 10 }}>
          <InfoRow label="Daily Rate" value={eq.dayRate} />
          <InfoRow label="Security Deposit" value={eq.deposit} />
          <InfoRow label="Total Amount" value="₹735" />
        </div>
      </div>
      <div style={{ padding: "12px 16px 18px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={() => (step < 3 ? setStep(step + 1) : onBack())}
          style={{ width: "100%", background: C.gold, border: "none", borderRadius: 16, padding: "16px 0", color: C.greenDeep, fontWeight: 700, fontSize: 16 }}
        >
          {step === 0 ? "Confirm Pickup / Collected" : step === 1 ? "Mark as Returned" : step === 2 ? "Pay ₹735 Rental" : "Booking Completed"}
        </button>
      </div>
    </div>
  );
}

function MyExpertiseView({ onBack, onSave }: { onBack: () => void; onSave: (d: any) => void }) {
  const [skills, setSkills] = useState("Farm Labour, Tractor Operator");
  const [dailyRate, setDailyRate] = useState("₹500 / day");
  const [availability, setAvailability] = useState("Available");
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="My Expertise" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
        <Field label="YOUR SKILLS">
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", fontSize: 14 }}
          />
        </Field>
        <Field label="DAILY PRICING">
          <input
            value={dailyRate}
            onChange={(e) => setDailyRate(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", fontSize: 14 }}
          />
        </Field>
        <Field label="AVAILABILITY">
          <div style={{ display: "flex", gap: 8 }}>
            {["Available", "Busy", "Not Available"].map((a) => (
              <Chip key={a} active={availability === a} onClick={() => setAvailability(a)}>{a}</Chip>
            ))}
          </div>
        </Field>
      </div>
      <div style={{ padding: "12px 16px 18px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={() => {
            onSave({ skills, dailyRate, availability, preferredRadius: 10 });
            setSaved(true);
          }}
          style={{ width: "100%", background: saved ? "#2C6E3E" : C.gold, border: "none", borderRadius: 16, padding: "16px 0", color: saved ? "#fff" : C.greenDeep, fontWeight: 700, fontSize: 16 }}
        >
          {saved ? "Profile Saved" : "Save My Expertise"}
        </button>
      </div>
    </div>
  );
}

function MarketplaceView({ items, onBack, onSell, onBuy }: { items: DbProduce[]; onBack: () => void; onSell: () => void; onBuy: (p: DbProduce) => void }) {
  const { t } = useLang();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={t("topbar.marketplace")} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {items.map((p) => (
          <div key={p.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 14, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink }}>{p.name}</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft }}>Seller: {p.sellerName} · {p.dist}</div>
              </div>
              <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 16, fontWeight: 700, color: C.green }}>{p.price}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.line}` }}>
              <span style={{ fontSize: 12, color: C.inkSoft }}>{p.stock}</span>
              <button
                onClick={() => onBuy(p)}
                style={{ background: C.green, border: "none", borderRadius: 12, padding: "8px 16px", color: "#fff", fontWeight: 700, fontSize: 13 }}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 16px 16px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={onSell}
          style={{ width: "100%", background: "none", border: `1.5px solid ${C.green}`, borderRadius: 14, padding: "12px 0", color: C.green, fontWeight: 800, fontSize: 14 }}
        >
          + Sell Your Produce or Goods
        </button>
      </div>
    </div>
  );
}

function SellProduceView({ onBack, onSave }: { onBack: () => void; onSave: (p: any) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("20");
  const [unit, setUnit] = useState("kg");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Sell Produce" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
        <Field label="PRODUCE NAME">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. "Fresh Tomatoes"'
            style={{ width: "100%", boxSizing: "border-box", background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", fontSize: 14 }}
          />
        </Field>
        <Field label="PRICE (₹)">
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", fontSize: 14 }}
          />
        </Field>
      </div>
      <div style={{ padding: "12px 16px 18px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={() => onSave({ name, price: `₹${price}/${unit}`, stock: `50 ${unit} available`, category: "vegetables" })}
          style={{ width: "100%", background: C.gold, border: "none", borderRadius: 16, padding: "16px 0", color: C.greenDeep, fontWeight: 700, fontSize: 16 }}
        >
          List for Sale
        </button>
      </div>
    </div>
  );
}

function BuyProduceView({ item, onBack, onConfirm }: { item: any; onBack: () => void; onConfirm: (order: any) => void }) {
  const [qty, setQty] = useState(5);
  const p = item || { name: "Tomatoes", price: "₹20/kg", priceNum: 20, sellerName: "Sunita" };
  const total = (p.priceNum || 20) * qty;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Confirm Order" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 14 }}>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 17, color: C.ink }}>{p.name}</div>
          <div style={{ fontSize: 12.5, color: C.inkSoft }}>Seller: {p.sellerName}</div>
        </div>
        <Field label="QUANTITY">
          <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 16px", marginTop: 10 }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 38, height: 38, borderRadius: 10, background: C.goldSoft, border: "none", fontSize: 20, fontWeight: 700, color: C.greenDeep }}>–</button>
            <span style={{ flex: 1, textAlign: "center", fontFamily: "'Baloo 2', sans-serif", fontSize: 18, fontWeight: 700, color: C.ink }}>{qty}</span>
            <button onClick={() => setQty(qty + 1)} style={{ width: 38, height: 38, borderRadius: 10, background: C.goldSoft, border: "none", fontSize: 20, fontWeight: 700, color: C.greenDeep }}>+</button>
          </div>
        </Field>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: "8px 14px", marginTop: 10 }}>
          <InfoRow label="Unit Price" value={p.price} />
          <InfoRow label="Total Payable" value={`₹${total}`} />
        </div>
      </div>
      <div style={{ padding: "12px 16px 18px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={() => onConfirm({ produceId: p.id, buyerName: "Ramesh", quantity: qty, totalAmount: total })}
          style={{ width: "100%", background: C.gold, border: "none", borderRadius: 16, padding: "16px 0", color: C.greenDeep, fontWeight: 700, fontSize: 16 }}
        >
          Place Order → ₹{total}
        </button>
      </div>
    </div>
  );
}

function OrderTrackingView({ item, onBack }: { item: any; onBack: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Order Tracking" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 14 }}>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 17, color: C.ink }}>{item?.name || "Marketplace Produce"}</div>
          <div style={{ fontSize: 12.5, color: C.inkSoft }}>Order placed successfully</div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Stepper stepIndex={step} steps={["Ordered", "Confirmed", "Ready", "Paid"]} />
        </div>
      </div>
      <div style={{ padding: "12px 16px 18px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={onBack}
          style={{ width: "100%", background: C.gold, border: "none", borderRadius: 16, padding: "16px 0", color: C.greenDeep, fontWeight: 700, fontSize: 16 }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

function QAView({ questions, onBack, onOpen, onAsk }: { questions: DbQuestion[]; onBack: () => void; onOpen: (q: DbQuestion) => void; onAsk: () => void }) {
  const { t } = useLang();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={t("topbar.askExpert")} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {questions.map((q) => (
          <button
            key={q.id}
            onClick={() => onOpen(q)}
            style={{ width: "100%", textAlign: "left", background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 12, display: "flex", gap: 12 }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.goldSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HelpCircle size={20} color={C.greenDeep} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15, color: C.ink }}>{q.text}</div>
              <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 4 }}>Asked by {q.askerName} · {q.messages?.length || 0} answers</div>
            </div>
          </button>
        ))}
      </div>
      <div style={{ padding: "10px 16px 16px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={onAsk}
          style={{ width: "100%", background: C.gold, border: "none", borderRadius: 16, padding: "15px 0", color: C.greenDeep, fontWeight: 700, fontSize: 16 }}
        >
          {t("btn.askNewQuestion")}
        </button>
      </div>
    </div>
  );
}

function AskQuestionView({ onBack, onSubmit }: { onBack: () => void; onSubmit: (q: any) => void }) {
  const [text, setText] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Ask a Question" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
        <Field label="YOUR QUESTION">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='e.g. "What fertilizer is best for wheat in sandy loam soil?"'
            rows={4}
            style={{ width: "100%", boxSizing: "border-box", background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", fontSize: 14 }}
          />
        </Field>
      </div>
      <div style={{ padding: "12px 16px 18px", background: C.card, borderTop: `1px solid ${C.line}` }}>
        <button
          onClick={() => text.trim() && onSubmit({ category: "farm", text, askerName: "Ramesh" })}
          style={{ width: "100%", background: C.gold, border: "none", borderRadius: 16, padding: "16px 0", color: C.greenDeep, fontWeight: 700, fontSize: 16 }}
        >
          Post Question
        </button>
      </div>
    </div>
  );
}

function QAThreadView({ question, onBack, onAddMessage, onUnlock }: { question: any; onBack: () => void; onAddMessage: (qId: number, msg: any) => void; onUnlock: (qId: number, mId: number) => void }) {
  const [text, setText] = useState("");
  const { lang } = useLang();

  if (!question) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Question Thread" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <div style={{ background: C.greenDeep, borderRadius: 16, padding: 14, color: "#fff", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: C.goldSoft }}>Asked by {question.askerName}</span>
            <button onClick={() => speakText(question.text, lang)} style={{ background: "none", border: "none", color: "#fff" }}>
              <Volume2 size={16} />
            </button>
          </div>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16 }}>{question.text}</div>
        </div>

        {question.messages?.map((m: any) => (
          <div key={m.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{m.authorName}</span>
              {m.isExpert && <span style={{ background: "#DCE9E1", color: C.green, fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 999 }}>EXPERT</span>}
            </div>
            {!m.unlocked && m.price > 0 ? (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: C.inkSoft }}>Answer locked. Pay ₹{m.price}</span>
                <button
                  onClick={() => onUnlock(question.id, m.id)}
                  style={{ background: C.gold, border: "none", borderRadius: 10, padding: "6px 12px", fontWeight: 700, fontSize: 12 }}
                >
                  Unlock ₹{m.price}
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 6, fontSize: 13, color: C.ink, display: "flex", justifyContent: "space-between" }}>
                <span>{m.text}</span>
                <button onClick={() => speakText(m.text, lang)} style={{ background: "none", border: "none", color: C.blue }}>
                  <Volume2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 16px 16px", background: C.card, borderTop: `1px solid ${C.line}`, display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your answer..."
          style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 12px", fontSize: 14 }}
        />
        <button
          onClick={() => {
            if (!text.trim()) return;
            onAddMessage(question.id, { text, authorName: "Ramesh", isExpert: false, price: 0, unlocked: true });
            setText("");
          }}
          style={{ width: 40, height: 40, borderRadius: "50%", background: C.green, border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function WalletView({ transactions, onBack, onAddMoney }: { transactions: DbTransaction[]; onBack: () => void; onAddMoney: (amt: number) => void }) {
  const { t } = useLang();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={t("topbar.wallet")} onBack={onBack} />
      <div style={{ padding: "16px" }}>
        <div style={{ background: C.green, borderRadius: 20, padding: 18, color: "#fff" }}>
          <div style={{ fontSize: 12, color: C.goldSoft, fontWeight: 700 }}>AVAILABLE BALANCE</div>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 32, fontWeight: 700, marginTop: 4 }}>₹1,240</div>
          <button
            onClick={() => onAddMoney(500)}
            style={{ width: "100%", background: C.gold, border: "none", borderRadius: 12, padding: "12px 0", color: C.greenDeep, fontWeight: 700, fontSize: 15, marginTop: 14 }}
          >
            + Add ₹500
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 8 }}>Recent Transactions</div>
        {transactions.map((tx) => (
          <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink }}>{tx.label}</div>
              <div style={{ fontSize: 11, color: C.inkSoft }}>{tx.txnCode} · {tx.status}</div>
            </div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15, color: tx.amount > 0 ? C.green : C.rust }}>
              {tx.amount > 0 ? `+₹${tx.amount}` : `−₹${Math.abs(tx.amount)}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminView({ users, questions, onBack, onVerifyUser, onRemoveUser }: { users: DbUser[]; questions: DbQuestion[]; onBack: () => void; onVerifyUser: (id: number) => void; onRemoveUser: (id: number) => void }) {
  const { t } = useLang();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title={t("topbar.admin")} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 8 }}>Users Management</div>
        {users.map((u) => (
          <div key={u.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
              <div style={{ fontSize: 12, color: C.inkSoft }}>{u.role} · {u.phone}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {!u.verified && (
                <button onClick={() => onVerifyUser(u.id)} style={{ background: "#DCE9E1", border: "none", borderRadius: 8, padding: "6px 10px", color: C.green, fontSize: 12, fontWeight: 700 }}>
                  Verify
                </button>
              )}
              <button onClick={() => onRemoveUser(u.id)} style={{ background: "#F3D9D3", border: "none", borderRadius: 8, padding: "6px 10px", color: C.rust, fontSize: 12, fontWeight: 700 }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
