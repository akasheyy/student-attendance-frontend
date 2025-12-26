import { useState, useMemo } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon, 
  Search, 
  PieChart,
  UserCheck,
  UserX
} from "lucide-react";

interface Report {
  _id: string;
  status: "present" | "absent";
  student: {
    name: string;
    rollNo?: string | number;
  };
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDailyReport = async (selectedDate: string) => {
    setDate(selectedDate);
    if (!selectedDate) {
      setReports([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get<Report[]>(`/attendance/daily?date=${selectedDate}`);
      setReports(res.data);
    } catch (err) {
      console.error("Failed to load daily report");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Analytics derived from the report data
  const stats = useMemo(() => {
    if (reports.length === 0) return { present: 0, absent: 0, percent: 0 };
    const present = reports.filter(r => r.status === "present").length;
    const absent = reports.length - present;
    const percent = Math.round((present / reports.length) * 100);
    return { present, absent, percent };
  }, [reports]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text("Daily Attendance Report", 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(`Report Date: ${date}`, 14, 27);

    const tableData = reports.map((r, i) => [
      i + 1,
      r.student.rollNo ?? "-",
      r.student.name,
      r.status.toUpperCase(),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [["#", "Roll No", "Student Name", "Status"]],
      body: tableData,
      headStyles: { fillColor: [37, 99, 235], fontSize: 11, halign: 'center' },
      columnStyles: { 
        0: { halign: 'center' }, 
        1: { halign: 'center' },
        3: { fontStyle: 'bold', halign: 'center' } 
      },
    });

    doc.save(`Attendance_Report_${date}.pdf`);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Section: Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="text-blue-600" size={32} />
              Daily Reports
            </h1>
            <p className="text-gray-500 mt-1">Review and export detailed attendance records.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
              <input
                type="date"
                className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700 outline-none w-full sm:w-auto"
                value={date}
                onChange={(e) => loadDailyReport(e.target.value)}
              />
            </div>

            {reports.length > 0 && (
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95"
              >
                <Download size={18} />
                Export PDF
              </button>
            )}
          </div>
        </div>

        {/* Analytics Summary */}
        {reports.length > 0 && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <PieChart size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Attendance %</p>
                <p className="text-2xl font-black text-gray-800">{stats.percent}%</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <UserCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Present</p>
                <p className="text-2xl font-black text-emerald-600">{stats.present}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                <UserX size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Absent</p>
                <p className="text-2xl font-black text-red-600">{stats.absent}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="font-medium">Fetching report data...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <Search size={48} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">No records found</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                {date ? `No attendance was marked for ${date}.` : "Please select a date to view the attendance report."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Roll No</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Student Name</th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reports.map((r, index) => (
                    <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <span className="font-mono font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
                          #{r.student.rollNo ?? "--"}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="font-bold text-gray-800">{r.student.name}</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${
                          r.status === "present" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-red-100 text-red-700"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${r.status === "present" ? "bg-emerald-500" : "bg-red-500"}`}></div>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;