import { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  ZIP_SCREEN_BASE_PRICES,
  ZIP_SCREEN_COMPONENTS,
  getPriceFromTable,
  calculateZipScreenFabricSquareMeters
} from '../../constants/pergolaPricingTables';

function ZipScreenConfig({ product, onSave }) {
  const [config, setConfig] = useState({
    width: 200,
    height: 175,
    hasMotor: false,
    customColor: false,
    customColorCode: '',
    showComponents: false
  });

  const [calculations, setCalculations] = useState({
    basePrice: 0,
    motorCost: 0,
    subtotal: 0,
    colorSurcharge: 0,
    subtotalWithoutVAT: 0,
    vat: 0,
    totalPrice: 0,
    components: null
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
    
    if (config.width < 200 || config.width > 400) {
      newErrors.push('Το πλάτος πρέπει να είναι μεταξύ 200-400cm');
    }
    if (config.height < 175 || config.height > 350) {
      newErrors.push('Το ύψος πρέπει να είναι μεταξύ 175-350cm');
    }

    // Στρογγυλοποίηση ανά 25cm
    const widthOptions = [200, 250, 300, 350, 400];
    const heightOptions = [175, 200, 225, 250, 275, 300, 325, 350];
    
    const roundedWidth = widthOptions.reduce((prev, curr) => 
      Math.abs(curr - config.width) < Math.abs(prev - config.width) ? curr : prev
    );
    const roundedHeight = heightOptions.reduce((prev, curr) => 
      Math.abs(curr - config.height) < Math.abs(prev - config.height) ? curr : prev
    );

    // Υπολογισμός εξαρτημάτων (αν επιλεγμένο)
    let componentsTotal = 0;
    let componentsList = null;
    
    if (config.showComponents) {
      componentsList = [];
      const widthInMeters = config.width / 100;
      const heightInMeters = config.height / 100;
      
      // 1. Σταθερά εξαρτήματα
      ZIP_SCREEN_COMPONENTS.fixed.forEach(item => {
        const cost = item.price * item.quantity;
        componentsTotal += cost;
        componentsList.push({
          name: item.name,
          detail: `${item.quantity} ${item.unit} × ${item.price}€`,
          cost
        });
      });
      
      // 2. Κασονέτο (πλάτος)
      const cassetteMeters = Math.max(widthInMeters, ZIP_SCREEN_COMPONENTS.cassette.minMeters);
      const cassetteCost = cassetteMeters * ZIP_SCREEN_COMPONENTS.cassette.pricePerMeter;
      componentsTotal += cassetteCost;
      componentsList.push({
        name: 'Κασονέτο Τετράγωνο',
        detail: `${cassetteMeters.toFixed(2)}μ × ${ZIP_SCREEN_COMPONENTS.cassette.pricePerMeter}€/μ (ελάχ. ${ZIP_SCREEN_COMPONENTS.cassette.minMeters}μ)`,
        cost: cassetteCost
      });
      
      // 3. Άξονας (πλάτος)
      const axisMeters = Math.max(widthInMeters, ZIP_SCREEN_COMPONENTS.axis.minMeters);
      const axisCost = axisMeters * ZIP_SCREEN_COMPONENTS.axis.pricePerMeter;
      componentsTotal += axisCost;
      componentsList.push({
        name: ZIP_SCREEN_COMPONENTS.axis.name,
        detail: `${axisMeters.toFixed(2)}μ × ${ZIP_SCREEN_COMPONENTS.axis.pricePerMeter}€/μ (ελάχ. ${ZIP_SCREEN_COMPONENTS.axis.minMeters}μ)`,
        cost: axisCost
      });
      
      // 4. Οδηγός ((ύψος - 11cm) × 2)
      const guideMeters = Math.max(((config.height - 11) / 100) * 2, ZIP_SCREEN_COMPONENTS.guide.minMeters);
      const guideCost = guideMeters * ZIP_SCREEN_COMPONENTS.guide.pricePerMeter;
      componentsTotal += guideCost;
      componentsList.push({
        name: ZIP_SCREEN_COMPONENTS.guide.name,
        detail: `${guideMeters.toFixed(2)}μ × ${ZIP_SCREEN_COMPONENTS.guide.pricePerMeter}€/μ (ύψος-11cm×2, ελάχ. ${ZIP_SCREEN_COMPONENTS.guide.minMeters}μ)`,
        cost: guideCost
      });
      
      // 5. Σκληρό Πλαστικό Ζιπ ((ύψος - 11cm) × 2)
      const hardZipMeters = Math.max(((config.height - 11) / 100) * 2, ZIP_SCREEN_COMPONENTS.hardZip.minMeters);
      const hardZipCost = hardZipMeters * ZIP_SCREEN_COMPONENTS.hardZip.pricePerMeter;
      componentsTotal += hardZipCost;
      componentsList.push({
        name: ZIP_SCREEN_COMPONENTS.hardZip.name,
        detail: `${hardZipMeters.toFixed(2)}μ × ${ZIP_SCREEN_COMPONENTS.hardZip.pricePerMeter}€/μ (ύψος-11cm×2, ελάχ. ${ZIP_SCREEN_COMPONENTS.hardZip.minMeters}μ)`,
        cost: hardZipCost
      });
      
      // 6. Αντίβαρο (πλάτος)
      const counterweightMeters = Math.max(widthInMeters, ZIP_SCREEN_COMPONENTS.counterweight.minMeters);
      const counterweightCost = counterweightMeters * ZIP_SCREEN_COMPONENTS.counterweight.pricePerMeter;
      componentsTotal += counterweightCost;
      componentsList.push({
        name: ZIP_SCREEN_COMPONENTS.counterweight.name,
        detail: `${counterweightMeters.toFixed(2)}μ × ${ZIP_SCREEN_COMPONENTS.counterweight.pricePerMeter}€/μ (ελάχ. ${ZIP_SCREEN_COMPONENTS.counterweight.minMeters}μ)`,
        cost: counterweightCost
      });
      
      // 7. Βέργα για βάρος (πλάτος - 20cm)
      const rodMeters = Math.max(widthInMeters - 0.20, 0);
      const rodCost = rodMeters * ZIP_SCREEN_COMPONENTS.rod.pricePerMeter;
      componentsTotal += rodCost;
      componentsList.push({
        name: ZIP_SCREEN_COMPONENTS.rod.name,
        detail: `${rodMeters.toFixed(2)}μ × ${ZIP_SCREEN_COMPONENTS.rod.pricePerMeter}€/μ (πλάτος-20cm)`,
        cost: rodCost
      });
      
      // 8. Μηχανισμός (χειροκίνητο ή μοτέρ)
      const mechanismItems = config.hasMotor 
        ? ZIP_SCREEN_COMPONENTS.mechanism.motor 
        : ZIP_SCREEN_COMPONENTS.mechanism.manual;
      
      mechanismItems.forEach(item => {
        const cost = item.price * item.quantity;
        componentsTotal += cost;
        componentsList.push({
          name: item.name,
          detail: `${item.quantity} ${item.unit} × ${item.price}€`,
          cost
        });
      });
      
      // 9. Ύφασμα (σταθερή τιμή €22/m²)
      const squareMeters = calculateZipScreenFabricSquareMeters(config.width, config.height);
      const fabricCost = squareMeters * ZIP_SCREEN_COMPONENTS.fabric.pricePerSqm;
      componentsTotal += fabricCost;
      componentsList.push({
        name: 'Ύφασμα Κάθετου',
        detail: `${squareMeters.toFixed(2)}m² × ${ZIP_SCREEN_COMPONENTS.fabric.pricePerSqm}€/m² ((πλάτος+10cm)×(ύψος+20cm))`,
        cost: fabricCost
      });
    }

    // Βασική τιμή από πίνακα (μόνο αν ΔΕΝ είναι εξαρτήματα)
    const basePrice = config.showComponents ? 0 : getPriceFromTable(ZIP_SCREEN_BASE_PRICES, roundedHeight, roundedWidth);
    
    if (!config.showComponents && basePrice === 0) {
      newErrors.push(`Οι διαστάσεις ${roundedWidth}cm × ${roundedHeight}cm δεν είναι διαθέσιμες`);
    }

    // Μοτέρ +260€ (μόνο σε έτοιμο σύστημα, στα εξαρτήματα είναι μέσα)
    const motorCost = (!config.showComponents && config.hasMotor) ? 260 : 0;

    // Υπολογισμός συνόλων
    const subtotal = config.showComponents ? componentsTotal : (basePrice + motorCost);

    // Επιβάρυνση χρώματος +160€
    const colorSurchargeAmount = config.customColor ? 160 : 0;
    const subtotalWithoutVAT = subtotal + colorSurchargeAmount;

    // ΦΠΑ 24%
    const vat = subtotalWithoutVAT * 0.24;
    const totalPrice = subtotalWithoutVAT + vat;

    setCalculations({
      basePrice,
      motorCost,
      subtotal,
      colorSurcharge: colorSurchargeAmount,
      subtotalWithoutVAT,
      vat,
      totalPrice,
      roundedWidth,
      roundedHeight,
      components: componentsList
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
                  Πλάτος (cm): 200 - 400
                </label>
                <input
                  type="number"
                  value={config.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  min="200"
                  max="400"
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
                  Ύψος (cm): 175 - 350
                </label>
                <input
                  type="number"
                  value={config.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  min="175"
                  max="350"
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

          {/* Toggle: Έτοιμο Σύστημα / Εξαρτήματα */}
          <div className="mb-8 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showComponents"
                checked={config.showComponents}
                onChange={(e) => handleChange('showComponents', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="showComponents" className="flex items-center gap-2 text-sm font-semibold text-gray-800 cursor-pointer">
                <Wrench className="w-5 h-5 text-amber-600" />
                Κόστος Εξαρτημάτων (αγορά ανά τεμάχιο)
              </label>
            </div>
            <p className="text-xs text-gray-600 mt-2 ml-8">
              {config.showComponents 
                ? '✓ Εμφάνιση αναλυτικού κόστους εξαρτημάτων'
                : 'Τιμολόγηση έτοιμου συστήματος'
              }
            </p>
          </div>

          {/* Μοτέρ (μόνο αν ΔΕΝ είναι εξαρτήματα) */}
          {!config.showComponents && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Μοτέρ</h3>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasMotor"
                  checked={config.hasMotor}
                  onChange={(e) => handleChange('hasMotor', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasMotor" className="text-sm text-gray-700">
                  Μοτέρ (+260€)
                </label>
              </div>
            </div>
          )}

          {/* Μοτέρ/Χειροκίνητο (μόνο αν ΕΙΝ ΑΙ εξαρτήματα) */}
          {config.showComponents && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Τύπος Μηχανισμού</h3>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasMotorComponents"
                  checked={config.hasMotor}
                  onChange={(e) => handleChange('hasMotor', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasMotorComponents" className="text-sm text-gray-700">
                  Μοτέρ (€260)
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {config.hasMotor 
                  ? 'Με μοτέρ (περιλαμβάνει πλύμνη για μοτέρ €2.90)' 
                  : 'Χειροκίνητο (περιλαμβάνει πλύμνη €8 + πειράκι €1.50)'
                }
              </p>
            </div>
          )}

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
                  Άλλο Χρώμα (εκτός λευκού) (+160€)
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
            
            {config.showComponents && calculations.components ? (
              /* Λίστα Εξαρτημάτων */
              <div className="space-y-4 mb-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="w-5 h-5 text-amber-600" />
                    <h4 className="font-semibold text-gray-800">Λίστα Εξαρτημάτων</h4>
                  </div>
                  <div className="space-y-2">
                    {calculations.components.map((item, index) => (
                      <div key={index} className="flex justify-between items-start text-sm border-b border-amber-100 pb-2 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-600">{item.detail}</div>
                        </div>
                        <span className="font-semibold text-gray-900 ml-4">
                          €{item.cost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-amber-300">
                    <span className="font-bold text-gray-800">Σύνολο Εξαρτημάτων:</span>
                    <span className="font-bold text-amber-700">€{calculations.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Τιμολόγηση Έτοιμου Συστήματος */
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
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Υποσύνολο:</span>
                  <span className="font-medium">€{calculations.subtotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Κοινό τμήμα (χρώμα + ΦΠΑ + τελική τιμή) */}
            <div className="space-y-2 text-sm mt-4">
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

export default ZipScreenConfig;
