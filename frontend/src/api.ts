/**
 * API client for Iryotek backend endpoints with local mock fallbacks.
 */
import { doctors as mockDoctors, hospitals as mockHospitals, medicines as mockMedicines, type Medicine as MockMedicine } from './mock-data'
import {
  allIndianHospitals,
  allIndianStates,
  citiesByStateMap,
  sampleRealDoctorsByHospital
} from './data/hospitals-dataset'
import { getDoctorImage, getHospitalImage, getMedicineImage, hasAuthenticMedicinePhoto } from './images'
import { allMedicineCategories } from './data/medicine-categories'
import { allMedicalFields, resolveMedicalField } from './data/medical-fields'

const API_BASE = '/api'
const BACKEND_DIRECT = 'http://localhost:8081/Iryotek/api'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // First attempt via relative proxy (/api/...)
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // If proxy failed, attempt direct backend call
    try {
      const res = await fetch(`${BACKEND_DIRECT}${endpoint}`, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      })
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // Direct call also failed, will throw to fallback
    }
  }
  throw new Error(`API request failed for ${endpoint}`)
}

export interface SystemStats {
  status: string
  doctorsCount: number
  hospitalsCount: number
  medicinesCount: number
  appointmentsCount: number
  satisfactionRate: number
}

export interface ApiDoctor {
  id: number
  doctorId: number
  name: string
  fullName?: string
  email: string
  phone: string
  qualification: string
  specialist: string
  specialty: string
  experience: number
  hospital: string
  hospitalName?: string
  hospitalId: number
  city: string
  state: string
  address: string
  price: number
  rating: string
  timing: string
  image?: string
  bio?: string
  reviews?: number
  languages?: string[]
  numericId?: number
  numericHospitalId?: number
  isRegistered?: boolean
  isNew?: boolean
}

export interface ApiHospital {
  id: number
  name: string
  state: string
  city: string
  address: string
  phone: string
  emergency: boolean
  beds: number
  established: number
  rating: string
  specialties: string[]
  image?: string
}

export interface ApiMedicine {
  id: number
  name: string
  category: string
  dose: string
  brand: string
  price: number
  stock: number
  quantity?: number
  prescription?: boolean
  description?: string
  image?: string | null
  imageUrl?: string
}

export interface MedicineListResponse {
  total: number
  page: number
  limit: number
  totalPages: number
  medicines: ApiMedicine[]
}

export interface DifferentialDiagnosis {
  condition: string
  probability: string
  reasoning: string
}

export interface TriageResult {
  status: string
  isEmergency: boolean
  emergencyReason?: string
  immediateActionPlan?: string[]
  differentialDiagnoses?: DifferentialDiagnosis[]
  recommendedSpecialist?: string
  recommendedSpecialty?: string
  severityLevel?: string
  clinicalDisclaimer?: string
}

export interface AppointmentData {
  doctorId: number
  doctorName?: string
  appointmentDate: string
  appointmentTime: string
  patientName: string
  email?: string
  phone?: string
  symptoms?: string
  hospital?: string
  hospitalCity?: string
  state?: string
  specialty?: string
  fee?: number
}

/**
 * Fetch ecosystem system counts (Doctors, Hospitals, Medicines, Appointments)
 */
export async function getStats(): Promise<SystemStats> {
  try {
    return await request<SystemStats>('/stats')
  } catch {
    return {
      status: 'fallback',
      doctorsCount: 100413,
      hospitalsCount: 1130,
      medicinesCount: 47335,
      appointmentsCount: 1248,
      satisfactionRate: 98.6,
    }
  }
}

function getStoredRegisteredDoctors(): ApiDoctor[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem('iryotek_registered_doctors')
    let list: any[] = []
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) list = parsed
      } catch {}
    }

    // Also include logged-in doctor if role is Doctor
    try {
      const userRaw = localStorage.getItem('iryotek_auth_user')
      if (userRaw) {
        const u = JSON.parse(userRaw)
        if (u && (u.role === 'Doctor' || u.role === 'doctor')) {
          const uEmail = (u.email || '').toLowerCase().trim()
          const exists = list.some(d => (d.email && d.email.toLowerCase().trim() === uEmail) || (d.name && d.name === u.displayName))
          if (!exists) {
            list.unshift({
              id: typeof u.id === 'number' ? u.id : 100416,
              doctorId: typeof u.id === 'number' ? u.id : 100416,
              name: u.displayName || u.fullName || 'Dr. Specialist',
              fullName: u.displayName || u.fullName || 'Dr. Specialist',
              email: u.email || '',
              phone: u.phone || '9876543210',
              specialist: u.specialist || u.specialty || 'General physician',
              specialty: u.specialist || u.specialty || 'General physician',
              hospital: u.hospital || 'Iryotek Network Hospital',
              hospitalName: u.hospital || 'Iryotek Network Hospital',
              city: u.city || 'New Delhi',
              state: u.state || 'National',
              qualification: u.qualification || `MBBS, MD (${u.specialist || u.specialty || 'General physician'})`,
              experience: u.experience || 8,
              price: 600,
              rating: '4.9',
              timing: u.timings || '09:00 AM - 01:00 PM',
              isRegistered: true,
              isNew: true
            })
          }
        }
      }
    } catch {}

    return list.map((doc: any, index: number) => {
      const id = typeof doc.id === 'number' ? doc.id : (100414 + index)
      const cleanName = (doc.name || doc.fullName || doc.displayName || 'Dr. Specialist')
        .replace(/\s*\([^)]*\)$/, '')
      const specialty = doc.specialty || doc.specialist || 'General physician'
      const hosp = doc.hospital || doc.hospitalName || 'Care Medical Center'
      const city = doc.city || 'New Delhi'
      const state = doc.state || 'National'
      return {
        id,
        doctorId: id,
        name: cleanName.startsWith('Dr.') ? cleanName : `Dr. ${cleanName}`,
        fullName: cleanName,
        email: doc.email || '',
        phone: doc.phone || '9876543210',
        qualification: doc.qualification || `MBBS, MD (${specialty})`,
        specialist: specialty,
        specialty: specialty,
        experience: doc.experience || 8,
        hospital: hosp,
        hospitalName: hosp,
        hospitalId: doc.hospitalId || 1,
        city,
        state,
        address: doc.address || `${hosp}, ${city}`,
        price: doc.price || 500,
        rating: doc.rating || '4.9',
        timing: doc.timing || '09:00 AM - 01:00 PM',
        image: getDoctorImage(doc),
        bio: `${doc.qualification || `Experienced ${specialty}`} with ${doc.experience || 8} years of clinical practice at ${hosp}.`,
        reviews: 28,
        languages: ['English', 'Hindi'],
        isRegistered: true,
        isNew: true
      }
    })
  } catch {
    return []
  }
}

