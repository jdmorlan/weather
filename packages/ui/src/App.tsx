import { useState } from "react";
import type { DayNumber } from "./types/outlook";
import { useOutlookData, useHazardData } from "./hooks/useOutlookData";
import { useTempestData } from "./hooks/useTempestData";
import { WeatherMap } from "./components/WeatherMap";
import { DaySelector } from "./components/DaySelector";
import { Legend } from "./components/Legend";
import { OutlookInfo } from "./components/OutlookInfo";
import { Sidebar, type Page } from "./components/Sidebar";
import { CurrentWeather } from "./components/CurrentWeather";
import { Forecast } from "./components/Forecast";
import { OutlookBanner } from "./components/OutlookBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  const [page, setPage] = useState<Page>("weather");
  const [day, setDay] = useState<DayNumber>(1);
  const outlook1 = useOutlookData(1);
  const outlook2 = useOutlookData(2);
  const outlook3 = useOutlookData(3);
  const hazard1 = useHazardData(1);
  const hazard2 = useHazardData(2);
  const outlooks = { 1: outlook1, 2: outlook2, 3: outlook3 } as const;
  const { data, loading, error } = outlooks[day];
  const tempest = useTempestData();

  return (
    <div className="app">
      <Sidebar active={page} onChange={setPage} />
      <div className="app-content">
        <header className="app-header">
          <h1>Weather</h1>
          {page === "outlook" && (
            <div className="header-controls">
              <DaySelector selected={day} onChange={setDay} />
              <OutlookInfo data={data} loading={loading} error={error} />
            </div>
          )}
        </header>
        <main className="app-main">
          {page === "outlook" ? (
            <>
              <WeatherMap outlookData={data} day={day} />
              <Legend data={data} />
            </>
          ) : (
            <div className="weather-page">
              <ErrorBoundary>
                <OutlookBanner
                  outlookByDay={[outlook1.data, outlook2.data]}
                  hazardByDay={[hazard1, hazard2]}
                  onNavigate={() => setPage("outlook")}
                />
              </ErrorBoundary>
              {tempest.loading && !tempest.data ? (
                <div className="weather-loading">Loading station data...</div>
              ) : tempest.error && !tempest.data ? (
                <div className="weather-error-card">
                  <div className="weather-error-message">
                    Unable to load station data
                  </div>
                  <div className="weather-error-detail">{tempest.error}</div>
                  <button
                    className="weather-error-retry"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : tempest.data ? (
                <>
                  <ErrorBoundary>
                    <CurrentWeather
                      conditions={tempest.data.current_conditions}
                    />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <Forecast
                      daily={tempest.data.forecast.daily}
                      hourly={tempest.data.forecast.hourly}
                    />
                  </ErrorBoundary>
                </>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
