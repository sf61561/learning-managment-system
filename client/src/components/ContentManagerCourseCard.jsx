import Link from "next/link";

export default function ContentManagerCourseCard({ course }) {
    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
            <img
                src={`${process.env.NEXT_PUBLIC_STRAPI_URL.split('/api')[0]}${course.thumbnail?.url}`}
                alt={course.title}
                width={500}
                height={300}
                className="w-full h-48 object-fill"
            />
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-2" title={course?.title}>{course?.title}</h2>
                <p className="text-gray-600 mb-2 h-25 line-clamp-4" title={course?.description}>{course?.description}</p>
                <p className="text-gray-800 font-semibold line-clamp-1">Category: {course?.category?.name}</p>
                <p className="text-gray-800 font-semibold line-clamp-1">Instructor: {course?.instructor[0]?.full_name}</p>
            </div>
            <button className="py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition w-full"><Link href={`/content-manager/courses/${course?.documentId}`}>View Details</Link></button>
        </div>
    );
}