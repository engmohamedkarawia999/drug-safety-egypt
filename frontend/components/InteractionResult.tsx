"use client";

import { useState } from 'react';
import { Interaction, FoodInteraction, ConditionInteraction } from "@/types";
import {
    AlertTriangle, ShieldCheck, Ban, Info, Utensils, Activity, Sparkles, X, Loader2,
    ChevronDown, ChevronUp, AlertCircle, CheckCircle2, XCircle, Clock,
    Pill, Heart, Zap, Shield, TrendingUp, BarChart3
} from "lucide-react";
import { explainInteraction } from '@/lib/api';

interface InteractionResultProps {
    interactions: Interaction[];
    foodInteractions?: FoodInteraction[];
    conditionInteractions?: ConditionInteraction[];
    checked: boolean;
    t: any;
    isRTL: boolean;
}

// Severity configuration with all visual properties
const severityConfig = {
    Contraindicated: {
        gradient: "from-red-600 to-rose-600",
        bg: "bg-gradient-to-br from-red-50 to-rose-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: XCircle,
        pulse: true,
        priority: 1,
        labelEn: "CRITICAL",
        labelAr: "حرج"
    },
    Major: {
        gradient: "from-orange-500 to-red-500",
        bg: "bg-gradient-to-br from-orange-50 to-red-50",
        border: "border-orange-200",
        text: "text-orange-800",
        icon: AlertTriangle,
        pulse: false,
        priority: 2,
        labelEn: "MAJOR",
        labelAr: "خطير"
    },
    Moderate: {
        gradient: "from-amber-500 to-orange-500",
        bg: "bg-gradient-to-br from-amber-50 to-orange-50",
        border: "border-amber-200",
        text: "text-amber-800",
        icon: AlertCircle,
        pulse: false,
        priority: 3,
        labelEn: "MODERATE",
        labelAr: "متوسط"
    },
    Minor: {
        gradient: "from-yellow-400 to-amber-400",
        bg: "bg-gradient-to-br from-yellow-50 to-amber-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        icon: Info,
        pulse: false,
        priority: 4,
        labelEn: "MINOR",
        labelAr: "بسيط"
    },
    Unknown: {
        gradient: "from-gray-400 to-slate-400",
        bg: "bg-gradient-to-br from-gray-50 to-slate-50",
        border: "border-gray-200",
        text: "text-gray-700",
        icon: Info,
        pulse: false,
        priority: 5,
        labelEn: "INFO",
        labelAr: "معلومة"
    }
};

// Summary Stats Component
const InteractionStats = ({
    drug, food, condition, isRTL
}: { drug: number; food: number; condition: number; isRTL: boolean }) => {
    const stats = [
        { icon: Pill, count: drug, label: isRTL ? "تفاعلات دوائية" : "Drug Interactions", color: "from-purple-500 to-indigo-500" },
        { icon: Utensils, count: food, label: isRTL ? "تفاعلات غذائية" : "Food Interactions", color: "from-blue-500 to-cyan-500" },
        { icon: Activity, count: condition, label: isRTL ? "تعارضات صحية" : "Health Warnings", color: "from-rose-500 to-pink-500" },
    ];

    return (
        <div className={`grid grid-cols-3 gap-3 mb-6 ${isRTL ? 'direction-rtl' : ''}`}>
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className={`
                        p-4 rounded-2xl bg-gradient-to-br ${stat.color} 
                        text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1
                        ${stat.count === 0 ? 'opacity-50' : ''}
                    `}
                >
                    <div className="flex items-center justify-between mb-2">
                        <stat.icon className="h-6 w-6 opacity-80" />
                        <span className="text-3xl font-black">{stat.count}</span>
                    </div>
                    <div className="text-xs font-medium opacity-90 truncate">{stat.label}</div>
                </div>
            ))}
        </div>
    );
};

