import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
interface RegionOption {
  value: string;
  label: string;
}

const berlinDistricts: RegionOption[] = [
  { value: 'Mitte', label: 'Mitte' },
  { value: 'Friedrichshain-Kreuzberg', label: 'Friedrichshain-Kreuzberg' },
  { value: 'Pankow', label: 'Pankow' },
  { value: 'Charlottenburg-Wilmersdorf', label: 'Charlottenburg-Wilmersdorf' },
  { value: 'Spandau', label: 'Spandau' },
  { value: 'Steglitz-Zehlendorf', label: 'Steglitz-Zehlendorf' },
  { value: 'Tempelhof-Schöneberg', label: 'Tempelhof-Schöneberg' },
  { value: 'Neukölln', label: 'Neukölln' },
  { value: 'Treptow-Köpenick', label: 'Treptow-Köpenick' },
  { value: 'Marzahn-Hellersdorf', label: 'Marzahn-Hellersdorf' },
  { value: 'Lichtenberg', label: 'Lichtenberg' },
  { value: 'Reinickendorf', label: 'Reinickendorf' }
];

interface RegionSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function RegionSelect({ value, onChange, className = '' }: RegionSelectProps) {
  const { t } = useTranslation();

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">
        {t('region')}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('region')} />
        </SelectTrigger>
        <SelectContent>
          {berlinDistricts.map((district) => (
            <SelectItem key={district.value} value={district.value}>
              {t(`berlinDistricts.${district.value}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
