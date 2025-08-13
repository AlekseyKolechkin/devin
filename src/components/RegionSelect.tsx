import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
interface RegionOption {
  value: string;
  label: string;
}

const germanStates: RegionOption[] = [
  { value: 'Baden-Württemberg', label: 'Baden-Württemberg' },
  { value: 'Bayern', label: 'Bayern' },
  { value: 'Berlin', label: 'Berlin' },
  { value: 'Brandenburg', label: 'Brandenburg' },
  { value: 'Bremen', label: 'Bremen' },
  { value: 'Hamburg', label: 'Hamburg' },
  { value: 'Hessen', label: 'Hessen' },
  { value: 'Mecklenburg-Vorpommern', label: 'Mecklenburg-Vorpommern' },
  { value: 'Niedersachsen', label: 'Niedersachsen' },
  { value: 'Nordrhein-Westfalen', label: 'Nordrhein-Westfalen' },
  { value: 'Rheinland-Pfalz', label: 'Rheinland-Pfalz' },
  { value: 'Saarland', label: 'Saarland' },
  { value: 'Sachsen', label: 'Sachsen' },
  { value: 'Sachsen-Anhalt', label: 'Sachsen-Anhalt' },
  { value: 'Schleswig-Holstein', label: 'Schleswig-Holstein' },
  { value: 'Thüringen', label: 'Thüringen' }
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
          {germanStates.map((state) => (
            <SelectItem key={state.value} value={state.value}>
              {t(`germanStates.${state.value}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
