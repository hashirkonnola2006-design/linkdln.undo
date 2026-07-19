import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomLayout } from '../components/Layouts';
import { useSocket } from '../hooks/useSocket';
import { API_BASE_URL } from '../config.js';
import { 
  Search, 
  Heart, 
  Download, 
  FileText, 
  Plus, 
  X, 
  ChevronDown
} from 'lucide-react';

// Clean Solid Color Theme Abstract Circle Pin matching Website Design System
const PushPin = ({ color = 'blue' }) => {
  const solidColors = {
    blue: 'bg-[#1a73e8]',
    yellow: 'bg-[#f59e0b]',
    green: 'bg-[#10b981]',
    purple: 'bg-[#8b5cf6]',
    white: 'bg-[#1a73e8]',
    orange: 'bg-[#ea580c]'
  };

  const pinColor = solidColors[color] || 'bg-[#1a73e8]';

  return (
    <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      {/* Simple Solid Color Circle Badge */}
      <div class={`h-6 w-6 rounded-full ${pinColor} border-2 border-white shadow-md shadow-slate-400/30 flex items-center justify-center`}>
        {/* Simple Solid White Center Dot */}
        <div class="h-1.5 w-1.5 rounded-full bg-white opacity-90" />
      </div>
    </div>
  );
};

