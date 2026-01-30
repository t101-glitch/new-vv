import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useUser } from './UserContext';

interface PaystackConfig {
    publicKey: string;
    email: string;
    amount: number;
    currency: string;
    reference: string;
    metadata?: any;
}

interface PaymentContextType {
    startPayment: (amount: number, metadata?: any) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Real Paystack Test Public Key provided by user
const PAYSTACK_PUBLIC_KEY = 'pk_test_9e69a61786b0d6b138e4df552bc2be6f0793bae9';

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, upgradePlan } = useUser();
    const [paystackConfig, setPaystackConfig] = useState<PaystackConfig | null>(null);

    const initializePayment = usePaystackPayment(paystackConfig || {
        publicKey: PAYSTACK_PUBLIC_KEY,
        email: '',
        amount: 0,
        currency: 'ZAR',
        reference: ''
    });

    useEffect(() => {
        if (paystackConfig && initializePayment) {
            initializePayment({
                onSuccess: (reference: any) => {
                    console.log('Payment Successful:', reference);
                    // Use the upgradePlan function from UserContext
                    upgradePlan('PREMIUM');
                    setPaystackConfig(null);
                },
                onClose: () => {
                    console.log('Payment Closed');
                    setPaystackConfig(null);
                }
            });
        }
    }, [paystackConfig, initializePayment, upgradePlan]);

    const startPayment = (amount: number, metadata?: any) => {
        if (!user) return;

        setPaystackConfig({
            publicKey: PAYSTACK_PUBLIC_KEY,
            email: 'student@varsivault.app', // Should be user.email in production
            amount: amount * 100, // Paystack uses Kobo
            currency: 'ZAR',
            reference: 'VV_' + Math.floor((Math.random() * 1000000000) + 1),
            metadata: {
                ...metadata,
                userId: user.id
            }
        });
    };

    return (
        <PaymentContext.Provider value={{ startPayment }}>
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (!context) throw new Error("usePayment must be used within a PaymentProvider");
    return context;
};
