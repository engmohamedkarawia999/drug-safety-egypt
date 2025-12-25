import { Calculator, X } from 'lucide-react';
import { useState } from 'react';

interface DosageCalculatorProps {
    isRTL: boolean;
}

export default function DosageCalculator({ isRTL }: DosageCalculatorProps) {
    const [show, setShow] = useState(false);
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [drugType, setDrugType] = useState('paracetamol');
    const [result, setResult] = useState<string | null>(null);

    const calculateDosage = () => {
        const weightKg = parseFloat(weight);
        const ageYears = parseInt(age);

        if (!weightKg || !ageYears) {
            setResult(isRTL ? "⚠️ الرجاء إدخال الوزن والعمر" : "⚠️ Please enter weight and age");
            return;
        }

        let dosage = '';

        switch (drugType) {
            case 'paracetamol':
                // 10-15 mg/kg every 4-6 hours
                const paracetamolDose = weightKg * 15;
                dosage = `${paracetamolDose.toFixed(0)} mg ${isRTL ? 'كل 4-6 ساعات' : 'every 4-6 hours'}`;
                break;

            case 'ibuprofen':
                // 5-10 mg/kg every 6-8 hours
                const ibuprofenDose = weightKg * 10;
                dosage = `${ibuprofenDose.toFixed(0)} mg ${isRTL ? 'كل 6-8 ساعات' : 'every 6-8 hours'}`;
                break;

            case 'amoxicillin':
                // 20-40 mg/kg/day divided into 3 doses
                const amoxDose = (weightKg * 30) / 3;
                dosage = `${amoxDose.toFixed(0)} mg ${isRTL ? '3 مرات يومياً' : '3 times daily'}`;
                break;

            default:
                dosage = isRTL ? 'غير محدد' : 'Not specified';
        }

        setResult(`💊 ${isRTL ? 'الجرعة المقترحة:' : 'Suggested Dosage:'} ${dosage}`);
    };

    return (
        <>
            <button
                onClick={() => setShow(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-sm text-sm font-medium"
                title={isRTL ? "حاسبة الجرعات" : "Dosage Calculator"}
            >
                <Calculator className="h-4 w-4" />
                {isRTL ? "الجرعات" : "Dosage"}
            </button>

            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShow(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Calculator className="h-6 w-6 text-teal-600" />
                            {isRTL ? "حاسبة الجرعات" : "Dosage Calculator"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {isRTL ? "الوزن (كجم)" : "Weight (kg)"}
                                </label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder={isRTL ? "مثال: 70" : "e.g., 70"}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white dark:bg-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {isRTL ? "العمر (سنوات)" : "Age (years)"}
                                </label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder={isRTL ? "مثال: 25" : "e.g., 25"}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white dark:bg-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {isRTL ? "نوع الدواء" : "Drug Type"}
                                </label>
                                <select
                                    value={drugType}
                                    onChange={(e) => setDrugType(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white dark:bg-gray-800"
                                >
                                    <option value="paracetamol">{isRTL ? "باراسيتامول (خافض حرارة)" : "Paracetamol (Fever)"}</option>
                                    <option value="ibuprofen">{isRTL ? "إيبوبروفين (مسكن)" : "Ibuprofen (Pain)"}</option>
                                    <option value="amoxicillin">{isRTL ? "أموكسيسيلين (مضاد حيوي)" : "Amoxicillin (Antibiotic)"}</option>
                                </select>
                            </div>

                            <button
                                onClick={calculateDosage}
                                className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all font-semibold shadow-lg"
                            >
                                {isRTL ? "احسب الجرعة" : "Calculate Dosage"}
                            </button>

                            {result && (
                                <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg text-center">
                                    <p className="text-lg font-semibold text-teal-800 dark:text-teal-200">{result}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                        {isRTL ? "⚠️ استشر طبيبك قبل تناول أي دواء" : "⚠️ Consult your doctor before taking any medication"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
