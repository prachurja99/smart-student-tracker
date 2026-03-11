import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createGrade, updateGrade, deleteGrade, getGradesByStudent, getStudentAnalytics, getMyStudents, getMLAnalysis } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { SubjectBarChart, GradeTrendChart } from '../../components/dashboard/GradeChart';
import RiskCard from '../../components/dashboard/RiskCard';
import ChatBot from '../../components/dashboard/ChatBot';
import { Plus, Pencil, Trash2, X, Check, Users, BookOpen, TrendingUp, Award, Download } from 'lucide-react';
import { generateStudentReport } from '../../utils/generateReport';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
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
  const [sectionName, setSectionName] = useState('');
  const [mlAnalysis, setMlAnalysis] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [form, setForm] = useState({
    subject: '', score: '', maxScore: '100', term: '', examDate: '', remarks: '',
  });

  const fetchStudents = async () => {
    try {
      const res = await getMyStudents();
      setStudents(res.data.students);
      if (res.data.section) setSectionName(res.data.section.name);
    } catch {
      setError('Failed to load students');
    }
  };

  const fetchGrades = async () => {
    if (!studentId) return;
    setLoading(true);
    setMlLoading(true);
    setError('');
    try {
      const [gradesRes, analyticsRes] = await Promise.all([
        getGradesByStudent(studentId),
        getStudentAnalytics(studentId),
      ]);
      setGrades(gradesRes.data.grades);
      setAnalytics(analyticsRes.data.analytics);
      const mlRes = await getMLAnalysis(studentId);
      setMlAnalysis(mlRes.data);
    } catch {
      setError('Failed to load grades');
    } finally {
      setLoading(false);
      setMlLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { if (studentId) fetchGrades(); }, [studentId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      subject: grade.subject, score: grade.score, maxScore: grade.maxScore,
      term: grade.term, examDate: grade.examDate, remarks: grade.remarks || '',
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

  const handleDownloadReport = () => {
    generateStudentReport(selectedStudent?.name, analytics, mlAnalysis, sectionName, user.name);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
              {sectionName ? `Section: ${sectionName}` : 'No section assigned yet'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {analytics && (
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
              >
                <Download size={16} />
                Download Report
              </button>
            )}
            <button
              onClick={() => { setShowForm(!showForm); setEditingGrade(null); }}
              disabled={!studentId}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus size={16} />
              Add Grade
            </button>
          </div>
        </div>

        {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg mb-4 text-sm">{success}</div>}

        {students.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
            <Users size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No students assigned to your section yet.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Please contact the admin to assign students.</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Student:</label>
              <select
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  const student = students.find((s) => s.id === parseInt(e.target.value));
                  setSelectedStudent(student);
                  setAnalytics(null);
                  setGrades([]);
                  setMlAnalysis(null);
                }}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </select>
              {selectedStudent && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Viewing grades for: <span className="font-medium text-gray-800 dark:text-white">{selectedStudent.name}</span>
                </p>
              )}
            </div>

            {!studentId && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                <Users size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Select a student to view their grades</p>
              </div>
            )}

            {analytics && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                  <StatCard title="Overall Average" value={`${analytics.overallAverage}%`} icon={TrendingUp} color="bg-blue-500" />
                  <StatCard title="Total Grades" value={analytics.totalGrades} icon={BookOpen} color="bg-green-500" />
                  <StatCard title="Best Subject" value={analytics.subjectAverages.reduce((a, b) => a.average > b.average ? a : b).subject} icon={Award} color="bg-yellow-500" />
                  <StatCard title="Subjects" value={analytics.subjectAverages.length} icon={Users} color="bg-purple-500" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <SubjectBarChart data={analytics.subjectAverages} />
                  <GradeTrendChart data={analytics.grades} />
                </div>
                <div className="mb-4 sm:mb-6">
                  <RiskCard analysis={mlAnalysis} loading={mlLoading} />
                </div>
              </>
            )}

            {showForm && studentId && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  {editingGrade ? 'Edit Grade' : `Add New Grade for ${selectedStudent?.name}`}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Subject', name: 'subject', type: 'text', placeholder: 'e.g. Mathematics' },
                    { label: 'Score', name: 'score', type: 'number', placeholder: 'e.g. 85' },
                    { label: 'Max Score', name: 'maxScore', type: 'number', placeholder: 'e.g. 100' },
                    { label: 'Term', name: 'term', type: 'text', placeholder: 'e.g. Term 1' },
                    { label: 'Exam Date', name: 'examDate', type: 'date', placeholder: '' },
                    { label: 'Remarks', name: 'remarks', type: 'text', placeholder: 'Optional remarks' },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                      <input
                        type={type} name={name} value={form[name]} onChange={handleChange}
                        placeholder={placeholder}
                        required={name !== 'remarks'}
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2 lg:col-span-3 flex gap-3 flex-wrap">
                    <button type="submit"
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                      <Check size={16} />
                      {editingGrade ? 'Update Grade' : 'Add Grade'}
                    </button>
                    <button type="button" onClick={() => { setShowForm(false); setEditingGrade(null); }}
                      className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm">
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {studentId && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Grades for {selectedStudent?.name}
                </h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : grades.length === 0 ? (
                  <p className="text-center text-gray-400 dark:text-gray-500 py-8">No grades found for this student.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
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
                          <tr key={grade.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-3 font-medium text-gray-800 dark:text-white">{grade.subject}</td>
                            <td className="py-3">
                              <span className={`font-semibold ${(grade.score / grade.maxScore) * 100 >= 80 ? 'text-green-600' : (grade.score / grade.maxScore) * 100 >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {grade.score}/{grade.maxScore}
                              </span>
                            </td>
                            <td className="py-3 text-gray-500 dark:text-gray-400">{grade.term}</td>
                            <td className="py-3 text-gray-500 dark:text-gray-400">{grade.examDate}</td>
                            <td className="py-3 text-gray-400 dark:text-gray-500 italic">{grade.remarks || '-'}</td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <button onClick={() => handleEdit(grade)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition">
                                  <Pencil size={15} />
                                </button>
                                <button onClick={() => handleDelete(grade.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <ChatBot context={analytics ? {
        selectedStudent: selectedStudent?.name,
        overallAverage: analytics?.overallAverage,
        totalGrades: analytics?.totalGrades,
        subjectAverages: analytics?.subjectAverages,
        riskLevel: mlAnalysis?.riskLevel,
        failingSubjects: mlAnalysis?.failingSubjects,
        suggestions: mlAnalysis?.suggestions,
      } : null} />
    </div>
  );
};

export default TeacherDashboard;