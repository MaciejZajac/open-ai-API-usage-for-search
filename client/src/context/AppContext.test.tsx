import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppContextProvider, useAppContext } from './AppContext';
import { dummyChats, dummyUserData } from '../assets/assets';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Wrapper component for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AppContextProvider>{children}</AppContextProvider>
  </BrowserRouter>
);

describe('AppContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockNavigate.mockClear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useAppContext());
    }).toThrow('useAppContext must be used within an AppContextProvider');
    
    consoleSpy.mockRestore();
  });

  it('should fetch user and chats on mount', async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.user).toEqual(dummyUserData);
      expect(result.current.chats.length).toBeGreaterThan(0);
      expect(result.current.selectedChat).toEqual(dummyChats[0]);
    });
  });

  it('should clear chats when user is set to null (logout)', async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    // Wait for user and chats to be loaded
    await waitFor(() => {
      expect(result.current.chats.length).toBeGreaterThan(0);
    });

    // Logout
    act(() => {
      result.current.setUser(null);
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.chats).toEqual([]);
      expect(result.current.selectedChat).toBeNull();
    });
  });

  it('should update theme and toggle dark class', async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });
    
    act(() => {
      result.current.setTheme('dark');
    });

    await waitFor(() => {
      expect(result.current.theme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    act(() => {
      result.current.setTheme('light');
    });

    await waitFor(() => {
      expect(result.current.theme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
