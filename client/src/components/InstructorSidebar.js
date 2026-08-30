import Link from "next/link";

export default function InstructorSidebar() {
  return (
    <div className="w-1/6 bg-gray-800 text-white h-[calc(100vh-72px)] py-4 fixed top-20 left-0">
        <Link href="/instructor/dashboard" className="block px-4 py-2 hover:bg-gray-700">Dashboard</Link>
        <Link href="/instructor/courses" className="block px-4 py-2 hover:bg-gray-700">Courses</Link>
        <Link href="/instructor/blog" className="block px-4 py-2 hover:bg-gray-700">Blog</Link>
    </div>
  );
}