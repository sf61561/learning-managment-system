import Link from "next/link";

export default function AdminSidebar() {
  return (
    <div className="w-1/6 bg-gray-800 text-white h-[calc(100vh-72px)] py-4 fixed top-20 left-0">
        <Link href="/admin/dashboard" className="block px-4 py-2 hover:bg-gray-700">Dashboard</Link>
        <Link href="/admin/courses" className="block px-4 py-2 hover:bg-gray-700">Courses</Link>
        <Link href="/admin/users" className="block px-4 py-2 hover:bg-gray-700">Users</Link>
        <Link href="/admin/blog" className="block px-4 py-2 hover:bg-gray-700">Blog</Link>
        <Link href="/admin/settings" className="block px-4 py-2 hover:bg-gray-700">Settings</Link>
    </div>
  );
}