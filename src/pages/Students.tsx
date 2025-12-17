import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { Trash2, Pencil } from "lucide-react";

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

  // delete popup
  const [showDelete, setShowDelete] = useState(false);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);

  // edit popup
  const [showEdit, setShowEdit] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const loadStudents = async () => {
    const res = await api.get<Student[]>("/students");
    setStudents(res.data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // add
  const addStudent = async () => {
    if (!name || !rollNo) return;

    setLoading(true);
    await api.post("/students", {
      name,
      rollNo: Number(rollNo),
    });
    setName("");
    setRollNo("");
    setLoading(false);
    loadStudents();
  };

  // delete
  const confirmDelete = async () => {
    if (!deleteStudent) return;
    await api.delete(`/students/${deleteStudent._id}`);
    setShowDelete(false);
    setDeleteStudent(null);
    loadStudents();
  };

  // open edit
  const openEdit = (student: Student) => {
    setEditStudent(student);
    setName(student.name);
    setRollNo(String(student.rollNo));
    setShowEdit(true);
  };

  // save edit
  const saveEdit = async () => {
    if (!editStudent) return;

    await api.put(`/students/${editStudent._id}`, {
      name,
      rollNo: Number(rollNo),
    });

    setShowEdit(false);
    setEditStudent(null);
    setName("");
    setRollNo("");
    loadStudents();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6">
        <h2 className="text-2xl font-bold mb-6">Students</h2>

        {/* Add Student */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h3 className="font-semibold mb-4">Add Student</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Student Name"
              className="border rounded-lg px-4 py-2"
              value={name}
              onChange={(e) => {
                const v = e.target.value;
                if (/^[a-zA-Z.\s]*$/.test(v)) setName(v);
              }}
            />

            <input
              placeholder="Roll Number"
              className="border rounded-lg px-4 py-2"
              value={rollNo}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setRollNo(v);
              }}
            />

            <button
              onClick={addStudent}
              disabled={loading}
              className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{s.rollNo}</td>
                  <td className="p-3">{s.name}</td>
                  <td className="p-3 flex gap-3 justify-center">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-blue-600"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteStudent(s);
                        setShowDelete(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EDIT MODAL */}
        {showEdit && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-80">
              <h3 className="font-bold mb-4">Edit Student</h3>

              <input
                className="border rounded px-3 py-2 mb-3 w-full"
                value={name}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^[a-zA-Z.\s]*$/.test(v)) setName(v);
                }}
              />

              <input
                className="border rounded px-3 py-2 mb-4 w-full"
                value={rollNo}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*$/.test(v)) setRollNo(v);
                }}
              />

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowEdit(false)}>Cancel</button>
                <button
                  onClick={saveEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {showDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-80">
              <p className="mb-4">
                Remove <b>{deleteStudent?.name}</b>?
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDelete(false)}>Cancel</button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Students;
