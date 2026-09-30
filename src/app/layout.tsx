import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Household Renewal Tracker",
    template: "%s · Household Renewal Tracker",
  },
  description:
    "A shared family vault for CNIC, passport, vehicle, and insurance dates.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans text-ink">{children}</body>
    </html>
  );
}
