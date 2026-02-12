import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, Download, Share2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Billing.css';

export const PaymentSuccess: React.FC = () => {
    const location = useLocation();
    const { showToast } = useToast();
    const invoice = location.state?.invoice;

    if (!invoice) return <div>Payment record not found</div>;

    const handleShare = () => {
        showToast('Receipt link copied to clipboard!', 'success');
    };

    return (
        <div className="billing-container success-page">
            <div className="success-content">
                <div className="success-icon-wrapper">
                    <div className="success-bg-pulse"></div>
                    <CheckCircle size={64} color="var(--color-success)" className="check-main" />
                </div>

                <h2 className="success-title">Payment Successful!</h2>
                <p className="success-message">
                    Your payment of <strong>₱{invoice.amount.toLocaleString()}</strong> for {invoice.description} has been processed.
                </p>

                <div className="receipt-preview">
                    <div className="receipt-row">
                        <span>Transaction ID</span>
                        <strong>TXN-{Math.floor(Math.random() * 1000000)}</strong>
                    </div>
                    <div className="receipt-row">
                        <span>Reference No.</span>
                        <strong>{invoice.id}</strong>
                    </div>
                    <div className="receipt-row">
                        <span>Date & Time</span>
                        <strong>{new Date().toLocaleString()}</strong>
                    </div>
                    <div className="receipt-row">
                        <span>Payment Method</span>
                        <strong>Credit Card (ending in 4242)</strong>
                    </div>
                </div>

                <div className="success-actions">
                    <button className="success-btn secondary" onClick={() => showToast('Downloading receipt...', 'info')}>
                        <Download size={18} />
                        <span>Save Receipt</span>
                    </button>
                    <button className="success-btn secondary" onClick={handleShare}>
                        <Share2 size={18} />
                        <span>Share</span>
                    </button>
                </div>

                <div className="success-footer-actions">
                    <Link to="/" className="success-btn primary">
                        <Home size={18} />
                        <span>Back to Dashboard</span>
                    </Link>
                    <Link to="/billing" className="success-link">
                        View Billing History <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};
