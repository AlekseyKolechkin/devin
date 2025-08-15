import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import InputField from './InputField';
import InfoTooltip from './InfoTooltip';

interface DepreciationTypeConfig {
  afaRate: number;
  specialAmortization: number;
  specialAmortizationYears: number;
  description: string;
}

const DEPRECIATION_TYPES: Record<string, DepreciationTypeConfig> = {
  'neubau-afa-degr': {
    afaRate: 4.0, // First 8 years: 4%, then 2.5%
    specialAmortization: 0,
    specialAmortizationYears: 0,
    description: 'Neubau AfA degr. (4% first 8 years, then 2.5%)'
  },
  'neubau-afa-lin': {
    afaRate: 2.0, // Linear 2% for 50 years
    specialAmortization: 0,
    specialAmortizationYears: 0,
    description: 'Neubau AfA lin. (2% linear for 50 years)'
  },
  'neubau-afa-degr-sonder': {
    afaRate: 4.0,
    specialAmortization: 5.0, // Additional 5% for first 4 years
    specialAmortizationYears: 4,
    description: 'Neubau AfA degr. + Sonder-AfA (4% + 5% first 4 years)'
  },
  'neubau-afa-lin-sonder': {
    afaRate: 2.0,
    specialAmortization: 5.0,
    specialAmortizationYears: 4,
    description: 'Neubau AfA lin. + Sonder-AfA (2% + 5% first 4 years)'
  },
  'bestand-linear': {
    afaRate: 2.0, // Linear 2% for existing buildings
    specialAmortization: 0,
    specialAmortizationYears: 0,
    description: 'Bestand linear (2% for existing buildings)'
  },
  'denkmal': {
    afaRate: 2.5, // Monument protection: 2.5% for 40 years
    specialAmortization: 9.0, // Additional 9% for first 8 years
    specialAmortizationYears: 8,
    description: 'Denkmal (2.5% + 9% monument protection)'
  },
  'denkmal-sanierung': {
    afaRate: 2.5,
    specialAmortization: 10.0, // 10% for renovation costs
    specialAmortizationYears: 10,
    description: 'Denkmal Sanierung (2.5% + 10% renovation)'
  }
};

interface DepreciationTypeSelectorProps {
  depreciationType: string;
  manualTaxSettings: boolean;
  afaRate: number;
  specialAmortization: number;
  specialAmortizationYears: number;
  onDepreciationTypeChange: (type: string) => void;
  onManualSettingsChange: (manual: boolean) => void;
  onAfaRateChange: (rate: number) => void;
  onSpecialAmortizationChange: (rate: number) => void;
  onSpecialAmortizationYearsChange: (years: number) => void;
}

const DepreciationTypeSelector: React.FC<DepreciationTypeSelectorProps> = ({
  depreciationType,
  manualTaxSettings,
  afaRate,
  specialAmortization,
  specialAmortizationYears,
  onDepreciationTypeChange,
  onManualSettingsChange,
  onAfaRateChange,
  onSpecialAmortizationChange,
  onSpecialAmortizationYearsChange
}) => {
  const { t } = useTranslation();

  const handleDepreciationTypeChange = (type: string) => {
    onDepreciationTypeChange(type);
    
    if (!manualTaxSettings && DEPRECIATION_TYPES[type]) {
      const config = DEPRECIATION_TYPES[type];
      onAfaRateChange(config.afaRate);
      onSpecialAmortizationChange(config.specialAmortization);
      onSpecialAmortizationYearsChange(config.specialAmortizationYears);
    }
  };

  const handleManualSettingsChange = (checked: boolean) => {
    onManualSettingsChange(checked);
    
    if (!checked && DEPRECIATION_TYPES[depreciationType]) {
      const config = DEPRECIATION_TYPES[depreciationType];
      onAfaRateChange(config.afaRate);
      onSpecialAmortizationChange(config.specialAmortization);
      onSpecialAmortizationYearsChange(config.specialAmortizationYears);
    }
  };

  return (
    <div className="space-y-4">
      {/* Depreciation Type Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <span>{t('depreciationType')}</span>
          <InfoTooltip content={t('tooltips.depreciationType')} />
        </Label>
        <Select 
          value={depreciationType} 
          onValueChange={handleDepreciationTypeChange}
          disabled={manualTaxSettings}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('selectDepreciationType')} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DEPRECIATION_TYPES).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {t(`depreciationTypes.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!manualTaxSettings && DEPRECIATION_TYPES[depreciationType] && (
          <div className="text-xs text-gray-500 italic">
            {DEPRECIATION_TYPES[depreciationType].description}
          </div>
        )}
      </div>

      {/* Manual Settings Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="manualTaxSettings"
          checked={manualTaxSettings}
          onCheckedChange={handleManualSettingsChange}
        />
        <Label htmlFor="manualTaxSettings" className="text-sm text-gray-700 dark:text-gray-300">
          {t('manualTaxSettings')}
        </Label>
      </div>

      {/* Tax Parameters */}
      <div className="space-y-4">
        <InputField
          id="afaRate"
          label="afaRate"
          value={afaRate}
          onChange={(value) => onAfaRateChange(value as number)}
          unit="afaRateUnit"
          min={0}
          max={10}
          step={0.1}
          disabled={!manualTaxSettings}
          info="tooltips.afaRate"
        />
        
        <InputField
          id="specialAmortization"
          label="specialAmortization"
          value={specialAmortization}
          onChange={(value) => onSpecialAmortizationChange(value as number)}
          unit="specialAmortizationUnit"
          min={0}
          max={20}
          step={0.1}
          disabled={!manualTaxSettings}
          info="tooltips.specialAmortization"
        />
        
        <InputField
          id="specialAmortizationYears"
          label="specialAmortizationYears"
          value={specialAmortizationYears}
          onChange={(value) => onSpecialAmortizationYearsChange(value as number)}
          min={0}
          max={20}
          step={1}
          disabled={!manualTaxSettings}
          info="tooltips.specialAmortizationYears"
        />
      </div>
    </div>
  );
};

export default DepreciationTypeSelector;
