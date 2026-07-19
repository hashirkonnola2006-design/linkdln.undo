import React from 'react';
import { PublicNavbar, PublicFooter } from '../components/PublicNavbar';

const AboutPage = () => {
  return (
    <div class="min-h-screen bg-slate-50/60 text-slate-900 font-sans flex flex-col justify-between relative overflow-x-hidden">
      {/* Top Floating Navbar */}
      <PublicNavbar />

      {/* BACKGROUND DECORATIVE ORGANIC SHAPES */}
      <div class="absolute -left-20 top-28 w-96 h-96 rounded-full bg-blue-100/60 blur-xs pointer-events-none -z-10"></div>
      <div class="absolute -right-16 top-16 w-[450px] h-[350px] rounded-[30%_70%_70%_30%/30%_30%_70%_70%] bg-amber-100/40 blur-xs pointer-events-none -z-10"></div>
      <div class="absolute -right-20 bottom-10 w-[420px] h-[420px] rounded-full bg-emerald-100/40 blur-xs pointer-events-none -z-10"></div>

      {/* MAIN CONTENT CONTAINER */}
      <main class="flex-1 max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-12 w-full relative z-10">
        
        {/* HERO SECTION */}
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Hero Left Column */}
          <div class="lg:col-span-7 space-y-5">
            {/* Pill Tag */}
            <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100/80 px-4 py-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider shadow-2xs">
              <span class="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              OUR MISSION & STORY
            </div>

            {/* Headline */}
            <h1 class="font-display text-4xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.05]">
              AI-Powered<br />
              Networking.<br />
              <span class="text-blue-600">Stripped of Noise.</span>
            </h1>

            {/* Subtitle */}
            <p class="text-slate-500 text-sm md:text-base font-medium leading-relaxed max-w-lg">
              Everyone's connected. Nobody's talking.<br />
              We built linkdln.undo to change that.
            </p>
          </div>

          {/* Hero Right Column Graphic */}
          <div class="lg:col-span-5 relative flex items-center justify-center min-h-[320px]">
            {/* Soft background blue organic blob */}
            <div class="absolute -top-4 right-8 w-44 h-32 rounded-[50%_50%_40%_60%/60%_40%_60%_40%] bg-blue-100/70 blur-xs"></div>

            {/* Main Vibrant Blue Blob */}
            <div class="w-56 h-56 md:w-72 md:h-72 rounded-[45%_55%_65%_35%/55%_45%_55%_45%] bg-blue-600 shadow-xl shadow-blue-500/20 relative z-10"></div>

            {/* Overlapping Yellow Organic Blob */}
            <div class="absolute -bottom-2 right-2 md:right-6 w-48 h-48 md:w-56 md:h-56 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] bg-amber-400 shadow-lg z-20"></div>

            {/* Small Green Organic Blob */}
            <div class="absolute bottom-6 left-4 md:left-8 w-14 h-14 md:w-16 md:h-16 rounded-[55%_45%_60%_40%/45%_55%_45%_55%] bg-emerald-500 z-30 shadow-md"></div>

            {/* Decorative Dot Matrix Grid */}
            <div class="absolute top-6 right-2 grid grid-cols-6 gap-2 opacity-25">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} class="h-1.5 w-1.5 rounded-full bg-slate-600"></div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY WE BUILT LINKDLN.UNDO CARD */}
        <section class="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-100/90 p-8 md:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Card Left Graphic Column */}
          <div class="lg:col-span-4 relative flex items-center justify-center min-h-[240px]">
            {/* Soft blue blob background */}
            <div class="w-44 h-36 rounded-[50%_50%_40%_60%/60%_40%_60%_40%] bg-blue-100/80 absolute top-2 left-2"></div>
            {/* Blue Blob */}
            <div class="w-48 h-48 rounded-[45%_55%_60%_40%/55%_45%_55%_45%] bg-blue-600 shadow-md relative z-10"></div>
            {/* Yellow Blob */}
            <div class="w-32 h-32 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] bg-amber-400 shadow-md absolute bottom-0 left-0 z-20"></div>
          </div>

          {/* Card Right Text Column */}
          <div class="lg:col-span-8 space-y-5">
            <div class="space-y-2">
              <h2 class="font-display font-black text-2xl md:text-3xl text-slate-950 tracking-tight">
                Why We Built linkdln.undo
              </h2>
              <div class="w-8 h-1 bg-blue-600 rounded-full"></div>
            </div>

            <div class="space-y-4 text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                You didn't sign up for LinkedIn to scroll. You signed up to meet people.
              </p>

              <p>
                Somewhere along the way, it became a feed. Endless self-promotion, awkward cold DMs, connection requests from people you'll never talk to. Networking turned into noise.
              </p>

              <p>
                So we ripped it out and started over.
              </p>

              {/* Blue accent left border block */}
              <div class="pl-4 border-l-2 border-blue-600 space-y-2 py-1">
                <p>
                  <strong class="text-blue-600 font-extrabold">linkdln.undo</strong> drops you straight into live Rooms — real events, real people, sorted instantly into Jars by what they actually do. Web devs find web devs. Founders find founders. No feed. No performing. No 500+ connections you've never met.
                </p>
                <p class="font-bold text-blue-600 text-sm md:text-base">
                  Just the five people in the room worth knowing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GET IN TOUCH BANNER CARD */}
        <section class="bg-gradient-to-r from-blue-50/80 via-blue-100/50 to-blue-200/40 border border-blue-100 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xs">
          <div class="relative z-10 max-w-xl space-y-4">
            <div class="space-y-2">
              <h2 class="font-display font-black text-2xl md:text-3xl text-slate-950 tracking-tight">
                Get in touch
              </h2>
              <div class="w-7 h-1 bg-blue-600 rounded-full"></div>
            </div>

            <p class="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
              Got a Room idea, a bug, or a bone to pick?<br />
              We read every email ourselves.
            </p>

            <div class="pt-2">
              <a
                href="mailto:hashirkonnola2006@gmail.com"
                class="inline-block rounded-full bg-white hover:bg-slate-50 text-blue-600 border border-blue-100 px-6 py-3 font-bold text-xs md:text-sm shadow-xs transition duration-200"
              >
                hashirkonnola2006@gmail.com
              </a>
            </div>
          </div>

          {/* Decorative Right Wave / Organic Blobs */}
          <div class="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-blue-600/90 pointer-events-none"></div>
          <div class="absolute right-32 -bottom-24 w-72 h-72 rounded-full bg-blue-300/40 blur-xs pointer-events-none"></div>
        </section>

        {/* STATS COUNTER CARD */}
        <section class="bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-100 p-8 shadow-xs">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-slate-100">
            {/* Stat 1 */}
            <div class="flex items-center gap-4 pl-0 md:pl-4">
              <div class="w-10 h-10 rounded-[40%_60%_50%_50%/50%_40%_60%_50%] bg-blue-100/80 shrink-0"></div>
              <div>
                <span class="font-display text-2xl md:text-3xl font-extrabold text-slate-900 block leading-none">128</span>
                <span class="text-xs font-semibold text-slate-400 mt-1 block">Live events</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div class="flex items-center gap-4 pl-0 md:pl-8">
              <div class="w-10 h-10 rounded-[60%_40%_40%_60%/40%_60%_40%_60%] bg-blue-100/80 shrink-0"></div>
              <div>
                <span class="font-display text-2xl md:text-3xl font-extrabold text-slate-900 block leading-none">12.4K</span>
                <span class="text-xs font-semibold text-slate-400 mt-1 block">People connected</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div class="flex items-center gap-4 pl-0 md:pl-8">
              <div class="w-10 h-10 rounded-[50%_50%_60%_40%/60%_40%_50%_50%] bg-blue-100/80 shrink-0"></div>
              <div>
                <span class="font-display text-2xl md:text-3xl font-extrabold text-slate-900 block leading-none">842</span>
                <span class="text-xs font-semibold text-slate-400 mt-1 block">Rooms created</span>
              </div>
            </div>

            {/* Stat 4 */}
            <div class="flex items-center gap-4 pl-0 md:pl-8">
              <div class="w-10 h-10 rounded-[45%_55%_40%_60%/50%_50%_50%_50%] bg-blue-100/80 shrink-0"></div>
              <div>
                <span class="font-display text-2xl md:text-3xl font-extrabold text-slate-900 block leading-none">36</span>
                <span class="text-xs font-semibold text-slate-400 mt-1 block">Countries</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default AboutPage;
