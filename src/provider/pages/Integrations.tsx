import { useState, useCallback } from 'react';
import {
  Link2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Settings,
  FileText,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Server,
  Database,
  CreditCard,
  Microscope,
  ScanLine,
  Image,
  Briefcase,
  Wifi,
  WifiOff,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Play,
  BarChart3,
  MonitorUp,
  X,
  Loader2,
  Check,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';


/* ───────── inline styles ───────── */
const S: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%', minWidth: 0, overflow: 'hidden' as const },
  header: { marginBottom: 28 },
  title: { fontSize: 26, fontWeight: 700, color: 'var(--color-text)', margin: 0 },
  subtitle: { fontSize: 14, color: 'var(--color-text-muted)', marginTop: 6 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 28 },
  statCard: {
    background: 'var(--color-surface)', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,.06)', border: '1px solid var(--color-border)',
    display: 'flex', alignItems: 'center', gap: 16,
  },
  statIcon: {
    width: 48, height: 48, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statValue: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 },
  statLabel: { fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 },
  tabs: {
    display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)',
    marginBottom: 24, paddingBottom: 0, overflowX: 'auto' as const,
    WebkitOverflowScrolling: 'touch' as any,
  },
  tab: {
    padding: '12px 20px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-muted)',
    background: 'transparent', borderWidth: 0, borderStyle: 'none' as const, cursor: 'pointer',
    borderBottomWidth: 2, borderBottomStyle: 'solid' as const, borderBottomColor: 'transparent', marginBottom: -1,
    borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 8,
    whiteSpace: 'nowrap' as const, flexShrink: 0,
  },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 32 },
  card: {
    background: 'var(--color-surface)', borderRadius: 12, padding: 0,
    boxShadow: '0 1px 3px rgba(0,0,0,.06)', border: '1px solid var(--color-border)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 0 20px',
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardName: { fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: 0, lineHeight: 1.3 },
  cardProtocol: { fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2, fontWeight: 500 },
  cardBody: { padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, flexWrap: 'wrap' as const, gap: 4 },
  cardLabel: { color: 'var(--color-text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  cardVal: { color: 'var(--color-text)', fontWeight: 600, minWidth: 0, wordBreak: 'break-word' as const },
  cardEndpoint: {
    background: 'var(--color-background)', borderRadius: 6, padding: '8px 12px',
    fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-muted)',
    wordBreak: 'break-all' as const, overflowWrap: 'anywhere' as const, minWidth: 0,
  },
  cardFooter: {
    display: 'flex', gap: 8, padding: '14px 20px', borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background)', flexWrap: 'wrap' as const,
  },
  btn: {
    padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: 'none', display: 'inline-flex',
    alignItems: 'center', gap: 5, transition: 'opacity .15s',
  },
  btnPrimary: { background: 'var(--color-primary)', color: '#fff' },
  btnOutline: { background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 },
  section: {
    background: 'var(--color-surface)', borderRadius: 12, padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,.06)', border: '1px solid var(--color-border)',
    marginBottom: 28, minWidth: 0, overflow: 'hidden' as const,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0,
    marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10,
  },
  sectionSubtitle: { fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    padding: '12px 14px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700,
    color: 'var(--color-text-muted)', background: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)', textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
  },
  td: {
    padding: '12px 14px', fontSize: 13, color: 'var(--color-text)',
    borderBottom: '1px solid var(--color-border)',
  },
  mono: { fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)', wordBreak: 'break-all' as const, overflowWrap: 'anywhere' as const },
  dirBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px',
    borderRadius: 4, fontSize: 11, fontWeight: 600,
  },
  toolbar: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const, alignItems: 'center' },
  searchWrap: { position: 'relative' as const, flex: 1, minWidth: 0 },
  searchIcon: { position: 'absolute' as const, left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' },
  searchInput: {
    width: '100%', padding: '10px 14px 10px 38px', border: '1px solid var(--color-border)',
    borderRadius: 8, fontSize: 14, background: 'var(--color-surface)',
    color: 'var(--color-text)', boxSizing: 'border-box' as const,
  },
  /* ── Modal styles ── */
  overlay: {
    position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.45)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'var(--color-surface)', borderRadius: 16, width: '100%', maxWidth: 560,
    maxHeight: '85vh', display: 'flex', flexDirection: 'column' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '18px 24px', borderBottom: '1px solid var(--color-border)',
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 },
  modalClose: {
    width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--color-background)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-text-muted)',
  },
  modalBody: { padding: 24, overflowY: 'auto' as const, flex: 1 },
  modalFooter: {
    padding: '14px 24px', borderTop: '1px solid var(--color-border)',
    display: 'flex', justifyContent: 'flex-end', gap: 10,
  },
  formGroup: { marginBottom: 16 },
  formLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 },
  formInput: {
    width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)',
    borderRadius: 8, fontSize: 14, background: 'var(--color-background)',
    color: 'var(--color-text)', boxSizing: 'border-box' as const,
  },
  formSelect: {
    width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)',
    borderRadius: 8, fontSize: 14, background: 'var(--color-background)',
    color: 'var(--color-text)', boxSizing: 'border-box' as const,
  },
  toggle: {
    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
  },
  toggleTrack: {
    width: 44, height: 24, borderRadius: 12, padding: 2, transition: 'background 0.2s',
    display: 'flex', alignItems: 'center',
  },
  toggleKnob: {
    width: 20, height: 20, borderRadius: 10, background: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'transform 0.2s',
  },
  logEntry: {
    padding: '8px 12px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace',
    background: 'var(--color-background)', marginBottom: 6, lineHeight: 1.6,
    border: '1px solid var(--color-border)', color: 'var(--color-text)',
    wordBreak: 'break-all' as const, overflowWrap: 'anywhere' as const,
  },
  logTime: { color: 'var(--color-text-muted)', marginRight: 8 },
  logLevel: { fontWeight: 700, marginRight: 8 },
  jsonBlock: {
    background: '#1e293b', color: '#e2e8f0', padding: 16, borderRadius: 10,
    fontSize: 12, fontFamily: 'monospace', overflow: 'auto', maxHeight: 340,
    lineHeight: 1.7, whiteSpace: 'pre' as const,
  },
  testResult: {
    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11,
    fontWeight: 700, padding: '4px 10px', borderRadius: 6,
  },
  spinAnim: { animation: 'spin 1s linear infinite' },
};

