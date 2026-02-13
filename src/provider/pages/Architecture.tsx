import React, { useState } from 'react';
import {
  Server,
  Cloud,
  Shield,
  Database,
  Globe,
  Lock,
  Layers,
  Monitor,
  Cpu,
  HardDrive,
  Network,
  KeyRound,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Box,
  FileCode2,
  Workflow,
  Building2,
  Activity,
  Heart,
  BadgeCheck,
  ArrowDown,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s: Record<string, React.CSSProperties> = {
  page: {
    padding: 24,
    background: 'var(--color-background)',
    minHeight: '100%',
    maxWidth: '100%',
    overflowX: 'hidden' as const,
    boxSizing: 'border-box' as const,
  },

  /* Banner */
  banner: {
    background: 'linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 70%, #000) 100%)',
    borderRadius: 12,
    padding: '32px 32px 28px',
    marginBottom: 28,
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
    wordBreak: 'break-word' as const,
  },
  bannerGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginBottom: 4,
    wordBreak: 'break-word' as const,
    maxWidth: '100%',
  },
  bannerVersion: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 700,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    padding: '2px 10px',
    marginLeft: 12,
    verticalAlign: 'middle',
  },
  bannerSubtitle: {
    fontSize: 15,
    opacity: 0.85,
    marginTop: 6,
    wordBreak: 'break-word' as const,
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 700,
    background: 'rgba(255,255,255,0.18)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 20,
    padding: '4px 12px',
    backdropFilter: 'blur(4px)',
  },

  /* Section */
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* Cards */
  grid6: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  card: {
    background: 'var(--color-surface)',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    padding: 20,
    transition: 'box-shadow 0.2s',
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--color-primary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  techList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    fontSize: 13,
    color: 'var(--color-text)',
    lineHeight: 1.85,
  },
  techItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'var(--color-primary)',
    flexShrink: 0,
  },

  /* Architecture Diagram */
  diagramWrap: {
    marginBottom: 32,
    overflowX: 'auto',
  },
  diagramContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    maxWidth: '100%',
  },
  tierBox: {
    width: '100%',
    maxWidth: 720,
    borderRadius: 10,
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    boxSizing: 'border-box' as const,
    flexWrap: 'wrap' as const,
  },
  tierIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tierLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 2,
  },
  tierDesc: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
    wordBreak: 'break-word' as const,
  },
  arrow: {
    display: 'flex',
    justifyContent: 'center',
    padding: '4px 0',
    color: 'var(--color-primary)',
    opacity: 0.6,
  },

  /* Deployment cards */
  deployCard: {
    background: 'var(--color-surface)',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    padding: 24,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
    wordBreak: 'break-word' as const,
  },
  recommendBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    fontSize: 10,
    fontWeight: 700,
    background: 'var(--color-primary)',
    color: '#fff',
    borderRadius: 20,
    padding: '3px 12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  deployTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-text)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  deployDesc: {
    fontSize: 13,
    color: 'var(--color-text-muted)',
    lineHeight: 1.65,
    wordBreak: 'break-word' as const,
  },
  featureList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    fontSize: 13,
    color: 'var(--color-text)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },

  /* Table */
  tableWrap: {
    overflowX: 'auto',
    marginBottom: 32,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
    minWidth: 640,
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontWeight: 700,
    fontSize: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    color: 'var(--color-text-muted)',
    background: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))',
    borderBottom: '2px solid var(--color-border)',
    minWidth: 120,
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '10px 16px',
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    minWidth: 100,
  },

  /* Compliance badges */
  compBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    background: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))',
    color: 'var(--color-primary)',
    border: '1px solid color-mix(in srgb, var(--color-primary) 25%, var(--color-border))',
    borderRadius: 8,
    padding: '6px 14px',
  },

  /* Collapsible */
  collapseBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--color-text-muted)',
    fontSize: 12,
    marginLeft: 'auto',
  },

  /* Security */
  secCard: {
    background: 'var(--color-surface)',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    padding: 20,
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
  },
  secIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  secTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 4,
  },
  secDesc: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    lineHeight: 1.6,
    wordBreak: 'break-word' as const,
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const techStack = [
  {
    label: 'Frontend',
    icon: Monitor,
    items: ['React 19', 'TypeScript 5.x', 'Vite', 'Progressive Web App (PWA)', 'TailwindCSS'],
  },
  {
    label: 'Backend',
    icon: Server,
    items: ['Node.js / .NET Core', 'GraphQL + REST APIs', 'WebSocket (real-time)'],
  },
  {
    label: 'Database',
    icon: Database,
    items: ['PostgreSQL (primary RDBMS)', 'Redis (cache & sessions)', 'MongoDB (document store)'],
  },
  {
    label: 'Infrastructure',
    icon: Cloud,
    items: ['Kubernetes (AKS / EKS / GKE)', 'Docker containers', 'Terraform IaC'],
  },
  {
    label: 'Security',
    icon: Shield,
    items: ['OAuth 2.0 + OIDC', 'SAML 2.0 SSO', 'AES-256 encryption', 'Mutual TLS (mTLS)'],
  },
  {
    label: 'Messaging',
    icon: MessageSquare,
    items: ['Apache Kafka', 'RabbitMQ', 'HL7 MLLP gateway'],
  },
];

