import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";
import { BASE } from "@/lib/base";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
});

const description =
  "Walk through Shree Sai Gold Palace on Sampige Road, Malleshwaram: gold, diamond, bridal and silver jewellery across three floors in Bengaluru.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Shree Sai Gold Palace — Malleshwaram, Bengaluru",
  description,
  openGraph: {
    title: "Shree Sai Gold Palace — Malleshwaram, Bengaluru",
    description,
    type: "website",
    locale: "en_IN",
    images: [{ url: BASE + "/img/sign-2000.webp", width: 2000, height: 1125, alt: "Shree Sai Gold Palace fascia on Sampige Road" }],
  },
  icons: { icon: BASE + "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#21040B",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: site.name,
  url: site.url,
  telephone: site.phone.tel,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "340, 11th Cross, Sampige Road, Malleshwaram",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560003",
    addressCountry: "IN",
  },
  openingHours: "Mo-Su 10:30-20:30",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
