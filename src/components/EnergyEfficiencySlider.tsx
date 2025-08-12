import { useTranslation } from 'react-i18next';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
interface EnergyEfficiencyOption {
  value: string;
  label: string;
  color: string;
}

const energyEfficiencyOptions: EnergyEfficiencyOption[] = [
  { value: 'A+', label: 'A+', color: '#006400' },
  { value: 'A', label: 'A', color: '#228B22' },
  { value: 'B', label: 'B', color: '#32CD32' },
  { value: 'C', label: 'C', color: '#9ACD32' },
  { value: 'D', label: 'D', color: '#FFD700' },
  { value: 'E', label: 'E', color: '#FFA500' },
  { value: 'F', label: 'F', color: '#FF6347' },
  { value: 'G', label: 'G', color: '#FF4500' },
  { value: 'H', label: 'H', color: '#8B0000' }
];

interface EnergyEfficiencySliderProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function EnergyEfficiencySlider({ value, onChange, className = '' }: EnergyEfficiencySliderProps) {
  const { t } = useTranslation();
  
  const currentIndex = energyEfficiencyOptions.findIndex(option => option.value === value);
  const currentOption = energyEfficiencyOptions[currentIndex] || energyEfficiencyOptions[2];

  const handleSliderChange = (values: number[]) => {
    const index = values[0];
    onChange(energyEfficiencyOptions[index].value);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium">
        {t('energyEfficiency')}
      </Label>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: currentOption.color }} className="font-semibold">
            {currentOption.label}
          </span>
          <span className="text-gray-500">
            {t(`energyEfficiencyOptions.${currentOption.value}`)}
          </span>
        </div>
        
        <Slider
          value={[currentIndex]}
          onValueChange={handleSliderChange}
          max={energyEfficiencyOptions.length - 1}
          min={0}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>A+</span>
          <span>H</span>
        </div>
      </div>
      
      <div 
        className="h-2 rounded-full"
        style={{
          background: `linear-gradient(to right, ${energyEfficiencyOptions.map(opt => opt.color).join(', ')})`
        }}
      />
    </div>
  );
}
