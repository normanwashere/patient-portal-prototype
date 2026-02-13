export interface TenantColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
}

// V8: Visit Feature Flags
export interface VisitFeatures {
  teleconsultEnabled: boolean;
  teleconsultNowEnabled: boolean;    // Consult Now (immediate/on-demand)
  teleconsultLaterEnabled: boolean;  // Consult Later (scheduled)

  clinicVisitEnabled: boolean;
  clinicF2fSchedulingEnabled: boolean;
  clinicLabFulfillmentEnabled: boolean;
}

export interface TenantFeatures {
  sso: boolean;
  loa: boolean;
  queue: boolean;
  appointments: boolean;

  // V11: Insurance / Coverage integration flags
  hmo?: boolean;            // HMO card integration (benefits, LOA requests, claims)
  philHealth?: boolean;     // PhilHealth integration (Konsulta, member profile, UHC)

  // V9: Facility capabilities
  multiLocation?: boolean;  // Has multiple branches/facilities
  admissions?: boolean;     // Can admit patients (hospital/lying-in)

  // V10: Clinical intelligence flags
  cdss?: boolean;           // Clinical Decision Support System (drug checks, alerts, guidelines)
  aiAssistant?: boolean;    // AI-powered features (transcriber, SOAP generation, smart suggestions)

  // V8: Granular visit configuration
  visits: VisitFeatures;
}

export interface TenantConfig {
  id: string;
  name: string;
  tagline?: string;         // Optional facility description
  logoUrl: string;
  loginBackgroundUrl?: string;
  colors: TenantColors;
  features: TenantFeatures;
}

// V8: Helper to check if any visit type is enabled
export const hasAnyVisitEnabled = (features: TenantFeatures): boolean => {
  const { visits } = features;
  return visits.teleconsultEnabled || visits.clinicVisitEnabled;
};

// V8: Helper to get available teleconsult modes
export const getTeleconsultModes = (features: TenantFeatures): ('now' | 'later')[] => {
  const modes: ('now' | 'later')[] = [];
  if (features.visits.teleconsultEnabled) {
    if (features.visits.teleconsultNowEnabled) modes.push('now');
    if (features.visits.teleconsultLaterEnabled) modes.push('later');
  }
  return modes;
};
