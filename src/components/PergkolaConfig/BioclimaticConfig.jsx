import { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Lightbulb } from 'lucide-react';
import { 
  BIOCLIMATIC_BASE_PRICES,
  STANDARD_RAL_COLORS,
  getPriceFromTable, 
  roundUpToNextAvailableProjection,
  roundUpToNextAvailableWidth
} from '../../constants/pergolaPricingTables';
import AlternativePergolas from '../shared/AlternativePergolas';

function BioclimaticConfig({ product, onSave, onNavigate }) {
  const [config, setConfig] = useState({
    width: 200,
    projection: 200,
    columnCount: 4,
    wallBaseCount: 0,
    hasLighting: false, // Επιλογή φωτισμού
    ralColor: 'RAL9016',
    customColor: false,
    customColorCode: ''
  });

  const [calculations, setCalculations] = useState({
    basePrice: 0,
    lightingCost: 0,
    columnCost: 0,
    wallBaseCost: 0,
    subtotal: 0,
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
    
    // Βασική τιμή από πίνακα (αυτόματη στρογγυλοποίηση)
    const basePrice = getPriceFromTable(BIOCLIMATIC_BASE_PRICES, config.projection, config.width);
    if (basePrice === 0) {
      newErrors.push(`Οι διαστάσεις ${config.width}cm × ${config.projection}cm είναι εκτός διαθέσιμου εύρους`);
    }

    // Φωτισμός - Μόνο Περιμετρική LED (προαιρετικός)
    // Τύπος: (2 × (πλάτος + προβολή)) / 100 μέτρα × 24€ + 440€ Lights Box
    let lightingCost = 0;
    if (config.hasLighting) {
      const perimeterMeters = (2 * (config.width + config.projection)) / 100;
      lightingCost = (perimeterMeters * 24) + 440;
    }

    // Κολόνες 150×150 - Manual επιλογή πλήθους
    const columnCost = config.columnCount * 400;

    // Βάσεις τοίχου - Manual επιλογή πλήθους
    const wallBaseCost = config.wallBaseCount * 27;

    // Υπολογισμός συνόλων
    const subtotal = basePrice + lightingCost + columnCost + wallBaseCost;

    // Επιβάρυνση χρώματος (μόνο αν είναι custom color)
    const colorSurchargeAmount = config.customColor ? subtotal * 0.10 : 0;
    const subtotalWithoutVAT = subtotal + colorSurchargeAmount;

    // ΦΠΑ 24%
    const vat = subtotalWithoutVAT * 0.24;
    const totalPrice = subtotalWithoutVAT + vat;

    setCalculations({
      basePrice,
      lightingCost,
      columnCost,
      wallBaseCost,
      subtotal,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <p className="text-gray-600">Διαμόρφωση Βιοκλιματικής Πέργκολας</p>
        </div>

        {/* Errors Display */}
        {errors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-red-800 font-semibold mb-2">Σφάλματα Διαμόρφωσης:</h3>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Calculator className="mr-2" size={24} />
              Διαμόρφωση
            </h2>

            <div className="space-y-4">
              {/* Διαστάσεις */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Πλάτος (cm)
                </label>
                <input
                  type="number"
                  min="200"
                  max="400"
                  value={config.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. 300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Στρογγυλοποίηση: {roundUpToNextAvailableWidth(BIOCLIMATIC_BASE_PRICES, config.projection, config.width)}cm
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Προβολή (cm)
                </label>
                <input
                  type="number"
                  min="200"
                  max="1500"
                  value={config.projection}
                  onChange={(e) => handleChange('projection', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. 500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Στρογγυλοποίηση: {roundUpToNextAvailableProjection(BIOCLIMATIC_BASE_PRICES, config.projection)}cm
                </p>
              </div>

              {/* Κολόνες 150×150 - Manual Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Πλήθος Κολονών 150×150 (400€/κολόνα)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={config.columnCount}
                  onChange={(e) => handleChange('columnCount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Βάσεις Τοίχου - Manual Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Πλήθος Βάσεων Τοίχου (27€/βάση)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={config.wallBaseCount}
                  onChange={(e) => handleChange('wallBaseCount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Φωτισμός - Επιλογή */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="hasLighting"
                    checked={config.hasLighting}
                    onChange={(e) => handleChange('hasLighting', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="hasLighting" className="text-sm font-medium text-gray-700">
                    Περιμετρική LED
                  </label>
                </div>
                {config.hasLighting && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                    <div className="flex items-center">
                      <Lightbulb className="text-blue-600 mr-2" size={20} />
                      <div>
                        <p className="text-xs text-gray-600">
                          Περίμετρος: {((2 * (config.width + config.projection)) / 100).toFixed(2)}m × 24€ + 440€ Lights Box
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Επιλογή Χρώματος */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Χρώμα RAL (Στάνταρ)
                </label>
                <select
                  value={config.ralColor}
                  onChange={(e) => handleChange('ralColor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STANDARD_RAL_COLORS.map(color => (
                    <option key={color.code} value={color.code}>
                      {color.code} - {color.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Χωρίς επιβάρυνση</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="customColor"
                  checked={config.customColor}
                  onChange={(e) => handleChange('customColor', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="customColor" className="text-sm font-medium text-gray-700">
                  Άλλο Χρώμα (+10% επιβάρυνση)
                </label>
              </div>

              {config.customColor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Κωδικός Χρώματος
                  </label>
                  <input
                    type="text"
                    value={config.customColorCode}
                    onChange={(e) => handleChange('customColorCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="π.χ. RAL 7035"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ανάλυση Κόστους</h2>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Βασική Τιμή:</span>
                <span className="font-semibold">€{calculations.basePrice.toFixed(2)}</span>
              </div>

              {calculations.lightingCost > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Φωτισμός LED:</span>
                  <span className="font-semibold">€{calculations.lightingCost.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Κολόνες ({config.columnCount} × 400€):</span>
                <span className="font-semibold">€{calculations.columnCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Βάσεις Τοίχου ({config.wallBaseCount} × 27€):</span>
                <span className="font-semibold">€{calculations.wallBaseCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="text-gray-700 font-medium">Υποσύνολο:</span>
                <span className="font-semibold">€{calculations.subtotal.toFixed(2)}</span>
              </div>

              {calculations.colorSurcharge > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Επιβάρυνση Χρώματος (10%):</span>
                  <span className="font-semibold text-orange-600">+€{calculations.colorSurcharge.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-b border-gray-400">
                <span className="text-gray-800 font-semibold">Σύνολο (χωρίς ΦΠΑ):</span>
                <span className="font-bold">€{calculations.subtotalWithoutVAT.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">ΦΠΑ (24%):</span>
                <span className="font-semibold text-blue-600">€{calculations.vat.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-4 mt-4">
                <span className="text-lg font-bold text-gray-800">Τελική Τιμή:</span>
                <span className="text-2xl font-bold text-blue-600">€{calculations.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={errors.length > 0}
              className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors ${
                errors.length > 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
  );
}

export default BioclimaticConfig;
