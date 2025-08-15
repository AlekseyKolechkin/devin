import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, DollarSign, PieChart as PieChartIcon, BarChart3, Target, Calculator } from 'lucide-react';
import { ResultsData, PropertyInputs } from '../types/financial';
import { formatCurrency, formatPercentage } from '../utils/calculations';

interface AdvancedChartsProps {
  results: ResultsData;
  inputs: PropertyInputs;
  locale: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ results, inputs, locale }) => {
  const { t } = useTranslation();

  // 1. Eigenkapital Growth Data
  // Formula: Eigenkapital(t) = Initial Equity + Loan Repayment + Property Appreciation
  const equityGrowthData = useMemo(() => {
    const initialEquity = inputs.purchasePrice + results.totalPurchaseCosts - inputs.loanAmount;

    return results.yearlyResults.map(year => {
      const loanRepayment = inputs.loanAmount - year.remainingLoan;
      const propertyAppreciation = year.propertyValue - inputs.purchasePrice;
      const totalEquity = initialEquity + loanRepayment + propertyAppreciation;

      return {
        year: year.year,
        loanRepayment,
        propertyAppreciation,
        totalEquity,
        propertyValue: year.propertyValue
      };
    });
  }, [results, inputs]);

  // 2. Net Cash Flow Data (with colors for positive/negative)
  // Formula: Netto-CF = Mieteinnahmen - Zinsen - Tilgung - laufende Kosten + Steuer-Effekt
  const netCashFlowData = useMemo(() => {
    return results.yearlyResults.map(year => {
      const netCashFlow = year.cashFlow; // This already includes the correct formula from calculations

      return {
        year: year.year,
        netCashFlow,
        isPositive: netCashFlow >= 0,
        rentalIncome: year.rentalIncome,
        interestPayment: year.interestPayment,
        repaymentAmount: year.repaymentAmount,
        operatingExpenses: year.operatingExpenses,
        taxBenefit: year.taxBenefit
      };
    });
  }, [results]);

  // 3. Scenario Analysis Data (Best/Base/Worst case)
  const scenarioData = useMemo(() => {
    const baseCase = results.yearlyResults.map(year => ({
      year: year.year,
      baseCase: year.roi,
      bestCase: year.roi * 1.3, // 30% better
      worstCase: year.roi * 0.7  // 30% worse
    }));
    return baseCase;
  }, [results]);

  // 4. Purchase Cost Structure
  const purchaseCostData = useMemo(() => {
    const grunderwerbsteuer = inputs.purchasePrice * (inputs.grunderwerbsteuer / 100);
    const notary = inputs.purchasePrice * (inputs.notarRate / 100);
    const court = inputs.purchasePrice * (inputs.amtsgerichtRate / 100);
    const broker = inputs.purchasePrice * (inputs.maklerRate / 100);
    
    return [
      { name: t('purchasePrice'), value: inputs.purchasePrice, color: COLORS[0] },
      { name: t('grunderwerbsteuer'), value: grunderwerbsteuer, color: COLORS[1] },
      { name: t('notar'), value: notary, color: COLORS[2] },
      { name: t('amtsgericht'), value: court, color: COLORS[3] },
      { name: t('makler'), value: broker, color: COLORS[4] },
      { name: t('renovation'), value: inputs.renovation, color: COLORS[5] }
    ].filter(item => item.value > 0);
  }, [inputs, t]);

  // 5. Annual Income/Expense Structure
  const annualStructureData = useMemo(() => {
    const firstYear = results.yearlyResults[0];
    if (!firstYear) return [];

    return [
      // Income
      { name: t('rentalIncome'), value: firstYear.rentalIncome, type: 'income', color: COLORS[0] },
      { name: t('taxBenefit'), value: firstYear.taxBenefit, type: 'income', color: COLORS[1] },
      
      // Expenses
      { name: t('interestPayment'), value: firstYear.interestPayment, type: 'expense', color: COLORS[2] },
      { name: t('repaymentAmount'), value: firstYear.repaymentAmount, type: 'expense', color: COLORS[3] },
      { name: t('operatingExpenses'), value: firstYear.operatingExpenses, type: 'expense', color: COLORS[4] }
    ];
  }, [results, t]);

  // 6. AfA and Tax Savings Data
  const afaData = useMemo(() => {
    return results.yearlyResults.map(year => ({
      year: year.year,
      afaAmount: year.amortization,
      taxSavings: year.taxBenefit,
      cumulativeTaxSavings: results.yearlyResults
        .slice(0, year.year)
        .reduce((sum, y) => sum + y.taxBenefit, 0)
    }));
  }, [results]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow">
          <p className="font-medium">{`${t('year')} ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value, locale)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Eigenkapital Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t('equityGrowth')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={equityGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => formatCurrency(value, locale)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="loanRepayment" 
                stackId="1" 
                stroke="#8884d8" 
                fill="#8884d8" 
                name={t('loanRepayment')}
              />
              <Area 
                type="monotone" 
                dataKey="propertyAppreciation" 
                stackId="1" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                name={t('propertyAppreciation')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 2. Net Cash Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            {t('netCashFlow')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={netCashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => formatCurrency(value, locale)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="netCashFlow"
                name={t('netCashFlow')}
              >
                {netCashFlowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isPositive ? "#10B981" : "#EF4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3. Scenario Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            {t('scenarioAnalysis')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scenarioData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                labelFormatter={(label) => `${t('year')} ${label}`}
              />
              <Legend />
              <Line type="monotone" dataKey="bestCase" stroke="#10B981" name={t('bestCase')} strokeWidth={2} />
              <Line type="monotone" dataKey="baseCase" stroke="#3B82F6" name={t('baseCase')} strokeWidth={2} />
              <Line type="monotone" dataKey="worstCase" stroke="#EF4444" name={t('worstCase')} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4. Purchase Cost Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-orange-600" />
              {t('purchaseCostStructure')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={purchaseCostData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {purchaseCostData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value, locale)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 5. Annual Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              {t('annualStructure')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={annualStructureData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {annualStructureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value, locale)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 6. AfA and Tax Savings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            {t('afaAndTaxSavings')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={afaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value) => formatCurrency(value, locale)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="afaAmount" 
                stroke="#8884d8" 
                name={t('afaAmount')} 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeTaxSavings" 
                stroke="#82ca9d" 
                name={t('cumulativeTaxSavings')} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedCharts;
