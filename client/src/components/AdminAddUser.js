"use client";

import { useState } from "react";

export default function AdminAddUser(){
    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        email: "",
        password: "",
        role: null
    });
    const [errors, setErrors] = useState({});
    const handleFullNameChange = (e) => {
        const fullName = e.target.value;
        setFormData({ ...formData, full_name: fullName });
        if(fullName.trim() === "") {
            setErrors({ ...errors, name: "Full Name is required" });
        }
        else if(/^[a-zA-Z\s]+$/.test(fullName) === false) {
            setErrors({ ...errors, name: "Full Name can only contain letters and spaces" });
        }
        else {
            setErrors({ ...errors, name: undefined });
        }
    }
    const handleUsernameChange = (e) => {
        const username = e.target.value;
        setFormData({ ...formData, username: username });
        if(username.trim() === "") {
            setErrors({ ...errors, username: "Username is required" });
        }
        else if(/^[a-zA-Z0-9_]+$/.test(username) === false) {
            setErrors({ ...errors, username: "Username can only contain letters, numbers, and underscores" });
        }
        else {
            setErrors({ ...errors, username: undefined });
        }
    }
    const handleEmailChange = (e) => {
        const email = e.target.value;
        setFormData({ ...formData, email: email });
        if(email.trim() === "") {
            setErrors({ ...errors, email: "Email is required" });
        }
        else if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) === false) {
            setErrors({ ...errors, email: "Invalid email format" });
        }
        else {
            setErrors({ ...errors, email: undefined });
        }
    }
    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setFormData({ ...formData, password: password });
        if(password === "") {
            setErrors({ ...errors, password: "Password is required" });
        }
        else if(password.length < 8) {
            setErrors({ ...errors, password: "Password must be at least 8 characters long" });
        }
        else if(!/[A-Z]/.test(password)) {
            setErrors({ ...errors, password: "Password must contain at least one uppercase letter" });
        }
        else if(!/[a-z]/.test(password)) {
            setErrors({ ...errors, password: "Password must contain at least one lowercase letter" });
        }
        else if(!/[0-9]/.test(password)) {
            setErrors({ ...errors, password: "Password must contain at least one number" });
        }
        else if(!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setErrors({ ...errors, password: "Password must contain at least one special character" });
        }
        else {
            setErrors({ ...errors, password: undefined });
        }
    }
    const handleRoleChange = (e) => {
        const role = e.target.value;
        if(role === "Admin") {
            setFormData({ ...formData, role: 3 });
        }
        else if(role === "Content Manager") {
            setFormData({ ...formData, role: 5 });
        }
        else if(role === "Instructor") {
            setFormData({ ...formData, role: 6 });
        }
        else if(role === "Student") {
            setFormData({ ...formData, role: 4 });
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(errors.name || errors.username || errors.email || errors.password) {
            console.log("Form has errors. Please fix them before submitting.");
            return;
        } 
        try {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            if(response.ok) {
                console.log("User added successfully.");
            } else {
                console.error("Failed to add user.");
            }
        } catch(error) {
            console.error("Error adding user:", error);
        }
    };
    const isValid = errors.name === undefined && errors.username === undefined && errors.email === undefined && errors.password === undefined;
    return(
        <form className="w-full flex flex-col gap-4 p-4 border border-gray-300 rounded" method="POST" onSubmit={handleSubmit}>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" name="name" placeholder="Name" className="w-full border border-blue-400 rounded px-2 py-1 focus:outline-0 focus:border-blue-500" onChange={handleFullNameChange}/>
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="flex-1">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" placeholder="Username" className="w-full border border-blue-400 rounded px-2 py-1 focus:outline-0 focus:border-blue-500" onChange={handleUsernameChange}/>
                    {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label htmlFor="email">Email</label>
                    <div>
                        <input type="email" id="email" name="email" placeholder="Email" className="w-full border border-blue-400 rounded px-2 py-1 focus:outline-0 focus:border-blue-500" onChange={handleEmailChange}/>
                    </div>
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                <div className="flex-1">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Password" className="w-full border border-blue-400 rounded px-2 py-1 focus:outline-0 focus:border-blue-500" onChange={handlePasswordChange}/>
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>
            </div>
            <div>
                <label htmlFor="role">Role</label>
                <select id="role" name="role" className="w-full border border-blue-400 rounded px-2 py-1 focus:outline-0 focus:border-blue-500" onChange={handleRoleChange}>
                    <option value="Admin">Admin</option>
                    <option value="Content Manager">Content Manager</option>
                    <option value="Instructor">Instructor</option>
                    <option value="Student">Student</option>
                </select>
            </div>
            <button type="submit" className={isValid ? "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" : "px-4 py-2 bg-gray-300 text-gray-500 rounded"} disabled={!isValid}>Add User</button>
        </form>
    )
}