function filterDoctorsList(docs: ApiDoctor[], params: { search?: string; specialty?: string; city?: string; state?: string; hospitalId?: number | string }): ApiDoctor[] {
  let filtered = [...docs]
  if (params.hospitalId) {
    const hid = Number(params.hospitalId)
    filtered = filtered.filter(d => d.hospitalId === hid)
  }
  if (params.state && params.state !== 'All states') {
    const st = params.state.toLowerCase().trim()
    filtered = filtered.filter(d => d.state && d.state.toLowerCase() === st)
  }
  if (params.city && params.city !== 'All cities') {
    const c = params.city.toLowerCase().trim()
    filtered = filtered.filter(d => d.city && d.city.toLowerCase() === c)
  }
  if (params.specialty && params.specialty !== 'All specialties') {
    const spec = params.specialty.toLowerCase().trim()
    const resolved = resolveMedicalField(params.specialty)
    filtered = filtered.filter(d => {
      const dSpec = (d.specialty || '').toLowerCase()
      const dTitle = (d.specialist || '').toLowerCase()
      if (dSpec === spec || dTitle === spec) return true
      if (resolved) {
        if (dSpec === resolved.name.toLowerCase() || dTitle === resolved.specialistTitle.toLowerCase()) return true
        if ((resolved.aliases || []).some(a => dSpec.includes(a) || dTitle.includes(a))) return true
      }
      return false
    })
  }
  if (params.search && params.search.trim()) {
    const s = params.search.toLowerCase().trim()
    const resolvedSearch = resolveMedicalField(s)
    filtered = filtered.filter(d => {
      const text = `${d.name} ${d.fullName || ''} ${d.specialty} ${d.specialist || ''} ${d.city} ${d.hospital} ${d.email} ${d.qualification || ''}`.toLowerCase()
      if (text.includes(s)) return true
      if (resolvedSearch && (
        (d.specialty || '').toLowerCase() === resolvedSearch.name.toLowerCase() ||
        (d.specialist || '').toLowerCase() === resolvedSearch.specialistTitle.toLowerCase() ||
        (resolvedSearch.aliases || []).some(a => (d.specialty || '').toLowerCase().includes(a) || (d.specialist || '').toLowerCase().includes(a))
      )) {
        return true
      }
      return false
    })
  }
  return filtered
}

let fullDoctorsCache: ApiDoctor[] | null = null
let fullDoctorsPromise: Promise<ApiDoctor[]> | null = null

export async function loadAllDoctors(): Promise<ApiDoctor[]> {
  if (fullDoctorsCache) return fullDoctorsCache
  if (!fullDoctorsPromise) {
    fullDoctorsPromise = (async () => {
      try {
        if (typeof window !== 'undefined') {
          const res = await fetch('/data/doctors.json')
          if (!res.ok) throw new Error('Failed to load doctors.json')
          const rawData = await res.json()
          const mapped: ApiDoctor[] = rawData.map((d: any) => ({
            ...d,
            id: typeof d.id === 'number' ? d.id : (parseInt(String(d.id).replace(/\D/g, ''), 10) || 1),
            doctorId: typeof d.id === 'number' ? d.id : (parseInt(String(d.id).replace(/\D/g, ''), 10) || 1),
            numericId: typeof d.id === 'number' ? d.id : (parseInt(String(d.id).replace(/\D/g, ''), 10) || 1),
            fullName: d.name,
            specialist: d.specialty,
            hospitalName: d.hospital,
            hospitalId: d.hospitalId,
            numericHospitalId: d.hospitalId,
            address: `${d.hospital}, ${d.city}`,
            image: getDoctorImage(d),
            languages: ['English', 'Hindi'],
            bio: `${d.qualification || 'Specialist'} with ${d.experience} years of clinical practice at ${d.hospital}.`,
            reviews: 30 + (((typeof d.id === 'number' ? d.id : 1)) % 50),
          }))
          fullDoctorsCache = mapped
          return mapped
        }
        return mockDoctors as unknown as ApiDoctor[]
      } catch {
        return mockDoctors as unknown as ApiDoctor[]
      }
    })()
  }
  return fullDoctorsPromise
}

if (typeof window !== 'undefined') {
  setTimeout(() => { loadAllDoctors().catch(() => {}) }, 50)
}

/**
 * Fetch doctors with filtering and pagination
 */
