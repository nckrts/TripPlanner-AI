import { useMemo, useState } from "react";
import { ExportTripActions } from "./components/export-trip-actions";
import { sampleTrip } from "./data/sample-trip";
import { createShareableTrip, readSharedTripFromUrl } from "./services/share-trip";
import { generateTripPlan } from "./services/trip-generator";
import { tripStorage } from "./services/trip-storage";
import type { AuthUser, TripActivity, TripDraft, TripPlan } from "./types/trip";

type View = "dashboard" | "create" | "trip" | "public" | "admin";

const today = new Date().toISOString().slice(0, 10);

const defaultDraft: TripDraft = {
  name: "Minha proxima viagem",
  destination: "Lisboa, Portugal",
  startDate: today,
  endDate: today,
  travelers: 2,
  budgetAmount: 6800,
  budgetCurrency: "BRL",
  localCurrency: "EUR",
  preferences: {
    style: "confortavel",
    pace: "moderado",
    interests: ["gastronomia", "cultura", "natureza"],
    restrictions: ["sem deslocamentos longos"],
    language: "pt-BR",
    currency: "BRL",
  },
};

const interestOptions = ["gastronomia", "cultura", "natureza", "compras", "vida noturna", "familia", "aventura"];

const currencyOptions = ["BRL", "EUR", "USD", "GBP", "ARS", "JPY"];

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const date = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

export function App() {
  const sharedTrip = useMemo(() => readSharedTripFromUrl(), []);
  const [user, setUser] = useState<AuthUser | null>(() => tripStorage.getUser());
  const [trips, setTrips] = useState<TripPlan[]>(() => {
    const saved = tripStorage.listTrips();
    return saved.length > 0 ? saved : [sampleTrip];
  });
  const [selectedTripId, setSelectedTripId] = useState<string>(() => sharedTrip?.id ?? trips[0]?.id ?? sampleTrip.id);
  const [view, setView] = useState<View>(sharedTrip ? "public" : "dashboard");

  const selectedTrip = sharedTrip ?? trips.find((trip) => trip.id === selectedTripId) ?? trips[0] ?? sampleTrip;

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextUser = {
      id: crypto.randomUUID(),
      name: String(data.get("name") || "Viajante"),
      email: String(data.get("email") || "viajante@tripplanner.ai"),
    };
    tripStorage.saveUser(nextUser);
    setUser(nextUser);
  }

  function saveTrip(trip: TripPlan) {
    const saved = tripStorage.saveTrip(trip);
    const nextTrips = tripStorage.listTrips();
    setTrips(nextTrips);
    setSelectedTripId(saved.id);
    setView("trip");
  }

  function updateSelectedTrip(updater: (trip: TripPlan) => TripPlan) {
    const updated = updater(selectedTrip);
    saveTrip(updated);
  }

  function handleShareTrip() {
    const shared = createShareableTrip(selectedTrip);
    saveTrip(shared);
    void navigator.clipboard?.writeText(shared.shareUrl ?? "");
  }

  if (view === "public" && sharedTrip) {
    return <PublicTripView trip={sharedTrip} />;
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <main className="app-shell">
      <Sidebar
        user={user}
        view={view}
        onView={setView}
        onLogout={() => {
          tripStorage.clearUser();
          setUser(null);
        }}
      />

      <section className="workspace">
        {view === "dashboard" ? (
          <Dashboard
            trips={trips}
            onCreate={() => setView("create")}
            onOpen={(tripId) => {
              setSelectedTripId(tripId);
              setView("trip");
            }}
          />
        ) : null}

        {view === "create" ? <CreateTrip onGenerated={saveTrip} /> : null}

        {view === "trip" ? (
          <TripWorkspace trip={selectedTrip} onUpdate={updateSelectedTrip} onShare={handleShareTrip} />
        ) : null}

        {view === "admin" ? <AdminPanel trips={trips} /> : null}
      </section>
    </main>
  );
}

