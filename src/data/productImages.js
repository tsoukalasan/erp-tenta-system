// Product Images Mapping - ΜΟΝΟ οι φωτογραφίες που έδωσες
// Αν δεν υπάρχει φωτογραφία, δεν θα εμφανίζεται εικόνα

export const productImages = {
  // Τέντες (Category 1) - Τέντα Απλή
  1: 'https://drive.google.com/thumbnail?id=1eBOMX8-IQUJtb7ThbE07n2_cVTq-nH-h&sz=w400', // Με Αντιρίδες
  2: 'https://drive.google.com/thumbnail?id=1eBOMX8-IQUJtb7ThbE07n2_cVTq-nH-h&sz=w400', // Με Αντιρίδες Στηθαίο
  
  // Τέντες (Category 1) - Τέντα Μπάρα
  8: 'https://drive.google.com/thumbnail?id=1YGbNyC21ti8hC-qd3dtgITG17x1Ob0Lb&sz=w400', // Μπάρα
  10: 'https://drive.google.com/thumbnail?id=1qJA8Emo-S84JF92w7l0J6e2AMUYzW97i&sz=w400', // Μπάρα 2010
  
  // Πέργκολες (Category 2)
  18: 'https://drive.google.com/thumbnail?id=1dvycDnkqD2sBZuabU50GNaL6fFFbWwsm&sz=w400', // Pergola Pro 100
  23: 'https://drive.google.com/thumbnail?id=1dtsrHy7HE_IVi8oEV5jaTmuoRkoAv4Ma&sz=w400', // Κρεμαστή
  24: 'https://drive.google.com/thumbnail?id=1drIa7vfVYZrb4visKB0YYE-l9KGDz7yv&sz=w400', // Flat
  25: 'https://drive.google.com/thumbnail?id=1e0Xe6GYZIrcaxTsyzuok9wKlR8fVGPRk&sz=w400', // Βιοκλιματική
  26: 'https://drive.google.com/thumbnail?id=1dQIEqoBi9iZfPwmSJGLHkyfIoi2IcyzZ&sz=w400', // Open Sky
  29: 'https://drive.google.com/thumbnail?id=1qtxrmy8Nep0bxd9Iege1-JM9Z7xO6mSY&sz=w400', // Balloon
  
  // Κάθετα Συστήματα (Category 3)
  31: 'https://drive.google.com/thumbnail?id=1dvHT2vHVCGNEacPiQDpKW4GIuSs9B-v4&sz=w400', // Zip Screen
  
  // Σύστημα Για Παράθυρα (Category 4)
  37: 'https://drive.google.com/thumbnail?id=1e5V6vbfF82w1Nb35uTP-Ll6gfHbCGCN1&sz=w400', // Καποτίνα
};

// Helper function - επιστρέφει null αν δεν υπάρχει φωτογραφία
export const getProductImage = (productId) => {
  return productImages[productId] || null;
};

// Category Images - ΚΕΝΟ αν δεν υπάρχει
export const categoryImages = {
  // Προσθέστε category images αν θέλετε
};

export const getCategoryImage = (categoryId) => {
  return categoryImages[categoryId] || null;
};
