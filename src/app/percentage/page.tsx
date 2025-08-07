"use client";

import { useState } from "react";
import { Percent, Calculator, ArrowRight, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Badge } from "@/src/app/components/ui/badge";

interface CalculationResult {
  result: number;
  formula: string;
  explanation: string;
}

export default function PercentagePage() {
  const [activeTab, setActiveTab] = useState("basic");
  
  // Basic percentage calculation
  const [basicValue, setBasicValue] = useState("");
  const [basicPercent, setBasicPercent] = useState("");
  const [basicResult, setBasicResult] = useState<CalculationResult | null>(null);

  // Percentage of total
  const [partValue, setPartValue] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [percentageResult, setPercentageResult] = useState<CalculationResult | null>(null);

  // Percentage change
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [changeResult, setChangeResult] = useState<CalculationResult | null>(null);

  // Percentage increase/decrease
  const [originalValue, setOriginalValue] = useState("");
  const [changePercent, setChangePercent] = useState("");
  const [increaseResult, setIncreaseResult] = useState<CalculationResult | null>(null);

  // Discount calculation
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountResult, setDiscountResult] = useState<CalculationResult | null>(null);

  const calculateBasicPercentage = () => {
    const value = parseFloat(basicValue);
    const percent = parseFloat(basicPercent);
    
    if (isNaN(value) || isNaN(percent)) return;
    
    const result = (value * percent) / 100;
    const formula = `${value} × ${percent}% = ${value} × ${percent/100} = ${result}`;
    const explanation = `${percent}% of ${value} is ${result}`;
    
    setBasicResult({ result, formula, explanation });
  };

  const calculatePercentageOfTotal = () => {
    const part = parseFloat(partValue);
    const total = parseFloat(totalValue);
    
    if (isNaN(part) || isNaN(total) || total === 0) return;
    
    const result = (part / total) * 100;
    const formula = `(${part} ÷ ${total}) × 100 = ${(part/total).toFixed(4)} × 100 = ${result.toFixed(2)}%`;
    const explanation = `${part} is ${result.toFixed(2)}% of ${total}`;
    
    setPercentageResult({ result, formula, explanation });
  };

  const calculatePercentageChange = () => {
    const old = parseFloat(oldValue);
    const newVal = parseFloat(newValue);
    
    if (isNaN(old) || isNaN(newVal)) return;
    
    const change = newVal - old;
    const result = (change / old) * 100;
    const formula = `((${newVal} - ${old}) ÷ ${old}) × 100 = (${change} ÷ ${old}) × 100 = ${result.toFixed(2)}%`;
    const explanation = `The value changed from ${old} to ${newVal}, which is a ${result >= 0 ? 'increase' : 'decrease'} of ${Math.abs(result).toFixed(2)}%`;
    
    setChangeResult({ result, formula, explanation });
  };

  const calculatePercentageIncrease = () => {
    const original = parseFloat(originalValue);
    const percent = parseFloat(changePercent);
    
    if (isNaN(original) || isNaN(percent)) return;
    
    const change = (original * percent) / 100;
    const result = original + change;
    const formula = `${original} + (${original} × ${percent}%) = ${original} + ${change} = ${result}`;
    const explanation = `After a ${percent}% ${percent >= 0 ? 'increase' : 'decrease'}, the value becomes ${result}`;
    
    setIncreaseResult({ result, formula, explanation });
  };

  const calculateDiscount = () => {
    const price = parseFloat(originalPrice);
    const discount = parseFloat(discountPercent);
    
    if (isNaN(price) || isNaN(discount)) return;
    
    const discountAmount = (price * discount) / 100;
    const finalPrice = price - discountAmount;
    const formula = `${price} - (${price} × ${discount}%) = ${price} - ${discountAmount} = ${finalPrice}`;
    const explanation = `With a ${discount}% discount, you save $${discountAmount.toFixed(2)} and pay $${finalPrice.toFixed(2)}`;
    
    setDiscountResult({ result: finalPrice, formula, explanation });
  };

  const clearAll = () => {
    setBasicValue("");
    setBasicPercent("");
    setBasicResult(null);
    setPartValue("");
    setTotalValue("");
    setPercentageResult(null);
    setOldValue("");
    setNewValue("");
    setChangeResult(null);
    setOriginalValue("");
    setChangePercent("");
    setIncreaseResult(null);
    setOriginalPrice("");
    setDiscountPercent("");
    setDiscountResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Percent className="h-6 w-6" />
              Percentage Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearAll} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Clear All
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="percentage">% of Total</TabsTrigger>
                <TabsTrigger value="change">% Change</TabsTrigger>
                <TabsTrigger value="increase">% Increase/Decrease</TabsTrigger>
                <TabsTrigger value="discount">Discount</TabsTrigger>
              </TabsList>

              {/* Basic Percentage Calculation */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="basic-value">Value</Label>
                      <Input
                        id="basic-value"
                        type="number"
                        placeholder="Enter value"
                        value={basicValue}
                        onChange={(e) => setBasicValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="basic-percent">Percentage (%)</Label>
                      <Input
                        id="basic-percent"
                        type="number"
                        placeholder="Enter percentage"
                        value={basicPercent}
                        onChange={(e) => setBasicPercent(e.target.value)}
                      />
                    </div>
                    <Button onClick={calculateBasicPercentage} className="w-full">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {basicResult && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3">
                        <div className="text-center">
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            Result: {basicResult.result.toFixed(2)}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Formula:</strong> {basicResult.formula}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Explanation:</strong> {basicResult.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Percentage of Total */}
              <TabsContent value="percentage" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="part-value">Part Value</Label>
                      <Input
                        id="part-value"
                        type="number"
                        placeholder="Enter part value"
                        value={partValue}
                        onChange={(e) => setPartValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total-value">Total Value</Label>
                      <Input
                        id="total-value"
                        type="number"
                        placeholder="Enter total value"
                        value={totalValue}
                        onChange={(e) => setTotalValue(e.target.value)}
                      />
                    </div>
                    <Button onClick={calculatePercentageOfTotal} className="w-full">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {percentageResult && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3">
                        <div className="text-center">
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            Result: {percentageResult.result.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Formula:</strong> {percentageResult.formula}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Explanation:</strong> {percentageResult.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Percentage Change */}
              <TabsContent value="change" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="old-value">Old Value</Label>
                      <Input
                        id="old-value"
                        type="number"
                        placeholder="Enter old value"
                        value={oldValue}
                        onChange={(e) => setOldValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-value">New Value</Label>
                      <Input
                        id="new-value"
                        type="number"
                        placeholder="Enter new value"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                      />
                    </div>
                    <Button onClick={calculatePercentageChange} className="w-full">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {changeResult && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3">
                        <div className="text-center">
                          <Badge 
                            variant={changeResult.result >= 0 ? "default" : "destructive"} 
                            className="text-lg px-3 py-1"
                          >
                            {changeResult.result >= 0 ? '+' : ''}{changeResult.result.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Formula:</strong> {changeResult.formula}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Explanation:</strong> {changeResult.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Percentage Increase/Decrease */}
              <TabsContent value="increase" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="original-value">Original Value</Label>
                      <Input
                        id="original-value"
                        type="number"
                        placeholder="Enter original value"
                        value={originalValue}
                        onChange={(e) => setOriginalValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="change-percent">Percentage Change (%)</Label>
                      <Input
                        id="change-percent"
                        type="number"
                        placeholder="Enter percentage (use - for decrease)"
                        value={changePercent}
                        onChange={(e) => setChangePercent(e.target.value)}
                      />
                    </div>
                    <Button onClick={calculatePercentageIncrease} className="w-full">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {increaseResult && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3">
                        <div className="text-center">
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            Result: {increaseResult.result.toFixed(2)}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Formula:</strong> {increaseResult.formula}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Explanation:</strong> {increaseResult.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Discount Calculation */}
              <TabsContent value="discount" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="original-price">Original Price</Label>
                      <Input
                        id="original-price"
                        type="number"
                        placeholder="Enter original price"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount-percent">Discount Percentage (%)</Label>
                      <Input
                        id="discount-percent"
                        type="number"
                        placeholder="Enter discount percentage"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                      />
                    </div>
                    <Button onClick={calculateDiscount} className="w-full">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {discountResult && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3">
                        <div className="text-center">
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            Final Price: ${discountResult.result.toFixed(2)}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Formula:</strong> {discountResult.formula}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Explanation:</strong> {discountResult.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
