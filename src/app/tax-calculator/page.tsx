"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Badge } from "@/src/app/components/ui/badge";
import { Progress } from "@/src/app/components/ui/progress";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Calculator, DollarSign, TrendingUp, Download, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

interface TaxCalculation {
  grossIncome: number;
  deductions: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  effectiveRate: number;
  takeHomePay: number;
  breakdown: {
    bracket: string;
    amount: number;
    tax: number;
  }[];
}

export default function TaxCalculatorPage() {
  const [income, setIncome] = useState("");
  const [filingStatus, setFilingStatus] = useState("single");
  const [state, setState] = useState("none");
  const [deductions, setDeductions] = useState("");
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const [error, setError] = useState("");

  // 2024 Federal Tax Brackets (simplified)
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

  // Sample state tax rates (simplified)
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

  const calculateTax = () => {
    const grossIncome = parseFloat(income);
    const deductionAmount = parseFloat(deductions) || 0;

    if (!grossIncome || grossIncome <= 0) {
      setError("Please enter a valid income amount");
      return;
    }

    if (deductionAmount < 0) {
      setError("Deductions cannot be negative");
      return;
    }

    if (deductionAmount > grossIncome) {
      setError("Deductions cannot exceed gross income");
      return;
    }

    setError("");

    const taxableIncome = Math.max(0, grossIncome - deductionAmount);
    const brackets = federalBrackets[filingStatus];
    let federalTax = 0;
    const breakdown: { bracket: string; amount: number; tax: number }[] = [];

    // Calculate federal tax
    for (let i = 0; i < brackets.length; i++) {
      const bracket = brackets[i];
      const prevBracket = i > 0 ? brackets[i - 1] : { max: 0 };
      
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

    const totalTax = federalTax + stateTax;
    const effectiveRate = (totalTax / grossIncome) * 100;
    const takeHomePay = grossIncome - totalTax;

    setCalculation({
      grossIncome,
      deductions: deductionAmount,
      taxableIncome,
      federalTax,
      stateTax,
      totalTax,
      effectiveRate,
      takeHomePay,
      breakdown
    });
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
        deductions: parseFloat(deductions) || 0
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
    setDeductions("");
    setCalculation(null);
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Tax Calculator</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Estimate tax liability for different regions and income types
          </p>
        </div>

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
                <label className="text-sm font-medium">Deductions & Credits</label>
                <Input
                  type="number"
                  placeholder="Enter total deductions"
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Include standard deduction, itemized deductions, and other credits
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

                  {/* Effective Tax Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Effective Tax Rate</span>
                      <span className="font-medium">{formatPercentage(calculation.effectiveRate)}</span>
                    </div>
                    <Progress value={Math.min(calculation.effectiveRate, 50)} className="h-2" />
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Tax Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gross Income</span>
                        <span>{formatCurrency(calculation.grossIncome)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Deductions</span>
                        <span>-{formatCurrency(calculation.deductions)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t pt-2">
                        <span>Taxable Income</span>
                        <span>{formatCurrency(calculation.taxableIncome)}</span>
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
                      <div className="flex justify-between text-sm font-medium border-t pt-2">
                        <span>Total Tax</span>
                        <span>{formatCurrency(calculation.totalTax)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Federal Tax Brackets */}
                  {calculation.breakdown.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Federal Tax Brackets</h4>
                      <div className="space-y-2">
                        {calculation.breakdown.map((bracket, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{bracket.bracket} bracket</span>
                            <span>{formatCurrency(bracket.tax)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
                  <li>• Standard deduction calculations</li>
                  <li>• Progressive tax rate system</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">What's Not Included</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Social Security and Medicare taxes</li>
                  <li>• Local and city taxes</li>
                  <li>• Alternative Minimum Tax (AMT)</li>
                  <li>• Complex deductions and credits</li>
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