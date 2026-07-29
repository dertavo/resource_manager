import { useEffect } from 'react';
import usePersistentState from './usePersistentState';

const useTheme = () => {
  const [isDark, setIsDark] = usePersistentState('darkMode', () =>
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  return {
    isDark,
    toggleTheme: () => setIsDark(previous => !previous),
  };
};

export default useTheme;
