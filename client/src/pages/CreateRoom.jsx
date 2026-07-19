import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from '../components/Layouts';
import { 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Circle, 
  Bell, 
  ChevronDown,
  Calendar,
  Lock,
  HardDrive,
  Upload,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    template: 'Networking',
    visibility: 'Public',
    joinMode: 'Open',
    dateTime: '',
    resourcesDriveUrl: '',
    hostName: 'Alosh Denny',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [posterMode, setPosterMode] = useState('template'); // 'template' or 'custom'
  const [customPosterUrl, setCustomPosterUrl] = useState('');
  const [paletteIndex, setPaletteIndex] = useState(0);

  const organicPalettes = [
    // 0: Royal Blue + Navy + Warm Amber
    { bg: 'from-[#1a73e8] to-[#0f172a]', shape1: 'bg-[#fbbf24]', shape2: 'bg-[#1a73e8]', dot: 'bg-[#fbbf24]' },
    // 1: Slate Navy + Sky Blue + Mint Emerald
    { bg: 'from-[#1e293b] to-[#0f172a]', shape1: 'bg-[#0284c7]', shape2: 'bg-[#10b981]', dot: 'bg-[#0284c7]' },
    // 2: Deep Blue + Dark Indigo + Soft Sky
    { bg: 'from-[#1d4ed8] to-[#1e1b4b]', shape1: 'bg-[#3b82f6]', shape2: 'bg-[#60a5fa]', dot: 'bg-[#3b82f6]' },
    // 3: Deep Violet + Dark Indigo + Rose Coral
    { bg: 'from-[#4c1d95] to-[#0f172a]', shape1: 'bg-[#f43f5e]', shape2: 'bg-[#8b5cf6]', dot: 'bg-[#f43f5e]' },
    // 4: Emerald Forest + Deep Teal + Amber Gold
    { bg: 'from-[#064e3b] to-[#022c22]', shape1: 'bg-[#f59e0b]', shape2: 'bg-[#10b981]', dot: 'bg-[#f59e0b]' },
    // 5: Cyan Slate + Midnight + Electric Sky
    { bg: 'from-[#164e63] to-[#082f49]', shape1: 'bg-[#38bdf8]', shape2: 'bg-[#06b6d4]', dot: 'bg-[#38bdf8]' }
  ];

  const templates = ['Networking', 'Workshop', 'Meetup', 'Conference', 'Other'];

  const handleRegeneratePoster = () => {
    const nextIdx = (paletteIndex + 1) % organicPalettes.length;
    setPaletteIndex(nextIdx);
    setFormData(prev => ({ ...prev, posterPaletteIndex: nextIdx }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description' && value.length > 300) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateClick = (template) => {
    handleRegeneratePoster();
    setFormData(prev => ({ ...prev, template }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPosterUrl(reader.result);
        setFormData(prev => ({ ...prev, posterUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Event name is required.');
      return;
    }

    setLoading(true);
    setError('');

    const hostProfile = JSON.parse(localStorage.getItem('global_profile') || '{}');
    const finalHostName = hostProfile.name?.trim() || formData.hostName?.trim() || 'Organizer';
    const finalHostAvatar = hostProfile.avatar || formData.hostAvatar || `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(finalHostName)}`;

    const payload = {
      ...formData,
      hostName: finalHostName,
      hostAvatar: finalHostAvatar,
      dateTime: formData.dateTime || new Date().toISOString()
    };

    let createdRoom = null;

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        createdRoom = await response.json();
      }
    } catch (apiErr) {
      console.warn('Network error creating room:', apiErr);
    }

    if (!createdRoom) {
      const generatedCode = 'ROOM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      createdRoom = {
        _id: 'local_' + generatedCode,
        code: generatedCode,
        title: payload.title,
        description: payload.description,
        template: payload.template || 'Networking',
        visibility: payload.visibility || 'Public',
        joinMode: payload.joinMode || 'Open',
        dateTime: payload.dateTime,
        resourcesDriveUrl: payload.resourcesDriveUrl,
        hostName: finalHostName,
        hostAvatar: finalHostAvatar,
        onlineCount: 1,
        isLive: true
      };

      const existingLocal = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
      localStorage.setItem('local_created_rooms', JSON.stringify([createdRoom, ...existingLocal]));
    }

    localStorage.setItem(`room_creator_${createdRoom.code}`, 'true');

    const creatorAttendee = {
      _id: 'host_' + createdRoom.code,
      name: finalHostName,
      email: hostProfile.email || 'host@linkdln.undo',
      role: 'Event Host',
      company: hostProfile.company || 'Organizer',
      avatar: finalHostAvatar,
      isHost: true,
      isOnline: true
    };
    localStorage.setItem(`attendee_${createdRoom.code}`, JSON.stringify(creatorAttendee));

    navigate(`/rooms/${createdRoom.code}/feed`);
  };

  // Checklist validation logic
  const isTitleDone = formData.title.trim().length > 0;
  const isTemplateDone = true;
  const isPrivacyDone = Boolean(formData.visibility && formData.joinMode);
  const isDocDone = formData.resourcesDriveUrl.trim().length > 0;

  return (
    <UserLayout>
      <div class="max-w-6xl mx-auto space-y-8 relative">
        
        {/* BACKGROUND DECORATIVE ORGANIC SHAPES TOP RIGHT MATCHING SCREENSHOT */}
        <div class="absolute -top-10 -right-10 w-96 h-96 rounded-[40%_60%_70%_30%/50%_40%_60%_50%] bg-[#1a73e8] pointer-events-none -z-10 shadow-xl shadow-blue-600/20"></div>
        <div class="absolute top-12 right-16 w-80 h-80 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] bg-[#fbbf24] pointer-events-none -z-10 shadow-lg"></div>
        <div class="absolute top-64 right-64 w-16 h-16 rounded-[55%_45%_60%_40%/45%_55%_45%_55%] bg-[#0f172a] opacity-20 pointer-events-none -z-10 shadow-md"></div>

        {/* TOP HEADER BAR (Title & Subtitle) */}
        <div class="space-y-1">
          <h1 class="font-display text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
            Create a new room
          </h1>
          <p class="text-xs md:text-sm text-slate-500 font-medium">
            Configure your digital environment for seamless professional networking.
          </p>
        </div>

        {error && (
          <div class="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold border border-red-100 shadow-2xs">
            {error}
          </div>
        )}

        {/* MAIN 2-COLUMN LAYOUT */}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: FORM CARD */}
          <form onSubmit={handleSubmit} class="lg:col-span-7 bg-white rounded-3xl border border-slate-100/90 p-8 shadow-xs space-y-6 relative z-10">
            
            {/* Event Name */}
            <div class="space-y-2">
              <label class="text-xs font-extrabold text-slate-900">Event Name</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Q4 Executive Mixer"
                value={formData.title}
                onChange={handleChange}
                class="w-full rounded-2xl border border-slate-200/80 px-5 py-3.5 text-xs font-semibold focus:border-blue-600 focus:outline-none transition placeholder:text-slate-300 bg-slate-50/30"
              />
            </div>

            {/* Description */}
            <div class="space-y-2 relative">
              <label class="text-xs font-extrabold text-slate-900">Event Description</label>
              <textarea
                name="description"
                placeholder="Describe the goals of this session..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                class="w-full rounded-2xl border border-slate-200/80 px-5 py-3.5 text-xs font-semibold focus:border-blue-600 focus:outline-none transition placeholder:text-slate-300 bg-slate-50/30"
              />
              <span class="absolute bottom-3 right-4 text-[10px] text-slate-400 font-bold">
                {formData.description.length} / 300
              </span>
            </div>

            {/* Event Poster Selection Mode: Template vs Upload Custom Image */}
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-xs font-extrabold text-slate-900">Event Poster</label>
                
                {/* Toggle Mode Pills */}
                <div class="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setPosterMode('template');
                      setFormData(prev => ({ ...prev, posterUrl: '' }));
                    }}
                    class={`rounded-lg px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                      posterMode === 'template'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Preset Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosterMode('custom')}
                    class={`rounded-lg px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                      posterMode === 'custom'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upload Image
                  </button>
                </div>
              </div>

              {/* MODE 1: TEMPLATE SELECTOR */}
              {posterMode === 'template' ? (
                <div class="space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2.5">
                    <div class="flex flex-wrap gap-2.5">
                      {templates.map((tpl) => {
                        const isActive = formData.template === tpl;
                        return (
                          <button
                            key={tpl}
                            type="button"
                            onClick={() => handleTemplateClick(tpl)}
                            class={`rounded-full px-5 py-2.5 text-xs font-extrabold transition duration-150 cursor-pointer ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {tpl}
                          </button>
                        );
                      })}
                    </div>

                    {/* Regenerate Variation Button */}
                    <button
                      type="button"
                      onClick={handleRegeneratePoster}
                      class="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-4 py-2.5 transition cursor-pointer shrink-0 border border-blue-100 shadow-2xs"
                      title="Generate another 3-color organic variation with same theme"
                    >
                      <RefreshCw size={14} class="text-blue-600" />
                      <span>Regenerate Variation</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* MODE 2: CUSTOM IMAGE UPLOADER FROM DEVICE */
                <div class="space-y-3">
                  <div class="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 rounded-2xl p-5 text-center transition cursor-pointer relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div class="flex flex-col items-center justify-center space-y-1.5">
                      <div class="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Upload size={18} />
                      </div>
                      <div>
                        <span class="text-xs font-black text-blue-600">Choose image from device</span>
                        <span class="text-[10px] text-slate-400 font-bold block">PNG, JPG, WEBP formats</span>
                      </div>
                    </div>
                  </div>

                  {customPosterUrl && (
                    <div class="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs font-bold text-emerald-800">
                      <span>✓ Poster Image Attached</span>
                      <button 
                        type="button"
                        onClick={() => { setCustomPosterUrl(''); setFormData(prev => ({ ...prev, posterUrl: '' })); }}
                        class="text-emerald-700 hover:text-emerald-900 font-extrabold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visibility & Join Mode Row */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Visibility Switch Box */}
              <div class="flex items-center justify-between border border-slate-100 bg-slate-50/50 rounded-2xl p-4">
                <div>
                  <span class="block text-xs font-extrabold text-slate-900">Visibility</span>
                  <span class="text-[10px] text-slate-400 font-semibold">Who can see this room?</span>
                </div>
                <div class="inline-flex rounded-xl bg-slate-200/80 p-1">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, visibility: 'Public' }))}
                    class={`rounded-lg px-3 py-1.5 text-xs font-bold transition duration-150 ${
                      formData.visibility === 'Public'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, visibility: 'Private' }))}
                    class={`rounded-lg px-3 py-1.5 text-xs font-bold transition duration-150 ${
                      formData.visibility === 'Private'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Private
                  </button>
                </div>
              </div>

              {/* Join Mode Switch Box */}
              <div class="flex items-center justify-between border border-slate-100 bg-slate-50/50 rounded-2xl p-4">
                <div>
                  <span class="block text-xs font-extrabold text-slate-900">Join Mode</span>
                  <span class="text-[10px] text-slate-400 font-semibold">Entry requirements</span>
                </div>
                <div class="inline-flex rounded-xl bg-slate-200/80 p-1">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, joinMode: 'Open' }))}
                    class={`rounded-lg px-3 py-1.5 text-xs font-bold transition duration-150 ${
                      formData.joinMode === 'Open'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, joinMode: 'Approval' }))}
                    class={`rounded-lg px-3 py-1.5 text-xs font-bold transition duration-150 ${
                      formData.joinMode === 'Approval'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Approval
                  </button>
                </div>
              </div>

            </div>

            {/* Date & Time and Resources (Google Drive) */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-extrabold text-slate-900">Date & Time</label>
                <div class="relative">
                  <input
                    type="datetime-local"
                    name="dateTime"
                    value={formData.dateTime}
                    onChange={handleChange}
                    class="w-full rounded-2xl border border-slate-200/80 px-5 py-3.5 text-xs font-semibold focus:border-blue-600 focus:outline-none transition text-slate-700 bg-slate-50/30"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-extrabold text-slate-900">Resources (Google Drive)</label>
                <input
                  type="text"
                  name="resourcesDriveUrl"
                  placeholder="https://drive.google.com/..."
                  value={formData.resourcesDriveUrl}
                  onChange={handleChange}
                  class="w-full rounded-2xl border border-slate-200/80 px-5 py-3.5 text-xs font-semibold focus:border-blue-600 focus:outline-none transition placeholder:text-slate-300 bg-slate-50/30"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              class="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-4 shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <Zap size={16} class="fill-white" />
              <span>{loading ? 'Generating Room...' : 'Generate Room'}</span>
            </button>

          </form>

          {/* RIGHT COLUMN: PREVIEW & CHECKLIST */}
          <div class="lg:col-span-5 space-y-6 relative z-10">
            
            {/* Live Preview Card */}
            <div class="bg-white rounded-3xl border border-slate-100/90 p-6 shadow-xs space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="font-display font-extrabold text-slate-900 text-sm">
                  Live Preview
                </h3>
                {posterMode === 'template' && (
                  <button
                    type="button"
                    onClick={handleRegeneratePoster}
                    class="text-[10px] font-black text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Regenerate Style</span>
                  </button>
                )}
              </div>

              {/* Event Poster Visual Card (Dynamic Organic Palettes) */}
              <div class="w-full h-56 md:h-64 rounded-2xl relative overflow-hidden flex items-center justify-center p-6 text-white shadow-lg group">
                {posterMode === 'custom' && customPosterUrl ? (
                  <div class="absolute inset-0">
                    <img src={customPosterUrl} alt="Custom Event Poster" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]" />
                  </div>
                ) : (
                  /* Dynamic 3-Color Organic Palette Variation */
                  <div class={`absolute inset-0 bg-gradient-to-br ${organicPalettes[paletteIndex].bg}`}>
                    <div class={`absolute -top-6 -right-6 w-44 h-44 rounded-[40%_60%_70%_30%/50%_40%_60%_50%] ${organicPalettes[paletteIndex].shape1} opacity-90 shadow-md transition-all duration-300`}></div>
                    <div class={`absolute -bottom-8 -left-6 w-48 h-48 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] ${organicPalettes[paletteIndex].shape2} opacity-80 shadow-md transition-all duration-300`}></div>
                    <div class={`absolute bottom-3 right-16 w-8 h-8 rounded-full ${organicPalettes[paletteIndex].dot} transition-all duration-300`}></div>
                  </div>
                )}

                <div class="relative z-10 text-center leading-tight">
                  <span class="font-display font-black text-3xl md:text-4xl tracking-tight uppercase block drop-shadow-lg text-white">
                    {formData.title ? formData.title : (
                      <>
                        EVENT<br />POSTER
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div class="flex items-center gap-2 pt-1">
                <span class="bg-blue-50 text-blue-600 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  {formData.template}
                </span>
                <span class="bg-emerald-50 text-emerald-600 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  {formData.visibility}
                </span>
              </div>

              {/* Title & Description preview */}
              <div class="space-y-1">
                <h4 class="font-display font-extrabold text-slate-900 text-base">
                  {formData.title || 'e.g. Q4 Executive Mixer'}
                </h4>
                <p class="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                  {formData.description || 'Provide an event description on the left to preview it here.'}
                </p>
              </div>
            </div>

            {/* Instant Setup & Encrypted Badges Grid */}
            <div class="grid grid-cols-2 gap-4">
              {/* Instant Setup */}
              <div class="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4 flex flex-col justify-between aspect-4/3 space-y-2">
                <div class="h-9 w-9 rounded-xl bg-emerald-100/90 text-emerald-600 flex items-center justify-center">
                  <Zap size={18} class="fill-emerald-600" />
                </div>
                <div>
                  <h4 class="text-xs font-black text-slate-900">Instant Setup</h4>
                  <p class="text-[10px] text-emerald-600 font-bold mt-0.5">Ready in &lt; 10s</p>
                </div>
              </div>

              {/* Encrypted */}
              <div class="bg-blue-50/70 border border-blue-100/80 rounded-2xl p-4 flex flex-col justify-between aspect-4/3 space-y-2">
                <div class="h-9 w-9 rounded-xl bg-blue-100/90 text-blue-600 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 class="text-xs font-black text-slate-900">Encrypted</h4>
                  <p class="text-[10px] text-blue-600 font-bold mt-0.5">End-to-end security</p>
                </div>
              </div>
            </div>

            {/* Setup Checklist */}
            <div class="bg-white rounded-3xl border border-slate-100/90 p-6 shadow-xs space-y-4">
              <h4 class="font-display font-extrabold text-slate-900 text-sm">
                Setup Checklist
              </h4>
              <ul class="space-y-3 text-xs font-semibold text-slate-600">
                <li class="flex items-center gap-2.5">
                  {isTitleDone ? (
                    <CheckCircle2 size={16} class="text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Circle size={16} class="text-slate-300" />
                  )}
                  <span class={isTitleDone ? 'text-slate-900 font-bold' : 'text-slate-500'}>
                    Define a clear event title
                  </span>
                </li>

                <li class="flex items-center gap-2.5">
                  {isTemplateDone ? (
                    <CheckCircle2 size={16} class="text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Circle size={16} class="text-slate-300" />
                  )}
                  <span class="text-slate-900 font-bold">
                    Select appropriate template
                  </span>
                </li>

                <li class="flex items-center gap-2.5">
                  {isPrivacyDone ? (
                    <CheckCircle2 size={16} class="text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Circle size={16} class="text-slate-300" />
                  )}
                  <span class={isPrivacyDone ? 'text-slate-900 font-bold' : 'text-slate-500'}>
                    Set privacy preferences
                  </span>
                </li>

                <li class="flex items-center gap-2.5">
                  {isDocDone ? (
                    <CheckCircle2 size={16} class="text-emerald-500 fill-emerald-100" />
                  ) : (
                    <Circle size={16} class="text-slate-300" />
                  )}
                  <span class={isDocDone ? 'text-slate-900 font-bold' : 'text-slate-500'}>
                    Attach relevant documentation
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </UserLayout>
  );
};

export default CreateRoom;
