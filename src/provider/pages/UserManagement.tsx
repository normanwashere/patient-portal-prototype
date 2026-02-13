import { useState, useMemo } from 'react';
import {
  Users,
  Shield,
  FileText,
  Key,
  Search,
  Download,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import React from 'react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../../theme/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { StaffUser } from '../types';

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 24, background: 'var(--color-background)', minHeight: '100%' },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--color-text)' },
  subtitle: { color: 'var(--color-text-muted)', marginTop: 4, fontSize: 14 },
  tabs: {
    display: 'flex', gap: 4, flexWrap: 'wrap',
    borderBottom: '1px solid var(--color-border)', marginBottom: 20, paddingBottom: 0,
  },
  tab: {
    padding: '12px 16px', fontSize: 14, fontWeight: 600,
    color: 'var(--color-text-muted)', background: 'none', border: 'none',
    borderBottom: '3px solid transparent', cursor: 'pointer', marginBottom: -1,
  },
  tabActive: { color: 'var(--color-primary)', borderBottomColor: 'var(--color-primary)' },
  card: {
    background: 'var(--color-surface)', borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', padding: 20, marginBottom: 20,
  },
  toolbar: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 },
  searchWrap: {
    flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', background: 'var(--color-surface)',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius)',
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: 'var(--color-text)' },
  select: {
    padding: '10px 14px', borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)', fontSize: 14, minWidth: 140,
    background: 'var(--color-surface)', color: 'var(--color-text)',
  },
  chips: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  chip: {
    padding: '6px 12px', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 500,
    border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer',
  },
  chipActive: { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left', padding: '12px 8px', color: 'var(--color-text-muted)',
    fontWeight: 600, borderBottom: '1px solid var(--color-border)',
  },
  td: { padding: '12px 8px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)' },
  avatar: { width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', marginRight: 12 },
  userCell: { display: 'flex', alignItems: 'center' },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 600 },
  statusSelect: {
    padding: '4px 10px', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 600,
    border: '1px solid var(--color-border)', cursor: 'pointer',
  },
  ssoPanel: { maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 },
  ssoRow: { display: 'flex', flexDirection: 'column', gap: 6 },
  ssoLabel: { fontSize: 13, fontWeight: 600, color: 'var(--color-text)' },
  ssoInput: {
    padding: '10px 14px', borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)', fontSize: 14,
    background: 'var(--color-surface)', color: 'var(--color-text)',
  },
  btn: {
    padding: '10px 18px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
  },
  btnPrimary: { background: 'var(--color-primary)', color: 'white' },
  btnSecondary: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  Active: { background: 'var(--color-success-light, #d1fae5)', color: 'var(--color-success)' },
  'On Leave': { background: 'var(--color-warning-light, #fef3c7)', color: 'var(--color-warning)' },
  Inactive: { background: 'var(--color-error-light, #fee2e2)', color: 'var(--color-error)' },
};

function formatRole(role: string): string {
  const map: Record<string, string> = {
    admin: 'Admin', doctor: 'Doctor', nurse: 'Nurse', lab_tech: 'Lab Tech',
    pharmacist: 'Pharmacist', billing_staff: 'Billing', front_desk: 'Front Desk',
    hr: 'HR', imaging_tech: 'Imaging Tech',
  };
  return map[role] ?? role.replace(/_/g, ' ');
}

type TabId = 'users' | 'audit' | 'sso';

