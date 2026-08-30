"use client";

import { useState } from "react";

export default function ContentManagerAddQuiz({courseId, numberofquestions}) {
    const [formData, setFormData] = useState({
        quizTitle: "",
        quizDescription: "",
        quizPassingScore: "",
        quizQuestions: []
    });
    const [questions, setQuestions] = useState(
        Array.from({ length: numberofquestions || 0 }, () => ({
            question: "",
            options: {
                A: "",
                B: "",
                C: "",
                D: "",
            },
            correctAnswer: "A",
        }))
    );
    const handleOptionChange = (index, option, value) => {
        setQuestions((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;

                return {
                    ...item,
                    options: {
                        ...item.options,
                        [option]: value,
                    },
                };
            })
        );
    };
    console.log("Number of Questions:", numberofquestions);
    const handleChange = (index, field, value) => {
        setQuestions((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;

                return {
                    ...item,
                    [field]: value,
                };
            })
        );
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const quizData = {
            ...formData,
            quizPassingScore: Number(formData.quizPassingScore),
            quizQuestions: questions,
        };

        console.log("Quiz Data:", quizData);
        try {
            const response = await fetch(`/api/admin/courses/${courseId}/quizes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quizData),
            });
            const data = await response.json();
            console.log("Response from server:", data);
        } catch (error) {
            console.error("Error submitting quiz:", error);
        }
    }
    return (
        <div>
            <form onSubmit={(e) => handleSubmit(e)} className="w-full flex flex-col gap-2 p-4 border border-gray-300 rounded">
                <div className="w-full flex flex-col gap-2">
                    <label htmlFor="quizTitle">Quiz Title:</label>
                    <input type="text" id="quizTitle" className="border border-gray-300 rounded p-2 w-full" placeholder="Quiz Title" value={formData.quizTitle} onChange={(e) => setFormData({...formData, quizTitle: e.target.value})} />
                </div>
                <div className="w-full flex flex-col gap-2">
                    <label htmlFor="quizDescription">Quiz Description:</label>
                    <textarea id="quizDescription" className="border border-gray-300 rounded p-2 w-full" placeholder="Quiz Description" value={formData.quizDescription} onChange={(e) => setFormData({...formData, quizDescription: e.target.value})} />
                </div>
                <div className="w-full flex flex-col gap-2">
                    <label htmlFor="quizPassingScore">Quiz Passing Score:</label>
                    <div className="flex items-center gap-2">
                        <input type="number" min={0} max={100} id="quizPassingScore" className="border border-gray-300 rounded p-2 w-full" placeholder="Quiz Passing Score" value={formData.quizPassingScore} onChange={(e) => setFormData({...formData, quizPassingScore: e.target.value})} />
                        <p>%</p>
                    </div>
                </div>
            {
                questions.map((item, i) => (
                        <div key={i} className="w-full flex flex-col gap-2 p-4 border border-gray-300 rounded">
                        <h3 className="text-lg font-semibold mb-2">Question {i + 1}</h3>
                        <textarea placeholder={`Question ${i + 1}`} row={2} className="border border-gray-300 rounded p-2 w-full mb-2" onChange={(e) => handleChange(i, 'question', e.target.value)} />
                        <div className="flex gap-2 mb-4">
                            <input type="radio" name={`question${i + 1}`} value="A" className="mr-2" checked={item.correctAnswer === 'A'} onChange={() => handleChange(i, 'correctAnswer', 'A')} />
                            <input type="text" value={item.options.A} placeholder={`Option A`} className="border border-gray-300 rounded p-2 w-full mb-2" onChange={(e) => handleOptionChange(i, 'A', e.target.value)} />
                        </div>
                        <div className="flex gap-2 mb-4">
                            <input type="radio" name={`question${i + 1}`} value="B" className="mr-2" checked={item.correctAnswer === 'B'} onChange={() => handleChange(i, 'correctAnswer', 'B')} />
                            <input type="text" placeholder={`Option B`} value={item.options.B} className="border border-gray-300 rounded p-2 w-full mb-2" onChange={(e) => handleOptionChange(i, 'B', e.target.value)} />
                        </div>
                        <div className="flex gap-2 mb-4">
                            <input type="radio" name={`question${i + 1}`} value="C" className="mr-2" checked={item.correctAnswer === 'C'} onChange={() => handleChange(i, 'correctAnswer', 'C')} />
                            <input type="text" placeholder={`Option C`} value={item.options.C} className="border border-gray-300 rounded p-2 w-full mb-2" onChange={(e) => handleOptionChange(i, 'C', e.target.value)} />
                        </div>
                        <div className="flex gap-2 mb-4">
                            <input type="radio" name={`question${i + 1}`} value="D" className="mr-2" checked={item.correctAnswer === 'D'} onChange={() => handleChange(i, 'correctAnswer', 'D')} />
                            <input type="text" placeholder={`Option D`} value={item.options.D} className="border border-gray-300 rounded p-2 w-full mb-2" onChange={(e) => handleOptionChange(i, 'D', e.target.value)} />
                        </div>
                        
                    </div>
                ))
            }
            <input type="submit" value={`Add Question`} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer" />
            </form>
        </div>
    )
}