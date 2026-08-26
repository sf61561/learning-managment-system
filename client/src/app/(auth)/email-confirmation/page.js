"use client";

import { useRouter } from "next/navigation";

export default function EmailConfirmationPage() {
    const router = useRouter();
    return (
        <div className="font-mono flex items-center justify-center h-screen">
            <div className="mx-auto text-center">
                <h1 className="text-2xl font-bold text-blue-400 mb-4">Email Confirmed!</h1>
                <p className="text-lg">Your email has been confirmed. You can now log in.</p>
                <button onClick={() => router.push('/login')} className="mt-4 px-4 py-2 bg-blue-400 text-white font-bold rounded-md hover:bg-blue-500">Go to Login</button>
            </div>
        </div>
    );
}