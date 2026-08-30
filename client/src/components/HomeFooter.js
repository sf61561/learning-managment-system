import Link from "next/link";

export default function HomeFooter() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand column */}
                    <div className="space-y-4 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                                ⚡
                            </div>
                            <span className="font-extrabold text-xl tracking-tight text-white">
                                LMS<span className="text-blue-500">Academy</span>
                            </span>
                        </Link>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Learn practical skills and grow your career with structured courses, interactive quizzes, and expert instruction.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                            Platform
                        </h4>
                        <ul className="space-y-2.5 text-xs">
                            <li>
                                <Link href="/courses" className="hover:text-white transition">
                                    All Courses
                                </Link>
                            </li>
                            <li>
                                <a href="/#categories" className="hover:text-white transition">
                                    Browse Categories
                                </a>
                            </li>
                            <li>
                                <a href="/#how-it-works" className="hover:text-white transition">
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-white transition">
                                    Blog & Articles
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Community & Learning */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                            Learning
                        </h4>
                        <ul className="space-y-2.5 text-xs">
                            <li>
                                <span className="text-gray-500">Interactive Lessons</span>
                            </li>
                            <li>
                                <span className="text-gray-500">Single-Attempt Quizzes</span>
                            </li>
                            <li>
                                <span className="text-gray-500">Progress Tracking</span>
                            </li>
                            <li>
                                <span className="text-gray-500">Course Certificate Ready</span>
                            </li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                            Account
                        </h4>
                        <ul className="space-y-2.5 text-xs">
                            <li>
                                <Link href="/login" className="hover:text-white transition">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="hover:text-white transition">
                                    Create Free Account
                                </Link>
                            </li>
                            <li>
                                <Link href="/student/dashboard" className="hover:text-white transition">
                                    Student Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 mt-12 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
                    <p>© 2026 LMSAcademy. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span>Built with Next.js & Strapi</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
