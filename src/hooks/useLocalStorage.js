import { useCallback, useState } from 'react';

const getErrorMessage = (error) => (
    error instanceof Error ? error.message : 'Unknown local storage error.'
);

const useLocalStorage = (key, initialValue) => {
    const [initialState] = useState(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            return {
                value: storedValue === null ? initialValue : JSON.parse(storedValue),
                error: '',
            };
        } catch (storageError) {
            return {
                value: initialValue,
                error: `Could not read this preference: ${getErrorMessage(storageError)}`,
            };
        }
    });
    const [value, setValue] = useState(initialState.value);
    const [error, setError] = useState(initialState.error);

    const updateValue = useCallback((nextValue) => {
        const resolvedValue = typeof nextValue === 'function'
            ? nextValue(value)
            : nextValue;

        setValue(resolvedValue);
        try {
            window.localStorage.setItem(key, JSON.stringify(resolvedValue));
            setError('');
        } catch (storageError) {
            setError(`Could not save this preference: ${getErrorMessage(storageError)}`);
        }
    }, [key, value]);

    return [value, updateValue, error];
};

export default useLocalStorage;