const RoomWall = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [attendee, setAttendee] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Note Board state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Latest');
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    color: 'yellow',
    attachment: ''
  });

  const colorOptions = [
    { name: 'blue', label: 'Blue', bg: 'bg-[#dbeafe] text-[#1e3a8a] border-blue-200/50' },
    { name: 'yellow', label: 'Yellow', bg: 'bg-[#fef08a] text-[#713f12] border-yellow-200/50' },
    { name: 'green', label: 'Green', bg: 'bg-[#bbf7d0] text-[#064e3b] border-emerald-200/50' },
    { name: 'purple', label: 'Lavender', bg: 'bg-[#e9d5ff] text-[#581c87] border-purple-200/50' },
    { name: 'white', label: 'White', bg: 'bg-white text-slate-900 border-slate-200/80 shadow-sm' },
    { name: 'orange', label: 'Peach', bg: 'bg-[#fed7aa] text-[#7c2d12] border-orange-200/50' }
  ];



  // Load local profile
  useEffect(() => {
    const loadAttendee = () => {
      let saved = localStorage.getItem(`attendee_${code}`);
      if (saved) {
        setAttendee(JSON.parse(saved));
      } else {
        const sessionUser = localStorage.getItem('session_user') || localStorage.getItem('global_profile');
        const isCreator = localStorage.getItem(`room_creator_${code}`) === 'true';
        if (sessionUser) {
          try {
            const parsed = JSON.parse(sessionUser);
            if (parsed.name) {
              const selfAttendee = {
                _id: 'user_me',
                name: parsed.name,
                email: parsed.email || '',
                role: parsed.role || (isCreator ? 'Event Host' : 'Attendee'),
                company: parsed.company || '',
                avatar: parsed.avatar || `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(parsed.name)}`,
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
          name: 'Attendee',
          role: isCreator ? 'Event Host' : 'Attendee',
          isHost: isCreator,
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
          _id: 'room_' + code,
          code: code,
          title: 'Room Wall'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [code]);

  // Connect to Sockets
  const { attendees, onlineCount, notes, setNotes } = useSocket(
    event?._id,
    attendee?._id
  );

  // Fetch Notes from DB & localStorage fallback
  const loadNotes = async () => {
    const localSaved = JSON.parse(localStorage.getItem(`room_notes_${code}`) || '[]');
    setNotes(localSaved);

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${code}/notes`);
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.length > 0) {
          const mergedMap = new Map();
          [...localSaved, ...serverData].forEach(n => {
            if (n && n._id) mergedMap.set(n._id, n);
          });
          const mergedNotes = Array.from(mergedMap.values());
          setNotes(mergedNotes);
          localStorage.setItem(`room_notes_${code}`, JSON.stringify(mergedNotes));
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (code) {
      loadNotes();
    }
  }, [code, event?._id]);

  // Handle Like Click
  const handleLike = async (noteId) => {
    if (!attendee) return;
    
    setNotes(prev => {
      const updated = prev.map(note => {
        if (note._id === noteId) {
          const hasLiked = note.likedBy?.includes(attendee._id);
          const updatedLikedBy = hasLiked 
            ? note.likedBy.filter(id => id !== attendee._id)
            : [...(note.likedBy || []), attendee._id];
          const updatedLikes = hasLiked ? Math.max(0, note.likes - 1) : note.likes + 1;
          return { ...note, likes: updatedLikes, likedBy: updatedLikedBy };
        }
        return note;
      });
      localStorage.setItem(`room_notes_${code}`, JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`${API_BASE_URL}/api/events/${code}/notes/${noteId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendeeId: attendee._id })
      });
    } catch (err) {}
  };

  // Submit new note
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;

    const newNote = {
      _id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: noteForm.title.trim(),
      content: noteForm.content.trim(),
      color: noteForm.color,
      attachment: noteForm.attachment,
      authorName: attendee?.name || 'Attendee',
      authorAvatar: attendee?.avatar || `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(attendee?.name || 'note')}`,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString()
    };

    setNotes(prev => {
      const updated = [newNote, ...prev];
      localStorage.setItem(`room_notes_${code}`, JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`${API_BASE_URL}/api/events/${code}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });
    } catch (error) {}

    setNoteForm({ title: '', content: '', color: 'yellow', attachment: '' });
    setShowAddNote(false);
  };

  const getNoteColorStyles = (colorName) => {
    const matched = colorOptions.find(o => o.name === colorName);
    return matched ? matched.bg : 'bg-[#fef08a] text-[#713f12] border-yellow-200/50';
  };

  // Organic sticky note tilts matching screenshot
  const getNoteRotationClass = (index) => {
    const rotations = [
      '-rotate-1 sm:-rotate-1.5',
      'rotate-0',
      'rotate-1 sm:rotate-1.5',
      '-rotate-1 sm:-rotate-1.5',
      'rotate-0',
      'rotate-1 sm:rotate-1'
    ];
    return rotations[index % rotations.length];
  };

  if (loading) {
    return (
      <div class="h-screen w-screen flex items-center justify-center bg-[#f8fafc] text-slate-500 font-semibold">
        Loading room wall...
      </div>
    );
  }

  const activeNotesList = notes || [];

  const filteredNotes = activeNotesList.filter(note =>
    (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'Popular') {
      return (b.likes || 0) - (a.likes || 0);
    }
    return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
  });

  return (
    <RoomLayout eventTitle={event?.title || 'Design Sync Room'} onlineCount={onlineCount || 1} attendees={attendees}>
      <div class="min-h-full bg-[#f8fafc] px-6 py-8 relative overflow-hidden">
        
        {/* Abstract Corner Shapes matching Screenshot 100% */}
        <div class="absolute -top-12 -right-12 w-64 h-64 bg-[#1a73e8] rounded-full pointer-events-none -z-10" />
        <div class="absolute top-52 -right-10 w-32 h-32 bg-[#fbbf24] rounded-full pointer-events-none -z-10" />
        <div class="absolute -bottom-16 -left-16 w-56 h-56 bg-[#10b981] rounded-full pointer-events-none -z-10" />

        {/* Dot Matrix Grid Accents */}
        <div class="absolute top-8 left-12 grid grid-cols-5 gap-1.5 opacity-20 pointer-events-none -z-10">
          {[...Array(15)].map((_, i) => (
            <div key={i} class="w-1.5 h-1.5 bg-slate-500 rounded-full" />
          ))}
        </div>
        <div class="absolute top-96 right-16 grid grid-cols-5 gap-1.5 opacity-20 pointer-events-none -z-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} class="w-1.5 h-1.5 bg-slate-500 rounded-full" />
          ))}
        </div>

        <div class="max-w-7xl mx-auto space-y-8">
          
          {/* Top Actions Row: Search + Sort By */}
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            {/* Search Pill Input */}
            <div class="bg-white rounded-full border border-slate-200/80 px-5 py-2.5 shadow-2xs flex items-center gap-3 w-full sm:w-80">
              <Search class="text-slate-400 shrink-0" size={18} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                class="w-full text-xs font-bold bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Sort By Dropdown */}
            <div class="flex items-center justify-end gap-2.5">
              <span class="text-xs font-extrabold text-slate-700">Sort by:</span>
              <div class="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  class="appearance-none bg-white rounded-full border border-slate-200/80 pl-5 pr-9 py-2 text-xs font-black text-slate-900 shadow-2xs outline-none cursor-pointer"
                >
                  <option value="Latest">Latest</option>
                  <option value="Popular">Popular</option>
                </select>
                <ChevronDown size={14} class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Sticky Notes 3-Column Grid */}
          {sortedNotes.length === 0 ? (
            <div class="bg-white rounded-[32px] border border-slate-200/60 p-12 text-center text-slate-400 font-bold space-y-2">
              <p>No sticky notes found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
              {sortedNotes.map((note, index) => {
                const colorStyle = getNoteColorStyles(note.color);
                const rotationClass = getNoteRotationClass(index);
                const isLiked = note.likedBy?.includes(attendee?._id);

                return (
                  <div 
                    key={note._id}
                    class={`rounded-[24px] p-6 flex flex-col justify-between space-y-4 shadow-lg shadow-slate-200/40 relative min-h-[260px] group transition duration-300 hover:scale-[1.02] hover:-translate-y-1 ${rotationClass} ${colorStyle}`}
                  >
                    {/* Clean Solid Color Theme Circle Pin */}
                    <PushPin color={note.color} />

                    {/* Note Content Section */}
                    <div class="space-y-3 pt-2">
                      <h3 class="font-display font-black text-base md:text-lg tracking-tight leading-snug">
                        {note.title}
                      </h3>

                      <p class="text-xs font-bold leading-relaxed opacity-90">
                        {note.content}
                      </p>

                      {/* Attachment Box if file exists */}
                      {note.attachment && (
                        <div class="flex items-center justify-between rounded-2xl bg-white/50 border border-black/5 p-3 mt-3 shadow-2xs">
                          <div class="flex items-center gap-2.5 min-w-0 pr-2">
                            <FileText size={16} class="text-slate-800 shrink-0" />
                            <span class="text-xs font-black text-slate-900 truncate">
                              {note.attachment}
                            </span>
                          </div>
                          <button 
                            onClick={() => alert(`Downloading ${note.attachment}...`)}
                            class="p-1.5 hover:bg-white/80 rounded-xl text-slate-800 transition cursor-pointer shrink-0"
                            title="Download file"
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Divider & Author info */}
                    <div class="border-t border-black/10 pt-3.5 flex items-center justify-between mt-auto">
                      <div class="flex items-center gap-2.5">
                        <img
                          src={note.authorAvatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100`}
                          alt={note.authorName}
                          class="h-7 w-7 rounded-full object-cover shadow-2xs border border-white/80 bg-slate-100 shrink-0"
                        />
                        <span class="text-xs font-bold tracking-tight opacity-90 truncate max-w-[130px]">
                          {note.authorName}
                        </span>
                      </div>

                      {/* Likes Counter */}
                      <button
                        onClick={() => handleLike(note._id)}
                        class="inline-flex items-center gap-1.5 text-xs font-extrabold opacity-80 hover:opacity-100 transition cursor-pointer"
                      >
                        <Heart size={16} class={isLiked ? "fill-red-500 text-red-500" : "stroke-2"} />
                        <span>{note.likes || 0}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Floating Action Button (+ Add Note) matching Screenshot */}
        <button
          onClick={() => setShowAddNote(true)}
          class="fixed bottom-8 right-8 z-40 bg-[#1a73e8] hover:bg-blue-700 text-white font-black text-sm px-6 py-3.5 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-2 cursor-pointer transition transform hover:scale-105"
        >
          <Plus size={20} />
          <span>Add Note</span>
        </button>

        {/* Add Note Modal */}
        {showAddNote && (
          <div class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="bg-white rounded-[32px] max-w-lg w-full p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
              
              <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 class="font-display font-black text-slate-900 text-lg">Add Sticky Note</h3>
                <button onClick={() => setShowAddNote(false)} class="text-slate-400 hover:text-slate-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleNoteSubmit} class="space-y-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-extrabold text-slate-900">Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Color Palette & Accessibility"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 focus:border-[#1a73e8] outline-none"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-extrabold text-slate-900">Content</label>
                  <textarea
                    placeholder="Write your note idea..."
                    value={noteForm.content}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    required
                    class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 focus:border-[#1a73e8] outline-none"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-xs font-extrabold text-slate-900">Color Theme</label>
                  <div class="flex flex-wrap gap-2.5">
                    {colorOptions.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setNoteForm(prev => ({ ...prev, color: opt.name }))}
                        class={`h-8 px-4 rounded-xl text-xs font-bold transition border cursor-pointer ${opt.bg} ${
                          noteForm.color === opt.name ? 'ring-2 ring-blue-600 ring-offset-2 scale-105' : 'opacity-80'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-extrabold text-slate-900">Attachment Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Wireframe_V2.fig"
                    value={noteForm.attachment}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, attachment: e.target.value }))}
                    class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-900 focus:border-[#1a73e8] outline-none"
                  />
                </div>

                <div class="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddNote(false)}
                    class="px-6 py-3 rounded-full border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-7 py-3 rounded-full bg-[#1a73e8] hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition cursor-pointer"
                  >
                    Post Note
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </RoomLayout>
  );
};

export default RoomWall;
