import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle } from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/PublicNavbar';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All rooms');
  const [rooms, setRooms] = useState([]);

  const filterTags = [
    'All rooms',
    'Networking',
    'Workshop',
    'Meetup',
    'Conference'
  ];

  useEffect(() => {
    const loadRealRooms = async () => {
      try {
        const res = await fetch('/api/events');
        const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
        let serverData = [];
        if (res.ok) {
          serverData = await res.json();
        }
        const mergedMap = new Map();
        [...localRooms, ...serverData].forEach(item => {
          if (item && item.code) mergedMap.set(item.code, item);
        });
        setRooms(Array.from(mergedMap.values()));
      } catch (err) {
        const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
        setRooms(localRooms);
      }
    };
    loadRealRooms();
    window.addEventListener('roomDeleted', loadRealRooms);
    return () => window.removeEventListener('roomDeleted', loadRealRooms);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/rooms?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/rooms');
    }
  };

  const handleTagClick = (tag) => {
    setActiveTab(tag);
    if (tag === 'All rooms') {
      navigate('/rooms');
    } else {
      navigate(`/rooms?search=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div class="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col justify-between overflow-x-hidden">
      {/* Top Navbar */}
      <PublicNavbar />

      <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-4 md:py-10 space-y-10 md:space-y-20 w-full">
        {/* HERO SECTION */}
        <section class="grid grid-cols-12 gap-3 sm:gap-8 md:gap-12 items-center pt-2 md:pt-4">
          
          {/* Hero Left Column (Text & Actions) */}
          <div class="col-span-7 lg:col-span-6 space-y-3 sm:space-y-6">
            {/* Pill Tag */}
            <div class="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-blue-50 border border-blue-100/80 px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider shadow-2xs">
              <span class="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-600 animate-pulse"></span>
              AI-Powered Networking
            </div>

            {/* Headline */}
            <h1 class="font-display text-2xl sm:text-5xl md:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.05]">
              Unmeet.<br />
              <span class="text-blue-600">Rewind.</span><br />
              Reconnect.
            </h1>

            {/* Description */}
            <p class="text-slate-500 text-[11px] sm:text-sm md:text-base font-medium leading-relaxed max-w-lg">
              AI-powered networking for real connections that last. We cut through the noise of traditional platforms to help you find the people who actually matter to your career.
            </p>

            {/* Action Buttons */}
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 pt-1">
              <button
                onClick={() => navigate('/create')}
                class="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] sm:text-sm px-4 sm:px-7 py-2.5 sm:py-3.5 shadow-md shadow-blue-600/20 transition duration-200 cursor-pointer text-center"
              >
                Create a room
              </button>

              <button
                onClick={() => navigate('/rooms')}
                class="rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-bold text-[11px] sm:text-sm px-4 sm:px-7 py-2.5 sm:py-3.5 shadow-2xs transition duration-200 cursor-pointer text-center"
              >
                Explore rooms
              </button>
            </div>

            {/* Social Proof Avatar Stack */}
            <div class="flex items-center gap-3 pt-1 sm:pt-4">
              <span class="text-[10px] sm:text-xs font-semibold text-slate-500 leading-tight">
                Connect with professionals building real connections
              </span>
            </div>
          </div>

          {/* Hero Right Column Graphic */}
          <div class="col-span-5 lg:col-span-6 relative flex items-center justify-center min-h-[150px] sm:min-h-[280px] md:min-h-[380px]">
            {/* Soft background blue organic blob */}
            <div class="absolute -top-4 right-4 sm:right-12 w-28 sm:w-48 h-20 sm:h-32 rounded-[50%_50%_40%_60%/60%_40%_60%_40%] bg-blue-100/70 blur-xs"></div>

            {/* Main Vibrant Blue Blob */}
            <div class="w-28 h-28 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-[45%_55%_65%_35%/55%_45%_55%_45%] bg-blue-600 shadow-xl shadow-blue-500/20 relative z-10"></div>

            {/* Overlapping Yellow Organic Blob */}
            <div class="absolute -bottom-2 right-1 sm:right-4 md:right-12 w-24 h-24 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] bg-amber-400 shadow-lg z-20"></div>

            {/* Small Green Organic Blob */}
            <div class="absolute bottom-4 left-1 sm:left-8 md:left-16 w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-[55%_45%_60%_40%/45%_55%_45%_55%] bg-emerald-500 z-30 shadow-md"></div>

            {/* Decorative Dot Matrix Grid */}
            <div class="absolute top-6 right-2 grid grid-cols-4 sm:grid-cols-6 gap-1 sm:gap-2 opacity-25">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} class="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-slate-600"></div>
              ))}
            </div>
          </div>

        </section>

        {/* DYNAMIC STATS COUNTER CARD */}
        <section class="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-slate-100">
            {/* Stat 1 */}
            <div class="flex items-center gap-4 pl-0 md:pl-4">
              <div class="w-10 h-10 rounded-[40%_60%_50%_50%/50%_40%_60%_50%] bg-blue-100/80 shrink-0"></div>
              <div>
                <span class="font-display text-2xl md:text-3xl font-extrabold text-slate-900 block leading-none">
                  {rooms.length}
                </span>
                <span class="text-xs font-semibold text-slate-400 mt-1 block">Live events</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div class="flex items-center gap-4 pl-0 md:pl-8">
              <div class="w-10 h-10 rounded-[60%_40%_40%_60%/40%_60%_40%_60%] bg-blue-100/80 shrink-0"></div>
              <div>
                <span class="font-display text-2xl md:text-3xl font-extrabold text-slate-900 block leading-none">
                  {rooms.reduce((acc, r) => acc + (r.onlineCount || 0), 0)}
                </span>
                <span class="text-xs font-semibold text-slate-400 mt-1 block">People connected</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div class="flex items-center gap-4 pl-0 md:pl-8">
              <div class="w-10 h-10 rounded-[50%_50%_60%_40%/60%_40%_50%_50%] bg-blue-100/80 shrink-0"></div>
              <div>
                <span class="font-display text-2xl md:text-3xl font-extrabold text-slate-900 block leading-none">
                  {rooms.length}
                </span>
                <span class="text-xs font-semibold text-slate-400 mt-1 block">Rooms created</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div class="flex items-center gap-4 pl-0 md:pl-8">
              <div class="w-10 h-10 rounded-[45%_55%_40%_60%/50%_50%_50%_50%] bg-blue-100/80 shrink-0"></div>
              <div>
                <span class="font-display text-2xl md:text-3xl font-extrabold text-slate-900 block leading-none">
                  {rooms.length > 0 ? 1 : 0}
                </span>
                <span class="text-xs font-semibold text-slate-400 mt-1 block">Active community</span>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH & FILTER CIRCLE SECTION */}
        <section class="space-y-8 text-center pt-4">
          <h2 class="font-display text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Find your next meaningful circle
          </h2>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} class="max-w-2xl mx-auto relative">
            <div class="relative flex items-center bg-white rounded-full border border-slate-200/90 shadow-sm p-1.5 pl-6">
              <Search size={18} class="text-slate-400 shrink-0 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Join a public room"
                class="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                class="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 shadow-sm transition cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter Pills */}
          <div class="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {filterTags.map((tag) => {
              const isActive = activeTab === tag;
              return (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  class={`rounded-full px-4 py-2 text-xs font-bold transition duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-blue-100/80 text-blue-600 border border-blue-200/80'
                      : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 border border-transparent'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Real Rooms Cards Grid */}
          {rooms.length > 0 ? (
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 text-left">
              {rooms.map((room) => (
                <div
                  key={room.code}
                  onClick={() => navigate(`/rooms/${room.code}`)}
                  class="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition duration-200 cursor-pointer space-y-4 flex flex-col justify-between"
                >
                  <div class="space-y-3">
                    <div class="w-12 h-10 rounded-2xl bg-blue-100/60"></div>
                    <div>
                      <h3 class="font-display font-bold text-sm text-slate-900 truncate" title={room.title}>
                        {room.title}
                      </h3>
                      <span class="text-xs text-slate-400 font-medium block mt-0.5">
                        {room.onlineCount || 0} members
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span class="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {room.template || 'Networking'}
                    </span>
                    <span class="text-xs font-bold text-slate-400">#{room.code}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div class="bg-white rounded-3xl border border-slate-100 p-10 max-w-xl mx-auto space-y-4 shadow-xs text-center">
              <div class="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <PlusCircle size={24} />
              </div>
              <div>
                <h3 class="font-display font-bold text-base text-slate-900">No rooms created yet</h3>
                <p class="text-xs text-slate-400 font-medium mt-1">
                  Be the first to create a live room and start your test drive!
                </p>
              </div>
              <button
                onClick={() => navigate('/create')}
                class="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 shadow-sm transition cursor-pointer"
              >
                Create Room
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default LandingPage;
