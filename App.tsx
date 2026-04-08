
import React, { useState, useEffect, useRef } from 'react';
import { HealBotService } from './services/geminiService';
import { getAnswer, getAnswerStream, getLocalReply } from './services/chatbot';
import { Message, UserHealthProfile, Language, User, UserRole, ViewState } from './types';
import supabase, { isSupabaseConfigured } from './supabase';
import { AuthService } from './services/authService';
import ChatInterface from './components/ChatInterface';
import HealthReport from './components/HealthReport';
import MedicalServices from './components/MedicalServices';
import WellnessHub from './components/WellnessHub';
import InsuranceModule from './components/InsuranceModule';
import AdminDashboard from './components/AdminDashboard';
import LiveVoiceMode from './components/LiveVoiceMode';
import AboutSupport from './components/AboutSupport';
import MedicalImageAnalysis from './components/MedicalImageAnalysis';
import HospitalFinder from './components/HospitalFinder';
import BloodAnalysis from './components/BloodAnalysis';
import MedicineAnalyzer from './components/MedicineAnalyzer';
import HealthContent from './components/HealthContent';
import GlobView from './components/GlobView';
import HealthDashboard from './components/HealthDashboard';
import MedicineReminder from './components/MedicineReminder';
import EmergencySOS from './components/EmergencySOS';
import MentalHealth from './components/MentalHealth';
import HealthRecords from './components/HealthRecords';
import AppointmentBooking from './components/AppointmentBooking';
import DiseaseAwareness from './components/DiseaseAwareness';
import GovDashboard from './components/GovDashboard';
import HealthID from './components/HealthID';
import OutbreakDetection from './components/OutbreakDetection';
import HealthRiskPrediction from './components/HealthRiskPrediction';
import RuralHealthPortal from './components/RuralHealthPortal';
import PolicyAnalytics from './components/PolicyAnalytics';
import Profile from './components/Profile';

const SECURITY_QUESTIONS = [
  "What is your favorite healthy drink?",
  "What activity helps you relax when stressed?",
  "What time of day do you prefer for exercise?",
  "What healthy habit are you proud of?",
  "What is your favorite fruit for staying healthy?"
];

const ADMIN_CREDENTIALS = {
  name: 'logesh',
  email: 'logesh20bec@gmail.com',
  password: 'bec.ac.in'
};

