import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { SubContractor, Project } from '@/types/domain';
import { formatCurrency } from './dates';

interface ReportData {
  subContractor: SubContractor;
  projects: Project[];
  month: string;
  totals: {
    gross: number;
    subcon$: number;
    sales$: number;
    company$: number;
  };
}

function calculatePaymentSummary(projects: Project[], totals: any) {
  let advancePayments = 0;
  let clientPaid = 0;
  let paidToSubcontractor = 0;
  let paidToSales = 0;

  projects.forEach(project => {
    if (project.advancePaymentAmount) {
      advancePayments += project.advancePaymentAmount;
    }

    if (Array.isArray(project.payments)) {
      project.payments.forEach(payment => {
        if (payment.paymentType === 'client_payment') {
          clientPaid += payment.amount;
        } else if (payment.paymentType === 'subcontractor_payment') {
          paidToSubcontractor += payment.amount;
        } else if (payment.paymentType === 'sales_payment') {
          paidToSales += payment.amount;
        } else if (payment.paymentType === 'subcontractor_check_collected') {
          paidToSubcontractor += payment.amount;
        }
      });
    }
  });

  const totalClientPaid = advancePayments + clientPaid;
  const clientRemainingBalance = totals.gross - totalClientPaid;

  return {
    advancePayments,
    clientPaid,
    totalClientPaid,
    clientRemainingBalance,
    paidToSubcontractor,
    paidToSales,
    remainingSubcontractor: totals.subcon$ - paidToSubcontractor,
    remainingSales: totals.sales$ - paidToSales,
    totalRemaining: (totals.subcon$ - paidToSubcontractor) + (totals.sales$ - paidToSales),
  };
}

