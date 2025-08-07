"use client";

import { useState } from "react";
import { Calculator, RotateCcw, Square, Pi, Power, Percent, Plus, Minus, X, Divide, Equal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const clearAll = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      case "^":
        return Math.pow(firstValue, secondValue);
      case "%":
        return (firstValue * secondValue) / 100;
      default:
        return secondValue;
    }
  };

  const scientificOperation = (op: string) => {
    const inputValue = parseFloat(display);
    let result: number;

    switch (op) {
      case "sin":
        result = Math.sin(inputValue * Math.PI / 180);
        break;
      case "cos":
        result = Math.cos(inputValue * Math.PI / 180);
        break;
      case "tan":
        result = Math.tan(inputValue * Math.PI / 180);
        break;
      case "log":
        result = Math.log10(inputValue);
        break;
      case "ln":
        result = Math.log(inputValue);
        break;
      case "sqrt":
        result = Math.sqrt(inputValue);
        break;
      case "square":
        result = inputValue * inputValue;
        break;
      case "cube":
        result = inputValue * inputValue * inputValue;
        break;
      case "pi":
        result = Math.PI;
        break;
      case "e":
        result = Math.E;
        break;
      case "factorial":
        result = factorial(inputValue);
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  const handleEquals = () => {
    if (!previousValue || !operation) return;

    const inputValue = parseFloat(display);
    const newValue = calculate(previousValue, inputValue, operation);
    setDisplay(String(newValue));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Calculator className="h-6 w-6" />
              Scientific Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4">
              <div className="text-right">
                <div className="text-sm text-slate-500 dark:text-slate-400 h-6">
                  {previousValue !== null && operation ? `${previousValue} ${operation}` : ""}
                </div>
                <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white break-all">
                  {display}
                </div>
              </div>
            </div>

            {/* Scientific Functions */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => scientificOperation("sin")}
                className="text-xs"
              >
                sin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scientificOperation("cos")}
                className="text-xs"
              >
                cos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scientificOperation("tan")}
                className="text-xs"
              >
                tan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scientificOperation("log")}
                className="text-xs"
              >
                log
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scientificOperation("ln")}
                className="text-xs"
              >
                ln
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scientificOperation("sqrt")}
                className="text-xs"
              >
                <Square className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scientificOperation("square")}
                className="text-xs"
              >
                <Square className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scientificOperation("cube")}
                className="text-xs"
              >
                x³
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scientificOperation("factorial")}
                className="text-xs"
              >
                x!
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scientificOperation("pi")}
                className="text-xs"
              >
                <Pi className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scientificOperation("e")}
                className="text-xs"
              >
                e
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => performOperation("^")}
                className="text-xs"
              >
                <Power className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => performOperation("%")}
                className="text-xs"
              >
                <Percent className="h-3 w-3" />
              </Button>
            </div>

            {/* Main Calculator */}
            <div className="grid grid-cols-4 gap-2">
              {/* Row 1 */}
              <Button
                variant="destructive"
                onClick={clearAll}
                className="col-span-2"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={() => performOperation("÷")}
              >
                <Divide className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => performOperation("×")}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Row 2 */}
              <Button
                variant="secondary"
                onClick={() => inputDigit("7")}
              >
                7
              </Button>
              <Button
                variant="secondary"
                onClick={() => inputDigit("8")}
              >
                8
              </Button>
              <Button
                variant="secondary"
                onClick={() => inputDigit("9")}
              >
                9
              </Button>
              <Button
                variant="outline"
                onClick={() => performOperation("-")}
              >
                <Minus className="h-4 w-4" />
              </Button>

              {/* Row 3 */}
              <Button
                variant="secondary"
                onClick={() => inputDigit("4")}
              >
                4
              </Button>
              <Button
                variant="secondary"
                onClick={() => inputDigit("5")}
              >
                5
              </Button>
              <Button
                variant="secondary"
                onClick={() => inputDigit("6")}
              >
                6
              </Button>
              <Button
                variant="outline"
                onClick={() => performOperation("+")}
              >
                <Plus className="h-4 w-4" />
              </Button>

              {/* Row 4 */}
              <Button
                variant="secondary"
                onClick={() => inputDigit("1")}
              >
                1
              </Button>
              <Button
                variant="secondary"
                onClick={() => inputDigit("2")}
              >
                2
              </Button>
              <Button
                variant="secondary"
                onClick={() => inputDigit("3")}
              >
                3
              </Button>
              <Button
                variant="default"
                onClick={handleEquals}
                className="row-span-2"
              >
                <Equal className="h-4 w-4" />
              </Button>

              {/* Row 5 */}
              <Button
                variant="secondary"
                onClick={() => inputDigit("0")}
                className="col-span-2"
              >
                0
              </Button>
              <Button
                variant="secondary"
                onClick={inputDecimal}
              >
                .
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
