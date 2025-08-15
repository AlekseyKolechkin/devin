import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Target } from 'lucide-react';
import { ResultsData, PropertyInputs } from '../types/financial';
import { formatCurrency, formatPercentage } from '../utils/calculations';

interface DetailedKeyMetricsProps {
  results: ResultsData;
  inputs: PropertyInputs;
  locale: string;
}

interface MetricData {
  year1: number;
  sum10Years: number;
  average10Years: number;
  totalTerm: number;
}

const DetailedKeyMetrics: React.FC<DetailedKeyMetricsProps> = ({ results, inputs, locale }) => {
  const { t } = useTranslation();

  // Calculate detailed metrics
  const calculateDetailedMetrics = () => {
    const year1Data = results.yearlyResults[0];
    const totalYears = results.yearlyResults.length;

    // 1. Cashflow (without tax effects)
    const cashflowYear1 = year1Data ? (year1Data.rentalIncome - year1Data.interestPayment - year1Data.repaymentAmount - year1Data.operatingExpenses) : 0;

    const totalCashflow10Years = results.yearlyResults.slice(0, Math.min(10, totalYears)).reduce((sum, year) =>
      sum + (year.rentalIncome - year.interestPayment - year.repaymentAmount - year.operatingExpenses), 0
    );
    const averageCashflow10Years = totalCashflow10Years / Math.min(10, totalYears);

    const totalCashflowAllYears = results.yearlyResults.reduce((sum, year) =>
      sum + (year.rentalIncome - year.interestPayment - year.repaymentAmount - year.operatingExpenses), 0
    );

    const cashflow: MetricData = {
      year1: cashflowYear1,
      sum10Years: totalCashflow10Years,
      average10Years: averageCashflow10Years,
      totalTerm: totalCashflowAllYears
    };

    // 2. Tax Effect (return or additional payment)
    const taxEffectYear1 = year1Data ? year1Data.taxBenefit : 0;

    const totalTaxEffect10Years = results.yearlyResults.slice(0, Math.min(10, totalYears)).reduce((sum, year) => sum + year.taxBenefit, 0);
    const averageTaxEffect10Years = totalTaxEffect10Years / Math.min(10, totalYears);

    const totalTaxEffectAllYears = results.totalTaxBenefits;

    const taxEffect: MetricData = {
      year1: taxEffectYear1,
      sum10Years: totalTaxEffect10Years,
      average10Years: averageTaxEffect10Years,
      totalTerm: totalTaxEffectAllYears
    };

    // 3. Cashflow including tax effects
    const cashflowWithTaxYear1 = cashflowYear1 + taxEffectYear1;

    const totalCashflowWithTax10Years = totalCashflow10Years + totalTaxEffect10Years;
    const averageCashflowWithTax10Years = totalCashflowWithTax10Years / Math.min(10, totalYears);

    const totalCashflowWithTaxAllYears = totalCashflowAllYears + totalTaxEffectAllYears;

    const cashflowWithTax: MetricData = {
      year1: cashflowWithTaxYear1,
      sum10Years: totalCashflowWithTax10Years,
      average10Years: averageCashflowWithTax10Years,
      totalTerm: totalCashflowWithTaxAllYears
    };

    // 4. Return on Equity (ROE) after taxes
    const initialEquity = inputs.purchasePrice + results.totalPurchaseCosts - inputs.loanAmount;

    // Year 1 ROE (annual return on initial equity)
    const roeYear1 = initialEquity > 0 ? (cashflowWithTaxYear1 / initialEquity) * 100 : 0;

    // Sum ROE over 10 years (cumulative return on initial equity over 10 years)
    const roeSumOver10Years = initialEquity > 0 ? (totalCashflowWithTax10Years / initialEquity) * 100 : 0;

    // Average ROE over 10 years (average annual return on initial equity)
    const roeAverageOver10Years = roeSumOver10Years / Math.min(10, totalYears);

    // Total ROE over all years (cumulative return on initial equity over entire term)
    const roeTotalTerm = initialEquity > 0 ? (totalCashflowWithTaxAllYears / initialEquity) * 100 : 0;

    const roe: MetricData = {
      year1: roeYear1,
      sum10Years: roeSumOver10Years,
      average10Years: roeAverageOver10Years,
      totalTerm: roeTotalTerm
    };

    return { cashflow, taxEffect, cashflowWithTax, roe };
  };

  const metrics = calculateDetailedMetrics();

  const MetricCard: React.FC<{
    title: string;
    data: MetricData;
    color: string;
    isPercentage?: boolean;
  }> = ({ title, data, color, isPercentage = false }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg ${color} text-center`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="font-semibold text-gray-600 dark:text-gray-400 text-xs">
              {t('year1')}
            </div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {isPercentage ? formatPercentage(data.year1, locale) : formatCurrency(data.year1, locale)}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="font-semibold text-gray-600 dark:text-gray-400 text-xs">
              {t('sum10Years')}
            </div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {isPercentage ? formatPercentage(data.sum10Years, locale) : formatCurrency(data.sum10Years, locale)}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="font-semibold text-gray-600 dark:text-gray-400 text-xs">
              {t('average10Years')}
            </div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {isPercentage ? formatPercentage(data.average10Years, locale) : formatCurrency(data.average10Years, locale)}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="font-semibold text-gray-600 dark:text-gray-400 text-xs">
              {t('totalTerm')}
            </div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {isPercentage ? formatPercentage(data.totalTerm, locale) : formatCurrency(data.totalTerm, locale)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-red-600" />
          {t('detailedKeyMetrics')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricCard
            title={t('cashflowBeforeTax')}
            data={metrics.cashflow}
            color="text-blue-600 dark:text-blue-400"
          />
          
          <MetricCard
            title={t('taxEffect')}
            data={metrics.taxEffect}
            color="text-green-600 dark:text-green-400"
          />
          
          <MetricCard
            title={t('cashflowAfterTax')}
            data={metrics.cashflowWithTax}
            color="text-purple-600 dark:text-purple-400"
          />
          
          <MetricCard
            title={t('roeAfterTax')}
            data={metrics.roe}
            color="text-orange-600 dark:text-orange-400"
            isPercentage={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedKeyMetrics;