export async function getDoctors(params: {
  search?: string
  specialty?: string
  city?: string
  state?: string
  hospitalId?: number | string
  limit?: number
  page?: number
} = {}): Promise<ApiDoctor[]> {
  const localMatching = filterDoctorsList(getStoredRegisteredDoctors(), params)

  try {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.specialty && params.specialty !== 'All specialties') query.set('specialty', params.specialty)
    if (params.city && params.city !== 'All cities') query.set('city', params.city)
    if (params.state && params.state !== 'All states') query.set('state', params.state)
    if (params.hospitalId) query.set('hospitalId', String(params.hospitalId))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.page) query.set('page', String(params.page))

    const result = await request<ApiDoctor[]>(`/doctors?${query.toString()}`)
    if (Array.isArray(result) && result.length > 0) {
      const formatted = result.map(doc => ({
        ...doc,
        name: doc.name || doc.fullName || 'Dr. Specialist',
        specialty: doc.specialty || doc.specialist || 'General physician',
        hospital: doc.hospital || doc.hospitalName || 'Care Medical Center',
        image: getDoctorImage(doc),
        languages: ['English', 'Hindi'],
        bio: `${doc.qualification || 'Experienced specialist'} with ${doc.experience || 8} years of dedicated clinical practice at ${doc.hospital || 'leading medical center'}.`,
        reviews: 24 + (doc.id % 40),
      }))

      // Merge local matching doctors at the top, without duplicates
      const seenEmails = new Set<string>()
      const seenIds = new Set<number>()
      const merged: ApiDoctor[] = []

      for (const d of localMatching) {
        merged.push(d)
        if (d.email) seenEmails.add(d.email.toLowerCase())
        if (d.id) seenIds.add(d.id)
      }

      for (const d of formatted) {
        const emailKey = d.email ? d.email.toLowerCase() : ''
        if ((!emailKey || !seenEmails.has(emailKey)) && !seenIds.has(d.id)) {
          merged.push(d)
          if (emailKey) seenEmails.add(emailKey)
          seenIds.add(d.id)
        }
      }

      return merged
    }
    throw new Error('Empty backend result')
  } catch {
    // Check if background load is in progress or completed
    if (!fullDoctorsCache && fullDoctorsPromise) {
      try {
        await fullDoctorsPromise
      } catch {}
    } else if (!fullDoctorsCache && typeof window !== 'undefined') {
      try {
        await loadAllDoctors()
      } catch {}
    }

    const dataset = fullDoctorsCache || mockDoctors
    let sourceDocs: any[] = []
    if (params.hospitalId) {
      const hid = Number(params.hospitalId)
      sourceDocs = dataset.filter(d => (d.numericHospitalId === hid || d.hospitalId === hid || d.hospitalId === String(hid)))
      if (sourceDocs.length === 0 && sampleRealDoctorsByHospital[hid]) {
        sourceDocs = sampleRealDoctorsByHospital[hid]
      }
    } else {
      sourceDocs = dataset
    }

    let filtered = [...sourceDocs]
    if (params.search) {
      const s = params.search.toLowerCase()
      const resolvedSearch = resolveMedicalField(s)
      filtered = filtered.filter(d => {
        const text = `${d.name} ${d.specialty} ${d.specialist || ''} ${d.city || ''} ${d.hospital || ''} ${d.qualification || ''}`.toLowerCase()
        if (text.includes(s)) return true
        if (resolvedSearch && (
          (d.specialty || '').toLowerCase() === resolvedSearch.name.toLowerCase() ||
          (d.specialist || '').toLowerCase() === resolvedSearch.specialistTitle.toLowerCase() ||
          (resolvedSearch.aliases || []).some(a => (d.specialty || '').toLowerCase().includes(a) || (d.specialist || '').toLowerCase().includes(a))
        )) {
          return true
        }
        return false
      })
    }
    if (params.specialty && params.specialty !== 'All specialties') {
      const spec = params.specialty.toLowerCase()
      const resolved = resolveMedicalField(params.specialty)
      filtered = filtered.filter(d => {
        const dSpec = (d.specialty || '').toLowerCase()
        const dTitle = (d.specialist || '').toLowerCase()
        if (dSpec === spec || dTitle === spec) return true
        if (resolved) {
          if (dSpec === resolved.name.toLowerCase() || dTitle === resolved.specialistTitle.toLowerCase()) return true
          if ((resolved.aliases || []).some(a => dSpec.includes(a) || dTitle.includes(a))) return true
        }
        return false
      })
    }
    if (params.city && params.city !== 'All cities') {
      const c = params.city.toLowerCase()
      filtered = filtered.filter(d => d.city && d.city.toLowerCase() === c)
    }
    if (params.state && params.state !== 'All states') {
      const st = params.state.toLowerCase()
      filtered = filtered.filter(d => d.state && d.state.toLowerCase() === st)
    }

    const page = params.page || 1
    const limit = params.limit || 30
    const paged = filtered.slice((page - 1) * limit, page * limit)

    const mapped: ApiDoctor[] = paged.map((d, index) => {
      const hosp = allIndianHospitals.find(h => h.numericId === (d.numericHospitalId || Number(d.hospitalId))) || allIndianHospitals[0]
      const numId = typeof d.numericId === 'number' && !isNaN(d.numericId)
        ? d.numericId
        : (typeof d.id === 'number' && !isNaN(d.id) ? d.id : (parseInt(String(d.id || '').replace(/\D/g, ''), 10) || ((page - 1) * limit + index + 1)))
      return {
        id: numId,
        doctorId: numId,
        numericId: numId,
        name: d.name,
        fullName: d.fullName || d.name,
        specialty: d.specialty,
        specialist: d.specialty,
        hospitalId: hosp.numericId,
        numericHospitalId: hosp.numericId,
        hospital: d.hospital || hosp.name,
        hospitalName: d.hospitalName || hosp.name,
        city: d.city || hosp.city,
        state: d.state || hosp.state,
        address: d.address || hosp.address,
        price: d.price || 500,
        rating: d.rating || '4.8',
        experience: d.experience || 10,
        timing: d.timing || '09:00 AM - 01:00 PM',
        phone: d.phone || hosp.phone,
        email: d.email || `doctor${numId}@${(d.city || hosp.city).toLowerCase().replace(/[^a-z]/g, '')}hospital.in`,
        qualification: d.qualification || `MBBS, MD (${d.specialty})`,
        image: d.image || getDoctorImage(d),
        languages: d.languages || ['English', 'Hindi'],
        bio: d.bio || `${d.qualification || 'Experienced specialist'} with ${d.experience || 10} years of clinical practice at ${d.hospital || hosp.name}.`,
        reviews: d.reviews || (35 + ((numId || 1) % 50)),
      }
    })

    const seenEmails = new Set<string>()
    const merged: ApiDoctor[] = []
    if (page === 1) {
      for (const d of localMatching) {
        merged.push(d)
        if (d.email) seenEmails.add(d.email.toLowerCase())
      }
    }
    for (const d of mapped) {
      if (!d.email || !seenEmails.has(d.email.toLowerCase())) {
        merged.push(d)
      }
    }
    const totalCount = filtered.length + (page === 1 ? localMatching.length : 0)
    ;(merged as any).total = totalCount
    ;(merged as any).totalPages = Math.max(1, Math.ceil(totalCount / limit))
    return merged
  }
}

