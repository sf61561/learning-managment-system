"use client";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";

export default function StudentDashboardPage() {
  const auth = useAuth();
  const router = useRouter();
  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    const data = await response.json();

    if (data.success) {
      router.push("/login");
      auth.logout();
    }
  };
  console.log(auth.user);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Student Dashboard</h1>
      <p className="text-lg text-gray-700">Welcome to the student dashboard!</p>
      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}