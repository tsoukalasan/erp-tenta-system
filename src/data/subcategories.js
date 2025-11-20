// Υποκατηγορίες προϊόντων (frontend only - δεν επηρεάζει τη βάση)
// Κάθε υποκατηγορία ομαδοποιεί προϊόντα για καλύτερη οργάνωση στο UI

export const subcategories = {
  // Κατηγορία 1: Σύστημα Τέντας
  1: [
    {
      id: 'simple',
      name: 'Τέντα Απλή',
      productIds: [1, 2, 3] // Με Αντιρίδες, Με Αντιρίδες Στηθαίο, Κάθετη Πλαινό
    },
    {
      id: 'arms',
      name: 'Τέντα Με Βραχίονες',
      productIds: [4] // Τέντα Με Βραχίονες (γενική)
    },
    {
      id: 'console',
      name: 'Τέντα Κονσόλα',
      productIds: [5, 6, 7] // Κονσόλα Λουξ, Στάνταρ, Κλασική
    },
    {
      id: 'cassette',
      name: 'Τέντα Κασέτα',
      productIds: [12, 13, 14, 15, 16, 17] // Κασέτα 530, 732, Base Plus, Base Lite, Epica, Epica Lite
    },
    {
      id: 'bar',
      name: 'Τέντα Μπάρα',
      productIds: [8, 9, 10] // Μπάρα, Μπάρα Venezia, Μπάρα 2010
    },
    {
      id: 'double-bar',
      name: 'Τέντα Διπλή Μπάρα',
      productIds: [11] // Διπλή Μπάρα Ηρακλής
    }
  ],
  
  // Κατηγορία 2: Σύστημα Πέργκολας (χωρίς υποκατηγορίες προς το παρόν)
  2: [],
  
  // Κατηγορία 3: Κάθετο Σύστημα (χωρίς υποκατηγορίες προς το παρόν)
  3: [],
  
  // Κατηγορία 4: Σύστημα Για Παράθυρα (χωρίς υποκατηγορίες προς το παρόν)
  4: [],
  
  // Κατηγορία 5: Σύστημα Τζαμιών (χωρίς υποκατηγορίες προς το παρόν)
  5: []
};

// Helper function: Βρες την υποκατηγορία ενός προϊόντος
export const getSubcategoryForProduct = (categoryId, productId) => {
  const categorySubcategories = subcategories[categoryId] || [];
  return categorySubcategories.find(sub => 
    sub.productIds.includes(parseInt(productId))
  );
};

// Helper function: Ομαδοποίηση προϊόντων ανά υποκατηγορία
export const groupProductsBySubcategory = (categoryId, products) => {
  const categorySubcategories = subcategories[categoryId] || [];
  
  // Αν δεν υπάρχουν υποκατηγορίες, επέστρεψε όλα τα προϊόντα σε μία ομάδα
  if (categorySubcategories.length === 0) {
    return [{ subcategory: null, products }];
  }
  
  const grouped = [];
  
  // Για κάθε υποκατηγορία, βρες τα αντίστοιχα προϊόντα
  categorySubcategories.forEach(subcategory => {
    const subcategoryProducts = products.filter(product => 
      subcategory.productIds.includes(parseInt(product.id))
    );
    
    if (subcategoryProducts.length > 0) {
      grouped.push({
        subcategory,
        products: subcategoryProducts
      });
    }
  });
  
  // Πρόσθεσε προϊόντα που δεν ανήκουν σε καμία υποκατηγορία (αν υπάρχουν)
  const categorizedProductIds = categorySubcategories.flatMap(sub => sub.productIds);
  const uncategorized = products.filter(product => 
    !categorizedProductIds.includes(parseInt(product.id))
  );
  
  if (uncategorized.length > 0) {
    grouped.push({
      subcategory: { id: 'other', name: 'Άλλα' },
      products: uncategorized
    });
  }
  
  return grouped;
};
