import { useState, useEffect } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import {
  HANGING_BASE_PRICES,
  LIGHTS_STANDARD,
  LIGHTS_LUX,
  COVER,
  STANDARD_RAL_COLORS,
  getPriceFromTable,
  roundUpToNextAvailableProjection,
  roundUpToNextAvailableWidth
} from '../../constants/pergolaPricingTables';
import AlternativePergolas from '../shared/AlternativePergolas';

function HangingConfig({ product, onSave, onNavigate }) {
  const [config, setConfig] = useState({
    width: 300,
    projection: 250,
    lighting: 'none',
    lightingType: 'warm',
    cover: false,
    drainage: false, // Υδρορροή ως έξτρα
    ralColor: 'RAL9016',
    customColor: false,
    customColorCode: ''
  });

  const [calculations, setCalculations] = useState({
    basePrice: 0,
    lightingPrice: 0,
    coverPrice: 0,
    drainagePrice: 0,
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
    let basePrice = 0;
    let lightingPrice = 0;
    let coverPrice = 0;
    let drainagePrice = 0;

    // Βασική τιμή
    basePrice = getPriceFromTable(HANGING_BASE_PRICES, config.projection, config.width);
    
    if (basePrice === 0) {
      newErrors.push('Οι διαστάσεις που εισάγατε δεν υπάρχουν στον πίνακα τιμολόγησης');
    }

    // Φωτισμός (όπως PRO100)
    if (config.lighting === 'onoff') {
      lightingPrice = getPriceFromTable(LIGHTS_STANDARD, config.projection, config.width);
    } else if (config.lighting === 'dimmer') {
      lightingPrice = getPriceFromTable(LIGHTS_LUX, config.projection, config.width);
    }

    // Στέγαστρο (όπως PRO100)
    if (config.cover) {
      coverPrice = getPriceFromTable(COVER, config.projection, config.width);
    }

    // Υδρορροή ως έξτρα: 58€/μέτρο + 10€ καπάκια
    if (config.drainage) {
      const widthInMeters = config.width / 100;
      drainagePrice = (widthInMeters * 58) + 10;
    }

    // Υπολογισμός συνόλων
    let subtotal = basePrice + lightingPrice + coverPrice + drainagePrice;
    const colorSurcharge = config.customColor ? subtotal * 0.10 : 0;

    const subtotalWithoutVAT = subtotal + colorSurcharge;
    const vat = subtotalWithoutVAT * 0.24; // ΦΠΑ 24%
    const totalPrice = subtotalWithoutVAT + vat;

    setCalculations({
      basePrice,
      lightingPrice,
      coverPrice,
      drainagePrice,
      colorSurcharge,
      subtotalWithoutVAT,
      vat,
      totalPrice
    });

    setErrors(newErrors);
  };

  const handleSave = () => {
    if (errors.length > 0) {
      alert('Παρακαλώ διορθώστε τα σφάλματα πριν την αποθήκευση');
      return;
    }
    
    onSave({
      config,
      calculations,
      productName: product.name
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Calculator className="w-6 h-6" />
        {product.name} - Διαμόρφωση
      </h2>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Προσοχή</h3>
              <ul className="list-disc list-inside text-sm text-red-700">
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Διαστάσεις</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Πλάτος (cm) *
            </label>
            <input
              type="number"
              value={config.width}
              onChange={(e) => handleChange('width', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="300"
              max="1300"
              step="50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Στρογγυλοποίηση: {roundUpToNextAvailableWidth(HANGING_BASE_PRICES, config.projection, config.width)}cm
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Προβολή (cm) *
            </label>
            <input
              type="number"
              value={config.projection}
              onChange={(e) => handleChange('projection', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min="250"
              max="500"
              step="50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Στρογγυλοποίηση: {roundUpToNextAvailableProjection(HANGING_BASE_PRICES, config.projection)}cm
            </p>
          </div>

          <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mt-6">Φωτισμός</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Φωτισμός LED
            </label>
            <select
              value={config.lighting}
              onChange={(e) => handleChange('lighting', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="none">Όχι</option>
              <option value="onoff">On/Off</option>
              <option value="dimmer">Dimmer</option>
            </select>
          </div>

          {config.lighting !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Τύπος Φωτισμού
              </label>
              <select
                value={config.lightingType}
                onChange={(e) => handleChange('lightingType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="warm">Θερμό</option>
                <option value="cold">Ψυχρό</option>
                <option value="natural">Φυσικό</option>
              </select>
            </div>
          )}

          <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mt-6">Πρόσθετα</h3>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cover"
              checked={config.cover}
              onChange={(e) => handleChange('cover', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="cover" className="text-sm font-medium text-gray-700">
              Στέγαστρο
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="drainage"
              checked={config.drainage}
              onChange={(e) => handleChange('drainage', e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="drainage" className="text-sm font-medium text-gray-700">
              Υδρορροή (58€/μέτρο + 10€ καπάκια)
            </label>
          </div>
          {config.drainage && (
            <p className="text-xs text-gray-500 ml-6">
              💧 Υπολογισμός: {(config.width / 100).toFixed(2)}m × 58€ + 10€ καπάκια = €{calculations.drainagePrice.toFixed(2)}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Χρώμα</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Χρώμα RAL
            </label>
            <select
              value={config.ralColor}
              onChange={(e) => handleChange('ralColor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {STANDARD_RAL_COLORS.map(color => (
                <option key={color.code} value={color.code}>
                  {color.code} - {color.name}
                </option>
              ))}
            </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Κωδικός Χρώματος
              </label>
              <input
                type="text"
                value={config.customColorCode}
                onChange={(e) => handleChange('customColorCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="π.χ. RAL 7035"
              />
            </div>
          )}

          <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mt-6">Ανάλυση Κόστους</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Βασική Τιμή:</span>
              <span className="font-semibold">€{calculations.basePrice.toFixed(2)}</span>
            </div>
            {calculations.lightingPrice > 0 && (
              <div className="flex justify-between">
                <span>Φωτισμός LED:</span>
                <span className="font-semibold">€{calculations.lightingPrice.toFixed(2)}</span>
              </div>
            )}
            {calculations.coverPrice > 0 && (
              <div className="flex justify-between">
                <span>Στέγαστρο:</span>
                <span className="font-semibold">€{calculations.coverPrice.toFixed(2)}</span>
              </div>
            )}
            {calculations.drainagePrice > 0 && (
              <div className="flex justify-between">
                <span>Υδρορροή:</span>
                <span className="font-semibold">€{calculations.drainagePrice.toFixed(2)}</span>
              </div>
            )}
            {calculations.colorSurcharge > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Επιβάρυνση Χρώματος (+10%):</span>
                <span className="font-semibold">€{calculations.colorSurcharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-300">
              <span className="font-semibold">Σύνολο (χωρίς ΦΠΑ):</span>
              <span className="font-semibold">€{calculations.subtotalWithoutVAT.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>ΦΠΑ 24%:</span>
              <span className="font-semibold">€{calculations.vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-blue-700 pt-2 border-t-2 border-blue-300">
              <span>ΣΥΝΟΛΟ (με ΦΠΑ):</span>
              <span>€{calculations.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={errors.length > 0}
          className={`px-6 py-3 rounded-lg font-semibold text-white ${
            errors.length > 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Αποθήκευση Διαμόρφωσης
        </button>
      </div>

      {/* Alternative Pergolas Section */}
      <AlternativePergolas 
        width={config.width}
        projection={config.projection}
        currentProductId={product.id}
        onSelect={onNavigate}
      />
    </div>
  );
}

export default HangingConfig;
