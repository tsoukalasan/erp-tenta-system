import { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Columns } from 'lucide-react';
import { 
  FIXED_BLADES_BASE_PRICES,
  STANDARD_RAL_COLORS,
  getPriceFromTable,
  roundUpToNextAvailableProjection,
  roundUpToNextAvailableWidth
} from '../../constants/pergolaPricingTables';
import AlternativePergolas from '../shared/AlternativePergolas';

function FixedBladesConfig({ product, onSave, onNavigate }) {
  const [config, setConfig] = useState({
    width: 100,
    projection: 200,
    columnHeight: 250, // Ύψος κολόνας σε cm
    ralColor: 'RAL9016',
    customColor: false,
    customColorCode: ''
  });

  const [calculations, setCalculations] = useState({
    roofPrice: 0,
    framePerimeter: 0,
    frameCost: 0,
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
    
    // Validation: Το ύψος κολόνας πρέπει να δίνεται οπωσδήποτε
    if (!config.columnHeight || config.columnHeight <= 0) {
      newErrors.push('Το ύψος κολόνας είναι υποχρεωτικό για τις Σταθερές Περσίδες');
    }

    // Τιμή οροφής από πίνακα
    const roofPrice = getPriceFromTable(FIXED_BLADES_BASE_PRICES, config.projection, config.width);
    if (roofPrice === 0) {
      newErrors.push(`Οι διαστάσεις ${config.width}cm × ${config.projection}cm είναι εκτός διαθέσιμου εύρους`);
    }

    // Πλαίσιο με κολόνα 130×100: 70€/μέτρο
    // Υπολογίζεται: Περίμετρος + Ύψος κολόνας
    // Περίμετρος = 2 × (Πλάτος + Προβολή)
    // Συνολικό μήκος = Περίμετρος + Ύψος (σε μέτρα)
    const perimeterCm = 2 * (config.width + config.projection);
    const totalLengthCm = perimeterCm + config.columnHeight;
    const totalLengthMeters = totalLengthCm / 100;
    const frameCost = totalLengthMeters * 70;

    // Υπολογισμός συνόλων
    const subtotal = roofPrice + frameCost;

    // Επιβάρυνση χρώματος (μόνο αν είναι custom color - 10% όπως PRO100)
    const colorSurchargeAmount = config.customColor ? subtotal * 0.10 : 0;
    const subtotalWithoutVAT = subtotal + colorSurchargeAmount;

    // ΦΠΑ 24%
    const vat = subtotalWithoutVAT * 0.24;
    const totalPrice = subtotalWithoutVAT + vat;

    setCalculations({
      roofPrice,
      framePerimeter: totalLengthMeters,
      frameCost,
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Σημείωση:</strong> Η τιμή αφορά μόνο οροφή. Το πλαίσιο με κολόνα 130×100 
                  υπολογίζεται με βάση την περίμετρο + το ύψος της κολόνας (70€/μέτρο).
                </p>
              </div>

              {/* Πλάτος */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Πλάτος (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="400"
                  value={config.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. 200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Στρογγυλοποίηση: {roundUpToNextAvailableWidth(FIXED_BLADES_BASE_PRICES, config.projection, config.width)}cm
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
                  max="500"
                  value={config.projection}
                  onChange={(e) => handleChange('projection', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. 300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Στρογγυλοποίηση: {roundUpToNextAvailableProjection(FIXED_BLADES_BASE_PRICES, config.projection)}cm
                </p>
              </div>

              {/* Ύψος Κολόνας */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Columns className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-gray-700">Ύψος Κολόνας (ΥΠΟΧΡΕΩΤΙΚΟ)</h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ύψος (cm): <span className="text-blue-600 font-semibold">{config.columnHeight}</span>
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="500"
                    step="10"
                    value={config.columnHeight}
                    onChange={(e) => handleChange('columnHeight', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="π.χ. 250"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Περίμετρος: {(2 * (config.width + config.projection) / 100).toFixed(2)}m<br />
                    + Ύψος κολόνας: {(config.columnHeight / 100).toFixed(2)}m<br />
                    = Συνολικό μήκος: {calculations.framePerimeter.toFixed(2)}m × 70€ = €{calculations.frameCost.toFixed(2)}
                  </p>
                </div>
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
                  <span className="text-gray-700">Οροφή (μόνο)</span>
                  <span className="font-semibold text-gray-900">
                    €{calculations.roofPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <div>
                    <span className="text-gray-700">Πλαίσιο 130×100</span>
                    <p className="text-xs text-gray-500">
                      {calculations.framePerimeter.toFixed(2)}m × 70€
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    €{calculations.frameCost.toFixed(2)}
                  </span>
                </div>

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

export default FixedBladesConfig;
