/**
 * Financial validators for real estate transactions
 */

/**
 * Validates monthly fee is reasonable for apartment size
 */
export function manadsavgiftValidator(avgift: number, boarea?: number | null): boolean {
  if (!boarea) return true // Can't validate without area
  
  // Typical range is 30-100 SEK per sqm
  const avgiftPerSqm = avgift / boarea
  return avgiftPerSqm >= 20 && avgiftPerSqm <= 150
}

/**
 * Validates drift cost per square meter
 */
export function driftPerKvmValidator(drift: number): boolean {
  // Typical range is 100-500 SEK per sqm per year
  return drift >= 50 && drift <= 1000
}

/**
 * Validates tax value compared to price
 */
export function taxeringsvardeValidator(
  taxeringsvarde: number,
  utgangspris?: number | null
): boolean {
  if (!utgangspris) return true
  
  // Tax value is typically 50-75% of market value
  const ratio = taxeringsvarde / utgangspris
  return ratio >= 0.3 && ratio <= 1.2
}

/**
 * Validates mortgage deed (pantbrev) amount
 */
export function pantbrevValidator(pantbrev: number, utgangspris?: number | null): boolean {
  if (!utgangspris) return true
  
  // Pantbrev typically shouldn't exceed property value
  return pantbrev <= utgangspris * 1.1
}

/**
 * Validates insurance cost is reasonable
 */
export function forsakringskostnadValidator(
  kostnad: number,
  boarea?: number | null,
  typ?: string | null
): boolean {
  // Annual insurance cost typically 2000-15000 SEK
  if (kostnad < 1000 || kostnad > 50000) return false
  
  // Villas typically have higher insurance
  if (typ === 'villa' && kostnad < 3000) return false
  if (typ === 'lagenhet' && kostnad > 10000) return false
  
  return true
}

/**
 * Calculates total monthly cost
 */
export function calculateTotalMonthlyCost(data: {
  manadsavgift?: number | null
  driftkostnad?: number | null
  forsakringskostnad?: number | null
  uppvarmningskostnad?: number | null
  elforbrukning?: number | null
  vattenforbrukning?: number | null
}): number {
  let total = 0
  
  // Direct monthly costs
  if (data.manadsavgift) total += data.manadsavgift
  
  // Annual costs converted to monthly
  if (data.driftkostnad) total += data.driftkostnad / 12
  if (data.forsakringskostnad) total += data.forsakringskostnad / 12
  if (data.uppvarmningskostnad) total += data.uppvarmningskostnad / 12
  
  // Utility costs (assuming monthly)
  if (data.elforbrukning) total += data.elforbrukning
  if (data.vattenforbrukning) total += data.vattenforbrukning
  
  return Math.round(total)
}

/**
 * Calculates price per square meter
 */
export function calculatePricePerSqm(
  price: number,
  boarea?: number | null
): number | null {
  if (!boarea || boarea === 0) return null
  return Math.round(price / boarea)
}

/**
 * Validates cooperative share percentages
 */
export function andelValidator(
  andel_i_forening?: number | null,
  andelstal?: number | null
): boolean {
  // Both should be between 0 and 100 if provided
  if (andel_i_forening !== null && andel_i_forening !== undefined) {
    if (andel_i_forening < 0 || andel_i_forening > 100) return false
  }
  
  if (andelstal !== null && andelstal !== undefined) {
    if (andelstal < 0 || andelstal > 100) return false
  }
  
  return true
}

/**
 * Validates bidding increment
 */
export function budIncrementValidator(
  newBid: number,
  currentHighestBid: number,
  minimumIncrement: number = 5000
): boolean {
  return newBid >= currentHighestBid + minimumIncrement
}

/**
 * Calculates ROI for rental properties
 */
export function calculateRentalROI(data: {
  monthlyRent: number
  purchasePrice: number
  manadsavgift?: number | null
  driftkostnad?: number | null
  forsakringskostnad?: number | null
}): number {
  const annualRent = data.monthlyRent * 12
  
  let annualCosts = 0
  if (data.manadsavgift) annualCosts += data.manadsavgift * 12
  if (data.driftkostnad) annualCosts += data.driftkostnad
  if (data.forsakringskostnad) annualCosts += data.forsakringskostnad
  
  const netIncome = annualRent - annualCosts
  const roi = (netIncome / data.purchasePrice) * 100
  
  return Math.round(roi * 10) / 10 // Round to 1 decimal
}

/**
 * Financing calculations
 */
export const financingCalculations = {
  // Calculate loan amount based on down payment percentage
  loanAmount: (price: number, downPaymentPercent: number = 15): number => {
    return Math.round(price * (1 - downPaymentPercent / 100))
  },
  
  // Calculate monthly payment (simplified)
  monthlyPayment: (loanAmount: number, interestRate: number, years: number): number => {
    const monthlyRate = interestRate / 100 / 12
    const numPayments = years * 12
    
    if (monthlyRate === 0) {
      return Math.round(loanAmount / numPayments)
    }
    
    const payment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    
    return Math.round(payment)
  },
  
  // Calculate affordability based on income
  affordability: (monthlyIncome: number, debtRatio: number = 0.35): number => {
    return Math.round(monthlyIncome * debtRatio)
  }
}