import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from './ui/input';
import { Label } from './ui/label';
import InfoTooltip from './InfoTooltip';

interface PercentageEuroFieldProps {
  id: string;
  label: string;
  percentage: number;
  baseAmount: number; // Amount to calculate euro value from
  onChange: (percentage: number) => void;
  info?: string;
  readOnly?: boolean;
  className?: string;
}

export default function PercentageEuroField({
  id,
  label,
  percentage,
  baseAmount,
  onChange,
  info,
  readOnly = false,
  className = ''
}: PercentageEuroFieldProps) {
  const { t } = useTranslation();

  const euroValue = Math.round((baseAmount * percentage) / 100);

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onChange(value);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium flex items-center gap-2">
        <span>
          {t(label)}
        </span>
        {info && <InfoTooltip content={info} />}
      </Label>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Percentage Input */}
        <div className="relative">
          <Input
            id={id}
            type="number"
            value={percentage}
            onChange={handlePercentageChange}
            min={0}
            max={100}
            step={0.1}
            className="pr-8"
            readOnly={readOnly}
            disabled={readOnly}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            %
          </span>
        </div>
        
        {/* Euro Value Display (Read-only) */}
        <div className="relative">
          <Input
            type="text"
            value={euroValue.toLocaleString()}
            readOnly
            disabled
            className="pr-8 bg-gray-50"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            €
          </span>
        </div>
      </div>
    </div>
  );
}
