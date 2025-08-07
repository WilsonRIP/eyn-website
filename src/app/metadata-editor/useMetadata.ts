import { useState, useReducer, useCallback, useRef } from 'react';
import { toast } from "sonner";
import piexif from 'piexifjs';

// Use require for modules to avoid TypeScript import issues
const exifReader = require('exifreader');
const jsmediatags = require('jsmediatags');

// Define your types (can be in a separate types.ts file)
interface MetadataField {
  key: string;
  value: any;
  label: string;
  category: string;
  editable: boolean;
  isCustom?: boolean;
}

interface State {
  file: File | null;
  filePreviewUrl: string | null;
  metadata: Record<string, MetadataField[]> | null;
  isLoading: boolean;
  isEditing: boolean;
  error: string | null;
}

type Action =
  | { type: 'START_LOADING' }
  | { type: 'SET_FILE'; payload: { file: File; url: string } }
  | { type: 'SET_METADATA'; payload: Record<string, MetadataField[]> }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' }
  | { type: 'TOGGLE_EDITING'; payload: boolean }
  | { type: 'UPDATE_FIELD'; payload: { category: string; key: string; value: any } }
  | { type: 'ADD_CUSTOM_FIELD' }
  | { type: 'REMOVE_CUSTOM_FIELD'; payload: { key: string } }
  | { type: 'UPDATE_CUSTOM_FIELD'; payload: { oldKey: string; newKey: string; newValue: string } };

const initialState: State = {
  file: null,
  filePreviewUrl: null,
  metadata: null,
  isLoading: false,
  isEditing: false,
  error: null,
};

// --- Reducer Function ---
function metadataReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SET_FILE':
      return { ...initialState, file: action.payload.file, filePreviewUrl: action.payload.url };
    case 'SET_METADATA':
      return { ...state, metadata: action.payload, isLoading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, file: null, filePreviewUrl: null };
    case 'RESET':
        return { ...state, isEditing: false }; // Keeps file, but resets editing state. Full reset handled in handleFileSelect.
    case 'TOGGLE_EDITING':
      return { ...state, isEditing: action.payload };
    case 'UPDATE_FIELD': {
      if (!state.metadata) return state;
      const { category, key, value } = action.payload;
      const newMetadata = { ...state.metadata };
      newMetadata[category] = newMetadata[category].map(field =>
        field.key === key ? { ...field, value } : field
      );
      return { ...state, metadata: newMetadata };
    }
    case 'ADD_CUSTOM_FIELD': {
        if (!state.metadata) return state;
        const newMetadata = { ...state.metadata };
        if (!newMetadata['custom']) {
          newMetadata['custom'] = [];
        }
        const newField: MetadataField = {
            key: `customField${newMetadata['custom'].length + 1}`,
            value: '',
            label: 'New Field',
            category: 'custom',
            editable: true,
            isCustom: true
        };
        newMetadata['custom'].push(newField);
        return { ...state, metadata: newMetadata };
    }
    case 'REMOVE_CUSTOM_FIELD': {
        if (!state.metadata || !state.metadata['custom']) return state;
        const newMetadata = { ...state.metadata };
        newMetadata['custom'] = newMetadata['custom'].filter(f => f.key !== action.payload.key);
        return { ...state, metadata: newMetadata };
    }
    case 'UPDATE_CUSTOM_FIELD': {
        if (!state.metadata || !state.metadata['custom']) return state;
        const { oldKey, newKey, newValue } = action.payload;
        const newMetadata = { ...state.metadata };
        newMetadata['custom'] = newMetadata['custom'].map(f => {
            if (f.key === oldKey) {
                return { ...f, key: newKey, label: newKey, value: newValue };
            }
            return f;
        });
        return { ...state, metadata: newMetadata };
    }
    default:
      return state;
  }
}

