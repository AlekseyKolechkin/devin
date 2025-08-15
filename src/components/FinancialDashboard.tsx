import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { LineChart, Line, AreaChart, Area, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Home, Receipt, DollarSign, CreditCard, Settings, TrendingUp, Target, Building, BarChart3 } from 'lucide-react';
import { PropertyInputs, ResultsData } from '../types/financial';
import { calculateResults, formatCurrency, formatPercentage, formatNumber } from '../utils/calculations';
import InputField from './InputField';
import EnergyEfficiencySlider from './EnergyEfficiencySlider';
import RegionSelect from './RegionSelect';
import LanguageSwitcher from './LanguageSwitcher';
import CashFlowTable from './CashFlowTable';
import PercentageEuroField from './PercentageEuroField';
import ReadOnlyPercentageEuroField from './ReadOnlyPercentageEuroField';
import DualEuroSqmField from './DualEuroSqmField';
import DepreciationTypeSelector from './DepreciationTypeSelector';
import TaxRateCalculator from './TaxRateCalculator';

// Real estate transfer tax rates by German federal state (Grunderwerbsteuer)
const getGrunderwerbsteuerRate = (region: string): number => {
  const rates: { [key: string]: number } = {
    'Baden-Württemberg': 5.0,
    'Bayern': 3.5,
    'Berlin': 6.0,
    'Brandenburg': 6.5,
    'Bremen': 5.0,
    'Hamburg': 4.5,
    'Hessen': 6.0,
    'Mecklenburg-Vorpommern': 6.0,
    'Niedersachsen': 5.0,
    'Nordrhein-Westfalen': 6.5,
    'Rheinland-Pfalz': 5.0,
    'Saarland': 6.5,
    'Sachsen': 3.5,
    'Sachsen-Anhalt': 5.0,
    'Schleswig-Holstein': 6.5,
    'Thüringen': 6.5
  };
  return rates[region] || 5.0; // Default 5% if region not found
};

const defaultInputs: PropertyInputs = {
  purchasePrice: 300000,
  area: 80,
  region: 'Berlin',
  energyEfficiency: 'C',
  // Purchase costs with realistic German rates
  grunderwerbsteuer: 6.0, // Will be updated based on region
  notarRate: 1.5, // Notary: typically 1.0-2.0%
  amtsgerichtRate: 0.5, // Court registration: typically 0.5%
  maklerRate: 3.57, // Broker: typically 3.57% (including VAT)
  renovation: 0, // Renovation costs: optional
  coldRent: 1200,
  coldRentPerSqm: 12.0,
  warmRent: 1400,
  stellplatz: 50,
  nebenkostenUml: 150,
  nebenkostenNichtUml: 50,
  verwaltungWhg: 50,
  additionalExpenses: 200,
  loanAmount: 240000,
  interestRate: 3.5,
  repaymentRate: 2.0,
  loanTerm: 30,
  depreciationType: 'neubau-afa-lin',
  manualTaxSettings: false,
  afaRate: 2.0,
  specialAmortization: 0,
  specialAmortizationYears: 0,
  manualTaxRate: false,
  marginalTaxRate: 42,
  annualIncome: 80000,
  maritalStatus: 'single',
  children: 0,
  churchTax: false,
  solidarityTax: true,
  rentGrowthRate: 2.0,
  propertyGrowthRate: 2.5,
  hasKfwLoan: false,
  kfwLoanAmount: 0,
  kfwInterestRate: 1.5,
  kfwRepaymentRate: 2.0,
  kfwLoanTerm: 20
};

