"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEye,FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        email: "",
        password: "",
        confirm_password: ""
    });
    const [error, setError] = useState({
        full_name: "",
        username: "",
        email: "",
        password: "",
        confirm_password: ""
    });
    const isValid =Object.values(error).every((err) => err === "") && Object.values(formData).every((field) => field !== "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleFullNameChange = (e) => {
        const fullName= e.target.value;
        if(fullName.length < 3) {
            setError({ ...error, full_name: "Full name must be at least 3 characters long" });
        }
        else if(!fullName.match(/^[a-zA-Z\s]+$/)) {
            setError({ ...error, full_name: "Full name can only contain letters and spaces" });
        }
        else {
            setError({ ...error, full_name: "" });
        }
        setFormData({ ...formData, full_name: fullName });
    }
    const handleUsernameChange = (e) => {
        const username = e.target.value;
        if(username.length < 3) {
            setError({ ...error, username: "Username must be at least 3 characters long" });
        }
        else if(!username.match(/^[a-zA-Z0-9_]+$/)) {
            setError({ ...error, username: "Username can only contain letters, numbers and underscores" });
        }
        else {
            setError({ ...error, username: "" });
        }
        setFormData({ ...formData, username: username });
    }
    const handleEmailChange = (e) => {
        const email = e.target.value;
        if(!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError({ ...error, email: "Invalid email address" });
        }
        else if(email.length < 5) {
            setError({ ...error, email: "Email must be at least 5 characters long" });
        }
        else {
            setError({ ...error, email: "" });
        }
        setFormData({ ...formData, email: email });
    }
    const handlePasswordChange = (e) => {
        const password = e.target.value;
        if(password.length < 8) {
            setError({ ...error, password: "Password must be at least 8 characters long" });
        }
        else if(!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)) {
            setError({ ...error, password: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character" });
        }
        else {
            setError({ ...error, password: "" });
        }
        setFormData({ ...formData, password: password });
    }
    const handleConfirmPasswordChange = (e) => {
        const confirmPassword = e.target.value;
        if(confirmPassword !== formData.password) {
            setError({ ...error, confirm_password: "Passwords do not match" });
        }
        else {
            setError({ ...error, confirm_password: "" });
        }
        setFormData({ ...formData, confirm_password: confirmPassword });
    }
    const handleSubmit = async(e) => {
        e.preventDefault();
        setIsSubmitting(true);
        if(isValid) {
            try{
                const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/local/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        full_name: formData.full_name,
                        username: formData.username,
                        email: formData.email,
                        password: formData.password
                    })
                });
                const data = await response.json();
                console.log(data);
                if(response.ok) {
                    alert("Registration successful! Please check your email to confirm your account.");
                    router.push('/registration-confirmation');
                }
                else{
                    alert(data.error.message);
                }
            }
            catch(error) {
                console.error("Error during registration:", error);
                alert("An error occurred during registration. Please try again.");
            }
        }
    }
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    return(
        <div className="font-mono flex items-center justify-center h-screen">
            <form className="mx-auto flex flex-col gap-4 w-75" onSubmit={handleSubmit}>
                <h1 className=" w-full text-center text-2xl font-bold text-blue-400 mb-6">Register</h1>
                <div className="flex flex-col">
                    <label htmlFor="full_name">Full Name</label>
                    <input id="full_name" type="text" placeholder="Full Name" className="px-2 py-1 border-2 border-blue-300 focus:outline-0 focus:border-blue-500 rounded-md" onChange={handleFullNameChange}></input>
                    {error.full_name && <p className="text-red-500 text-sm">{error.full_name}</p>}
                </div>
                <div className="flex flex-col">
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" placeholder="Username" className="px-2 py-1 border-2 border-blue-300 focus:outline-0 focus:border-blue-500 rounded-md" onChange={handleUsernameChange}></input>
                    {error.username && <p className="text-red-500 text-sm">{error.username}</p>}
                </div>
                <div className="flex flex-col">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="text" placeholder="Email" className="px-2 py-1 border-2 border-blue-300 focus:outline-0 focus:border-blue-500 rounded-md" onChange={handleEmailChange}></input>
                    {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
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
                <div className="flex flex-col">
                    <label htmlFor="confirm_password">
                        Confirm Password
                    </label>

                    <div className="relative">
                        <input
                            id="confirm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="w-full px-2 py-1 pr-10 border-2 border-blue-300 
                                    focus:outline-0 focus:border-blue-500 rounded-md"
                            onChange={handleConfirmPasswordChange}
                        />

                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 
                                    text-gray-500 hover:text-blue-500"
                            aria-label={
                                showConfirmPassword
                                    ? "Hide confirm password"
                                    : "Show confirm password"
                            }
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    {error.confirm_password && (
                        <p className="text-red-500 text-sm">
                            {error.confirm_password}
                        </p>
                    )}
                </div>
                <input type="submit" value={isSubmitting ? "Registering..." : "Register"} className={ isValid || !isSubmitting ? 'px-2 py-1 bg-blue-400 text-white font-bold cursor-pointer hover:bg-blue-500 rounded-md' : 'px-2 py-1 bg-gray-300 text-gray-500 font-bold cursor-not-allowed rounded-md'} disabled={!isValid || isSubmitting}/>
                <p className="text-center text-sm text-gray-500">Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-500">Login</Link></p>
            </form>
        </div>
    )
}