import { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Lightbulb } from 'lucide-react';
import { 
  EPICA_BASE_PRICES,
  getPriceFromTable
} from '../../constants/pergolaPricingTables';

function EpicaConfig({ product, onSave }) {
  const [config, setConfig] = useState({
    width: 350,
    projection: 200,
    hasLighting: false,
    customColor: false,
    customColorCode: ''
  });

  const [calculations, setCalculations] = useState({
    basePrice: 0,
    lightingCost: 0,
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
    
    if (config.width < 350 || config.width > 700) {
      newErrors.push('Το πλάτος πρέπει να είναι μεταξύ 350-700cm');
    }
    if (config.projection < 200 || config.projection > 350) {
      newErrors.push('Η προβολή πρέπει να είναι μεταξύ 200-350cm');
    }

    // Στρογγυλοποίηση
    const widthOptions = [350, 400, 450, 500, 550, 600, 650, 700];
    const projectionOptions = [200, 220, 250, 275, 300, 325, 350];
    
    const roundedWidth = widthOptions.reduce((prev, curr) => 
      Math.abs(curr - config.width) < Math.abs(prev - config.width) ? curr : prev
    );
    const roundedProjection = projectionOptions.reduce((prev, curr) => 
      Math.abs(curr - config.projection) < Math.abs(prev - config.projection) ? curr : prev
    );

    const basePrice = getPriceFromTable(EPICA_BASE_PRICES, roundedProjection, roundedWidth);
    if (basePrice === 0) {
      newErrors.push(`Οι διαστάσεις ${roundedWidth}cm × ${roundedProjection}cm δεν είναι διαθέσιμες`);
    }

    // Φωτισμός +620€
    const lightingCost = config.hasLighting ? 620 : 0;

    const subtotal = basePrice + lightingCost;
    const colorSurchargeAmount = config.customColor ? 220 : 0;
    const subtotalWithoutVAT = subtotal + colorSurchargeAmount;
    const vat = subtotalWithoutVAT * 0.24;
    const totalPrice = subtotalWithoutVAT + vat;

    setCalculations({
      basePrice,
      lightingCost,
      subtotal,
      colorSurcharge: colorSurchargeAmount,
      subtotalWithoutVAT,
      vat,
      totalPrice,
      roundedWidth,
      roundedProjection
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
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">Σφάλματα Διαμόρφωσης:</h3>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Διαστάσεις</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Πλάτος (cm): 350 - 700
                </label>
                <input
                  type="number"
                  value={config.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  min="350"
                  max="700"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {calculations.roundedWidth && (
                  <p className="text-xs text-gray-500 mt-1">
                    Θα χρησιμοποιηθεί: {calculations.roundedWidth}cm
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Προβολή (cm): 200 - 350
                </label>
                <input
                  type="number"
                  value={config.projection}
                  onChange={(e) => handleChange('projection', e.target.value)}
                  min="200"
                  max="350"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {calculations.roundedProjection && (
                  <p className="text-xs text-gray-500 mt-1">
                    Θα χρησιμοποιηθεί: {calculations.roundedProjection}cm
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Φωτισμός
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasLighting"
                checked={config.hasLighting}
                onChange={(e) => handleChange('hasLighting', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="hasLighting" className="text-sm text-gray-700">
                Φωτισμός (+620€)
              </label>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Χρώμα</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Λευκό (RAL9016):</strong> Χωρίς επιπλέον χρέωση
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="customColor"
                  checked={config.customColor}
                  onChange={(e) => handleChange('customColor', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="customColor" className="text-sm text-gray-700">
                  Άλλο Χρώμα (εκτός λευκού) (+220€)
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
                    placeholder="π.χ. RAL7016, RAL9005"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Ανάλυση Κόστους</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Βασική Τιμή ({calculations.roundedWidth} × {calculations.roundedProjection}cm):</span>
                <span className="font-medium">€{calculations.basePrice.toFixed(2)}</span>
              </div>
              {config.hasLighting && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Φωτισμός:</span>
                  <span className="font-medium">€{calculations.lightingCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Υποσύνολο:</span>
                <span className="font-medium">€{calculations.subtotal.toFixed(2)}</span>
              </div>
              {config.customColor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Επιβάρυνση Χρώματος:</span>
                  <span className="font-medium">€{calculations.colorSurcharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Σύνολο (χωρίς ΦΠΑ):</span>
                <span className="font-medium">€{calculations.subtotalWithoutVAT.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ΦΠΑ 24%:</span>
                <span className="font-medium">€{calculations.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                <span className="text-lg font-bold text-gray-800">Τελική Τιμή:</span>
                <span className="text-lg font-bold text-blue-600">€{calculations.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={errors.length > 0}
              className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Αποθήκευση Διαμόρφωσης
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EpicaConfig;
