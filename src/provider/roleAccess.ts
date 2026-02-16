/**
 * Role → Module access map
 * Used by ProviderLayout, DoctorLayout, and DemoControls
 * to dynamically show/hide sidebar modules based on the current staff role.
 */

import type { StaffRole } from './types';

/* ═══════════════════════════════════════════════
   PROVIDER PORTAL — Module keys match route slugs
   ═══════════════════════════════════════════════ */

export const PROVIDER_MODULE_KEYS = [
    'dashboard', 'queue', 'teleconsult-queue', 'scheduling',
    'nursing', 'lab-imaging', 'pharmacy',
    'records',
    'billing', 'hr', 'facility',
    'users', 'communications', 'events', 'analytics', 'forms', 'integrations', 'architecture',
    'homecare',
] as const;

export type ProviderModuleKey = typeof PROVIDER_MODULE_KEYS[number];

export const PROVIDER_ROLE_ACCESS: Record<StaffRole, ProviderModuleKey[]> = {
    super_admin:   [...PROVIDER_MODULE_KEYS],  // Full access + can switch branches
    admin:         [...PROVIDER_MODULE_KEYS],  // Full access
    doctor:        ['dashboard', 'queue', 'teleconsult-queue', 'scheduling', 'nursing', 'lab-imaging', 'records', 'homecare', 'communications'],
    nurse:         ['dashboard', 'queue', 'scheduling', 'nursing', 'lab-imaging', 'records', 'homecare', 'communications'],
    lab_tech:      ['dashboard', 'lab-imaging', 'records', 'communications'],
    pharmacist:    ['dashboard', 'pharmacy', 'records', 'communications'],
    billing_staff: ['dashboard', 'billing', 'records', 'communications', 'forms'],
    front_desk:    ['dashboard', 'queue', 'teleconsult-queue', 'scheduling', 'records', 'homecare', 'communications', 'forms'],
    hr:            ['dashboard', 'hr', 'scheduling', 'communications', 'forms'],
    imaging_tech:  ['dashboard', 'lab-imaging', 'records', 'communications'],
};

/** Check if a provider route slug is allowed for a given role */
export function isProviderModuleAllowed(role: StaffRole, moduleKey: string): boolean {
    const allowed = PROVIDER_ROLE_ACCESS[role] ?? [];
    return allowed.includes(moduleKey as ProviderModuleKey);
}

/** Extract the route slug from a provider path like "/provider/queue" → "queue" */
export function providerRouteSlug(path: string): string {
    return path.replace('/provider/', '').replace('/provider', 'dashboard');
}


/* ═══════════════════════════════════════════════
   DOCTOR APP — Module keys match route slugs
   ═══════════════════════════════════════════════ */

export const DOCTOR_MODULE_KEYS = [
    'dashboard', 'schedule',
    'queue', 'teleconsult',
    'encounter', 'results', 'prescriptions',
    'care-plans', 'messages', 'tasks', 'immunizations', 'loa', 'cdss',
] as const;

export type DoctorModuleKey = typeof DOCTOR_MODULE_KEYS[number];

export const DOCTOR_ROLE_ACCESS: Record<string, DoctorModuleKey[]> = {
    // Doctor — full clinical access
    doctor:     [...DOCTOR_MODULE_KEYS],
    // Staff Nurse — clinical assist, triage, vitals, immunizations, care plans, encounters
    nurse:      ['dashboard', 'schedule', 'queue', 'encounter', 'results', 'prescriptions', 'care-plans', 'tasks', 'immunizations', 'messages'],
    // Receptionist — queue, schedule, messages
    front_desk: ['dashboard', 'schedule', 'queue', 'messages', 'tasks'],
};

/** Check if a doctor route slug is allowed for a given role */
export function isDoctorModuleAllowed(role: string, moduleKey: string): boolean {
    const allowed = DOCTOR_ROLE_ACCESS[role] ?? DOCTOR_ROLE_ACCESS['doctor'] ?? [];
    return allowed.includes(moduleKey as DoctorModuleKey);
}

/** Extract route slug from a doctor path like "/doctor/queue" → "queue" */
export function doctorRouteSlug(path: string): string {
    const slug = path.replace('/doctor/', '').replace('/doctor', 'dashboard');
    return slug || 'dashboard';
}
