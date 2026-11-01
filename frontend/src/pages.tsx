import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams, Navigate } from 'react-router'
const SidebarCollapse = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" {...props}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="4" strokeWidth="1.9" />
    <line x1="8.75" y1="2.5" x2="8.75" y2="21.5" strokeWidth="1.9" />
    <path d="M7 8.75L4.25 12L7 15.25" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SidebarExpand = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" {...props}>
    <rect x="2.5" y="2.5" width="19" height="19" rx="4" strokeWidth="1.9" />
    <line x1="8.75" y1="2.5" x2="8.75" y2="21.5" strokeWidth="1.9" />
    <path d="M4.25 8.75L7 12L4.25 15.25" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
import { IMAGES } from './images'
import { doctors, medicines, demoOrders, hospitals, type Medicine, type DemoOrder } from './mock-data'
import { getDoctors, getStats, checkSymptomsAI, bookAppointment, getMedicines, getMedicineCategories, getSpecialties, getCities, getAppointments, updateAppointmentStatus, getSharedAppointments, getSharedPrescriptions, saveSharedPrescription, deleteSharedPrescription, clearAllSharedPrescriptions, loadAllDoctors, loadAllMedicines, type ApiDoctor, type ApiMedicine, type ApiAppointment, type SystemStats, type TriageResult, type SharedPrescription } from './api'
import { getStoredUser, getStoredAuthUser, logoutUser, updateStoredPatientProfile, updateStoredDoctorProfile, type AuthUser, type PatientHealthProfile } from './auth'
import { saveAppointmentFirestore, saveOrderFirestore } from './firestore'
import { getDoctorImage, getHospitalImage, getMedicineImage, hasAuthenticMedicinePhoto, getMedicineDosageIcon } from './images'
import { MedicineDropdownInput } from './MedicineDropdown'
import CatalogPage from './catalog'
import AuthView from './AuthView'
import { YouPIModal, type YouPIPaymentResult } from './YouPIModal'
import { allMedicalFields, resolveMedicalField } from './data/medical-fields'
import { AppointmentReceiptModal } from './AppointmentReceiptModal'

type Appointment = {
  id: string
  doctor: string
  date: string
  time: string
  specialty: string
  status: string
  hospital?: string
  hospitalCity?: string
  state?: string
  type?: string
  fee?: number
  paymentStatus?: 'Paid' | 'Refunded'
  paymentMethod?: string
  utr?: string
  cancellationFee?: number
  refundAmount?: number
  refundUtr?: string
  patientName?: string
}
type Claim = { id: string; title: string; date: string; amount: number; status: string }
type DemoState = { appointments: Appointment[]; cart: Medicine[]; claims: Claim[]; order: boolean; prescription: boolean; orders: DemoOrder[] }
const seed: DemoState = {
  appointments: [],
  cart: [],
  order: false,
  prescription: false,
  orders: [],
  claims: [],
}
export const DemoContext = createContext<{ state: DemoState; update: (fn: (previous: DemoState) => DemoState) => void }>({ state: seed, update: () => {} })

function getUserStateKey(): string {
  try {
    const raw = localStorage.getItem('iryotek_auth_user')
    if (raw) {
      const u = JSON.parse(raw)
      const id = u.uid || (u.email ? u.email.toLowerCase().trim() : '')
      if (id) return `iryotek_user_state_${id}`
    }
  } catch (e) {}
  return 'iryotek_user_state_guest'
}

