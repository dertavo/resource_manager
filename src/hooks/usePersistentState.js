import { useEffect, useState } from 'react';

const resolveInitialValue = (initialValue) =>
  typeof initialValue === 'function' ? initialValue() : initialValue;

const jsonStorage = {
  deserialize: JSON.parse,
  serialize: JSON.stringify,
};

export const rawStringStorage = {
  deserialize: value => value,
  serialize: value => value,
};

export const numberStorage = {
  deserialize: Number,
  serialize: String,
};

const usePersistentState = (key, initialValue, storage = jsonStorage) => {
  const [value, setValue] = useState(() => {
    const fallback = resolveInitialValue(initialValue);

    try {
      const storedValue = localStorage.getItem(key);
      return storedValue === null ? fallback : storage.deserialize(storedValue);
    } catch (error) {
      console.error(`Error al cargar "${key}" de localStorage:`, error);
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, storage.serialize(value));
    } catch (error) {
      console.error(`Error al guardar "${key}" en localStorage:`, error);
    }
  }, [key, storage, value]);

  return [value, setValue];
};

export default usePersistentState;
