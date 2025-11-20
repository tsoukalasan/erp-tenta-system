import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Package, ChevronRight, User, Phone, Mail, MapPin, Layers } from 'lucide-react';
import { groupProductsBySubcategory } from './data/subcategories';
import { getProductImage, getCategoryImage } from './data/productImages';
import PergolaProConfig from './components/PergkolaConfig/PergolaProConfig';
import PergolaPro150Config from './components/PergkolaConfig/PergolaPro150Config';
import PergolaProMegaConfig from './components/PergkolaConfig/PergolaProMegaConfig';
import BioclimaticConfig from './components/PergkolaConfig/BioclimaticConfig';
import FlatConfig from './components/PergkolaConfig/FlatConfig';
import HangingConfig from './components/PergkolaConfig/HangingConfig';
import OpenSkyConfig from './components/PergkolaConfig/OpenSkyConfig';
import BalloonConfig from './components/PergkolaConfig/BalloonConfig';
import FixedBladesConfig from './components/PergkolaConfig/FixedBladesConfig';
import DanaeConfig from './components/PergkolaConfig/DanaeConfig';
import OpenRoofConfig from './components/PergkolaConfig/OpenRoofConfig';
import StandardMotorConfig from './components/PergkolaConfig/StandardMotorConfig';
import Kasetina530Config from './components/TentaConfig/Kasetina530Config';
import Kaseta732Config from './components/TentaConfig/Kaseta732Config';
import EpicaConfig from './components/TentaConfig/EpicaConfig';
import ZipScreenConfig from './components/TentaConfig/ZipScreenConfig';
import KasonetoWireConfig from './components/TentaConfig/KasonetoWireConfig';
import KasonetoPhi10Config from './components/TentaConfig/KasonetoPhi10Config';
import KathetoVTConfig from './components/TentaConfig/KathetoVTConfig';
import AdminProductManager from './components/AdminProductManager';

