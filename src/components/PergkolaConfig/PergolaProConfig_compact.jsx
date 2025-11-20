import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';
import {
  PRO100_BASE_PRICES,
  LIGHTS_STANDARD,
  LIGHTS_LUX,
  COVER,
  PARAPET_LUX,
  PARAPET_PANEL,
  STANDARD_RAL_COLORS,
  getPriceFromTable,
  roundUpToNext50,
  calculateColumnCount
} from '../../constants/pergolaPricingTables';

const PergolaProConfig = ({ product, onSave }) => {
  const [config, setConfig] = useState({
    width: 300,
    projection: 200,
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
    colorSurcharge: 0,
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

    basePrice = getPriceFromTable(PRO100_BASE_PRICES, config.projection, config.width);
    console.log('🔢 Υπολογισμός:', { 
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

    const roundedWidth = roundUpToNext50(config.width);
    
    if (config.parapet === 'lux') {
      parapetPrice = PARAPET_LUX[roundedWidth] || 0;
    } else if (config.parapet === 'panel') {
      parapetPrice = PARAPET_PANEL[roundedWidth] || 0;
    } else if (config.parapet === 'kilodokos') {
      const columnCount = calculateColumnCount(config.width);
      const columnHeightInMeters = config.columnHeight / 100;
      parapetPrice = roundedWidth + (columnHeightInMeters * columnCount * 40);
      
      if (config.oldParapet) {
        // Παλιά Υδρορροή: €50 ανά ΜΕΤΡΟ (όχι εκατοστό)
        const widthInMeters = roundedWidth / 100;
        oldParapetPrice = widthInMeters * 50;
      }
    }

    if (config.oldParapet && config.parapet !== 'kilodokos') {
      newErrors.push('Η "Παλιά Υδρορροή" μπορεί να επιλεγεί μόνο με "Στηθαίο Κιλοδοκός 80×80"');
    }

    let subtotal = basePrice + lightingPrice + coverPrice + parapetPrice + oldParapetPrice;
    const colorSurcharge = config.customColor ? subtotal * 0.10 : 0;

    const totalPrice = subtotal + colorSurcharge;

    setCalculations({
      basePrice,
      lightingPrice,
      coverPrice,
      parapetPrice,
      oldParapetPrice,
      colorSurcharge,
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
    <div className="max-w-[210mm] mx-auto p-3 bg-white rounded-lg shadow-lg text-sm">
      <h2 className="text-lg font-bold mb-2 text-gray-800 flex items-center gap-2">
        <Calculator className="w-5 h-5" />
        {product.name}
      </h2>

      {errors.length > 0 && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <ul className="list-disc list-inside text-red-700">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {/* Στήλη 1 - Διαστάσεις */}
        <div className="space-y-2">
          <h3 className="font-semibold text-xs text-gray-700 border-b pb-1">Διαστάσεις</h3>
          
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Πλάτος (cm)</label>
            <input
              type="number"
              value={config.width}
              onChange={(e) => handleChange('width', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              step="50"
            />
            <p className="text-[9px] text-gray-500">→ {roundUpToNext50(config.width)}cm</p>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Προβολή (cm)</label>
            <input
              type="number"
              value={config.projection}
              onChange={(e) => handleChange('projection', parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              step="50"
            />
            <p className="text-[9px] text-gray-500">→ {roundUpToNext50(config.projection)}cm</p>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Ύψ.Πίσω</label>
              <input
                type="number"
                value={config.heightBack}
                onChange={(e) => handleChange('heightBack', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Ύψ.Μπρος</label>
              <input
                type="number"
                value={config.heightFront}
                onChange={(e) => handleChange('heightFront', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Μοτέρ</label>
            <select
              value={config.motorPosition}
              onChange={(e) => handleChange('motorPosition', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="right">Δεξιά</option>
              <option value="left">Αριστερά</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Στήριξη</label>
            <select
              value={config.support}
              onChange={(e) => handleChange('support', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="markiza">Μαρκίζα</option>
              <option value="wall">Τοίχο</option>
              <option value="wall-wall">Τοίχο-Τοίχο</option>
            </select>
          </div>
        </div>

        {/* Στήλη 2 - Φωτισμός */}
        <div className="space-y-2">
          <h3 className="font-semibold text-xs text-gray-700 border-b pb-1">Φωτισμός</h3>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">LED</label>
            <select
              value={config.lighting}
              onChange={(e) => handleChange('lighting', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="none">Όχι</option>
              <option value="onoff">On/Off</option>
              <option value="dimmer">Dimmer</option>
            </select>
          </div>

          {config.lighting !== 'none' && (
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Τύπος</label>
              <select
                value={config.lightingType}
                onChange={(e) => handleChange('lightingType', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              >
                <option value="warm">Θερμό</option>
                <option value="cold">Ψυχρό</option>
                <option value="natural">Φυσικό</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1 pt-1">
            <input
              type="checkbox"
              id="cover"
              checked={config.cover}
              onChange={(e) => handleChange('cover', e.target.checked)}
              className="w-3 h-3"
            />
            <label htmlFor="cover" className="text-[11px] font-medium text-gray-700">
              Στέγαστρο
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Ύφασμα</label>
            <select
              value={config.fabric || ''}
              onChange={(e) => handleChange('fabric', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="">Επιλέξτε ύφασμα...</option>
            </select>
            <p className="text-[9px] text-gray-500 italic">Θα συνδεθεί με βάση</p>
          </div>
        </div>

        {/* Στήλη 3 - Υδρορροή */}
        <div className="space-y-2">
          <h3 className="font-semibold text-xs text-gray-700 border-b pb-1">Υδρορροή</h3>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Τύπος</label>
            <select
              value={config.parapet}
              onChange={(e) => handleChange('parapet', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              <option value="none">Καμία</option>
              <option value="lux">Lux</option>
              <option value="panel">Πάνελ</option>
              <option value="kilodokos">Κιλοδοκός</option>
            </select>
          </div>

          {config.parapet === 'kilodokos' && (
            <>
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  id="oldParapet"
                  checked={config.oldParapet}
                  onChange={(e) => handleChange('oldParapet', e.target.checked)}
                  className="w-3 h-3"
                />
                <label htmlFor="oldParapet" className="text-[11px] font-medium text-gray-700">
                  Παλιά Υδρορροή
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Κολόνα</label>
                <select
                  value={config.columnType}
                  onChange={(e) => handleChange('columnType', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                >
                  <option value="130x100">130×100</option>
                  <option value="150x100">150×100</option>
                  <option value="150x150">150×150</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-0.5">Ύψος</label>
                <input
                  type="number"
                  value={config.columnHeight}
                  onChange={(e) => handleChange('columnHeight', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
                <p className="text-[9px] text-gray-500">Τεμ: {calculateColumnCount(config.width)}</p>
              </div>
            </>
          )}
        </div>

        {/* Στήλη 4 - Χρώμα & Τιμή */}
        <div className="space-y-2">
          <h3 className="font-semibold text-xs text-gray-700 border-b pb-1">Χρώμα</h3>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">RAL</label>
            <select
              value={config.ralColor}
              onChange={(e) => handleChange('ralColor', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            >
              {STANDARD_RAL_COLORS.map(color => (
                <option key={color.code} value={color.code}>
                  {color.code} - {color.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              id="customColor"
              checked={config.customColor}
              onChange={(e) => handleChange('customColor', e.target.checked)}
              className="w-3 h-3"
            />
            <label htmlFor="customColor" className="text-[11px] font-medium text-gray-700">
              Άλλο (+10%)
            </label>
          </div>

          {/* Τιμή */}
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-xs text-gray-800 mb-1">Τιμή</h3>
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>Βασική:</span>
                <span className="font-semibold">€{calculations.basePrice.toFixed(2)}</span>
              </div>
              {calculations.lightingPrice > 0 && (
                <div className="flex justify-between">
                  <span>Φωτ:</span>
                  <span className="font-semibold">€{calculations.lightingPrice.toFixed(2)}</span>
                </div>
              )}
              {calculations.coverPrice > 0 && (
                <div className="flex justify-between">
                  <span>Στέγ:</span>
                  <span className="font-semibold">€{calculations.coverPrice.toFixed(2)}</span>
                </div>
              )}
              {calculations.parapetPrice > 0 && (
                <div className="flex justify-between">
                  <span>Υδρ:</span>
                  <span className="font-semibold">€{calculations.parapetPrice.toFixed(2)}</span>
                </div>
              )}
              {calculations.oldParapetPrice > 0 && (
                <div className="flex justify-between">
                  <span>Παλ.Υδρ:</span>
                  <span className="font-semibold">€{calculations.oldParapetPrice.toFixed(2)}</span>
                </div>
              )}
              {calculations.colorSurcharge > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Χρώμα:</span>
                  <span className="font-semibold">€{calculations.colorSurcharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-blue-700 pt-1 border-t border-blue-300 mt-1">
                <span>ΣΥΝΟΛΟ:</span>
                <span>€{calculations.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={errors.length > 0}
            className={`w-full px-3 py-1.5 rounded font-semibold text-xs text-white ${
              errors.length > 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Αποθήκευση
          </button>
        </div>
      </div>
    </div>
  );
};

export default PergolaProConfig;
