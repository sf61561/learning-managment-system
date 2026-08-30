"use client";

import { useState } from "react";

export default function AdminAddLesson({courseId}) {
    const [formData, setFormData] = useState({
        lessonTitle: "",
        lessonContent: "",
        lessonVideoUrl: ""
    });
    const [error, setError] = useState({
        lessonTitle: "",
        lessonContent: "",
        lessonVideoUrl: ""
    });
    const handleCourseTitleChange = (e) => {
        const value = e.target.value;
        setFormData({
            ...formData,
            lessonTitle: value
        });
        if(!value.length) {
            setError({
                ...error,
                lessonTitle: "Lesson title is required"
            });
        } else {
            setError({
                ...error,
                lessonTitle: ""
            });
        }
    }
    const handleCourseContentChange = (e) => {
        const value = e.target.value;
        setFormData({
            ...formData,
            lessonContent: value
        });
        if(!value.length) {
            setError({
                ...error,
                lessonContent: "Lesson content is required"
            });
        } else {
            setError({
                ...error,
                lessonContent: ""
            });
        }
    }
    const handleCourseVideoUrlChange = (e) => {
        const value = e.target.value;
        setFormData({
            ...formData,
            lessonVideoUrl: value
        });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/admin/courses/${courseId}/lesson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            console.log("Lesson added successfully:", data);
        }
        catch (error) {
            console.error("Error adding lesson:", error);
        }
    }
    return (
        <form method="post" onSubmit={handleSubmit} className="w-full flex flex-col gap-2 p-4 border border-gray-300 rounded">
            <div>
                <label htmlFor="lessonTitle" className="block text-gray-700 font-semibold mb-1">Lesson Title</label>
                <input type="text" id="lessonTitle" name="lessonTitle" placeholder="Lesson Title" className="w-full px-2 py-1 border border-blue-300 focus:border-blue-400 rounded mb-2" onChange={handleCourseTitleChange} />
                {error.lessonTitle && <p className="text-red-500 text-sm">{error.lessonTitle}</p>}
            </div>
            <div>
                <label htmlFor="lessonContent" className="block text-gray-700 font-semibold mb-1">Lesson Content</label>
                <textarea id="lessonContent" name="lessonContent" placeholder="Lesson Content" className="w-full px-2 py-1 border border-blue-300 focus:border-blue-400 rounded mb-2" onChange={handleCourseContentChange}></textarea>
                {error.lessonContent && <p className="text-red-500 text-sm">{error.lessonContent}</p>}
            </div>
            <div>
                <label htmlFor="lessonVideoUrl" className="block text-gray-700 font-semibold mb-1">Lesson Video URL</label>
                <input type="text" id="lessonVideoUrl" name="lessonVideoUrl" placeholder="Lesson Video URL" row="4" className="w-full px-2 py-1 border border-blue-300 focus:border-blue-400 rounded mb-2" onChange={handleCourseVideoUrlChange} />
                {error.lessonVideoUrl && <p className="text-red-500 text-sm">{error.lessonVideoUrl}</p>}
            </div>
            <div className="w-full flex justify-end">
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Add Lesson</button>
            </div>
        </form>
    );
}