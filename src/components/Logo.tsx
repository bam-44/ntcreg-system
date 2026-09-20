import React from 'react';

export const NahdaLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Academic Graduation Cap (Solid Academic Blue #185d89) */}
      <g id="graduation-cap">
        {/* Skullcap Base with Upward Arch */}
        <path 
          d="M 172,125 L 172,192 C 172,192 208,162 250,162 C 292,162 328,192 328,192 L 328,125 Z" 
          fill="#185d89" 
        />
        {/* Diamond Mortarboard Top */}
        <polygon 
          points="250,36 405,112 250,152 95,112" 
          fill="#185d89" 
        />
        {/* Cap Button (White Circle) */}
        <circle cx="114" cy="95" r="4.5" fill="#ffffff" />
        {/* Tassel String */}
        <line x1="114" y1="99" x2="114" y2="170" stroke="#185d89" strokeWidth="3.5" strokeLinecap="round" />
        {/* Golden Yellow Tassel Brush (#fab324) */}
        <path 
          d="M 114,170 C 108,170 104,175 104,181 C 104,190 108,196 107,202 C 111,199 117,195 118,189 C 120,183 119,170 114,170 Z" 
          fill="#fab324" 
        />
      </g>

      {/* 2. Golden Yellow Radiating Rays (#fab324) */}
      <g id="light-rays" stroke="#fab324" strokeLinecap="round">
        {/* Left Rays */}
        <line x1="114" y1="188" x2="36" y2="156" strokeWidth="6" />
        <line x1="98" y1="275" x2="16" y2="275" strokeWidth="6.5" />
        <line x1="114" y1="362" x2="36" y2="394" strokeWidth="6" />

        {/* Right Rays */}
        <line x1="386" y1="188" x2="464" y2="156" strokeWidth="6" />
        <line x1="402" y1="275" x2="484" y2="275" strokeWidth="6.5" />
        <line x1="386" y1="362" x2="464" y2="394" strokeWidth="6" />
      </g>

      {/* 3. Stylized 'N' Bulb Filament (Warm Orange #eb6226) */}
      <g id="bulb-filament">
        <path 
          d="M 186,340 C 160,300 160,254 186,228 C 196,218 208,224 220,238 L 320,342 C 328,350 338,346 342,334 C 354,295 352,250 330,228" 
          stroke="#eb6226" 
          strokeWidth="26" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
        />
      </g>

      {/* 4. Bulb Base & Socket (قعر المصباح - نسب متناسقة ومطابقة تامة للصورة) */}
      <g id="bulb-base" strokeLinecap="round" strokeLinejoin="round">
        {/* Neck stroke connected to top thread bar */}
        <path 
          d="M 196,370 L 218,390 L 218,423 L 282,423" 
          stroke="#eb6226" 
          strokeWidth="22" 
          fill="none" 
        />
        {/* 2 Lower Horizontal Orange Thread Bars */}
        <line x1="222" y1="444" x2="278" y2="444" stroke="#eb6226" strokeWidth="20" />
        <line x1="228" y1="465" x2="272" y2="465" stroke="#eb6226" strokeWidth="20" />
        {/* Bottom Blue Contact Terminal */}
        <line x1="236" y1="484" x2="264" y2="484" stroke="#185d89" strokeWidth="15" />
      </g>
    </svg>
  );
};

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full-horizontal' | 'icon-only' | 'full-vertical';
  theme?: 'light' | 'dark';
  showText?: boolean;
  className?: string;
  logoUrl?: string;
  customLogoUrl?: string;
  centerName?: string;
  centerSubtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full-horizontal',
  theme = 'light',
  showText = true,
  className = '',
  logoUrl,
  customLogoUrl,
  centerName = 'مركز النهضة',
  centerSubtitle = 'للتدريب والتطوير الذاتي',
}) => {
  const activeLogoUrl = customLogoUrl || logoUrl;
  const isDark = theme === 'dark';
  const isIconOnly = variant === 'icon-only' || showText === false;

  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14 sm:w-16 sm:h-16',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const textSizes = {
    sm: { title: 'text-base', sub: 'text-[10px]' },
    md: { title: 'text-lg sm:text-xl font-black', sub: 'text-xs sm:text-sm font-semibold' },
    lg: { title: 'text-2xl font-black', sub: 'text-sm font-semibold' },
    xl: { title: 'text-3xl font-black', sub: 'text-base font-semibold' },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative shrink-0 flex items-center justify-center p-1.5 rounded-2xl ${
        isDark ? 'bg-white/10 backdrop-blur-xs border border-white/15' : 'bg-white shadow-xs border border-slate-100'
      } hover:scale-105 transition-all duration-300`}>
        {activeLogoUrl && activeLogoUrl !== '/logo.svg' ? (
          <img
            src={activeLogoUrl}
            alt={centerName}
            className={`${iconSizes[size]} object-contain`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const sibling = e.currentTarget.nextElementSibling;
              if (sibling) (sibling as HTMLElement).style.display = 'block';
            }}
          />
        ) : null}
        <div style={{ display: activeLogoUrl && activeLogoUrl !== '/logo.svg' ? 'none' : 'block' }}>
          <NahdaLogoIcon className={iconSizes[size]} />
        </div>
      </div>

      {!isIconOnly && (
        <div className="flex flex-col text-right leading-tight">
          <span className={`tracking-tight ${isDark ? 'text-white' : 'text-[#196395]'} ${textSizes[size].title}`}>
            {centerName}
          </span>
          <span className={`tracking-normal mt-0.5 ${isDark ? 'text-slate-300' : 'text-[#ec6226]'} ${textSizes[size].sub}`}>
            {centerSubtitle}
          </span>
        </div>
      )}
    </div>
  );
};

export const NahdaLogo = Logo;