function AuthScreen({ onLogin }: { onLogin: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <p className="eyebrow">TripPlanner AI</p>
        <h1>Planejamento de viagem com IA, pronto para virar roteiro.</h1>
        <p>Entre para criar, editar, compartilhar e exportar itinerarios profissionais sem usar banco de dados.</p>
        <form className="auth-form" onSubmit={onLogin}>
          <label>
            Nome
            <input name="name" placeholder="Seu nome" required />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="voce@email.com" required />
          </label>
          <button className="button button--primary" type="submit">
            Acessar produto
          </button>
        </form>
      </section>
    </main>
  );
}

function Sidebar({
  user,
  view,
  onView,
  onLogout,
}: {
  user: AuthUser;
  view: View;
  onView: (view: View) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="sidebar">
      <div>
        <strong>TripPlanner AI</strong>
        <span>{user.name}</span>
      </div>
      <nav>
        <button className={view === "dashboard" ? "nav-item active" : "nav-item"} onClick={() => onView("dashboard")}>
          Dashboard
        </button>
        <button className={view === "create" ? "nav-item active" : "nav-item"} onClick={() => onView("create")}>
          Nova viagem
        </button>
        <button className={view === "trip" ? "nav-item active" : "nav-item"} onClick={() => onView("trip")}>
          Roteiro
        </button>
        <button className={view === "admin" ? "nav-item active" : "nav-item"} onClick={() => onView("admin")}>
          Admin
        </button>
      </nav>
      <button className="nav-item" onClick={onLogout}>
        Sair
      </button>
    </aside>
  );
}

function Dashboard({
  trips,
  onCreate,
  onOpen,
}: {
  trips: TripPlan[];
  onCreate: () => void;
  onOpen: (tripId: string) => void;
}) {
  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Suas viagens</h1>
          <p>Continue um roteiro salvo ou gere um novo plano completo.</p>
        </div>
        <button className="button button--primary" onClick={onCreate}>
          Nova viagem
        </button>
      </header>

      <div className="trip-grid">
        {trips.map((trip) => (
          <article className="trip-card" key={trip.id}>
            <div>
              <span>{trip.status ?? "generated"}</span>
              <h2>{trip.name}</h2>
              <p>{trip.destination}</p>
            </div>
            <dl>
              <div>
                <dt>Dias</dt>
                <dd>{trip.totalDays}</dd>
              </div>
              <div>
                <dt>Orcamento</dt>
                <dd>{money(trip.totalBudget.amount, trip.totalBudget.currency)}</dd>
              </div>
              <div>
                <dt>Convertido</dt>
                <dd>{money(trip.convertedBudget.amount, trip.convertedBudget.currency)}</dd>
              </div>
            </dl>
            <button className="button button--ghost" onClick={() => onOpen(trip.id)}>
              Abrir roteiro
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function CreateTrip({ onGenerated }: { onGenerated: (trip: TripPlan) => void }) {
  const [draft, setDraft] = useState(defaultDraft);

  function update<K extends keyof TripDraft>(key: K, value: TripDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleInterest(interest: string) {
    setDraft((current) => {
      const exists = current.preferences.interests.includes(interest);
      const interests = exists
        ? current.preferences.interests.filter((item) => item !== interest)
        : [...current.preferences.interests, interest];
      return { ...current, preferences: { ...current.preferences, interests } };
    });
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Criacao de viagem</p>
          <h1>Gerar roteiro personalizado</h1>
          <p>Preencha os dados principais. A geracao local simula a camada de IA ate as chaves externas entrarem.</p>
        </div>
      </header>

      <form
        className="planner-form"
        onSubmit={(event) => {
          event.preventDefault();
          onGenerated(generateTripPlan(draft));
        }}
      >
        <label>
          Nome da viagem
          <input value={draft.name} onChange={(event) => update("name", event.target.value)} />
        </label>
        <label>
          Destino
          <input value={draft.destination} onChange={(event) => update("destination", event.target.value)} />
        </label>
        <label>
          Inicio
          <input type="date" value={draft.startDate} onChange={(event) => update("startDate", event.target.value)} />
        </label>
        <label>
          Fim
          <input type="date" value={draft.endDate} onChange={(event) => update("endDate", event.target.value)} />
        </label>
        <label>
          Viajantes
          <input
            min={1}
            type="number"
            value={draft.travelers}
            onChange={(event) => update("travelers", Number(event.target.value))}
          />
        </label>
        <label>
          Orcamento
          <input
            min={1}
            type="number"
            value={draft.budgetAmount}
            onChange={(event) => update("budgetAmount", Number(event.target.value))}
          />
        </label>
        <label>
          Moeda do orcamento
          <select value={draft.budgetCurrency} onChange={(event) => update("budgetCurrency", event.target.value)}>
            {currencyOptions.map((currency) => (
              <option key={currency}>{currency}</option>
            ))}
          </select>
        </label>
        <label>
          Moeda local
          <select value={draft.localCurrency} onChange={(event) => update("localCurrency", event.target.value)}>
            {currencyOptions.map((currency) => (
              <option key={currency}>{currency}</option>
            ))}
          </select>
        </label>
        <label>
          Estilo
          <select
            value={draft.preferences.style}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                preferences: { ...current.preferences, style: event.target.value as TripDraft["preferences"]["style"] },
              }))
            }
          >
            <option value="economico">Economico</option>
            <option value="confortavel">Confortavel</option>
            <option value="premium">Premium</option>
          </select>
        </label>
        <label>
          Ritmo
          <select
            value={draft.preferences.pace}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                preferences: { ...current.preferences, pace: event.target.value as TripDraft["preferences"]["pace"] },
              }))
            }
          >
            <option value="leve">Leve</option>
            <option value="moderado">Moderado</option>
            <option value="intenso">Intenso</option>
          </select>
        </label>

        <fieldset>
          <legend>Interesses</legend>
          <div className="chip-grid">
            {interestOptions.map((interest) => (
              <button
                className={draft.preferences.interests.includes(interest) ? "chip selected" : "chip"}
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="form-wide">
          Restricoes
          <textarea
            value={draft.preferences.restrictions.join(", ")}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                preferences: {
                  ...current.preferences,
                  restrictions: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                },
              }))
            }
          />
        </label>

        <button className="button button--primary form-wide" type="submit">
          Gerar roteiro com IA
        </button>
      </form>
    </div>
  );
}

