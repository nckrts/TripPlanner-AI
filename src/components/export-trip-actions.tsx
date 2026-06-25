import { useState } from "react";
import { exportTripToPdf, shareTripPdf } from "../services/exportTripToPdf";
import type { TripPlan } from "../types/trip";

type ExportTripActionsProps = {
  trip: TripPlan;
  compact?: boolean;
};

export function ExportTripActions({ trip, compact = false }: ExportTripActionsProps) {
  const [status, setStatus] = useState<string>("");

  function handleDownload(label: string) {
    exportTripToPdf(trip);
    setStatus(`${label} gerado em PDF.`);
  }

  async function handleShare() {
    const result = await shareTripPdf(trip);
    setStatus(
      result === "shared"
        ? "PDF enviado para compartilhamento."
        : "Compartilhamento indisponivel. O PDF foi baixado.",
    );
  }

  return (
    <div className={compact ? "export-actions export-actions--compact" : "export-actions"}>
      <button className="button button--primary" type="button" onClick={() => handleDownload("Roteiro")}>
        <span aria-hidden="true">PDF</span>
        Baixar roteiro
      </button>
      <button className="button button--ghost" type="button" onClick={() => handleDownload("Roteiro salvo")}>
        <span aria-hidden="true">OK</span>
        Salvar roteiro
      </button>
      <button className="button button--secondary" type="button" onClick={handleShare}>
        <span aria-hidden="true">SH</span>
        Compartilhar PDF
      </button>
      {status ? <p className="export-actions__status">{status}</p> : null}
    </div>
  );
}
