from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

def analyze_student(grades):
    if not grades:
        return {
            'riskLevel': 'unknown',
            'riskScore': 0,
            'message': 'No grades available to analyze',
            'suggestions': []
        }

    scores = []
    for grade in grades:
        percentage = (grade['score'] / grade['maxScore']) * 100
        scores.append(percentage)

    overall_average = np.mean(scores)
    latest_scores = scores[-3:] if len(scores) >= 3 else scores
    trend = 0
    if len(latest_scores) >= 2:
        trend = latest_scores[-1] - latest_scores[0]

    subjects = {}
    for grade in grades:
        subject = grade['subject']
        percentage = (grade['score'] / grade['maxScore']) * 100
        if subject not in subjects:
            subjects[subject] = []
        subjects[subject].append(percentage)

    subject_averages = {s: np.mean(v) for s, v in subjects.items()}
    failing_subjects = [s for s, avg in subject_averages.items() if avg < 60]
    failing_count = len(failing_subjects)

    risk_score = 0

    if overall_average >= 80:
        risk_score += 0
    elif overall_average >= 60:
        risk_score += 30
    else:
        risk_score += 60

    if trend > 5:
        risk_score -= 10
    elif trend < -5:
        risk_score += 20

    risk_score += failing_count * 15

    risk_score = max(0, min(100, risk_score))

    if risk_score <= 30:
        risk_level = 'green'
        message = 'Student is performing well and on track.'
    elif risk_score <= 60:
        risk_level = 'yellow'
        message = 'Student needs attention in some areas.'
    else:
        risk_level = 'red'
        message = 'Student is at serious risk of falling behind.'

    suggestions = []

    if overall_average < 60:
        suggestions.append('Overall performance is below passing grade. Immediate intervention needed.')
    elif overall_average < 80:
        suggestions.append('Performance is average. Encourage more consistent study habits.')

    if failing_subjects:
        suggestions.append(f'Struggling in: {", ".join(failing_subjects)}. Consider extra support.')

    if trend < -5:
        suggestions.append('Grades are declining recently. Check for personal or academic issues.')
    elif trend > 5:
        suggestions.append('Grades are improving. Keep up the good work!')

    if not suggestions:
        suggestions.append('Student is doing great. Keep encouraging them!')

    best_subject = max(subject_averages, key=subject_averages.get) if subject_averages else None
    worst_subject = min(subject_averages, key=subject_averages.get) if subject_averages else None

    return {
        'riskLevel': risk_level,
        'riskScore': round(risk_score, 2),
        'message': message,
        'overallAverage': round(overall_average, 2),
        'trend': round(trend, 2),
        'failingSubjects': failing_subjects,
        'bestSubject': best_subject,
        'worstSubject': worst_subject,
        'suggestions': suggestions,
        'subjectAverages': {s: round(v, 2) for s, v in subject_averages.items()}
    }


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML service is running'})


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()

        if not data or 'grades' not in data:
            return jsonify({'error': 'grades field is required'}), 400

        grades = data['grades']
        result = analyze_student(grades)

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)