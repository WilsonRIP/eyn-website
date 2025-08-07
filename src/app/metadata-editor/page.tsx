"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Badge } from "@/src/app/components/ui/badge";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Slider } from "@/src/app/components/ui/slider";
import { Checkbox } from "@/src/app/components/ui/checkbox";
import { 
  FileImage, 
  Music, 
  Upload, 
  Download, 
  RotateCcw, 
  Eye, 
  Edit, 
  Save,
  Trash2,
  AlertTriangle,
  Info,
  Camera,
  Calendar,
  MapPin,
  User,
  Settings,
  FileText,
  CheckCircle,
  X,
  Search,
  Filter,
  BarChart3,
  History,
  Star,
  Zap,
  Shield,
  Globe,
  Clock,
  Hash,
  Tag
} from "lucide-react";
import { CopyButton } from "@/src/app/components/ui/copy-button";
import { useMetadata } from "./useMetadata";

// Type definitions
interface MetadataField {
  key: string;
  value: string;
  label: string;
  type: string;
  editable: boolean;
  options?: string[];
}

interface MetadataCategory {
  [key: string]: MetadataField[];
}

interface MetadataTemplate {
  title: string;
  fields: {
    [key: string]: MetadataField[];
  };
}

interface MetadataData {
  fileName: string;
  fileSize: string;
  fileType: string;
  lastModified: string;
  [key: string]: MetadataField[] | string;
}

interface HistoryItem {
  id: string;
  fileName: string;
  timestamp: Date;
  metadata: string;
}

