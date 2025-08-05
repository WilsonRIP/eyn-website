"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Label } from "@/src/app/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Copy, RotateCcw, FileText, Type } from "lucide-react";
import { toast } from "react-hot-toast";

export default function TextCaseConverterPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  const convertToCase = (text: string, caseType: string) => {
    if (!text) return "";

    switch (caseType) {
      case "uppercase":
        return text.toUpperCase();
      case "lowercase":
        return text.toLowerCase();
      case "titlecase":
        return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      case "camelcase":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
      case "pascalcase":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/^[a-z]/, (chr) => chr.toUpperCase());
      case "snakecase":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, "_")
          .replace(/^_|_$/g, "");
      case "kebabcase":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      case "dotcase":
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, ".")
          .replace(/^\.|\.$/g, "");
      case "invertcase":
        return text
          .split("")
          .map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())
          .join("");
      case "alternating":
        return text
          .split("")
          .map((char, index) => index % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
          .join("");
      case "sentencecase":
        return text
          .toLowerCase()
          .replace(/(^\w|\.\s+\w)/g, (letter) => letter.toUpperCase());
      case "remove-spaces":
        return text.replace(/\s+/g, "");
      case "remove-extra-spaces":
        return text.replace(/\s+/g, " ").trim();
      case "remove-punctuation":
        return text.replace(/[^\w\s]/g, "");
      case "remove-numbers":
        return text.replace(/\d/g, "");
      case "remove-letters":
        return text.replace(/[a-zA-Z]/g, "");
      default:
        return text;
    }
  };

  const handleConvert = (caseType: string) => {
    const converted = convertToCase(inputText, caseType);
    setOutputText(converted);
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText)
      .then(() => toast.success("Text copied to clipboard!"))
      .catch(() => toast.error("Failed to copy text."));
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
  };

  const caseTypes = [
    { id: "uppercase", name: "UPPERCASE", description: "ALL CAPITAL LETTERS" },
    { id: "lowercase", name: "lowercase", description: "all small letters" },
    { id: "titlecase", name: "Title Case", description: "First Letter Of Each Word" },
    { id: "sentencecase", name: "Sentence case", description: "First letter of each sentence" },
    { id: "camelcase", name: "camelCase", description: "firstWordSecondWord" },
    { id: "pascalcase", name: "PascalCase", description: "FirstWordSecondWord" },
    { id: "snakecase", name: "snake_case", description: "first_word_second_word" },
    { id: "kebabcase", name: "kebab-case", description: "first-word-second-word" },
    { id: "dotcase", name: "dot.case", description: "first.word.second.word" },
    { id: "invertcase", name: "InVeRt CaSe", description: "Invert the case of each letter" },
    { id: "alternating", name: "aLtErNaTiNg", description: "Alternate between upper and lower" },
  ];

  const textCleaners = [
    { id: "remove-spaces", name: "Remove All Spaces", description: "Remove all spaces from text" },
    { id: "remove-extra-spaces", name: "Remove Extra Spaces", description: "Remove multiple spaces" },
    { id: "remove-punctuation", name: "Remove Punctuation", description: "Remove all punctuation marks" },
    { id: "remove-numbers", name: "Remove Numbers", description: "Remove all numeric characters" },
    { id: "remove-letters", name: "Remove Letters", description: "Remove all alphabetic characters" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Text Case Converter</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Convert text between different cases and formats with ease
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Input Text
              </CardTitle>
              <CardDescription>
                Enter or paste your text here to convert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={clearAll} variant="outline" className="btn-enhanced hover-lift">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Converted Text
              </CardTitle>
              <CardDescription>
                Your converted text will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Converted text will appear here..."
                value={outputText}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="btn-enhanced hover-lift">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Options */}
        <Tabs defaultValue="cases" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cases">Case Conversions</TabsTrigger>
            <TabsTrigger value="cleaners">Text Cleaners</TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caseTypes.map((caseType) => (
                <Card key={caseType.id} className="card-enhanced">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-mono">{caseType.name}</CardTitle>
                    <CardDescription className="text-sm">{caseType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleConvert(caseType.id)}
                      className="w-full btn-enhanced hover-lift"
                      variant="outline"
                    >
                      Convert
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cleaners" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {textCleaners.map((cleaner) => (
                <Card key={cleaner.id} className="card-enhanced">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{cleaner.name}</CardTitle>
                    <CardDescription className="text-sm">{cleaner.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleConvert(cleaner.id)}
                      className="w-full btn-enhanced hover-lift"
                      variant="outline"
                    >
                      Clean Text
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Case Conversion Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>UPPERCASE:</strong> Converts all letters to capital letters
                </div>
                <div>
                  <strong>lowercase:</strong> Converts all letters to small letters
                </div>
                <div>
                  <strong>Title Case:</strong> Capitalizes the first letter of each word
                </div>
                <div>
                  <strong>camelCase:</strong> First word lowercase, subsequent words capitalized
                </div>
                <div>
                  <strong>PascalCase:</strong> First letter of each word capitalized
                </div>
                <div>
                  <strong>snake_case:</strong> Words separated by underscores
                </div>
                <div>
                  <strong>kebab-case:</strong> Words separated by hyphens
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Text Cleaning Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Remove All Spaces:</strong> Eliminates all whitespace characters
                </div>
                <div>
                  <strong>Remove Extra Spaces:</strong> Normalizes multiple spaces to single spaces
                </div>
                <div>
                  <strong>Remove Punctuation:</strong> Removes all punctuation marks
                </div>
                <div>
                  <strong>Remove Numbers:</strong> Removes all numeric characters
                </div>
                <div>
                  <strong>Remove Letters:</strong> Removes all alphabetic characters
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 