/* ───────── status config ───────── */
type IntegrationStatus = 'Active' | 'Pending' | 'Error' | 'Not Configured';

const STATUS_CONFIG: Record<IntegrationStatus, { bg: string; color: string; icon: typeof CheckCircle2 }> = {
  Active: { bg: 'var(--color-success-light)', color: '#065f46', icon: CheckCircle2 },
  Pending: { bg: 'var(--color-warning-light)', color: '#92400e', icon: Clock },
  Error: { bg: 'var(--color-error-light)', color: '#991b1b', icon: XCircle },
  'Not Configured': { bg: '#f3f4f6', color: '#6b7280', icon: WifiOff },
};

/* ───────── integration data ───────── */
type TabId = 'all' | 'clinical' | 'financial' | 'interop';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof Server;
  iconBg: string;
  iconColor: string;
  status: IntegrationStatus;
  protocol: string;
  lastSync: string;
  messageVolume: string;
  endpoint: string;
  authMethod: string;
  category: 'clinical' | 'financial' | 'interop';
  version?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'lis',
    name: 'Laboratory Information System',
    description: 'Bidirectional order/result flow with HL7 v2.x ORM/ORU messaging',
    icon: Microscope,
    iconBg: 'var(--color-info-light)',
    iconColor: 'var(--color-info-dark)',
    status: 'Active',
    protocol: 'HL7 v2.5.1',
    lastSync: '2026-02-13 08:42:15',
    messageVolume: '1,247 messages today',
    endpoint: 'mllp://lis.hospital.local:2575',
    authMethod: 'TLS + Certificate',
    category: 'clinical',
    version: 'v2.5.1 ORM/ORU',
  },
  {
    id: 'ris',
    name: 'Radiology Information System',
    description: 'DICOM worklist management & order routing',
    icon: ScanLine,
    iconBg: 'var(--color-indigo-light)',
    iconColor: 'var(--color-indigo)',
    status: 'Active',
    protocol: 'DICOM / HL7 v2',
    lastSync: '2026-02-13 08:40:03',
    messageVolume: '486 orders today',
    endpoint: 'dicom://ris.hospital.local:4242',
    authMethod: 'AE Title + TLS',
    category: 'clinical',
    version: 'DICOM 3.0 MWL',
  },
  {
    id: 'pacs',
    name: 'Picture Archiving & Communication',
    description: 'DICOM image storage, retrieval & viewer integration',
    icon: Image,
    iconBg: 'var(--color-pink-light)',
    iconColor: '#be185d',
    status: 'Active',
    protocol: 'DICOM / DICOMweb',
    lastSync: '2026-02-13 08:43:01',
    messageVolume: '3,892 images today',
    endpoint: 'https://pacs.hospital.local/wado-rs',
    authMethod: 'OAuth 2.0 + TLS',
    category: 'clinical',
    version: 'WADO-RS / STOW-RS',
  },
  {
    id: 'erp-oracle',
    name: 'ERP - Oracle Financials',
    description: 'Financial ledger, accounts payable/receivable, billing integration',
    icon: Briefcase,
    iconBg: 'var(--color-warning-light)',
    iconColor: 'var(--color-warning-dark)',
    status: 'Active',
    protocol: 'REST API / SOAP',
    lastSync: '2026-02-13 07:30:00',
    messageVolume: '892 transactions today',
    endpoint: 'https://erp.hospital.local/api/v2/finance',
    authMethod: 'OAuth 2.0 + API Key',
    category: 'financial',
    version: 'Oracle Cloud R13',
  },
  {
    id: 'erp-sap',
    name: 'ERP - SAP (Inventory & HR)',
    description: 'Supply chain, pharmacy inventory, HR & payroll modules',
    icon: Database,
    iconBg: 'var(--color-info-light)',
    iconColor: '#0284c7',
    status: 'Pending',
    protocol: 'SAP RFC / OData',
    lastSync: 'Pending configuration',
    messageVolume: '—',
    endpoint: 'https://sap.hospital.local/odata/v4',
    authMethod: 'SAP Logon Ticket',
    category: 'financial',
    version: 'S/4HANA 2023',
  },
  {
    id: 'gcash',
    name: 'GCash Payment Gateway',
    description: 'Mobile wallet payments for patient billing & co-pays',
    icon: CreditCard,
    iconBg: 'var(--color-info-light)',
    iconColor: 'var(--color-info-dark)',
    status: 'Active',
    protocol: 'REST API',
    lastSync: '2026-02-13 08:44:30',
    messageVolume: '1,034 payments today',
    endpoint: 'https://api.gcash.com/v1/payments',
    authMethod: 'HMAC-SHA256 + API Key',
    category: 'financial',
    version: 'API v1.4',
  },
  {
    id: 'maya',
    name: 'Maya Payment Gateway',
    description: 'Digital payment processing for e-wallet & QR transactions',
    icon: CreditCard,
    iconBg: 'var(--color-success-light)',
    iconColor: 'var(--color-success-dark)',
    status: 'Active',
    protocol: 'REST API',
    lastSync: '2026-02-13 08:44:12',
    messageVolume: '678 payments today',
    endpoint: 'https://pg.maya.ph/payments/v1',
    authMethod: 'Basic Auth + HMAC',
    category: 'financial',
    version: 'API v1.2',
  },
  {
    id: 'cc-gateway',
    name: 'Credit Card Processor',
    description: 'Visa, Mastercard, AMEX processing with 3D Secure',
    icon: CreditCard,
    iconBg: 'var(--color-warning-light)',
    iconColor: '#b45309',
    status: 'Active',
    protocol: 'PCI-DSS REST API',
    lastSync: '2026-02-13 08:43:55',
    messageVolume: '312 transactions today',
    endpoint: 'https://gateway.hospital.local/api/v1/charge',
    authMethod: 'PCI Token + mTLS',
    category: 'financial',
    version: 'PCI DSS v4.0',
  },
  {
    id: 'insurance',
    name: 'Insurance Claims Engine',
    description: 'PhilHealth, HMO & private insurance claims submission',
    icon: Shield,
    iconBg: 'var(--color-purple-light)',
    iconColor: 'var(--color-purple-dark)',
    status: 'Active',
    protocol: 'REST API / EDI X12',
    lastSync: '2026-02-13 08:30:00',
    messageVolume: '156 claims today',
    endpoint: 'https://claims.hospital.local/api/v1',
    authMethod: 'OAuth 2.0 + JWT',
    category: 'financial',
    version: 'EDI 837/835',
  },
  {
    id: 'fhir',
    name: 'FHIR R4 API Gateway',
    description: 'HL7 FHIR R4 RESTful API for interoperability',
    icon: Globe,
    iconBg: '#dcfce7',
    iconColor: 'var(--color-success-dark)',
    status: 'Active',
    protocol: 'FHIR R4 (REST)',
    lastSync: '2026-02-13 08:44:45',
    messageVolume: '2,891 API calls today',
    endpoint: 'https://fhir.hospital.local/fhir/R4',
    authMethod: 'SMART on FHIR + OAuth 2.0',
    category: 'interop',
    version: 'FHIR R4 4.0.1',
  },
  {
    id: 'hl7-engine',
    name: 'HL7 v2 Interface Engine',
    description: 'ADT, ORM, ORU, SIU message routing & transformation',
    icon: Server,
    iconBg: 'var(--color-purple-light)',
    iconColor: 'var(--color-purple-dark)',
    status: 'Pending',
    protocol: 'HL7 v2.x MLLP',
    lastSync: 'Awaiting go-live',
    messageVolume: '—',
    endpoint: 'mllp://engine.hospital.local:2576',
    authMethod: 'TLS + IP Whitelist',
    category: 'interop',
    version: 'Rhapsody 7.2',
  },
  {
    id: 'hie',
    name: 'Health Information Exchange',
    description: 'Regional HIE document sharing via XDS.b / IHE profiles',
    icon: MonitorUp,
    iconBg: 'var(--color-error-light)',
    iconColor: 'var(--color-error-dark)',
    status: 'Error',
    protocol: 'IHE XDS.b / XCA',
    lastSync: '2026-02-13 06:15:00 (failed)',
    messageVolume: '42 documents (errors)',
    endpoint: 'https://hie.region.gov.ph/xds/registry',
    authMethod: 'SAML 2.0 + TLS',
    category: 'interop',
    version: 'IHE ITI-41/43',
  },
];