/**
 * Fetch doctor by ID
 */
export async function getDoctorById(id: string | number): Promise<ApiDoctor | undefined> {
  const localDocs = getStoredRegisteredDoctors()
  const localMatch = localDocs.find(d => String(d.id) === String(id) || String(d.doctorId) === String(id) || (d as any).uid === String(id))
  if (localMatch) {
    return localMatch
  }

  try {
    const doc = await request<ApiDoctor>(`/doctors?id=${id}`)
    if (doc && doc.id) {
      return {
        ...doc,
        name: doc.name || doc.fullName || 'Dr. Specialist',
        specialty: doc.specialty || doc.specialist || 'General physician',
        hospital: doc.hospital || doc.hospitalName || 'Care Medical Center',
        image: getDoctorImage(doc),
        languages: ['English', 'Hindi'],
        bio: `${doc.qualification || 'Experienced specialist'} with ${doc.experience || 8} years of clinical excellence at ${doc.hospital || 'leading hospital'}.`,
        reviews: 32,
      }
    }
  } catch {
    // fallback
  }

  if (!fullDoctorsCache && fullDoctorsPromise) {
    try {
      await fullDoctorsPromise
    } catch {}
  } else if (!fullDoctorsCache && typeof window !== 'undefined') {
    try {
      await loadAllDoctors()
    } catch {}
  }

  const dataset = fullDoctorsCache || mockDoctors
  const target = String(id).trim()
  const numericTarget = parseInt(target.replace(/\D/g, ''), 10)
  const mock = dataset.find(d =>
    String(d.id) === target ||
    String(d.numericId) === target ||
    (Boolean(numericTarget) && (d.numericId === numericTarget || d.id === numericTarget || parseInt(String(d.id).replace(/\D/g, ''), 10) === numericTarget))
  )
  if (mock) {
    const numId = typeof mock.numericId === 'number' && !isNaN(mock.numericId)
      ? mock.numericId
      : (typeof mock.id === 'number' ? mock.id : (parseInt(String(mock.id || '').replace(/\D/g, ''), 10) || 1))
    const hospId = typeof mock.numericHospitalId === 'number' && !isNaN(mock.numericHospitalId)
      ? mock.numericHospitalId
      : (typeof mock.hospitalId === 'number' ? mock.hospitalId : (parseInt(String(mock.hospitalId || '').replace(/\D/g, ''), 10) || 1))
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
      image: mock.image || getDoctorImage(mock),
    }
  }
  return undefined
}

/**
 * Fetch specialties list from live database
 */
export async function getSpecialties(): Promise<string[]> {
  try {
    const list = await request<string[]>('/specialties')
    if (Array.isArray(list) && list.length > 0) {
      const merged = new Set(['All specialties', ...allMedicalFields.map(f => f.name), ...list])
      return Array.from(merged)
    }
  } catch {
    // fallback
  }
  return ['All specialties', ...allMedicalFields.map(f => f.name)]
}

/**
 * Fetch all 31 Indian states from database
 */
export async function getStates(): Promise<string[]> {
  try {
    const list = await request<string[]>('/states')
    if (Array.isArray(list) && list.length > 0) return ['All states', ...list]
  } catch {
    // fallback
  }
  return ['All states', ...allIndianStates]
}

/**
 * Fetch cities list from live database, optionally filtered by state
 */
export async function getCities(state?: string): Promise<string[]> {
  try {
    const query = state && state !== 'All states' ? `?state=${encodeURIComponent(state)}` : ''
    const list = await request<string[]>(`/cities${query}`)
    if (Array.isArray(list) && list.length > 0) return ['All cities', ...list]
  } catch {
    // fallback
  }
  if (state && state !== 'All states' && citiesByStateMap[state]) {
    return ['All cities', ...citiesByStateMap[state]]
  }
  const allCities = Array.from(new Set(allIndianHospitals.map(h => h.city))).sort()
  return ['All cities', ...allCities]
}

/**
 * Fetch hospitals with filtering
 */
