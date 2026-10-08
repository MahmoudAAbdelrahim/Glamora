import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getDirection,
  isValidLocale,
  locales,
} from "../../i18n/config";


import ThemeProvider from "@/src/components/providers/ThemeProvider";
import AuthProvider from "@/src/components/providers/AuthProvider";
import Navbar from "@/src/components/Navbar/Navbar";
import Footer from "@/src/components/Footer/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "Glamora",
  description: "Glamora Cosmetics & Skincare",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (

  <ThemeProvider>
    <AuthProvider>
      <Navbar locale={locale} />

      {children}

      <Footer />
    </AuthProvider>
  </ThemeProvider>

  );
}