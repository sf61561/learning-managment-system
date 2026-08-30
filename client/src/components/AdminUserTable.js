"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdminUserTable() {
    const [users, setUsers] = useState([])
    const fetchUsers = async () => {
        try{
            const response = await fetch('/api/admin/users',{
                method: 'GET',
                cache: 'no-store'
            });
            const data = await response.json();
            setUsers(data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }
    useState(() => {
        fetchUsers();
    }, []);
    return(
        <table className="w-full border border-gray-300 mt-4 gap-4">
            <thead>
                <tr className="w-full">
                    <th className="border border-gray-300 p-2">Name</th>
                    <th className="border border-gray-300 p-2">Email</th>
                    <th className="border border-gray-300 p-2">Username</th>
                    <th className="border border-gray-300 p-2">Role</th>
                    <th className="border border-gray-300 p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users &&  users?.map((user) => {
                    return (
                        <tr key={user.id} className="w-full">
                            <td className="border-2 border-gray-400 p-2 text-center align-middle">{user.full_name}</td>
                            <td className="border-2 border-gray-400 p-2 text-center align-middle">{user.email}</td>
                            <td className="border-2 border-gray-400 p-2 text-center align-middle">{user.username}</td>
                            <td className="border-2 border-gray-400 p-2 text-center align-middle">{user.role?.name || 'No Role'}</td>
                            <td className="border-2 border-gray-400 p-2 text-center align-middle">
                                <Link href={`/admin/users/${user.id}/edit`}>
                                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded">Edit</button>
                                </Link>
                            </td>
                        </tr>
                )
            })}
            </tbody>
        </table>
    )
}