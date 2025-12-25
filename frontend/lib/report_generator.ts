import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Drug, Interaction, FoodInteraction, ConditionInteraction } from "@/types";

export const generateReport = (
    drugs: Drug[],
    interactions: Interaction[],
    foodInteractions: FoodInteraction[],
    conditionInteractions: ConditionInteraction[],
    conditions: string[],
    isRTL: boolean
) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // Set Font (Standard for now, Arabic requires custom font loading which is complex in client-side)
    // Note: Arabic characters won't render correctly in standard jsPDF without a custom font.
    // For this prototype, we'll force English for the report or use transliteration if possible.
    // Or we just accept that Arabic names might look garbled unless we load a font.
    // Mitigation: We will use English descriptions primarily for the report to ensure safety.

    // Header
    doc.setFillColor(63, 81, 181); // Indigo
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Drug Safety Report", 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });

    let y = 50;

    // Patient Profile
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Patient Profile", 14, y);
    y += 8;

    const conditionText = conditions.length > 0 ? conditions.join(", ") : "None";
    doc.setFontSize(11);
    doc.text(`Reported Conditions: ${conditionText}`, 14, y);
    y += 10;

    // Current Medications
    doc.setFontSize(14);
    doc.text("Medications List", 14, y);
    y += 8;

    const drugData = drugs.map(d => [d.name, d.rxcui]);
    autoTable(doc, {
        head: [['Drug Name', 'RxCUI']],
        body: drugData,
        startY: y,
        theme: 'striped',
        headStyles: { fillColor: [100, 100, 100] }
    });

    // Update Y
    y = (doc as any).lastAutoTable.finalY + 15;

    // Interactions
    if (interactions.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(220, 53, 69); // Red
        doc.text("Drug-Drug Interactions", 14, y);
        y += 6;

        const intData = interactions.map(i => [i.severity.toUpperCase(), i.description]);
        autoTable(doc, {
            head: [['Severity', 'Description']],
            body: intData,
            startY: y,
            theme: 'grid',
            headStyles: { fillColor: [220, 53, 69] },
        });
        y = (doc as any).lastAutoTable.finalY + 15;
    }

    // Food Interactions
    if (foodInteractions.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(255, 193, 7); // Orange/Yellow
        doc.text("Food & Diet Interactions", 14, y);
        y += 6;

        const foodData = foodInteractions.map(f => [f.drug, f.food, f.description_en]);
        autoTable(doc, {
            head: [['Drug', 'Food', 'Warning']],
            body: foodData,
            startY: y,
            theme: 'grid',
            headStyles: { fillColor: [255, 193, 7], textColor: [0, 0, 0] },
        });
        y = (doc as any).lastAutoTable.finalY + 15;
    }

    // Condition Interactions
    if (conditionInteractions.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(255, 87, 34); // Deep Orange
        doc.text("Health Condition Contraindications", 14, y);
        y += 6;

        const condData = conditionInteractions.map(c => [c.drug, c.condition, c.description_en]);
        autoTable(doc, {
            head: [['Drug', 'Condition', 'Warning']],
            body: condData,
            startY: y,
            theme: 'grid',
            headStyles: { fillColor: [255, 87, 34] },
        });
        y = (doc as any).lastAutoTable.finalY + 15;
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Disclaimer: This report is for informational purposes only and does not conduct medical advice.", 105, pageHeight - 10, { align: 'center' });

    doc.save("Patient_Safety_Report.pdf");
};
