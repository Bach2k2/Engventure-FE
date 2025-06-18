"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
