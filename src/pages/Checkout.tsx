import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

import { CreditCard, ShieldCheck, Wallet, ChevronRight, Check } from 'lucide-react';
import './Billing.css';

export const Checkout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { invoices, payInvoice } = useData();
    const invoice = invoices.find(inv => inv.id === id);
    const [method, setMethod] = React.useState<'card' | 'wallet' | 'bank'>('card');
    const [isProcessing, setIsProcessing] = React.useState(false);

    if (!invoice) return <div>Invoice not found</div>;

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate network delay
        setTimeout(() => {
            payInvoice(invoice.id);
            navigate('/payment-success', { state: { invoice } });
        }, 2000);
    };

    const fee = invoice.amount * 0.02; // 2% convenience fee for simulation

    return (
        <div className="billing-container checkout-page">
            <header className="page-header">

                <div className="header-text">
                    <h2 style={{ fontSize: '1.25rem' }}>Payment Summary</h2>
                    <p className="page-subtitle">Review and confirm your payment</p>
                </div>
            </header>

            <div className="checkout-card">
                <div className="checkout-section">
                    <h3 className="section-title">Invoice Details</h3>
                    <div className="detail-row">
                        <span>Description</span>
                        <strong>{invoice.description}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Provider</span>
                        <strong>{invoice.provider}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Reference</span>
                        <strong>{invoice.id}</strong>
                    </div>
                </div>

                <div className="checkout-divider" />

                <div className="checkout-section">
                    <h3 className="section-title">Payment Method</h3>
                    <div className="payment-methods">
                        <div
                            className={`method-opt ${method === 'card' ? 'active' : ''}`}
                            onClick={() => setMethod('card')}
                        >
                            <CreditCard size={20} />
                            <span>Credit/Debit</span>
                            {method === 'card' && <Check size={16} className="check-icon" />}
                        </div>
                        <div
                            className={`method-opt ${method === 'wallet' ? 'active' : ''}`}
                            onClick={() => setMethod('wallet')}
                        >
                            <Wallet size={20} />
                            <span>e-Wallet (GCash/Maya)</span>
                            {method === 'wallet' && <Check size={16} className="check-icon" />}
                        </div>
                    </div>
                </div>

                <div className="checkout-divider" />

                <div className="checkout-section total-section">
                    <div className="price-breakdown">
                        <div className="price-row">
                            <span>Subtotal</span>
                            <span>₱{invoice.amount.toLocaleString()}</span>
                        </div>
                        <div className="price-row">
                            <span>Convenience Fee</span>
                            <span>₱{fee.toLocaleString()}</span>
                        </div>
                        <div className="price-row total">
                            <span>Total Amount</span>
                            <span>₱{(invoice.amount + fee).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <button
                    className={`pay-now-btn ${isProcessing ? 'processing' : ''}`}
                    onClick={handlePayment}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <div className="spinner-small"></div>
                    ) : (
                        <>
                            <span>Pay ₱{(invoice.amount + fee).toLocaleString()}</span>
                            <ChevronRight size={20} />
                        </>
                    )}
                </button>

                <div className="secure-badge">
                    <ShieldCheck size={14} />
                    <span>Secure encrypted payment powered by Stitch Pay</span>
                </div>
            </div>
        </div>
    );
};
