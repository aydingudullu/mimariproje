'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'switch';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={className}>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  // Simple icon toggle
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={`relative ${className}`}
        title={resolvedTheme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Tema değiştir</span>
      </Button>
    );
  }

  // Dropdown with all options
  if (variant === 'dropdown') {
    const options = [
      { value: 'light', label: 'Açık', icon: Sun },
      { value: 'dark', label: 'Koyu', icon: Moon },
      { value: 'system', label: 'Sistem', icon: Monitor },
    ] as const;

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-36 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
            {options.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setShowDropdown(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors
                  ${theme === value 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Switch style toggle
  if (variant === 'switch') {
    return (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${resolvedTheme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}
          ${className}
        `}
      >
        <span className="sr-only">Tema değiştir</span>
        <span
          className={`
            inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${resolvedTheme === 'dark' ? 'translate-x-7' : 'translate-x-1'}
          `}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="h-3.5 w-3.5 text-blue-600" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-amber-500" />
          )}
        </span>
      </button>
    );
  }

  return null;
}
