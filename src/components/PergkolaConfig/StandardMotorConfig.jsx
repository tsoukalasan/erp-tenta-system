import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import {
  STANDARD_MOTOR_BASE_PRICES,
  LIGHTS_STANDARD,
  LIGHTS_LUX,
  COVER,
  PARAPET_LUX,
  PARAPET_PANEL,
  STANDARD_RAL_COLORS,
  getPriceFromTable,
  roundUpToNextAvailableProjection,
  roundUpToNextAvailableWidth,
  calculateColumnCount
} from '../../constants/pergolaPricingTables';
import AlternativePergolas from '../shared/AlternativePergolas';

const StandardMotorConfig = ({ product, onSave, onNavigate }) => {
  const [config, setConfig] = useState({
    width: 300,
    projection: 450,
    heightBack: 250,
    heightFront: 220,
    motorPosition: 'right',
    support: 'markiza',
    lighting: 'none',
    lightingType: 'warm',
    cover: false,
    parapet: 'none',
    oldParapet: false,
    columnType: '130x100',
    columnHeight: 250,
    drainagePosition: 'front',
    drainageColumns: 2,
    ralColor: 'RAL9016',
    customColor: false,
    guides: '',
    contres: '',
    fabric: null
  });

  const [calculations, setCalculations] = useState({
    basePrice: 0,
    lightingPrice: 0,
    coverPrice: 0,
    parapetPrice: 0,
    oldParapetPrice: 0,
    columnSurcharge: 0,
    colorSurcharge: 0,
    subtotalWithoutVAT: 0,
    vat: 0,
    totalPrice: 0
  });

  const [errors, setErrors] = useState([]);

  useEffect(() => {
    calculatePrices();
  }, [config]);

  const calculatePrices = () => {
    const newErrors = [];
    let basePrice = 0;
    let lightingPrice = 0;
    let coverPrice = 0;
    let parapetPrice = 0;
    let oldParapetPrice = 0;
    let columnSurcharge = 0;

    // Βασική τιμή
    basePrice = getPriceFromTable(STANDARD_MOTOR_BASE_PRICES, config.projection, config.width);
    
    if (basePrice === 0) {
      newErrors.push('Οι διαστάσεις που εισάγατε δεν υπάρχουν στον πίνακα τιμολόγησης');
    }

    // Φωτισμός
    if (config.lighting === 'standard') {
      lightingPrice = LIGHTS_STANDARD[config.lightingType] || 0;
    } else if (config.lighting === 'lux') {
      lightingPrice = LIGHTS_LUX[config.lightingType] || 0;
    }

    // Κάλυμμα
    if (config.cover) {
      coverPrice = COVER;
    }

    // Στηθαίο
    if (config.parapet === 'lux') {
      parapetPrice = PARAPET_LUX;
    } else if (config.parapet === 'panel') {
      parapetPrice = PARAPET_PANEL;
    } else if (config.parapet === 'kilodokos') {
      parapetPrice = PARAPET_LUX;
      if (config.oldParapet) {
        oldParapetPrice = 140;
      }
    }

    // Έλεγχος: Old Parapet μόνο με Kilodokos
    if (config.oldParapet && config.parapet !== 'kilodokos') {
      newErrors.push('Το "Παλιό Στηθαίο" είναι διαθέσιμο μόνο με επιλογή "Κιλοδοκός"');
    }

    // Επιβάρυνση κολονών
    if (config.columnType === '150x100') {
      const columnCount = calculateColumnCount(config.width);
      columnSurcharge = columnCount * 50;
    }

    // Υπολογισμός συνόλων
    const subtotal = basePrice + lightingPrice + coverPrice + parapetPrice + oldParapetPrice + columnSurcharge;

    // Επιβάρυνση χρώματος (10% για custom)
    const colorSurchargeAmount = config.customColor ? subtotal * 0.10 : 0;
    const subtotalWithoutVAT = subtotal + colorSurchargeAmount;

    // ΦΠΑ 24%
    const vat = subtotalWithoutVAT * 0.24;
    const totalPrice = subtotalWithoutVAT + vat;

    setCalculations({
      basePrice,
      lightingPrice,
      coverPrice,
      parapetPrice,
      oldParapetPrice,
      columnSurcharge,
      colorSurcharge: colorSurchargeAmount,
      subtotalWithoutVAT,
      vat,
      totalPrice
    });

    setErrors(newErrors);
  };

  const handleChange = (field, value) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      
      if (field === 'parapet' && value !== 'kilodokos') {
        newConfig.oldParapet = false;
      }
      
      return newConfig;
    });
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
                  min="300"
                  max="1300"
                  value={config.width}
                  onChange={(e) => handleChange('width', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. 600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Στρογγυλοποίηση: {roundUpToNextAvailableWidth(STANDARD_MOTOR_BASE_PRICES, config.projection, config.width)}cm
                </p>
              </div>

              {/* Προβολή */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Προβολή (cm)
                </label>
                <input
                  type="number"
                  min="450"
                  max="800"
                  value={config.projection}
                  onChange={(e) => handleChange('projection', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="π.χ. 500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Στρογγυλοποίηση: {roundUpToNextAvailableProjection(STANDARD_MOTOR_BASE_PRICES, config.projection)}cm
                </p>
              </div>

              {/* Ύψη */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ύψος Πίσω (cm)
                  </label>
                  <input
                    type="number"
                    value={config.heightBack}
                    onChange={(e) => handleChange('heightBack', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ύψος Μπρος (cm)
                  </label>
                  <input
                    type="number"
                    value={config.heightFront}
                    onChange={(e) => handleChange('heightFront', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Μοτέρ & Στήριξη */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Θέση Μοτέρ
                </label>
                <select
                  value={config.motorPosition}
                  onChange={(e) => handleChange('motorPosition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="right">Δεξιά</option>
                  <option value="left">Αριστερά</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Στήριξη
                </label>
                <select
                  value={config.support}
                  onChange={(e) => handleChange('support', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="markiza">Μαρκίζα</option>
                  <option value="pergola">Πέργκολα</option>
                </select>
              </div>

              {/* Φωτισμός */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Φωτισμός
                </label>
                <select
                  value={config.lighting}
                  onChange={(e) => handleChange('lighting', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="none">Χωρίς Φωτισμό</option>
                  <option value="standard">Standard</option>
                  <option value="lux">Lux</option>
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
                    <option value="cool">Ψυχρό</option>
                  </select>
                </div>
              )}

              {/* Κάλυμμα */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cover"
                  checked={config.cover}
                  onChange={(e) => handleChange('cover', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="cover" className="text-sm font-medium text-gray-700">
                  Κάλυμμα (+{COVER}€)
                </label>
              </div>

              {/* Στηθαίο */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Στηθαίο
                </label>
                <select
                  value={config.parapet}
                  onChange={(e) => handleChange('parapet', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="none">Χωρίς Στηθαίο</option>
                  <option value="lux">Lux</option>
                  <option value="panel">Panel</option>
                  <option value="kilodokos">Κιλοδοκός</option>
                </select>
              </div>

              {config.parapet === 'kilodokos' && (
                <div className="flex items-center gap-2 ml-4">
                  <input
                    type="checkbox"
                    id="oldParapet"
                    checked={config.oldParapet}
                    onChange={(e) => handleChange('oldParapet', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="oldParapet" className="text-sm font-medium text-gray-700">
                    Παλιό Στηθαίο (+140€)
                  </label>
                </div>
              )}

              {/* Τύπος Κολόνας */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Τύπος Κολόνας
                </label>
                <select
                  value={config.columnType}
                  onChange={(e) => handleChange('columnType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="130x100">130×100 (Standard)</option>
                  <option value="150x100">150×100 (+50€/κολόνα)</option>
                </select>
              </div>

              {/* Ύψος Κολόνας */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ύψος Κολόνας (cm)
                </label>
                <input
                  type="number"
                  value={config.columnHeight}
                  onChange={(e) => handleChange('columnHeight', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Χρώμα */}
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
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="customColor" className="text-sm font-medium text-gray-700">
                  Άλλο Χρώμα (+10%)
                </label>
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

                {calculations.lightingPrice > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Φωτισμός</span>
                    <span className="font-semibold text-gray-900">
                      €{calculations.lightingPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                {calculations.coverPrice > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Κάλυμμα</span>
                    <span className="font-semibold text-gray-900">
                      €{calculations.coverPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                {calculations.parapetPrice > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Στηθαίο</span>
                    <span className="font-semibold text-gray-900">
                      €{calculations.parapetPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                {calculations.oldParapetPrice > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Παλιό Στηθαίο</span>
                    <span className="font-semibold text-gray-900">
                      €{calculations.oldParapetPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                {calculations.columnSurcharge > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-gray-700">Επιβάρυνση Κολόνας</span>
                    <span className="font-semibold text-gray-900">
                      €{calculations.columnSurcharge.toFixed(2)}
                    </span>
                  </div>
                )}

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
                    : 'bg-blue-600 hover:bg-blue-700'
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
};

export default StandardMotorConfig;
