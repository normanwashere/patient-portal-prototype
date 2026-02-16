import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Send, ArrowRight, Clock, CheckCircle2, Calendar, AlertTriangle,
    User, Building2, FileText, Printer, ExternalLink, Activity, Search,
    X, ChevronRight, XCircle, Shield
} from 'lucide-react';
import { useData, type PatientReferralView } from '../context/DataContext';
import { useTheme } from '../theme/ThemeContext';

/* ── Status / urgency colour maps ── */
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    Pending:   { bg: '#fef3c7', color: '#92400e' },
    Accepted:  { bg: '#dbeafe', color: '#1e40af' },
    Scheduled: { bg: '#e0e7ff', color: '#3730a3' },
    Completed: { bg: '#dcfce7', color: '#166534' },
    Declined:  { bg: '#fee2e2', color: '#991b1b' },
    Cancelled: { bg: '#f3f4f6', color: '#6b7280' },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    Pending:   <Clock size={12} />,
    Accepted:  <CheckCircle2 size={12} />,
    Scheduled: <Calendar size={12} />,
    Completed: <CheckCircle2 size={12} />,
    Declined:  <XCircle size={12} />,
    Cancelled: <XCircle size={12} />,
};

const URGENCY_BORDER: Record<string, string> = {
    Routine:  '#d1d5db',
    Urgent:   '#f59e0b',
    Emergent: '#ef4444',
};

const URGENCY_BADGE: Record<string, { bg: string; color: string }> = {
    Routine:  { bg: '#f3f4f6', color: '#374151' },
    Urgent:   { bg: '#fef3c7', color: '#92400e' },
    Emergent: { bg: '#fee2e2', color: '#991b1b' },
};

type StatusFilter = 'All' | 'Pending' | 'Scheduled' | 'Completed';

/* ══════════════════════════════════════════════════════════════ */

