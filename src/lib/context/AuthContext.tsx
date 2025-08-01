"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useLayoutEffect,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useApi } from "../Api";
import UserService from "../services/user.service";
interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  scope?: string[];
  role?: string;
}
interface DecodedToken {
  sub: string;
  iat: number;
  exp: number;
  // nbf?: number;
  scope: string[] | string;
}

interface User {
  id: string;
  email: string;
  roles: string[];
}

// username: string | null;
interface AuthContextProps {
  tokenInfo: TokenInfo | null;
  setTokenInfo: (info: TokenInfo) => void;
  reset: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [tokenInfo, setTokenInfoState] = useState<TokenInfo | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const userService = new UserService();

  const setTokenInfo = async ({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) => {
    // if (!accessToken) return;
    const decoded = jwtDecode<DecodedToken>(accessToken);
    const { sub, iat, exp } = decoded;
    // console.log("decoded: ", decoded);

    const scopes = Array.isArray(decoded?.scope)
      ? decoded.scope
      : typeof decoded.scope === "string"
        ? decoded.scope.split(" ")
        : [];
    console.log("scopes", scopes);
    let role = "user";
    if (scopes.includes("admin")) {
      role = "admin";
    }
    const tokenInfo: TokenInfo = {
      accessToken,
      refreshToken,
      scope: scopes,
      role: role,
    };

    try {
      const userData = await userService.getOwnUser();
      localStorage.setItem("user", JSON.stringify(userData.data));
      setUser(userData.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }

    setTokenInfoState(tokenInfo);
  };
  const reset = () => {
    setTokenInfoState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ tokenInfo, user, setTokenInfo, reset }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