export async function getHospitals(params: {
  search?: string
  city?: string
  state?: string
  emergency?: boolean
  limit?: number
  page?: number
} = {}): Promise<ApiHospital[]> {
  try {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.city && params.city !== 'All cities') query.set('city', params.city)
    if (params.state && params.state !== 'All states') query.set('state', params.state)
    if (params.emergency !== undefined) query.set('emergency', String(params.emergency))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.page) query.set('page', String(params.page))

    const result = await request<ApiHospital[]>(`/hospitals?${query.toString()}`)
    if (Array.isArray(result) && result.length > 0) {
      return result.map(h => ({
        ...h,
        specialties: h.specialties || ['Cardiology', 'General Medicine', 'Neurology', 'Orthopedics', 'Pediatrics'],
        image: getHospitalImage(h),
      }))
    }
    throw new Error('Empty backend result')
  } catch {
    let filtered = [...allIndianHospitals]
    if (params.search) {
      const s = params.search.toLowerCase()
      filtered = filtered.filter(h => `${h.name} ${h.city} ${h.state} ${h.specialties.join(' ')}`.toLowerCase().includes(s))
    }
    if (params.state && params.state !== 'All states') {
      filtered = filtered.filter(h => h.state.toLowerCase() === params.state!.toLowerCase())
    }
    if (params.city && params.city !== 'All cities') {
      filtered = filtered.filter(h => h.city.toLowerCase() === params.city!.toLowerCase())
    }
    if (params.emergency) {
      filtered = filtered.filter(h => h.emergency)
    }
    const page = params.page || 1
    const limit = params.limit || 24
    const paged = filtered.slice((page - 1) * limit, page * limit)
    return paged.map(h => ({
      ...h,
      id: h.numericId,
      image: getHospitalImage(h),
    }))
  }
}

/**
 * Fetch hospital by ID
 */
export async function getHospitalById(id: string | number): Promise<ApiHospital | undefined> {
  try {
    const hosp = await request<ApiHospital>(`/hospitals?id=${id}`)
    if (hosp && hosp.id) {
      return {
        ...hosp,
        specialties: hosp.specialties || ['Cardiology', 'Orthopedics', 'General Medicine', 'Neurology'],
        image: getHospitalImage(hosp),
      }
    }
  } catch {
    // fallback
  }
  const found = allIndianHospitals.find(h => String(h.id) === String(id) || String(h.numericId) === String(id))
  if (found) {
    return {
      ...found,
      id: found.numericId,
      image: getHospitalImage(found),
    }
  }
  return undefined
}

let fullMedicinesCache: ApiMedicine[] | null = null
let fullMedicinesPromise: Promise<ApiMedicine[]> | null = null

export async function loadAllMedicines(): Promise<ApiMedicine[]> {
  if (fullMedicinesCache) return fullMedicinesCache
  if (!fullMedicinesPromise) {
    fullMedicinesPromise = fetch('/data/medicines.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load medicines.json')
        return res.json()
      })
      .then((data: ApiMedicine[]) => {
        fullMedicinesCache = data
        return data
      })
      .catch(() => {
        return mockMedicines as ApiMedicine[]
      })
  }
  return fullMedicinesPromise
}

// Automatically start background loading on client so all 47,335 medicines are available
if (typeof window !== 'undefined') {
  setTimeout(() => { loadAllMedicines().catch(() => {}) }, 50)
}

/**
 * Fetch medicines catalog with pagination
 */
export async function getMedicines(params: {
  search?: string
  category?: string
  hasImage?: boolean
  limit?: number
  page?: number
} = {}): Promise<MedicineListResponse> {
  try {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.category && params.category !== 'All') query.set('category', params.category)
    if (params.hasImage !== undefined) query.set('hasImage', String(params.hasImage))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.page) query.set('page', String(params.page))

    const result = await request<MedicineListResponse>(`/medicines?${query.toString()}`)
    if (result && Array.isArray(result.medicines)) {
      return {
        ...result,
        medicines: result.medicines.map(m => ({
          ...m,
          image: m.imageUrl || m.image || getMedicineImage(m),
        })),
      }
    }
  } catch {
    // backend unavailable, fallback to comprehensive 47,335 medicines dataset
  }

  // If full 47,335 cache is loaded, use it; otherwise await background load
  if (!fullMedicinesCache && fullMedicinesPromise) {
    try {
      await fullMedicinesPromise
    } catch {}
  } else if (!fullMedicinesCache && typeof window !== 'undefined') {
    try {
      await loadAllMedicines()
    } catch {}
  }

  const dataset = fullMedicinesCache || (mockMedicines as ApiMedicine[])
  let filtered = dataset

  if (params.hasImage) {
    filtered = filtered.filter(m => hasAuthenticMedicinePhoto(m))
  }
  if (params.category && params.category !== 'All') {
    filtered = filtered.filter(m => m.category === params.category)
  }
  if (params.search) {
    const s = params.search.toLowerCase()
    filtered = filtered.filter(m => `${m.name} ${m.dose} ${m.category} ${m.brand || ''}`.toLowerCase().includes(s))
  }

  // ALWAYS sort visible authentic packaging photos FIRST, non-visible second
  filtered = [...filtered].sort((a, b) => {
    const aVisible = hasAuthenticMedicinePhoto(a) ? 1 : 0
    const bVisible = hasAuthenticMedicinePhoto(b) ? 1 : 0
    if (aVisible !== bVisible) return bVisible - aVisible
    return a.id - b.id
  })

  const total = fullMedicinesCache ? filtered.length : (params.search || params.category ? filtered.length : 47335)
  const limit = params.limit || 24
  const page = params.page || 1
  const start = (page - 1) * limit
  const paged = filtered.slice(start, start + limit)

  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    medicines: paged.map(m => ({
      ...m,
      id: m.id,
      image: m.imageUrl || m.image || getMedicineImage(m),
    })),
  }
}

