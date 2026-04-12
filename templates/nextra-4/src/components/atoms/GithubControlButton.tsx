import {cn} from '#/lib/utils';
import React from 'react';

interface GithubControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function GithubControlButton({children, className, ...props}: GithubControlButtonProps): React.JSX.Element {
  return (
    <button
      {...props}
      className={cn(
        // base component design
        'flex items-center justify-center w-8 h-8 rounded-md border shadow-sm',
        'transition-all active:scale-90',
        // light colors
        'bg-white border-[#d0d7de] text-[#24292f] hover:bg-[#f3f4f6]',
        // dark colors
        'dark:bg-[#21262d] dark:border-[#30363d] dark:text-[#c9d1d9]',
        'dark:hover:bg-[#30363d]',
        className
      )}
    >
      {children}
    </button>
  );
}
