import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from './ui/input';
import { Label } from './ui/label';
import InfoTooltip from './InfoTooltip';

interface InputFieldProps {
  id: string;
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  type?: 'number' | 'text' | 'date';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  info?: string;
  required?: boolean;
  className?: string;
}

export default function InputField({
  id,
  label,
  value,
  onChange,
  type = 'number',
  unit,
  min,
  max,
  step,
  tooltip,
  info,
  required = false,
  className = ''
}: InputFieldProps) {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium flex items-center gap-2">
        <span>
          {t(label)}
          {required && <span className="text-red-500 ml-1">*</span>}
          {unit && <span className="text-gray-500 ml-1">({t(unit)})</span>}
        </span>
        {info && <InfoTooltip content={info} />}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
        title={tooltip ? t(tooltip) : undefined}
        required={required}
      />
    </div>
  );
}
