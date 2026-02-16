import {
  FileText,
  Plus,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  Archive,
  Flag,
  Search,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useProvider } from '../context/ProviderContext';
import { useToast } from '../../context/ToastContext';
import type { FormTemplate, FormField, FormSubmission } from '../types';

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 24 },
  tabs: {
    display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap',
    borderBottom: '1px solid var(--color-border)', paddingBottom: 0,
  },
  tab: {
    padding: '12px 16px', fontSize: 14, fontWeight: 600,
    color: 'var(--color-text-muted)', background: 'none', border: 'none',
    borderBottomWidth: 3, borderBottomStyle: 'solid' as const, borderBottomColor: 'transparent', cursor: 'pointer', marginBottom: -1,
  },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },
  card: {
    background: 'var(--color-surface)', borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', padding: 20, marginBottom: 16,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  chip: {
    padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
    border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer',
  },
  chipActive: { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  utilBar: { display: 'flex', gap: 8, padding: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' },
  btn: {
    padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
  },
  btnPrimary: { background: 'var(--color-primary)', color: 'white' },
  btnSecondary: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
  btnSuccess: { background: 'var(--color-success)', color: 'white' },
  btnWarning: { background: 'var(--color-warning)', color: 'white' },
  btnDanger: { background: 'var(--color-error)', color: 'white' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: 12, borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 },
  td: { padding: 12, borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)' },
  badge: { padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  input: { width: '100%', padding: 10, borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', fontSize: 14, background: 'var(--color-surface)', color: 'var(--color-text)', boxSizing: 'border-box' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)' },
  searchWrap: {
    flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', background: 'var(--color-surface)',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--color-text)' },
};

type TabId = 'templates' | 'submissions' | 'create';

const STATUS_BADGE_STYLES: Record<FormSubmission['status'], React.CSSProperties> = {
  'Pending Review': { ...styles.badge, background: 'var(--color-warning-light)', color: 'var(--color-warning)' },
  Reviewed: { ...styles.badge, background: 'var(--color-success-light)', color: 'var(--color-success)' },
  Flagged: { ...styles.badge, background: 'var(--color-error-light)', color: 'var(--color-error)' },
  Archived: { ...styles.badge, background: 'var(--color-gray-200)', color: 'var(--color-text-muted)' },
};

const TEMPLATE_STATUS_STYLES: Record<FormTemplate['status'], React.CSSProperties> = {
  Active: { ...styles.badge, background: 'var(--color-success-light)', color: 'var(--color-success)' },
  Draft: { ...styles.badge, background: 'var(--color-warning-light)', color: 'var(--color-warning)' },
  Archived: { ...styles.badge, background: 'var(--color-gray-200)', color: 'var(--color-text-muted)' },
};

export const FormsManagement = () => {
  const { formTemplates, formSubmissions, updateFormSubmissionStatus, addFormTemplate, addAuditLog } = useProvider();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('templates');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [templateStatusFilter, setTemplateStatusFilter] = useState<string | null>(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<FormSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submissionSearch, setSubmissionSearch] = useState('');

  // Create form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<FormTemplate['type']>('intake');
  const [newStatus, setNewStatus] = useState<FormTemplate['status']>('Draft');

  const filteredSubmissions = useMemo(() => {
    let list = formSubmissions;
    if (statusFilter) list = list.filter((s) => s.status === statusFilter);
    if (submissionSearch) {
      const q = submissionSearch.toLowerCase();
      list = list.filter((s) =>
        s.patientName.toLowerCase().includes(q) ||
        s.templateName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [formSubmissions, statusFilter, submissionSearch]);

  const filteredTemplates = useMemo(() => {
    if (!templateStatusFilter) return formTemplates;
    return formTemplates.filter((t) => t.status === templateStatusFilter);
  }, [formTemplates, templateStatusFilter]);

  const handleSubmissionStatus = (sub: FormSubmission, newSubStatus: FormSubmission['status']) => {
    updateFormSubmissionStatus(sub.id, newSubStatus, reviewNotes.trim() || undefined);
    addAuditLog('form_review', 'Forms', `Submission "${sub.templateName}" for ${sub.patientName} → ${newSubStatus}`);
    showToast(`Submission marked as ${newSubStatus}`, 'success');
    setReviewModal(null);
    setReviewNotes('');
  };

  const handleCreateTemplate = () => {
    if (!newName.trim()) { showToast('Please enter a template name', 'error'); return; }

    addFormTemplate({
      name: newName.trim(),
      type: newType,
      fields: [],
      status: newStatus,
    });
    addAuditLog('create_template', 'Forms', `Created form template: ${newName.trim()}`);
    showToast(`Template "${newName.trim()}" created`, 'success');
    setNewName('');
    setNewType('intake');
    setNewStatus('Draft');
    setActiveTab('templates');
  };

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'submissions', label: 'Submissions', icon: Eye },
    { id: 'create', label: 'Create Template', icon: Plus },
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Forms Management</h1>

      <div style={styles.tabs}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            style={{ ...styles.tab, ...(activeTab === id ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(id)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={16} />
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* ─── TEMPLATES TAB ─── */}
      {activeTab === 'templates' && (
        <>
          <div style={styles.utilBar}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['All', 'Active', 'Draft', 'Archived'] as const).map((s) => {
                const isActive = s === 'All' ? templateStatusFilter === null : templateStatusFilter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    style={{ ...styles.chip, ...(isActive ? styles.chipActive : {}) }}
                    onClick={() => setTemplateStatusFilter(s === 'All' ? null : s)}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
              {filteredTemplates.length} templates
            </span>
          </div>
          <div style={styles.grid}>
            {filteredTemplates.map((t) => (
              <div key={t.id} style={styles.card}>
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, cursor: 'pointer' }}
                  onClick={() => setExpandedTemplateId(expandedTemplateId === t.id ? null : t.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setExpandedTemplateId(expandedTemplateId === t.id ? null : t.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>{t.name}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ ...styles.badge, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                        {t.type}
                      </span>
                      <span style={{ ...TEMPLATE_STATUS_STYLES[t.status] }}>{t.status}</span>
                    </div>
                  </div>
                  {expandedTemplateId === t.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', gap: 16 }}>
                  <span>{t.fields.length} fields</span>
                  <span style={{ fontWeight: 600 }}>{t.usageCount} uses</span>
                  <span>{t.createdDate}</span>
                </div>
                {expandedTemplateId === t.id && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 10 }}>Fields</div>
                    {t.fields.length === 0 ? (
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No fields defined</div>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {t.fields.map((f: FormField) => (
                          <li
                            key={f.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '6px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13,
                            }}
                          >
                            <span style={{ color: 'var(--color-text)' }}>{f.label}</span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>({f.type})</span>
                            {f.required && (
                              <span style={{ color: 'var(--color-error)', fontSize: 11 }}>*required</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {filteredTemplates.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              No templates match the current filter.
            </div>
          )}
        </>
      )}

      {/* ─── SUBMISSIONS TAB ─── */}
      {activeTab === 'submissions' && (
        <>
          <div style={styles.utilBar}>
            <div style={styles.searchWrap}>
              <Search size={18} color="var(--color-text-muted)" />
              <input
                type="search"
                placeholder="Search by patient or template name..."
                style={styles.searchInput}
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
              />
            </div>
            <select
              value={statusFilter ?? ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              style={{
                padding: '8px 12px', borderRadius: 'var(--radius)',
                border: '1px solid var(--color-border)', fontSize: 13,
                background: 'var(--color-surface)', color: 'var(--color-text)',
              }}
            >
              <option value="">All Status</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Flagged">Flagged</option>
              <option value="Archived">Archived</option>
            </select>
            <button
              type="button"
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={() => {
                const csv = [
                  'Template,Patient,Submitted Date,Status,Reviewed By',
                  ...filteredSubmissions.map((s) =>
                    `"${s.templateName}","${s.patientName}","${s.submittedDate}","${s.status}","${s.reviewedBy ?? ''}"`
                  ),
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'form-submissions.csv';
                link.click();
                URL.revokeObjectURL(url);
                showToast('Submissions exported as CSV', 'success');
              }}
            >
              <Download size={16} /> Export
            </button>
          </div>
          <div style={styles.card}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Template</th>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Submitted</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Reviewed By</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((s) => (
                  <tr key={s.id}>
                    <td style={styles.td}>{s.templateName}</td>
                    <td style={styles.td}><span style={{ fontWeight: 600 }}>{s.patientName}</span></td>
                    <td style={styles.td}>{s.submittedDate}</td>
                    <td style={styles.td}>
                      <span style={STATUS_BADGE_STYLES[s.status]}>{s.status}</span>
                    </td>
                    <td style={styles.td}>{s.reviewedBy ?? '—'}</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {s.status === 'Pending Review' && (
                          <>
                            <button
                              type="button"
                              style={{ ...styles.btn, ...styles.btnSuccess, padding: '4px 10px', fontSize: 11 }}
                              onClick={() => handleSubmissionStatus(s, 'Reviewed')}
                              title="Mark as Reviewed"
                            >
                              <Check size={12} /> Review
                            </button>
                            <button
                              type="button"
                              style={{ ...styles.btn, ...styles.btnDanger, padding: '4px 10px', fontSize: 11 }}
                              onClick={() => { setReviewModal(s); setReviewNotes(''); }}
                              title="Flag for attention"
                            >
                              <Flag size={12} /> Flag
                            </button>
                          </>
                        )}
                        {s.status === 'Reviewed' && (
                          <button
                            type="button"
                            style={{ ...styles.btn, ...styles.btnSecondary, padding: '4px 10px', fontSize: 11 }}
                            onClick={() => handleSubmissionStatus(s, 'Archived')}
                            title="Archive"
                          >
                            <Archive size={12} /> Archive
                          </button>
                        )}
                        {s.status === 'Flagged' && (
                          <>
                            <button
                              type="button"
                              style={{ ...styles.btn, ...styles.btnSuccess, padding: '4px 10px', fontSize: 11 }}
                              onClick={() => handleSubmissionStatus(s, 'Reviewed')}
                            >
                              <Check size={12} /> Resolve
                            </button>
                            <button
                              type="button"
                              style={{ ...styles.btn, ...styles.btnSecondary, padding: '4px 10px', fontSize: 11 }}
                              onClick={() => handleSubmissionStatus(s, 'Archived')}
                            >
                              <Archive size={12} /> Archive
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          style={{ ...styles.btn, ...styles.btnSecondary, padding: '4px 10px', fontSize: 11 }}
                          onClick={() => { setReviewModal(s); setReviewNotes(''); }}
                        >
                          <Eye size={12} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 32 }}>
                      No submissions match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Review Modal */}
          {reviewModal && (
            <div
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
              }}
              onClick={() => setReviewModal(null)}
            >
              <div
                style={{
                  background: 'var(--color-surface)', borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-md)', padding: 24, maxWidth: 520, width: '90%', maxHeight: '80vh', overflow: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ marginBottom: 16, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                  {reviewModal.templateName}
                </h3>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                  Patient: <strong>{reviewModal.patientName}</strong> · Submitted: {reviewModal.submittedDate}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={STATUS_BADGE_STYLES[reviewModal.status]}>{reviewModal.status}</span>
                </div>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16, background: 'var(--color-gray-50)' }}>
                  {Object.entries(reviewModal.data).map(([key, val]) => (
                    <div key={key} style={{ marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 12 }}>{key}: </span>
                      <span style={{ color: 'var(--color-text)' }}>{String(val)}</span>
                    </div>
                  ))}
                  {Object.keys(reviewModal.data).length === 0 && (
                    <div style={{ color: 'var(--color-text-muted)' }}>No data submitted</div>
                  )}
                </div>
                {reviewModal.reviewNotes && (
                  <div style={{ marginBottom: 16, padding: 12, background: 'var(--color-warning-light)', borderRadius: 'var(--radius)', fontSize: 13 }}>
                    <strong>Review Notes:</strong> {reviewModal.reviewNotes}
                  </div>
                )}
                <div style={{ ...styles.formGroup, marginBottom: 16 }}>
                  <label style={styles.label}>Add Review Notes</label>
                  <textarea
                    style={{ ...styles.input, minHeight: 60, resize: 'vertical' }}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Optional review notes..."
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {reviewModal.status === 'Pending Review' && (
                    <>
                      <button
                        type="button"
                        style={{ ...styles.btn, ...styles.btnSuccess }}
                        onClick={() => handleSubmissionStatus(reviewModal, 'Reviewed')}
                      >
                        <Check size={14} /> Mark Reviewed
                      </button>
                      <button
                        type="button"
                        style={{ ...styles.btn, ...styles.btnDanger }}
                        onClick={() => handleSubmissionStatus(reviewModal, 'Flagged')}
                      >
                        <AlertTriangle size={14} /> Flag
                      </button>
                    </>
                  )}
                  {reviewModal.status === 'Flagged' && (
                    <button
                      type="button"
                      style={{ ...styles.btn, ...styles.btnSuccess }}
                      onClick={() => handleSubmissionStatus(reviewModal, 'Reviewed')}
                    >
                      <Check size={14} /> Resolve
                    </button>
                  )}
                  {(reviewModal.status === 'Reviewed' || reviewModal.status === 'Flagged') && (
                    <button
                      type="button"
                      style={{ ...styles.btn, ...styles.btnSecondary }}
                      onClick={() => handleSubmissionStatus(reviewModal, 'Archived')}
                    >
                      <Archive size={14} /> Archive
                    </button>
                  )}
                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnSecondary, marginLeft: 'auto' }}
                    onClick={() => setReviewModal(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── CREATE TEMPLATE TAB ─── */}
      {activeTab === 'create' && (
        <div style={{ ...styles.card, maxWidth: 500 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} style={{ color: 'var(--color-primary)' }} />
            Create Form Template
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Template Name *</label>
              <input
                style={styles.input}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Patient Intake Form"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Type</label>
              <select
                style={styles.input}
                value={newType}
                onChange={(e) => setNewType(e.target.value as FormTemplate['type'])}
              >
                <option value="intake">Intake</option>
                <option value="consent">Consent</option>
                <option value="questionnaire">Questionnaire</option>
                <option value="assessment">Assessment</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                style={styles.input}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as FormTemplate['status'])}
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <button
              style={{ ...styles.btn, ...styles.btnPrimary, alignSelf: 'flex-start', padding: '10px 24px' }}
              onClick={handleCreateTemplate}
            >
              <Plus size={16} /> Create Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
