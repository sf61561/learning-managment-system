"use client";

import { useEffect, useState } from "react";
import { getCategory } from "../lib/getcategory";

const ContentManagerAddCourses = () => {
    const [categories, setCategories] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: null
    });
    const [error, setError] = useState({});
    const [image, setImage] = useState(null);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await getCategory();
                setCategories(categories);
                console.log(categories);
            }
            catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);
    useEffect(() => {
            const fetchInstructors = async () => {
            try {
                const data = await fetch('/api/instructor', {
                    method: 'GET',
                    cache: 'no-store'
                });
                const instructors = await data.json();
                setInstructors(instructors.data);
            }
            catch (error) {
                console.error("Error fetching instructors:", error);
            }
        }
        fetchInstructors();
    }, []);
    const handleCourseTitleChange = (e) => {
        const title = e.target.value;
        setFormData({
            ...formData,
            title: title
        });
        if(!title) {
            setError({
                ...error,
                title: "Course title is required"
            });
        }
        else {
            setError({
                ...error,
                title: ""
            });
        }
    }
    const handleDescriptionChange = (e) => {
        const description = e.target.value;
        setFormData({
            ...formData,
            description: description
        });
    } 
    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setFormData({
            ...formData,
            category: category
        });
        if(!category) {
            setError({
                ...error,
                category: "Category is required"
            });
        }
    }
    const handleInstructorChange = (e) => {
        const instructor = e.target.value;
        setFormData({
            ...formData,
            instructor: instructor
        });
        if(!instructor) {
            setError({
                ...error,
                instructor: "Instructor is required"
            });
        }
        else {
            setError({
                ...error,
                instructor: ""
            });
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataImage = new FormData();
        if(image) {
            formDataImage.append("file", image);
            try {
                const response = await fetch(`/api/upload`, {
                    method: "POST",
                    body: formDataImage
                });
                const result = await response.json();
                if(!response.ok) {
                    console.error("Strapi error:", result);
                }
                const imageId = result[0]?.id;
                const courseFormData = {
                    data:{
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    instructor: formData.instructor,
                    thumbnail: imageId
                }};
                const courseResponse = await fetch(`/api/content-manager/courses`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(courseFormData)
                });
                const courseResult = await courseResponse.json();
                console.log(courseResult);
                if(!courseResponse.ok) {
                    console.error("Strapi error:", courseResult);
                }
                console.log("Course created:", courseResult);
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }
    }
    return(
        <form className="w-full flex flex-col gap-4 p-4 border border-gray-300 rounded" method="POST" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Course Title</label>
                <input type="text" id="title" name="title" placeholder="Course Title" className="w-full border border-blue-400 rounded px-2 py-1 focus:outline-0 focus:border-blue-500" value={formData.title} onChange={handleCourseTitleChange} />
                {error.title && <p className="text-red-500 text-sm">{error.title}</p>}
            </div>
            <div>
                <label htmlFor="description">Course Description</label>
                <textarea id="description" name="description" placeholder="Course Description" rows="4" className="w-full border border-blue-400 rounded px-2 py-1 focus:outline-0 focus:border-blue-500" value={formData.description} onChange={handleDescriptionChange}></textarea>
                {error.description && <p className="text-red-500 text-sm">{error.description}</p>}
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <select id="category" name="category" className="w-full border border-blue-400 rounded px-2 py-1 focus:outline-0 focus:border-blue-500" value={formData.category} onChange={handleCategoryChange}>
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                    {error.category && <p className="text-red-500 text-sm">{error.category}</p>}
                </div>
                <div className="flex-1">
                    <select id="instructor" name="instructor" className="w-full border border-blue-400 rounded px-2 py-1 focus:outline-0 focus:border-blue-500" value={formData.instructor} onChange={handleInstructorChange}>
                        <option value="">Select Instructor</option>
                        {instructors.map((instructor) => (
                            <option key={instructor.id} value={instructor.id}>{instructor.full_name}</option>
                        ))}
                    </select>
                    {error.instructor && <p className="text-red-500 text-sm">{error.instructor}</p>}
                </div>
            </div>
            <input type="file" id="thumbnail" name="thumbnail" className="w-full border border-blue-400 rounded px-2 py-1 focus:outline-0 focus:border-blue-500" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            <input type="submit" value="Add Course" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer" />
        </form>
    )
}

export default ContentManagerAddCourses;