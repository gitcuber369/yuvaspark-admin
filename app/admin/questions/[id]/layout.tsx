import React from "react";

export default function QuestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-0">{children}</div>;
}
