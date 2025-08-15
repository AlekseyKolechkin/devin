import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity } from 'lucide-react';
import { PropertyInputs } from '../types/financial';
import { calculateResults } from '../utils/calculations';

interface SensitivityAnalysisProps {
  inputs: PropertyInputs;
  locale: string;
}

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({ inputs, locale }) => {
  const { t } = useTranslation();

  // Generate sensitivity data
  const sensitivityData = useMemo(() => {
    const rentGrowthRates = [0, 1, 2, 3, 4, 5]; // % per year
    const interestRates = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]; // % per year
    
    const data: Array<{
      rentGrowth: number;
      interestRate: number;
      irr: number;
      color: string;
    }> = [];

    rentGrowthRates.forEach(rentGrowth => {
      interestRates.forEach(interestRate => {
        try {
          const modifiedInputs = {
            ...inputs,
            rentGrowthRate: rentGrowth,
            interestRate: interestRate
          };
          
          const results = calculateResults(modifiedInputs);
          const irr = results.irr;
          
          // Color coding based on IRR
          let color = '#EF4444'; // Red for poor returns
          if (irr > 8) color = '#10B981'; // Green for excellent returns
          else if (irr > 6) color = '#F59E0B'; // Yellow for good returns
          else if (irr > 4) color = '#F97316'; // Orange for moderate returns
          
          data.push({
            rentGrowth,
            interestRate,
            irr,
            color
          });
        } catch (error) {
          // Handle calculation errors
          data.push({
            rentGrowth,
            interestRate,
            irr: 0,
            color: '#6B7280' // Gray for errors
          });
        }
      });
    });

    return data;
  }, [inputs]);

  const rentGrowthRates = [0, 1, 2, 3, 4, 5];
  const interestRates = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

  const getIRRForCell = (rentGrowth: number, interestRate: number) => {
    const cell = sensitivityData.find(
      d => d.rentGrowth === rentGrowth && d.interestRate === interestRate
    );
    return cell ? cell.irr : 0;
  };

  const getColorForCell = (rentGrowth: number, interestRate: number) => {
    const cell = sensitivityData.find(
      d => d.rentGrowth === rentGrowth && d.interestRate === interestRate
    );
    return cell ? cell.color : '#6B7280';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-red-600" />
          {t('sensitivityAnalysis')}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('sensitivityAnalysisDescription')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2 text-center font-medium text-sm">
                {t('interestRate')} \ {t('rentGrowth')}
              </div>
              {rentGrowthRates.map(rate => (
                <div key={rate} className="p-2 text-center font-medium text-sm bg-gray-100 dark:bg-gray-800 rounded">
                  {rate}%
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            {interestRates.map(interestRate => (
              <div key={interestRate} className="grid grid-cols-8 gap-1 mb-1">
                <div className="p-2 text-center font-medium text-sm bg-gray-100 dark:bg-gray-800 rounded">
                  {interestRate}%
                </div>
                {rentGrowthRates.map(rentGrowth => {
                  const irr = getIRRForCell(rentGrowth, interestRate);
                  const color = getColorForCell(rentGrowth, interestRate);
                  
                  return (
                    <div
                      key={`${interestRate}-${rentGrowth}`}
                      className="p-2 text-center text-white text-sm font-medium rounded transition-all hover:scale-105"
                      style={{ backgroundColor: color }}
                      title={`${t('rentGrowth')}: ${rentGrowth}%, ${t('interestRate')}: ${interestRate}%, IRR: ${irr.toFixed(1)}%`}
                    >
                      {irr.toFixed(1)}%
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>{t('poorReturns')} (&lt;4%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>{t('moderateReturns')} (4-6%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>{t('goodReturns')} (6-8%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>{t('excellentReturns')} (&gt;8%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensitivityAnalysis;