function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedProducts, setSavedProducts] = useState([]); // Λίστα αποθηκευμένων προϊόντων
  const [showOrderSummary, setShowOrderSummary] = useState(false); // Προβολή παραγγελίας
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const [showCustomerForm, setShowCustomerForm] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('Κατηγορίες')
        .select('*')
        .order('Name');
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('✅ Categories loaded:', data?.length, 'items');
      setCategories(data || []);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Προιόντα')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('✅ Products loaded:', data?.length, 'items for category', categoryId);
      setProducts(data || []);
      setSelectedCategory(categoryId);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProducts([]);
      setSelectedCategory(categoryId);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setProducts([]);
    setSelectedProduct(null);
  };

  const handleSaveConfiguration = (configData) => {
    console.log('Configuration saved:', configData);
    console.log('Customer info:', customerInfo);
    
    // Προσθήκη στη λίστα αποθηκευμένων προϊόντων
    const newProduct = {
      id: Date.now(), // Unique ID
      productName: configData.productName,
      config: configData.config,
      calculations: configData.calculations,
      timestamp: new Date().toISOString()
    };
    
    setSavedProducts(prev => [...prev, newProduct]);
    
    alert(`Το προϊόν προστέθηκε στη λίστα!\n\nΠροϊόν: ${configData.productName}\nΤιμή: €${configData.calculations.totalPrice.toFixed(2)}\n\nΣύνολο προϊόντων: ${savedProducts.length + 1}`);
    
    // Επιστροφή στα προϊόντα για να προσθέσει άλλο
    setSelectedProduct(null);
  };

  const handleNavigateToProduct = async (productId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Προιόντα')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSelectedProduct(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      alert('Σφάλμα κατά τη φόρτωση του προϊόντος');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerFormSubmit = (e) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone) {
      alert('Παρακαλώ συμπληρώστε τουλάχιστον το Όνομα και το Τηλέφωνο');
      return;
    }
    setShowCustomerForm(false);
  };

  const handleEditCustomer = () => {
    setShowCustomerForm(true);
  };

  const handleShowOrderSummary = () => {
    setShowOrderSummary(true);
    setSelectedCategory(null);
    setSelectedProduct(null);
  };

  const handleRemoveProduct = (productId) => {
    if (confirm('Είστε σίγουροι ότι θέλετε να αφαιρέσετε αυτό το προϊόν;')) {
      setSavedProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleCompleteOrder = () => {
    // Δημιουργία αναλυτικού email με όλα τα στοιχεία
    const totalWithVAT = savedProducts.reduce((sum, item) => sum + item.calculations.totalPrice, 0);
    const totalWithoutVAT = savedProducts.reduce((sum, item) => sum + (item.calculations.priceWithoutVAT || item.calculations.totalPrice / 1.24), 0);
    
    let emailBody = `ΝΕΑΠΑΡΑΓΓΕΛΙΑ - ERP Σύστημα Τεντών & Πέργκολών\n\n`;
    emailBody += `═══════════════════════════════════════\n`;
    emailBody += `ΣΤΟΙΧΕΙΑ ΠΕΛΑΤΗ\n`;
    emailBody += `═══════════════════════════════════════\n`;
    emailBody += `Όνομα: ${customerInfo.name}\n`;
    emailBody += `Τηλέφωνο: ${customerInfo.phone}\n`;
    if (customerInfo.email) emailBody += `Email: ${customerInfo.email}\n`;
    if (customerInfo.address) emailBody += `Διεύθυνση: ${customerInfo.address}\n`;
    if (customerInfo.city) emailBody += `Πόλη: ${customerInfo.city}\n`;
    if (customerInfo.postalCode) emailBody += `Τ.Κ.: ${customerInfo.postalCode}\n`;
    emailBody += `\n`;
    
    emailBody += `═══════════════════════════════════════\n`;
    emailBody += `ΠΡΟΪΟΝΤΑ ΠΑΡΑΓΓΕΛΙΑΣ (${savedProducts.length})\n`;
    emailBody += `═══════════════════════════════════════\n\n`;
    
    savedProducts.forEach((item, index) => {
      emailBody += `${index + 1}. ${item.productName}\n`;
      emailBody += `───────────────────────────────────────\n`;
      
      // Διαστάσεις
      if (item.config.width) emailBody += `   Πλάτος: ${item.config.width} cm\n`;
      if (item.config.projection) emailBody += `   Προβολή: ${item.config.projection} cm\n`;
      if (item.config.height) emailBody += `   Ύψος: ${item.config.height} cm\n`;
      if (item.config.hasMotor !== undefined) {
        emailBody += `   Μηχανισμός: ${item.config.hasMotor ? 'Μοτέρ' : 'Χειροκίνητο'}\n`;
      }
      
      // Χρώμα
      if (item.config.customColor) {
        emailBody += `   Χρώμα: ${item.config.customColor}${item.config.customColorCode ? ' (' + item.config.customColorCode + ')' : ''}\n`;
      }
      
      // Ύφασμα (αν υπάρχει)
      if (item.config.selectedFabric) {
        emailBody += `   Ύφασμα: ${item.config.selectedFabric}\n`;
      }
      
      // Επιλογές
      if (item.config.hasCabrio) emailBody += `   ✓ Cabrio\n`;
      if (item.config.hasOldParapet) emailBody += `   ✓ Παλιό Στηθαίο\n`;
      if (item.config.hasLightSlot) emailBody += `   ✓ Φωτιστικό Slot\n`;
      
      // Τιμή
      emailBody += `\n`;
      if (item.calculations.priceWithoutVAT) {
        emailBody += `   Τιμή (χωρίς ΦΠΑ): €${item.calculations.priceWithoutVAT.toFixed(2)}\n`;
      }
      emailBody += `   Τιμή (με ΦΠΑ): €${item.calculations.totalPrice.toFixed(2)}\n`;
      emailBody += `\n`;
    });
    
    emailBody += `═══════════════════════════════════════\n`;
    emailBody += `ΣΥΝΟΛΟ ΠΑΡΑΓΓΕΛΙΑΣ\n`;
    emailBody += `═══════════════════════════════════════\n`;
    emailBody += `Χωρίς ΦΠΑ: €${totalWithoutVAT.toFixed(2)}\n`;
    emailBody += `Με ΦΠΑ (24%): €${totalWithVAT.toFixed(2)}\n`;
    emailBody += `\n`;
    emailBody += `Ημερομηνία: ${new Date().toLocaleString('el-GR')}\n`;
    
    // Δημιουργία mailto link
    const subject = `Νέα Παραγγελία - ${customerInfo.name} - ${savedProducts.length} Προϊόντα`;
    const mailtoLink = `mailto:orders@tsoukalasco.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Άνοιγμα email client
    window.location.href = mailtoLink;
    
    // Επιβεβαίωση
    setTimeout(() => {
      if (confirm('Το email ανοίχτηκε στο πρόγραμμα email σας.\n\nΘέλετε να καθαρίσετε την παραγγελία;')) {
        setSavedProducts([]);
        setShowOrderSummary(false);
        alert('Η παραγγελία καθαρίστηκε επιτυχώς!');
      }
    }, 500);
  };

  const renderConfigComponent = () => {
    if (!selectedProduct) return null;

    // Πέργκολες (Κατηγορία 2)
    if (selectedProduct.category_id === '2' || selectedProduct.category_id === 2) {
      // Προ 100 (ID 18)
      if (selectedProduct.id === '18' || selectedProduct.id === 18) {
        return (
          <PergolaProConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }
      
      // Προ 150 (ID 19)
      if (selectedProduct.id === '19' || selectedProduct.id === 19) {
        return (
          <PergolaPro150Config 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }
      
      // Προ Mega (ID 20)
      if (selectedProduct.id === '20' || selectedProduct.id === 20) {
        return (
          <PergolaProMegaConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }

      // Βιοκλιματική (ID 25)
      if (selectedProduct.id === '25' || selectedProduct.id === 25) {
        return (
          <BioclimaticConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }

      // Flat (ID 24)
      if (selectedProduct.id === '24' || selectedProduct.id === 24) {
        return (
          <FlatConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }

      // Κρεμαστή / Hanging (ID 23)
      if (selectedProduct.id === '23' || selectedProduct.id === 23) {
        return (
          <HangingConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }

      // Open Sky (ID 26)
      if (selectedProduct.id === '26' || selectedProduct.id === 26) {
        return (
          <OpenSkyConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }

      // Balloon (ID 29)
      if (selectedProduct.id === '29' || selectedProduct.id === 29) {
        return (
          <BalloonConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }

      // Σταθερές Περσίδες / Fixed Blades (ID 28)
      if (selectedProduct.id === '28' || selectedProduct.id === 28) {
        return (
          <FixedBladesConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }

      // Δανάη (ID 30)
      if (selectedProduct.id === '30' || selectedProduct.id === 30) {
        return (
          <DanaeConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }

      // Open Roof (ID 27)
      if (selectedProduct.id === '27' || selectedProduct.id === 27) {
        return (
          <OpenRoofConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }

      // Στάνταρ Μοτέρ Κουτί (ID 22)
      if (selectedProduct.id === '22' || selectedProduct.id === 22) {
        return (
          <StandardMotorConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
            onNavigate={handleNavigateToProduct}
          />
        );
      }
    }

    // Τέντες με Βραχίονες (Κατηγορία 1)
    if (selectedProduct.category_id === '1' || selectedProduct.category_id === 1) {
      // Τέντα Με Βραχίονες Κασέτα 530 (ID 12)
      if (selectedProduct.id === '12' || selectedProduct.id === 12) {
        return (
          <Kasetina530Config 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
          />
        );
      }

      // Τέντα Με Βραχίονες Κασέτα 732 (ID 13)
      if (selectedProduct.id === '13' || selectedProduct.id === 13) {
        return (
          <Kaseta732Config 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
          />
        );
      }

      // Τέντα Με Βραχίονες Κασέτα Epica (ID 16)
      if (selectedProduct.id === '16' || selectedProduct.id === 16) {
        return (
          <EpicaConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
          />
        );
      }

      // TODO: Base Plus (ID 14), Base Lite (ID 15), Epica Lite (ID 17) - χρειάζονται πίνακες τιμών
    }

    // Κάθετο Σύστημα (Κατηγορία 3)
    if (selectedProduct.category_id === '3' || selectedProduct.category_id === 3) {
      // Κάθετο Ζιπ (ID 31)
      if (selectedProduct.id === '31' || selectedProduct.id === 31) {
        return (
          <ZipScreenConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
          />
        );
      }

      // Κάθετο Κασονέτο Συρματόσχοινα (ID 32)
      if (selectedProduct.id === '32' || selectedProduct.id === 32) {
        return (
          <KasonetoWireConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
          />
        );
      }

      // Κάθετο Κασονέτο Φ10 (ID 33)
      if (selectedProduct.id === '33' || selectedProduct.id === 33) {
        return (
          <KasonetoPhi10Config 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
          />
        );
      }

      // Κάθετο ΒΤ (ID 36)
      if (selectedProduct.id === '36' || selectedProduct.id === 36) {
        return (
          <KathetoVTConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
          />
        );
      }
    }

    // Default για προϊόντα χωρίς configuration
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {selectedProduct.name}
        </h2>
        <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <p className="text-lg text-gray-700">
            Το configuration για αυτό το προϊόν βρίσκεται υπό ανάπτυξη.
          </p>
          <button
            onClick={handleBackToProducts}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Επιστροφή στα Προϊόντα
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Φόρτωση...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-6 px-4">
      <div className="max-w-[210mm] mx-auto">
        <header className="text-center mb-8 relative">
          <div className="inline-block">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
              <h1 className="text-3xl font-bold mb-2">
                🏗️ ERP Σύστημα Τεντών & Πέργκολών
              </h1>
              <p className="text-blue-100 text-sm font-medium">Διαμόρφωση & Τιμολόγηση Προϊόντων</p>
            </div>
          </div>
        </header>

        {/* Customer Info Form */}
        {showCustomerForm ? (
          <div className="max-w-[210mm] mx-auto mb-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 transform hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-100">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Στοιχεία Πελάτη</h2>
              </div>
              
              <form onSubmit={handleCustomerFormSubmit} className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Όνομα Πελάτη *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 bg-white shadow-sm"
                      placeholder="π.χ. Γιώργος Παπαδόπουλος"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      <Phone className="w-3 h-3 inline mr-1" />
                      Τηλέφωνο *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="π.χ. 6912345678"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="π.χ. email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Πόλη
                    </label>
                    <input
                      type="text"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="π.χ. Αθήνα"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      Διεύθυνση
                    </label>
                    <input
                      type="text"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="π.χ. Λεωφ. Κηφισίας 123"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Τ.Κ.
                    </label>
                    <input
                      type="text"
                      value={customerInfo.postalCode}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      placeholder="π.χ. 11523"
                      maxLength="5"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    ✨ Συνέχεια στα Προϊόντα
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Customer Info Summary */}
            <div className="max-w-[210mm] mx-auto mb-6 bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-xl p-5 border border-blue-100 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-800">{customerInfo.name}</p>
                    <p className="text-xs text-gray-600 font-medium">
                      {customerInfo.phone}
                      {customerInfo.email && ` • ${customerInfo.email}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {savedProducts.length > 0 && (
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl text-sm font-bold shadow-sm">
                      🛒 {savedProducts.length} προϊόντα
                    </div>
                  )}
                  <button
                    onClick={handleEditCustomer}
                    className="px-4 py-2 text-xs bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    ✏️ Επεξεργασία
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              {savedProducts.length > 0 && (
                <div className="flex items-center gap-3 pt-3 border-t border-blue-200">
                  <button
                    onClick={handleBackToCategories}
                    className="flex-1 px-4 py-3 text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-bold flex items-center justify-center gap-2"
                  >
                    <Package className="w-5 h-5" />
                    ➕ Προϊόν
                  </button>
                  <button
                    onClick={handleShowOrderSummary}
                    className="flex-1 px-4 py-3 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-bold flex items-center justify-center gap-2"
                  >
                    <Layers className="w-5 h-5" />
                    📋 Παραγγελία
                  </button>
                </div>
              )}
            </div>

            {/* Breadcrumb Navigation */}
            {(selectedCategory || selectedProduct) && (
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-600">
                <button
                  onClick={handleBackToCategories}
                  className="hover:text-blue-600 font-medium"
                >
                  Κατηγορίες
                </button>
                {selectedCategory && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <button
                      onClick={handleBackToProducts}
                      className="hover:text-blue-600 font-medium"
                    >
                      {categories.find(c => c.id === selectedCategory)?.Name || 'Προϊόντα'}
                    </button>
                  </>
                )}
                {selectedProduct && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-800 font-medium">{selectedProduct.name}</span>
                  </>
                )}
              </div>
            )}

            {/* Main Content */}
            {showOrderSummary ? (
              // Order Summary View
              <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl shadow-2xl p-8 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                      <Layers className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">📋 Παραγγελία</h2>
                  </div>
                  <button
                    onClick={() => setShowOrderSummary(false)}
                    className="px-5 py-3 text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-200 font-bold shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    ← Επιστροφή
                  </button>
                </div>

                {savedProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Δεν υπάρχουν προϊόντα στην παραγγελία</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Λίστα Προϊόντων */}
                    {savedProducts.map((item, index) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">{item.productName}</h3>
                              <p className="text-xs text-gray-500">
                                {new Date(item.timestamp).toLocaleString('el-GR')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveProduct(item.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            Αφαίρεση
                          </button>
                        </div>

                        {/* Διαστάσεις */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                          {item.config.width && (
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">Πλάτος:</span>
                              <span className="font-semibold ml-1">{item.config.width} cm</span>
                            </div>
                          )}
                          {item.config.projection && (
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">Προβολή:</span>
                              <span className="font-semibold ml-1">{item.config.projection} cm</span>
                            </div>
                          )}
                          {item.config.height && (
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">Ύψος:</span>
                              <span className="font-semibold ml-1">{item.config.height} cm</span>
                            </div>
                          )}
                          {item.config.hasMotor !== undefined && (
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">Μηχανισμός:</span>
                              <span className="font-semibold ml-1">{item.config.hasMotor ? 'Μοτέρ' : 'Χειροκίνητο'}</span>
                            </div>
                          )}
                        </div>

                        {/* Τιμή */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            {item.calculations.priceWithoutVAT && (
                              <span>Χωρίς ΦΠΑ: €{item.calculations.priceWithoutVAT.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              €{item.calculations.totalPrice.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">με ΦΠΑ</div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Συνολικά */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-1">Συνολικό Κόστος</h3>
                          <p className="text-sm text-gray-600">{savedProducts.length} προϊόντα</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-600">
                            €{savedProducts.reduce((sum, item) => sum + item.calculations.totalPrice, 0).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Χωρίς ΦΠΑ: €{savedProducts.reduce((sum, item) => sum + (item.calculations.priceWithoutVAT || item.calculations.totalPrice / 1.24), 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Κουμπιά Ενεργειών */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleBackToCategories}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Package className="w-5 h-5" />
                        Προσθέστε και άλλο Προϊόν
                      </button>
                      <button
                        onClick={handleCompleteOrder}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Ολοκλήρωση Παραγγελίας
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : !selectedCategory ? (
              // Categories Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => {
                  const categoryImage = getCategoryImage(category.id);
                  const hasImage = categoryImage !== null;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => fetchProductsByCategory(category.id)}
                      className={`relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 text-left group transform hover:scale-[1.08] hover:-translate-y-3 border-2 border-transparent hover:border-blue-400 ${!hasImage ? 'p-8' : ''}`}
                    >
                      {/* Background Image - ΜΟΝΟ αν υπάρχει */}
                      {hasImage && (
                        <div className="relative h-48 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
                          <img 
                            src={categoryImage} 
                            alt={category.Name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.style.display = 'none';
                            }}
                          />
                          {/* Floating Icon */}
                          <div className="absolute top-4 right-4 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                            <Package className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-6 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
                        {!hasImage && (
                          <div className="mb-4 p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl inline-block shadow-xl">
                            <Package className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black text-gray-800 group-hover:text-blue-600 transition-colors">
                            {category.Name}
                          </h3>
                          <ChevronRight className="w-7 h-7 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300" />
                        </div>
                        <p className="text-sm text-gray-600 font-bold mt-2">
                          🚀 Εξερευνήστε τα προϊόντα
                        </p>
                      </div>
                      
                      {/* Shine Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : !selectedProduct ? (
              // Products Grid με Υποκατηγορίες
              <div>
                <button
                  onClick={handleBackToCategories}
                  className="mb-3 px-3 py-1 text-sm bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700"
                >
                  ← Επιστροφή στις Κατηγορίες
                </button>
                
                {/* Ομαδοποίηση προϊόντων ανά υποκατηγορία */}
                {groupProductsBySubcategory(selectedCategory, products).map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6">
                    {/* Τίτλος Υποκατηγορίας (αν υπάρχει) */}
                    {group.subcategory && (
                      <div className="flex items-center gap-2 mb-3">
                        <Layers className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-800">
                          {group.subcategory.name}
                        </h3>
                      </div>
                    )}
                    
                    {/* Grid Προϊόντων */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {group.products.map((product) => {
                        const productImage = getProductImage(product.id);
                        const hasImage = productImage !== null;
                        
                        return (
                          <button
                            key={product.id}
                            onClick={() => handleProductSelect(product)}
                            className={`relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 text-center group transform hover:scale-[1.1] hover:-translate-y-2 border-2 border-transparent hover:border-indigo-400 ${!hasImage ? 'py-8' : ''}`}
                          >
                            {/* Product Image - ΜΟΝΟ αν υπάρχει */}
                            {hasImage && (
                              <div className="relative h-40 overflow-hidden rounded-t-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                                <img 
                                  src={productImage} 
                                  alt={product.name}
                                  className="w-full h-full object-cover transform group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.style.display = 'none';
                                  }}
                                />
                                {/* Floating Badge */}
                                <div className="absolute top-2 right-2 z-20 p-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
                                  <Package className="w-4 h-4 text-indigo-600" />
                                </div>
                                {/* Arrow on hover */}
                                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-500">
                                    <ChevronRight className="w-6 h-6 text-indigo-600" />
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Product Name - ΠΑΝΤΑ εμφανίζεται */}
                            <div className={`p-4 bg-gradient-to-br from-white via-indigo-50 to-purple-50 ${!hasImage ? 'rounded-2xl' : ''}`}>
                              {!hasImage && (
                                <div className="mb-3 p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl inline-block">
                                  <Package className="w-8 h-8 text-white" />
                                </div>
                              )}
                              <h3 className={`font-black text-gray-800 group-hover:text-indigo-600 transition-colors leading-tight mb-2 ${!hasImage ? 'text-base' : 'text-sm'}`}>
                                {product.name}
                              </h3>
                              <div className="flex items-center justify-center gap-1 text-xs text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span>⚡ Διαμόρφωση</span>
                              </div>
                            </div>
                            
                            {/* Glow Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl">
                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-purple-400/30 to-indigo-400/0 blur-xl" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Product Configuration
              <div>
                <button
                  onClick={handleBackToProducts}
                  className="mb-3 px-3 py-1 text-sm bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700"
                >
                  ← Επιστροφή στα Προϊόντα
                </button>
                {renderConfigComponent()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;