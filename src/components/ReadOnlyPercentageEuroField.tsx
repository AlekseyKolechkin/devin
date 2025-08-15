import { useTranslation } from 'react-i18next';
import { Label } from './ui/label';
import InfoTooltip from './InfoTooltip';

interface ReadOnlyPercentageEuroFieldProps {
  id: string;
  label: string;
  percentage: number;
  baseAmount: number; // Amount to calculate euro value from
  info?: string;
  className?: string;
}

export default function ReadOnlyPercentageEuroField({
  id,
  label,
  percentage,
  baseAmount,
  info,
  className = ''
}: ReadOnlyPercentageEuroFieldProps) {
  const { t } = useTranslation();

  const euroValue = Math.round((baseAmount * percentage) / 100);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium flex items-center gap-2">
        <span>
          {t(label)}
        </span>
        {info && <InfoTooltip content={info} />}
      </Label>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Percentage Display */}
        <div className="relative">
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
            {percentage.toFixed(1)}
          </div>
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            %
          </span>
        </div>
        
        {/* Euro Value Display */}
        <div className="relative">
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
            {euroValue.toLocaleString()}
          </div>
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            €
          </span>
        </div>
      </div>
      
      {/* Optional description */}
      <p className="text-xs text-gray-500 italic">
        {t('automaticallyCalculated')}
      </p>
    </div>
  );
}
