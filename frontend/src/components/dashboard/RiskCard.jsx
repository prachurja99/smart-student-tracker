const riskConfig = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    badge: 'bg-green-500',
    text: 'text-green-700',
    label: 'Low Risk',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    badge: 'bg-yellow-500',
    text: 'text-yellow-700',
    label: 'Needs Attention',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    badge: 'bg-red-500',
    text: 'text-red-700',
    label: 'At Risk',
  },
  unknown: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    badge: 'bg-gray-400',
    text: 'text-gray-600',
    label: 'Unknown',
  },
};

const RiskCard = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ML Risk Analysis</h3>
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const config = riskConfig[analysis.riskLevel] || riskConfig.unknown;

  return (
    <div className={`rounded-xl shadow-sm border p-6 ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">ML Risk Analysis</h3>
        <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${config.badge}`}>
          {config.label}
        </span>
      </div>

      <p className={`text-sm font-medium mb-4 ${config.text}`}>{analysis.message}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Risk Score</p>
          <p className={`text-xl font-bold ${config.text}`}>{analysis.riskScore}/100</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Overall Average</p>
          <p className="text-xl font-bold text-gray-800">{analysis.overallAverage}%</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Best Subject</p>
          <p className="text-sm font-semibold text-green-600">{analysis.bestSubject || 'N/A'}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Worst Subject</p>
          <p className="text-sm font-semibold text-red-500">{analysis.worstSubject || 'N/A'}</p>
        </div>
      </div>

      {analysis.failingSubjects?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Failing Subjects</p>
          <div className="flex flex-wrap gap-2">
            {analysis.failingSubjects.map((s) => (
              <span key={s} className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.suggestions?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Suggestions</p>
          <ul className="space-y-1">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className={`text-xs ${config.text} flex items-start gap-1`}>
                <span className="mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RiskCard;