// Mapping from EXIF/ID3 tags to our desired format
const tagMappings = {
  // Image
  'Make': { label: 'Camera Make', category: 'camera' },
  'Model': { label: 'Camera Model', category: 'camera' },
  'DateTimeOriginal': { label: 'Date Taken', category: 'basic' },
  'FNumber': { label: 'Aperture', category: 'camera' },
  'ExposureTime': { label: 'Exposure Time', category: 'camera' },
  'ISOSpeedRatings': { label: 'ISO', category: 'camera' },
  'FocalLength': { label: 'Focal Length', category: 'camera' },
  'Software': { label: 'Software', category: 'basic' },
  'Artist': { label: 'Artist', category: 'basic' },
  'Copyright': { label: 'Copyright', category: 'basic' },
  'ImageDescription': { label: 'Description', category: 'basic' },
  // Audio
  'title': { label: 'Title', category: 'basic' },
  'artist': { label: 'Artist', category: 'basic' },
  'album': { label: 'Album', category: 'basic' },
  'year': { label: 'Year', category: 'basic' },
  'genre': { label: 'Genre', category: 'basic' },
  'track': { label: 'Track', category: 'basic' },
  'composer': { label: 'Composer', category: 'basic' },
};

// Type for track info
interface TrackInfo {
  data?: any;
  no?: number;
  of?: number;
  [key: string]: any;
}

