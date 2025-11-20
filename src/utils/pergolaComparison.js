import {
  PRO100_BASE_PRICES,
  PRO150_BASE_PRICES,
  PROMEGA_BASE_PRICES,
  BIOCLIMATIC_BASE_PRICES,
  FLAT_BASE_PRICES,
  HANGING_BASE_PRICES,
  OPEN_SKY_BASE_PRICES,
  BALLOON_BASE_PRICES,
  FIXED_BLADES_BASE_PRICES,
  DANAE_BASE_PRICES,
  OPEN_ROOF_BASE_PRICES,
  STANDARD_MOTOR_BASE_PRICES,
  getPriceFromTable,
  roundUpToNextAvailableProjection,
  roundUpToNextAvailableWidth
} from '../constants/pergolaPricingTables';

// Mapping product IDs to their pricing tables
const PRODUCT_PRICING_TABLES = {
  18: { name: 'Πέργκολα Pro 100', table: PRO100_BASE_PRICES },
  19: { name: 'Πέργκολα Pro 150', table: PRO150_BASE_PRICES },
  20: { name: 'Πέργκολα Pro Mega', table: PROMEGA_BASE_PRICES },
  22: { name: 'Πέργκολα Στάνταρ Μοτέρ Κουτί', table: STANDARD_MOTOR_BASE_PRICES },
  23: { name: 'Πέργκολα Κρεμαστή', table: HANGING_BASE_PRICES },
  24: { name: 'Πέργκολα Flat', table: FLAT_BASE_PRICES },
  25: { name: 'Πέργκολα Βιοκλιματική', table: BIOCLIMATIC_BASE_PRICES },
  26: { name: 'Πέργκολα Open Sky', table: OPEN_SKY_BASE_PRICES },
  27: { name: 'Πέργκολα Open Roof', table: OPEN_ROOF_BASE_PRICES },
  28: { name: 'Πέργκολα Σταθερές Περσίδες', table: FIXED_BLADES_BASE_PRICES },
  29: { name: 'Πέργκολα Balloon', table: BALLOON_BASE_PRICES },
  30: { name: 'Πέργκολα Δανάη', table: DANAE_BASE_PRICES }
};

/**
 * Βρίσκει όλες τις πέργκολες που ταιριάζουν ΑΚΡΙΒΩΣ με τις δοσμένες διαστάσεις
 * @param {number} width - Πλάτος σε cm
 * @param {number} projection - Προβολή σε cm
 * @param {number} currentProductId - ID τρέχοντος προϊόντος (για να το εξαιρέσουμε)
 * @returns {Array} - Λίστα με matching products και τις βασικές τιμές τους
 */
export const findMatchingPergolas = (width, projection, currentProductId) => {
  const matches = [];

  Object.entries(PRODUCT_PRICING_TABLES).forEach(([productId, { name, table }]) => {
    // Παράλειψη του τρέχοντος προϊόντος
    if (parseInt(productId) === parseInt(currentProductId)) {
      return;
    }

    // Στρογγυλοποιημένες διαστάσεις
    const roundedProjection = roundUpToNextAvailableProjection(table, projection);
    const roundedWidth = roundUpToNextAvailableWidth(table, projection, width);
    
    // *** ΜΟΝΟ ακριβής αντιστοιχία ***
    const exactMatch = width === roundedWidth && projection === roundedProjection;
    
    if (!exactMatch) {
      return; // Skip αν δεν ταιριάζει ακριβώς
    }

    // Έλεγχος αν υπάρχει τιμή στον πίνακα
    const basePrice = getPriceFromTable(table, projection, width);
    
    if (basePrice > 0) {
      matches.push({
        productId: parseInt(productId),
        productName: name,
        basePrice,
        roundedDimensions: {
          width: roundedWidth,
          projection: roundedProjection
        },
        exactMatch: true
      });
    }
  });

  // Ταξινόμηση κατά τιμή (φθηνότερα πρώτα)
  return matches.sort((a, b) => a.basePrice - b.basePrice);
};

/**
 * Ελέγχει αν συγκεκριμένο προϊόν υποστηρίζει τις δοσμένες διαστάσεις
 * @param {number} productId - ID προϊόντος
 * @param {number} width - Πλάτος σε cm
 * @param {number} projection - Προβολή σε cm
 * @returns {Object|null} - Πληροφορίες προϊόντος ή null
 */
export const checkProductDimensions = (productId, width, projection) => {
  const product = PRODUCT_PRICING_TABLES[productId];
  if (!product) return null;

  const basePrice = getPriceFromTable(product.table, projection, width);
  
  if (basePrice === 0) return null;

  return {
    productId,
    productName: product.name,
    basePrice,
    roundedDimensions: {
      width: roundUpToNextAvailableWidth(product.table, projection, width),
      projection: roundUpToNextAvailableProjection(product.table, projection)
    }
  };
};

/**
 * Παίρνει το εύρος διαστάσεων για συγκεκριμένο προϊόν
 * @param {number} productId - ID προϊόντος
 * @returns {Object} - Min/Max width και projection
 */
export const getProductDimensionRange = (productId) => {
  const product = PRODUCT_PRICING_TABLES[productId];
  if (!product) return null;

  const table = product.table;
  const projections = Object.keys(table).map(Number).sort((a, b) => a - b);
  
  let minWidth = Infinity;
  let maxWidth = 0;

  projections.forEach(proj => {
    const widths = Object.keys(table[proj]).map(Number);
    minWidth = Math.min(minWidth, ...widths);
    maxWidth = Math.max(maxWidth, ...widths);
  });

  return {
    productName: product.name,
    minProjection: Math.min(...projections),
    maxProjection: Math.max(...projections),
    minWidth,
    maxWidth
  };
};
