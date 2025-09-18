import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import clientStorage from '@/lib/utils/storage';

import authReducer from '@/lib/features/auth/authSlice';

// Root reducer configuration
const rootReducer = combineReducers({
  auth: authReducer,
});

// Redux persist configuration
const persistConfig = {
  key: 'root',
  storage: clientStorage,
  whitelist: ['auth'], // Only persist auth state
  version: 1,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;