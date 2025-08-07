"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/components/ui/select";
import { Badge } from "@/src/app/components/ui/badge";
import { Alert, AlertDescription } from "@/src/app/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { ArrowRight, RefreshCw, TrendingUp, TrendingDown, DollarSign, Bitcoin, AlertTriangle, Loader2, History, Star, ArrowLeftRight } from "lucide-react";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  type: 'fiat' | 'crypto';
  flag?: string;
}

interface ConversionHistory {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: Date;
}

interface PopularConversion {
  from: string;
  to: string;
  rate: number;
  trend: 'up' | 'down' | 'stable';
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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("converter");

  // Enhanced currency data with flags
  const currencies: Currency[] = useMemo(() => [
    // Fiat currencies
    { code: "USD", name: "US Dollar", symbol: "$", type: "fiat", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", symbol: "€", type: "fiat", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", symbol: "£", type: "fiat", flag: "🇬🇧" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", type: "fiat", flag: "🇯🇵" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", type: "fiat", flag: "🇨🇦" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", type: "fiat", flag: "🇦🇺" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF", type: "fiat", flag: "🇨🇭" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", type: "fiat", flag: "🇨🇳" },
    { code: "INR", name: "Indian Rupee", symbol: "₹", type: "fiat", flag: "🇮🇳" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$", type: "fiat", flag: "🇧🇷" },
    // Crypto currencies
    { code: "BTC", name: "Bitcoin", symbol: "₿", type: "crypto" },
    { code: "ETH", name: "Ethereum", symbol: "Ξ", type: "crypto" },
    { code: "USDT", name: "Tether", symbol: "₮", type: "crypto" },
    { code: "BNB", name: "Binance Coin", symbol: "BNB", type: "crypto" },
    { code: "ADA", name: "Cardano", symbol: "₳", type: "crypto" },
    { code: "SOL", name: "Solana", symbol: "◎", type: "crypto" },
    { code: "DOT", name: "Polkadot", symbol: "●", type: "crypto" },
    { code: "DOGE", name: "Dogecoin", symbol: "Ð", type: "crypto" },
    { code: "MATIC", name: "Polygon", symbol: "MATIC", type: "crypto" },
    { code: "AVAX", name: "Avalanche", symbol: "AVAX", type: "crypto" },
  ], []);

  // Enhanced mock exchange rates with trends
  const mockRates: { [key: string]: number } = useMemo(() => ({
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
    "USD_MATIC": 1.25,
    "USD_AVAX": 0.035,
    // Add more rates as needed
  }), []);

  // Popular conversions with trends
  const popularConversions: PopularConversion[] = useMemo(() => [
    { from: "USD", to: "EUR", rate: 0.85, trend: "up" },
    { from: "USD", to: "GBP", rate: 0.73, trend: "down" },
    { from: "USD", to: "JPY", rate: 110.25, trend: "stable" },
    { from: "USD", to: "BTC", rate: 0.000023, trend: "up" },
    { from: "EUR", to: "USD", rate: 1.18, trend: "down" },
  ], []);

  // Load conversion history and favorites from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("conversionHistory");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          // Convert timestamp strings back to Date objects
          const historyWithDates = parsed.map(item => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setConversionHistory(historyWithDates);
        }
      } catch (e) {
        console.error("Failed to parse conversion history", e);
      }
    }

