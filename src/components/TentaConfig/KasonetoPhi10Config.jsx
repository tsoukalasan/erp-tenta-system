import { useState, useEffect } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import { 
  KASONETO_PHI10_BASE_PRICES,
  getPriceFromTable
} from '../../constants/pergolaPricingTables';

function KasonetoPhi10Config({ product, onSave }) {
  const [config, setConfig] = useState({
    width: 100,
    height: 150,
    hasMotor: false,
    hasAutoLock: false,
    hasCabrio: false,
    customColor: false,
    customColorCode: ''
  });

  const [calculations, setCalculations] = useState({
    basePrice: 0,
    motorCost: 0,
    autoLockCost: 0,
    cabrioDiscount: 0,
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
    
    if (config.width < 100 || config.width > 300) {
      newErrors.push('Το πλάτος πρέπει να είναι μεταξύ 100-300cm');
    }
    if (config.height < 150 || config.height > 300) {
      newErrors.push('Το ύψος πρέπει να είναι μεταξύ 150-300cm');
    }

    // Στρογγυλοποίηση: Πλάτος ανά 25cm, Ύψος ανά 50cm
    const widthOptions = [100, 125, 150, 175, 200, 225, 250, 275, 300];
    const heightOptions = [150, 200, 250, 300];
    
    const roundedWidth = widthOptions.reduce((prev, curr) => 
      Math.abs(curr - config.width) < Math.abs(prev - config.width) ? curr : prev
    );
    const roundedHeight = heightOptions.reduce((prev, curr) => 
      Math.abs(curr - config.height) < Math.abs(prev - config.height) ? curr : prev
    );

    const basePrice = getPriceFromTable(KASONETO_PHI10_BASE_PRICES, roundedHeight, roundedWidth);
    if (basePrice === 0) {
      newErrors.push(`Οι διαστάσεις ${roundedWidth}cm × ${roundedHeight}cm δεν είναι διαθέσιμες`);
    }

    // Μοτέρ +230€ (διαφορετικό από τα άλλα)
    const motorCost = config.hasMotor ? 230 : 0;

    // Auto Lock +540€
    const autoLockCost = config.hasAutoLock ? 540 : 0;

    // Cabrio = -(Πλάτος * 24)
    const cabrioDiscount = config.hasCabrio ? -(config.width * 24) : 0;

    const subtotal = basePrice + motorCost + autoLockCost + cabrioDiscount;
    const colorSurchargeAmount = config.customColor ? 120 : 0;
    const subtotalWithoutVAT = subtotal + colorSurchargeAmount;
    const vat = subtotalWithoutVAT * 0.24;
    const totalPrice = subtotalWithoutVAT + vat;

    setCalculations({
      basePrice,
      motorCost,
      autoLockCost,
      cabrioDiscount,
      subtotal,
      colorSurcharge: colorSurchargeAmount,
      subtotalWithoutVAT,
      vat,
      totalPrice,
      roundedWidth,
      roundedHeight
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
                  Πλάτος (cm): 100 - 300
                </label>
                <input
                  type="number"
                  value={config.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  min="100"
                  max="300"
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
                  Ύψος (cm): 150 - 300
                </label>
                <input
                  type="number"
                  value={config.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  min="150"
                  max="300"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {calculations.roundedHeight && (
                  <p className="text-xs text-gray-500 mt-1">
                    Θα χρησιμοποιηθεί: {calculations.roundedHeight}cm
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Επιλογές</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasMotor"
                  checked={config.hasMotor}
                  onChange={(e) => handleChange('hasMotor', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasMotor" className="text-sm text-gray-700">
                  Μοτέρ (+230€)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasAutoLock"
                  checked={config.hasAutoLock}
                  onChange={(e) => handleChange('hasAutoLock', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasAutoLock" className="text-sm text-gray-700">
                  Auto Lock (+540€)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasCabrio"
                  checked={config.hasCabrio}
                  onChange={(e) => handleChange('hasCabrio', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasCabrio" className="text-sm text-gray-700">
                  Cabrio (Έκπτωση: -{config.width * 24}€)
                </label>
              </div>
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
                  Άλλο Χρώμα (εκτός λευκού) (+120€)
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
                <span className="text-gray-600">Βασική Τιμή ({calculations.roundedWidth} × {calculations.roundedHeight}cm):</span>
                <span className="font-medium">€{calculations.basePrice.toFixed(2)}</span>
              </div>
              {config.hasMotor && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Μοτέρ:</span>
                  <span className="font-medium">€{calculations.motorCost.toFixed(2)}</span>
                </div>
              )}
              {config.hasAutoLock && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto Lock:</span>
                  <span className="font-medium">€{calculations.autoLockCost.toFixed(2)}</span>
                </div>
              )}
              {config.hasCabrio && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cabrio (Έκπτωση):</span>
                  <span className="font-medium text-green-600">€{calculations.cabrioDiscount.toFixed(2)}</span>
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

export default KasonetoPhi10Config;
