import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserLayout } from '../components/Layouts';
import { Search, SlidersHorizontal, Users, Calendar, ArrowUpRight, Check, Compass, Trash2, LogIn } from 'lucide-react';

const organicPalettes = [
  { bg: 'from-[#1a73e8] to-[#0f172a]', shape1: 'bg-[#fbbf24]', shape2: 'bg-[#1a73e8]', dot: 'bg-[#fbbf24]' },
  { bg: 'from-[#1e293b] to-[#0f172a]', shape1: 'bg-[#0284c7]', shape2: 'bg-[#10b981]', dot: 'bg-[#0284c7]' },
  { bg: 'from-[#1d4ed8] to-[#1e1b4b]', shape1: 'bg-[#3b82f6]', shape2: 'bg-[#60a5fa]', dot: 'bg-[#3b82f6]' },
  { bg: 'from-[#4c1d95] to-[#0f172a]', shape1: 'bg-[#f43f5e]', shape2: 'bg-[#8b5cf6]', dot: 'bg-[#f43f5e]' },
  { bg: 'from-[#064e3b] to-[#022c22]', shape1: 'bg-[#f59e0b]', shape2: 'bg-[#10b981]', dot: 'bg-[#f59e0b]' },
  { bg: 'from-[#164e63] to-[#082f49]', shape1: 'bg-[#38bdf8]', shape2: 'bg-[#06b6d4]', dot: 'bg-[#38bdf8]' }
];

