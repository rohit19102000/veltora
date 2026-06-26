import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VELTORA — Bespoke Luxury Timepiece House',
  description: 'Experience the art of mechanical engineering. Each VELTORA movement is meticulously assembled by hand over 300 hours in our Geneva atelier. Configure and reserve your bespoke timepiece.',
  keywords: 'luxury watch, mechanical watch, timepiece, custom watch, swiss made watch, tourbillon, bespoke watch, veltora',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
