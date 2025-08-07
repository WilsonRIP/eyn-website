"use client";

import { useState } from "react";
import { Ruler, Scale, Thermometer, Clock, Zap, Droplets, Weight, Volume, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";

interface UnitConversion {
  [key: string]: {
    [key: string]: number | ((value: number) => number);
  };
}

const unitConversions: { [key: string]: UnitConversion } = {
  length: {
    meter: {
      meter: 1,
      kilometer: 0.001,
      centimeter: 100,
      millimeter: 1000,
      mile: 0.000621371,
      yard: 1.09361,
      foot: 3.28084,
      inch: 39.3701,
    },
    kilometer: {
      meter: 1000,
      kilometer: 1,
      centimeter: 100000,
      millimeter: 1000000,
      mile: 0.621371,
      yard: 1093.61,
      foot: 3280.84,
      inch: 39370.1,
    },
    centimeter: {
      meter: 0.01,
      kilometer: 0.00001,
      centimeter: 1,
      millimeter: 10,
      mile: 0.00000621371,
      yard: 0.0109361,
      foot: 0.0328084,
      inch: 0.393701,
    },
    millimeter: {
      meter: 0.001,
      kilometer: 0.000001,
      centimeter: 0.1,
      millimeter: 1,
      mile: 0.000000621371,
      yard: 0.00109361,
      foot: 0.00328084,
      inch: 0.0393701,
    },
    mile: {
      meter: 1609.34,
      kilometer: 1.60934,
      centimeter: 160934,
      millimeter: 1609340,
      mile: 1,
      yard: 1760,
      foot: 5280,
      inch: 63360,
    },
    yard: {
      meter: 0.9144,
      kilometer: 0.0009144,
      centimeter: 91.44,
      millimeter: 914.4,
      mile: 0.000568182,
      yard: 1,
      foot: 3,
      inch: 36,
    },
    foot: {
      meter: 0.3048,
      kilometer: 0.0003048,
      centimeter: 30.48,
      millimeter: 304.8,
      mile: 0.000189394,
      yard: 0.333333,
      foot: 1,
      inch: 12,
    },
    inch: {
      meter: 0.0254,
      kilometer: 0.0000254,
      centimeter: 2.54,
      millimeter: 25.4,
      mile: 0.0000157828,
      yard: 0.0277778,
      foot: 0.0833333,
      inch: 1,
    },
  },
  weight: {
    kilogram: {
      kilogram: 1,
      gram: 1000,
      milligram: 1000000,
      pound: 2.20462,
      ounce: 35.274,
      ton: 0.001,
    },
    gram: {
      kilogram: 0.001,
      gram: 1,
      milligram: 1000,
      pound: 0.00220462,
      ounce: 0.035274,
      ton: 0.000001,
    },
    milligram: {
      kilogram: 0.000001,
      gram: 0.001,
      milligram: 1,
      pound: 0.00000220462,
      ounce: 0.000035274,
      ton: 0.000000001,
    },
    pound: {
      kilogram: 0.453592,
      gram: 453.592,
      milligram: 453592,
      pound: 1,
      ounce: 16,
      ton: 0.000453592,
    },
    ounce: {
      kilogram: 0.0283495,
      gram: 28.3495,
      milligram: 28349.5,
      pound: 0.0625,
      ounce: 1,
      ton: 0.0000283495,
    },
    ton: {
      kilogram: 1000,
      gram: 1000000,
      milligram: 1000000000,
      pound: 2204.62,
      ounce: 35274,
      ton: 1,
    },
  },
  temperature: {
    celsius: {
      celsius: (c: number) => c,
      fahrenheit: (c: number) => (c * 9/5) + 32,
      kelvin: (c: number) => c + 273.15,
    },
    fahrenheit: {
      celsius: (f: number) => (f - 32) * 5/9,
      fahrenheit: (f: number) => f,
      kelvin: (f: number) => (f - 32) * 5/9 + 273.15,
    },
    kelvin: {
      celsius: (k: number) => k - 273.15,
      fahrenheit: (k: number) => (k - 273.15) * 9/5 + 32,
      kelvin: (k: number) => k,
    },
  },
  volume: {
    liter: {
      liter: 1,
      milliliter: 1000,
      cubicMeter: 0.001,
      gallon: 0.264172,
      quart: 1.05669,
      pint: 2.11338,
      cup: 4.22675,
    },
    milliliter: {
      liter: 0.001,
      milliliter: 1,
      cubicMeter: 0.000001,
      gallon: 0.000264172,
      quart: 0.00105669,
      pint: 0.00211338,
      cup: 0.00422675,
    },
    cubicMeter: {
      liter: 1000,
      milliliter: 1000000,
      cubicMeter: 1,
      gallon: 264.172,
      quart: 1056.69,
      pint: 2113.38,
      cup: 4226.75,
    },
    gallon: {
      liter: 3.78541,
      milliliter: 3785.41,
      cubicMeter: 0.00378541,
      gallon: 1,
      quart: 4,
      pint: 8,
      cup: 16,
    },
    quart: {
      liter: 0.946353,
      milliliter: 946.353,
      cubicMeter: 0.000946353,
      gallon: 0.25,
      quart: 1,
      pint: 2,
      cup: 4,
    },
    pint: {
      liter: 0.473176,
      milliliter: 473.176,
      cubicMeter: 0.000473176,
      gallon: 0.125,
      quart: 0.5,
      pint: 1,
      cup: 2,
    },
    cup: {
      liter: 0.236588,
      milliliter: 236.588,
      cubicMeter: 0.000236588,
      gallon: 0.0625,
      quart: 0.25,
      pint: 0.5,
      cup: 1,
    },
  },
  area: {
    squareMeter: {
      squareMeter: 1,
      squareKilometer: 0.000001,
      squareCentimeter: 10000,
      squareMile: 0.000000386102,
      acre: 0.000247105,
      hectare: 0.0001,
      squareYard: 1.19599,
      squareFoot: 10.7639,
      squareInch: 1550,
    },
    squareKilometer: {
      squareMeter: 1000000,
      squareKilometer: 1,
      squareCentimeter: 10000000000,
      squareMile: 0.386102,
      acre: 247.105,
      hectare: 100,
      squareYard: 1195990,
      squareFoot: 10763910,
      squareInch: 1550000000,
    },
    squareCentimeter: {
      squareMeter: 0.0001,
      squareKilometer: 0.0000000001,
      squareCentimeter: 1,
      squareMile: 0.0000000000386102,
      acre: 0.0000000247105,
      hectare: 0.00000001,
      squareYard: 0.000119599,
      squareFoot: 0.00107639,
      squareInch: 0.155,
    },
    squareMile: {
      squareMeter: 2589988.11,
      squareKilometer: 2.58999,
      squareCentimeter: 25899881100,
      squareMile: 1,
      acre: 640,
      hectare: 258.999,
      squareYard: 3097600,
      squareFoot: 27878400,
      squareInch: 4014489600,
    },
    acre: {
      squareMeter: 4046.86,
      squareKilometer: 0.00404686,
      squareCentimeter: 40468600,
      squareMile: 0.0015625,
      acre: 1,
      hectare: 0.404686,
      squareYard: 4840,
      squareFoot: 43560,
      squareInch: 6272640,
    },
    hectare: {
      squareMeter: 10000,
      squareKilometer: 0.01,
      squareCentimeter: 100000000,
      squareMile: 0.00386102,
      acre: 2.47105,
      hectare: 1,
      squareYard: 11959.9,
      squareFoot: 107639,
      squareInch: 15500000,
    },
    squareYard: {
      squareMeter: 0.836127,
      squareKilometer: 0.000000836127,
      squareCentimeter: 8361.27,
      squareMile: 0.000000322831,
      acre: 0.000206612,
      hectare: 0.0000836127,
      squareYard: 1,
      squareFoot: 9,
      squareInch: 1296,
    },
    squareFoot: {
      squareMeter: 0.092903,
      squareKilometer: 0.000000092903,
      squareCentimeter: 929.03,
      squareMile: 0.0000000358701,
      acre: 0.0000229568,
      hectare: 0.0000092903,
      squareYard: 0.111111,
      squareFoot: 1,
      squareInch: 144,
    },
    squareInch: {
      squareMeter: 0.00064516,
      squareKilometer: 0.00000000064516,
      squareCentimeter: 6.4516,
      squareMile: 0.000000000249098,
      acre: 0.000000159423,
      hectare: 0.000000064516,
      squareYard: 0.000771605,
      squareFoot: 0.00694444,
      squareInch: 1,
    },
  },
  speed: {
    meterPerSecond: {
      meterPerSecond: 1,
      kilometerPerHour: 3.6,
      milePerHour: 2.23694,
      knot: 1.94384,
      footPerSecond: 3.28084,
    },
    kilometerPerHour: {
      meterPerSecond: 0.277778,
      kilometerPerHour: 1,
      milePerHour: 0.621371,
      knot: 0.539957,
      footPerSecond: 0.911344,
    },
    milePerHour: {
      meterPerSecond: 0.44704,
      kilometerPerHour: 1.60934,
      milePerHour: 1,
      knot: 0.868976,
      footPerSecond: 1.46667,
    },
    knot: {
      meterPerSecond: 0.514444,
      kilometerPerHour: 1.852,
      milePerHour: 1.15078,
      knot: 1,
      footPerSecond: 1.68781,
    },
    footPerSecond: {
      meterPerSecond: 0.3048,
      kilometerPerHour: 1.09728,
      milePerHour: 0.681818,
      knot: 0.592484,
      footPerSecond: 1,
    },
  },
};

const unitCategories = [
  { id: "length", name: "Length", icon: Ruler },
  { id: "weight", name: "Weight", icon: Weight },
  { id: "temperature", name: "Temperature", icon: Thermometer },
  { id: "volume", name: "Volume", icon: Volume },
  { id: "area", name: "Area", icon: Scale },
  { id: "speed", name: "Speed", icon: Zap },
];

export default function UnitConverterPage() {
  const [activeCategory, setActiveCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("meter");
  const [toUnit, setToUnit] = useState("foot");
  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("3.28084");

  const getUnits = (category: string) => {
    return Object.keys(unitConversions[category] || {});
  };

  const convert = (value: number, from: string, to: string, category: string) => {
    if (category === "temperature") {
      const conversions = unitConversions[category][from];
      if (conversions && conversions[to]) {
        const conversion = conversions[to];
        if (typeof conversion === 'function') {
          return conversion(value);
        }
      }
    } else {
      const conversions = unitConversions[category][from];
      if (conversions && conversions[to]) {
        const conversion = conversions[to];
        if (typeof conversion === 'number') {
          return value * conversion;
        }
      }
    }
    return value;
  };

  const handleFromValueChange = (value: string) => {
    setFromValue(value);
    const numValue = parseFloat(value) || 0;
    const result = convert(numValue, fromUnit, toUnit, activeCategory);
    setToValue(result.toString());
  };

  const handleFromUnitChange = (unit: string) => {
    setFromUnit(unit);
    const numValue = parseFloat(fromValue) || 0;
    const result = convert(numValue, unit, toUnit, activeCategory);
    setToValue(result.toString());
  };

  const handleToUnitChange = (unit: string) => {
    setToUnit(unit);
    const numValue = parseFloat(fromValue) || 0;
    const result = convert(numValue, fromUnit, unit, activeCategory);
    setToValue(result.toString());
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    const units = getUnits(category);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setFromValue("1");
    const result = convert(1, units[0], units[1] || units[0], category);
    setToValue(result.toString());
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    const tempValue = fromValue;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
    setToValue(tempValue);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
              <ArrowRightLeft className="h-6 w-6" />
              Unit Converter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {unitCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {unitCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* From Unit */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        From
                      </label>
                      <Select value={fromUnit} onValueChange={handleFromUnitChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getUnits(category.id).map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit.charAt(0).toUpperCase() + unit.slice(1).replace(/([A-Z])/g, ' $1')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={fromValue}
                        onChange={(e) => handleFromValueChange(e.target.value)}
                        placeholder="Enter value"
                        className="text-lg"
                      />
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={swapUnits}
                        className="rounded-full"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* To Unit */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        To
                      </label>
                      <Select value={toUnit} onValueChange={handleToUnitChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getUnits(category.id).map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit.charAt(0).toUpperCase() + unit.slice(1).replace(/([A-Z])/g, ' $1')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={toValue}
                        readOnly
                        className="text-lg bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  {/* Result Display */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {fromValue} {fromUnit.charAt(0).toUpperCase() + fromUnit.slice(1).replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      = {parseFloat(toValue).toFixed(6).replace(/\.?0+$/, '')} {toUnit.charAt(0).toUpperCase() + toUnit.slice(1).replace(/([A-Z])/g, ' $1')}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
