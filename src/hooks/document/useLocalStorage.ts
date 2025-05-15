
import { useState, useEffect } from 'react';

/**
 * Custom hook for using localStorage with automatic JSON parsing/stringifying
 * and support for larger documents through chunking if needed
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const readValue = () => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Check if we're using chunked storage for large data
      const chunkCountItem = window.localStorage.getItem(`${key}_chunks`);
      
      if (chunkCountItem) {
        // Handle chunked storage
        const chunkCount = parseInt(chunkCountItem, 10);
        let completeData = '';
        
        for (let i = 0; i < chunkCount; i++) {
          const chunk = window.localStorage.getItem(`${key}_chunk_${i}`);
          if (chunk) {
            completeData += chunk;
          } else {
            console.warn(`Missing chunk ${i} for key "${key}"`);
          }
        }
        
        return completeData ? JSON.parse(completeData) : initialValue;
      } else {
        // Regular storage
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage, with chunking for large data if needed
      if (typeof window !== 'undefined') {
        const stringifiedValue = JSON.stringify(valueToStore);
        
        // Check if we need to use chunking (for large data)
        // localStorage typically has a 5MB limit, but we'll chunk at 1MB to be safe
        const MAX_CHUNK_SIZE = 1024 * 1024; // 1MB
        
        if (stringifiedValue.length > MAX_CHUNK_SIZE) {
          console.log(`Large data detected for key "${key}", using chunked storage`);
          
          // Clear any existing chunks
          const oldChunkCount = localStorage.getItem(`${key}_chunks`);
          if (oldChunkCount) {
            const count = parseInt(oldChunkCount, 10);
            for (let i = 0; i < count; i++) {
              localStorage.removeItem(`${key}_chunk_${i}`);
            }
          }
          
          // Store new chunks
          const chunks = Math.ceil(stringifiedValue.length / MAX_CHUNK_SIZE);
          localStorage.setItem(`${key}_chunks`, chunks.toString());
          
          for (let i = 0; i < chunks; i++) {
            const start = i * MAX_CHUNK_SIZE;
            const end = Math.min(start + MAX_CHUNK_SIZE, stringifiedValue.length);
            const chunk = stringifiedValue.substring(start, end);
            localStorage.setItem(`${key}_chunk_${i}`, chunk);
          }
          
          // Remove the main key to avoid confusion
          localStorage.removeItem(key);
          
          console.log(`Stored ${chunks} chunks for key "${key}"`);
        } else {
          // Regular storage
          // Remove any chunks if they existed
          const oldChunkCount = localStorage.getItem(`${key}_chunks`);
          if (oldChunkCount) {
            const count = parseInt(oldChunkCount, 10);
            for (let i = 0; i < count; i++) {
              localStorage.removeItem(`${key}_chunk_${i}`);
            }
            localStorage.removeItem(`${key}_chunks`);
          }
          
          // Store as single item
          localStorage.setItem(key, stringifiedValue);
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Update stored value if the key changes
  useEffect(() => {
    setStoredValue(readValue());
  }, [key]);

  return [storedValue, setValue] as const;
}
