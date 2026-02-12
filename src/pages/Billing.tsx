import React, { useState } from 'react';
import { Download, CheckCircle, FileText, ChevronRight, ReceiptText } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../components/Common/BackButton';
import './Billing.css';

export const Billing: React.FC = () => {
    const { invoices, notifications, markAsRead, loaRequests } = useData();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Paid'>('All');

    React.useEffect(() => {
        const unread = notifications.filter(n => !n.read && (n.link === '/billing' || n.title.toLowerCase().includes('bill') || n.title.toLowerCase().includes('invoice')));
        unread.forEach(n => markAsRead(n.id));
    }, [notifications, markAsRead]);

    const getLOAForInvoice = (invoice: any) => {
        return loaRequests.find(loa =>
            loa.status === 'Approved' &&
            (loa.provider.toLowerCase().includes(invoice.provider.toLowerCase()) || invoice.provider.toLowerCase().includes(loa.provider.toLowerCase())) &&
            (
                (invoice.type === 'Laboratory' && loa.type === 'Lab Test') ||
                (invoice.type === 'Consultation' && loa.type === 'Consultation') ||
                ((invoice.type === 'Radiology' || invoice.type === 'Procedure') && loa.type === 'Procedure')
            )
        );
    };

    const filteredInvoices = invoices.filter(inv =>
        filter === 'All' ? true : inv.status === filter
    );

    const totalOutstanding = invoices
        .filter(inv => inv.status === 'Pending')
        .reduce((sum, inv) => sum + inv.amount, 0);

    const handlePayNow = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/checkout/${id}`);
    };

    const handleDownload = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        showToast(`Downloading invoice ${id}...`, 'info');
    };

    return (
        <div className="billing-container">
            <header className="page-header">
                <BackButton />
                <div className="header-text">
                    <h2>Billing & Payments</h2>
                    <p className="page-subtitle">Manage your hospital bills and payment history</p>
                </div>
            </header>

            {/* Premium Balance Card */}
            <div className={`premium-balance-card ${totalOutstanding > 0 ? 'has-debt' : 'cleared'}`}>
                <div className="balance-content">
                    <span className="balance-label">Total Outstanding Balance</span>
                    <div className="balance-value-row">
                        <h3 className="balance-amount">₱ {totalOutstanding.toLocaleString()}</h3>
                        {totalOutstanding > 0 && (
                            <button className="pay-outstanding-btn" onClick={(e) => handlePayNow(filteredInvoices.find(i => i.status === 'Pending')?.id || '', e)}>
                                Pay Active Bills
                            </button>
                        )}
                    </div>
                </div>
                {totalOutstanding === 0 && (
                    <div className="cleared-badge">
                        <CheckCircle size={20} />
                        <span>No Unpaid Bills</span>
                    </div>
                )}
                <div className="balance-bg-effect"></div>
            </div>

            {/* Filter Section */}
            <div className="billing-controls">
                <div className="filter-chips">
                    {['All', 'Pending', 'Paid'].map(f => (
                        <button
                            key={f}
                            className={`chip ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f as any)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices List */}
            <div className="invoices-list premium-list">
                {filteredInvoices.length > 0 ? (
                    filteredInvoices.map(invoice => {
                        const hasLOA = getLOAForInvoice(invoice);
                        return (
                            <div key={invoice.id} className="invoice-card-premium" onClick={() => navigate(`/checkout/${invoice.id}`)}>
                                <div className="invoice-icon-box">
                                    <ReceiptText size={24} className={invoice.status.toLowerCase()} />
                                </div>

                                <div className="invoice-main">
                                    <div className="invoice-title-row">
                                        <h4>{invoice.description}</h4>
                                        <div className="invoice-badges">
                                            {hasLOA && <span className="loa-applied-pill">LOA APPLIED</span>}
                                            <span className={`status-pill-v2 ${invoice.status.toLowerCase()}`}>
                                                {invoice.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="invoice-meta-v2">
                                        {invoice.provider} • {invoice.date}
                                    </p>
                                    <p className="invoice-ref-v2">Ref: {invoice.id}</p>
                                </div>

                                <div className="invoice-right">
                                    <div className="invoice-price">
                                        <span className="currency">₱</span>
                                        <span className="price">{invoice.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="invoice-actions-v2">
                                        <button className="icon-btn-v2" onClick={(e) => handleDownload(invoice.id, e)}>
                                            <Download size={18} />
                                        </button>
                                        {invoice.status === 'Pending' && (
                                            <button
                                                className="pay-now-btn-v2"
                                                onClick={(e) => handlePayNow(invoice.id, e)}
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                        {invoice.status === 'Paid' && <ChevronRight size={18} className="chevron-muted" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="billing-empty">
                        <div className="empty-icon">
                            <FileText size={48} />
                        </div>
                        <h3>No transactions found</h3>
                        <p>Your payment history will appear here once available.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