// --- The Custom Hook ---
export const useMetadata = () => {
  const [state, dispatch] = useReducer(metadataReducer, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalMetadataRef = useRef<Record<string, MetadataField[]> | null>(null);

  const parseImageMetadata = async (file: File) => {
    const tags = await exifReader.load(file);
    const parsed: Record<string, MetadataField[]> = { basic: [], camera: [] };

    // Basic file info
    parsed.basic.push({ key: 'fileName', value: file.name, label: 'File Name', category: 'basic', editable: false });

    for (const tagName in tags) {
        const mapping = tagMappings[tagName as keyof typeof tagMappings];
        if (mapping && tags[tagName as keyof typeof tags]?.description) {
            const category = mapping.category;
            if (!parsed[category]) parsed[category] = [];
            
            let value = tags[tagName as keyof typeof tags]?.description;
            if (typeof value === 'number') value = value.toString();

            parsed[category].push({
                key: tagName,
                value: value,
                label: mapping.label,
                category: category,
                editable: true,
            });
        }
    }
    return parsed;
  };

  const parseAudioMetadata = async (file: File): Promise<Record<string, MetadataField[]>> => {
    return new Promise((resolve, reject) => {
        jsmediatags.read(file, {
            onSuccess: (tag: any) => {
                const parsed: Record<string, MetadataField[]> = { basic: [], audio: [] };
                const tags = tag.tags;
                
                // Basic info
                parsed.basic.push({ key: 'fileName', value: file.name, label: 'File Name', category: 'basic', editable: false });

                for (const tagName in tags) {
                    const mapping = tagMappings[tagName as keyof typeof tagMappings];
                    if(mapping && tags[tagName as keyof typeof tags]) {
                        const category = mapping.category;
                        if (!parsed[category]) parsed[category] = [];
                        
                        let value: any = tags[tagName as keyof typeof tags];
                        // Handle complex objects like track info
                        if (typeof value === 'object' && value !== null) {
                            const trackInfo = value as TrackInfo;
                            value = trackInfo.data || `${trackInfo.no || ''}/${trackInfo.of || ''}`;
                        }

                        parsed[category].push({
                            key: tagName,
                            value,
                            label: mapping.label,
                            category,
                            editable: true
                        });
                    }
                }
                resolve(parsed);
            },
            onError: (error: any) => {
                console.error(error);
                reject("Could not read audio tags.");
            }
        });
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    dispatch({ type: 'START_LOADING' });
    const filePreviewUrl = URL.createObjectURL(file);
    dispatch({ type: 'SET_FILE', payload: { file, url: filePreviewUrl } });

    try {
      let parsedData;
      if (file.type.startsWith('image/')) {
        parsedData = await parseImageMetadata(file);
        toast.success("Image metadata loaded successfully!");
      } else if (file.type.startsWith('audio/')) {
        parsedData = await parseAudioMetadata(file);
        toast.success("Audio metadata loaded successfully!");
      } else {
        throw new Error("Unsupported file type.");
      }
      originalMetadataRef.current = JSON.parse(JSON.stringify(parsedData)); // Deep copy for reset
      dispatch({ type: 'SET_METADATA', payload: parsedData });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to parse metadata.";
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, []);

  const resetMetadata = useCallback(() => {
    if(originalMetadataRef.current) {
        dispatch({ type: 'SET_METADATA', payload: JSON.parse(JSON.stringify(originalMetadataRef.current)) });
        dispatch({ type: 'TOGGLE_EDITING', payload: false });
        toast.info("Metadata has been reset to its original state.");
    }
  }, []);

  const saveMetadata = useCallback(async () => {
    if (!state.file || !state.metadata || !state.file.type.startsWith('image/')) {
        toast.warning("Metadata saving is currently only supported for JPEG/TIFF images.");
        return;
    }

    dispatch({ type: 'START_LOADING' });
    toast.loading("Saving metadata to new file...");

    try {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(state.file);
        fileReader.onload = () => {
            const imageDataUrl = fileReader.result as string;
            let exifObj = piexif.load(imageDataUrl);

            // Update EXIF data from state
            Object.values(state.metadata!).flat().forEach(field => {
                const tagCode = piexif.TAGS[field.label as keyof typeof piexif.TAGS]?.code;
                const tagGroup = piexif.TAGS[field.label as keyof typeof piexif.TAGS]?.ifd;
                
                if (tagCode !== undefined && tagGroup !== undefined) {
                    if (!exifObj[tagGroup]) exifObj[tagGroup] = {};
                    exifObj[tagGroup][tagCode] = field.value;
                }
            });

            const exifBytes = piexif.dump(exifObj);
            const newImageDataUrl = piexif.insert(exifBytes, imageDataUrl);
            
            // Trigger download
            const a = document.createElement('a');
            a.href = newImageDataUrl;
            a.download = `edited_${state.file?.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            toast.dismiss();
            toast.success("New file with updated metadata has been downloaded!");
            dispatch({ type: 'TOGGLE_EDITING', payload: false });
        };
        fileReader.onerror = () => {
            throw new Error("Could not read file for saving.");
        };

    } catch (err: any) {
        const errorMessage = err.message || "Failed to save metadata.";
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        toast.dismiss();
        toast.error(errorMessage);
    } finally {
        // isLoading is handled by success/error toasts
    }

  }, [state.file, state.metadata]);

  const downloadMetadataJson = useCallback(() => {
    if (!state.metadata) return;
    const jsonString = JSON.stringify(state.metadata, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.file?.name.split('.')[0]}_metadata.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Metadata JSON exported.");
  }, [state.metadata, state.file?.name]);
  
  const updateField = (category: string, key: string, value: any) => dispatch({ type: 'UPDATE_FIELD', payload: { category, key, value } });
  const setIsEditing = (isEditing: boolean) => dispatch({ type: 'TOGGLE_EDITING', payload: isEditing });
  const addCustomField = () => dispatch({ type: 'ADD_CUSTOM_FIELD' });
  const removeCustomField = (key: string) => dispatch({ type: 'REMOVE_CUSTOM_FIELD', payload: { key } });
  const updateCustomField = (oldKey: string, newKey: string, newValue: string) => dispatch({ type: 'UPDATE_CUSTOM_FIELD', payload: { oldKey, newKey, newValue } });


  return {
    state,
    dispatch,
    fileInputRef,
    handleFileSelect,
    updateField,
    saveMetadata,
    resetMetadata,
    setIsEditing,
    downloadMetadataJson,
    addCustomField,
    removeCustomField,
    updateCustomField
  };
};