export default function Referrals() {
    const { referrals, userProfile } = useData();
    const { tenant } = useTheme();

    const [filter, setFilter] = useState<StatusFilter>('All');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [selectedReferral, setSelectedReferral] = useState<PatientReferralView | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    /* ── Responsive listener ── */
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    /* ── Filter + search ── */
    const filtered = useMemo(() => {
        let list = referrals;
        if (filter !== 'All') list = list.filter(r => r.status === filter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(r =>
                r.referredToSpecialty.toLowerCase().includes(q) ||
                (r.referredToDoctorName?.toLowerCase().includes(q)) ||
                r.referringDoctorName.toLowerCase().includes(q) ||
                r.reason.toLowerCase().includes(q) ||
                (r.referredToFacility?.toLowerCase().includes(q))
            );
        }
        return list;
    }, [referrals, filter, searchQuery]);

    /* ── Summary counts ── */
    const counts = useMemo(() => ({
        total: referrals.length,
        pending: referrals.filter(r => r.status === 'Pending').length,
        scheduled: referrals.filter(r => r.status === 'Scheduled').length,
        completed: referrals.filter(r => r.status === 'Completed').length,
    }), [referrals]);

    /* ── Print referral letter ── */
    const handlePrint = useCallback((ref: PatientReferralView) => {
        const patientName = userProfile?.name ?? 'Patient';
        const logoUrl = tenant.logo;
        const orgName = tenant.name;

        const html = `<!DOCTYPE html>
<html><head><title>Referral Letter</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 24px; color: #1f2937; }
  .header { text-align: center; border-bottom: 2px solid ${tenant.colors.primary}; padding-bottom: 16px; margin-bottom: 24px; }
  .header img { height: 48px; margin-bottom: 8px; }
  .header h2 { margin: 0; color: ${tenant.colors.primary}; font-size: 14px; }
  .title { text-align: center; font-size: 20px; font-weight: 700; letter-spacing: 2px; margin: 24px 0 8px; }
  .date { text-align: center; color: #6b7280; margin-bottom: 28px; font-size: 13px; }
  .section { margin-bottom: 20px; }
  .section-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 4px; }
  .section-value { font-size: 14px; }
  .field-row { display: flex; gap: 32px; margin-bottom: 12px; }
  .field-row > div { flex: 1; }
  .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  .signature { margin-top: 64px; }
  .sig-line { border-top: 1px solid #1f2937; width: 280px; margin-bottom: 4px; }
  .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #9ca3af; font-style: italic; }
  @media print { body { margin: 20px; } }
</style></head>
<body>
  <div class="header">
    ${logoUrl ? `<img src="${logoUrl}" alt="${orgName}" />` : ''}
    <h2>${orgName}</h2>
  </div>
  <div class="title">REFERRAL LETTER</div>
  <div class="date">${new Date(ref.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>

  <div class="section">
    <div class="section-label">Patient</div>
    <div class="section-value"><strong>${patientName}</strong></div>
  </div>

  <div class="field-row">
    <div>
      <div class="section-label">Referring Physician</div>
      <div class="section-value"><strong>${ref.referringDoctorName}</strong><br/>${ref.referringSpecialty}</div>
    </div>
    <div>
      <div class="section-label">Referred To</div>
      <div class="section-value"><strong>${ref.referredToDoctorName || ref.referredToSpecialty}</strong><br/>${ref.referredToSpecialty}${ref.referredToFacility ? ` — ${ref.referredToFacility}` : ''}</div>
    </div>
  </div>

  <hr class="divider" />

  <div class="section">
    <div class="section-label">Reason for Referral</div>
    <div class="section-value">${ref.reason}</div>
  </div>

  <div class="section">
    <div class="section-label">Clinical Summary</div>
    <div class="section-value">${ref.clinicalSummary}</div>
  </div>

  ${ref.diagnosis ? `<div class="section"><div class="section-label">Diagnosis</div><div class="section-value">${ref.diagnosis}${ref.icdCode ? ` (ICD-10: ${ref.icdCode})` : ''}</div></div>` : ''}

  <hr class="divider" />

  <div class="signature">
    <div class="sig-line"></div>
    <div style="font-size:14px;font-weight:600;">${ref.referringDoctorName}</div>
    <div style="font-size:12px;color:#6b7280;">${ref.referringSpecialty}</div>
  </div>

  <div class="footer">This is a system-generated referral letter.</div>
</body></html>`;

        const w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
        }
    }, [userProfile, tenant]);

    /* ── Detail modal ── */
    const openDetail = (ref: PatientReferralView) => setSelectedReferral(ref);
    const closeDetail = () => setSelectedReferral(null);

    /* ══════════════════════════════ Render ══════════════════════════════ */

    /* ── Empty state ── */
    if (referrals.length === 0) {
        return (
            <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
                <header style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>My Referrals</h2>
                    <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Referrals from your doctors to specialists</p>
                </header>
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '80px 24px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 16,
                    border: '1px solid var(--color-border)',
                }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%', background: '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                    }}>
                        <Send size={32} color="#d1d5db" />
                    </div>
                    <p style={{ fontSize: 15, color: 'var(--color-text-muted)', maxWidth: 360, lineHeight: 1.5 }}>
                        No referrals yet. Your doctor will create referrals when specialist care is needed.
                    </p>
                </div>
            </div>
        );
    }

    const filterTabs: StatusFilter[] = ['All', 'Pending', 'Scheduled', 'Completed'];

    return (
        <div style={{ padding: isMobile ? 16 : 24, maxWidth: 960, margin: '0 auto' }}>
            {/* ── Header ── */}
            <header style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>My Referrals</h2>
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Referrals from your doctors to specialists</p>
            </header>

            {/* ── Search bar ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 10, marginBottom: 16,
            }}>
                <Search size={18} color="#9ca3af" />
                <input
                    type="text"
                    placeholder="Search referrals..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        border: 'none', outline: 'none', flex: 1, fontSize: 14,
                        background: 'transparent', color: 'var(--color-text)',
                    }}
                />
            </div>

            {/* ── Filter tabs (pill-style) ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {filterTabs.map(f => {
                    const isActive = filter === f;
                    return (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                                border: isActive ? 'none' : '1px solid var(--color-border)',
                                background: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: isActive ? '#fff' : 'var(--color-text-muted)',
                                cursor: 'pointer', transition: 'all .15s',
                            }}
                        >
                            {f}
                        </button>
                    );
                })}
            </div>

            {/* ── Summary cards ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: 12, marginBottom: 24,
            }}>
                <SummaryCard label="Total" count={counts.total} color="var(--color-primary)" icon={<FileText size={18} />} />
                <SummaryCard label="Pending" count={counts.pending} color="#f59e0b" icon={<Clock size={18} />} />
                <SummaryCard label="Scheduled" count={counts.scheduled} color="#3b82f6" icon={<Calendar size={18} />} />
                <SummaryCard label="Completed" count={counts.completed} color="#22c55e" icon={<CheckCircle2 size={18} />} />
            </div>

            {/* ── Referral cards ── */}
            {filtered.length === 0 ? (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '48px 24px', textAlign: 'center',
                    background: 'var(--color-surface)', borderRadius: 16,
                    border: '1px solid var(--color-border)',
                }}>
                    <Search size={36} color="#d1d5db" style={{ marginBottom: 12 }} />
                    <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No referrals match your filter.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: 16,
                }}>
                    {filtered.map(ref => (
                        <ReferralCard
                            key={ref.id}
                            referral={ref}
                            isMobile={isMobile}
                            onViewDetails={() => openDetail(ref)}
                            onPrint={() => handlePrint(ref)}
                        />
                    ))}
                </div>
            )}

            {/* ── Detail modal ── */}
            {selectedReferral && (
                <DetailModal
                    referral={selectedReferral}
                    onClose={closeDetail}
                    onPrint={() => handlePrint(selectedReferral)}
                    isMobile={isMobile}
                />
            )}
        </div>
    );
}

