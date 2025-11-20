import { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { findMatchingPergolas } from '../../utils/pergolaComparison';

function AlternativePergolas({ width, projection, currentProductId, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const matches = findMatchingPergolas(width, projection, currentProductId);

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h3 className="font-semibold text-amber-800">
            Τα μέτρα σας ταιριάζουν και σε άλλες πέργκολες!
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            Βρέθηκαν {matches.length} εναλλακτικές επιλογές
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-amber-600" size={20} />
        ) : (
          <ChevronDown className="text-amber-600" size={20} />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-amber-700 mb-3">
            Με τις διαστάσεις που επιλέξατε ({width}cm × {projection}cm), υπάρχουν ακριβείς αντιστοιχίες:
          </p>
          
          {matches.map((match) => (
            <div
              key={match.productId}
              className="bg-white border border-amber-200 rounded-md p-3 hover:border-amber-400 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{match.productName}</span>
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      <Check size={12} /> Ακριβής αντιστοιχία
                    </span>
                  </div>
                  
                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    Βασική τιμή: €{match.basePrice.toFixed(2)}
                  </p>
                </div>
                
                {onSelect && (
                  <button
                    onClick={() => onSelect(match.productId)}
                    className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                  >
                    Δες
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlternativePergolas;
