import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'La Consulta · Elena Vargas',
  description: 'Experiencia editorial interactiva y universo de obras de Elena Vargas.',
  openGraph: {
    title: 'La Consulta · Elena Vargas',
    description: 'Experiencia editorial interactiva y universo de obras de Elena Vargas.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Consulta · Elena Vargas',
    description: 'Experiencia editorial interactiva y universo de obras de Elena Vargas.',
  },
  icons: {
    icon: 'data:,',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#FDFBF7] text-[#2C2926] antialiased selection:bg-[#EAE0D5] selection:text-[#1F1D1A]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
