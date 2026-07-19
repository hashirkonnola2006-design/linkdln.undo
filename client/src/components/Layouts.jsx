import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { 
  Home,
  PlusCircle, 
  Compass, 
  User, 
  Settings, 
  LogOut, 
  ArrowLeft, 
  Users, 
  LayoutGrid, 
  TrendingUp, 
  MessageSquare, 
  FolderHeart, 
  Info,
  Calendar,
  Layers,
  CircleDot,
  Bell,
  ChevronDown,
  Trash2,
  ShieldAlert,
  Menu,
  X,
  UserPlus,
  Image as ImageIcon
} from 'lucide-react';

/**
 * 1. UserLayout: Light sidebar with "NETWORKING PAD" subtext and top header bar
 * Used for general pages: Create Room, Browse Rooms, Profile, Settings
 */
export const UserLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/create', label: 'Create', icon: PlusCircle },
    { path: '/rooms', label: 'Rooms', icon: Users },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Derive avatar from auth user (with fallback)
  const userAvatar = user?.avatar ||
    `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(user?.name || 'user')}`;

  return (
    <div class="flex h-screen w-screen overflow-hidden bg-slate-50/70 font-sans flex-col md:flex-row">
      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div class="w-64 h-full bg-white px-5 py-6 flex flex-col shadow-xl animate-in slide-in-from-left duration-200" onClick={e => e.stopPropagation()}>
            <div class="flex items-center justify-between mb-8 px-2">
              <Logo size="md" />
              <button onClick={() => setMobileMenuOpen(false)} class="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            <nav class="flex-1 space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path === '/rooms' && location.pathname.startsWith('/rooms') && !location.pathname.includes('/feed') && !location.pathname.includes('/jars') && !location.pathname.includes('/wall') && !location.pathname.includes('/dashboard'));
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    class={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button 
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              class="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 mt-auto"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside class="hidden md:flex w-64 flex-col border-r border-slate-200/60 bg-white px-5 py-6 shadow-sm z-10 relative overflow-hidden shrink-0">
        {/* Decorative sidebar organic illustrations */}
        <div class="absolute top-44 -left-20 w-72 h-80 rounded-[40%_60%_70%_30%/50%_40%_60%_50%] bg-blue-100/50 pointer-events-none -z-10 blur-xs"></div>
        <div class="absolute bottom-16 -left-12 w-52 h-60 rounded-[45%_55%_65%_35%/55%_45%_55%_45%] bg-blue-600 pointer-events-none -z-10 shadow-lg shadow-blue-600/20"></div>
        <div class="absolute -bottom-6 -left-14 w-44 h-44 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] bg-amber-400 pointer-events-none -z-10 shadow-md"></div>
        <div class="absolute bottom-8 left-20 w-14 h-14 rounded-[55%_45%_60%_40%/45%_55%_45%_55%] bg-emerald-500 pointer-events-none -z-10 shadow-sm"></div>

        {/* Logo */}
        <div class="mb-8 px-2 space-y-0.5">
          <Logo size="md" />
          <span class="text-[10px] font-bold text-slate-400 tracking-widest uppercase block pl-1.5">
            NETWORKING PAD
          </span>
        </div>

        {/* Navigation Items */}
        <nav class="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === '/rooms' && location.pathname.startsWith('/rooms') && !location.pathname.includes('/feed') && !location.pathname.includes('/jars') && !location.pathname.includes('/wall') && !location.pathname.includes('/dashboard'));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                class={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          class="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Container with Top Bar */}
      <div class="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header class="flex h-16 items-center justify-between md:justify-end border-b border-slate-100 bg-white px-4 md:px-8 gap-4 shadow-2xs shrink-0">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            class="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          <div class="flex items-center gap-3">
            <button class="relative rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition cursor-pointer">
              <Bell size={18} />
            </button>

            <div class="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/profile')}>
              <img
                src={userAvatar}
                alt={user?.name || 'User'}
                class="h-8 w-8 rounded-full border border-slate-200 object-cover shadow-sm"
              />
              {user?.name && (
                <span class="hidden sm:block text-xs font-extrabold text-slate-700 max-w-[100px] truncate">
                  {user.name}
                </span>
              )}
              <ChevronDown size={14} class="text-slate-400 group-hover:text-slate-600 transition hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main class="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

/**
 * 2. RoomLayout: Top bar with Event details and tab navigation
 * Used for: Live Feed, Jars, Room Wall, Room Info
 */
