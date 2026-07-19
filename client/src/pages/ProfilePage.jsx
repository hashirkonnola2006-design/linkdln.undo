import React, { useState, useEffect, useRef } from 'react';
import { UserLayout } from '../components/Layouts';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Briefcase, 
  Building2, 
  MapPin, 
  Globe, 
  Quote, 
  Save, 
  Camera,
  Pencil,
  Link2,
  CheckCircle2,
  Upload,
  Video,
  X
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    company: '',
    tagline: '',
    location: '',
    bio: '',
    avatar: ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Pre-fill form from AuthContext user on mount
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        role: user.role || '',
        company: user.company || '',
        tagline: user.role || '',
        location: user.location || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = () => {
    setShowAvatarModal(true);
    setCapturedImage(null);
    setIsCameraActive(false);
  };

  const closeAvatarModal = () => {
    stopCamera();
    setShowAvatarModal(false);
    setCapturedImage(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300, facingMode: 'user' } });
      setCameraStream(stream);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      alert("Could not access camera: " + err.message);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      const size = Math.min(video.videoWidth, video.videoHeight) || 300;
      canvas.width = size;
      canvas.height = size;
      
      const startX = (video.videoWidth - size) / 2;
      const startY = (video.videoHeight - size) / 2;
      
      context.drawImage(video, startX, startY, size, size, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Please select an image smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: profile.name,
        email: profile.email,
        bio: profile.bio,
        role: profile.role,
        company: profile.company,
        location: profile.location,
        avatar: profile.avatar
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserLayout>
      <div class="max-w-5xl mx-auto space-y-6 relative">
        
        {/* MAIN PROFILE CONTAINER CARD */}
        <div class="bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-6 relative z-10">
          
          {/* HEADER TITLE BAR */}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3.5">
              <div class="h-10 w-10 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div>
                <h1 class="font-display text-lg font-extrabold text-slate-900 tracking-tight">
                  Your Networking Profile
                </h1>
                <p class="text-xs text-slate-400 font-semibold">
                  This is how you appear to others in rooms and across the linkdln.undo community.
                </p>
              </div>
            </div>

            <span class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 font-extrabold text-[10px] px-3.5 py-1.5 rounded-full tracking-wider border border-blue-100/60 shadow-2xs uppercase">
              <span class="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              LIVE PROFILE CARD
            </span>
          </div>

          {/* Toast Notification */}
          {savedSuccess && (
            <div class="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-bold border border-emerald-100 shadow-2xs animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={18} class="text-emerald-600" />
              <span>Profile details saved successfully! Your profile is updated across all networking rooms.</span>
            </div>
          )}

          {/* TOP PROFILE PREVIEW CARD WITH SOFT ORGANIC SHAPES */}
          <div class="bg-[#f8fafc]/80 rounded-3xl p-6 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            
            {/* Left Profile Avatar & Text Info */}
            <div class="flex items-center gap-5 relative z-10">
              <div class="relative group shrink-0">
                <img
                  src={profile.avatar || `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(profile.name || 'user')}`}
                  alt={profile.name || 'User Profile'}
                  class="h-24 w-24 rounded-full object-cover shadow-xs border-2 border-white bg-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAvatarChange}
                  title="Change Profile Photo"
                  class="absolute bottom-0 right-0 rounded-full bg-blue-600 text-white p-2 shadow-sm border-2 border-white hover:bg-blue-700 transition cursor-pointer"
                >
                  <Pencil size={12} />
                </button>
              </div>

              <div class="space-y-1">
                <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">
                  {profile.name || 'Your Name'}
                </h2>
                <p class="text-xs font-extrabold text-blue-600">
                  {profile.role || 'Member'}
                </p>
                <p class="text-xs text-slate-500 font-semibold">
                  {profile.bio || 'No bio added yet'}
                </p>
                
                <div class="flex items-center gap-2 text-[11px] font-semibold text-slate-400 pt-1">
                  <div class="flex items-center gap-1">
                    <MapPin size={12} class="text-slate-400" />
                    <span>{profile.location || 'Location not specified'}</span>
                  </div>
                  <span class="text-slate-300">|</span>
                  <div class="flex items-center gap-1">
                    <Link2 size={12} class="text-slate-400" />
                    <span class="text-blue-600 font-bold hover:underline cursor-pointer">
                      linkdln.undo/{profile.name ? profile.name.toLowerCase().replace(/\s+/g, '') : 'profile'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Background Organic Soft Shapes */}
            <div class="absolute right-0 top-0 bottom-0 w-80 pointer-events-none overflow-hidden">
              <div class="absolute -top-10 right-24 w-44 h-44 rounded-full bg-blue-100/50 opacity-70"></div>
              <div class="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-sky-100/40"></div>
              <div class="absolute -bottom-10 right-2 w-48 h-48 rounded-[50%_50%_40%_60%/60%_40%_60%_40%] bg-[#fef3c7] opacity-90"></div>
              
              {/* Dot Matrix Graphic */}
              <div class="absolute top-10 right-36 grid grid-cols-4 gap-2 opacity-30">
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
                <span class="h-1 w-1 rounded-full bg-blue-600"></span>
              </div>
            </div>

            {/* Company Badge Pill Floating Bottom Right */}
            <div class="relative z-10 self-end md:self-center">
              <span class="bg-white/90 shadow-2xs border border-slate-100 rounded-full px-5 py-2 text-xs font-bold text-slate-700 flex items-center gap-1.5 backdrop-blur-xs">
                <Building2 size={13} class="text-slate-500" />
                {profile.company || 'Independent'}
              </span>
            </div>

          </div>

          {/* EDIT FORM */}
          <form onSubmit={handleSave} class="space-y-6">
            
            {/* TWO-COLUMN CARDS ROW */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LEFT CARD: Personal Information */}
              <div class="border border-slate-100/80 bg-white rounded-3xl p-6 space-y-4 shadow-2xs">
                <div class="flex items-center gap-2.5 pb-1">
                  <div class="h-7 w-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <User size={15} />
                  </div>
                  <h3 class="font-extrabold text-xs text-slate-900">Personal Information</h3>
                </div>

                <div class="space-y-3">
                  {/* Full Name */}
                  <div class="bg-[#f8fafc]/80 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3.5 focus-within:border-blue-500 transition">
                    <div class="h-9 w-9 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <User size={16} />
                    </div>
                    <div class="flex-1">
                      <span class="block text-[10px] font-bold text-slate-400">Full Name</span>
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        placeholder="e.g. Hashir"
                        class="w-full bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Job Title / Role */}
                  <div class="bg-[#f8fafc]/80 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3.5 focus-within:border-blue-500 transition">
                    <div class="h-9 w-9 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <Briefcase size={16} />
                    </div>
                    <div class="flex-1">
                      <span class="block text-[10px] font-bold text-slate-400">Job Title / Role</span>
                      <input
                        type="text"
                        name="role"
                        value={profile.role}
                        onChange={handleChange}
                        placeholder="e.g. Software Engineer / Product Manager"
                        class="w-full bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Workplace / Location */}
                  <div class="bg-[#f8fafc]/80 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3.5 focus-within:border-blue-500 transition">
                    <div class="h-9 w-9 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <MapPin size={16} />
                    </div>
                    <div class="flex-1">
                      <span class="block text-[10px] font-bold text-slate-400">Workplace / Location (optional)</span>
                      <input
                        type="text"
                        name="location"
                        value={profile.location}
                        onChange={handleChange}
                        placeholder="e.g. Malappuram, Kerala"
                        class="w-full bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT CARD: Contact Information */}
              <div class="border border-slate-100/80 bg-white rounded-3xl p-6 space-y-4 shadow-2xs">
                <div class="flex items-center gap-2.5 pb-1">
                  <div class="h-7 w-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail size={15} />
                  </div>
                  <h3 class="font-extrabold text-xs text-slate-900">Contact Information</h3>
                </div>

                <div class="space-y-3">
                  {/* Email Address */}
                  <div class="bg-[#f8fafc]/80 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3.5 focus-within:border-blue-500 transition">
                    <div class="h-9 w-9 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <Mail size={16} />
                    </div>
                    <div class="flex-1">
                      <span class="block text-[10px] font-bold text-slate-400">Email Address</span>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        placeholder="e.g. name@example.com"
                        class="w-full bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Company / Affiliation */}
                  <div class="bg-[#f8fafc]/80 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3.5 focus-within:border-blue-500 transition">
                    <div class="h-9 w-9 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <Building2 size={16} />
                    </div>
                    <div class="flex-1">
                      <span class="block text-[10px] font-bold text-slate-400">Company / Affiliation</span>
                      <input
                        type="text"
                        name="company"
                        value={profile.company}
                        onChange={handleChange}
                        placeholder="e.g. Acme Inc."
                        class="w-full bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTTOM CARD: Your Bio / About You */}
            <div class="border border-slate-100/80 bg-white rounded-3xl p-6 space-y-4 shadow-2xs">
              <div class="flex items-center gap-2.5 pb-1">
                <div class="h-7 w-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Quote size={15} />
                </div>
                <h3 class="font-extrabold text-xs text-slate-900">Your Bio / About You</h3>
              </div>

              <div class="bg-[#f8fafc]/80 border border-slate-100 rounded-2xl p-4 relative">
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  maxLength={250}
                  rows={3}
                  placeholder="Tell others about your background, interests, or goals..."
                  class="w-full bg-transparent text-xs font-extrabold text-slate-900 focus:outline-none placeholder:text-slate-300 resize-none"
                />
                <span class="absolute bottom-3 right-4 text-[10px] font-extrabold text-slate-400">
                  {(profile.bio || '').length}/250
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              class="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-4 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer mt-4 transition active:scale-[0.99] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div class="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} class="fill-white" />
                  <span>Save Profile Details</span>
                </>
              )}
            </button>

          </form>

        </div>
      </div>

      {/* Avatar Upload/Capture Modal */}
      {showAvatarModal && (
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 class="font-display font-bold text-lg text-slate-900">Update Profile Picture</h3>
              <button 
                type="button" 
                onClick={closeAvatarModal}
                class="text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-50 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Content */}
            {!isCameraActive && !capturedImage && (
              <div class="grid grid-cols-2 gap-4">
                {/* Upload from Computer Card */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  class="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20 group"
                >
                  <div class="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition duration-300">
                    <Upload size={22} />
                  </div>
                  <span class="text-xs font-bold text-slate-800">Upload Photo</span>
                  <span class="text-[10px] text-slate-400 mt-1">From computer</span>
                </div>

                {/* Capture from Webcam Card */}
                <div 
                  onClick={startCamera}
                  class="border-2 border-dashed border-slate-200 hover:border-purple-500 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50/50 hover:bg-purple-50/20 group"
                >
                  <div class="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition duration-300">
                    <Video size={22} />
                  </div>
                  <span class="text-xs font-bold text-slate-800">Take Photo</span>
                  <span class="text-[10px] text-slate-400 mt-1">Using webcam</span>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  class="hidden" 
                />
              </div>
            )}

            {/* Camera Active View */}
            {isCameraActive && (
              <div class="space-y-4">
                <div class="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-[280px] mx-auto shadow-inner border border-slate-100">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    class="w-full h-full object-cover scale-x-[-1]" 
                  />
                </div>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer shadow-md"
                  >
                    Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview & Save View */}
            {capturedImage && (
              <div class="space-y-4 text-center">
                <div class="h-36 w-36 rounded-full overflow-hidden mx-auto border-4 border-slate-100 shadow-md bg-slate-50">
                  <img 
                    src={capturedImage} 
                    alt="Avatar Preview" 
                    class="w-full h-full object-cover" 
                  />
                </div>
                <p class="text-xs text-slate-500 font-medium">Looking good! Save this photo as your profile picture?</p>
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setProfile(prev => ({ ...prev, avatar: capturedImage }));
                      closeAvatarModal();
                    }}
                    class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer shadow-md"
                  >
                    Save Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setCapturedImage(null)}
                    class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer"
                  >
                    Retake
                  </button>
                </div>
              </div>
            )}

            {/* Hidden canvas for capturing video frames */}
            <canvas ref={canvasRef} class="hidden" />
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default ProfilePage;
