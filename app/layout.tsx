import "./globals.css";

export const metadata = {
  title: "Kibo Ventures — Portal de Founders",
  description: "Portal oficial de la comunidad de founders de Kibo Ventures",
  icons: {
    icon: "https://cdn.prod.website-files.com/68f151f762db21b4f6de5448/68f15266aa41b1bf1f3e77b9_Flaticon.png",
    apple: "https://cdn.prod.website-files.com/68f151f762db21b4f6de5448/68f1526a03d38505061e7a2b_Clip%20app.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="shortcut icon"
          type="image/png"
          href="https://cdn.prod.website-files.com/68f151f762db21b4f6de5448/68f15266aa41b1bf1f3e77b9_Flaticon.png"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
