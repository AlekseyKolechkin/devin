import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { YearlyResults } from '../types/financial';
import { formatCurrency, formatPercentage } from '../utils/calculations';

interface CashFlowTableProps {
  yearlyResults: YearlyResults[];
  locale: string;
}

export default function CashFlowTable({ yearlyResults, locale }: CashFlowTableProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Income and Cash Flows Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('incomeAndCashFlows')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-16">{t('year')}</TableHead>
                  <TableHead className="min-w-32">{t('rentalIncomePerYear')}</TableHead>
                  <TableHead className="min-w-32">{t('operatingExpensesPerYear')}</TableHead>
                  <TableHead className="min-w-32">{t('netIncomeBeforeDebt')}</TableHead>
                  <TableHead className="min-w-32">{t('taxDepreciation')}</TableHead>
                  <TableHead className="min-w-32">{t('taxableIncomePerYear')}</TableHead>
                  <TableHead className="min-w-32">{t('taxOnRentalIncome')}</TableHead>
                  <TableHead className="min-w-32">{t('netCashFlowPerYear')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyResults.map((result) => (
                  <TableRow key={result.year}>
                    <TableCell className="font-medium">{result.year}</TableCell>
                    <TableCell>{formatCurrency(result.rentalIncome, locale)}</TableCell>
                    <TableCell>{formatCurrency(result.operatingExpenses, locale)}</TableCell>
                    <TableCell>{formatCurrency(result.netIncomeBeforeDebt, locale)}</TableCell>
                    <TableCell>{formatCurrency(result.taxDepreciation, locale)}</TableCell>
                    <TableCell className={result.taxableIncome < 0 ? 'text-red-600' : ''}>
                      {formatCurrency(result.taxableIncome, locale)}
                    </TableCell>
                    <TableCell className={result.taxOnRentalIncome < 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(result.taxOnRentalIncome, locale)}
                    </TableCell>
                    <TableCell className={result.cashFlow < 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(result.cashFlow, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Debt and Capital Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('debtAndCapital')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-16">{t('year')}</TableHead>
                  <TableHead className="min-w-32">{t('interestPaymentsPerYear')}</TableHead>
                  <TableHead className="min-w-32">{t('principalPaymentsPerYear')}</TableHead>
                  <TableHead className="min-w-32">{t('remainingDebtEndOfYear')}</TableHead>
                  <TableHead className="min-w-32">{t('propertyValueEndOfYear')}</TableHead>
                  <TableHead className="min-w-32">{t('equityEndOfYear')}</TableHead>
                  <TableHead className="min-w-32">{t('roiAccumulated')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyResults.map((result) => (
                  <TableRow key={result.year}>
                    <TableCell className="font-medium">{result.year}</TableCell>
                    <TableCell>{formatCurrency(result.interestPayment, locale)}</TableCell>
                    <TableCell>{formatCurrency(result.repaymentAmount, locale)}</TableCell>
                    <TableCell>{formatCurrency(result.remainingLoan, locale)}</TableCell>
                    <TableCell>{formatCurrency(result.propertyValue, locale)}</TableCell>
                    <TableCell className="text-blue-600 font-semibold">
                      {formatCurrency(result.equity, locale)}
                    </TableCell>
                    <TableCell className={result.roi > 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatPercentage(result.roi, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
