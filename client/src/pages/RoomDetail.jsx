import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserLayout } from '../components/Layouts';
import { LogIn, Users, Tag, Check, Calendar, ArrowRight, X, AlertCircle } from 'lucide-react';

const RoomDetail = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Join Profile Modal State
  const [showModal, setShowModal] = useState(false);
  const [attendeeForm, setAttendeeForm] = useState({
    name: '',
    email: '',
    role: '',
    company: '',
    interests: '',
    goals: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Guideline checkbox states
  const [guidelines, setGuidelines] = useState({
    respect: true, // checked by default in screenshot
    participate: false,
    conduct: false,
    controls: false
  });

  const [existingAttendee, setExistingAttendee] = useState(null);

  // Check if attendee is already registered locally for this room
  useEffect(() => {
    const savedProfile = localStorage.getItem(`attendee_${code}`);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setExistingAttendee(parsed);
      // Pre-fill form
      setAttendeeForm({
        name: parsed.name || '',
        email: parsed.email || '',
        role: parsed.role || '',
        company: parsed.company || '',
        interests: parsed.interests ? parsed.interests.join(', ') : '',
        goals: parsed.goals || ''
      });
    }
  }, [code]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${code}`);
        if (!res.ok) {
          throw new Error('Event not found.');
        }
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error(err);
        const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
        const foundLocal = localRooms.find(r => r.code === code);

        if (foundLocal) {
          setEvent(foundLocal);
          setError('');
        } else {
          setError(err.message || 'Room not found.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [code]);

  const handleJoinClick = async () => {
    setLoading(true);

    const sessionUserStr = localStorage.getItem('session_user') || localStorage.getItem('global_profile');
    let profile = { name: 'Attendee', role: 'Attendee', company: '', avatar: '' };
    if (sessionUserStr) {
      try {
        const parsed = JSON.parse(sessionUserStr);
        if (parsed.name) profile.name = parsed.name;
        if (parsed.email) profile.email = parsed.email;
        if (parsed.role) profile.role = parsed.role;
        if (parsed.company) profile.company = parsed.company;
        if (parsed.avatar) profile.avatar = parsed.avatar;
      } catch (e) {}
    }

    let attendeeData = null;
    try {
      const res = await fetch('/api/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventCode: code,
          name: profile.name,
          email: profile.email || '',
          role: profile.role || 'Attendee',
          company: profile.company || '',
          avatar: profile.avatar || `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(profile.name)}`
        })
      });

      if (res.ok) {
        attendeeData = await res.json();
      }
    } catch (err) {
      console.warn('Joining fallback:', err);
    }

    if (!attendeeData) {
      attendeeData = {
        _id: 'user_' + Date.now(),
        name: profile.name,
        email: profile.email || '',
        role: profile.role || 'Attendee',
        company: profile.company || '',
        avatar: profile.avatar || `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(profile.name)}`,
        isOnline: true
      };
    }

    localStorage.setItem(`attendee_${code}`, JSON.stringify(attendeeData));
    navigate(`/rooms/${code}/feed`);
  };

  if (loading) {
    return (
      <UserLayout>
        <div class="py-20 text-center text-slate-500 font-semibold">Loading room details...</div>
      </UserLayout>
    );
  }

  if (error || !event) {
    return (
      <UserLayout>
        <div class="max-w-md mx-auto py-20 text-center space-y-4">
          <AlertCircle size={40} class="text-red-500 mx-auto" />
          <h2 class="font-display font-bold text-xl text-slate-800">Event Not Found</h2>
          <p class="text-slate-500 text-sm">{error || "We couldn't locate the event with the code provided."}</p>
          <button onClick={() => navigate('/rooms')} class="bg-primary text-white font-bold text-xs px-4 py-2.5 rounded-xl">
            Back to Browse
          </button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div class="max-w-5xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            {existingAttendee ? 'Room Details' : 'Room Details / Join Room'}
          </h1>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Room Poster & Details Card */}
          <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-premium p-6 space-y-6">
            
            {/* Event Banner */}
            <div class="h-64 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center p-6 text-white text-center shadow-inner relative">
              <div class="space-y-2">
                <span class="text-xs font-black tracking-widest uppercase opacity-60">Platform Mixer</span>
                <h2 class="font-display font-black text-3xl md:text-4xl tracking-tight leading-none uppercase">
                  EVENT LORENTOR
                </h2>
              </div>
              <span class="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 uppercase shadow-sm">
                <span class="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
                Live
              </span>
            </div>

            {/* Room metadata */}
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <span class="bg-primary/10 text-primary font-extrabold text-[10px] px-3 py-1 rounded-full uppercase">
                  {event.template}
                </span>
                {event.visibility === 'Private' && (
                  <span class="bg-red-50 text-red-600 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase">
                    Private
                  </span>
                )}
              </div>

              <h2 class="font-display font-black text-2xl text-slate-900">
                {event.title}
              </h2>

              <p class="text-sm text-slate-500 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Host info */}
            <div class="flex items-center gap-3 border-t border-slate-100 pt-6">
              <img
                src={event.hostAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${event.hostName}`}
                alt={event.hostName}
                class="h-10 w-10 rounded-full border border-slate-100 bg-slate-50 object-cover"
              />
              <div>
                <span class="block text-xs font-bold text-slate-400">Hosted by</span>
                <span class="text-sm font-bold text-slate-800">{event.hostName}</span>
              </div>
            </div>

            {/* Tag line with count */}
            <div class="flex flex-wrap gap-4 border-t border-slate-100 pt-6 text-xs font-bold text-slate-400">
              <span class="flex items-center gap-1.5">
                <Users size={14} />
                {event.onlineCount || 124} Online
              </span>
              <span class="flex items-center gap-1.5">
                <Tag size={14} />
                {event.template}
              </span>
              {event.template === 'Networking' && (
                <span class="flex items-center gap-1.5">
                  <Tag size={14} />
                  Workshop
                </span>
              )}
            </div>

            {/* Your Jar preview if already grouped */}
            {existingAttendee && existingAttendee.jar && (
              <div class="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  {/* Small avatars stack */}
                  <div class="flex -space-x-1.5">
                    <div class="h-6 w-6 rounded-full bg-slate-300 ring-2 ring-white"></div>
                    <div class="h-6 w-6 rounded-full bg-slate-400 ring-2 ring-white"></div>
                    <div class="h-6 w-6 rounded-full bg-slate-500 ring-2 ring-white"></div>
                  </div>
                  <span class="text-xs font-bold text-slate-700">
                    Your Jar: <span class="text-primary">{existingAttendee.jar.label}</span>
                  </span>
                </div>
                <button 
                  onClick={() => navigate(`/rooms/${code}/jars`)}
                  class="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View Jar <ArrowRight size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Room Guidelines & Entrance CTA */}
          <div class="space-y-6">
            
            {/* Guidelines Card */}
            <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-premium space-y-6">
              <h3 class="font-display font-extrabold text-slate-900 text-lg">Room Guidelines</h3>
              
              <div class="space-y-3.5">
                <label class="flex items-start gap-3 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guidelines.respect}
                    onChange={(e) => setGuidelines(prev => ({ ...prev, respect: e.target.checked }))}
                    class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-0 mt-0.5"
                  />
                  <span>Respect others and their opinions</span>
                </label>
                <label class="flex items-start gap-3 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guidelines.participate}
                    onChange={(e) => setGuidelines(prev => ({ ...prev, participate: e.target.checked }))}
                    class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-0 mt-0.5"
                  />
                  <span>Participate actively in discussions</span>
                </label>
                <label class="flex items-start gap-3 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guidelines.conduct}
                    onChange={(e) => setGuidelines(prev => ({ ...prev, conduct: e.target.checked }))}
                    class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-0 mt-0.5"
                  />
                  <span>Maintain professional conduct</span>
                </label>
                <label class="flex items-start gap-3 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guidelines.controls}
                    onChange={(e) => setGuidelines(prev => ({ ...prev, controls: e.target.checked }))}
                    class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary focus:ring-0 mt-0.5"
                  />
                  <span>Maintain professional controls</span>
                </label>
              </div>

              {/* Entrance button */}
              {existingAttendee ? (
                <button
                  onClick={() => navigate(`/rooms/${code}/feed`)}
                  class="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-4 font-bold text-white shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Visit Room</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleJoinClick}
                  class="w-full rounded-xl bg-primary py-4 font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-dark transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn size={18} />
                  Join Room
                </button>
              )}
            </div>

            {/* Info notice */}
            {existingAttendee ? (
              <p class="text-[11px] text-center text-emerald-600 font-bold leading-normal px-2">
                ✓ You have already joined this room.
              </p>
            ) : (
              <p class="text-[10px] text-center text-slate-400 font-semibold leading-normal px-2">
                By joining, you agree to our terms of service and community standards.
              </p>
            )}
          </div>

        </div>
      </div>

    </UserLayout>
  );
};

export default RoomDetail;