export const RoomLayout = ({ children, eventTitle, onlineCount, attendees = [] }) => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isCreator = localStorage.getItem(`room_creator_${code}`) === 'true' ||
    Boolean(localStorage.getItem(`attendee_${code}`) && JSON.parse(localStorage.getItem(`attendee_${code}`)).isHost);

  const tabs = [
    { path: `/rooms/${code}/feed`, label: 'Live Feed', icon: Home },
    { path: `/rooms/${code}/jars`, label: 'Jars', icon: FolderHeart },
    { path: `/rooms/${code}/wall`, label: 'Room Wall', icon: LayoutGrid },
    { path: `/rooms/${code}/media`, label: 'Media', icon: ImageIcon },
    ...(isCreator ? [{ path: `/rooms/${code}/dashboard`, label: 'Dashboard', icon: TrendingUp }] : []),
  ];

  const activeAvatars = (attendees || []).filter(a => a && a.isOnline).slice(0, 3);
  const remainingCount = Math.max(0, (attendees || []).length - 3);

  return (
    <div class="flex h-screen w-screen flex-col bg-slate-50 font-sans overflow-hidden">
      {/* Top Header */}
      <header class="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-4 md:px-6 shrink-0">
        <div class="flex items-center gap-3">
          <button 
            onClick={() => navigate('/rooms')}
            class="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div class="flex items-center gap-2">
            <h1 class="font-display text-base sm:text-xl font-bold text-slate-900 truncate max-w-[180px] sm:max-w-none">
              {eventTitle || 'Event Room'}
            </h1>
            <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              <CircleDot size={10} class="fill-emerald-500 text-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Right side Info Stack */}
        <div class="flex items-center gap-3 sm:gap-4">
          {attendees.length > 0 && (
            <div class="hidden sm:flex items-center">
              <div class="flex -space-x-2">
                {activeAvatars.map((attendee, index) => (
                  <img
                    key={attendee._id || index}
                    class="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm bg-slate-200"
                    src={attendee.avatar || `https://api.dicebear.com/7.x/open-peeps/svg?seed=${index}`}
                    alt={attendee.name}
                  />
                ))}
              </div>
              <span class="ml-2 text-xs font-bold text-slate-500">
                +{remainingCount + Math.max(0, attendees.filter(a => !a.isOnline).length)}
              </span>
            </div>
          )}

          <div class="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <Users size={14} />
            {onlineCount || 0} Online
          </div>
        </div>
      </header>

      {/* Floating Pill Navbar 100% matching Screenshot */}
      <div class="bg-[#f8fafc] py-4 px-4 sm:px-8 relative overflow-hidden shrink-0 border-b border-slate-100/60">
        {/* Background Accent Blobs matching Screenshot */}
        <div class="absolute -bottom-8 -left-8 w-24 h-24 bg-[#1a73e8] rounded-full pointer-events-none -z-10" />
        <div class="absolute -bottom-10 -right-4 w-28 h-28 bg-[#facc15] rounded-full pointer-events-none -z-10" />

        <div class="max-w-4xl mx-auto bg-white rounded-[32px] shadow-xs border border-slate-100/80 px-6 sm:px-10 py-2.5 overflow-hidden">
          <nav 
            class="flex items-center justify-start sm:justify-center gap-8 sm:gap-12 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [ms-overflow-style:none] [scrollbar-width:none]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              
              const renderIcon = () => {
                if (tab.label === 'Live Feed') {
                  return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                  );
                }
                if (tab.label === 'Jars') {
                  return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 3h10v3H7z"/>
                      <path d="M5 6h14a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1z"/>
                      <circle cx="9" cy="14" r="1"/>
                    </svg>
                  );
                }
                if (tab.label === 'Room Wall') {
                  return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                    </svg>
                  );
                }
                if (tab.label === 'Media') {
                  return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="m21 15-5-5L5 21"/>
                    </svg>
                  );
                }
                return (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 20v-4"/>
                    <path d="M12 20V10"/>
                    <path d="M18 20V4"/>
                  </svg>
                );
              };

              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  class="relative flex items-center gap-2.5 py-1.5 group cursor-pointer shrink-0"
                >
                  {isActive ? (
                    <>
                      <div class="h-9 w-9 rounded-2xl bg-[#1a73e8] text-white flex items-center justify-center shadow-xs shrink-0">
                        {renderIcon()}
                      </div>
                      <span class="text-[#1a73e8] font-black text-xs sm:text-sm tracking-tight whitespace-nowrap">
                        {tab.label}
                      </span>
                      <span class="absolute -bottom-2.5 left-0 right-0 h-[3px] bg-[#1a73e8] rounded-full" />
                    </>
                  ) : (
                    <>
                      <span class="text-slate-800 group-hover:text-slate-900 transition shrink-0">
                        {renderIcon()}
                      </span>
                      <span class="text-slate-800 font-black text-xs sm:text-sm group-hover:text-slate-900 transition whitespace-nowrap">
                        {tab.label}
                      </span>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <main class="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

/**
 * 3. OrganizerLayout: Clean light sidebar with mobile responsiveness
 */
export const OrganizerLayout = ({ children, eventTitle, onRoomSelect, rooms = [], activeRoomCode, onDeleteRoom }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentRoomTitle = eventTitle || rooms.find(r => r.code === activeRoomCode)?.title || activeRoomCode;

  const menuItems = [
    { path: `/rooms/${activeRoomCode}/dashboard`, label: 'Dashboard', icon: LayoutGrid },
    { path: `/rooms/${activeRoomCode}/analytics`, label: 'Analytics', icon: TrendingUp },
    { path: `/rooms/${activeRoomCode}/feed`, label: 'Back to Room', icon: ArrowLeft },
  ];

  return (
    <div class="flex h-screen w-screen overflow-hidden bg-[#f8fafc] font-sans flex-col md:flex-row">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div class="w-64 h-full bg-white px-5 py-6 flex flex-col shadow-xl animate-in slide-in-from-left duration-200" onClick={e => e.stopPropagation()}>
            <div class="flex items-center justify-between mb-8 px-2">
              <Logo size="md" />
              <button onClick={() => setMobileMenuOpen(false)} class="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            <nav class="flex-1 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    class={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-extrabold transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#e8f0fe] text-[#1a73e8] shadow-2xs' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} class={isActive ? 'text-[#1a73e8]' : 'text-slate-500'} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button 
              onClick={() => { setMobileMenuOpen(false); navigate('/'); }}
              class="flex items-center gap-2.5 px-4 py-3 text-xs font-extrabold text-slate-600 hover:text-red-600 transition cursor-pointer mt-auto"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside class="hidden md:flex w-64 flex-col bg-white border-r border-slate-200/60 px-5 py-6 shadow-xs relative overflow-hidden z-10 shrink-0">
        <div class="absolute bottom-20 -left-14 w-40 h-40 bg-[#2563eb] rounded-full pointer-events-none -z-10 shadow-lg shadow-blue-600/20" />
        <div class="absolute bottom-4 -left-10 w-32 h-32 bg-[#fbbf24] rounded-full pointer-events-none -z-10 shadow-md" />
        <div class="absolute bottom-24 left-24 w-5 h-5 bg-emerald-400 rounded-full pointer-events-none -z-10 shadow-xs" />

        <div class="mb-8 px-2 space-y-0.5">
          <Logo size="md" />
          <span class="text-[10px] font-black text-slate-400 tracking-widest uppercase block pl-1.5">
            ORGANIZER PORTAL
          </span>
        </div>

        <nav class="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                class={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-extrabold transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#e8f0fe] text-[#1a73e8] shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} class={isActive ? 'text-[#1a73e8]' : 'text-slate-500'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={() => navigate('/')}
          class="flex items-center gap-2.5 px-4 py-3 text-xs font-extrabold text-slate-600 hover:text-red-600 transition cursor-pointer mt-auto"
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </aside>

      {/* Main Panel Content */}
      <div class="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header bar matching Mockup */}
        <header class="flex h-16 sm:h-20 items-center justify-between border-b border-slate-200/60 bg-white px-4 sm:px-8 shrink-0 gap-3">
          <div class="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              class="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <Menu size={20} />
            </button>

            <span class="hidden sm:inline text-xs font-black text-slate-400 uppercase tracking-widest">PROJECT</span>
            
            <h1 class="font-display font-black text-lg sm:text-xl text-slate-900 tracking-tight truncate max-w-[150px] sm:max-w-none">
              {currentRoomTitle}
            </h1>
            
            <div class="hidden sm:block h-6 w-px bg-slate-200/80 mx-2" />
            
            <div class="hidden lg:inline-flex items-center gap-2 rounded-full bg-slate-100/80 border border-slate-200/60 px-4 py-2 text-xs font-extrabold text-slate-700">
              <Calendar size={14} class="text-slate-500" />
              <span>May 12 — May 19</span>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            {onDeleteRoom && (
              <button 
                onClick={onDeleteRoom}
                class="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-600 font-extrabold text-xs px-3 sm:px-5 py-2 sm:py-2.5 transition cursor-pointer"
              >
                <Trash2 size={14} />
                <span class="hidden sm:inline">Delete Room</span>
              </button>
            )}

            <button 
              onClick={() => navigate('/create')}
              class="inline-flex items-center gap-2 rounded-full bg-[#1a73e8] hover:bg-blue-700 text-white font-extrabold text-xs px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg shadow-blue-500/20 transition cursor-pointer shrink-0"
            >
              <PlusCircle size={15} />
              <span>New Room</span>
            </button>
          </div>
        </header>

        {/* Content View */}
        <main class="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
};
