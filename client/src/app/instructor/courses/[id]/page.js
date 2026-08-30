"use client";

import AdminAddLesson from "@/src/components/AdminAddLesson";
import AdminAddQuiz from "@/src/components/AdminAddQuiz";
import AdminViewQuizes from "@/src/components/AdminViewQuizes";
import { use, useEffect, useState } from "react";

export default function AdminCourseDetails({params}) {
    const {id} = use(params);
    const [courseDetails, setCourseDetails] = useState(null);
    const [lessons, setLessons] = useState([]);
    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await fetch(`/api/admin/courses/${id}`, {
                    method: 'GET',
                    cache: 'no-store'
                });
                const data = await response.json();
                setCourseDetails(data.data.data);
            }
            catch (error) {
                console.error("Error fetching course details:", error);
            }
        }
        fetchCourseDetails();
    }, [id]);
    console.log(courseDetails);
    const [toogleLesson, setToggleLesson] = useState(true);
    const [toogleQuiz, setToggleQuiz] = useState(false);
    const handleToggle = () => {
        setToggleLesson(!toogleLesson);
        setToggleQuiz(!toogleQuiz);
    }
    const [showAddLesson, setShowAddLesson] = useState(false);
    const handleAddLesson = () => {
        setShowAddLesson(!showAddLesson);
    }
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await fetch(`/api/admin/courses/${id}/lesson`, {
                    method: 'GET',
                    cache: 'no-store'
                });
                const data = await response.json();
                setLessons(data.data.data);
            }
            catch (error) {
                console.error("Error fetching lessons:", error);
            }
        }
        fetchLessons();
    }, [id]);
    console.log(lessons);
    const [numberofquestions, setNumberOfQuestions] = useState(0);
    const [toogleAddQuiz, setToggleAddQuiz] = useState(false);
    const [toogleViewQuiz, setToggleViewQuiz] = useState(true);
    const handleToogleQuiz = () => {
        setToggleAddQuiz(!toogleAddQuiz);
        setToggleViewQuiz(!toogleViewQuiz);
    }
    return (
        <div className="w-full flex flex-col p-4 gap-4">
            <img src={`${process.env.NEXT_PUBLIC_STRAPI_URL.split('/api')[0]}${courseDetails?.thumbnail?.url}`} alt={courseDetails?.title} className="w-full h-64 object-fill" />
            <div>
                <h1 className="text-2xl font-bold mb-2">{courseDetails?.title}</h1>
                <p className="text-gray-700 mb-4">{courseDetails?.description}</p>
                <p className="text-gray-800 font-semibold">Category: {courseDetails?.category?.name}</p>
                <p className="text-gray-800 font-semibold">Instructor: {courseDetails?.instructor[0]?.full_name}</p>
            </div>
            <div className="w-full flex justify-between items-center">
                <h2 className="text-xl font-bold">Course Content</h2>
                <div className="flex gap-2">
                    <button className={toogleLesson ? "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" : "px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"} onClick={handleToggle}>Lesson</button>
                    <button className={toogleQuiz ? "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" : "px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"} onClick={handleToggle}>Quiz</button>
                </div>
            </div>
            <div>
                {toogleLesson && 
                    <div className="w-full flex flex-col gap-2">
                        <div className="w-full flex flex-col mb-2">
                            <div className="w-full flex justify-end items-center">
                                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={handleAddLesson}>+Add Lesson</button>
                            </div>
                            <div className={showAddLesson ? "w-full flex flex-col gap-2 mt-2" : "hidden"}>
                                <AdminAddLesson courseId={id} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            {lessons.map((lesson) => (
                                <div key={lesson.id} className="w-full flex flex-col gap-2 p-2 border border-gray-300 rounded">
                                    <div key={lesson.id} className="w-full flex justify-between items-center">
                                        <p className="text-gray-800 font-bold text-xl">{lesson.title}</p>
                                        <button className="w-10 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition" onClick={(e) => {
                                            const div = document.getElementById(lesson.id);
                                            div.classList.toggle("hidden");
                                            e.target.textContent = div.classList.contains("hidden") ? "+" : "-";
                                    }}>+</button>
                                </div>
                                <div id={lesson.id} className="hidden">
                                    <p>{lesson.content}</p>
                                    {
                                        lesson.video_url &&
                                        <iframe
                                            className="w-full aspect-video rounded-lg"
                                            src={lesson.video_url}
                                            title={lesson.title}
                                            allowFullScreen
                                        />
                                    }
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                }
                {toogleQuiz && <div className="w-full flex flex-col gap-2">
                    <div className="w-full justify-end flex gap-2 mb-4">
                        <button className={toogleViewQuiz ? "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition cursor-pointer" : "px-4 py-2 bg-gray-500 text-white rounded transition cursor-pointer"} onClick={handleToogleQuiz}>Quizes</button>
                        <button className={toogleAddQuiz ? "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition cursor-pointer" : "px-4 py-2 bg-gray-500 text-white rounded  transition cursor-pointer"} onClick={handleToogleQuiz}>Add Quiz</button>
                    </div>
                    {
                        toogleAddQuiz &&
                        <form onSubmit={(e) => e.preventDefault()} className="w-full flex items-center gap-2 p-4 border border-gray-300 rounded">
                            <label htmlFor="numberofquestions">Number of Questions:</label>
                            <input type="text" id="numberofquestions" className="border border-blue-300 focus:border-blue-400 rounded p-2" placeholder="Number of Questions" value={numberofquestions} onChange={(e) => setNumberOfQuestions(e.target.value)} />
                        </form>
                    }
                    {
                        numberofquestions > 0 && <AdminAddQuiz courseId={id} numberofquestions={numberofquestions} />
                    }
                    {
                        toogleViewQuiz && <AdminViewQuizes courseId={id} />
                    }
                </div>}
            </div>
        </div>
    );
}