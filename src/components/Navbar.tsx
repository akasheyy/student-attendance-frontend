import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, Users, ClipboardCheck, FileBarChart, LogOut, Calendar } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for a modern "sticky" feel
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const user = localStorage.getItem("user");
  const admin = user ? JSON.parse(user) : null;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Students", path: "/students", icon: <Users size={18} /> },
    { name: "Attendance", path: "/attendance", icon: <ClipboardCheck size={18} /> },
    { name: "Reports", path: "/reports", icon: <FileBarChart size={18} /> },
    { name: "Monthly", path: "/reports/monthly", icon: <Calendar size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Navbar */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 py-3 flex justify-between items-center ${
          scrolled 
            ? "bg-white/80 backdrop-blur-md shadow-lg text-gray-800 py-2" 
            : "bg-blue-600 text-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${scrolled ? "bg-blue-600 text-white" : "bg-white text-blue-600"}`}>
            <ClipboardCheck size={24} />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Attend<span className={scrolled ? "text-blue-600" : "text-blue-200"}>Ease</span>
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                isActive(link.path)
                  ? (scrolled ? "bg-blue-50 text-blue-600" : "bg-white/20 text-white")
                  : (scrolled ? "hover:bg-gray-100 text-gray-600" : "hover:bg-white/10 text-white/90")
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}

          <div className="h-6 w-[1px] bg-gray-300/50 mx-2" />

          {admin && (
            <div className="flex flex-col items-end mr-4">
              <span className={`text-[10px] uppercase font-bold ${scrolled ? "text-blue-600" : "text-blue-200"}`}>Administrator</span>
              <span className="text-sm font-semibold">{admin.name}</span>
            </div>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-md transition-transform active:scale-95"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(true)}
          className={`md:hidden p-2 rounded-lg ${scrolled ? "bg-gray-100" : "bg-white/10"}`}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="h-16"></div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <span className="font-bold text-xl text-blue-600">Menu</span>
          <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col p-4 gap-2">
          {admin && (
            <div className="mb-4 p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {admin.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase">Welcome</p>
                <p className="text-gray-800 font-semibold">{admin.name}</p>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                isActive(link.path) ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}

          <button
            onClick={logout}
            className="mt-6 flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;