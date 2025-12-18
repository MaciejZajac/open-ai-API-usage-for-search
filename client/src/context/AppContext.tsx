import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import type { NavigateFunction } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";

export interface Message {
  isImage: boolean;
  isPublished: boolean;
  role: string;
  content: string;
  timestamp: number;
}

export interface Chat {
  _id: string;
  userId: string;
  userName?: string;
  name: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  credits: number;
}

interface AppContextType {
  navigate: NavigateFunction;
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  fetchUser: () => Promise<void>;
  chats: Chat[];
  setChats: Dispatch<SetStateAction<Chat[]>>;
  selectedChat: Chat | null;
  setSelectedChat: Dispatch<SetStateAction<Chat | null>>;
  theme: string;
  setTheme: Dispatch<SetStateAction<string>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [theme, setTheme] = useState<string>(
    localStorage.getItem("theme") || "light"
  );

  const fetchUser = async () => {
    setUser(dummyUserData);
  };

  const fetchUsersChats = () => {
    setChats(dummyChats as Chat[]);
    setSelectedChat((dummyChats[0] as Chat) || null);
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      fetchUsersChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, []);

  const value: AppContextType = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};
