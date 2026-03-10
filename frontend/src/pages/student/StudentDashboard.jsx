import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getGradeAnalytics, getMySection, getMyMLAnalysis } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import { SubjectBarChart, GradeTrendChart, SubjectPieChart } from '../../components/dashboard/GradeChart';
import RiskCard from '../../components/dashboard/RiskCard';
import { TrendingUp, BookOpen, Award, BarChart2 } from 'lucide-react';

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

const StudentDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [section, setSection] = useState(null);
  const [mlAnalysis, setMlAnalysis] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getGradeAnalytics(user.id),
      getMySection(),
    ])
      .then(([analyticsRes, sectionRes]) => {
        setAnalytics(analyticsRes.data.analytics);
        setSection(sectionRes.data.section);

        if (analyticsRes.data.analytics) {
          setMlLoading(true);
          getMyMLAnalysis()
            .then((mlRes) => setMlAnalysis(mlRes.data))
            .catch(() => setMlAnalysis(null))
            .finally(() => setMlLoading(false));
        }
      })
      .catch(() => setError('Failed to load your data'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-500 mt-1">Here is your academic performance overview</p>
          {section ? (
            <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <span className="text-sm text-blue-700 font-medium">Section: {section.name}</span>
              {section.teacher && (
                <span className="text-sm text-blue-500">| Teacher: {section.teacher.name}</span>
              )}
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
              <span className="text-sm text-yellow-700">Not assigned to any section yet</span>
            </div>
          )}
        </div>

        {!analytics ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No grades recorded yet.</p>
            <p className="text-gray-400 text-sm mt-1">Your teacher will add your grades soon.</p>
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Grades</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3">Subject</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Term</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.grades.map((grade) => (
                      <tr key={grade.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-800">{grade.subject}</td>
                        <td className="py-3">
                          <span className={`font-semibold ${(grade.score / grade.maxScore) * 100 >= 80 ? 'text-green-600' : (grade.score / grade.maxScore) * 100 >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {grade.score}/{grade.maxScore}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">{grade.term}</td>
                        <td className="py-3 text-gray-500">{grade.examDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;