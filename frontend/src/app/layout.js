import './globals.css';

export const metadata = {
  title: 'Hepatitis C CDSS',
  description: 'Clinical Decision Support System for Hepatitis C Screening',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