export default function FinancialDashboard() {
  const { t, i18n } = useTranslation();
  const [inputs, setInputs] = useState<PropertyInputs>(defaultInputs);
  const [results, setResults] = useState<ResultsData | null>(null);

  useEffect(() => {
    const savedInputs = localStorage.getItem('financialDashboardInputs');
    if (savedInputs) {
      try {
        setInputs(JSON.parse(savedInputs));
      } catch (error) {
        console.error('Error loading saved inputs:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('financialDashboardInputs', JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        console.log('Calculating results with inputs:', inputs);
        const calculatedResults = calculateResults(inputs);
        console.log('Calculated results:', calculatedResults);
        setResults(calculatedResults);
      } catch (error) {
        console.error('Error calculating results:', error);
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
        setResults(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputs]);

  const updateInput = (field: keyof PropertyInputs, value: number | string | boolean) => {
    setInputs(prev => {
      const newInputs = { ...prev, [field]: value };

      // Auto-update Grunderwerbsteuer when region changes
      if (field === 'region' && typeof value === 'string') {
        newInputs.grunderwerbsteuer = getGrunderwerbsteuerRate(value);
      }

      return newInputs;
    });
  };

  const resetInputs = () => {
    setInputs(defaultInputs);
    localStorage.removeItem('financialDashboardInputs');
  };

  const exportData = () => {
    const data = { inputs, results };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-dashboard-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.inputs) {
            setInputs(data.inputs);
          }
        } catch (error) {
          console.error('Error importing data:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const chartData = useMemo(() => {
    if (!results) return [];
    return results.yearlyResults.map(year => {
      // Calculate loan payments (principal + interest)
      const loanPayments = year.interestPayment + year.repaymentAmount;

      return {
        year: year.year,
        propertyValue: Math.round(year.propertyValue),
        remainingLoan: Math.round(year.remainingLoan),
        cashFlow: Math.round(year.cashFlow),
        cumulativeCashFlow: Math.round(year.cumulativeCashFlow),
        rentalIncome: Math.round(year.rentalIncome),
        // Cash flow components for stacked chart
        income: Math.round(year.rentalIncome),
        taxBenefit: Math.round(year.taxBenefit),
        loanPayments: -Math.round(loanPayments), // Negative for expenses
        operatingExpenses: -Math.round(year.operatingExpenses), // Negative for expenses
      };
    });
  }, [results]);

  const locale = i18n.language === 'de' ? 'de-DE' :
                 i18n.language === 'ru' ? 'ru-RU' :
                 i18n.language === 'tr' ? 'tr-TR' :
                 i18n.language === 'uk' ? 'uk-UA' :
                 i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Forms */}
          <div className="lg:col-span-1 space-y-6">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  {t('propertyDetails')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InputField
                  id="purchasePrice"
                  label="purchasePrice"
                  value={inputs.purchasePrice}
                  onChange={(value) => updateInput('purchasePrice', value as number)}
                  unit="purchasePriceUnit"
                  min={0}
                  step={1000}
                  required
                  info="tooltips.purchasePrice"
                />
                <InputField
                  id="area"
                  label="area"
                  value={inputs.area}
                  onChange={(value) => updateInput('area', value as number)}
                  unit="areaUnit"
                  min={0}
                  step={1}
                  info="tooltips.area"
                />
                <RegionSelect
                  value={inputs.region}
                  onChange={(value: string) => updateInput('region', value)}
                />
                <EnergyEfficiencySlider
                  value={inputs.energyEfficiency}
                  onChange={(value: string) => updateInput('energyEfficiency', value)}
                />
              </CardContent>
            </Card>

            {/* Purchase Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-orange-600" />
                  {t('purchaseCosts')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ReadOnlyPercentageEuroField
                  id="grunderwerbsteuer"
                  label="grunderwerbsteuer"
                  percentage={inputs.grunderwerbsteuer}
                  baseAmount={inputs.purchasePrice}
                  info="tooltips.grunderwerbsteuer"
                />
                <PercentageEuroField
                  id="notar"
                  label="notar"
                  percentage={inputs.notarRate}
                  baseAmount={inputs.purchasePrice}
                  onChange={(value) => updateInput('notarRate', value)}
                />
                <PercentageEuroField
                  id="amtsgericht"
                  label="amtsgericht"
                  percentage={inputs.amtsgerichtRate}
                  baseAmount={inputs.purchasePrice}
                  onChange={(value) => updateInput('amtsgerichtRate', value)}
                />
                <PercentageEuroField
                  id="makler"
                  label="makler"
                  percentage={inputs.maklerRate}
                  baseAmount={inputs.purchasePrice}
                  onChange={(value) => updateInput('maklerRate', value)}
                />
                <InputField
                  id="renovation"
                  label="renovation"
                  value={inputs.renovation}
                  onChange={(value) => updateInput('renovation', value as number)}
                  unit="renovationUnit"
                  min={0}
                  step={1000}
                  info="tooltips.renovation"
                />
              </CardContent>
            </Card>

            {/* Rental Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  {t('rentalParameters')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Kaltmiete - Dual Euro/SQM Field */}
                <DualEuroSqmField
                  id="coldRent"
                  label="coldRent"
                  euroValue={inputs.coldRent}
                  sqmValue={inputs.coldRentPerSqm}
                  area={inputs.area}
                  onEuroChange={(value) => updateInput('coldRent', value)}
                  onSqmChange={(value) => updateInput('coldRentPerSqm', value)}
                  info="tooltips.coldRent"
                  min={0}
                  step={50}
                />

                {/* Stellplatz */}
                <InputField
                  id="stellplatz"
                  label="stellplatz"
                  value={inputs.stellplatz}
                  onChange={(value) => updateInput('stellplatz', value as number)}
                  unit="stellplatzUnit"
                  min={0}
                  step={10}
                />

                {/* Nebenkosten Components */}
                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">{t('nebenkostenDavon')}</h4>
                  <div className="space-y-3">
                    <InputField
                      id="nebenkostenUml"
                      label="nebenkostenUml"
                      value={inputs.nebenkostenUml}
                      onChange={(value) => updateInput('nebenkostenUml', value as number)}
                      unit="nebenkostenUmlUnit"
                      min={0}
                      step={10}
                      info="tooltips.nebenkostenUml"
                    />
                    <InputField
                      id="nebenkostenNichtUml"
                      label="nebenkostenNichtUml"
                      value={inputs.nebenkostenNichtUml}
                      onChange={(value) => updateInput('nebenkostenNichtUml', value as number)}
                      unit="nebenkostenNichtUmlUnit"
                      min={0}
                      step={10}
                      info="tooltips.nebenkostenNichtUml"
                    />
                  </div>

                  {/* Calculated Nebenkosten Total */}
                  <div className="mt-3 p-2 border border-gray-300 dark:border-gray-600 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('nebenkostenTotal')}:
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(inputs.nebenkostenUml + inputs.nebenkostenNichtUml, locale)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Management */}
                <InputField
                  id="verwaltungWhg"
                  label="verwaltungWhg"
                  value={inputs.verwaltungWhg}
                  onChange={(value) => updateInput('verwaltungWhg', value as number)}
                  unit="verwaltungWhgUnit"
                  min={0}
                  step={10}
                />

                {/* Additional Expenses */}
                <InputField
                  id="additionalExpenses"
                  label="additionalExpenses"
                  value={inputs.additionalExpenses}
                  onChange={(value) => updateInput('additionalExpenses', value as number)}
                  unit="additionalExpensesUnit"
                  min={0}
                  step={10}
                  info="tooltips.additionalExpenses"
                />

                {/* Total Rents - Moved to bottom */}
                <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">{t('totalRents')}</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('mieteTotalKalt')}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(inputs.coldRent + inputs.stellplatz, locale)}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('mieteTotalWarm')}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(inputs.coldRent + inputs.stellplatz + inputs.nebenkostenUml + inputs.nebenkostenNichtUml, locale)}
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{t('mieteTotalNetto')}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(inputs.coldRent + inputs.stellplatz + inputs.nebenkostenUml - inputs.verwaltungWhg - inputs.nebenkostenNichtUml - inputs.additionalExpenses, locale)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  {t('loanParameters')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InputField
                  id="loanAmount"
                  label="loanAmount"
                  value={inputs.loanAmount}
                  onChange={(value) => updateInput('loanAmount', value as number)}
                  unit="loanAmountUnit"
                  min={0}
                  step={1000}
                  required
                  info="tooltips.loanAmount"
                />
                <InputField
                  id="interestRate"
                  label="interestRate"
                  value={inputs.interestRate}
                  onChange={(value) => updateInput('interestRate', value as number)}
                  unit="interestRateUnit"
                  min={0}
                  max={20}
                  step={0.1}
                  required
                  info="tooltips.interestRate"
                />
                <InputField
                  id="repaymentRate"
                  label="repaymentRate"
                  value={inputs.repaymentRate}
                  onChange={(value) => updateInput('repaymentRate', value as number)}
                  unit="repaymentRateUnit"
                  min={0}
                  max={10}
                  step={0.1}
                  required
                  info="tooltips.repaymentRate"
                />
                <InputField
                  id="loanTerm"
                  label="loanTerm"
                  value={inputs.loanTerm}
                  onChange={(value) => updateInput('loanTerm', value as number)}
                  unit="loanTermUnit"
                  min={1}
                  max={50}
                  step={1}
                  required
                  info="tooltips.loanTerm"
                />
                
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Checkbox
                    id="hasKfwLoan"
                    checked={inputs.hasKfwLoan}
                    onCheckedChange={(checked) => updateInput('hasKfwLoan', checked)}
                  />
                  <label htmlFor="hasKfwLoan" className="text-sm font-medium cursor-pointer">
                    {t('hasKfwLoan')}
                  </label>
                </div>
                
                {inputs.hasKfwLoan && (
                  <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                    <InputField
                      id="kfwLoanAmount"
                      label="kfwLoanAmount"
                      value={inputs.kfwLoanAmount}
                      onChange={(value) => updateInput('kfwLoanAmount', value as number)}
                      unit="kfwLoanAmountUnit"
                      min={0}
                      step={1000}
                      info="tooltips.kfwLoanAmount"
                    />
                    <InputField
                      id="kfwInterestRate"
                      label="kfwInterestRate"
                      value={inputs.kfwInterestRate}
                      onChange={(value) => updateInput('kfwInterestRate', value as number)}
                      unit="kfwInterestRateUnit"
                      min={0}
                      max={10}
                      step={0.1}
                      info="tooltips.kfwInterestRate"
                    />
                    <InputField
                      id="kfwRepaymentRate"
                      label="kfwRepaymentRate"
                      value={inputs.kfwRepaymentRate}
                      onChange={(value) => updateInput('kfwRepaymentRate', value as number)}
                      unit="kfwRepaymentRateUnit"
                      min={0}
                      max={10}
                      step={0.1}
                      info="tooltips.kfwRepaymentRate"
                    />
                    <InputField
                      id="kfwLoanTerm"
                      label="kfwLoanTerm"
                      value={inputs.kfwLoanTerm}
                      onChange={(value) => updateInput('kfwLoanTerm', value as number)}
                      unit="kfwLoanTermUnit"
                      min={1}
                      max={50}
                      step={1}
                      info="tooltips.kfwLoanTerm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  {t('taxSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <DepreciationTypeSelector
                  depreciationType={inputs.depreciationType}
                  manualTaxSettings={inputs.manualTaxSettings}
                  afaRate={inputs.afaRate}
                  specialAmortization={inputs.specialAmortization}
                  specialAmortizationYears={inputs.specialAmortizationYears}
                  onDepreciationTypeChange={(type) => updateInput('depreciationType', type)}
                  onManualSettingsChange={(manual) => updateInput('manualTaxSettings', manual)}
                  onAfaRateChange={(rate) => updateInput('afaRate', rate)}
                  onSpecialAmortizationChange={(rate) => updateInput('specialAmortization', rate)}
                  onSpecialAmortizationYearsChange={(years) => updateInput('specialAmortizationYears', years)}
                />
              </CardContent>
            </Card>

            {/* Tax Rate Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  {t('taxRateCalculator')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaxRateCalculator
                  manualTaxRate={inputs.manualTaxRate}
                  marginalTaxRate={inputs.marginalTaxRate}
                  annualIncome={inputs.annualIncome}
                  maritalStatus={inputs.maritalStatus}
                  children={inputs.children}
                  churchTax={inputs.churchTax}
                  solidarityTax={inputs.solidarityTax}
                  onManualTaxRateChange={(manual) => updateInput('manualTaxRate', manual)}
                  onMarginalTaxRateChange={(rate) => updateInput('marginalTaxRate', rate)}
                  onAnnualIncomeChange={(income) => updateInput('annualIncome', income)}
                  onMaritalStatusChange={(status) => updateInput('maritalStatus', status)}
                  onChildrenChange={(children) => updateInput('children', children)}
                  onChurchTaxChange={(churchTax) => updateInput('churchTax', churchTax)}
                  onSolidarityTaxChange={(solidarityTax) => updateInput('solidarityTax', solidarityTax)}
                />
              </CardContent>
            </Card>

            {/* Growth Assumptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  {t('growthAssumptions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InputField
                  id="rentGrowthRate"
                  label="rentGrowthRate"
                  value={inputs.rentGrowthRate}
                  onChange={(value) => updateInput('rentGrowthRate', value as number)}
                  unit="rentGrowthRateUnit"
                  min={0}
                  max={10}
                  step={0.1}
                  info="tooltips.rentGrowthRate"
                />
                <InputField
                  id="propertyGrowthRate"
                  label="propertyGrowthRate"
                  value={inputs.propertyGrowthRate}
                  onChange={(value) => updateInput('propertyGrowthRate', value as number)}
                  unit="propertyGrowthRateUnit"
                  min={0}
                  max={10}
                  step={0.1}
                  info="tooltips.propertyGrowthRate"
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={resetInputs} variant="outline">
                {t('reset')}
              </Button>
              <Button onClick={exportData} variant="outline">
                {t('export')}
              </Button>
              <Button variant="outline" className="relative">
                {t('import')}
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {!results && (
              <div className="text-center p-8">
                <div className="text-gray-500">Calculating results...</div>
              </div>
            )}
            {results && (
              <>
                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-red-600" />
                      {t('keyMetrics')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatPercentage(results.totalReturn, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('totalReturn')}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatPercentage(results.irr, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('irr')}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {formatCurrency(results.totalCashFlow, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('totalCashFlow')}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(results.finalPropertyValue, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('finalPropertyValue')}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(results.totalInterestPaid, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('totalInterestPaid')}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                          {formatCurrency(results.totalTaxBenefits, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('totalTaxBenefits')}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {formatCurrency(results.totalPurchaseCosts, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('totalPurchaseCosts')}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(results.totalInvestmentCost, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('totalInvestmentCost')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mortgage Indicators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-indigo-600" />
                      {t('mortgageIndicators')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(results.mortgageIndicators.totalLoanAmount, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('totalLoanAmount')}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                          {formatCurrency(results.mortgageIndicators.monthlyPayment, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('monthlyPayment')}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(results.mortgageIndicators.totalInterestPaid, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('totalInterestPaid')}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(results.mortgageIndicators.interestPaid10Years, locale)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {t('interestPaid10Years')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Return on Equity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      {t('returnOnEquity')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {results.returnOnEquity.map((roe) => (
                        <div key={roe.year} className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                              {t('roeYear', { year: roe.year })}
                            </div>
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">
                              {formatPercentage(roe.roe, locale)}
                            </div>
                            {/*<div className="grid grid-cols-2 gap-2 text-xs">*/}
                            {/*  <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">*/}
                            {/*    <InfoTooltip content={t('equity')}>*/}
                            {/*      <Wallet className="h-3 w-3 text-blue-500" />*/}
                            {/*    </InfoTooltip>*/}
                            {/*    <span className="font-medium text-gray-700 dark:text-gray-300">*/}
                            {/*      {formatCurrency(roe.equity, locale)}*/}
                            {/*    </span>*/}
                            {/*  </div>*/}
                            {/*  <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">*/}
                            {/*    <InfoTooltip content={t('totalReturnAmount')}>*/}
                            {/*      <ArrowUpRight className="h-3 w-3 text-green-500" />*/}
                            {/*    </InfoTooltip>*/}
                            {/*    <span className="font-medium text-gray-700 dark:text-gray-300">*/}
                            {/*      {formatCurrency(roe.totalReturn, locale)}*/}
                            {/*    </span>*/}
                            {/*  </div>*/}
                            {/*  <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">*/}
                            {/*    <InfoTooltip content={t('cashFlowReturn')}>*/}
                            {/*      <Banknote className="h-3 w-3 text-emerald-500" />*/}
                            {/*    </InfoTooltip>*/}
                            {/*    <span className="font-medium text-gray-700 dark:text-gray-300">*/}
                            {/*      {formatCurrency(roe.cashFlowReturn, locale)}*/}
                            {/*    </span>*/}
                            {/*  </div>*/}
                            {/*  <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">*/}
                            {/*    <InfoTooltip content={t('totalTaxBenefits')}>*/}
                            {/*      <Shield className="h-3 w-3 text-purple-500" />*/}
                            {/*    </InfoTooltip>*/}
                            {/*    <span className="font-medium text-gray-700 dark:text-gray-300">*/}
                            {/*      {formatCurrency(roe.taxBenefits, locale)}*/}
                            {/*    </span>*/}
                            {/*  </div>*/}
                            {/*  <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1 col-span-2">*/}
                            {/*    <InfoTooltip content={t('propertyAppreciation')}>*/}
                            {/*      <TrendingUp className="h-3 w-3 text-orange-500" />*/}
                            {/*    </InfoTooltip>*/}
                            {/*    <span className="font-medium text-gray-700 dark:text-gray-300">*/}
                            {/*      {formatCurrency(roe.propertyAppreciation, locale)}*/}
                            {/*    </span>*/}
                            {/*  </div>*/}
                            {/*</div>*!/*/}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Charts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-violet-600" />
                      {t('charts')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Capital Growth Chart */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t('capitalGrowth')}</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(value) => formatNumber(value, locale)} />
                          <Tooltip formatter={(value) => formatCurrency(value as number, locale)} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="propertyValue" 
                            stroke="#8884d8" 
                            name={t('propertyValue')}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Loan Reduction Chart */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t('loanReduction')}</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(value) => formatNumber(value, locale)} />
                          <Tooltip formatter={(value) => formatCurrency(value as number, locale)} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="remainingLoan" 
                            stroke="#82ca9d" 
                            fill="#82ca9d" 
                            name={t('remainingLoan')}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Cash Flow Chart */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t('annualCashFlows')}</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(value) => formatNumber(value, locale)} />
                          <Tooltip
                            formatter={(value, name) => [
                              formatCurrency(value as number, locale),
                              name
                            ]}
                            labelFormatter={(label) => `${t('year')} ${label}`}
                          />
                          <Legend />
                          <Bar
                            dataKey="income"
                            stackId="cashflow"
                            fill="#22c55e"
                            name={t('rentalIncome')}
                          />
                          <Bar
                            dataKey="taxBenefit"
                            stackId="cashflow"
                            fill="#3b82f6"
                            name={t('taxBenefit')}
                          />
                          <Bar
                            dataKey="loanPayments"
                            stackId="cashflow"
                            fill="#ef4444"
                            name={t('loanPayments')}
                          />
                          <Bar
                            dataKey="operatingExpenses"
                            stackId="cashflow"
                            fill="#f97316"
                            name={t('operatingExpenses')}
                          />
                          <Line
                            type="monotone"
                            dataKey="cashFlow"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                            name={t('cashFlow')}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Cumulative Returns Chart */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t('cumulativeReturns')}</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis tickFormatter={(value) => formatNumber(value, locale)} />
                          <Tooltip formatter={(value) => formatCurrency(value as number, locale)} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="cumulativeCashFlow" 
                            stroke="#ff7300" 
                            name={t('cumulativeCashFlow')}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Cash Flow Table */}
                <CashFlowTable yearlyResults={results.yearlyResults} locale={locale} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
