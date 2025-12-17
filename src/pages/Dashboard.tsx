import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Users, ClipboardCheck, BarChart3 } from "lucide-react";

const Dashboard = () => {
  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Student Attendance Management System
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Students */}
        <Link
          to="/students"
          className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-xl">
              <Users className="text-blue-600" size={30} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Students
              </h2>
              <p className="text-sm text-gray-500">
                Add and manage students
              </p>
            </div>
          </div>
        </Link>

        {/* Attendance */}
        <Link
          to="/attendance"
          className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-xl">
              <ClipboardCheck className="text-green-600" size={30} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Attendance
              </h2>
              <p className="text-sm text-gray-500">
                Mark daily attendance
              </p>
            </div>
          </div>
        </Link>

        {/* Reports */}
        <Link
          to="/reports"
          className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-xl">
              <BarChart3 className="text-purple-600" size={30} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Reports
              </h2>
              <p className="text-sm text-gray-500">
                View attendance reports
              </p>
            </div>
          </div>
        </Link>

      </div>
    </Layout>
  );
};

export default Dashboard;