/* ───────── FHIR resources ───────── */
const FHIR_RESOURCES = [
  { resource: 'Patient', endpoint: '/fhir/Patient', operations: 'CRUD + Search', status: 'Active' },
  { resource: 'Observation', endpoint: '/fhir/Observation', operations: 'CRUD + Search', status: 'Active' },
  { resource: 'MedicationRequest', endpoint: '/fhir/MedicationRequest', operations: 'CRUD', status: 'Active' },
  { resource: 'Encounter', endpoint: '/fhir/Encounter', operations: 'CRUD + Search', status: 'Active' },
  { resource: 'DiagnosticReport', endpoint: '/fhir/DiagnosticReport', operations: 'Read + Search', status: 'Active' },
  { resource: 'Condition', endpoint: '/fhir/Condition', operations: 'CRUD', status: 'Active' },
  { resource: 'AllergyIntolerance', endpoint: '/fhir/AllergyIntolerance', operations: 'CRUD', status: 'Active' },
  { resource: 'Immunization', endpoint: '/fhir/Immunization', operations: 'CRUD', status: 'Active' },
];

/* ───────── HL7 messages ───────── */
interface HL7Message {
  id: string;
  type: string;
  event: string;
  description: string;
  timestamp: string;
  direction: 'Inbound' | 'Outbound';
  status: 'Success' | 'Failed' | 'Pending';
  source: string;
  destination: string;
}

