"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Badge } from "@/src/app/components/ui/badge";
import FileUpload from "@/src/app/components/FileUpload";
import MultiFileUpload from "@/src/app/components/MultiFileUpload";

export default function FileUploadDemoPage() {
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<FileList | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 animate-slide-in-left">File Upload Components Demo</h1>
          <p className="text-muted-foreground animate-slide-in-right">
            Explore the different file upload components and their configurations
          </p>
        </div>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="single">Single File</TabsTrigger>
            <TabsTrigger value="multiple">Multiple Files</TabsTrigger>
            <TabsTrigger value="image">Image Upload</TabsTrigger>
            <TabsTrigger value="video">Video Upload</TabsTrigger>
            <TabsTrigger value="audio">Audio Upload</TabsTrigger>
          </TabsList>

          {/* Single File Upload */}
          <TabsContent value="single" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Single File Upload</CardTitle>
                <CardDescription>
                  Basic single file upload with drag and drop support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  id="single-file"
                  label="Upload any file"
                  accept="*/*"
                  onFileChange={setSingleFile}
                  file={singleFile}
                  maxSize={50}
                  placeholder="Choose a file or drag it here"
                />
                
                {singleFile && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Selected File:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {singleFile.name}</p>
                      <p><strong>Size:</strong> {(singleFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p><strong>Type:</strong> {singleFile.type || 'Unknown'}</p>
                      <p><strong>Last Modified:</strong> {new Date(singleFile.lastModified).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Multiple Files Upload */}
          <TabsContent value="multiple" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Multiple Files Upload</CardTitle>
                <CardDescription>
                  Upload multiple files with individual file management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MultiFileUpload
                  id="multiple-files"
                  label="Upload multiple files"
                  accept="*/*"
                  onFilesChange={setMultipleFiles}
                  files={multipleFiles}
                  maxSize={25}
                  maxFiles={5}
                  placeholder="Choose files or drag them here"
                />
                
                {multipleFiles && multipleFiles.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Selected Files ({multipleFiles.length}):</h4>
                    <div className="space-y-2">
                      {Array.from(multipleFiles).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown'}
                            </p>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            #{index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Upload */}
          <TabsContent value="image" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Image Upload with Preview</CardTitle>
                <CardDescription>
                  Upload images with automatic preview and validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  id="image-file"
                  label="Upload Image"
                  accept="image/*"
                  onFileChange={setImageFile}
                  file={imageFile}
                  showPreview={true}
                  maxSize={10}
                  placeholder="Choose an image file or drag it here"
                />
                
                {imageFile && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Image Details:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {imageFile.name}</p>
                      <p><strong>Size:</strong> {(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p><strong>Type:</strong> {imageFile.type}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Upload */}
          <TabsContent value="video" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Video Upload</CardTitle>
                <CardDescription>
                  Upload video files with size validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  id="video-file"
                  label="Upload Video"
                  accept="video/*"
                  onFileChange={setVideoFile}
                  file={videoFile}
                  maxSize={500}
                  placeholder="Choose a video file or drag it here"
                />
                
                {videoFile && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Video Details:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {videoFile.name}</p>
                      <p><strong>Size:</strong> {(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p><strong>Type:</strong> {videoFile.type}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audio Upload */}
          <TabsContent value="audio" className="space-y-4">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Audio Upload</CardTitle>
                <CardDescription>
                  Upload audio files with format validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload
                  id="audio-file"
                  label="Upload Audio"
                  accept="audio/*"
                  onFileChange={setAudioFile}
                  file={audioFile}
                  maxSize={100}
                  placeholder="Choose an audio file or drag it here"
                />
                
                {audioFile && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Audio Details:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {audioFile.name}</p>
                      <p><strong>Size:</strong> {(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p><strong>Type:</strong> {audioFile.type}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Component Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>FileUpload Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  Drag and drop support
                </li>
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  File type validation
                </li>
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  File size validation
                </li>
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  Image preview support
                </li>
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  Error handling
                </li>
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  File removal
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>MultiFileUpload Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  Multiple file selection
                </li>
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  Individual file removal
                </li>
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  Clear all files
                </li>
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  File count limits
                </li>
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  File type icons
                </li>
                <li className="flex items-center">
                  <Badge variant="outline" className="mr-2">✓</Badge>
                  Scrollable file list
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 