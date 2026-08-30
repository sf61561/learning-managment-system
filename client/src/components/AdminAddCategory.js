"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AdminAddCategory() {
    const auth = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [image, setImage] = useState(null);
    const [formData, setFormData] = useState({
        categoryName: "",
        categorySlug: "",
        categoryDescription: ""
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (image) {
            const formdata1 = new FormData();
            formdata1.append("file", image);
            try{
                const response = await fetch(`/api/upload`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${auth.jwtToken}`,
                    },
                    body: formdata1,
                });
                const result = await response.json();
                if (!response.ok) {
                    console.error("Strapi error:", result);
                }
                const imageId = result[0]?.id;
                const categoryFormData = new FormData();
                categoryFormData.append("categoryName", formData.categoryName);
                categoryFormData.append("categorySlug", formData.categorySlug);
                categoryFormData.append("categoryDescription", formData.categoryDescription);
                categoryFormData.append("categoryImage", imageId);
                const categoryResponse = await fetch(`/api/admin/categories`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${auth.jwtToken}`,
                    },
                    body: categoryFormData,
                });
                const categoryResult = await categoryResponse.json();
                if (!categoryResponse.ok) {
                    console.error("Strapi error:", categoryResult);
                }
                console.log("Category created:", categoryResult);
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
        
    }
    return (
        <div className="w-full p-4">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Category</h1>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setShowForm(!showForm)}>+ Add Category</button>
                </div>
                <form className={`${showForm ? 'block' : 'hidden'} flex flex-col gap-4 shadow-5xl border border-gray-400 p-4 rounded-md`} onSubmit={handleSubmit}>
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-1 w-1/2">
                            <label htmlFor="categoryName">Category Name<span className="text-red-500">*</span></label>
                            <input type="text" id="categoryName" placeholder="Category Name" className="border border-blue-400 focus:outline-0 focus:border-blue-500 px-2 py-1 rounded-md" onChange={(e) => setFormData({...formData, categoryName: e.target.value})}/>
                        </div>
                        <div className="flex flex-col gap-2 w-1/2">
                            <label htmlFor="categorySlug">Category Slug<span className="text-red-500">*</span></label>
                            <input type="text" id="categorySlug" placeholder="Category Slug" className="border border-blue-400 focus:outline-0 focus:border-blue-500 px-2 py-1 rounded-md" onChange={(e) => setFormData({...formData, categorySlug: e.target.value})}/>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="categoryDescription">Category Description</label>
                        <textarea id="categoryDescription" placeholder="Category Description" rows="4" className="border border-blue-400 focus:outline-0 focus:border-blue-500 px-2 py-1 rounded-md" onChange={(e) => setFormData({...formData, categoryDescription: e.target.value})}></textarea>
                    </div>
                    <input type="file" id="categoryImage" accept="image/*" className="border border-blue-400 focus:outline-0 focus:border-blue-500 px-2 py-1 rounded-md" onChange={(e) => setImage(e.target.files?.[0] || null)}/>
                    <div className="flex w-full justify-end">
                        <button type="submit" className="w-40 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Category</button>
                    </div>
                </form>
            </div>
        </div>
    )
}