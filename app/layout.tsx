import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ProjectsProvider } from '@/app/contexts/ProjectsContext';
import { CollaborationProvider } from '@/app/contexts/CollaborationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Adflow',
  description: 'Create and manage your ad campaigns'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ProjectsProvider>
              <CollaborationProvider>
                {children}
                <Toaster />
              </CollaborationProvider>
            </ProjectsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
