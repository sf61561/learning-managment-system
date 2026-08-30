
import StudentNavbar from "@/src/components/StudentNavbar";
import StudentSidebar from "@/src/components/StudentSidebar";

const StudentLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
        <StudentNavbar />
        <div className="w-full flex h-full top-20">
          <StudentSidebar />
          <div className="block w-5/6 top-20 left-1/6 absolute">{children}</div>
        </div>
    </div>
  )
}

export default StudentLayout;