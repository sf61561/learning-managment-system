"use client";

import AdminAddUser from "@/src/components/AdminAddUser";
import AdminUserTable from "@/src/components/AdminUserTable";
import { useState } from "react";

export default function UsersPage(){
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const handleAddUserClick = () => {
        setShowAddUserForm(!showAddUserForm);
    }
    return(
        <div className="w-full flex flex-col p-4">
            <div className="w-full flex justify-between items-center p-4">
                <h1 className="font-mono text-3xl font-bold">Users</h1>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" onClick={handleAddUserClick}>+Add User</button>
            </div>
            {showAddUserForm && <AdminAddUser />}
            <AdminUserTable />
        </div>
    )
}