const TRANSLATIONS = {
  [Language.EN]: {
    name: 'English',
    welcome: 'Welcome to HealBot AI',
    sub: 'Your advanced healthcare companion.',
    mainChat: 'Main Chat',
    consult: 'Consultations',
    doctors: 'Doctors & Specialists',
    hospitals: 'Hospitals Nearby',
    telemedicine: 'Telemedicine (Remote)',
    protection: 'Protection',
    insurance: 'Health Insurance',
    pharmacy: 'Pharmacy',
    medicines: 'Search Medicines',
    wellness: 'Wellness',
    fitness: 'Fitness & Nutrition',
    system: 'System Controls',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    rural: 'Rural Mode',
    clear: 'Clear Logs',
    selectLang: 'Select Language',
    loginTitle: 'Healthcare Portal Login',
    loginSub: 'Access your secure medical AI assistant.',
    emailLabel: 'Gmail / Medical ID',
    passLabel: 'Access Key / Password',
    loginBtn: 'Secure Entry',
    guestBtn: 'Continue as Guest',
    forgotPass: 'Forgot access credentials?',
    registerTitle: 'Create Healthcare Account',
    registerBtn: 'Complete Registration',
    usernameLabel: 'Username',
    ageLabel: 'Age',
    genderLabel: 'Gender',
    securityQ: 'Security Question',
    securityA: 'Your Answer',
    noAccount: 'Don\'t have an account?',
    hasAccount: 'Already registered?',
    resetTitle: 'Password Recovery',
    resetBtn: 'Update Password',
    findAccount: 'Verify Account',
    wrongAnswer: 'Security answer is incorrect.',
    userNotFound: 'Account not found.',
    adminPanel: 'Admin Command Center',
    liveVoice: 'Live Voice Session',
    about: 'About & Support',
    searchPlaceholder: 'Search components...',
    imageAnalysis: 'Medical Image Analysis',
    bloodAnalysis: 'Blood Report Analysis',
    medicineAnalyzer: 'Medicine Analyzer',
    healthContent: 'Health Knowledge Hub',
    glob: 'Global Health Pulse',
    diagnostics: 'Diagnostics',
    healthDashboard: 'Health Dashboard',
    medicineReminder: 'Medicine Reminders',
    emergencySOS: 'Emergency SOS',
    mentalHealth: 'Mental Health',
    healthRecords: 'Medical Records',
    appointmentBooking: 'Book Appointment',
    diseaseAwareness: 'Disease Awareness',
    govDashboard: 'Gov Command Center',
    healthID: 'National Health ID',
    outbreakDetection: 'Disease Surveillance',
    healthRiskPrediction: 'AI Health Risk Prediction',
    ruralHealthPortal: 'Rural Healthcare Access',
    policyAnalytics: 'Health Policy Analytics',
    personal: 'Personal Care',
    localAI: 'Local AI (Ollama)'
  },
  [Language.TA]: {
    name: 'தமிழ்',
    welcome: 'ஹீல்பாட் AI-க்கு வரவேற்கிறோம்',
    sub: 'உங்கள் மேம்பட்ட சுகாதார துணை.',
    mainChat: 'முக்கிய அரட்டை',
    consult: 'ஆலோசனைகள்',
    doctors: 'மருத்துவர்கள் மற்றும் நிபுணர்கள்',
    hospitals: 'அருகிலுள்ள மருத்துவமனைகள்',
    telemedicine: 'டெலிமெடிசின் (தொலைநிலை)',
    protection: 'பாதுகாப்பு',
    insurance: 'சுகாதார காப்பீடு',
    pharmacy: 'மருந்தகம்',
    medicines: 'மருந்துகளைத் தேடுங்கள்',
    wellness: 'நல்வாழ்வு',
    fitness: 'உடற்தகுதி மற்றும் ஊட்டச்சத்து',
    system: 'கணினி கட்டுப்பாடுகள்',
    darkMode: 'இருண்ட பயன்முறை',
    lightMode: 'ஒளி பயன்முறை',
    rural: 'கிராமப்புற முறை',
    clear: 'பதிவுகளை அழி',
    selectLang: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    loginTitle: 'சுகாதார போர்டல் உள்நுழைவு',
    loginSub: 'உங்கள் பாதுகாப்பான மருத்துவ AI உதவியாளரை அணுகவும்.',
    emailLabel: 'ஜிமெயில் / மருத்துவ ஐடி',
    passLabel: 'கடவுச்சொல்',
    loginBtn: 'பாதுகாப்பான நுழைவு',
    guestBtn: 'விருந்தினராக தொடரவும்',
    forgotPass: 'அடையாளச் சான்றுகளை மறந்துவிட்டீர்களா?',
    registerTitle: 'புதிய கணக்கை உருவாக்கவும்',
    registerBtn: 'பதிவை முடிக்கவும்',
    usernameLabel: 'பயனர் பெயர்',
    ageLabel: 'வயது',
    genderLabel: 'பாலினம்',
    securityQ: 'பாதுகாப்பு கேள்வி',
    securityA: 'உங்கள் பதில்',
    noAccount: 'கணக்கு இல்லையா?',
    hasAccount: 'ஏற்கனவே பதிவு செய்துள்ளீர்களா?',
    resetTitle: 'கடவுச்சொல் மீட்பு',
    resetBtn: 'கடவுச்சொல்லை மாற்றவும்',
    findAccount: 'கணக்கைச் சரிபார்க்கவும்',
    wrongAnswer: 'பதில் தவறானது.',
    userNotFound: 'கணக்கு கிடைக்கவில்லை.',
    adminPanel: 'நிர்வாக மையம்',
    liveVoice: 'நேரடி குரல் அமர்வு',
    about: 'தகவல் மற்றும் ஆதரவு',
    searchPlaceholder: 'தேடல்...',
    imageAnalysis: 'மருத்துவ பட ஆய்வு',
    bloodAnalysis: 'இரத்த அறிக்கை ஆய்வு',
    appointmentBooking: 'நியமனம் முன்பதிவு',
    diseaseAwareness: 'நோய் விழிப்புணர்வு',
    govDashboard: 'அரசு கட்டுப்பாட்டு மையம்',
    healthID: 'தேசிய சுகாதார ஐடி',
    outbreakDetection: 'நோய் கண்காணிப்பு',
    healthRiskPrediction: 'AI சுகாதார அபாய கணிப்பு',
    ruralHealthPortal: 'கிராமப்புற சுகாதார அணுகல்',
    policyAnalytics: 'சுகாதார கொள்கை பகுப்பாய்வு',
    personal: 'தனிப்பட்ட பராமரிப்பு',
    localAI: 'உள்ளூர் AI (Ollama)'
  },
  [Language.HI]: {
    name: 'हिन्दी',
    welcome: 'हीलबॉट एआई में आपका स्वागत है',
    sub: 'आपका उन्नत स्वास्थ्य सेवा साथी।',
    mainChat: 'मुख्य चैट',
    consult: 'परामर्श',
    doctors: 'डॉक्टर और विशेषज्ञ',
    hospitals: 'पास के अस्पताल',
    telemedicine: 'टेलीमेडिसिन',
    protection: 'सुरक्षा',
    insurance: 'स्वास्थ्य बीमा',
    pharmacy: 'फार्मेसी',
    medicines: 'दवाएं खोजें',
    wellness: 'कल्याण',
    fitness: 'फिटनेस और पोषण',
    system: 'सिस्टम नियंत्रण',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    rural: 'ग्रामीण मोड',
    clear: 'लॉग साफ़ करें',
    selectLang: 'भाषा चुनें',
    loginTitle: 'स्वास्थ्य सेवा पोर्टल लॉगिन',
    loginSub: 'अपने सुरक्षित मेडिकल एआई सहायक तक पहुंचें।',
    emailLabel: 'जीमेल / मेडिकल आईडी',
    passLabel: 'पासवर्ड',
    loginBtn: 'सुरक्षित प्रवेश',
    guestBtn: 'अतिथि के रूप में जारी रखें',
    forgotPass: 'क्रेडेंशियल्स भूल गए?',
    registerTitle: 'खाता बनाएं',
    registerBtn: 'पंजीकरण पूरा करें',
    usernameLabel: 'उपयोगकर्ता नाम',
    ageLabel: 'आयु',
    genderLabel: 'लिंग',
    securityQ: 'सुरक्षा प्रश्न',
    securityA: 'आपका उत्तर',
    noAccount: 'खाता नहीं है?',
    hasAccount: 'पहले से पंजीकृत?',
    resetTitle: 'पासवर्ड रिकवरी',
    resetBtn: 'पासवर्ड अपडेट करें',
    findAccount: 'खाता सत्यापित करें',
    wrongAnswer: 'सुरक्षा उत्तर गलत है।',
    userNotFound: 'खाता नहीं मिला।',
    adminPanel: 'एडमिन सेंटर',
    liveVoice: 'लाइव वॉयस',
    about: 'परिचय और सहायता',
    searchPlaceholder: 'खोजें...',
    imageAnalysis: 'मेडिकल इमेज विश्लेषण',
    bloodAnalysis: 'ब्लड रिपोर्ट विश्लेषण',
    appointmentBooking: 'अपॉइंटमेंट बुकिंग',
    diseaseAwareness: 'रोग जागरूकता',
    govDashboard: 'सरकारी कमांड सेंटर',
    healthID: 'राष्ट्रीय स्वास्थ्य आईडी',
    outbreakDetection: 'रोग निगरानी',
    healthRiskPrediction: 'एआई स्वास्थ्य जोखिम भविष्यवाणी',
    ruralHealthPortal: 'ग्रामीण स्वास्थ्य सेवा पहुंच',
    policyAnalytics: 'स्वास्थ्य नीति विश्लेषण',
    personal: 'व्यक्तिगत देखभाल',
    localAI: 'स्थानीय एआई (Ollama)'
  },
  [Language.ES]: {
    name: 'Español',
    welcome: 'Bienvenido a HealBot AI',
    sub: 'Su compañero avanzado de atención médica.',
    mainChat: 'Chat Principal',
    consult: 'Consultas',
    doctors: 'Médicos y Especialistas',
    hospitals: 'Hospitales Cercanos',
    telemedicine: 'Telemedicina',
    protection: 'Protección',
    insurance: 'Seguro de Salud',
    pharmacy: 'Farmacia',
    medicines: 'Buscar Medicamentos',
    wellness: 'Bienestar',
    fitness: 'Gimnasia y Nutrición',
    system: 'Controles del Sistema',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Luz',
    rural: 'Modo Rural',
    clear: 'Borrar Registros',
    selectLang: 'Seleccionar Idioma',
    loginTitle: 'Inicio de Sesión del Portal',
    loginSub: 'Acceda a su asistente médico seguro de IA.',
    emailLabel: 'Gmail / ID Médico',
    passLabel: 'Contraseña',
    loginBtn: 'Entrada Segura',
    guestBtn: 'Continuar como Invitado',
    forgotPass: '¿Olvidó sus credenciales?',
    registerTitle: 'Crear Cuenta de Salud',
    registerBtn: 'Completar Registro',
    usernameLabel: 'Usuario',
    ageLabel: 'Edad',
    genderLabel: 'Género',
    securityQ: 'Pregunta de Seguridad',
    securityA: 'Su Respuesta',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya estás registrado?',
    resetTitle: 'Recuperar Contraseña',
    resetBtn: 'Actualizar Contraseña',
    findAccount: 'Verificar Cuenta',
    wrongAnswer: 'Respuesta incorrecta.',
    userNotFound: 'Usuario no encontrado.',
    adminPanel: 'Centro Administrativo',
    liveVoice: 'Voz en Vivo',
    about: 'Acerca de y Soporte',
    searchPlaceholder: 'Buscar...',
    imageAnalysis: 'Análisis de Imágenes Médicas',
    bloodAnalysis: 'Análisis de Reporte de Sangre',
    diagnostics: 'Diagnósticos',
    govDashboard: 'Centro de Mando Gubernamental',
    healthID: 'Identificación Nacional de Salud',
    outbreakDetection: 'Vigilancia de Enfermedades',
    healthRiskPrediction: 'Predicción de Riesgos de Salud por IA',
    ruralHealthPortal: 'Acceso a Salud Rural',
    policyAnalytics: 'Análisis de Políticas de Salud',
    personal: 'Cuidado Personal',
    localAI: 'IA Local (Ollama)'
  },
  [Language.AR]: {
    name: 'العربية',
    welcome: 'مرحبًا بك في HealBot AI',
    sub: 'رفيقك المتقدم في الرعاية الصحية.',
    mainChat: 'الدردشة الرئيسية',
    consult: 'الاستشارات',
    doctors: 'الأطباء والمتخصصون',
    hospitals: 'المستشفيات القريبة',
    telemedicine: 'الطب عن بعد',
    protection: 'الحماية',
    insurance: 'التأمين الصحي',
    pharmacy: 'الصيدلية',
    medicines: 'البحث عن الأدوية',
    wellness: 'العافية',
    fitness: 'اللياقة البدنية والتغذية',
    system: 'ضوابط النظام',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع المضيء',
    rural: 'الوضع الريفي',
    clear: 'مسح السجلات',
    selectLang: 'اختر اللغة',
    loginTitle: 'تسجيل دخول بوابة الرعاية الصحية',
    loginSub: 'الوصول إلى مساعدك الطبي الآمن.',
    emailLabel: 'جي ميل / الهوية الطبية',
    passLabel: 'كلمة المرور',
    loginBtn: 'دخول آمن',
    guestBtn: 'متابعة كضيف',
    forgotPass: 'هل نسيت بيانات الاعتماد؟',
    registerTitle: 'إنشاء حساب رعاية صحية',
    registerBtn: 'إكمال التسجيل',
    usernameLabel: 'اسم المستخدم',
    ageLabel: 'العمر',
    genderLabel: 'الجنس',
    securityQ: 'سؤال الأمان',
    securityA: 'إجابتك',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'مسجل بالفعل؟',
    resetTitle: 'استعادة كلمة المرور',
    resetBtn: 'تحديث كلمة المرور',
    findAccount: 'التحقق من الحساب',
    wrongAnswer: 'الإجابة غير صحيحة.',
    userNotFound: 'الحساب غير موجود.',
    adminPanel: 'لوحة التحكم الإدارية',
    liveVoice: 'جلسة صوتية حية',
    about: 'حول والدعم',
    searchPlaceholder: 'بحث...',
    imageAnalysis: 'تحليل الصور الطبية',
    bloodAnalysis: 'تحليل تقرير الدم',
    diagnostics: 'التشخيص',
    govDashboard: 'مركز القيادة الحكومي',
    healthID: 'الهوية الصحية الوطنية',
    outbreakDetection: 'مراقبة الأمراض',
    healthRiskPrediction: 'التنبؤ بمخاطر الصحة بالذكاء الاصطناعي',
    ruralHealthPortal: 'الوصول إلى الرعاية الصحية الريفية',
    policyAnalytics: 'تحليلات السياسة الصحية',
    personal: 'العناية الشخصية',
    localAI: 'الذكاء الاصطناعي المحلي (Ollama)'
  }
};

