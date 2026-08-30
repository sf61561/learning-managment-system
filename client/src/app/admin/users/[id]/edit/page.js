"use client";

import { use, useEffect, useState } from "react";

export default function AdminUpdateUser({ params }) {
    const { id } = use(params);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState({
        full_name: "",
        username: "",
        email: "",
        role_id: ""
    });
    const isValid = Object.values(error).every((error) => error === "") && Object.values(formData).every((value) => value !== "" || value !== null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/admin/users/${id}`, {
                    method: 'GET',
                    cache: 'no-store'
                });
                const data = await response.json();
                setUser(data.data);
                setFormData({
                    full_name: data.data.full_name,
                    username: data.data.username,
                    email: data.data.email,
                    role_id: data.data.role?.id || null
                });
            }
            catch (error) {
                console.error("Error fetching user:", error);
            }
        }
        fetchUser();
    }, [id]);
    const handlefullNameChange = (e) => {
        const value = e.target.value;
        console.log(value);
        if(value.trim() === "") {
            setError({
                ...error,
                full_name: "Full Name is required"
            });
        }
        else if(value.trim().length < 3) {
            setError({
                ...error,
                full_name: "Full Name must be at least 3 characters long"
            });
        }
        else if(/^[a-zA-Z\s]+$/.test(value) === false) {
            setError({
                ...error,
                full_name: "Full Name can only contain letters and spaces"
            });
        }
        else {
            setError({
                ...error,
                full_name: ""
            });
            setFormData({
                ...formData,
                full_name: value
            });
        }
    }
    const handleUsernameChange = (e) => {
        const value = e.target.value;
        if(value.trim() === "") {
            setError({
                ...error,
                username: "Username is required"
            });
        }
        else if(value.trim().length < 3) {
            setError({
                ...error,
                username: "Username must be at least 3 characters long"
            });
        }
        else if(/^[a-zA-Z0-9_]+$/.test(value) === false) {
            setError({
                ...error,
                username: "Username can only contain letters, numbers, and underscores"
            });
        }
        else {
            setError({
                ...error,
                username: ""
            });
            setFormData({
                ...formData,
                username: value
            });
        }
    }
    const handleEmailChange = (e) => {
        const value = e.target.value;
        if(value.trim() === "") {
            setError({
                ...error,
                email: "Email is required"
            });
        }
        else if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) === false) {
            setError({
                ...error,
                email: "Invalid email format"
            });
        }
        else {
            setError({
                ...error,
                email: ""
            });
            setFormData({
                ...formData,
                email: value
            });
        }
    }
    const handleRoleChange = (e) => {
        const value = e.target.value;
        if(value === "") {
            setError({
                ...error,
                role_id: "Role is required"
            });
        }
        else {
            setError({
                ...error,
                role_id: ""
            });
            setFormData({
                ...formData,
                role_id: Number(value)
            });
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!isValid) {
            alert("Please fix the errors in the form before submitting.");
            return;
        }
        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            console.log("Response from server:", data);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("An error occurred while updating the user. Please try again.");
        }
    }
    return (
        <div className="w-full flex flex-col gap-4 p-4">
            <h1 className="text-2xl font-bold">Update User</h1>
            <form className="w-full flex flex-col gap-4 p-4 border border-gray-300 rounded" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1">
                    <label htmlFor="full_name">Full Name</label>
                    <input type="text" name="full_name" id="full_name" value={user?.full_name} className="border border-blue-300 rounded p-2 focus:outline-0 focus:border-blue-400" onChange={handlefullNameChange} />
                    {error.full_name && <p className="text-red-500 text-sm">{error.full_name}</p>}
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" value={user?.username} className="border border-blue-300 rounded p-2 focus:outline-0 focus:border-blue-400" onChange={handleUsernameChange} />
                    {error.username && <p className="text-red-500 text-sm">{error.username}</p>}
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="role_id">Role</label>
                    <select name="role_id" defaultValue={String(user?.role?.id || "")} className="border border-gray-300 rounded p-2" onChange={handleRoleChange}>
                        <option value="">Select Role</option>
                        <option value="3">Admin</option>
                        <option value="6">Instructor</option>
                        <option value="4">Student</option>
                        <option value="5">Content Manager</option>
                    </select>
                    {error.role_id && <p className="text-red-500 text-sm">{error.role_id}</p>}
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" value={user?.email} className="border border-blue-300 rounded p-2 focus:outline-0 focus:border-blue-400" onChange={handleEmailChange} />
                    {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
                </div>
                <div className="flex w-full justify-end">
                    <input type="submit" value="Update User" className={isValid ? "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer" : "bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded cursor-pointer"} disabled={!isValid} />
                </div>
            </form>
        </div>
    );
}