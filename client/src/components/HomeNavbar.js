"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomeNavbar() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        // Fetch current user if session cookie is present
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me", { cache: "no-store" });
                if (res.ok) {
                    const json = await res.json();
                    setUser(json.data || null);
                }
            } catch {}
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            router.push("/login");
            router.refresh();
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    const getDashboardPath = () => {
        if (!user?.role) return "/student/dashboard";
        const role = (user.role.type || user.role.name || "").toLowerCase().replace(/[\s_-]+/g, "");
        if (role === "admin") return "/admin/dashboard";
        if (role === "contentmanager") return "/content-manager/dashboard";
        if (role === "instructor") return "/instructor/dashboard";
        return "/student/dashboard";
    };

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition">
                            ⚡
                        </div>
                        <div>
                            <span className="font-extrabold text-xl tracking-tight text-gray-900 block leading-tight">
                                LMS<span className="text-blue-600">Academy</span>
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase block">
                                Practical Online Learning
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
                        <Link href="/courses" className="hover:text-blue-600 transition">
                            Courses
                        </Link>
                        <a href="/#categories" className="hover:text-blue-600 transition">
                            Categories
                        </a>
                        <a href="/#how-it-works" className="hover:text-blue-600 transition">
                            How It Works
                        </a>
                        <Link href="/blog" className="hover:text-blue-600 transition">
                            Blog
                        </Link>
                    </div>

                    {/* Auth Actions - Desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={getDashboardPath()}
                                    className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                                >
                                    <span>📊</span>
                                    <span>Dashboard</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <Link
                                    href="/login"
                                    className="px-4 py-2.5 text-gray-700 hover:text-gray-900 text-xs font-bold transition"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition hover:shadow"
                                >
                                    Register Free
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <div className="md:hidden flex items-center">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {mobileOpen ? "✕" : "☰"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
                    <Link
                        href="/courses"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                        Courses
                    </Link>
                    <a
                        href="/#categories"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                        Categories
                    </a>
                    <a
                        href="/#how-it-works"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                        How It Works
                    </a>
                    <Link
                        href="/blog"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                        Blog
                    </Link>

                    <div className="pt-4 border-t border-gray-100 space-y-2">
                        {user ? (
                            <>
                                <Link
                                    href={getDashboardPath()}
                                    onClick={() => setMobileOpen(false)}
                                    className="block w-full text-center px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileOpen(false);
                                        handleLogout();
                                    }}
                                    className="block w-full text-center px-4 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="block text-center px-4 py-2.5 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="block text-center px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
