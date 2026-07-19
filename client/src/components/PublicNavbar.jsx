import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, Menu, X } from 'lucide-react';
import { Logo } from './Logo';

export const PublicNavbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Features' },
    { path: '/how-it-works', label: 'How it works' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/about', label: 'About' },
  ];

  return (
    <header class="sticky top-0 z-50 w-full px-4 py-3 md:px-8 md:py-4 pointer-events-none">
      <div class="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full border border-slate-100 shadow-lg shadow-slate-200/40 px-5 py-2.5 md:px-8 md:py-3 flex flex-col md:flex-row md:items-center justify-between pointer-events-auto transition-all duration-200">
        
        {/* Top Row: Logo & Mobile Toggle */}
        <div class="flex items-center justify-between w-full md:w-auto">
          <Logo size="md" />
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            class="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Desktop Links */}
        <nav class="hidden md:flex items-center gap-8 md:gap-10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                class={`text-xs md:text-sm font-semibold transition-all py-0.5 ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div class="hidden md:flex items-center gap-5 md:gap-6">
          <Link to="/login" class="text-xs md:text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            Sign in
          </Link>
          <Link to="/rooms" class="rounded-full bg-blue-600 px-5 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all duration-200">
            Get started
          </Link>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div class="md:hidden flex flex-col space-y-4 pt-4 pb-2 border-t border-slate-100 mt-3 animate-in fade-in duration-200">
            <nav class="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    class={`text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                      isActive ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            
            <div class="flex items-center gap-3 pt-3 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                class="flex-1 text-center py-3 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                Sign in
              </Link>
              <Link
                to="/rooms"
                onClick={() => setMobileMenuOpen(false)}
                class="flex-1 text-center py-3 text-xs font-bold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-600/20 hover:bg-blue-700 transition"
              >
                Get started
              </Link>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

export const PublicFooter = () => (
  <footer class="border-t border-slate-200/60 bg-white py-12 px-6 md:px-10 text-slate-500 text-xs font-medium mt-auto">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex flex-col items-center md:items-start gap-1">
        <Logo size="sm" />
        <p class="text-slate-400 mt-1 text-center md:text-left">Networking without the noise. Built for real connections.</p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-6 text-slate-600 font-semibold">
        <Link to="/how-it-works" class="hover:text-slate-900 transition">How it works</Link>
        <Link to="/pricing" class="hover:text-slate-900 transition">Pricing</Link>
        <Link to="/about" class="hover:text-slate-900 transition">About</Link>
      </div>

      <div class="text-slate-400 text-center md:text-right">
        © {new Date().getFullYear()} linkdln.undo. All rights reserved.
      </div>
    </div>
  </footer>
);