    const savedFavorites = localStorage.getItem("favoriteCurrencies");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Failed to parse favorite currencies", e);
      }
    }
  }, []);

  // Save conversion history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("conversionHistory", JSON.stringify(conversionHistory));
  }, [conversionHistory]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favoriteCurrencies", JSON.stringify(favorites));
  }, [favorites]);

  // Debounced conversion function
  const convertCurrency = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

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
        id: Date.now().toString(),
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
  }, [amount, fromCurrency, toCurrency, mockRates]);

  // Swap currencies
  const swapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
    setExchangeRate(null);
  }, [fromCurrency, toCurrency]);

  // Toggle favorite currency
  const toggleFavorite = useCallback((currencyCode: string) => {
    setFavorites(prev => {
      if (prev.includes(currencyCode)) {
        return prev.filter(code => code !== currencyCode);
      } else {
        return [...prev, currencyCode];
      }
    });
  }, []);

  // Clear conversion history
  const clearHistory = useCallback(() => {
    setConversionHistory([]);
  }, []);

  // Get currency symbol
  const getCurrencySymbol = useCallback((code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency?.symbol || code;
  }, [currencies]);

  // Get currency name
  const getCurrencyName = useCallback((code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency?.name || code;
  }, [currencies]);

  // Get currency type
  const getCurrencyType = useCallback((code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency?.type || 'fiat';
  }, [currencies]);

  // Format number based on currency type
  const formatNumber = useCallback((num: number, currencyCode?: string) => {
    const isCrypto = currencyCode ? getCurrencyType(currencyCode) === 'crypto' : false;
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: isCrypto ? 8 : 2,
      maximumFractionDigits: isCrypto ? 8 : 2,
    }).format(num);
  }, [getCurrencyType]);

  // Auto-convert when currencies change, but not on initial mount
  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [fromCurrency, toCurrency, amount, convertCurrency]);

  // Filter currencies by favorites
  const favoriteCurrencies = useMemo(() => {
    return currencies.filter(currency => favorites.includes(currency.code));
  }, [currencies, favorites]);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 animate-slide-in-left">Currency Converter</h1>
          <p className="text-muted-foreground text-lg animate-slide-in-right">
            Convert between fiat and crypto currencies with real-time rates
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="converter">Converter</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="converter" className="space-y-6">
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
                            <div className="font-semibold text-sm p-2 border-b flex items-center justify-between">
                              <span>Fiat Currencies</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => toggleFavorite(fromCurrency)}
                                className="h-6 w-6 p-0"
                              >
                                <Star className={`h-4 w-4 ${favorites.includes(fromCurrency) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                              </Button>
                            </div>
                            {currencies.filter(c => c.type === 'fiat').map(currency => (
                              <SelectItem key={currency.code} value={currency.code}>
                                <div className="flex items-center gap-2">
                                  <span>{currency.flag}</span>
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
                                  <Bitcoin className="h-4 w-4" />
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
                          <Select value={toCurrency} onValueChange={setToCurrency} >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="font-semibold text-sm p-2 border-b flex items-center justify-between">
                                <span>Fiat Currencies</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => toggleFavorite(toCurrency)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Star className={`h-4 w-4 ${favorites.includes(toCurrency) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                </Button>
                              </div>
                              {currencies.filter(c => c.type === 'fiat').map(currency => (
                                <SelectItem key={currency.code} value={currency.code}>
                                  <div className="flex items-center gap-2">
                                    <span>{currency.flag}</span>
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
                                    <Bitcoin className="h-4 w-4" />
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
                            <ArrowLeftRight className="h-4 w-4" />
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
                            {formatNumber(result, toCurrency)} {getCurrencySymbol(toCurrency)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-2">
                            {formatNumber(parseFloat(amount), fromCurrency)} {getCurrencySymbol(fromCurrency)} = {formatNumber(result, toCurrency)} {getCurrencySymbol(toCurrency)}
                          </div>
                        </div>

                        {exchangeRate && (
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">
                              Exchange Rate: 1 {fromCurrency} = {formatNumber(exchangeRate, toCurrency)} {toCurrency}
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

              {/* Popular Conversions */}
              <div className="lg:col-span-1">
                <Card className="card-enhanced">
                  <CardHeader>
                    <CardTitle>Popular Conversions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {popularConversions.map((conversion, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                        <div className="text-sm">
                          <span className="font-medium">{conversion.from}</span>
                          <span className="text-muted-foreground"> → {conversion.to}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {conversion.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                          {conversion.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                          <div className="text-sm font-mono">
                            {formatNumber(conversion.rate, conversion.to)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>Favorite Currencies</span>
                </CardTitle>
                <CardDescription>
                  Your favorite currencies for quick access
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favoriteCurrencies.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No favorite currencies yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Click the star icon in the converter to add currencies to your favorites
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteCurrencies.map(currency => (
                      <div key={currency.code} className="p-4 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {currency.flag && <span className="text-xl">{currency.flag}</span>}
                          {currency.type === 'crypto' && <Bitcoin className="h-5 w-5" />}
                          <div>
                            <div className="font-medium">{currency.code}</div>
                            <div className="text-sm text-muted-foreground">{currency.name}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(currency.code)}
                        >
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <span>Conversion History</span>
                  {conversionHistory.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearHistory}>
                      Clear History
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Your recent currency conversions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversionHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No conversion history yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your conversions will appear here once you start using the converter
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversionHistory.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {formatNumber(item.amount, item.from)} {item.from} → {formatNumber(item.result, item.to)} {item.to}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Rate: 1 {item.from} = {formatNumber(item.rate, item.to)} {item.to}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
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