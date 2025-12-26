import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { Trash2, Pencil, UserPlus, Search, GraduationCap, X, AlertCircle } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  rollNo: number;
}

const Students = () => {
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const loadStudents = async () => {
    try {
      const res = await api.get<Student[]>("/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const addStudent = async () => {
    if (!name || !rollNo) return;
    setLoading(true);
    await api.post("/students", { name, rollNo: Number(rollNo) });
    setName("");
    setRollNo("");
    setLoading(false);
    loadStudents();
  };

  const confirmDelete = async () => {
    if (!deleteStudent) return;
    await api.delete(`/students/${deleteStudent._id}`);
    setShowDelete(false);
    setDeleteStudent(null);
    loadStudents();
  };

  const openEdit = (student: Student) => {
    setEditStudent(student);
    setName(student.name);
    setRollNo(String(student.rollNo));
    setShowEdit(true);
  };

  const saveEdit = async () => {
    if (!editStudent) return;
    await api.put(`/students/${editStudent._id}`, { name, rollNo: Number(rollNo) });
    closeModals();
    loadStudents();
  };

  const closeModals = () => {
    setShowEdit(false);
    setShowDelete(false);
    setEditStudent(null);
    setDeleteStudent(null);
    setName("");
    setRollNo("");
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNo.toString().includes(searchTerm)
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <GraduationCap className="text-blue-600" size={32} />
              Student Directory
            </h1>
            <p className="text-gray-500">Manage and organize your class roster effortlessly.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search students..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Student Sidebar Style Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-gray-800">
                <UserPlus size={20} className="text-blue-600" />
                <h3 className="font-bold text-lg">Register New Student</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Full Name</label>
                  <input
                    placeholder="e.g. John Doe"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none transition-colors"
                    value={name}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^[a-zA-Z.\s]*$/.test(v)) setName(v);
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Roll Number</label>
                  <input
                    placeholder="e.g. 101"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none transition-colors"
                    value={rollNo}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d*$/.test(v)) setRollNo(v);
                    }}
                  />
                </div>

                <button
                  onClick={addStudent}
                  disabled={loading || !name || !rollNo}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                >
                  {loading ? "Registering..." : "Add student"}
                </button>
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll No</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <tr key={s._id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 text-gray-700 font-mono font-bold px-3 py-1 rounded-lg text-sm group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                            #{s.rollNo}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{s.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => openEdit(s)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteStudent(s);
                                setShowDelete(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODALS */}
        {(showEdit || showDelete) && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
              
              {showEdit ? (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Edit Profile</h3>
                    <button onClick={closeModals} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                  </div>
                  <div className="space-y-4">
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name"
                    />
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="Roll Number"
                    />
                    <button
                      onClick={saveEdit}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100"
                    >
                      Update Student
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Student?</h3>
                  <p className="text-gray-500 mb-8">Are you sure you want to remove <span className="font-bold text-gray-800">{deleteStudent?.name}</span>? This action cannot be undone.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={closeModals} className="py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                    <button onClick={confirmDelete} className="py-3 font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all">Delete</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Students;