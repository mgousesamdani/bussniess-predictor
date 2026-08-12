export interface BusinessInput {
  budget: number;
  state: string;
  city?: string;
  startMonth: string;
  likedProfession?: string;
}

export interface BusinessPrediction {
  businessName: string;
  suggestedInvestment: number;
  successProbability: number;
  failureRisk: number;
  profitMargin: number;
  lossMargin: number;
  monthlyNetProfit: number;
  breakEvenMonths: number;
  seasonalImpact: string;
  regionalDemand: string;
  marketCompetition: string;
  keyRiskFactors: string[];
  explanation: string;
}

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Chandigarh", "Jammu & Kashmir", "Ladakh", "Puducherry"
];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];
