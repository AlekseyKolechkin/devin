import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from './ui/label';
import InfoTooltip from './InfoTooltip';

interface DualEuroSqmFieldProps {
  id: string;
  label: string;
  euroValue: number;
  sqmValue: number;
  area: number;
  onEuroChange: (value: number) => void;
  onSqmChange: (value: number) => void;
  info?: string;
  min?: number;
  step?: number;
}

const DualEuroSqmField: React.FC<DualEuroSqmFieldProps> = ({
  id,
  label,
  euroValue,
  sqmValue,
  area,
  onEuroChange,
  onSqmChange,
  info,
  min = 0,
  step = 1
}) => {
  const { t } = useTranslation();

  const handleEuroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    onEuroChange(value);
    // Update sqm value based on euro value and area
    if (area > 0) {
      onSqmChange(value / area);
    }
  };

  const handleSqmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    onSqmChange(value);
    // Update euro value based on sqm value and area
    onEuroChange(value * area);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <span>
          {t(label)}
        </span>
        {info && <InfoTooltip content={info} />}
      </Label>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Euro Value */}
        <div className="relative">
          <input
            type="number"
            id={`${id}-euro`}
            value={euroValue || ''}
            onChange={handleEuroChange}
            min={min}
            step={step}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            €
          </span>
        </div>
        
        {/* Per Square Meter Value */}
        <div className="relative">
          <input
            type="number"
            id={`${id}-sqm`}
            value={sqmValue ? sqmValue.toFixed(2) : ''}
            onChange={handleSqmChange}
            min={0}
            step={0.1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-12"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
            €/m²
          </span>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 italic">
        {t('basedOnArea', { area: area })} m²
      </div>
    </div>
  );
};

export default DualEuroSqmField;
