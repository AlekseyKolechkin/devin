import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const [isDragging, setIsDragging] = useState(false);

  const currentIndex = energyEfficiencyOptions.findIndex(option => option.value === value);
  const currentOption = energyEfficiencyOptions[currentIndex] || energyEfficiencyOptions[2];

  const gradientColors = energyEfficiencyOptions.map(opt => opt.color).join(', ');

  const updateValue = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.round(percentage * (energyEfficiencyOptions.length - 1));
    onChange(energyEfficiencyOptions[index].value);
  };

  const handleSliderClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    updateValue(event.clientX, rect);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (event: MouseEvent) => {
      const sliderElement = document.querySelector('[data-slider-track]') as HTMLElement;
      if (sliderElement) {
        const rect = sliderElement.getBoundingClientRect();
        updateValue(event.clientX, rect);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, onChange]);

  const thumbPosition = (currentIndex / (energyEfficiencyOptions.length - 1)) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-sm font-medium">
        {t('energyEfficiency')}
      </Label>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: currentOption.color }} className="font-semibold text-lg">
            {currentOption.label}
          </span>
          <span className="text-gray-500">
            {t(`energyEfficiencyOptions.${currentOption.value}`)}
          </span>
        </div>

        {/* Custom Colored Slider */}
        <div className="relative">
          {/* Gradient Track */}
          <div
            data-slider-track
            className="h-3 rounded-full cursor-pointer relative overflow-hidden"
            style={{
              background: `linear-gradient(to right, ${gradientColors})`
            }}
            onClick={handleSliderClick}
          >
            {/* Thumb */}
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-gray-300 rounded-full shadow-lg cursor-grab transition-all duration-100 ease-out ${
                isDragging ? 'scale-110 cursor-grabbing' : 'hover:scale-105'
              }`}
              style={{
                left: `${thumbPosition}%`,
                borderColor: currentOption.color,
                boxShadow: `0 2px 8px rgba(0,0,0,0.2), 0 0 0 2px ${currentOption.color}40`,
                transition: isDragging ? 'none' : 'all 0.1s ease-out'
              }}
              onMouseDown={handleMouseDown}
            />
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
            <span className="font-medium">A+</span>
            <span className="font-medium">H</span>
          </div>
        </div>
      </div>
    </div>
  );
}
