import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const user = localStorage.getItem("user");
  const admin = user ? JSON.parse(user) : null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Student Attendance
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link to="/students" className="hover:underline">
            Students
          </Link>
          <Link to="/attendance" className="hover:underline">
            Attendance
          </Link>
          <Link to="/reports" className="hover:underline">
            Reports
          </Link>
<Link to="/reports/monthly" className="hover:underline">
  Monthly Report
</Link>

          {admin && (
            <span className="bg-blue-500 px-3 py-1 rounded-full text-sm">
              Welcome, {admin.name}
            </span>
          )}

          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden"
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col p-4 gap-4 text-gray-700">
          {admin && (
            <div className="text-sm bg-gray-100 px-3 py-2 rounded">
              Welcome, <b>{admin.name}</b>
            </div>
          )}

          <Link to="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link to="/students" onClick={() => setOpen(false)}>
            Students
          </Link>
          <Link to="/attendance" onClick={() => setOpen(false)}>
            Attendance
          </Link>
          <Link to="/reports" onClick={() => setOpen(false)}>
            Reports
          </Link>
           <Link to="/reports/monthly" className="hover:underline">
            Monthly Report
           </Link>

          <button
            onClick={logout}
            className="mt-4 bg-red-500 text-white py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