// Automatically start background loading on client so all 47,335 medicines are available
if (typeof window !== 'undefined') {
  setTimeout(() => { loadAllMedicines().catch(() => {}) }, 50)
}

/**
 * Fetch medicine by ID
 */
export async function getMedicineById(id: string | number): Promise<ApiMedicine | undefined> {
  try {
    const med = await request<ApiMedicine>(`/medicines?id=${id}`)
    if (med && med.id) {
      return {
        ...med,
        image: med.imageUrl || med.image || getMedicineImage(med),
      }
    }
  } catch {
    // fallback
  }
  const dataset = fullMedicinesCache || (mockMedicines as ApiMedicine[])
  const found = dataset.find(m => String(m.id) === String(id))
  if (found) {
    return {
      ...found,
      image: found.imageUrl || found.image || getMedicineImage(found),
    }
  }
  return undefined
}

/**
 * Fetch distinct medicine categories from backend or comprehensive dataset
 */
export async function getMedicineCategories(): Promise<string[]> {
  try {
    const list = await request<string[]>('/medicines/categories')
    if (Array.isArray(list) && list.length > 0) {
      return ['All', ...list]
    }
  } catch {
    // fallback
  }
  return allMedicineCategories
}

/**
 * Check symptoms via Gemini AI Triage + Emergency Detector
 */
export async function checkSymptomsAI(symptoms: string): Promise<TriageResult> {
  try {
    const res = await request<TriageResult>('/triage', {
      method: 'POST',
      body: JSON.stringify({ symptoms }),
    })
    if (res && res.status === 'success') {
      return res
    }
  } catch {
    // Local intelligent emergency heuristic fallback
  }
  const isEmergency = /chest pain|shortness of breath|can't breathe|cannot breathe|unconscious|severe bleeding|stroke|crushing pressure/i.test(symptoms)
  const isSkin = /skin|rash|itch|redness|hives/i.test(symptoms)
  const isSinus = /sinus|headache|nose|congestion|fever/i.test(symptoms)
  const isHeart = /palpitation|heart|dizziness|fainting/i.test(symptoms)

  const specialty = isEmergency
    ? 'Emergency Medicine'
    : isHeart
      ? 'Cardiologist'
      : isSkin
        ? 'Dermatologist'
        : isSinus
          ? 'ENT specialist'
          : 'General physician'

  return {
    status: 'success',
    isEmergency,
    emergencyReason: isEmergency ? 'Urgent cardiovascular or respiratory indicator identified in symptom profile.' : undefined,
    immediateActionPlan: isEmergency
      ? ['Call emergency helpline (112 / 102)', 'Rest in a comfortable position', 'Do not drive yourself to hospital']
      : ['Schedule an outpatient appointment', 'Monitor temperature and hydration', 'Note onset and progression of symptoms'],
    differentialDiagnoses: isEmergency
      ? [
          { condition: 'Acute Coronary Syndrome', probability: 'High urgency', reasoning: 'Chest tightness with breathing distress requires immediate emergency rule-out.' },
          { condition: 'Pulmonary Embolism', probability: 'Critical', reasoning: 'Sudden shortness of breath requires immediate clinical imaging.' },
        ]
      : isSkin
        ? [
            { condition: 'Contact Dermatitis', probability: '68%', reasoning: 'Localized cutaneous irritation, erythema, and pruritus.' },
            { condition: 'Urticaria / Allergy', probability: '24%', reasoning: 'Immune-mediated histaminergic response.' },
          ]
        : isSinus
          ? [
              { condition: 'Acute Sinusitis', probability: '72%', reasoning: 'Periorbital or frontal tension with nasal congestion.' },
              { condition: 'Tension-Type Headache', probability: '21%', reasoning: 'Diffuse band-like cephalalgia without photophobia.' },
            ]
          : [
              { condition: 'Viral Upper Respiratory Infection', probability: '58%', reasoning: 'Generalized constitutional malaise and fatigue.' },
              { condition: 'Physical Fatigue / Dehydration', probability: '32%', reasoning: 'Common response to sleep deprivation or elevated stress.' },
            ],
    recommendedSpecialist: specialty,
    recommendedSpecialty: specialty,
    severityLevel: isEmergency ? 'CRITICAL' : 'MILD_TO_MODERATE',
    clinicalDisclaimer: 'Sakura AI guidance is an assistive differential tool, not a definitive medical diagnosis. Consult a qualified physician for evaluation.',
  }
}

export interface ApiAppointment {
  id: string
  tokenNo?: number
  userId?: number
  fullName?: string
  patientName?: string
  gender?: string
  age?: string | number
  appointmentDate?: string
  date?: string
  appointmentTime?: string
  time?: string
  email?: string
  phone?: string
  diseases?: string
  concern?: string
  symptoms?: string
  doctorId?: number
  doctor?: string
  specialty?: string
  status?: string
  type?: string
  hospital?: string
  hospitalCity?: string
  state?: string
  fee?: number
}

export function getSharedAppointments(): ApiAppointment[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem('iryotek_shared_appointments')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter(a => a && !['APT-1081', 'APT-1082', 'APT-1083', 'APT-1084'].includes(String(a.id)))
      }
    }
  } catch {}
  return []
}

