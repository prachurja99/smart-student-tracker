import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateStudentReport = (studentName, analytics, mlAnalysis, sectionName, teacherName) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Header background
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Student Tracker', 14, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Academic Performance Report', 14, 25);
  doc.text(`Generated: ${today}`, 14, 33);

  // Student Info Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', 14, 52);

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(14, 54, pageWidth - 14, 54);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student Name: ${studentName}`, 14, 63);
  doc.text(`Section: ${sectionName || 'Not assigned'}`, 14, 71);
  doc.text(`Teacher: ${teacherName || 'Not assigned'}`, 14, 79);

  // Performance Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Summary', 14, 95);
  doc.line(14, 97, pageWidth - 14, 97);

  if (analytics) {
    const riskColor = mlAnalysis?.riskLevel === 'green' ? [22, 163, 74] :
                      mlAnalysis?.riskLevel === 'yellow' ? [202, 138, 4] :
                      mlAnalysis?.riskLevel === 'red' ? [220, 38, 38] : [107, 114, 128];

    // Stat boxes
    const boxY = 103;
    const boxHeight = 20;
    const boxWidth = 42;
    const gap = 4;

    const stats = [
      { label: 'Overall Average', value: `${analytics.overallAverage}%` },
      { label: 'Total Grades', value: `${analytics.totalGrades}` },
      { label: 'Subjects Tracked', value: `${analytics.subjectAverages.length}` },
      { label: 'Risk Level', value: mlAnalysis?.riskLevel?.toUpperCase() || 'N/A' },
    ];

    stats.forEach((stat, i) => {
      const x = 14 + i * (boxWidth + gap);
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(x, boxY, boxWidth, boxHeight, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, x + boxWidth / 2, boxY + 7, { align: 'center' });
      doc.setFontSize(11);
      if (stat.label === 'Risk Level') {
        doc.setTextColor(...riskColor);
      } else {
        doc.setTextColor(31, 41, 55);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(stat.value, x + boxWidth / 2, boxY + 15, { align: 'center' });
    });

    // Subject Performance Table
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Subject Performance', 14, 135);
    doc.setDrawColor(37, 99, 235);
    doc.line(14, 137, pageWidth - 14, 137);

    autoTable(doc, {
      startY: 142,
      head: [['Subject', 'Average Score', 'Status']],
      body: analytics.subjectAverages.map((s) => [
        s.subject,
        `${s.average}%`,
        s.average >= 80 ? 'Excellent' : s.average >= 60 ? 'Average' : 'Needs Improvement',
      ]),
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [243, 244, 246] },
      styles: { fontSize: 10 },
    });

    // Grade Details Table
    const afterSubjectTable = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Grade Details', 14, afterSubjectTable);
    doc.line(14, afterSubjectTable + 2, pageWidth - 14, afterSubjectTable + 2);

    autoTable(doc, {
      startY: afterSubjectTable + 7,
      head: [['Subject', 'Score', 'Max Score', 'Percentage', 'Term', 'Date']],
      body: analytics.grades.map((g) => [
        g.subject,
        g.score,
        g.maxScore,
        `${Math.round((g.score / g.maxScore) * 100)}%`,
        g.term,
        g.examDate,
      ]),
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [243, 244, 246] },
      styles: { fontSize: 9 },
    });

    // ML Suggestions
    if (mlAnalysis?.suggestions?.length > 0) {
      const afterGradeTable = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('AI Recommendations', 14, afterGradeTable);
      doc.setDrawColor(37, 99, 235);
      doc.line(14, afterGradeTable + 2, pageWidth - 14, afterGradeTable + 2);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      mlAnalysis.suggestions.forEach((s, i) => {
        doc.setTextColor(55, 65, 81);
        doc.text(`• ${s}`, 14, afterGradeTable + 12 + i * 8);
      });
    }
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(243, 244, 246);
    doc.rect(0, doc.internal.pageSize.getHeight() - 12, pageWidth, 12, 'F');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Smart Student Tracker - Confidential Academic Report', 14, doc.internal.pageSize.getHeight() - 4);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 4, { align: 'right' });
  }

  doc.save(`${studentName.replace(/\s+/g, '_')}_Academic_Report.pdf`);
};