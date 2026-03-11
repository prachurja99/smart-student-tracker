import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getGradeAnalytics, getMySection, getMyMLAnalysis } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { SubjectBarChart, GradeTrendChart, SubjectPieChart } from '../../components/dashboard/GradeChart';
import RiskCard from '../../components/dashboard/RiskCard';
import ChatBot from '../../components/dashboard/ChatBot';
import { TrendingUp, BookOpen, Award, BarChart2, Download } from 'lucide-react';
import { generateStudentReport } from '../../utils/generateReport';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [section, setSection] = useState(null);
  const [mlAnalysis, setMlAnalysis] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllData = async () => {
    try {
      const [analyticsRes, sectionRes] = await Promise.all([
        getGradeAnalytics(user.id),
        getMySection(),
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setSection(sectionRes.data.section);

      if (analyticsRes.data.analytics) {
        setMlLoading(true);
        getMyMLAnalysis()
          .then((mlRes) => setMlAnalysis(mlRes.data))
          .catch(() => setMlAnalysis(null))
          .finally(() => setMlLoading(false));
      }
    } catch {
      setError('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  useEffect(() => {
    const handleGradeUpdated = () => fetchAllData();
    window.addEventListener('gradeUpdated', handleGradeUpdated);
    const interval = setInterval(() => fetchAllData(), 30000);
    return () => {
      window.removeEventListener('gradeUpdated', handleGradeUpdated);
      clearInterval(interval);
    };
  }, []);

  const handleDownloadReport = () => {
    generateStudentReport(
      user.name,
      analytics,
      mlAnalysis,
      section?.name,
      section?.teacher?.name
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Here is your academic performance overview</p>
            {section ? (
              <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2">
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Section: {section.name}</span>
                {section.teacher && (
                  <span className="text-sm text-blue-500 dark:text-blue-400">| Teacher: {section.teacher.name}</span>
                )}
              </div>
            ) : (
              <div className="mt-3 inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg px-4 py-2">
                <span className="text-sm text-yellow-700 dark:text-yellow-300">Not assigned to any section yet</span>
              </div>
            )}
          </div>
          {analytics && (
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Download size={18} />
              Download Report
            </button>
          )}
        </div>

        {!analytics ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
            <BookOpen size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No grades recorded yet.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Your teacher will add your grades soon.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Overall Average" value={`${analytics.overallAverage}%`} icon={TrendingUp} color="bg-blue-500" />
              <StatCard title="Total Grades" value={analytics.totalGrades} icon={BookOpen} color="bg-green-500" />
              <StatCard title="Best Subject" value={analytics.subjectAverages.reduce((a, b) => a.average > b.average ? a : b).subject} icon={Award} color="bg-yellow-500" />
              <StatCard title="Subjects Tracked" value={analytics.subjectAverages.length} icon={BarChart2} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SubjectBarChart data={analytics.subjectAverages} />
              <GradeTrendChart data={analytics.grades} />
            </div>

            <div className="mb-6">
              <RiskCard analysis={mlAnalysis} loading={mlLoading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SubjectPieChart data={analytics.subjectAverages} />
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Grades</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                      <th className="pb-3">Subject</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Term</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.grades.map((grade) => (
                      <tr key={grade.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 font-medium text-gray-800 dark:text-white">{grade.subject}</td>
                        <td className="py-3">
                          <span className={`font-semibold ${(grade.score / grade.maxScore) * 100 >= 80 ? 'text-green-600' : (grade.score / grade.maxScore) * 100 >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {grade.score}/{grade.maxScore}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">{grade.term}</td>
                        <td className="py-3 text-gray-500 dark:text-gray-400">{grade.examDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      <ChatBot context={analytics ? {
        overallAverage: analytics.overallAverage,
        totalGrades: analytics.totalGrades,
        subjectAverages: analytics.subjectAverages,
        riskLevel: mlAnalysis?.riskLevel,
        failingSubjects: mlAnalysis?.failingSubjects,
        suggestions: mlAnalysis?.suggestions,
      } : null} />
    </div>
  );
};

export default StudentDashboard;