export function saveSharedAppointment(appt: ApiAppointment) {
  if (typeof localStorage === 'undefined') return
  try {
    const list = getSharedAppointments()
    const index = list.findIndex(a => String(a.id) === String(appt.id) || (a.tokenNo && String(a.tokenNo) === String(appt.tokenNo)))
    if (index >= 0) {
      list[index] = { ...list[index], ...appt }
    } else {
      list.unshift(appt)
    }
    localStorage.setItem('iryotek_shared_appointments', JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('iryotek_appointment_updated', { detail: appt }))
    window.dispatchEvent(new Event('storage'))
  } catch {}
}

export async function getAppointments(params: { doctorId?: number; userId?: number } = {}): Promise<ApiAppointment[]> {
  const shared = getSharedAppointments()
  try {
    const q = new URLSearchParams()
    if (params.doctorId) q.set('doctorId', String(params.doctorId))
    if (params.userId) q.set('userId', String(params.userId))
    const queryStr = q.toString() ? `?${q.toString()}` : ''
    const apiList = await request<ApiAppointment[]>(`/appointments${queryStr}`)
    if (Array.isArray(apiList)) {
      const mergedMap = new Map<string, ApiAppointment>()
      shared.forEach(a => mergedMap.set(String(a.id), a))
      apiList.forEach(a => {
        const idKey = String(a.id)
        if (mergedMap.has(idKey)) {
          mergedMap.set(idKey, { ...mergedMap.get(idKey)!, ...a })
        } else {
          mergedMap.set(idKey, a)
        }
      })
      const merged = Array.from(mergedMap.values())
      localStorage.setItem('iryotek_shared_appointments', JSON.stringify(merged))
      return merged
    }
  } catch (err) {
    console.warn('[Iryotek API] getAppointments fallback to shared storage:', err)
  }
  return shared
}

export interface SharedPrescription {
  id: string
  appointmentId?: string
  token?: string
  patientName: string
  patientEmail?: string
  patientAge?: number | string
  patientGender?: string
  doctorName: string
  doctorSpecialty?: string
  date: string
  diagnosis: string
  status: string
  medicines: {
    name: string
    dosage?: string
    dose?: string
    frequency?: string
    duration?: string
    instructions?: string
    price?: number
  }[]
  advice?: string
  instructions?: string
  specialty?: string
  nmcNumber?: string
  followUp?: string
  vitals?: { bp?: string; pulse?: string; spo2?: string; temp?: string }
}

const MOCK_RX_IDS = ['rx_01', 'rx_02', 'rx_03', 'rx_04', 'RX-DOC-0392', 'RX-6743', 'rx_10']

export function getSharedPrescriptions(): SharedPrescription[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem('iryotek_doctor_prescriptions')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        // Exclude mock and test prescriptions so client tests only clean, authentic prescriptions
        return parsed.filter(rx => rx && !MOCK_RX_IDS.includes(rx.id) && rx.patientName !== 'Planio' && rx.patientName !== 'Registered Patient')
      }
    }
  } catch {}
  return []
}

export function deleteSharedPrescription(id: string) {
  if (typeof localStorage === 'undefined') return
  try {
    const list = getSharedPrescriptions().filter(r => r.id !== id)
    localStorage.setItem('iryotek_doctor_prescriptions', JSON.stringify(list))

    // If no prescriptions remain, unset prescription flag in user states
    if (list.length === 0) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('iryotek_user_state_')) {
          try {
            const raw = localStorage.getItem(key)
            if (raw) {
              const data = JSON.parse(raw)
              data.prescription = false
              localStorage.setItem(key, JSON.stringify(data))
            }
          } catch {}
        }
      }
    }

    window.dispatchEvent(new CustomEvent('iryotek_prescription_updated', { detail: { action: 'delete', id } }))
    window.dispatchEvent(new Event('storage'))
  } catch {}
}

export function clearAllSharedPrescriptions() {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem('iryotek_doctor_prescriptions')
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('iryotek_user_state_')) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const data = JSON.parse(raw)
            data.prescription = false
            localStorage.setItem(key, JSON.stringify(data))
          }
        } catch {}
      }
    }
    window.dispatchEvent(new CustomEvent('iryotek_prescription_updated', { detail: { action: 'clear_all' } }))
    window.dispatchEvent(new Event('storage'))
  } catch {}
}

// Clean slate initialization: clear any leftover mock or test appointments & prescriptions for client-ready production
const CLIENT_CLEAN_SLATE_KEY = 'iryotek_client_ready_v3_prod'
try {
  if (typeof localStorage !== 'undefined') {
    if (!localStorage.getItem(CLIENT_CLEAN_SLATE_KEY)) {
      localStorage.removeItem('iryotek_doctor_prescriptions')
      localStorage.removeItem('iryotek_shared_appointments')
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('iryotek_user_state_')) {
          try {
            const raw = localStorage.getItem(key)
            if (raw) {
              const data = JSON.parse(raw)
              data.appointments = []
              data.prescription = false
              data.cart = []
              data.orders = []
              data.claims = []
              localStorage.setItem(key, JSON.stringify(data))
            }
          } catch {}
        }
      }
      localStorage.setItem(CLIENT_CLEAN_SLATE_KEY, 'true')
    } else {
      const rawRx = localStorage.getItem('iryotek_doctor_prescriptions')
      if (rawRx) {
        const parsed = JSON.parse(rawRx)
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(rx => rx && !MOCK_RX_IDS.includes(rx.id) && rx.patientName !== 'Planio' && rx.patientName !== 'Registered Patient')
          localStorage.setItem('iryotek_doctor_prescriptions', JSON.stringify(cleaned))
        }
      }
      const rawAppt = localStorage.getItem('iryotek_shared_appointments')
      if (rawAppt) {
        const parsed = JSON.parse(rawAppt)
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(a => a && !['APT-1081', 'APT-1082', 'APT-1083', 'APT-1084'].includes(String(a.id)))
          localStorage.setItem('iryotek_shared_appointments', JSON.stringify(cleaned))
        }
      }
    }
  }
} catch {}

