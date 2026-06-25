export type Money = {
  amount: number;
  currency: string;
};

export type WeatherForecast = {
  day: string;
  condition: string;
  minCelsius: number;
  maxCelsius: number;
};

export type TripActivity = {
  id: string;
  time: string;
  title: string;
  location: string;
  description: string;
  estimatedCost: Money;
};

export type TripDay = {
  dayNumber: number;
  date: string;
  title: string;
  summary: string;
  activities: TripActivity[];
};

export type ExpenseEstimate = {
  category: string;
  amount: Money;
};

export type TravelPace = "leve" | "moderado" | "intenso";

export type TravelStyle = "economico" | "confortavel" | "premium";

export type TripPreferences = {
  style: TravelStyle;
  pace: TravelPace;
  interests: string[];
  restrictions: string[];
  language: string;
  currency: string;
};

export type TripDraft = {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budgetAmount: number;
  budgetCurrency: string;
  localCurrency: string;
  preferences: TripPreferences;
};

export type TripStatus = "draft" | "generated" | "shared";

export type TripPlan = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  localCurrency: string;
  totalBudget: Money;
  convertedBudget: Money;
  summary: string;
  checklist: string[];
  weather: WeatherForecast[];
  expenses: ExpenseEstimate[];
  days: TripDay[];
  status?: TripStatus;
  travelers?: number;
  createdAt?: string;
  updatedAt?: string;
  shareUrl?: string;
  preferences?: TripPreferences;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};
