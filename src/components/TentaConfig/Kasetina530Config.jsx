import { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  KASETINA_530_BASE_PRICES,
  KASETINA_530_COMPONENTS,
  getPriceFromTable,
  calculateFabricSquareMeters
} from '../../constants/pergolaPricingTables';

function Kasetina530Config({ product, onSave }) {
  const [config, setConfig] = useState({
    width: 250,
    projection: 180,
    hasMotor: false,
    customColor: false,
    customColorCode: '',
    showComponents: false,
    selectedFabric: 201, // default: Para Acrylic
    selectedAxis: 'default', // default: Φ70
    selectedCrank: 180 // default: 180cm
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
    
    // Ελέγχουμε αν τα μέτρα είναι εντός εύρους
    if (config.width < 220 || config.width > 500) {
      newErrors.push('Το πλάτος πρέπει να είναι μεταξύ 220-500cm');
    }
    if (config.projection < 180 || config.projection > 300) {
      newErrors.push('Η προβολή πρέπει να είναι μεταξύ 180-300cm');
    }

    // Στρογγυλοποίηση: Πλάτος ανά 50cm, Προβολή ανά 20-25cm
    const widthOptions = [220, 250, 300, 350, 400, 450, 500];
    const projectionOptions = [180, 200, 220, 250, 275, 300];
    
    const roundedWidth = widthOptions.reduce((prev, curr) => 
      Math.abs(curr - config.width) < Math.abs(prev - config.width) ? curr : prev
    );
    const roundedProjection = projectionOptions.reduce((prev, curr) => 
      Math.abs(curr - config.projection) < Math.abs(prev - config.projection) ? curr : prev
    );

    // Έλεγχος διπλωμένου βραχίονα - Βρίσκουμε το κατάλληλο ζευγάρι βραχιόνων
    const availableProjections = Object.keys(KASETINA_530_COMPONENTS.arms).map(Number);
    const selectedArmProjection = availableProjections.reduce((prev, curr) => 
      Math.abs(curr - config.projection) < Math.abs(prev - config.projection) ? curr : prev
    );
    
    const armData = KASETINA_530_COMPONENTS.arms[selectedArmProjection];
    const requiredWidth = armData.foldedWidth * 2; // 2 βραχίονες
    
    if (config.width < requiredWidth) {
      newErrors.push(
        `Για προβολή ${config.projection}cm χρειάζεται τουλάχιστον ${requiredWidth}cm πλάτος ` +
        `(2 βραχίονες × ${armData.foldedWidth}cm διπλωμένος). Το πλάτος σας: ${config.width}cm`
      );
    }

    // Υπολογισμός εξαρτημάτων (αν επιλεγμένο)
    let componentsTotal = 0;
    let componentsList = null;
    
    if (config.showComponents) {
      componentsList = [];
      
      // 1. Σταθερά εξαρτήματα
      KASETINA_530_COMPONENTS.fixed.forEach(item => {
        const cost = item.price * item.quantity;
        componentsTotal += cost;
        componentsList.push({
          name: item.name,
          detail: `${item.quantity} ${item.unit} × ${item.price}€`,
          cost
        });
      });
      
      // 2. Προφίλ κασέτας (ανά μέτρο, ελάχιστη χρέωση 4μ)
      const widthInMeters = config.width / 100;
      const profileMeters = Math.max(widthInMeters, KASETINA_530_COMPONENTS.profile.minMeters);
      const profileCost = profileMeters * KASETINA_530_COMPONENTS.profile.pricePerMeter;
      componentsTotal += profileCost;
      componentsList.push({
        name: 'Σετ Προφίλ Κασέτας 530',
        detail: `${profileMeters.toFixed(2)}μ × ${KASETINA_530_COMPONENTS.profile.pricePerMeter}€/μ (ελάχ. ${KASETINA_530_COMPONENTS.profile.minMeters}μ)`,
        cost: profileCost
      });
      
      // 3. Μηχανισμός
      const mechanismData = config.hasMotor 
        ? KASETINA_530_COMPONENTS.mechanism.motor 
        : KASETINA_530_COMPONENTS.mechanism.manual;
      componentsTotal += mechanismData.price;
      componentsList.push({
        name: mechanismData.name,
        detail: `1 τεμ × ${mechanismData.price}€`,
        cost: mechanismData.price
      });
      
      // 4. Βραχίονες (πάντα 1 ζευγάρι = 2 βραχίονες)
      const armsCost = armData.price;
      componentsTotal += armsCost;
      componentsList.push({
        name: `Βραχίονες Προβολής ${selectedArmProjection}cm`,
        detail: `1 ζευγάρι × ${armData.price}€ (διπλωμένος: ${armData.foldedWidth}cm)`,
        cost: armsCost
      });
      
      // 5. Άξονας (ανά μέτρο, μήκος = πλάτος)
      const axisData = KASETINA_530_COMPONENTS.axis[config.selectedAxis];
      const axisMeters = widthInMeters;
      const axisCost = axisMeters * axisData.pricePerMeter;
      componentsTotal += axisCost;
      componentsList.push({
        name: axisData.name,
        detail: `${axisMeters.toFixed(2)}μ × ${axisData.pricePerMeter}€/μ`,
        cost: axisCost
      });
      
      // 6. Μανιβέλα (μόνο αν χειροκίνητο)
      if (!config.hasMotor) {
        const crankData = KASETINA_530_COMPONENTS.crank[config.selectedCrank];
        componentsTotal += crankData.price;
        componentsList.push({
          name: crankData.name,
          detail: `1 τεμ × ${crankData.price}€`,
          cost: crankData.price
        });
      }
      
      // 7. Υφάσματα (τετραγωνικά × τιμή × 2 για λιανική)
      const fabricData = KASETINA_530_COMPONENTS.fabrics.find(f => f.id === config.selectedFabric);
      const squareMeters = calculateFabricSquareMeters(config.width, config.projection);
      const retailPricePerSqm = fabricData.wholesalePrice * 2; // χοντρική × 2 = λιανική
      const fabricCost = squareMeters * retailPricePerSqm;
      componentsTotal += fabricCost;
      componentsList.push({
        name: `Ύφασμα ${fabricData.name}`,
        detail: `${squareMeters.toFixed(2)}m² × ${retailPricePerSqm.toFixed(2)}€/m² (${fabricData.company})`,
        cost: fabricCost
      });
    }

    // Βασική τιμή από πίνακα (μόνο αν ΔΕΝ είναι εξαρτήματα)
    const basePrice = config.showComponents ? 0 : getPriceFromTable(KASETINA_530_BASE_PRICES, roundedProjection, roundedWidth);
    
    if (!config.showComponents && basePrice === 0) {
      newErrors.push(`Οι διαστάσεις ${roundedWidth}cm × ${roundedProjection}cm δεν είναι διαθέσιμες`);
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
      roundedProjection,
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

          {/* Errors */}
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

          {/* Διαστάσεις */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              Διαστάσεις
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Πλάτος */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Πλάτος (cm): 220 - 500
                </label>
                <input
                  type="number"
                  value={config.width}
                  onChange={(e) => handleChange('width', e.target.value)}
                  min="220"
                  max="500"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {calculations.roundedWidth && (
                  <p className="text-xs text-gray-500 mt-1">
                    Θα χρησιμοποιηθεί: {calculations.roundedWidth}cm
                  </p>
                )}
              </div>

              {/* Προβολή */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Προβολή (cm): 180 - 300
                </label>
                <input
                  type="number"
                  value={config.projection}
                  onChange={(e) => handleChange('projection', e.target.value)}
                  min="180"
                  max="300"
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

          {/* Επιλογές Εξαρτημάτων (μόνο αν showComponents=true) */}
          {config.showComponents && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Επιλογές Εξαρτημάτων</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Επιλογή Υφάσματος */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ύφασμα
                  </label>
                  <select
                    value={config.selectedFabric}
                    onChange={(e) => handleChange('selectedFabric', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {KASETINA_530_COMPONENTS.fabrics.map(fabric => (
                      <option key={fabric.id} value={fabric.id}>
                        {fabric.name} ({fabric.company}) - €{(fabric.wholesalePrice * 2).toFixed(2)}/m²
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Τιμή λιανικής (χοντρική × 2)
                  </p>
                </div>

                {/* Επιλογή Άξονα */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Άξονας
                  </label>
                  <select
                    value={config.selectedAxis}
                    onChange={(e) => handleChange('selectedAxis', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="default">
                      {KASETINA_530_COMPONENTS.axis.default.name} - €{KASETINA_530_COMPONENTS.axis.default.pricePerMeter}/μ
                    </option>
                    <option value="alternative">
                      {KASETINA_530_COMPONENTS.axis.alternative.name} - €{KASETINA_530_COMPONENTS.axis.alternative.pricePerMeter}/μ
                    </option>
                  </select>
                </div>

                {/* Επιλογή Μανιβέλας (μόνο αν χειροκίνητο) */}
                {!config.hasMotor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Μανιβέλα
                    </label>
                    <select
                      value={config.selectedCrank}
                      onChange={(e) => handleChange('selectedCrank', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(KASETINA_530_COMPONENTS.crank).map(([size, data]) => (
                        <option key={size} value={size}>
                          {data.name} - €{data.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Μοτέρ/Χειροκίνητο Toggle */}
                <div className={!config.hasMotor ? 'md:col-span-1' : 'md:col-span-2'}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Τύπος Μηχανισμού
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasMotorComponents"
                      checked={config.hasMotor}
                      onChange={(e) => handleChange('hasMotor', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="hasMotorComponents" className="text-sm text-gray-700">
                      Μοτέρ (€{KASETINA_530_COMPONENTS.mechanism.motor.price})
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {config.hasMotor ? 'Με μοτέρ' : `Χειροκίνητο με μανιβέλα (€${KASETINA_530_COMPONENTS.mechanism.manual.price})`}
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Χρώμα */}
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

          {/* Υπολογισμός Τιμής */}
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
                  <span className="text-gray-600">Βασική Τιμή ({calculations.roundedWidth} × {calculations.roundedProjection}cm):</span>
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

export default Kasetina530Config;
