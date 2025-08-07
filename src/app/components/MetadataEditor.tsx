import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Edit, Save, Download, PlusCircle, X } from 'lucide-react';
import { MetadataFieldRenderer } from './MetadataFieldRenderer';

// Simplified props from useMetadata hook
// ... (You'd pass the relevant props from the main page)
interface MetadataEditorProps {
    metadata: Record<string, any[]>;
    isEditing: boolean;
    isLoading: boolean;
    updateField: (category: string, key: string, value: any) => void;
    saveMetadata: () => void;
    downloadMetadataJson: () => void;
    addCustomField: () => void;
    removeCustomField: (key: string) => void;
    updateCustomField: (oldKey: string, newKey: string, newValue: string) => void;
}

export function MetadataEditor({ 
    metadata, isEditing, isLoading, updateField, saveMetadata, downloadMetadataJson,
    addCustomField, removeCustomField, updateCustomField
}: MetadataEditorProps) {
    
  const categories = useMemo(() => Object.keys(metadata).filter(cat => metadata[cat].length > 0), [metadata]);
  const [activeTab, setActiveTab] = useState(categories[0] || 'basic');
  
  if (!categories.includes(activeTab) && categories.length > 0) {
      setActiveTab(categories[0]);
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            <span>Metadata</span>
        </CardTitle>
        <CardDescription>{isEditing ? "Modify the fields below." : "View file metadata."}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)`}}>
                {categories.map(cat => <TabsTrigger key={cat} value={cat} className="capitalize">{cat}</TabsTrigger>)}
            </TabsList>
            
            {Object.entries(metadata).map(([category, fields]) => (
                <TabsContent key={category} value={category} className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                        {fields.map(field => (
                           <MetadataFieldRenderer 
                                key={field.key} 
                                field={field} 
                                isEditing={isEditing} 
                                onFieldChange={(key, value) => updateField(category, key, value)}
                                onCustomRemove={removeCustomField}
                                onCustomUpdate={updateCustomField}
                            />
                        ))}
                    </div>
                    {category === 'custom' && isEditing && (
                        <Button variant="outline" size="sm" onClick={addCustomField} className="mt-4">
                            <PlusCircle className="h-4 w-4 mr-2" /> Add Custom Field
                        </Button>
                    )}
                </TabsContent>
            ))}
        </Tabs>

        <div className="flex gap-2 mt-6 pt-6 border-t">
          {isEditing ? (
            <Button onClick={saveMetadata} disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save & Download New File</>}
            </Button>
          ) : (
            <Button onClick={downloadMetadataJson} variant="secondary" className="flex-1">
              <Download className="h-4 w-4 mr-2" /> Export as JSON
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}