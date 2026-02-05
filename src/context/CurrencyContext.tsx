import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

interface Currency {
    code: CurrencyCode;
    symbol: string;
    rate: number; // Conversion rate from USD
    country: string;
    flag: string; // Emoji flag
}

interface CurrencyContextType {
    currentCurrency: Currency;
    setCurrency: (code: CurrencyCode) => void;
    formatPrice: (priceInUSD: number) => string;
    convertPrice: (priceInUSD: number) => number;
    availableCurrencies: Currency[];
}

const currencies: Currency[] = [
    { code: 'USD', symbol: '$', rate: 1, country: 'United States', flag: '🇺🇸' },
    { code: 'INR', symbol: '₹', rate: 83.5, country: 'India', flag: '🇮🇳' },
    { code: 'EUR', symbol: '€', rate: 0.92, country: 'Europe', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', rate: 0.79, country: 'United Kingdom', flag: '🇬🇧' },
    { code: 'JPY', symbol: '¥', rate: 151.0, country: 'Japan', flag: '🇯🇵' },
    { code: 'CAD', symbol: 'C$', rate: 1.36, country: 'Canada', flag: '🇨🇦' },
    { code: 'AUD', symbol: 'A$', rate: 1.52, country: 'Australia', flag: '🇦🇺' },
];

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');

    // Load from local storage if needed, for now default to USD

    const currentCurrency = currencies.find(c => c.code === currencyCode) || currencies[0];

    const setCurrency = (code: CurrencyCode) => {
        setCurrencyCode(code);
    };

    const convertPrice = (priceInUSD: number) => {
        return priceInUSD * currentCurrency.rate;
    };

    const formatPrice = (priceInUSD: number) => {
        const converted = convertPrice(priceInUSD);
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currentCurrency.code,
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currentCurrency, setCurrency, formatPrice, convertPrice, availableCurrencies: currencies }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
