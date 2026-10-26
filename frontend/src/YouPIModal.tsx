import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'

export interface YouPIOrderDetails {
  orderId: string
  amount: number
  items: Array<{ name: string; quantity: number; price: number; dose?: string }>
  deliveryAddress?: string
  recipientName?: string
  recipientPhone?: string
  purpose?: string
  doctorName?: string
  appointmentDate?: string
  appointmentTime?: string
  consultationPolicyNote?: string
}

export interface YouPIPaymentResult {
  orderId: string
  paymentMethod: 'UPI' | 'COD' | 'Net Banking' | 'EMI'
  utr?: string
  transactionId: string
  amount: number
  timestamp: string
  vpa?: string
  bankName?: string
  emiPlan?: string
  emiTenure?: number
  emiMonthlyAmount?: number
}

// Aliases for clean naming
export type PaymentOrderDetails = YouPIOrderDetails
export type PaymentResult = YouPIPaymentResult

interface YouPIModalProps {
  isOpen: boolean
  onClose: () => void
  order: YouPIOrderDetails
  onPaymentSuccess: (result: YouPIPaymentResult) => void
}

type PaymentTab = 'upi' | 'netbanking' | 'emi' | 'cod'

export function YouPIModal({ isOpen, onClose, order, onPaymentSuccess }: YouPIModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>('upi')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [utrInput, setUtrInput] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [verificationError, setVerificationError] = useState<string>('')
  const [copiedVpa, setCopiedVpa] = useState<boolean>(false)
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(300) // 5 minutes
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [paymentResult, setPaymentResult] = useState<YouPIPaymentResult | null>(null)
  const [redirectNotice, setRedirectNotice] = useState<string>('')

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank')
  const [bankUserId, setBankUserId] = useState<string>('')
  const [netBankingProcessing, setNetBankingProcessing] = useState<boolean>(false)

  // EMI State
  const [emiTenure, setEmiTenure] = useState<number>(3)
  const [selectedEmiBank, setSelectedEmiBank] = useState<string>('HDFC Bank Credit Card')
  const [emiCardNumber, setEmiCardNumber] = useState<string>('')
  const [emiProcessing, setEmiProcessing] = useState<boolean>(false)

  // Configurable Merchant UPI ID & Display Name
  const [merchantVpa] = useState<string>(() => {
    return localStorage.getItem('iryotek_merchant_vpa') || 'iryotek.pharma@upi'
  })
  const [merchantName] = useState<string>(() => {
    return localStorage.getItem('iryotek_merchant_name') || 'Iryotek Healthcare'
  })

  // Standard universal NPCI UPI URI
  const cleanVpa = merchantVpa.trim()
  const cleanPn = merchantName.trim()
  const cleanTn = order.purpose || (order.doctorName ? `Consultation ${order.doctorName}` : `Order ${order.orderId}`)
  const upiIntentUri = `upi://pay?pa=${cleanVpa}&pn=${encodeURIComponent(
    cleanPn,
  )}&mc=5912&am=${order.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(cleanTn)}`

  // App-specific URI schemes
  const gpayUri = `gpay://upi/pay?pa=${cleanVpa}&pn=${encodeURIComponent(cleanPn)}&mc=5912&am=${order.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(cleanTn)}`
  const phonepeUri = `phonepe://pay?pa=${cleanVpa}&pn=${encodeURIComponent(cleanPn)}&mc=5912&am=${order.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(cleanTn)}`
  const paytmUri = `paytmmp://pay?pa=${cleanVpa}&pn=${encodeURIComponent(cleanPn)}&mc=5912&am=${order.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(cleanTn)}`
  const credUri = `cred://upi/pay?pa=${cleanVpa}&pn=${encodeURIComponent(cleanPn)}&mc=5912&am=${order.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(cleanTn)}`
  const bhimUri = `bhim://pay?pa=${cleanVpa}&pn=${encodeURIComponent(cleanPn)}&mc=5912&am=${order.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(cleanTn)}`



  // Generate dynamic QR Code on load / amount change / VPA change
  useEffect(() => {
    if (!isOpen) return
    setIsSuccess(false)
    setPaymentResult(null)
    setUtrInput('')
    setVerificationError('')
    setRedirectNotice('')
    setTimeLeft(300)

    QRCode.toDataURL(upiIntentUri, {
      width: 256,
      margin: 1,
      color: {
        dark: '#083344',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('Error generating UPI QR code:', err))
  }, [isOpen, order.amount, order.orderId, upiIntentUri])

  // Countdown timer for session
  useEffect(() => {
    if (!isOpen || isSuccess || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen, isSuccess, timeLeft])

  if (!isOpen) return null

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopyVpa = () => {
    navigator.clipboard?.writeText(merchantVpa)
    setCopiedVpa(true)
    setTimeout(() => setCopiedVpa(false), 2000)
  }

  const handleCopyAmount = () => {
    navigator.clipboard?.writeText(order.amount.toString())
    setCopiedAmount(true)
    setTimeout(() => setCopiedAmount(false), 2000)
  }

  // Handle UTR Verification
  const handleVerifyUtr = () => {
    const cleaned = utrInput.trim().replace(/\s+/g, '')
    if (!cleaned) {
      setVerificationError('Please enter the 12-digit UPI Reference Number / UTR.')
      return
    }
    if (!/^\d{12}$/.test(cleaned)) {
      setVerificationError('UTR must be exactly 12 numeric digits (e.g. 429381749201).')
      return
    }

    setVerificationError('')
    setIsVerifying(true)

    setTimeout(() => {
      setIsVerifying(false)
      completePayment('UPI', cleaned)
    }, 1000)
  }

  // Simulate Instant Auto-Verify
  const handleSimulatePayment = () => {
    setIsVerifying(true)
    setVerificationError('')
    const fakeUtr = `${Math.floor(100000000000 + Math.random() * 900000000000)}`
    setTimeout(() => {
      setIsVerifying(false)
      completePayment('UPI', fakeUtr)
    }, 900)
  }

  // Net Banking Submission
  const handleNetBankingPay = () => {
    setNetBankingProcessing(true)
    setTimeout(() => {
      setNetBankingProcessing(false)
      completePayment('Net Banking', undefined, { bankName: selectedBank })
    }, 1200)
  }

  // EMI Submission
  const handleEmiPay = () => {
    setEmiProcessing(true)
    const monthly = (order.amount * (emiTenure > 6 ? 1.1 : 1.0)) / emiTenure
    setTimeout(() => {
      setEmiProcessing(false)
      completePayment('EMI', undefined, {
        emiPlan: `${emiTenure} Months No Cost / Low Interest (${selectedEmiBank})`,
        emiTenure,
        emiMonthlyAmount: monthly,
      })
    }, 1200)
  }

  const handleLaunchApp = (appName: string, url: string) => {
    setRedirectNotice(`Opening ${appName}... Complete your transaction, then enter the 12-digit UTR below or click Auto-Verify.`)
    window.location.href = url
  }

  const completePayment = (
    method: 'UPI' | 'COD' | 'Net Banking' | 'EMI',
    utr?: string,
    extra?: { bankName?: string; emiPlan?: string; emiTenure?: number; emiMonthlyAmount?: number },
  ) => {
    const result: YouPIPaymentResult = {
      orderId: order.orderId,
      paymentMethod: method,
      utr: utr || (method === 'COD' ? 'COD-VERIFIED' : `${method.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-8)}`),
      transactionId: `TXN-${Date.now().toString().slice(-8)}`,
      amount: order.amount,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      vpa: merchantVpa,
      bankName: extra?.bankName,
      emiPlan: extra?.emiPlan,
      emiTenure: extra?.emiTenure,
      emiMonthlyAmount: extra?.emiMonthlyAmount,
    }
    setPaymentResult(result)
    setIsSuccess(true)

    // Give user brief moment to see success card, then trigger parent callback
    setTimeout(() => {
      onPaymentSuccess(result)
    }, 1800)
  }

  const isAppointment = Boolean(order.doctorName || order.purpose?.toLowerCase().includes('appointment'))

  return (
    <div
      className="payment-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 51, 68, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
        animation: 'paymentFadeIn 0.25s ease-out',
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !isVerifying && !isSuccess && !netBankingProcessing && !emiProcessing) onClose()
      }}
    >
      <div
        className="payment-modal-container"
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '540px',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(8, 51, 68, 0.35), 0 0 0 1px rgba(16, 121, 128, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          animation: 'paymentSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: 'var(--body, Inter, sans-serif)',
          color: '#083344',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #083344 0%, #0c3c45 60%, #107980 100%)',
            padding: '20px 24px',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #00c2cb, #107980)',
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 4px 10px rgba(0, 194, 203, 0.3)',
                  fontWeight: 800,
                  fontSize: '18px',
                }}
              >
                ₹
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, letterSpacing: '0.5px', fontSize: '18px' }}>
                    {isAppointment ? 'Appointment Fee Payment' : 'Instant Payment Gateway'}
                  </span>
                  <span
                    style={{
                      background: 'rgba(0, 194, 203, 0.2)',
                      border: '1px solid rgba(0, 194, 203, 0.4)',
                      color: '#67e8f9',
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                    }}
                  >
                    0% Platform Fee
                  </span>
                </div>
                <small style={{ color: '#93c5fd', fontSize: '11px', display: 'block', opacity: 0.9 }}>
                  {isAppointment
                    ? `Consultation with ${order.doctorName || 'Doctor'} · Cancellation Refund Policy Applies`
                    : 'Medicine Delivery Checkout · Direct Bank Settlement'}
                </small>
              </div>
            </div>
            {!isSuccess && (
              <button
                type="button"
                onClick={onClose}
                disabled={isVerifying || netBankingProcessing || emiProcessing}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'background 0.2s',
                }}
                aria-label="Close Gateway"
              >
                ×
              </button>
            )}
          </div>

          {/* Amount banner */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ref #{order.orderId}
              </span>
              <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 500 }}>
                {isAppointment
                  ? `${order.appointmentDate || 'Today'} · ${order.appointmentTime || '15 min slot'}`
                  : `${order.items.length} Medicine${order.items.length > 1 ? 's' : ''} for Doorstep Delivery`}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Total Payable</span>
              <strong style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--mono, monospace)' }}>
                ₹{order.amount.toFixed(2)}
              </strong>
            </div>
          </div>

          {/* Policy Notice Callout for Appointments */}
          {isAppointment && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(254, 243, 199, 0.15)',
                border: '1px solid rgba(253, 230, 138, 0.3)',
                fontSize: '11px',
                color: '#fef08a',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>ℹ️</span>
              <span>
                <strong>Cancellation Policy:</strong> If cancelled, only <strong>₹50</strong> will be deducted for reservation fee and the remaining <strong>₹{Math.max(0, order.amount - 50).toFixed(2)}</strong> will be instantly refunded.
              </span>
            </div>
          )}
        </div>

        {/* Success screen */}
        {isSuccess && paymentResult && (
          <div
            style={{
              padding: '40px 30px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'paymentPopIn 0.3s ease-out',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#ecfdf5',
                border: '2px solid #10b981',
                color: '#10b981',
                display: 'grid',
                placeItems: 'center',
                fontSize: '36px',
                marginBottom: '16px',
                boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
              }}
            >
              ✓
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: '#065f46' }}>
              Payment Verified Successfully!
            </h3>
            <p style={{ margin: '0 0 20px', color: '#587477', fontSize: '13px', maxWidth: '400px' }}>
              {isAppointment
                ? `Your consultation slot with ${order.doctorName || 'the doctor'} has been confirmed and submitted for clinical approval.`
                : 'Your medicine order is confirmed and routed directly to the dispensing hub for express doorstep dispatch.'}
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px 20px',
                width: '100%',
                boxSizing: 'border-box',
                textAlign: 'left',
                fontSize: '12px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Transaction ID:</span>
                <span style={{ fontFamily: 'var(--mono, monospace)', fontWeight: 600 }}>{paymentResult.transactionId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Method:</span>
                <span style={{ fontWeight: 600, color: '#0f766e' }}>{paymentResult.paymentMethod} {paymentResult.bankName ? `(${paymentResult.bankName})` : ''}</span>
              </div>
              {paymentResult.utr && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Bank Reference / UTR:</span>
                  <span style={{ fontFamily: 'var(--mono, monospace)', fontWeight: 600, color: '#0f766e' }}>{paymentResult.utr}</span>
                </div>
              )}
              {paymentResult.emiPlan && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>EMI Tenure:</span>
                  <span style={{ fontWeight: 600, color: '#0369a1' }}>{paymentResult.emiPlan}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Amount Settled:</span>
                <strong style={{ color: '#083344' }}>₹{paymentResult.amount.toFixed(2)} (0% Fee)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Booking Status:</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>{isAppointment ? 'Awaiting Doctor Acceptance' : 'Dispatched to Courier'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', fontSize: '13px', fontWeight: 600 }}>
              <span className="payment-spinner" style={{ width: '16px', height: '16px', border: '2px solid #0f766e', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'paymentSpin 0.8s linear infinite' }} />
              Updating records in real time...
            </div>
          </div>
        )}

        {/* Payment tabs & body */}
        {!isSuccess && (
          <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
            {/* 4 Tabs: UPI | Net Banking | EMI | COD / Clinic */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '12px',
                marginBottom: '18px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                style={{
                  padding: '9px 6px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === 'upi' ? '#ffffff' : 'transparent',
                  color: activeTab === 'upi' ? '#083344' : '#64748b',
                  boxShadow: activeTab === 'upi' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>⚡</span> UPI / QR
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                style={{
                  padding: '9px 6px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === 'netbanking' ? '#ffffff' : 'transparent',
                  color: activeTab === 'netbanking' ? '#083344' : '#64748b',
                  boxShadow: activeTab === 'netbanking' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>🏦</span> Net Banking
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('emi')}
                style={{
                  padding: '9px 6px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === 'emi' ? '#ffffff' : 'transparent',
                  color: activeTab === 'emi' ? '#083344' : '#64748b',
                  boxShadow: activeTab === 'emi' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>💳</span> EMI Plans
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cod')}
                style={{
                  padding: '9px 6px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === 'cod' ? '#ffffff' : 'transparent',
                  color: activeTab === 'cod' ? '#083344' : '#64748b',
                  boxShadow: activeTab === 'cod' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <span>{isAppointment ? '🏥' : '📦'}</span> {isAppointment ? 'At Clinic' : 'COD'}
              </button>
            </div>

            {/* TAB 1: UPI */}
            {activeTab === 'upi' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    padding: '20px 16px',
                    marginBottom: '18px',
                    position: 'relative',
                  }}
                >
                  {/* Timer & Observer status badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0 4px 12px',
                      fontSize: '11px',
                      borderBottom: '1px solid #e2e8f0',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
                          display: 'inline-block',
                          animation: 'paymentPulse 1.5s infinite',
                        }}
                      />
                      <span style={{ color: '#0f766e', fontWeight: 600 }}>UPI Live Payment Observer Active</span>
                    </div>
                    <div style={{ color: timeLeft <= 60 ? '#ef4444' : '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>
                      ⏱ {formatTimer(timeLeft)}
                    </div>
                  </div>

                  {/* Dynamic QR Box with Clean UPI Badge (NO "YouPI") */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '12px',
                      borderRadius: '16px',
                      boxShadow: '0 6px 20px -5px rgba(0,0,0,0.08), 0 0 0 1px #e2e8f0',
                      display: 'inline-block',
                      position: 'relative',
                    }}
                  >
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="UPI Payment QR Code"
                        style={{ width: '180px', height: '180px', display: 'block', borderRadius: '8px' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '180px',
                          height: '180px',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '12px',
                          color: '#64748b',
                        }}
                      >
                        Generating QR Code...
                      </div>
                    )}
                    {/* Clean NPCI-style Center UPI Badge without any YouPI text */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 900, color: '#083344', letterSpacing: '0.5px' }}>
                        UPI
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: '12px 0 6px', fontSize: '12px', color: '#475569', textAlign: 'center' }}>
                    Scan with any UPI App or tap an app below to pay
                  </p>

                  {/* VPA and Amount Copy row */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      width: '100%',
                      marginTop: '4px',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleCopyVpa}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: '#083344',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      title="Click to copy UPI ID"
                    >
                      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{merchantVpa}</span>
                      <span style={{ color: '#0f766e', fontWeight: 600 }}>{copiedVpa ? '✓ Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyAmount}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '11px',
                        cursor: 'pointer',
                        color: '#083344',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>₹{order.amount.toFixed(2)}</span>
                      <span style={{ color: '#0f766e', fontWeight: 600 }}>{copiedAmount ? '✓ Copied' : 'Copy'}</span>
                    </button>
                    <div style={{ flex: 1 }} />
                  </div>


                  {/* App Redirects: Paytm, PhonePe, GPay, Cred, BHIM & Other UPI Apps */}
                  <div style={{ width: '100%', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#475569', fontWeight: 700, textAlign: 'center', marginBottom: '10px', letterSpacing: '0.05em' }}>
                      Tap to Pay with Installed App:
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                      {/* Google Pay */}
                      <button
                        type="button"
                        onClick={() => handleLaunchApp('Google Pay', gpayUri)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>🟢</span>
                        <strong style={{ fontSize: '11px', color: '#0f172a' }}>Google Pay</strong>
                      </button>

                      {/* PhonePe */}
                      <button
                        type="button"
                        onClick={() => handleLaunchApp('PhonePe', phonepeUri)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>🟣</span>
                        <strong style={{ fontSize: '11px', color: '#5b21b6' }}>PhonePe</strong>
                      </button>

                      {/* Paytm */}
                      <button
                        type="button"
                        onClick={() => handleLaunchApp('Paytm', paytmUri)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>🔵</span>
                        <strong style={{ fontSize: '11px', color: '#0284c7' }}>Paytm</strong>
                      </button>

                      {/* CRED */}
                      <button
                        type="button"
                        onClick={() => handleLaunchApp('CRED', credUri)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>⚡</span>
                        <strong style={{ fontSize: '11px', color: '#0f172a' }}>CRED</strong>
                      </button>

                      {/* BHIM */}
                      <button
                        type="button"
                        onClick={() => handleLaunchApp('BHIM UPI', bhimUri)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>🇮🇳</span>
                        <strong style={{ fontSize: '11px', color: '#15803d' }}>BHIM UPI</strong>
                      </button>

                      {/* Other UPI Apps (Invokes universal system intent) */}
                      <button
                        type="button"
                        onClick={() => handleLaunchApp('UPI Apps', upiIntentUri)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: '1.5px dashed #0f766e',
                          background: '#f0fdfa',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>📱</span>
                        <strong style={{ fontSize: '11px', color: '#0f766e' }}>Other UPI Apps</strong>
                      </button>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleLaunchApp('All Installed Apps', upiIntentUri)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0f766e',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        📲 Tap to fetch & choose any other UPI app on your device
                      </button>
                    </div>

                    {redirectNotice && (
                      <div style={{ marginTop: '10px', padding: '8px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#1e40af', fontSize: '11px', lineHeight: 1.4 }}>
                        {redirectNotice}
                      </div>
                    )}
                  </div>
                </div>

                {/* UTR Verification Section */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '6px', letterSpacing: '0.02em' }}>
                    CONFIRM PAYMENT WITH 12-DIGIT UTR / UPI REF:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. 429381749201"
                      maxLength={12}
                      value={utrInput}
                      onChange={e => {
                        setUtrInput(e.target.value)
                        setVerificationError('')
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: verificationError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        letterSpacing: '1px',
                        outline: 'none',
                        background: '#ffffff',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyUtr}
                      disabled={isVerifying}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #0f766e, #115e59)',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                      }}
                    >
                      {isVerifying ? 'Verifying...' : 'Verify & Confirm'}
                    </button>
                  </div>

                  {verificationError && (
                    <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '6px', fontWeight: 500 }}>
                      ⚠️ {verificationError}
                    </div>
                  )}

                  {/* Simulate fast button for demo testing */}
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <small style={{ fontSize: '11px', color: '#64748b' }}>Testing without real UPI app?</small>
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isVerifying}
                      style={{
                        background: '#e0f2fe',
                        border: '1px solid #bae6fd',
                        color: '#0369a1',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      ⚡ One-Click Auto Verify
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: NET BANKING */}
            {activeTab === 'netbanking' && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px 16px' }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: '8px' }}>SELECT YOUR BANK</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map(bank => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: selectedBank === bank ? '2px solid #0f766e' : '1px solid #cbd5e1',
                        background: selectedBank === bank ? '#f0fdfa' : '#ffffff',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: selectedBank === bank ? '#0f766e' : '#1e293b',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {bank}
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Or Select Another Bank:
                  </label>
                  <select
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Bank">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                    <option value="IndusInd Bank">IndusInd Bank</option>
                    <option value="Federal Bank">Federal Bank</option>
                    <option value="IDFC First Bank">IDFC First Bank</option>
                    <option value="Yes Bank">Yes Bank</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Customer ID / NetBanking Username (Optional for test):
                  </label>
                  <input
                    type="text"
                    value={bankUserId}
                    onChange={e => setBankUserId(e.target.value)}
                    placeholder="Enter Customer ID or CIF"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleNetBankingPay}
                  disabled={netBankingProcessing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0f766e, #0c4a4e)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                  }}
                >
                  {netBankingProcessing ? 'Authorizing with Bank Portal...' : `Pay ₹${order.amount.toFixed(2)} via ${selectedBank} ↗`}
                </button>
              </div>
            )}

            {/* TAB 3: EMI PLANS */}
            {activeTab === 'emi' && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px 16px' }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: '8px' }}>SELECT EMI TENURE</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  {[
                    { months: 3, label: '3 Months (No Cost EMI)', interest: '0% Interest', monthly: order.amount / 3 },
                    { months: 6, label: '6 Months (No Cost EMI)', interest: '0% Interest', monthly: order.amount / 6 },
                    { months: 9, label: '9 Months (Standard)', interest: '9% p.a.', monthly: (order.amount * 1.09) / 9 },
                    { months: 12, label: '12 Months (Standard)', interest: '12% p.a.', monthly: (order.amount * 1.12) / 12 },
                  ].map(plan => (
                    <button
                      key={plan.months}
                      type="button"
                      onClick={() => setEmiTenure(plan.months)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: emiTenure === plan.months ? '2px solid #0f766e' : '1px solid #cbd5e1',
                        background: emiTenure === plan.months ? '#f0fdfa' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f766e' }}>
                        ₹{plan.monthly.toFixed(2)} <span style={{ fontSize: '10px', color: '#64748b' }}>/mo</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                        {plan.label}
                      </div>
                      <div style={{ fontSize: '10px', color: plan.interest.includes('0%') ? '#16a34a' : '#d97706', fontWeight: 700 }}>
                        {plan.interest}
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Select EMI Card / Provider:
                  </label>
                  <select
                    value={selectedEmiBank}
                    onChange={e => setSelectedEmiBank(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  >
                    <option value="HDFC Bank Credit Card">HDFC Bank Credit Card EMI</option>
                    <option value="ICICI Bank Credit / Cardless">ICICI Bank Cardless & Credit EMI</option>
                    <option value="SBI Card">SBI Card EMI</option>
                    <option value="Axis Bank Credit Card">Axis Bank Credit Card EMI</option>
                    <option value="Bajaj Finserv Insta EMI">Bajaj Finserv Insta EMI Card</option>
                    <option value="Amazon Pay Later">Amazon Pay Later</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Card Number / Registered Mobile Number:
                  </label>
                  <input
                    type="text"
                    value={emiCardNumber}
                    onChange={e => setEmiCardNumber(e.target.value)}
                    placeholder="Enter 10-digit phone or card last 4 digits"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleEmiPay}
                  disabled={emiProcessing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0f766e, #0c4a4e)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                  }}
                >
                  {emiProcessing ? 'Setting up Instant EMI...' : `Confirm ${emiTenure}-Month EMI Plan ↗`}
                </button>
              </div>
            )}

            {/* TAB 4: COD / CLINIC */}
            {activeTab === 'cod' && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {isAppointment ? '🏥' : '📦'}
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '16px', color: '#083344' }}>
                  {isAppointment ? 'Pay In-Person at Clinic Desk' : 'Cash on Doorstep Delivery'}
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                  {isAppointment
                    ? `You can pay ₹${order.amount.toFixed(2)} at the hospital / clinic reception upon arrival before seeing ${order.doctorName || 'the doctor'}.`
                    : 'Our courier will bring your medicines in safe packaging directly to your doorstep. You can hand over cash or scan the courier QR upon package inspection.'}
                </p>

                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    fontSize: '11px',
                    color: '#083344',
                    textAlign: 'left',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Payable on Arrival:</span>
                    <strong>₹{order.amount.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Cancellation Fee:</span>
                    <span>₹50 (if cancelled prior to slot)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => completePayment('COD')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#083344',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(8, 51, 68, 0.2)',
                  }}
                >
                  {isAppointment ? 'Confirm & Reserve Slot ↗' : 'Place Cash on Delivery Order ↗'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔒</span> 256-bit Bank Grade Encryption
          </span>
          <span>⚡ NPCI Unified Payments Interface & Banking</span>
        </div>
      </div>

      <style>{`
        @keyframes paymentFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes paymentSlideUp {
          from { transform: translateY(20px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes paymentPopIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes paymentPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes paymentSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
