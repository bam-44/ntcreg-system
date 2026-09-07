import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full-horizontal' | 'full-vertical' | 'icon-only';
  theme?: 'light' | 'dark';
  logoUrl?: string;
  centerName?: string;
  centerSubtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full-horizontal',
  theme = 'light',
  logoUrl,
  centerName = 'مركز النهضة',
  centerSubtitle = 'للتدريب والتطوير الذاتي',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: { title: 'text-base font-extrabold', subtitle: 'text-[10px]' },
    md: { title: 'text-xl sm:text-2xl font-black', subtitle: 'text-xs sm:text-sm font-bold' },
    lg: { title: 'text-2xl sm:text-3xl font-black', subtitle: 'text-sm sm:text-base font-bold' },
    xl: { title: 'text-3xl sm:text-4xl font-black', subtitle: 'text-base sm:text-lg font-bold' },
  };

  if (variant === 'icon-only') {
    if (!logoUrl) return null;
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={logoUrl}
          alt={centerName}
          className={`${iconSizes[size]} object-contain shrink-0 rounded-xl`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  const titleColor = theme === 'dark' ? 'text-white' : 'text-[#185d89]';
  const subtitleColor = theme === 'dark' ? 'text-orange-400' : 'text-[#f06423]';

  if (variant === 'full-vertical') {
    return (
      <div className={`inline-flex flex-col items-center text-center gap-2 ${className}`}>
        {logoUrl && (
          <div className="p-2 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-1">
            <img
              src={logoUrl}
              alt={centerName}
              className={`${iconSizes[size]} object-contain shrink-0 rounded-xl`}
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div>
          <h2 className={`${textSizes[size].title} ${titleColor} tracking-tight leading-none`}>
            {centerName}
          </h2>
          <p className={`${textSizes[size].subtitle} ${subtitleColor} mt-1.5 tracking-normal font-bold`}>
            {centerSubtitle}
          </p>
        </div>
      </div>
    );
  }

  // Full Horizontal
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {logoUrl && (
        <div className="p-1 rounded-xl bg-white shadow-2xs border border-slate-100/80 flex items-center justify-center shrink-0">
          <img
            src={logoUrl}
            alt={centerName}
            className={`${iconSizes[size]} object-contain shrink-0 rounded-lg`}
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      <div className="text-right">
        <h2 className={`${textSizes[size].title} ${titleColor} tracking-tight leading-none`}>
          {centerName}
        </h2>
        <p className={`${textSizes[size].subtitle} ${subtitleColor} mt-1 tracking-normal font-bold`}>
          {centerSubtitle}
        </p>
      </div>
    </div>
  );
};
