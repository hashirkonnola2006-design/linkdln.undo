import React, { useState } from 'react';
import { UserLayout } from '../components/Layouts';
import { 
  Settings, 
  Palette, 
  Bell, 
  ShieldCheck, 
  Eye, 
  Database, 
  Download, 
  Trash2, 
  Key, 
  Smartphone, 
  Lock, 
  CheckCircle2,
  AlertTriangle,
  Mail,
  Clock,
  Sun,
  Calendar,
  ChevronDown,
  Users,
  User
} from 'lucide-react';

// Reusable Toggle Switch Component
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    class={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? 'bg-blue-600' : 'bg-slate-200'
    }`}
  >
    <span
      class={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

// Reusable Pill Select Dropdown Component matching Reference Mockup
const PillSelect = ({ value, onChange, options, icon: Icon }) => (
  <div class="relative inline-flex items-center">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      class="appearance-none bg-slate-50/80 border border-slate-200/80 hover:border-blue-400 rounded-2xl pl-10 pr-9 py-2.5 text-xs font-extrabold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none transition cursor-pointer shadow-2xs"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {Icon && <Icon size={14} class="absolute left-3.5 text-slate-600 pointer-events-none" />}
    <ChevronDown size={14} class="absolute right-3 text-slate-400 pointer-events-none" />
  </div>
);

const SettingsPage = () => {
  // Appearance & Notifications State
  const [theme, setTheme] = useState('light');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [notificationFrequency, setNotificationFrequency] = useState('daily');

  // Account & Security State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [lastPasswordChange] = useState('3 months ago');
  const [activeSessionsCount] = useState(2);

  // Privacy State
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [roomVisibility, setRoomVisibility] = useState('anyone');

  // Action Feedback State
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Handler for Theme change
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // TODO: Connect to backend API: PUT /api/user/settings { theme: newTheme }
    showToast(`Theme updated to ${newTheme === 'light' ? 'Light Mode' : 'Dark Mode'}`);
  };

  // Handler for Email Notifications toggle
  const handleEmailNotificationsToggle = (val) => {
    setEmailNotifications(val);
    // TODO: Connect to backend API: PUT /api/user/settings { emailNotifications: val }
    showToast(`Email notifications ${val ? 'enabled' : 'disabled'}`);
  };

  // Handler for Push Notifications toggle
  const handlePushNotificationsToggle = (val) => {
    setPushNotifications(val);
    // TODO: Connect to backend API: PUT /api/user/settings { pushNotifications: val }
    showToast(`Push notifications ${val ? 'enabled' : 'disabled'}`);
  };

  // Handler for Notification Frequency change
  const handleFrequencyChange = (val) => {
    setNotificationFrequency(val);
    // TODO: Connect to backend API: PUT /api/user/settings { notificationFrequency: val }
    showToast(`Notification frequency updated to ${val}`);
  };

  // Handler for Password Change click
  const handleChangePasswordClick = () => {
    // TODO: Open Change Password Modal or call POST /api/auth/change-password
    alert('Change password modal: In a backend-integrated environment, this opens the secure password reset flow.');
  };

  // Handler for 2FA Toggle
  const handleTwoFactorToggle = (val) => {
    setTwoFactorAuth(val);
    // TODO: Connect to backend API: POST /api/auth/2fa/toggle { enabled: val }
    showToast(`Two-factor authentication ${val ? 'enabled' : 'disabled'}`);
  };

  // Handler for Manage Sessions click
  const handleManageSessionsClick = () => {
    // TODO: Fetch and manage sessions from GET /api/auth/sessions
    alert(`Active Sessions (${activeSessionsCount} devices signed in):\n1. Chrome on Windows (Current Session)\n2. Safari on iPhone 15 Pro`);
  };

  // Handler for Profile Visibility change
  const handleProfileVisibilityChange = (val) => {
    setProfileVisibility(val);
    // TODO: Connect to backend API: PUT /api/user/privacy { profileVisibility: val }
    showToast(`Profile visibility set to ${val}`);
  };

  // Handler for Room Visibility change
  const handleRoomVisibilityChange = (val) => {
    setRoomVisibility(val);
    // TODO: Connect to backend API: PUT /api/user/privacy { roomVisibility: val }
    showToast(`Default room visibility set to ${val}`);
  };

  // Handler for Export Data
  const handleExportData = () => {
    // TODO: Connect to backend API: GET /api/user/export-data to generate downloadable JSON/ZIP
    const exportPayload = {
      userProfile: JSON.parse(localStorage.getItem('global_profile') || '{}'),
      exportedAt: new Date().toISOString(),
      jars: [],
      rooms: []
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkdln_undo_user_data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('User data exported successfully!');
  };

  // Handler for Account Deletion
  const handleDeleteAccount = () => {
    // TODO: Connect to backend API: DELETE /api/user/account
    const confirmed = window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.');
    if (confirmed) {
      localStorage.clear();
      alert('Account deleted. Redirecting to home page...');
      window.location.href = '/';
    }
  };

  return (
    <UserLayout>
      <div class="max-w-5xl mx-auto space-y-6 pb-12 relative">
        
        {/* TOP BANNER HEADER WITH SOFT ABSTRACT SHAPES */}
        <div class="bg-white rounded-3xl p-6 border border-slate-100/90 shadow-2xs relative overflow-hidden flex items-center justify-between min-h-[110px]">
          <div class="flex items-center gap-4 relative z-10">
            <div class="h-12 w-12 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center shrink-0">
              <Settings size={24} />
            </div>
            <div>
              <h1 class="font-display text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
              <p class="text-xs font-semibold text-slate-400 mt-0.5">
                Manage your account preferences, privacy controls, notifications, and security.
              </p>
            </div>
          </div>

          {/* Right Side Background Organic Soft Shapes */}
          <div class="absolute right-0 top-0 bottom-0 w-80 pointer-events-none overflow-hidden">
            <div class="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-50/80"></div>
            <div class="absolute -bottom-10 right-12 w-40 h-40 rounded-full bg-sky-100/40"></div>
            
            {/* Subtle Dot Grid */}
            <div class="absolute top-8 right-32 grid grid-cols-4 gap-2 opacity-30">
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
        </div>

        {/* Feedback Toast Notification */}
        {toastMessage && (
          <div class="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-bold border border-emerald-100 shadow-2xs transition animate-fade-in">
            <CheckCircle2 size={18} class="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Card Group 1: Appearance & Notifications */}
        <div class="space-y-3">
          <div class="flex items-center gap-2 px-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <Bell size={13} class="text-blue-600" />
            <span>APPEARANCE & NOTIFICATIONS</span>
          </div>

          <div class="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-2xs divide-y divide-slate-100/80">
            {/* Interface Theme */}
            <div class="flex items-center justify-between pb-5">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-2xl bg-blue-50/70 text-blue-600 flex items-center justify-center shrink-0">
                  <Palette size={18} />
                </div>
                <div>
                  <span class="block text-xs font-extrabold text-slate-900">Interface Theme</span>
                  <span class="text-xs text-slate-400 font-semibold">Select your preferred visual mode for the app</span>
                </div>
              </div>
              <PillSelect
                value={theme}
                onChange={handleThemeChange}
                icon={Sun}
                options={[
                  { value: 'light', label: 'Light Theme' },
                  { value: 'dark', label: 'Dark Theme' }
                ]}
              />
            </div>

            {/* Email Notifications */}
            <div class="flex items-center justify-between py-5">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-2xl bg-blue-50/70 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <span class="block text-xs font-extrabold text-slate-900">Email Notifications</span>
                  <span class="text-xs text-slate-400 font-semibold">Receive summaries of your Jars and activity in rooms</span>
                </div>
              </div>
              <Toggle checked={emailNotifications} onChange={handleEmailNotificationsToggle} />
            </div>

            {/* Push Notifications */}
            <div class="flex items-center justify-between py-5">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-2xl bg-blue-50/70 text-blue-600 flex items-center justify-center shrink-0">
                  <Bell size={18} />
                </div>
                <div>
                  <span class="block text-xs font-extrabold text-slate-900">Push Notifications</span>
                  <span class="text-xs text-slate-400 font-semibold">Receive real-time browser alerts for connection requests</span>
                </div>
              </div>
              <Toggle checked={pushNotifications} onChange={handlePushNotificationsToggle} />
            </div>

            {/* Notification Frequency */}
            <div class="flex items-center justify-between pt-5">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-2xl bg-blue-50/70 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <span class="block text-xs font-extrabold text-slate-900">Notification Frequency</span>
                  <span class="text-xs text-slate-400 font-semibold">Choose how often activity digests are delivered</span>
                </div>
              </div>
              <PillSelect
                value={notificationFrequency}
                onChange={handleFrequencyChange}
                icon={Calendar}
                options={[
                  { value: 'instant', label: 'Instant' },
                  { value: 'daily', label: 'Daily digest' },
                  { value: 'weekly', label: 'Weekly digest' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Card Group 2: Account & Security */}
        <div class="space-y-3">
          <div class="flex items-center gap-2 px-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <ShieldCheck size={13} class="text-blue-600" />
            <span>ACCOUNT & SECURITY</span>
          </div>

          <div class="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-2xs divide-y divide-slate-100/80">
            {/* Password */}
            <div class="flex items-center justify-between pb-5">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-2xl bg-blue-50/70 text-blue-600 flex items-center justify-center shrink-0">
                  <Lock size={18} />
                </div>
                <div>
                  <span class="block text-xs font-extrabold text-slate-900">Password</span>
                  <span class="text-xs text-slate-400 font-semibold">Last changed {lastPasswordChange}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleChangePasswordClick}
                class="rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold text-xs px-5 py-2.5 transition cursor-pointer"
              >
                Change password
              </button>
            </div>

            {/* Two-Factor Authentication */}
            <div class="flex items-center justify-between py-5">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-2xl bg-blue-50/70 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span class="block text-xs font-extrabold text-slate-900">Two-Factor Authentication (2FA)</span>
                  <span class="text-xs text-slate-400 font-semibold">Add an extra layer of security using an authenticator app</span>
                </div>
              </div>
              <Toggle checked={twoFactorAuth} onChange={handleTwoFactorToggle} />
            </div>

            {/* Active Sessions */}
            <div class="flex items-center justify-between pt-5">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-2xl bg-blue-50/70 text-blue-600 flex items-center justify-center shrink-0">
                  <Smartphone size={18} />
                </div>
                <div>
                  <span class="block text-xs font-extrabold text-slate-900">Active Sessions</span>
                  <span class="text-xs text-slate-400 font-semibold">{activeSessionsCount} devices currently signed in</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleManageSessionsClick}
                class="rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold text-xs px-5 py-2.5 transition cursor-pointer"
              >
                Manage sessions
              </button>
            </div>
          </div>
        </div>

        {/* Card Group 3: Privacy */}
        <div class="space-y-3">
          <div class="flex items-center gap-2 px-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <Eye size={13} class="text-blue-600" />
            <span>PRIVACY</span>
          </div>

          <div class="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-2xs divide-y divide-slate-100/80">
            {/* Profile Visibility */}
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-2xl bg-blue-50/70 text-blue-600 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <span class="block text-xs font-extrabold text-slate-900">Profile Visibility</span>
                  <span class="text-xs text-slate-400 font-semibold">Control who can see your profile and activity</span>
                </div>
              </div>
              <PillSelect
                value={profileVisibility}
                onChange={handleProfileVisibilityChange}
                icon={Users}
                options={[
                  { value: 'public', label: 'Everyone' },
                  { value: 'connections', label: 'Connections only' },
                  { value: 'private', label: 'Private' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Card Group 4: Data Actions */}
        <div class="space-y-3">
          <div class="flex items-center gap-2 px-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <Database size={13} class="text-blue-600" />
            <span>DATA & DANGER ZONE</span>
          </div>

          <div class="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-2xs divide-y divide-slate-100/80">
            {/* Export Data */}
            <div class="flex items-center justify-between pb-5">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-2xl bg-blue-50/70 text-blue-600 flex items-center justify-center shrink-0">
                  <Download size={18} />
                </div>
                <div>
                  <span class="block text-xs font-extrabold text-slate-900">Export Data</span>
                  <span class="text-xs text-slate-400 font-semibold">Download a JSON copy of your Jars, Rooms, and profile info</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                class="rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-5 py-2.5 transition cursor-pointer inline-flex items-center gap-2"
              >
                <Download size={14} />
                Export Data
              </button>
            </div>

            {/* Delete Account */}
            <div class="flex items-center justify-between pt-5">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 size={18} />
                </div>
                <div>
                  <span class="block text-xs font-extrabold text-red-600">Delete Account</span>
                  <span class="text-xs text-slate-400 font-semibold">Permanently remove your account and all associated data</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                class="rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200/80 text-red-600 font-extrabold text-xs px-5 py-2.5 transition cursor-pointer inline-flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete Account
              </button>
            </div>
          </div>
        </div>

      </div>
    </UserLayout>
  );
};

export default SettingsPage;
