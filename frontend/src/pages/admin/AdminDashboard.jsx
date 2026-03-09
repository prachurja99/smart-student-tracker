import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPendingTeachers, approveTeacher, rejectTeacher, getAllUsers } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { Users, GraduationCap, BookOpen, Settings, Check, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [pendingRes, usersRes] = await Promise.all([
        getPendingTeachers(),
        getAllUsers(),
      ]);
      setPendingTeachers(pendingRes.data.pendingTeachers);
      setAllUsers(usersRes.data.users);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveTeacher(id);
      setSuccess('Teacher approved successfully');
      fetchData();
    } catch {
      setError('Failed to approve teacher');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectTeacher(id);
      setSuccess('Teacher rejected');
      fetchData();
    } catch {
      setError('Failed to reject teacher');
    }
  };

  const students = allUsers.filter((u) => u.role === 'student');
  const teachers = allUsers.filter((u) => u.role === 'teacher');

  const statusColor = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
  };

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
            <div className="p-3 rounded-full bg-blue-500">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{allUsers.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-2xl font-bold text-gray-800">{students.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Teachers</p>
              <p className="text-2xl font-bold text-gray-800">{teachers.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-800">{pendingTeachers.length}</p>
            </div>
          </div>
        </div>

        {pendingTeachers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-yellow-500" />
              Pending Teacher Requests
            </h3>
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
                    <td className="py-3 text-gray-500">
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </td>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">All Users</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="py-3 capitalize text-gray-500">{u.role}</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[u.status]}`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/teacher/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition"
              >
                <BookOpen size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Manage Grades</span>
              </Link>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition cursor-pointer">
                <Users size={18} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Manage Users</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition cursor-pointer">
                <Settings size={18} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-700">System Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;