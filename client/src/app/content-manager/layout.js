import ContentManagerNavbar from "@/src/components/ContentManagerNavbar";
import ContentManagerSidebar from "@/src/components/ContentManagerSidebar";

export default function ContentManagerLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen w-full">
            <ContentManagerNavbar />
            <div className="w-full flex h-full top-20">
                <ContentManagerSidebar />
                <div className="block top-20 left-1/6 absolute w-5/6">{children}</div>
            </div>
        </div>
    )
}