const HL7_MESSAGES: HL7Message[] = [
  { id: 'MSG-20260213-0842', type: 'ADT', event: 'A01', description: 'Patient Admission', timestamp: '2026-02-13 08:42:15', direction: 'Inbound', status: 'Success', source: 'ADT System', destination: 'EMR' },
  { id: 'MSG-20260213-0841', type: 'ORM', event: 'O01', description: 'Lab Order Placed', timestamp: '2026-02-13 08:41:30', direction: 'Outbound', status: 'Success', source: 'EMR', destination: 'LIS' },
  { id: 'MSG-20260213-0840', type: 'ORU', event: 'R01', description: 'Lab Result', timestamp: '2026-02-13 08:40:22', direction: 'Inbound', status: 'Success', source: 'LIS', destination: 'EMR' },
  { id: 'MSG-20260213-0839', type: 'SIU', event: 'S12', description: 'Schedule Notification', timestamp: '2026-02-13 08:39:05', direction: 'Outbound', status: 'Success', source: 'EMR', destination: 'Scheduling' },
  { id: 'MSG-20260213-0838', type: 'ADT', event: 'A03', description: 'Patient Discharge', timestamp: '2026-02-13 08:38:42', direction: 'Inbound', status: 'Success', source: 'ADT System', destination: 'EMR' },
  { id: 'MSG-20260213-0837', type: 'ORU', event: 'R01', description: 'Radiology Result', timestamp: '2026-02-13 08:37:18', direction: 'Inbound', status: 'Failed', source: 'RIS', destination: 'EMR' },
  { id: 'MSG-20260213-0836', type: 'ORM', event: 'O01', description: 'Imaging Order', timestamp: '2026-02-13 08:36:55', direction: 'Outbound', status: 'Success', source: 'EMR', destination: 'RIS' },
  { id: 'MSG-20260213-0835', type: 'ADT', event: 'A08', description: 'Patient Update', timestamp: '2026-02-13 08:35:10', direction: 'Inbound', status: 'Success', source: 'Registration', destination: 'EMR' },
  { id: 'MSG-20260213-0834', type: 'SIU', event: 'S14', description: 'Appointment Modification', timestamp: '2026-02-13 08:34:22', direction: 'Outbound', status: 'Pending', source: 'EMR', destination: 'Scheduling' },
  { id: 'MSG-20260213-0833', type: 'ORM', event: 'O01', description: 'Pharmacy Order', timestamp: '2026-02-13 08:33:00', direction: 'Outbound', status: 'Success', source: 'EMR', destination: 'Pharmacy' },
];

/* ───────── Mock log generators ───────── */
const generateLogs = (intg: Integration) => {
  const times = ['08:44:32', '08:42:15', '08:40:01', '08:38:22', '08:35:10', '08:30:00', '08:25:44', '08:20:18', '08:15:03', '08:10:55'];
  const levels = ['INFO', 'INFO', 'INFO', 'DEBUG', 'INFO', 'WARN', 'INFO', 'INFO', 'DEBUG', 'ERROR'];
  const msgs = [
    `Connection established to ${intg.endpoint}`,
    `${intg.protocol} handshake completed — auth: ${intg.authMethod}`,
    `Sync batch processed: 42 records in 1.2s`,
    `Polling interval: 30s — next sync at ${intg.lastSync}`,
    `Health check OK — latency 12ms`,
    `Retry attempt 1/3 — timeout after 5000ms`,
    `Message queue depth: 0 — all messages delivered`,
    `TLS certificate valid — expires 2027-03-15`,
    `Cache refreshed — 128 entries loaded`,
    intg.status === 'Error' ? `ERROR: Connection refused at ${intg.endpoint} — ECONNREFUSED` : `Heartbeat received — system nominal`,
  ];
  return times.map((t, i) => ({ time: `2026-02-13 ${t}`, level: levels[i], message: msgs[i] }));
};