// Risk Level Gauge Component
const RiskGauge = ({ level, isRTL }: { level: string; isRTL: boolean }) => {
    const levels = ["Minor", "Moderate", "Major", "Contraindicated"];
    const levelIndex = levels.indexOf(level);
    const percentage = levelIndex >= 0 ? ((levelIndex + 1) / levels.length) * 100 : 0;

    const colors = ["bg-green-500", "bg-yellow-500", "bg-orange-500", "bg-red-500"];
    const color = colors[levelIndex] || "bg-gray-400";

    return (
        <div className="mb-6 p-4 bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm">
            <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm font-medium text-gray-600">
                    {isRTL ? "مستوى الخطورة الإجمالي" : "Overall Risk Level"}
                </span>
                <span className={`text-sm font-bold uppercase ${severityConfig[level as keyof typeof severityConfig]?.text || 'text-gray-600'}`}>
                    {isRTL
                        ? severityConfig[level as keyof typeof severityConfig]?.labelAr
                        : severityConfig[level as keyof typeof severityConfig]?.labelEn
                    }
                </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className={`flex justify-between mt-1 text-xs text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{isRTL ? "آمن" : "Safe"}</span>
                <span>{isRTL ? "حرج" : "Critical"}</span>
            </div>
        </div>
    );
};

// Interaction Card Component
const InteractionCard = ({
    interaction,
    index,
    isRTL,
    onExplain,
    isExplaining
}: {
    interaction: Interaction;
    index: number;
    isRTL: boolean;
    onExplain: () => void;
    isExplaining: boolean;
}) => {
    const [expanded, setExpanded] = useState(false);
    const config = severityConfig[interaction.severity as keyof typeof severityConfig] || severityConfig.Unknown;
    const Icon = config.icon;

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl border-2 transition-all duration-300
                ${config.bg} ${config.border}
                ${config.pulse ? 'animate-pulse-slow' : ''}
                hover:shadow-lg hover:-translate-y-0.5
            `}
        >
            {/* Severity Badge - Top Right/Left */}
            <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'}`}>
                <div className={`bg-gradient-to-r ${config.gradient} text-white px-4 py-1 text-xs font-bold uppercase tracking-wider ${isRTL ? 'rounded-br-xl' : 'rounded-bl-xl'}`}>
                    {isRTL ? config.labelAr : config.labelEn}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-5 pt-8">
                <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {/* Icon */}
                    <div className={`
                        h-14 w-14 rounded-2xl bg-gradient-to-br ${config.gradient} 
                        flex items-center justify-center text-white shadow-lg flex-shrink-0
                    `}>
                        <Icon className="h-7 w-7" />
                    </div>

                    {/* Details */}
                    <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                        {/* Drug Names */}
                        <div className={`flex items-center gap-2 mb-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-semibold text-gray-800 shadow-sm">
                                {interaction.drug1 || interaction.drug_1 || "Drug A"}
                            </span>
                            <span className={`text-2xl ${config.text}`}>⚡</span>
                            <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-semibold text-gray-800 shadow-sm">
                                {interaction.drug2 || interaction.drug_2 || "Drug B"}
                            </span>
                        </div>

                        {/* Description */}
                        <p className={`text-sm ${config.text} leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
                            {interaction.description}
                        </p>

                        {interaction.description.length > 100 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className={`mt-1 text-xs ${config.text} opacity-70 hover:opacity-100 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                                {expanded
                                    ? (isRTL ? "عرض أقل" : "Show less")
                                    : (isRTL ? "عرض المزيد" : "Show more")
                                }
                                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                        )}

                        {/* Source & Actions */}
                        <div className={`flex items-center gap-3 mt-3 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                            {interaction.source && (
                                <span className="text-xs text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">
                                    📚 {interaction.source}
                                </span>
                            )}

                            <button
                                onClick={onExplain}
                                disabled={isExplaining}
                                className={`
                                    px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all
                                    ${isExplaining
                                        ? 'bg-indigo-100 text-indigo-400 cursor-wait'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                                    }
                                `}
                            >
                                {isExplaining ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )}
                                {isRTL ? "شرح بالذكاء الاصطناعي" : "Explain with AI"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Food/Condition Card Component
const SecondaryCard = ({
    item, type, isRTL
}: {
    item: FoodInteraction | ConditionInteraction;
    type: 'food' | 'condition';
    isRTL: boolean
}) => {
    const isFood = type === 'food';
    const Icon = isFood ? Utensils : Activity;

    const colorMap = {
        red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-500" },
        orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: "text-orange-500" },
        yellow: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", icon: "text-yellow-500" },
        green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: "text-green-500" },
    };

    const colors = colorMap[item.color] || colorMap.yellow;

    return (
        <div className={`p-4 rounded-2xl ${colors.bg} border ${colors.border} hover:shadow-md transition-all`}>
            <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`p-2.5 rounded-xl bg-white shadow-sm ${colors.icon}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 mb-1.5 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="px-2 py-0.5 bg-white/80 rounded-lg text-xs font-bold text-gray-700">
                            {item.drug}
                        </span>
                        <span className="text-gray-400">+</span>
                        <span className="px-2 py-0.5 bg-white/80 rounded-lg text-xs font-bold text-gray-700">
                            {isFood ? (item as FoodInteraction).food : (item as ConditionInteraction).condition}
                        </span>
                    </div>
                    <p className={`text-sm ${colors.text} leading-relaxed`}>
                        {isRTL
                            ? (isFood ? (item as FoodInteraction).description_ar : (item as ConditionInteraction).description_ar)
                            : (isFood ? (item as FoodInteraction).description_en : (item as ConditionInteraction).description_en)
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function InteractionResult({
    interactions,
    foodInteractions = [],
    conditionInteractions = [],
    checked,
    t,
    isRTL
}: InteractionResultProps) {
    const [explaining, setExplaining] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<any | null>(null);

    const handleExplain = async (drug1: string, drug2: string, severity: string, id: string) => {
        setExplaining(id);
        try {
            const res = await explainInteraction(drug1, drug2, severity);
            setExplanation(res);
        } catch (e) {
            console.error(e);
        } finally {
            setExplaining(null);
        }
    };

    if (!checked) return null;

    const hasDrug = interactions.length > 0;
    const hasFood = foodInteractions.length > 0;
    const hasCondition = conditionInteractions.length > 0;

    // Calculate highest risk level
    const getHighestRisk = () => {
        if (!hasDrug) return "Minor";
        const priorities = interactions.map(i =>
            severityConfig[i.severity as keyof typeof severityConfig]?.priority || 5
        );
        const minPriority = Math.min(...priorities);
        return Object.entries(severityConfig).find(([_, v]) => v.priority === minPriority)?.[0] || "Unknown";
    };

    if (!hasDrug && !hasFood && !hasCondition) {
        return (
            <div className="relative overflow-hidden p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-3xl text-center animate-in fade-in zoom-in duration-500 shadow-xl">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-200/30 rounded-full blur-3xl" />

                <div className="relative">
                    <div className="h-20 w-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-xl animate-bounce">
                        <ShieldCheck className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-2">
                        {t.noInteractionsTitle}
                    </h3>
                    <p className="text-green-700 text-lg">{t.noInteractionsDesc}</p>

                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{isRTL ? "تم فحص الأدوية بنجاح" : "Medications checked successfully"}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500 relative" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* AI Explanation Modal */}
            {explanation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-indigo-100 animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
                            <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div>
                                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <Sparkles className="h-5 w-5 animate-pulse" />
                                        <span className="text-sm font-bold uppercase tracking-wider opacity-90">
                                            {isRTL ? "الذكاء الاصطناعي" : "AI Assistant"}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold">{isRTL ? explanation.title_ar : explanation.title_en}</h3>
                                </div>
                                <button
                                    onClick={() => setExplanation(null)}
                                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg"
                                    aria-label="Close"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700 leading-relaxed text-lg">
                                {isRTL ? explanation.text_ar : explanation.text_en}
                            </p>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
                                <Zap className="h-3 w-3" />
                                <span>
                                    {isRTL
                                        ? "تم توليد هذا الشرح بواسطة الذكاء الاصطناعي"
                                        : "Generated by AI for demonstration purposes"
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Summary */}
            <InteractionStats
                drug={interactions.length}
                food={foodInteractions.length}
                condition={conditionInteractions.length}
                isRTL={isRTL}
            />

            {/* Risk Gauge */}
            {hasDrug && <RiskGauge level={getHighestRisk()} isRTL={isRTL} />}

            {/* Drug Interactions */}
            {hasDrug && (
                <div className="space-y-4">
                    <h3 className={`text-xl font-bold text-gray-800 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Pill className="h-6 w-6 text-purple-500" />
                        {t.resultsTitle}
                        <span className="text-sm font-normal bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                            {interactions.length}
                        </span>
                    </h3>

                    <div className="space-y-4">
                        {interactions
                            .sort((a, b) =>
                                (severityConfig[a.severity as keyof typeof severityConfig]?.priority || 5) -
                                (severityConfig[b.severity as keyof typeof severityConfig]?.priority || 5)
                            )
                            .map((interaction, idx) => (
                                <InteractionCard
                                    key={idx}
                                    interaction={interaction}
                                    index={idx}
                                    isRTL={isRTL}
                                    onExplain={() => handleExplain(
                                        interaction.drug1 || interaction.drug_1 || "Drug A",
                                        interaction.drug2 || interaction.drug_2 || "Drug B",
                                        interaction.severity,
                                        `drug-${idx}`
                                    )}
                                    isExplaining={explaining === `drug-${idx}`}
                                />
                            ))
                        }
                    </div>
                </div>
            )}

            {/* Food Interactions */}
            {hasFood && (
                <div className="space-y-4">
                    <h3 className={`text-xl font-bold text-gray-800 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Utensils className="h-6 w-6 text-blue-500" />
                        {t.foodTitle}
                        <span className="text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            {foodInteractions.length}
                        </span>
                    </h3>
                    <p className="text-sm text-gray-500 -mt-2">{t.foodSubtitle}</p>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {foodInteractions.map((fi, idx) => (
                            <SecondaryCard key={idx} item={fi} type="food" isRTL={isRTL} />
                        ))}
                    </div>
                </div>
            )}

            {/* Condition Interactions */}
            {hasCondition && (
                <div className="space-y-4">
                    <h3 className={`text-xl font-bold text-gray-800 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Activity className="h-6 w-6 text-rose-500" />
                        {isRTL ? "تعارضات الحالة الصحية" : "Health Condition Warnings"}
                        <span className="text-sm font-normal bg-rose-100 text-rose-700 px-3 py-1 rounded-full">
                            {conditionInteractions.length}
                        </span>
                    </h3>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {conditionInteractions.map((ci, idx) => (
                            <SecondaryCard key={idx} item={ci} type="condition" isRTL={isRTL} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
