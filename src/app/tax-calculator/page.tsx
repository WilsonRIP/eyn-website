"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Badge } from "@/src/app/components/ui/badge";
import { Progress } from "@/src/app/components/ui/progress";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { Separator } from "@/src/app/components/ui/separator";
import { Calculator, DollarSign, TrendingUp, Download, RotateCcw, AlertTriangle, CheckCircle, History, Info, FileText, BarChart3, PieChart } from "lucide-react";

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

interface TaxCalculation {
  id: string;
  grossIncome: number;
  preTaxDeductions: number;
  postTaxDeductions: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  totalTax: number;
  effectiveRate: number;
  takeHomePay: number;
  monthlyTakeHome: number;
  breakdown: {
    bracket: string;
    amount: number;
    tax: number;
  }[];
  timestamp: Date;
}

interface TaxHistoryItem {
  id: string;
  grossIncome: number;
  filingStatus: string;
  state: string;
  totalTax: number;
  effectiveRate: number;
  timestamp: Date;
}

export default function TaxCalculatorPage() {
  const [income, setIncome] = useState("");
  const [filingStatus, setFilingStatus] = useState("single");
  const [state, setState] = useState("none");
  const [preTaxDeductions, setPreTaxDeductions] = useState("");
  const [postTaxDeductions, setPostTaxDeductions] = useState("");
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("calculator");
  const [taxHistory, setTaxHistory] = useState<TaxHistoryItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // 2024 Federal Tax Brackets
  const federalBrackets: Record<string, TaxBracket[]> = {
    single: [
      { min: 0, max: 11600, rate: 0.10 },
      { min: 11600, max: 47150, rate: 0.12 },
      { min: 47150, max: 100525, rate: 0.22 },
      { min: 100525, max: 191950, rate: 0.24 },
      { min: 191950, max: 243725, rate: 0.32 },
      { min: 243725, max: 609350, rate: 0.35 },
      { min: 609350, max: Infinity, rate: 0.37 }
    ],
    married: [
      { min: 0, max: 23200, rate: 0.10 },
      { min: 23200, max: 94300, rate: 0.12 },
      { min: 94300, max: 201050, rate: 0.22 },
      { min: 201050, max: 383900, rate: 0.24 },
      { min: 383900, max: 487450, rate: 0.32 },
      { min: 487450, max: 731200, rate: 0.35 },
      { min: 731200, max: Infinity, rate: 0.37 }
    ],
    head: [
      { min: 0, max: 16550, rate: 0.10 },
      { min: 16550, max: 63100, rate: 0.12 },
      { min: 63100, max: 100500, rate: 0.22 },
      { min: 100500, max: 191950, rate: 0.24 },
      { min: 191950, max: 243700, rate: 0.32 },
      { min: 243700, max: 609350, rate: 0.35 },
      { min: 609350, max: Infinity, rate: 0.37 }
    ]
  };

  // State tax rates (simplified)
  const stateTaxRates: Record<string, number> = {
    none: 0,
    california: 0.075,
    newyork: 0.0685,
    texas: 0,
    florida: 0,
    washington: 0,
    colorado: 0.044,
    illinois: 0.0495,
    pennsylvania: 0.0307,
    ohio: 0.0399,
    michigan: 0.0425
  };

  const states = [
    { value: "none", label: "No State Tax" },
    { value: "california", label: "California" },
    { value: "newyork", label: "New York" },
    { value: "texas", label: "Texas" },
    { value: "florida", label: "Florida" },
    { value: "washington", label: "Washington" },
    { value: "colorado", label: "Colorado" },
    { value: "illinois", label: "Illinois" },
    { value: "pennsylvania", label: "Pennsylvania" },
    { value: "ohio", label: "Ohio" },
    { value: "michigan", label: "Michigan" }
  ];

  // Load tax history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("taxCalculationHistory");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          // Convert timestamp strings back to Date objects
          const historyWithDates = parsed.map(item => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setTaxHistory(historyWithDates);
        }
      } catch (e) {
        console.error("Failed to parse tax history", e);
      }
    }
  }, []);

  // Save tax history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("taxCalculationHistory", JSON.stringify(taxHistory));
  }, [taxHistory]);

  const calculateTax = () => {
    const grossIncome = parseFloat(income);
    const preTaxAmount = parseFloat(preTaxDeductions) || 0;
    const postTaxAmount = parseFloat(postTaxDeductions) || 0;

    if (!grossIncome || grossIncome <= 0) {
      setError("Please enter a valid income amount");
      return;
    }

    if (preTaxAmount < 0 || postTaxAmount < 0) {
      setError("Deductions cannot be negative");
      return;
    }

    if (preTaxAmount > grossIncome) {
      setError("Pre-tax deductions cannot exceed gross income");
      return;
    }

    setError("");

    // Calculate taxable income after pre-tax deductions
    const taxableIncome = Math.max(0, grossIncome - preTaxAmount);
    const brackets = federalBrackets[filingStatus];
    let federalTax = 0;
    const breakdown: { bracket: string; amount: number; tax: number }[] = [];

    // Calculate federal tax
    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i];
      
      if (taxableIncome > bracket.min) {
        const bracketAmount = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
        const bracketTax = bracketAmount * bracket.rate;
        federalTax += bracketTax;

        breakdown.push({
          bracket: `${bracket.rate * 100}%`,
          amount: bracketAmount,
          tax: bracketTax
        });
      }
    }

    // Calculate state tax
    const stateTaxRate = stateTaxRates[state];
    const stateTax = taxableIncome * stateTaxRate;

    // Calculate FICA taxes (Social Security and Medicare)
    // Social Security: 6.2% on income up to $168,600 (2024)
    const socialSecurityLimit = 168600;
    const socialSecurityRate = 0.062;
    const socialSecurityTax = Math.min(grossIncome, socialSecurityLimit) * socialSecurityRate;
    
    // Medicare: 1.45% on all income, plus 0.9% on income above $200,000 (single) or $250,000 (married)
    const medicareRate = 0.0145;
    const medicareAdditionalRate = 0.009;
    const medicareThreshold = filingStatus === "married" ? 250000 : 200000;
    const medicareTax = grossIncome * medicareRate;
    const additionalMedicareTax = grossIncome > medicareThreshold ? 
      (grossIncome - medicareThreshold) * medicareAdditionalRate : 0;
    
    const ficaTax = socialSecurityTax + medicareTax + additionalMedicareTax;

    const totalTax = federalTax + stateTax + ficaTax;
    const effectiveRate = (totalTax / grossIncome) * 100;
    const takeHomePay = grossIncome - totalTax - postTaxAmount;
    const monthlyTakeHome = takeHomePay / 12;

    const newCalculation: TaxCalculation = {
      id: Date.now().toString(),
      grossIncome,
      preTaxDeductions: preTaxAmount,
      postTaxDeductions: postTaxAmount,
      taxableIncome,
      federalTax,
      stateTax,
      ficaTax,
      totalTax,
      effectiveRate,
      takeHomePay,
      monthlyTakeHome,
      breakdown,
      timestamp: new Date()
    };

    setCalculation(newCalculation);

    // Add to history
    const historyItem: TaxHistoryItem = {
      id: newCalculation.id,
      grossIncome,
      filingStatus,
      state,
      totalTax,
      effectiveRate,
      timestamp: new Date()
    };

    setTaxHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (rate: number): string => {
    return `${rate.toFixed(2)}%`;
  };

  const downloadCalculation = () => {
    if (!calculation) return;

    const data = {
      calculation,
      inputs: {
        income: parseFloat(income),
        filingStatus,
        state,
        preTaxDeductions: parseFloat(preTaxDeductions) || 0,
        postTaxDeductions: parseFloat(postTaxDeductions) || 0
      },
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-calculation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearCalculation = () => {
    setIncome("");
    setPreTaxDeductions("");
    setPostTaxDeductions("");
    setCalculation(null);
    setError("");
  };

  const clearHistory = () => {
    setTaxHistory([]);
  };

  const loadFromHistory = (item: TaxHistoryItem) => {
    setIncome(item.grossIncome.toString());
    setFilingStatus(item.filingStatus);
    setState(item.state);
    setActiveTab("calculator");
    calculateTax();
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Tax Calculator</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Estimate your tax liability with federal, state, and FICA taxes
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="details">Tax Details</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    <span>Tax Information</span>
                  </CardTitle>
                  <CardDescription>
                    Enter your income and filing details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gross Annual Income</label>
                    <Input
                      type="number"
                      placeholder="Enter your annual income"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filing Status</label>
                    <Select value={filingStatus} onValueChange={setFilingStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married Filing Jointly</SelectItem>
                        <SelectItem value="head">Head of Household</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pre-tax Deductions</label>
                    <Input
                      type="number"
                      placeholder="401(k), HSA, etc."
                      value={preTaxDeductions}
                      onChange={(e) => setPreTaxDeductions(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Retirement contributions, health savings accounts, etc.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Post-tax Deductions</label>
                    <Input
                      type="number"
                      placeholder="Roth IRA, etc."
                      value={postTaxDeductions}
                      onChange={(e) => setPostTaxDeductions(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Roth contributions, union dues, etc.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={calculateTax}
                      className="btn-enhanced hover-lift flex-1"
                      disabled={!income}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Tax
                    </Button>
                    <Button
                      onClick={clearCalculation}
                      variant="outline"
                      className="hover-lift"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

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

              {/* Results */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Tax Calculation</span>
                    {calculation && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </CardTitle>
                  <CardDescription>
                    Your estimated tax breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {calculation ? (
                    <div className="space-y-6">
                      {/* Summary */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(calculation.totalTax)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Tax</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(calculation.takeHomePay)}
                          </div>
                          <div className="text-sm text-muted-foreground">Take Home Pay</div>
                        </div>
                      </div>

                      {/* Monthly Take Home */}
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(calculation.monthlyTakeHome)}
                        </div>
                        <div className="text-sm text-muted-foreground">Monthly Take Home</div>
                      </div>

                      {/* Effective Tax Rate */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Effective Tax Rate</span>
                          <span className="font-medium">{formatPercentage(calculation.effectiveRate)}</span>
                        </div>
                        <Progress value={Math.min(calculation.effectiveRate, 50)} className="h-2" />
                      </div>

                      <Button
                        onClick={() => setShowDetails(!showDetails)}
                        variant="outline"
                        className="w-full hover-lift"
                      >
                        {showDetails ? "Hide Details" : "Show Details"}
                      </Button>

                      {showDetails && (
                        <>
                          {/* Breakdown */}
                          <div className="space-y-3">
                            <h4 className="font-medium">Income Breakdown</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Gross Income</span>
                                <span>{formatCurrency(calculation.grossIncome)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Pre-tax Deductions</span>
                                <span>-{formatCurrency(calculation.preTaxDeductions)}</span>
                              </div>
                              <div className="flex justify-between text-sm font-medium border-t pt-2">
                                <span>Taxable Income</span>
                                <span>{formatCurrency(calculation.taxableIncome)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Post-tax Deductions</span>
                                <span>-{formatCurrency(calculation.postTaxDeductions)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Tax Details */}
                          <div className="space-y-3">
                            <h4 className="font-medium">Tax Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Federal Tax</span>
                                <span>{formatCurrency(calculation.federalTax)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>State Tax</span>
                                <span>{formatCurrency(calculation.stateTax)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>FICA Taxes</span>
                                <span>{formatCurrency(calculation.ficaTax)}</span>
                              </div>
                              <div className="flex justify-between text-sm font-medium border-t pt-2">
                                <span>Total Tax</span>
                                <span>{formatCurrency(calculation.totalTax)}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <Button
                        onClick={downloadCalculation}
                        variant="outline"
                        className="w-full hover-lift"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Calculation
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter your information and click "Calculate Tax" to see results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Federal Tax Brackets */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Federal Tax Brackets</span>
                  </CardTitle>
                  <CardDescription>
                    2024 tax brackets for {filingStatus === "single" ? "Single" : filingStatus === "married" ? "Married Filing Jointly" : "Head of Household"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {federalBrackets[filingStatus].map((bracket, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{bracket.rate * 100}%</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(bracket.min)} - {bracket.max === Infinity ? "∞" : formatCurrency(bracket.max)}
                          </div>
                        </div>
                        {calculation && calculation.breakdown[index] && (
                          <Badge variant="outline">
                            {formatCurrency(calculation.breakdown[index].tax)}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tax Breakdown */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    <span>Tax Breakdown</span>
                  </CardTitle>
                  <CardDescription>
                    How your taxes are distributed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {calculation ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Federal Tax</span>
                          <span>{formatCurrency(calculation.federalTax)} ({formatPercentage((calculation.federalTax / calculation.totalTax) * 100)})</span>
                        </div>
                        <Progress value={(calculation.federalTax / calculation.totalTax) * 100} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>State Tax</span>
                          <span>{formatCurrency(calculation.stateTax)} ({formatPercentage((calculation.stateTax / calculation.totalTax) * 100)})</span>
                        </div>
                        <Progress value={(calculation.stateTax / calculation.totalTax) * 100} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>FICA Taxes</span>
                          <span>{formatCurrency(calculation.ficaTax)} ({formatPercentage((calculation.ficaTax / calculation.totalTax) * 100)})</span>
                        </div>
                        <Progress value={(calculation.ficaTax / calculation.totalTax) * 100} className="h-2" />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span>Total Tax</span>
                          <span>{formatCurrency(calculation.totalTax)}</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Calculate your taxes to see the breakdown</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <span>Calculation History</span>
                  {taxHistory.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearHistory}>
                      Clear History
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Your recent tax calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {taxHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No calculation history yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your calculations will appear here once you start using the calculator
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {taxHistory.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => loadFromHistory(item)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {formatCurrency(item.grossIncome)} - {item.filingStatus === "single" ? "Single" : item.filingStatus === "married" ? "Married" : "Head of Household"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {states.find(s => s.value === item.state)?.label} • {formatPercentage(item.effectiveRate)} effective rate
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(item.totalTax)}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
            <CardDescription>
              Understanding your tax calculation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">What's Included</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• 2024 Federal income tax brackets</li>
                  <li>• State income tax (where applicable)</li>
                  <li>• FICA taxes (Social Security and Medicare)</li>
                  <li>• Pre-tax and post-tax deductions</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">What's Not Included</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Local and city taxes</li>
                  <li>• Alternative Minimum Tax (AMT)</li>
                  <li>• Complex deductions and credits</li>
                  <li>• Capital gains taxes</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Disclaimer:</strong> This calculator provides estimates only and should not be used for official tax filing. 
                Consult with a qualified tax professional for accurate tax advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}