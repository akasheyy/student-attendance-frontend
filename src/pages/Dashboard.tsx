import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import {
  Users,
  ClipboardCheck,
  BarChart3,
  ArrowUpRight,
  UserPlus,
  CalendarDays,
  CheckCircle2
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayPercentage: 0,
    monthlyAvg: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(() => console.error("Failed to load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: <Users size={20} />,
      bg: "bg-blue-50",
      text: "text-blue-600"
    },
    {
      label: "Today's Attendance",
      value: `${stats.todayPercentage}%`,
      icon: <CheckCircle2 size={20} />,
      bg: "bg-green-50",
      text: "text-green-600"
    },
    {
      label: "Monthly Average",
      value: `${stats.monthlyAvg}%`,
      icon: <BarChart3 size={20} />,
      bg: "bg-purple-50",
      text: "text-purple-600"
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">
              Welcome back! 👋
            </h1>
            <p className="text-gray-500 mt-1 text-lg">
              Here's what's happening with your students today.
            </p>
          </div>

          <Link
            to="/attendance"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg active:scale-95"
          >
            <CalendarDays size={20} />
            Take Attendance
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {loading ? "—" : stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.text}`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Main Modules
        </h2>

        {/* Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Students */}
          <Link
            to="/students"
            className="group bg-white rounded-3xl p-8 border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all"
          >
            <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Students</h3>
            <p className="text-gray-500 mb-6">
              Add, edit and manage student records.
            </p>
            <div className="flex items-center text-blue-600 font-semibold gap-1">
              Manage Students <ArrowUpRight size={18} />
            </div>
          </Link>

          {/* Attendance */}
          <Link
            to="/attendance"
            className="group bg-white rounded-3xl p-8 border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all"
          >
            <div className="bg-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6">
              <ClipboardCheck size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Attendance</h3>
            <p className="text-gray-500 mb-6">
              Mark and edit daily attendance.
            </p>
            <div className="flex items-center text-emerald-600 font-semibold gap-1">
              Open Register <ArrowUpRight size={18} />
            </div>
          </Link>

          {/* Reports */}
          <Link
            to="/reports"
            className="group bg-white rounded-3xl p-8 border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all"
          >
            <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6">
              <BarChart3 size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Reports</h3>
            <p className="text-gray-500 mb-6">
              View daily and monthly analytics.
            </p>
            <div className="flex items-center text-indigo-600 font-semibold gap-1">
              View Reports <ArrowUpRight size={18} />
            </div>
          </Link>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gray-900 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">
              Need to add a new student?
            </h3>
            <p className="text-gray-400">
              Add students instantly from the dashboard.
            </p>
          </div>
          <Link
            to="/students"
            className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
          >
            <UserPlus size={20} />
            Add Student
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
