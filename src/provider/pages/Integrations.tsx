import { useState } from 'react';
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
} from 'lucide-react';


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
    background: 'transparent', border: 'none', cursor: 'pointer',
    borderBottom: '2px solid transparent', marginBottom: -1,
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
  mono: { fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)', wordBreak: 'break-all' as const },
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
};

/* ───────── status config ───────── */
type IntegrationStatus = 'Active' | 'Pending' | 'Error' | 'Not Configured';

const STATUS_CONFIG: Record<IntegrationStatus, { bg: string; color: string; icon: typeof CheckCircle2 }> = {
  Active: { bg: '#d1fae5', color: '#065f46', icon: CheckCircle2 },
  Pending: { bg: '#fef3c7', color: '#92400e', icon: Clock },
  Error: { bg: '#fee2e2', color: '#991b1b', icon: XCircle },
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
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
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
    iconBg: '#e0e7ff',
    iconColor: '#4338ca',
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
    iconBg: '#fce7f3',
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
    iconBg: '#fef3c7',
    iconColor: '#d97706',
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
    iconBg: '#e0f2fe',
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
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
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
    iconBg: '#d1fae5',
    iconColor: '#059669',
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
    iconBg: '#fef3c7',
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
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
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
    iconColor: '#16a34a',
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
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
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
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
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
    Success: { bg: '#d1fae5', color: '#065f46' },
    Failed: { bg: '#fee2e2', color: '#991b1b' },
    Pending: { bg: '#fef3c7', color: '#92400e' },
  };
  const c = map[status];
  return <span style={{ ...S.badge, background: c.bg, color: c.color, fontSize: 11 }}>{status}</span>;
};

const DirectionBadge = ({ direction }: { direction: 'Inbound' | 'Outbound' }) => {
  const isIn = direction === 'Inbound';
  return (
    <span style={{ ...S.dirBadge, background: isIn ? '#dbeafe' : '#fce7f3', color: isIn ? '#1d4ed8' : '#be185d' }}>
      {isIn ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />} {direction}
    </span>
  );
};

/* ─────────────────────────────── component ─────────────────────────────── */

export const Integrations = () => {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [search, setSearch] = useState('');
  const [hl7Search, setHl7Search] = useState('');

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

  const filteredHl7 = HL7_MESSAGES.filter((m) => {
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
    { label: 'Total Integrations', value: statusCounts.total, icon: Link2, bg: '#dbeafe', color: '#2563eb' },
    { label: 'Active', value: statusCounts.active, icon: CheckCircle2, bg: '#d1fae5', color: '#059669' },
    { label: 'Pending', value: statusCounts.pending, icon: Clock, bg: '#fef3c7', color: '#d97706' },
    { label: 'Error', value: statusCounts.error, icon: AlertTriangle, bg: '#fee2e2', color: '#dc2626' },
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
                <button style={{ ...S.btn, ...S.btnPrimary }}>
                  <Play size={12} /> Test Connection
                </button>
                <button style={{ ...S.btn, ...S.btnOutline }}>
                  <FileText size={12} /> View Logs
                </button>
                <button style={{ ...S.btn, ...S.btnOutline }}>
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
                    <span style={{ ...S.badge, background: '#dbeafe', color: '#1d4ed8', fontSize: 11 }}>{r.operations}</span>
                  </td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, background: '#d1fae5', color: '#065f46', fontSize: 11 }}>
                      <CheckCircle2 size={12} /> {r.status}
                    </span>
                  </td>
                  <td style={S.td}>
                    <button
                      style={{ ...S.btn, ...S.btnOutline, padding: '5px 10px', fontSize: 11 }}
                      title={`Explore ${r.resource}`}
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
          <button style={{ ...S.btn, ...S.btnPrimary }}>
            <RefreshCw size={13} /> Refresh
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
                    <span style={{ ...S.badge, background: '#f3e8ff', color: '#7c3aed', fontSize: 12 }}>
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
    </div>
  );
};
