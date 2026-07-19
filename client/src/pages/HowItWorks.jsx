import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicNavbar, PublicFooter } from '../components/PublicNavbar';
import { RefreshCw, Users, Waves, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: '01',
      icon: RefreshCw,
      title: 'Create or join a Room',
      description: 'Set up an event room in seconds or join an existing circle using a simple room code.',
      badgeBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      numberColor: 'text-blue-600',
      barColor: 'bg-blue-600'
    },
    {
      number: '02',
      icon: Users,
      title: 'Connect with the right people',
      description: 'Get automatically grouped with Web Devs, Designers, Founders, and peers based on your shared goals.',
      badgeBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      numberColor: 'text-emerald-500',
      barColor: 'bg-emerald-500'
    },
    {
      number: '03',
      icon: Waves,
      title: 'Stay in touch — no noise, no clutter',
      description: 'Exchange notes, build meaningful connections, and skip the social media feed clutter.',
      badgeBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      numberColor: 'text-amber-500',
      barColor: 'bg-amber-400'
    }
  ];

  return (
    <div class="min-h-screen bg-slate-50/60 text-slate-900 font-sans flex flex-col justify-between relative overflow-x-hidden">
      {/* Top Navbar */}
      <PublicNavbar />

      {/* BACKGROUND DECORATIVE ORGANIC SHAPES */}
      {/* Soft Pastel Blue Left Circle Blob */}
      <div class="absolute -left-20 top-28 w-96 h-96 rounded-full bg-blue-100/60 blur-xs pointer-events-none -z-10"></div>
      
      {/* Floating Solid Blue Circle */}
      <div class="absolute left-48 top-44 w-10 h-10 rounded-full bg-blue-600 shadow-md shadow-blue-500/30 pointer-events-none z-0"></div>

      {/* Soft Warm Cream Top Right Shape */}
      <div class="absolute -right-16 top-16 w-[450px] h-[350px] rounded-[30%_70%_70%_30%/30%_30%_70%_70%] bg-amber-100/40 blur-xs pointer-events-none -z-10"></div>

      {/* Floating Solid Yellow Circle */}
      <div class="absolute right-36 top-64 w-12 h-12 rounded-full bg-amber-400 shadow-md shadow-amber-400/30 pointer-events-none z-0"></div>

      {/* Soft Mint Green Bottom Right Shape */}
      <div class="absolute -right-20 bottom-10 w-[420px] h-[420px] rounded-full bg-emerald-100/40 blur-xs pointer-events-none -z-10"></div>

      {/* MAIN CONTENT */}
      <main class="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12 w-full relative z-10 flex flex-col justify-center">
        
        {/* HERO HEADER SECTION */}
        <div class="text-center space-y-4 max-w-2xl mx-auto">
          {/* Pill Badge */}
          <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100/80 px-4 py-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider shadow-2xs">
            <span class="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            SIMPLE 3-STEP PROCESS
          </div>

          {/* Title */}
          <h1 class="font-display text-4xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-none">
            Networking Made<br />
            <span class="text-blue-600">Effortless.</span>
          </h1>

          {/* Subtitle */}
          <p class="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-lg mx-auto">
            No elaborate setups, no noisy feeds.<br />
            Just three clean steps to meaningful connections that last.
          </p>
        </div>

        {/* 3 CARDS STEP GRID */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full items-stretch pt-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number} 
                class="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-100/80 p-8 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-6"
              >
                <div class="space-y-6">
                  {/* Card Top Row: Icon + Step Number */}
                  <div class="flex items-center gap-4">
                    <div class={`h-11 w-11 rounded-2xl ${step.badgeBg} ${step.iconColor} flex items-center justify-center font-bold shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <span class={`font-display font-extrabold text-xl ${step.numberColor}`}>
                      {step.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div class="space-y-2">
                    <h3 class="font-display font-bold text-base md:text-lg text-slate-900 leading-snug">
                      {step.title}
                    </h3>
                    <p class="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Bar Indicator */}
                <div class="pt-2">
                  <div class={`w-7 h-1.5 ${step.barColor} rounded-full`}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM CENTER CTA BUTTON */}
        <div class="text-center pt-4">
          <button
            onClick={() => navigate('/create')}
            class="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3.5 shadow-md shadow-blue-600/20 transition duration-200 hover:scale-[1.02] inline-flex items-center gap-2.5 cursor-pointer"
          >
            <span>Create Room</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default HowItWorks;
