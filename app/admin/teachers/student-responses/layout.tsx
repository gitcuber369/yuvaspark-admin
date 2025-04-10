export default function TeacherStudentResponsesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col">
        <main>{children}</main>
      </div>
    </div>
  );
} 