const archLayers: { label: string; desc: string; icon: React.ElementType; color: string }[] = [
  {
    label: 'Client Layer',
    desc: 'PWA / Mobile App / Desktop Browser',
    icon: Monitor,
    color: '#4f8cff',
  },
  {
    label: 'API Gateway',
    desc: 'Kong / NGINX — Rate limiting, Auth, SSL termination',
    icon: Globe,
    color: '#6c63ff',
  },
  {
    label: 'Application Layer',
    desc: 'Microservices: Patient, Clinical, Billing, Integration, Notification',
    icon: Layers,
    color: '#00b894',
  },
  {
    label: 'Integration Layer',
    desc: 'FHIR Server, HL7 Interface Engine, DICOM Gateway',
    icon: Workflow,
    color: '#fd7e14',
  },
  {
    label: 'Data Layer',
    desc: 'PostgreSQL, Redis, MongoDB, Object Storage (S3 / Blob)',
    icon: Database,
    color: '#e84393',
  },
  {
    label: 'Infrastructure',
    desc: 'Kubernetes Cluster, CDN, WAF, DDoS Protection',
    icon: Cpu,
    color: '#636e72',
  },
];

const deployOptions = [
  {
    title: 'Cloud SaaS',
    recommended: true,
    icon: Cloud,
    desc: 'Multi-tenant, auto-scaling architecture hosted and fully managed by the vendor. Ideal for most healthcare organisations.',
    features: ['99.99% SLA uptime', 'Automatic updates & patches', 'Managed backups & DR', 'Global CDN delivery', 'Pay-as-you-go pricing'],
  },
  {
    title: 'Hybrid',
    recommended: false,
    icon: Network,
    desc: 'Cloud control plane with on-premise data residency. Designed for organisations with strict data sovereignty requirements.',
    features: ['Data stays on-premise', 'Cloud-managed control plane', 'Flexible compliance', 'Dedicated connectivity', 'Custom retention policies'],
  },
  {
    title: 'On-Premise',
    recommended: false,
    icon: Building2,
    desc: 'Full on-site deployment with dedicated infrastructure. Suitable for air-gapped environments and maximum data control.',
    features: ['Complete data control', 'Air-gapped capable', 'Dedicated hardware', 'Custom network topology', 'Self-managed operations'],
  },
];

const infraRows = [
  { component: 'Compute', cloud: 'Managed (vendor)', hybrid: '4 vCPU, 16 GB RAM (min)', onprem: '8 vCPU, 32 GB RAM' },
  { component: 'Storage', cloud: 'Managed', hybrid: '500 GB SSD', onprem: '1 TB SSD' },
  { component: 'Network', cloud: 'Internet access', hybrid: '100 Mbps dedicated', onprem: '1 Gbps LAN' },
  { component: 'Database', cloud: 'Managed PostgreSQL', hybrid: 'Client-managed', onprem: 'Client-managed' },
  { component: 'SSL Certificates', cloud: 'Auto-provisioned', hybrid: 'Client-provided', onprem: 'Client-provided' },
  { component: 'Backup', cloud: 'Automated daily', hybrid: 'Client-managed', onprem: 'Client-managed' },
];

