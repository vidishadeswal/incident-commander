export type IncidentStatus =
  | "open"
  | "investigating"
  | "mitigated"
  | "resolved";

export type IncidentSeverity = "sev1" | "sev2" | "sev3" | "sev4";

export type Incident = {
  id: number;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  service: string;
  source: string;
  impact_summary: string;
  confidence_score: number;
  started_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TimelineEntry = {
  timestamp: string;
  summary: string;
  detail: string;
  category: string;
  confidence: number;
  metadata_json: Record<string, unknown>;
};

export type TimelineResponse = {
  incident: Incident;
  entries: TimelineEntry[];
};

export type Hypothesis = {
  summary: string;
  confidence: number;
  evidence: string[];
  next_checks: string[];
};

export type AnalysisResponse = {
  summary: string;
  impacted_services: string[];
  hypotheses: Hypothesis[];
  internal_update: string;
};

export type StatusDraftResponse = {
  audience: string;
  content: string;
  confidence: number;
};

export type PostmortemResponse = {
  content: string;
  confidence: number;
};
