// @/lib/localization.ts

type Region = 'India' | 'USA';

interface LocalizationConfig {
  locale: string;
  currency: string;
  contact: {
    address: string;
    phone: string;
  };
  priceMultiplier: number;
}

const localizationData: Record<Region, LocalizationConfig> = {
  India: {
    locale: 'en-IN',
    currency: 'INR',
    priceMultiplier: 83, // Approx conversion rate
    contact: {
      address: '123 Pet Gully, Paw Nagar, India',
      phone: '(+91) 98765 43210',
    },
  },
  USA: {
    locale: 'en-US',
    currency: 'USD',
    priceMultiplier: 1,
    contact: {
      address: '123 Pet Lane, Animal City, USA',
      phone: '(555) 123-4567',
    },
  },
};

// --- SET CURRENT REGION HERE ---
const CURRENT_REGION: Region = 'India';
// -----------------------------

export const config = localizationData[CURRENT_REGION];

/**
 * Helper function to format currency, converting from a base USD price.
 * @param basePrice The price in USD.
 * @returns A formatted currency string (e.g., "₹8,300.00").
 */
export function formatCurrency(basePrice: number): string {
  const convertedPrice = basePrice * config.priceMultiplier;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
  }).format(convertedPrice);
}
