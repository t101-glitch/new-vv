/**
 * Environment Variable Sanitation
 * Ensures that all required environment variables are present and valid.
 */

const getEnvVar = (key: string, required = true): string => {
    const value = import.meta.env[key];
    if (required && !value) {
        throw new Error(`CRITICAL ERROR: Environment variable ${key} is missing. Please check your .env file or deployment settings.`);
    }
    return value || '';
};

export const ENV = {
    FIREBASE_API_KEY: getEnvVar('VITE_FIREBASE_API_KEY'),
    FIREBASE_AUTH_DOMAIN: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    FIREBASE_PROJECT_ID: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
    FIREBASE_STORAGE_BUCKET: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    FIREBASE_MESSAGING_SENDER_ID: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    FIREBASE_APP_ID: getEnvVar('VITE_FIREBASE_APP_ID'),
    FIREBASE_MEASUREMENT_ID: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', false), // Optional
    PAYSTACK_PUBLIC_KEY: getEnvVar('VITE_PAYSTACK_PUBLIC_KEY'),
    IS_PROD: import.meta.env.PROD,
    IS_DEV: import.meta.env.DEV,
};

// Log warning in production if measurement ID is missing
if (ENV.IS_PROD && !ENV.FIREBASE_MEASUREMENT_ID) {
    console.warn("Deployment Alert: Google Analytics (VITE_FIREBASE_MEASUREMENT_ID) is not configured.");
}
