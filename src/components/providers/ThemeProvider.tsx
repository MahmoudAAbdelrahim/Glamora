"use client";

import {
  ThemeProvider as NextThemesProvider,
} from "next-themes";

import AuthProvider from "./AuthProvider";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextThemesProvider>
  );
}