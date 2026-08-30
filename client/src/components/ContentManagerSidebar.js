import Link from "next/link";

export default function ContentManagerSidebar() {
  return (
    <div className="w-1/6 bg-gray-800 text-white h-[calc(100vh-72px)] py-4 fixed top-20 left-0">
        <Link href="/content-manager/dashboard" className="block px-4 py-2 hover:bg-gray-700">Dashboard</Link>
        <Link href="/content-manager/courses" className="block px-4 py-2 hover:bg-gray-700">Courses</Link>
        <Link href="/content-manager/blog" className="block px-4 py-2 hover:bg-gray-700">Blog</Link>
        <Link href="/content-manager/settings" className="block px-4 py-2 hover:bg-gray-700">Settings</Link>
    </div>
  );
}