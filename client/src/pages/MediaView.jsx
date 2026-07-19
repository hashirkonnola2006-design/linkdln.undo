import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { RoomLayout } from '../components/Layouts';
import {
  Camera,
  Video,
  X,
  Check,
  RotateCcw,
  Download,
  PlayCircle,
  Image as ImageIcon,
  CheckCircle,
  HardDrive,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Upload,
  LogIn,
  LogOut,
  ShieldCheck,
  Trash2,
  LayoutGrid,
  List,
  ChevronDown
} from 'lucide-react';

// Authentic Google Drive Logo SVG
const GoogleDriveLogo = () => (
  <svg width="18" height="18" viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 10.15z" fill="#ea4335"/>
    <path d="m43.65 25 13.75-23.8c-1.4-.8-2.95-1.2-4.5-1.2h-18.5c-1.55 0-3.1.4-4.5 1.2z" fill="#00832d"/>
    <path d="m59.8 53-16.15-28-13.75 23.8 16.15 28h27.5c0-1.55-.4-3.1-1.2-4.5z" fill="#2684fc"/>
    <path d="m73.4 25h-27.5l13.75 23.8 13.75-23.8c0-1.55-.4-3.1-1.2-4.5-.8-1.4-1.95-2.5-3.3-3.3z" fill="#ffba00"/>
  </svg>
);