const FHIR_MOCK_JSON: Record<string, string> = {
  Patient: `{
  "resourceType": "Patient",
  "id": "pat-001",
  "active": true,
  "name": [{ "use": "official", "family": "Dela Cruz", "given": ["Juan", "A."] }],
  "gender": "male",
  "birthDate": "1988-06-15",
  "telecom": [{ "system": "phone", "value": "+63-917-555-1001" }],
  "address": [{ "city": "Manila", "country": "PH" }]
}`,
  Observation: `{
  "resourceType": "Observation",
  "id": "obs-cbc-001",
  "status": "final",
  "code": { "coding": [{ "system": "http://loinc.org", "code": "58410-2", "display": "CBC panel" }] },
  "subject": { "reference": "Patient/pat-001" },
  "effectiveDateTime": "2026-02-13T08:30:00+08:00",
  "valueQuantity": { "value": 5.2, "unit": "10*3/uL" }
}`,
  MedicationRequest: `{
  "resourceType": "MedicationRequest",
  "id": "medrq-001",
  "status": "active",
  "intent": "order",
  "medicationCodeableConcept": { "text": "Losartan 50mg" },
  "subject": { "reference": "Patient/pat-001" },
  "dosageInstruction": [{ "text": "Take 1 tablet by mouth once daily" }]
}`,
  Encounter: `{
  "resourceType": "Encounter",
  "id": "enc-001",
  "status": "finished",
  "class": { "code": "AMB", "display": "ambulatory" },
  "subject": { "reference": "Patient/pat-001" },
  "period": { "start": "2026-02-13T09:00:00+08:00", "end": "2026-02-13T09:30:00+08:00" }
}`,
  DiagnosticReport: `{
  "resourceType": "DiagnosticReport",
  "id": "dr-001",
  "status": "final",
  "code": { "text": "Complete Blood Count" },
  "subject": { "reference": "Patient/pat-001" },
  "conclusion": "All values within normal limits."
}`,
  Condition: `{
  "resourceType": "Condition",
  "id": "cond-001",
  "clinicalStatus": { "coding": [{ "code": "active" }] },
  "code": { "coding": [{ "system": "http://hl7.org/fhir/sid/icd-10", "code": "I10", "display": "Essential Hypertension" }] },
  "subject": { "reference": "Patient/pat-001" }
}`,
  AllergyIntolerance: `{
  "resourceType": "AllergyIntolerance",
  "id": "allergy-001",
  "clinicalStatus": { "coding": [{ "code": "active" }] },
  "code": { "coding": [{ "display": "Penicillin" }] },
  "patient": { "reference": "Patient/pat-001" },
  "reaction": [{ "manifestation": [{ "text": "Urticaria" }], "severity": "moderate" }]
}`,
  Immunization: `{
  "resourceType": "Immunization",
  "id": "imm-001",
  "status": "completed",
  "vaccineCode": { "text": "COVID-19 (Pfizer-BioNTech)" },
  "patient": { "reference": "Patient/pat-001" },
  "occurrenceDateTime": "2021-05-10"
}`,
};

const EXTRA_HL7: HL7Message[] = [
  { id: 'MSG-20260213-0845', type: 'ADT', event: 'A04', description: 'Patient Registration', timestamp: '2026-02-13 08:45:02', direction: 'Inbound', status: 'Success', source: 'Registration', destination: 'EMR' },
  { id: 'MSG-20260213-0846', type: 'ORM', event: 'O01', description: 'Stat CBC Order', timestamp: '2026-02-13 08:46:18', direction: 'Outbound', status: 'Success', source: 'EMR', destination: 'LIS' },
];

/* ───────── helper ───────── */
const StatusBadge = ({ status }: { status: IntegrationStatus }) => {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span style={{ ...S.badge, background: cfg.bg, color: cfg.color }}>
      <Icon size={13} /> {status}
    </span>
  );
};

const MsgStatusBadge = ({ status }: { status: 'Success' | 'Failed' | 'Pending' }) => {
  const map = {
    Success: { bg: 'var(--color-success-light)', color: '#065f46' },
    Failed: { bg: 'var(--color-error-light)', color: '#991b1b' },
    Pending: { bg: 'var(--color-warning-light)', color: '#92400e' },
  };
  const c = map[status];
  return <span style={{ ...S.badge, background: c.bg, color: c.color, fontSize: 11 }}>{status}</span>;
};

const DirectionBadge = ({ direction }: { direction: 'Inbound' | 'Outbound' }) => {
  const isIn = direction === 'Inbound';
  return (
    <span style={{ ...S.dirBadge, background: isIn ? 'var(--color-info-light)' : 'var(--color-pink-light)', color: isIn ? '#1d4ed8' : '#be185d' }}>
      {isIn ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />} {direction}
    </span>
  );
};

/* ─────────────────────────────── component ─────────────────────────────── */

