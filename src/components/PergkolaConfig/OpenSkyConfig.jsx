import { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Lightbulb } from 'lucide-react';
import { 
  OPEN_SKY_BASE_PRICES,
  STANDARD_RAL_COLORS,
  getPriceFromTable, 
  roundUpToNextAvailableProjection,
  roundUpToNextAvailableWidth
} from '../../constants/pergolaPricingTables';
import AlternativePergolas from '../shared/AlternativePergolas';

function OpenSkyConfig({ product, onSave, onNavigate }) {
  const [config, setConfig] = useState({
    width: 200,
    projection: 200,
    columnCount: 4,
    columnHeight: 250,
    wallBaseCount: 0,
    hasLighting: false, // Επιλογή φωτισμού (Περιμετρική LED)
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
    
    // Validation: Αν έχει κολόνες, πρέπει να έχει ύψος
    if (config.columnCount > 0 && (!config.columnHeight || config.columnHeight <= 0)) {
      newErrors.push('Το ύψος κολόνας είναι υποχρεωτικό όταν επιλέγονται κολόνες');
    }
    
    // Βασική τιμή από πίνακα με στρογγυλοποίηση
    const basePrice = getPriceFromTable(OPEN_SKY_BASE_PRICES, config.projection, config.width);
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

    // Κολόνες 150×150 - Manual επιλογή πλήθους (όπως Βιοκλιματική)
    const columnCost = config.columnCount * 400;

    // Βάσεις τοίχου - Manual επιλογή πλήθους (όπως Βιοκλιματική)
    const wallBaseCost = config.wallBaseCount * 27;

    // Υπολογισμός συνόλων
    const subtotal = basePrice + lightingCost + columnCost + wallBaseCost;

    // Επιβάρυνση χρώματος (μόνο αν είναι custom color - 10% όπως PRO100)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
              <p className="text-sm text-gray-500">Διαμόρφωση & Υπολογισμός Τιμής</p>
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
                  min="200"
                  max="390"
                  value={config.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. 300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Στρογγυλοποίηση: {roundUpToNextAvailableWidth(OPEN_SKY_BASE_PRICES, config.projection, config.width)}cm
                </p>
              </div>

              {/* Προβολή */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Προβολή (cm)
                </label>
                <input
                  type="number"
                  min="200"
                  max="672"
                  value={config.projection}
                  onChange={(e) => handleChange('projection', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. 400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Στρογγυλοποίηση: {roundUpToNextAvailableProjection(OPEN_SKY_BASE_PRICES, config.projection)}cm
                </p>
              </div>

              {/* Κολόνες */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Αριθμός Κολονών 150×150 (400€/τεμ)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={config.columnCount}
                  onChange={(e) => handleChange('columnCount', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Κόστος κολονών: €{calculations.columnCost.toFixed(2)}
                </p>
              </div>

              {/* Ύψος Κολόνας */}
              {config.columnCount > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ύψος Κολόνας (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="500"
                    value={config.columnHeight}
                    onChange={(e) => handleChange('columnHeight', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="π.χ. 250"
                  />
                  <p className="text-xs text-gray-500 mt-1">Υποχρεωτικό για σημείωση</p>
                </div>
              )}

              {/* Βάσεις Τοίχου */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Αριθμός Βάσεων Τοίχου (27€/τεμ)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={config.wallBaseCount}
                  onChange={(e) => handleChange('wallBaseCount', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Κόστος βάσεων: €{calculations.wallBaseCost.toFixed(2)}
                </p>
              </div>

              {/* Φωτισμός */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h4 className="font-semibold text-gray-700">Φωτισμός</h4>
                </div>
                
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={config.hasLighting}
                    onChange={(e) => handleChange('hasLighting', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-700">Περιμετρική LED</span>
                    <p className="text-xs text-gray-500">
                      {((2 * (config.width + config.projection)) / 100).toFixed(2)}m × 24€ + 440€ Box
                    </p>
                  </div>
                  <span className="font-semibold text-blue-600">
                    €{calculations.lightingCost.toFixed(2)}
                  </span>
                </label>
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
                      <span className="font-medium text-gray-700">Άλλο Χρώμα (+10%)</span>
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
            </div>

            {/* Στήλη Υπολογισμού */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Ανάλυση Κόστους
              </h3>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-gray-700">Βασική Τιμή</span>
                  <span className="font-semibold text-gray-900">
                    €{calculations.basePrice.toFixed(2)}
                  </span>
                </div>

                {calculations.lightingCost > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Φωτισμός LED</span>
                    <span className="font-semibold text-gray-900">
                      €{calculations.lightingCost.toFixed(2)}
                    </span>
                  </div>
                )}

                {calculations.columnCost > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Κολόνες ({config.columnCount} × 400€)</span>
                    <span className="font-semibold text-gray-900">
                      €{calculations.columnCost.toFixed(2)}
                    </span>
                  </div>
                )}

                {calculations.wallBaseCost > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Βάσεις Τοίχου ({config.wallBaseCount} × 27€)</span>
                    <span className="font-semibold text-gray-900">
                      €{calculations.wallBaseCost.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-blue-300">
                  <span className="font-semibold text-gray-700">Μερικό Σύνολο</span>
                  <span className="font-bold text-gray-900">
                    €{calculations.subtotal.toFixed(2)}
                  </span>
                </div>

                {calculations.colorSurcharge > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Επιβάρυνση Χρώματος (10%)</span>
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

export default OpenSkyConfig;
