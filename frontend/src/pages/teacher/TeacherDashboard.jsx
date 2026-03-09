import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createGrade, updateGrade, deleteGrade, getGradesByStudent, getStudentAnalytics, getAllStudents } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { SubjectBarChart, GradeTrendChart } from '../../components/dashboard/GradeChart';
import { Plus, Pencil, Trash2, X, Check, Users, BookOpen, TrendingUp, Award } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({
    subject: '',
    score: '',
    maxScore: '100',
    term: '',
    examDate: '',
    remarks: '',
  });

  const fetchStudents = async () => {
    try {
      const res = await getAllStudents();
      setStudents(res.data.students);
    } catch {
      setError('Failed to load students');
    }
  };

  const fetchGrades = async () => {
    if (!studentId) return;
    setLoading(true);
    setError('');
    try {
      const [gradesRes, analyticsRes] = await Promise.all([
        getGradesByStudent(studentId),
        getStudentAnalytics(studentId),
      ]);
      setGrades(gradesRes.data.grades);
      setAnalytics(analyticsRes.data.analytics);
    } catch {
      setError('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (studentId) fetchGrades();
  }, [studentId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingGrade) {
        await updateGrade(editingGrade.id, form);
        setSuccess('Grade updated successfully');
      } else {
        await createGrade({ ...form, studentId });
        setSuccess('Grade added successfully');
      }
      setShowForm(false);
      setEditingGrade(null);
      setForm({ subject: '', score: '', maxScore: '100', term: '', examDate: '', remarks: '' });
      fetchGrades();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setForm({
      subject: grade.subject,
      score: grade.score,
      maxScore: grade.maxScore,
      term: grade.term,
      examDate: grade.examDate,
      remarks: grade.remarks || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grade?')) return;
    try {
      await deleteGrade(id);
      setSuccess('Grade deleted successfully');
      fetchGrades();
    } catch {
      setError('Failed to delete grade');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage student grades and performance</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingGrade(null); }}
            disabled={!studentId}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            Add Grade
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Student:</label>
          <select
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              const student = students.find((s) => s.id === parseInt(e.target.value));
              setSelectedStudent(student);
              setAnalytics(null);
              setGrades([]);
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a student --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
          {selectedStudent && (
            <p className="text-sm text-gray-500 mt-2">
              Viewing grades for: <span className="font-medium text-gray-800">{selectedStudent.name}</span>
            </p>
          )}
        </div>

        {!studentId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Select a student to view their grades</p>
          </div>
        )}

        {analytics && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Overall Average" value={`${analytics.overallAverage}%`} icon={TrendingUp} color="bg-blue-500" />
              <StatCard title="Total Grades" value={analytics.totalGrades} icon={BookOpen} color="bg-green-500" />
              <StatCard title="Best Subject" value={analytics.subjectAverages.reduce((a, b) => a.average > b.average ? a : b).subject} icon={Award} color="bg-yellow-500" />
              <StatCard title="Subjects Tracked" value={analytics.subjectAverages.length} icon={Users} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SubjectBarChart data={analytics.subjectAverages} />
              <GradeTrendChart data={analytics.grades} />
            </div>
          </>
        )}

        {showForm && studentId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingGrade ? 'Edit Grade' : `Add New Grade for ${selectedStudent?.name}`}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Mathematics"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <input
                  type="number"
                  name="score"
                  value={form.score}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 85"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                <input
                  type="number"
                  name="maxScore"
                  value={form.maxScore}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <input
                  type="text"
                  name="term"
                  value={form.term}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Term 1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date</label>
                <input
                  type="date"
                  name="examDate"
                  value={form.examDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <input
                  type="text"
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional remarks"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <Check size={16} />
                  {editingGrade ? 'Update Grade' : 'Add Grade'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingGrade(null); }}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {studentId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Grades for {selectedStudent?.name}
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : grades.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No grades found for this student.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3">Subject</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Term</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Remarks</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-800">{grade.subject}</td>
                      <td className="py-3">
                        <span className={`font-semibold ${(grade.score / grade.maxScore) * 100 >= 80 ? 'text-green-600' : (grade.score / grade.maxScore) * 100 >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {grade.score}/{grade.maxScore}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{grade.term}</td>
                      <td className="py-3 text-gray-500">{grade.examDate}</td>
                      <td className="py-3 text-gray-400 italic">{grade.remarks || '-'}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(grade)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(grade.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;