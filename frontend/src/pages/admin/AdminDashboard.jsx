import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getPendingTeachers, approveTeacher, rejectTeacher, getAllUsers,
  createSection, getAllSections, assignTeacherToSection,
  assignStudentToSection, removeStudentFromSection, promoteToAdmin
} from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { Users, GraduationCap, BookOpen, Clock, Check, X, ShieldCheck, Trash2, Plus } from 'lucide-react';

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
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const tabs = ['overview', 'sections', 'users', 'pending'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage the entire Smart Student Tracker system</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{success}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500"><Users size={24} className="text-white" /></div>
            <div><p className="text-sm text-gray-500">Total Users</p><p className="text-2xl font-bold text-gray-800">{allUsers.length}</p></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500"><GraduationCap size={24} className="text-white" /></div>
            <div><p className="text-sm text-gray-500">Students</p><p className="text-2xl font-bold text-gray-800">{students.length}</p></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500"><BookOpen size={24} className="text-white" /></div>
            <div><p className="text-sm text-gray-500">Teachers</p><p className="text-2xl font-bold text-gray-800">{teachers.length}</p></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500"><Clock size={24} className="text-white" /></div>
            <div><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-gray-800">{pendingTeachers.length}</p></div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab === 'pending' && pendingTeachers.length > 0
                ? `Pending (${pendingTeachers.length})`
                : tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">System Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Logged in as</span>
                <span className="font-medium text-gray-800">{user?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Total Sections</span>
                <span className="font-medium text-gray-800">{sections.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Database</span>
                <span className="font-medium text-green-600">PostgreSQL + MongoDB</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-green-600">All systems running</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Section</h3>
              <form onSubmit={handleCreateSection} className="flex gap-3">
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Class 10A, Science Group"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Plus size={16} />
                  Create Section
                </button>
              </form>
            </div>

            {sections.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No sections created yet.</p>
              </div>
            ) : (
              sections.map((section) => (
                <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{section.name}</h3>
                    <span className="text-sm text-gray-500">
                      Teacher: <span className="font-medium text-gray-800">
                        {section.teacher ? section.teacher.name : 'Not assigned'}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assign Teacher</label>
                      <select
                        onChange={(e) => handleAssignTeacher(section.id, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="">-- Select a teacher --</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Add Student</label>
                      <select
                        onChange={(e) => handleAssignStudent(section.id, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Students in this section ({section.students?.length || 0})
                    </p>
                    {section.students?.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No students assigned yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {section.students?.map((s) => (
                          <div key={s.id} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                            <span className="text-sm text-blue-700">{s.name}</span>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">All Users</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="py-3 text-gray-500">{u.email}</td>
                    <td className="py-3 capitalize text-gray-500">{u.role}</td>
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
                          Promote to Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Teacher Requests</h3>
            {pendingTeachers.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No pending requests.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Requested On</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTeachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-800">{teacher.name}</td>
                      <td className="py-3 text-gray-500">{teacher.email}</td>
                      <td className="py-3 text-gray-500">{new Date(teacher.createdAt).toLocaleDateString()}</td>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;