import type { ExpenseEstimate, Money, TravelPace, TripActivity, TripDay, TripDraft, TripPlan } from "../types/trip";

const interestActivities: Record<string, string[]> = {
  gastronomia: ["Degustacao local", "Mercado gastronomico", "Jantar autoral"],
  cultura: ["Museu essencial", "Centro historico", "Galeria contemporanea"],
  natureza: ["Parque panoramico", "Trilha leve", "Passeio ao ar livre"],
  compras: ["Rua de boutiques", "Feira criativa", "Lojas locais"],
  "vida noturna": ["Bar com vista", "Show local", "Rota de coqueteis"],
  familia: ["Atracao interativa", "Parque urbano", "Experiencia educativa"],
  aventura: ["Passeio guiado", "Atividade outdoor", "Mirante especial"],
};

const paceCount: Record<TravelPace, number> = {
  leve: 2,
  moderado: 3,
  intenso: 4,
};

const money = (amount: number, currency: string): Money => ({ amount, currency });

const daysBetween = (startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  return Math.max(diff, 1);
};

const addDays = (date: string, amount: number) => {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + amount);
  return next.toISOString().slice(0, 10);
};

const convertBudget = (amount: number, fromCurrency: string, toCurrency: string) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const brlRates: Record<string, number> = {
    EUR: 0.174,
    USD: 0.19,
    GBP: 0.15,
    ARS: 171,
    JPY: 29,
  };

  if (fromCurrency === "BRL") {
    return amount * (brlRates[toCurrency] ?? 0.19);
  }

  if (toCurrency === "BRL") {
    return amount / (brlRates[fromCurrency] ?? 0.19);
  }

  return amount;
};

const activityCost = (style: string, index: number, dayNumber: number) => {
  const base = style === "premium" ? 68 : style === "confortavel" ? 42 : 24;
  return base + index * 9 + dayNumber * 3;
};

function buildActivity(draft: TripDraft, dayNumber: number, index: number): TripActivity {
  const interest = draft.preferences.interests[(dayNumber + index) % draft.preferences.interests.length] ?? "cultura";
  const templates = interestActivities[interest] ?? interestActivities.cultura;
  const title = templates[index % templates.length];
  const times = ["09:30", "12:30", "15:30", "19:30"];

  return {
    id: crypto.randomUUID(),
    time: times[index] ?? "18:00",
    title,
    location: `${draft.destination} - regiao ${index + 1}`,
    description: `Experiencia alinhada com ${interest}, em ritmo ${draft.preferences.pace}, pensada para ${draft.travelers} viajante(s).`,
    estimatedCost: money(activityCost(draft.preferences.style, index, dayNumber), draft.localCurrency),
  };
}

function buildDays(draft: TripDraft, totalDays: number): TripDay[] {
  return Array.from({ length: totalDays }, (_, index) => {
    const dayNumber = index + 1;
    const activities = Array.from({ length: paceCount[draft.preferences.pace] }, (__, activityIndex) =>
      buildActivity(draft, dayNumber, activityIndex),
    );

    return {
      dayNumber,
      date: addDays(draft.startDate, index),
      title: dayNumber === 1 ? "Chegada e primeiras descobertas" : `Experiencias em ${draft.destination}`,
      summary:
        dayNumber === totalDays
          ? "Dia com margem para ultimas compras, deslocamentos e fechamento da viagem sem correria."
          : "Dia equilibrado com deslocamentos curtos, pausas estrategicas e atividades conectadas aos seus interesses.",
      activities,
    };
  });
}

function buildExpenses(draft: TripDraft, convertedBudget: number): ExpenseEstimate[] {
  const categories = [
    ["Hospedagem", 0.42],
    ["Alimentacao", 0.24],
    ["Transporte", 0.12],
    ["Passeios", 0.16],
    ["Extras", 0.06],
  ] as const;

  return categories.map(([category, ratio]) => ({
    category,
    amount: money(Math.round(convertedBudget * ratio), draft.localCurrency),
  }));
}

export function generateTripPlan(draft: TripDraft): TripPlan {
  const totalDays = daysBetween(draft.startDate, draft.endDate);
  const convertedBudget = Math.round(convertBudget(draft.budgetAmount, draft.budgetCurrency, draft.localCurrency));
  const days = buildDays(draft, totalDays);

  return {
    id: crypto.randomUUID(),
    name: draft.name,
    destination: draft.destination,
    startDate: draft.startDate,
    endDate: draft.endDate,
    totalDays,
    travelers: draft.travelers,
    localCurrency: draft.localCurrency,
    totalBudget: money(draft.budgetAmount, draft.budgetCurrency),
    convertedBudget: money(convertedBudget, draft.localCurrency),
    preferences: draft.preferences,
    status: "generated",
    summary: `Roteiro personalizado para ${draft.destination}, com perfil ${draft.preferences.style}, ritmo ${draft.preferences.pace} e foco em ${draft.preferences.interests.join(", ")}.`,
    checklist: [
      "Documento valido e reservas confirmadas",
      "Seguro viagem e contatos de emergencia",
      "Cartao habilitado para uso internacional",
      "Roupas adequadas ao clima previsto",
      "Carregadores, adaptadores e bateria externa",
      "Copias digitais dos documentos importantes",
    ],
    weather: Array.from({ length: totalDays }, (_, index) => ({
      day: addDays(draft.startDate, index).slice(5).replace("-", "/"),
      condition: index % 3 === 0 ? "Ensolarado" : index % 3 === 1 ? "Parcialmente nublado" : "Brisa leve",
      minCelsius: 17 + (index % 4),
      maxCelsius: 25 + (index % 5),
    })),
    expenses: buildExpenses(draft, convertedBudget),
    days,
  };
}
