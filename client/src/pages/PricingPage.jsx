import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicNavbar, PublicFooter } from '../components/PublicNavbar';

const PricingPage = () => {
  const navigate = useNavigate();

  const tiers = [
    {
      name: 'Free',
      tag: 'COMMUNITY',
      tagBg: 'bg-blue-50 text-blue-600 border-blue-100',
      blobColor: 'bg-blue-200/70 rounded-[40%_60%_70%_30%/50%_60%_40%_50%]',
      price: '$0',
      period: '/ forever',
      description: 'For individuals who want simple, genuine networking without paywalls.',
      bulletColor: 'bg-blue-500',
      features: [
        'Unlimited Public & Private Rooms',
        'Automatic Jar Semantic Grouping',
        'Room Wall Notes & Live Feed',
        'Zero credit card required ever',
        'No hidden upsells or surprise fees'
      ],
      ctaText: 'Get Started for $0',
      btnStyle: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 font-bold shadow-2xs',
      isPopular: false
    },
    {
      name: 'Pro',
      tag: 'MOST POPULAR',
      tagBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      blobColor: 'bg-emerald-200/70 rounded-[60%_40%_30%_70%/40%_50%_60%_50%]',
      price: '$0',
      period: '/ forever',
      description: 'Includes everything in Free plus our eternal gratitude and respect.',
      bulletColor: 'bg-emerald-500',
      features: [
        'Unlimited Public & Private Rooms',
        'Automatic Jar Semantic Grouping',
        'Room Wall Notes & Live Feed',
        '$0 upgrade fee (guaranteed)',
        'Zero sales calls or promo spam'
      ],
      ctaText: 'Upgrade to Pro ($0)',
      btnStyle: 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20',
      isPopular: true
    },
    {
      name: 'Enterprise',
      tag: 'ORGANIZATIONS',
      tagBg: 'bg-amber-50 text-amber-600 border-amber-100',
      blobColor: 'bg-amber-200/70 rounded-[50%_50%_60%_40%/30%_60%_40%_70%]',
      price: '$0',
      period: '/ forever',
      description: 'We won’t even force you to jump on a 30-minute sales demo call.',
      bulletColor: 'bg-amber-400',
      features: [
        'Unlimited Public & Private Rooms',
        'Automatic Jar Semantic Grouping',
        'Room Wall Notes & Live Feed',
        'Custom Event Room Codes',
        'No procurement approval needed'
      ],
      ctaText: 'Claim Enterprise ($0)',
      btnStyle: 'bg-amber-50/80 hover:bg-amber-100 text-amber-600 border border-amber-100 font-bold shadow-2xs',
      isPopular: false
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

      {/* MAIN CONTENT */}
      <main class="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12 w-full relative z-10 flex flex-col justify-center">
        
        {/* HERO HEADER SECTION */}
        <div class="text-center space-y-4 max-w-2xl mx-auto">
          {/* Pill Badge */}
          <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100/80 px-4 py-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider shadow-2xs">
            <span class="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            100% FREE FOREVER
          </div>

          {/* Title */}
          <h1 class="font-display text-4xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-none">
            Transparent Pricing.<br />
            <span class="text-blue-600">Always</span> $0.
          </h1>

          {/* Subtitle */}
          <p class="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-lg mx-auto">
            Yes, all of it. Forever. No credit cards, no hidden tiers, no upsells, no catch.
          </p>
        </div>

        {/* 3 CARDS PRICING GRID */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full items-stretch pt-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              class={`bg-white/90 backdrop-blur-sm rounded-3xl p-8 flex flex-col justify-between space-y-8 transition duration-200 ${
                tier.isPopular
                  ? 'border border-emerald-300 shadow-md relative scale-[1.01]'
                  : 'border border-slate-100 shadow-xs hover:shadow-sm'
              }`}
            >
              <div class="space-y-6">
                {/* Card Top: Tag Badge + Organic Blob Thumbnail */}
                <div class="flex items-start justify-between">
                  <span class={`text-[10px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full border ${tier.tagBg}`}>
                    {tier.tag}
                  </span>
                  <div class={`w-9 h-8 ${tier.blobColor}`}></div>
                </div>

                {/* Title & Description */}
                <div class="space-y-1.5">
                  <h3 class="font-display font-extrabold text-2xl text-slate-950">{tier.name}</h3>
                  <p class="text-xs text-slate-400 font-medium leading-relaxed min-h-[36px]">
                    {tier.description}
                  </p>
                </div>

                {/* Price Display */}
                <div class="flex items-baseline gap-1.5 border-b border-slate-50 pb-5">
                  <span class="font-display font-black text-4xl md:text-5xl text-slate-950">{tier.price}</span>
                  <span class="text-xs font-bold text-slate-400">{tier.period}</span>
                </div>

                {/* Feature Bullet Points */}
                <ul class="space-y-3 pt-1">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} class="flex items-center gap-3 text-xs font-semibold text-slate-600">
                      <span class={`h-2 w-2 rounded-full ${tier.bulletColor} shrink-0`}></span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div class="pt-2">
                <button
                  onClick={() => navigate('/rooms')}
                  class={`w-full rounded-2xl py-3.5 text-xs transition duration-200 cursor-pointer ${tier.btnStyle}`}
                >
                  {tier.ctaText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* HUMOROUS BANNER BOX BELOW CARDS */}
        <div class="bg-blue-50/70 border border-blue-100/80 rounded-3xl p-6 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-5 shadow-2xs">
          <div class="w-12 h-10 rounded-[40%_60%_70%_30%/50%_60%_40%_50%] bg-blue-200/80 shrink-0"></div>
          <div class="space-y-1 text-center md:text-left">
            <h4 class="font-display font-extrabold text-slate-900 text-sm">
              Why is linkdln.undo 100% free?
            </h4>
            <p class="text-xs text-slate-500 font-medium leading-relaxed">
              Because we believe professional networking should be about genuine human connection and shared learning—not paywalls, subscriptions, or sales demos.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PricingPage;
