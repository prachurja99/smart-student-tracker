import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getPendingTeachers, approveTeacher, rejectTeacher, getAllUsers,
  createSection, getAllSections, assignTeacherToSection,
  assignStudentToSection, removeStudentFromSection, promoteToAdmin
} from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { Users, GraduationCap, BookOpen, Clock, Check, X, ShieldCheck, Plus } from 'lucide-react';
import ChatBot from '../../components/dashboard/ChatBot';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [newSectionName, setNewSectionName] = useState('');

  const fetchData = async () => {
    try {
      const [pendingRes, usersRes, sectionsRes] = await Promise.all([
        getPendingTeachers(),
        getAllUsers(),
        getAllSections(),
      ]);
      setPendingTeachers(pendingRes.data.pendingTeachers);
      setAllUsers(usersRes.data.users);
      setSections(sectionsRes.data.sections);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 3000); };

  const handleApprove = async (id) => {
    try { await approveTeacher(id); showSuccess('Teacher approved'); fetchData(); }
    catch { showError('Failed to approve teacher'); }
  };

  const handleReject = async (id) => {
    try { await rejectTeacher(id); showSuccess('Teacher rejected'); fetchData(); }
    catch { showError('Failed to reject teacher'); }
  };

  const handlePromote = async (id, name) => {
    if (!window.confirm(`Promote ${name} to Admin?`)) return;
    try { await promoteToAdmin(id); showSuccess(`${name} promoted to admin`); fetchData(); }
    catch { showError('Failed to promote user'); }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    try {
      await createSection({ name: newSectionName });
      showSuccess('Section created successfully');
      setNewSectionName('');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create section');
    }
  };

  const handleAssignTeacher = async (sectionId, teacherId) => {
    if (!teacherId) return;
    try { await assignTeacherToSection(sectionId, teacherId); showSuccess('Teacher assigned'); fetchData(); }
    catch { showError('Failed to assign teacher'); }
  };

  const handleAssignStudent = async (sectionId, studentId) => {
    if (!studentId) return;
    try { await assignStudentToSection(sectionId, studentId); showSuccess('Student assigned'); fetchData(); }
    catch (err) { showError(err.response?.data?.message || 'Failed to assign student'); }
  };

  const handleRemoveStudent = async (sectionId, studentId) => {
    try { await removeStudentFromSection(sectionId, studentId); showSuccess('Student removed'); fetchData(); }
    catch { showError('Failed to remove student'); }
  };

  const students = allUsers.filter((u) => u.role === 'student');
  const teachers = allUsers.filter((u) => u.role === 'teacher' && u.status === 'active');

  const statusColor = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  const tabs = ['overview', 'sections', 'users', 'pending'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage the entire Smart Student Tracker system</p>
        </div>

        {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg mb-4 text-sm">{success}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-full bg-blue-500"><Users size={20} className="text-white" /></div>
            <div><p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Users</p><p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{allUsers.length}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-full bg-green-500"><GraduationCap size={20} className="text-white" /></div>
            <div><p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Students</p><p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{students.length}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-full bg-yellow-500"><BookOpen size={20} className="text-white" /></div>
            <div><p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Teachers</p><p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{teachers.length}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-full bg-red-500"><Clock size={20} className="text-white" /></div>
            <div><p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending</p><p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{pendingTeachers.length}</p></div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'pending' && pendingTeachers.length > 0
                ? `Pending (${pendingTeachers.length})`
                : tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4">System Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Logged in as</span>
                <span className="font-medium text-gray-800 dark:text-white">{user?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Total Sections</span>
                <span className="font-medium text-gray-800 dark:text-white">{sections.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Database</span>
                <span className="font-medium text-green-600">PostgreSQL + MongoDB</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <span className="font-medium text-green-600">All systems running</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4">Create New Section</h3>
              <form onSubmit={handleCreateSection} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Class 10A, Science Group"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Plus size={16} />
                  Create Section
                </button>
              </form>
            </div>

            {sections.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                <BookOpen size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No sections created yet.</p>
              </div>
            ) : (
              sections.map((section) => (
                <div key={section.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">{section.name}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Teacher: <span className="font-medium text-gray-800 dark:text-white">
                        {section.teacher ? section.teacher.name : 'Not assigned'}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Teacher</label>
                      <select
                        onChange={(e) => handleAssignTeacher(section.id, e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="">-- Select a teacher --</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add Student</label>
                      <select
                        onChange={(e) => handleAssignStudent(section.id, e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="">-- Select a student --</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Students in this section ({section.students?.length || 0})
                    </p>
                    {section.students?.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">No students assigned yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {section.students?.map((s) => (
                          <div key={s.id} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full px-3 py-1">
                            <span className="text-sm text-blue-700 dark:text-blue-300">{s.name}</span>
                            <button
                              onClick={() => handleRemoveStudent(section.id, s.id)}
                              className="text-blue-400 hover:text-red-500 transition"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4">All Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 font-medium text-gray-800 dark:text-white">{u.name}</td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="py-3 capitalize text-gray-500 dark:text-gray-400">{u.role}</td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[u.status]}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {u.role !== 'admin' && u.id !== user.id && (
                          <button
                            onClick={() => handlePromote(u.id, u.name)}
                            className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-purple-700 transition"
                          >
                            <ShieldCheck size={13} />
                            Promote
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-4">Pending Teacher Requests</h3>
            {pendingTeachers.length === 0 ? (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8">No pending requests.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Requested On</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTeachers.map((teacher) => (
                      <tr key={teacher.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 font-medium text-gray-800 dark:text-white">{teacher.name}</td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">{teacher.email}</td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">{new Date(teacher.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(teacher.id)}
                              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition"
                            >
                              <Check size={13} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(teacher.id)}
                              className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-600 transition"
                            >
                              <X size={13} />
                              Reject
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
      </div>

      <ChatBot context={{
        role: 'admin',
        totalUsers: allUsers.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalSections: sections.length,
        pendingTeachers: pendingTeachers.length,
      }} />
    </div>
  );
};

export default AdminDashboard;