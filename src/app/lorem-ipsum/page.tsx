"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Label } from "@/src/app/components/ui/label";
import { Input } from "@/src/app/components/ui/input";
import { Slider } from "@/src/app/components/ui/slider";
import { Switch } from "@/src/app/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Copy, RotateCcw, FileText, Settings } from "lucide-react";
import { toast } from "react-hot-toast";

export default function LoremIpsumGeneratorPage() {
  const [generatedText, setGeneratedText] = useState("");
  const [paragraphs, setParagraphs] = useState(3);
  const [words, setWords] = useState(50);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [includeHTML, setIncludeHTML] = useState(false);

  const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
    "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
    "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
    "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
    "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est",
    "laborum", "sed", "ut", "perspiciatis", "unde", "omnis", "iste", "natus",
    "error", "sit", "voluptatem", "accusantium", "doloremque", "laudantium",
    "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab", "illo", "inventore",
    "veritatis", "et", "quasi", "architecto", "beatae", "vitae", "dicta", "sunt",
    "explicabo", "nemo", "enim", "ipsam", "voluptatem", "quia", "voluptas", "sit",
    "aspernatur", "aut", "odit", "aut", "fugit", "sed", "quia", "consequuntur",
    "magni", "dolores", "eos", "qui", "ratione", "voluptatem", "sequi", "nesciunt",
    "neque", "porro", "quisquam", "est", "qui", "dolorem", "ipsum", "quia", "dolor",
    "sit", "amet", "consectetur", "adipisci", "velit", "sed", "quia", "non", "numquam",
    "eius", "modi", "tempora", "incidunt", "ut", "labore", "et", "dolore", "magnam",
    "aliquam", "quaerat", "voluptatem", "ut", "enim", "ad", "minima", "veniam",
    "quis", "nostrum", "exercitationem", "ullam", "corporis", "suscipit", "laboriosam",
    "nisi", "ut", "aliquid", "ex", "ea", "commodi", "consequatur", "quis", "autem",
    "vel", "eum", "iure", "reprehenderit", "qui", "in", "ea", "voluptate", "velit",
    "esse", "quam", "nihil", "molestiae", "consequatur", "vel", "illum", "qui",
    "dolorem", "eum", "fugiat", "quo", "voluptas", "nulla", "pariatur", "at", "vero",
    "eos", "et", "accusamus", "et", "iusto", "odio", "dignissimos", "ducimus",
    "qui", "blanditiis", "praesentium", "voluptatum", "deleniti", "atque", "corrupti",
    "quos", "dolores", "et", "quas", "molestias", "excepturi", "sint", "occaecati",
    "cupiditate", "non", "provident", "similique", "sunt", "in", "culpa", "qui",
    "officia", "deserunt", "mollitia", "animi", "id", "est", "laborum", "et",
    "dolorum", "fuga", "et", "harum", "quidem", "rerum", "facilis", "est", "et",
    "expedita", "distinctio", "nam", "libero", "tempore", "cum", "soluta", "nobis",
    "est", "eligendi", "optio", "cumque", "nihil", "impedit", "quo", "minus", "id",
    "quod", "maxime", "placeat", "facere", "possimus", "omnis", "voluptas", "assumenda",
    "est", "omnis", "dolor", "repellendus", "temporibus", "autem", "quibusdam", "et",
    "aut", "officiis", "debitis", "aut", "rerum", "necessitatibus", "saepe", "eveniet",
    "ut", "et", "voluptates", "repudiandae", "sint", "et", "molestiae", "non",
    "recusandae", "itaque", "earum", "rerum", "hic", "tenetur", "a", "sapiente",
    "delectus", "ut", "aut", "reiciendis", "voluptatibus", "maiores", "alias",
    "consequatur", "aut", "perferendis", "doloribus", "asperiores", "repellat"
  ];

  const generateLoremIpsum = (type: 'paragraphs' | 'words') => {
    let result = "";
    
    if (type === 'paragraphs') {
      for (let i = 0; i < paragraphs; i++) {
        const sentenceCount = Math.floor(Math.random() * 3) + 3; // 3-5 sentences per paragraph
        let paragraph = "";
        
        for (let j = 0; j < sentenceCount; j++) {
          const wordCount = Math.floor(Math.random() * 15) + 8; // 8-22 words per sentence
          let sentence = "";
          
          for (let k = 0; k < wordCount; k++) {
            const randomWord = loremWords[Math.floor(Math.random() * loremWords.length)];
            sentence += (k === 0 ? randomWord.charAt(0).toUpperCase() + randomWord.slice(1) : randomWord) + " ";
          }
          
          sentence = sentence.trim() + ". ";
          paragraph += sentence;
        }
        
        if (includeHTML) {
          result += `<p>${paragraph.trim()}</p>\n\n`;
        } else {
          result += paragraph.trim() + "\n\n";
        }
      }
    } else {
      // Generate by word count
      let wordList = [];
      for (let i = 0; i < words; i++) {
        const randomWord = loremWords[Math.floor(Math.random() * loremWords.length)];
        wordList.push(randomWord);
      }
      
      // Capitalize first word if starting with Lorem
      if (startWithLorem && wordList.length > 0) {
        wordList[0] = "lorem";
        wordList[1] = "ipsum";
        wordList[2] = "dolor";
        wordList[3] = "sit";
        wordList[4] = "amet";
      }
      
      // Add periods and commas for natural flow
      let formattedWords = wordList.map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        if (index % 15 === 0 && index > 0) {
          return word + ".";
        }
        if (index % 5 === 0 && index > 0) {
          return word + ",";
        }
        return word;
      });
      
      result = formattedWords.join(" ") + ".";
    }
    
    setGeneratedText(result.trim());
  };

  const copyToClipboard = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText)
      .then(() => toast.success("Text copied to clipboard!"))
      .catch(() => toast.error("Failed to copy text."));
  };

  const clearText = () => {
    setGeneratedText("");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Lorem Ipsum Generator</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Generate placeholder text for design and development projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Section */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Generator Settings
              </CardTitle>
              <CardDescription>
                Configure your Lorem Ipsum generation options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="paragraphs" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="paragraphs">Paragraphs</TabsTrigger>
                  <TabsTrigger value="words">Words</TabsTrigger>
                </TabsList>

                <TabsContent value="paragraphs" className="space-y-4">
                  <div>
                    <Label>Number of Paragraphs: {paragraphs}</Label>
                    <Slider
                      value={[paragraphs]}
                      onValueChange={([value]) => setParagraphs(value)}
                      max={20}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1</span>
                      <span>20</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="html"
                      checked={includeHTML}
                      onCheckedChange={setIncludeHTML}
                    />
                    <Label htmlFor="html">Include HTML tags (&lt;p&gt;)</Label>
                  </div>
                  
                  <Button
                    onClick={() => generateLoremIpsum('paragraphs')}
                    className="w-full btn-enhanced hover-lift"
                  >
                    Generate Paragraphs
                  </Button>
                </TabsContent>

                <TabsContent value="words" className="space-y-4">
                  <div>
                    <Label>Number of Words: {words}</Label>
                    <Slider
                      value={[words]}
                      onValueChange={([value]) => setWords(value)}
                      max={500}
                      min={10}
                      step={10}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10</span>
                      <span>500</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="lorem"
                      checked={startWithLorem}
                      onCheckedChange={setStartWithLorem}
                    />
                    <Label htmlFor="lorem">Start with "Lorem ipsum dolor sit amet"</Label>
                  </div>
                  
                  <Button
                    onClick={() => generateLoremIpsum('words')}
                    className="w-full btn-enhanced hover-lift"
                  >
                    Generate Words
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Text
              </CardTitle>
              <CardDescription>
                Your Lorem Ipsum text will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Generated Lorem Ipsum text will appear here..."
                value={generatedText}
                readOnly
                className="min-h-[300px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="btn-enhanced hover-lift">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
                <Button onClick={clearText} variant="outline" className="btn-enhanced hover-lift">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>About Lorem Ipsum</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  Lorem Ipsum is dummy text used in laying out print, graphic or web designs. 
                  The passage is attributed to an unknown typesetter in the 15th century.
                </p>
                <p>
                  It has survived not only five centuries, but also the leap into electronic 
                  typesetting, remaining essentially unchanged.
                </p>
                <p>
                  The text is derived from sections 1.10.32 and 1.10.33 of Cicero's 
                  "De finibus bonorum et malorum" (The Extremes of Good and Evil).
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle>Usage Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Design Mockups:</strong> Use for placeholder text in UI/UX designs
                </div>
                <div>
                  <strong>Content Planning:</strong> Test layouts before writing actual content
                </div>
                <div>
                  <strong>Typography Testing:</strong> Evaluate font choices and spacing
                </div>
                <div>
                  <strong>Development:</strong> Fill content areas during development
                </div>
                <div>
                  <strong>Print Layouts:</strong> Test document formatting and page breaks
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 