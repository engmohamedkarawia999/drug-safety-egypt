import { HelpCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TutorialProps {
    isRTL: boolean;
}

export default function Tutorial({ isRTL }: TutorialProps) {
    const [show, setShow] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const completed = localStorage.getItem('tutorial_completed');
        if (!completed) {
            setShow(true);
        }
    }, []);

    const steps = isRTL ? [
        {
            title: "مرحباً بك! 👋",
            content: "هذا التطبيق يساعدك على فحص التفاعلات الدوائية الخطيرة."
        },
        {
            title: "إضافة الأدوية 💊",
            content: "ابحث عن الأدوية بالاسم، أو استخدم الماسح الضوئي، أو البحث الصوتي."
        },
        {
            title: "التحليل 🔍",
            content: "اختر الأمراض المزمنة (إن وجدت) ثم اضغط 'تحليل' للحصول على النتائج."
        },
        {
            title: "اختصارات لوحة المفاتيح ⌨️",
            content: "Ctrl+K: فتح البحث | Ctrl+Enter: تحليل سريع"
        },
        {
            title: "حفظ القوائم 💾",
            content: "يمكنك حفظ قوائم مختلفة لأفراد العائلة والعودة إليها لاحقاً."
        }
    ] : [
        {
            title: "Welcome! 👋",
            content: "This app helps you check dangerous drug interactions."
        },
        {
            title: "Add Medications 💊",
            content: "Search by name, use OCR scanner, or voice search."
        },
        {
            title: "Analyze 🔍",
            content: "Select chronic conditions (if any) then press 'Analyze' for results."
        },
        {
            title: "Keyboard Shortcuts ⌨️",
            content: "Ctrl+K: Open search | Ctrl+Enter: Quick analyze"
        },
        {
            title: "Save Lists 💾",
            content: "You can save different lists for family members and load them later."
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('tutorial_completed', 'true');
        }
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    aria-label="Close tutorial"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                        <HelpCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {steps[step].title}
                    </h2>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-center text-lg mb-8 leading-relaxed">
                    {steps[step].content}
                </p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all ${index === step
                                    ? 'w-8 bg-blue-600'
                                    : 'w-2 bg-gray-300 dark:bg-gray-700'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                            {isRTL ? "تخطي" : "Skip"}
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg"
                        >
                            {step < steps.length - 1 ? (isRTL ? "التالي" : "Next") : (isRTL ? "ابدأ" : "Start")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