export const UserManagement = () => {
  const { tenant } = useTheme();
  const { staff, auditLogs, updateStaffStatus, addAuditLog } = useProvider();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditPage, setAuditPage] = useState(0);
  const AUDIT_PAGE_SIZE = 15;

  // ── Users filtering ──
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = !roleFilter || s.role === roleFilter;
      const matchStatus = !statusFilter || s.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [staff, search, roleFilter, statusFilter]);

  // ── Audit log filtering + pagination ──
  const filteredAuditLogs = useMemo(() => {
    if (!auditSearch) return auditLogs;
    const q = auditSearch.toLowerCase();
    return auditLogs.filter((a) =>
      a.userName.toLowerCase().includes(q) ||
      a.action.toLowerCase().includes(q) ||
      a.module.toLowerCase().includes(q) ||
      a.details.toLowerCase().includes(q)
    );
  }, [auditLogs, auditSearch]);

  const auditPageCount = Math.max(1, Math.ceil(filteredAuditLogs.length / AUDIT_PAGE_SIZE));
  const pagedAuditLogs = filteredAuditLogs.slice(auditPage * AUDIT_PAGE_SIZE, (auditPage + 1) * AUDIT_PAGE_SIZE);

  const handleStatusChange = (staffMember: StaffUser, newStatus: StaffUser['status']) => {
    updateStaffStatus(staffMember.id, newStatus);
    addAuditLog('staff_status_change', 'User Management', `${staffMember.name} status changed to ${newStatus}`);
    showToast(`${staffMember.name} status updated to ${newStatus}`, 'success');
  };

  const allTabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'audit', label: 'Audit Log', icon: FileText },
    { id: 'sso', label: 'SSO Config', icon: Key },
  ];

  const tabs = allTabs.filter((t) => {
    if (t.id === 'sso') return tenant.features.sso === true;
    return true;
  });

  const effectiveActiveTab = tabs.some((t) => t.id === activeTab) ? activeTab : (tabs[0]?.id ?? 'users');

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>User Management</h1>
        <p style={styles.subtitle}>{tenant.name} · Manage staff, audit trail{tenant.features.sso ? ', and SSO' : ''}</p>
      </div>

      <div style={styles.tabs}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            style={{ ...styles.tab, ...(effectiveActiveTab === id ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(id)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon size={16} />
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* ─── USERS TAB ─── */}
      {effectiveActiveTab === 'users' && (
        <div style={styles.card}>
          <div style={styles.toolbar}>
            <div style={styles.searchWrap}>
              <Search size={18} color="var(--color-text-muted)" />
              <input
                type="search"
                placeholder="Search users by name or email..."
                style={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              style={styles.select}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {[...new Set(staff.map((s) => s.role))].map((r) => (
                <option key={r} value={r}>{formatRole(r)}</option>
              ))}
            </select>
            <div style={styles.chips}>
              {(['Active', 'On Leave', 'Inactive'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  style={{ ...styles.chip, ...(statusFilter === s ? styles.chipActive : {}) }}
                  onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => (
                  <tr key={s.id}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <img
                          src={s.photoUrl}
                          alt=""
                          style={styles.avatar}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.name);
                          }}
                        />
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: 'var(--color-info-light, #dbeafe)', color: 'var(--color-info)' }}>
                        {formatRole(s.role)}
                      </span>
                    </td>
                    <td style={styles.td}>{s.department}</td>
                    <td style={styles.td}>{s.email}</td>
                    <td style={styles.td}>
                      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                        <select
                          value={s.status}
                          onChange={(e) => handleStatusChange(s, e.target.value as StaffUser['status'])}
                          style={{
                            ...styles.statusSelect,
                            ...(STATUS_STYLE[s.status] || {}),
                            appearance: 'none',
                            paddingRight: 28,
                          }}
                        >
                          <option value="Active">Active</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <ChevronDown size={14} style={{ position: 'absolute', right: 8, pointerEvents: 'none', color: 'inherit' }} />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 32 }}>
                      No users match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
            Showing {filteredStaff.length} of {staff.length} staff members
          </div>
        </div>
      )}

      {/* ─── AUDIT LOG TAB ─── */}
      {effectiveActiveTab === 'audit' && (
        <div style={styles.card}>
          <div style={styles.toolbar}>
            <div style={styles.searchWrap}>
              <Search size={18} color="var(--color-text-muted)" />
              <input
                type="search"
                placeholder="Search audit log by user, action, module, or details..."
                style={styles.searchInput}
                value={auditSearch}
                onChange={(e) => { setAuditSearch(e.target.value); setAuditPage(0); }}
              />
            </div>
            <button
              type="button"
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={() => {
                const csv = [
                  'Timestamp,User,Action,Module,Details,IP Address',
                  ...filteredAuditLogs.map((a) =>
                    `"${new Date(a.timestamp).toLocaleString()}","${a.userName}","${a.action}","${a.module}","${a.details}","${a.ipAddress}"`
                  ),
                ].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'audit-log.csv';
                link.click();
                URL.revokeObjectURL(url);
                showToast('Audit log exported as CSV', 'success');
              }}
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Module</th>
                  <th style={styles.th}>Details</th>
                  <th style={styles.th}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {pagedAuditLogs.map((a) => (
                  <tr key={a.id}>
                    <td style={styles.td}>{new Date(a.timestamp).toLocaleString()}</td>
                    <td style={styles.td}>{a.userName}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: 'var(--color-info-light, #dbeafe)', color: 'var(--color-info)' }}>
                        {a.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={styles.td}>{a.module}</td>
                    <td style={{ ...styles.td, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.details}
                    </td>
                    <td style={styles.td}>{a.ipAddress}</td>
                  </tr>
                ))}
                {pagedAuditLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 32 }}>
                      No audit entries match the search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {filteredAuditLogs.length} entries · Page {auditPage + 1} of {auditPageCount}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 14px', fontSize: 12 }}
                disabled={auditPage === 0}
                onClick={() => setAuditPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                style={{ ...styles.btn, ...styles.btnSecondary, padding: '6px 14px', fontSize: 12 }}
                disabled={auditPage >= auditPageCount - 1}
                onClick={() => setAuditPage((p) => Math.min(auditPageCount - 1, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SSO CONFIG TAB ─── */}
      {effectiveActiveTab === 'sso' && (
        <div style={styles.card}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} style={{ color: 'var(--color-primary)' }} />
            SSO Configuration
          </h2>
          <div style={styles.ssoPanel}>
            <div style={styles.ssoRow}>
              <label style={styles.ssoLabel}>Provider</label>
              <select style={styles.ssoInput} disabled>
                <option>SAML 2.0</option>
                <option>OAuth2 / OpenID Connect</option>
              </select>
            </div>
            <div style={styles.ssoRow}>
              <label style={styles.ssoLabel}>Endpoint URL</label>
              <input
                type="url"
                style={styles.ssoInput}
                placeholder="https://idp.example.com/sso"
                defaultValue="https://idp.metrogeneral.ph/sso"
                disabled
              />
            </div>
            <div style={styles.ssoRow}>
              <label style={styles.ssoLabel}>Entity ID</label>
              <input
                type="text"
                style={styles.ssoInput}
                defaultValue="urn:metrogeneral:patient-portal"
                disabled
              />
            </div>
            <div style={styles.ssoRow}>
              <label style={styles.ssoLabel}>Certificate (PEM)</label>
              <textarea
                style={{ ...styles.ssoInput, minHeight: 80 }}
                defaultValue="-----BEGIN CERTIFICATE-----\nMIIBkTCB+wIJAK... (mock)\n-----END CERTIFICATE-----"
                disabled
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={styles.ssoLabel}>Enabled</label>
              <input type="checkbox" defaultChecked disabled />
            </div>
            <button
              type="button"
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={() => showToast('SSO connection test successful (mock)', 'success')}
            >
              <CheckCircle2 size={18} />
              Test Connection
            </button>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8, padding: 12, background: 'var(--color-gray-100)', borderRadius: 'var(--radius)' }}>
              SSO configuration is read-only in this demo. Contact your administrator to make changes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
