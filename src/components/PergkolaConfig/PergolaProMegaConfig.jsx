import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import {
  PROMEGA_BASE_PRICES,
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

const PergolaProMegaConfig = ({ product, onSave, onNavigate }) => {
  const [config, setConfig] = useState({
    width: 500,
    projection: 700,
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

    basePrice = getPriceFromTable(PROMEGA_BASE_PRICES, config.projection, config.width);
    console.log('🔢 Υπολογισμός PRO MEGA:', { 
      projection: config.projection, 
      width: config.width, 
      basePrice 
    });
    
    if (basePrice === 0) {
      newErrors.push('Οι διαστάσεις που εισάγατε δεν υπάρχουν στον πίνακα τιμολόγησης');
    }

    if (config.lighting === 'onoff') {
      lightingPrice = getPriceFromTable(LIGHTS_STANDARD, config.projection, config.width);
    } else if (config.lighting === 'dimmer') {
      lightingPrice = getPriceFromTable(LIGHTS_LUX, config.projection, config.width);
    }

    if (config.cover) {
      coverPrice = getPriceFromTable(COVER, config.projection, config.width);
    }

    const roundedWidth = roundUpToNextAvailableWidth(PROMEGA_BASE_PRICES, config.projection, config.width);
    const columnCount = calculateColumnCount(config.width);
    let columnSurcharge = 0;
    
    if (config.parapet === 'lux') {
      parapetPrice = PARAPET_LUX[roundedWidth] || 0;
      if (config.columnType === '150x100') {
        columnSurcharge = columnCount * 50;
      } else if (config.columnType === '150x150') {
        columnSurcharge = columnCount * 100;
      }
    } else if (config.parapet === 'panel') {
      parapetPrice = PARAPET_PANEL[roundedWidth] || 0;
      if (config.columnType === '150x100') {
        columnSurcharge = columnCount * 50;
      } else if (config.columnType === '150x150') {
        columnSurcharge = columnCount * 100;
      }
    } else if (config.parapet === 'kilodokos') {
      const columnHeightInMeters = config.columnHeight / 100;
      parapetPrice = roundedWidth + (columnHeightInMeters * columnCount * 40);
      
      if (config.oldParapet) {
        oldParapetPrice = roundedWidth * 50;
      }
    }

    if (config.oldParapet && config.parapet !== 'kilodokos') {
      newErrors.push('Η "Παλιά Υδρορροή" μπορεί να επιλεγεί μόνο με "Στηθαίο Κιλοδοκός 80×80"');
    }

    let subtotal = basePrice + lightingPrice + coverPrice + parapetPrice + oldParapetPrice + columnSurcharge;
    const colorSurcharge = config.customColor ? subtotal * 0.10 : 0;

    const subtotalWithoutVAT = subtotal + colorSurcharge;
    const vat = subtotalWithoutVAT * 0.24;
    const totalPrice = subtotalWithoutVAT + vat;

    setCalculations({
      basePrice,
      lightingPrice,
      coverPrice,
      parapetPrice,
      oldParapetPrice,
      columnSurcharge,
      colorSurcharge,
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
              min="500"
              max="1300"
              step="50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Στρογγυλοποίηση: {roundUpToNextAvailableWidth(PROMEGA_BASE_PRICES, config.projection, config.width)}cm
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
              min="700"
              max="1000"
              step="50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Στρογγυλοποίηση: {roundUpToNextAvailableProjection(PROMEGA_BASE_PRICES, config.projection)}cm
            </p>
          </div>

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

          <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mt-6">Μοτέρ & Στήριξη</h3>

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
            <p className="text-xs text-gray-500 mt-1">
              ⚡ Μοτέρ ηλεκτροκίνητο (περιλαμβάνεται)
            </p>
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
              <option value="wall">Τοίχο</option>
              <option value="wall-wall">Τοίχο-Τοίχο</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">Φωτισμός</h3>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Υδρορροή (Μοναδική Επιλογή!)
            </label>
            <select
              value={config.parapet}
              onChange={(e) => handleChange('parapet', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="none">Καμία</option>
              <option value="lux">101 - Υδρορροή Αλουμινίου Lux</option>
              <option value="panel">102 - Υδρορροή Αλουμινίου Πάνελ</option>
              <option value="kilodokos">103 - Στηθαίο Κιλοδοκός 80×80</option>
            </select>
          </div>

          {(config.parapet === 'lux' || config.parapet === 'panel') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Τύπος Κολόνας
              </label>
              <select
                value={config.columnType}
                onChange={(e) => handleChange('columnType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="130x100">130×100 (Βασική)</option>
                <option value="150x100">150×100 (+50€/κολόνα)</option>
                <option value="150x150">150×150 (+100€/κολόνα)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Κολόνες: {calculateColumnCount(config.width)} τεμάχια
              </p>
            </div>
          )}

          {config.parapet === 'kilodokos' && (
            <>
              <div className="flex items-center gap-2 ml-4">
                <input
                  type="checkbox"
                  id="oldParapet"
                  checked={config.oldParapet}
                  onChange={(e) => handleChange('oldParapet', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="oldParapet" className="text-sm font-medium text-gray-700">
                  104 - Παλιά Υδρορροή
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ύψος Κολόνας 80×80 (cm)
                </label>
                <input
                  type="number"
                  value={config.columnHeight}
                  onChange={(e) => handleChange('columnHeight', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Κολόνες 80×80: {calculateColumnCount(config.width)} τεμάχια
                </p>
              </div>
            </>
          )}

          <h3 className="font-semibold text-lg text-gray-700 border-b pb-2 mt-6">Χρώμα</h3>

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
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">Υπολογισμός Τιμής</h3>
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
          {calculations.parapetPrice > 0 && (
            <div className="flex justify-between">
              <span>Υδρορροή:</span>
              <span className="font-semibold">€{calculations.parapetPrice.toFixed(2)}</span>
            </div>
          )}
          {calculations.oldParapetPrice > 0 && (
            <div className="flex justify-between">
              <span>Παλιά Υδρορροή:</span>
              <span className="font-semibold">€{calculations.oldParapetPrice.toFixed(2)}</span>
            </div>
          )}
          {calculations.columnSurcharge > 0 && (
            <div className="flex justify-between text-purple-600">
              <span>Επιβάρυνση Κολονών ({config.columnType}):</span>
              <span className="font-semibold">€{calculations.columnSurcharge.toFixed(2)}</span>
            </div>
          )}
          {calculations.colorSurcharge > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Επιβάρυνση Χρώματος (+10%):</span>
              <span className="font-semibold">€{calculations.colorSurcharge.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-blue-300">
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
};

export default PergolaProMegaConfig;
