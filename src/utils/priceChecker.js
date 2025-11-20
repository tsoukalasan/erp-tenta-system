import {
  PRO100_BASE_PRICES,
  PRO150_BASE_PRICES,
  PROMEGA_BASE_PRICES,
  getPriceFromTable
} from '../constants/pergolaPricingTables';

// Ορισμός όλων των διαθέσιμων πινάκων τιμολόγησης
export const PRICE_TABLES = {
  'pro100': {
    name: 'Σύστημα Πέργκολας Προ 100',
    productId: 18,
    table: PRO100_BASE_PRICES,
    projectionRange: { min: 200, max: 500 },
    widthRange: { min: 300, max: 1300 }
  },
  'pro150': {
    name: 'Σύστημα Πέργκολας Προ 150',
    productId: 19,
    table: PRO150_BASE_PRICES,
    projectionRange: { min: 300, max: 700 },
    widthRange: { min: 300, max: 1500 }
  },
  'promega': {
    name: 'Σύστημα Πέργκολας Προ Mega',
    productId: 20,
    table: PROMEGA_BASE_PRICES,
    projectionRange: { min: 700, max: 1000 },
    widthRange: { min: 500, max: 1300 }
  }
};

/**
 * Ελέγχει ποιες πέργκολες υποστηρίζουν τις δοθείσες διαστάσεις
 * και επιστρέφει τις τιμές τους
 */
export const checkAlternativePergolas = (projection, width, currentProductId) => {
  const alternatives = [];

  Object.entries(PRICE_TABLES).forEach(([key, config]) => {
    // Παράλειψη του τρέχοντος προϊόντος
    if (config.productId === currentProductId) {
      return;
    }

    // Έλεγχος αν τα μέτρα είναι εντός ορίων
    const inProjectionRange = projection >= config.projectionRange.min && 
                              projection <= config.projectionRange.max;
    const inWidthRange = width >= config.widthRange.min && 
                        width <= config.widthRange.max;

    if (inProjectionRange && inWidthRange) {
      const price = getPriceFromTable(config.table, projection, width);
      
      if (price > 0) {
        alternatives.push({
          productId: config.productId,
          name: config.name,
          basePrice: price,
          projectionRange: config.projectionRange,
          widthRange: config.widthRange
        });
      }
    }
  });

  return alternatives;
};

/**
 * Ελέγχει αν οι διαστάσεις είναι έγκυρες για το τρέχον προϊόν
 */
export const isValidDimensions = (productId, projection, width) => {
  const config = Object.values(PRICE_TABLES).find(c => c.productId === productId);
  
  if (!config) return false;

  const inProjectionRange = projection >= config.projectionRange.min && 
                           projection <= config.projectionRange.max;
  const inWidthRange = width >= config.widthRange.min && 
                      width <= config.widthRange.max;

  return inProjectionRange && inWidthRange;
};