export const Integrations = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [search, setSearch] = useState('');
  const [hl7Search, setHl7Search] = useState('');

  /* ── Interactive state ── */
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error'>>({});
  const [logsIntegration, setLogsIntegration] = useState<Integration | null>(null);
  const [configIntegration, setConfigIntegration] = useState<Integration | null>(null);
  const [exploreFhir, setExploreFhir] = useState<string | null>(null);
  const [hl7Refreshing, setHl7Refreshing] = useState(false);
  const [hl7Messages, setHl7Messages] = useState<HL7Message[]>(HL7_MESSAGES);
  const [hl7ExtraIdx, setHl7ExtraIdx] = useState(0);

  /* Config form state */
  const [cfgEndpoint, setCfgEndpoint] = useState('');
  const [cfgAuth, setCfgAuth] = useState('');
  const [cfgPollInterval, setCfgPollInterval] = useState('30');
  const [cfgRetryCount, setCfgRetryCount] = useState('3');
  const [cfgEnabled, setCfgEnabled] = useState(true);

  /* ── Test Connection handler ── */
  const handleTestConnection = useCallback((intg: Integration) => {
    if (testingId) return;
    setTestingId(intg.id);
    // Clear previous result for this integration
    setTestResults(prev => { const n = { ...prev }; delete n[intg.id]; return n; });
    const delay = 1500 + Math.random() * 1000;
    setTimeout(() => {
      const result = intg.status === 'Error' ? 'error' : 'success';
      setTestResults(prev => ({ ...prev, [intg.id]: result }));
      setTestingId(null);
      // Auto-clear after 3s
      setTimeout(() => setTestResults(prev => { const n = { ...prev }; delete n[intg.id]; return n; }), 3000);
    }, delay);
  }, [testingId]);

  /* ── Open Configure modal ── */
  const handleOpenConfig = useCallback((intg: Integration) => {
    setCfgEndpoint(intg.endpoint);
    setCfgAuth(intg.authMethod);
    setCfgPollInterval('30');
    setCfgRetryCount('3');
    setCfgEnabled(intg.status !== 'Not Configured');
    setConfigIntegration(intg);
  }, []);

  const handleSaveConfig = useCallback(() => {
    showToast(`Configuration saved for ${configIntegration?.name}`, 'success');
    setConfigIntegration(null);
  }, [configIntegration, showToast]);

  /* ── HL7 Refresh handler ── */
  const handleHl7Refresh = useCallback(() => {
    setHl7Refreshing(true);
    setTimeout(() => {
      if (hl7ExtraIdx < EXTRA_HL7.length) {
        const newMsg = EXTRA_HL7[hl7ExtraIdx];
        setHl7Messages(prev => [newMsg, ...prev]);
        setHl7ExtraIdx(prev => prev + 1);
      } else {
        // Generate a dynamic new message
        const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
        const newMsg: HL7Message = {
          id: `MSG-${Date.now()}`, type: 'ORU', event: 'R01',
          description: 'Lab Result Update', timestamp: `2026-02-13 ${ts}`,
          direction: 'Inbound', status: 'Success', source: 'LIS', destination: 'EMR',
        };
        setHl7Messages(prev => [newMsg, ...prev]);
      }
      setHl7Refreshing(false);
      showToast('Message feed refreshed', 'success');
    }, 800);
  }, [hl7ExtraIdx, showToast]);

  const tabs: { id: TabId; label: string; icon: typeof Link2 }[] = [
    { id: 'all', label: 'All', icon: Link2 },
    { id: 'clinical', label: 'Clinical', icon: Activity },
    { id: 'financial', label: 'Financial', icon: CreditCard },
    { id: 'interop', label: 'Interoperability', icon: Globe },
  ];

  const filtered = INTEGRATIONS.filter((i) => {
    const matchesTab = activeTab === 'all' || i.category === activeTab;
    const matchesSearch =
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.protocol.toLowerCase().includes(search.toLowerCase()) ||
      i.status.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const filteredHl7 = hl7Messages.filter((m) => {
    if (!hl7Search) return true;
    const q = hl7Search.toLowerCase();
    return (
      m.type.toLowerCase().includes(q) ||
      m.event.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.source.toLowerCase().includes(q) ||
      m.destination.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
    );
  });

  const statusCounts = {
    total: INTEGRATIONS.length,
    active: INTEGRATIONS.filter((i) => i.status === 'Active').length,
    pending: INTEGRATIONS.filter((i) => i.status === 'Pending').length,
    error: INTEGRATIONS.filter((i) => i.status === 'Error').length,
  };

  const stats = [
    { label: 'Total Integrations', value: statusCounts.total, icon: Link2, bg: 'var(--color-info-light)', color: 'var(--color-info-dark)' },
    { label: 'Active', value: statusCounts.active, icon: CheckCircle2, bg: 'var(--color-success-light)', color: 'var(--color-success-dark)' },
    { label: 'Pending', value: statusCounts.pending, icon: Clock, bg: 'var(--color-warning-light)', color: 'var(--color-warning-dark)' },
    { label: 'Error', value: statusCounts.error, icon: AlertTriangle, bg: 'var(--color-error-light)', color: 'var(--color-error-dark)' },
  ];

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={S.header}>
        <h1 style={S.title}>System Integrations</h1>
        <p style={S.subtitle}>
          Manage and monitor all hospital platform integrations — clinical systems, financial gateways, and interoperability standards.
        </p>
      </div>

      {/* ── Stats Bar ── */}
      <div style={S.statsRow}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={S.statCard}>
              <div style={{ ...S.statIcon, background: s.bg }}>
                <Icon size={22} color={s.color} />
              </div>
              <div>
                <div style={S.statValue}>{s.value}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <div style={S.tabs}>
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              style={{ ...S.tab, ...(activeTab === t.id ? S.tabActive : {}) }}
              onClick={() => setActiveTab(t.id)}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Search ── */}
      <div style={S.toolbar}>
        <div style={S.searchWrap}>
          <Search size={16} style={S.searchIcon} />
          <input
            style={S.searchInput}
            placeholder="Search integrations by name, protocol, or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Integration Cards ── */}
      <div style={S.grid}>
        {filtered.map((intg) => {
          const Icon = intg.icon;
          return (
            <div key={intg.id} style={S.card}>
              {/* card header */}
              <div style={S.cardHeader}>
                <div style={{ ...S.cardIcon, background: intg.iconBg }}>
                  <Icon size={22} color={intg.iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' as const }}>
                    <h3 style={S.cardName}>{intg.name}</h3>
                    <StatusBadge status={intg.status} />
                  </div>
                  <div style={S.cardProtocol}>{intg.protocol}{intg.version ? ` • ${intg.version}` : ''}</div>
                </div>
              </div>

              {/* card body */}
              <div style={S.cardBody}>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {intg.description}
                </p>

                <div style={S.cardRow}>
                  <span style={S.cardLabel}><Clock size={13} /> Last Sync</span>
                  <span style={S.cardVal}>{intg.lastSync}</span>
                </div>
                <div style={S.cardRow}>
                  <span style={S.cardLabel}><BarChart3 size={13} /> Volume</span>
                  <span style={S.cardVal}>{intg.messageVolume}</span>
                </div>
                <div style={S.cardRow}>
                  <span style={S.cardLabel}><Shield size={13} /> Auth</span>
                  <span style={S.cardVal}>{intg.authMethod}</span>
                </div>

                <div style={S.cardEndpoint}>
                  {intg.endpoint}
                </div>
              </div>

              {/* card footer */}
              <div style={S.cardFooter}>
                {testingId === intg.id ? (
                  <button style={{ ...S.btn, ...S.btnPrimary, opacity: 0.8 }} disabled>
                    <Loader2 size={12} style={S.spinAnim} /> Testing...
                  </button>
                ) : testResults[intg.id] ? (
                  <span style={{
                    ...S.testResult,
                    background: testResults[intg.id] === 'success' ? '#dcfce7' : '#fef2f2',
                    color: testResults[intg.id] === 'success' ? '#166534' : '#991b1b',
                  }}>
                    {testResults[intg.id] === 'success' ? <Check size={12} /> : <XCircle size={12} />}
                    {testResults[intg.id] === 'success' ? 'Connected' : 'Failed'}
                  </span>
                ) : (
                  <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => handleTestConnection(intg)}>
                    <Play size={12} /> Test Connection
                  </button>
                )}
                <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setLogsIntegration(intg)}>
                  <FileText size={12} /> View Logs
                </button>
                <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => handleOpenConfig(intg)}>
                  <Settings size={12} /> Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>
          <Wifi size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 15, fontWeight: 600 }}>No integrations found</p>
          <p style={{ fontSize: 13 }}>Try adjusting your search or switching tabs.</p>
        </div>
      )}

      {/* ────────── FHIR Resource Explorer ────────── */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>
          <Globe size={20} color="var(--color-primary)" /> FHIR R4 Resource Explorer
        </h2>
        <p style={S.sectionSubtitle}>
          HL7 FHIR R4 RESTful API resources available for interoperability — base URL: <code style={S.mono}>https://fhir.hospital.local/fhir/R4</code>
        </p>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
          <table style={{ ...S.table, minWidth: 600 }}>
            <thead>
              <tr>
                <th style={S.th}>Resource</th>
                <th style={S.th}>Endpoint</th>
                <th style={S.th}>Operations</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {FHIR_RESOURCES.map((r) => (
                <tr key={r.resource}>
                  <td style={{ ...S.td, fontWeight: 600 }}>{r.resource}</td>
                  <td style={S.td}><code style={S.mono}>{r.endpoint}</code></td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, background: 'var(--color-info-light)', color: '#1d4ed8', fontSize: 11 }}>{r.operations}</span>
                  </td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, background: 'var(--color-success-light)', color: '#065f46', fontSize: 11 }}>
                      <CheckCircle2 size={12} /> {r.status}
                    </span>
                  </td>
                  <td style={S.td}>
                    <button
                      style={{ ...S.btn, ...S.btnOutline, padding: '5px 10px', fontSize: 11 }}
                      title={`Explore ${r.resource}`}
                      onClick={() => setExploreFhir(r.resource)}
                    >
                      <ChevronRight size={12} /> Explore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────── HL7 Message Monitor ────────── */}
      <div style={S.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
          <div>
            <h2 style={S.sectionTitle}>
              <Zap size={20} color="var(--color-primary)" /> HL7 v2 Message Monitor
            </h2>
            <p style={S.sectionSubtitle}>
              Real-time feed of HL7 v2.x messages processed by the interface engine — ADT, ORM, ORU, SIU message types.
            </p>
          </div>
          <button style={{ ...S.btn, ...S.btnPrimary }} onClick={handleHl7Refresh} disabled={hl7Refreshing}>
            <RefreshCw size={13} style={hl7Refreshing ? S.spinAnim : undefined} /> {hl7Refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div style={{ ...S.toolbar, marginBottom: 16 }}>
          <div style={S.searchWrap}>
            <Search size={16} style={S.searchIcon} />
            <input
              style={S.searchInput}
              placeholder="Filter messages by type, event, source, destination…"
              value={hl7Search}
              onChange={(e) => setHl7Search(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
          <table style={{ ...S.table, minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ ...S.th, whiteSpace: 'nowrap' }}>Message ID</th>
                <th style={S.th}>Type</th>
                <th style={S.th}>Description</th>
                <th style={S.th}>Timestamp</th>
                <th style={S.th}>Direction</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Source</th>
                <th style={S.th}>Destination</th>
              </tr>
            </thead>
            <tbody>
              {filteredHl7.map((msg) => (
                <tr key={msg.id}>
                  <td style={S.td}><code style={S.mono}>{msg.id}</code></td>
                  <td style={{ ...S.td, fontWeight: 700 }}>
                    <span style={{ ...S.badge, background: 'var(--color-purple-light)', color: 'var(--color-purple-dark)', fontSize: 12 }}>
                      {msg.type}^{msg.event}
                    </span>
                  </td>
                  <td style={S.td}>{msg.description}</td>
                  <td style={S.td}><span style={S.mono}>{msg.timestamp}</span></td>
                  <td style={S.td}><DirectionBadge direction={msg.direction} /></td>
                  <td style={S.td}><MsgStatusBadge status={msg.status} /></td>
                  <td style={S.td}>{msg.source}</td>
                  <td style={S.td}>{msg.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHl7.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: 14 }}>No messages match your filter.</p>
          </div>
        )}
      </div>

      {/* ════════════ View Logs Modal ════════════ */}
      {logsIntegration && (
        <div style={S.overlay} onClick={() => setLogsIntegration(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}><FileText size={18} /> {logsIntegration.name} — Logs</h3>
              <button style={S.modalClose} onClick={() => setLogsIntegration(null)}><X size={16} /></button>
            </div>
            <div style={S.modalBody}>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 14 }}>
                Last 10 log entries — endpoint: <code style={S.mono}>{logsIntegration.endpoint}</code>
              </p>
              {generateLogs(logsIntegration).map((log, i) => (
                <div key={i} style={S.logEntry}>
                  <span style={S.logTime}>{log.time}</span>
                  <span style={{
                    ...S.logLevel,
                    color: log.level === 'ERROR' ? '#dc2626' : log.level === 'WARN' ? '#d97706' : log.level === 'DEBUG' ? '#6b7280' : '#059669',
                  }}>[{log.level}]</span>
                  {log.message}
                </div>
              ))}
            </div>
            <div style={S.modalFooter}>
              <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setLogsIntegration(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ Configure Modal ════════════ */}
      {configIntegration && (
        <div style={S.overlay} onClick={() => setConfigIntegration(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}><Settings size={18} /> Configure — {configIntegration.name}</h3>
              <button style={S.modalClose} onClick={() => setConfigIntegration(null)}><X size={16} /></button>
            </div>
            <div style={S.modalBody}>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Endpoint URL</label>
                <input style={S.formInput} value={cfgEndpoint} onChange={e => setCfgEndpoint(e.target.value)} />
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Authentication Method</label>
                <select style={S.formSelect} value={cfgAuth} onChange={e => setCfgAuth(e.target.value)}>
                  <option>TLS + Certificate</option>
                  <option>OAuth 2.0 + API Key</option>
                  <option>HMAC-SHA256 + API Key</option>
                  <option>Basic Auth + HMAC</option>
                  <option>SMART on FHIR + OAuth 2.0</option>
                  <option>SAML 2.0 + TLS</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Polling Interval (seconds)</label>
                  <input style={S.formInput} type="number" value={cfgPollInterval} onChange={e => setCfgPollInterval(e.target.value)} />
                </div>
                <div style={S.formGroup}>
                  <label style={S.formLabel}>Retry Count</label>
                  <input style={S.formInput} type="number" value={cfgRetryCount} onChange={e => setCfgRetryCount(e.target.value)} />
                </div>
              </div>
              <div style={S.formGroup}>
                <label style={S.formLabel}>Enabled</label>
                <div style={S.toggle} onClick={() => setCfgEnabled(!cfgEnabled)}>
                  <div style={{ ...S.toggleTrack, background: cfgEnabled ? 'var(--color-primary)' : '#d1d5db' }}>
                    <div style={{ ...S.toggleKnob, transform: cfgEnabled ? 'translateX(20px)' : 'translateX(0)' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{cfgEnabled ? 'Active' : 'Disabled'}</span>
                </div>
              </div>
            </div>
            <div style={S.modalFooter}>
              <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setConfigIntegration(null)}>Cancel</button>
              <button style={{ ...S.btn, ...S.btnPrimary }} onClick={handleSaveConfig}><Check size={13} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ FHIR Explore Modal ════════════ */}
      {exploreFhir && (
        <div style={S.overlay} onClick={() => setExploreFhir(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}><Globe size={18} /> FHIR R4 — {exploreFhir}</h3>
              <button style={S.modalClose} onClick={() => setExploreFhir(null)}><X size={16} /></button>
            </div>
            <div style={S.modalBody}>
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                GET <code style={S.mono}>https://fhir.hospital.local/fhir/R4/{exploreFhir}/example-001</code>
              </p>
              <div style={{ ...S.badge, background: '#dcfce7', color: '#166534', marginBottom: 14, fontSize: 12 }}>
                <CheckCircle2 size={12} /> 200 OK — {exploreFhir} resource
              </div>
              <pre style={S.jsonBlock}>{FHIR_MOCK_JSON[exploreFhir] || `{ "resourceType": "${exploreFhir}", "id": "example-001" }`}</pre>
            </div>
            <div style={S.modalFooter}>
              <button style={{ ...S.btn, ...S.btnOutline }} onClick={() => setExploreFhir(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
