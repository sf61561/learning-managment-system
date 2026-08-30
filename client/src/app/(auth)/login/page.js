"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye,FaEyeSlash } from "react-icons/fa";
import { useAuth } from "@/src/context/AuthContext";

export default function LoginPage() {
    const auth=useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState({
        email: "",
        password: ""
    });
    const isValid= formData.email && formData.password && !error.email && !error.password;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const handleEmailChange = (e) => {
        const email= e.target.value;
        setFormData({
            ...formData,
            email: email
        });
        if(!email){
            setError({
                ...error,
                email: "Email is required"
            });
        } else {
            setError({
                ...error,
                email: ""
            });
        }
    };
    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setFormData({
            ...formData,
            password: password
        });
        if(!password){
            setError({
                ...error,
                password: "Password is required"
            });
        } else {
            setError({
                ...error,
                password: ""
            });
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const { email, password } = formData;
        if(email && password && !error.email && !error.password){
            try{
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                });
                const data = await response.json();
                console.log(data);
                if(data.status == 400 && data.message==="Your account email is not confirmed"){
                    const confirmResponse = await fetch("/api/auth/email-confirmation", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email,
                        }),
                    });
                    const confirmData = await confirmResponse.json();
                    if(confirmData.status == 200){
                        alert("Email confirmation sent. Please check your email.");
                    }
                    else{
                        alert(confirmData.message || "Error sending email confirmation. Please try again later.");
                    }
                    return;
                }
                auth.setUser({
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    role: data.user.role.name
                });
                auth.setJwtToken(data.user.jwt);
                if (!response.ok) {
                    setError(data.message || "Login failed");
                    return;
                }

                if(data?.user.role === "Admin"){
                    router.push("/admin/dashboard");
                }
                else if(data?.user.role === "Student"){
                    router.push("/student/dashboard");
                }
                else if(data?.user.role === "Instructor"){
                    router.push("/instructor/dashboard");
                }
                router.refresh();
            }
            catch(error){
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            }
        }
        else{
            alert("Please fill in all fields");
        }
        setIsSubmitting(false);
    }
    const[showPassword, setShowPassword] = useState(false);
    return(
        <div className="font-mono flex items-center justify-center h-screen">
            <form className="mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
                <h1 className=" w-full text-center text-2xl font-bold text-blue-400 mb-6">Login</h1>
                <div className="flex flex-col">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="text" placeholder="Email" className="px-2 py-1 border-2 border-blue-300 focus:outline-0 focus:border-blue-500 rounded-md" value={formData.email} onChange={handleEmailChange}></input>
                    {error.email && <span className="text-red-500 text-sm">{error.email}</span>}
                </div>
                <div className="flex flex-col">
                    <label htmlFor="password">
                        Password
                    </label>

                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full px-2 py-1 pr-10 border-2 border-blue-300 
                                    focus:outline-0 focus:border-blue-500 rounded-md"
                            onChange={handlePasswordChange}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 
                                    text-gray-500 hover:text-blue-500"
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {error.password && (
                        <p className="text-red-500 text-sm">
                            {error.password}
                        </p>
                    )}
                </div>
                <input type="submit" value="Login" disabled={!isValid} className={isValid ? `px-2 py-1 bg-blue-400 text-white font-bold cursor-pointer hover:bg-blue-500 rounded-md` : `px-2 py-1 bg-gray-400 text-white font-bold cursor-not-allowed rounded-md`}></input>
                <p>Don&apos;t have an account? <Link href="/register" className="text-blue-400 hover:text-blue-500">Register</Link></p>
            </form>
        </div>
    )
}