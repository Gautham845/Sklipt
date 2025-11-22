import "./globals.css"; // ✅ important: loads Tailwind styles

export const metadata = {
  title: "Sklipt",
  description: "AI Storyboard Generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {children}
        </div>
      </body>
    </html>
  );
}
