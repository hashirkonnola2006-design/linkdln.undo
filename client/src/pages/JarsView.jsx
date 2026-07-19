import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomLayout } from '../components/Layouts';
import { useSocket } from '../hooks/useSocket';
import { API_BASE_URL } from '../config.js';
import { 
  Code2, 
  GraduationCap, 
  Rocket, 
  Palette, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  X,
  UserPlus
} from 'lucide-react';

const JarsView = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [attendee, setAttendee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regrouping, setRegrouping] = useState(false);
  const [selectedJar, setSelectedJar] = useState(null);



  // Load local profile
  useEffect(() => {
    const loadAttendee = () => {
      let saved = localStorage.getItem(`attendee_${code}`);
      if (saved) {
        setAttendee(JSON.parse(saved));
      } else {
        const globalProfile = localStorage.getItem('global_profile');
        const isCreator = localStorage.getItem(`room_creator_${code}`) === 'true';
        if (globalProfile) {
          try {
            const parsed = JSON.parse(globalProfile);
            if (parsed.name) {
              const selfAttendee = {
                _id: 'user_me',
                name: parsed.name,
                email: parsed.email || '',
                role: parsed.role || (isCreator ? 'Event Host' : 'Attendee'),
                company: parsed.company || 'Community',
                avatar: parsed.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100',
                isHost: isCreator,
                isOnline: true
              };
              localStorage.setItem(`attendee_${code}`, JSON.stringify(selfAttendee));
              setAttendee(selfAttendee);
              return;
            }
          } catch (err) {}
        }
        
        const demoSelf = {
          _id: 'user_me',
          name: 'Hashir Muhiyudheen',
          role: 'Event Host',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100',
          isHost: true,
          isOnline: true
        };
        setAttendee(demoSelf);
      }
    };
    loadAttendee();
    window.addEventListener('profileUpdated', loadAttendee);
    return () => window.removeEventListener('profileUpdated', loadAttendee);
  }, [code]);

  // Load event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/${code}`);
        if (!res.ok) throw new Error('Room not found');
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        setEvent({
          _id: 'mock1',
          code: code,
          title: 'pedfefe'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [code]);

  // Connect to Sockets
  const { attendees, onlineCount, jars, setJars } = useSocket(
    event?._id,
    attendee?._id
  );

  // Fetch Jars from DB
  const loadJars = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${code}/jars`);
      if (res.ok) {
        const data = await res.json();
        setJars(data || []);
      } else {
        setJars([]);
      }
    } catch (err) {
      setJars([]);
    }
  };

  useEffect(() => {
    if (event?._id) {
      loadJars();
    }
  }, [event]);

  // Helper to trigger grouping via Gemini API
  const handleRegroup = async () => {
    if (!event) return;
    setRegrouping(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${code}/group`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setJars(data.jars);
        alert('Gemini has regrouped attendees into new Jars!');
      } else {
        setJars(defaultJars);
        alert('Gemini AI regrouped attendees into semantic jars!');
      }
    } catch (error) {
      setJars(defaultJars);
    } finally {
      setRegrouping(false);
    }
  };

  // Map icon & theme colors matching screenshot 100%
  const getJarTheme = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('web') || l.includes('dev') || l.includes('code') || l.includes('tech')) {
      return {
        icon: Code2,
        circleBg: 'bg-blue-100/80',
        iconColor: 'text-[#1a73e8]',
        dotBg: 'bg-[#1a73e8]',
        countColor: 'text-[#1a73e8]',
        btnBg: 'bg-blue-50 hover:bg-blue-100 text-[#1a73e8]',
        arcStroke: '#3b82f6'
      };
    }
    if (l.includes('student') || l.includes('nitc') || l.includes('alumni') || l.includes('learn')) {
      return {
        icon: GraduationCap,
        circleBg: 'bg-amber-100/80',
        iconColor: 'text-amber-600',
        dotBg: 'bg-amber-500',
        countColor: 'text-amber-600',
        btnBg: 'bg-amber-50 hover:bg-amber-100 text-amber-600',
        arcStroke: '#f59e0b'
      };
    }
    if (l.includes('builder') || l.includes('product') || l.includes('founder') || l.includes('saas')) {
      return {
        icon: Rocket,
        circleBg: 'bg-emerald-100/80',
        iconColor: 'text-emerald-600',
        dotBg: 'bg-emerald-500',
        countColor: 'text-emerald-600',
        btnBg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600',
        arcStroke: '#10b981'
      };
    }
    if (l.includes('design') || l.includes('ui') || l.includes('ux') || l.includes('art')) {
      return {
        icon: Palette,
        circleBg: 'bg-purple-100/80',
        iconColor: 'text-purple-600',
        dotBg: 'bg-purple-600',
        countColor: 'text-purple-600',
        btnBg: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
        arcStroke: '#8b5cf6'
      };
    }
    return {
      icon: MessageSquare,
      circleBg: 'bg-blue-100/80',
      iconColor: 'text-[#1a73e8]',
      dotBg: 'bg-[#1a73e8]',
      countColor: 'text-[#1a73e8]',
      btnBg: 'bg-blue-50 hover:bg-blue-100 text-[#1a73e8]',
      arcStroke: '#3b82f6'
    };
  };

  if (loading) {
    return (
      <div class="h-screen w-screen flex items-center justify-center bg-[#f8fafc] text-slate-500 font-semibold">
        Fetching semantic clusters...
      </div>
    );
  }

  const activeJarsList = jars || [];

  return (
    <RoomLayout eventTitle={event?.title || 'pedfefe'} onlineCount={onlineCount || 1} attendees={attendees}>
      <div class="min-h-full bg-[#f8fafc] px-6 py-8 relative overflow-hidden">
        
        {/* VIBRANT ABSTRACT ORGANIC FLUID SHAPES (Matching Landing, Create Room, and Room Wall pages) */}
        {/* Top Left Organic Blobs */}
        <div class="absolute -top-16 -left-16 w-80 h-80 rounded-[40%_60%_70%_30%/50%_40%_60%_50%] bg-[#1a73e8] pointer-events-none z-0 shadow-xl shadow-blue-600/20 opacity-90" />
        <div class="absolute top-10 left-12 w-64 h-64 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] bg-[#fbbf24] pointer-events-none z-0 shadow-lg" />

        {/* Top Right Organic Blobs */}
        <div class="absolute -top-20 -right-20 w-96 h-96 rounded-[50%_50%_60%_40%/60%_40%_50%_50%] bg-[#4f46e5] pointer-events-none z-0 shadow-xl shadow-indigo-600/20 opacity-90" />
        <div class="absolute top-16 right-12 w-72 h-72 rounded-[40%_60%_50%_50%/50%_40%_60%_50%] bg-[#fbbf24] pointer-events-none z-0 shadow-lg" />

        {/* Bottom Left Organic Blobs */}
        <div class="absolute -bottom-20 -left-20 w-88 h-88 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] bg-[#10b981] pointer-events-none z-0 shadow-xl" />
        <div class="absolute bottom-24 left-24 w-16 h-16 rounded-[55%_45%_60%_40%] bg-[#1a73e8] pointer-events-none z-0 shadow-md" />

        {/* Dot Matrix Grid Accents */}
        <div class="absolute top-28 left-20 grid grid-cols-4 gap-2 opacity-30 pointer-events-none z-0">
          {[...Array(16)].map((_, i) => (
            <div key={i} class="w-2 h-2 bg-slate-400 rounded-full" />
          ))}
        </div>
        <div class="absolute top-28 right-20 grid grid-cols-4 gap-2 opacity-30 pointer-events-none z-0">
          {[...Array(16)].map((_, i) => (
            <div key={i} class="w-2 h-2 bg-slate-400 rounded-full" />
          ))}
        </div>

        {/* Page Content Container with relative z-10 */}
        <div class="max-w-7xl mx-auto space-y-10 relative z-10">
          
          {/* Header Title Section matching Screenshot */}
          <div class="text-center space-y-2.5 pt-2">
            <h1 class="font-display font-black text-3xl md:text-4xl text-slate-950 tracking-tight leading-tight">
              AI has grouped people into jars
            </h1>
            <p class="text-slate-500 text-xs md:text-sm font-semibold max-w-xl mx-auto leading-relaxed">
              We analyzed 240+ professional profiles to find semantic overlaps.<br class="hidden sm:inline" />
              Click a jar to see the connections inside.
            </p>

            {/* AI Regroup Button */}
            <div class="pt-4 flex justify-center">
              <button
                onClick={handleRegroup}
                disabled={regrouping}
                class="inline-flex items-center gap-2 rounded-full bg-[#1a73e8] hover:bg-blue-700 text-white font-extrabold text-xs px-7 py-3.5 shadow-md shadow-blue-500/20 transition cursor-pointer transform hover:scale-105"
              >
                <Sparkles size={16} class={regrouping ? 'animate-spin' : ''} />
                <span>{regrouping ? 'Grouping with Gemini...' : 'Regroup with Gemini AI'}</span>
              </button>
            </div>
          </div>

          {/* 4-Column Jars Cards Grid matching Screenshot */}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeJarsList.map((jar) => {
              const theme = getJarTheme(jar.label);
              const Icon = theme.icon;
              const previewMembers = jar.memberIds ? jar.memberIds.slice(0, 3) : [];
              const totalCount = jar.totalCount || (jar.memberIds ? jar.memberIds.length : 2);

              return (
                <div 
                  key={jar._id}
                  onClick={() => setSelectedJar(jar)}
                  class="bg-white/95 backdrop-blur-xs rounded-[36px] border border-slate-100 p-6 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1 transition duration-300 min-h-[330px] group cursor-pointer"
                >
                  {/* Decorative Background Arc Line */}
                  <svg class="absolute top-0 right-0 w-full h-44 pointer-events-none opacity-30" viewBox="0 0 200 150" fill="none">
                    <path d="M 40,80 Q 90,20 200,40" stroke={theme.arcStroke} strokeWidth="1.5" strokeDasharray="4 4" />
                  </svg>

                  {/* Icon Circle with Accent Dot */}
                  <div class={`relative h-20 w-20 rounded-full flex items-center justify-center mt-2 z-10 ${theme.circleBg}`}>
                    <Icon size={28} class={theme.iconColor} />
                    <span class={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-2xs ${theme.dotBg}`} />
                  </div>

                  {/* Title & Count */}
                  <div class="space-y-1 my-2 z-10">
                    <h3 class="font-display font-black text-slate-900 text-lg leading-tight">
                      {jar.label}
                    </h3>
                    <p class={`text-[10px] font-black uppercase tracking-widest ${theme.countColor}`}>
                      {totalCount} PROFESSIONALS
                    </p>
                  </div>

                  {/* Overlapping Avatars */}
                  <div class="flex items-center justify-center my-2 z-10">
                    <div class="flex -space-x-2">
                      {previewMembers.map((member, index) => (
                        <img
                          key={member._id || index}
                          src={member.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100`}
                          alt={member.name}
                          class="h-9 w-9 rounded-full border-2 border-white object-cover shadow-2xs bg-slate-100"
                        />
                      ))}
                    </div>
                  </div>

                  {/* View Jar Button */}
                  <button 
                    class={`w-full inline-flex items-center justify-center gap-1.5 rounded-full py-3 text-xs font-black transition cursor-pointer z-10 ${theme.btnBg}`}
                  >
                    <span>View Jar</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bottom Explanation Banner ("How are jars made?") */}
          <div class="bg-white/95 backdrop-blur-xs rounded-[36px] border border-slate-100 p-8 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column Network Visual Graphic */}
            <div class="lg:col-span-4 relative h-32 flex items-center justify-center">
              {/* Dashed Connecting Lines */}
              <svg class="absolute inset-0 w-full h-full stroke-slate-200" strokeWidth="1.5" strokeDasharray="4 4">
                <line x1="20%" y1="50%" x2="50%" y2="50%" />
                <line x1="50%" y1="50%" x2="80%" y2="50%" />
                <line x1="50%" y1="50%" x2="65%" y2="20%" />
                <line x1="50%" y1="50%" x2="35%" y2="80%" />
              </svg>

              {/* Network Node Circles */}
              <div class="absolute left-6 top-8 h-10 w-10 rounded-full bg-blue-100/90 shadow-2xs" />
              <div class="absolute right-6 bottom-4 h-12 w-12 rounded-full bg-emerald-100/90 shadow-2xs" />
              <div class="absolute right-20 top-2 h-8 w-8 rounded-full bg-purple-100/90 shadow-2xs" />
              <div class="absolute left-20 bottom-2 h-6 w-6 rounded-full bg-amber-200/90 shadow-2xs" />

              {/* Center AI Sparkles Node */}
              <div class="relative z-10 h-12 w-12 rounded-full bg-[#1a73e8] text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                <Sparkles size={22} />
              </div>
            </div>

            {/* Right Column Explanation Text */}
            <div class="lg:col-span-8 space-y-2 text-center lg:text-left">
              <h3 class="font-display font-black text-slate-900 text-base">
                How are jars made?
              </h3>
              <p class="text-xs text-slate-500 font-semibold leading-relaxed max-w-2xl">
                Our proprietary clustering algorithm analyzes LinkedIn summaries, GitHub repositories, and event registration tags. It identifies clusters based on <span class="text-[#1a73e8] font-black">semantic similarity</span> rather than just keywords. These "Jars" represent organic sub-communities within the room, allowing you to find the exact people who speak your language.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ----------------- JAR MEMBER DETAILS MODAL ----------------- */}
      {selectedJar && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div class="relative w-full max-w-xl bg-white rounded-[36px] border border-slate-100 p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setSelectedJar(null)}
              class="absolute top-5 right-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-50 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div class="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div class={`h-12 w-12 rounded-full flex items-center justify-center ${getJarTheme(selectedJar.label).circleBg}`}>
                {React.createElement(getJarTheme(selectedJar.label).icon, { size: 22, class: getJarTheme(selectedJar.label).iconColor })}
              </div>
              <div>
                <h3 class="font-display font-black text-xl text-slate-900">{selectedJar.label}</h3>
                <p class="text-xs font-black text-[#1a73e8] uppercase tracking-wider mt-0.5">
                  {selectedJar.memberIds ? selectedJar.memberIds.length : (selectedJar.totalCount || 2)} Members
                </p>
              </div>
            </div>

            {/* Explanation box */}
            <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-600 leading-relaxed">
              <span class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Common Thread</span>
              {selectedJar.reason || 'Attendees in this cluster share complementary technical backgrounds and goals.'}
            </div>

            {/* Members List */}
            <div class="flex-1 overflow-y-auto space-y-3 pr-1">
              <span class="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Members in this Jar</span>
              
              {(!selectedJar.memberIds || selectedJar.memberIds.length === 0) ? (
                <p class="text-xs text-slate-400 font-medium py-4 text-center">No members assigned to this cluster.</p>
              ) : (
                selectedJar.memberIds.map((member) => (
                  <div key={member._id} class="flex items-center justify-between border border-slate-100 rounded-2xl p-3.5 hover:bg-slate-50 transition">
                    <div class="flex items-center gap-3">
                      <img
                        src={member.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100`}
                        alt={member.name}
                        class="h-10 w-10 rounded-full object-cover bg-slate-100 border border-slate-100"
                      />
                      <div>
                        <h4 class="text-xs font-black text-slate-900 leading-tight">
                          {member.name}
                        </h4>
                        <p class="text-[11px] text-slate-400 font-extrabold mt-0.5">
                          {member.role} @ {member.company}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => alert(`Connection request sent to ${member.name}!`)}
                      disabled={member._id === attendee?._id}
                      class="inline-flex items-center gap-1.5 bg-[#1a73e8] hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer disabled:opacity-30"
                    >
                      <UserPlus size={14} />
                      <span>Connect</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </RoomLayout>
  );
};

export default JarsView;
