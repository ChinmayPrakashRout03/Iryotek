import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  type AuthUser,
  type PatientHealthProfile,
  getStoredUser,
  setStoredUser,
  initFirebase,
  loginPatientWithGoogle,
  loginPatientWithGoogleAccount,
  loginPatientWithEmail,
  registerPatientWithEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  doctorSignIn,
  doctorCredentialing,
  adminSignIn,
  logoutUser,
  SEED_DATASET_DOCTORS,
} from './auth'
import { getPatientProfileFirestore } from './firestore'
import { allMedicalFields } from './data/medical-fields'

interface AuthViewProps {
  initialMode?: 'signin' | 'signup'
  notify?: (msg: string) => void
  onSuccess?: (user: AuthUser) => void
}

export default function AuthView({ initialMode = 'signin', notify, onSuccess }: AuthViewProps) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialRoleParam = params.get('role')
  const [activeRole, setActiveRole] = useState<'Patient' | 'Doctor' | 'Admin'>(() => {
    if (initialRoleParam) {
      const lower = initialRoleParam.toLowerCase()
      if (lower === 'doctor') return 'Doctor'
      if (lower === 'admin') return 'Admin'
      if (lower === 'patient') return 'Patient'
    }
    return 'Patient'
  })
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>(initialMode)
  const [patientMethod, setPatientMethod] = useState<'email' | 'phone'>('email')

  const [signupStep, setSignupStep] = useState<1 | 2 | 3 | 4>(1)

  const [patientName, setPatientName] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [patientPassword, setPatientPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('+91 ')
  const [otpCode, setOtpCode] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [otpSent, setOtpSent] = useState(false)

  const [patientAge, setPatientAge] = useState<number | ''>('')
  const [patientDob, setPatientDob] = useState('')
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male')
  const [patientBloodGroup, setPatientBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown'>('O+')
  const [patientAddress, setPatientAddress] = useState('')
  const [patientCity, setPatientCity] = useState('')
  const [patientPincode, setPatientPincode] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyRel, setEmergencyRel] = useState('Parent / Guardian')
  const [emergencyPhone, setEmergencyPhone] = useState('')

  const [heightCm, setHeightCm] = useState<number | ''>('')
  const [weightKg, setWeightKg] = useState<number | ''>('')
  const [bpSystolic, setBpSystolic] = useState<number | ''>(120)
  const [bpDiastolic, setBpDiastolic] = useState<number | ''>(80)
  const [pulseRate, setPulseRate] = useState<number | ''>(72)

  const calculatedBmi = useMemo(() => {
    if (typeof heightCm === 'number' && heightCm > 0 && typeof weightKg === 'number' && weightKg > 0) {
      const hMeter = heightCm / 100
      const val = weightKg / (hMeter * hMeter)
      return Number(val.toFixed(1))
    }
    return undefined
  }, [heightCm, weightKg])

  const bmiCategory = useMemo(() => {
    if (!calculatedBmi) return null
    if (calculatedBmi < 18.5) return { label: 'Underweight', color: '#0284c7' }
    if (calculatedBmi < 25) return { label: 'Normal / Healthy weight', color: '#107980' }
    if (calculatedBmi < 30) return { label: 'Overweight', color: '#d97706' }
    return { label: 'Obese', color: '#dc2626' }
  }, [calculatedBmi])

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [customAllergy, setCustomAllergy] = useState('')
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [customCondition, setCustomCondition] = useState('')
  const [pastSurgeries, setPastSurgeries] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')
  const [familyHistory, setFamilyHistory] = useState('')
  const [insuranceProvider, setInsuranceProvider] = useState('')
  const [insurancePolicy, setInsurancePolicy] = useState('')

  const commonAllergies = ['Penicillin', 'Sulfa Drugs', 'Aspirin / NSAIDs', 'Peanuts', 'Shellfish', 'Latex', 'Dust / Pollen', 'No Known Drug Allergies']
  const commonConditions = ['Hypertension', 'Type 2 Diabetes', 'Asthma', 'Hypothyroidism', 'Coronary Artery Disease', 'GERD / Acid Reflux', 'None']

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'No Known Drug Allergies') {
      setSelectedAllergies(prev => prev.includes('No Known Drug Allergies') ? [] : ['No Known Drug Allergies'])
      return
    }
    setSelectedAllergies(prev => {
      const filtered = prev.filter(a => a !== 'No Known Drug Allergies')
      return filtered.includes(allergy) ? filtered.filter(a => a !== allergy) : [...filtered, allergy]
    })
  }

  const toggleCondition = (cond: string) => {
    if (cond === 'None') {
      setSelectedConditions(prev => prev.includes('None') ? [] : ['None'])
      return
    }
    setSelectedConditions(prev => {
      const filtered = prev.filter(c => c !== 'None')
      return filtered.includes(cond) ? filtered.filter(c => c !== cond) : [...filtered, cond]
    })
  }

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies(prev => [...prev.filter(a => a !== 'No Known Drug Allergies'), customAllergy.trim()])
      setCustomAllergy('')
    }
  }

  const addCustomCondition = () => {
    if (customCondition.trim() && !selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions(prev => [...prev.filter(c => c !== 'None'), customCondition.trim()])
      setCustomCondition('')
    }
  }

  const [docEmail, setDocEmail] = useState('')
  const [docPassword, setDocPassword] = useState('doctor123')
  const [docFirstName, setDocFirstName] = useState('')
  const [docMiddleName, setDocMiddleName] = useState('')
  const [docLastName, setDocLastName] = useState('')
  const [docAge, setDocAge] = useState(38)
  const [docSpecialty, setDocSpecialty] = useState('Cardiology')
  const [docExperience, setDocExperience] = useState(10)
  const [docHospital, setDocHospital] = useState('AIIMS New Delhi')
  const [issuedResult, setIssuedResult] = useState<{ email: string; pass: string; name: string } | null>(null)

  const [adminEmail, setAdminEmail] = useState('admin@gmail.com')
  const [adminPassword, setAdminPassword] = useState('admin')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Google In-App Modal States (Optimized for Android APK WebView and Firebase Auth)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [googleModalEmail, setGoogleModalEmail] = useState('')
  const [googleModalPass, setGoogleModalPass] = useState('')
  const [googleModalLoading, setGoogleModalLoading] = useState(false)
  const [googleModalError, setGoogleModalError] = useState('')

  const alertUser = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg)
      setSuccessMsg('')
    } else {
      setSuccessMsg(msg)
      setErrorMsg('')
      if (notify) notify(msg)
    }
  }

  const completeAuth = (user: AuthUser) => {
    alertUser(`Welcome, ${user.displayName}! Signed in as ${user.role}.`, false)
    if (onSuccess) onSuccess(user)
    setTimeout(() => {
      const redirect = params.get('redirect')
      if (redirect) {
        navigate(redirect.startsWith('/') ? redirect : `/${redirect}`)
      } else if (user.role === 'Doctor') {
        navigate('/doctor')
      } else if (user.role === 'Admin') {
        navigate('/admin')
      } else {
        navigate('/patient')
      }
    }, 700)
  }

  // Check for incoming redirect authentication (Firebase Auth Redirect Flow)
  useEffect(() => {
    let isMounted = true
    const checkRedirect = async () => {
      const auth = initFirebase()
      if (!auth) return
      try {
        const result = await auth.getRedirectResult().catch(() => null)
        if (result && result.user && isMounted) {
          const u = result.user
          const cloudProfile = await getPatientProfileFirestore(u.uid, u.email || undefined).catch(() => null)
          const user: AuthUser = {
            uid: u.uid,
            displayName: cloudProfile?.fullName || u.displayName || u.email?.split('@')[0] || 'Patient User',
            email: u.email || undefined,
            photoURL: u.photoURL || undefined,
            role: 'Patient',
            authProvider: 'Google Auth',
            access: 'Appointments, Telehealth & Pharmacy',
            patientProfile: cloudProfile || undefined
          }
          setStoredUser(user)
          completeAuth(user)
        }
      } catch (err: any) {
        console.warn('[Iryotek Auth] getRedirectResult check:', err)
      }
    }
    checkRedirect()
    return () => { isMounted = false }
  }, [])

  // Google Login (Firebase Auth with APK WebView safety & Google Modal fallback)
  const handleGoogleLogin = async () => {
    const isApk = typeof window !== 'undefined' && (
      window.location.hostname === 'appassets.androidplatform.net' ||
      window.location.protocol === 'file:'
    )
    if (isApk) {
      setGoogleModalError('')
      setShowGoogleModal(true)
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      const user = await loginPatientWithGoogle()
      completeAuth(user)
    } catch (err: any) {
      if (err.message === 'OPEN_GOOGLE_MODAL') {
        setGoogleModalError('')
        setShowGoogleModal(true)
      } else {
        alertUser(err.message || 'Google sign-in was cancelled or failed.', true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleModalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!googleModalEmail.trim() || !googleModalEmail.includes('@')) {
      setGoogleModalError('Please enter a valid Google / Gmail address.')
      return
    }
    setGoogleModalLoading(true)
    setGoogleModalError('')
    try {
      const user = await loginPatientWithGoogleAccount(googleModalEmail, googleModalPass)
      setShowGoogleModal(false)
      completeAuth(user)
    } catch (err: any) {
      setGoogleModalError(err.message || 'Failed to authenticate Google account.')
    } finally {
      setGoogleModalLoading(false)
    }
  }

  const handleInstantGoogleSignIn = async () => {
    setGoogleModalLoading(true)
    setGoogleModalError('')
    try {
      const user = await loginPatientWithGoogleAccount(
        'patient.google@iryotek.health',
        'GoogleAuth@Iryotek2025!',
        'Verified Google Patient'
      )
      setShowGoogleModal(false)
      completeAuth(user)
    } catch (err: any) {
      setGoogleModalError(err.message || 'Failed to complete Google sign-in.')
    } finally {
      setGoogleModalLoading(false)
    }
  }

  // Phone OTP Send
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      alertUser('Please enter a valid phone number with country code (e.g. +91 9876543210)', true)
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const confirmation = await sendPhoneOtp(phoneNumber.trim())
      setConfirmationResult(confirmation)
      setOtpSent(true)
      alertUser(`SMS OTP sent to ${phoneNumber}. Enter 6-digit verification code.`)
    } catch (err: any) {
      alertUser(err.message || 'Failed to dispatch SMS verification code.', true)
    } finally {
      setLoading(false)
    }
  }

  // Phone OTP Verify
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.trim().length < 4) {
      alertUser('Please enter the 6-digit OTP code received.', true)
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const user = await verifyPhoneOtp(confirmationResult, otpCode.trim())
      completeAuth(user)
    } catch (err: any) {
      alertUser(err.message || 'Invalid SMS OTP code. Please retry.', true)
    } finally {
      setLoading(false)
    }
  }

  const validateStep1 = () => {
    if (!patientName.trim()) { alertUser('Please enter your full legal name.', true); return false }
    if (!patientEmail.trim() || !patientEmail.includes('@')) { alertUser('Please enter a valid email address.', true); return false }
    const cleanP = phoneNumber.replace(/[^0-9]/g, '')
    if (cleanP.length < 10) { alertUser('Please enter a valid 10-digit mobile phone number.', true); return false }
    if (patientPassword.length < 6) { alertUser('Password must be at least 6 characters.', true); return false }
    setErrorMsg('')
    return true
  }

  const validateStep2 = () => {
    if (patientAge === '' || Number(patientAge) <= 0 || Number(patientAge) > 125) { alertUser('Please enter a valid age.', true); return false }
    if (!patientAddress.trim()) { alertUser('Please enter your residential address.', true); return false }
    if (!patientCity.trim()) { alertUser('Please enter your city.', true); return false }
    if (!patientPincode.trim()) { alertUser('Please enter your postal pincode.', true); return false }
    if (!emergencyName.trim() || !emergencyPhone.trim()) { alertUser('Please provide emergency contact name and phone number.', true); return false }
    setErrorMsg('')
    return true
  }

  const validateStep3 = () => {
    if (heightCm !== '' && (Number(heightCm) < 40 || Number(heightCm) > 250)) { alertUser('Please enter a valid height in cm (40 - 250 cm).', true); return false }
    if (weightKg !== '' && (Number(weightKg) < 2 || Number(weightKg) > 300)) { alertUser('Please enter a valid weight in kg (2 - 300 kg).', true); return false }
    setErrorMsg('')
    return true
  }

  // Email / Password Submit & Clinical Intake
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (activeRole === 'Patient') {
        if (authTab === 'signup') {
          if (!validateStep1()) { setLoading(false); return }
          if (!validateStep2()) { setLoading(false); return }
          if (!validateStep3()) { setLoading(false); return }

          const healthProfile: PatientHealthProfile = {
            fullName: patientName.trim(),
            email: patientEmail.trim(),
            phone: phoneNumber.trim() || emergencyPhone.trim(),
            age: Number(patientAge) || 25,
            dateOfBirth: patientDob || undefined,
            gender: patientGender,
            bloodGroup: patientBloodGroup,
            address: patientAddress.trim(),
            city: patientCity.trim(),
            pincode: patientPincode.trim(),
            emergencyContact: {
              name: emergencyName.trim(),
              relationship: emergencyRel.trim(),
              phone: emergencyPhone.trim(),
            },
            heightCm: typeof heightCm === 'number' ? heightCm : undefined,
            weightKg: typeof weightKg === 'number' ? weightKg : undefined,
            bmi: calculatedBmi,
            bloodPressure: {
              systolic: typeof bpSystolic === 'number' ? bpSystolic : 120,
              diastolic: typeof bpDiastolic === 'number' ? bpDiastolic : 80,
            },
            pulseRate: typeof pulseRate === 'number' ? pulseRate : 72,
            allergies: selectedAllergies.length > 0 ? selectedAllergies : ['No Known Drug Allergies'],
            chronicConditions: selectedConditions.length > 0 ? selectedConditions : ['None'],
            pastSurgeries: pastSurgeries ? pastSurgeries.split(',').map(s => s.trim()).filter(Boolean) : [],
            currentMedications: currentMedications ? currentMedications.split(',').map(s => s.trim()).filter(Boolean) : [],
            familyMedicalHistory: familyHistory.trim() || undefined,
            insurance: (insuranceProvider.trim() && insurancePolicy.trim()) ? {
              provider: insuranceProvider.trim(),
              policyNumber: insurancePolicy.trim(),
            } : undefined,
          }

          const user = await registerPatientWithEmail(patientName.trim(), patientEmail.trim(), patientPassword, healthProfile)
          completeAuth(user)
        } else {
          const user = await loginPatientWithEmail(patientEmail, patientPassword)
          completeAuth(user)
        }
      } else if (activeRole === 'Doctor') {
        if (authTab === 'signup') {
          if (!docFirstName || !docLastName) throw new Error('Please enter both first and last name.')
          const result = await doctorCredentialing({
            firstName: docFirstName,
            middleName: docMiddleName,
            lastName: docLastName,
            age: docAge,
            specialty: docSpecialty,
            experience: docExperience,
            hospital: docHospital,
            password: docPassword,
          })
          setIssuedResult({
            email: result.issuedEmail,
            pass: result.temporaryPassword,
            name: `Dr. ${docFirstName} ${docLastName}`,
          })
          alertUser(`Official credentials issued: ${result.issuedEmail}.`)
          setTimeout(() => {
            completeAuth(result.user)
          }, 1800)
        } else {
          const user = await doctorSignIn(docEmail, docPassword)
          completeAuth(user)
        }
      } else if (activeRole === 'Admin') {
        const user = await adminSignIn(adminEmail, adminPassword)
        completeAuth(user)
      }
    } catch (err: any) {
      alertUser(err.message || 'Authentication error. Please check your inputs.', true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container-card">
      <div className="auth-header-banner">
        <div className="auth-badge">
          <span className="auth-badge-dot" />
          <span>IRYOTEK HEALTHCARE INTELLIGENCE</span>
        </div>
        <h2>
          Connect to <em>Iryotek</em>
        </h2>
        <p>
          One unified portal for patient telehealth, 100k+ clinical doctor records, and hospital system management.
        </p>

        {/* Role Tabs */}
        <div className="auth-role-tabs" role="tablist">
          {(['Patient', 'Doctor', 'Admin'] as const).map(role => (
            <button
              key={role}
              type="button"
              className={`auth-role-btn ${activeRole === role ? 'active' : ''}`}
              onClick={() => {
                setActiveRole(role)
                setErrorMsg('')
                setSuccessMsg('')
              }}
            >
              <span className="auth-role-icon">
                {role === 'Patient' ? '◌' : role === 'Doctor' ? '✚' : '❖'}
              </span>
              <span>{role}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="auth-body-content">
        {errorMsg && <div className="auth-alert error">✕ {errorMsg}</div>}
        {successMsg && <div className="auth-alert success">✓ {successMsg}</div>}

        {/* =========================================================================
            PATIENT AUTHENTICATION & CLINICAL INTAKE
            ========================================================================= */}
        {activeRole === 'Patient' && (
          <div className="auth-role-panel">
            <div className="auth-sub-nav">
              <button
                type="button"
                className={authTab === 'signin' ? 'active' : ''}
                onClick={() => { setAuthTab('signin'); setSignupStep(1) }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={authTab === 'signup' ? 'active' : ''}
                onClick={() => setAuthTab('signup')}
              >
                Create Account & Clinical Intake
              </button>
            </div>

            {authTab === 'signin' && (
              <>
                {/* Google Sign-In */}
                <button
                  type="button"
                  className="auth-google-btn"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="auth-divider">
                  <span>or sign in with</span>
                </div>

                <div className="auth-method-toggle" role="tablist" aria-label="Sign-in method">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={patientMethod === 'email'}
                    className={`auth-method-btn ${patientMethod === 'email' ? 'active' : ''}`}
                    onClick={() => setPatientMethod('email')}
                  >
                    <span className="auth-method-icon">✉</span>
                    <span className="auth-method-text">Email or Mobile & Password</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={patientMethod === 'phone'}
                    className={`auth-method-btn ${patientMethod === 'phone' ? 'active' : ''}`}
                    onClick={() => setPatientMethod('phone')}
                  >
                    <span className="auth-method-icon">📱</span>
                    <span className="auth-method-text">Phone SMS OTP</span>
                  </button>
                </div>

                {patientMethod === 'phone' ? (
                  <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="demo-stacked-form">
                    {!otpSent ? (
                      <>
                        <label>
                          Mobile Phone Number
                          <input
                            type="tel"
                            placeholder="+91 9876543210"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            required
                          />
                        </label>
                        <p className="auth-helper-note">
                          We'll send a 6-digit OTP code to verify your mobile number.
                        </p>
                        <button className="button" type="submit" disabled={loading}>
                          {loading ? 'Sending code…' : 'Send SMS OTP ↗'}
                        </button>
                      </>
                    ) : (
                      <>
                        <label>
                          Enter 6-Digit OTP Code
                          <input
                            type="text"
                            placeholder="e.g. 123456"
                            value={otpCode}
                            onChange={e => setOtpCode(e.target.value)}
                            maxLength={6}
                            required
                            autoFocus
                          />
                        </label>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button className="button" type="submit" disabled={loading}>
                            {loading ? 'Verifying…' : 'Verify & Sign In ↗'}
                          </button>
                          <button
                            type="button"
                            className="text-link"
                            onClick={() => {
                              setOtpSent(false)
                              setOtpCode('')
                            }}
                          >
                            Change number
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="demo-stacked-form">
                    <label>
                      Email Address or Mobile Phone Number
                      <input
                        type="text"
                        placeholder="patient@example.com or +91 9876543210"
                        value={patientEmail}
                        onChange={e => setPatientEmail(e.target.value)}
                        required
                        autoComplete="username"
                      />
                    </label>
                    <span className="auth-field-hint" style={{ fontSize: '11px', color: '#587477', marginTop: '-6px', marginBottom: '10px', display: 'block' }}>
                      Sign in using your registered email address or mobile phone number.
                    </span>
                    <label>
                      Password
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={patientPassword}
                        onChange={e => setPatientPassword(e.target.value)}
                        minLength={6}
                        required
                      />
                    </label>
                    <button className="button" type="submit" disabled={loading}>
                      {loading ? 'Authenticating…' : 'Sign In as Patient ↗'}
                    </button>
                  </form>
                )}
              </>
            )}

            {authTab === 'signup' && (
              <div className="clinical-intake-wizard">
                {/* Multi-Step Intake Progress Bar */}
                <div className="intake-stepper-header">
                  <div className="intake-stepper-track">
                    <div
                      className="intake-stepper-fill"
                      style={{ width: `${((signupStep - 1) / 3) * 100}%` }}
                    />
                  </div>
                  <div className="intake-steps-labels">
                    {[
                      { step: 1, title: '1. Account' },
                      { step: 2, title: '2. Demographics' },
                      { step: 3, title: '3. Baseline Vitals' },
                      { step: 4, title: '4. Clinical History' },
                    ].map(s => (
                      <button
                        key={s.step}
                        type="button"
                        className={`intake-step-chip ${signupStep === s.step ? 'active' : signupStep > s.step ? 'completed' : ''}`}
                        onClick={() => {
                          if (s.step < signupStep) setSignupStep(s.step as any)
                          else if (s.step === 2 && validateStep1()) setSignupStep(2)
                          else if (s.step === 3 && validateStep1() && validateStep2()) setSignupStep(3)
                          else if (s.step === 4 && validateStep1() && validateStep2() && validateStep3()) setSignupStep(4)
                        }}
                      >
                        <span className="step-num">{signupStep > s.step ? '✓' : s.step}</span>
                        <span>{s.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="demo-stacked-form intake-form">
                  {/* STEP 1: Account Credentials */}
                  {signupStep === 1 && (
                    <div className="intake-step-pane">
                      <div className="intake-pane-intro">
                        <h3>Patient Account & Contact Credentials</h3>
                        <p>Create your private, HIPAA & DISHA compliant healthcare identity.</p>
                      </div>

                      <label>
                        Full Legal Name *
                        <input
                          type="text"
                          placeholder="First and last name"
                          value={patientName}
                          onChange={e => setPatientName(e.target.value)}
                          required
                          autoFocus
                        />
                      </label>

                      <label>
                        Email Address *
                        <input
                          type="email"
                          placeholder="patient@example.com"
                          value={patientEmail}
                          onChange={e => setPatientEmail(e.target.value)}
                          required
                        />
                      </label>

                      <label>
                        Mobile Phone Number *
                        <input
                          type="tel"
                          placeholder="+91 9876543210"
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                          required
                        />
                      </label>

                      <label>
                        Create Secure Password *
                        <input
                          type="password"
                          placeholder="At least 6 characters"
                          value={patientPassword}
                          onChange={e => setPatientPassword(e.target.value)}
                          minLength={6}
                          required
                        />
                      </label>

                      <div className="intake-actions-row">
                        <button
                          type="button"
                          className="button"
                          onClick={() => {
                            if (validateStep1()) setSignupStep(2)
                          }}
                        >
                          Next: Personal & Demographics ↗
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Demographics & Emergency Contact */}
                  {signupStep === 2 && (
                    <div className="intake-step-pane">
                      <div className="intake-pane-intro">
                        <h3>Personal Demographics & Emergency Contacts</h3>
                        <p>Essential for accurate clinical dosing, triage, and hospital OPD records.</p>
                      </div>

                      <div className="intake-grid-2">
                        <label>
                          Age (Years) *
                          <input
                            type="number"
                            min="1"
                            max="120"
                            placeholder="e.g. 29"
                            value={patientAge}
                            onChange={e => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                            required
                          />
                        </label>

                        <label>
                          Date of Birth
                          <input
                            type="date"
                            value={patientDob}
                            onChange={e => setPatientDob(e.target.value)}
                          />
                        </label>
                      </div>

                      <div className="intake-grid-2">
                        <label>
                          Biological Sex / Gender *
                          <select
                            value={patientGender}
                            onChange={e => setPatientGender(e.target.value as any)}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </label>

                        <label>
                          Blood Group *
                          <select
                            value={patientBloodGroup}
                            onChange={e => setPatientBloodGroup(e.target.value as any)}
                          >
                            {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const).map(bg => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label>
                        Residential Street Address *
                        <input
                          type="text"
                          placeholder="House/Flat number, Street, Locality"
                          value={patientAddress}
                          onChange={e => setPatientAddress(e.target.value)}
                          required
                        />
                      </label>

                      <div className="intake-grid-2">
                        <label>
                          City *
                          <input
                            type="text"
                            placeholder="e.g. New Delhi"
                            value={patientCity}
                            onChange={e => setPatientCity(e.target.value)}
                            required
                          />
                        </label>

                        <label>
                          Postal Pincode *
                          <input
                            type="text"
                            placeholder="e.g. 110001"
                            value={patientPincode}
                            onChange={e => setPatientPincode(e.target.value)}
                            maxLength={8}
                            required
                          />
                        </label>
                      </div>

                      <div className="intake-subcard">
                        <span className="eyebrow">EMERGENCY CONTACT PROTOCOL</span>
                        <div className="intake-grid-2" style={{ marginTop: 8 }}>
                          <label>
                            Contact Name *
                            <input
                              type="text"
                              placeholder="Full name of next of kin"
                              value={emergencyName}
                              onChange={e => setEmergencyName(e.target.value)}
                              required
                            />
                          </label>

                          <label>
                            Relationship *
                            <select
                              value={emergencyRel}
                              onChange={e => setEmergencyRel(e.target.value)}
                            >
                              <option value="Parent / Guardian">Parent / Guardian</option>
                              <option value="Spouse / Partner">Spouse / Partner</option>
                              <option value="Sibling">Sibling</option>
                              <option value="Child">Child</option>
                              <option value="Close Friend">Close Friend</option>
                            </select>
                          </label>
                        </div>

                        <label style={{ marginTop: 8 }}>
                          Emergency Phone Number *
                          <input
                            type="tel"
                            placeholder="+91 9876543210"
                            value={emergencyPhone}
                            onChange={e => setEmergencyPhone(e.target.value)}
                            required
                          />
                        </label>
                      </div>

                      <div className="intake-actions-row">
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => setSignupStep(1)}
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          className="button"
                          onClick={() => {
                            if (validateStep2()) setSignupStep(3)
                          }}
                        >
                          Next: Baseline Vitals ↗
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Baseline Physical & Vitals */}
                  {signupStep === 3 && (
                    <div className="intake-step-pane">
                      <div className="intake-pane-intro">
                        <h3>Baseline Physical Metrics & Vitals</h3>
                        <p>Used by doctors to evaluate physiological stability and calculate safe prescription dosages.</p>
                      </div>

                      <div className="intake-grid-2">
                        <label>
                          Height (in cm)
                          <input
                            type="number"
                            min="40"
                            max="250"
                            placeholder="e.g. 172"
                            value={heightCm}
                            onChange={e => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                          />
                        </label>

                        <label>
                          Weight (in kg)
                          <input
                            type="number"
                            min="2"
                            max="300"
                            placeholder="e.g. 68"
                            value={weightKg}
                            onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                          />
                        </label>
                      </div>

                      {calculatedBmi && (
                        <div className="bmi-banner-card">
                          <div>
                            <span className="eyebrow">AUTOMATED CLINICAL INDEX</span>
                            <h4>Body Mass Index (BMI): <strong>{calculatedBmi} kg/m²</strong></h4>
                          </div>
                          {bmiCategory && (
                            <span
                              className="bmi-category-pill"
                              style={{ background: `${bmiCategory.color}15`, color: bmiCategory.color, borderColor: `${bmiCategory.color}40` }}
                            >
                              ● {bmiCategory.label}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="intake-subcard" style={{ marginTop: 12 }}>
                        <span className="eyebrow">RESTING CARDIOVASCULAR METRICS</span>
                        <div className="intake-grid-2" style={{ marginTop: 8 }}>
                          <label>
                            Systolic BP (mmHg)
                            <input
                              type="number"
                              min="70"
                              max="240"
                              placeholder="e.g. 120"
                              value={bpSystolic}
                              onChange={e => setBpSystolic(e.target.value ? Number(e.target.value) : '')}
                            />
                            <small className="field-note">Normal: 90–120 mmHg</small>
                          </label>

                          <label>
                            Diastolic BP (mmHg)
                            <input
                              type="number"
                              min="40"
                              max="140"
                              placeholder="e.g. 80"
                              value={bpDiastolic}
                              onChange={e => setBpDiastolic(e.target.value ? Number(e.target.value) : '')}
                            />
                            <small className="field-note">Normal: 60–80 mmHg</small>
                          </label>
                        </div>

                        <label style={{ marginTop: 8 }}>
                          Resting Pulse Rate (BPM)
                          <input
                            type="number"
                            min="40"
                            max="200"
                            placeholder="e.g. 72"
                            value={pulseRate}
                            onChange={e => setPulseRate(e.target.value ? Number(e.target.value) : '')}
                          />
                          <small className="field-note">Normal resting adult: 60–100 bpm</small>
                        </label>
                      </div>

                      <div className="intake-actions-row">
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => setSignupStep(2)}
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          className="button"
                          onClick={() => {
                            if (validateStep3()) setSignupStep(4)
                          }}
                        >
                          Next: Medical History ↗
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Comprehensive Medical History & Insurance */}
                  {signupStep === 4 && (
                    <div className="intake-step-pane">
                      <div className="intake-pane-intro">
                        <h3>Previous Medical History & Insurance</h3>
                        <p>Critical for preventing adverse drug interactions and verifying insurance pre-authorization.</p>
                      </div>

                      {/* Known Allergies */}
                      <div className="intake-field-group">
                        <label style={{ fontWeight: 600 }}>Known Drug, Food & Environmental Allergies</label>
                        <div className="intake-tag-chips">
                          {commonAllergies.map(allergy => (
                            <button
                              key={allergy}
                              type="button"
                              className={`intake-chip-btn ${selectedAllergies.includes(allergy) ? 'active' : ''}`}
                              onClick={() => toggleAllergy(allergy)}
                            >
                              {selectedAllergies.includes(allergy) ? '✓ ' : '+ '}
                              {allergy}
                            </button>
                          ))}
                        </div>
                        <div className="intake-add-tag-row">
                          <input
                            type="text"
                            placeholder="Type another allergy and press Add…"
                            value={customAllergy}
                            onChange={e => setCustomAllergy(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAllergy() } }}
                          />
                          <button type="button" className="button secondary" onClick={addCustomAllergy}>
                            Add Allergy
                          </button>
                        </div>
                      </div>

                      {/* Pre-existing Conditions */}
                      <div className="intake-field-group" style={{ marginTop: 14 }}>
                        <label style={{ fontWeight: 600 }}>Pre-existing Chronic Conditions</label>
                        <div className="intake-tag-chips">
                          {commonConditions.map(cond => (
                            <button
                              key={cond}
                              type="button"
                              className={`intake-chip-btn ${selectedConditions.includes(cond) ? 'active' : ''}`}
                              onClick={() => toggleCondition(cond)}
                            >
                              {selectedConditions.includes(cond) ? '✓ ' : '+ '}
                              {cond}
                            </button>
                          ))}
                        </div>
                        <div className="intake-add-tag-row">
                          <input
                            type="text"
                            placeholder="Type another condition and press Add…"
                            value={customCondition}
                            onChange={e => setCustomCondition(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomCondition() } }}
                          />
                          <button type="button" className="button secondary" onClick={addCustomCondition}>
                            Add Condition
                          </button>
                        </div>
                      </div>

                      <label style={{ marginTop: 14 }}>
                        Past Major Surgeries or Hospitalizations
                        <textarea
                          placeholder="e.g. Appendectomy (2021), Knee Arthroscopy (2024), or None"
                          value={pastSurgeries}
                          onChange={e => setPastSurgeries(e.target.value)}
                          rows={2}
                        />
                      </label>

                      <label style={{ marginTop: 10 }}>
                        Current Ongoing Medications (Prescription or Supplements)
                        <textarea
                          placeholder="e.g. Metformin 500mg daily, Vitamin D3 weekly, or None"
                          value={currentMedications}
                          onChange={e => setCurrentMedications(e.target.value)}
                          rows={2}
                        />
                      </label>

                      <label style={{ marginTop: 10 }}>
                        Family Health History
                        <input
                          type="text"
                          placeholder="e.g. Maternal history of Type 2 Diabetes, Hypertension"
                          value={familyHistory}
                          onChange={e => setFamilyHistory(e.target.value)}
                        />
                      </label>

                      <div className="intake-subcard" style={{ marginTop: 14 }}>
                        <span className="eyebrow">HEALTH INSURANCE (OPTIONAL)</span>
                        <div className="intake-grid-2" style={{ marginTop: 8 }}>
                          <label>
                            Insurance Company
                            <input
                              type="text"
                              placeholder="e.g. Star Health, HDFC ERGO, ICICI Lombard"
                              value={insuranceProvider}
                              onChange={e => setInsuranceProvider(e.target.value)}
                            />
                          </label>

                          <label>
                            Policy / Member Card Number
                            <input
                              type="text"
                              placeholder="e.g. POL-88294103"
                              value={insurancePolicy}
                              onChange={e => setInsurancePolicy(e.target.value)}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="intake-actions-row">
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => setSignupStep(3)}
                        >
                          ← Back
                        </button>
                        <button
                          type="submit"
                          className="button"
                          disabled={loading}
                        >
                          {loading ? 'Creating Patient File…' : 'Complete Registration & Open Dashboard ✓'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            DOCTOR AUTHENTICATION
            ========================================================================= */}
        {activeRole === 'Doctor' && (
          <div className="auth-role-panel">
            <div className="auth-sub-nav">
              <button
                type="button"
                className={authTab === 'signin' ? 'active' : ''}
                onClick={() => setAuthTab('signin')}
              >
                Clinical Sign In
              </button>
              <button
                type="button"
                className={authTab === 'signup' ? 'active' : ''}
                onClick={() => setAuthTab('signup')}
              >
                Doctor Credentialing (Sign Up)
              </button>
            </div>

            {authTab === 'signin' ? (
              <>
                <div className="auth-quick-doctors">
                  <span>Pre-Seeded Clinical Accounts:</span>
                  <div className="auth-seed-chips">
                    {SEED_DATASET_DOCTORS.slice(0, 3).map(doc => (
                      <button
                        key={doc.email}
                        type="button"
                        className="auth-seed-chip"
                        onClick={() => {
                          setDocEmail(doc.email)
                          setDocPassword(doc.password)
                        }}
                      >
                        {doc.displayName.split(' ')[1]} ({doc.specialist})
                      </button>
                    ))}
                    <button
                      type="button"
                      className="auth-seed-chip"
                      onClick={() => {
                        setDocEmail('anita.q.basu@hospital.com')
                        setDocPassword('doctor123')
                      }}
                    >
                      Dr. Anita Basu (Care)
                    </button>
                  </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="demo-stacked-form">
                  <label>
                    Clinical Email
                    <input
                      type="email"
                      placeholder="e.g. rajesh.panda@aiims.edu or anita.q.basu@hospital.com"
                      value={docEmail}
                      onChange={e => setDocEmail(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Clinical Password
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={docPassword}
                      onChange={e => setDocPassword(e.target.value)}
                      required
                    />
                  </label>
                  <button className="button" type="submit" disabled={loading}>
                    {loading ? 'Verifying clinical credentials…' : 'Doctor Sign In ↗'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="auth-helper-note">
                  Enter your clinical credentials. Your official doctor login email will be generated in dataset format upon submission (e.g., <code>anita.q.basu@hospital.com</code>).
                </p>

                {issuedResult && (
                  <div className="auth-credential-card">
                    <h4>✓ Official Doctor Credentials Issued</h4>
                    <p>
                      <strong>Doctor:</strong> {issuedResult.name}
                    </p>
                    <p>
                      <strong>Issued Email:</strong> <code>{issuedResult.email}</code>
                    </p>
                    <p>
                      <strong>Password:</strong> <code>{issuedResult.pass}</code>
                    </p>
                    <small>Logging you directly into the clinical OPD workspace…</small>
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="demo-stacked-form">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <label>
                      First Name
                      <input
                        type="text"
                        placeholder="e.g. Rajesh"
                        value={docFirstName}
                        onChange={e => setDocFirstName(e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Middle Name
                      <input
                        type="text"
                        placeholder="Kumar"
                        value={docMiddleName}
                        onChange={e => setDocMiddleName(e.target.value)}
                      />
                    </label>
                    <label>
                      Last Name
                      <input
                        type="text"
                        placeholder="Panda"
                        value={docLastName}
                        onChange={e => setDocLastName(e.target.value)}
                        required
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label>
                      Specialty
                      <select value={docSpecialty} onChange={e => setDocSpecialty(e.target.value)}>
                        {allMedicalFields.map(f => (
                          <option key={f.id} value={f.name}>
                            {f.icon} {f.name} ({f.specialistTitle})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Experience (Years)
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={docExperience}
                        onChange={e => setDocExperience(Number(e.target.value))}
                        required
                      />
                    </label>
                  </div>

                  <label>
                    Affiliated Hospital
                    <input
                      type="text"
                      placeholder="e.g. AIIMS New Delhi or Care Hospitals"
                      value={docHospital}
                      onChange={e => setDocHospital(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Account Password
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={docPassword}
                      onChange={e => setDocPassword(e.target.value)}
                      required
                    />
                  </label>

                  <button className="button" type="submit" disabled={loading}>
                    {loading ? 'Issuing hospital credentials…' : 'Submit Details & Issue Doctor Email ↗'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* =========================================================================
            ADMIN AUTHENTICATION
            ========================================================================= */}
        {activeRole === 'Admin' && (
          <div className="auth-role-panel">
            <div className="auth-admin-helper">
              <span>Root Access: Predefined Credentials</span>
              <button
                type="button"
                className="auth-seed-chip"
                onClick={() => {
                  setAdminEmail('admin@gmail.com')
                  setAdminPassword('admin')
                }}
              >
                Autofill: admin@gmail.com / admin
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="demo-stacked-form">
              <label>
                Administrator Email
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Administrator Password
                <input
                  type="password"
                  placeholder="admin"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  required
                />
              </label>
              <button className="button" type="submit" disabled={loading}>
                {loading ? 'Verifying admin credentials…' : 'Enter Admin Command Center ↗'}
              </button>
            </form>
          </div>
        )}

        {/* Google In-App Authentication Modal */}
        {showGoogleModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(8, 51, 68, 0.72)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '16px',
            }}
            onClick={e => {
              if (e.target === e.currentTarget && !googleModalLoading) {
                setShowGoogleModal(false)
              }
            }}
          >
            <div
              style={{
                background: '#ffffff',
                width: '100%',
                maxWidth: '430px',
                borderRadius: '24px',
                boxShadow: '0 25px 60px -15px rgba(8, 51, 68, 0.35)',
                padding: '28px 24px',
                position: 'relative',
                animation: 'paymentFadeIn 0.2s ease-out',
                color: '#083344',
                fontFamily: 'inherit',
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                disabled={googleModalLoading}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b',
                  lineHeight: 1,
                  padding: '4px',
                }}
              >
                ✕
              </button>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#f8fafc',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    marginBottom: '12px',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
                  Google Patient Sign-In
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Connect your Google account securely to access your health portal.
                </p>
              </div>

              {googleModalError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    marginBottom: '16px',
                  }}
                >
                  {googleModalError}
                </div>
              )}

              {/* Instant 1-Tap Sign-In */}
              <div style={{ marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={handleInstantGoogleSignIn}
                  disabled={googleModalLoading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '1.5px solid #107980',
                    background: '#f0fdfa',
                    color: '#0f766e',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>⚡ 1-Tap Continue as Verified Google Patient</span>
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '16px 0',
                  color: '#94a3b8',
                  fontSize: '12px',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ padding: '0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  or enter your Google email
                </span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              {/* Custom Google Email Form */}
              <form onSubmit={handleGoogleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '6px',
                    }}
                  >
                    Google Email / Gmail
                  </label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={googleModalEmail}
                    onChange={e => setGoogleModalEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: '6px',
                    }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password (minimum 6 characters)"
                    value={googleModalPass}
                    onChange={e => setGoogleModalPass(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={googleModalLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#083344',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '6px',
                  }}
                >
                  {googleModalLoading ? 'Authenticating with Google…' : 'Sign In with Google Account ↗'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
