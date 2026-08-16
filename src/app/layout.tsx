import type { Metadata, Viewport } from "next";
import StyledComponentsRegistry from "@/lib/registry";
import { pollsMetadata, pollsViewport } from "./metadata";
import PollsClientLayout from "./client-layout";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = pollsMetadata;
export const viewport: Viewport = pollsViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Toaster richColors theme="system" />
        <StyledComponentsRegistry>
          <PollsClientLayout>{children}</PollsClientLayout>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
