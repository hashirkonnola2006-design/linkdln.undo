import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ size = 'md', link = true, light = false }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconSize = isSm ? 'h-6 w-6' : isLg ? 'h-10 w-10' : 'h-8 w-8';
  const textSize = isSm ? 'text-lg' : isLg ? 'text-3xl' : 'text-2xl';

  const logoContent = (
    <div class="flex items-center gap-2 select-none">
      {/* SVG Icon */}
      <svg 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        class={`${iconSize} shrink-0`}
      >
        {/* Blue Hook */}
        <path 
          d="M 8 9 C 8 6.5, 11 6.5, 11 9 L 11 21 C 11 23.5, 13.5 23.5, 16.5 23.5 L 21 23.5" 
          stroke="#2563eb" 
          strokeWidth="5" 
          strokeLinecap="round" 
        />
        {/* Yellow Circle */}
        <circle cx="17" cy="16" r="4.5" fill="#fbbf24" />
        {/* Green Circle */}
        <circle cx="21" cy="9" r="2.5" fill="#10b981" />
      </svg>
      
      {/* Text */}
      <span class={`font-display font-black tracking-tight ${textSize} ${light ? 'text-white' : 'text-slate-900'}`}>
        linkdln<span class="text-[#2563eb]">.undo</span>
      </span>
    </div>
  );

  if (link) {
    return (
      <Link to="/" class="inline-flex items-center hover:opacity-90 transition">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
