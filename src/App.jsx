import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Package, ChevronRight, User, Phone, Mail, MapPin } from 'lucide-react';
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
    alert(`Η διαμόρφωση αποθηκεύτηκε!\n\nΠελάτης: ${customerInfo.name}\nΣυνολική Τιμή: €${configData.calculations.totalPrice.toFixed(2)}`);
    // TODO: Αποθήκευση στη βάση δεδομένων
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

      // Κάθετο Συρματόσχοινα Cabrio (ID 34)
      if (selectedProduct.id === '34' || selectedProduct.id === 34) {
        return (
          <KasonetoWireConfig 
            product={selectedProduct} 
            onSave={handleSaveConfiguration}
          />
        );
      }

      // Κάθετο Φ10 Cabrio (ID 35)
      if (selectedProduct.id === '35' || selectedProduct.id === 35) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-[210mm] mx-auto">
        <header className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            ERP Σύστημα Τεντών & Πέργκολών
          </h1>
          <p className="text-sm text-gray-600">Διαμόρφωση & Τιμολόγηση Προϊόντων</p>
        </header>

        {/* Customer Info Form */}
        {showCustomerForm ? (
          <div className="max-w-[210mm] mx-auto mb-4">
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">Στοιχεία Πελάτη</h2>
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
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
                    className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Συνέχεια στα Προϊόντα
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Customer Info Summary */}
            <div className="max-w-[210mm] mx-auto mb-3 bg-white rounded-lg shadow p-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{customerInfo.name}</p>
                  <p className="text-xs text-gray-600">
                    {customerInfo.phone}
                    {customerInfo.email && ` • ${customerInfo.email}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleEditCustomer}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Επεξεργασία
              </button>
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
            {!selectedCategory ? (
              // Categories Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => fetchProductsByCategory(category.id)}
                    className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Package className="w-8 h-8 text-blue-600" />
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {category.Name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Δείτε όλα τα προϊόντα
                    </p>
                  </button>
                ))}
              </div>
            ) : !selectedProduct ? (
              // Products Grid
              <div>
                <button
                  onClick={handleBackToCategories}
                  className="mb-3 px-3 py-1 text-sm bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700"
                >
                  ← Επιστροφή στις Κατηγορίες
                </button>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="p-3 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow text-left group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Package className="w-5 h-5 text-indigo-600" />
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Κάντε κλικ για διαμόρφωση
                      </p>
                    </button>
                  ))}
                </div>
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
      
      {/* Admin Product Manager - Floating Button */}
      <AdminProductManager />
    </div>
  );
}

export default App;