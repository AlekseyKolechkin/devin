export interface PropertyInputs {
  purchasePrice: number;
  area: number;
  region: string;
  energyEfficiency: string;
  coldRent: number; // Kaltmiete
  warmRent: number; // Warmmiete
  additionalExpenses: number;
  loanAmount: number;
  interestRate: number;
  repaymentRate: number;
  loanTerm: number;
  afaRate: number;
  specialAmortization: number;
  specialAmortizationYears: number;
  marginalTaxRate: number;
  rentGrowthRate: number;
  propertyGrowthRate: number;
  purchaseDate: string;
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
}

export interface ResultsData {
  yearlyResults: YearlyResults[];
  totalReturn: number;
  irr: number;
  totalCashFlow: number;
  finalPropertyValue: number;
  totalInterestPaid: number;
  totalTaxBenefits: number;
}

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}
