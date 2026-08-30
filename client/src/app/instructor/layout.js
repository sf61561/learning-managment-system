import ContentManagerNavbar from "@/src/components/ContentManagerNavbar";
import ContentManagerSidebar from "@/src/components/ContentManagerSidebar";
import InstructorNavbar from "@/src/components/InstructorNavbar";
import InstructorSidebar from "@/src/components/InstructorSidebar";

export default function InstructorLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen w-full">
            <InstructorNavbar />
            <div className="w-full flex h-full top-20">
                <InstructorSidebar />
                <div className="block top-20 left-1/6 absolute w-5/6">{children}</div>
            </div>
        </div>
    )
}