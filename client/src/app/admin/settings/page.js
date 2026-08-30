"use client";

import AdminAddCategory from "@/src/components/AdminAddCategory";
import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
    const [categories, setCategories] = useState([]);
    const fetchCategories = async () => {
        try {
            const response = await fetch(`/api/admin/categories`, {
                method: "GET",
                cache: "no-store"
            });
            const data = await response.json();
            console.log(data.data.data);
            setCategories(data.data.data);
        }
        catch (error) {
            console.error("Error fetching categories:", error);
        }
    };
    console.log(categories);
    useEffect(() => {
        fetchCategories();
    }, []);
    return (
        <div className="w-full flex flex-col p-4">
            <AdminAddCategory />
            <table className="w-full border border-gray-300 mt-4 gap-4">
                <thead>
                    <tr className="w-full">
                        <th className="border border-gray-300 p-2">Image</th>
                        <th className="border border-gray-300 p-2">Category Name</th>
                        <th className="border border-gray-300 p-2">SLug</th>
                        <th className="border border-gray-300 p-2">Description</th>
                        <th className="border border-gray-300 p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(categories) && categories.map((category) => (
                        <tr key={category.id} className="w-full">
                            <td className="border-2 border-gray-400 p-2 text-center align-middle">
                                <img src={`${process.env.NEXT_PUBLIC_STRAPI_URL.split('/api')[0]}${category.image?.url}`} alt={category.name} className="w-16 h-16 object-cover mx-auto" />
                            </td>
                            <td className="border-2 border-gray-400 p-2 text-center align-middle">{category.name}</td>
                            <td className="border-2 border-gray-400 p-2 text-center align-middle">{category.slug}</td>
                            <td className="border-2 border-gray-400 p-2 text-center align-middle">{category.description}</td>
                            <td className="border-2 border-gray-400 p-2 text-center align-middle">
                                <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}