const BrowseRooms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';

  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my'
  const [search, setSearch] = useState(initialSearch);
  const [selectedTemplate, setSelectedTemplate] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteSingleRoom = async (e, roomCode, roomTitle) => {
    if (e) e.stopPropagation();
    const confirmDelete = window.confirm(`Are you sure you want to delete "${roomTitle || roomCode}"?`);
    if (!confirmDelete) return;

    try {
      await fetch(`/api/events/${roomCode}`, { method: 'DELETE' });
    } catch (err) {}

    const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
    const updatedLocal = localRooms.filter(r => r.code !== roomCode);
    localStorage.setItem('local_created_rooms', JSON.stringify(updatedLocal));

    localStorage.removeItem(`room_creator_${roomCode}`);
    localStorage.removeItem(`attendee_${roomCode}`);
    localStorage.removeItem(`room_notes_${roomCode}`);

    window.dispatchEvent(new CustomEvent('roomDeleted', { detail: { code: roomCode } }));
    fetchRooms();
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      let url = `/api/events?search=${encodeURIComponent(search)}`;
      if (selectedTemplate !== 'All') url += `&template=${selectedTemplate}`;
      if (selectedStatus !== 'All') url += `&status=${selectedStatus}`;
      if (selectedDate) url += `&date=${selectedDate}`;

      const res = await fetch(url);
      const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
      
      let serverData = [];
      if (res.ok) {
        serverData = await res.json();
      }

      // Merge server rooms and locally created rooms
      const mergedMap = new Map();
      [...localRooms, ...serverData].forEach(item => {
        if (item && item.code) {
          // Auto purge test 01 and heheheheh if present
          if (item.title === 'test 01' || item.title === 'heheheheh') {
            fetch(`/api/events/${item.code}`, { method: 'DELETE' }).catch(() => {});
            const updated = (JSON.parse(localStorage.getItem('local_created_rooms') || '[]')).filter(r => r.code !== item.code);
            localStorage.setItem('local_created_rooms', JSON.stringify(updated));
            localStorage.removeItem(`room_creator_${item.code}`);
            localStorage.removeItem(`attendee_${item.code}`);
            localStorage.removeItem(`room_notes_${item.code}`);
            return;
          }
          mergedMap.set(item.code, item);
        }
      });

      let filtered = Array.from(mergedMap.values());
      if (search) {
        filtered = filtered.filter(r => 
          r.title?.toLowerCase().includes(search.toLowerCase()) || 
          r.description?.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (selectedTemplate !== 'All') {
        filtered = filtered.filter(r => r.template === selectedTemplate);
      }
      if (selectedStatus !== 'All') {
        if (selectedStatus === 'Live Now') filtered = filtered.filter(r => r.isLive !== false);
        if (selectedStatus === 'Upcoming') filtered = filtered.filter(r => r.isLive === false);
      }
      
      setRooms(filtered);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
      setRooms(localRooms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    window.addEventListener('roomDeleted', fetchRooms);
    return () => window.removeEventListener('roomDeleted', fetchRooms);
  }, [search, selectedTemplate, selectedStatus, selectedDate]);

  const handleClearFilters = () => {
    setSelectedTemplate('All');
    setSelectedStatus('All');
    setSelectedDate('');
    setSearch('');
  };

  return (
    <UserLayout>
      <div class="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight font-display">Browse Rooms</h1>
            <p class="text-slate-500 text-sm mt-1">Discover and join professional networking events happening now.</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div class="border-b border-slate-200">
          <nav class="-mb-px flex gap-6">
            <button 
              onClick={() => setActiveTab('all')}
              class={`border-b-2 py-4 px-1 text-sm transition cursor-pointer ${
                activeTab === 'all' 
                  ? 'border-primary text-primary font-bold' 
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 font-semibold'
              }`}
            >
              All Rooms
            </button>
            <button 
              onClick={() => setActiveTab('my')}
              class={`border-b-2 py-4 px-1 text-sm transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'my' 
                  ? 'border-primary text-primary font-bold' 
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 font-semibold'
              }`}
            >
              <span>My Rooms</span>
              {rooms.filter(r => Boolean(localStorage.getItem(`attendee_${r.code}`)) || localStorage.getItem(`room_creator_${r.code}`) === 'true').length > 0 && (
                <span class={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeTab === 'my' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {rooms.filter(r => Boolean(localStorage.getItem(`attendee_${r.code}`)) || localStorage.getItem(`room_creator_${r.code}`) === 'true').length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Search & Layout */}
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Main Area: Search + Cards Grid */}
          <div class="lg:col-span-3 space-y-6">
            
            {/* Search Input Bar */}
            <div class="relative flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
              <Search class="text-slate-400 ml-3" size={20} />
              <input
                type="text"
                placeholder="Search rooms by name or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                class="w-full pl-3 pr-20 py-2.5 text-sm bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
              />
              <button class="absolute right-1.5 flex items-center gap-1 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-600 font-bold text-xs px-4 py-2.5 rounded-xl transition">
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>

            {/* Rooms Cards Grid */}
            {loading ? (
              <div class="py-12 text-center text-slate-500 font-semibold">Loading available rooms...</div>
            ) : rooms.filter(room => activeTab === 'my' ? (Boolean(localStorage.getItem(`attendee_${room.code}`)) || localStorage.getItem(`room_creator_${room.code}`) === 'true') : true).length === 0 ? (
              activeTab === 'my' ? (
                <div class="py-16 text-center bg-white border border-slate-100 rounded-3xl p-8 space-y-4 shadow-sm">
                  <div class="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <LogIn size={24} />
                  </div>
                  <div>
                    <h3 class="font-display font-bold text-base text-slate-900">No rooms joined yet</h3>
                    <p class="text-xs text-slate-400 font-medium mt-1 max-w-sm mx-auto">
                      Explore public rooms in the "All Rooms" tab or create your own room to start networking!
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('all')}
                    class="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 shadow-sm transition cursor-pointer"
                  >
                    Browse All Rooms
                  </button>
                </div>
              ) : (
                <div class="py-12 text-center text-slate-400 font-semibold">No rooms match your filter criteria.</div>
              )
            ) : (
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms
                  .filter(room => activeTab === 'my' ? (Boolean(localStorage.getItem(`attendee_${room.code}`)) || localStorage.getItem(`room_creator_${room.code}`) === 'true') : true)
                  .map((room) => {
                    const isUpcoming = room.isLive === false;
                    const isJoinedOrCreated = Boolean(localStorage.getItem(`attendee_${room.code}`)) || localStorage.getItem(`room_creator_${room.code}`) === 'true';

                    const handleCardJoin = (e) => {
                      e.stopPropagation();
                      if (!isJoinedOrCreated) {
                        const sessionUserStr = localStorage.getItem('session_user') || localStorage.getItem('global_profile');
                        let parsedUser = { name: 'Attendee', role: 'Attendee', company: '' };
                        if (sessionUserStr) {
                          try { parsedUser = JSON.parse(sessionUserStr); } catch (e) {}
                        }
                        const attendeeData = {
                          _id: 'user_' + Date.now(),
                          name: parsedUser.name || 'Attendee',
                          email: parsedUser.email || '',
                          role: parsedUser.role || 'Attendee',
                          company: parsedUser.company || '',
                          avatar: parsedUser.avatar || `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(parsedUser.name || 'user')}`,
                          isOnline: true
                        };
                        localStorage.setItem(`attendee_${room.code}`, JSON.stringify(attendeeData));
                      }
                      navigate(`/rooms/${room.code}/feed`);
                    };

                    return (
                      <div 
                        key={room.code} 
                        class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                      >
                        {/* Poster Header */}
                        <div class="relative h-40 w-full overflow-hidden flex items-center justify-center p-4 text-white">
                          {room.posterUrl ? (
                            <div class="absolute inset-0">
                              <img src={room.posterUrl} alt={room.title} class="w-full h-full object-cover" />
                              <div class="absolute inset-0 bg-slate-950/30" />
                            </div>
                          ) : typeof room.posterPaletteIndex === 'number' ? (
                            <div class={`absolute inset-0 bg-gradient-to-br ${organicPalettes[room.posterPaletteIndex % organicPalettes.length].bg}`}>
                              <div class={`absolute -top-6 -right-6 w-36 h-36 rounded-[40%_60%_70%_30%/50%_40%_60%_50%] ${organicPalettes[room.posterPaletteIndex % organicPalettes.length].shape1} opacity-90 shadow-md`}></div>
                              <div class={`absolute -bottom-8 -left-6 w-40 h-40 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] ${organicPalettes[room.posterPaletteIndex % organicPalettes.length].shape2} opacity-80 shadow-md`}></div>
                              <div class={`absolute bottom-3 right-16 w-8 h-8 rounded-full ${organicPalettes[room.posterPaletteIndex % organicPalettes.length].dot}`}></div>
                            </div>
                          ) : (
                            <div class="absolute inset-0 bg-gradient-to-br from-[#1a73e8] to-[#0f172a]">
                              <div class="absolute -top-6 -right-6 w-36 h-36 rounded-[40%_60%_70%_30%/50%_40%_60%_50%] bg-[#fbbf24] opacity-90 shadow-md"></div>
                              <div class="absolute -bottom-8 -left-6 w-40 h-40 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] bg-[#1a73e8] opacity-80 shadow-md"></div>
                              <div class="absolute bottom-3 right-16 w-8 h-8 rounded-full bg-[#fbbf24]"></div>
                            </div>
                          )}

                          <span class="font-display font-black text-white text-center tracking-widest text-lg uppercase drop-shadow-md relative z-10 opacity-90">
                            {room.template || 'Networking'}
                          </span>

                          {/* Live/Upcoming Badge */}
                          <div class="absolute top-4 left-4 z-20 flex items-center gap-2">
                            {!isUpcoming ? (
                              <span class="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 uppercase shadow-sm">
                                <span class="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
                                Live
                              </span>
                            ) : (
                              <span class="inline-flex items-center rounded-full bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 uppercase shadow-sm">
                                Upcoming
                              </span>
                            )}
                          </div>

                          {/* Joined/Created badge top right */}
                          {isJoinedOrCreated && (
                            <div class="absolute top-4 right-4 z-20">
                              <span class="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 uppercase shadow-sm">
                                <Check size={10} />
                                {localStorage.getItem(`room_creator_${room.code}`) === 'true' ? 'Host' : 'Joined'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content details */}
                        <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div class="space-y-2">
                            <h3 class="font-display font-extrabold text-slate-900 leading-snug">
                              {room.title}
                            </h3>
                            <p class="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                              {room.description}
                            </p>
                          </div>

                          {/* Badges row */}
                          <div class="flex flex-wrap gap-1.5">
                            <span class="bg-primary/10 text-primary font-bold text-[10px] px-2 py-0.5 rounded-full">
                              {room.template || 'Networking'}
                            </span>
                          </div>

                          {/* Card bottom actions */}
                          <div class="border-t border-slate-50 pt-4 flex items-center justify-between">
                            <div class="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                              <Users size={12} />
                              {room.onlineCount || 1} Online
                            </div>
                            
                            <div class="flex items-center gap-2">
                              <button
                                onClick={(e) => handleDeleteSingleRoom(e, room.code, room.title)}
                                class="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition cursor-pointer"
                                title="Delete Room"
                              >
                                <Trash2 size={14} />
                              </button>

                              <button
                                onClick={handleCardJoin}
                                class={`font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                                  isJoinedOrCreated
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-primary hover:bg-primary-dark text-white'
                                }`}
                              >
                                <span>{isJoinedOrCreated ? 'Visit Room' : 'Join'}</span>
                                <ArrowUpRight size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Filters panel */}
          <div class="space-y-6">
            {/* Filters panel box */}
            <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-premium space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800">Filters</h3>
                <button onClick={handleClearFilters} class="text-xs font-semibold text-primary hover:underline">Clear all</button>
              </div>

              {/* Room type check boxes */}
              <div class="space-y-3">
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Room Type</span>
                <div class="space-y-2">
                  {['All', 'Networking', 'Workshop', 'Meetup', 'Conference', 'Other'].map(type => (
                    <label key={type} class="flex items-center gap-2.5 text-xs font-bold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTemplate === type}
                        onChange={() => setSelectedTemplate(type)}
                        class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-0"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Radio buttons */}
              <div class="space-y-3">
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                <div class="space-y-2">
                  {['All', 'Live Now', 'Upcoming'].map(status => (
                    <label key={status} class="flex items-center gap-2.5 text-xs font-bold text-slate-600 cursor-pointer">
                      <input
                        type="radio"
                        name="statusFilter"
                        checked={selectedStatus === status}
                        onChange={() => setSelectedStatus(status)}
                        class="h-4 w-4 border-slate-300 text-primary focus:ring-primary focus:ring-0"
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>

              {/* Date selector */}
              <div class="space-y-3">
                <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  class="w-full text-xs font-bold text-slate-500 rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-primary outline-none"
                />
              </div>

              {/* Apply Filters CTA */}
              <button
                onClick={fetchRooms}
                class="w-full rounded-xl bg-primary py-3 font-bold text-xs text-white shadow-md shadow-primary/20 hover:bg-primary-dark transition"
              >
                Apply Filters
              </button>
            </div>

            {/* Trending Rooms Widget */}
            {rooms.length > 0 && (
              <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
                <h3 class="text-sm font-bold text-slate-800">Live Rooms</h3>
                <div class="space-y-4">
                  {rooms.slice(0, 3).map((room, idx) => (
                    <div key={room.code} class="flex items-start justify-between gap-2 group cursor-pointer" onClick={() => navigate(`/rooms/${room.code}`)}>
                      <div class="flex items-center gap-3">
                        <span class="text-xs font-black text-slate-300">{idx + 1}</span>
                        <div>
                          <h4 class="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">{room.title}</h4>
                          <span class="text-[10px] text-slate-400 font-medium">{room.onlineCount || 0} online</span>
                        </div>
                      </div>
                      <ArrowUpRight size={14} class="text-slate-300 group-hover:text-blue-600 transition" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </UserLayout>
  );
};

export default BrowseRooms;
