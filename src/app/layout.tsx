import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist to Inter
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ // Changed from geistSans/geistMono to Inter
  subsets: ['latin'],
  variable: '--font-sans', // Use standard variable name
});

export const metadata: Metadata = {
  title: 'SecureSurf', // Updated title
  description: 'Analyze website security in real-time.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}> {/* Apply Inter font class */}
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
