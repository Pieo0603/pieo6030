import React, { useState, useEffect } from 'react';
import StarBackground from './components/StarBackground';
import Countdown from './components/Countdown';
import MessageForm from './components/MessageForm';
import MessageList from './components/MessageList';
import MusicPlayer from './components/MusicPlayer';
import AdminDashboard from './components/AdminDashboard';
import StudyTracker from './components/StudyTracker';
import MusicTab from './components/MusicTab';
import { Message, ThemeConfig } from './types';
import { Settings, Home, BookOpen, Palette, Music } from 'lucide-react';

// Firebase imports
import { db } from './services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, writeBatch } from 'firebase/firestore';

// Use a fixed date for THPT 2026 (Approximately late June)
const EXAM_DATE = new Date('2026-06-27T07:30:00');

// Theme Definitions
const THEMES: Record<string, ThemeConfig> = {
  blue: {
    id: 'blue',
    hex: '#3b82f6', // blue-500
    text: 'text-cyan-400',
    textDim: 'text-cyan-400/50',
    border: 'border-cyan-500',
    shadow: 'shadow-cyan-500/20',
    gradientTitle: 'from-cyan-400 via-blue-400 to-indigo-400',
    buttonGradient: 'from-cyan-500 to-blue-600',
    icon: 'text-cyan-400',
    inputFocus: 'focus:border-cyan-500 focus:ring-cyan-500'
  },
  green: {
    id: 'green',
    hex: '#10b981', // emerald-500
    text: 'text-emerald-400',
    textDim: 'text-emerald-400/50',
    border: 'border-emerald-500',
    shadow: 'shadow-emerald-500/20',
    gradientTitle: 'from-emerald-400 via-green-400 to-lime-400',
    buttonGradient: 'from-emerald-500 to-green-600',
    icon: 'text-emerald-400',
    inputFocus: 'focus:border-emerald-500 focus:ring-emerald-500'
  },
  gray: {
    id: 'gray',
    hex: '#94a3b8', // slate-400
    text: 'text-gray-300',
    textDim: 'text-gray-400/50',
    border: 'border-gray-500',
    shadow: 'shadow-white/10',
    gradientTitle: 'from-gray-200 via-slate-400 to-zinc-400',
    buttonGradient: 'from-gray-500 to-slate-600',
    icon: 'text-gray-300',
    inputFocus: 'focus:border-gray-500 focus:ring-gray-500'
  },
  pink: {
    id: 'pink',
    hex: '#ec4899', // pink-500
    text: 'text-pink-400',
    textDim: 'text-pink-400/50',
    border: 'border-pink-500',
    shadow: 'shadow-pink-500/20',
    gradientTitle: 'from-pink-400 via-purple-400 to-indigo-400',
    buttonGradient: 'from-orange-400 to-pink-500',
    icon: 'text-pink-400',
    inputFocus: 'focus:border-pink-500 focus:ring-pink-500'
  },
  gold: {
    id: 'gold',
    hex: '#f59e0b', // amber-500
    text: 'text-amber-400',
    textDim: 'text-amber-400/50',
    border: 'border-amber-500',
    shadow: 'shadow-amber-500/20',
    gradientTitle: 'from-amber-300 via-yellow-400 to-orange-400',
    buttonGradient: 'from-amber-500 to-orange-600',
    icon: 'text-amber-400',
    inputFocus: 'focus:border-amber-500 focus:ring-amber-500'
  }
};