export function saveSharedPrescription(rx: SharedPrescription) {
  if (typeof localStorage === 'undefined') return
  try {
    const list = getSharedPrescriptions()
    const index = list.findIndex(r => r.id === rx.id || (rx.token && r.token === rx.token))
    if (index >= 0) {
      list[index] = { ...list[index], ...rx }
    } else {
      list.unshift(rx)
    }
    localStorage.setItem('iryotek_doctor_prescriptions', JSON.stringify(list))

    // Set prescription: true in all user states stored in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('iryotek_user_state_')) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const data = JSON.parse(raw)
            data.prescription = true
            localStorage.setItem(key, JSON.stringify(data))
          }
        } catch {}
      }
    }

    window.dispatchEvent(new CustomEvent('iryotek_prescription_updated', { detail: { prescription: rx } }))
    window.dispatchEvent(new Event('storage'))
  } catch {}
}

export async function updateAppointmentStatus(appointmentId: string | number, status: string, doctorId?: number): Promise<{ status: string; message?: string }> {
  try {
    const list = getSharedAppointments()
    const updated = list.map(a => {
      if (String(a.id) === String(appointmentId) || (a.tokenNo && String(a.tokenNo) === String(appointmentId))) {
        return { ...a, status }
      }
      return a
    })
    localStorage.setItem('iryotek_shared_appointments', JSON.stringify(updated))

    // Also update all user states stored in localStorage so patient and doctor stay in 100% sync
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('iryotek_user_state_')) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const data = JSON.parse(raw)
            if (Array.isArray(data.appointments)) {
              let changed = false
              data.appointments = data.appointments.map((a: any) => {
                if (String(a.id) === String(appointmentId) || (a.tokenNo && String(a.tokenNo) === String(appointmentId))) {
                  changed = true
                  return { ...a, status }
                }
                return a
              })
              if (changed) {
                localStorage.setItem(key, JSON.stringify(data))
              }
            }
          }
        } catch {}
      }
    }

    window.dispatchEvent(new CustomEvent('iryotek_appointment_updated', { detail: { id: appointmentId, status, doctorId } }))
    window.dispatchEvent(new Event('storage'))
  } catch {}

  try {
    return await request<{ status: string; message?: string }>('/appointments/status', {
      method: 'POST',
      body: JSON.stringify({ appointmentId, status, doctorId }),
    })
  } catch {
    return { status: 'success', message: 'Status updated locally' }
  }
}

/**
 * Record an appointment into the backend database and shared storage
 */
export async function bookAppointment(data: AppointmentData): Promise<{ status: string; appointmentId?: number; message?: string; tokenNo?: number; id?: string | number }> {
  let res: { status: string; appointmentId?: number; message?: string; tokenNo?: number; id?: string | number }
  try {
    res = await request<{ status: string; appointmentId?: number; message?: string; tokenNo?: number; id?: string | number }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  } catch {
    const fallbackId = Math.floor(Math.random() * 900) + 100
    res = {
      status: 'success',
      appointmentId: fallbackId,
      tokenNo: fallbackId,
      id: String(fallbackId),
      message: 'Demo appointment recorded successfully.',
    }
  }

  // Also save to shared appointments so doctor immediately sees it across user accounts
  try {
    const rawId = res.appointmentId || res.tokenNo || res.id || Math.floor(Math.random() * 900) + 100
    const apptId = String(rawId)
    saveSharedAppointment({
      id: apptId,
      tokenNo: Number(res.tokenNo || res.appointmentId || apptId),
      doctorId: data.doctorId,
      doctor: data.doctorName || 'Doctor',
      doctorName: data.doctorName || 'Doctor',
      patientName: data.patientName,
      fullName: data.patientName,
      email: data.email,
      phone: data.phone,
      date: data.appointmentDate,
      appointmentDate: data.appointmentDate,
      time: data.appointmentTime,
      appointmentTime: data.appointmentTime,
      diseases: data.symptoms || 'In-Clinic OPD Consultation',
      concern: data.symptoms || 'In-Clinic OPD Consultation',
      specialty: data.specialty || 'General Physician',
      hospital: data.hospital || 'Care Hospital',
      hospitalCity: data.hospitalCity || 'Bhubaneswar',
      state: data.state || 'Odisha',
      fee: data.fee || 500,
      status: 'Pending',
      type: 'In-Clinic OPD Consultation'
    })
  } catch (err) {
    console.warn('[Iryotek API] Failed to save shared appointment:', err)
  }

  return res
}

/**
 * User login
 */
export async function loginUser(email: string, password: string, role = 'user'): Promise<{ status: string; user?: any; message?: string }> {
  try {
    return await request<{ status: string; user?: any; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    })
  } catch {
    const storedJson = typeof window !== 'undefined' ? localStorage.getItem('iryotek_auth_user') : null
    let fallbackName = email.split('@')[0]
    if (storedJson) {
      try {
        const parsed = JSON.parse(storedJson)
        if (parsed?.displayName) fallbackName = parsed.displayName
      } catch { /* ignore */ }
    }
    return {
      status: 'success',
      user: { email, role, fullName: fallbackName },
      message: 'Logged in successfully',
    }
  }
}

/**
 * User registration
 */
export async function registerUser(fullName: string, email: string, password: string): Promise<{ status: string; message?: string }> {
  try {
    return await request<{ status: string; message?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    })
  } catch {
    return {
      status: 'success',
      message: 'Account created successfully (demo mode)',
    }
  }
}