const fhirItems = [
  { label: 'FHIR R4 (4.0.1)', desc: 'Fully compliant FHIR server with RESTful API and Capability Statement' },
  { label: 'HL7 v2.x Interface Engine', desc: 'ADT, ORM, ORU, SIU, DFT, MDM message types supported' },
  { label: 'CDA R2 Documents', desc: 'Clinical Document Architecture generation and parsing' },
  { label: 'Terminology Services', desc: 'ICD-10, SNOMED CT, LOINC, RxNorm code systems' },
];

const securityItems: { title: string; desc: string; icon: React.ElementType }[] = [
  {
    title: 'HIPAA Technical Safeguards',
    desc: 'Access controls, audit controls, transmission security, and integrity controls per 45 CFR § 164.312.',
    icon: Shield,
  },
  {
    title: 'Role-Based Access Control',
    desc: 'Fine-grained RBAC with attribute-level permissions, segregation of duties, and break-the-glass emergency access.',
    icon: KeyRound,
  },
  {
    title: 'Audit Logging',
    desc: 'Tamper-proof, immutable audit logs with full event chain. Exportable for compliance reporting.',
    icon: FileCode2,
  },
  {
    title: 'Data Encryption',
    desc: 'AES-256 encryption at rest, TLS 1.3 in transit. Key management via HSM-backed vaults.',
    icon: Lock,
  },
  {
    title: 'Penetration Testing',
    desc: 'Annual third-party penetration tests, continuous vulnerability scanning, and automated SAST/DAST pipelines.',
    icon: Activity,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Architecture = () => {
  useTheme(); // subscribe to tenant theme

  const [infraOpen, setInfraOpen] = useState(true);

  return (
    <div style={s.page}>
      {/* -------- 1. Banner -------- */}
      <div style={s.banner}>
        <div style={s.bannerGrid}>
          <div>
            <div style={s.bannerTitle}>
              Healthcare Platform
              <span style={s.bannerVersion}>v3.2.1</span>
            </div>
            <div style={s.bannerSubtitle}>Cloud-Native Healthcare Platform</div>
            <div style={s.badgeRow}>
              {['HIPAA Compliant', 'SOC 2 Type II', 'HL7 FHIR R4', 'ISO 27001'].map((b) => (
                <span key={b} style={s.badge}>
                  <BadgeCheck size={13} /> {b}
                </span>
              ))}
            </div>
          </div>
          <div style={{ opacity: 0.12, position: 'absolute', right: 20, top: 12 }}>
            <Layers size={120} strokeWidth={1} />
          </div>
        </div>
      </div>

      {/* -------- 2. Technology Stack -------- */}
      <div style={s.sectionHeader}>
        <div style={{ ...s.sectionIcon, background: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))' }}>
          <Box size={18} color="var(--color-primary)" />
        </div>
        <span style={s.sectionTitle}>Technology Stack</span>
      </div>
      <div style={s.grid6}>
        {techStack.map((tech) => {
          const Icon = tech.icon;
          return (
            <div key={tech.label} style={s.card}>
              <div style={s.cardLabel}>
                <Icon size={15} /> {tech.label}
              </div>
              <ul style={s.techList}>
                {tech.items.map((item) => (
                  <li key={item} style={s.techItem}>
                    <span style={s.dot} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* -------- 3. Architecture Diagram -------- */}
      <div style={s.sectionHeader}>
        <div style={{ ...s.sectionIcon, background: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))' }}>
          <Layers size={18} color="var(--color-primary)" />
        </div>
        <span style={s.sectionTitle}>Architecture Overview</span>
      </div>
      <div style={s.diagramWrap}>
        <div style={s.diagramContainer}>
          {archLayers.map((layer, idx) => {
            const Icon = layer.icon;
            return (
              <React.Fragment key={layer.label}>
                <div style={s.tierBox}>
                  <div style={{ ...s.tierIcon, background: `${layer.color}18` }}>
                    <Icon size={20} color={layer.color} />
                  </div>
                  <div>
                    <div style={s.tierLabel}>{layer.label}</div>
                    <div style={s.tierDesc}>{layer.desc}</div>
                  </div>
                </div>
                {idx < archLayers.length - 1 && (
                  <div style={s.arrow}>
                    <ArrowDown size={20} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* -------- 4. Deployment Options -------- */}
      <div style={s.sectionHeader}>
        <div style={{ ...s.sectionIcon, background: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))' }}>
          <Cloud size={18} color="var(--color-primary)" />
        </div>
        <span style={s.sectionTitle}>Deployment Options</span>
      </div>
      <div style={s.grid3}>
        {deployOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <div key={opt.title} style={{ ...s.deployCard, ...(opt.recommended ? { borderColor: 'var(--color-primary)', borderWidth: 2 } : {}) }}>
              {opt.recommended && <span style={s.recommendBadge}>Recommended</span>}
              <div style={s.deployTitle}>
                <Icon size={18} color="var(--color-primary)" /> {opt.title}
              </div>
              <div style={s.deployDesc}>{opt.desc}</div>
              <ul style={s.featureList}>
                {opt.features.map((f) => (
                  <li key={f} style={s.featureItem}>
                    <CheckCircle2 size={14} color="var(--color-primary)" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* -------- 5. Infrastructure Requirements -------- */}
      <div style={s.sectionHeader}>
        <div style={{ ...s.sectionIcon, background: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))' }}>
          <HardDrive size={18} color="var(--color-primary)" />
        </div>
        <span style={s.sectionTitle}>Infrastructure Requirements</span>
        <button
          style={s.collapseBtn}
          onClick={() => setInfraOpen((p) => !p)}
          aria-label={infraOpen ? 'Collapse table' : 'Expand table'}
        >
          {infraOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {infraOpen ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {infraOpen && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Component</th>
                <th style={s.th}>Cloud (SaaS)</th>
                <th style={s.th}>Hybrid</th>
                <th style={s.th}>On-Premise</th>
              </tr>
            </thead>
            <tbody>
              {infraRows.map((row) => (
                <tr key={row.component}>
                  <td style={{ ...s.td, fontWeight: 600 }}>{row.component}</td>
                  <td style={s.td}>{row.cloud}</td>
                  <td style={s.td}>{row.hybrid}</td>
                  <td style={s.td}>{row.onprem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* -------- 6. FHIR & HL7 Compliance -------- */}
      <div style={s.sectionHeader}>
        <div style={{ ...s.sectionIcon, background: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))' }}>
          <Heart size={18} color="var(--color-primary)" />
        </div>
        <span style={s.sectionTitle}>FHIR & HL7 Compliance</span>
      </div>
      <div style={{ ...s.card, marginBottom: 16, maxWidth: '100%', boxSizing: 'border-box' as const }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {fhirItems.map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, wordBreak: 'break-word' as const }}>
                <Zap size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} /> {item.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.6, wordBreak: 'break-word' as const }}>{item.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ ...s.badgeRow, marginTop: 20, gap: 10, flexWrap: 'wrap' }}>
          {['FHIR R4 4.0.1', 'HL7 v2.5.1', 'CDA R2', 'ICD-10', 'SNOMED CT', 'LOINC'].map((b) => (
            <span key={b} style={s.compBadge}>
              <CheckCircle2 size={13} /> {b}
            </span>
          ))}
        </div>
      </div>

      {/* -------- 7. Security & Compliance -------- */}
      <div style={{ ...s.sectionHeader, marginTop: 32 }}>
        <div style={{ ...s.sectionIcon, background: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))' }}>
          <Lock size={18} color="var(--color-primary)" />
        </div>
        <span style={s.sectionTitle}>Security & Compliance</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {securityItems.map((sec) => {
          const Icon = sec.icon;
          return (
            <div key={sec.title} style={s.secCard}>
              <div style={{ ...s.secIcon, background: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))' }}>
                <Icon size={18} color="var(--color-primary)" />
              </div>
              <div>
                <div style={s.secTitle}>{sec.title}</div>
                <div style={s.secDesc}>{sec.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
