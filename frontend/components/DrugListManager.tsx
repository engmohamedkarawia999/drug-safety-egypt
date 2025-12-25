import { Save, FolderOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface SavedList {
    name: string;
    count: number;
    savedAt: string;
}

interface DrugListManagerProps {
    onSave: (name: string) => void;
    onLoad: (name: string) => void;
    onClear: () => void;
    getSavedLists: () => SavedList[];
    currentDrugCount: number;
    isRTL: boolean;
}

export default function DrugListManager({ onSave, onLoad, onClear, getSavedLists, currentDrugCount, isRTL }: DrugListManagerProps) {
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showLoadDialog, setShowLoadDialog] = useState(false);
    const [listName, setListName] = useState('');

    const savedLists = getSavedLists();

    const handleSave = () => {
        if (listName.trim()) {
            onSave(listName.trim());
            setListName('');
            setShowSaveDialog(false);
        }
    };

    const handleLoad = (name: string) => {
        onLoad(name);
        setShowLoadDialog(false);
    };

    return (
        <div className="flex gap-2 justify-center flex-wrap">
            {/* Save Button */}
            <button
                onClick={() => setShowSaveDialog(true)}
                disabled={currentDrugCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
                title={isRTL ? "حفظ القائمة" : "Save List"}
            >
                <Save className="h-4 w-4" />
                {isRTL ? "حفظ" : "Save"}
            </button>

            {/* Load Button */}
            <button
                onClick={() => setShowLoadDialog(true)}
                disabled={savedLists.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
                title={isRTL ? "تحميل قائمة" : "Load List"}
            >
                <FolderOpen className="h-4 w-4" />
                {isRTL ? "تحميل" : "Load"}
            </button>

            {/* Clear Button */}
            <button
                onClick={onClear}
                disabled={currentDrugCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
                title={isRTL ? "مسح الكل" : "Clear All"}
            >
                <Trash2 className="h-4 w-4" />
                {isRTL ? "مسح" : "Clear"}
            </button>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir={isRTL ? 'rtl' : 'ltr'}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {isRTL ? "حفظ قائمة الأدوية" : "Save Drug List"}
                        </h3>
                        <input
                            type="text"
                            value={listName}
                            onChange={(e) => setListName(e.target.value)}
                            placeholder={isRTL ? "اسم القائمة (مثال: أدوية أبي)" : "List name (e.g., Dad's Meds)"}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none mb-4"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowSaveDialog(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                {isRTL ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!listName.trim()}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all font-medium"
                            >
                                {isRTL ? "حفظ" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Load Dialog */}
            {showLoadDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir={isRTL ? 'rtl' : 'ltr'}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {isRTL ? "تحميل قائمة محفوظة" : "Load Saved List"}
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {savedLists.map((list) => (
                                <button
                                    key={list.name}
                                    onClick={() => handleLoad(list.name)}
                                    className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                                >
                                    <div className="font-semibold text-gray-800">{list.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {list.count} {isRTL ? "دواء" : "drug"}(s) • {new Date(list.savedAt).toLocaleDateString()}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowLoadDialog(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                {isRTL ? "إلغاء" : "Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
