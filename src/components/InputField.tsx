import React, { useState } from 'react';
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
  const [displayValue, setDisplayValue] = useState<string>(value.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    if (type === 'number') {
      // Allow empty string during editing
      if (inputValue === '') {
        return; // Don't call onChange for empty values during editing
      }
      const numericValue = parseFloat(inputValue);
      if (!isNaN(numericValue)) {
        onChange(numericValue);
      }
    } else {
      onChange(inputValue);
    }
  };

  const handleBlur = () => {
    if (type === 'number') {
      // On blur, if the field is empty or invalid, set it to 0
      const numericValue = parseFloat(displayValue);
      if (displayValue === '' || isNaN(numericValue)) {
        const defaultValue = 0;
        setDisplayValue(defaultValue.toString());
        onChange(defaultValue);
      } else {
        // Ensure the display value matches the actual value
        setDisplayValue(numericValue.toString());
      }
    }
  };

  // Update display value when the prop value changes (e.g., from external updates)
  React.useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

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
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
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