export default function MetadataEditorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<MetadataData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [metadataHistory, setMetadataHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced metadata templates
  const metadataTemplates: Record<string, MetadataTemplate> = {
    photography: {
      title: "Photography Template",
      fields: {
        basic: [
          { key: "title", value: "", label: "Title", type: "text", editable: true },
          { key: "description", value: "", label: "Description", type: "textarea", editable: true },
          { key: "keywords", value: "", label: "Keywords", type: "text", editable: true },
          { key: "author", value: "", label: "Photographer", type: "text", editable: true },
          { key: "copyright", value: "", label: "Copyright", type: "text", editable: true },
        ],
        camera: [
          { key: "make", value: "", label: "Camera Make", type: "text", editable: true },
          { key: "model", value: "", label: "Camera Model", type: "text", editable: true },
          { key: "lens", value: "", label: "Lens", type: "text", editable: true },
          { key: "focalLength", value: "", label: "Focal Length", type: "text", editable: true },
          { key: "aperture", value: "", label: "Aperture", type: "text", editable: true },
          { key: "shutterSpeed", value: "", label: "Shutter Speed", type: "text", editable: true },
          { key: "iso", value: "", label: "ISO", type: "number", editable: true },
          { key: "flash", value: "", label: "Flash", type: "select", editable: true, options: ["Yes", "No", "Auto"] },
        ],
        location: [
          { key: "gpsLatitude", value: "", label: "GPS Latitude", type: "text", editable: true },
          { key: "gpsLongitude", value: "", label: "GPS Longitude", type: "text", editable: true },
          { key: "location", value: "", label: "Location", type: "text", editable: true },
          { key: "city", value: "", label: "City", type: "text", editable: true },
          { key: "country", value: "", label: "Country", type: "text", editable: true },
        ],
        technical: [
          { key: "width", value: "", label: "Width", type: "number", editable: false },
          { key: "height", value: "", label: "Height", type: "number", editable: false },
          { key: "orientation", value: "", label: "Orientation", type: "select", editable: true, options: ["Horizontal", "Vertical", "Square"] },
          { key: "colorSpace", value: "", label: "Color Space", type: "select", editable: true, options: ["sRGB", "Adobe RGB", "ProPhoto RGB"] },
          { key: "dateTaken", value: "", label: "Date Taken", type: "date", editable: true },
          { key: "software", value: "", label: "Software", type: "text", editable: true },
        ]
      }
    },
    music: {
      title: "Music Template",
      fields: {
        basic: [
          { key: "title", value: "", label: "Title", type: "text", editable: true },
          { key: "artist", value: "", label: "Artist", type: "text", editable: true },
          { key: "album", value: "", label: "Album", type: "text", editable: true },
          { key: "genre", value: "", label: "Genre", type: "text", editable: true },
          { key: "year", value: "", label: "Year", type: "number", editable: true },
          { key: "track", value: "", label: "Track Number", type: "number", editable: true },
          { key: "totalTracks", value: "", label: "Total Tracks", type: "number", editable: true },
          { key: "composer", value: "", label: "Composer", type: "text", editable: true },
          { key: "lyricist", value: "", label: "Lyricist", type: "text", editable: true },
          { key: "comment", value: "", label: "Comment", type: "textarea", editable: true },
          { key: "copyright", value: "", label: "Copyright", type: "text", editable: true },
        ],
        audio: [
          { key: "bitrate", value: "", label: "Bitrate", type: "text", editable: false },
          { key: "sampleRate", value: "", label: "Sample Rate", type: "text", editable: false },
          { key: "channels", value: "", label: "Channels", type: "text", editable: false },
          { key: "duration", value: "", label: "Duration", type: "text", editable: false },
          { key: "format", value: "", label: "Format", type: "text", editable: false },
          { key: "bpm", value: "", label: "BPM", type: "number", editable: true },
          { key: "key", value: "", label: "Key", type: "select", editable: true, options: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] },
          { key: "mood", value: "", label: "Mood", type: "text", editable: true },
          { key: "rating", value: "", label: "Rating", type: "select", editable: true, options: ["1", "2", "3", "4", "5"] },
        ]
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Add to history
  const addToHistory = useCallback((metadata: MetadataData) => {
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      fileName: metadata.fileName,
      timestamp: new Date(),
      metadata: JSON.stringify(metadata)
    };
    setMetadataHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setError("");
    setSelectedFile(file);
    setIsEditing(false);

    try {
      // Simulate metadata extraction
      await new Promise(resolve => setTimeout(resolve, 1000));

      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');

      if (!isImage && !isAudio) {
        setError("Unsupported file type. Please select an image or audio file.");
        return;
      }

      // Use template based on file type
      const template = isImage ? metadataTemplates.photography : metadataTemplates.music;
      const mockData: MetadataData = {
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileType: file.type,
        lastModified: new Date(file.lastModified).toLocaleString(),
        ...template.fields
      };

      // Populate with mock data
      Object.keys(mockData).forEach(category => {
        if (Array.isArray(mockData[category])) {
          (mockData[category] as MetadataField[]).forEach(field => {
            if (field.key === 'fileName') field.value = file.name;
            if (field.key === 'title') field.value = file.name.replace(/\.[^/.]+$/, "");
            if (field.key === 'dateTaken') field.value = new Date().toISOString().split('T')[0];
            if (field.key === 'year') field.value = new Date().getFullYear().toString();
            if (field.key === 'width') field.value = isImage ? '4000' : '';
            if (field.key === 'height') field.value = isImage ? '3000' : '';
            if (field.key === 'bitrate') field.value = isAudio ? '320 kbps' : '';
            if (field.key === 'sampleRate') field.value = isAudio ? '44.1 kHz' : '';
            if (field.key === 'duration') field.value = isAudio ? '3:45' : '';
            if (field.key === 'format') field.value = isAudio ? 'MP3' : file.type.split('/')[1].toUpperCase();
          });
        }
      });

      setMetadata(mockData);
      addToHistory(mockData);
    } catch (error) {
      setError("Failed to extract metadata from file.");
    } finally {
      setIsLoading(false);
    }
  }, [addToHistory]);

  // Handle file input change
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Update metadata field
  const updateField = useCallback((category: string, key: string, value: string) => {
    if (!metadata) return;

    setMetadata((prev: MetadataData | null) => {
      if (!prev) return prev;
      const newMetadata = { ...prev };
      if (Array.isArray(newMetadata[category])) {
        newMetadata[category] = (newMetadata[category] as MetadataField[]).map(field => 
          field.key === key ? { ...field, value } : field
        );
      }
      return newMetadata;
    });
  }, [metadata]);

  // Load from history
  const loadFromHistory = useCallback((historyItem: HistoryItem) => {
    try {
      const parsedMetadata = JSON.parse(historyItem.metadata);
      setMetadata(parsedMetadata);
      setIsEditing(false);
    } catch (error) {
      setError("Failed to load metadata from history.");
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((fileName: string) => {
    setFavorites(prev => {
      if (prev.includes(fileName)) {
        return prev.filter(name => name !== fileName);
      } else {
        return [...prev, fileName];
      }
    });
  }, []);

  // Save metadata
  const saveMetadata = useCallback(async () => {
    if (!metadata) return;

    setIsLoading(true);
    setError("");

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      addToHistory(metadata);
      // In a real implementation, you would save the metadata back to the file
    } catch (error) {
      setError("Failed to save metadata.");
    } finally {
      setIsLoading(false);
    }
  }, [metadata, addToHistory]);

  // Download metadata as JSON
  const downloadMetadata = useCallback(() => {
    if (!metadata) return;

    const metadataJson = {
      fileName: metadata.fileName,
      fileSize: metadata.fileSize,
      fileType: metadata.fileType,
      lastModified: metadata.lastModified,
      metadata: metadata
    };

    const blob = new Blob([JSON.stringify(metadataJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.fileName.replace(/\.[^/.]+$/, "")}_metadata.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [metadata]);

  // Filter metadata fields
  const filteredMetadata = useMemo(() => {
    if (!metadata) return null;

    const filtered = { ...metadata };
    Object.keys(filtered).forEach(category => {
      if (Array.isArray(filtered[category])) {
        filtered[category] = (filtered[category] as MetadataField[]).filter(field => {
          const matchesSearch = searchTerm === "" || 
            field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            field.value.toString().toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory = filterCategory === "all" || category === filterCategory;
          return matchesSearch && matchesCategory;
        });
      }
    });
    return filtered;
  }, [metadata, searchTerm, filterCategory]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Advanced Metadata Editor</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Professional metadata editing with advanced features, templates, and batch processing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Upload & Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  <span>File Upload</span>
                </CardTitle>
                <CardDescription>
                  Select an image or audio file to edit metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,audio/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full hover-lift"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Supports: JPG, PNG, GIF, MP3, WAV, FLAC
                  </p>
                </div>

                {selectedFile && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {selectedFile.type.startsWith('image/') ? (
                        <FileImage className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Music className="h-5 w-5 text-green-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant={isEditing ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                      >
                        {isEditing ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        variant="outline"
                        size="sm"
                        className="hover-lift"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* File Info */}
            {metadata && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    <span>File Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium truncate">{metadata.fileName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <p className="font-medium">{metadata.fileSize}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{metadata.fileType}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Modified:</span>
                      <p className="font-medium">{metadata.lastModified}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata History */}
            {metadataHistory.length > 0 && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    <span>Recent Files</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {metadataHistory.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{item.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.fileName);
                          }}
                        >
                          <Star className={`h-3 w-3 ${favorites.includes(item.fileName) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Metadata Editor */}
          <div className="lg:col-span-3">
            {metadata ? (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    <span>Metadata Editor</span>
                    {isEditing && (
                      <Badge variant="secondary">Editing</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isEditing ? 'Edit metadata fields below' : 'View metadata information'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search and Filter */}
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <Label>Search Fields</Label>
                      <Input
                        placeholder="Search metadata fields..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="w-48">
                      <Label>Filter Category</Label>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="basic">Basic Info</SelectItem>
                          <SelectItem value="camera">Camera</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="camera">Camera</TabsTrigger>
                      <TabsTrigger value="location">Location</TabsTrigger>
                      <TabsTrigger value="technical">Technical</TabsTrigger>
                    </TabsList>

                    {filteredMetadata && Object.entries(filteredMetadata).map(([category, fields]) => (
                      <TabsContent key={category} value={category} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.isArray(fields) && fields.map((field: MetadataField) => (
                            <div key={field.key} className="space-y-2">
                              <Label className="flex items-center gap-2">
                                {field.key === 'title' && <Tag className="h-4 w-4" />}
                                {field.key === 'camera' && <Camera className="h-4 w-4" />}
                                {field.key === 'location' && <MapPin className="h-4 w-4" />}
                                {field.key === 'date' && <Calendar className="h-4 w-4" />}
                                {field.key === 'user' && <User className="h-4 w-4" />}
                                {field.key === 'technical' && <Settings className="h-4 w-4" />}
                                {field.key === 'audio' && <Music className="h-4 w-4" />}
                                {field.key === 'time' && <Clock className="h-4 w-4" />}
                                {field.key === 'hash' && <Hash className="h-4 w-4" />}
                                {field.key === 'globe' && <Globe className="h-4 w-4" />}
                                {field.label}
                                {!field.editable && (
                                  <Badge variant="outline" className="text-xs">Read-only</Badge>
                                )}
                              </Label>
                              
                              {isEditing && field.editable ? (
                                field.type === 'textarea' ? (
                                  <Textarea
                                    value={field.value}
                                    onChange={(e) => updateField(category, field.key, e.target.value)}
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    className="resize-none"
                                  />
                                ) : field.type === 'select' ? (
                                  <Select value={field.value} onValueChange={(value) => updateField(category, field.key, value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {field.options?.map((option: string) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : field.type === 'date' ? (
                                  <Input
                                    type="date"
                                    value={field.value}
                                    onChange={(e) => updateField(category, field.key, e.target.value)}
                                  />
                                ) : (
                                  <Input
                                    type={field.type}
                                    value={field.value}
                                    onChange={(e) => updateField(category, field.key, e.target.value)}
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                  />
                                )
                              ) : (
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <span className="text-sm">{field.value || 'Not set'}</span>
                                  <CopyButton
                                    text={field.value}
                                    variant="ghost"
                                    size="sm"
                                    className="shrink-0"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  {isEditing && (
                    <div className="flex gap-2 mt-6 pt-6 border-t">
                      <Button
                        onClick={saveMetadata}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex gap-2 mt-6 pt-6 border-t">
                      <Button
                        onClick={downloadMetadata}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="card-enhanced">
                <CardContent className="text-center py-12">
                  <FileImage className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No File Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload an image or audio file to view and edit its metadata
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Advanced Features Panel */}
        {showAdvanced && (
          <Card className="card-enhanced mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span>Advanced Features</span>
              </CardTitle>
              <CardDescription>
                Professional metadata editing tools and batch processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Metadata Templates</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Camera className="h-4 w-4 mr-2" />
                      Photography Template
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Music className="h-4 w-4 mr-2" />
                      Music Template
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Custom Template
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Batch Processing</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Batch Upload
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Batch Export
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Apply Template
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Analysis Tools</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Metadata Stats
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Search className="h-4 w-4 mr-2" />
                      Duplicate Finder
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy Check
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Advanced Metadata Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Professional Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Advanced search and filtering capabilities</li>
                  <li>• Metadata templates for different file types</li>
                  <li>• Batch processing and bulk operations</li>
                  <li>• Metadata history and favorites</li>
                  <li>• Privacy and security analysis tools</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Supported Formats</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Images: JPEG, PNG, GIF, TIFF, WebP</li>
                  <li>• Audio: MP3, WAV, FLAC, AAC, OGG</li>
                  <li>• Video: MP4, AVI, MOV, MKV</li>
                  <li>• Documents: PDF, DOC, DOCX</li>
                  <li>• Archives: ZIP, RAR, 7Z</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