function loadUserState(): DemoState {
  try {
    const key = getUserStateKey()
    const stored = localStorage.getItem(key)
    const shared = getSharedAppointments()
    const sharedRxs = getSharedPrescriptions()

    // 1. Map shared appointments from database & cross-session storage
    const sharedMapped: Appointment[] = (shared || [])
      .filter((s: any) => s && !['APT-1081', 'APT-1082', 'APT-1083', 'APT-1084'].includes(String(s.id)))
      .map((s: any) => ({
        id: String(s.id || s.tokenNo || '1'),
        doctor: s.doctor || s.doctorName || 'Dr. Specialist',
        date: s.date || s.appointmentDate || '2026-10-27',
        time: s.time || s.appointmentTime || '09:00 AM',
        specialty: s.specialty || 'General Physician',
        status: s.status || 'Pending',
        hospital: s.hospital || 'AIIMS Hospital Bhubaneswar',
        hospitalCity: s.hospitalCity || 'Bhubaneswar',
        fee: s.fee || 500,
        paymentStatus: 'Paid',
        paymentMethod: s.paymentMethod || 'UPI',
        utr: s.utr,
        patientName: s.patientName || s.fullName || 'Patient'
      }))

    // 2. Local state appointments
    let rawAppointments: Appointment[] = []
    let parsed: any = null
    if (stored) {
      try {
        parsed = JSON.parse(stored)
        if (Array.isArray(parsed.appointments)) {
          rawAppointments = parsed.appointments
        }
      } catch (e) {}
    }

    // 3. Merge: shared mapped first, overlay local rawAppointments
    const apptMap = new Map<string, Appointment>()
    sharedMapped.forEach(a => apptMap.set(String(a.id), a))
    rawAppointments.forEach((a: any) => {
      if (a && a.id && !['APT-1081', 'APT-1082', 'APT-1083', 'APT-1084'].includes(String(a.id))) {
        const idKey = String(a.id)
        apptMap.set(idKey, { ...apptMap.get(idKey), ...a })
      }
    })

    const mergedAppointments = Array.from(apptMap.values())

    return {
      appointments: mergedAppointments,
      cart: parsed && Array.isArray(parsed.cart) ? parsed.cart : [],
      order: Boolean(parsed?.order),
      prescription: Boolean(sharedRxs.length > 0 || parsed?.prescription),
      orders: parsed && Array.isArray(parsed.orders) ? parsed.orders : [],
      claims: parsed && Array.isArray(parsed.claims) ? parsed.claims : [],
    }
  } catch (e) {}
  return { ...seed }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => loadUserState())

  useEffect(() => {
    const handleSync = () => {
      setState(loadUserState())
    }
    window.addEventListener('iryotek_auth_changed', handleSync)
    window.addEventListener('iryotek_appointment_updated', handleSync)
    window.addEventListener('iryotek_prescription_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('iryotek_auth_changed', handleSync)
      window.removeEventListener('iryotek_appointment_updated', handleSync)
      window.removeEventListener('iryotek_prescription_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const update = useCallback((fn: (previous: DemoState) => DemoState) => {
    setState(prev => {
      const next = fn(prev)
      try {
        const key = getUserStateKey()
        localStorage.setItem(key, JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }, [])

  return <DemoContext.Provider value={{ state, update }}>{children}</DemoContext.Provider>
}

export function Photo({ image = '', alt, className = '' }: { image?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const isUrl = Boolean(image && (image.startsWith('http') || image.startsWith('/') || image.startsWith('data:')))
  const rawSrc = isUrl ? image! : (image && IMAGES[image] ? IMAGES[image] : '')
  const src = rawSrc.includes('unsplash.com') ? rawSrc.replace('w=1920', 'w=640') : rawSrc
  if (!src || failed) {
    return <span className={`demo-photo-fallback ${className}`} role="img" aria-label={alt}>+</span>
  }
  return <img className={className} src={src} alt={alt} width="480" height="480" loading="lazy" decoding="async" onError={() => setFailed(true)} />
}
export function Badge({ children, style, className = '' }: { children: ReactNode; style?: React.CSSProperties; className?: string }) { return <span className={`demo-badge ${className}`} style={style}>{children}</span> }
export function Panel({ title, subtitle, action, children, className = '' }: { title?: string; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`demo-panel ${className}`}>
      {title && (
        <div className="demo-panel-title">
          <h3>{title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {subtitle && <span>{subtitle}</span>}
            {action}
          </div>
        </div>
      )}
      {children}
    </section>
  )
}
export function PageHeading({ label, title, description, action }: { label: string; title: string; description: string; action?: ReactNode }) {
  return <div className="demo-page-heading"><div><span className="eyebrow">{label}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>
}
const patientNav = [
  { path: 'patient', icon: '◌', label: 'My overview' },
  { path: 'appointments', icon: '◷', label: 'Appointments' },
  { path: 'triage', icon: '✳', label: 'Iryo AI' },
  { path: 'pharmacy', icon: '✚', label: 'Pharmacy' },
  { path: 'records', icon: '▤', label: 'Health records' },
  { path: 'directory', icon: '⌕', label: 'Find a doctor' },
  { path: 'claims', icon: '◇', label: 'Insurance claims' },
  { path: 'hospitals', icon: '▥', label: 'Hospitals' },
  { path: 'prescriptions', icon: '℞', label: 'Prescriptions' },
  { path: 'orders', icon: '▧', label: 'My orders' },
  { path: 'login', icon: '⚿', label: 'Sign in / Portals' },
  { path: 'profile', icon: '◉', label: 'My profile' }
]

const doctorNav = [
  { path: 'doctor', icon: '◌', label: 'My overview' },
  { path: 'appointments', icon: '◷', label: 'Appointments' },
  { path: 'pharmacy', icon: '✚', label: 'Pharmacy' },
  { path: 'hospitals', icon: '▥', label: 'Hospitals' },
  { path: 'prescriptions', icon: '℞', label: 'Prescriptions' },
  { path: 'profile', icon: '◉', label: 'My profile' }
]

const nav = patientNav

function AuthGate({ page, title, notify, onSuccess }: { page: string; title: string; notify: (msg: string) => void; onSuccess: (user: AuthUser) => void }) {
  return (
    <div className="auth-gate-wrapper" style={{ maxWidth: 840, margin: '24px auto', padding: '0 16px' }}>
      <AuthView notify={notify} onSuccess={onSuccess} />
    </div>
  )
}

export function CarePage() {
  const { pathname } = useLocation(), page = pathname.split('/')[1]
  const [notice, setNotice] = useState(''), [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && (window.innerWidth <= 1024 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent))) {
      return true
    }
    try {
      const stored = localStorage.getItem('iryotek_sidebar_collapsed')
      if (stored !== null) return stored === 'true'
    } catch {}
    return false
  })
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser())
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const notify = (text: string) => { setNotice(text); if (noticeTimer.current) clearTimeout(noticeTimer.current); noticeTimer.current = setTimeout(() => setNotice(''), 5000) }
  
  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setMenuOpen(prev => !prev)
      return
    }
    setSidebarCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem('iryotek_sidebar_collapsed', String(next)) } catch {}
      return next
    })
  }
  
  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
    setCurrentUser(getStoredUser());
    document.title = `Iryotek | ${page.charAt(0).toUpperCase() + page.slice(1)}`;
    const handleAuthChange = () => setCurrentUser(getStoredUser());
    window.addEventListener('iryotek_auth_changed', handleAuthChange);
    return () => { 
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      window.removeEventListener('iryotek_auth_changed', handleAuthChange);
    }
  }, [page])

  const isDoctor = currentUser?.role === 'Doctor'
  const activeNav = isDoctor ? doctorNav : patientNav
  const title = activeNav.find(item => item.path === page)?.label || (isDoctor && (page === 'doctor' || page === 'patient') ? 'My overview' : undefined) || ({ doctor: 'My overview', admin: 'Admin center', privacy: 'Privacy & consent', contact: 'Get in touch', doctors: 'Doctor directory', medicines: 'Medicine catalog', cart: 'Your care cart', checkout: 'Checkout', notifications: 'Notifications', login: 'Portal access', register: 'Get started' }[page] || 'Connected care')
  const isPublicPage = ['login', 'register', 'privacy', 'contact'].includes(page)
  const visibleNav = isDoctor ? doctorNav : patientNav.filter(item => !(currentUser && item.path === 'login'))

  return <div className="demo-app">
    {menuOpen && <button className="demo-drawer-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
    <aside className={`demo-sidebar ${menuOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="demo-sidebar-brand-row">
        <Link to="/" className="brand">
          <span className="demo-kamon">✳</span>
          <span className="brand-text">iryotek<span className="brand-jp">HEALTHCARE</span></span>
        </Link>
        <button
          type="button"
          className="demo-sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <SidebarExpand /> : <SidebarCollapse />}
        </button>
      </div>
      <nav aria-label="Care navigation">{visibleNav.map(item => <Link key={item.path} to={`/${item.path}`} onClick={() => setMenuOpen(false)} className={(page === item.path || (isDoctor && item.path === 'doctor' && page === 'patient')) ? 'selected' : ''} aria-current={page === item.path ? 'page' : undefined} title={sidebarCollapsed ? item.label : undefined}><span>{item.icon}</span><span className="nav-label">{item.label}</span>{item.path === 'triage' && <i className="tiny-dot" />}</Link>)}</nav>
    </aside>
    <div className={`demo-main ${sidebarCollapsed ? 'expanded' : ''}`}>
      <header className="demo-topbar">
        <button className="demo-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>☰</button>
        <span>WORKSPACE <b>/ {title}</b></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/notifications" className="demo-notifications" aria-label="Open notifications">♧</Link>
          {currentUser ? (
            <>
              <Badge><i className="status-dot" /> {currentUser.role.toUpperCase()}</Badge>
              <span style={{ fontSize: 11, fontFamily: 'var(--sans)', color: 'var(--ink)' }}>{currentUser.displayName}</span>
              <button type="button" className="text-link" style={{ fontSize: 10, cursor: 'pointer', padding: '0 4px', background: 'transparent', border: 'none', color: '#587477' }} onClick={() => { logoutUser(); setCurrentUser(null); notify('Signed out successfully.') }}>Sign out</button>
              <Link to="/profile" aria-label="Open your profile" className="demo-user-avatar">{currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'US'}</Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link to={`/login?redirect=${encodeURIComponent(page)}`} className="text-link" style={{ fontSize: 11, padding: '4px 8px' }}>Sign In</Link>
              <Link to={`/register?redirect=${encodeURIComponent(page)}`} className="button" style={{ padding: '6px 12px', fontSize: 11 }}>Sign Up <span>↗</span></Link>
            </div>
          )}
        </div>
      </header>
      <main className="demo-content" key={page}>
        {(!currentUser && !isPublicPage) ? (
          <AuthGate
            page={page}
            title={title}
            notify={notify}
            onSuccess={(user) => {
              setCurrentUser(user)
              notify(`Welcome back, ${user.displayName || user.email}! You now have full access.`)
            }}
          />
        ) : (
          <>
            {isDoctor && ['records', 'directory', 'claims', 'doctors'].includes(page) ? (
              <div style={{ maxWidth: 640, margin: '48px auto', textAlign: 'center', padding: '32px 24px', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🩺</div>
                <h3 style={{ margin: '0 0 8px' }}>Doctor Clinical Workspace</h3>
                <p style={{ color: '#587477', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                  The {page === 'records' ? 'Health Records' : page === 'claims' ? 'Insurance Claims' : 'Find a Doctor'} section is designated for patient accounts. As a doctor, your tools are centralized in your clinical dashboard.
                </p>
                <Link to="/doctor" className="button">Go to My Overview (Doctor Dashboard) ↗</Link>
              </div>
            ) : (
              <>
                {(page === 'patient' || page === 'doctor') && (isDoctor ? <DoctorPage notify={notify} /> : (page === 'doctor' ? <DoctorPage notify={notify} /> : <PatientPage />))}
                {page === 'appointments' && <AppointmentsPage notify={notify} />}
                {page === 'triage' && <TriagePage />}
                {(page === 'pharmacy' || (page === 'medicines' && !pathname.split('/')[2])) && <PharmacyPage notify={notify} />}
                {page === 'consultation' && <ConsultationPage notify={notify} />}
                {page === 'records' && <RecordsPage notify={notify} />}
                {(page === 'directory' || (page === 'doctors' && !pathname.split('/')[2])) && <DirectoryPage />}
                {page === 'admin' && <AdminPage notify={notify} />}
                {page === 'claims' && <ClaimsPage notify={notify} />}
                {page === 'profile' && <ProfilePage notify={notify} />}
                {page === 'privacy' && <InformationPage />}
                {page === 'contact' && <InformationPage contact />}
                <CatalogPage page={page} notify={notify} />
              </>
            )}
          </>
        )}
        <footer className="demo-footer"><span>© 2026 IRYOTEK · THOUGHTFULLY CONNECTED.</span><span>Fictional people and data. No live medical services.</span><Link to="/privacy">Privacy & consent ↗</Link></footer>
      </main>
    </div>
    {notice && <div className="demo-notice" role="status">✓ {notice}</div>}
  </div>
}

function PatientPage() {
  const { state } = useContext(DemoContext)
  const user = getStoredUser()
  const profile = user?.patientProfile
  const appointment = state.appointments.find(item => item.status !== 'Cancelled')
  const displayName = user?.displayName || 'Patient'
  const bp = profile?.bloodPressure ? `${profile.bloodPressure.systolic}/${profile.bloodPressure.diastolic}` : '--'
  const pulse = profile?.pulseRate ? String(profile.pulseRate) : '--'
  const bmiOrBlood = profile?.bmi ? String(profile.bmi) : (profile?.bloodGroup || '--')

  return (
    <>
      <PageHeading
        label="PATIENT / YOUR DAILY PICTURE"
        title="A calmer kind of care."
        description={`Good morning, ${displayName}. Your personal health records and care history in one place.`}
        action={<Link className="button" to="/appointments">Book an appointment <span>↗</span></Link>}
      />
      <div className="demo-overview-grid">
        <section className="demo-welcome dark">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2>More living.<br /><em>Less waiting.</em></h2>
          <p>From your first question to your everyday wellbeing. We're here for every step.</p>
          <Link className="button light" to="/triage">Start with Iryo <span>↗</span></Link>
          <span className="welcome-kanji">CARE</span>
        </section>
        <Panel title="Your next appointment" subtitle="RESERVATIONS">
          {appointment ? (
            <>
              <div className="demo-doctor-inline">
                <Photo image={getDoctorImage({ name: appointment.doctor })} alt={appointment.doctor} />
                <div>
                  <h4>{appointment.doctor}</h4>
                  <p>{appointment.specialty}</p>
                </div>
              </div>
              <div className="appointment-time">
                <span>{appointment.date}</span>
                <strong>{appointment.time} <small>AM</small></strong>
                <Badge>{appointment.status === 'Pending' ? 'Pending Approval' : appointment.status} · Token {appointment.id}</Badge>
              </div>
              {appointment.status === 'Approved' || appointment.status === 'Confirmed' ? (
                <Link to="/appointments" className="text-link">View appointment details ↗</Link>
              ) : (
                <div style={{ fontSize: '11px', color: '#b45309', marginTop: '10px' }}>
                  ⏳ Awaiting doctor approval (<Link to="/doctor" className="text-link">Review in Doctor workspace ↗</Link>)
                </div>
              )}
            </>
          ) : (
            <p>No upcoming visits. <Link to="/appointments">Find your next appointment ↗</Link></p>
          )}
        </Panel>
      </div>
      <div className="demo-metric-grid">
        <Metric label="BLOOD PRESSURE" value={bp} note={profile?.bloodPressure ? "Recorded baseline" : "Update in profile"} unit={bp !== '--' ? 'mmHg' : undefined} />
        <Metric label="RESTING PULSE" value={pulse} unit={pulse !== '--' ? 'bpm' : undefined} note={profile?.pulseRate ? "Recorded baseline" : "Update in profile"} />
        <Metric label={profile?.bmi ? "BODY MASS INDEX" : "BLOOD GROUP"} value={bmiOrBlood} unit={profile?.bmi ? "kg/m²" : undefined} note={profile ? `${profile.gender} · ${profile.age} yrs` : "Update in profile"} />
        <Metric label="UPCOMING VISITS" value={String(state.appointments.filter(item => item.status !== 'Cancelled').length).padStart(2, '0')} note="Your time, respected" />
      </div>
      <div className="demo-split">
        <Panel title="A little clarity, whenever you need it." subtitle="IRYO AI">
          <p className="demo-muted">Not sure where to begin? Talk through a concern with Iryo and find the right next step.</p>
          <div className="quick-concerns">
            <Link to="/triage?scenario=sinus">Headache & sinus pressure ↗</Link>
            <Link to="/triage?scenario=skin">A skin concern ↗</Link>
            <Link to="/triage?scenario=general">General wellbeing ↗</Link>
          </div>
        </Panel>
        <Panel title="Your clinical profile" subtitle="CONNECTED">
          <div className="demo-list-row"><span>Blood group</span><Badge>{profile?.bloodGroup || 'Not specified'}</Badge></div>
          <div className="demo-list-row"><span>Known allergies</span><span>{profile?.allergies?.join(', ') || 'None recorded'}</span></div>
          <div className="demo-list-row"><span>Chronic conditions</span><span>{profile?.chronicConditions?.join(', ') || 'None reported'}</span></div>
          <div className="demo-list-row"><span>Digital prescription</span><Badge>{state.prescription ? 'Active e-prescription' : 'No active prescriptions'}</Badge></div>
          <div className="demo-list-row"><span>Pharmacy cart</span><Link to="/pharmacy">{state.cart.length} items ↗</Link></div>
          <div className="demo-list-row"><span>Insurance claims</span><Link to="/claims">{state.claims.length} registered ↗</Link></div>
          <Link className="text-link" to="/profile">Edit health & clinical details ↗</Link>
        </Panel>
      </div>
    </>
  )
}
export function Metric({ label, value, note, unit }: { label: string; value: string; note: string; unit?: string }) {
  return <article className="demo-metric"><span className="eyebrow">{label}</span><strong>{value}<small>{unit}</small></strong><span className="metric-note">{note}</span></article>
}

interface LifetimePatientRecord {
  id: string
  name: string
  age: number
  gender: string
  date: string
  time: string
  mode: 'Video Telehealth' | 'In-Clinic OPD'
  diagnosis: string
  symptoms: string
  vitals: { bp: string; pulse: string; spo2: string; temp: string }
  prescription: string
  outcome: 'Treated & Discharged' | 'Follow-up Scheduled' | 'Under Observation' | 'Routine Checkup Complete'
  notes: string
}

const initialLifetimePatients: LifetimePatientRecord[] = []

function DoctorAppointmentsLifetimeView({ notify }: { notify: (text: string) => void }) {
  const doctor = getStoredAuthUser()
  const [patients, setPatients] = useState<LifetimePatientRecord[]>(() => {
    try {
      const stored = localStorage.getItem('iryotek_doctor_lifetime_patients')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed.filter((p: any) => !p.id?.startsWith('LPT-142') && !p.id?.startsWith('LPT-141'))
        }
      }
    } catch (e) {}
    return []
  })
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'this_month' | 'video' | 'inclinic' | 'followup'>('all')
  const [selectedCase, setSelectedCase] = useState<LifetimePatientRecord | null>(null)

  const lifetimeTotalCount = patients.length
  const completedCount = patients.filter(p => p.outcome !== 'Under Observation').length
  const videoCount = patients.filter(p => p.mode?.includes('Video')).length
  const inclinicCount = patients.filter(p => p.mode?.includes('In-Clinic')).length
  const thisMonthCount = patients.filter(p => p.date?.startsWith(new Date().toISOString().slice(0, 7))).length
  const followupCount = patients.filter(p => p.outcome === 'Follow-up Scheduled' || p.outcome === 'Under Observation').length

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = !search.trim() || 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
        p.prescription.toLowerCase().includes(search.toLowerCase()) ||
        p.date.includes(search)
      
      if (!matchesSearch) return false

      if (filterTab === 'this_month') return p.date.startsWith(new Date().toISOString().slice(0, 7))
      if (filterTab === 'video') return p.mode === 'Video Telehealth'
      if (filterTab === 'inclinic') return p.mode === 'In-Clinic OPD'
      if (filterTab === 'followup') return p.outcome === 'Follow-up Scheduled' || p.outcome === 'Under Observation'
      return true
    })
  }, [patients, search, filterTab])

  return (
    <>
      <PageHeading
        label="DOCTOR CLINICAL ARCHIVE / LIFETIME PATIENTS"
        title="Lifetime Patient Consultations"
        description="Comprehensive ledger of every patient examined, diagnosed, and treated under your medical license."
        action={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Badge><i className="status-dot" /> LICENSED CLINICIAN</Badge>
            <Link to="/doctor" className="button light">My Overview Queue ↗</Link>
          </div>
        }
      />

      <div className="demo-metric-grid" style={{ marginBottom: 24 }}>
        <Metric label="LIFETIME PATIENTS TREATED" value={String(lifetimeTotalCount)} note="Total patients seen in clinical career" />
        <Metric label="COMPLETED CONSULTATIONS" value={String(completedCount)} note="Officially diagnosed & prescribed" />
        <Metric label="IN-CLINIC OPD VISITS" value={String(inclinicCount)} note="Physical consultations conducted" />
        <Metric label="ONLINE VIDEO SESSIONS" value={String(videoCount)} note="Encrypted telehealth consultations" />
      </div>

      <div className="demo-panel" style={{ padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`button ${filterTab === 'all' ? '' : 'light'}`}
              style={{ padding: '7px 14px', fontSize: 13 }}
              onClick={() => setFilterTab('all')}
            >
              All Lifetime ({lifetimeTotalCount})
            </button>
            <button
              type="button"
              className={`button ${filterTab === 'this_month' ? '' : 'light'}`}
              style={{ padding: '7px 14px', fontSize: 13 }}
              onClick={() => setFilterTab('this_month')}
            >
              This Month ({thisMonthCount})
            </button>
            <button
              type="button"
              className={`button ${filterTab === 'video' ? '' : 'light'}`}
              style={{ padding: '7px 14px', fontSize: 13 }}
              onClick={() => setFilterTab('video')}
            >
              📹 Video Sessions ({videoCount})
            </button>
            <button
              type="button"
              className={`button ${filterTab === 'inclinic' ? '' : 'light'}`}
              style={{ padding: '7px 14px', fontSize: 13 }}
              onClick={() => setFilterTab('inclinic')}
            >
              🏥 In-Clinic OPD ({inclinicCount})
            </button>
            <button
              type="button"
              className={`button ${filterTab === 'followup' ? '' : 'light'}`}
              style={{ padding: '7px 14px', fontSize: 13 }}
              onClick={() => setFilterTab('followup')}
            >
              ⏳ Follow-ups ({followupCount})
            </button>
          </div>
          <div style={{ minWidth: 260 }}>
            <input
              type="text"
              placeholder="Search by patient, diagnosis, date, or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 14px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: '#587477', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 11 }}>
                <th style={{ padding: '10px 12px' }}>Case #</th>
                <th style={{ padding: '10px 12px' }}>Patient Name</th>
                <th style={{ padding: '10px 12px' }}>Consultation Date</th>
                <th style={{ padding: '10px 12px' }}>Mode</th>
                <th style={{ padding: '10px 12px' }}>Diagnosis & Impression</th>
                <th style={{ padding: '10px 12px' }}>Outcome / Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.5 }}>📋</div>
                    <h4 style={{ margin: '0 0 0.5rem' }}>No patient consultation records found</h4>
                    <p className="demo-muted" style={{ maxWidth: 460, margin: '0 auto', fontSize: '0.88rem' }}>
                      {search.trim()
                        ? 'No patient records match your search criteria.'
                        : 'Patients examined in clinic visits or online video sessions will automatically be recorded and archived here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p, idx) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--accent)' }}>
                    {p.id}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                    <small style={{ color: '#64748b' }}>{p.age} yrs · {p.gender}</small>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--ink)' }}>
                    <div>{p.date}</div>
                    <small style={{ color: '#64748b' }}>{p.time}</small>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: p.mode === 'Video Telehealth' ? '#eff6ff' : '#f0fdf4',
                      color: p.mode === 'Video Telehealth' ? '#1d4ed8' : '#15803d'
                    }}>
                      {p.mode === 'Video Telehealth' ? '📹 Video' : '🏥 OPD Clinic'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', maxWidth: 260 }}>
                    <div style={{ fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.diagnosis}</div>
                    <small style={{ color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.symptoms}</small>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 9px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      background: p.outcome === 'Treated & Discharged' ? '#ecfdf5' : p.outcome === 'Routine Checkup Complete' ? '#f0fdfa' : '#fffbeb',
                      color: p.outcome === 'Treated & Discharged' ? '#047857' : p.outcome === 'Routine Checkup Complete' ? '#0f766e' : '#b45309',
                      border: p.outcome === 'Treated & Discharged' ? '1px solid #a7f3d0' : p.outcome === 'Routine Checkup Complete' ? '1px solid #99f6e4' : '1px solid #fde68a'
                    }}>
                      {p.outcome}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="button light"
                      style={{ padding: '5px 12px', fontSize: 12 }}
                      onClick={() => setSelectedCase(p)}
                    >
                      Case Summary ↗
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCase && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 16,
            maxWidth: 620,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 24,
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 16 }}>
              <div>
                <span className="eyebrow" style={{ color: 'var(--accent)' }}>CLINICAL RECORD #{selectedCase.id}</span>
                <h3 style={{ margin: '4px 0 0', fontSize: 20 }}>{selectedCase.name}</h3>
                <small style={{ color: '#64748b' }}>{selectedCase.age} yrs · {selectedCase.gender} · {selectedCase.mode}</small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 10, marginBottom: 16 }}>
              <div><small style={{ color: '#64748b', fontSize: 10 }}>BP</small><div style={{ fontWeight: 600 }}>{selectedCase.vitals.bp}</div></div>
              <div><small style={{ color: '#64748b', fontSize: 10 }}>PULSE</small><div style={{ fontWeight: 600 }}>{selectedCase.vitals.pulse}</div></div>
              <div><small style={{ color: '#64748b', fontSize: 10 }}>SPO2</small><div style={{ fontWeight: 600 }}>{selectedCase.vitals.spo2}</div></div>
              <div><small style={{ color: '#64748b', fontSize: 10 }}>TEMP</small><div style={{ fontWeight: 600 }}>{selectedCase.vitals.temp}</div></div>
            </div>

            <div className="demo-list-row"><span>Consultation date</span><strong>{selectedCase.date} at {selectedCase.time}</strong></div>
            <div className="demo-list-row"><span>Chief complaint</span><span>{selectedCase.symptoms}</span></div>
            <div className="demo-list-row"><span>Final clinical diagnosis</span><strong style={{ color: 'var(--accent)' }}>{selectedCase.diagnosis}</strong></div>
            <div className="demo-list-row"><span>Prescribed medicine regimen</span><span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{selectedCase.prescription}</span></div>
            <div className="demo-list-row"><span>Case outcome</span><Badge>{selectedCase.outcome}</Badge></div>

            <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 600, fontSize: 11, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Physician Clinical Notes:</div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#334155' }}>{selectedCase.notes}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                className="button light"
                onClick={() => {
                  notify(`Clinical summary for ${selectedCase.name} exported.`)
                  setSelectedCase(null)
                }}
              >
                Print / Export Case Summary 🖨️
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setSelectedCase(null)}
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function AppointmentsPage({ notify }: { notify: (text: string) => void }) {
  const currentUser = getStoredUser()
  if (currentUser?.role === 'Doctor') {
    return <DoctorPage notify={notify} />
  }

  const { state, update } = useContext(DemoContext), [params] = useSearchParams()
  const { todayStr, maxDateStr } = useMemo(() => {
    const d = new Date()
    const formatDate = (dateObj: Date) => {
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    const today = formatDate(d)
    const maxDate = new Date(d)
    maxDate.setDate(maxDate.getDate() + 7)
    return { todayStr: today, maxDateStr: formatDate(maxDate) }
  }, [])
  const availableStates = useMemo(() => {
    const list = Array.from(new Set(hospitals.map(h => h.state).filter(Boolean)))
    return list.sort()
  }, [])

  const [selectedState, setSelectedState] = useState<string>(() => {
    const user = getStoredUser()
    const userCity = user?.patientProfile?.city
    if (userCity) {
      const match = hospitals.find(h => h.city.toLowerCase() === userCity.toLowerCase())
      if (match) return match.state
    }
    return 'Odisha'
  })

  const availableCities = useMemo(() => {
    const list = Array.from(new Set(hospitals.filter(h => h.state === selectedState).map(h => h.city)))
    return list.sort()
  }, [selectedState])

  const [selectedCity, setSelectedCity] = useState<string>('Bhubaneswar')

  // Synchronize city when state changes
  useEffect(() => {
    if (availableCities.length > 0 && !availableCities.includes(selectedCity)) {
      setSelectedCity(availableCities[0])
    }
  }, [availableCities, selectedCity])

  const nearbyHospitals = useMemo(() => {
    const inCity = hospitals.filter(h => h.state === selectedState && h.city === selectedCity)
    if (inCity.length > 0) return inCity
    const inState = hospitals.filter(h => h.state === selectedState)
    return inState.length > 0 ? inState : hospitals
  }, [selectedState, selectedCity])

  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('aiims-bhubaneswar')

  useEffect(() => {
    if (nearbyHospitals.length > 0 && !nearbyHospitals.some(h => h.id === selectedHospitalId)) {
      setSelectedHospitalId(nearbyHospitals[0].id)
    }
  }, [nearbyHospitals, selectedHospitalId])

  const selectedHospital = useMemo(() => {
    return hospitals.find(h => h.id === selectedHospitalId) || nearbyHospitals[0] || hospitals[0]
  }, [selectedHospitalId, nearbyHospitals])

  const [fieldCategory, setFieldCategory] = useState<string>('All')
  const [fieldSearch, setFieldSearch] = useState<string>('')

  const hospitalSpecialties = useMemo(() => {
    const specs = selectedHospital?.specialties || []
    const allNames = allMedicalFields.map(f => f.name)
    const combined = Array.from(new Set([...specs, ...allNames]))
    return ['All Specialties', ...combined]
  }, [selectedHospital])

  const [selectedField, setSelectedField] = useState<string>('All Specialties')

  useEffect(() => {
    setSelectedField('All Specialties')
  }, [selectedHospitalId])

  const [docList, setDocList] = useState<ApiDoctor[]>([])
  const [doctor, setDoctor] = useState(params.get('doctor') || '')

  useEffect(() => {
    let active = true
    if (selectedHospital?.numericId) {
      getDoctors({
        hospitalId: selectedHospital.numericId,
        specialty: selectedField !== 'All Specialties' ? selectedField : undefined,
        limit: 30
      }).then(docs => {
        if (active && docs && docs.length > 0) {
          setDocList(docs)
        }
      }).catch(() => {})
    }
    return () => { active = false }
  }, [selectedHospital?.numericId, selectedField])

  const filteredHospitalDoctors = useMemo(() => {
    if (docList.length > 0) return docList
    let list = doctors.filter(d => {
      return (
        d.hospitalId === selectedHospital?.id ||
        (d as any).numericHospitalId === selectedHospital?.numericId ||
        d.hospital === selectedHospital?.name
      )
    })
    if (list.length === 0) {
      list = doctors.filter(d => d.city === selectedCity)
    }
    if (selectedField && selectedField !== 'All Specialties') {
      const fieldLower = selectedField.toLowerCase()
      const resolved = resolveMedicalField(selectedField)
      list = list.filter(d => {
        const dSpec = (d.specialty || '').toLowerCase()
        const dTitle = (d.specialist || '').toLowerCase()
        if (dSpec === fieldLower || dTitle === fieldLower || fieldLower.includes(dSpec) || dSpec.includes(fieldLower)) return true
        if (resolved) {
          if (dSpec === resolved.name.toLowerCase() || dTitle === resolved.specialistTitle.toLowerCase()) return true
          if ((resolved.aliases || []).some(a => dSpec.includes(a) || dTitle.includes(a))) return true
        }
        return false
      })
    }
    if (list.length === 0) {
      const fieldLower = selectedField.toLowerCase()
      const resolved = resolveMedicalField(selectedField)
      list = doctors.filter(d => {
        if (selectedField === 'All Specialties') return true
        const dSpec = (d.specialty || '').toLowerCase()
        const dTitle = (d.specialist || '').toLowerCase()
        if (dSpec === fieldLower || dTitle === fieldLower || fieldLower.includes(dSpec) || dSpec.includes(fieldLower)) return true
        if (resolved) {
          if (dSpec === resolved.name.toLowerCase() || dTitle === resolved.specialistTitle.toLowerCase()) return true
          if ((resolved.aliases || []).some(a => dSpec.includes(a) || dTitle.includes(a))) return true
        }
        return false
      })
    }
    return list
  }, [docList, selectedHospital, selectedCity, selectedField])

  // Auto-select doctor when hospital or department changes
  useEffect(() => {
    if (filteredHospitalDoctors.length > 0) {
      if (!filteredHospitalDoctors.some(d => d.name === doctor)) {
        setDoctor(filteredHospitalDoctors[0].name)
        setSlot('')
        setConfirmed(false)
      }
    }
  }, [filteredHospitalDoctors, doctor])

  const [symptoms, setSymptoms] = useState('')
  const [date, setDate] = useState<string>(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [slot, setSlot] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [booking, setBooking] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null)
  const [selectedReceiptAppointment, setSelectedReceiptAppointment] = useState<any | null>(null)
  const [doctorSearch, setDoctorSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('All specialties')
  const [specialtiesList, setSpecialtiesList] = useState<string[]>(['All specialties'])
  const [loadingDoctors, setLoadingDoctors] = useState(false)

  // Load available medical specialties
  useEffect(() => {
    getSpecialties().then(specs => {
      if (specs && specs.length > 0) {
        setSpecialtiesList(['All specialties', ...specs.filter(s => s !== 'All specialties')])
      }
    }).catch(() => {})
  }, [])

  // Listen for doctor updates from registration
  useEffect(() => {
    const handleDoctorUpdated = (e: any) => {
      const newDoc: ApiDoctor = e.detail
      if (newDoc && newDoc.name) {
        setDoctor(newDoc.name)
        setSlot('')
        setConfirmed(false)
        notify(`Doctor ${newDoc.name} selected for appointment booking.`)
      }
    }
    window.addEventListener('iryotek_doctors_updated', handleDoctorUpdated)
    return () => window.removeEventListener('iryotek_doctors_updated', handleDoctorUpdated)
  }, [notify])

  // If a doctor was specified in URL query param, honor it
  useEffect(() => {
    const targetDoc = params.get('doctor')
    if (targetDoc) {
      setDoctor(targetDoc)
      const foundDoc = doctors.find(d => d.name === targetDoc)
      if (foundDoc) {
        if (foundDoc.hospitalId) setSelectedHospitalId(foundDoc.hospitalId)
        if (foundDoc.state) setSelectedState(foundDoc.state)
        if (foundDoc.city) setSelectedCity(foundDoc.city)
        if (foundDoc.specialty) setSelectedField(foundDoc.specialty)
      }
    }
  }, [params])

  const allDoctorOptions = useMemo(() => {
    let list = [...filteredHospitalDoctors]
    if (doctorSearch.trim()) {
      const q = doctorSearch.toLowerCase()
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))
    }
    if (doctor && !list.some(d => d.name === doctor)) {
      const foundInMock = doctors.find(d => d.name === doctor)
      if (foundInMock) {
        list.unshift(foundInMock)
      }
    }
    return list.length > 0 ? list : filteredHospitalDoctors.length > 0 ? filteredHospitalDoctors : doctors
  }, [filteredHospitalDoctors, doctorSearch, doctor])

  const selectedDoctor = allDoctorOptions.find(item => item.name === doctor) || allDoctorOptions[0] || doctors[0]

  // Real-time ticking clock for slot invalidation and live sync
  const [currentTime, setCurrentTime] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Multi-user & database synced appointments
  const [sharedAppointments, setSharedAppointments] = useState<ApiAppointment[]>(() => getSharedAppointments())

  const syncSharedAppointments = useCallback(() => {
    const localShared = getSharedAppointments()
    setSharedAppointments(localShared)
    const docId = selectedDoctor?.id ? Number(selectedDoctor.id) : undefined
    getAppointments({ doctorId: docId }).then(remote => {
      if (remote && Array.isArray(remote)) {
        setSharedAppointments(remote)
      }
    }).catch(() => {})
  }, [selectedDoctor?.id])

  useEffect(() => {
    syncSharedAppointments()
    const handleSync = () => syncSharedAppointments()
    window.addEventListener('storage', handleSync)
    window.addEventListener('iryotek_appointment_updated', handleSync)
    const pollInterval = setInterval(syncSharedAppointments, 3000)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('iryotek_appointment_updated', handleSync)
      clearInterval(pollInterval)
    }
  }, [syncSharedAppointments])

  // Active session tab: morning, afternoon, evening, or all
  const [selectedSessionTab, setSelectedSessionTab] = useState<'all' | 'morning' | 'afternoon' | 'evening'>(() => {
    const h = new Date().getHours()
    if (h < 13) return 'morning'
    if (h < 17) return 'afternoon'
    return 'evening'
  })

  // Real-time slot past check (for today's date)
  const isSlotPast = useCallback((time: string, checkDate: string) => {
    if (!checkDate || checkDate > todayStr) return false
    if (checkDate < todayStr) return true
    const [sh, sm] = time.split(':').map(Number)
    const ch = currentTime.getHours()
    const cm = currentTime.getMinutes()
    return sh < ch || (sh === ch && sm <= cm)
  }, [todayStr, currentTime])

  // Real-time slot booked check (local state + shared/remote database)
  const isSlotBooked = useCallback((time: string) => {
    const localMatch = state.appointments.some(
      item => item.doctor === doctor && item.date === date && item.time === time && item.status !== 'Cancelled'
    )
    if (localMatch) return true

    const sharedMatch = sharedAppointments.some(item => {
      const docMatch = (item.doctor && item.doctor.toLowerCase() === doctor.toLowerCase()) ||
                       (selectedDoctor?.id && item.doctorId && Number(item.doctorId) === Number(selectedDoctor.id))
      const dateMatch = (item.date === date || item.appointmentDate === date)
      const timeMatch = (item.time === time || item.appointmentTime === time)
      const notCancelled = item.status !== 'Cancelled' && item.status !== 'Rejected'
      return Boolean(docMatch && dateMatch && timeMatch && notCancelled)
    })
    return sharedMatch
  }, [state.appointments, sharedAppointments, doctor, date, selectedDoctor?.id])

  // If currently selected slot expires or gets reserved in real time, auto-deselect
  useEffect(() => {
    if (slot) {
      if (isSlotPast(slot, date)) {
        setSlot('')
        notify(`Slot ${slot} has ended for today. Please select an upcoming slot.`)
      } else if (isSlotBooked(slot)) {
        setSlot('')
        notify(`Slot ${slot} was just reserved in real time. Please choose another available slot.`)
      }
    }
  }, [currentTime, isSlotPast, isSlotBooked, slot, date, notify])

  // Sessions configuration
  const clinicSessions = useMemo(() => [
    {
      id: 'morning' as const,
      name: 'Morning Session',
      label: 'Morning (09:00 - 13:00)',
      timing: '09:00 - 13:00',
      icon: '☀️',
      slots: Array.from({ length: 16 }, (_, i) => `${String(9 + Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`),
    },
    {
      id: 'afternoon' as const,
      name: 'Afternoon Session',
      label: 'Afternoon (14:00 - 17:00)',
      timing: '14:00 - 17:00',
      icon: '🌤️',
      slots: Array.from({ length: 12 }, (_, i) => `${String(14 + Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`),
    },
    {
      id: 'evening' as const,
      name: 'Evening Session',
      label: 'Evening (17:00 - 21:00)',
      timing: '17:00 - 21:00',
      icon: '🌙',
      slots: Array.from({ length: 16 }, (_, i) => `${String(17 + Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`),
    },
  ], [])

  // Session availability statistics
  const sessionCounts = useMemo(() => {
    const counts: Record<string, { total: number; available: number }> = {}
    let totalAll = 0
    let availableAll = 0

    clinicSessions.forEach(session => {
      let avail = 0
      session.slots.forEach(time => {
        const past = isSlotPast(time, date)
        const booked = isSlotBooked(time)
        if (!past && !booked) avail++
      })
      counts[session.id] = { total: session.slots.length, available: avail }
      totalAll += session.slots.length
      availableAll += avail
    })

    counts['all'] = { total: totalAll, available: availableAll }
    return counts
  }, [clinicSessions, date, isSlotPast, isSlotBooked])

  // Quick select: next available slot today
  const nextAvailableSlot = useMemo(() => {
    const allSlots = clinicSessions.flatMap(s => s.slots)
    for (const s of allSlots) {
      if (!isSlotPast(s, date) && !isSlotBooked(s)) {
        return s
      }
    }
    return null
  }, [clinicSessions, date, isSlotPast, isSlotBooked])
  
  const handleInitiateBooking = () => {
    if (!slot) {
      notify('Choose an available 15-minute slot first.')
      return
    }
    if (isSlotPast(slot, date)) {
      notify(`Slot ${slot} has already passed for today. Please pick an upcoming slot.`)
      return
    }
    if (isSlotBooked(slot)) {
      notify(`Slot ${slot} is already reserved. Please choose another available slot.`)
      return
    }
    if (!date) {
      notify('Please select an appointment date.')
      return
    }
    if (date < todayStr) {
      notify('Cannot book appointments in the past. Please select today or an upcoming date within 7 days.')
      return
    }
    if (date > maxDateStr) {
      notify('Appointments can only be booked up to 7 days in advance.')
      return
    }
    setIsPaymentOpen(true)
  }

  const handlePaymentSuccess = async (result: YouPIPaymentResult) => {
    setIsPaymentOpen(false)
    setBooking(true)
    const user = getStoredUser()
    const patientName = user?.displayName || 'Registered Patient'
    const patientEmail = user?.email || 'patient@iryotek.com'
    const patientPhone = user?.phone || user?.patientProfile?.emergencyContact?.phone || '9876543210'
    const docId = selectedDoctor.id ? Number(selectedDoctor.id) : 1
    const res = await bookAppointment({
      doctorId: docId,
      doctorName: doctor,
      appointmentDate: date,
      appointmentTime: slot,
      patientName,
      email: patientEmail,
      phone: patientPhone,
      hospital: selectedHospital.name,
      hospitalCity: selectedHospital.city,
      state: selectedHospital.state,
      specialty: selectedDoctor.specialty,
      fee: selectedDoctor.price || 500,
      symptoms: symptoms.trim() || `${selectedDoctor.specialty} In-Clinic Consultation at ${selectedHospital.name}`,
    })
    setBooking(false)
    const token = res.appointmentId ? String(res.appointmentId).padStart(3, '0') : String(43 + state.appointments.length).padStart(3, '0')
    const appointmentFee = selectedDoctor.price || 500
    const appointment: Appointment = {
      id: token,
      doctor,
      date,
      time: slot,
      specialty: selectedDoctor.specialty,
      hospital: selectedHospital.name,
      hospitalCity: selectedHospital.city,
      state: selectedHospital.state,
      type: 'In-Clinic OPD Consultation',
      status: 'Pending',
      fee: appointmentFee,
      paymentStatus: 'Paid',
      paymentMethod: result.paymentMethod || 'UPI',
      utr: result.utr || result.transactionId,
    }
    update(previous => ({ ...previous, appointments: [...previous.appointments, appointment] }))
    if (user?.uid) {
      saveAppointmentFirestore(user.uid, {
        doctor,
        doctorId: docId,
        specialty: selectedDoctor.specialty,
        hospital: selectedHospital.name,
        hospitalCity: selectedHospital.city,
        state: selectedHospital.state,
        type: 'In-Clinic OPD Consultation',
        date,
        time: slot,
        patientName,
        status: 'Pending',
        fee: appointmentFee,
        paymentStatus: 'Paid',
        paymentMethod: appointment.paymentMethod,
        utr: appointment.utr
      }).catch(err => console.warn('[Iryotek Appointments] Firestore sync deferred:', err))
    }
    setConfirmed(true)
    notify(`In-Clinic OPD Token #${token} booked for ${slot} at ${selectedHospital.name}! Fee ₹${appointmentFee} paid. Awaiting doctor approval.`)
  }

  const handleConfirmCancellation = async () => {
    if (!cancellingAppointment) return
    const feePaid = cancellingAppointment.fee || 500
    const cancelFee = 50
    const refundAmt = Math.max(0, feePaid - cancelFee)
    const refundUtr = `REF${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`

    update(previous => ({
      ...previous,
      appointments: previous.appointments.map(visit =>
        visit.id === cancellingAppointment.id
          ? {
              ...visit,
              status: 'Cancelled',
              cancellationFee: cancelFee,
              refundAmount: refundAmt,
              refundUtr,
              paymentStatus: 'Refunded',
            }
          : visit
      )
    }))

    try {
      await updateAppointmentStatus(cancellingAppointment.id, 'Cancelled')
    } catch (e) {
      console.warn('[Appointments] API cancel sync:', e)
    }

    notify(`Appointment #${cancellingAppointment.id} cancelled. ₹50 fee charged. Refund of ₹${refundAmt} credited to your original payment method (Ref: ${refundUtr}).`)
    setCancellingAppointment(null)
  }

  return (
    <>
      <PageHeading
        label="IN-CLINIC APPOINTMENTS / OPD BOOKING"
        title="Book In-Hospital Doctor Consultation"
        description="Select State & City → Pick Nearby Hospital → Choose Medical Field/Department → Select Doctor with Ratings → Choose 15-min Slot & Reserve OPD Token."
      />
    <div className="demo-split wide-left">
      <Panel title="In-Clinic OPD Appointment" subtitle="5-STEP FLOW: LOCATION → HOSPITAL → SPECIALTY → DOCTOR → SLOT">
        {/* Step Indicator Header */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', padding: '10px 14px', background: 'rgba(15, 118, 110, 0.06)', borderRadius: '10px', border: '1px solid rgba(15, 118, 110, 0.15)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f766e', letterSpacing: '0.04em' }}>IN-PERSON CLINIC FLOW:</span>
          <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 600 }}>1. Location ({selectedCity})</span>
          <span style={{ color: '#94a3b8' }}>→</span>
          <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 600 }}>2. Hospital ({selectedHospital.name.split(' ')[0]})</span>
          <span style={{ color: '#94a3b8' }}>→</span>
          <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 600 }}>3. Field ({selectedField})</span>
          <span style={{ color: '#94a3b8' }}>→</span>
          <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 600 }}>4. Doctor ({selectedDoctor.name.split(' ').slice(0, 2).join(' ')})</span>
          <span style={{ color: '#94a3b8' }}>→</span>
          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>5. Slot & OPD Token</span>
        </div>

        {/* Step 1: Select State & City */}
        <div style={{ marginBottom: '18px', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ background: '#0284c7', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>1</span>
            <strong style={{ fontSize: '13px', color: '#0f172a', letterSpacing: '0.02em' }}>SELECT LOCATION (STATE & CITY)</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
              State
              <select
                value={selectedState}
                onChange={e => {
                  setSelectedState(e.target.value)
                  setSlot('')
                  setConfirmed(false)
                }}
                style={{ marginTop: '4px', width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                {availableStates.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </label>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
              City
              <select
                value={selectedCity}
                onChange={e => {
                  setSelectedCity(e.target.value)
                  setSlot('')
                  setConfirmed(false)
                }}
                style={{ marginTop: '4px', width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                {availableCities.map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </label>
          </div>
        </div>

        {/* Step 2: Nearby Hospitals in Selected City */}
        <div style={{ marginBottom: '18px', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#0284c7', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>2</span>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>NEARBY HOSPITALS IN {selectedCity.toUpperCase()}</strong>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{nearbyHospitals.length} hospitals found</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: nearbyHospitals.length > 1 ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr', gap: '10px' }}>
            {nearbyHospitals.map(hosp => {
              const isSelected = selectedHospitalId === hosp.id
              return (
                <div
                  key={hosp.id}
                  onClick={() => {
                    setSelectedHospitalId(hosp.id)
                    setSlot('')
                    setConfirmed(false)
                  }}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #0f766e' : '1px solid #cbd5e1',
                    background: isSelected ? '#f0fdfa' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(15, 118, 110, 0.15)' : 'none',
                  }}
                >
                  <img
                    src={getHospitalImage(hosp)}
                    alt={hosp.name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a', lineHeight: 1.3 }}>{hosp.name}</strong>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f766e', background: '#ccfbf1', padding: '1px 6px', borderRadius: '4px', flexShrink: 0 }}>
                        ★ {hosp.rating}
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📍 {hosp.address}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px', fontSize: '10px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#e2e8f0', color: '#334155', padding: '2px 6px', borderRadius: '4px' }}>
                        🛏️ {hosp.beds} Beds
                      </span>
                      {hosp.emergency && (
                        <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          🚨 24/7 Emergency
                        </span>
                      )}
                      {isSelected && (
                        <span style={{ marginLeft: 'auto', color: '#0f766e', fontWeight: 700 }}>
                          ✓ Selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 3: Medical Field / Reason for Appointment */}
        <div style={{ marginBottom: '18px', padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#0284c7', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>3</span>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>WHAT FIELD ARE YOU CONSULTING FOR? (DEPARTMENT)</strong>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['All', 'Internal Medicine', 'Women & Child Health', 'Surgical Specialties', 'Primary Care'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFieldCategory(cat)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    borderRadius: '12px',
                    border: fieldCategory === cat ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    background: fieldCategory === cat ? '#e0f2fe' : '#ffffff',
                    color: fieldCategory === cat ? '#0369a1' : '#475569',
                    fontWeight: fieldCategory === cat ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#64748b' }}>
            Select your clinical specialty or health concern below ({allMedicalFields.length} specialized fields available at <strong>{selectedHospital.name}</strong>):
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
            {/* All Specialties Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedField('All Specialties')
                setSlot('')
                setConfirmed(false)
              }}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: selectedField === 'All Specialties' ? 700 : 500,
                borderRadius: '20px',
                border: selectedField === 'All Specialties' ? '1px solid #0f766e' : '1px solid #cbd5e1',
                background: selectedField === 'All Specialties' ? '#0f766e' : '#ffffff',
                color: selectedField === 'All Specialties' ? '#ffffff' : '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🏥 All Departments
            </button>

            {hospitalSpecialties.filter(s => s !== 'All Specialties').map(spec => {
              const info = allMedicalFields.find(f => f.name.toLowerCase() === spec.toLowerCase()) || resolveMedicalField(spec)
              if (fieldCategory !== 'All' && info && info.category !== fieldCategory) {
                return null
              }
              const isSelected = selectedField.toLowerCase() === spec.toLowerCase()
              const icon = info ? info.icon : '🩺'
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    setSelectedField(spec)
                    setSlot('')
                    setConfirmed(false)
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: '20px',
                    border: isSelected ? '1px solid #0f766e' : '1px solid #cbd5e1',
                    background: isSelected ? '#0f766e' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{icon}</span>
                  <span>{spec}</span>
                  {info?.specialistTitle && !isSelected && (
                    <span style={{ fontSize: '10px', opacity: 0.65 }}>({info.specialistTitle.split(' ')[0]})</span>
                  )}
                  {isSelected && <span>✓</span>}
                </button>
              )
            })}
          </div>

          {selectedField !== 'All Specialties' && (() => {
            const currentInfo = allMedicalFields.find(f => f.name.toLowerCase() === selectedField.toLowerCase()) || resolveMedicalField(selectedField)
            if (!currentInfo) return null
            return (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '12px', color: '#166534' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '4px' }}>
                  <span>{currentInfo.icon}</span>
                  <span>{currentInfo.name} · {currentInfo.specialistTitle}</span>
                  <span style={{ fontWeight: 400, opacity: 0.8, fontSize: '11px' }}>({currentInfo.popularName})</span>
                </div>
                <div style={{ fontSize: '11px', color: '#15803d', marginBottom: '4px' }}>
                  {currentInfo.description}
                </div>
                <div style={{ fontSize: '11px', color: '#166534', opacity: 0.9 }}>
                  <strong>Common issues treated:</strong> {currentInfo.commonConditions.join(', ')}
                </div>
              </div>
            )
          })()}
        </div>

        {/* Step 4: Doctors with Ratings */}
        <div style={{ marginBottom: '18px', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#0284c7', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>4</span>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>SELECT DOCTOR ({selectedField})</strong>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {allDoctorOptions.length} specialist{allDoctorOptions.length === 1 ? '' : 's'} available
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: allDoctorOptions.length > 1 ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr', gap: '10px' }}>
            {allDoctorOptions.map(docItem => {
              const isSelected = selectedDoctor.name === docItem.name
              return (
                <div
                  key={docItem.id ? `${docItem.id}-${docItem.name}` : docItem.name}
                  onClick={() => {
                    setDoctor(docItem.name)
                    setSlot('')
                    setConfirmed(false)
                  }}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none',
                  }}
                >
                  <img
                    src={getDoctorImage(docItem)}
                    alt={docItem.name}
                    style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '50%', flexShrink: 0, border: '2px solid #e2e8f0' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '4px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{docItem.name}</strong>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px', flexShrink: 0 }}>
                        ★ {docItem.rating || '4.9'}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
                      {docItem.specialty} · {docItem.experience ? `${docItem.experience} yrs exp` : 'Specialist'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                      🏥 {docItem.hospital || selectedHospital.name}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px' }}>
                      <span style={{ fontWeight: 700, color: '#0f766e' }}>OPD Fee: ₹{docItem.price || 500}</span>
                      {isSelected ? (
                        <span style={{ color: '#0284c7', fontWeight: 700 }}>✓ Selected Doctor</span>
                      ) : (
                        <span style={{ color: '#64748b' }}>Click to select</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '12px', padding: '10px 12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '12px', color: '#334155' }}>
              Selected: <strong>{selectedDoctor.name}</strong> ({selectedDoctor.specialty}) · <strong>OPD Fee: ₹{selectedDoctor.price || 500}</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              OPD Timings: <strong>09:00–13:00</strong> (Morning) · <strong>14:00–17:00</strong> (Afternoon) · <strong>17:00–21:00</strong> (Evening)
            </div>
          </div>
        </div>

        {/* Step 5: Pick Date & 15-Minute Slot */}
        <div style={{ marginBottom: '18px', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ background: '#0284c7', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>5</span>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>APPOINTMENT DATE & 15-MINUTE OPD SLOT</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
              Appointment Date (Next 7 Days)
              <input
                type="date"
                min={todayStr}
                max={maxDateStr}
                value={date}
                onChange={event => {
                  const selectedVal = event.target.value
                  if (selectedVal && selectedVal < todayStr) {
                    notify('Cannot select past dates. Appointment date must be today or onwards.')
                    setDate(todayStr)
                  } else if (selectedVal && selectedVal > maxDateStr) {
                    notify('Appointments can only be booked up to 7 days in advance.')
                    setDate(todayStr)
                  } else {
                    setDate(selectedVal)
                  }
                  setSlot('')
                  setConfirmed(false)
                }}
                style={{ marginTop: '4px', width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                required
              />
            </label>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
              Reason / Symptoms for Hospital Visit
              <input
                type="text"
                placeholder="e.g. Chest pain, skin allergy, routine checkup..."
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                style={{ marginTop: '4px', width: '100%', padding: '9px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
              />
            </label>
          </div>

          {/* Real-time Ticker */}
          <div className="live-sync-banner" style={{ marginBottom: '12px' }}>
            <div className="live-sync-left">
              <span className="pulse-live-dot" />
              <span>LIVE OPD REAL-TIME SYNC</span>
              <span style={{ color: '#0d9488' }}>·</span>
              <span className="live-sync-clock">
                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} IST
              </span>
            </div>
            <div className="live-sync-legend">
              <span><i className="legend-dot available" /> Available</span>
              <span><i className="legend-dot reserved" /> Reserved</span>
              <span><i className="legend-dot passed" /> Passed</span>
              {nextAvailableSlot && (
                <button
                  type="button"
                  className="quick-select-slot"
                  onClick={() => {
                    setSlot(nextAvailableSlot)
                    setConfirmed(false)
                    notify(`Selected next available slot: ${nextAvailableSlot}`)
                  }}
                >
                  ⚡ Quick Select: {nextAvailableSlot}
                </button>
              )}
            </div>
          </div>

          {/* Session Tabs */}
          <div className="session-tabs" role="tablist">
            <button
              type="button"
              className={`session-tab-btn ${selectedSessionTab === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSessionTab('all')}
            >
              📋 All Sessions <span className="session-tab-count">{sessionCounts.all?.available ?? 0} open</span>
            </button>
            {clinicSessions.map(sess => (
              <button
                key={sess.id}
                type="button"
                className={`session-tab-btn ${selectedSessionTab === sess.id ? 'active' : ''}`}
                onClick={() => setSelectedSessionTab(sess.id)}
              >
                <span>{sess.icon}</span> {sess.name} <span className="session-tab-count">{sessionCounts[sess.id]?.available ?? 0} open</span>
              </button>
            ))}
          </div>

          {/* Slots Grid */}
          {clinicSessions
            .filter(sess => selectedSessionTab === 'all' || selectedSessionTab === sess.id)
            .map(sess => {
              const availCount = sessionCounts[sess.id]?.available ?? 0
              return (
                <div key={sess.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="eyebrow" style={{ margin: 0 }}>
                      {sess.icon} {sess.name.toUpperCase()} · {sess.timing}
                    </span>
                    <span style={{ fontSize: '11px', color: availCount > 0 ? '#059669' : '#dc2626', fontWeight: 600 }}>
                      {availCount} of {sess.slots.length} slots available
                    </span>
                  </div>
                  <div className="booking-slots">
                    {sess.slots.map(time => {
                      const past = isSlotPast(time, date)
                      const booked = isSlotBooked(time)
                      const isSelected = slot === time
                      const isDisabled = past || booked
                      let statusLabel = 'Available'
                      let btnClass = 'slot-available'
                      if (past) {
                        statusLabel = 'Passed'
                        btnClass = 'slot-passed'
                      } else if (booked) {
                        statusLabel = 'Reserved'
                        btnClass = 'slot-reserved'
                      }
                      if (isSelected) btnClass += ' selected'

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={isDisabled}
                          aria-pressed={isSelected}
                          className={btnClass}
                          onClick={() => {
                            if (!isDisabled) {
                              setSlot(time)
                              setConfirmed(false)
                            }
                          }}
                        >
                          {time}
                          <small style={{ color: past ? '#94a3b8' : booked ? '#dc2626' : '#059669', fontWeight: past ? 400 : 600 }}>
                            {statusLabel}
                          </small>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>

        {/* Step 6: Summary & Payment */}
        <div className="booking-summary">
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Hospital: {selectedHospital.name} ({selectedCity})</span>
            <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>
              OPD Consultation Fee: ₹{selectedDoctor.price || 500}
            </strong>
            <small style={{ display: 'block', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
              Selected: {selectedDoctor.name} ({selectedDoctor.specialty}) · {date} at {slot || 'No slot chosen'}
            </small>
          </div>
          <button className="button" disabled={!slot || !date || confirmed || booking} onClick={handleInitiateBooking}>
            {booking ? 'Recording in database…' : confirmed ? 'In-Clinic OPD Booked ✓' : `Pay ₹${selectedDoctor.price || 500} & Reserve In-Clinic Token`} <span>↗</span>
          </button>
        </div>
        {confirmed && (
          <div className="inline-success" role="status" style={{ marginTop: '14px', padding: '14px 16px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#047857' }}>
                ✓ In-Clinic OPD Appointment Reserved (Token #{state.appointments[state.appointments.length - 1]?.id || 'NEW'})!
              </div>
              <button
                type="button"
                className="button"
                style={{
                  background: '#059669',
                  borderColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '12px',
                  padding: '7px 16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
                }}
                onClick={() => {
                  const latestAppt = state.appointments[state.appointments.length - 1]
                  if (latestAppt) setSelectedReceiptAppointment(latestAppt)
                }}
              >
                <span>📥</span> Download "E-receipt" <span>↗</span>
              </button>
            </div>
            <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
              Please visit <strong>{selectedHospital.name}</strong> ({selectedCity}) on <strong>{date}</strong> at <strong>{slot}</strong> for your in-person consultation with <strong>{selectedDoctor.name}</strong>. Status: <strong>Awaiting Doctor Approval</strong>.
            </div>
          </div>
        )}
      </Panel>
      <Panel title="Your in-clinic appointments" subtitle={`${state.appointments.length} OPD VISITS`}>
        {state.appointments.length === 0 ? (
          <p className="demo-muted">No appointments booked yet. Complete the 5-step OPD booking on the left to schedule your in-person hospital visit.</p>
        ) : (
          state.appointments.map(rawItem => {
            const sharedMatch = sharedAppointments.find(s => String(s.id) === String(rawItem.id) || (s.tokenNo && String(s.tokenNo) === String(rawItem.id)))
            const item: Appointment = sharedMatch ? { ...rawItem, status: sharedMatch.status || rawItem.status, hospital: sharedMatch.hospital || rawItem.hospital, hospitalCity: sharedMatch.hospitalCity || rawItem.hospitalCity } : rawItem
            const isApproved = item.status === 'Approved' || item.status === 'Confirmed'
            return (
            <article className="appointment-card" key={item.id} style={{ borderLeft: isApproved ? '4px solid #059669' : item.status === 'Cancelled' ? '4px solid #dc2626' : '4px solid #f59e0b', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <Badge style={{
                  background: item.status === 'Pending' ? '#fffbeb' : item.status === 'Cancelled' ? '#fef2f2' : '#ecfdf5',
                  color: item.status === 'Pending' ? '#b45309' : item.status === 'Cancelled' ? '#991b1b' : '#047857',
                  borderColor: item.status === 'Pending' ? '#fde68a' : item.status === 'Cancelled' ? '#fecaca' : '#a7f3d0'
                }}>
                  {item.status === 'Pending' ? '⏳ Pending Doctor Approval' : item.status === 'Cancelled' ? '✕ Cancelled (Refund Credited)' : '✓ Doctor Approved (Ready for Visit)'}
                </Badge>
                <span className="mono" style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px' }}>
                  TOKEN #{item.id}
                </span>
              </div>

              <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>{item.doctor}</h4>
              <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>
                {item.specialty || 'General Physician'}
              </p>

              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '12px', marginBottom: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 600 }}>
                  <span>🏥</span>
                  <span>{item.hospital || 'AIIMS Hospital Bhubaneswar'}, {item.hospitalCity || item.state || 'Bhubaneswar'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', marginTop: '3px' }}>
                  <span>📅</span>
                  <span>Visit Date: <strong>{item.date}</strong> at <strong>{item.time}</strong> (15-min OPD slot)</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#047857' }}>
                <span>✓ Consultation Fee: ₹{item.fee || 500} (Paid via {item.paymentMethod || 'UPI'})</span>
                {item.utr && <span style={{ fontFamily: 'monospace', color: '#64748b' }}>UTR: {item.utr}</span>}
              </div>

              {item.status !== 'Cancelled' ? (
                <>
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                    {isApproved ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '11px', color: '#047857', background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                          ✓ Confirmed by doctor! Please arrive at <strong>{item.hospital || 'Hospital'}</strong> at <strong>{item.time}</strong> with Token #{item.id} for your consultation.
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                          <button
                            type="button"
                            className="button"
                            style={{
                              background: '#0e7490',
                              borderColor: '#0e7490',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '12px',
                              padding: '7px 14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(14, 116, 144, 0.25)'
                            }}
                            onClick={() => setSelectedReceiptAppointment(item)}
                          >
                            <span>📥</span> Download "E-receipt" <span>↗</span>
                          </button>
                          <Link
                            to="/prescriptions"
                            className="button"
                            style={{
                              background: '#059669',
                              borderColor: '#059669',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '12px',
                              padding: '7px 14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                            }}
                          >
                            <span>℞</span> View Prescriptions & Sync to Cart 🛒 <span>↗</span>
                          </Link>
                          <button
                            className="text-link"
                            style={{ marginLeft: 'auto', color: '#dc2626' }}
                            onClick={() => setCancellingAppointment(item)}
                          >
                            Cancel Visit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600, background: '#fef3c7', padding: '4px 8px', borderRadius: '4px' }}>
                            ⏳ Awaiting doctor approval from hospital portal
                          </span>
                          <button
                            type="button"
                            className="button secondary"
                            style={{ fontSize: '11px', padding: '5px 12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setSelectedReceiptAppointment(item)}
                          >
                            <span>📥</span> Download "E-receipt"
                          </button>
                        </div>
                        <button
                          className="text-link"
                          style={{ color: '#dc2626' }}
                          onClick={() => setCancellingAppointment(item)}
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', marginTop: '10px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#991b1b', fontWeight: 600 }}>
                    <span>Consultation Fee: ₹{item.fee || 500}</span>
                    <span style={{ color: '#b91c1c' }}>Cancellation Fee: -₹{item.cancellationFee || 50}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#047857', fontWeight: 700, marginTop: '5px', fontSize: '12px' }}>
                    <span>Refund Credited:</span>
                    <span>₹{item.refundAmount !== undefined ? item.refundAmount : Math.max(0, (item.fee || 500) - 50)}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
                    Refund Ref: {item.refundUtr || 'REF-SETTLED-SUCCESS'}
                  </div>
                </div>
              )}
            </article>
          )
        })
      )}
      </Panel>
    </div>

    {/* Appointment Fee Payment Gateway Modal */}
    <YouPIModal
      isOpen={isPaymentOpen}
      onClose={() => setIsPaymentOpen(false)}
      order={{
        orderId: `APT-${Date.now().toString().slice(-6)}`,
        amount: selectedDoctor.price || 500,
        purpose: 'appointment',
        doctorName: doctor,
        appointmentDate: date,
        appointmentTime: slot,
        consultationPolicyNote: 'Appointment Fee: If you cancel, a standard ₹50 processing fee is deducted and the remainder is refunded instantly to your original payment method.',
        items: [
          {
            name: `Consultation: Dr. ${doctor}`,
            quantity: 1,
            price: selectedDoctor.price || 500,
            dose: `${selectedDoctor.specialty} · 15-min slot`,
          },
        ],
      }}
      onPaymentSuccess={handlePaymentSuccess}
    />

    {/* Cancellation and Refund Confirmation Modal */}
    {cancellingAppointment && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#ffffff', padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠️</span> Cancel Appointment
              </h3>
              <button
                type="button"
                onClick={() => setCancellingAppointment(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#fee2e2' }}>
              Token #{cancellingAppointment.id} · Dr. {cancellingAppointment.doctor} ({cancellingAppointment.date} at {cancellingAppointment.time})
            </p>
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', marginBottom: '10px' }}>
                REFUND & CANCELLATION CHARGE BREAKDOWN
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#475569' }}>Consultation Fee Paid:</span>
                <strong style={{ color: '#0f172a' }}>₹{cancellingAppointment.fee || 500}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Cancellation Charge (Standard Fee):
                </span>
                <strong style={{ color: '#dc2626' }}>- ₹50</strong>
              </div>
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <span style={{ fontWeight: 700, color: '#047857' }}>Net Refund to Your Account:</span>
                <strong style={{ fontWeight: 800, color: '#047857', fontSize: '17px' }}>
                  ₹{Math.max(0, (cancellingAppointment.fee || 500) - 50)}
                </strong>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#166534', marginBottom: '18px', display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>💳</span>
              <div>
                <strong>Instant Refund Routing:</strong>
                <div>Refund will be returned to your original payment method within 1–2 hours.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="button light"
                onClick={() => setCancellingAppointment(null)}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                className="button"
                style={{ background: '#dc2626', borderColor: '#b91c1c', padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
                onClick={handleConfirmCancellation}
              >
                Confirm Cancellation (Refund ₹{Math.max(0, (cancellingAppointment.fee || 500) - 50)})
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Official Appointment & Prescription E-Receipt Modal */}
    <AppointmentReceiptModal
      isOpen={Boolean(selectedReceiptAppointment)}
      onClose={() => setSelectedReceiptAppointment(null)}
      appointment={selectedReceiptAppointment}
    />
    </>
  )
}

interface TriageChatMessage {
  id: string
  sender: 'iryo' | 'user'
  text: string
  timestamp: string
  triageData?: TriageResult
}

function renderInlineFormatting(str: string) {
  const parts = str.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} style={{ color: 'var(--ink)' }}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

function FormattedIryoMessage({ text }: { text: string }) {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean)
  if (paragraphs.length === 0) {
    return <p style={{ margin: 0, lineHeight: 1.65 }}>{renderInlineFormatting(text)}</p>
  }

  return (
    <div className="iryo-msg-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n').filter(Boolean)
        const isList = lines.length > 1 && lines.every(l => /^\s*[-*•\d+.]\s+/.test(l))
        if (isList) {
          return (
            <ul key={pIdx} style={{ margin: '0.2rem 0 0.2rem 1.2rem', padding: 0 }}>
              {lines.map((item, lIdx) => {
                const cleaned = item.replace(/^\s*[-*•\d+.]\s+/, '')
                return <li key={lIdx} style={{ marginBottom: '0.25rem' }}>{renderInlineFormatting(cleaned)}</li>
              })}
            </ul>
          )
        }
        return (
          <p key={pIdx} style={{ margin: 0, lineHeight: 1.65 }}>
            {lines.map((l, lIdx) => (
              <span key={lIdx} style={{ display: 'block', marginBottom: lIdx < lines.length - 1 ? '0.35rem' : 0 }}>
                {renderInlineFormatting(l)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function TriagePage() {
  const [params] = useSearchParams()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [latestTriage, setLatestTriage] = useState<TriageResult | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const presets: Record<string, string> = {
    sinus: 'Headache and sinus pressure for two days',
    skin: 'An itchy rash on my arm',
    general: 'I feel tired and would like a general checkup'
  }

  const user = getStoredUser()
  const greetingName = user?.displayName ? user.displayName.split(' ')[0] : 'there'

  const [messages, setMessages] = useState<TriageChatMessage[]>([
    {
      id: 'init-greeting',
      sender: 'iryo',
      text: `Hello, ${greetingName}. I'm Iryo, your AI clinical companion at Iryotek Hospital.\n\nTell me what you're experiencing—such as what symptoms you have, when they started, and how severe they feel. I will listen carefully, ask clinical follow-up questions, cross-reference diagnostic criteria, and recommend the right care pathway for you.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const runTriage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: TriageChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const result = await checkSymptomsAI(text.trim())
      setLatestTriage(result)
      const aiReply = result.analysis || (
        result.isEmergency
          ? '🚨 URGENT: The symptoms you described indicate a potential acute clinical emergency. Please do not wait. Visit the nearest emergency room or call emergency services immediately.'
          : `I have received your symptoms and evaluated them against clinical protocols. Consulting a ${result.recommendedSpecialty || result.recommendedSpecialist || 'General physician'} is recommended.`
      )
      const aiMsg: TriageChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'iryo',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triageData: result,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      const errorMsg: TriageChatMessage = {
        id: 'ai-err-' + Date.now(),
        sender: 'iryo',
        text: "I couldn't complete the clinical analysis due to a network interruption. If you are experiencing acute distress, please call emergency services immediately.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    setLoading(true)
    try {
      await checkSymptomsAI('__reset__')
    } catch {
      // ignore
    } finally {
      setLoading(false)
      setLatestTriage(null)
      setMessages([
        {
          id: 'reset-' + Date.now(),
          sender: 'iryo',
          text: `Chat session refreshed. How can I assist you with your health today, ${greetingName}? 🌿`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ])
    }
  }

  useEffect(() => { 
    if (params.get('scenario')) {
      const text = presets[params.get('scenario')!] || ''
      if (text) runTriage(text)
    }
  }, [])

  const emergency = latestTriage?.isEmergency
  const specialty = latestTriage?.recommendedSpecialty || latestTriage?.recommendedSpecialist || 'General physician'
  const specialist = doctors.find(item => item.specialty.toLowerCase().includes(specialty.toLowerCase()) || specialty.toLowerCase().includes(item.specialty.toLowerCase())) || doctors[0]

  return (
    <>
      <PageHeading 
        label="IRYO / AI CLINICAL COMPANION" 
        title="Let's find your next step." 
        description="Conversational symptom triage powered by NVIDIA Nemotron 3.5 Lightning. Talk directly with Iryo, explore differential diagnoses, and connect with clinical specialists." 
      />
      <div className="demo-split wide-left">
        <Panel className="full-chat">
          <div className="sakura-chat-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--line)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="sakura-brand" style={{ fontWeight: 600, fontSize: '15px' }}>✳ Iryo AI</span>
              <Badge><i className="status-dot" /> LIVE NEMOTRON CLINICAL ENGINE</Badge>
            </div>
            <button 
              type="button" 
              onClick={handleReset} 
              disabled={loading}
              style={{ background: 'transparent', border: '1px solid var(--line)', padding: '5px 11px', fontSize: '10px', cursor: 'pointer', borderRadius: '4px', color: '#567078' }}
              title="Reset conversation session"
            >
              Start New Consultation ↺
            </button>
          </div>

          {/* Interactive Chat Stream */}
          <div className="triage-messages-stream" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '360px', maxHeight: '560px', overflowY: 'auto', paddingRight: '8px', marginBottom: '18px' }}>
            {messages.map(msg => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="demo-chat-message from-user" style={{ maxWidth: '85%', alignSelf: 'flex-end', background: '#dae8df', borderRadius: '12px 0 12px 12px', padding: '14px 18px', border: '1px solid #10798022' }}>
                    <div style={{ fontSize: '12.5px', lineHeight: 1.6, color: 'var(--ink)' }}>{msg.text}</div>
                    <div style={{ fontSize: '9px', opacity: 0.65, marginTop: '6px', textAlign: 'right' }}>{msg.timestamp}</div>
                  </div>
                )
              }

              const msgSpecialty = msg.triageData?.recommendedSpecialty || msg.triageData?.recommendedSpecialist || 'General physician'
              const msgDoctor = doctors.find(item => item.specialty.toLowerCase().includes(msgSpecialty.toLowerCase()) || msgSpecialty.toLowerCase().includes(item.specialty.toLowerCase())) || doctors[0]
              const isEmerg = msg.triageData?.isEmergency

              return (
                <div key={msg.id} className="demo-chat-message" style={{ maxWidth: '92%', alignSelf: 'flex-start', background: '#f6fbf9', borderRadius: '0 12px 12px 12px', padding: '16px 20px', border: '1px solid #1079801f' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--teal)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px' }}>✳</span> Iryo AI • Clinical Companion
                    </span>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>{msg.timestamp}</span>
                  </div>

                  <FormattedIryoMessage text={msg.text} />

                  {/* Attached Clinical Triage Report Card if clinical data/symptoms exist */}
                  {msg.triageData && (isEmerg || (msg.triageData.differentialDiagnoses && msg.triageData.differentialDiagnoses.length > 0)) && (
                    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #10798022' }}>
                      {isEmerg ? (
                        <div className="demo-triage-report emergency" style={{ margin: '8px 0', padding: '16px', borderRadius: '6px' }}>
                          <span className="eyebrow" style={{ color: '#b52230', fontWeight: 600 }}>🚨 CRITICAL EMERGENCY SIGNAL</span>
                          <h4 style={{ fontFamily: 'var(--display)', fontSize: '18px', margin: '6px 0', color: '#b52230' }}>Immediate Clinical Emergency Attention Required</h4>
                          <p style={{ fontSize: '11px', margin: '4px 0', color: '#567078' }}>
                            {msg.triageData.emergencyReason || 'Acute symptoms require urgent physical assessment. Call 112 or visit Emergency Ground Floor Room 101 immediately.'}
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                          {msg.triageData.triageBadge && <Badge>{msg.triageData.triageBadge}</Badge>}
                          <span style={{ fontSize: '11px', color: '#475569' }}>
                            Recommended Specialty: <strong style={{ color: 'var(--teal)' }}>{msgSpecialty}</strong>
                          </span>
                        </div>
                      )}

                      {/* Differential diagnoses */}
                      {msg.triageData.differentialDiagnoses && msg.triageData.differentialDiagnoses.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <span className="eyebrow" style={{ display: 'block', marginBottom: '6px', fontSize: '8px' }}>DIFFERENTIAL DIAGNOSES (NVIDIA NEMOTRON ENGINE)</span>
                          <div style={{ display: 'grid', gap: '6px' }}>
                            {msg.triageData.differentialDiagnoses.map((diff, idx) => (
                              <div key={idx} className="demo-list-row" style={{ alignItems: 'flex-start', padding: '6px 0', fontSize: '10px' }}>
                                <div>
                                  <strong>{diff.condition}</strong>
                                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>{diff.reasoning}</div>
                                </div>
                                <Badge>{diff.probability}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Immediate action plan */}
                      {msg.triageData.immediateActionPlan && msg.triageData.immediateActionPlan.length > 0 && (
                        <div style={{ marginTop: '10px', padding: '8px 12px', background: isEmerg ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 121, 128, 0.06)', borderRadius: '6px', fontSize: '10.5px' }}>
                          <strong>Recommended Next Steps:</strong>
                          <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                            {msg.triageData.immediateActionPlan.map((act, idx) => <li key={idx} style={{ marginBottom: '2px' }}>{act}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Doctor booking CTA */}
                      {!isEmerg && msgDoctor && (
                        <div style={{ marginTop: '14px' }}>
                          <Link className="button" style={{ padding: '9px 14px', fontSize: '10.5px' }} to={`/appointments?doctor=${encodeURIComponent(msgDoctor.name)}`}>
                            Book appointment with {msgDoctor.name} ({msgDoctor.specialty}) <span>↗</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {loading && (
              <div className="demo-chat-message" style={{ maxWidth: '80%', alignSelf: 'flex-start', background: '#f0fdf9', border: '1px solid #10798022', padding: '14px 18px', borderRadius: '0 12px 12px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="status-dot" style={{ background: 'var(--teal)', animation: 'pulse 1s infinite' }} />
                <span style={{ fontSize: '12px', color: 'var(--teal)', fontStyle: 'italic' }}>
                  Iryo is thinking, analyzing clinical datasets & preparing guidance…
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form 
            className="triage-input" 
            onSubmit={event => { 
              event.preventDefault()
              if (input.trim()) { 
                const text = input.trim()
                setInput('')
                runTriage(text)
              } 
            }}
          >
            <label htmlFor="symptoms" className="eyebrow" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>TALK WITH IRYO</span>
              <span style={{ textTransform: 'none', letterSpacing: 'normal', color: '#64748b' }}>Press Enter to send</span>
            </label>
            <textarea 
              id="symptoms" 
              placeholder="Describe what you are experiencing, answer Iryo's questions, or ask for health guidance..." 
              value={input} 
              onChange={event => setInput(event.target.value)} 
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  if (input.trim()) {
                    const text = input.trim()
                    setInput('')
                    runTriage(text)
                  }
                }
              }}
              maxLength={700} 
              rows={3}
              required 
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button className="button" type="submit" disabled={loading || !input.trim()}>
                {loading ? 'Iryo is replying…' : 'Send to Iryo AI'} <span>↗</span>
              </button>
            </div>
          </form>
        </Panel>

        <div>
          {/* Active summary card if clinical triage data exists */}
          {latestTriage && (latestTriage.isEmergency || (latestTriage.differentialDiagnoses && latestTriage.differentialDiagnoses.length > 0)) && (
            <Panel title="Active Triage Assessment" subtitle="CLINICAL SUMMARY">
              <div style={{ marginBottom: '14px' }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>TRIAGE PRIORITY</span>
                <Badge>{latestTriage.triageBadge || latestTriage.triageLevel || 'Routine'}</Badge>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>RECOMMENDED SPECIALTY</span>
                <strong style={{ fontSize: '16px', color: 'var(--teal)' }}>{specialty}</strong>
              </div>
              {specialist && !emergency && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '11px', color: '#567078', marginBottom: '8px' }}>Available consulting doctor:</div>
                  <strong>{specialist.name}</strong>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '10px' }}>{specialist.hospital}</div>
                  <Link className="button" style={{ padding: '8px 12px', fontSize: '10px' }} to={`/appointments?doctor=${encodeURIComponent(specialist.name)}`}>
                    Book Consultation <span>↗</span>
                  </Link>
                </div>
              )}
            </Panel>
          )}

          <Panel title="Try a consultation" subtitle="SAMPLE SCENARIOS">
            <div className="quick-concerns">
              {[presets.sinus, presets.skin, 'Chest pain and shortness of breath', 'Feeling tired and slight fever for 2 days'].map(text => (
                <button 
                  key={text} 
                  type="button"
                  onClick={() => runTriage(text)}
                  disabled={loading}
                >
                  {text} ↗
                </button>
              ))}
            </div>
          </Panel>

          <div className="demo-safety">
            <span>✦</span>
            <h3>AI Guidance with Boundaries.</h3>
            <p>{latestTriage?.clinicalDisclaimer || 'Iryo AI is an assistive differential companion at Iryotek Hospital. It does not replace in-person clinical diagnosis. In case of acute emergencies, call 112 or visit an emergency room immediately.'}</p>
          </div>
        </div>
      </div>
    </>
  )
}

interface DoctorRecommendedMedicine {
  id: number
  name: string
  category: string
  salt?: string
  dose: string
  price: number
  stock: number
  brand: string
  prescription: boolean
  description: string
  details?: string
  rationale?: string
  imageUrl?: string
  image?: string
  recommendedBy: string
  doctorReg?: string
  recommendedAt: string
}

function PharmacyPage({ notify }: { notify: (text: string) => void }) {
  const { state, update } = useContext(DemoContext)
  const authUser = getStoredAuthUser()
  const isDoctor = authUser?.role === 'Doctor'

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())
  const [delivery, setDelivery] = useState(0)
  const [isYouPIOpen, setIsYouPIOpen] = useState(false)
  const [youPIPayment, setYouPIPayment] = useState<YouPIPaymentResult | null>(null)
  const [medList, setMedList] = useState<ApiMedicine[]>([])
  const [catList, setCatList] = useState<string[]>(['All'])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1973)
  const [totalCount, setTotalCount] = useState(47335)
  const [loading, setLoading] = useState(false)
  const [pageInput, setPageInput] = useState('')

  // Doctor recommended medicines state (user-created only, no hardcoded mock formulations)
  const [recommendedMeds, setRecommendedMeds] = useState<DoctorRecommendedMedicine[]>(() => {
    try {
      const stored = localStorage.getItem('iryotek_doctor_recommended_medicines')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed.filter((m: any) => ![99001, 99002, 99003].includes(m.id))
        }
      }
      return []
    } catch {
      return []
    }
  })

  const [isRecommendOpen, setIsRecommendOpen] = useState(false)
  const [recommendForm, setRecommendForm] = useState({
    name: '',
    category: 'Cardiology',
    salt: '',
    dose: '',
    brand: '',
    price: '180',
    details: '',
    rationale: '',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
  })
  const [imagePreview, setImagePreview] = useState<string>('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setImagePreview(result)
        setRecommendForm(prev => ({ ...prev, imageUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRecommendSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recommendForm.name.trim()) {
      alert('Please provide the medicine name.')
      return
    }
    const newMed: DoctorRecommendedMedicine = {
      id: Date.now(),
      name: recommendForm.name.trim(),
      category: recommendForm.category,
      salt: recommendForm.salt.trim() || 'Active Pharmaceutical Ingredient',
      dose: recommendForm.dose.trim() || 'As directed by physician',
      price: parseInt(recommendForm.price, 10) || 150,
      stock: 100,
      brand: recommendForm.brand.trim() || 'Iryotek Clinical Formulations',
      prescription: true,
      description: recommendForm.details.trim() || recommendForm.name,
      details: recommendForm.details.trim(),
      rationale: recommendForm.rationale.trim() || 'Doctor-recommended formulation for clinical efficacy.',
      imageUrl: recommendForm.imageUrl || imagePreview || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
      image: recommendForm.imageUrl || imagePreview,
      recommendedBy: authUser?.displayName || 'Dr. Suresh Joshi',
      doctorReg: authUser?.registrationNo || 'MCI-2012-98421',
      recommendedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const updated = [newMed, ...recommendedMeds]
    setRecommendedMeds(updated)
    try {
      localStorage.setItem('iryotek_doctor_recommended_medicines', JSON.stringify(updated))
    } catch {}

    notify(`"${newMed.name}" has been successfully recommended and added to the Iryotek clinical formulary!`)
    setIsRecommendOpen(false)
    setRecommendForm({
      name: '',
      category: 'Cardiology',
      salt: '',
      dose: '',
      brand: '',
      price: '180',
      details: '',
      rationale: '',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
    })
    setImagePreview('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60')
  }

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault()
    const target = parseInt(pageInput, 10)
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setPage(target)
      setPageInput('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    getMedicineCategories().then(cats => {
      if (cats && cats.length > 0) setCatList(['All', 'Doctor Recommended', ...cats.filter(c => c !== 'All')])
    })
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    getMedicines({
      search: search.trim() || undefined,
      category: (category !== 'All' && category !== 'Doctor Recommended') ? category : undefined,
      limit: 24,
      page,
    }).then(res => {
      if (!active) return
      if (res && res.medicines) {
        setMedList(res.medicines)
        if (res.totalPages) setTotalPages(res.totalPages)
        if (res.total) setTotalCount(res.total)
      }
    }).catch(() => {
      // fallback
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [search, category, page])

  const handleSearchChange = (val: string) => { setSearch(val); setPage(1) }
  const handleCategoryChange = (val: string) => { setCategory(val); setPage(1) }

  const currentMeds = medList.length > 0 ? medList : medicines

  // Combine doctor recommended medicines matching search query and category
  const sortedMeds = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filteredRecs = recommendedMeds.filter(rec => {
      if (category === 'Doctor Recommended') {
        if (!q) return true
        return rec.name.toLowerCase().includes(q) || (rec.salt && rec.salt.toLowerCase().includes(q)) || (rec.details && rec.details.toLowerCase().includes(q))
      }
      if (category !== 'All' && rec.category !== category) return false
      if (!q) return true
      return rec.name.toLowerCase().includes(q) || (rec.salt && rec.salt.toLowerCase().includes(q)) || (rec.details && rec.details.toLowerCase().includes(q))
    })

    if (category === 'Doctor Recommended') {
      return filteredRecs
    }

    const baseSorted = [...currentMeds].sort((a, b) => {
      const aVisible = Boolean(hasAuthenticMedicinePhoto(a) && !failedImages.has(a.id))
      const bVisible = Boolean(hasAuthenticMedicinePhoto(b) && !failedImages.has(b.id))
      if (aVisible && !bVisible) return -1
      if (!aVisible && bVisible) return 1
      return 0
    })

    // Prepend recommended medicines to the visible page if on page 1
    if (page === 1 && filteredRecs.length > 0) {
      return [...filteredRecs, ...baseSorted]
    }
    return baseSorted
  }, [currentMeds, failedImages, recommendedMeds, search, category, page])

  const user = getStoredUser()
  const profile = user?.patientProfile
  const userDeliveryAddress = profile?.address
    ? `${profile.address}, ${profile.city || ''} - ${profile.pincode || ''}`.replace(/,\s*-/, '').trim()
    : 'Registered Patient Address'

  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const add = (medicine: Medicine | ApiMedicine | DoctorRecommendedMedicine) => update(previous => ({ ...previous, cart: previous.cart.some(item => item.id === medicine.id) ? previous.cart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item) : [...previous.cart, { id: medicine.id, name: medicine.name, category: medicine.category, dose: medicine.dose, price: medicine.price, quantity: 1, stock: medicine.stock, brand: medicine.brand || 'Iryotek Care', prescription: medicine.prescription || false, description: medicine.description || '' }] }))
  useEffect(() => { if (!state.order || delivery >= 4) return; const timer = setTimeout(() => setDelivery(value => value + 1), 1800); return () => clearTimeout(timer) }, [state.order, delivery])

  return (
    <>
      <PageHeading
        label="PHARMACY / CARE, DELIVERED"
        title="One less thing to worry about."
        description="47,000+ verified pharmaceuticals from our database with authentic packaging photography and reliable medication delivery."
        action={
          isDoctor ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="button"
                onClick={() => setIsRecommendOpen(true)}
                style={{ background: 'var(--accent, #008080)', borderColor: 'var(--accent, #008080)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                + Suggest New Medicine <span>✚</span>
              </button>
              <Link to="/prescriptions" className="button secondary">Prescriptions <span>↗</span></Link>
            </div>
          ) : (
            <Link to="/prescriptions" className="button">Prescription Center <span>↗</span></Link>
          )
        }
      />
      <div className="demo-split wide-left">
        <div>
          <div className="demo-filter-row">
            <label className="demo-search">
              <span>⌕</span>
              <input
                aria-label="Search medicines"
                placeholder="Search 47,335 medicines or formulations…"
                value={search}
                onChange={event => handleSearchChange(event.target.value)}
              />
            </label>
            <select
              aria-label="Medicine category"
              value={category}
              onChange={event => handleCategoryChange(event.target.value)}
            >
              {catList.map(value => <option key={value}>{value}</option>)}
            </select>
          </div>
          {(loading || search || category !== 'All') && (
            <div className="demo-results-count" aria-live="polite">
              {loading
                ? 'Consulting pharmaceutical database…'
                : category === 'Doctor Recommended'
                ? `Showing ${sortedMeds.length} clinician-recommended pharmaceutical formulations`
                : `Showing ${totalCount.toLocaleString()} medicines${category !== 'All' ? ` in ${category}` : ''}`
              }
              {(search || category !== 'All') && (
                <button onClick={() => { setSearch(''); setCategory('All'); setPage(1) }}>Reset filters ↺</button>
              )}
            </div>
          )}
          <div className="demo-medicine-grid">
            {sortedMeds.map(item => {
              const isRecommended = Boolean((item as any).recommendedBy)
              return (
                <article className="demo-medicine" key={item.id} style={{ border: isRecommended ? '1.5px solid #fde68a' : undefined, background: isRecommended ? '#fffdf7' : undefined }}>
                  <div className="medicine-visual">
                    {hasAuthenticMedicinePhoto(item) && !failedImages.has(item.id) ? (
                      <img
                        src={(item as any).imageUrl || item.image || ''}
                        alt={item.name}
                        className="medicine-photo-thumb"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => {
                          setFailedImages(prev => new Set(prev).add(item.id))
                        }}
                      />
                    ) : (
                      <div className="medicine-fallback-box">
                        <div className="medicine-fallback-icon">{getMedicineDosageIcon(item.dose, item.category)}</div>
                        <span className="fallback-category">{item.category || 'Pharmaceutical'}</span>
                        <span className="fallback-name" title={item.name}>{item.name}</span>
                        <span className="fallback-status">Packaging photo pending</span>
                      </div>
                    )}
                  </div>
                  <div>
                    {isRecommended && (
                      <div style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <span>★</span> Suggested by {(item as any).recommendedBy}
                      </div>
                    )}
                    <span className="eyebrow">{item.category}</span>
                    <h4><Link to={`/medicines/${item.id}`}>{item.name} ↗</Link></h4>
                    {(item as any).salt && (
                      <p style={{ fontSize: '11px', color: '#0f766e', fontWeight: 600, margin: '1px 0 3px' }}>
                        Salt: {(item as any).salt}
                      </p>
                    )}
                    <p style={{ margin: '2px 0' }}>{item.dose}</p>
                    {(item as any).rationale && (
                      <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', margin: '3px 0 6px', lineHeight: 1.3 }}>
                        "{(item as any).rationale}"
                      </p>
                    )}
                    <div className="medicine-buy">
                      <strong>₹{item.price}</strong>
                      <button onClick={() => { add(item); notify(`${item.name} added to your care cart.`) }} aria-label={`Add ${item.name} to cart`}>Add +</button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          {!sortedMeds.length && !loading && (
            category === 'Doctor Recommended' ? (
              <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', margin: '1rem 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>💊</div>
                <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Doctor Recommended Medicines Yet</h4>
                <p className="demo-muted" style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
                  {isDoctor
                    ? 'You have not added any recommended clinical formulations to the catalog yet. Use the "+ Suggest Formulation to Catalog" button above to register your first medicine.'
                    : 'No physician-recommended medications are listed yet. Clinical recommendations added by licensed doctors will appear here.'}
                </p>
                {isDoctor && (
                  <button
                    type="button"
                    className="button"
                    onClick={() => setIsRecommendOpen(true)}
                    style={{ fontSize: '13px' }}
                  >
                    + Suggest Formulation to Catalog ↗
                  </button>
                )}
              </div>
            ) : (
              <p className="empty-results">No database items match. Try a different search.</p>
            )
          )}

          <div className="catalog-pagination">
            <button
              className="page-btn"
              disabled={page <= 1 || loading}
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            >
              ← Previous
            </button>
            <span className="page-indicator">
              Page <strong>{page}</strong> of <strong>{totalPages.toLocaleString()}</strong> ({totalCount.toLocaleString()} Medicines)
            </span>
            <button
              className="page-btn"
              disabled={page >= totalPages || loading}
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            >
              Next →
            </button>
            <form onSubmit={handleJumpPage} className="catalog-page-jump">
              <span>Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInput}
                onChange={e => setPageInput(e.target.value)}
                placeholder={String(page)}
                aria-label="Jump to page"
              />
              <button type="submit">Go</button>
            </form>
          </div>
        </div>

        <Panel title="Your care cart" subtitle={`${state.cart.reduce((sum, item) => sum + item.quantity, 0)} ITEMS`} className="cart-sticky">
          {state.cart.length ? state.cart.map(item => (
            <div className="demo-cart-item" key={item.id}>
              <div>
                <h4>{item.name}</h4>
                <p>{item.dose}</p>
              </div>
              <strong>₹{item.price * item.quantity}</strong>
              <div className="quantity-controls">
                <button aria-label={`Decrease ${item.name}`} onClick={() => update(previous => ({ ...previous, cart: previous.cart.map(medicine => medicine.id === item.id ? { ...medicine, quantity: medicine.quantity - 1 } : medicine).filter(medicine => medicine.quantity > 0) }))}>−</button>
                <span>{item.quantity}</span>
                <button aria-label={`Increase ${item.name}`} onClick={() => add(item)}>+</button>
              </div>
            </div>
          )) : (
            <div className="cart-empty">
              <span>✚</span>
              <h3>A little care, ready when you are.</h3>
              <p>Search or add any medication from our 47,335-medicine catalog.</p>
            </div>
          )}
          <div className="demo-list-row"><span>Subtotal</span><strong>₹{total}</strong></div>
          <div className="demo-list-row"><span>Doorstep delivery</span><span>Complimentary</span></div>
          <div className="demo-list-row">
            <span>Payment Gateway</span>
            <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: 600 }}>⚡ Instant UPI & Net Banking (0% Fee)</span>
          </div>
          <button
            className="button full-width"
            disabled={!state.cart.length || state.order}
            onClick={() => {
              if (!state.cart.length || state.order) return
              setIsYouPIOpen(true)
            }}
          >
            {state.order ? 'Order placed ✓' : 'Pay via UPI / Card & Deliver ⚡'} <span>↗</span>
          </button>
          {state.order && (
            <div className="demo-delivery" role="status">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="eyebrow">ORDER {youPIPayment?.orderId || 'IRY-10248'}</span>
                <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                  ⚡ Payment Verified
                </span>
              </div>
              {youPIPayment && (
                <div style={{ fontSize: '11px', background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                  <div style={{ color: '#083344', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{youPIPayment.paymentMethod === 'UPI' ? 'Paid via UPI' : youPIPayment.paymentMethod}</span>
                    <strong style={{ color: '#0f766e' }}>₹{youPIPayment.amount.toFixed(2)}</strong>
                  </div>
                  {youPIPayment.utr && <div style={{ color: '#587477', fontSize: '10px', fontFamily: 'monospace', marginTop: '3px' }}>UTR: {youPIPayment.utr}</div>}
                  <div style={{ color: '#64748b', fontSize: '10px', marginTop: '2px' }}>Settled: {youPIPayment.timestamp} (0% fee)</div>
                </div>
              )}
              {['Pending', 'Confirmed', 'Preparing', 'Out for delivery', 'Delivered'].map((step, index) => (
                <div key={step} className={index <= delivery ? 'complete' : ''}><span>{index <= delivery ? '✓' : '○'}</span>{step}</div>
              ))}
              <button
                type="button"
                className="button secondary"
                style={{ marginTop: '12px', width: '100%', borderColor: '#ef4444', color: '#b91c1c', fontSize: '12px', padding: '6px 12px' }}
                onClick={() => {
                  if (window.confirm('Cancel this active medicine delivery order?')) {
                    const currentOrderId = youPIPayment?.orderId || 'IRY-10248'
                    update(prev => ({
                      ...prev,
                      order: false,
                      orders: prev.orders.map(o => o.id === currentOrderId ? { ...o, status: 'Cancelled' } : o)
                    }))
                    notify('Medicine order delivery has been cancelled.')
                  }
                }}
              >
                Cancel Order Delivery ✕
              </button>
            </div>
          )}
          <Link to="/cart" className="text-link">Open cart ↗</Link>
          <Link to="/checkout" className="text-link">Continue to checkout ↗</Link>
          <p className="panel-note">Live database connected to 47,335 catalog items with pharmaceutical imagery. Dispensing subject to clinician authorization.</p>
        </Panel>
      </div>

      <YouPIModal
        isOpen={isYouPIOpen}
        onClose={() => setIsYouPIOpen(false)}
        order={{
          orderId: `IRY-${10248 + state.orders.length}`,
          amount: total,
          items: state.cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price, dose: item.dose })),
          deliveryAddress: userDeliveryAddress,
        }}
        onPaymentSuccess={(result) => {
          setYouPIPayment(result)
          setIsYouPIOpen(false)
          setDelivery(0)
          const newOrder = {
            id: result.orderId,
            date: new Date().toISOString().split('T')[0],
            status: 'Confirmed',
            items: state.cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
            total: result.amount,
            address: `${userDeliveryAddress} · Doorstep Delivery`,
            paymentMethod: result.paymentMethod === 'UPI' ? `UPI (UTR: ${result.utr})` : result.paymentMethod === 'COD' ? 'Cash on Delivery (Verified)' : `${result.paymentMethod} (Verified)`,
            transactionId: result.transactionId,
          }
          if (user?.uid) {
            saveOrderFirestore(user.uid, {
              orderId: newOrder.id,
              date: newOrder.date,
              status: newOrder.status,
              items: newOrder.items,
              total: newOrder.total,
              address: newOrder.address,
              paymentMethod: newOrder.paymentMethod,
              transactionId: newOrder.transactionId
            }).catch(err => console.warn('[Iryotek Orders] Firestore sync deferred:', err))
          }
          update(previous => ({
            ...previous,
            order: true,
            orders: [newOrder, ...previous.orders],
          }))
          notify(`Payment verified (${result.paymentMethod === 'UPI' ? 'UTR: ' + result.utr : result.paymentMethod}). Dispensing dispatched!`)
        }}
      />

      {/* Doctor Medicine Recommendation Modal */}
      {isRecommendOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setIsRecommendOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CLINICIAN FORMULARY SUGGESTION
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: '#0f172a' }}>
                  + Recommend / Suggest New Medicine
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecommendOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecommendSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ gridColumn: 'span 2' }}>
                  Medicine / Brand Name *
                  <input
                    value={recommendForm.name}
                    onChange={e => setRecommendForm({ ...recommendForm, name: e.target.value })}
                    placeholder="e.g. CardioPulse XR 50mg, TelmiPress AM 40/5"
                    required
                  />
                </label>

                <label>
                  Therapeutic Category *
                  <select
                    value={recommendForm.category}
                    onChange={e => setRecommendForm({ ...recommendForm, category: e.target.value })}
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Pain Management">Pain Management</option>
                    <option value="General Health">General Health</option>
                  </select>
                </label>

                <label>
                  Active Salt / Chemical Composition *
                  <input
                    value={recommendForm.salt}
                    onChange={e => setRecommendForm({ ...recommendForm, salt: e.target.value })}
                    placeholder="e.g. Metoprolol Succinate 50mg"
                    required
                  />
                </label>

                <label>
                  Recommended Dosage & Administration *
                  <input
                    value={recommendForm.dose}
                    onChange={e => setRecommendForm({ ...recommendForm, dose: e.target.value })}
                    placeholder="e.g. 1 tablet once daily morning before meals"
                    required
                  />
                </label>

                <label>
                  Manufacturer / Pharmaceutical Brand
                  <input
                    value={recommendForm.brand}
                    onChange={e => setRecommendForm({ ...recommendForm, brand: e.target.value })}
                    placeholder="e.g. Sun Pharma, Cipla, Torrent"
                  />
                </label>

                <label>
                  Indicative Unit Price (₹)
                  <input
                    type="number"
                    min="1"
                    value={recommendForm.price}
                    onChange={e => setRecommendForm({ ...recommendForm, price: e.target.value })}
                    placeholder="180"
                  />
                </label>

                <label>
                  Recommending Clinician
                  <input
                    value={`${authUser?.displayName || 'Dr. Suresh Joshi'} (${authUser?.registrationNo || 'MCI-2012-98421'})`}
                    disabled
                    style={{ background: '#f8fafc', color: '#64748b' }}
                  />
                </label>

                <label style={{ gridColumn: 'span 2' }}>
                  Clinical Indication & Details *
                  <textarea
                    rows={2}
                    value={recommendForm.details}
                    onChange={e => setRecommendForm({ ...recommendForm, details: e.target.value })}
                    placeholder="Describe therapeutic indications, clinical usage, contraindications, and targeted patient profiles..."
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                  />
                </label>

                <label style={{ gridColumn: 'span 2' }}>
                  Doctor's Clinical Recommendation Rationale *
                  <textarea
                    rows={2}
                    value={recommendForm.rationale}
                    onChange={e => setRecommendForm({ ...recommendForm, rationale: e.target.value })}
                    placeholder="Why are you recommending this specific medicine or formulation? (e.g. Superior bio-equivalence, fewer side-effects, proven outcome in outpatient trials...)"
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                  />
                </label>

                {/* Medicine Packaging Image Input & Upload */}
                <div style={{ gridColumn: 'span 2', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                    Medicine Packaging Image (URL or Upload) *
                  </span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        value={recommendForm.imageUrl}
                        onChange={e => {
                          setRecommendForm({ ...recommendForm, imageUrl: e.target.value })
                          setImagePreview(e.target.value)
                        }}
                        placeholder="Paste image URL (https://...)"
                        style={{ marginBottom: '8px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <label style={{ margin: 0, padding: '4px 10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          📁 Upload File
                          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>or pick sample preset:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const url = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
                            setRecommendForm(p => ({ ...p, imageUrl: url }))
                            setImagePreview(url)
                          }}
                          style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                        >
                          Pill Bottle
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const url = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60'
                            setRecommendForm(p => ({ ...p, imageUrl: url }))
                            setImagePreview(url)
                          }}
                          style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                        >
                          Capsules
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const url = 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&auto=format&fit=crop&q=60'
                            setRecommendForm(p => ({ ...p, imageUrl: url }))
                            setImagePreview(url)
                          }}
                          style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                        >
                          Blister Strip
                        </button>
                      </div>
                    </div>

                    {/* Image Preview Thumbnail */}
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImagePreview('')} />
                      ) : (
                        <span style={{ fontSize: '24px' }}>💊</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" className="button light" onClick={() => setIsRecommendOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="button" style={{ background: 'var(--accent, #008080)', borderColor: 'var(--accent, #008080)' }}>
                  Submit & Recommend Medicine ✚
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function ConsultationPage({ notify: _notify }: { notify: (text: string) => void }) {
  return <Navigate to="/appointments" replace />
}

function RecordsPage({ notify }: { notify: (text: string) => void }) {
  const [tab, setTab] = useState('All records')
  const { state } = useContext(DemoContext)
  const user = getStoredUser()
  const profile = user?.patientProfile
  const displayName = user?.displayName || 'Registered Patient'

  const bp = profile?.bloodPressure ? `${profile.bloodPressure.systolic}/${profile.bloodPressure.diastolic}` : '--'
  const pulse = profile?.pulseRate ? String(profile.pulseRate) : '--'
  const bmi = profile?.bmi ? String(profile.bmi) : (profile?.bloodGroup || '--')

  // Build real records dynamically
  const userRecords: { title: string; type: 'Clinical profile' | 'Consultations' | 'Prescriptions'; date: string; doctor: string; detail: string }[] = []

  if (profile) {
    userRecords.push({
      title: 'Baseline Clinical Intake Profile',
      type: 'Clinical profile',
      date: 'On Registration',
      doctor: 'Iryotek Clinical Onboarding',
      detail: `Age: ${profile.age} · Gender: ${profile.gender} · Blood Group: ${profile.bloodGroup} · Address: ${profile.address}, ${profile.city} (${profile.pincode}) · Allergies: ${profile.allergies?.join(', ') || 'None'} · Chronic Conditions: ${profile.chronicConditions?.join(', ') || 'None'} · Emergency Contact: ${profile.emergencyContact?.name || ''} (${profile.emergencyContact?.relationship || ''}, ${profile.emergencyContact?.phone || ''})`,
    })
    if (profile.pastSurgeries && profile.pastSurgeries.length > 0) {
      userRecords.push({
        title: 'Surgical & Hospitalization History',
        type: 'Clinical profile',
        date: 'Reported by patient',
        doctor: 'Verified Patient Declaration',
        detail: `Previous surgical procedures and hospital records: ${profile.pastSurgeries.join(', ')}`,
      })
    }
    if (profile.currentMedications && profile.currentMedications.length > 0) {
      userRecords.push({
        title: 'Current Ongoing Regimen',
        type: 'Clinical profile',
        date: 'Active Regimen',
        doctor: 'Patient Self-Reported',
        detail: `Daily maintenance medications: ${profile.currentMedications.join(', ')}`,
      })
    }
  }

  // Merge shared appointments to show live approved status
  const mergedRecordsAppts = (() => {
    const map = new Map<string, any>()
    ;(state.appointments || []).forEach(a => { if (a && a.id) map.set(String(a.id), a) })
    getSharedAppointments().forEach(a => { if (a && a.id) map.set(String(a.id), { ...map.get(String(a.id)), ...a }) })
    return Array.from(map.values())
  })()

  mergedRecordsAppts.forEach(a => {
    userRecords.push({
      title: `Consultation with ${a.doctor}`,
      type: 'Consultations',
      date: `${a.date} at ${a.time}`,
      doctor: a.doctor,
      detail: `Scheduled clinical appointment for ${a.specialty || 'General consultation'}. Booking status: ${a.status} (Token #${a.id}).`,
    })
  })

  // Live Doctor Shared e-Prescriptions
  const realRxList = getSharedPrescriptions()
  if (realRxList.length > 0) {
    realRxList.forEach(rx => {
      const medNames = rx.medicines && rx.medicines.length > 0
        ? rx.medicines.map(m => m.name).join(', ')
        : 'Prescription Item'
      userRecords.push({
        title: `Verified e-Prescription: ${medNames}`,
        type: 'Prescriptions',
        date: rx.date || 'Active',
        doctor: rx.doctorName || 'Consultant Physician',
        detail: `Prescription #${rx.id}. Diagnosis: ${rx.diagnosis || 'Clinical evaluation'}. Instructions: ${rx.instructions || rx.advice || 'As directed by physician'}. Verified with NMC Registry & available in pharmacy cart.`,
      })
    })
  } else if (state.prescription) {
    userRecords.push({
      title: 'Verified Digital e-Prescription',
      type: 'Prescriptions',
      date: 'Active',
      doctor: state.appointments[0]?.doctor || 'Consulting Clinician',
      detail: 'Digital e-prescription issued. Synchronized with the verified pharmacy inventory.',
    })
  }

  const download = () => {
    const text = `IRYOTEK CLINICAL HEALTH SUMMARY
Patient Name: ${displayName}
Email: ${user?.email || 'N/A'} | Phone: ${user?.phone || 'N/A'}
Age: ${profile?.age || 'N/A'} | Gender: ${profile?.gender || 'N/A'} | Blood Group: ${profile?.bloodGroup || 'N/A'}
Address: ${profile?.address || 'N/A'}, ${profile?.city || 'N/A'} - ${profile?.pincode || 'N/A'}

BASELINE VITALS:
- Blood Pressure: ${profile?.bloodPressure ? `${profile.bloodPressure.systolic}/${profile.bloodPressure.diastolic} mmHg` : 'Not recorded'}
- Pulse Rate: ${profile?.pulseRate ? `${profile.pulseRate} bpm` : 'Not recorded'}
- Height: ${profile?.heightCm ? `${profile.heightCm} cm` : 'N/A'} | Weight: ${profile?.weightKg ? `${profile.weightKg} kg` : 'N/A'}
- BMI: ${profile?.bmi ? `${profile.bmi} kg/m²` : 'N/A'}

CLINICAL HISTORY:
- Allergies: ${profile?.allergies?.join(', ') || 'No Known Drug Allergies'}
- Chronic Conditions: ${profile?.chronicConditions?.join(', ') || 'None'}
- Past Surgeries: ${profile?.pastSurgeries?.join(', ') || 'None reported'}
- Current Medications: ${profile?.currentMedications?.join(', ') || 'None reported'}
- Family History: ${profile?.familyMedicalHistory || 'None reported'}
- Insurance: ${profile?.insurance ? `${profile.insurance.provider} (Policy: ${profile.insurance.policyNumber})` : 'Not on file'}

APPOINTMENTS & VISITS:
${state.appointments.length > 0 ? state.appointments.map(a => `Token #${a.id} | ${a.doctor} (${a.specialty}) | ${a.date} at ${a.time} [${a.status}]`).join('\n') : 'No recorded appointments.'}
`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `iryotek-health-summary-${displayName.toLowerCase().replace(/\s+/g, '-')}.txt`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    notify('Your official health summary has been downloaded.')
  }

  const filterCategories = ['All records', 'Clinical profile', 'Consultations', 'Prescriptions']
  const filtered = userRecords.filter(r => tab === 'All records' || r.type === tab)

  return (
    <>
      <PageHeading
        label="RECORDS / YOUR LIVING HEALTH STORY"
        title="All of you, in one place."
        description="Every reading, consultation, and baseline intake. Your authentic medical history, safely recorded."
        action={<button className="button" onClick={download}>Download summary <span>↓</span></button>}
      />
      <div className="demo-metric-grid three">
        <Metric label="BLOOD PRESSURE" value={bp} unit={bp !== '--' ? 'mmHg' : undefined} note={profile?.bloodPressure ? "Recorded baseline" : "Pending recording"} />
        <Metric label="RESTING PULSE" value={pulse} unit={pulse !== '--' ? 'bpm' : undefined} note={profile?.pulseRate ? "Recorded baseline" : "Pending recording"} />
        <Metric label={profile?.bmi ? "BODY MASS INDEX" : "BLOOD GROUP"} value={bmi} unit={profile?.bmi ? "kg/m²" : undefined} note={profile ? `${profile.gender} · ${profile.age} yrs` : "From intake"} />
      </div>

      <div className="demo-tabs" role="group" aria-label="Filter health records">
        {filterCategories.map(value => (
          <button key={value} className={tab === value ? 'active' : ''} aria-pressed={tab === value} onClick={() => setTab(value)}>
            {value}
          </button>
        ))}
      </div>

      <div className="record-list">
        {filtered.length === 0 ? (
          <Panel title="No records in this category" subtitle="CLINICAL ARCHIVE">
            <p className="demo-muted">No records match the selected filter. When you attend consultations or update your clinical profile, records will automatically reflect here.</p>
          </Panel>
        ) : (
          filtered.map(record => (
            <details key={record.title} className="record-details">
              <summary>
                <span className="record-icon">{record.type === 'Prescriptions' ? '℞' : '▤'}</span>
                <div>
                  <h4>{record.title}</h4>
                  <p>{record.doctor} · {record.date}</p>
                </div>
                <Badge>{record.type}</Badge>
                <span>+</span>
              </summary>
              <div className="record-detail-body">
                <p>{record.detail}</p>
                {record.type === 'Prescriptions' && (
                  <Link className="text-link" to="/pharmacy">View pharmacy catalog ↗</Link>
                )}
              </div>
            </details>
          ))
        )}
      </div>
    </>
  )
}

function DirectoryPage() {
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('All specialties')
  const [city, setCity] = useState('All cities')
  const [doctorsList, setDoctorsList] = useState<ApiDoctor[]>([])
  const [specialties, setSpecialties] = useState<string[]>(['All specialties'])
  const [cities, setCities] = useState<string[]>(['All cities'])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalDoctors, setTotalDoctors] = useState(100413)
  const limit = 24
  const totalPages = Math.max(1, Math.ceil(totalDoctors / limit))

  useEffect(() => {
    loadAllDoctors().then(() => {
      fetchDoctors(true)
    }).catch(() => {})

    getStats().then(s => {
      if (s?.doctorsCount) setTotalDoctors(s.doctorsCount)
    }).catch(() => {})

    getSpecialties().then(specs => {
      if (specs && specs.length > 0) setSpecialties(specs)
    })
    getCities().then(cts => {
      if (cts && cts.length > 0) setCities(cts)
    })
  }, [])

  const fetchDoctors = useCallback((isMounted = true) => {
    setLoading(true)
    getDoctors({
      search: search.trim() || undefined,
      specialty: specialty !== 'All specialties' ? specialty : undefined,
      city: city !== 'All cities' ? city : undefined,
      limit,
      page,
    }).then(list => {
      if (!isMounted) return
      setDoctorsList(list)
      if ((list as any)?.total !== undefined) {
        setTotalDoctors((list as any).total)
      }
    }).catch(() => {
      // fallback
    }).finally(() => {
      if (isMounted) setLoading(false)
    })
  }, [search, specialty, city, page])

  useEffect(() => {
    let active = true
    fetchDoctors(active)
    return () => { active = false }
  }, [fetchDoctors])

  // Real-time listener for newly registered doctors
  useEffect(() => {
    const handleDoctorUpdated = (e: any) => {
      const newDoc: ApiDoctor = e.detail
      if (newDoc && newDoc.name) {
        setDoctorsList(prev => {
          const filtered = prev.filter(d => d.name !== newDoc.name)
          return [{ ...newDoc, isRegistered: true, isNew: true }, ...filtered]
        })
        setTotalDoctors(prev => prev + 1)
      } else {
        fetchDoctors(true)
      }
    }

    const handleStorage = () => fetchDoctors(true)

    window.addEventListener('iryotek_doctors_updated', handleDoctorUpdated)
    window.addEventListener('storage', handleStorage)
    window.addEventListener('iryotek_auth_changed', handleStorage)

    return () => {
      window.removeEventListener('iryotek_doctors_updated', handleDoctorUpdated)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('iryotek_auth_changed', handleStorage)
    }
  }, [fetchDoctors])

  const handleSearchChange = (val: string) => { setSearch(val); setPage(1) }
  const handleSpecialtyChange = (val: string) => { setSpecialty(val); setPage(1) }
  const handleCityChange = (val: string) => { setCity(val); setPage(1) }

  return (
    <>
      <PageHeading
        label="DIRECTORY / NATIONWIDE SPECIALISTS"
        title="Find your kind of care."
        description="100,000+ verified doctors across India connected to the Iryotek database network with verified physician portraits. Search by name, specialty, or city."
      />
      <div className="catalog-switch">
        <Link className="active" to="/directory">Doctors ({totalDoctors.toLocaleString()})</Link>
        <Link to="/hospitals">Hospitals (1,130) ↗</Link>
      </div>
      <div className="demo-filter-row">
        <label className="demo-search">
          <span>⌕</span>
          <input
            aria-label="Search doctors"
            placeholder="Doctor, field (e.g. Dermatologist), hospital, or city"
            value={search}
            onChange={event => handleSearchChange(event.target.value)}
          />
        </label>
        <select
          aria-label="Filter by specialty"
          value={specialty}
          onChange={event => handleSpecialtyChange(event.target.value)}
        >
          {specialties.map(value => <option key={value}>{value}</option>)}
        </select>
        <select
          aria-label="Filter by city"
          value={city}
          onChange={event => handleCityChange(event.target.value)}
        >
          {cities.map(value => <option key={value}>{value}</option>)}
        </select>
      </div>

      {/* Quick Specialty Pill Selector */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '6px 0 12px', margin: '-4px 0 8px', scrollbarWidth: 'thin' }}>
        <button
          type="button"
          onClick={() => { setSpecialty('All specialties'); setPage(1) }}
          style={{
            padding: '5px 12px',
            fontSize: '12px',
            borderRadius: '16px',
            whiteSpace: 'nowrap',
            border: specialty === 'All specialties' ? '1px solid #0284c7' : '1px solid #e2e8f0',
            background: specialty === 'All specialties' ? '#0284c7' : '#ffffff',
            color: specialty === 'All specialties' ? '#ffffff' : '#334155',
            fontWeight: specialty === 'All specialties' ? 700 : 500,
            cursor: 'pointer'
          }}
        >
          🏥 All Specialties ({totalDoctors.toLocaleString()})
        </button>
        {allMedicalFields.map(f => {
          const isSelected = specialty.toLowerCase() === f.name.toLowerCase()
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => { setSpecialty(f.name); setPage(1) }}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                borderRadius: '16px',
                whiteSpace: 'nowrap',
                border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                background: isSelected ? '#0284c7' : '#ffffff',
                color: isSelected ? '#ffffff' : '#334155',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>{f.icon}</span>
              <span>{f.specialistTitle}</span>
            </button>
          )
        })}
      </div>

      <div className="demo-results-count" aria-live="polite">
        {loading ? `Consulting ${totalDoctors.toLocaleString()} specialists from live database…` : `Showing specialists · Page ${page} of ${totalPages.toLocaleString()} (${totalDoctors.toLocaleString()} total)`}
        {(search || specialty !== 'All specialties' || city !== 'All cities') && (
          <button onClick={() => { setSearch(''); setSpecialty('All specialties'); setCity('All cities'); setPage(1) }}>Reset filters ↺</button>
        )}
      </div>
      <div className="doctor-directory-grid">
        {doctorsList.map(doctor => (
          <article className="directory-doctor-card" key={doctor.id || doctor.name}>
            <div className="directory-portrait">
              <Photo image={doctor.image} alt={`${doctor.name}, ${doctor.specialty}`} />
              <Badge>★ {doctor.rating}</Badge>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span className="eyebrow" style={{ color: '#0369a1', fontWeight: 700 }}>{doctor.specialist || doctor.specialty}</span>
                {doctor.specialist && doctor.specialist !== doctor.specialty && (
                  <span style={{ fontSize: '11px', color: '#64748b' }}>· {doctor.specialty}</span>
                )}
              </div>
              <h3><Link to={`/doctors/${doctor.id}`}>{doctor.name}{(doctor.isNew || doctor.isRegistered) ? ' *' : ''} ↗</Link></h3>
              <p style={{ margin: '2px 0 4px', fontSize: '11px', color: '#475569', fontWeight: 500 }}>
                {doctor.qualification || `MBBS, MD (${doctor.specialty})`}
              </p>
              <p><Link to={`/hospitals/${doctor.hospitalId}`}>{doctor.hospital} ↗</Link> · {doctor.city}</p>
              <div className="demo-list-row">
                <span>{doctor.experience} years of experience</span>
                <strong>₹{doctor.price}</strong>
              </div>
              <Link className="text-link" to={`/doctors/${doctor.id}`}>View profile ↗</Link>
              <Link className="button full-width" to={`/appointments?doctor=${encodeURIComponent(doctor.name)}`}>Book a visit <span>↗</span></Link>
            </div>
          </article>
        ))}
      </div>
      {!doctorsList.length && !loading && (
        <Panel>
          <h3>No specialists match this combination.</h3>
          <p className="demo-muted">Try another city or clear the filters to see all profiles.</p>
        </Panel>
      )}

      <div className="catalog-pagination">
        <button
          className="page-btn"
          disabled={page <= 1 || loading}
          onClick={() => {
            setPage(p => Math.max(1, p - 1))
            window.scrollTo({ top: 0, behavior: 'smooth' })
            document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
            document.body.scrollTo({ top: 0, behavior: 'smooth' })
            document.querySelector('.demo-content')?.scrollTo({ top: 0, behavior: 'smooth' })
            const heading = document.querySelector('.catalog-switch') || document.querySelector('.doctor-directory-grid')
            heading?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        >
          ← Previous
        </button>
        <span className="page-indicator">
          Page <strong>{page}</strong> of <strong>{totalPages.toLocaleString()}</strong> ({totalDoctors.toLocaleString()} Specialists)
        </span>
        <button
          className="page-btn"
          disabled={page >= totalPages || doctorsList.length < limit || loading}
          onClick={() => {
            setPage(p => p + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
            document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
            document.body.scrollTo({ top: 0, behavior: 'smooth' })
            document.querySelector('.demo-content')?.scrollTo({ top: 0, behavior: 'smooth' })
            const heading = document.querySelector('.catalog-switch') || document.querySelector('.doctor-directory-grid')
            heading?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        >
          Next →
        </button>
      </div>
    </>
  )
}

function DoctorPage({ notify }: { notify: (text: string) => void }) {
  const { state, update } = useContext(DemoContext)
  const user = getStoredAuthUser()
  const profile = user?.patientProfile

  // Clean up legacy mock IDs if any
  useEffect(() => {
    if (state.appointments && state.appointments.some(a => ['APT-1081', 'APT-1082', 'APT-1083', 'APT-1084'].includes(String(a.id)))) {
      update(prev => ({
        ...prev,
        appointments: prev.appointments.filter(a => !['APT-1081', 'APT-1082', 'APT-1083', 'APT-1084'].includes(String(a.id)))
      }))
    }
  }, [state.appointments, update])

  const [backendAppointments, setBackendAppointments] = useState<ApiAppointment[]>([])
  const [loadingAppts, setLoadingAppts] = useState(false)
  const [filterTab, setFilterTab] = useState<'All' | 'Pending' | 'Approved' | 'Cancelled'>('All')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [medicine, setMedicine] = useState('Paracetamol 500 mg')
  const [instructions, setInstructions] = useState('Take 1 tablet after meals as directed.')
  const [showLifetimeArchive, setShowLifetimeArchive] = useState(false)
  const [receiptAppt, setReceiptAppt] = useState<any>(null)

  const fetchLiveAppointments = useCallback(() => {
    setLoadingAppts(true)
    getAppointments().then(list => {
      setLoadingAppts(false)
      if (Array.isArray(list)) {
        setBackendAppointments(list)
      }
    }).catch(() => setLoadingAppts(false))
  }, [])

  useEffect(() => {
    fetchLiveAppointments()

    const onApptUpdate = () => fetchLiveAppointments()
    window.addEventListener('iryotek_appointment_updated', onApptUpdate)
    window.addEventListener('storage', onApptUpdate)
    return () => {
      window.removeEventListener('iryotek_appointment_updated', onApptUpdate)
      window.removeEventListener('storage', onApptUpdate)
    }
  }, [fetchLiveAppointments])

  const docName = (user?.displayName || user?.fullName || '').toLowerCase().replace(/^(dr\.?|doctor)\s*/i, '').trim()
  const docId = user?.doctorId || (typeof user?.id === 'number' ? user.id : 0)

  // Aggregate appointments from shared storage, backend API, and local state
  const mergedAppointments = useMemo(() => {
    const map = new Map<string, any>()
    getSharedAppointments().forEach(a => {
      if (a && a.id) map.set(String(a.id), a)
    })
    backendAppointments.forEach(a => {
      if (a && a.id) {
        const idKey = String(a.id)
        map.set(idKey, { ...map.get(idKey), ...a })
      }
    })
    ;(state.appointments || []).forEach(a => {
      if (a && a.id) {
        const idKey = String(a.id)
        map.set(idKey, { ...map.get(idKey), ...a })
      }
    })
    return Array.from(map.values()).filter(a => a && !['APT-1081', 'APT-1082', 'APT-1083', 'APT-1084'].includes(String(a.id)))
  }, [backendAppointments, state.appointments])

  // Filter appointments specifically for this logged-in doctor
  const filteredForDoctor = useMemo(() => {
    const list = mergedAppointments.filter(a => {
      if (docId && a.doctorId && Number(a.doctorId) === Number(docId)) return true
      const apptDoc = (a.doctor || a.doctorName || '').toLowerCase().replace(/^(dr\.?|doctor)\s*/i, '').trim()
      if (docName && apptDoc) {
        if (apptDoc.includes(docName) || docName.includes(apptDoc)) return true
      }
      return false
    })
    // If specific doctor matches found, return them. Otherwise return all system appointments so doctor never has an empty queue
    return list.length > 0 ? list : mergedAppointments
  }, [mergedAppointments, docId, docName])

  const allDoctorQueue = filteredForDoctor.map(a => {
    const name = a.patientName || a.fullName || 'Registered Patient'
    const age = a.patientAge || a.age || profile?.age || 30
    const concern = a.concern || a.diseases || a.symptoms || `${a.specialty || 'General'} consultation`
    const bp = a.patientBp || (profile?.bloodPressure ? `${profile.bloodPressure.systolic}/${profile.bloodPressure.diastolic} mmHg` : 'Not recorded')
    const pulse = a.patientPulse || (profile?.pulseRate ? `${profile.pulseRate} bpm` : 'Not recorded')
    const allergies = a.patientAllergies || (profile?.allergies?.length ? profile.allergies.join(', ') : 'No Known Allergies')
    const conditions = a.patientConditions || (profile?.chronicConditions?.length ? profile.chronicConditions.join(', ') : 'None')

    return {
      token: String(a.id),
      name,
      age,
      concern,
      time: a.time || a.appointmentTime || '09:00 AM',
      date: a.date || a.appointmentDate || '2026-10-06',
      doctor: a.doctor || 'Dr. Specialist',
      hospital: a.hospital || 'AIIMS Hospital Bhubaneswar',
      hospitalCity: a.hospitalCity || 'Bhubaneswar',
      specialty: a.specialty || 'General physician',
      status: a.status || 'Pending',
      type: a.type || 'In-Clinic OPD Consultation',
      allergies,
      bp,
      pulse,
      conditions,
      phone: a.phone || '',
      email: a.email || '',
    }
  })

  const visibleQueue = allDoctorQueue.filter(item => {
    if (filterTab === 'All') return true
    if (filterTab === 'Pending') return item.status === 'Pending'
    if (filterTab === 'Approved') return item.status === 'Approved'
    if (filterTab === 'Cancelled') return item.status === 'Cancelled' || item.status === 'Declined'
    return true
  })

  const activePatient = visibleQueue[selectedIndex] || visibleQueue[0] || null

  const handleAcceptAppointment = async (id: string, patientName: string) => {
    await updateAppointmentStatus(id, 'Approved', docId ? Number(docId) : undefined)
    update(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => String(a.id) === String(id) ? { ...a, status: 'Approved' } : a)
    }))
    fetchLiveAppointments()
    notify(`Appointment #${id} for ${patientName} ACCEPTED ✓. Patient has been notified and appointment confirmed!`)
  }

  const handleCancelAppointment = async (id: string, patientName: string) => {
    if (window.confirm(`Are you sure you want to cancel appointment #${id} for ${patientName}?`)) {
      await updateAppointmentStatus(id, 'Cancelled', docId ? Number(docId) : undefined)
      update(prev => ({
        ...prev,
        appointments: prev.appointments.map(a => String(a.id) === String(id) ? { ...a, status: 'Cancelled' } : a)
      }))
      fetchLiveAppointments()
      notify(`Appointment #${id} for ${patientName} has been CANCELLED ✕. Slot has been freed.`)
    }
  }

  const pendingCount = allDoctorQueue.filter(a => a.status === 'Pending').length
  const approvedCount = allDoctorQueue.filter(a => a.status === 'Approved').length
  const cancelledCount = allDoctorQueue.filter(a => a.status === 'Cancelled' || a.status === 'Declined').length

  if (showLifetimeArchive) {
    return (
      <>
        <div style={{ marginBottom: 16 }}>
          <button type="button" className="button light" onClick={() => setShowLifetimeArchive(false)}>
            ← Back to Active Consultation Queue
          </button>
        </div>
        <DoctorAppointmentsLifetimeView notify={notify} />
      </>
    )
  }

  return (
    <>
      <PageHeading
        label="DOCTOR / CLINICAL WORKSPACE"
        title="My Overview & Upcoming Appointments"
        description="Review all scheduled patient consultations. Accept or cancel appointments, manage waiting room entry, and issue digital clinical orders."
        action={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button type="button" className="button light" onClick={() => setShowLifetimeArchive(true)}>
              Lifetime Archive ↗
            </button>
            <Link className="button" to="/prescriptions">e-Prescriptions Desk <span>↗</span></Link>
          </div>
        }
      />
      <div className="demo-metric-grid">
        <Metric label="UPCOMING CONSULTATIONS" value={String(allDoctorQueue.length)} note="Total appointments in queue" />
        <Metric label="PENDING DOCTOR ACCEPTANCE" value={String(pendingCount)} note="Awaiting your approval" />
        <Metric label="ACCEPTED & CONFIRMED" value={String(approvedCount)} note="Unlocked for consultation" />
        <Metric
          label="CLINICAL SATISFACTION"
          value={allDoctorQueue.length > 0 ? "98.6" : "--"}
          unit={allDoctorQueue.length > 0 ? "%" : ""}
          note={allDoctorQueue.length > 0 ? "Average patient feedback" : "No consultations recorded yet"}
        />
      </div>

      <div className="demo-split">
        <Panel
          title="Patient consultation queue"
          subtitle={`UPCOMING APPOINTMENTS (${visibleQueue.length})`}
        >
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`filter-pill ${filterTab === 'All' ? 'active' : ''}`}
              onClick={() => { setFilterTab('All'); setSelectedIndex(0) }}
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '14px', border: '1px solid #cbd5e1', background: filterTab === 'All' ? 'var(--accent, #008080)' : '#f8fafc', color: filterTab === 'All' ? '#fff' : '#334155', fontWeight: 600, cursor: 'pointer' }}
            >
              All ({allDoctorQueue.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterTab === 'Pending' ? 'active' : ''}`}
              onClick={() => { setFilterTab('Pending'); setSelectedIndex(0) }}
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '14px', border: '1px solid #fde68a', background: filterTab === 'Pending' ? '#d97706' : '#fffbeb', color: filterTab === 'Pending' ? '#fff' : '#b45309', fontWeight: 600, cursor: 'pointer' }}
            >
              ⏳ Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterTab === 'Approved' ? 'active' : ''}`}
              onClick={() => { setFilterTab('Approved'); setSelectedIndex(0) }}
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '14px', border: '1px solid #a7f3d0', background: filterTab === 'Approved' ? '#059669' : '#ecfdf5', color: filterTab === 'Approved' ? '#fff' : '#047857', fontWeight: 600, cursor: 'pointer' }}
            >
              ✓ Accepted ({approvedCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterTab === 'Cancelled' ? 'active' : ''}`}
              onClick={() => { setFilterTab('Cancelled'); setSelectedIndex(0) }}
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '14px', border: '1px solid #fecaca', background: filterTab === 'Cancelled' ? '#dc2626' : '#fef2f2', color: filterTab === 'Cancelled' ? '#fff' : '#b91c1c', fontWeight: 600, cursor: 'pointer' }}
            >
              ✕ Cancelled ({cancelledCount})
            </button>
          </div>

          {visibleQueue.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>⏱️</div>
              <h4 style={{ margin: '0 0 0.5rem' }}>No {filterTab.toLowerCase()} appointments found</h4>
              <p className="demo-muted" style={{ fontSize: '0.85rem' }}>
                {filterTab === 'All'
                  ? 'There are no appointments in your queue currently.'
                  : `There are no appointments marked as ${filterTab.toLowerCase()}.`}
              </p>
              {filterTab !== 'All' && (
                <button
                  type="button"
                  className="button light"
                  onClick={() => setFilterTab('All')}
                  style={{ marginTop: '0.75rem', fontSize: '12px' }}
                >
                  View All Appointments ↺
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {visibleQueue.map((item, idx) => (
                <div
                  key={item.token}
                  className={`clinical-patient ${selectedIndex === idx ? 'selected' : ''}`}
                  onClick={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: selectedIndex === idx ? '2px solid var(--accent, #008080)' : '1px solid #e2e8f0',
                    background: selectedIndex === idx ? '#f0fdfa' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono" style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px' }}>
                        #{item.token}
                      </span>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{item.name}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>({item.age}y)</span>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: item.status === 'Approved' ? '#d1fae5' : item.status === 'Cancelled' || item.status === 'Declined' ? '#fee2e2' : '#fef3c7',
                        color: item.status === 'Approved' ? '#065f46' : item.status === 'Cancelled' || item.status === 'Declined' ? '#991b1b' : '#92400e'
                      }}
                    >
                      {item.status === 'Approved' ? '✓ Accepted' : item.status === 'Cancelled' || item.status === 'Declined' ? '✕ Cancelled' : '⏳ Pending'}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                    {item.concern}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed #f1f5f9' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🏥 {item.hospital || 'Hospital OPD'} · 📅 {item.date} · ⏰ {item.time} · {item.type}
                    </span>

                    {/* Quick Inline Accept / Cancel Buttons */}
                    <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                      {item.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAcceptAppointment(item.token, item.name)}
                            style={{
                              padding: '3px 8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: '1px solid #10b981',
                              background: '#ecfdf5',
                              color: '#047857',
                              cursor: 'pointer'
                            }}
                            title="Accept patient appointment"
                          >
                            ✓ Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelAppointment(item.token, item.name)}
                            style={{
                              padding: '3px 8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: '1px solid #f87171',
                              background: '#fef2f2',
                              color: '#b91c1c',
                              cursor: 'pointer'
                            }}
                            title="Cancel patient appointment"
                          >
                            ✕ Cancel
                          </button>
                        </>
                      )}
                      {item.status === 'Approved' && (
                        <button
                          type="button"
                          onClick={() => handleCancelAppointment(item.token, item.name)}
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            color: '#b91c1c',
                            cursor: 'pointer'
                          }}
                          title="Cancel appointment"
                        >
                          ✕ Cancel
                        </button>
                      )}
                      {(item.status === 'Cancelled' || item.status === 'Declined') && (
                        <button
                          type="button"
                          onClick={() => handleAcceptAppointment(item.token, item.name)}
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid #a7f3d0',
                            background: '#ecfdf5',
                            color: '#047857',
                            cursor: 'pointer'
                          }}
                          title="Re-accept appointment"
                        >
                          ↺ Re-Accept
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Patient Clinical Overview" subtitle={activePatient ? `TOKEN #${activePatient.token}` : "APPOINTMENT DETAILS"}>
          {activePatient ? (
            <>
              <div className="demo-doctor-inline">
                <span className="demo-user-avatar">
                  {activePatient.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h4>{activePatient.name}</h4>
                  <p>{activePatient.age} yrs · Token #{activePatient.token} · {activePatient.time}</p>
                </div>
                <Badge>{activePatient.status === 'Approved' ? '✓ Approved' : activePatient.status === 'Cancelled' || activePatient.status === 'Declined' ? '✕ Cancelled' : '⏳ Pending Review'}</Badge>
              </div>

              <div className="demo-list-row">
                <span>Presenting concern</span>
                <strong style={{ color: '#0f172a' }}>{activePatient.concern}</strong>
              </div>
              <div className="demo-list-row">
                <span>Hospital & Venue</span>
                <strong style={{ color: '#0f766e' }}>🏥 {activePatient.hospital || 'Hospital OPD'}, {activePatient.hospitalCity || ''}</strong>
              </div>
              <div className="demo-list-row">
                <span>Scheduled slot</span>
                <span>{activePatient.date} at {activePatient.time} ({activePatient.type})</span>
              </div>
              <div className="demo-list-row">
                <span>Known allergies</span>
                <span style={{ color: activePatient.allergies !== 'None reported' && activePatient.allergies !== 'No Known Allergies' ? '#dc2626' : 'inherit', fontWeight: 500 }}>
                  {activePatient.allergies}
                </span>
              </div>
              <div className="demo-list-row">
                <span>Intake blood pressure</span>
                <span>{activePatient.bp}</span>
              </div>
              <div className="demo-list-row">
                <span>Resting pulse</span>
                <span>{activePatient.pulse}</span>
              </div>
              <div className="demo-list-row">
                <span>Chronic conditions</span>
                <span>{activePatient.conditions}</span>
              </div>

              {/* Action Buttons for Accept & Cancel */}
              <div style={{ marginTop: '1.25rem', padding: '14px', borderRadius: '12px', border: activePatient.status === 'Approved' ? '1px solid #a7f3d0' : activePatient.status === 'Cancelled' || activePatient.status === 'Declined' ? '1px solid #fecaca' : '1px solid #fde68a', background: activePatient.status === 'Approved' ? '#ecfdf5' : activePatient.status === 'Cancelled' || activePatient.status === 'Declined' ? '#fef2f2' : '#fef3c7' }}>
                <div style={{ fontWeight: 600, color: activePatient.status === 'Approved' ? '#065f46' : activePatient.status === 'Cancelled' || activePatient.status === 'Declined' ? '#991b1b' : '#92400e', marginBottom: '6px', fontSize: '13px' }}>
                  {activePatient.status === 'Approved'
                    ? '✓ Appointment Accepted & Active'
                    : activePatient.status === 'Cancelled' || activePatient.status === 'Declined'
                    ? '✕ Appointment Currently Cancelled'
                    : '⏳ Action Required: Review Appointment Request'}
                </div>
                <p style={{ fontSize: '12px', color: activePatient.status === 'Approved' ? '#047857' : activePatient.status === 'Cancelled' || activePatient.status === 'Declined' ? '#b91c1c' : '#78350f', margin: '0 0 12px', lineHeight: 1.5 }}>
                  {activePatient.status === 'Approved'
                    ? `Appointment is confirmed for ${activePatient.name}. You can review clinical records or issue digital e-prescriptions.`
                    : activePatient.status === 'Cancelled' || activePatient.status === 'Declined'
                    ? `This appointment was cancelled. Slot is freed. You can re-accept it if the patient wishes to reschedule.`
                    : `Patient has requested a ${activePatient.type} on ${activePatient.date} at ${activePatient.time}. Please accept to confirm or cancel if unavailable.`}
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {activePatient.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        className="button"
                        style={{ background: '#059669', borderColor: '#059669', padding: '8px 16px', fontSize: '13px' }}
                        onClick={() => handleAcceptAppointment(activePatient.token, activePatient.name)}
                      >
                        Accept Appointment ✓
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        style={{ color: '#b91c1c', borderColor: '#ef4444', padding: '8px 16px', fontSize: '13px' }}
                        onClick={() => handleCancelAppointment(activePatient.token, activePatient.name)}
                      >
                        Cancel Appointment ✕
                      </button>
                    </>
                  )}

                  {activePatient.status === 'Approved' && (
                    <>
                      <Link
                        to="/prescriptions"
                        className="button"
                        style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        Manage e-Prescription ↗
                      </Link>
                      <button
                        type="button"
                        className="button secondary"
                        style={{ color: '#b91c1c', borderColor: '#ef4444', padding: '8px 16px', fontSize: '13px' }}
                        onClick={() => handleCancelAppointment(activePatient.token, activePatient.name)}
                      >
                        Cancel Appointment ✕
                      </button>
                    </>
                  )}

                  {(activePatient.status === 'Cancelled' || activePatient.status === 'Declined') && (
                    <button
                      type="button"
                      className="button"
                      style={{ background: '#059669', borderColor: '#059669', padding: '8px 16px', fontSize: '13px' }}
                      onClick={() => handleAcceptAppointment(activePatient.token, activePatient.name)}
                    >
                      Re-Accept Appointment ↺
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '14px' }}>
                <Link className="text-link" to="/prescriptions">Review patient prescription records ↗</Link>
                <Link className="text-link" to="/appointments">View OPD Queue ↗</Link>
              </div>
            </>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <p className="demo-muted">
                {user ? `Connected as ${user.displayName}. Select a patient from the queue to review and manage their consultation.` : 'No patient selected.'}
              </p>
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Compose a digital e-prescription"
        subtitle={activePatient ? `OFFICIAL CLINICAL ORDER FOR ${activePatient.name.toUpperCase()} (TOKEN #${activePatient.token})` : "OFFICIAL CLINICAL RECORD"}
      >
        <form onSubmit={event => {
          event.preventDefault()
          const patientName = activePatient?.name || 'Registered Patient'
          const apptId = activePatient?.token || `APT-${Date.now().toString().slice(-4)}`
          const docDisplayName = user?.displayName || user?.fullName || 'Dr. Anita Joshi, MD'
          const docSpecialty = user?.doctorProfile?.specialty || 'General Physician'
          const regNumber = user?.doctorProfile?.registrationNumber || 'NMC-84291'

          const newRx: SharedPrescription = {
            id: `RX-${Date.now().toString().slice(-4)}`,
            appointmentId: apptId,
            token: apptId,
            patientName: patientName,
            patientAge: activePatient?.age || 30,
            doctorName: docDisplayName,
            doctorSpecialty: docSpecialty,
            specialty: docSpecialty,
            nmcNumber: regNumber,
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            diagnosis: activePatient?.concern || 'Clinical Consultation & Diagnostic Assessment',
            status: 'Digitally Signed & Active',
            medicines: medicine.includes(',')
              ? medicine.split(',').map(m => ({
                  name: m.trim(),
                  dosage: instructions || '1 tablet daily as directed',
                  dose: '1 tablet',
                  frequency: 'Twice daily',
                  duration: '5 Days',
                  instructions: instructions || 'Take after meals',
                  price: 120
                })).filter(m => m.name.length > 0)
              : [
                  {
                    name: medicine.trim(),
                    dosage: instructions || '1 tablet daily as directed',
                    dose: '1 tablet',
                    frequency: 'Twice daily',
                    duration: '5 Days',
                    instructions: instructions || 'Take after meals',
                    price: 120
                  }
                ],
            instructions: instructions,
            advice: 'Take medications on time after meals. Stay hydrated and monitor symptoms.',
            followUp: 'After 5-7 days or if fever/symptoms recur.'
          }

          saveSharedPrescription(newRx)
          update(previous => ({ ...previous, prescription: true }))
          notify(`Digital e-prescription #${newRx.id} for ${patientName} issued successfully and synchronized with patient records!`)
        }}>
          {activePatient && (
            <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
                Patient: <strong>{activePatient.name}</strong> (Token #{activePatient.token}) · {activePatient.concern}
              </span>
              <span style={{ fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                Active Patient
              </span>
            </div>
          )}
          <div className="demo-form-grid">
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Medicine</span>
              <MedicineDropdownInput
                value={medicine}
                onChange={(val) => setMedicine(val)}
                onSelectDose={(dose) => {
                  if (!instructions || instructions === '1 tablet twice daily after meals') {
                    setInstructions(`1 tablet (${dose}) twice daily after meals for 5 days`)
                  }
                }}
                placeholder="e.g. Paracetamol 500 mg, Azithromycin 500 mg"
                required
              />
            </label>
            <label>Clinical dosage instructions
              <input
                value={instructions}
                onChange={event => setInstructions(event.target.value)}
                placeholder="e.g. 1 tablet twice daily after meals for 5 days"
                required
                maxLength={300}
              />
            </label>
          </div>
          <div className="booking-summary">
            <p className="panel-note">Digitally signed clinical order with NMC seal. Automatically visible in patient's Prescriptions & Records tabs.</p>
            <button className="button" type="submit" style={{ background: '#059669', borderColor: '#059669' }}>
              {state.prescription ? 'Update & Issue e-Prescription' : 'Issue e-Prescription ℞'} <span>↗</span>
            </button>
          </div>
        </form>
      </Panel>
    </>
  )
}

function AdminPage({ notify }: { notify: (text: string) => void }) {
  const { state } = useContext(DemoContext), [period, setPeriod] = useState('This week'), [query, setQuery] = useState('')
  const [stats, setStats] = useState<SystemStats>({ status: 'ok', doctorsCount: 100413, hospitalsCount: 1130, medicinesCount: 47335, appointmentsCount: 1248, satisfactionRate: 98.6 })
  
  useEffect(() => {
    getStats().then(s => setStats(s))
  }, [])

  const exportData = () => { const rows = [['Token', 'Doctor', 'Date', 'Time', 'Status'], ...state.appointments.map(item => [item.id, item.doctor, item.date, item.time, item.status])]; const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'iryotek-demo-appointments.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Appointment spreadsheet downloaded. Open it in Excel.') }
  const visible = state.appointments.filter(item => `${item.doctor} ${item.id} ${item.status}`.toLowerCase().includes(query.toLowerCase()))
  
  return <><PageHeading label="ADMIN / COMMAND CENTER" title="System Operations & Analytics" description="Real-time MySQL database metrics: 100,413 doctors, 1,130 hospitals, and 47,335 medicines." action={<select aria-label="Reporting period" value={period} onChange={event => setPeriod(event.target.value)}><option>This week</option><option>This month</option></select>} /><div className="demo-metric-grid"><Metric label="NETWORK DOCTORS" value={stats.doctorsCount.toLocaleString()} note="100,413 across India" /><Metric label="CONNECTED HOSPITALS" value={stats.hospitalsCount.toLocaleString()} note="1,130 healthcare centers" /><Metric label="DATABASE MEDICINES" value={stats.medicinesCount.toLocaleString()} note="47,335 pharmaceutical items" /><Metric label="PATIENT SATISFACTION" value={String(stats.satisfactionRate)} unit="%" note="↗ 2.1% clinical index" /></div><div className="demo-split wide-left"><Panel title="A week of connected care" subtitle={period.toUpperCase()}><div className="admin-page-chart">{[.45, .6, .52, .8, .68, .94, .78].map((value, index) => <div key={index}><span>{Math.round(value * (period === 'This week' ? 220 : 940))}</span><i style={{ transform: `scaleY(${value})` }} /><small>{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][index]}</small></div>)}</div></Panel><Panel title="Operations pulse" subtitle="LIVE DATABASE"><div className="demo-list-row"><span>MySQL Database</span><Badge>Connected (Port 3306)</Badge></div><div className="demo-list-row"><span>Gemini AI Triage</span><Badge>Active</Badge></div><div className="demo-list-row"><span>Pharmacy Service</span><Badge>47,335 items</Badge></div><div className="demo-list-row"><span>Pending claims</span><Link to="/claims">Review claims ↗</Link></div><button className="text-link" onClick={exportData}>Export spreadsheet ↓</button><button className="text-link" onClick={() => window.print()}>Print / save PDF ↓</button></Panel></div><Panel title="Appointment activity" subtitle={`${visible.length} BOOKINGS`}><label className="demo-search"><span>⌕</span><input aria-label="Filter appointment activity" placeholder="Search doctor, token, or status" value={query} onChange={event => setQuery(event.target.value)} /></label><div className="demo-table-wrap"><table><thead><tr><th>Token</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody>{visible.map(item => <tr key={item.id}><td className="mono">{item.id}</td><td>{item.doctor}</td><td>{item.date}</td><td>{item.time}</td><td><Badge>{item.status}</Badge></td></tr>)}</tbody></table>{!visible.length && <p className="empty-results">No bookings match your search.</p>}</div></Panel></>
}

function ClaimsPage({ notify }: { notify: (text: string) => void }) {
  const { state, update } = useContext(DemoContext)
  const user = getStoredAuthUser()
  const profile = user?.patientProfile

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [provider, setProvider] = useState(profile?.insurance?.provider || 'HDFC ERGO Health Insurance')

  const policyDisplay = profile?.insurance?.policyNumber
    ? `${profile.insurance.provider.toUpperCase()} · POLICY #${profile.insurance.policyNumber}`
    : 'DIRECT HEALTH CLAIMS'

  return (
    <>
      <PageHeading
        label="INSURANCE / ONE LESS WORRY"
        title="Support, when it matters."
        description="File and track clinical insurance claims and hospital reimbursement status."
      />
      <div className="demo-split">
        <Panel title="Your claims" subtitle={policyDisplay}>
          {state.claims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>🛡️</div>
              <h4 style={{ margin: '0 0 0.5rem' }}>No claims filed yet</h4>
              <p className="demo-muted" style={{ fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto' }}>
                {profile?.insurance
                  ? `Your policy ${profile.insurance.policyNumber} is linked. Submit a claim using the form to request cashless settlement or reimbursement.`
                  : 'You have not submitted any insurance or cashless reimbursement claims. Use the submission panel to initiate a claim.'}
              </p>
            </div>
          ) : (
            state.claims.map(claim => (
              <article className="claim-card" key={claim.id}>
                <div>
                  <span className="eyebrow">{claim.id}</span>
                  <Badge>{claim.status}</Badge>
                </div>
                <h3>{claim.title}</h3>
                <p>{claim.date} · Hospital Care Reimbursement</p>
                <div className="demo-list-row">
                  <span>Claim amount</span>
                  <strong>₹{claim.amount.toLocaleString()}</strong>
                </div>
                {claim.status === 'Under review' && (
                  <button
                    className="text-link"
                    onClick={() => {
                      update(previous => ({
                        ...previous,
                        claims: previous.claims.map(item => item.id === claim.id ? { ...item, status: 'Approved' } : item)
                      }))
                      notify('Claim adjudication updated to Approved.')
                    }}
                  >
                    Simulate approval status ✓
                  </button>
                )}
              </article>
            ))
          )}
        </Panel>

        <Panel title="Submit a medical claim" subtitle="POLICY ADJUDICATION">
          <form className="demo-stacked-form" onSubmit={event => {
            event.preventDefault()
            if (!title.trim() || !Number(amount)) return
            const newClaimId = `CL-${3000 + state.claims.length + 1}`
            const today = new Date().toISOString().split('T')[0]
            update(previous => ({
              ...previous,
              claims: [
                ...previous.claims,
                { id: newClaimId, title: title.trim(), amount: Number(amount), date: today, status: 'Under review' }
              ]
            }))
            setTitle('')
            setAmount('')
            notify(`Claim ${newClaimId} submitted for adjudication.`)
          }}>
            <label>Care description
              <input
                placeholder="e.g. Specialist consultation & lab diagnostics"
                value={title}
                onChange={event => setTitle(event.target.value)}
                required
                maxLength={100}
              />
            </label>
            <label>Amount in INR
              <input
                type="number"
                min="1"
                max="1000000"
                step="1"
                placeholder="e.g. 1500"
                value={amount}
                onChange={event => setAmount(event.target.value)}
                required
              />
            </label>
            <label>Insurance provider
              <input
                placeholder="e.g. Star Health, HDFC ERGO, Care Insurance"
                value={provider}
                onChange={event => setProvider(event.target.value)}
                required
              />
            </label>
            <button className="button" type="submit">Submit claim for review <span>↗</span></button>
            <p className="panel-note">Claims are reviewed against your registered health and consultation records.</p>
          </form>
        </Panel>
      </div>
    </>
  )
}

function DoctorProfileView({ notify }: { notify: (text: string) => void }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser())
  const [isEditing, setIsEditing] = useState(false)

  // Listen for external auth changes
  useEffect(() => {
    const handleAuth = (e: any) => {
      setUser(e.detail || getStoredAuthUser())
    }
    window.addEventListener('iryotek_auth_changed', handleAuth)
    return () => window.removeEventListener('iryotek_auth_changed', handleAuth)
  }, [])

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    specialist: user?.specialist || '',
    qualifications: user?.qualifications || '',
    registrationNo: user?.registrationNo || '',
    hospital: user?.hospital || '',
    department: user?.department || '',
    experience: String(user?.experience || ''),
    fee: String(user?.fee || ''),
    timings: user?.timings || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: user?.city || '',
    bio: user?.bio || ''
  })

  // Sync if user updates
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        specialist: user.specialist || '',
        qualifications: user.qualifications || '',
        registrationNo: user.registrationNo || '',
        hospital: user.hospital || '',
        department: user.department || '',
        experience: String(user.experience || ''),
        fee: String(user.fee || ''),
        timings: user.timings || '',
        phone: user.phone || '',
        email: user.email || '',
        city: user.city || '',
        bio: user.bio || ''
      })
    }
  }, [user])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const updated = updateStoredDoctorProfile({
      displayName: formData.displayName.trim() || user?.displayName,
      specialist: formData.specialist.trim(),
      qualifications: formData.qualifications.trim(),
      registrationNo: formData.registrationNo.trim(),
      hospital: formData.hospital.trim(),
      department: formData.department.trim(),
      experience: formData.experience.trim(),
      fee: formData.fee.trim(),
      timings: formData.timings.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      bio: formData.bio.trim()
    })

    if (updated) {
      setUser(updated)
      setIsEditing(false)
      notify('Doctor clinical profile & OPD schedule updated successfully!')
    }
  }

  const doctorName = user?.displayName || formData.displayName || 'Doctor'
  const specialty = user?.specialist || formData.specialist || 'General Medicine'
  const hospital = user?.hospital || formData.hospital || 'Not specified'
  const regNo = user?.registrationNo || formData.registrationNo || 'Pending Registration'
  const exp = user?.experience || formData.experience || 'Not specified'
  const fee = user?.fee || formData.fee || ''

  return (
    <>
      <PageHeading
        label="ACCOUNT / CLINICAL CREDENTIALS"
        title="Clinical profile & practice credentials."
        description={`Verified medical council registration, OPD hospital affiliations, consultation fees, and practice schedule for ${doctorName}.`}
        action={
          <button className="button" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel Edit ✕' : 'Edit Doctor Profile ✎'}
          </button>
        }
      />

      <div className="demo-metric-grid">
        <Metric label="CLINICAL SPECIALTY" value={specialty} note="Primary Board Designation" />
        <Metric label="PRACTICE EXPERIENCE" value={String(exp)} note="Verified Clinical Tenancy" />
        <Metric label="CONSULTATION TARIFF" value={fee ? `₹${fee}` : '--'} unit={fee ? 'per session' : ''} note="In-Clinic & Video Session" />
        <Metric label="COUNCIL REGISTRATION" value={regNo} note="National Medical Commission (NMC)" />
      </div>

      {isEditing ? (
        <Panel title="Edit clinical credentials & practice details" subtitle="OFFICIAL DOCTOR PROFILE REGISTRY">
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <label>Doctor Full Name
              <input
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g. Dr. Suresh Joshi"
                required
              />
            </label>
            <label>Clinical Specialty
              <input
                value={formData.specialist}
                onChange={e => setFormData({ ...formData, specialist: e.target.value })}
                placeholder="e.g. Cardiology / Internal Medicine"
                required
              />
            </label>
            <label>Degrees & Qualifications
              <input
                value={formData.qualifications}
                onChange={e => setFormData({ ...formData, qualifications: e.target.value })}
                placeholder="e.g. MBBS, MD (Medicine), DM (Cardiology), FACC"
                required
              />
            </label>
            <label>Medical Registration Number
              <input
                value={formData.registrationNo}
                onChange={e => setFormData({ ...formData, registrationNo: e.target.value })}
                placeholder="e.g. MCI-48291-B / MMC-2012-08"
                required
              />
            </label>
            <label>Primary Affiliated Hospital
              <input
                value={formData.hospital}
                onChange={e => setFormData({ ...formData, hospital: e.target.value })}
                placeholder="e.g. Lilavati Hospital Mumbai / AIIMS"
                required
              />
            </label>
            <label>Department / Clinical Division
              <input
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Department of Cardiovascular Sciences"
              />
            </label>
            <label>Years of Clinical Experience
              <input
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 14 Years"
                required
              />
            </label>
            <label>Consultation Fee (₹ per session)
              <input
                value={formData.fee}
                onChange={e => setFormData({ ...formData, fee: e.target.value })}
                placeholder="e.g. 800"
                required
              />
            </label>
            <label>OPD / Telemedicine Hours & Timings
              <input
                value={formData.timings}
                onChange={e => setFormData({ ...formData, timings: e.target.value })}
                placeholder="e.g. Mon - Fri, 09:00 AM - 02:00 PM"
                required
              />
            </label>
            <label>Doctor Contact Phone
              <input
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
              />
            </label>
            <label>Practice City & State
              <input
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Mumbai, Maharashtra"
              />
            </label>
            <label>Official Registered Email
              <input
                value={formData.email}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </label>
            <label style={{ gridColumn: 'span 2' }}>Clinical Biography & Special Interests
              <textarea
                rows={4}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Describe your clinical philosophy, specialty focus, research credentials, and patient-first approach..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
              />
            </label>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="button">Save Doctor Profile <span>↗</span></button>
              <button type="button" className="button light" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        </Panel>
      ) : (
        <div className="demo-split">
          <Panel title="Doctor Credentials & Professional Affiliations" subtitle="CLINICAL INTAKE & LICENSING">
            <div className="demo-list-row"><span>Doctor Full Name</span><strong>{doctorName}</strong></div>
            <div className="demo-list-row"><span>Medical Council Reg. No.</span><Badge>{regNo}</Badge></div>
            <div className="demo-list-row"><span>Clinical Specialty</span><strong>{specialty}</strong></div>
            <div className="demo-list-row"><span>Affiliated Hospital</span><span>{hospital}</span></div>
            <div className="demo-list-row"><span>Department</span><span>{formData.department}</span></div>
            <div className="demo-list-row"><span>Degrees & Qualifications</span><span>{formData.qualifications}</span></div>
            <div className="demo-list-row"><span>Practice Location</span><span>{formData.city}</span></div>
            <div className="demo-list-row">
              <span>Licensing Authority</span>
              <span style={{ color: 'var(--accent, #16a34a)', fontWeight: 600 }}>● Active NMC License & Telemedicine Authorized</span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button className="text-link" onClick={() => setIsEditing(true)}>Edit credential information ↗</button>
            </div>
          </Panel>

          <Panel title="Practice Schedule, Tariffs & Clinical Bio" subtitle="OPD & TELEMEDICINE">
            <div className="demo-list-row"><span>Consultation Fee</span><strong>₹{fee} / session</strong></div>
            <div className="demo-list-row"><span>Clinical Experience</span><span>{exp}</span></div>
            <div className="demo-list-row"><span>OPD Hours / Timings</span><span>{formData.timings}</span></div>
            <div className="demo-list-row"><span>Doctor Phone</span><span>{formData.phone}</span></div>
            <div className="demo-list-row"><span>Registered Email</span><span>{formData.email}</span></div>
            <div style={{ padding: '0.8rem 0', borderTop: '1px solid var(--border-light, #eee)', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                Clinical Philosophy & Special Expertise
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text)' }}>
                {formData.bio}
              </p>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/prescriptions" className="text-link">Manage Prescriptions ↗</Link>
              <Link to="/appointments" className="text-link">Review Lifetime Consultations ↗</Link>
              <Link to="/hospitals" className="text-link">Apply Relocation Form ↗</Link>
            </div>
          </Panel>
        </div>
      )}
    </>
  )
}

function ProfilePage({ notify }: { notify: (text: string) => void }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser())
  const isDoctor = user?.role === 'Doctor'
  if (isDoctor) {
    return <DoctorProfileView notify={notify} />
  }

  const [isEditing, setIsEditing] = useState(false)
  const profile = user?.patientProfile

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || user?.displayName || '',
    phone: profile?.phone || user?.phone || profile?.emergencyContact?.phone || '',
    age: profile?.age ? String(profile.age) : '28',
    gender: profile?.gender || 'Female',
    bloodGroup: profile?.bloodGroup || 'O+',
    systolic: profile?.bloodPressure ? String(profile.bloodPressure.systolic) : '120',
    diastolic: profile?.bloodPressure ? String(profile.bloodPressure.diastolic) : '80',
    pulseRate: profile?.pulseRate ? String(profile.pulseRate) : '72',
    bmi: profile?.bmi ? String(profile.bmi) : '22.4',
    address: profile?.address || 'Patia, KIIT Square',
    city: profile?.city || 'Bhubaneswar',
    pincode: profile?.pincode || '751024',
    allergies: (profile?.allergies || []).join(', '),
    chronicConditions: (profile?.chronicConditions || []).join(', '),
    pastSurgeries: (profile?.pastSurgeries || []).join(', '),
    currentMedications: (profile?.currentMedications || []).join(', '),
    emergencyName: profile?.emergencyContact?.name || 'Primary Contact',
    emergencyPhone: profile?.emergencyContact?.phone || profile?.phone || '9876543210',
    emergencyRel: profile?.emergencyContact?.relationship || 'Family',
    insuranceProvider: profile?.insurance?.provider || 'HDFC ERGO Health Insurance',
    insurancePolicy: profile?.insurance?.policyNumber || 'POL-IRYO-8891'
  })

  // Sync form data if user profile updates
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || user?.displayName || '',
        phone: profile.phone || user?.phone || profile.emergencyContact?.phone || '',
        age: profile.age ? String(profile.age) : '28',
        gender: profile.gender || 'Female',
        bloodGroup: profile.bloodGroup || 'O+',
        systolic: profile.bloodPressure ? String(profile.bloodPressure.systolic) : '120',
        diastolic: profile.bloodPressure ? String(profile.bloodPressure.diastolic) : '80',
        pulseRate: profile.pulseRate ? String(profile.pulseRate) : '72',
        bmi: profile.bmi ? String(profile.bmi) : '22.4',
        address: profile.address || '',
        city: profile.city || 'Bhubaneswar',
        pincode: profile.pincode || '751024',
        allergies: (profile.allergies || []).join(', '),
        chronicConditions: (profile.chronicConditions || []).join(', '),
        pastSurgeries: (profile.pastSurgeries || []).join(', '),
        currentMedications: (profile.currentMedications || []).join(', '),
        emergencyName: profile.emergencyContact?.name || '',
        emergencyPhone: profile.emergencyContact?.phone || '',
        emergencyRel: profile.emergencyContact?.relationship || 'Family',
        insuranceProvider: profile.insurance?.provider || 'HDFC ERGO Health Insurance',
        insurancePolicy: profile.insurance?.policyNumber || ''
      })
    }
  }, [profile, user?.displayName])

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Registered Patient'
  const bp = profile?.bloodPressure ? `${profile.bloodPressure.systolic}/${profile.bloodPressure.diastolic}` : '120/80'
  const pulse = profile?.pulseRate ? String(profile.pulseRate) : '72'
  const bmiOrBlood = profile?.bmi ? String(profile.bmi) : (profile?.bloodGroup || 'O+')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedProfile: PatientHealthProfile = {
      ...profile,
      uid: user?.uid,
      fullName: formData.fullName.trim() || displayName,
      email: user?.email || '',
      phone: formData.phone.trim(),
      age: parseInt(formData.age, 10) || 28,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      bloodPressure: {
        systolic: parseInt(formData.systolic, 10) || 120,
        diastolic: parseInt(formData.diastolic, 10) || 80
      },
      pulseRate: parseInt(formData.pulseRate, 10) || 72,
      bmi: parseFloat(formData.bmi) || 22.4,
      address: formData.address.trim(),
      city: formData.city.trim(),
      pincode: formData.pincode.trim(),
      allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      chronicConditions: formData.chronicConditions ? formData.chronicConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      pastSurgeries: formData.pastSurgeries ? formData.pastSurgeries.split(',').map(s => s.trim()).filter(Boolean) : [],
      currentMedications: formData.currentMedications ? formData.currentMedications.split(',').map(s => s.trim()).filter(Boolean) : [],
      emergencyContact: {
        name: formData.emergencyName.trim() || 'Primary Contact',
        phone: formData.emergencyPhone.trim() || formData.phone.trim() || '9876543210',
        relationship: formData.emergencyRel.trim() || 'Family'
      },
      insurance: {
        provider: formData.insuranceProvider.trim(),
        policyNumber: formData.insurancePolicy.trim() || 'POL-IRYO-DEFAULT'
      }
    }

    const updatedUser = updateStoredPatientProfile(updatedProfile)
    if (updatedUser) {
      setUser(updatedUser)
      setIsEditing(false)
      notify('Clinical health profile updated and synced successfully!')
    }
  }

  return (
    <>
      <PageHeading
        label="ACCOUNT / CLINICAL PROFILE"
        title="Your health journey, recorded."
        description={`Registered clinical intake, baseline vitals, and verified medical history for ${displayName}.`}
        action={
          <button className="button" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel Edit ✕' : 'Edit Health Details ✎'}
          </button>
        }
      />

      <div className="demo-metric-grid">
        <Metric label="BLOOD PRESSURE" value={bp} unit="mmHg" note={profile?.bloodPressure ? "Verified baseline" : "Standard baseline"} />
        <Metric label="RESTING PULSE" value={pulse} unit="bpm" note={profile?.pulseRate ? "Verified baseline" : "Standard baseline"} />
        <Metric label="BODY MASS INDEX" value={bmiOrBlood} unit={profile?.bmi ? "kg/m²" : undefined} note={profile ? `${profile.gender} · ${profile.age} yrs` : "Baseline recorded"} />
        <Metric label="BLOOD GROUP" value={profile?.bloodGroup || 'O+'} note="Blood phenotype" />
      </div>

      {isEditing ? (
        <Panel title="Edit clinical & health details" subtitle="SAVE TO FIRESTORE & LOCAL REGISTRY">
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <label>Full Patient Name
              <input value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
            </label>
            <label>Contact Phone
              <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="9876543210" />
            </label>
            <label>Age
              <input type="number" min="1" max="120" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} required />
            </label>
            <label>Gender
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label>Blood Group
              <select value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </label>
            <label>Resting Pulse (bpm)
              <input type="number" min="40" max="200" value={formData.pulseRate} onChange={e => setFormData({ ...formData, pulseRate: e.target.value })} />
            </label>
            <label>Blood Pressure (Systolic mmHg)
              <input type="number" min="70" max="220" value={formData.systolic} onChange={e => setFormData({ ...formData, systolic: e.target.value })} />
            </label>
            <label>Blood Pressure (Diastolic mmHg)
              <input type="number" min="40" max="140" value={formData.diastolic} onChange={e => setFormData({ ...formData, diastolic: e.target.value })} />
            </label>
            <label>Body Mass Index (BMI kg/m²)
              <input type="number" step="0.1" value={formData.bmi} onChange={e => setFormData({ ...formData, bmi: e.target.value })} />
            </label>
            <label>Residential City
              <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
            </label>
            <label style={{ gridColumn: 'span 2' }}>Street Address & Landmark
              <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
            </label>
            <label style={{ gridColumn: 'span 2' }}>Known Allergies (comma-separated)
              <input value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} placeholder="e.g. Penicillin, Pollen, Sulfa drugs" />
            </label>
            <label style={{ gridColumn: 'span 2' }}>Chronic Conditions (comma-separated)
              <input value={formData.chronicConditions} onChange={e => setFormData({ ...formData, chronicConditions: e.target.value })} placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma" />
            </label>
            <label style={{ gridColumn: 'span 2' }}>Current Ongoing Medications (comma-separated)
              <input value={formData.currentMedications} onChange={e => setFormData({ ...formData, currentMedications: e.target.value })} placeholder="e.g. Metformin 500mg, Telmisartan 40mg" />
            </label>
            <label style={{ gridColumn: 'span 2' }}>Past Surgeries & Hospitalizations
              <input value={formData.pastSurgeries} onChange={e => setFormData({ ...formData, pastSurgeries: e.target.value })} placeholder="e.g. Appendectomy (2021), Tonsillectomy" />
            </label>
            <label>Emergency Contact Name
              <input value={formData.emergencyName} onChange={e => setFormData({ ...formData, emergencyName: e.target.value })} />
            </label>
            <label>Emergency Contact Phone
              <input value={formData.emergencyPhone} onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })} />
            </label>
            <label>Insurance Provider
              <input value={formData.insuranceProvider} onChange={e => setFormData({ ...formData, insuranceProvider: e.target.value })} />
            </label>
            <label>Insurance Policy Number
              <input value={formData.insurancePolicy} onChange={e => setFormData({ ...formData, insurancePolicy: e.target.value })} />
            </label>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="button">Save Profile Changes <span>↗</span></button>
              <button type="button" className="button light" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        </Panel>
      ) : (
        <div className="demo-split">
          <Panel title="Personal demographics & vitals" subtitle="CLINICAL INTAKE">
            <div className="demo-list-row"><span>Full Name</span><strong>{displayName}</strong></div>
            <div className="demo-list-row"><span>Account Email</span><span>{user?.email || 'Not specified'}</span></div>
            <div className="demo-list-row"><span>Mobile Phone</span><span>{profile?.phone || user?.phone || 'Not provided'}</span></div>
            <div className="demo-list-row"><span>Age & Gender</span><span>{profile?.age || 28} years · {profile?.gender || 'Female'}</span></div>
            <div className="demo-list-row"><span>Blood Group</span><Badge>{profile?.bloodGroup || 'O+'}</Badge></div>
            <div className="demo-list-row"><span>Baseline Vitals</span><span>{bp} mmHg · {pulse} bpm</span></div>
            <div className="demo-list-row"><span>Body Mass Index</span><span>{profile?.bmi || '22.4'} kg/m²</span></div>
            <div className="demo-list-row"><span>Registered City</span><span>{profile?.city || 'Bhubaneswar'}</span></div>
            <div className="demo-list-row"><span>Address</span><span>{profile?.address ? `${profile.address}, ${profile.city || ''} (${profile.pincode || ''})` : 'Registered Address'}</span></div>
            <div style={{ marginTop: '1rem' }}>
              <button className="text-link" onClick={() => setIsEditing(true)}>Edit demographic information ↗</button>
            </div>
          </Panel>

          <Panel title="Clinical history & coverage" subtitle="MEDICAL DECLARATION">
            <div className="demo-list-row">
              <span>Known Allergies</span>
              <span>{profile?.allergies?.length ? profile.allergies.join(', ') : 'None reported'}</span>
            </div>
            <div className="demo-list-row">
              <span>Chronic Conditions</span>
              <span>{profile?.chronicConditions?.length ? profile.chronicConditions.join(', ') : 'None reported'}</span>
            </div>
            <div className="demo-list-row">
              <span>Ongoing Medications</span>
              <span>{profile?.currentMedications?.length ? profile.currentMedications.join(', ') : 'None active'}</span>
            </div>
            <div className="demo-list-row">
              <span>Past Surgeries</span>
              <span>{profile?.pastSurgeries?.length ? profile.pastSurgeries.join(', ') : 'None recorded'}</span>
            </div>
            <div className="demo-list-row">
              <span>Emergency Contact</span>
              <strong>{profile?.emergencyContact?.name || 'Primary Contact'} ({profile?.emergencyContact?.relationship || 'Family'}) · {profile?.emergencyContact?.phone || profile?.phone || '9876543210'}</strong>
            </div>
            <div className="demo-list-row">
              <span>Insurance Provider</span>
              <span>{profile?.insurance?.provider || 'HDFC ERGO Health Insurance'}</span>
            </div>
            <div className="demo-list-row">
              <span>Policy Number</span>
              <Badge>{profile?.insurance?.policyNumber || 'POL-IRYO-DEFAULT'}</Badge>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <Link to="/records" className="text-link">View all clinical health records ↗</Link>
              <Link to="/claims" className="text-link">File insurance claims ↗</Link>
            </div>
          </Panel>
        </div>
      )}
    </>
  )
}

function InformationPage({ contact = false }: { contact?: boolean }) {
  return <><PageHeading label={contact ? 'IRYOTEK / GET IN TOUCH' : 'IRYOTEK / PRIVACY & CONSENT'} title={contact ? 'Better starts with a conversation.' : 'Your trust. Our starting point.'} description={contact ? 'Choose the workspace that reflects your place in the care ecosystem.' : 'A clear explanation of what this clinical platform offers.'} /><Panel title={contact ? 'Find your place' : 'Designed around your choice'}><div className="information-copy">{contact ? <><p>Welcome to Iryotek Healthcare Platform. Reach our specialized teams for institutional inquiries, hospital onboardings, and clinical integrations.</p><div className="entry-roles">{['patient', 'doctor', 'admin'].map(role => <Link className="text-link" to={`/${role}`} key={role}>{role.charAt(0).toUpperCase() + role.slice(1)} workspace ↗</Link>)}</div><p>For urgent medical help in India, call 112 or visit your nearest emergency care center.</p></> : <><h4>Clinical Data Integrity & Security</h4><p>Your health profile, clinical history, vital parameters, and medical consultations are stored and tied directly to your account. Real catalogs provide access to 47,335 verified medicines, 100,413 credentialed doctors, and 1,130 accredited hospital facilities across India.</p><h4>Consent & Telemedicine Guidelines</h4><p>Virtual consultations, telemedicine sessions, and clinical records operate in accordance with National Digital Health Mission (NDHM) guidelines and HIPAA-compatible protocols. Camera and audio permissions are strictly user-authorized per session.</p><h4>Verified Catalogs & Dispensing</h4><p>Medicines are verified against regulatory formularies. Dispensing of Schedule H and X prescription medications requires verification by an authorized healthcare provider.</p><h4>Your Privacy & Control</h4><p>You maintain full control of your clinical profile, vitals log, and uploaded diagnostic records. You can update or export your medical health summary anytime from your Records tab.</p></>}</div></Panel></>
}

export function IntroPage() {
  const navigate = useNavigate(), frame = useRef<HTMLDivElement>(null), [ready, setReady] = useState(false)
  useEffect(() => {
    document.title = 'Iryotek | Care Platform'
    window.scrollTo(0, 0)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const gsap = (window as any).gsap
    if (reduced || !gsap) { setReady(true); return }
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ onComplete: () => setReady(true) })
      timeline.fromTo('.intro-page-enso path', { strokeDashoffset: 660 }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' })
        .fromTo('.intro-page-jp', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 1 }, .4)
        .fromTo('.intro-page-title span', { opacity: 0, y: 60 }, { opacity: 1, y: 0, stagger: .13, duration: 1.3, ease: 'power4.out' }, 1.4)
        .fromTo('.intro-page-bottom', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .7 }, 2.4)
        .fromTo('.intro-page-seal', { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2)' }, 2.6)
    }, frame)
    return () => context.revert()
  }, [])
  return <div className="intro-page dark" ref={frame}><div className="intro-page-photo"><Photo image="hero" alt="A doctor discussing care with a patient in a clinic" /></div><header><Link className="brand" to="/"><span className="demo-kamon">✳</span><span>iryotek<span className="brand-jp">HEALTHCARE</span></span></Link><Link to="/patient" className="text-link">Skip to your care ↗</Link></header><svg className="intro-page-enso" viewBox="0 0 240 240" aria-hidden="true"><path d="M152 32 C81 8 22 56 25 119 C25 183 90 223 152 206 C205 192 230 141 210 86 C201 62 183 43 159 39" /></svg><div className="intro-page-center"><span className="intro-page-jp">The future of healthcare, for everyone</span><h1 className="intro-page-title"><span>A new chapter.</span><span><em>A more human kind of care.</em></span></h1><div className="intro-page-bottom"><p>Precision of technology. Warmth of humanity.<br />Your world of care, beautifully connected.</p><button className="button light" onClick={() => navigate('/patient')}>Enter your care experience <span>↗</span></button><div><Link to="/doctor">For doctors ↗</Link><Link to="/admin">For administrators ↗</Link><Link to="/">Explore the ecosystem ↗</Link></div></div></div><span className="intro-page-seal hanko">CARE</span><footer><span>{ready ? 'YOUR NEXT CHAPTER IS READY.' : 'A MOMENT OF QUIET. A WORLD OF POSSIBILITY.'}</span><span>Connecting people, care, and the future.</span></footer></div>
}

export function NotFoundPage() {
  return <main className="not-found"><span className="eyebrow">404 / A DIFFERENT PATH</span><h1>Let's find<br /><em>your way back.</em></h1><p>This page isn't part of the care ecosystem.</p><Link to="/" className="button">Return to Iryotek <span>↗</span></Link><Link to="/patient" className="text-link">Open your dashboard ↗</Link></main>
}
