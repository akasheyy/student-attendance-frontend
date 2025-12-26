import { useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  BarChart3, 
  Download, 
  Search, 
  CalendarDays, 
  Filter, 
  ArrowUpRight 
} from "lucide-react";

interface MonthlyReportData {
  rollNo: number;
  name: string;
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

const MonthlyReport = () => {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [data, setData] = useState<MonthlyReportData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    if (!month || !year) {
      alert("Please select both month and year");
      return;
    }

    try {
      setLoading(true);
      const res = await api.get<MonthlyReportData[]>(
        `/attendance/monthly?month=${month}&year=${year}`
      );
      setData(res.data);
    } catch (err) {
      alert("Failed to load monthly report");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Monthly Attendance Summary", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    const monthName = new Date(0, parseInt(month) - 1).toLocaleString("default", { month: "long" });
    doc.text(`Period: ${monthName} ${year}`, 14, 22);

    const tableData = data.map((r) => [
      r.rollNo,
      r.name,
      r.present,
      r.absent,
      r.total,
      `${r.percentage}%`,
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Roll No", "Student Name", "Present", "Absent", "Total Days", "Percentage"]],
      body: tableData,
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: { 5: { fontStyle: 'bold' } }
    });

    doc.save(`Monthly_Attendance_${month}_${year}.pdf`);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="text-blue-600" size={32} />
              Performance Reports
            </h1>
            <p className="text-gray-500">Track monthly attendance consistency and trends.</p>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700 outline-none appearance-none"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  placeholder="Year"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700 outline-none"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={loadReport}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-100"
              >
                Generate
              </button>
              {data.length > 0 && (
                <button
                  onClick={downloadPDF}
                  className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                  title="Download PDF"
                >
                  <Download size={22} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Analyzing records...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-20 text-center px-6">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">No report generated</h3>
              <p className="text-gray-500 text-sm">Select a month and year to view the monthly summary.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Present</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Absent</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Total</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((r, i) => (
                    <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{r.name}</span>
                          <span className="text-[10px] font-mono text-gray-400">ROLL #{r.rollNo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">{r.present}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-red-500 font-semibold">{r.absent}</td>
                      <td className="px-6 py-4 text-center text-gray-500">{r.total}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${r.percentage < 75 ? 'text-red-500' : 'text-blue-600'}`}>
                              {r.percentage}%
                            </span>
                            <ArrowUpRight size={14} className={r.percentage < 75 ? 'text-red-300' : 'text-blue-300'} />
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${r.percentage < 75 ? 'bg-red-500' : 'bg-blue-600'}`}
                              style={{ width: `${r.percentage}%` }}
                            />
                          </div>
                        </div>
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

export default MonthlyReport;