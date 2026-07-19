import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrganizerLayout, UserLayout } from '../components/Layouts';
import { API_BASE_URL } from '../config.js';
import { 
  ArrowUpRight, 
  ArrowRight,
  TrendingUp, 
  Users, 
  FolderHeart, 
  Calendar, 
  Activity, 
  ShieldAlert, 
  Trash2, 
  RotateCw,
  Clock,
  Sparkles,
  Star,
  BarChart2,
  ChevronDown,
  MessageSquare,
  UserPlus,
  X,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Toggles
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [comparePrevious, setComparePrevious] = useState(false);
  const [hoveredChartIndex, setHoveredChartIndex] = useState(null);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInputName, setDeleteInputName] = useState('');
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);

  // Room Statistics State (Fresh zero state for live test drive)
  const [stats, setStats] = useState({
    liveNow: 0,
    totalJoins: 0,
    totalJoinsDiff: '0%',
    peakTraffic: 'N/A',
    activeJars: 0,
    topPerformer: 'N/A',
    jarPopularity: []
  });

  // Recent Activity Feed State (Clean empty state)
  const [recentActivities, setRecentActivities] = useState([]);

  // Chart Data Points
  const chartData = [
    { day: 'MON', current: 0, previous: 0 },
    { day: 'TUE', current: 0, previous: 0 },
    { day: 'WED', current: 0, previous: 0 },
    { day: 'THU', current: 0, previous: 0 },
    { day: 'FRI', current: 0, previous: 0 },
    { day: 'SAT', current: 0, previous: 0 },
    { day: 'SUN', current: 0, previous: 0 }
  ];

  // Creator Security Check
  const isCreator = (() => {
    const isLocalCreator = localStorage.getItem(`room_creator_${code}`) === 'true';
    if (isLocalCreator) return true;

    const savedAttendee = localStorage.getItem(`attendee_${code}`);
    if (savedAttendee) {
      try {
        const parsed = JSON.parse(savedAttendee);
        if (parsed.isHost) return true;
        if (event && parsed.name && event.hostName && parsed.name === event.hostName) return true;
      } catch (e) {}
    }

    const savedProfile = localStorage.getItem('global_profile');
    if (savedProfile && event && event.hostName) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name && parsed.name.trim().toLowerCase() === event.hostName.trim().toLowerCase()) return true;
      } catch (e) {}
    }

    // Default to true for organizer accessing dashboard route
    return true;
  })();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    const expectedName = (event?.title || code).trim().toLowerCase();
    if (deleteInputName.trim().toLowerCase() !== expectedName) {
      alert(`Room name does not match. Please type exactly "${event?.title || code}" to confirm deletion.`);
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/api/events/${code}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting event room:', err);
    }

    // 1. Remove room from local_created_rooms array in localStorage
    const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
    const updatedLocal = localRooms.filter(r => r.code !== code);
    localStorage.setItem('local_created_rooms', JSON.stringify(updatedLocal));

    // 2. Remove creator, attendee, and notes keys
    localStorage.removeItem(`room_creator_${code}`);
    localStorage.removeItem(`attendee_${code}`);
    localStorage.removeItem(`room_notes_${code}`);

    // 3. Dispatch custom event for real-time room deletion sync across app
    window.dispatchEvent(new CustomEvent('roomDeleted', { detail: { code } }));

    alert(`Room "${event?.title || code}" has been permanently deleted.`);
    navigate('/rooms');
  };

  // Fetch event details
  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/${code}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        } else {
          const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
          const foundLocal = localRooms.find(r => r.code === code);
          setEvent(foundLocal || { code, title: 'Room ' + code });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };

    if (code) {
      fetchEventData();
    }
  }, [code]);

  // Load all rooms for project selector
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events`);
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (err) {}
    };
    fetchRooms();
  }, []);

  const handleRoomSelect = (selectedCode) => {
    navigate(`/rooms/${selectedCode}/dashboard`);
  };

  if (!isCreator && !loading) {
    return (
      <UserLayout>
        <div class="max-w-md mx-auto py-20 text-center space-y-4">
          <div class="h-16 w-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert size={32} />
          </div>
          <h2 class="font-display font-bold text-2xl text-slate-800 tracking-tight">Organizer Access Only</h2>
          <p class="text-slate-500 text-xs leading-relaxed">
            Only the creator of this room has access to the organizer portal.
          </p>
          <button 
            onClick={() => navigate(`/rooms/${code}/feed`)}
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition cursor-pointer inline-block"
          >
            Return to Room Feed
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <OrganizerLayout
      eventTitle={event?.title || 'pedfefe'}
      activeRoomCode={code}
      rooms={rooms.length > 0 ? rooms : [{ code, title: event?.title || 'pedfefe' }]}
      onRoomSelect={handleRoomSelect}
      onDeleteRoom={() => setShowDeleteModal(true)}
    >
      <div class="space-y-6">
        
        {/* Real-time Banner Header matching Mockup */}
        <div class="relative bg-slate-200/50 rounded-[28px] p-5 border border-slate-200/60 overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          
          {/* Abstract corner background accents */}
          <div class="absolute -top-3 -left-3 w-20 h-20 bg-[#2563eb]/10 rounded-br-full pointer-events-none" />
          <div class="absolute -bottom-3 -right-3 w-16 h-16 bg-[#fbbf24] rounded-tl-full pointer-events-none" />
          <div class="absolute top-4 right-28 w-2 h-2 bg-emerald-400 rounded-full pointer-events-none animate-pulse" />

          <div class="relative z-10 flex items-center gap-3">
            <span class="inline-flex items-center gap-2 rounded-full bg-[#e6f4ea] text-[#137333] border border-emerald-200/80 px-4 py-1.5 text-xs font-black shadow-2xs shrink-0">
              <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {stats.liveNow} LIVE NOW
            </span>
            <h2 class="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
              Real-time active room engagement dashboard
            </h2>
          </div>

          <div class="relative z-10 flex items-center gap-4">
            <span class="text-xs font-extrabold text-slate-400 flex items-center gap-1.5 shrink-0">
              <Clock size={14} />
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              class="inline-flex items-center gap-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs px-5 py-2 transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RotateCw size={14} class={isRefreshing ? 'animate-spin text-blue-600' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Stat Cards matching Mockup */}
        {loading ? (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} class="bg-white rounded-[28px] border border-slate-200/60 p-6 space-y-3 animate-pulse h-40" />
            ))}
          </div>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Total Joins */}
            <div 
              onClick={() => setShowAttendeeModal(true)}
              class="relative bg-white rounded-[28px] border border-slate-200/60 p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer space-y-4 overflow-hidden group"
            >
              <div class="flex items-center justify-between">
                <div class="h-12 w-12 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center font-bold">
                  <Users size={22} />
                </div>
                <span class="text-xs font-black text-emerald-600 flex items-center gap-1">
                  <TrendingUp size={14} /> {stats.totalJoinsDiff}
                </span>
              </div>
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">TOTAL JOINS</span>
                <span class="font-display text-3xl font-black text-slate-900 block mt-1">
                  {stats.totalJoins.toLocaleString()}
                </span>
              </div>
              <p class="text-xs font-extrabold text-[#1a73e8] flex items-center gap-1 group-hover:underline">
                <span>View attendee log</span>
                <ArrowRight size={13} />
              </p>
              {/* Dot grid accent */}
              <div class="absolute bottom-3 right-3 grid grid-cols-4 gap-1 opacity-20 pointer-events-none">
                {[...Array(8)].map((_, i) => <div key={i} class="w-1 h-1 bg-slate-400 rounded-full" />)}
              </div>
            </div>

            {/* Card 2: Peak Traffic Time */}
            <div 
              onClick={() => navigate(`/rooms/${code}/analytics`)}
              class="relative bg-white rounded-[28px] border border-slate-200/60 p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer space-y-4 overflow-hidden group"
            >
              <div class="flex items-center justify-between">
                <div class="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Activity size={22} />
                </div>
                <span class="text-[10px] font-black bg-purple-50 text-purple-600 px-3 py-1 rounded-full uppercase">
                  PEAK
                </span>
              </div>
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">PEAK TRAFFIC TIME</span>
                <span class="font-display text-3xl font-black text-slate-900 block mt-1">
                  {stats.peakTraffic}
                </span>
              </div>
              <p class="text-xs font-extrabold text-purple-600 flex items-center gap-1 group-hover:underline">
                <span>View hourly breakdown</span>
                <ArrowRight size={13} />
              </p>
              <div class="absolute -bottom-4 -right-4 w-16 h-16 bg-purple-100/50 rounded-tl-full pointer-events-none" />
            </div>

            {/* Card 3: Active Jars */}
            <div 
              onClick={() => navigate(`/rooms/${code}/jars`)}
              class="relative bg-white rounded-[28px] border border-slate-200/60 p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer space-y-4 overflow-hidden group"
            >
              <div class="flex items-center justify-between">
                <div class="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FolderHeart size={22} />
                </div>
                <span class="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase">
                  AI SORTED
                </span>
              </div>
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ACTIVE JARS</span>
                <span class="font-display text-3xl font-black text-slate-900 block mt-1">
                  {stats.activeJars}
                </span>
              </div>
              <p class="text-xs font-extrabold text-emerald-600 flex items-center gap-1 group-hover:underline">
                <span>Browse Jars breakdown</span>
                <ArrowRight size={13} />
              </p>
              <div class="absolute -bottom-4 -right-4 w-16 h-16 bg-emerald-100/50 rounded-tl-full pointer-events-none" />
            </div>

            {/* Card 4: Top Performer */}
            <div 
              onClick={() => navigate(`/rooms/${code}/jars`)}
              class="relative bg-white rounded-[28px] border border-slate-200/60 p-6 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer space-y-4 overflow-hidden group"
            >
              <div class="flex items-center justify-between">
                <div class="h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                  <Star size={22} />
                </div>
                <span class="text-[10px] font-black bg-amber-50 text-amber-600 px-3 py-1 rounded-full uppercase">
                  TOP JAR
                </span>
              </div>
              <div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">TOP PERFORMER</span>
                <span class="font-display text-2xl font-black text-slate-900 block mt-1 truncate">
                  {stats.topPerformer}
                </span>
              </div>
              <p class="text-xs font-extrabold text-amber-600 flex items-center gap-1 group-hover:underline">
                <span>428 members joined</span>
                <ArrowRight size={13} />
              </p>
              <div class="absolute -bottom-4 -right-4 w-16 h-16 bg-amber-100/50 rounded-tl-full pointer-events-none" />
            </div>

          </div>
        )}

        {/* Charts Row matching Mockup */}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* JOINS OVER TIME CHART CARD */}
          <div class="lg:col-span-8 bg-white rounded-[28px] border border-slate-200/60 p-8 shadow-2xs space-y-6 relative overflow-hidden flex flex-col justify-between">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="h-11 w-11 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center font-bold">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h3 class="font-display font-black text-slate-900 text-lg">Joins Over Time</h3>
                  <p class="text-xs text-slate-400 font-medium">Real-time attendance tracking for current session</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <label class="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={comparePrevious}
                    onChange={(e) => setComparePrevious(e.target.checked)}
                    class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>vs prev period</span>
                </label>

                <div class="relative">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    class="appearance-none bg-slate-100/80 border border-slate-200/80 rounded-2xl px-4 py-2 pr-8 text-xs font-extrabold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="All Time">All Time</option>
                  </select>
                  <ChevronDown size={14} class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Interactive Area Chart */}
            <div class="relative w-full aspect-[21/9] p-2 mt-2">
              {/* Highlight Tooltip Badge over SAT point */}
              <div class="absolute top-8 right-[22%] bg-[#1a73e8] text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-lg z-10 flex items-center gap-1">
                <span>SAT · 1,350</span>
              </div>

              <svg viewBox="0 0 600 220" class="w-full h-full overflow-visible" fill="none">
                <line x1="40" y1="30" x2="560" y2="30" stroke="#f1f5f9" stroke-width="1.5" />
                <line x1="40" y1="80" x2="560" y2="80" stroke="#f1f5f9" stroke-width="1.5" />
                <line x1="40" y1="130" x2="560" y2="130" stroke="#f1f5f9" stroke-width="1.5" />
                <line x1="40" y1="180" x2="560" y2="180" stroke="#f1f5f9" stroke-width="1.5" />

                <text x="30" y="34" class="fill-slate-400 font-bold text-[10px]" text-anchor="end">2000</text>
                <text x="30" y="84" class="fill-slate-400 font-bold text-[10px]" text-anchor="end">1500</text>
                <text x="30" y="134" class="fill-slate-400 font-bold text-[10px]" text-anchor="end">1000</text>
                <text x="30" y="184" class="fill-slate-400 font-bold text-[10px]" text-anchor="end">500</text>
                <text x="30" y="214" class="fill-slate-400 font-bold text-[10px]" text-anchor="end">0</text>

                <defs>
                  <linearGradient id="dashboardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#2563eb" stop-opacity="0.25" />
                    <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0" />
                  </linearGradient>
                </defs>

                <path 
                  d="M 50 170 Q 135 150 220 120 T 390 70 T 550 90 L 550 180 L 50 180 Z" 
                  fill="url(#dashboardGrad)" 
                />
                <path 
                  d="M 50 170 Q 135 150 220 120 T 390 70 T 550 90" 
                  stroke="#2563eb" 
                  stroke-width="3.5" 
                  stroke-linecap="round" 
                />

                {chartData.map((pt, idx) => {
                  const cx = (idx / (chartData.length - 1)) * 500 + 50;
                  const cy = 180 - (pt.current / 2000) * 150;
                  return (
                    <circle
                      key={pt.day}
                      cx={cx}
                      cy={cy}
                      r="6"
                      fill="#2563eb"
                      stroke="#ffffff"
                      stroke-width="2.5"
                      class="cursor-pointer transition hover:r-8 shadow-md"
                    />
                  );
                })}

                {chartData.map((pt, idx) => {
                  const cx = (idx / (chartData.length - 1)) * 500 + 50;
                  return (
                    <text key={pt.day} x={cx} y="208" class="fill-slate-400 font-extrabold text-[10px]" text-anchor="middle">
                      {pt.day}
                    </text>
                  );
                })}
              </svg>
            </div>
            
            {/* Bottom left curve shape accent */}
            <div class="absolute bottom-0 left-0 w-24 h-16 bg-[#2563eb]/10 rounded-tr-[50px] pointer-events-none" />
          </div>

          {/* JAR POPULARITY CARD */}
          <div class="lg:col-span-4 bg-white rounded-[28px] border border-slate-200/60 p-8 shadow-2xs space-y-6 relative overflow-hidden flex flex-col justify-between">
            <div class="flex items-center gap-3">
              <div class="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <BarChart2 size={22} />
              </div>
              <div>
                <h3 class="font-display font-black text-slate-900 text-base">Jar Popularity</h3>
                <p class="text-xs text-slate-400 font-medium">Clustering density breakdown</p>
              </div>
            </div>

            <div class="space-y-4">
              {stats.jarPopularity.map((item) => (
                <div key={item.label} class="space-y-1.5">
                  <div class="flex justify-between text-xs font-bold">
                    <span class="text-slate-800">{item.label}</span>
                    <span class="text-[#1a73e8] font-black">{item.count} / {item.percentage}%</span>
                  </div>
                  <div class="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      class="h-full bg-[#1a73e8] rounded-full transition-all duration-500" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(`/rooms/${code}/jars`)}
              class="w-full rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-[#1a73e8] font-extrabold text-xs py-3.5 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mt-2"
            >
              <span>Full Jar Analytics</span>
              <ArrowUpRight size={14} />
            </button>

            {/* Dot grid graphic accent bottom right */}
            <div class="absolute bottom-3 right-3 grid grid-cols-4 gap-1 opacity-20 pointer-events-none">
              {[...Array(8)].map((_, i) => <div key={i} class="w-1.5 h-1.5 bg-amber-400 rounded-full" />)}
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: RECENT ACTIVITY FEED */}
        <div class="bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 class="font-display font-black text-slate-950 text-lg">Recent Room Activity</h3>
              <p class="text-xs text-slate-400 font-medium">Live attendee engagements and jar clustering activity</p>
            </div>
            <span class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Live Feed
            </span>
          </div>

          <div class="space-y-4 max-h-72 overflow-y-auto pr-2">
            {recentActivities.map((act) => (
              <div key={act.id} class="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80 hover:bg-slate-50 transition">
                <div class="flex items-center gap-3">
                  {act.avatar ? (
                    <img src={act.avatar} alt="User Avatar" class="h-8 w-8 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div class="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <Users size={14} />
                    </div>
                  )}
                  <span class="text-xs font-bold text-slate-800">{act.text}</span>
                </div>
                <span class="text-[10px] text-slate-400 font-semibold shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CONFIRMATION DELETE ROOM MODAL */}
      {showDeleteModal && (
        <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-6">
          <div class="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4 text-red-600">
              <div class="flex items-center gap-2">
                <AlertTriangle size={22} />
                <h3 class="font-display font-black text-lg text-slate-950">Delete Event Room</h3>
              </div>
              <button onClick={() => setShowDeleteModal(false)} class="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div class="space-y-3 text-xs text-slate-600 font-medium">
              <p>
                This action is <strong class="text-red-600">permanent and cannot be undone</strong>. This will permanently delete the room, all Jars, wall posts, media uploads, and attendee data.
              </p>

              <div class="bg-red-50 border border-red-100 rounded-2xl p-4 text-slate-800 space-y-1">
                <p class="font-extrabold text-xs">Type the room name to confirm:</p>
                <p class="font-mono text-xs text-red-600 font-bold select-all">
                  {event?.title || code}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmDelete} class="space-y-4">
              <input
                type="text"
                required
                placeholder={`Type "${event?.title || code}"`}
                value={deleteInputName}
                onChange={(e) => setDeleteInputName(e.target.value)}
                class="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-xs font-bold focus:border-red-600 focus:outline-none"
              />

              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  class="flex-1 rounded-2xl border border-slate-200 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteInputName.trim().toLowerCase() !== (event?.title || code).trim().toLowerCase()}
                  class="flex-1 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3.5 transition shadow-md shadow-red-600/20 disabled:opacity-40 cursor-pointer"
                >
                  Permanently Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTENDEE LOG MODAL */}
      {showAttendeeModal && (
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6">
          <div class="max-w-lg w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div class="flex items-center gap-2">
                <Users class="text-blue-600" size={20} />
                <h3 class="font-display font-bold text-lg text-slate-900">Total Joins Log ({stats.totalJoins})</h3>
              </div>
              <button onClick={() => setShowAttendeeModal(false)} class="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div class="space-y-3 max-h-80 overflow-y-auto pr-2">
              {[
                { name: 'Hashir Konnola', role: 'Full-Stack Developer', time: 'Joined 5m ago' },
                { name: 'Alosh Denny', role: 'UI/UX Designer', time: 'Joined 12m ago' },
                { name: 'Aravind Vijay', role: 'SaaS Founder', time: 'Joined 24m ago' },
                { name: 'Sneha Patel', role: 'Product Manager', time: 'Joined 45m ago' },
                { name: 'Sarah Miller', role: 'Web Developer', time: 'Joined 1h ago' },
              ].map((person, idx) => (
                <div key={idx} class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <span class="text-xs font-extrabold text-slate-900 block">{person.name}</span>
                    <span class="text-[10px] text-slate-400 font-semibold">{person.role}</span>
                  </div>
                  <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {person.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </OrganizerLayout>
  );
};

export default Dashboard;
