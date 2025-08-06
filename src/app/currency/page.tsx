"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Badge } from "@/src/app/components/ui/badge";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { ArrowRight, RefreshCw, TrendingUp, TrendingDown, DollarSign, Bitcoin, AlertTriangle, Loader2 } from "lucide-react";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  type: 'fiat' | 'crypto';
}

interface ConversionHistory {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: Date;
}

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([]);

  // Sample currency data (in a real app, this would come from an API)
  const currencies: Currency[] = [
    // Fiat currencies
    { code: "USD", name: "US Dollar", symbol: "$", type: "fiat" },
    { code: "EUR", name: "Euro", symbol: "€", type: "fiat" },
    { code: "GBP", name: "British Pound", symbol: "£", type: "fiat" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", type: "fiat" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", type: "fiat" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", type: "fiat" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF", type: "fiat" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", type: "fiat" },
    { code: "INR", name: "Indian Rupee", symbol: "₹", type: "fiat" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$", type: "fiat" },
    // Crypto currencies
    { code: "BTC", name: "Bitcoin", symbol: "₿", type: "crypto" },
    { code: "ETH", name: "Ethereum", symbol: "Ξ", type: "crypto" },
    { code: "USDT", name: "Tether", symbol: "₮", type: "crypto" },
    { code: "BNB", name: "Binance Coin", symbol: "BNB", type: "crypto" },
    { code: "ADA", name: "Cardano", symbol: "₳", type: "crypto" },
    { code: "SOL", name: "Solana", symbol: "◎", type: "crypto" },
    { code: "DOT", name: "Polkadot", symbol: "●", type: "crypto" },
    { code: "DOGE", name: "Dogecoin", symbol: "Ð", type: "crypto" },
  ];

  // Mock exchange rates (in a real app, these would come from an API)
  const mockRates: { [key: string]: number } = {
    "USD_EUR": 0.85,
    "USD_GBP": 0.73,
    "USD_JPY": 110.25,
    "USD_CAD": 1.25,
    "USD_AUD": 1.35,
    "USD_CHF": 0.92,
    "USD_CNY": 6.45,
    "USD_INR": 74.50,
    "USD_BRL": 5.20,
    "USD_BTC": 0.000023,
    "USD_ETH": 0.00034,
    "USD_USDT": 1.00,
    "USD_BNB": 0.0021,
    "USD_ADA": 0.45,
    "USD_SOL": 0.0089,
    "USD_DOT": 0.12,
    "USD_DOGE": 0.28,
    // Add more rates as needed
  };

  const convertCurrency = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const rateKey = `${fromCurrency}_${toCurrency}`;
      let rate = mockRates[rateKey];

      // If direct rate not found, try reverse rate
      if (!rate) {
        const reverseRateKey = `${toCurrency}_${fromCurrency}`;
        const reverseRate = mockRates[reverseRateKey];
        if (reverseRate) {
          rate = 1 / reverseRate;
        }
      }

      // If still no rate, generate a mock rate
      if (!rate) {
        rate = Math.random() * 2 + 0.1; // Random rate between 0.1 and 2.1
      }

      const convertedAmount = parseFloat(amount) * rate;
      setResult(convertedAmount);
      setExchangeRate(rate);
      setLastUpdated(new Date());

      // Add to history
      const historyItem: ConversionHistory = {
        from: fromCurrency,
        to: toCurrency,
        amount: parseFloat(amount),
        result: convertedAmount,
        rate: rate,
        timestamp: new Date(),
      };

      setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
    } catch (error) {
      setError("Failed to convert currency. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
    setExchangeRate(null);
  };

  const getCurrencySymbol = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency?.symbol || code;
  };

  const getCurrencyName = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency?.name || code;
  };

  const getCurrencyType = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency?.type || 'fiat';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(num);
  };

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [fromCurrency, toCurrency]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Currency Converter</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Convert between fiat and crypto currencies with real-time rates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Converter */}
          <div className="lg:col-span-2">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Currency Converter</span>
                  {lastUpdated && (
                    <Badge variant="outline" className="text-xs">
                      Updated {lastUpdated.toLocaleTimeString()}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Convert between 150+ currencies and cryptocurrencies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg"
                  />
                </div>

                {/* Currency Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From</label>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="font-semibold text-sm p-2 border-b">Fiat Currencies</div>
                        {currencies.filter(c => c.type === 'fiat').map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span>{currency.symbol}</span>
                              <span>{currency.code}</span>
                              <span className="text-muted-foreground">({currency.name})</span>
                            </div>
                          </SelectItem>
                        ))}
                        <div className="font-semibold text-sm p-2 border-b">Cryptocurrencies</div>
                        {currencies.filter(c => c.type === 'crypto').map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span>{currency.symbol}</span>
                              <span>{currency.code}</span>
                              <span className="text-muted-foreground">({currency.name})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">To</label>
                    <div className="flex gap-2">
                      <Select value={toCurrency} onValueChange={setToCurrency} className="flex-1">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="font-semibold text-sm p-2 border-b">Fiat Currencies</div>
                          {currencies.filter(c => c.type === 'fiat').map(currency => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center gap-2">
                                <span>{currency.symbol}</span>
                                <span>{currency.code}</span>
                                <span className="text-muted-foreground">({currency.name})</span>
                              </div>
                            </SelectItem>
                          ))}
                          <div className="font-semibold text-sm p-2 border-b">Cryptocurrencies</div>
                          {currencies.filter(c => c.type === 'crypto').map(currency => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center gap-2">
                                <span>{currency.symbol}</span>
                                <span>{currency.code}</span>
                                <span className="text-muted-foreground">({currency.name})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={swapCurrencies}
                        variant="outline"
                        size="icon"
                        className="hover-lift"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Convert Button */}
                <Button
                  onClick={convertCurrency}
                  className="w-full btn-enhanced hover-lift"
                  disabled={isLoading || !amount}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Convert
                    </>
                  )}
                </Button>

                {/* Result */}
                {result !== null && (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <div className="text-3xl font-bold">
                        {formatNumber(result)} {getCurrencySymbol(toCurrency)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {formatNumber(parseFloat(amount))} {getCurrencySymbol(fromCurrency)} = {formatNumber(result)} {getCurrencySymbol(toCurrency)}
                      </div>
                    </div>

                    {exchangeRate && (
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Exchange Rate: 1 {fromCurrency} = {formatNumber(exchangeRate)} {toCurrency}
                        </div>
                      </div>
                    )}
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
          </div>

          {/* Popular Conversions & History */}
          <div className="lg:col-span-1 space-y-6">
            {/* Popular Conversions */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Popular Conversions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { from: "USD", to: "EUR", rate: 0.85 },
                  { from: "USD", to: "GBP", rate: 0.73 },
                  { from: "USD", to: "JPY", rate: 110.25 },
                  { from: "USD", to: "BTC", rate: 0.000023 },
                  { from: "EUR", to: "USD", rate: 1.18 },
                ].map((conversion, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                    <div className="text-sm">
                      <span className="font-medium">{conversion.from}</span>
                      <span className="text-muted-foreground"> → {conversion.to}</span>
                    </div>
                    <div className="text-sm font-mono">
                      {formatNumber(conversion.rate)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Conversion History */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Recent Conversions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {conversionHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No conversions yet
                  </p>
                ) : (
                  conversionHistory.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatNumber(item.amount)} {item.from} → {formatNumber(item.result)} {item.to}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Rate: {formatNumber(item.rate)}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="card-enhanced mt-6">
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              What you can do with this currency converter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold">Real-time Exchange Rates</h3>
                <p className="text-sm text-muted-foreground">
                  Get up-to-date exchange rates for 150+ currencies and major cryptocurrencies.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Fiat & Crypto Support</h3>
                <p className="text-sm text-muted-foreground">
                  Convert between traditional currencies and popular cryptocurrencies like Bitcoin and Ethereum.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Conversion History</h3>
                <p className="text-sm text-muted-foreground">
                  Track your recent conversions and exchange rates for quick reference.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 