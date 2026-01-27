
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import MainProvider from '@/components/main-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-heading',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-body antialiased">
        <MainProvider>
            {children}
        </MainProvider>
      </body>
    </html>
  );
}
