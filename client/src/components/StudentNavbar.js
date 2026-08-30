"use client"
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function StudentNavbar() {
    const[clicked, setClicked] = useState(false);
    const handleClick = () => {
        setClicked(!clicked);
    }
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
    return (
        <nav className="flex items-center justify-between bg-gray-300 p-4 h-20 fixed top-0 left-0 right-0 z-50">
            <p className="font-bold font-mono text-2xl">Student Panel</p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" onClick={handleClick}>
                profile
            </button>
            <ul className={`absolute top-16 right-4 bg-white border rounded shadow-md ${clicked ? "block" : "hidden"}`}>
                <li><Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link></li>
                <li><Link href="/student/courses/enroll" className="block px-4 py-2 hover:bg-gray-100">My Enrollments</Link></li>
                <li><button className="block px-4 py-2 hover:bg-gray-100" onClick={handleLogout}>Logout</button></li>
            </ul>
        </nav>
    )
}