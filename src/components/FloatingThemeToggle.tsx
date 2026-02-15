import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from 'react-router-dom';

const FloatingThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Hide theme toggle on auth page, during loading states, and on mobile devices
  const shouldHide = location.pathname === '/auth' || 
                     location.pathname === '/' && !document.querySelector('[data-testid="main-content"]');

  if (shouldHide) {
    return null;
  }

  return (
    <Button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary/20 hover:scale-110 hidden lg:flex"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </Button>
  );
};

export default FloatingThemeToggle;
