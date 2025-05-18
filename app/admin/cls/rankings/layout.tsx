import React from "react";

export default function RankingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
} 