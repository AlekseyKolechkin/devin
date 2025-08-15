export interface PropertyInputs {
  purchasePrice: number;
  area: number;
  region: string;
  energyEfficiency: string;
  // Purchase costs
  grunderwerbsteuer: number; // Real estate transfer tax (read-only, depends on region)
  notarRate: number; // Notary percentage
  amtsgerichtRate: number; // Court registration percentage
  maklerRate: number; // Broker percentage
  renovation: number; // Renovation costs
  coldRent: number; // Kaltmiete
  coldRentPerSqm: number; // Cold rent per square meter
  warmRent: number; // Warmmiete
  stellplatz: number; // Parking space rent per month

  // Nebenkosten components (for calculation)
  nebenkostenUml: number; // Redistributable utility costs (davon uml)
  nebenkostenNichtUml: number; // Non-redistributable utility costs (davon n. umlf)

  // Management
  verwaltungWhg: number; // Property management fee

  additionalExpenses: number;
  loanAmount: number;
  interestRate: number;
  repaymentRate: number;
  loanTerm: number;
  // Tax settings
  depreciationType: string; // Type of depreciation
  manualTaxSettings: boolean; // Whether to use manual tax settings
  afaRate: number;
  specialAmortization: number;
  specialAmortizationYears: number;

  // Tax rate calculation
  manualTaxRate: boolean; // Whether to use manual tax rate
  marginalTaxRate: number;
  annualIncome: number;
  maritalStatus: string;
  children: number;
  churchTax: boolean;
  solidarityTax: boolean;
  rentGrowthRate: number;
  propertyGrowthRate: number;
  hasKfwLoan: boolean;
  kfwLoanAmount: number;
  kfwInterestRate: number;
  kfwRepaymentRate: number;
  kfwLoanTerm: number;
}

export interface YearlyResults {
  year: number;
  monthlyPayment: number;
  remainingLoan: number;
  rentalIncome: number;
  propertyValue: number;
  taxBenefit: number;
  cashFlow: number;
  cumulativeCashFlow: number;
  amortization: number;
  interestPayment: number;
  repaymentAmount: number;
  operatingExpenses: number;
  netIncomeBeforeDebt: number;
  taxDepreciation: number;
  taxableIncome: number;
  taxOnRentalIncome: number;
  equity: number;
  roi: number;
}

export interface MortgageIndicators {
  totalLoanAmount: number;
  monthlyPayment: number;
  totalInterestPaid: number;
  interestPaid10Years: number;
}

export interface EnergyEfficiencyOption {
  value: string;
  label: string;
  color: string;
}

export interface RegionOption {
  value: string;
  label: string;
}

export interface ReturnOnEquity {
  year: number;
  roe: number;
  equity: number;
  totalReturn: number;
  cashFlowReturn: number;
  taxBenefits: number;
  propertyAppreciation: number;
}

export interface ResultsData {
  yearlyResults: YearlyResults[];
  totalReturn: number;
  irr: number;
  totalCashFlow: number;
  finalPropertyValue: number;
  totalInterestPaid: number;
  totalTaxBenefits: number;
  totalPurchaseCosts: number;
  totalInvestmentCost: number;
  returnOnEquity: ReturnOnEquity[];
  mortgageIndicators: MortgageIndicators;
}

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}
