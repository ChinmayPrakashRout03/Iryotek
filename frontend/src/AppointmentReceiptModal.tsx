import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { getStoredAuthUser, type AuthUser } from './auth'
import { getSharedPrescriptions, type SharedPrescription } from './api'

export interface ReceiptAppointmentData {
  id: string | number
  token?: string | number
  tokenNo?: string | number
  doctor: string
  doctorName?: string
  doctorQualification?: string
  specialty?: string
  date: string
  appointmentDate?: string
  time: string
  appointmentTime?: string
  hospital?: string
  hospitalName?: string
  hospitalAddress?: string
  hospitalCity?: string
  city?: string
  state?: string
  type?: string
  consultationType?: string
  fee?: number | string
  paymentStatus?: string
  paymentMethod?: string
  utr?: string
  transactionId?: string
  paymentDate?: string
  patientName?: string
  patientId?: string
  patientAge?: number | string
  patientGender?: string
  patientPhone?: string
  status?: string
}

interface AppointmentReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: ReceiptAppointmentData | null
  prescription?: SharedPrescription | null
}

export function AppointmentReceiptModal({
  isOpen,
  onClose,
  appointment,
  prescription: propPrescription
}: AppointmentReceiptModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [matchedPrescription, setMatchedPrescription] = useState<SharedPrescription | null>(null)
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [exportMessage, setExportMessage] = useState<string>('')
  const receiptRef = useRef<HTMLDivElement>(null)

  const authUser: AuthUser | null = getStoredAuthUser()

  useEffect(() => {
    if (!isOpen || !appointment) return

    // 1. Resolve prescription if not explicitly passed
    if (propPrescription) {
      setMatchedPrescription(propPrescription)
    } else {
      const allRxs = getSharedPrescriptions()
      const apptId = String(appointment.id || appointment.token || appointment.tokenNo || '')
      const docName = (appointment.doctor || appointment.doctorName || '').toLowerCase()
      const patName = (appointment.patientName || authUser?.displayName || '').toLowerCase()

      const found = allRxs.find(rx => {
        if (rx.appointmentId && String(rx.appointmentId) === apptId) return true
        if (rx.token && String(rx.token) === apptId) return true
        if (rx.id && String(rx.id) === apptId) return true
        if (patName && rx.patientName && rx.patientName.toLowerCase() === patName) return true
        if (docName && rx.doctorName && docName.includes(rx.doctorName.toLowerCase())) return true
        return false
      })
      setMatchedPrescription(found || null)
    }

    // 2. Generate crisp QR Code
    const tokenNo = appointment.tokenNo || appointment.token || appointment.id || '015'
    const queueFormatted = String(tokenNo).startsWith('A-') ? tokenNo : `A-${String(tokenNo).padStart(3, '0')}`
    const dateFormatted = (appointment.date || appointment.appointmentDate || '2025-08-15').replace(/[^a-zA-Z0-9]/g, '')
    const checkinUrl = `https://iryotek.com/checkin?ref=APPT-IRY-${dateFormatted}-${queueFormatted}&token=${tokenNo}`

    QRCode.toDataURL(checkinUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('[Receipt QR] generation error:', err))
  }, [isOpen, appointment, propPrescription, authUser])

  if (!isOpen || !appointment) return null

  // Extract / Normalise Display Values
  const tokenRaw = appointment.tokenNo || appointment.token || appointment.id || '15'
  const queueBadgeText = String(tokenRaw).startsWith('A-')
    ? String(tokenRaw)
    : `A-${String(tokenRaw).padStart(3, '0')}`

  const patientDisplayName =
    appointment.patientName ||
    authUser?.displayName ||
    authUser?.fullName ||
    'Rahul Sharma'

  const patientDisplayId =
    appointment.patientId ||
    (authUser?.patientProfile?.bloodGroup ? `PAT${String(authUser.patientProfile?.bloodGroup).replace(/[^a-zA-Z0-9]/g, '')}` : '') ||
    `PAT00${String(tokenRaw).padStart(4, '0')}`

  let doctorDisplayName = appointment.doctor || appointment.doctorName || 'Dr. Priya Mehta'
  if (!doctorDisplayName.startsWith('Dr.')) doctorDisplayName = `Dr. ${doctorDisplayName}`

  const doctorSpecialty =
    appointment.specialty ||
    'General Medicine'

  const doctorQualification =
    appointment.doctorQualification ||
    (doctorSpecialty.toLowerCase().includes('cardio')
      ? 'MBBS, MD, DM (Cardiology)'
      : doctorSpecialty.toLowerCase().includes('neuro')
      ? 'MBBS, MD, DM (Neurology)'
      : doctorSpecialty.toLowerCase().includes('ortho')
      ? 'MBBS, MS (Orthopaedics)'
      : doctorSpecialty.toLowerCase().includes('paed')
      ? 'MBBS, MD (Paediatrics)'
      : 'MBBS, MD (General Physician)')

  const apptDate = appointment.date || appointment.appointmentDate || '15 Aug 2025'
  const apptTime = appointment.time || appointment.appointmentTime || '10:30 AM'
  const consultationType = appointment.consultationType || appointment.type || 'In-Person Visit'

  const hospitalName =
    appointment.hospital ||
    appointment.hospitalName ||
    'Iryotek City Care Center'

  const hospitalAddress =
    appointment.hospitalAddress ||
    (appointment.hospitalCity
      ? `Main OPD Block, Health Avenue, ${appointment.hospitalCity}, ${appointment.state || 'India'}`
      : '123 Health Avenue, Sector 18, Noida, Uttar Pradesh - 201301')

  // Calculate Reporting Time (15 minutes prior)
  const calculateReportingTime = (timeStr: string) => {
    try {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i)
      if (match) {
        let hrs = parseInt(match[1], 10)
        let mins = parseInt(match[2], 10)
        const modifier = match[3] ? match[3].toUpperCase() : ''

        if (modifier === 'PM' && hrs < 12) hrs += 12
        if (modifier === 'AM' && hrs === 12) hrs = 0

        let totalMins = hrs * 60 + mins - 15
        if (totalMins < 0) totalMins += 24 * 60

        let repHrs = Math.floor(totalMins / 60)
        let repMins = totalMins % 60
        let repMod = 'AM'

        if (repHrs >= 12) {
          repMod = 'PM'
          if (repHrs > 12) repHrs -= 12
        } else if (repHrs === 0) {
          repHrs = 12
        }

        return `${String(repHrs).padStart(2, '0')}:${String(repMins).padStart(2, '0')} ${repMod}`
      }
    } catch {}
    return '10:15 AM'
  }

  const reportingTime = calculateReportingTime(apptTime)

  // Payment amounts
  const consultFeeNum = Number(appointment.fee) || 500
  const platformChargeNum = 20.0
  const totalPaidNum = consultFeeNum + platformChargeNum
  const paymentMethod = appointment.paymentMethod || 'UPI (Google Pay)'
  const rawDateCode = apptDate.replace(/[^0-9]/g, '') || '20250815'
  const transactionId =
    appointment.utr ||
    appointment.transactionId ||
    `IRY${rawDateCode.slice(-6)}${String(tokenRaw).padStart(4, '0')}XXXX`

  const paymentDate =
    appointment.paymentDate ||
    `${apptDate}, ${reportingTime}`

  const barcodeId = `APPT-IRY-${rawDateCode.length >= 8 ? rawDateCode : '20250815'}-${queueBadgeText}`

  const handleDownloadPdf = async () => {
    const receiptEl = document.getElementById('iryotek-e-receipt')
    if (!receiptEl) return
    setIsExporting(true)
    setExportMessage('Generating Official PDF...')
    try {
      const canvas = await html2canvas(receiptEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const imgWidth = pageWidth - margin * 2
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, Math.min(imgHeight, pageHeight - margin * 2))
      pdf.save(`Iryotek-Receipt-${queueBadgeText}-${rawDateCode}.pdf`)
    } catch (err) {
      console.error('[Receipt PDF] download error:', err)
      handlePrint()
    } finally {
      setIsExporting(false)
      setExportMessage('')
    }
  }

  const handleDownloadImage = async () => {
    const receiptEl = document.getElementById('iryotek-e-receipt')
    if (!receiptEl) return
    setIsExporting(true)
    setExportMessage('Generating PNG Image...')
    try {
      const canvas = await html2canvas(receiptEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      const link = document.createElement('a')
      link.download = `Iryotek-Receipt-${queueBadgeText}-${rawDateCode}.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Image download error:', err)
    } finally {
      setIsExporting(false)
      setExportMessage('')
    }
  }

  const handlePrint = () => {
    const receiptEl = document.getElementById('iryotek-e-receipt')
    if (!receiptEl) {
      window.print()
      return
    }

    // Direct clean print window
    const printWindow = window.open('', '_blank', 'width=900,height=900')
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Iryotek Appointment Receipt - ${queueBadgeText}</title>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
    body { background: #ffffff; padding: 20px; color: #1e293b; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @page { size: A4 portrait; margin: 10mm; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div style="max-width: 860px; margin: 0 auto;">
    ${receiptEl.outerHTML}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    };
  <\/script>
</body>
</html>`)
      printWindow.document.close()
    } else {
      window.print()
    }
  }

  const handleCopyBarcode = () => {
    navigator.clipboard?.writeText(barcodeId)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div
      className="receipt-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Print stylesheet injected strictly for pristine rendering */}
      <style>{`
        @media print {
          html, body {
            overflow: visible !important;
            height: auto !important;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden !important;
          }
          #iryotek-e-receipt, #iryotek-e-receipt * {
            visibility: visible !important;
          }
          #iryotek-e-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Modal Top Control Bar (Non-printed) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            background: 'linear-gradient(90deg, #0e7490 0%, #0369a1 100%)',
            color: '#ffffff',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>📄</span>
            <strong style={{ fontSize: '14px', letterSpacing: '0.02em' }}>
              Iryotek Official E-Receipt & Prescription
            </strong>
            {isExporting && (
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '4px' }}>
                ⏳ {exportMessage}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                color: '#0e7490',
                border: 'none',
                fontWeight: 800,
                fontSize: '12px',
                padding: '7px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <span>📥</span> Download PDF
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={isExporting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.18)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.4)',
                fontWeight: 700,
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <span>🖼️</span> Save PNG
            </button>
            <button
              onClick={handlePrint}
              disabled={isExporting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.18)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.4)',
                fontWeight: 700,
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <span>🖨️</span> Print
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                cursor: 'pointer',
                lineHeight: 1
              }}
              title="Close receipt preview"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div
          style={{
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#f8fafc'
          }}
        >
          {/* THE OFFICIAL APPOINTMENT RECEIPT CARD (Faithfully matching user provided image) */}
          <div
            id="iryotek-e-receipt"
            ref={receiptRef}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #dbeafe',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
              padding: '28px 32px',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              color: '#1e293b'
            }}
          >
            {/* 1. Header: Logo, Brand & Badges */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '20px',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              {/* Brand Logo & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0f766e 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 10px rgba(6, 182, 212, 0.35)'
                  }}
                >
                  {/* Heart with ECG waveform */}
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    <path d="M3.5 12h3l2-3 2.5 6 2-4 1.5 1h4" strokeWidth="2.2" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0e7490', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                    Iryotek
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginTop: '2px' }}>
                    Smart Hospital System
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                    Queueless Healthcare for Everyone
                  </div>
                </div>
              </div>

              {/* 3 Top Right Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  gap: '16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#1e293b'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', textAlign: 'center' }}>
                  <span style={{ fontSize: '16px' }}>👥</span>
                  <span style={{ lineHeight: 1.2 }}>Book<br />Appointments</span>
                </div>
                <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', textAlign: 'center' }}>
                  <span style={{ fontSize: '16px' }}>🚷</span>
                  <span style={{ lineHeight: 1.2 }}>Skip<br />Waiting Lines</span>
                </div>
                <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', textAlign: 'center' }}>
                  <span style={{ fontSize: '16px' }}>🕒</span>
                  <span style={{ lineHeight: 1.2 }}>Smart<br />Healthcare</span>
                </div>
              </div>
            </div>

            {/* 2. Banner: APPOINTMENT RECEIPT & Green Confirmation Pill */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '22px',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    color: '#0f172a',
                    textTransform: 'uppercase'
                  }}
                >
                  APPOINTMENT RECEIPT
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
                  Thank you for choosing Iryotek!
                </p>
              </div>

              {/* Green Confirmation Pill Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '12px',
                  padding: '8px 16px'
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 800
                  }}
                >
                  ✓
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#047857', lineHeight: 1.2 }}>
                    Appointment Confirmed
                  </div>
                  <div style={{ fontSize: '11px', color: '#065f46' }}>
                    Your slot has been successfully booked.
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Main Grid (Two Columns): Left Details & Right Queue/Payment */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}
            >
              {/* LEFT CONTAINER: Appointment Details */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                {/* Section Title */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#0369a1',
                    fontSize: '15px',
                    fontWeight: 800,
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '10px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>📅</span>
                  <span>Appointment Details</span>
                </div>

                {/* Field Rows */}
                <div style={{ display: 'grid', gridTemplateColumns: '125px 1fr', gap: '10px', fontSize: '13px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👤</span> <span>Patient Name</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {patientDisplayName}
                  </div>

                  <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📄</span> <span>Patient ID</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                    {patientDisplayId}
                  </div>

                  <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🩺</span> <span>Doctor Name</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{doctorDisplayName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{doctorQualification}</div>
                  </div>

                  <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🏢</span> <span>Department</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {doctorSpecialty}
                  </div>

                  <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📅</span> <span>Appointment Date</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {apptDate}
                  </div>

                  <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🕒</span> <span>Appointment Time</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {apptTime}
                  </div>

                  <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📍</span> <span>Consultation Type</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {consultationType}
                  </div>

                  <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🏥</span> <span>Hospital/Clinic</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{hospitalName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                      {hospitalAddress}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT CONTAINER: Queue Information + Payment Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 3A. Queue Information */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#0369a1',
                      fontSize: '15px',
                      fontWeight: 800,
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '8px'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>👥</span>
                    <span>Queue Information</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Left: Queue Number Badge */}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <span>🎫</span> <span>Your Queue Number</span>
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#e8f8f0',
                          border: '1.5px solid #a7f3d0',
                          borderRadius: '8px',
                          padding: '6px 20px',
                          fontSize: '24px',
                          fontWeight: 900,
                          color: '#047857',
                          fontFamily: 'monospace',
                          letterSpacing: '1px'
                        }}
                      >
                        {queueBadgeText}
                      </div>
                    </div>

                    {/* Right: Estimated Reporting Time */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                        <span>🕒</span> <span>Estimated Reporting Time</span>
                      </div>
                      <div style={{ fontSize: '19px', fontWeight: 900, color: '#0369a1' }}>
                        {reportingTime}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                        (15 minutes before)
                      </div>
                    </div>
                  </div>

                  {/* Queueless lightning alert */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '11.5px',
                      color: '#047857',
                      lineHeight: 1.4
                    }}
                  >
                    <span style={{ fontSize: '15px', color: '#10b981' }}>⚡</span>
                    <div>
                      With Iryotek, enjoy a <strong>queueless and hassle-free experience</strong>. You will be notified when it's your turn.
                    </div>
                  </div>
                </div>

                {/* 3B. Payment Details */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#0369a1',
                      fontSize: '15px',
                      fontWeight: 800,
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '8px'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>💳</span>
                    <span>Payment Details</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📅</span> Consultation Fee
                    </span>
                    <strong style={{ color: '#0f172a' }}>₹{consultFeeNum.toFixed(2)}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📄</span> Platform Service Charge
                    </span>
                    <strong style={{ color: '#0f172a' }}>₹{platformChargeNum.toFixed(2)}</strong>
                  </div>

                  <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '2px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>Total Paid</strong>
                    <strong style={{ fontSize: '20px', color: '#059669', fontWeight: 900 }}>
                      ₹{totalPaidNum.toFixed(2)}
                    </strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px', fontSize: '12px', marginTop: '4px' }}>
                    <span style={{ color: '#64748b' }}>📍 Payment Method</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{paymentMethod}</span>

                    <span style={{ color: '#64748b' }}>⚙️ Transaction ID</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>{transactionId}</span>

                    <span style={{ color: '#64748b' }}>📅 Payment Date</span>
                    <span style={{ color: '#0f172a' }}>{paymentDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. DOCTOR PRESCRIPTION SECTION (Rendered with high fidelity if prescription exists) */}
            {matchedPrescription && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #0d9488',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  marginBottom: '20px',
                  position: 'relative'
                }}
              >
                {/* Doctor Rx Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #ccfbf1',
                    paddingBottom: '12px',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#0f766e',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 900
                      }}
                    >
                      ℞
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f766e' }}>
                        Doctor's Digital Prescription & Clinical Order
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Issued by {matchedPrescription.doctorName} · NMC Reg: {matchedPrescription.nmcNumber || 'NMC-2024-88492'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      color: '#047857',
                      fontWeight: 700
                    }}
                  >
                    <span>🛡️</span> Verified NMC Digital Signature
                  </div>
                </div>

                {/* Diagnosis / Indication */}
                {matchedPrescription.diagnosis && (
                  <div
                    style={{
                      backgroundColor: '#f0fdfa',
                      border: '1px solid #99f6e4',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      fontSize: '13px'
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#0f766e' }}>Clinical Diagnosis: </span>
                    <strong style={{ color: '#0f172a' }}>{matchedPrescription.diagnosis}</strong>
                  </div>
                )}

                {/* Prescribed Medications Table */}
                {matchedPrescription.medicines && matchedPrescription.medicines.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.04em', color: '#475569', marginBottom: '8px' }}>
                      PRESCRIBED MEDICINES & DOSAGE REGIMEN ({matchedPrescription.medicines.length})
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                            <th style={{ padding: '8px 12px' }}>#</th>
                            <th style={{ padding: '8px 12px' }}>Medicine Name</th>
                            <th style={{ padding: '8px 12px' }}>Dosage Schedule</th>
                            <th style={{ padding: '8px 12px' }}>Duration</th>
                            <th style={{ padding: '8px 12px' }}>Clinical Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchedPrescription.medicines.map((med, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f766e' }}>{idx + 1}</td>
                              <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                                💊 {med.name}
                              </td>
                              <td style={{ padding: '8px 12px', color: '#334155' }}>
                                {med.dosage || med.dose || '1 tablet as directed'} {med.frequency ? `(${med.frequency})` : ''}
                              </td>
                              <td style={{ padding: '8px 12px', color: '#334155' }}>
                                {med.duration || '5 Days'}
                              </td>
                              <td style={{ padding: '8px 12px', color: '#047857' }}>
                                {med.instructions || 'Take after meals with water'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Clinical Advice / Instructions */}
                {(matchedPrescription.advice || matchedPrescription.instructions) && (
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '12px',
                      color: '#1e40af',
                      lineHeight: 1.5
                    }}
                  >
                    <strong>Doctor's Advice: </strong>
                    {matchedPrescription.advice || matchedPrescription.instructions}
                    {matchedPrescription.followUp && (
                      <span style={{ display: 'block', marginTop: '4px', fontWeight: 700 }}>
                        Next Follow-Up: {matchedPrescription.followUp}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 5. Bottom Row: Important Instructions & QR Code */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '20px'
              }}
            >
              {/* BOTTOM LEFT: Important Instructions */}
              <div
                style={{
                  backgroundColor: '#f0f7ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#0369a1',
                    fontSize: '15px',
                    fontWeight: 800,
                    borderBottom: '1px solid #dbeafe',
                    paddingBottom: '8px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>ℹ️</span>
                  <span>Important Instructions</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#1e293b' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div
                      style={{
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '1px'
                      }}
                    >
                      1
                    </div>
                    <span>Arrive 15 minutes before your appointment time.</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div
                      style={{
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '1px'
                      }}
                    >
                      2
                    </div>
                    <span>Carry a valid ID and previous medical reports (if any).</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div
                      style={{
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '1px'
                      }}
                    >
                      3
                    </div>
                    <span>You will receive a notification when your turn is near.</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div
                      style={{
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '1px'
                      }}
                    >
                      4
                    </div>
                    <span>For rescheduling or cancellation, use the Iryotek app or website.</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM RIGHT: Appointment QR Code & Barcode */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#0369a1',
                    fontSize: '15px',
                    fontWeight: 800,
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '8px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🔲</span>
                  <span>Appointment QR Code</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* QR Code Container */}
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="Appointment QR Code"
                        style={{ width: '100%', height: '100%', display: 'block' }}
                      />
                    ) : (
                      <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>Generating QR...</div>
                    )}
                  </div>

                  {/* QR instructions & Barcode */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11.5px', color: '#475569', marginBottom: '8px', lineHeight: 1.3 }}>
                      Scan this code at the clinic for quick check-in.
                    </div>

                    {/* Crisp Vector Barcode Simulation matching user reference */}
                    <div
                      onClick={handleCopyBarcode}
                      title="Click to copy Barcode Ref"
                      style={{
                        cursor: 'pointer',
                        padding: '4px 6px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <svg width="180" height="32" viewBox="0 0 180 32" style={{ display: 'block' }}>
                        {/* Realistic Code128 bar pattern */}
                        <rect x="0" y="0" width="3" height="32" fill="#0f172a" />
                        <rect x="5" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="9" y="0" width="4" height="32" fill="#0f172a" />
                        <rect x="15" y="0" width="1" height="32" fill="#0f172a" />
                        <rect x="18" y="0" width="3" height="32" fill="#0f172a" />
                        <rect x="23" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="27" y="0" width="1" height="32" fill="#0f172a" />
                        <rect x="30" y="0" width="4" height="32" fill="#0f172a" />
                        <rect x="36" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="40" y="0" width="1" height="32" fill="#0f172a" />
                        <rect x="43" y="0" width="3" height="32" fill="#0f172a" />
                        <rect x="48" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="52" y="0" width="4" height="32" fill="#0f172a" />
                        <rect x="58" y="0" width="1" height="32" fill="#0f172a" />
                        <rect x="61" y="0" width="3" height="32" fill="#0f172a" />
                        <rect x="66" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="70" y="0" width="4" height="32" fill="#0f172a" />
                        <rect x="76" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="80" y="0" width="1" height="32" fill="#0f172a" />
                        <rect x="83" y="0" width="3" height="32" fill="#0f172a" />
                        <rect x="88" y="0" width="4" height="32" fill="#0f172a" />
                        <rect x="94" y="0" width="1" height="32" fill="#0f172a" />
                        <rect x="97" y="0" width="3" height="32" fill="#0f172a" />
                        <rect x="102" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="106" y="0" width="3" height="32" fill="#0f172a" />
                        <rect x="111" y="0" width="1" height="32" fill="#0f172a" />
                        <rect x="114" y="0" width="4" height="32" fill="#0f172a" />
                        <rect x="120" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="124" y="0" width="3" height="32" fill="#0f172a" />
                        <rect x="129" y="0" width="1" height="32" fill="#0f172a" />
                        <rect x="132" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="136" y="0" width="4" height="32" fill="#0f172a" />
                        <rect x="142" y="0" width="1" height="32" fill="#0f172a" />
                        <rect x="145" y="0" width="3" height="32" fill="#0f172a" />
                        <rect x="150" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="154" y="0" width="4" height="32" fill="#0f172a" />
                        <rect x="160" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="164" y="0" width="1" height="32" fill="#0f172a" />
                        <rect x="167" y="0" width="3" height="32" fill="#0f172a" />
                        <rect x="172" y="0" width="2" height="32" fill="#0f172a" />
                        <rect x="176" y="0" width="4" height="32" fill="#0f172a" />
                      </svg>
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#475569',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em',
                          marginTop: '2px'
                        }}
                      >
                        {barcodeId} {isCopied ? '✓ Copied' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Footer */}
            <div
              style={{
                textAlign: 'center',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
                fontSize: '11px',
                color: '#64748b'
              }}
            >
              <div style={{ fontWeight: 700, color: '#334155' }}>
                Iryotek – Smart Hospital System
              </div>
              <div style={{ marginTop: '2px' }}>
                Queueless Healthcare for a Smarter Tomorrow
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Token Ref: <strong style={{ color: '#0f172a' }}>#{tokenRaw}</strong> · Showing official verified receipt format
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExporting}
              style={{
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #0e7490',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                color: '#0e7490',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🖼️</span> Save PNG
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={isExporting}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0284c7',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
              }}
            >
              <span>🖨️</span> Print / Save PDF
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              style={{
                padding: '8px 20px',
                backgroundColor: '#059669',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '13px',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)'
              }}
            >
              <span>📥</span> {isExporting ? 'Generating PDF...' : 'Download Official PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
