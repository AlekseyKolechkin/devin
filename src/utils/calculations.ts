import { PropertyInputs, ResultsData, YearlyResults } from '../types/financial';

function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  const maxIterations = 100;
  const tolerance = 1e-6;
  
  let rate = guess;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;
    
    for (let j = 0; j < cashFlows.length; j++) {
      const factor = Math.pow(1 + rate, j);
      npv += cashFlows[j] / factor;
      dnpv -= (j * cashFlows[j]) / (factor * (1 + rate));
    }
    
    if (Math.abs(npv) < tolerance) {
      return rate;
    }
    
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }
    
    rate = newRate;
  }
  
  return rate;
}

function calculateMonthlyPayment(loanAmount: number, interestRate: number, repaymentRate: number): number {
  const monthlyRate = (interestRate + repaymentRate) / 100 / 12;
  return loanAmount * monthlyRate;
}

function calculateRemainingLoan(
  initialLoan: number,
  monthlyPayment: number,
  monthlyInterestRate: number,
  monthsPaid: number
): number {
  let balance = initialLoan;
  
  for (let month = 0; month < monthsPaid; month++) {
    const interestPayment = balance * monthlyInterestRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);
    
    if (balance === 0) break;
  }
  
  return balance;
}

function calculateRentalIncome(baseRent: number, growthRate: number, year: number): number {
  return baseRent * Math.pow(1 + growthRate / 100, year - 1);
}

function calculatePropertyValue(baseValue: number, growthRate: number, year: number): number {
  return baseValue * Math.pow(1 + growthRate / 100, year - 1);
}

function calculateTaxBenefit(
  afaAmount: number,
  specialAmortization: number,
  additionalExpenses: number,
  interestPayment: number,
  marginalTaxRate: number
): number {
  const totalDeductions = afaAmount + specialAmortization + additionalExpenses + interestPayment;
  return totalDeductions * (marginalTaxRate / 100);
}

export function calculateResults(inputs: PropertyInputs): ResultsData {
  const {
    purchasePrice,
    coldRent,
    additionalExpenses,
    loanAmount,
    interestRate,
    repaymentRate,
    loanTerm,
    afaRate,
    specialAmortization,
    specialAmortizationYears,
    marginalTaxRate,
    rentGrowthRate,
    propertyGrowthRate
  } = inputs;

  const yearlyResults: YearlyResults[] = [];
  const monthlyInterestRate = interestRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, repaymentRate);
  const annualAfaAmount = purchasePrice * (afaRate / 100);
  const annualSpecialAmortization = purchasePrice * (specialAmortization / 100);
  
  let cumulativeCashFlow = 0;
  let totalInterestPaid = 0;
  let totalTaxBenefits = 0;
  
  const initialInvestment = purchasePrice - loanAmount;
  cumulativeCashFlow -= initialInvestment;
  
  const cashFlows: number[] = [-initialInvestment];

  for (let year = 1; year <= loanTerm; year++) {
    const annualRentalIncome = calculateRentalIncome(coldRent * 12, rentGrowthRate, year);
    
    const remainingLoan = calculateRemainingLoan(
      loanAmount,
      monthlyPayment,
      monthlyInterestRate,
      (year - 1) * 12
    );
    
    let yearlyInterestPayment = 0;
    let yearlyPrincipalPayment = 0;
    
    for (let month = 1; month <= 12; month++) {
      const monthStart = (year - 1) * 12 + month - 1;
      const balance = calculateRemainingLoan(loanAmount, monthlyPayment, monthlyInterestRate, monthStart);
      
      if (balance > 0) {
        const monthlyInterest = balance * monthlyInterestRate;
        const monthlyPrincipal = Math.min(monthlyPayment - monthlyInterest, balance);
        
        yearlyInterestPayment += monthlyInterest;
        yearlyPrincipalPayment += monthlyPrincipal;
      }
    }
    
    const currentSpecialAmortization = year <= specialAmortizationYears ? annualSpecialAmortization : 0;
    
    const taxBenefit = calculateTaxBenefit(
      annualAfaAmount,
      currentSpecialAmortization,
      additionalExpenses * 12,
      yearlyInterestPayment,
      marginalTaxRate
    );
    
    const annualLoanPayment = monthlyPayment * 12;
    const cashFlow = annualRentalIncome - annualLoanPayment - (additionalExpenses * 12) + taxBenefit;
    cumulativeCashFlow += cashFlow;
    
    const propertyValue = calculatePropertyValue(purchasePrice, propertyGrowthRate, year);
    
    totalInterestPaid += yearlyInterestPayment;
    totalTaxBenefits += taxBenefit;
    
    yearlyResults.push({
      year,
      monthlyPayment,
      remainingLoan,
      rentalIncome: annualRentalIncome,
      propertyValue,
      taxBenefit,
      cashFlow,
      cumulativeCashFlow,
      amortization: annualAfaAmount + currentSpecialAmortization,
      interestPayment: yearlyInterestPayment,
      repaymentAmount: yearlyPrincipalPayment
    });
    
    cashFlows.push(cashFlow);
  }
  
  const finalPropertyValue = yearlyResults[yearlyResults.length - 1]?.propertyValue || purchasePrice;
  const finalCashFlow = cashFlows[cashFlows.length - 1] + finalPropertyValue - calculateRemainingLoan(
    loanAmount,
    monthlyPayment,
    monthlyInterestRate,
    loanTerm * 12
  );
  cashFlows[cashFlows.length - 1] = finalCashFlow;
  
  const irr = calculateIRR(cashFlows);
  
  const totalInvestment = initialInvestment;
  const totalValue = cumulativeCashFlow + finalPropertyValue - calculateRemainingLoan(
    loanAmount,
    monthlyPayment,
    monthlyInterestRate,
    loanTerm * 12
  );
  const totalReturn = ((totalValue - totalInvestment) / totalInvestment) * 100;

  return {
    yearlyResults,
    totalReturn,
    irr: irr * 100, // Convert to percentage
    totalCashFlow: cumulativeCashFlow,
    finalPropertyValue,
    totalInterestPaid,
    totalTaxBenefits
  };
}

export function formatCurrency(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercentage(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}

export function formatNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