export function generatePDFReport(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('KD Marketing', 14, 20);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sub-Contractor Project Manager', 14, 28);

  doc.setFontSize(9);
  const dateGenerated = new Date().toLocaleDateString();
  doc.text(`Generated: ${dateGenerated}`, pageWidth - 14, 20, { align: 'right' });

  yPos = 50;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Sub-Contractor Report', 14, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${data.subContractor.name}`, 14, yPos);

  if (data.subContractor.companyName) {
    yPos += 6;
    doc.text(`Company: ${data.subContractor.companyName}`, 14, yPos);
  }

  if (data.subContractor.email) {
    yPos += 6;
    doc.text(`Email: ${data.subContractor.email}`, 14, yPos);
  }

  if (data.subContractor.phone) {
    yPos += 6;
    doc.text(`Phone: ${data.subContractor.phone}`, 14, yPos);
  }

  yPos += 6;
  const monthName = new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  doc.text(`Report Period: ${monthName}`, 14, yPos);

  yPos += 12;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Month Summary', 14, yPos);
  yPos += 8;

  const summaryData = [
    ['Projects', data.projects.length.toString()],
    ['Gross Revenue', formatCurrency(data.totals.gross)],
    ['Sub-Contractor Costs', formatCurrency(data.totals.subcon$)],
    ['Sales Commission', formatCurrency(data.totals.sales$)],
    ['Net Profit', formatCurrency(data.totals.company$)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', cellWidth: 80 },
    },
    margin: { left: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  const paymentSummary = calculatePaymentSummary(data.projects, data.totals);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Summary', 14, yPos);
  yPos += 8;

  const paymentData = [
    ['Advance Payments', formatCurrency(paymentSummary.advancePayments)],
    ['Manual Client Payments', formatCurrency(paymentSummary.clientPaid)],
    ['Total Client Paid', formatCurrency(paymentSummary.totalClientPaid)],
    ['Client Remaining Balance', formatCurrency(paymentSummary.clientRemainingBalance)],
    ['', ''],
    ['Paid to Sub-Contractor', formatCurrency(paymentSummary.paidToSubcontractor)],
    ['Paid to Sales', formatCurrency(paymentSummary.paidToSales)],
    ['Remaining (Sub-Contractor)', formatCurrency(paymentSummary.remainingSubcontractor)],
    ['Remaining (Sales)', formatCurrency(paymentSummary.remainingSales)],
    ['Total Remaining (to pay out)', formatCurrency(paymentSummary.totalRemaining)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Payment Type', 'Amount']],
    body: paymentData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', cellWidth: 80 },
    },
    margin: { left: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Projects', 14, yPos);
  yPos += 8;

  const projectsData = data.projects.map(project => [
    project.title,
    project.salesPerson || '-',
    formatCurrency(project.projectPrice),
    `${project.subcontractorPercentage}%`,
    `${project.salesCommissionPercentage}%`,
    formatCurrency(project.projectPrice * (project.subcontractorPercentage / 100)),
    formatCurrency(project.projectPrice * (project.salesCommissionPercentage / 100)),
    project.status || 'Active',
    project.reviewCollected ? 'Yes' : 'No',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Title', 'Sales Person', 'Price', 'Sub %', 'Sales %', 'Sub $', 'Sales $', 'Status', 'Review']],
    body: projectsData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 22 },
      2: { halign: 'right', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'center', cellWidth: 14 },
      5: { halign: 'right', cellWidth: 20 },
      6: { halign: 'right', cellWidth: 20 },
      7: { halign: 'center', cellWidth: 18 },
      8: { halign: 'center', cellWidth: 16 },
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  }

  const timestamp = new Date().getTime();
  const fileName = `${data.subContractor.name.replace(/\s+/g, '_')}_${monthName.replace(/\s+/g, '_')}_Report_${timestamp}.pdf`;

  doc.save(fileName);
}

export function generateExcelReport(data: ReportData) {
  const workbook = XLSX.utils.book_new();

  const monthName = new Date(data.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dateGenerated = new Date().toLocaleDateString();

  const headerData = [
    ['KD Marketing'],
    ['Sub-Contractor Project Manager'],
    [''],
    ['Report Generated:', dateGenerated],
    ['Sub-Contractor:', data.subContractor.name],
    ['Company:', data.subContractor.companyName || '-'],
    ['Email:', data.subContractor.email || '-'],
    ['Phone:', data.subContractor.phone || '-'],
    ['Report Period:', monthName],
    [''],
  ];

  const summaryData = [
    ['MONTH SUMMARY'],
    ['Metric', 'Value'],
    ['Projects', data.projects.length],
    ['Gross Revenue', data.totals.gross],
    ['Sub-Contractor Costs', data.totals.subcon$],
    ['Sales Commission', data.totals.sales$],
    ['Net Profit', data.totals.company$],
    [''],
  ];

  const paymentSummary = calculatePaymentSummary(data.projects, data.totals);
  const paymentData = [
    ['PAYMENT SUMMARY'],
    ['Payment Type', 'Amount'],
    ['Advance Payments', paymentSummary.advancePayments],
    ['Manual Client Payments', paymentSummary.clientPaid],
    ['Total Client Paid', paymentSummary.totalClientPaid],
    ['Client Remaining Balance', paymentSummary.clientRemainingBalance],
    [''],
    ['Paid to Sub-Contractor', paymentSummary.paidToSubcontractor],
    ['Paid to Sales', paymentSummary.paidToSales],
    ['Remaining (Sub-Contractor)', paymentSummary.remainingSubcontractor],
    ['Remaining (Sales)', paymentSummary.remainingSales],
    ['Total Remaining (to pay out)', paymentSummary.totalRemaining],
    [''],
  ];

  const projectsHeader = [
    ['PROJECTS'],
    ['Title', 'Sales Person', 'Price', 'Sub %', 'Sales %', 'Sub $', 'Sales $', 'Status', 'Review', 'Start Date', 'End Date'],
  ];

  const projectsData = data.projects.map(project => [
    project.title,
    project.salesPerson || '-',
    project.projectPrice,
    project.subcontractorPercentage,
    project.salesCommissionPercentage,
    project.projectPrice * (project.subcontractorPercentage / 100),
    project.projectPrice * (project.salesCommissionPercentage / 100),
    project.status || 'Active',
    project.reviewCollected ? 'Yes' : 'No',
    project.startDate || '-',
    project.endDate || '-',
  ]);

  const allData = [
    ...headerData,
    ...summaryData,
    ...paymentData,
    ...projectsHeader,
    ...projectsData,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(allData);

  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  const timestamp = new Date().getTime();
  const fileName = `${data.subContractor.name.replace(/\s+/g, '_')}_${monthName.replace(/\s+/g, '_')}_Report_${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
