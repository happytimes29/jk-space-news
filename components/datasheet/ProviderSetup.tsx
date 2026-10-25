import type { ProviderConfiguration, WorkbenchState } from "./workbench-state";

export interface ProviderSetupCopy {
  title: string;
  disclosure: string;
  disclosureDetail: string;
  provider: string;
  model: string;
  baseUrl: string;
  apiKey: string;
  test: string;
  connected: string;
}

export function ProviderSetup({ copy, configuration, connection, disabled, onChange, onTest }: {
  copy: ProviderSetupCopy;
  configuration: ProviderConfiguration;
  connection: WorkbenchState["providerConnection"];
  disabled: boolean;
  onChange: (configuration: ProviderConfiguration) => void;
  onTest: () => void;
}) {
  const update = (change: Partial<ProviderConfiguration>) => onChange({ ...configuration, ...change });
  return (
    <section className="datasheet-provider-panel" aria-labelledby="datasheet-provider-title">
      <h2 id="datasheet-provider-title">{copy.title}</h2>
      <p className="datasheet-disclosure">{copy.disclosure}</p>
      <p>{copy.disclosureDetail}</p>
      <div className="datasheet-form-grid">
        <label>{copy.provider}
          <select value={configuration.kind} disabled={disabled} onChange={(event) => update({ kind: event.target.value as ProviderConfiguration["kind"], baseUrl: "" })}>
            <option value="openai-compatible">OpenAI-compatible</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </label>
        <label>{copy.model}<input value={configuration.model} disabled={disabled} onChange={(event) => update({ model: event.target.value })} /></label>
        {configuration.kind === "openai-compatible" && <label>{copy.baseUrl}<input type="url" placeholder="https://api.openai.com/v1" value={configuration.baseUrl} disabled={disabled} onChange={(event) => update({ baseUrl: event.target.value })} /></label>}
        <label>{copy.apiKey}<input type="password" autoComplete="off" value={configuration.apiKey} disabled={disabled} onChange={(event) => update({ apiKey: event.target.value })} /></label>
      </div>
      <div className="datasheet-provider-actions">
        <button type="button" onClick={onTest} disabled={disabled || !configuration.model.trim() || !configuration.apiKey.trim()}>{copy.test}</button>
        {connection === "connected" && <span role="status">{copy.connected}</span>}
      </div>
    </section>
  );
}

