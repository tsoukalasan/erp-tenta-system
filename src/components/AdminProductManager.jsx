import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Package, AlertCircle, CheckCircle } from 'lucide-react';

const AdminProductManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: ''
  });

  // Φόρτωση κατηγοριών
  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('Κατηγορίες')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.category_id) {
      setMessage({ type: 'error', text: 'Παρακαλώ συμπληρώστε όλα τα πεδία' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await supabase
        .from('Προιόντα')
        .insert([
          {
            name: newProduct.name,
            category_id: newProduct.category_id
          }
        ])
        .select();

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Το προϊόν "${newProduct.name}" προστέθηκε επιτυχώς με ID: ${data[0].id}` 
      });
      
      // Reset form
      setNewProduct({ name: '', category_id: '' });
      
      // Κλείσιμο φόρμας μετά από 3 δευτερόλεπτα
      setTimeout(() => {
        setShowForm(false);
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error adding product:', error);
      setMessage({ type: 'error', text: 'Σφάλμα κατά την προσθήκη του προϊόντος' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-all"
          title="Προσθήκη Νέου Προϊόντος"
        >
          <Plus className="w-6 h-6" />
          <span className="font-medium">Νέο Προϊόν</span>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl p-6 w-96 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Νέο Προϊόν
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setMessage({ type: '', text: '' });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Όνομα Προϊόντος *
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="π.χ. Πέργκολα Premium"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Κατηγορία *
              </label>
              <select
                value={newProduct.category_id}
                onChange={(e) => setNewProduct(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              >
                <option value="">Επιλέξτε κατηγορία</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-md font-medium text-white ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? 'Προσθήκη...' : 'Προσθήκη Προϊόντος'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setMessage({ type: '', text: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Ακύρωση
              </button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              💡 Συμβουλή: Μετά την προσθήκη του προϊόντος, θα πρέπει να:
            </p>
            <ul className="text-xs text-gray-500 mt-1 ml-4 list-disc space-y-1">
              <li>Προσθέσετε τους πίνακες τιμολόγησης</li>
              <li>Δημιουργήσετε το configuration component</li>
              <li>Ενημερώσετε το routing στο App.jsx</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductManager;
