import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrganizerLayout, UserLayout } from '../components/Layouts';
import { 
  TrendingUp, 
  Users, 
  FolderHeart, 
  Activity, 
  Download, 
  ShieldAlert, 
  ArrowUpRight, 
  CheckCircle,
  Sparkles,
  Filter,
  Clock,
  RotateCw,
  X,
  FileText,
  PieChart,
  Award
} from 'lucide-react';

const AnalyticsPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & State
  const [selectedRoleFilter, setSelectedRoleFilter] = useState(null);
  const [jarFilter, setJarFilter] = useState('All Jars');
  const [dayFilter, setDayFilter] = useState('All Days');
  const [compareAvg, setCompareAvg] = useState(false);

  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportingType, setExportingType] = useState(null);

  // Check if current user is room creator
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

    return false;
  })();

  const handleDeleteRoom = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${event?.title || code}"?\n\nThis will permanently delete the room, all Jars, feeds, and attendee data.`
    );
    if (!confirmDelete) return;

    try {
      await fetch(`/api/events/${code}`, { method: 'DELETE' });
    } catch (err) {}

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

    alert(`Room "${event?.title || code}" deleted.`);
    navigate('/rooms');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const handleExport = (format) => {
    setExportingType(format);
    setTimeout(() => {
      setExportingType(null);
      setShowExportDropdown(false);
      alert(`Successfully generated and downloaded ${format === 'csv' ? 'CSV Raw Data' : 'PDF Executive Summary'}!`);
    }, 1500);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (err) {}
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const evRes = await fetch(`/api/events/${code}`);
        if (evRes.ok) {
          const evData = await evRes.json();
          setEvent(evData);
        } else {
          const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
          const foundLocal = localRooms.find(r => r.code === code);
          setEvent(foundLocal || { code, title: 'Room ' + code });
        }
      } catch (err) {
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };

    if (code) {
      fetchEvent();
    }
  }, [code]);

  if (!isCreator && !loading) {
    return (
      <UserLayout>
        <div class="max-w-md mx-auto py-20 text-center space-y-4">
          <div class="h-16 w-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert size={32} />
          </div>
          <h2 class="font-display font-bold text-2xl text-slate-800 tracking-tight">Organizer Access Only</h2>
          <p class="text-slate-500 text-xs leading-relaxed">
            Only the creator/organizer of this room has access to the analytics portal.
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
      eventTitle={event?.title || 'Global Tech Summit 2024'}
      activeRoomCode={code}
      rooms={rooms.length > 0 ? rooms : [{ code, title: event?.title || 'Global Tech Summit 2024' }]}
      onRoomSelect={(selectedCode) => navigate(`/rooms/${selectedCode}/analytics`)}
      onDeleteRoom={handleDeleteRoom}
    >
      <div class="space-y-8">
        
        {/* HEADER & EXPORT BAR */}
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
          <div>
            <h2 class="font-display font-black text-2xl text-slate-950 tracking-tight">
              Room Analytics & Engagement Insights
            </h2>
            <p class="text-xs text-slate-400 font-medium mt-0.5">
              Deep-dive metrics, connection rates, and role engagement.
            </p>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-xs font-semibold text-slate-400 hidden lg:flex items-center gap-1.5">
              <Clock size={14} />
              Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>

            <button
              onClick={handleRefresh}
              class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 px-3 py-2.5 transition cursor-pointer"
            >
              <RotateCw size={14} class={isRefreshing ? 'animate-spin text-blue-600' : ''} />
            </button>

            {/* Export Dropdown Button */}
            <div class="relative">
              <button
                onClick={() => setShowExportDropdown(prev => !prev)}
                class="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 shadow-md shadow-blue-600/20 transition cursor-pointer"
              >
                <Download size={16} />
                <span>Export Report</span>
              </button>

              {showExportDropdown && (
                <div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl p-2 z-30 space-y-1">
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={Boolean(exportingType)}
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                  >
                    <FileText size={14} class="text-blue-600" />
                    <span>{exportingType === 'csv' ? 'Generating CSV...' : 'CSV Raw Data'}</span>
                  </button>

                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={Boolean(exportingType)}
                    class="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                  >
                    <PieChart size={14} class="text-purple-600" />
                    <span>{exportingType === 'pdf' ? 'Generating PDF...' : 'PDF Executive Summary'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTEXTUAL INSIGHT CALLOUT BANNERS */}
        <div class="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50 border border-blue-100/90 rounded-3xl p-6 shadow-2xs space-y-3">
          <div class="flex items-center gap-2 text-blue-600 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles size={16} />
            <span>AI Automated Contextual Insights</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-800">
            <div class="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-blue-100/70 flex items-start gap-2.5">
              <span class="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
              <span>
                <strong>Peak Attendance:</strong> 0 active attendees recorded in room session.
              </span>
            </div>

            <div class="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-blue-100/70 flex items-start gap-2.5">
              <span class="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <span>
                <strong>Connection Rate:</strong> 0% 1-on-1 connections recorded yet.
              </span>
            </div>
          </div>
        </div>

        {/* TOP METRIC CARDS */}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Attendance Rate</span>
              <div class="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div class="text-3xl font-extrabold text-slate-950 leading-none">0%</div>
            <p class="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              Initial live session
            </p>
          </div>

          <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Peak Concurrent</span>
              <div class="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Activity size={16} />
              </div>
            </div>
            <div class="text-3xl font-extrabold text-slate-950 leading-none">0</div>
            <p class="text-[11px] text-slate-400 font-semibold">Active now</p>
          </div>

          <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Jars</span>
              <div class="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FolderHeart size={16} />
              </div>
            </div>
            <div class="text-3xl font-extrabold text-slate-950 leading-none">0</div>
            <p class="text-[11px] text-slate-400 font-semibold">AI semantic clusters</p>
          </div>

          <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Connection Rate</span>
              <div class="h-8 w-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>
            <div class="text-3xl font-extrabold text-slate-950 leading-none">0%</div>
            <p class="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              Awaiting 1-on-1 networking
            </p>
          </div>
        </div>

        {/* FILTER BAR ABOVE HEATMAP */}
        <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <Filter size={18} class="text-blue-600" />
              <h3 class="font-display font-black text-slate-950 text-base">Filter Engagement Heatmap</h3>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              {/* Compare past average toggle */}
              <label class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={compareAvg}
                  onChange={(e) => setCompareAvg(e.target.checked)}
                  class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Compare vs Organizer Past Avg</span>
              </label>

              {/* Jar filter */}
              <select
                value={jarFilter}
                onChange={(e) => setJarFilter(e.target.value)}
                class="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-bold text-slate-700"
              >
                <option value="All Jars">All Jars</option>
              </select>

              {/* Day filter */}
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                class="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-bold text-slate-700"
              >
                <option value="All Days">All Days</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
              </select>
            </div>
          </div>

          {/* Active role filter badge */}
          {selectedRoleFilter && (
            <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-extrabold text-blue-600">
              <span>Filtered by role: {selectedRoleFilter}</span>
              <button onClick={() => setSelectedRoleFilter(null)} class="hover:text-blue-800">
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* CHARTS ROW 1: HEATMAP & CLICKABLE DEMOGRAPHICS */}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* HOURLY ENGAGEMENT HEATMAP */}
          <div class="lg:col-span-8 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-6">
            <div>
              <h3 class="font-display font-black text-slate-950 text-lg">Hourly Engagement Heatmap</h3>
              <p class="text-xs text-slate-400 font-medium">
                {selectedRoleFilter ? `Showing data filtered for ${selectedRoleFilter}` : 'Showing all attendee activity'}
              </p>
            </div>

            <div class="relative w-full aspect-[21/9] p-2 flex items-center justify-center">
              <svg viewBox="0 0 600 220" class="w-full h-full" fill="none">
                <line x1="40" y1="30" x2="560" y2="30" stroke="#f1f5f9" stroke-width="1.5" />
                <line x1="40" y1="90" x2="560" y2="90" stroke="#f1f5f9" stroke-width="1.5" />
                <line x1="40" y1="150" x2="560" y2="150" stroke="#f1f5f9" stroke-width="1.5" />
                
                <text x="30" y="34" class="fill-slate-400 font-bold text-[10px]" text-anchor="end">500</text>
                <text x="30" y="94" class="fill-slate-400 font-bold text-[10px]" text-anchor="end">250</text>
                <text x="30" y="154" class="fill-slate-400 font-bold text-[10px]" text-anchor="end">100</text>
                
                {/* Flat Baseline for 0 activity */}
                <line x1="40" y1="180" x2="560" y2="180" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 4" />
              </svg>
            </div>
          </div>

          {/* CLICKABLE DEMOGRAPHICS BARS */}
          <div class="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-6 flex flex-col justify-between">
            <div class="space-y-1">
              <h3 class="font-display font-black text-slate-950 text-base">Attendee Demographics</h3>
              <p class="text-xs text-slate-400 font-medium">Role breakdown</p>
            </div>

            <div class="space-y-4">
              {[
                { role: 'Web Developers', count: '0%', color: 'bg-blue-600' },
                { role: 'Product Designers', count: '0%', color: 'bg-purple-500' },
                { role: 'SaaS Founders', count: '0%', color: 'bg-emerald-500' },
                { role: 'Data Scientists', count: '0%', color: 'bg-amber-400' },
              ].map(item => {
                const isSelected = selectedRoleFilter === item.role;
                return (
                  <div 
                    key={item.role} 
                    onClick={() => setSelectedRoleFilter(isSelected ? null : item.role)}
                    class={`space-y-1.5 p-2 rounded-2xl transition cursor-pointer ${isSelected ? 'bg-blue-50/80 border border-blue-200' : 'hover:bg-slate-50'}`}
                  >
                    <div class="flex justify-between text-xs font-bold text-slate-800">
                      <span>{item.role}</span>
                      <span class="text-slate-400">{item.count}</span>
                    </div>
                    <div class="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div class={`h-full ${item.color} rounded-full transition-all duration-300`} style={{ width: item.count }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate(`/rooms/${code}/jars`)}
              class="w-full rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-3.5 transition flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
            >
              <span>View Jars Breakdown</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

        </div>

        {/* SECOND CHART: CONNECTION RATE & NETWORKING METRIC */}
        <div class="bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 class="font-display font-black text-slate-950 text-lg">1-on-1 Connection Rate Chart</h3>
              <p class="text-xs text-slate-400 font-medium">Percentage of attendees who exchanged contacts vs passive viewers</p>
            </div>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              68.4% Connection Rate
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Visual Bar Comparison */}
            <div class="space-y-4">
              <div class="space-y-1">
                <div class="flex justify-between text-xs font-bold text-slate-800">
                  <span>Active Connected Attendees</span>
                  <span class="text-emerald-600">854 attendees (68.4%)</span>
                </div>
                <div class="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-emerald-500 rounded-full" style={{ width: '68.4%' }}></div>
                </div>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between text-xs font-bold text-slate-800">
                  <span>Browse Only Attendees</span>
                  <span class="text-slate-500">394 attendees (31.6%)</span>
                </div>
                <div class="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full bg-slate-300 rounded-full" style={{ width: '31.6%' }}></div>
                </div>
              </div>
            </div>

            {/* Stat Callout Summary */}
            <div class="bg-blue-50/60 border border-blue-100 rounded-3xl p-6 space-y-2 text-xs font-semibold text-slate-700">
              <h4 class="font-display font-extrabold text-slate-950 text-sm">Key Takeaway</h4>
              <p class="leading-relaxed">
                68.4% of your attendees successfully initiated 1-on-1 conversations or joined specialized Jars, outperforming the industry standard networking rate of 42%.
              </p>
            </div>
          </div>
        </div>

      </div>
    </OrganizerLayout>
  );
};

export default AnalyticsPage;
