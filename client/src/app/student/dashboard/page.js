"use client";
import { useAuth } from "@/src/context/AuthContext";

export default function StudentDashboardPage() {
  const auth = useAuth();
  console.log(auth.user);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Student Dashboard</h1>
      <p className="text-lg text-gray-700">Welcome to the student dashboard!</p>
    </div>
  );
}