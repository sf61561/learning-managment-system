"use client";

import { useState } from "react";

export default function BlogPage() {
    const [showAddBlogForm, setShowAddBlogForm] = useState(false);
    const [showBlogList, setShowBlogList] = useState(true);
    const handleAddBlogClick = () => {
        setShowAddBlogForm(!showAddBlogForm);
        setShowBlogList(!showBlogList);
    }
    return (
        <div className="w-full flex flex-col p-4">
            <div className="w-full flex justify-between items-center p-4">
                <h1 className="font-mono text-3xl font-bold">Blog</h1>
                <div>
                    <button className={showBlogList ? "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition mr-2" : "px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition mr-2"} onClick={handleAddBlogClick}>Blogs</button>
                    <button className={!showAddBlogForm ? "px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition" : "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"} onClick={handleAddBlogClick}>+Add Blog</button>
                </div>
            </div>
        </div>
    )
}