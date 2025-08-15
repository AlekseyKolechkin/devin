import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import InputField from './InputField';
import InfoTooltip from './InfoTooltip';

// German tax brackets for 2024 (simplified)
const TAX_BRACKETS = [
  { min: 0, max: 11604, rate: 0 },           // Tax-free allowance
  { min: 11605, max: 17005, rate: 14 },      // Entry rate 14%
  { min: 17006, max: 66760, rate: 24 },      // Progressive zone up to 24%
  { min: 66761, max: 277825, rate: 42 },     // Top rate 42%
  { min: 277826, max: Infinity, rate: 45 }   // Rich tax 45%
];

// Simplified calculation - in reality it's more complex with progressive formula
function calculateMarginalTaxRate(
  annualIncome: number,
  maritalStatus: string,
  children: number,
  churchTax: boolean,
  solidarityTax: boolean
): number {
  let taxableIncome = annualIncome;
  
  // Basic allowance (doubled for married couples)
  const basicAllowance = maritalStatus === 'married' ? 23208 : 11604;
  taxableIncome = Math.max(0, taxableIncome - basicAllowance);
  
  // Child allowance (simplified)
  const childAllowance = children * 6024; // Per child per year
  taxableIncome = Math.max(0, taxableIncome - childAllowance);
  
  // Find tax bracket
  let marginalRate = 0;
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
      marginalRate = bracket.rate;
      break;
    }
  }
  
  // Add church tax (8-9% of income tax, simplified to 8%)
  if (churchTax && marginalRate > 0) {
    marginalRate += marginalRate * 0.08;
  }
  
  // Add solidarity tax (5.5% of income tax, but only above certain threshold)
  if (solidarityTax && marginalRate > 0 && taxableIncome > 17543) {
    marginalRate += marginalRate * 0.055;
  }
  
  return Math.round(marginalRate * 100) / 100;
}

interface TaxRateCalculatorProps {
  manualTaxRate: boolean;
  marginalTaxRate: number;
  annualIncome: number;
  maritalStatus: string;
  children: number;
  churchTax: boolean;
  solidarityTax: boolean;
  onManualTaxRateChange: (manual: boolean) => void;
  onMarginalTaxRateChange: (rate: number) => void;
  onAnnualIncomeChange: (income: number) => void;
  onMaritalStatusChange: (status: string) => void;
  onChildrenChange: (children: number) => void;
  onChurchTaxChange: (churchTax: boolean) => void;
  onSolidarityTaxChange: (solidarityTax: boolean) => void;
}

const TaxRateCalculator: React.FC<TaxRateCalculatorProps> = ({
  manualTaxRate,
  marginalTaxRate,
  annualIncome,
  maritalStatus,
  children,
  churchTax,
  solidarityTax,
  onManualTaxRateChange,
  onMarginalTaxRateChange,
  onAnnualIncomeChange,
  onMaritalStatusChange,
  onChildrenChange,
  onChurchTaxChange,
  onSolidarityTaxChange
}) => {
  const { t } = useTranslation();

  const handleParameterChange = () => {
    if (!manualTaxRate) {
      const calculatedRate = calculateMarginalTaxRate(
        annualIncome,
        maritalStatus,
        children,
        churchTax,
        solidarityTax
      );
      onMarginalTaxRateChange(calculatedRate);
    }
  };

  React.useEffect(() => {
    handleParameterChange();
  }, [annualIncome, maritalStatus, children, churchTax, solidarityTax, manualTaxRate]);

  return (
    <div className="space-y-4">
      {/* Manual Tax Rate Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="manualTaxRate"
          checked={manualTaxRate}
          onCheckedChange={onManualTaxRateChange}
        />
        <Label htmlFor="manualTaxRate" className="text-sm text-gray-700 dark:text-gray-300">
          {t('manualTaxRate')}
        </Label>
      </div>

      {!manualTaxRate && (
        <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('taxCalculationParameters')}
          </h4>
          
          {/* Annual Income */}
          <InputField
            id="annualIncome"
            label="annualIncome"
            value={annualIncome}
            onChange={(value) => onAnnualIncomeChange(value as number)}
            unit="annualIncomeUnit"
            min={0}
            step={1000}
            info="tooltips.annualIncome"
          />

          {/* Marital Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <span>{t('maritalStatus')}</span>
              <InfoTooltip content={t('tooltips.maritalStatus')} />
            </Label>
            <Select value={maritalStatus} onValueChange={onMaritalStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectMaritalStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{t('maritalStatus.single')}</SelectItem>
                <SelectItem value="married">{t('maritalStatus.married')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Children */}
          <InputField
            id="children"
            label="children"
            value={children}
            onChange={(value) => onChildrenChange(value as number)}
            min={0}
            max={10}
            step={1}
            info="tooltips.children"
          />

          {/* Church Tax */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="churchTax"
              checked={churchTax}
              onCheckedChange={onChurchTaxChange}
            />
            <Label htmlFor="churchTax" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              {t('churchTax')}
              <InfoTooltip content={t('tooltips.churchTax')} />
            </Label>
          </div>

          {/* Solidarity Tax */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="solidarityTax"
              checked={solidarityTax}
              onCheckedChange={onSolidarityTaxChange}
            />
            <Label htmlFor="solidarityTax" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              {t('solidarityTax')}
              <InfoTooltip content={t('tooltips.solidarityTax')} />
            </Label>
          </div>
        </div>
      )}

      {/* Calculated/Manual Tax Rate */}
      <div className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {manualTaxRate ? t('manualMarginalTaxRate') : t('calculatedMarginalTaxRate')}:
          </span>
          {manualTaxRate ? (
            <InputField
              id="marginalTaxRate"
              label=""
              value={marginalTaxRate}
              onChange={(value) => onMarginalTaxRateChange(value as number)}
              unit="marginalTaxRateUnit"
              min={0}
              max={50}
              step={0.1}
              className="w-24"
            />
          ) : (
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {marginalTaxRate.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxRateCalculator;