const INITIAL_MESSAGE_CONTENT = (lang: Language) => `### ${TRANSLATIONS[lang].welcome}\n${TRANSLATIONS[lang].sub}\n\n**How can I help you today?**`;

type AuthState = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('hb_auth') === 'true');
  const [authState, setAuthState] = useState<AuthState>('LOGIN');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.PATIENT);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('hb_theme') as 'light' | 'dark') || 'light');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('hb_lang') as Language) || Language.EN);
  const [view, setView] = useState<ViewState>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [preferLocalAI, setPreferLocalAI] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          console.log("📍 Location access granted");
        },
        (err) => {
          console.warn("📍 Location access denied or error:", err.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'en' ? 'en-US' : lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
      };

      setRecognition(rec);
    }
  }, [lang]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
  };

  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    if (!isTTSEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : 'en-US';
    synth.speak(utterance);
  };
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [sessionId, setSessionId] = useState<string>(() => 'SID-' + Math.random().toString(36).substr(2, 8).toUpperCase());
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState<boolean>(() => localStorage.getItem('hb_tts') === 'true');

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 3000);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showAlert("Back online! Syncing your data... 🌐");
      syncOfflineData();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showAlert("You are offline. Changes will be saved locally. 📡");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('hb_data_changed', checkPendingSyncs);

    // Initial check for pending syncs
    checkPendingSyncs();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('hb_data_changed', checkPendingSyncs);
    };
  }, []);

  const checkPendingSyncs = () => {
    const bookings = JSON.parse(localStorage.getItem('hb_service_bookings') || '[]');
    const unsynced = bookings.filter((b: any) => !b.synced);
    setPendingSyncCount(unsynced.length);
    setSyncStatus(unsynced.length > 0 ? 'pending' : 'synced');
  };

  const syncOfflineData = async () => {
    if (!navigator.onLine) return;
    
    const bookings = JSON.parse(localStorage.getItem('hb_service_bookings') || '[]');
    const unsynced = bookings.filter((b: any) => !b.synced);
    
    if (unsynced.length === 0) return;

    setSyncStatus('syncing');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mark as synced
    const updatedBookings = bookings.map((b: any) => ({ ...b, synced: true }));
    localStorage.setItem('hb_service_bookings', JSON.stringify(updatedBookings));
    
    setPendingSyncCount(0);
    setSyncStatus('synced');
    showAlert("All offline data synced successfully! ✅");
  };

  const loadChats = async (userId: string) => {
    // 1. Try to load from cache first for immediate UI
    const cached = localStorage.getItem(`hb_chats_${userId}`);
    if (cached) {
      setMessages(JSON.parse(cached));
    }

    if (!isOnline || !isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages: Message[] = data.flatMap(chat => [
          {
            id: 'msg-' + chat.id + '-u',
            role: 'user',
            content: chat.message,
            timestamp: new Date(chat.created_at)
          },
          {
            id: 'msg-' + chat.id + '-a',
            role: 'assistant',
            content: chat.response,
            timestamp: new Date(chat.created_at),
            groundingUrls: chat.grounding_urls
          }
        ]);
        setMessages(loadedMessages);
        // 2. Cache the fresh data
        localStorage.setItem(`hb_chats_${userId}`, JSON.stringify(loadedMessages));
      } else {
        const newInitialMessage: Message = { 
          id: 'init-' + Date.now(), 
          role: 'assistant', 
          content: INITIAL_MESSAGE_CONTENT(lang), 
          timestamp: new Date() 
        };
        setMessages([newInitialMessage]);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
      if (!cached) {
        const newInitialMessage: Message = { 
          id: 'init-' + Date.now(), 
          role: 'assistant', 
          content: INITIAL_MESSAGE_CONTENT(lang), 
          timestamp: new Date() 
        };
        setMessages([newInitialMessage]);
      }
    }
  };
  
  // Auth Form States
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<User>({
    patient_id: '', username: '', email: '', password: '', age: 0, gender: 'Male', 
    security_question: SECURITY_QUESTIONS[0], security_answer: '', role: UserRole.PATIENT
  });
  const [resetForm, setResetForm] = useState({ email: '', answer: '', newPassword: '', stage: 1 });
  const [resetUser, setResetUser] = useState<User | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hb_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    // Handle Supabase password recovery link
    const handleRecovery = async () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if ((hash && hash.includes('type=recovery')) || path.includes('reset-password')) {
        setAuthState('FORGOT_PASSWORD');
        setResetForm(prev => ({ ...prev, stage: 3 }));
        showAlert("Reset link verified. Set your new password ✅");
        // Clear hash and path to avoid re-triggering
        window.history.replaceState(null, '', window.location.origin);
      }
    };
    handleRecovery();

    // Check current session
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // Fetch profile
          AuthService.getProfile(session.user.id).then((profile) => {
            if (profile) {
              setIsLoggedIn(true);
              setCurrentUser(profile);
              localStorage.setItem('hb_auth', 'true');
              localStorage.setItem('hb_current_user', JSON.stringify(profile));
              loadChats(session.user.id);
            }
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          loadChats(session.user.id);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
          setMessages([]);
          localStorage.removeItem('hb_auth');
          localStorage.removeItem('hb_current_user');
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Demo Mode session check
      const saved = localStorage.getItem('hb_auth');
      const savedUser = localStorage.getItem('hb_current_user');
      if (saved === 'true' && savedUser) {
        setIsLoggedIn(true);
        setCurrentUser(JSON.parse(savedUser));
      }
    }
  }, []);

  const userProfile: UserHealthProfile = {
    name: currentUser?.username || 'Guest Patient',
    email: currentUser?.email || 'guest@healbot.ai',
    patient_id: currentUser?.patient_id || 'GUEST-ID',
    age: currentUser?.age || 30,
    gender: currentUser?.gender || 'Not Specified',
    allergies: [],
    history: []
  };

  const healBot = useRef(new HealBotService());
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    localStorage.setItem('hb_theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme-root');
    } else {
      document.body.classList.remove('dark-theme-root');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hb_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('hb_tts', isTTSActive.toString());
  }, [isTTSActive]);

  useEffect(() => {
    if (currentUser?.id) {
      const saved = localStorage.getItem(`hb_chats_${currentUser.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
            return;
          }
        } catch (e) {
          console.error("Failed to parse history", e);
        }
      }
    }
    setMessages([{ id: 'init-' + Date.now(), role: 'assistant', content: INITIAL_MESSAGE_CONTENT(lang), timestamp: new Date() }]);
  }, [currentUser?.id]);

  useEffect(() => {
    if (messages.length > 0 && currentUser?.id) {
      localStorage.setItem(`hb_chats_${currentUser.id}`, JSON.stringify(messages));
    }
  }, [messages, currentUser?.id]);

  const generateSession = () => {
    setSessionId('SID-' + Math.random().toString(36).substr(2, 8).toUpperCase());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!loginForm.email || !loginForm.password) {
      showAlert("Please fill all fields ⚠️");
      return;
    }

    try {
      setIsLoading(true);
      
      // Admin Check
      if (loginRole === UserRole.ADMIN && loginForm.email === ADMIN_CREDENTIALS.email && loginForm.password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = { 
          username: ADMIN_CREDENTIALS.name,
          email: ADMIN_CREDENTIALS.email,
          patient_id: 'ADM-001', 
          age: 0, gender: 'Admin', security_question: '', security_answer: '', role: UserRole.ADMIN
        };
        setIsLoggedIn(true);
        setCurrentUser(adminUser);
        localStorage.setItem('hb_auth', 'true');
        localStorage.setItem('hb_current_user', JSON.stringify(adminUser));
        setView('admin');
        showAlert("Admin Login Success ✅");
        return;
      }

      const data = await AuthService.signIn(loginForm.email, loginForm.password);
      
      if (data.user) {
        const profile = await AuthService.getProfile(data.user.id);
        if (profile) {
          if (profile.role !== loginRole) {
            showAlert(`Wrong role selected: ${loginRole} ❌`);
            await AuthService.signOut();
            return;
          }
          setIsLoggedIn(true);
          setCurrentUser(profile);
          localStorage.setItem('hb_auth', 'true');
          localStorage.setItem('hb_current_user', JSON.stringify(profile));
          setView(profile.role === UserRole.ADMIN ? 'admin' : profile.role === UserRole.DOCTOR ? 'doctors' : 'chat');
          showAlert("Login Successful ✅");
        }
      }
    } catch (err: any) {
      showAlert(`Login failed: ${err.message} ❌`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await AuthService.signInWithGoogle();
    } catch (err: any) {
      showAlert(`Google login failed: ${err.message} ❌`);
    } finally {
      setIsLoading(false);
    }
  };

  const [otpEmail, setOtpEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleSendOTP = async () => {
    if (!otpEmail) return showAlert("Enter email ⚠️");
    try {
      setIsLoading(true);
      await AuthService.sendOTP(otpEmail);
      setIsOtpSent(true);
      showAlert("OTP sent to your email 📩");
    } catch (err: any) {
      showAlert(`Error: ${err.message} ❌`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpToken) return showAlert("Enter OTP ⚠️");
    try {
      setIsLoading(true);
      await AuthService.verifyOTP(otpEmail, otpToken);
      showAlert("OTP Verified ✅");
    } catch (err: any) {
      showAlert(`Error: ${err.message} ❌`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!registerForm.email || !registerForm.password || !registerForm.username) {
      showAlert("Please fill all fields ⚠️");
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await AuthService.signUp(registerForm);
      if (data.user) {
        showAlert("Registration Successful! Please login ✅");
        setAuthState('LOGIN');
      }
    } catch (err: any) {
      showAlert(`Registration failed: ${err.message} ❌`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordEmail = async () => {
    if (!resetForm.email) {
      showAlert("Please enter your email ⚠️");
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetForm.email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setIsLoading(false);
    if (error) {
      showAlert("Error sending reset link ❌");
    } else {
      showAlert("Reset link sent to your email 📩");
    }
  };

  const handleResetVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', resetForm.email)
      .maybeSingle();
    setIsLoading(false);

    if (user) {
      setResetUser(user);
      setResetForm(prev => ({ ...prev, stage: 2 }));
      showAlert("Account verified. Answer security question ✅");
    } else {
      showAlert("Account not found ❌");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetForm.stage === 2) {
      if (resetUser && resetForm.answer.toLowerCase() === resetUser.security_answer.toLowerCase()) {
        setResetForm(prev => ({ ...prev, stage: 3 }));
        showAlert("Correct! Now set your new password ✅");
      } else {
        showAlert("Incorrect security answer ❌");
      }
      return;
    }

    if (resetForm.newPassword.length < 6) {
      showAlert("Password must be at least 6 characters ❌");
      return;
    }

    try {
      setIsLoading(true);
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: resetForm.newPassword
      });

      if (error) {
        showAlert("Password update failed ❌");
      } else {
        showAlert("Password updated successfully ✅");
        setAuthState('LOGIN');
        setResetForm({ email: '', answer: '', newPassword: '', stage: 1 });
        setResetUser(null);
      }
    } catch (err: any) {
      showAlert(`Error: ${err.message} ❌`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setMessages([]);
    localStorage.removeItem('hb_auth');
    localStorage.removeItem('hb_current_user');
    setIsSidebarOpen(false);
    setAuthState('LOGIN');
  };

  const onDeleteMessage = async (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    if (currentUser?.id) {
      await supabase.from('chats').delete().eq('id', messageId);
      const updated = messages.filter(m => m.id !== messageId);
      localStorage.setItem(`hb_chats_${currentUser.id}`, JSON.stringify(updated));
    }
  };

  const clearHistory = async () => {
    if (currentUser?.id) {
      await supabase.from('chats').delete().eq('user_id', currentUser.id);
      localStorage.removeItem(`hb_chats_${currentUser.id}`);
    }
      
      // Clear all potential medical logs
      localStorage.removeItem('hb_service_bookings');
      localStorage.removeItem('hb_insurance_requests');
      localStorage.removeItem('wellness_calorie_log');
      
      const newInitialMessage: Message = { 
        id: 'init-' + Date.now(), 
        role: 'assistant', 
        content: INITIAL_MESSAGE_CONTENT(lang), 
        timestamp: new Date() 
      };
      
      setMessages([newInitialMessage]);
      setView('chat');
      setIsSidebarOpen(false);
      setIsLangMenuOpen(false);
      
      // Force immediate re-render of components watching these storage keys if needed
      window.dispatchEvent(new Event('storage'));
      showAlert("System reset complete. All medical logs cleared. 🗑️");
  };

  const navigateTo = (newView: ViewState) => {
    setView(newView);
    setIsSidebarOpen(false);
  };

  const syncOfflineChats = async () => {
    if (!currentUser?.id || !isOnline) return;
    
    const offlineChats = JSON.parse(localStorage.getItem(`hb_offline_chats_${currentUser.id}`) || '[]');
    if (offlineChats.length === 0) return;

    setSyncStatus('syncing');
    try {
      const { error } = await supabase.from('chats').insert(offlineChats);
      if (!error) {
        localStorage.removeItem(`hb_offline_chats_${currentUser.id}`);
        setSyncStatus('synced');
        showAlert("Offline chats synced! ✅");
      }
    } catch (err) {
      console.error("Sync failed", err);
      setSyncStatus('pending');
    }
  };

  const handleSendMessage = async (text: string, imageBase64?: string) => {
    if (isTyping) return; // Avoid spam

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      image: imageBase64
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsTyping(true);

    // Save to local cache immediately
    if (currentUser?.id) {
      localStorage.setItem(`hb_chats_${currentUser.id}`, JSON.stringify(updatedMessages));
    }

    if (!isOnline) {
      const offlineReply = getLocalReply(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: offlineReply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      return;
    }

    try {
      const location = userLocation || await new Promise<{lat: number, lng: number} | undefined>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(undefined)
        );
      });

      const mappedHistory = updatedMessages.map(m => {
        const parts: any[] = [{ text: m.content }];
        if (m.image) {
          const data = m.image.split(',')[1] || m.image;
          parts.push({ inlineData: { mimeType: "image/jpeg", data } });
        }
        return { role: m.role === 'assistant' ? 'model' : 'user', parts };
      });

      let conversationHistory = mappedHistory.slice(0, -1);
      if (conversationHistory.length > 0 && conversationHistory[0].role === 'model') {
        conversationHistory = conversationHistory.slice(1);
      }

      // Fix 1: Show instant reply (UX trick)
      const botMessageId = (Date.now() + 1).toString();
      const initialBotMessage: Message = {
        id: botMessageId,
        role: 'assistant',
        content: "...",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, initialBotMessage]);

      // Fix 4: Use streaming
      const stream = getAnswerStream(text, conversationHistory, location, imageBase64, TRANSLATIONS[lang].name, preferLocalAI, currentUser?.id);
      let fullResponse = "";
      
      for await (const chunk of stream) {
        const textChunk = typeof chunk === 'string' ? chunk : chunk.text;
        fullResponse += textChunk;
        
        setMessages(prev => prev.map(m => {
          if (m.id === botMessageId) {
            const updated = { ...m, content: fullResponse };
            if (typeof chunk !== 'string' && chunk.groundingUrls) {
              updated.groundingUrls = chunk.groundingUrls;
            }
            return updated;
          }
          return m;
        }));
      }

      // Save full conversation to Supabase
      if (currentUser?.id) {
        await supabase.from("chats").insert({
          user_id: currentUser.id,
          message: text,
          response: fullResponse
        });
      }

      setIsTyping(false);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: '### Error\nI encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    }
  };

  const handleFeedback = async (messageId: string, feedback: 'like' | 'dislike') => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback } : m));
    
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    // If liked, save to knowledge base for self-learning
    if (feedback === 'like') {
      const userMessage = messages[messages.indexOf(message) - 1];
      if (userMessage && userMessage.role === 'user') {
        const { saveToKnowledgeBase } = await import('./services/chatbot');
        await saveToKnowledgeBase(userMessage.content, message.content);
        showAlert("Thanks! I've learned from this answer 🧠");
      }
    } else {
      showAlert("Thanks for the feedback! I'll try to improve 🤖");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 bg-slate-50 transition-all duration-700 ${lang === Language.AR ? 'font-arabic' : ''}`} dir={lang === Language.AR ? 'rtl' : 'ltr'}>
        <div className="absolute top-8 flex gap-4 no-print">
           <button onClick={() => setIsLangMenuOpen(true)} className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all flex items-center gap-2">
             <i className="fas fa-language text-blue-600"></i> {t.name}
           </button>
        </div>

        {isLangMenuOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t.selectLang}</h3>
                  <button onClick={() => setIsLangMenuOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="p-4 grid grid-cols-1 gap-2">
                  {Object.entries(TRANSLATIONS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => { setLang(key as Language); setIsLangMenuOpen(false); }}
                      className={`p-5 rounded-2xl flex items-center justify-between transition-all font-black text-sm ${lang === key ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <span>{value.name}</span>
                      {lang === key && <i className="fas fa-check-circle"></i>}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        )}

        {alertMsg && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-10 duration-500 border border-slate-800">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
              <i className="fas fa-bell"></i>
            </div>
            <p className="text-xs font-black uppercase tracking-widest">{alertMsg}</p>
          </div>
        )}

        {!isOnline && (
          <div className="fixed top-0 w-full bg-red-600 text-white text-center p-2 z-[1000] font-black text-[10px] uppercase tracking-widest animate-pulse">
            <i className="fas fa-wifi-slash mr-2"></i> You are currently offline • Changes will sync later
          </div>
        )}

        <div className="w-full max-w-md py-12 animate-in fade-in zoom-in-95 duration-1000">
           <div className="text-center mb-10">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-6 shadow-2xl shadow-blue-100">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">HealBot AI</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                {authState === 'LOGIN' ? t.loginTitle : authState === 'REGISTER' ? t.registerTitle : t.resetTitle}
              </p>
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-100 relative overflow-hidden">
              {(!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) && (
                <div className="absolute top-0 left-0 w-full bg-amber-500 text-white text-[8px] font-black uppercase tracking-[0.3em] py-1 text-center z-10">
                  {import.meta.env.VITE_SUPABASE_URL?.includes('placeholder') ? '⚠️ Update Supabase URL in Settings' : 'Demo Mode Active • Database Offline'}
                </div>
              )}
              
              {authState === 'LOGIN' && (
                <div className="space-y-6">
                  {/* Role Selector */}
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {[UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN].map(role => (
                      <button
                        key={role}
                        onClick={() => setLoginRole(role)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${loginRole === role ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">{t.emailLabel}</label>
                      <input 
                        type="email" required 
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                        placeholder={loginRole === UserRole.ADMIN ? "admin@gmail.com" : "user@gmail.com"}
                        value={loginForm.email}
                        onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">{t.passLabel}</label>
                      <input 
                        type={showPassword ? "text" : "password"} required 
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12" 
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 bottom-4 text-slate-400 hover:text-blue-600 transition-all"
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : (loginRole === UserRole.ADMIN ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700')}`}
                    >
                      {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
                      {t.loginBtn}
                    </button>

                    {/* Industry-Level Auth Options */}
                    <div className="space-y-3 pt-4 border-t border-slate-50">
                      <button 
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                      >
                        <i className="fab fa-google text-red-500"></i> Continue with Google
                      </button>
                      
                      {!isOtpSent ? (
                        <div className="flex gap-2">
                          <input 
                            type="email" 
                            placeholder="Email for OTP" 
                            className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold"
                            value={otpEmail}
                            onChange={e => setOtpEmail(e.target.value)}
                          />
                          <button 
                            type="button"
                            onClick={handleSendOTP}
                            className="bg-slate-900 text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
                          >
                            Send OTP
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Enter OTP" 
                            className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold"
                            value={otpToken}
                            onChange={e => setOtpToken(e.target.value)}
                          />
                          <button 
                            type="button"
                            onClick={handleVerifyOTP}
                            className="bg-green-600 text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
                          >
                            Verify
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between mt-4">
                      <button type="button" onClick={() => setAuthState('FORGOT_PASSWORD')} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600">{t.forgotPass}</button>
                      <button type="button" onClick={() => setAuthState('REGISTER')} className="text-[10px] font-black uppercase text-blue-600 hover:underline">{t.noAccount}</button>
                    </div>
                  </form>
                </div>
              )}

              {authState === 'REGISTER' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN].map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setRegisterForm({...registerForm, role})}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${registerForm.role === role ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">{t.usernameLabel}</label>
                      <input type="text" required className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" value={registerForm.username} onChange={e => setRegisterForm({...registerForm, username: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">{t.emailLabel}</label>
                      <input type="email" required className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">{t.ageLabel}</label>
                      <input type="number" required className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" value={registerForm.age || ''} onChange={e => setRegisterForm({...registerForm, age: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">{t.genderLabel}</label>
                      <select className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" value={registerForm.gender} onChange={e => setRegisterForm({...registerForm, gender: e.target.value})}>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">{t.passLabel}</label>
                    <input 
                      type={showPassword ? "text" : "password"} required minLength={6} 
                      className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold pr-10" 
                      value={registerForm.password} 
                      onChange={e => setRegisterForm({...registerForm, password: e.target.value})} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 bottom-3 text-slate-400 hover:text-blue-600 transition-all"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">{t.securityQ}</label>
                    <select className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" value={registerForm.security_question} onChange={e => setRegisterForm({...registerForm, security_question: e.target.value})}>
                      {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">{t.securityA}</label>
                    <input type="text" required className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" value={registerForm.security_answer} onChange={e => setRegisterForm({...registerForm, security_answer: e.target.value})} />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
                    {t.registerBtn}
                  </button>
                  <button type="button" onClick={() => setAuthState('LOGIN')} className="w-full text-[10px] font-black uppercase text-slate-400 text-center mt-4">{t.hasAccount}</button>
                </form>
              )}

              {authState === 'FORGOT_PASSWORD' && (
                <div className="space-y-6">
                  {resetForm.stage === 1 ? (
                    <form onSubmit={handleResetVerification} className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">{t.emailLabel}</label>
                        <input type="email" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={resetForm.email} onChange={e => setResetForm({...resetForm, email: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">
                          {t.findAccount}
                        </button>
                        <button 
                          type="button" 
                          onClick={handleForgotPasswordEmail}
                          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
                        >
                          Email Link
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-black uppercase text-blue-600 mb-1">{t.securityQ}</p>
                        <p className="text-sm font-bold text-slate-900">{resetUser?.security_question}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">{t.securityA}</label>
                        <input type="text" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={resetForm.answer} onChange={e => setResetForm({...resetForm, answer: e.target.value})} />
                      </div>
                      <div className="relative">
                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">New Password</label>
                        <input 
                          type={showPassword ? "text" : "password"} required minLength={6}
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold pr-12" 
                          value={resetForm.newPassword} 
                          onChange={e => setResetForm({...resetForm, newPassword: e.target.value})} 
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 bottom-4 text-slate-400 hover:text-blue-600 transition-all"
                        >
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                      <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">{t.resetBtn}</button>
                    </form>
                  )}
                  <button type="button" onClick={() => { setAuthState('LOGIN'); setResetForm(prev => ({ ...prev, stage: 1 })); }} className="w-full text-[10px] font-black uppercase text-slate-400 text-center">Back to Login</button>
                </div>
              )}
              
              <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                <button onClick={() => setIsLoggedIn(true)} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-all tracking-widest">
                  {t.guestBtn}
                </button>
              </div>
           </div>
           
           <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-10">
             Secure Clinical Gateway v6.1.0
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex overflow-hidden relative ${lang === Language.AR ? 'flex-row-reverse' : 'flex-row'} ${isLowBandwidth ? 'bg-white' : 'bg-slate-50'}`}>
      
      {/* Sidebar Toggle Button */}
      <div className="fixed top-4 left-4 right-4 z-[60] flex items-center justify-between no-print pointer-events-none">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-700 hover:text-blue-600 border border-slate-100 transition-all pointer-events-auto`}
          aria-label="Menu"
        >
          <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Export PDF Button (Conditional) */}
          {view === 'chat' && messages.length > 1 && (
            <button 
              onClick={() => setView('report')}
              className="bg-white/80 backdrop-blur-md border border-slate-200 px-4 py-2 h-10 rounded-2xl text-[10px] font-black uppercase tracking-tight shadow-sm hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
              title="Export PDF Report"
            >
              <i className="fas fa-file-pdf"></i>
              <span className="hidden sm:inline">Report</span>
            </button>
          )}

          {/* Chat History Button */}
          <button 
            onClick={() => { setShowHistory(!showHistory); setShowAnalysis(false); }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm border ${showHistory ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 hover:text-blue-600 border-slate-100'}`}
            title="Chat History"
          >
            <i className="fas fa-clock-rotate-left text-sm"></i>
          </button>

          {/* Clinical Explainability Button */}
          <button 
            onClick={() => { setShowAnalysis(!showAnalysis); setShowHistory(false); }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm border ${showAnalysis ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 hover:text-blue-600 border-slate-100'}`}
            title="Clinical Analysis"
          >
            <i className="fas fa-chart-line text-sm"></i>
          </button>

          {/* Online/Offline Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all ${isOnline ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Language Selection Modal */}
      {isLangMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t.selectLang}</h3>
                <button onClick={() => setIsLangMenuOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 gap-2">
                {Object.entries(TRANSLATIONS).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => { setLang(key as Language); setIsLangMenuOpen(false); }}
                    className={`p-5 rounded-2xl flex items-center justify-between transition-all font-black text-sm ${lang === key ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <span>{value.name}</span>
                    {lang === key && <i className="fas fa-check-circle"></i>}
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}

      {isSidebarOpen && (
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity no-print"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 ${lang === Language.AR ? 'right-0 border-l' : 'left-0 border-r'} w-72 bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out no-print flex flex-col border-slate-800 ${isSidebarOpen ? 'translate-x-0' : (lang === Language.AR ? 'translate-x-full' : '-translate-x-full')}`}>
        <div className="p-6 pt-20 flex flex-col gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('chat')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h1 className="text-white font-black tracking-tight text-xl">HealBot AI</h1>
          </div>
          
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input 
              type="text" 
              placeholder={(t as any).searchPlaceholder}
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
          {currentUser?.role === UserRole.ADMIN && t.adminPanel.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
            <button 
              onClick={() => navigateTo('admin')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all mb-4 ${view === 'admin' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <i className="fas fa-user-shield w-5"></i> {t.adminPanel}
            </button>
          )}

          {t.liveVoice.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
            <button 
              onClick={() => navigateTo('live')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all mb-4 ${view === 'live' ? 'bg-red-600 text-white shadow-md animate-pulse' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <i className="fas fa-headset w-5"></i> {t.liveVoice}
            </button>
          )}

          <button 
            onClick={() => navigateTo('profile')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all mb-4 ${view === 'profile' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <i className="fas fa-user-circle w-5"></i> My Profile
          </button>

          {t.mainChat.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
            <button 
              onClick={() => navigateTo('chat')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all mb-4 ${view === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <i className="fas fa-comment-medical w-5"></i> {t.mainChat}
            </button>
          )}

          {((t as any).govDashboard?.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
            (t as any).healthID?.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
            (t as any).outbreakDetection?.toLowerCase().includes(sidebarSearch.toLowerCase())) && (
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">National Health System</h3>
              <ul className="space-y-1">
                {(t as any).govDashboard?.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('gov')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'gov' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-shield-halved text-blue-400 w-5"></i> {(t as any).govDashboard}
                  </li>
                )}
                {(t as any).healthID?.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('health-id')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'health-id' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-id-card text-emerald-400 w-5"></i> {(t as any).healthID}
                  </li>
                )}
                {(t as any).outbreakDetection?.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('outbreak')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'outbreak' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-biohazard text-red-400 w-5"></i> {(t as any).outbreakDetection}
                  </li>
                )}
                {(t as any).healthRiskPrediction?.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('health-risk')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'health-risk' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-brain text-indigo-400 w-5"></i> {(t as any).healthRiskPrediction}
                  </li>
                )}
                {(t as any).ruralHealthPortal?.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('rural-health')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'rural-health' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-map-pin text-emerald-400 w-5"></i> {(t as any).ruralHealthPortal}
                  </li>
                )}
                {(t as any).policyAnalytics?.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('policy-analytics')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'policy-analytics' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-chart-pie text-blue-400 w-5"></i> {(t as any).policyAnalytics}
                  </li>
                )}
              </ul>
            </div>
          )}

          {(t.doctors.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
            t.telemedicine.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
            t.hospitals.toLowerCase().includes(sidebarSearch.toLowerCase())) && (
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">{t.consult}</h3>
              <ul className="space-y-1">
                {t.doctors.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('doctors')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'doctors' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-user-md text-blue-400 w-5"></i> {t.doctors}
                  </li>
                )}
                {t.telemedicine.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('telemedicine')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'telemedicine' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-video text-purple-400 w-5"></i> {t.telemedicine}
                  </li>
                )}
                {t.hospitals.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('hospitals')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'hospitals' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-hospital text-red-400 w-5"></i> {t.hospitals}
                  </li>
                )}
              </ul>
            </div>
          )}

          {t.insurance.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">{t.protection}</h3>
              <ul className="space-y-1">
                <li onClick={() => navigateTo('insurance')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'insurance' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <i className="fas fa-shield-heart text-amber-400 w-5"></i> {t.insurance}
                </li>
              </ul>
            </div>
          )}

          {t.medicines.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">{t.pharmacy}</h3>
              <ul className="space-y-1">
                <li onClick={() => navigateTo('medicines')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'medicines' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <i className="fas fa-pills text-green-400 w-5"></i> {t.medicines}
                </li>
              </ul>
            </div>
          )}

          {t.fitness.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">{t.wellness}</h3>
              <ul className="space-y-1">
                <li onClick={() => navigateTo('fitness')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'fitness' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                  <i className="fas fa-apple-alt text-orange-400 w-5"></i> {t.fitness}
                </li>
              </ul>
            </div>
          )}

          {((t as any).medicineAnalyzer.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
            (t as any).healthContent.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
            (t as any).glob.toLowerCase().includes(sidebarSearch.toLowerCase())) && (
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">LokyLabs Ecosystem</h3>
              <ul className="space-y-1">
                {(t as any).medicineAnalyzer.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('medicine-analyzer')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'medicine-analyzer' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-pills text-blue-400 w-5"></i> {(t as any).medicineAnalyzer}
                  </li>
                )}
                {(t as any).healthContent.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('health-content')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'health-content' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-book-medical text-green-400 w-5"></i> {(t as any).healthContent}
                  </li>
                )}
                {(t as any).glob.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('glob')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'glob' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-globe text-purple-400 w-5"></i> {(t as any).glob}
                  </li>
                )}
              </ul>
            </div>
          )}

          {((t as any).healthDashboard.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
            (t as any).medicineReminder.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
            (t as any).mentalHealth.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
            (t as any).healthRecords.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
            (t as any).appointmentBooking.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
            (t as any).diseaseAwareness.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
            (t as any).emergencySOS.toLowerCase().includes(sidebarSearch.toLowerCase())) && (
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">{(t as any).personal}</h3>
              <ul className="space-y-1">
                {(t as any).healthDashboard.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('health-dashboard')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'health-dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-chart-line text-blue-400 w-5"></i> {(t as any).healthDashboard}
                  </li>
                )}
                {(t as any).medicineReminder.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('medicine-reminder')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'medicine-reminder' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-pills text-emerald-400 w-5"></i> {(t as any).medicineReminder}
                  </li>
                )}
                {(t as any).mentalHealth.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('mental-health')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'mental-health' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-brain text-purple-400 w-5"></i> {(t as any).mentalHealth}
                  </li>
                )}
                {(t as any).healthRecords.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('health-records')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'health-records' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-file-medical text-cyan-400 w-5"></i> {(t as any).healthRecords}
                  </li>
                )}
                {(t as any).appointmentBooking.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('appointment-booking')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'appointment-booking' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-calendar-check text-indigo-400 w-5"></i> {(t as any).appointmentBooking}
                  </li>
                )}
                {(t as any).diseaseAwareness.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('disease-awareness')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'disease-awareness' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-book-medical text-orange-400 w-5"></i> {(t as any).diseaseAwareness}
                  </li>
                )}
                {(t as any).emergencySOS.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('emergency-sos')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'emergency-sos' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-exclamation-triangle text-red-500 w-5"></i> {(t as any).emergencySOS}
                  </li>
                )}
              </ul>
            </div>
          )}

          {((t as any).imageAnalysis.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
            (t as any).bloodAnalysis.toLowerCase().includes(sidebarSearch.toLowerCase())) && (
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">{(t as any).diagnostics}</h3>
              <ul className="space-y-1">
                {(t as any).imageAnalysis.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('image-analysis')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'image-analysis' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-microscope text-blue-400 w-5"></i> {(t as any).imageAnalysis}
                  </li>
                )}
                {(t as any).bloodAnalysis.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
                  <li onClick={() => navigateTo('blood-analysis')} className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center gap-3 text-sm font-medium ${view === 'blood-analysis' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <i className="fas fa-vial text-red-400 w-5"></i> {(t as any).bloodAnalysis}
                  </li>
                )}
              </ul>
            </div>
          )}

          {t.about.toLowerCase().includes(sidebarSearch.toLowerCase()) && (
            <button 
              onClick={() => navigateTo('about')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${view === 'about' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <i className="fas fa-circle-info w-5"></i> {t.about}
            </button>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 space-y-4">
          {/* Sync Status */}
          <div className="px-2">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 rounded-2xl border border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'}`}></div>
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-500 leading-none mb-1">Cloud Sync</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase">
                    {syncStatus === 'synced' ? 'All Synced' : syncStatus === 'syncing' ? 'Syncing...' : `${pendingSyncCount} Pending`}
                  </p>
                </div>
              </div>
              {syncStatus === 'pending' && isOnline && (
                <button onClick={syncOfflineData} className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] hover:bg-blue-700 transition-all">
                  <i className="fas fa-sync-alt"></i>
                </button>
              )}
            </div>
          </div>

          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t.system}</h3>
          
          <div className="flex items-center gap-2 px-2">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border border-transparent ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:border-slate-700'}`}
              title={theme === 'light' ? t.darkMode : t.lightMode}
            >
              <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-sm`}></i>
            </button>

            <button 
              onClick={() => setIsLangMenuOpen(true)}
              className="w-10 h-10 bg-slate-800 text-slate-400 rounded-xl transition-all flex items-center justify-center border border-transparent hover:border-slate-700 active:scale-95"
              title={t.selectLang}
            >
              <i className="fas fa-language text-sm"></i>
            </button>

            <button 
              onClick={() => setIsLowBandwidth(!isLowBandwidth)}
              className={`flex-1 h-10 px-3 rounded-xl text-[8px] font-black uppercase transition-colors flex items-center justify-center gap-2 ${isLowBandwidth ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              title={t.rural}
            >
              <i className="fas fa-signal"></i>
              <span>{isLowBandwidth ? 'Rural' : 'Rural'}</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-10 h-10 bg-slate-800 text-red-400 rounded-xl transition-all flex items-center justify-center border border-transparent hover:border-red-900/30"
              title="Logout"
            >
              <i className="fas fa-sign-out-alt text-sm"></i>
            </button>
          </div>
          
          <button 
            onClick={() => setPreferLocalAI(!preferLocalAI)}
            className={`w-full p-3 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${preferLocalAI ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:border-slate-600'}`}
          >
            <i className={`fas fa-microchip ${preferLocalAI ? 'animate-pulse' : ''}`}></i> {preferLocalAI ? 'Local AI Active' : 'Use Local AI (Ollama)'}
          </button>

          <button 
            onClick={clearHistory}
            className="w-full p-3 rounded-xl text-[9px] font-black uppercase text-red-400 border border-red-900/30 hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
          >
            <i className="fas fa-trash-alt"></i> {t.clear}
          </button>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col min-w-0 bg-white transition-all duration-300 overflow-y-auto`}>
        {view === 'chat' && (
          <ChatInterface 
            messages={messages} 
            onSend={handleSendMessage} 
            isLowBandwidth={isLowBandwidth}
            onGenerateReport={() => setView('report')}
            onClearHistory={clearHistory}
            lang={lang}
            isOnline={isOnline}
            isTyping={isTyping}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            showAnalysis={showAnalysis}
            setShowAnalysis={setShowAnalysis}
            onFeedback={handleFeedback}
            onDeleteMessage={onDeleteMessage}
            isTTSActive={isTTSActive}
            setIsTTSActive={setIsTTSActive}
          />
        )}
        {view === 'live' && (
          <LiveVoiceMode 
            userProfile={userProfile} 
            sessionId={sessionId}
            onBack={() => setView('chat')} 
          />
        )}
        {view === 'report' && <HealthReport messages={messages} userProfile={userProfile} sessionId={sessionId} onBack={() => setView('chat')} />}
        {view === 'fitness' && <WellnessHub onBack={() => setView('chat')} />}
        {view === 'insurance' && <InsuranceModule onBack={() => setView('chat')} />}
        {view === 'admin' && (
          isAdminLoggedIn ? (
            <AdminDashboard onBack={() => setView('chat')} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
              <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-amber-600 rounded-[2rem] flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-xl shadow-amber-200">
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Admin Portal</h2>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Authorized Personnel Only</p>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  const email = target.email.value;
                  const password = target.password.value;
                  if (email === "admin@lokylabs.com" && password === "admin123") {
                    setIsAdminLoggedIn(true);
                  } else {
                    showAlert("Invalid Admin Credentials ❌");
                  }
                }} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-2">Admin Email</label>
                    <input name="email" type="email" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500 transition-all" placeholder="admin@lokylabs.com" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-2">Password</label>
                    <input name="password" type="password" required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-amber-500 transition-all" placeholder="••••••••" />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-slate-200">
                    Verify Identity
                  </button>
                  <button type="button" onClick={() => setView('chat')} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                    Return to Patient View
                  </button>
                </form>
              </div>
            </div>
          )
        )}
        {view === 'about' && <AboutSupport userProfile={userProfile} sessionId={sessionId} onBack={() => setView('chat')} />}
        {view === 'image-analysis' && <MedicalImageAnalysis lang={lang} isOnline={isOnline} onBack={() => setView('chat')} />}
        {view === 'blood-analysis' && <BloodAnalysis userId={currentUser?.id || 'guest'} />}
        {view === 'medicine-analyzer' && <MedicineAnalyzer onBack={() => setView('chat')} />}
        {view === 'health-content' && <HealthContent onBack={() => setView('chat')} />}
        {view === 'glob' && <GlobView onBack={() => setView('chat')} />}
        {view === 'gov' && <GovDashboard onBack={() => setView('chat')} />}
        {view === 'health-id' && <HealthID user={currentUser} onBack={() => setView('chat')} />}
        {view === 'outbreak' && <OutbreakDetection onBack={() => setView('chat')} />}
        {view === 'health-risk' && <HealthRiskPrediction user={currentUser} onBack={() => setView('chat')} />}
        {view === 'rural-health' && <RuralHealthPortal onBack={() => setView('chat')} />}
        {view === 'policy-analytics' && <PolicyAnalytics onBack={() => setView('chat')} />}
        {view === 'profile' && currentUser && (
          <Profile 
            user={currentUser} 
            onUpdate={(u) => setCurrentUser(u)} 
            onLogout={handleLogout} 
          />
        )}
        {view === 'hospitals' && <HospitalFinder lang={lang} isOnline={isOnline} theme={theme} onBack={() => setView('chat')} />}
        {view === 'health-dashboard' && <HealthDashboard userId={currentUser?.id || 'guest'} />}
        {view === 'medicine-reminder' && <MedicineReminder userId={currentUser?.id || 'guest'} />}
        {view === 'emergency-sos' && <EmergencySOS userId={currentUser?.id || 'guest'} />}
        {view === 'mental-health' && <MentalHealth userId={currentUser?.id || 'guest'} />}
        {view === 'health-records' && <HealthRecords userId={currentUser?.id || 'guest'} />}
        {view === 'appointment-booking' && <AppointmentBooking userId={currentUser?.id || 'guest'} />}
        {view === 'disease-awareness' && <DiseaseAwareness />}
        {view !== 'chat' && view !== 'report' && view !== 'fitness' && view !== 'insurance' && view !== 'admin' && view !== 'live' && view !== 'about' && view !== 'image-analysis' && view !== 'blood-analysis' && view !== 'hospitals' && view !== 'health-dashboard' && view !== 'medicine-reminder' && view !== 'emergency-sos' && view !== 'mental-health' && view !== 'health-records' && view !== 'appointment-booking' && view !== 'disease-awareness' && (
          <MedicalServices type={view} onBack={() => setView('chat')} userProfile={userProfile} />
        )}
      </main>
    </div>
  );
};

export default App;
