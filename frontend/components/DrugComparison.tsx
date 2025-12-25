'use client';

import { useState, useMemo } from 'react';
import { Drug } from '@/types';
import { Pill, AlertTriangle, CheckCircle, Info, Activity, X, ChevronDown, ChevronUp, Zap, Shield, Clock, Users } from 'lucide-react';
import { getArabicName } from '@/lib/arabicDrugs';

interface DrugComparisonProps {
    drugs: Drug[];
    interactions: any[];
    foodInteractions: any[];
    conditionInteractions: any[];
    isRTL: boolean;
    onClose: () => void;
}

// Drug information database (simulated)
const drugInfo: Record<string, any> = {
    aspirin: {
        class: 'NSAID / Antiplatelet',
        classAr: 'مسكن / مضاد للتجلط',
        onset: '15-30 min',
        duration: '4-6 hours',
        metabolism: 'Liver (CYP2C9)',
        halfLife: '2-3 hours',
        safetyScore: 7,
        interactions: 'moderate',
        pregnancy: 'D (3rd trimester)',
        priceRange: '$',
        otc: true,
    },
    ibuprofen: {
        class: 'NSAID',
        classAr: 'مضاد للالتهاب',
        onset: '20-30 min',
        duration: '6-8 hours',
        metabolism: 'Liver (CYP2C9)',
        halfLife: '2-4 hours',
        safetyScore: 7,
        interactions: 'moderate',
        pregnancy: 'D (3rd trimester)',
        priceRange: '$',
        otc: true,
    },
    paracetamol: {
        class: 'Analgesic',
        classAr: 'مسكن للألم',
        onset: '15-30 min',
        duration: '4-6 hours',
        metabolism: 'Liver',
        halfLife: '1-4 hours',
        safetyScore: 9,
        interactions: 'low',
        pregnancy: 'B',
        priceRange: '$',
        otc: true,
    },
    warfarin: {
        class: 'Anticoagulant',
        classAr: 'مضاد للتجلط',
        onset: '24-72 hours',
        duration: '2-5 days',
        metabolism: 'Liver (CYP2C9/3A4)',
        halfLife: '40 hours',
        safetyScore: 4,
        interactions: 'severe',
        pregnancy: 'X',
        priceRange: '$',
        otc: false,
    },
    metformin: {
        class: 'Biguanide',
        classAr: 'خافض للسكر',
        onset: '1-2 hours',
        duration: '8-12 hours',
        metabolism: 'Not metabolized',
        halfLife: '6 hours',
        safetyScore: 8,
        interactions: 'low',
        pregnancy: 'B',
        priceRange: '$',
        otc: false,
    },
    omeprazole: {
        class: 'PPI',
        classAr: 'مثبط مضخة البروتون',
        onset: '1 hour',
        duration: '24 hours',
        metabolism: 'Liver (CYP2C19)',
        halfLife: '1 hour',
        safetyScore: 8,
        interactions: 'moderate',
        pregnancy: 'C',
        priceRange: '$',
        otc: true,
    },
};

function getDrugBaseInfo(drugName: string) {
    const normalized = drugName.toLowerCase();
    for (const [key, value] of Object.entries(drugInfo)) {
        if (normalized.includes(key)) {
            return value;
        }
    }
    return null;
}