type Tab = 'home' | 'study' | 'music';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES.pink);
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showThemePicker, setShowThemePicker] = useState(false);

  // YouTube State
  const [youtubeVideo, setYoutubeVideo] = useState<{id: string, title: string, channel: string, cover: string} | null>(null);

  // Listen for realtime updates from Firebase
  useEffect(() => {
    // Reference to the 'wishes' collection
    try {
        const q = query(collection(db, "wishes"), orderBy("timestamp", "desc"));
        
        // Subscribe to updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Message[];
          setMessages(msgs);
        }, (error) => {
            console.error("Lỗi khi đọc dữ liệu Firebase:", error);
        });

        return () => unsubscribe();
    } catch (e) {
        console.error("Lỗi khởi tạo Firebase:", e);
    }
  }, []);

  const handleAddMessage = async (newMsg: Omit<Message, 'id' | 'timestamp'>) => {
     // Error handling is now in MessageForm
      await addDoc(collection(db, "wishes"), {
        ...newMsg,
        timestamp: Date.now()
      });
  };

  const handleOpenAdmin = () => {
    setShowAdmin(true);
  };

  // Delete specific messages (used by Admin Dashboard)
  const handleDeleteMessages = async (idsToDelete: string[]) => {
      try {
        const batch = writeBatch(db);
        idsToDelete.forEach(id => {
            const docRef = doc(db, "wishes", id);
            batch.delete(docRef);
        });
        await batch.commit();
      } catch (error) {
        console.error("Error deleting documents: ", error);
        alert("Có lỗi khi xóa tin nhắn.");
      }
  };

  // Handler for selecting video from Music Tab
  const handleSelectVideo = (videoId: string, title: string, channel: string, thumbnail: string) => {
     setYoutubeVideo({ id: videoId, title, channel, cover: thumbnail });
     // Auto switch back to home or study if preferred, or stay. Staying is better for "DJ mode".
  };

  return (
    <div className="min-h-screen text-white relative flex flex-col items-center">
      <StarBackground />
      
      {/* HEADER / NAVIGATION BAR */}
      {!showAdmin && (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-gradient-to-b from-[#0f0c29] to-transparent backdrop-blur-[2px] flex justify-between items-start">
           {/* Left: Theme Trigger */}
           <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all shadow-lg"
              >
                 <Palette size={18} />
              </button>
              
              {/* Collapsible Theme Picker */}
              {showThemePicker && (
                <div className="glass-panel p-2 rounded-2xl flex flex-col gap-2 animate-in slide-in-from-left-2 duration-200 w-10 items-center">
                  {Object.values(THEMES).map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => { setCurrentTheme(theme); setShowThemePicker(false); }}
                      className={`w-6 h-6 rounded-full transition-all duration-300 relative ${
                        currentTheme.id === theme.id ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: theme.hex }}
                    />
                  ))}
                </div>
              )}
           </div>

           {/* Center: Tabs */}
           <div className="flex gap-1 bg-black/60 backdrop-blur-xl p-1 rounded-full border border-white/10 shadow-2xl">
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full transition-all duration-300 text-xs md:text-sm font-bold ${activeTab === 'home' ? `bg-white text-black shadow-lg` : 'text-gray-400 hover:text-white'}`}
              >
                <Home size={14} />
                <span className="hidden md:inline">Trang chủ</span>
              </button>
              <button 
                onClick={() => setActiveTab('study')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full transition-all duration-300 text-xs md:text-sm font-bold ${activeTab === 'study' ? `bg-white text-black shadow-lg` : 'text-gray-400 hover:text-white'}`}
              >
                <BookOpen size={14} />
                <span className="hidden md:inline">Học tập</span>
              </button>
              <button 
                onClick={() => setActiveTab('music')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full transition-all duration-300 text-xs md:text-sm font-bold ${activeTab === 'music' ? `bg-white text-black shadow-lg` : 'text-gray-400 hover:text-white'}`}
              >
                <Music size={14} />
                <span className="hidden md:inline">Âm nhạc</span>
              </button>
           </div>

           {/* Right: Admin Button */}
           <button 
              onClick={handleOpenAdmin} 
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all shadow-lg"
           >
              <Settings size={18} />
           </button>
        </div>
      )}

      {/* Main Admin Dashboard Overlay */}
      {showAdmin && (
          <AdminDashboard 
            messages={messages} 
            onDeleteMessages={handleDeleteMessages} 
            onClose={() => setShowAdmin(false)}
            theme={currentTheme}
          />
      )}

      <div className={`w-full ${showAdmin ? 'hidden' : ''}`}>
        
        {/* TAB 1: HOME / COUNTDOWN / WISHES */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-500 pb-24">
            <header className="mt-20 md:mt-24 text-center px-4 z-10">
                <h1 className={`text-2xl md:text-5xl font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.gradientTitle} mb-3 drop-shadow-lg transition-all duration-500 leading-tight`}>
                Đếm ngược <br className="md:hidden" /> THPT 2026
                </h1>
                <p className="text-gray-400 text-xs md:text-base font-light max-w-lg mx-auto">
                "Hành trình vạn dặm bắt đầu từ một bước chân." <br/> Cùng nhau nỗ lực nhé!
                </p>
            </header>

            <main className="w-full max-w-7xl px-4 z-10 flex flex-col items-center mx-auto">
                <Countdown targetDate={EXAM_DATE} theme={currentTheme} />
                
                <MessageForm onAddMessage={handleAddMessage} theme={currentTheme} />
                
                <MessageList messages={messages} theme={currentTheme} />
            </main>
            
            <footer className="w-full text-center py-6 text-[10px] text-gray-600 z-10">
              <p>Made with  Huỳnh Phước Lộc❤️ for 2k8</p>
           </footer>
          </div>
        )}

        {/* TAB 2: STUDY TRACKER */}
        {activeTab === 'study' && (
           <div className="animate-in fade-in slide-in-from-right-4 duration-500 pt-20 pb-24">
               <StudyTracker theme={currentTheme} />
           </div>
        )}

         {/* TAB 3: MUSIC SEARCH */}
         {activeTab === 'music' && (
           <MusicTab theme={currentTheme} onSelectVideo={handleSelectVideo} />
        )}

        <MusicPlayer theme={currentTheme} youtubeVideo={youtubeVideo} />
      </div>
    </div>
  );
};

export default App;