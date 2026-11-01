import { useContext, useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { DemoContext, Photo, Badge, Panel, PageHeading, Metric } from './pages'
import { doctors as mockDoctors, hospitals as mockHospitals, medicines as mockMedicines, prescriptions, allStates, citiesByState, type Medicine } from './mock-data'
import {
  getHospitals,
  getHospitalById,
  getDoctors,
  getDoctorById,
  getMedicineById,
  getStates,
  loginUser,
  registerUser,
  getSharedPrescriptions,
  saveSharedPrescription,
  deleteSharedPrescription,
  clearAllSharedPrescriptions,
  type ApiHospital,
  type ApiDoctor,
  type ApiMedicine,
  type SharedPrescription
} from './api'
import { getMedicineImage, getDoctorImage } from './images'
import AuthView from './AuthView'
import { YouPIModal, type YouPIPaymentResult } from './YouPIModal'
import { allMedicalFields } from './data/medical-fields'
import { getStoredAuthUser, updateStoredPatientProfile, type PatientHealthProfile } from './auth'
import { MedicineDropdownInput } from './MedicineDropdown'
import { AppointmentReceiptModal } from './AppointmentReceiptModal'

type Props = { page: string; notify: (message: string) => void }

export default function CatalogPage({ page, notify }: Props) {
  const { id } = useParams()
  if (page === 'hospitals') return id ? <HospitalDetail id={id} /> : <HospitalsPage notify={notify} />
  if (page === 'doctors' && id) return <DoctorDetail id={id} />
  if (page === 'medicines' && id) return <MedicineDetail id={id} notify={notify} />
  if (page === 'cart' || page === 'checkout') return <CartPage checkout={page === 'checkout'} notify={notify} />
  if (page === 'orders') return <OrdersPage id={id} notify={notify} />
  if (page === 'prescriptions') return <PrescriptionsPage notify={notify} />
  if (page === 'profile') return null
  if (page === 'notifications') return <NotificationsPage />
  if (page === 'login' || page === 'register') return <DemoEntry register={page === 'register'} notify={notify} />
  return null
}

function MissingItem({ kind, back }: { kind: string; back: string }) {
  return <><PageHeading label="404 / CATALOG" title={`${kind} not found.`} description="This item isn't in the active catalog. Let's find another option." /><Link to={back} className="button">Back to {kind.toLowerCase()} catalog <span>↗</span></Link></>
}

function HospitalsPage({ notify }: { notify?: (message: string) => void }) {
  const [search, setSearch] = useState('')
  const [state, setState] = useState('All states')
  const [city, setCity] = useState('All cities')
  const [specialty, setSpecialty] = useState('All specialties')
  const [emergencyOnly, setEmergencyOnly] = useState(false)
  const [hospitalsList, setHospitalsList] = useState<any[]>(mockHospitals)
  const [loading, setLoading] = useState(false)
  const [isLiveDb, setIsLiveDb] = useState(false)
  const [page, setPage] = useState(1)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const currentUser = getStoredAuthUser()
  const isDoctor = currentUser?.role === 'Doctor'
  const [stateList, setStateList] = useState<string[]>(['All states', ...allStates])

  useEffect(() => {
    getStates().then(st => {
      if (st && st.length > 0) setStateList(st)
    }).catch(() => {})
  }, [])

  // Transfer application state
  const [transferTarget, setTransferTarget] = useState('AIIMS New Delhi')
  const [transferDept, setTransferDept] = useState(currentUser?.specialist || 'Cardiology')
  const [transferReason, setTransferReason] = useState('Relocation to new city / family transfer')
  const [transferNotice, setTransferNotice] = useState('1 Month')
  const [transferDate, setTransferDate] = useState('2026-11-01')
  const [transferMessage, setTransferMessage] = useState('')
  const [transfers, setTransfers] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('iryotek_hospital_transfers')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const limit = 24
  const [totalHospitals, setTotalHospitals] = useState(1130)
  const totalPages = Math.max(1, Math.ceil(totalHospitals / limit))

  // Reset page when filters change
  const handleSearchChange = (val: string) => { setSearch(val); setPage(1) }
  const handleStateChange = (val: string) => { setState(val); setCity('All cities'); setPage(1) }
  const handleCityChange = (val: string) => { setCity(val); setPage(1) }
  const handleSpecialtyChange = (val: string) => { setSpecialty(val); setPage(1) }
  const handleEmergencyChange = (val: boolean) => { setEmergencyOnly(val); setPage(1) }

  useEffect(() => {
    let active = true
    setLoading(true)
    getHospitals({
      search: search.trim() || undefined,
      state: state !== 'All states' ? state : undefined,
      city: city !== 'All cities' ? city : undefined,
      emergency: emergencyOnly ? true : undefined,
      limit,
      page,
    })
      .then(res => {
        if (!active) return
        if (res && res.length > 0) {
          setHospitalsList(res)
          setIsLiveDb(true)
          if ((res as any).total !== undefined) {
            setTotalHospitals((res as any).total)
          }
        }
      })
      .catch(() => {
        // fallback active
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [search, state, city, emergencyOnly, page])

  const matches = hospitalsList.filter(hospital =>
    (specialty === 'All specialties' || (hospital.specialties && hospital.specialties.includes(specialty)))
  )

  const cityOptions = useMemo(() => {
    if (state !== 'All states' && citiesByState[state]) {
      return ['All cities', ...citiesByState[state]]
    }
    const allUniqueCities = Array.from(new Set(mockHospitals.map(h => h.city))).sort()
    return ['All cities', ...allUniqueCities]
  }, [state])

  const specialtyOptions = useMemo(() => ['All specialties', ...allMedicalFields.map(f => f.name)], [])

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newApp = {
      id: `TR-${Date.now().toString().slice(-5)}`,
      doctorName: currentUser?.displayName || 'Dr. Practitioner',
      currentHospital: currentUser?.hospital || 'AIIMS Bhubaneswar',
      targetHospital: transferTarget,
      department: transferDept,
      reason: transferReason,
      noticePeriod: transferNotice,
      expectedDate: transferDate,
      message: transferMessage.trim() || 'Requesting transfer of clinical credentials and OPD affiliation.',
      submittedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      status: 'In Review by Medical Superintendent'
    }
    const updated = [newApp, ...transfers]
    setTransfers(updated)
    try {
      localStorage.setItem('iryotek_hospital_transfers', JSON.stringify(updated))
    } catch {}
    setShowTransferForm(false)
    setTransferMessage('')
    if (notify) notify(`Relocation application for ${transferTarget} submitted to Medical Administration!`)
  }

  return (
    <>
      <PageHeading
        label={isDoctor ? "DOCTOR / HOSPITAL NETWORK & TRANSFER" : "HOSPITALS / A NETWORK OF CARE"}
        title={isDoctor ? "Affiliated Hospitals & Relocation Desk" : "The right place to feel better."}
        description={isDoctor 
          ? "Browse affiliated hospitals across the network or apply for a transfer/relocation if moving to a new healthcare center."
          : "Over 1,130 affiliated hospitals across India with 24/7 departments, emergency facilities, and connected specialists."}
        action={
          isDoctor ? (
            <button
              className="button"
              type="button"
              onClick={() => setShowTransferForm(!showTransferForm)}
              style={{ background: showTransferForm ? '#0f766e' : undefined }}
            >
              {showTransferForm ? 'Close Relocation Form ✕' : 'Apply for Hospital Transfer ↗'}
            </button>
          ) : (
            <Link to="/directory" className="button">Find a doctor <span>↗</span></Link>
          )
        }
      />

      {isDoctor && showTransferForm && (
        <Panel title="Doctor Hospital Relocation / Transfer Application" subtitle="CLINICAL CREDENTIALING & TRANSFER FORM">
          <form onSubmit={handleTransferSubmit} style={{ maxWidth: 840 }}>
            <div style={{ padding: '12px 16px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: 20, fontSize: 13, color: '#065f46' }}>
              ℹ <strong>Official Transfer Protocol:</strong> Complete this form if you are moving or transferring practice to another affiliated hospital. Your clinical records, patient ratings, and e-prescription credentials will be seamlessly routed upon approval by the target hospital's Medical Board.
            </div>
            <div className="demo-form-grid">
              <label>Doctor Name
                <input type="text" value={currentUser?.displayName || 'Dr. Practitioner'} disabled style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
              </label>
              <label>Current Hospital & Department
                <input type="text" value={`${currentUser?.hospital || 'AIIMS Bhubaneswar'} — ${currentUser?.specialist || 'Cardiology'}`} disabled style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
              </label>
              <label>Target / New Hospital
                <select value={transferTarget} onChange={e => setTransferTarget(e.target.value)} required>
                  <option value="AIIMS New Delhi">AIIMS New Delhi — New Delhi</option>
                  <option value="Apollo Hospitals Greams Road">Apollo Hospitals Greams Road — Chennai</option>
                  <option value="Fortis Memorial Research Institute">Fortis Memorial Research Institute — Gurugram</option>
                  <option value="Max Super Speciality Hospital">Max Super Speciality Hospital Saket — New Delhi</option>
                  <option value="KIMS Super Speciality Hospital">KIMS Super Speciality Hospital — Bhubaneswar</option>
                  <option value="Manipal Hospital Whitefield">Manipal Hospital — Bengaluru</option>
                  <option value="Medanta - The Medicity">Medanta - The Medicity — Gurugram</option>
                  <option value="Tata Memorial Hospital">Tata Memorial Hospital — Mumbai</option>
                  <option value="Kokilaben Dhirubhai Ambani Hospital">Kokilaben Dhirubhai Ambani Hospital — Mumbai</option>
                  <option value="Narayana Health City">Narayana Health City — Bengaluru</option>
                  {hospitalsList.slice(0, 15).map(h => (
                    <option key={h.id} value={h.name}>{h.name} — {h.city}</option>
                  ))}
                </select>
              </label>
              <label>Target Department / Specialty
                <select value={transferDept} onChange={e => setTransferDept(e.target.value)}>
                  {specialtyOptions.filter(s => s !== 'All specialties').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>Reason for Hospital Relocation
                <select value={transferReason} onChange={e => setTransferReason(e.target.value)}>
                  <option value="Relocation to new city / family transfer">Relocation to new city / family transfer</option>
                  <option value="Promotion to Senior Consultant / Head of Department">Promotion to Senior Consultant / Head of Department</option>
                  <option value="Better research, catheterization & surgical infrastructure">Better research, catheterization & surgical infrastructure</option>
                  <option value="Proximity to home / personal reasons">Proximity to home / personal reasons</option>
                  <option value="Specialized fellowship / sub-specialty rotation">Specialized fellowship / sub-specialty rotation</option>
                </select>
              </label>
              <label>Notice Period at Current Hospital
                <select value={transferNotice} onChange={e => setTransferNotice(e.target.value)}>
                  <option value="Immediate (Relieving letter ready)">Immediate (Relieving letter ready)</option>
                  <option value="1 Month (Standard)">1 Month (Standard)</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                </select>
              </label>
              <label>Expected Joining Date
                <input type="date" value={transferDate} onChange={e => setTransferDate(e.target.value)} required />
              </label>
              <label>Clinical Experience
                <input type="text" value={`${currentUser?.experience || 12} Years in Clinical Practice`} disabled style={{ background: '#f1f5f9' }} />
              </label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              <span>Statement to Medical Superintendent / Credentialing Committee</span>
              <textarea
                rows={3}
                placeholder="State your clinical objectives, surgical/OPD expertise, and reason for selecting this hospital..."
                value={transferMessage}
                onChange={e => setTransferMessage(e.target.value)}
              />
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="button">
                Submit Transfer Application ↗
              </button>
              <button type="button" className="button secondary" onClick={() => setShowTransferForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      )}

      {isDoctor && transfers.length > 0 && (
        <Panel title="Your Hospital Transfer Applications" subtitle={`${transfers.length} APPLICATION(S) ON RECORD`}>
          <div className="demo-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Target Hospital</th>
                  <th>Department</th>
                  <th>Reason</th>
                  <th>Expected Date</th>
                  <th>Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(tr => (
                  <tr key={tr.id}>
                    <td className="mono">{tr.id}</td>
                    <td><strong>{tr.targetHospital}</strong></td>
                    <td>{tr.department}</td>
                    <td style={{ fontSize: 11, color: '#64748b' }}>{tr.reason}</td>
                    <td>{tr.expectedDate}</td>
                    <td>{tr.submittedAt}</td>
                    <td>
                      <Badge><i className="status-dot" style={{ background: '#d97706' }} /> {tr.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {!isDoctor && (
        <div className="catalog-switch">
          <Link to="/directory">Doctors (100,413+) ↗</Link>
          <Link to="/hospitals" className="active">Hospitals (1,130)</Link>
        </div>
      )}
      <div className="demo-filter-row">
        <label className="demo-search">
          <span>⌕</span>
          <input
            aria-label="Search hospitals"
            placeholder="Hospital, department, or city"
            value={search}
            onChange={event => handleSearchChange(event.target.value)}
          />
        </label>
        <select aria-label="Hospital state" value={state} onChange={event => handleStateChange(event.target.value)}>
          {stateList.map(value => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Hospital city" value={city} onChange={event => handleCityChange(event.target.value)}>
          {cityOptions.map(value => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Hospital specialty" value={specialty} onChange={event => handleSpecialtyChange(event.target.value)}>
          {specialtyOptions.map(value => <option key={value}>{value}</option>)}
        </select>
      </div>
      <div className="demo-results-count">
        <span aria-live="polite">
          {loading ? 'Searching live hospital registry...' : `Showing page ${page} of ${totalPages} · ${matches.length} hospitals loaded`}
          {isLiveDb && <Badge style={{ marginLeft: 8 }}>✓ Live MySQL DB (1,130)</Badge>}
        </span>
        <label className="catalog-check">
          <input type="checkbox" checked={emergencyOnly} onChange={event => handleEmergencyChange(event.target.checked)} />
          24/7 emergency department
        </label>
      </div>
      <div className="hospital-grid">
        {matches.map((hospital) => (
          <article className="hospital-card" key={hospital.id}>
            <Link to={`/hospitals/${hospital.id}`} className="hospital-card-photo">
              <Photo image={hospital.image || 'hospital'} alt={`Building for ${hospital.name}`} />
              <span className="hospital-city">{hospital.city}</span>
            </Link>
            <div className="hospital-card-body">
              <span className="eyebrow">{hospital.emergency ? '24/7 EMERGENCY DEPARTMENT' : 'SCHEDULED SPECIALTY CARE'}</span>
              <h3><Link to={`/hospitals/${hospital.id}`}>{hospital.name}</Link></h3>
              <p>{hospital.address}</p>
              <div className="hospital-tags">
                {(hospital.specialties || ['General Medicine']).map((value: string) => <span key={value}>{value}</span>)}
              </div>
              <div className="demo-list-row">
                <span>{hospital.beds || 150} beds · Est. {hospital.established || 2012}</span>
                <Badge>★ {hospital.rating || '4.8'}</Badge>
              </div>
              <Link className="text-link" to={`/hospitals/${hospital.id}`}>Explore hospital & doctors ↗</Link>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="catalog-pagination">
        <button
          type="button"
          className="page-btn"
          disabled={page <= 1 || loading}
          onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 120, behavior: 'smooth' }) }}
        >
          ← Prev
        </button>
        <span className="page-indicator">Page {page} of {totalPages} (1,130 Hospitals)</span>
        <button
          type="button"
          className="page-btn"
          disabled={page >= totalPages || loading}
          onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 120, behavior: 'smooth' }) }}
        >
          Next →
        </button>
      </div>

      {!matches.length && !loading && (
        <Panel>
          <h3>No hospitals match these filters.</h3>
          <button className="text-link" onClick={() => { setSearch(''); setCity('All cities'); setSpecialty('All specialties'); setEmergencyOnly(false); setPage(1) }}>Clear all filters ↺</button>
        </Panel>
      )}
      <p className="panel-note">Integrated with the Iryotek national hospital directory (1,130 facilities) and live bed occupancy database.</p>
    </>
  )
}

function HospitalDetail({ id }: { id: string }) {
  const [hospital, setHospital] = useState<any>(() => mockHospitals.find(item => String(item.id) === id || String((item as any).numericId) === id))
  const [team, setTeam] = useState<ApiDoctor[]>([])

  useEffect(() => {
    let active = true
    getHospitalById(id).then(h => {
      if (active && h) {
        setHospital(h)
        getDoctors({ hospitalId: h.id, limit: 12 }).then(docs => {
          if (active && docs.length > 0) setTeam(docs)
        })
      }
    })
    return () => { active = false }
  }, [id])

  if (!hospital) return <MissingItem kind="Hospital" back="/hospitals" />

  return (
    <>
      <Link className="text-link catalog-back" to="/hospitals">← All hospitals</Link>
      <PageHeading label={`HOSPITAL / ${hospital.city.toUpperCase()}`} title={hospital.name} description={`${hospital.address} · Verified medical center`} />
      <div className="hospital-detail-hero">
        <Photo image={(hospital.image as any) || 'hospitalExterior'} alt={`Exterior for ${hospital.name}`} />
        <div>
          <Badge>★ {hospital.rating || '4.8'} · VERIFIED CENTER</Badge>
          <h2>A thoughtful place<br /><em>to begin again.</em></h2>
          <p>Connected consultations, coordinated care, and a clearer path to the right specialist.</p>
          <div className="hospital-facts">
            <span><strong>{hospital.beds || 200}</strong>BEDS</span>
            <span><strong>{team.length || 12}</strong>DOCTORS</span>
            <span><strong>{hospital.established || 2010}</strong>ESTABLISHED</span>
          </div>
        </div>
      </div>
      <div className="demo-split">
        <Panel title="Departments & services" subtitle="CONNECTED CARE">
          <div className="hospital-tags">
            {(hospital.specialties || ['General Medicine', 'Cardiology', 'Pediatrics']).map((specialty: string) => <span key={specialty}>{specialty}</span>)}
          </div>
          {['Outpatient consultations', 'Diagnostics & laboratory', 'Digital prescriptions', 'Insurance coordination'].map(service => (
            <div className="demo-list-row" key={service}>
              <span>{service}</span>
              <Badge>Active Department</Badge>
            </div>
          ))}
        </Panel>
        <Panel title="Plan your visit" subtitle="VISITING INFORMATION">
          <div className="demo-list-row"><span>Outpatient hours</span><span>Mon–Sat · 09:00–18:00</span></div>
          <div className="demo-list-row"><span>Emergency department</span><span>{hospital.emergency ? 'Open 24/7' : 'Scheduled only'}</span></div>
          <div className="demo-list-row"><span>Facilities</span><span>Parking · Accessible entry · Digital Queue</span></div>
          <p className="panel-note">For urgent help or immediate ambulance dispatch, call 112 or local emergency triage.</p>
        </Panel>
      </div>
      <Panel title="Meet the connected specialists" subtitle={`${team.length} DOCTORS`}>
        <div className="hospital-team">
          {team.map(doctor => (
            <article key={doctor.id}>
              <Photo image={(doctor.image as any) || 'doctor'} alt={doctor.name} />
              <div>
                <h4><Link to={`/doctors/${doctor.id}`}>{doctor.name} ↗</Link></h4>
                <p>{doctor.specialty} · {doctor.experience} years experience</p>
                <Link className="text-link" to={`/appointments?doctor=${encodeURIComponent(doctor.name)}`}>Book a 15-minute visit · ₹{doctor.price} ↗</Link>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </>
  )
}

function DoctorDetail({ id }: { id: string }) {
  const [doctor, setDoctor] = useState<ApiDoctor | undefined>(() => {
    const cleanId = id.trim()
    const numericTarget = parseInt(cleanId.replace(/\D/g, ''), 10)
    const mock = mockDoctors.find(item =>
      String(item.id) === cleanId ||
      String(item.numericId) === cleanId ||
      (Boolean(numericTarget) && (item.numericId === numericTarget || parseInt(String(item.id).replace(/\D/g, ''), 10) === numericTarget))
    )
    if (!mock) return undefined
    const numId = typeof mock.numericId === 'number' && !isNaN(mock.numericId)
      ? mock.numericId
      : (parseInt(String(mock.id || '').replace(/\D/g, ''), 10) || 1)
    const hospId = typeof mock.numericHospitalId === 'number' && !isNaN(mock.numericHospitalId)
      ? mock.numericHospitalId
      : (parseInt(String(mock.hospitalId || '').replace(/\D/g, ''), 10) || 1)
    return {
      ...mock,
      id: numId,
      doctorId: numId,
      hospitalId: hospId,
      specialist: mock.specialty,
      state: mock.state || 'National',
      address: `${mock.hospital}, ${mock.city}`,
      email: mock.email || 'doctor@hospital.com',
      phone: mock.phone || '9876543210',
      timing: mock.timing || '09:00 AM - 01:00 PM',
      image: getDoctorImage(mock),
    }
  })

  const [loading, setLoading] = useState(!doctor)

  useEffect(() => {
    let active = true
    getDoctorById(id).then(d => {
      if (active) {
        if (d) setDoctor(d)
        setLoading(false)
      }
    }).catch(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [id])

  if (loading && !doctor) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: 16, fontWeight: 500 }}>Connecting to verified clinician registry...</p>
      </div>
    )
  }

  if (!doctor) return <MissingItem kind="Doctor" back="/directory" />

  return (
    <>
      <Link className="text-link catalog-back" to="/directory">← All specialists</Link>
      <PageHeading label={`DOCTOR / ${doctor.specialty.toUpperCase()}`} title={doctor.name} description={`${doctor.city} · ${doctor.experience} years of experience · Live Registry Profile`} />
      <div className="demo-split wide-left">
        <Panel>
          <div className="doctor-profile-banner">
            <Photo image={(doctor.image as any) || 'doctor'} alt={`Portrait of ${doctor.name}`} />
            <div>
              <Badge>VERIFIED CLINICIAN</Badge>
              <h2>{doctor.specialty}</h2>
              <p>{doctor.qualification || 'MBBS, MD'}</p>
              <span>★ {doctor.rating || '4.9'} · {doctor.reviews || 48} reviews</span>
              <Link className="text-link" to={`/hospitals/${doctor.hospitalId}`}>{doctor.hospital} ↗</Link>
            </div>
          </div>
          <div className="profile-description">
            <h3>A little about your specialist.</h3>
            <p>{doctor.bio || `${doctor.qualification} with ${doctor.experience} years of clinical excellence in ${doctor.specialty}.`}</p>
            <div className="demo-list-row"><span>Languages</span><span>{(doctor.languages || ['English', 'Hindi']).join(' · ')}</span></div>
            <div className="demo-list-row"><span>Consultation options</span><span>In-clinic appointment · Outpatient OPD</span></div>
            <div className="demo-list-row"><span>Clinical approach</span><span>Patient-centered · Evidence-based care</span></div>
          </div>
        </Panel>
        <Panel title="Your next conversation" subtitle="15 MINUTES">
          <div className="doctor-fee">
            <span>Consultation fee</span>
            <strong>₹{doctor.price || 500}</strong>
            <p>Morning appointments from 09:00.<br />Choose a precise 15-minute slot.</p>
          </div>
          <Link className="button full-width" to={`/appointments?doctor=${encodeURIComponent(doctor.name)}`}>Choose your appointment <span>↗</span></Link>
          <Link className="text-link" to="/triage">Prepare with Sakura AI ↗</Link>
          <p className="panel-note">Appointments booked here are written to the live Iryotek database queue.</p>
        </Panel>
      </div>
      <Panel title="Patient feedback" subtitle="VERIFIED REVIEWS">
        <div className="sample-reviews">
          <blockquote>“A calm conversation and clear explanations. I knew what the next step would be.”<cite>Verified patient · ★★★★★</cite></blockquote>
          <blockquote>“Thoughtful, unhurried care. The connected records made the follow-up effortless.”<cite>Verified patient · ★★★★★</cite></blockquote>
        </div>
      </Panel>
    </>
  )
}

function MedicineDetail({ id, notify }: { id: string; notify: Props['notify'] }) {
  const [medicine, setMedicine] = useState<ApiMedicine | undefined>(() => {
    const mock = mockMedicines.find(item => item.id === Number(id))
    return mock ? { ...mock } : undefined
  })
  const { update } = useContext(DemoContext)

  useEffect(() => {
    let active = true
    getMedicineById(id).then(m => {
      if (active && m) setMedicine(m)
    })
    return () => { active = false }
  }, [id])

  if (!medicine) return <MissingItem kind="Medicine" back="/pharmacy" />

  const add = () => {
    update(previous => ({
      ...previous,
      cart: previous.cart.some(item => item.id === medicine.id)
        ? previous.cart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...previous.cart, {
            id: medicine.id,
            name: medicine.name,
            category: medicine.category,
            dose: medicine.dose,
            price: medicine.price,
            stock: medicine.stock,
            prescription: Boolean(medicine.prescription),
            description: medicine.description || '',
            brand: medicine.brand || 'Iryotek Care',
            quantity: 1,
          }]
    }))
    notify(`${medicine.name} added to your cart.`)
  }

  return (
    <>
      <Link className="text-link catalog-back" to="/pharmacy">← All medicines & devices</Link>
      <PageHeading label={`PHARMACY / ${medicine.category.toUpperCase()}`} title={medicine.name} description={`${medicine.dose} · ${medicine.brand}`} />
      <div className="demo-split">
        <div className="medicine-detail-visual">
          <img
            src={getMedicineImage(medicine) || ''}
            alt={medicine.name}
            className="medicine-detail-photo"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <span className="medicine-detail-symbol">✚</span>
        </div>
        <Panel title="Thoughtful care, connected." subtitle="AUTHENTIC MEDICINE">
          <Badge>{medicine.prescription ? 'Prescription required' : 'Over the Counter (OTC)'}</Badge>
          <div className="doctor-fee">
            <strong>₹{medicine.price}</strong>
            <p>{medicine.description || 'Pharmaceutical grade medication from certified suppliers.'}</p>
          </div>
          <div className="demo-list-row"><span>Available stock</span><span>{medicine.stock} packs</span></div>
          <div className="demo-list-row"><span>Pack size</span><span>{medicine.dose}</span></div>
          <button className="button full-width" onClick={add}>Add to cart <span>+</span></button>
          <Link to="/cart" className="text-link">View cart & checkout ↗</Link>
          <p className="panel-note">Prescriptions can be automatically verified against your doctor consultation record.</p>
        </Panel>
      </div>
      <Panel title="More from this category" subtitle="EXPLORE">
        <div className="related-products">
          {mockMedicines.filter(item => item.category === medicine.category && item.id !== medicine.id).slice(0, 3).map(item => (
            <Link key={item.id} to={`/medicines/${item.id}`}>
              <span className="eyebrow">{item.category}</span>
              <h3>{item.name}</h3>
              <p>{item.dose}</p>
              <strong>₹{item.price} ↗</strong>
            </Link>
          ))}
        </div>
      </Panel>
    </>
  )
}

function CartPage({ checkout, notify }: { checkout: boolean; notify: Props['notify'] }) {
  const { state, update } = useContext(DemoContext)
  const navigate = useNavigate()
  const [address, setAddress] = useState('home')
  const [agree, setAgree] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  const total = state.cart.reduce((sum, item) => {
    const p = Number(item.price) > 0 ? Number(item.price) : 120
    const q = Number(item.quantity) > 0 ? Number(item.quantity) : 1
    return sum + p * q
  }, 0)

  const change = (medicine: Medicine, quantity: number) => {
    const q = Math.max(0, Number(quantity) || 0)
    update(previous => ({
      ...previous,
      cart: previous.cart
        .map(item => item.id === medicine.id ? {
          ...item,
          quantity: q,
          price: Number(item.price) > 0 ? Number(item.price) : 120
        } : item)
        .filter(item => (Number(item.quantity) || 0) > 0)
    }))
  }

  const place = () => {
    if (!agree || !state.cart.length) return
    setIsPaymentOpen(true)
  }

  const user = getStoredAuthUser()
  const profile = user?.patientProfile
  const homeAddressText = profile?.address
    ? `${profile.address}, ${profile.city} - ${profile.pincode}`
    : (user?.displayName ? `${user.displayName}'s Residential Address` : 'Registered Patient Address')
  const clinicAddressText = 'Iryotek Partner Care Network (Direct Clinical Pickup)'

  const handlePaymentSuccess = (result: YouPIPaymentResult) => {
    setIsPaymentOpen(false)
    const order = {
      id: result.orderId,
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      items: state.cart.map(item => ({
        name: item.name,
        price: Number(item.price) > 0 ? Number(item.price) : 120,
        quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1
      })),
      total: Number(result.amount) || total,
      address: address === 'home' ? `${homeAddressText} · Doorstep Delivery` : `${clinicAddressText} · Self Pickup`,
      paymentMethod: result.paymentMethod === 'UPI' ? `UPI (UTR: ${result.utr})` : result.paymentMethod === 'COD' ? 'Cash on Delivery (Verified)' : `${result.paymentMethod} (Verified)`,
      transactionId: result.transactionId,
    }
    update(previous => ({ ...previous, order: true, orders: [order, ...previous.orders], cart: [] }))
    notify(`Medicine order confirmed via ${result.paymentMethod}. Dispatched for delivery!`)
    navigate(`/orders/${order.id}`)
  }

  return (
    <>
      <PageHeading
        label={checkout ? 'CHECKOUT / THE LAST LITTLE STEP' : 'CART / YOUR CARE, READY'}
        title={checkout ? 'Care, on its way to you.' : 'A little care. All together.'}
        description="Review your prescriptions, OTC medicines, and doorstep delivery details."
        action={<Link className="text-link" to="/pharmacy">Continue browsing ↗</Link>}
      />
      {!state.cart.length ? (
        <Panel>
          <div className="cart-empty">
            <span>✚</span>
            <h3>Your cart is waiting for a little care.</h3>
            <p>Browse 47,000+ medicines or sync a digital prescription from your doctor.</p>
            <Link className="button" to="/pharmacy">Explore the pharmacy <span>↗</span></Link>
          </div>
        </Panel>
      ) : (
        <div className="demo-split wide-left">
          <div>
            <Panel
              title="Your selected items"
              subtitle={`${state.cart.length} PRODUCTS`}
              action={
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#b91c1c',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 6px'
                  }}
                  title="Remove all items from your care cart"
                  onClick={() => {
                    update(previous => ({ ...previous, cart: [] }))
                    notify('Care cart cleared.')
                  }}
                >
                  Clear cart ✕
                </button>
              }
            >
              {state.cart.map(item => {
                const itemPrice = Number(item.price) > 0 ? Number(item.price) : 120
                const itemQty = Number(item.quantity) > 0 ? Number(item.quantity) : 1
                return (
                  <div className="checkout-item" key={item.id}>
                    <div>
                      <h4><Link to={`/medicines/${item.id}`}>{item.name} ↗</Link></h4>
                      <p>{item.dose || 'As directed by physician'}</p>
                    </div>
                    <div className="quantity-controls">
                      <button aria-label={`Decrease ${item.name}`} onClick={() => change(item, itemQty - 1)}>−</button>
                      <span>{itemQty}</span>
                      <button aria-label={`Increase ${item.name}`} onClick={() => change(item, itemQty + 1)}>+</button>
                    </div>
                    <strong>₹{(itemPrice * itemQty).toLocaleString('en-IN')}</strong>
                    <button className="remove-item" aria-label={`Remove ${item.name}`} onClick={() => change(item, 0)}>×</button>
                  </div>
                )
              })}
            </Panel>
            {checkout && (
              <Panel title="Delivery address" subtitle="DESTINATION">
                <div className="address-options">
                  {[
                    { id: 'home', label: 'Registered Patient Address', text: homeAddressText },
                    { id: 'office', label: 'Clinical Collection Center', text: clinicAddressText }
                  ].map(item => (
                    <label key={item.id} className={address === item.id ? 'selected' : ''}>
                      <input type="radio" name="address" value={item.id} checked={address === item.id} onChange={() => setAddress(item.id)} />
                      <div>
                        <h4>{item.label}</h4>
                        <p>{item.text}</p>
                        <small>Same-day doorstep delivery available</small>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="demo-list-row" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ display: 'block', fontWeight: 600 }}>Payment Gateway</span>
                    <small style={{ color: '#587477', fontSize: '10px' }}>Zero-fee direct payment gateway</small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge>⚡ Instant Payment (UPI, EMI & Net Banking)</Badge>
                    <small style={{ display: 'block', color: '#0f766e', fontSize: '10px', marginTop: '4px', fontWeight: 600 }}>
                      Direct Bank Settlement · 0% Fee
                    </small>
                  </div>
                </div>
                <label className="catalog-check checkout-agree">
                  <input type="checkbox" checked={agree} onChange={event => setAgree(event.target.checked)} />
                  I confirm these medicines are for personal medical care.
                </label>
              </Panel>
            )}
          </div>
          <Panel title="Order summary" subtitle="THOUGHTFULLY CONNECTED">
            <div className="demo-list-row"><span>Subtotal</span><strong>₹{total}</strong></div>
            <div className="demo-list-row"><span>Express Delivery</span><span>Complimentary</span></div>
            <div className="demo-list-row"><span>Total Payable</span><strong>₹{total}</strong></div>
            {checkout ? (
              <button className="button full-width" disabled={!agree} onClick={place}>Pay & Dispatch via UPI ⚡ <span>↗</span></button>
            ) : (
              <Link className="button full-width" to="/checkout">Continue to checkout <span>↗</span></Link>
            )}
            <Link className="text-link" to="/prescriptions">View your prescriptions ↗</Link>
            <p className="panel-note">Orders are packed with temperature-monitored pharmaceutical logistics.</p>
          </Panel>
        </div>
      )}

      <YouPIModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        order={{
          orderId: `IRY-${10248 + state.orders.length}`,
          amount: total,
          items: state.cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price, dose: item.dose })),
          deliveryAddress: address === 'home' ? homeAddressText : clinicAddressText,
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  )
}

function OrdersPage({ id, notify }: { id?: string; notify?: (message: string) => void }) {
  const { state, update } = useContext(DemoContext)
  const order = state.orders.find(item => item.id === id)
  if (id && !order) return <MissingItem kind="Order" back="/orders" />
  if (order) {
    const isCancelled = order.status === 'Cancelled'
    const stages = ['Confirmed', 'Preparing', 'Out for delivery', 'Delivered']
    const index = stages.indexOf(order.status)
    return (
      <>
        <Link className="text-link catalog-back" to="/orders">← All orders</Link>
        <PageHeading
          label={`ORDER / ${order.id}`}
          title={isCancelled ? 'Order Cancelled.' : order.status === 'Delivered' ? 'Delivered with care.' : 'A little care, coming your way.'}
          description={`Placed ${order.date} · ${order.address}`}
        />
        {isCancelled ? (
          <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>✕</span>
            <div>
              <strong style={{ fontSize: '15px' }}>Order Cancelled</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#b91c1c' }}>This medicine order has been cancelled. Any pending doorstep dispatch has been halted.</p>
            </div>
          </div>
        ) : (
          <div className="order-progress">
            {stages.map((stage, stageIndex) => (
              <div key={stage} className={stageIndex <= index ? 'complete' : ''}>
                <span>{stageIndex <= index ? '✓' : '○'}</span>
                <h4>{stage}</h4>
                <p>{stageIndex < index ? 'Complete' : stageIndex === index ? 'Current status' : 'Next step'}</p>
              </div>
            ))}
          </div>
        )}
        <div className="demo-split">
          <Panel title="The care inside your order" subtitle={order.id}>
            {order.items.map(item => (
              <div className="demo-list-row" key={item.name}>
                <span>{item.name} × {item.quantity}</span>
                <strong>₹{item.price * item.quantity}</strong>
              </div>
            ))}
            <div className="demo-list-row"><span>Total</span><strong>₹{order.total}</strong></div>
            <div className="demo-list-row"><span>Status</span><Badge>{order.status}</Badge></div>
          </Panel>
          <Panel title="Delivery details" subtitle="LIVE LOGISTICS">
            <p className="demo-muted">{order.address}</p>
            <div className="demo-list-row"><span>Payment gateway</span><span className="mono" style={{ color: '#0f766e', fontWeight: 600 }}>⚡ {order.paymentMethod || 'UPI (Verified)'}</span></div>
            {order.transactionId && <div className="demo-list-row"><span>Payment Ref</span><span className="mono">{order.transactionId}</span></div>}
            <div className="demo-list-row"><span>Delivery partner</span><span>Iryotek Express Courier</span></div>
            <div className="demo-list-row"><span>Tracking reference</span><span className="mono">TRK-{order.id}</span></div>
            {!isCancelled && order.status !== 'Delivered' && (
              <button
                type="button"
                className="button secondary"
                style={{ marginTop: '16px', width: '100%', borderColor: '#ef4444', color: '#b91c1c', fontWeight: 600 }}
                onClick={() => {
                  if (window.confirm(`Are you sure you want to cancel order ${order.id}?`)) {
                    update(prev => ({
                      ...prev,
                      order: false,
                      orders: prev.orders.map(o => o.id === order.id ? { ...o, status: 'Cancelled' } : o)
                    }))
                    notify?.(`Order ${order.id} has been cancelled successfully.`)
                  }
                }}
              >
                Cancel Order ✕
              </button>
            )}
            <Link className="text-link" to="/contact" style={{ marginTop: '12px', display: 'inline-block' }}>Get support ↗</Link>
          </Panel>
        </div>
      </>
    )
  }
  return (
    <>
      <PageHeading
        label="ORDERS / CARE BEYOND THE CONSULTATION"
        title="Every delivery. Connected."
        description={`${state.orders.length} active and past orders with real-time status tracking.`}
        action={<Link className="button" to="/pharmacy">Explore the pharmacy <span>↗</span></Link>}
      />
      {state.orders.length === 0 ? (
        <Panel title="Order history" subtitle="LIVE FULFILLMENT">
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📦</div>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>No orders placed yet</h4>
            <p className="demo-muted" style={{ maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Your pharmacy order archive is currently empty. You can browse 47,335 verified medicines in our inventory with temperature-monitored doorstep delivery.
            </p>
            <Link className="button" to="/pharmacy">Browse 47,335 medicines <span>↗</span></Link>
          </div>
        </Panel>
      ) : (
        <div className="orders-list">
          {state.orders.map(item => {
            const isCancelled = item.status === 'Cancelled'
            return (
              <Panel key={item.id}>
                <div className="order-list-heading">
                  <div>
                    <span className="eyebrow">{item.id} · {item.date}</span>
                    <h3>{item.items.map(medicine => medicine.name).join(' + ')}</h3>
                  </div>
                  <Badge>{item.status}</Badge>
                </div>
                <div className="demo-list-row">
                  <span>{item.items.reduce((sum, medicine) => sum + medicine.quantity, 0)} items · Doorstep delivery</span>
                  <strong>₹{item.total}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <Link className="text-link" to={`/orders/${item.id}`}>View order & tracking ↗</Link>
                  {!isCancelled && item.status !== 'Delivered' && (
                    <button
                      type="button"
                      className="button secondary"
                      style={{ borderColor: '#ef4444', color: '#b91c1c', fontSize: '12px', padding: '5px 12px' }}
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to cancel order ${item.id}?`)) {
                          update(prev => ({
                            ...prev,
                            order: false,
                            orders: prev.orders.map(o => o.id === item.id ? { ...o, status: 'Cancelled' } : o)
                          }))
                          notify?.(`Order ${item.id} has been cancelled.`)
                        }
                      }}
                    >
                      Cancel Order ✕
                    </button>
                  )}
                  {isCancelled && (
                    <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>Cancelled ✕</span>
                  )}
                </div>
              </Panel>
            )
          })}
        </div>
      )}
    </>
  )
}

function DoctorPrescriptionsView({ notify, onSwitchToPatient }: Props & { onSwitchToPatient?: () => void }) {
  const [prescriptionsList, setPrescriptionsList] = useState<any[]>(() => getSharedPrescriptions())

  useEffect(() => {
    const syncRx = () => {
      setPrescriptionsList(getSharedPrescriptions())
    }
    syncRx()
    window.addEventListener('storage', syncRx)
    window.addEventListener('iryotek_prescription_updated', syncRx)
    const interval = setInterval(syncRx, 1200)
    return () => {
      window.removeEventListener('storage', syncRx)
      window.removeEventListener('iryotek_prescription_updated', syncRx)
      clearInterval(interval)
    }
  }, [])

  const [search, setSearch] = useState('')
  const [editingRx, setEditingRx] = useState<any | null>(null)
  const [isNewRx, setIsNewRx] = useState(false)
  const [selectedReceiptRx, setSelectedReceiptRx] = useState<any | null>(null)

  // Edit form state
  const [editDiagnosis, setEditDiagnosis] = useState('')
  const [editAdvice, setEditAdvice] = useState('')
  const [editFollowUp, setEditFollowUp] = useState('')
  const [editMeds, setEditMeds] = useState<{ name: string; dose: string; frequency: string; duration: string }[]>([])

  // New Rx form state
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientAge, setNewPatientAge] = useState('32')
  const [newPatientGender, setNewPatientGender] = useState('Male')
  const [newToken, setNewToken] = useState('046')

  const openEdit = (rx: any) => {
    setEditingRx(rx)
    setIsNewRx(false)
    setEditDiagnosis(rx.diagnosis || '')
    setEditAdvice(rx.advice || '')
    setEditFollowUp(rx.followUp || '7 days')
    setEditMeds(Array.isArray(rx.medicines) ? JSON.parse(JSON.stringify(rx.medicines)) : [])
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }

  const openNew = () => {
    setEditingRx({
      id: `rx_${Date.now().toString().slice(-4)}`,
      token: `0${Math.floor(Math.random() * 50) + 47}`,
      patientName: '',
      patientAge: 30,
      patientGender: 'Male',
      date: new Date().toISOString().split('T')[0],
      status: 'Digitally Signed & Active'
    })
    setIsNewRx(true)
    setNewPatientName('')
    setNewPatientAge('30')
    setNewPatientGender('Male')
    setNewToken(String(Math.floor(Math.random() * 50) + 47).padStart(3, '0'))
    setEditDiagnosis('')
    setEditAdvice('Take medications as prescribed with meals. Maintain hydration.')
    setEditFollowUp('7 days')
    setEditMeds([{ name: 'Paracetamol 500 mg (IP)', dose: '500 mg', frequency: '1 tablet twice daily', duration: '5 days' }])
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }

  const handleMedChange = (index: number, field: string, value: any) => {
    setEditMeds(prev => prev.map((m, idx) => idx === index ? { ...m, [field]: value } : m))
  }

  const addMedRow = () => {
    setEditMeds(prev => [...prev, { name: '', dose: '1 tablet', frequency: '1 tablet twice daily after meals', duration: '5 days' }])
  }

  const removeMedRow = (index: number) => {
    setEditMeds(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleSaveRx = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRx) return

    const patientName = isNewRx ? (newPatientName.trim() || 'Treated Patient') : editingRx.patientName
    const patientAge = isNewRx ? parseInt(newPatientAge, 10) || 30 : editingRx.patientAge
    const patientGender = isNewRx ? newPatientGender : editingRx.patientGender
    const token = isNewRx ? newToken : editingRx.token

    const updatedRx = {
      ...editingRx,
      patientName,
      patientAge,
      patientGender,
      token,
      diagnosis: editDiagnosis.trim() || 'Clinical assessment verified',
      medicines: editMeds.flatMap(m => {
        const parts = m.name.split(',').map(s => s.trim()).filter(Boolean)
        if (parts.length > 1) {
          return parts.map(p => ({
            name: p,
            dose: m.dose || '1 tablet as directed',
            frequency: m.frequency || 'After meals',
            duration: m.duration || '5 days',
            price: Number((m as any).price) || 120
          }))
        }
        return [{
          name: m.name.trim(),
          dose: m.dose || '1 tablet as directed',
          frequency: m.frequency || 'After meals',
          duration: m.duration || '5 days',
          price: Number((m as any).price) || 120
        }]
      }).filter(m => m.name.length > 0),
      advice: editAdvice.trim() || 'Follow general medical advice.',
      followUp: editFollowUp.trim() || 'As directed',
      status: 'Updated & Digitally Signed'
    }

    let newList: any[]
    if (isNewRx) {
      newList = [updatedRx, ...prescriptionsList]
    } else {
      newList = prescriptionsList.map(r => r.id === editingRx.id ? updatedRx : r)
    }

    setPrescriptionsList(newList)
    saveSharedPrescription(updatedRx)

    setEditingRx(null)
    setIsNewRx(false)
    notify(`Prescription for ${patientName} (Token #${token}) has been updated & signed!`)
  }

  const filtered = prescriptionsList.filter(rx =>
    `${rx.patientName} ${rx.token} ${rx.diagnosis} ${rx.medicines?.map((m: any) => m.name).join(' ')}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <>
      <PageHeading
        label="DOCTOR / PRESCRIPTION MANAGEMENT DESK"
        title="Treated Patients & Digital e-Prescriptions"
        description="Review, modify dosages, adjust treatment protocols, and issue digitally signed e-prescriptions for all treated patients."
        action={
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {prescriptionsList.length > 0 && (
              <button
                className="button secondary"
                type="button"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => {
                  if (confirm('Delete all mock & test prescriptions? You can then test your own prescriptions cleanly.')) {
                    clearAllSharedPrescriptions()
                    notify('All mock and test prescriptions deleted. Ready for clean testing!')
                  }
                }}
              >
                Clear All Prescriptions ✕
              </button>
            )}
            {onSwitchToPatient && (
              <button
                type="button"
                className="button secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={onSwitchToPatient}
              >
                Patient View 👤
              </button>
            )}
            <button className="button" type="button" onClick={openNew}>
              + Issue New e-Prescription ↗
            </button>
          </div>
        }
      />

      <div className="demo-metric-grid">
        <Metric label="PATIENTS TREATED" value={String(prescriptionsList.length)} note="Issued e-prescriptions on record" />
        <Metric label="MEDICATIONS ACTIVE" value={String(prescriptionsList.reduce((acc, curr) => acc + (curr.medicines?.length || 0), 0))} note="Dispensed via hospital catalog" />
        <Metric label="COUNCIL AUTHENTICATION" value="Verified" note="MCI / NMC Digital Key verified" />
        <Metric label="DISPENSE ACCURACY" value="100" unit="%" note="Barcoded pharmaceutical safety" />
      </div>

      {editingRx && (
        <Panel
          title={isNewRx ? "Compose New Patient e-Prescription" : `Edit Prescription — ${editingRx.patientName}`}
          subtitle={`TOKEN #${isNewRx ? newToken : editingRx.token} · CLINICAL DISPENSE PORTAL`}
        >
          <form onSubmit={handleSaveRx} style={{ maxWidth: 880 }}>
            {isNewRx ? (
              <div className="demo-form-grid" style={{ marginBottom: 15 }}>
                <label>Patient Full Name
                  <input type="text" value={newPatientName} onChange={e => setNewPatientName(e.target.value)} placeholder="e.g. Rahul Sharma" required />
                </label>
                <label>Token ID
                  <input type="text" value={newToken} onChange={e => setNewToken(e.target.value)} required />
                </label>
                <label>Patient Age
                  <input type="number" value={newPatientAge} onChange={e => setNewPatientAge(e.target.value)} required />
                </label>
                <label>Gender
                  <select value={newPatientGender} onChange={e => setNewPatientGender(e.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </label>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <span className="demo-user-avatar" style={{ width: 38, height: 38 }}>
                  {editingRx.patientName.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h4 style={{ margin: 0, fontSize: 14 }}>{editingRx.patientName} ({editingRx.patientAge} yrs · {editingRx.patientGender})</h4>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Token #{editingRx.token} · Prescribed: {editingRx.date}</p>
                </div>
                <Badge style={{ marginLeft: 'auto' }}>CLINICAL RECORD</Badge>
              </div>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Clinical Diagnosis / Chief Complaint</span>
              <input
                type="text"
                value={editDiagnosis}
                onChange={e => setEditDiagnosis(e.target.value)}
                placeholder="e.g. Acute Bronchitis, Type 2 Diabetes, Stage 1 Hypertension..."
                required
              />
            </label>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Prescribed Medicines ({editMeds.length} items)</span>
                <button type="button" className="text-link" style={{ fontSize: 12, color: 'var(--teal)' }} onClick={addMedRow}>
                  + Add Medicine Row
                </button>
              </div>

              {editMeds.map((med, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1.5fr 1fr auto', gap: 10, alignItems: 'center', marginBottom: 8, padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                  <div>
                    <span style={{ fontSize: 9, color: '#64748b', display: 'block', marginBottom: 3 }}>Medicine Name</span>
                    <MedicineDropdownInput
                      value={med.name}
                      onChange={(val, selected) => {
                        handleMedChange(idx, 'name', val)
                        if (selected && (selected as any).price) {
                          handleMedChange(idx, 'price', Number((selected as any).price) || 120)
                        }
                      }}
                      onSelectDose={(dose) => {
                        if (!med.dose || med.dose === '1 tablet' || med.dose === '500 mg') {
                          handleMedChange(idx, 'dose', dose)
                        }
                      }}
                      placeholder="e.g. Azithromycin 500 mg"
                      required
                      inputStyle={{ fontSize: 12, padding: '6px 28px 6px 8px' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: 9, color: '#64748b', display: 'block', marginBottom: 3 }}>Strength / Dose</span>
                    <input
                      type="text"
                      value={med.dose}
                      onChange={e => handleMedChange(idx, 'dose', e.target.value)}
                      placeholder="500 mg"
                      style={{ fontSize: 12, padding: '6px 8px' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: 9, color: '#64748b', display: 'block', marginBottom: 3 }}>Frequency & Intake</span>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={e => handleMedChange(idx, 'frequency', e.target.value)}
                      placeholder="1 tablet after meals"
                      style={{ fontSize: 12, padding: '6px 8px' }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: 9, color: '#64748b', display: 'block', marginBottom: 3 }}>Duration</span>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={e => handleMedChange(idx, 'duration', e.target.value)}
                      placeholder="5 days"
                      style={{ fontSize: 12, padding: '6px 8px' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedRow(idx)}
                    title="Remove medicine"
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: 16, cursor: 'pointer', padding: '4px 6px', marginTop: 12 }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="demo-form-grid" style={{ marginBottom: 20 }}>
              <label>Special Instructions & Dietary Advice
                <textarea
                  rows={2}
                  value={editAdvice}
                  onChange={e => setEditAdvice(e.target.value)}
                  placeholder="Dietary precautions, hydration advice, precautions..."
                />
              </label>
              <label>Follow-up Schedule
                <input
                  type="text"
                  value={editFollowUp}
                  onChange={e => setEditFollowUp(e.target.value)}
                  placeholder="e.g. 7 days, 2 weeks, SOS if fever persists"
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="button">
                Save & Update Prescription ✓
              </button>
              <button type="button" className="button secondary" onClick={() => { setEditingRx(null); setIsNewRx(false) }}>
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title="Treated Patients Prescriptions Archive" subtitle={`${filtered.length} PATIENT RECORD(S)`}>
        <div className="demo-filter-row" style={{ marginBottom: 18 }}>
          <label className="demo-search">
            <span>⌕</span>
            <input
              placeholder="Search treated patient name, token ID, diagnosis, or medicine..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </label>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>📝</div>
            <h4 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>
              {search ? 'No treated patient prescriptions match your search query.' : 'No prescriptions on record'}
            </h4>
            <p className="demo-muted" style={{ fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
              {search
                ? 'Try searching with a different token ID, patient name, or medicine.'
                : 'You have not issued any digital e-prescriptions yet. Click below to compose and issue your first prescription.'}
            </p>
            {!search && (
              <button className="button" type="button" onClick={openNew} style={{ fontSize: '13px' }}>
                + Issue First e-Prescription ↗
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(rx => (
              <article key={rx.id} style={{ border: '1px solid var(--line)', padding: '20px', background: '#ffffff', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="demo-user-avatar" style={{ width: 42, height: 42, fontSize: 12 }}>
                      {(rx.patientName || 'PT').slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16 }}>{rx.patientName || 'Registered Patient'}</h4>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
                        Token #{rx.token || '001'} · {rx.patientAge || '30'} yrs ({rx.patientGender || 'Adult'}) · Prescribed on {rx.date || 'Today'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge><i className="status-dot" /> {rx.status}</Badge>
                    <button
                      type="button"
                      className="button"
                      style={{ padding: '6px 14px', fontSize: 12, background: '#0e7490', borderColor: '#0e7490' }}
                      onClick={() => setSelectedReceiptRx(rx)}
                    >
                      <span>📥</span> E-receipt ↗
                    </button>
                    <button
                      type="button"
                      className="button"
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={() => openEdit(rx)}
                    >
                      Check & Edit Prescription ✎
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      style={{ padding: '6px 12px', fontSize: 12, color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={() => {
                        if (window.confirm(`Delete prescription #${rx.id} for ${rx.patientName}?`)) {
                          deleteSharedPrescription(rx.id)
                          notify?.(`Prescription #${rx.id} deleted.`)
                        }
                      }}
                    >
                      Delete ✕
                    </button>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 6, marginBottom: 14, fontSize: 12 }}>
                  <strong style={{ color: '#0f172a' }}>Diagnosis: </strong>
                  <span style={{ color: '#0369a1', fontWeight: 600 }}>{rx.diagnosis}</span>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                    Prescribed Medicines ({rx.medicines?.length || 0})
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {rx.medicines?.map((m: any, mIdx: number) => (
                      <div key={mIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: '#f1f5f9', borderRadius: 4, fontSize: 12 }}>
                        <div>
                          <strong>{m.name}</strong> {m.dose && <span style={{ color: '#64748b' }}>({m.dose})</span>}
                        </div>
                        <div style={{ color: '#059669', fontSize: 11, fontWeight: 500 }}>
                          {m.frequency} · {m.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10, fontSize: 11, color: '#64748b', flexWrap: 'wrap', gap: 8 }}>
                  <span><strong>Instructions: </strong>{rx.advice}</span>
                  <span><strong>Follow-up: </strong>{rx.followUp}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      {/* Official Doctor & Patient E-Receipt Modal */}
      <AppointmentReceiptModal
        isOpen={Boolean(selectedReceiptRx)}
        onClose={() => setSelectedReceiptRx(null)}
        prescription={selectedReceiptRx}
        appointment={selectedReceiptRx ? {
          id: selectedReceiptRx.appointmentId || selectedReceiptRx.token || selectedReceiptRx.id,
          tokenNo: selectedReceiptRx.token || selectedReceiptRx.id,
          doctor: selectedReceiptRx.doctorName || 'Dr. Specialist',
          doctorQualification: selectedReceiptRx.specialty || 'MBBS, MD',
          specialty: selectedReceiptRx.specialty || selectedReceiptRx.doctorSpecialty || 'General Medicine',
          date: selectedReceiptRx.date || 'Today',
          time: '10:30 AM',
          patientName: selectedReceiptRx.patientName,
          patientAge: selectedReceiptRx.patientAge,
          patientGender: selectedReceiptRx.patientGender,
          hospital: 'Iryotek Super Speciality Hospital',
          hospitalAddress: 'Central Medical Enclave, Sector 12',
          fee: 500,
          paymentMethod: 'UPI (Prepaid)',
          status: 'Confirmed'
        } : null}
      />
    </>
  )
}

function PrescriptionsPage({ notify = () => {} }: { notify?: (message: string) => void }) {
  const { state, update } = useContext(DemoContext)
  const user = getStoredAuthUser()
  const navigate = useNavigate()

  const [viewMode, setViewMode] = useState<'patient' | 'doctor'>(user?.role === 'Doctor' ? 'doctor' : 'patient')

  const [livePrescriptions, setLivePrescriptions] = useState<SharedPrescription[]>(() => getSharedPrescriptions())
  const [selectedReceiptRx, setSelectedReceiptRx] = useState<SharedPrescription | null>(null)

  useEffect(() => {
    const syncRx = () => {
      setLivePrescriptions(getSharedPrescriptions())
    }
    syncRx()
    window.addEventListener('storage', syncRx)
    window.addEventListener('iryotek_prescription_updated', syncRx)
    const interval = setInterval(syncRx, 1500)
    return () => {
      window.removeEventListener('storage', syncRx)
      window.removeEventListener('iryotek_prescription_updated', syncRx)
      clearInterval(interval)
    }
  }, [])

  const syncSingleMedToCart = (medName: string, medDose?: string) => {
    const names = medName.split(',').map(s => s.trim()).filter(Boolean)
    if (names.length > 1) {
      const itemsToAdd: any[] = []
      names.forEach((singleName, sIdx) => {
        const found = mockMedicines.find(m => m.name.toLowerCase().includes(singleName.toLowerCase().slice(0, 8)))
        const price = Number(found?.price) || 120
        const itemObj = {
          id: found ? found.id : Math.floor(Math.random() * 900) + 100 + sIdx,
          name: singleName,
          category: found ? found.category : 'Prescription Medicine',
          dose: medDose || (found?.dose || 'As prescribed by doctor'),
          brand: found?.brand || 'Iryotek Verified Formulary',
          price: price,
          stock: found ? found.stock : 50,
          prescription: true,
          description: 'Doctor prescribed medication',
          quantity: 1
        }
        itemsToAdd.push(itemObj)
      })
      update(previous => {
        const updatedCart = [...previous.cart]
        itemsToAdd.forEach(item => {
          if (!updatedCart.some(m => m.name.toLowerCase() === item.name.toLowerCase())) {
            updatedCart.push(item)
          }
        })
        return {
          ...previous,
          prescription: true,
          cart: updatedCart
        }
      })
      notify(`Prescription medications added to cart.`)
      navigate('/cart')
      return
    }

    const cleanName = names[0] || medName
    const foundMed = mockMedicines.find(m => m.name.toLowerCase().includes(cleanName.toLowerCase().slice(0, 8)))
    const price = Number(foundMed?.price) || 120
    const finalItem = {
      id: foundMed ? foundMed.id : Math.floor(Math.random() * 900) + 100,
      name: cleanName,
      category: foundMed ? foundMed.category : 'Prescription Medicine',
      dose: medDose || (foundMed?.dose || 'As prescribed by doctor'),
      brand: foundMed?.brand || 'Iryotek Verified Formulary',
      price: price,
      stock: foundMed ? foundMed.stock : 50,
      prescription: true,
      description: 'Doctor prescribed medication',
      quantity: 1
    }
    update(previous => ({
      ...previous,
      prescription: true,
      cart: previous.cart.some(m => m.name.toLowerCase() === finalItem.name.toLowerCase())
        ? previous.cart
        : [...previous.cart, finalItem]
    }))
    notify(`Prescription item "${finalItem.name}" added to cart.`)
    navigate('/cart')
  }

  const syncAllMedicinesToCart = (rx: SharedPrescription) => {
    if (!rx.medicines || rx.medicines.length === 0) return
    const newItems: any[] = []
    
    rx.medicines.forEach((item, idx) => {
      const parts = item.name.split(',').map(s => s.trim()).filter(Boolean)
      const itemPrice = Number((item as any).price)
      if (parts.length > 1) {
        parts.forEach((p, pIdx) => {
          const found = mockMedicines.find(m => m.name.toLowerCase().includes(p.toLowerCase().slice(0, 8)))
          const price = itemPrice || Number(found?.price) || Number((rx as any).price) || 120
          newItems.push({
            id: found ? found.id : Math.floor(Math.random() * 900) + 100 + idx * 10 + pIdx,
            name: p,
            category: (item as any).category || (found ? found.category : 'Prescription Medicine'),
            dose: item.dosage || item.dose || (found?.dose || 'As directed'),
            brand: (item as any).brand || found?.brand || 'Iryotek Verified Formulary',
            price: price,
            stock: found ? found.stock : 50,
            prescription: true,
            description: item.instructions || found?.description || 'Prescribed medication',
            quantity: 1
          })
        })
      } else {
        const found = mockMedicines.find(m => m.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 8)))
        const price = itemPrice || Number(found?.price) || Number((rx as any).price) || 120
        newItems.push({
          id: found ? found.id : Math.floor(Math.random() * 900) + 100 + idx,
          name: item.name,
          category: (item as any).category || (found ? found.category : 'Prescription Medicine'),
          dose: item.dosage || item.dose || (found?.dose || 'As directed'),
          brand: (item as any).brand || found?.brand || 'Iryotek Verified Formulary',
          price: price,
          stock: found ? found.stock : 50,
          prescription: true,
          description: item.instructions || found?.description || 'Prescribed medication',
          quantity: 1
        })
      }
    })

    // Strict Prescription Sync:
    // When ordering an e-prescription, set cart strictly to ONLY the prescribed medications for this prescription
    update(previous => ({
      ...previous,
      prescription: true,
      cart: newItems
    }))

    notify(`All ${newItems.length} prescribed medications synced to cart! Proceeding to checkout.`)
    navigate('/cart')
  }

  // Filter for user or show all active prescriptions
  const uName = (user?.displayName || '').toLowerCase().trim()
  const uEmail = (user?.email || '').toLowerCase().trim()

  const userRxs = livePrescriptions.filter(rx => {
    if (!uName && !uEmail) return true
    const pName = (rx.patientName || '').toLowerCase()
    const pEmail = (rx.patientEmail || '').toLowerCase()
    if (uEmail && pEmail && uEmail === pEmail) return true
    if (uName && pName && (pName.includes(uName) || uName.includes(pName))) return true
    return false
  })

  // If role is Doctor or switched to Doctor mode, show Doctor's treated patients prescriptions management!
  if (viewMode === 'doctor') {
    return <DoctorPrescriptionsView page="prescriptions" notify={notify} onSwitchToPatient={() => setViewMode('patient')} />
  }

  // If user-specific matched, show them; otherwise show all live prescriptions so patient sees latest issued e-Rx
  const displayRxs = userRxs.length > 0 ? userRxs : livePrescriptions

  return (
    <>
      <PageHeading
        label="PRESCRIPTIONS / YOUR DIGITAL e-PRESCRIPTIONS"
        title="A prescription. Not a shopping list."
        description="Doctor-verified digital e-prescriptions issued during your clinical consultations, linked directly with verified pharmacy inventory (47,335 items)."
        action={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-pulse-dot" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
              Real-time e-Rx Sync Active
            </span>
            {livePrescriptions.length > 0 && (
              <button
                type="button"
                className="button light"
                style={{ fontSize: '11px', padding: '4px 10px', color: '#b91c1c', borderColor: '#fca5a5' }}
                onClick={() => {
                  if (window.confirm('Delete all test prescriptions from this device so you can start fresh?')) {
                    clearAllSharedPrescriptions()
                    setLivePrescriptions([])
                    notify?.('All test prescriptions cleared. You can now test your own clean prescriptions!')
                  }
                }}
              >
                Clear All Test Prescriptions ✕
              </button>
            )}
            <button
              type="button"
              className="button"
              style={{ fontSize: '11px', padding: '5px 12px' }}
              onClick={() => setViewMode('doctor')}
            >
              Doctor Prescription Desk (Compose & Edit) 🩺
            </button>
          </div>
        }
      />

      {displayRxs.length === 0 ? (
        <Panel title="Prescriptions archive" subtitle="CLINICAL DISPENSE PORTAL">
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.6 }}>℞</div>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem' }}>No Active Digital Prescriptions Yet</h4>
            <p className="demo-muted" style={{ maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
              When your doctor issues or updates an e-prescription during or after your consultation, it will appear here instantly with dosage instructions and one-click doorstep pharmacy delivery.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link className="button" to="/appointments">Book / View Appointments <span>↗</span></Link>
              <Link className="button light" to="/appointments">View My Appointments <span>↗</span></Link>
              <Link className="button light" to="/pharmacy">Browse Pharmacy Catalog <span>↗</span></Link>
            </div>
          </div>
        </Panel>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {displayRxs.map(rx => (
            <Panel
              key={rx.id}
              title={`e-Prescription #${rx.id}`}
              subtitle={`ISSUED: ${rx.date} · TOKEN #${rx.token || '001'}`}
            >
              <div style={{ padding: '4px 0' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '16px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      fontWeight: 700
                    }}>
                      ℞
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0f172a' }}>
                        {rx.doctorName ? (rx.doctorName.startsWith('Dr.') ? rx.doctorName : `Dr. ${rx.doctorName}`) : 'Dr. Consultant Physician'}
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        {rx.doctorSpecialty || 'Consultant Physician'} · Patient: <strong>{rx.patientName || 'Registered Patient'}</strong>
                        {rx.patientAge ? ` (${rx.patientAge} yrs, ${rx.patientGender || 'Adult'})` : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <Badge style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>
                      ✓ {rx.status || 'Digitally Signed & Active'}
                    </Badge>
                    <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                      Ref: {rx.id}
                    </span>
                  </div>
                </div>

                {rx.diagnosis && (
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: '#475569' }}>Clinical Diagnosis / Indication: </span>
                    <strong style={{ color: '#0f172a' }}>{rx.diagnosis}</strong>
                  </div>
                )}

                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', marginBottom: '10px' }}>
                    PRESCRIBED MEDICATIONS & DOSAGE REGIMEN ({rx.medicines?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {rx.medicines && rx.medicines.length > 0 ? (
                      rx.medicines.map((med, mIdx) => (
                        <div
                          key={mIdx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            flexWrap: 'wrap',
                            gap: '10px'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                              💊 {med.name}
                            </div>
                            <div style={{ fontSize: '13px', color: '#475569', marginTop: '3px' }}>
                              <strong>Dosage:</strong> {med.dosage || med.dose || '1 tablet as directed'}
                              {med.frequency ? ` · ${med.frequency}` : ''}
                              {med.duration ? ` · Duration: ${med.duration}` : ''}
                            </div>
                            {med.instructions && med.instructions !== med.dosage && (
                              <div style={{ fontSize: '12px', color: '#059669', marginTop: '3px' }}>
                                ℹ {med.instructions}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className="button light"
                            style={{ fontSize: '12px', padding: '6px 14px' }}
                            onClick={() => syncSingleMedToCart(med.name, med.dosage || med.dose)}
                          >
                            Add to Cart +
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="demo-muted" style={{ margin: 0 }}>Medication details will be updated by doctor shortly.</p>
                    )}
                  </div>
                </div>

                {rx.advice && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#1e40af' }}>
                    <strong>Clinical Advice & Instructions: </strong>{rx.advice}
                    {rx.followUp && <div style={{ marginTop: '4px', fontWeight: 600 }}>Follow-up: {rx.followUp}</div>}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '1px dashed #cbd5e1',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#047857' }}>
                    <span>🛡️</span>
                    <span>National Medical Commission (NMC) Digital Signature Validated. Authentic clinical order.</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="button light"
                      style={{ fontSize: '13px', color: '#b91c1c', borderColor: '#fca5a5' }}
                      onClick={() => {
                        if (window.confirm(`Delete prescription #${rx.id}?`)) {
                          deleteSharedPrescription(rx.id)
                          notify?.(`Prescription #${rx.id} deleted.`)
                        }
                      }}
                    >
                      Delete e-Rx ✕
                    </button>
                    <button
                      type="button"
                      className="button"
                      style={{
                        fontSize: '13px',
                        background: '#0e7490',
                        borderColor: '#0e7490',
                        color: '#ffffff',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(14, 116, 144, 0.25)'
                      }}
                      onClick={() => setSelectedReceiptRx(rx)}
                    >
                      <span>📥</span> Download "E-receipt" <span>↗</span>
                    </button>
                    <button
                      type="button"
                      className="button light"
                      style={{ fontSize: '13px' }}
                      onClick={() => setSelectedReceiptRx(rx)}
                    >
                      🖨️ Print / View Full Rx
                    </button>
                    <button
                      type="button"
                      className="button"
                      style={{ fontSize: '13px', background: '#0f766e', borderColor: '#0f766e' }}
                      onClick={() => syncAllMedicinesToCart(rx)}
                    >
                      Order All Prescribed Medicines (Sync to Cart 🛒) <span>↗</span>
                    </button>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Official Patient E-Receipt & Prescription Modal */}
      <AppointmentReceiptModal
        isOpen={Boolean(selectedReceiptRx)}
        onClose={() => setSelectedReceiptRx(null)}
        prescription={selectedReceiptRx}
        appointment={selectedReceiptRx ? {
          id: selectedReceiptRx.appointmentId || selectedReceiptRx.token || selectedReceiptRx.id,
          tokenNo: selectedReceiptRx.token || selectedReceiptRx.id,
          doctor: selectedReceiptRx.doctorName || 'Dr. Specialist',
          doctorQualification: selectedReceiptRx.specialty || 'MBBS, MD',
          specialty: selectedReceiptRx.specialty || selectedReceiptRx.doctorSpecialty || 'General Medicine',
          date: selectedReceiptRx.date || 'Today',
          time: '10:30 AM',
          patientName: selectedReceiptRx.patientName,
          patientAge: selectedReceiptRx.patientAge,
          patientGender: selectedReceiptRx.patientGender,
          hospital: 'Iryotek Super Speciality Hospital',
          hospitalAddress: 'Central Medical Enclave, Sector 12',
          fee: 500,
          paymentMethod: 'UPI (Prepaid)',
          status: 'Confirmed'
        } : null}
      />
    </>
  )
}

function ProfilePage({ notify }: { notify: Props['notify'] }) {
  const user = getStoredAuthUser()
  const profile = user?.patientProfile

  const [name, setName] = useState(user?.displayName || 'Registered Patient')
  const [age, setAge] = useState(String(profile?.age || ''))
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || 'O+')
  const [address, setAddress] = useState(profile?.address || '')
  const [city, setCity] = useState(profile?.city || '')
  const [pincode, setPincode] = useState(profile?.pincode || '')
  const [systolic, setSystolic] = useState(String(profile?.bloodPressure?.systolic || ''))
  const [diastolic, setDiastolic] = useState(String(profile?.bloodPressure?.diastolic || ''))
  const [pulse, setPulse] = useState(String(profile?.pulseRate || ''))
  const [height, setHeight] = useState(String(profile?.heightCm || ''))
  const [weight, setWeight] = useState(String(profile?.weightKg || ''))
  const [allergiesText, setAllergiesText] = useState(profile?.allergies?.join(', ') || '')
  const [conditionsText, setConditionsText] = useState(profile?.chronicConditions?.join(', ') || '')
  const [surgeriesText, setSurgeriesText] = useState(profile?.pastSurgeries?.join(', ') || '')
  const [medicationsText, setMedicationsText] = useState(profile?.currentMedications?.join(', ') || '')
  const [emergencyName, setEmergencyName] = useState(profile?.emergencyContact?.name || '')
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergencyContact?.phone || '')
  const [emergencyRelation, setEmergencyRelation] = useState(profile?.emergencyContact?.relationship || '')
  const [insProvider, setInsProvider] = useState(profile?.insurance?.provider || '')
  const [insPolicy, setInsPolicy] = useState(profile?.insurance?.policyNumber || '')

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'PT'

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    const heightNum = Number(height) || undefined
    const weightNum = Number(weight) || undefined
    const computedBmi = heightNum && weightNum ? Number((weightNum / ((heightNum / 100) ** 2)).toFixed(1)) : profile?.bmi

    const updatedProfile: PatientHealthProfile = {
      fullName: name,
      age: Number(age) || profile?.age || 30,
      gender: profile?.gender || 'Other',
      bloodGroup,
      address,
      city,
      pincode,
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRelation,
        phone: emergencyPhone,
      },
      heightCm: heightNum,
      weightKg: weightNum,
      bmi: computedBmi,
      bloodPressure: systolic && diastolic ? {
        systolic: Number(systolic),
        diastolic: Number(diastolic)
      } : profile?.bloodPressure,
      pulseRate: Number(pulse) || profile?.pulseRate,
      allergies: allergiesText ? allergiesText.split(',').map(s => s.trim()).filter(Boolean) : [],
      chronicConditions: conditionsText ? conditionsText.split(',').map(s => s.trim()).filter(Boolean) : [],
      pastSurgeries: surgeriesText ? surgeriesText.split(',').map(s => s.trim()).filter(Boolean) : [],
      currentMedications: medicationsText ? medicationsText.split(',').map(s => s.trim()).filter(Boolean) : [],
      familyMedicalHistory: profile?.familyMedicalHistory || '',
      insurance: insProvider && insPolicy ? {
        provider: insProvider,
        policyNumber: insPolicy
      } : profile?.insurance
    }

    updateStoredPatientProfile(updatedProfile)
    notify('Clinical health profile and baseline vitals updated successfully.')
  }

  return (
    <>
      <PageHeading
        label="PROFILE / CLINICAL HEALTH IDENTITY"
        title="Your Health Story, Fully Recorded."
        description="Comprehensive clinical demographics, physical vitals, allergies, and emergency medical credentials."
      />
      <div className="demo-split">
        <Panel title="Patient identity" subtitle={`${initials} / VERIFIED ACCOUNT`}>
          <div className="demo-doctor-inline">
            <span className="demo-user-avatar">{initials}</span>
            <div>
              <h4>{name}</h4>
              <p>{profile?.gender || 'Patient'} · {profile?.age || '—'} years · {profile?.city || 'India'}</p>
            </div>
          </div>
          <div className="demo-list-row"><span>Email</span><span>{user?.email || 'N/A'}</span></div>
          <div className="demo-list-row"><span>Phone</span><span>{user?.phone || 'N/A'}</span></div>
          <div className="demo-list-row"><span>Blood group</span><strong style={{ color: '#0f766e' }}>{bloodGroup}</strong></div>
          <div className="demo-list-row">
            <span>Baseline Vitals</span>
            <span>{profile?.bloodPressure ? `${profile.bloodPressure.systolic}/${profile.bloodPressure.diastolic} mmHg` : 'Pending'}</span>
          </div>
          <div className="demo-list-row">
            <span>Resting pulse</span>
            <span>{profile?.pulseRate ? `${profile.pulseRate} bpm` : 'Pending'}</span>
          </div>
          <div className="demo-list-row">
            <span>Body Mass Index</span>
            <span>{profile?.bmi ? `${profile.bmi} kg/m²` : 'Pending'}</span>
          </div>
          <div className="demo-list-row">
            <span>Allergies</span>
            <span style={{ color: profile?.allergies?.length ? '#dc2626' : 'inherit' }}>
              {profile?.allergies?.length ? profile.allergies.join(', ') : 'No known drug allergies'}
            </span>
          </div>
          <div className="demo-list-row">
            <span>Emergency contact</span>
            <span>{profile?.emergencyContact ? `${profile.emergencyContact.name} (${profile.emergencyContact.relationship})` : 'Not recorded'}</span>
          </div>
          <div className="demo-list-row">
            <span>Insurance</span>
            <span>{profile?.insurance ? `${profile.insurance.provider} · #${profile.insurance.policyNumber}` : 'Direct Cashless'}</span>
          </div>
          <Link className="text-link" to="/records">View structured health record archive ↗</Link>
          <Link className="text-link" to="/claims">Track insurance claims ↗</Link>
        </Panel>

        <Panel title="Edit clinical details & vitals" subtitle="CLINICAL UPDATE FORM">
          <form className="demo-stacked-form" onSubmit={handleSave}>
            <label>Legal full name
              <input value={name} onChange={event => setName(event.target.value)} required maxLength={80} />
            </label>
            <div className="demo-form-grid">
              <label>Age
                <input type="number" min="1" max="120" value={age} onChange={event => setAge(event.target.value)} />
              </label>
              <label>Blood Group
                <select value={bloodGroup} onChange={event => setBloodGroup(event.target.value)}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="demo-form-grid">
              <label>Street address
                <input value={address} onChange={event => setAddress(event.target.value)} placeholder="House / street" />
              </label>
              <label>City & Pincode
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={city} onChange={event => setCity(event.target.value)} placeholder="City" style={{ flex: 2 }} />
                  <input value={pincode} onChange={event => setPincode(event.target.value)} placeholder="Pincode" style={{ flex: 1 }} />
                </div>
              </label>
            </div>

            <div className="demo-form-grid">
              <label>Height (cm)
                <input type="number" value={height} onChange={event => setHeight(event.target.value)} placeholder="e.g. 172" />
              </label>
              <label>Weight (kg)
                <input type="number" value={weight} onChange={event => setWeight(event.target.value)} placeholder="e.g. 68" />
              </label>
            </div>

            <div className="demo-form-grid">
              <label>Blood pressure (Systolic / Diastolic)
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="number" placeholder="120" value={systolic} onChange={event => setSystolic(event.target.value)} />
                  <span>/</span>
                  <input type="number" placeholder="80" value={diastolic} onChange={event => setDiastolic(event.target.value)} />
                </div>
              </label>
              <label>Resting pulse (bpm)
                <input type="number" placeholder="72" value={pulse} onChange={event => setPulse(event.target.value)} />
              </label>
            </div>

            <label>Known allergies (comma-separated)
              <input value={allergiesText} onChange={event => setAllergiesText(event.target.value)} placeholder="e.g. Penicillin, Peanuts, Sulfa" />
            </label>
            <label>Chronic conditions (comma-separated)
              <input value={conditionsText} onChange={event => setConditionsText(event.target.value)} placeholder="e.g. Hypertension, Asthma" />
            </label>
            <label>Past surgeries / major procedures
              <input value={surgeriesText} onChange={event => setSurgeriesText(event.target.value)} placeholder="e.g. Appendectomy (2021)" />
            </label>
            <label>Current daily medications
              <input value={medicationsText} onChange={event => setMedicationsText(event.target.value)} placeholder="e.g. Metformin 500mg, Multivitamin" />
            </label>

            <div className="demo-form-grid">
              <label>Emergency contact name & phone
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={emergencyName} onChange={event => setEmergencyName(event.target.value)} placeholder="Contact Name" style={{ flex: 1 }} />
                  <input value={emergencyPhone} onChange={event => setEmergencyPhone(event.target.value)} placeholder="Phone" style={{ flex: 1 }} />
                </div>
              </label>
              <label>Relationship
                <input value={emergencyRelation} onChange={event => setEmergencyRelation(event.target.value)} placeholder="e.g. Spouse, Parent, Sibling" />
              </label>
            </div>

            <div className="demo-form-grid">
              <label>Health insurance provider
                <input value={insProvider} onChange={event => setInsProvider(event.target.value)} placeholder="e.g. Star Health / HDFC ERGO" />
              </label>
              <label>Policy number
                <input value={insPolicy} onChange={event => setInsPolicy(event.target.value)} placeholder="e.g. SH-982410-01" />
              </label>
            </div>

            <button className="button full-width" type="submit" style={{ marginTop: '0.5rem' }}>
              Save & Synchronize Health Profile <span>✓</span>
            </button>
          </form>
        </Panel>
      </div>
    </>
  )
}

function NotificationsPage() {
  const { state } = useContext(DemoContext)
  const user = getStoredAuthUser()
  const [read, setRead] = useState(false)

  const messages: Array<{ title: string; body: string; link: string; time: string }> = []

  if (user) {
    messages.push({
      title: 'Clinical Profile Active',
      body: `Health identity and baseline physical metrics confirmed for ${user.displayName}.`,
      link: '/profile',
      time: 'RECENT'
    })
  }

  state.appointments.forEach(a => {
    messages.push({
      title: 'Consultation appointment confirmed',
      body: `${a.doctor} (${a.specialty}) · ${a.date} at ${a.time} · Token #${a.id} in live queue`,
      link: '/appointments',
      time: 'ACTIVE'
    })
  })

  if (state.prescription) {
    messages.push({
      title: 'Digital e-prescription issued',
      body: 'Verified digital prescription synchronized with pharmacy catalog (47,335 items).',
      link: '/prescriptions',
      time: 'ACTIVE'
    })
  }

  state.orders.forEach(order => {
    messages.push({
      title: `Pharmacy order ${order.id} ${order.status.toLowerCase()}`,
      body: `${order.items.map(i => i.name).join(', ')} · Total ₹${order.total} · Doorstep logistics active.`,
      link: `/orders/${order.id}`,
      time: 'RECENT'
    })
  })

  state.claims.forEach(claim => {
    messages.push({
      title: `Claim ${claim.id}: ${claim.status}`,
      body: `${claim.title} · ₹${claim.amount.toLocaleString()} · Under policy adjudication.`,
      link: '/claims',
      time: 'ACTIVE'
    })
  })

  if (messages.length === 0) {
    messages.push({
      title: 'Welcome to Iryotek Healthcare',
      body: 'Your clinical notifications from appointments, pharmacy dispatches, and insurance will appear here.',
      link: '/directory',
      time: 'WELCOME'
    })
  }

  return (
    <>
      <PageHeading
        label="NOTIFICATIONS / CLINICAL UPDATES"
        title="A little peace of mind."
        description="Real-time alerts from your consultations, medicine orders, and clinical records."
        action={<button className="text-link" onClick={() => setRead(true)}>{read ? 'All caught up ✓' : 'Mark all as read ✓'}</button>}
      />
      <Panel>
        {messages.map(message => (
          <Link key={message.title + message.body} to={message.link} className={`notification-row ${read ? 'read' : ''}`}>
            <span className="notification-dot" />
            <div>
              <h3>{message.title}</h3>
              <p>{message.body}</p>
            </div>
            <span className="eyebrow">{message.time}</span>
            <span>↗</span>
          </Link>
        ))}
      </Panel>
    </>
  )
}

function DemoEntry({ register, notify }: { register: boolean; notify: Props['notify'] }) {
  return (
    <>
      <PageHeading
        label={register ? 'CREATE ACCOUNT / JOIN IRYOTEK' : 'WELCOME BACK / ACCESS YOUR CARE'}
        title={register ? 'Find your place in better care.' : 'Your care is waiting.'}
        description="Unified portal with real Firebase Auth for patients, 100,000+ clinical doctor profiles, and hospital administration."
      />
      <AuthView initialMode={register ? 'signup' : 'signin'} notify={notify} />
    </>
  )
}