function TripWorkspace({
  trip,
  onUpdate,
  onShare,
}: {
  trip: TripPlan;
  onUpdate: (updater: (trip: TripPlan) => TripPlan) => void;
  onShare: () => void;
}) {
  function updateActivity(activityId: string, patch: Partial<TripActivity>) {
    onUpdate((current) => ({
      ...current,
      days: current.days.map((day) => ({
        ...day,
        activities: day.activities.map((activity) =>
          activity.id === activityId ? { ...activity, ...patch } : activity,
        ),
      })),
    }));
  }

  return (
    <div className="page-stack">
      <header className="trip-hero">
        <div>
          <p className="eyebrow">Roteiro</p>
          <h1>{trip.name}</h1>
          <p>{trip.summary}</p>
        </div>
        <div className="hero-actions">
          <ExportTripActions trip={trip} compact />
          <button className="button button--secondary" onClick={onShare}>
            Compartilhar link
          </button>
        </div>
      </header>

      {trip.shareUrl ? <p className="share-banner">Link compartilhavel copiado: {trip.shareUrl}</p> : null}

      <section className="metric-grid">
        <Metric label="Destino" value={trip.destination} />
        <Metric label="Datas" value={`${date(trip.startDate)} a ${date(trip.endDate)}`} />
        <Metric label="Dias" value={String(trip.totalDays)} />
        <Metric label="Orcamento" value={money(trip.totalBudget.amount, trip.totalBudget.currency)} />
        <Metric label="Moeda local" value={trip.localCurrency} />
        <Metric label="Convertido" value={money(trip.convertedBudget.amount, trip.convertedBudget.currency)} />
      </section>

      <section className="content-grid">
        <Panel title="Checklist">
          <ul className="clean-list">
            {trip.checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="Previsao do tempo">
          <div className="weather-grid">
            {trip.weather.map((forecast) => (
              <div className="weather-card" key={forecast.day}>
                <strong>{forecast.day}</strong>
                <span>{forecast.condition}</span>
                <b>
                  {forecast.minCelsius}C / {forecast.maxCelsius}C
                </b>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Estimativa de gastos">
          <div className="expense-list">
            {trip.expenses.map((expense) => (
              <div key={expense.category}>
                <span>{expense.category}</span>
                <strong>{money(expense.amount.amount, expense.amount.currency)}</strong>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Mapa e locais">
          <div className="map-preview">
            <span>{trip.destination}</span>
            <p>Pontos agrupados por regiao para reduzir deslocamentos. Integracao com Maps fica isolada na proxima etapa.</p>
          </div>
        </Panel>
      </section>

      <section className="day-list">
        {trip.days.map((day) => (
          <article className="day-card" key={day.dayNumber}>
            <div className="day-card__header">
              <div>
                <span>Dia {day.dayNumber}</span>
                <h2>{day.title}</h2>
                <p>{day.summary}</p>
              </div>
              <strong>{date(day.date)}</strong>
            </div>
            <div className="activity-list">
              {day.activities.map((activity) => (
                <div className="activity" key={activity.id}>
                  <input
                    aria-label="Horario"
                    value={activity.time}
                    onChange={(event) => updateActivity(activity.id, { time: event.target.value })}
                  />
                  <div>
                    <input
                      aria-label="Titulo da atividade"
                      value={activity.title}
                      onChange={(event) => updateActivity(activity.id, { title: event.target.value })}
                    />
                    <input
                      aria-label="Local"
                      value={activity.location}
                      onChange={(event) => updateActivity(activity.id, { location: event.target.value })}
                    />
                    <textarea
                      aria-label="Descricao"
                      value={activity.description}
                      onChange={(event) => updateActivity(activity.id, { description: event.target.value })}
                    />
                  </div>
                  <input
                    aria-label="Custo"
                    type="number"
                    value={activity.estimatedCost.amount}
                    onChange={(event) =>
                      updateActivity(activity.id, {
                        estimatedCost: { ...activity.estimatedCost, amount: Number(event.target.value) },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function PublicTripView({ trip }: { trip: TripPlan }) {
  return (
    <main className="public-page">
      <section className="trip-hero">
        <div>
          <p className="eyebrow">Roteiro compartilhado</p>
          <h1>{trip.name}</h1>
          <p>{trip.summary}</p>
        </div>
        <ExportTripActions trip={trip} compact />
      </section>
      <section className="day-list">
        {trip.days.map((day) => (
          <article className="day-card" key={day.dayNumber}>
            <div className="day-card__header">
              <div>
                <span>Dia {day.dayNumber}</span>
                <h2>{day.title}</h2>
              </div>
              <strong>{date(day.date)}</strong>
            </div>
            {day.activities.map((activity) => (
              <p key={activity.id}>
                <strong>{activity.time}</strong> - {activity.title}, {activity.location}
              </p>
            ))}
          </article>
        ))}
      </section>
    </main>
  );
}

function AdminPanel({ trips }: { trips: TripPlan[] }) {
  const totalActivities = trips.reduce(
    (sum, trip) => sum + trip.days.reduce((daySum, day) => daySum + day.activities.length, 0),
    0,
  );

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Administrativo</p>
          <h1>Observabilidade local</h1>
          <p>Indicadores do produto enquanto as integracoes reais nao estao conectadas.</p>
        </div>
      </header>
      <section className="metric-grid">
        <Metric label="Viagens" value={String(trips.length)} />
        <Metric label="Atividades" value={String(totalActivities)} />
        <Metric label="Custo de IA" value="Simulado" />
        <Metric label="Status APIs" value="Mock local" />
      </section>
      <Panel title="Feature flags">
        <ul className="clean-list">
          <li>Exportacao PDF premium ativa</li>
          <li>Compartilhamento por link ativo</li>
          <li>Geracao real via OpenAI pendente de chave</li>
          <li>Banco de dados desativado neste build</li>
        </ul>
      </Panel>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="panel">
      <h2>{title}</h2>
      {children}
    </article>
  );
}
