import { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Home } from 'lucide-react';
import { 
  DANAE_BASE_PRICES,
  STANDARD_RAL_COLORS,
  getPriceFromTable,
  roundUpToNextAvailableProjection,
  roundUpToNextAvailableWidth
} from '../../constants/pergolaPricingTables';
import AlternativePergolas from '../shared/AlternativePergolas';

function DanaeConfig({ product, onSave, onNavigate }) {
  const [config, setConfig] = useState({
    width: 150,
    projection: 150,
    ralColor: 'RAL9016',
    customColor: false,
    customColorCode: ''
  });

  const [calculations, setCalculations] = useState({
    basePrice: 0,
    colorSurcharge: 0,
    subtotalWithoutVAT: 0,
    vat: 0,
    totalPrice: 0
  });

  const [errors, setErrors] = useState([]);

  useEffect(() => {
    calculatePrices();
  }, [config]);

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: parseFloat(value) || value }));
  };

  const calculatePrices = () => {
    const newErrors = [];
    
    // Βασική τιμή από πίνακα
    const basePrice = getPriceFromTable(DANAE_BASE_PRICES, config.projection, config.width);
    if (basePrice === 0) {
      newErrors.push(`Οι διαστάσεις ${config.width}cm × ${config.projection}cm είναι εκτός διαθέσιμου εύρους`);
    }

    // Επιβάρυνση χρώματος
    // Στάνταρ RAL: Χωρίς επιβάρυνση
    // Άλλο Χρώμα: +200€ (όχι ποσοστό!)
    const colorSurchargeAmount = config.customColor ? 200 : 0;
    const subtotalWithoutVAT = basePrice + colorSurchargeAmount;

    // ΦΠΑ 24%
    const vat = subtotalWithoutVAT * 0.24;
    const totalPrice = subtotalWithoutVAT + vat;

    setCalculations({
      basePrice,
      colorSurcharge: colorSurchargeAmount,
      subtotalWithoutVAT,
      vat,
      totalPrice
    });

    setErrors(newErrors);
  };

  const handleSave = () => {
    if (errors.length > 0) return;
    onSave({
      config,
      calculations,
      productName: product.name
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
              <p className="text-sm text-gray-500">Τοποθέτηση σε Οροφή - Ηλεκτροκίνητη Στάνταρ</p>
            </div>
          </div>

          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Home className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-1">Σημαντική Σημείωση</h3>
                <p className="text-sm text-amber-700">
                  Η πέργκολα Δανάη τοποθετείται <strong>μόνο σε υφιστάμενες κατασκευές</strong>. 
                  Δεν υπάρχουν κολόνες ή βάσεις. Είναι ηλεκτροκίνητη στάνταρ.
                </p>
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">Σφάλματα Διαμόρφωσης</h3>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Στήλη Διαμόρφωσης */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Διαστάσεις & Επιλογές
              </h3>

              {/* Πλάτος */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Πλάτος (cm)
                </label>
                <input
                  type="number"
                  min="150"
                  max="400"
                  value={config.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. 200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Στρογγυλοποίηση: {roundUpToNextAvailableWidth(DANAE_BASE_PRICES, config.projection, config.width)}cm
                </p>
              </div>

              {/* Προβολή */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Προβολή (cm)
                </label>
                <input
                  type="number"
                  min="150"
                  max="400"
                  value={config.projection}
                  onChange={(e) => handleChange('projection', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. 250"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Στρογγυλοποίηση: {roundUpToNextAvailableProjection(DANAE_BASE_PRICES, config.projection)}cm
                </p>
              </div>

              {/* Χρώμα */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Χρώμα</h4>
                
                <div className="space-y-3">
                  {/* Standard RAL Colors */}
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="colorType"
                        checked={!config.customColor}
                        onChange={() => handleChange('customColor', false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="font-medium text-gray-700">Στάνταρ RAL (χωρίς επιβάρυνση)</span>
                    </label>
                    {!config.customColor && (
                      <select
                        value={config.ralColor}
                        onChange={(e) => handleChange('ralColor', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {STANDARD_RAL_COLORS.map(color => (
                          <option key={color.code} value={color.code}>
                            {color.code} - {color.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Custom Color */}
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="colorType"
                        checked={config.customColor}
                        onChange={() => handleChange('customColor', true)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="font-medium text-gray-700">Άλλο Χρώμα (+200€)</span>
                    </label>
                    {config.customColor && (
                      <input
                        type="text"
                        value={config.customColorCode}
                        onChange={(e) => handleChange('customColorCode', e.target.value)}
                        placeholder="π.χ. RAL7016"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-green-800 mb-2">Περιλαμβάνει:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ Ηλεκτροκίνητη λειτουργία (στάνταρ)</li>
                  <li>✓ Τοποθέτηση σε υφιστάμενη κατασκευή</li>
                  <li>✓ Χωρίς κολόνες και βάσεις</li>
                </ul>
              </div>
            </div>

            {/* Στήλη Υπολογισμού */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Ανάλυση Κόστους
              </h3>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-gray-700">Βασική Τιμή (με ηλεκτροκίνητη)</span>
                  <span className="font-semibold text-gray-900">
                    €{calculations.basePrice.toFixed(2)}
                  </span>
                </div>

                {calculations.colorSurcharge > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Άλλο Χρώμα</span>
                    <span className="font-semibold text-gray-900">
                      €{calculations.colorSurcharge.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-blue-300">
                  <span className="font-semibold text-gray-700">Σύνολο (χωρίς ΦΠΑ)</span>
                  <span className="font-bold text-gray-900">
                    €{calculations.subtotalWithoutVAT.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-gray-700">ΦΠΑ 24%</span>
                  <span className="font-semibold text-gray-900">
                    €{calculations.vat.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 bg-blue-600 text-white rounded-lg px-4 mt-4">
                  <span className="text-lg font-bold">ΣΥΝΟΛΟ</span>
                  <span className="text-2xl font-bold">
                    €{calculations.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={errors.length > 0}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                  errors.length > 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Αποθήκευση Διαμόρφωσης
              </button>
            </div>
          </div>

          {/* Alternative Pergolas Section */}
          <AlternativePergolas 
            width={config.width}
            projection={config.projection}
            currentProductId={product.id}
            onSelect={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}

export default DanaeConfig;
