import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Building2, Calendar, Phone, Mail, CheckCircle, Shield, ChevronRight, Eye, EyeOff, Lock } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useToast } from '../context/ToastContext';

type ActivationStep = 'method' | 'form' | 'otp' | 'mfa-setup' | 'success';
type ActivationMethod = 'card' | 'employee' | null;

export const MemberActivation: React.FC = () => {
    const navigate = useNavigate();
    const { tenant } = useTheme();
    const { showToast } = useToast();

    const [step, setStep] = useState<ActivationStep>('method');
    const [method, setMethod] = useState<ActivationMethod>(null);

    // Card method fields
    const [cardNumber, setCardNumber] = useState('');
    // Employee method fields
    const [companyCode, setCompanyCode] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    // Common fields
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [noMiddleName, setNoMiddleName] = useState(false);
    const [lastName, setLastName] = useState('');
    const [suffix, setSuffix] = useState('');
    const [dob, setDob] = useState('');
    const [mobileNumber, setMobileNumber] = useState('+63');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreeConsent, setAgreeConsent] = useState(false);

    // OTP fields
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [otpTimer, setOtpTimer] = useState(60);
    const [isVerifying, setIsVerifying] = useState(false);

    // MFA setup
    const [mfaMethod, setMfaMethod] = useState<'sms' | 'email' | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const primaryColor = tenant.colors.primary;
    const bgTint = tenant.colors.background;

    React.useEffect(() => {
        if (step === 'otp' && otpTimer > 0) {
            const timer = setInterval(() => setOtpTimer(t => t - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [step, otpTimer]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otpCode];
        newOtp[index] = value;
        setOtpCode(newOtp);
        if (value && index < 5) {
            const next = document.getElementById(`otp-${index + 1}`);
            next?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            const prev = document.getElementById(`otp-${index - 1}`);
            prev?.focus();
        }
    };

    const isFormValid = () => {
        if (method === 'card' && !cardNumber.trim()) return false;
        if (method === 'employee' && (!companyCode.trim() || !employeeId.trim())) return false;
        if (!firstName.trim() || !lastName.trim()) return false;
        if (!noMiddleName && !middleName.trim()) return false;
        if (!dob || !mobileNumber || mobileNumber.length < 5) return false;
        if (!email || !confirmEmail || email !== confirmEmail) return false;
        if (!agreeTerms || !agreeConsent) return false;
        return true;
    };

    const handleActivate = () => {
        if (!isFormValid()) {
            showToast('Please complete all required fields', 'error');
            return;
        }
        setStep('otp');
        setOtpTimer(60);
    };

    const handleVerifyOtp = () => {
        const code = otpCode.join('');
        if (code.length < 6) {
            showToast('Please enter the complete 6-digit code', 'error');
            return;
        }
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            setStep('mfa-setup');
        }, 1500);
    };

    const handleMfaComplete = () => {
        if (!password || password.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        if (!mfaMethod) {
            showToast('Please select an MFA method', 'error');
            return;
        }
        setStep('success');
    };

    const handleResendOtp = () => {
        setOtpTimer(60);
        setOtpCode(['', '', '', '', '', '']);
        showToast('A new OTP has been sent to your mobile number', 'success');
    };

    const styles: Record<string, React.CSSProperties> = {
        page: {
            minHeight: '100vh',
            background: bgTint,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        container: {
            width: '100%',
            maxWidth: 520,
            padding: '0 16px 40px',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 0',
            position: 'relative',
            borderBottom: `1px solid ${tenant.colors.border}`,
            marginBottom: 24,
        },
        backBtn: {
            position: 'absolute',
            left: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            color: tenant.colors.text,
            display: 'flex',
            alignItems: 'center',
        },
        title: {
            fontSize: 16,
            fontWeight: 700,
            color: tenant.colors.text,
            margin: 0,
        },
        card: {
            background: tenant.colors.surface,
            borderRadius: 12,
            border: `1px solid ${tenant.colors.border}`,
            padding: 20,
            marginBottom: 16,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 700,
            color: tenant.colors.text,
            marginBottom: 8,
        },
        sectionDesc: {
            fontSize: 14,
            color: tenant.colors.textMuted,
            marginBottom: 20,
            lineHeight: 1.5,
        },
        methodCard: {
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: 16,
            borderRadius: 10,
            border: `1px solid ${tenant.colors.border}`,
            background: tenant.colors.surface,
            cursor: 'pointer',
            marginBottom: 12,
            transition: 'all 0.15s ease',
        },
        methodIcon: {
            width: 44,
            height: 44,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        },
        label: {
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: tenant.colors.text,
            marginBottom: 6,
        },
        input: {
            width: '100%',
            padding: '12px 14px',
            borderRadius: 8,
            border: `1px solid ${tenant.colors.border}`,
            fontSize: 14,
            color: tenant.colors.text,
            background: tenant.colors.surface,
            fontFamily: 'inherit',
            boxSizing: 'border-box' as const,
            outline: 'none',
        },
        inputWithIcon: {
            width: '100%',
            padding: '12px 14px 12px 42px',
            borderRadius: 8,
            border: `1px solid ${tenant.colors.border}`,
            fontSize: 14,
            color: tenant.colors.text,
            background: tenant.colors.surface,
            fontFamily: 'inherit',
            boxSizing: 'border-box' as const,
            outline: 'none',
        },
        checkRow: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            marginBottom: 12,
            fontSize: 13,
            color: tenant.colors.text,
            lineHeight: 1.5,
        },
        primaryBtn: {
            width: '100%',
            padding: '14px 0',
            borderRadius: 10,
            border: 'none',
            background: primaryColor,
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'opacity 0.15s',
        },
        disabledBtn: {
            opacity: 0.45,
            cursor: 'not-allowed',
        },
        link: {
            color: primaryColor,
            textDecoration: 'none',
            fontWeight: 600,
            cursor: 'pointer',
        },
    };

    const handleBack = () => {
        if (step === 'method') navigate('/profile');
        else if (step === 'form') setStep('method');
        else if (step === 'otp') setStep('form');
        else if (step === 'mfa-setup') setStep('otp');
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                {step !== 'success' && (
                    <div style={styles.header}>
                        <button style={styles.backBtn} onClick={handleBack}>
                            <ArrowLeft size={20} />
                        </button>
                        <h1 style={styles.title}>Activate Member Gateway Account</h1>
                    </div>
                )}

                {/* ═══ Step 1: Select Activation Method ═══ */}
                {step === 'method' && (
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>Select your activation method</h2>
                        <p style={styles.sectionDesc}>
                            Choose from the options below to activate your Member Gateway Account
                        </p>

                        <div
                            style={{
                                ...styles.methodCard,
                                borderColor: method === 'card' ? primaryColor : tenant.colors.border,
                                background: method === 'card' ? `color-mix(in srgb, ${primaryColor} 4%, ${tenant.colors.surface})` : tenant.colors.surface,
                            }}
                            onClick={() => { setMethod('card'); setStep('form'); }}
                        >
                            <div style={{ ...styles.methodIcon, background: `color-mix(in srgb, ${primaryColor} 12%, transparent)` }}>
                                <CreditCard size={22} style={{ color: primaryColor }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 600, color: tenant.colors.text }}>
                                    Maxicare Card
                                </div>
                                <div style={{ fontSize: 13, color: tenant.colors.textMuted, marginTop: 2 }}>
                                    Optimize your well-being with Maxicare HMO.
                                </div>
                            </div>
                            <ChevronRight size={18} style={{ color: tenant.colors.textMuted }} />
                        </div>

                        <div
                            style={{
                                ...styles.methodCard,
                                borderColor: method === 'employee' ? primaryColor : tenant.colors.border,
                                background: method === 'employee' ? `color-mix(in srgb, ${primaryColor} 4%, ${tenant.colors.surface})` : tenant.colors.surface,
                            }}
                            onClick={() => { setMethod('employee'); setStep('form'); }}
                        >
                            <div style={{ ...styles.methodIcon, background: `color-mix(in srgb, ${primaryColor} 12%, transparent)` }}>
                                <Building2 size={22} style={{ color: primaryColor }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 600, color: tenant.colors.text }}>
                                    Employee ID and corporate code
                                </div>
                                <div style={{ fontSize: 13, color: tenant.colors.textMuted, marginTop: 2 }}>
                                    Prioritize health with your employer-provided Corporate Membership for a healthy workforce.
                                </div>
                            </div>
                            <ChevronRight size={18} style={{ color: tenant.colors.textMuted }} />
                        </div>
                    </div>
                )}

                {/* ═══ Step 2: Activation Form ═══ */}
                {step === 'form' && (
                    <div style={styles.card}>
                        <p style={{ fontSize: 14, color: tenant.colors.textMuted, marginBottom: 20, lineHeight: 1.5 }}>
                            Activate your Member Gateway Account with your details for personalized healthcare benefits!
                        </p>

                        {method === 'card' && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={styles.label}>Maxicare Card Number</label>
                                <div style={{ position: 'relative' }}>
                                    <CreditCard size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tenant.colors.textMuted }} />
                                    <input
                                        style={styles.inputWithIcon}
                                        placeholder="1168 0000 0000 0000"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {method === 'employee' && (
                            <>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={styles.label}>Company Code</label>
                                    <input
                                        style={styles.input}
                                        placeholder=""
                                        value={companyCode}
                                        onChange={(e) => setCompanyCode(e.target.value)}
                                    />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={styles.label}>Employee ID</label>
                                    <input
                                        style={styles.input}
                                        placeholder=""
                                        value={employeeId}
                                        onChange={(e) => setEmployeeId(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label style={styles.label}>First Name</label>
                            <input style={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>

                        <div style={{ marginBottom: 8 }}>
                            <label style={styles.label}>Middle Name</label>
                            <input
                                style={{ ...styles.input, opacity: noMiddleName ? 0.5 : 1 }}
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                disabled={noMiddleName}
                            />
                        </div>
                        <label style={{ ...styles.checkRow, marginBottom: 16, fontSize: 12, color: tenant.colors.textMuted }}>
                            <input
                                type="checkbox"
                                checked={noMiddleName}
                                onChange={(e) => { setNoMiddleName(e.target.checked); if (e.target.checked) setMiddleName(''); }}
                                style={{ marginTop: 2, accentColor: primaryColor }}
                            />
                            I don't have a middle name
                        </label>

                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                            <div style={{ flex: 3 }}>
                                <label style={styles.label}>Last Name</label>
                                <input style={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={styles.label}>Suffix</label>
                                <input style={styles.input} placeholder="" value={suffix} onChange={(e) => setSuffix(e.target.value)} />
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={styles.label}>Date of Birth</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tenant.colors.textMuted, pointerEvents: 'none' }} />
                                <input
                                    type="date"
                                    style={styles.inputWithIcon}
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    placeholder="Select a date"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={styles.label}>Mobile Number</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tenant.colors.textMuted }} />
                                <input
                                    style={styles.inputWithIcon}
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="+63"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={styles.label}>Email Address</label>
                            <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={styles.label}>Confirm Email Address</label>
                            <input
                                style={{
                                    ...styles.input,
                                    borderColor: confirmEmail && email !== confirmEmail ? '#ef4444' : tenant.colors.border,
                                }}
                                type="email"
                                value={confirmEmail}
                                onChange={(e) => setConfirmEmail(e.target.value)}
                            />
                        </div>

                        <label style={styles.checkRow}>
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                style={{ marginTop: 2, accentColor: primaryColor }}
                            />
                            <span>
                                I have carefully reviewed and understood the{' '}
                                <span style={styles.link}>Terms & Conditions</span> and{' '}
                                <span style={styles.link}>Privacy Policy</span>.
                            </span>
                        </label>

                        <label style={styles.checkRow}>
                            <input
                                type="checkbox"
                                checked={agreeConsent}
                                onChange={(e) => setAgreeConsent(e.target.checked)}
                                style={{ marginTop: 2, accentColor: primaryColor }}
                            />
                            <span>
                                I hereby agree to the terms outlined in the{' '}
                                <span style={styles.link}>Member Consent</span> agreement.
                            </span>
                        </label>

                        <p style={{ fontSize: 12, color: tenant.colors.textMuted, textAlign: 'center', margin: '16px 0' }}>
                            You will receive an OTP via SMS when you activate
                        </p>

                        <button
                            style={{
                                ...styles.primaryBtn,
                                ...(isFormValid() ? {} : styles.disabledBtn),
                            }}
                            onClick={handleActivate}
                            disabled={!isFormValid()}
                        >
                            Activate
                        </button>
                    </div>
                )}

                {/* ═══ Step 3: OTP Verification ═══ */}
                {step === 'otp' && (
                    <div style={styles.card}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: `color-mix(in srgb, ${primaryColor} 12%, transparent)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <Phone size={28} style={{ color: primaryColor }} />
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: tenant.colors.text, marginBottom: 8 }}>
                                Verify your number
                            </h2>
                            <p style={{ fontSize: 14, color: tenant.colors.textMuted, lineHeight: 1.5 }}>
                                We sent a 6-digit code to <strong>{mobileNumber || '+63 9XX XXX XXXX'}</strong>.
                                Enter it below to continue.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                            {otpCode.map((digit, i) => (
                                <input
                                    key={i}
                                    id={`otp-${i}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    style={{
                                        width: 48, height: 56, textAlign: 'center',
                                        fontSize: 22, fontWeight: 700,
                                        borderRadius: 10,
                                        border: `2px solid ${digit ? primaryColor : tenant.colors.border}`,
                                        color: tenant.colors.text,
                                        background: tenant.colors.surface,
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        transition: 'border-color 0.15s',
                                    }}
                                    autoFocus={i === 0}
                                />
                            ))}
                        </div>

                        <button
                            style={{
                                ...styles.primaryBtn,
                                marginBottom: 16,
                                ...(otpCode.join('').length < 6 || isVerifying ? styles.disabledBtn : {}),
                            }}
                            onClick={handleVerifyOtp}
                            disabled={otpCode.join('').length < 6 || isVerifying}
                        >
                            {isVerifying ? 'Verifying...' : 'Verify Code'}
                        </button>

                        <div style={{ textAlign: 'center', fontSize: 13, color: tenant.colors.textMuted }}>
                            {otpTimer > 0 ? (
                                <span>Resend code in <strong>{otpTimer}s</strong></span>
                            ) : (
                                <button
                                    onClick={handleResendOtp}
                                    style={{ background: 'none', border: 'none', color: primaryColor, fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
                                >
                                    Resend Code
                                </button>
                            )}
                        </div>

                        <p style={{ fontSize: 11, color: tenant.colors.textMuted, textAlign: 'center', marginTop: 16 }}>
                            This is a simulated OTP — enter any 6 digits to proceed.
                        </p>
                    </div>
                )}

                {/* ═══ Step 4: MFA Setup & Password ═══ */}
                {step === 'mfa-setup' && (
                    <div style={styles.card}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: `color-mix(in srgb, ${primaryColor} 12%, transparent)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <Shield size={28} style={{ color: primaryColor }} />
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: tenant.colors.text, marginBottom: 8 }}>
                                Secure your account
                            </h2>
                            <p style={{ fontSize: 14, color: tenant.colors.textMuted, lineHeight: 1.5 }}>
                                Create a password and set up multi-factor authentication to protect your account.
                            </p>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={styles.label}>Create Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tenant.colors.textMuted }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    style={styles.inputWithIcon}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                >
                                    {showPassword ? <EyeOff size={16} style={{ color: tenant.colors.textMuted }} /> : <Eye size={16} style={{ color: tenant.colors.textMuted }} />}
                                </button>
                            </div>
                            {password && (
                                <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} style={{
                                            flex: 1, height: 3, borderRadius: 2,
                                            background: password.length >= i * 3
                                                ? (password.length >= 12 ? '#10b981' : password.length >= 8 ? '#f59e0b' : '#ef4444')
                                                : tenant.colors.border,
                                        }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={styles.label}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tenant.colors.textMuted }} />
                                <input
                                    type="password"
                                    style={{
                                        ...styles.inputWithIcon,
                                        borderColor: confirmPassword && password !== confirmPassword ? '#ef4444' : tenant.colors.border,
                                    }}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ ...styles.label, marginBottom: 10 }}>Multi-Factor Authentication</label>
                            <p style={{ fontSize: 13, color: tenant.colors.textMuted, marginBottom: 12 }}>
                                Choose how you'd like to receive your verification codes when signing in.
                            </p>

                            <div
                                style={{
                                    ...styles.methodCard,
                                    marginBottom: 8,
                                    borderColor: mfaMethod === 'sms' ? primaryColor : tenant.colors.border,
                                    background: mfaMethod === 'sms' ? `color-mix(in srgb, ${primaryColor} 4%, ${tenant.colors.surface})` : tenant.colors.surface,
                                }}
                                onClick={() => setMfaMethod('sms')}
                            >
                                <Phone size={18} style={{ color: mfaMethod === 'sms' ? primaryColor : tenant.colors.textMuted }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: tenant.colors.text }}>SMS Code</div>
                                    <div style={{ fontSize: 12, color: tenant.colors.textMuted }}>Receive codes via text message</div>
                                </div>
                                {mfaMethod === 'sms' && <CheckCircle size={18} style={{ color: primaryColor }} />}
                            </div>

                            <div
                                style={{
                                    ...styles.methodCard,
                                    marginBottom: 0,
                                    borderColor: mfaMethod === 'email' ? primaryColor : tenant.colors.border,
                                    background: mfaMethod === 'email' ? `color-mix(in srgb, ${primaryColor} 4%, ${tenant.colors.surface})` : tenant.colors.surface,
                                }}
                                onClick={() => setMfaMethod('email')}
                            >
                                <Mail size={18} style={{ color: mfaMethod === 'email' ? primaryColor : tenant.colors.textMuted }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: tenant.colors.text }}>Email Code</div>
                                    <div style={{ fontSize: 12, color: tenant.colors.textMuted }}>Receive codes via email</div>
                                </div>
                                {mfaMethod === 'email' && <CheckCircle size={18} style={{ color: primaryColor }} />}
                            </div>
                        </div>

                        <button
                            style={{
                                ...styles.primaryBtn,
                                ...(!password || !confirmPassword || password !== confirmPassword || !mfaMethod ? styles.disabledBtn : {}),
                            }}
                            onClick={handleMfaComplete}
                            disabled={!password || !confirmPassword || password !== confirmPassword || !mfaMethod}
                        >
                            Complete Setup
                        </button>
                    </div>
                )}

                {/* ═══ Step 5: Success ═══ */}
                {step === 'success' && (
                    <div style={{ ...styles.card, textAlign: 'center', marginTop: 40, padding: 32 }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: '#d1fae5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                        }}>
                            <CheckCircle size={40} style={{ color: '#10b981' }} />
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: tenant.colors.text, marginBottom: 8 }}>
                            Account Activated!
                        </h2>
                        <p style={{ fontSize: 14, color: tenant.colors.textMuted, lineHeight: 1.6, marginBottom: 8 }}>
                            Your Member Gateway Account has been successfully activated. You can now access your healthcare benefits, memberships, and services through the portal.
                        </p>
                        <p style={{ fontSize: 13, color: tenant.colors.textMuted, marginBottom: 28 }}>
                            Welcome, <strong>{firstName} {lastName}</strong>!
                        </p>

                        <button
                            style={styles.primaryBtn}
                            onClick={() => navigate('/dashboard')}
                        >
                            Go to Dashboard
                        </button>
                        <button
                            style={{
                                width: '100%', padding: '12px 0', borderRadius: 10,
                                border: `1px solid ${tenant.colors.border}`,
                                background: tenant.colors.surface, color: tenant.colors.text,
                                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                fontFamily: 'inherit', marginTop: 10,
                            }}
                            onClick={() => navigate('/profile')}
                        >
                            View Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
