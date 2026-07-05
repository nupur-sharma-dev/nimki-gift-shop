import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "@/styles/globals.css";
import { APP_NAME, APP_TAGLINE } from "@/constants";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";
import SessionProvider from "@/components/providers/SessionProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import GAListener from "@/components/analytics/GAListener";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  keywords: ["handmade gifts", "gift shop", "Nepal", "Nimki", "handcrafted"],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         process.env.NEXT_PUBLIC_APP_URL,
    siteName:    APP_NAME,
    title:       APP_NAME,
    description: APP_TAGLINE,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
        />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        <Suspense fallback={null}>
          <GAListener />
        </Suspense>
        <SessionProvider>
          {children}
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}