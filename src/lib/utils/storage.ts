import storage from 'redux-persist/lib/storage';

const createNoopStorage = () => {
  return {
    getItem(): Promise<string | null> {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string): Promise<string> {
      return Promise.resolve(value);
    },
    removeItem(): Promise<void> {
      return Promise.resolve();
    },
  };
};

// Use real storage in browser, noop storage in SSR
const clientStorage = typeof window !== 'undefined' 
  ? storage 
  : createNoopStorage();

export default clientStorage;