// Curved Arrow SVG for handwritten annotation
const CurvedArrow = () => (
  <svg width="42" height="28" viewBox="0 0 50 35" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-blue-500 transform -rotate-12">
    <path d="M40 5C25 10 10 20 12 30C12.5 32.5 15 32 17 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M7 24L12 30L19 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MediaView = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState(null);
  const [attendee, setAttendee] = useState(null);
  const [driveFiles, setDriveFiles] = useState([]);
  const [dbMedia, setDbMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [driveError, setDriveError] = useState(null);
  const [folderId, setFolderId] = useState('');
  const [oauthStatus, setOauthStatus] = useState(null);
  const [driveOAuthConnected, setDriveOAuthConnected] = useState(false);
  const [driveOwnerEmail, setDriveOwnerEmail] = useState('');
  const isCreator = localStorage.getItem(`room_creator_${code}`) === 'true';

  const extractDriveFolderId = (urlOrId) => {
    if (!urlOrId) return null;
    const str = String(urlOrId).trim();
    const folderMatch = str.match(/\/(?:folders|d)\/([a-zA-Z0-9_-]{10,})/);
    if (folderMatch) return folderMatch[1];
    const idMatch = str.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    if (idMatch) return idMatch[1];
    if (/^[a-zA-Z0-9_-]{10,}$/.test(str)) return str;
    return null;
  };

  const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
  const localRoom = localRooms.find(r => r.code === code);
  const activeDriveUrl = event?.resourcesDriveUrl || localRoom?.resourcesDriveUrl || '';
  const effectiveFolderId = folderId || extractDriveFolderId(activeDriveUrl);
  const driveFolderUrl = activeDriveUrl || (effectiveFolderId ? `https://drive.google.com/drive/folders/${effectiveFolderId}` : null);
  const fileUploadInputRef = useRef(null);

  // UI view controls
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

  // Modals
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [selectedLightboxItem, setSelectedLightboxItem] = useState(null);

  // Handle OAuth callback result from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauth = params.get('oauth');
    const email = params.get('email');
    if (oauth === 'success') {
      setOauthStatus({ type: 'success', email: decodeURIComponent(email || '') });
      setDriveOAuthConnected(true);
      setDriveOwnerEmail(decodeURIComponent(email || ''));
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (oauth === 'denied') {
      setOauthStatus({ type: 'denied', email: '' });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (oauth === 'error' || oauth === 'no_refresh_token' || oauth === 'room_not_in_db') {
      setOauthStatus({ type: 'error', msg: params.get('msg') || oauth });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.search]);

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
                _id: 'user_' + (parsed.name.replace(/\s+/g, '_') || 'me'),
                name: parsed.name,
                email: parsed.email || '',
                role: parsed.role || (isCreator ? 'Event Host' : 'Attendee'),
                company: parsed.company || 'Community',
                avatar: parsed.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100',
                isHost: isCreator,
                isOnline: true
              };
              localStorage.setItem(`attendee_${code}`, JSON.stringify(selfAttendee));
              setAttendee(selfAttendee);
              return;
            }
          } catch (err) {}
        }
        navigate(`/rooms/${code}`);
      }
    };
    loadAttendee();
    window.addEventListener('profileUpdated', loadAttendee);
    return () => window.removeEventListener('profileUpdated', loadAttendee);
  }, [code, navigate]);

  // Load event + Drive files + DB media
  const loadMedia = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setDriveError(null);

    try {
      let currentEvent = null;
      // 1. Load event details + OAuth status
      const evRes = await fetch(`/api/events/${code}`);
      if (evRes.ok) {
        currentEvent = await evRes.json();
        setEvent(currentEvent);
        if (currentEvent.driveConnected) {
          setDriveOAuthConnected(true);
        }
        if (currentEvent.driveOwnerEmail) {
          setDriveOwnerEmail(currentEvent.driveOwnerEmail);
        }
      } else {
        const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
        const foundLocal = localRooms.find(r => r.code === code);
        currentEvent = foundLocal || { code, title: 'Room ' + code };
        setEvent(currentEvent);
      }

      // 2. Load Drive files from backend proxy
      let driveUrlToUse = currentEvent?.resourcesDriveUrl;
      if (!driveUrlToUse) {
        try {
          const localRooms = JSON.parse(localStorage.getItem('local_created_rooms') || '[]');
          const localRoom = localRooms.find(r => r.code === code);
          driveUrlToUse = localRoom?.resourcesDriveUrl;
        } catch (_) {}
      }

      let folderUrlParam = driveUrlToUse ? `?folderUrl=${encodeURIComponent(driveUrlToUse)}` : '';

      const driveRes = await fetch(`/api/events/${code}/drive-files${folderUrlParam}`);
      if (driveRes.ok) {
        const driveData = await driveRes.json();
        setDriveFiles(driveData.files || []);
        if (driveData.folderId) setFolderId(driveData.folderId);
        if (driveData.message && !driveData.files?.length) {
          setDriveError({ type: 'info', message: driveData.message });
        }
      } else {
        const errData = await driveRes.json().catch(() => ({}));
        if (driveRes.status === 503) {
          setDriveError({ type: 'setup', message: 'Google API key is missing on the server. Connect your Google Account or open the Drive Folder directly using the buttons above.', folderId: errData.folderId });
        } else {
          setDriveError({ type: 'info', message: errData.message || 'Connect your Google Account or open the Drive Folder directly using the buttons above.' });
        }
      }

      // 3. Load captures — try DB first
      let captures = [];
      let fetchedFromDb = false;
      try {
        const mediaRes = await fetch(`/api/events/${code}/media`);
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          if (Array.isArray(mediaData)) {
            captures = mediaData;
            fetchedFromDb = true;
          }
        }
      } catch (_) {}

      const localKey = `room_captures_${code}`;
      const localCaptures = JSON.parse(localStorage.getItem(localKey) || '[]');

      if (fetchedFromDb) {
        // If DB returned captures list, sync localStorage to match DB and purge deleted items
        const dbIds = new Set(captures.map(m => m._id));
        const dbDriveIds = new Set(captures.filter(m => m.driveFileId).map(m => m.driveFileId));

        const activeLocal = localCaptures.filter(m =>
          m._id?.startsWith('local_') &&
          !dbIds.has(m._id) &&
          (!m.driveFileId || !dbDriveIds.has(m.driveFileId))
        );

        setDbMedia([...captures, ...activeLocal]);
        localStorage.setItem(localKey, JSON.stringify(activeLocal));
      } else {
        setDbMedia(localCaptures);
      }
    } catch (err) {
      console.error('Error loading media:', err);
      const localKey = `room_captures_${code}`;
      const localCaptures = JSON.parse(localStorage.getItem(localKey) || '[]');
      setDbMedia(localCaptures);
      setDriveError({ type: 'error', message: 'Network error loading media.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [code]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleMediaCaptured = (newMedia) => {
    // Save to localStorage so it persists on reload
    const localKey = `room_captures_${code}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
    localStorage.setItem(localKey, JSON.stringify([newMedia, ...existing]));
    setDbMedia(prev => [newMedia, ...prev]);
  };

  const handleDirectUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileType = file.type.startsWith('video') ? 'video' : 'image';
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const ext = fileType === 'video' ? 'webm' : 'jpg';
      const fileName = `${attendee?.name || 'upload'}_${Date.now()}.${ext}`;
      const payload = {
        type: fileType,
        url: reader.result,
        authorName: attendee?.name || 'Attendee',
        authorAvatar: attendee?.avatar || '',
        caption: '',
        fileName
      };

      try {
        const res = await fetch(`/api/events/${code}/media/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const saved = await res.json();
          handleMediaCaptured(saved);
          alert('Photo uploaded successfully!');
        } else {
          // fallback local
          const localSaved = {
            _id: 'local_media_' + Date.now(),
            code,
            ...payload,
            createdAt: new Date().toISOString()
          };
          handleMediaCaptured(localSaved);
          alert('Photo saved successfully!');
        }
      } catch (err) {
        console.error('Error uploading media:', err);
        const localSaved = {
          _id: 'local_media_' + Date.now(),
          code,
          ...payload,
          createdAt: new Date().toISOString()
        };
        handleMediaCaptured(localSaved);
        alert('Photo saved successfully!');
      }
    };
  };

  // Permission check for deleting media (Admin/Host OR author)
  const canDeleteMedia = (item) => {
    if (!item) return false;
    if (isCreator) return true;
    if (attendee?.name && item.authorName && item.authorName === attendee.name) return true;
    if (attendee?.email && item.authorEmail && item.authorEmail === attendee.email) return true;
    return false;
  };

  const handleDeleteMedia = async (e, item) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to remove this photo/video?')) return;

    const itemId = item._id || '';
    const fileId = item.driveFileId || item.id || (item.source === 'drive' ? item._id : '');

    try {
      await fetch(`/api/events/${code}/media/${itemId}?fileId=${fileId}`, {
        method: 'DELETE'
      });
    } catch (_) {}

    // Update frontend state
    setDriveFiles(prev => prev.filter(d => d._id !== itemId && d._id !== fileId));
    setDbMedia(prev => prev.filter(d => d._id !== itemId && d.driveFileId !== fileId && d._id !== itemId));

    // Remove from localStorage fallback by _id, driveFileId, and url
    try {
      const localKey = `room_captures_${code}`;
      const localCaptures = JSON.parse(localStorage.getItem(localKey) || '[]');
      const updated = localCaptures.filter(c =>
        c._id !== itemId &&
        c._id !== fileId &&
        c.driveFileId !== fileId &&
        (!item.url || c.url !== item.url)
      );
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch (_) {}

    if (selectedLightboxItem?._id === itemId || selectedLightboxItem?.driveFileId === fileId) {
      setSelectedLightboxItem(null);
    }
  };

  const [activeFilter, setActiveFilter] = useState('all');

  // Filter DB/local captures to exclude those already shown in the Google Drive section and invalid/broken items
  const localOnlyCaptures = dbMedia.filter(m => {
    if (!m.url || (typeof m.url === 'string' && m.url.trim().length < 10)) return false;
    if (m.driveFileId && driveFiles.some(d => d._id === m.driveFileId)) return false;
    if (driveFiles.some(d => d._id === m._id)) return false;
    return true;
  });

  // Combined media list for total count checks
  const allMedia = [
    ...driveFiles,
    ...localOnlyCaptures
  ];

  if (loading) {
    return (
      <div class="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold">
        Loading room media gallery...
      </div>
    );
  }

  return (
    <RoomLayout
      eventTitle={event?.title || 'Event Room'}
      onlineCount={1}
      attendees={[]}
    >
      <div class="max-w-7xl mx-auto px-6 py-6 space-y-6">        {/* Header Hero Banner matching Mockup */}
        <div class="relative bg-[#f4f6fa] rounded-[32px] border border-slate-200/60 p-8 sm:p-9 overflow-hidden shadow-xs flex flex-col justify-between min-h-[220px]">
          
          {/* Abstract background shapes - positioned safely in top-left corner */}
          <div class="absolute -top-8 -left-8 w-24 h-24 bg-[#2563eb] rounded-br-[70px] pointer-events-none z-0" />
          <div class="absolute top-8 left-20 w-3 h-3 bg-emerald-400 rounded-full pointer-events-none animate-pulse z-0" />
          
          {/* Dot grid pattern lower left */}
          <div class="absolute bottom-4 left-8 grid grid-cols-5 gap-1.5 opacity-20 pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div key={i} class="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            ))}
          </div>

          {/* Abstract yellow shape right + floating icon tile */}
          <div class="absolute -bottom-12 -right-10 w-48 h-48 bg-[#fbbf24] rounded-tl-[110px] pointer-events-none z-0" />
          
          {/* Floating white icon tile top right */}
          <div class="absolute top-6 right-20 bg-white rounded-2xl p-4 shadow-xl border border-slate-100/80 transform rotate-6 hidden sm:flex items-center justify-center z-10 pointer-events-none">
            <ImageIcon size={32} class="text-[#2563eb]" />
          </div>
          
          <div class="absolute top-14 right-14 w-3 h-3 bg-emerald-400 rounded-full hidden sm:block pointer-events-none" />
          <div class="absolute top-24 right-48 w-2.5 h-2.5 bg-amber-400 rounded-full hidden sm:block pointer-events-none" />

          {/* Header Top Section (pl-6 ensures text starts cleanly past the blue corner shape) */}
          <div class="relative z-10 pl-6 sm:pl-8 space-y-3 max-w-xl">
            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight leading-none">
                Room Media <br />
                <span class="text-[#2563eb] inline-block mt-1">Gallery</span>
              </h1>

              <div class="flex items-center gap-2 flex-wrap self-start mt-1">
                {effectiveFolderId || activeDriveUrl ? (
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-[#e6f4ea] text-[#137333] border border-emerald-200/80 px-3.5 py-1 text-xs font-extrabold shadow-2xs">
                    <CheckCircle size={14} />
                    Drive Linked
                  </span>
                ) : (
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1 text-xs font-extrabold">
                    <HardDrive size={14} />
                    No Drive Folder
                  </span>
                )}

                {driveOAuthConnected ? (
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-blue-200/80 px-3.5 py-1 text-xs font-extrabold shadow-2xs">
                    <ShieldCheck size={14} />
                    Google Connected
                  </span>
                ) : (
                  <a
                    href={`/api/auth/google?roomCode=${encodeURIComponent(code)}&title=${encodeURIComponent(event?.title || '')}&description=${encodeURIComponent(event?.description || '')}&hostName=${encodeURIComponent(event?.hostName || '')}&hostAvatar=${encodeURIComponent(event?.hostAvatar || '')}&resourcesDriveUrl=${encodeURIComponent(activeDriveUrl || '')}&driveFolderId=${encodeURIComponent(effectiveFolderId || '')}`}
                    class="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 px-3.5 py-1 text-xs font-extrabold text-slate-700 hover:text-blue-600 transition shadow-xs cursor-pointer"
                  >
                    <LogIn size={14} />
                    Connect Google Account
                  </a>
                )}
              </div>
            </div>

            <p class="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
              All media from your room, synced from Google Drive and captured instantly.
            </p>
          </div>

          {/* Action Buttons (Bottom Right) */}
          <div class="relative z-10 flex items-center justify-end gap-3 mt-6 flex-wrap">
            <a
              href={driveFolderUrl || 'https://drive.google.com'}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-[#1a73e8] font-extrabold text-xs px-5 py-3 transition cursor-pointer shadow-2xs"
              title="Visit Google Drive Folder"
            >
              <ExternalLink size={14} />
              <span>Visit Drive Folder</span>
            </a>

            {!driveOAuthConnected && (
              <a
                href={`/api/auth/google?roomCode=${encodeURIComponent(code)}&title=${encodeURIComponent(event?.title || '')}&description=${encodeURIComponent(event?.description || '')}&hostName=${encodeURIComponent(event?.hostName || '')}&hostAvatar=${encodeURIComponent(event?.hostAvatar || '')}&resourcesDriveUrl=${encodeURIComponent(activeDriveUrl || '')}&driveFolderId=${encodeURIComponent(effectiveFolderId || '')}`}
                class="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs px-5 py-3 transition cursor-pointer shadow-2xs"
                title="Connect to Google Drive Folder"
              >
                <GoogleDriveLogo />
                <span>Connect to Folder</span>
              </a>
            )}

            <button
              onClick={() => loadMedia(true)}
              disabled={refreshing}
              class="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs px-5 py-3 transition cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw size={14} class={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>

            <button
              onClick={() => fileUploadInputRef.current?.click()}
              class="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs px-5 py-3 transition cursor-pointer shadow-2xs"
            >
              <Upload size={14} />
              <span>Upload Photo</span>
            </button>
            <input
              type="file"
              ref={fileUploadInputRef}
              onChange={handleDirectUpload}
              accept="image/*,video/*"
              class="hidden"
            />

            <button
              onClick={() => setShowCaptureModal(true)}
              class="inline-flex items-center gap-2 rounded-2xl bg-[#1a73e8] hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3.5 shadow-lg shadow-blue-500/20 transition cursor-pointer"
            >
              <Camera size={16} />
              <span>Capture Moment</span>
            </button>
          </div>

        </div>

        {/* Drive Setup / Error Banner */}
        {driveError && (
          <div class={`rounded-3xl border p-5 flex items-start gap-4 ${
            driveError.type === 'setup' ? 'bg-amber-50 border-amber-200/80' :
            driveError.type === 'error' ? 'bg-red-50 border-red-200/80' :
            'bg-blue-50 border-blue-200/80'
          }`}>
            <AlertCircle size={20} class={
              driveError.type === 'setup' ? 'text-amber-500 shrink-0 mt-0.5' :
              driveError.type === 'error' ? 'text-red-500 shrink-0 mt-0.5' :
              'text-blue-500 shrink-0 mt-0.5'
            } />
            <div>
              <p class={`text-sm font-bold ${
                driveError.type === 'setup' ? 'text-amber-800' :
                driveError.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {driveError.type === 'setup' ? 'Google API Key Required' :
                 driveError.type === 'error' ? 'Drive Error' : 'Notice'}
              </p>
              <p class={`text-xs font-medium mt-1 ${
                driveError.type === 'setup' ? 'text-amber-700' :
                driveError.type === 'error' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {driveError.message}
              </p>
            </div>
          </div>
        )}

        {/* OAuth Status Toast */}
        {oauthStatus && (
          <div class={`rounded-3xl border p-5 flex items-start gap-4 ${
            oauthStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200/80' : 'bg-red-50 border-red-200/80'
          }`}>
            {oauthStatus.type === 'success'
              ? <CheckCircle size={20} class="text-emerald-600 shrink-0 mt-0.5" />
              : <AlertCircle size={20} class="text-red-500 shrink-0 mt-0.5" />
            }
            <div class="flex-1">
              <p class={`text-sm font-bold ${oauthStatus.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
                {oauthStatus.type === 'success'
                  ? `Google Drive connected${oauthStatus.email ? ` as ${oauthStatus.email}` : ''}!`
                  : oauthStatus.type === 'denied' ? 'Google authorization denied'
                  : oauthStatus.type === 'room_not_in_db'
                    ? 'Room not saved to database yet'
                    : 'Google OAuth error'
                }
              </p>
              {oauthStatus.type === 'success' && (
                <p class="text-xs text-emerald-700 font-medium mt-0.5">
                  Captures you take in this room will now be uploaded directly to your Google Drive folder.
                </p>
              )}
            </div>
            <button onClick={() => setOauthStatus(null)} class="text-slate-400 hover:text-slate-600 transition shrink-0">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Media Toolbar / Sub-header Bar matching Mockup */}
        <div class="flex items-center justify-between pt-2">
          <div class="flex items-center gap-2">
            <h3 class="font-display font-black text-2xl text-slate-900">Media</h3>
            <span class="bg-blue-50 border border-blue-100 text-[#1a73e8] font-extrabold px-3 py-1 rounded-full text-xs">
              {allMedia.length} {allMedia.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div class="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div class="bg-white border border-slate-200 rounded-2xl p-1 flex items-center gap-1 shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                class={`p-2 rounded-xl transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-blue-50 text-[#1a73e8]' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                class={`p-2 rounded-xl transition cursor-pointer ${
                  viewMode === 'list' ? 'bg-blue-50 text-[#1a73e8]' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div class="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                class="appearance-none bg-white border border-slate-200 rounded-2xl px-4 py-2 pr-8 text-xs font-extrabold text-slate-700 shadow-2xs cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <ChevronDown size={14} class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 5-Column Square Media Grid matching Mockup */}
        {allMedia.length === 0 ? (
          <div class="bg-white rounded-3xl border border-slate-100 p-16 text-center space-y-4 shadow-sm">
            <div class="h-16 w-16 rounded-full bg-blue-50 text-[#1a73e8] flex items-center justify-center mx-auto">
              <ImageIcon size={32} />
            </div>
            <h3 class="font-display font-bold text-xl text-slate-800">No media yet</h3>
            <p class="text-xs text-slate-400 font-medium max-w-sm mx-auto">
              {folderId
                ? 'No images or videos found in the linked Drive folder. Make sure the folder is shared publicly and contains media files.'
                : 'No Drive folder is linked to this room. Add files by capturing a moment below, or link a Drive folder when creating a room.'}
            </p>
            <button
              onClick={() => setShowCaptureModal(true)}
              class="bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition cursor-pointer inline-block"
            >
              Take First Photo
            </button>
          </div>
        ) : (
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {allMedia.map((item) => {
              const isDrive = item.source === 'drive' || item.driveFileId;
              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedLightboxItem(item)}
                  class="group relative aspect-square rounded-[24px] overflow-hidden shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {isDrive ? (
                    /* Google Drive Media Card */
                    <div class="relative w-full h-full bg-slate-900">
                      <img
                        src={item.thumbnailUrl || (item.driveFileId ? `https://lh3.googleusercontent.com/d/${item.driveFileId}` : item.url)}
                        alt={item.caption || item.name || 'Media'}
                        class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          if (item.url && item.url.startsWith('http')) {
                            e.target.src = item.url;
                          } else {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&h=400';
                          }
                        }}
                      />

                      {/* Delete button on hover top left */}
                      {canDeleteMedia(item) && (
                        <button
                          onClick={(e) => handleDeleteMedia(e, item)}
                          title="Delete photo"
                          class="absolute top-3 left-3 bg-red-600/90 hover:bg-red-600 backdrop-blur-md text-white p-1.5 rounded-xl transition duration-200 shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer z-10"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Captured in Room Card */
                    <div class="relative w-full h-full bg-gradient-to-br from-[#0a192f] via-[#1e1b4b] to-[#3b0764] p-4 flex flex-col items-center justify-center text-center">
                      {/* Floating Camera Badge Top Right */}
                      <div class="absolute top-3 right-3 bg-[#1a73e8] text-white p-2 rounded-xl shadow-md flex items-center justify-center">
                        <Camera size={13} />
                      </div>

                      {/* Glowing White Camera Circle Center */}
                      <div class="h-14 w-14 rounded-full bg-white text-[#1a73e8] flex items-center justify-center shadow-2xl mb-2.5 group-hover:scale-110 transition duration-300">
                        <Camera size={26} />
                      </div>

                      <p class="text-xs font-extrabold text-white tracking-wide">
                        Captured in Room
                      </p>
                      <p class="text-[10px] font-medium text-blue-200/80 mt-0.5">
                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                      </p>

                      {/* Delete button on hover top left */}
                      {canDeleteMedia(item) && (
                        <button
                          onClick={(e) => handleDeleteMedia(e, item)}
                          title="Delete photo"
                          class="absolute top-3 left-3 bg-red-600/90 hover:bg-red-600 backdrop-blur-md text-white p-1.5 rounded-xl transition duration-200 shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer z-10"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Handwritten Annotation at bottom matching Mockup */}
        <div class="pt-6 pb-2 flex items-center justify-center gap-3">
          <CurvedArrow />
          <span class="font-['Caveat'] text-2xl text-blue-600 font-bold tracking-wide">
            Your memories, all in one place. 💙
          </span>
        </div>

      </div>

      {/* LIGHTBOX MODAL */}
      {selectedLightboxItem && (
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div class="relative max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 space-y-4 p-6 text-white">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
              <div class="flex items-center gap-3">
                {selectedLightboxItem.source === 'drive' ? (
                  <div class="h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <HardDrive size={14} class="text-blue-400" />
                  </div>
                ) : (
                  <img
                    src={selectedLightboxItem.authorAvatar || 'https://api.dicebear.com/7.x/open-peeps/svg?seed=user'}
                    alt={selectedLightboxItem.authorName}
                    class="h-8 w-8 rounded-full object-cover border border-slate-700"
                  />
                )}
                <div>
                  <h4 class="font-bold text-sm text-white">
                    {selectedLightboxItem.name || selectedLightboxItem.authorName || 'Media'}
                  </h4>
                  <span class="text-[10px] text-slate-400">
                    {selectedLightboxItem.source === 'drive' ? 'From Google Drive' : `Captured in room ${code}`}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                {canDeleteMedia(selectedLightboxItem) && (
                  <button
                    onClick={(e) => handleDeleteMedia(e, selectedLightboxItem)}
                    class="inline-flex items-center gap-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-xs font-bold px-3.5 py-2 text-white transition cursor-pointer shadow-sm"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
                {selectedLightboxItem.webViewLink && (
                  <a
                    href={selectedLightboxItem.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold px-4 py-2 text-white transition"
                  >
                    <ExternalLink size={14} /> Open in Drive
                  </a>
                )}
                <button
                  onClick={() => setSelectedLightboxItem(null)}
                  class="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Media Player / Image */}
            <div class="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              {selectedLightboxItem.type === 'video' ? (
                <video src={selectedLightboxItem.url} controls autoPlay class="max-h-[65vh] w-auto rounded-2xl" />
              ) : (
                <img src={selectedLightboxItem.url} alt="Lightbox Preview" class="max-h-[65vh] w-auto object-contain rounded-2xl" />
              )}
            </div>

            {/* Footer Caption */}
            <div class="flex items-center justify-between pt-2">
              <p class="text-sm font-semibold text-slate-300">
                {selectedLightboxItem.caption || selectedLightboxItem.name || 'Captured moment'}
              </p>
              {!selectedLightboxItem.source === 'drive' && (
                <a
                  href={selectedLightboxItem.url}
                  download={`room_media_${selectedLightboxItem._id}`}
                  class="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold px-4 py-2 text-white transition"
                >
                  <Download size={14} /> Download
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CAMERA CAPTURE MODAL */}
      {showCaptureModal && (
        <MediaCaptureModal
          code={code}
          attendee={attendee}
          onClose={() => setShowCaptureModal(false)}
          onMediaCaptured={handleMediaCaptured}
        />
      )}

    </RoomLayout>
  );
};

/**
 * Camera Capture Modal Component
 */
const MediaCaptureModal = ({ code, attendee, onClose, onMediaCaptured }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [mode, setMode] = useState('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState('');
  const [capturedType, setCapturedType] = useState('image');
  const [caption, setCaption] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    let activeStream = null;
    const startCamera = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        });
        activeStream = userStream;
        setStream(userStream);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraError('Camera access denied or unavailable. Please enable browser camera permissions.');
      }
    };

    if (!capturedUrl) {
      startCamera();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedUrl]);

  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedUrl(dataUrl);
    setCapturedType('image');
    // Stop camera
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  const handleStartRecording = () => {
    if (!stream) return;
    const chunks = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        setCapturedUrl(reader.result);
        setCapturedType('video');
      };
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (stream) stream.getTracks().forEach(t => t.stop());
    }
  };

  const handleFileUploadFallback = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileType = file.type.startsWith('video') ? 'video' : 'image';
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setCapturedUrl(reader.result);
      setCapturedType(fileType);
    };
  };

  const handleConfirmUpload = async () => {
    if (!capturedUrl) return;
    setUploading(true);

    const ext = capturedType === 'video' ? 'webm' : 'jpg';
    const fileName = `${attendee?.name || 'capture'}_${Date.now()}.${ext}`;

    const payload = {
      type: capturedType,
      url: capturedUrl,
      authorName: attendee?.name || 'Attendee',
      authorAvatar: attendee?.avatar || '',
      caption: caption.trim(),
      fileName
    };

    try {
      const res = await fetch(`/api/events/${code}/media/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setUploadSuccess(true);
        onMediaCaptured(saved);
        setTimeout(() => onClose(), 1000);
      } else {
        // Fallback local
        const localSaved = {
          _id: 'local_media_' + Date.now(),
          code,
          ...payload,
          createdAt: new Date().toISOString()
        };
        setUploadSuccess(true);
        onMediaCaptured(localSaved);
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      console.error('Error uploading media:', err);
      const localSaved = {
        _id: 'local_media_' + Date.now(),
        code,
        ...payload,
        createdAt: new Date().toISOString()
      };
      setUploadSuccess(true);
      onMediaCaptured(localSaved);
      setTimeout(() => onClose(), 1000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
      <div class="max-w-2xl w-full bg-slate-950 rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-6 text-white">

        {/* Header */}
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div class="flex items-center gap-2">
            <Camera class="text-blue-500" size={20} />
            <h3 class="font-display font-bold text-lg">Capture a Moment</h3>
          </div>
          <button onClick={onClose} class="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {uploadSuccess ? (
          <div class="py-12 text-center space-y-4">
            <div class="h-16 w-16 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Check size={28} class="text-emerald-400" />
            </div>
            <p class="font-bold text-emerald-400">Saved successfully!</p>
            <p class="text-xs text-slate-400">Your media has been saved to the room gallery.</p>
          </div>
        ) : (
          <>
            {/* Viewfinder / Preview Container */}
            <div class="relative w-full aspect-16/9 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-slate-800">
              {capturedUrl ? (
                capturedType === 'video' ? (
                  <video src={capturedUrl} controls autoPlay class="w-full h-full object-contain" />
                ) : (
                  <img src={capturedUrl} alt="Captured preview" class="w-full h-full object-contain" />
                )
              ) : cameraError ? (
                <div class="p-8 text-center space-y-4">
                  <p class="text-xs text-red-400 font-semibold">{cameraError}</p>
                  <label class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-2 shadow-md">
                    <Upload size={14} />
                    Choose File to Upload
                    <input type="file" accept="image/*,video/*" onChange={handleFileUploadFallback} class="hidden" />
                  </label>
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline muted class="w-full h-full object-cover scale-x-[-1]" />
              )}

              {isRecording && (
                <div class="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                  <span class="h-2 w-2 rounded-full bg-white"></span> Recording Video...
                </div>
              )}
            </div>

            {/* Controls Section */}
            {capturedUrl ? (
              <div class="space-y-4">
                <input
                  type="text"
                  placeholder="Add an optional caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <p class="text-[11px] text-slate-400 font-medium">
                  This will be saved to the room gallery and persist across reloads.
                </p>
                <div class="flex items-center gap-3">
                  <button
                    onClick={() => setCapturedUrl('')}
                    class="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 flex items-center justify-center gap-2 transition"
                  >
                    <RotateCcw size={14} /> Retake
                  </button>
                  <button
                    onClick={handleConfirmUpload}
                    disabled={uploading}
                    class="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20 disabled:opacity-50"
                  >
                    <Upload size={16} /> {uploading ? 'Saving...' : 'Save to Gallery'}
                  </button>
                </div>
              </div>
            ) : (
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 bg-slate-900 p-1 rounded-xl">
                  <button
                    onClick={() => setMode('photo')}
                    class={`px-4 py-2 rounded-lg text-xs font-bold transition ${mode === 'photo' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Photo
                  </button>
                  <button
                    onClick={() => setMode('video')}
                    class={`px-4 py-2 rounded-lg text-xs font-bold transition ${mode === 'video' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Video
                  </button>
                </div>

                {mode === 'photo' ? (
                  <button
                    onClick={handleTakePhoto}
                    disabled={Boolean(cameraError)}
                    class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Camera size={16} /> Take Photo
                  </button>
                ) : isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    Stop & Save
                  </button>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    disabled={Boolean(cameraError)}
                    class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Video size={16} /> Record Video
                  </button>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default MediaView;
