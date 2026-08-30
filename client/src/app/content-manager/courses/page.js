"use client";

import ContentManagerAddCourses from "@/src/components/ContentManagerAddCourses";
import ContentManagerCourseCard from "@/src/components/ContentManagerCourseCard.jsx";
import { useEffect, useState } from "react";

export default function AdminCoursesPage() {
    const [showAddCourseForm, setShowAddCourseForm] = useState(false);
    const [courses, setCourses] = useState([]);
    const handleAddCourseClick = () => {
        setShowAddCourseForm(!showAddCourseForm);
    }
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/admin/courses', {
                    method: 'GET',
                    cache: 'no-store'
                });
                const data = await response.json();
                setCourses(data.data.data);
            }
            catch (error) {
                console.error("Error fetching courses:", error);
            }
        }
        fetchCourses();
    }, []);
    console.log(courses);
    return (
        <div className="w-full flex flex-col">
            <div className="w-full flex justify-between items-center p-4">
                <h1 className="font-mono text-3xl font-bold">Courses</h1>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" onClick={handleAddCourseClick}>+Add Course</button>
            </div>
            {showAddCourseForm && <div className="block p-4"><ContentManagerAddCourses /></div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4">
                {courses.length > 0 && courses.map((course) => <ContentManagerCourseCard key={course.id} course={course} />)}
            </div>
        </div>
    )
}