export default function DrugComparison({ drugs, interactions, foodInteractions, conditionInteractions, isRTL, onClose }: DrugComparisonProps) {
    const [expandedSections, setExpandedSections] = useState<string[]>(['overview', 'safety', 'interactions']);
    const [compareMode, setCompareMode] = useState<'grid' | 'detailed'>('grid');

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    // Calculate safety scores
    const drugAnalysis = useMemo(() => {
        return drugs.map(drug => {
            const info = getDrugBaseInfo(drug.name);
            const arabicName = getArabicName(drug.name);
            const relatedInteractions = interactions.filter(i =>
                i.drug1?.toLowerCase().includes(drug.name.toLowerCase()) ||
                i.drug2?.toLowerCase().includes(drug.name.toLowerCase())
            );
            const relatedFoodInteractions = foodInteractions.filter(f =>
                f.drug?.toLowerCase().includes(drug.name.toLowerCase())
            );
            const relatedConditionInteractions = conditionInteractions.filter(c =>
                c.drug?.toLowerCase().includes(drug.name.toLowerCase())
            );

            let safetyScore = info?.safetyScore || 6;

            // Adjust score based on interactions
            relatedInteractions.forEach(i => {
                if (i.severity === 'severe') safetyScore -= 2;
                else if (i.severity === 'moderate') safetyScore -= 1;
            });

            safetyScore = Math.max(1, Math.min(10, safetyScore));

            return {
                drug,
                arabicName,
                info,
                safetyScore,
                interactionCount: relatedInteractions.length,
                foodInteractionCount: relatedFoodInteractions.length,
                conditionInteractionCount: relatedConditionInteractions.length,
                riskLevel: safetyScore >= 7 ? 'low' : safetyScore >= 4 ? 'moderate' : 'high',
            };
        });
    }, [drugs, interactions, foodInteractions, conditionInteractions]);

    const getSafetyColor = (score: number) => {
        if (score >= 7) return 'text-green-500';
        if (score >= 4) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getSafetyBg = (score: number) => {
        if (score >= 7) return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
        if (score >= 4) return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'low': return <Shield className="h-5 w-5 text-green-500" />;
            case 'moderate': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'high': return <Zap className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    if (drugs.length === 0) return null;

    return (
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity className="h-8 w-8" />
                        <div>
                            <h2 className="text-2xl font-bold">
                                {isRTL ? 'مقارنة الأدوية الذكية' : 'Smart Drug Comparison'}
                            </h2>
                            <p className="text-indigo-200 text-sm">
                                {isRTL
                                    ? `تحليل ${drugs.length} أدوية مع ${interactions.length} تفاعل محتمل`
                                    : `Analyzing ${drugs.length} medications with ${interactions.length} potential interactions`
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCompareMode(compareMode === 'grid' ? 'detailed' : 'grid')}
                            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all text-sm font-medium"
                        >
                            {compareMode === 'grid'
                                ? (isRTL ? 'عرض تفصيلي' : 'Detailed View')
                                : (isRTL ? 'عرض شبكي' : 'Grid View')
                            }
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            aria-label="Close comparison"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Safety Overview Cards */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drugAnalysis.map((analysis, index) => (
                    <div
                        key={analysis.drug.rxcui}
                        className={`p-4 rounded-xl border-2 ${getSafetyBg(analysis.safetyScore)} transition-all hover:shadow-lg`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${analysis.safetyScore >= 7 ? 'bg-green-200 dark:bg-green-800' : analysis.safetyScore >= 4 ? 'bg-yellow-200 dark:bg-yellow-800' : 'bg-red-200 dark:bg-red-800'}`}>
                                    <Pill className={`h-5 w-5 ${getSafetyColor(analysis.safetyScore)}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                                        {analysis.drug.name.length > 25
                                            ? analysis.drug.name.substring(0, 25) + '...'
                                            : analysis.drug.name
                                        }
                                    </h3>
                                    {analysis.arabicName && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{analysis.arabicName}</p>
                                    )}
                                </div>
                            </div>
                            {getRiskIcon(analysis.riskLevel)}
                        </div>

                        {/* Safety Score Bar */}
                        <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {isRTL ? 'درجة الأمان' : 'Safety Score'}
                                </span>
                                <span className={`font-bold ${getSafetyColor(analysis.safetyScore)}`}>
                                    {analysis.safetyScore}/10
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${analysis.safetyScore >= 7 ? 'bg-green-500' : analysis.safetyScore >= 4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${analysis.safetyScore * 10}%` }}
                                />
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <div className={`font-bold ${analysis.interactionCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {analysis.interactionCount}
                                </div>
                                <div className="text-gray-500">{isRTL ? 'تفاعلات' : 'Drug'}</div>
                            </div>
                            <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <div className={`font-bold ${analysis.foodInteractionCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {analysis.foodInteractionCount}
                                </div>
                                <div className="text-gray-500">{isRTL ? 'طعام' : 'Food'}</div>
                            </div>
                            <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                <div className={`font-bold ${analysis.conditionInteractionCount > 0 ? 'text-purple-600' : 'text-green-600'}`}>
                                    {analysis.conditionInteractionCount}
                                </div>
                                <div className="text-gray-500">{isRTL ? 'حالات' : 'Cond.'}</div>
                            </div>
                        </div>

                        {/* Drug Info */}
                        {analysis.info && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{isRTL ? 'التصنيف:' : 'Class:'}</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {isRTL ? analysis.info.classAr : analysis.info.class}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{isRTL ? 'بداية المفعول:' : 'Onset:'}</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{analysis.info.onset}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{isRTL ? 'المدة:' : 'Duration:'}</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{analysis.info.duration}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Interaction Matrix */}
            {interactions.length > 0 && (
                <div className="px-6 pb-6">
                    <div
                        className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-t-xl border border-red-200 dark:border-red-700 cursor-pointer"
                        onClick={() => toggleSection('interactions')}
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <h3 className="font-bold text-red-800 dark:text-red-200">
                                {isRTL ? `⚠️ تحذير: ${interactions.length} تفاعل دوائي` : `⚠️ Warning: ${interactions.length} Drug Interactions`}
                            </h3>
                        </div>
                        {expandedSections.includes('interactions') ? <ChevronUp /> : <ChevronDown />}
                    </div>

                    {expandedSections.includes('interactions') && (
                        <div className="border border-t-0 border-red-200 dark:border-red-700 rounded-b-xl p-4 space-y-3">
                            {interactions.map((interaction, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border-l-4 ${interaction.severity === 'severe'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : interaction.severity === 'moderate'
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${interaction.severity === 'severe'
                                                ? 'bg-red-500 text-white'
                                                : interaction.severity === 'moderate'
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-yellow-500 text-white'
                                            }`}>
                                            {interaction.severity}
                                        </span>
                                        <span className="font-bold text-gray-800 dark:text-gray-100">
                                            {interaction.drug1} ↔️ {interaction.drug2}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                                        {interaction.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Overall Recommendation */}
            <div className="px-6 pb-6">
                <div className={`p-4 rounded-xl ${interactions.some(i => i.severity === 'severe')
                        ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
                        : interactions.length > 0
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700'
                            : 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        {interactions.some(i => i.severity === 'severe') ? (
                            <Zap className="h-6 w-6 text-red-600" />
                        ) : interactions.length > 0 ? (
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        ) : (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        )}
                        <h3 className="font-bold text-lg">
                            {isRTL ? 'التوصية النهائية' : 'Final Recommendation'}
                        </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                        {interactions.some(i => i.severity === 'severe')
                            ? (isRTL
                                ? '⛔ توجد تفاعلات خطيرة! يجب استشارة الطبيب فوراً قبل تناول هذه الأدوية معاً.'
                                : '⛔ Severe interactions detected! Consult your doctor immediately before taking these medications together.')
                            : interactions.length > 0
                                ? (isRTL
                                    ? '⚠️ توجد تفاعلات معتدلة. ينصح بمراجعة الطبيب أو الصيدلي.'
                                    : '⚠️ Moderate interactions found. Consider consulting a healthcare professional.')
                                : (isRTL
                                    ? '✅ لم يتم العثور على تفاعلات خطيرة. يمكنك تناول هذه الأدوية بأمان نسبي.'
                                    : '✅ No significant interactions found. These medications appear safe to take together.')
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
