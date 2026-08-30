import AdminNavbar from "@/src/components/AdminNavbar";
import AdminSidebar from "@/src/components/AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
        <AdminNavbar />
        <div className="w-full flex h-full top-20">
          <AdminSidebar />
          <div className="block w-5/6 top-20 left-1/6 absolute">{children}</div>
        </div>
    </div>
  )
}

export default AdminLayout;