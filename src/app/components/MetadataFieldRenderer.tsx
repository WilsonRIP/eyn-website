import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Button } from "@/src/app/components/ui/button";
import { CopyButton } from "@/src/app/components/ui/copy-button";
import { Trash2 } from "lucide-react";
import { useState } from "react";


interface Field {
    key: string;
    value: any;
    label: string;
    editable: boolean;
    isCustom?: boolean;
}

interface MetadataFieldRendererProps {
    field: Field;
    isEditing: boolean;
    onFieldChange: (key: string, value: any) => void;
    onCustomRemove: (key: string) => void;
    onCustomUpdate: (oldKey: string, newKey: string, newValue: string) => void;
}

export function MetadataFieldRenderer({ field, isEditing, onFieldChange, onCustomRemove, onCustomUpdate }: MetadataFieldRendererProps) {
    const [customKey, setCustomKey] = useState(field.label);

    const handleCustomKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomKey(e.target.value);
    };

    const handleCustomBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const newValue = (e.target.parentElement?.parentElement?.querySelector('input[type="text"]:not(.key-input), textarea') as HTMLInputElement)?.value;
        onCustomUpdate(field.key, customKey, newValue || field.value);
    }
    
    // View Mode
    if (!isEditing) {
        return (
            <div className="space-y-1">
                <Label>{field.label}</Label>
                <div className="flex items-center justify-between p-2.5 bg-muted rounded-md text-sm">
                    <span className="truncate" title={field.value}>{field.value?.toString() || 'N/A'}</span>
                    <CopyButton text={field.value?.toString() || ''} />
                </div>
            </div>
        );
    }

    // Edit Mode
    return (
        <div className="space-y-1">
             {field.isCustom ? (
                <div className="flex items-center gap-2">
                    <Input
                        value={customKey}
                        onChange={handleCustomKeyChange}
                        onBlur={handleCustomBlur}
                        className="key-input font-semibold"
                        placeholder="Field Name"
                    />
                     <Button variant="ghost" size="icon" onClick={() => onCustomRemove(field.key)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ) : (
                <Label>{field.label}</Label>
            )}

            {typeof field.value === 'string' && field.value.length > 50 ? (
                <Textarea 
                    value={field.value}
                    onChange={(e) => onFieldChange(field.key, e.target.value)}
                    disabled={!field.editable}
                    placeholder={`Enter ${field.label}`}
                />
            ) : (
                 <Input 
                    value={field.value}
                    onChange={(e) => onFieldChange(field.key, e.target.value)}
                    disabled={!field.editable}
                    placeholder={`Enter ${field.label}`}
                />
            )}
        </div>
    );
}