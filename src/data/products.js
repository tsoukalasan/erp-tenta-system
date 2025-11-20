// Δεδομένα Προϊόντων - Static Data (χωρίς Supabase)

export const CATEGORIES = [
  { id: 1, name: 'Τέντες' },
  { id: 2, name: 'Πέργκολες' },
  { id: 3, name: 'Αντιρίδες' },
  { id: 4, name: 'Αυτοματισμοί' }
];

export const PRODUCTS = [
  // Πέργκολες
  { id: 18, name: 'Πέργκολα Pro 100', categoryId: 2, hasConfig: true },
  { id: 19, name: 'Πέργκολα Pro 150', categoryId: 2, hasConfig: true },
  { id: 20, name: 'Πέργκολα Pro Mega', categoryId: 2, hasConfig: true },
  { id: 21, name: 'Σύστημα Πέργκολας Curved', categoryId: 2, hasConfig: false },
  { id: 22, name: 'Πέργκολα Στάνταρ Μοτέρ Κουτί', categoryId: 2, hasConfig: false },
  { id: 23, name: 'Πέργκολα Κρεμαστή', categoryId: 2, hasConfig: true },
  { id: 24, name: 'Πέργκολα Flat', categoryId: 2, hasConfig: true },
  { id: 25, name: 'Πέργκολα Βιοκλιματική', categoryId: 2, hasConfig: true },
  { id: 26, name: 'Πέργκολα Open Sky', categoryId: 2, hasConfig: true },
  { id: 27, name: 'Πέργκολα Open Roof', categoryId: 2, hasConfig: false },
  { id: 28, name: 'Πέργκολα Σταθερές Περσίδες', categoryId: 2, hasConfig: true },
  { id: 29, name: 'Πέργκολα Balloon', categoryId: 2, hasConfig: true },
  { id: 30, name: 'Πέργκολα Δανάη', categoryId: 2, hasConfig: true }
];

// Helper function: Get products by category
export const getProductsByCategory = (categoryId) => {
  return PRODUCTS.filter(p => p.categoryId === categoryId);
};

// Helper function: Get category by ID
export const getCategoryById = (id) => {
  return CATEGORIES.find(c => c.id === id);
};

// Helper function: Get product by ID
export const getProductById = (id) => {
  return PRODUCTS.find(p => p.id === parseInt(id));
};
