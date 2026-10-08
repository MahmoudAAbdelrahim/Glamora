import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glamora",
  description: "Glamora Cosmetics & Skincare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}