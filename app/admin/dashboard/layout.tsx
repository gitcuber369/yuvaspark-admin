import React from "react";

function DashbaordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

export default DashbaordLayout;