/* ═══════════════════════════ Sub-components ═══════════════════════════ */

function SummaryCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
    return (
        <div style={{
            background: 'var(--color-surface)', borderRadius: 12,
            border: '1px solid var(--color-border)', padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${color}14`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color, flexShrink: 0,
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
            </div>
        </div>
    );
}

/* ── Referral Card ── */
function ReferralCard({ referral: ref, isMobile, onViewDetails, onPrint }: {
    referral: PatientReferralView; isMobile: boolean;
    onViewDetails: () => void; onPrint: () => void;
}) {
    const statusStyle = STATUS_COLORS[ref.status] ?? STATUS_COLORS.Pending;
    const urgencyBorder = URGENCY_BORDER[ref.urgency] ?? URGENCY_BORDER.Routine;
    const urgencyBadge = URGENCY_BADGE[ref.urgency] ?? URGENCY_BADGE.Routine;

    return (
        <div style={{
            background: 'var(--color-surface)', borderRadius: 14,
            border: '1px solid var(--color-border)', overflow: 'hidden',
            borderLeft: `4px solid ${urgencyBorder}`,
            display: 'flex', flexDirection: 'column',
            transition: 'box-shadow .15s',
        }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.07)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
        >
            <div style={{ padding: 16, flex: 1 }}>
                {/* Top row: urgency + status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                        background: urgencyBadge.bg, color: urgencyBadge.color,
                    }}>
                        {ref.urgency === 'Emergent' && <AlertTriangle size={11} />}
                        {ref.urgency === 'Urgent' && <AlertTriangle size={11} />}
                        {ref.urgency}
                    </span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                        background: statusStyle.bg, color: statusStyle.color,
                    }}>
                        {STATUS_ICONS[ref.status]} {ref.status}
                    </span>
                </div>

                {/* Referred to */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: 'var(--color-bg-tint-medium, #f0f4ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-primary)',
                    }}>
                        <Activity size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{ref.referredToSpecialty}</div>
                        {ref.referredToDoctorName && (
                            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <User size={12} /> {ref.referredToDoctorName}
                            </div>
                        )}
                    </div>
                </div>

                {/* From */}
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ArrowRight size={12} />
                    <span>From <strong style={{ color: 'var(--color-text)' }}>{ref.referringDoctorName}</strong> · {ref.referringSpecialty}</span>
                </div>

                {/* Facility */}
                {ref.referredToFacility && (
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={12} /> {ref.referredToFacility}
                    </div>
                )}

                {/* Reason (truncated 2 lines) */}
                <p style={{
                    fontSize: 13, color: 'var(--color-text-muted)', margin: '8px 0',
                    lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {ref.reason}
                </p>

                {/* Dates */}
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> Referred on {new Date(ref.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {ref.scheduledDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#3730a3', fontWeight: 500 }}>
                            <Calendar size={11} /> Appointment: {new Date(ref.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div style={{
                display: 'flex', gap: 8, padding: '12px 16px',
                borderTop: '1px solid var(--color-border)',
                background: 'var(--color-bg-tint-soft, #fafbff)',
                flexWrap: 'wrap',
            }}>
                <button onClick={onViewDetails} style={actionBtnStyle('var(--color-primary)')}>
                    <FileText size={13} /> View Details
                </button>
                <button onClick={onPrint} style={actionBtnStyle('#6b7280')}>
                    <Printer size={13} /> Print Referral
                </button>
                {ref.status === 'Accepted' && (
                    <button style={actionBtnStyle('#3b82f6', true)}>
                        <Calendar size={13} /> Book Appointment
                    </button>
                )}
            </div>
        </div>
    );
}

function actionBtnStyle(color: string, filled = false): React.CSSProperties {
    return {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 600, padding: '6px 12px',
        borderRadius: 8, cursor: 'pointer',
        border: filled ? 'none' : `1px solid ${color}33`,
        background: filled ? color : `${color}0a`,
        color: filled ? '#fff' : color,
        transition: 'all .15s',
    };
}

/* ── Detail Modal ── */
function DetailModal({ referral: ref, onClose, onPrint, isMobile }: {
    referral: PatientReferralView; onClose: () => void; onPrint: () => void; isMobile: boolean;
}) {
    const statusStyle = STATUS_COLORS[ref.status] ?? STATUS_COLORS.Pending;
    const urgencyBadge = URGENCY_BADGE[ref.urgency] ?? URGENCY_BADGE.Routine;

    /* Timeline steps */
    const timelineSteps = useMemo(() => {
        type TStep = { label: string; date?: string; done: boolean; active: boolean };
        const ordered: TStep[] = [
            { label: 'Created', date: ref.createdAt, done: true, active: false },
            { label: 'Accepted', done: ['Accepted', 'Scheduled', 'Completed'].includes(ref.status), active: ref.status === 'Accepted' },
            { label: 'Scheduled', date: ref.scheduledDate, done: ['Scheduled', 'Completed'].includes(ref.status), active: ref.status === 'Scheduled' },
            { label: 'Completed', date: ref.completedAt, done: ref.status === 'Completed', active: false },
        ];
        return ordered;
    }, [ref]);

    /* Block background scroll */
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: isMobile ? 0 : 24,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--color-surface, #fff)',
                    borderRadius: isMobile ? 0 : 20,
                    width: isMobile ? '100%' : 580,
                    maxHeight: isMobile ? '100%' : '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 60px rgba(0,0,0,.2)',
                    ...(isMobile ? { height: '100%' } : {}),
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Modal header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
                    position: 'sticky', top: 0, background: 'var(--color-surface, #fff)',
                    zIndex: 1, borderRadius: isMobile ? 0 : '20px 20px 0 0',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'var(--color-bg-tint-medium, #f0f4ff)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-primary)',
                        }}>
                            <Activity size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{ref.referredToSpecialty}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Referral Details</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
                            background: statusStyle.bg, color: statusStyle.color,
                        }}>
                            {STATUS_ICONS[ref.status]} {ref.status}
                        </span>
                        <button onClick={onClose} style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                            color: 'var(--color-text-muted)', borderRadius: 8,
                        }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Modal body */}
                <div style={{ padding: '20px 24px' }}>
                    {/* Referral info grid */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                        marginBottom: 24,
                    }}>
                        <InfoField label="Referring Doctor" icon={<User size={13} />}>
                            <strong>{ref.referringDoctorName}</strong>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{ref.referringSpecialty}</div>
                        </InfoField>
                        <InfoField label="Referred To" icon={<ArrowRight size={13} />}>
                            <strong>{ref.referredToDoctorName ?? ref.referredToSpecialty}</strong>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{ref.referredToSpecialty}</div>
                        </InfoField>
                        {ref.referredToFacility && (
                            <InfoField label="Facility" icon={<Building2 size={13} />}>
                                {ref.referredToFacility}
                            </InfoField>
                        )}
                        <InfoField label="Urgency" icon={<AlertTriangle size={13} />}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                                background: urgencyBadge.bg, color: urgencyBadge.color,
                            }}>
                                {ref.urgency}
                            </span>
                        </InfoField>
                    </div>

                    {/* Reason */}
                    <Section title="Reason for Referral">
                        <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.55, margin: 0 }}>{ref.reason}</p>
                    </Section>

                    {/* Clinical summary */}
                    <Section title="Clinical Summary">
                        <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.55, margin: 0 }}>{ref.clinicalSummary}</p>
                    </Section>

                    {/* Diagnosis */}
                    {ref.diagnosis && (
                        <Section title="Diagnosis">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 500 }}>{ref.diagnosis}</span>
                                {ref.icdCode && (
                                    <span style={{
                                        fontSize: 11, fontWeight: 600, padding: '2px 8px',
                                        borderRadius: 6, background: '#f3f4f6', color: '#6b7280',
                                    }}>
                                        ICD-10: {ref.icdCode}
                                    </span>
                                )}
                            </div>
                        </Section>
                    )}

                    {/* Response notes */}
                    {ref.responseNotes && (
                        <Section title="Response Notes">
                            <div style={{
                                background: '#f0f9ff', borderRadius: 10, padding: '12px 14px',
                                border: '1px solid #bae6fd', fontSize: 14, color: '#0c4a6e', lineHeight: 1.5,
                            }}>
                                {ref.responseNotes}
                            </div>
                        </Section>
                    )}

                    {/* Timeline */}
                    <Section title="Timeline">
                        <div style={{ display: 'flex', gap: 0 }}>
                            {timelineSteps.map((step, i) => (
                                <div key={step.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                    {/* Connector line */}
                                    {i > 0 && (
                                        <div style={{
                                            position: 'absolute', top: 11, right: '50%', width: '100%', height: 2,
                                            background: step.done ? 'var(--color-primary)' : '#e5e7eb',
                                            zIndex: 0,
                                        }} />
                                    )}
                                    {/* Dot */}
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%', zIndex: 1,
                                        background: step.done ? 'var(--color-primary)' : step.active ? '#dbeafe' : '#f3f4f6',
                                        border: step.active ? '2px solid var(--color-primary)' : 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {step.done && <CheckCircle2 size={14} color="#fff" />}
                                    </div>
                                    <span style={{
                                        fontSize: 11, fontWeight: 600, marginTop: 6,
                                        color: step.done ? 'var(--color-text)' : 'var(--color-text-muted)',
                                    }}>
                                        {step.label}
                                    </span>
                                    {step.date && (
                                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>
                                            {new Date(step.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>

                {/* Modal footer */}
                <div style={{
                    display: 'flex', gap: 12, padding: '16px 24px',
                    borderTop: '1px solid var(--color-border)',
                    position: 'sticky', bottom: 0,
                    background: 'var(--color-surface, #fff)',
                    borderRadius: isMobile ? 0 : '0 0 20px 20px',
                }}>
                    <button onClick={onPrint} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: 'var(--color-primary)', color: '#fff',
                        border: 'none', cursor: 'pointer',
                    }}>
                        <Printer size={15} /> Print Referral
                    </button>
                    <button onClick={onClose} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: '#f3f4f6', color: '#374151',
                        border: 'none', cursor: 'pointer',
                    }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Tiny helpers ── */
function InfoField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>
                {icon} {label}
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{children}</div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
                {title}
            </div>
            {children}
        </div>
    );
}
