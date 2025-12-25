export type Language = 'en' | 'ar';

export const translations = {
    en: {
        title: "Drug Safety Checker",
        subtitle: "Check for dangerous interactions between medications instantly. Powered by clinical data and AI.",
        addMedication: "Add Medication",
        searchPlaceholder: "Search drug (e.g., Panadol)...",
        analyzeBtn: "Analyze Interactions",
        analyzing: "Analyzing...",
        noInteractionsTitle: "No Interactions Found",
        noInteractionsDesc: "These medications appear safe to take together based on our data.",
        resultsTitle: "Analysis Results",
        foodTitle: "Food & Diet Warnings",
        foodSubtitle: "Important dietary restrictions for your medications.",
        source: "Source",
        disclaimer: "Disclaimer: This tool is for informational purposes only (Prototype). Consult a doctor.",
        remove: "Remove",
        safe: "Safe"
    },
    ar: {
        title: "فاحص الأمان الدوائي",
        subtitle: "تحقق من التفاعلات الخطرة بين الأدوية فوراً. مدعوم بالبيانات السريرية والذكاء الاصطناعي.",
        addMedication: "أضف دواء",
        searchPlaceholder: "ابحث عن دواء (مثلاً: بنادول، اسبرين)...",
        analyzeBtn: "تحليل التفاعلات",
        analyzing: "جاري التحليل...",
        noInteractionsTitle: "لا توجد تفاعلات",
        noInteractionsDesc: "يبدو أن هذه الأدوية آمنة للاستخدام معاً بناءً على بياناتنا.",
        resultsTitle: "نتائج التحليل",
        foodTitle: "تحذيرات الطعام والنظام الغذائي",
        foodSubtitle: "قيود غذائية هامة لأدويتك.",
        source: "المصدر",
        disclaimer: "تنويه: هذه الأداة للأغراض المعلوماتية فقط (نموذج أولي). استشر الطبيب دائماً.",
        remove: "حذف",
        safe: "آمن"
    }
};
