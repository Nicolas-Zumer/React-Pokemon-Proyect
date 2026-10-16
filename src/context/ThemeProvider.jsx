import { useCallback, useEffect, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import ThemeContext from './ThemeContext';

const ThemeProvider = ({ children }) => {
    const [storedTheme, setStoredTheme, storageError] = useLocalStorage('timbur-theme', 'light');
    const theme = storedTheme === 'dark' ? 'dark' : 'light';

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    const setTheme = useCallback((nextTheme) => {
        if (nextTheme === 'light' || nextTheme === 'dark') {
            setStoredTheme(nextTheme);
        }
    }, [setStoredTheme]);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [setTheme, theme]);

    const contextValue = useMemo(
        () => ({ theme, setTheme, toggleTheme, storageError }),
        [theme, setTheme, toggleTheme, storageError],
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
