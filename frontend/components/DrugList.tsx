import { X } from "lucide-react";
import { Drug } from "@/types";

interface DrugListProps {
    drugs: Drug[];
    onRemove: (rxcui: string) => void;
    removeText: string;
}

export default function DrugList({ drugs, onRemove, removeText }: DrugListProps) {
    if (drugs.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {drugs.map((drug) => (
                <span
                    key={drug.rxcui}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100/80 backdrop-blur-sm text-blue-800 border border-blue-200"
                >
                    {drug.name}
                    <button
                        onClick={() => onRemove(drug.rxcui)}
                        className="ml-2 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                        title={removeText}
                        aria-label={removeText}
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
        </div>
    );
}
