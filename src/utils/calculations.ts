import {MortgageIndicators, PropertyInputs, ResultsData, YearlyResults} from '../types/financial';

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

function calculateInterestPaid10Years(
  loanAmount: number,
  monthlyPayment: number,
  monthlyInterestRate: number
): number {
  let balance = loanAmount;
  let totalInterest = 0;
  
  for (let month = 0; month < 120; month++) { // 10 years = 120 months
    if (balance <= 0) break;
    
    const interestPayment = balance * monthlyInterestRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    
    totalInterest += interestPayment;
    balance -= principalPayment;
  }
  
  return totalInterest;
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

function calculateRentalIncome(baseRent: number, stellplatz: number, nebenkostenUml: number, growthRate: number, year: number): number {
  // Only cold rent and redistributable costs grow with inflation
  // Stellplatz and non-redistributable costs typically remain fixed
  const growingIncome = (baseRent + nebenkostenUml) * Math.pow(1 + growthRate / 100, year - 1);
  return growingIncome + stellplatz;
}

function calculatePropertyValue(baseValue: number, growthRate: number, year: number): number {
  return baseValue * Math.pow(1 + growthRate / 100, year - 1);
}

function calculateTaxBenefit(
  afaAmount: number,
  specialAmortization: number,
  operatingExpenses: number,
  interestPayment: number,
  marginalTaxRate: number
): number {
  const totalDeductions = afaAmount + specialAmortization + operatingExpenses + interestPayment;
  return totalDeductions * (marginalTaxRate / 100);
}

export function calculateResults(inputs: PropertyInputs): ResultsData {
  const {
    purchasePrice,
    grunderwerbsteuer,
    notarRate,
    amtsgerichtRate,
    maklerRate,
    renovation,
    coldRent,
    stellplatz = 0,
    nebenkostenUml = 0,
    nebenkostenNichtUml = 0,
    verwaltungWhg = 0,
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
    propertyGrowthRate,
    hasKfwLoan,
    kfwLoanAmount,
    kfwInterestRate,
    kfwRepaymentRate,
    kfwLoanTerm
  } = inputs;

  const yearlyResults: YearlyResults[] = [];
  const monthlyInterestRate = interestRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, repaymentRate);
  
  const kfwMonthlyInterestRate = hasKfwLoan ? kfwInterestRate / 100 / 12 : 0;
  const kfwMonthlyPayment = hasKfwLoan ? calculateMonthlyPayment(kfwLoanAmount, kfwInterestRate, kfwRepaymentRate) : 0;
  
  const totalLoanAmount = loanAmount + (hasKfwLoan ? kfwLoanAmount : 0);
  const totalMonthlyPayment = monthlyPayment + kfwMonthlyPayment;

  // Calculate purchase costs
  const grunderwerbsteuerAmount = purchasePrice * (grunderwerbsteuer / 100);
  const notarAmount = purchasePrice * (notarRate / 100);
  const amtsgerichtAmount = purchasePrice * (amtsgerichtRate / 100);
  const maklerAmount = purchasePrice * (maklerRate / 100);
  const totalPurchaseCosts = grunderwerbsteuerAmount + notarAmount + amtsgerichtAmount + maklerAmount + renovation;

  // Total investment cost (purchase price + all costs)
  const totalInvestmentCost = purchasePrice + totalPurchaseCosts;

  // AfA (depreciation) is calculated on purchase price only in Germany
  // Renovation costs may be depreciated separately depending on the type of work
  const annualAfaAmount = purchasePrice * (afaRate / 100);
  const annualSpecialAmortization = purchasePrice * (specialAmortization / 100);
  
  let cumulativeCashFlow = 0;
  let totalInterestPaid = 0;
  let totalKfwInterestPaid = 0;
  let totalTaxBenefits = 0;
  
  const initialInvestment = totalInvestmentCost - totalLoanAmount;
  cumulativeCashFlow -= initialInvestment;
  
  const cashFlows: number[] = [-initialInvestment];
  const maxLoanTerm = Math.max(loanTerm, hasKfwLoan ? kfwLoanTerm : 0);

  for (let year = 1; year <= maxLoanTerm; year++) {
    const annualRentalIncome = calculateRentalIncome(coldRent * 12, stellplatz * 12, nebenkostenUml * 12, rentGrowthRate, year);
    
    const remainingLoan = calculateRemainingLoan(
      loanAmount,
      monthlyPayment,
      monthlyInterestRate,
      (year - 1) * 12
    );
    
    const remainingKfwLoan = hasKfwLoan && year <= kfwLoanTerm ? calculateRemainingLoan(
      kfwLoanAmount,
      kfwMonthlyPayment,
      kfwMonthlyInterestRate,
      (year - 1) * 12
    ) : 0;
    
    let yearlyInterestPayment = 0;
    let yearlyPrincipalPayment = 0;
    let yearlyKfwInterestPayment = 0;
    let yearlyKfwPrincipalPayment = 0;
    
    if (year <= loanTerm) {
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
    }
    
    if (hasKfwLoan && year <= kfwLoanTerm) {
      for (let month = 1; month <= 12; month++) {
        const monthStart = (year - 1) * 12 + month - 1;
        const balance = calculateRemainingLoan(kfwLoanAmount, kfwMonthlyPayment, kfwMonthlyInterestRate, monthStart);
        
        if (balance > 0) {
          const monthlyInterest = balance * kfwMonthlyInterestRate;
          const monthlyPrincipal = Math.min(kfwMonthlyPayment - monthlyInterest, balance);
          
          yearlyKfwInterestPayment += monthlyInterest;
          yearlyKfwPrincipalPayment += monthlyPrincipal;
        }
      }
    }
    
    const currentSpecialAmortization = year <= specialAmortizationYears ? annualSpecialAmortization : 0;
    
    const totalYearlyInterestPayment = yearlyInterestPayment + yearlyKfwInterestPayment;

    // Total operating expenses include: additional expenses, management fees, and non-redistributable costs
    const totalOperatingExpenses = (additionalExpenses + verwaltungWhg + nebenkostenNichtUml) * 12;

    const taxBenefit = calculateTaxBenefit(
      annualAfaAmount,
      currentSpecialAmortization,
      totalOperatingExpenses,
      totalYearlyInterestPayment,
      marginalTaxRate
    );

    const annualLoanPayment = (year <= loanTerm ? monthlyPayment * 12 : 0) +
                             (hasKfwLoan && year <= kfwLoanTerm ? kfwMonthlyPayment * 12 : 0);
    const cashFlow = annualRentalIncome - annualLoanPayment - totalOperatingExpenses + taxBenefit;
    cumulativeCashFlow += cashFlow;

    const propertyValue = calculatePropertyValue(purchasePrice, propertyGrowthRate, year);

    totalInterestPaid += yearlyInterestPayment;
    totalKfwInterestPaid += yearlyKfwInterestPayment;
    totalTaxBenefits += taxBenefit;

    const operatingExpenses = totalOperatingExpenses;
    const netIncomeBeforeDebt = annualRentalIncome - operatingExpenses;
    const taxDepreciation = annualAfaAmount + currentSpecialAmortization;
    const taxableIncome = netIncomeBeforeDebt - totalYearlyInterestPayment - taxDepreciation;
    const taxOnRentalIncome = taxableIncome * (marginalTaxRate / 100);
    const totalRemainingLoan = remainingLoan + remainingKfwLoan;
    const equity = propertyValue - totalRemainingLoan;
    const roi = initialInvestment > 0 ? (equity / initialInvestment) * 100 : 0;

    yearlyResults.push({
      year,
      monthlyPayment: totalMonthlyPayment,
      remainingLoan: totalRemainingLoan,
      rentalIncome: annualRentalIncome,
      propertyValue,
      taxBenefit,
      cashFlow,
      cumulativeCashFlow,
      amortization: taxDepreciation,
      interestPayment: totalYearlyInterestPayment,
      repaymentAmount: yearlyPrincipalPayment + yearlyKfwPrincipalPayment,
      operatingExpenses,
      netIncomeBeforeDebt,
      taxDepreciation,
      taxableIncome,
      taxOnRentalIncome,
      equity,
      roi
    });
    
    cashFlows.push(cashFlow);
  }
  
  const finalPropertyValue = yearlyResults[yearlyResults.length - 1]?.propertyValue || purchasePrice;
  const finalRemainingLoan = calculateRemainingLoan(loanAmount, monthlyPayment, monthlyInterestRate, loanTerm * 12);
  const finalRemainingKfwLoan = hasKfwLoan ? calculateRemainingLoan(kfwLoanAmount, kfwMonthlyPayment, kfwMonthlyInterestRate, kfwLoanTerm * 12) : 0;
  const totalRemainingLoan = finalRemainingLoan + finalRemainingKfwLoan;

  cashFlows[cashFlows.length - 1] = cashFlows[cashFlows.length - 1] + finalPropertyValue - totalRemainingLoan;
  
  const irr = calculateIRR(cashFlows);
  
  const totalInvestment = initialInvestment;
  const totalValue = cumulativeCashFlow + finalPropertyValue - totalRemainingLoan;
  const totalReturn = ((totalValue - totalInvestment) / totalInvestment) * 100;

  const totalInterestPaidAll = totalInterestPaid + totalKfwInterestPaid;
  const interestPaid10Years = calculateInterestPaid10Years(loanAmount, monthlyPayment, monthlyInterestRate) +
                             (hasKfwLoan ? calculateInterestPaid10Years(kfwLoanAmount, kfwMonthlyPayment, kfwMonthlyInterestRate) : 0);

  const mortgageIndicators: MortgageIndicators = {
    totalLoanAmount,
    monthlyPayment: totalMonthlyPayment,
    totalInterestPaid: totalInterestPaidAll,
    interestPaid10Years
  };

  // Calculate Return on Equity for specific years
  const roeYears = [1, 10, 20, 30];
  const returnOnEquity: ReturnOnEquity[] = roeYears.map(targetYear => {
    const yearData = yearlyResults.find(y => y.year === targetYear);

    if (!yearData) {
      return {
        year: targetYear,
        roe: 0,
        equity: 0,
        totalReturn: 0,
        cashFlowReturn: 0,
        taxBenefits: 0,
        propertyAppreciation: 0
      };
    }

    const equity = yearData.equity;
    const propertyValue = yearData.propertyValue;
    const propertyAppreciation = propertyValue - purchasePrice;

    // Calculate cumulative cash flow and tax benefits up to this year
    const cumulativeCashFlowToYear = yearlyResults
      .filter(y => y.year <= targetYear)
      .reduce((sum, y) => sum + y.cashFlow, 0);

    const cumulativeTaxBenefitsToYear = yearlyResults
      .filter(y => y.year <= targetYear)
      .reduce((sum, y) => sum + y.taxBenefit, 0);

    // Total return = cash flow + tax benefits + property appreciation
    const totalReturnAmount = cumulativeCashFlowToYear + cumulativeTaxBenefitsToYear + propertyAppreciation;

    // ROE = Total return / Initial equity investment
    const roe = initialInvestment > 0 ? (totalReturnAmount / initialInvestment) * 100 : 0;

    return {
      year: targetYear,
      roe,
      equity,
      totalReturn: totalReturnAmount,
      cashFlowReturn: cumulativeCashFlowToYear,
      taxBenefits: cumulativeTaxBenefitsToYear,
      propertyAppreciation
    };
  });

  return {
    yearlyResults,
    totalReturn,
    irr: irr * 100,
    totalCashFlow: cumulativeCashFlow,
    finalPropertyValue,
    totalInterestPaid: totalInterestPaidAll,
    totalTaxBenefits,
    totalPurchaseCosts,
    totalInvestmentCost,
    returnOnEquity,
    mortgageIndicators
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
