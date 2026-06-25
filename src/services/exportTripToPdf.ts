import { jsPDF } from "jspdf";
import type { TripPlan } from "../types/trip";

type PdfPalette = {
  ink: string;
  muted: string;
  line: string;
  paper: string;
  panel: string;
  primary: string;
  primaryDark: string;
  accent: string;
  success: string;
};

const palette: PdfPalette = {
  ink: "#172033",
  muted: "#657085",
  line: "#DEE5EF",
  paper: "#F6F8FB",
  panel: "#FFFFFF",
  primary: "#2563EB",
  primaryDark: "#123A8C",
  accent: "#14B8A6",
  success: "#16A34A",
};

const page = {
  width: 210,
  height: 297,
  margin: 16,
};

const money = (value: { amount: number; currency: string }) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: value.currency,
    maximumFractionDigits: 0,
  }).format(value.amount);

const date = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

const fileName = (trip: TripPlan) =>
  `${trip.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "roteiro"}-tripplanner-ai.pdf`;

const setFill = (doc: jsPDF, color: string) => doc.setFillColor(color);
const setText = (doc: jsPDF, color: string) => doc.setTextColor(color);
const setDraw = (doc: jsPDF, color: string) => doc.setDrawColor(color);

function addHeader(doc: jsPDF, trip: TripPlan, pageNumber: number) {
  setText(doc, palette.primaryDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TripPlanner AI", page.margin, 12);

  setText(doc, palette.muted);
  doc.setFont("helvetica", "normal");
  doc.text(trip.name, page.width - page.margin, 12, { align: "right" });

  setDraw(doc, palette.line);
  doc.line(page.margin, 17, page.width - page.margin, 17);

  addFooter(doc, pageNumber);
}

function addFooter(doc: jsPDF, pageNumber: number) {
  setDraw(doc, palette.line);
  doc.line(page.margin, page.height - 15, page.width - page.margin, page.height - 15);

  setText(doc, palette.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Gerado por TripPlanner AI", page.margin, page.height - 8);
  doc.text(`Pagina ${pageNumber}`, page.width - page.margin, page.height - 8, { align: "right" });
}

function ensureSpace(doc: jsPDF, trip: TripPlan, y: number, needed: number, state: { pageNumber: number }) {
  if (y + needed <= page.height - 22) {
    return y;
  }

  doc.addPage();
  state.pageNumber += 1;
  addHeader(doc, trip, state.pageNumber);
  return 26;
}

function card(doc: jsPDF, x: number, y: number, w: number, h: number, title: string, body: string, color = palette.primary) {
  setFill(doc, palette.panel);
  setDraw(doc, palette.line);
  doc.roundedRect(x, y, w, h, 3, 3, "FD");

  setFill(doc, color);
  doc.circle(x + 8, y + 9, 3, "F");

  setText(doc, palette.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(title.toUpperCase(), x + 15, y + 8);

  setText(doc, palette.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(body, x + 15, y + 17, { maxWidth: w - 20 });
}

function sectionTitle(doc: jsPDF, title: string, y: number) {
  setText(doc, palette.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, page.margin, y);

  setFill(doc, palette.accent);
  doc.roundedRect(page.margin, y + 4, 18, 1.8, 1, 1, "F");
}

function cover(doc: jsPDF, trip: TripPlan) {
  setFill(doc, palette.paper);
  doc.rect(0, 0, page.width, page.height, "F");

  setFill(doc, palette.primaryDark);
  doc.roundedRect(0, 0, page.width, 105, 0, 0, "F");
  setFill(doc, palette.primary);
  doc.circle(184, 24, 34, "F");
  setFill(doc, palette.accent);
  doc.circle(158, 78, 10, "F");

  setText(doc, "#FFFFFF");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TripPlanner AI", page.margin, 24);

  doc.setFontSize(28);
  doc.text(doc.splitTextToSize(trip.name, 160), page.margin, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text(`${trip.destination} | ${date(trip.startDate)} a ${date(trip.endDate)}`, page.margin, 88);

  card(doc, page.margin, 122, 55, 30, "Dias", `${trip.totalDays}`, palette.accent);
  card(doc, 78, 122, 55, 30, "Orcamento", money(trip.totalBudget), palette.primary);
  card(doc, 140, 122, 54, 30, "Convertido", money(trip.convertedBudget), palette.success);

  sectionTitle(doc, "Resumo da viagem", 174);
  setText(doc, palette.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(trip.summary, 176), page.margin, 190, { lineHeightFactor: 1.45 });

  sectionTitle(doc, "Informacoes principais", 226);
  card(doc, page.margin, 240, 86, 28, "Moeda local", trip.localCurrency, palette.accent);
  card(doc, 108, 240, 86, 28, "Destino", trip.destination, palette.primary);

  addFooter(doc, 1);
}

function addTripSummary(doc: jsPDF, trip: TripPlan, state: { pageNumber: number }) {
  let y = 30;
  sectionTitle(doc, "Checklist da viagem", y);
  y += 15;

  trip.checklist.forEach((item) => {
    y = ensureSpace(doc, trip, y, 10, state);
    setFill(doc, palette.panel);
    setDraw(doc, palette.line);
    doc.roundedRect(page.margin, y - 5, 5, 5, 1, 1, "D");
    setText(doc, palette.ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(item, page.margin + 9, y);
    y += 9;
  });

  y += 8;
  y = ensureSpace(doc, trip, y, 50, state);
  sectionTitle(doc, "Previsao do tempo", y);
  y += 12;

  const weatherCardWidth = 42;
  trip.weather.forEach((forecast, index) => {
    const x = page.margin + (index % 4) * 45;
    if (index > 0 && index % 4 === 0) {
      y += 32;
    }
    setFill(doc, palette.panel);
    setDraw(doc, palette.line);
    doc.roundedRect(x, y, weatherCardWidth, 26, 3, 3, "FD");
    setText(doc, palette.primaryDark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(forecast.day, x + 5, y + 8);
    setText(doc, palette.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(forecast.condition, x + 5, y + 15, { maxWidth: weatherCardWidth - 8 });
    doc.text(`${forecast.minCelsius}C / ${forecast.maxCelsius}C`, x + 5, y + 22);
  });

  y += 42;
  y = ensureSpace(doc, trip, y, 56, state);
  sectionTitle(doc, "Estimativa de gastos", y);
  y += 15;

  trip.expenses.forEach((expense) => {
    y = ensureSpace(doc, trip, y, 11, state);
    setText(doc, palette.ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(expense.category, page.margin, y);
    setText(doc, palette.primaryDark);
    doc.setFont("helvetica", "bold");
    doc.text(money(expense.amount), page.width - page.margin, y, { align: "right" });
    setDraw(doc, palette.line);
    doc.line(page.margin, y + 4, page.width - page.margin, y + 4);
    y += 11;
  });
}

function addItinerary(doc: jsPDF, trip: TripPlan, state: { pageNumber: number }) {
  let y = 30;
  sectionTitle(doc, "Roteiro dia a dia", y);
  y += 16;

  trip.days.forEach((day) => {
    y = ensureSpace(doc, trip, y, 32, state);
    setFill(doc, palette.primaryDark);
    doc.roundedRect(page.margin, y, page.width - page.margin * 2, 18, 3, 3, "F");
    setText(doc, "#FFFFFF");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Dia ${day.dayNumber} - ${day.title}`, page.margin + 7, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(date(day.date), page.width - page.margin - 7, y + 8, { align: "right" });
    y += 25;

    setText(doc, palette.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(day.summary, page.width - page.margin * 2);
    doc.text(summaryLines, page.margin, y);
    y += summaryLines.length * 5 + 6;

    day.activities.forEach((activity) => {
      const descriptionLines = doc.splitTextToSize(activity.description, 112);
      const cardHeight = Math.max(30, 22 + descriptionLines.length * 5);
      y = ensureSpace(doc, trip, y, cardHeight + 8, state);

      setFill(doc, palette.panel);
      setDraw(doc, palette.line);
      doc.roundedRect(page.margin, y, page.width - page.margin * 2, cardHeight, 3, 3, "FD");

      setFill(doc, palette.accent);
      doc.roundedRect(page.margin + 6, y + 7, 18, 8, 2, 2, "F");
      setText(doc, "#FFFFFF");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(activity.time, page.margin + 15, y + 12.5, { align: "center" });

      setText(doc, palette.ink);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(activity.title, page.margin + 31, y + 10);

      setText(doc, palette.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(activity.location, page.margin + 31, y + 17);
      doc.text(descriptionLines, page.margin + 31, y + 24);

      setText(doc, palette.primaryDark);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(money(activity.estimatedCost), page.width - page.margin - 8, y + 10, { align: "right" });

      y += cardHeight + 8;
    });

    y += 5;
  });
}

export function createTripPdfBlob(trip: TripPlan): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const state = { pageNumber: 1 };

  cover(doc, trip);

  doc.addPage();
  state.pageNumber += 1;
  addHeader(doc, trip, state.pageNumber);
  addTripSummary(doc, trip, state);

  doc.addPage();
  state.pageNumber += 1;
  addHeader(doc, trip, state.pageNumber);
  addItinerary(doc, trip, state);

  return doc.output("blob");
}

export function exportTripToPdf(trip: TripPlan) {
  const blob = createTripPdfBlob(trip);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName(trip);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function shareTripPdf(trip: TripPlan) {
  const blob = createTripPdfBlob(trip);
  const pdfFile = new File([blob], fileName(trip), { type: "application/pdf" });
  const canShareFiles =
    typeof navigator !== "undefined" &&
    "canShare" in navigator &&
    navigator.canShare({ files: [pdfFile] });

  if (canShareFiles) {
    await navigator.share({
      title: trip.name,
      text: `Roteiro de viagem para ${trip.destination}, gerado pelo TripPlanner AI.`,
      files: [pdfFile],
    });
    return "shared";
  }

  exportTripToPdf(trip);
  return "downloaded";
}
