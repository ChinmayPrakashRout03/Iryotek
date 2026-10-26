/**
 * Curated, high-resolution medical imagery for Iryotek.
 * Provides deterministic photo mapping across all 100k+ doctors, 1.1k+ hospitals, and 47k+ medicines.
 */

// Verified, diverse clinical physician portraits separated by gender
export const DOCTOR_IMAGES_FEMALE = [
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1623854767648-e7bb8009f0db?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=85',
]

export const DOCTOR_IMAGES_MALE = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=85',
]

// Combined collection of all verified portraits
export const DOCTOR_IMAGES = [...DOCTOR_IMAGES_MALE, ...DOCTOR_IMAGES_FEMALE]

const FEMALE_FIRST_NAMES = new Set([
  'anita', 'aarti', 'bhavna', 'divya', 'meera', 'neha', 'pooja', 'sneha', 'radha',
  'sunita', 'shilpa', 'swati', 'sarita', 'kavita', 'sonal', 'vandana', 'archana',
  'anjali', 'garima', 'shikha', 'sushma', 'nandini', 'pallavi', 'richa', 'preeti',
  'jyoti', 'rachna', 'smriti', 'meena', 'priya', 'deepa', 'shweta', 'alka',
  'renu', 'tanu', 'sapna', 'rekha', 'seema', 'poonam', 'mona', 'monika',
  'geeta', 'asha', 'usha', 'kavitha', 'priyanka', 'ananya', 'riya'
])

export function isFemaleDoctor(name = ''): boolean {
  const clean = name.replace(/^Dr\.\s+/i, '').trim().toLowerCase()
  const first = clean.split(/\s+/)[0]
  return FEMALE_FIRST_NAMES.has(first)
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getDoctorImage(doctor?: { id?: number | string; numericId?: number; name?: string; image?: string; specialty?: string }): string {
  // If already an authentic external URL, use it
  if (doctor?.image && doctor.image.startsWith('http') && !doctor.image.includes('w=1920')) {
    return doctor.image
  }

  const name = doctor?.name || ''
  const isFemale = isFemaleDoctor(name)
  const pool = isFemale ? DOCTOR_IMAGES_FEMALE : DOCTOR_IMAGES_MALE

  const rawId = doctor?.numericId ?? (typeof doctor?.id === 'number' ? doctor.id : parseInt(String(doctor?.id || '').replace(/\D/g, ''), 10))
  const numId = isNaN(rawId) ? 0 : rawId

  const hash = hashString(`${name}|${doctor?.specialty || ''}|${numId}`)
  const seed = (numId * 37) + hash
  const idx = Math.abs(seed) % pool.length

  return pool[idx]
}

// 12+ verified hospital and clinical campus exterior photographs
export const HOSPITAL_IMAGES = [
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80',
]

export function getHospitalImage(hospital?: { id?: number | string; name?: string }): string {
  const seed = hospital?.id !== undefined ? Number(hospital.id) : (hospital?.name ? hashString(hospital.name) : 0)
  const safeSeed = isNaN(seed) ? (hospital?.name ? hashString(hospital.name) : 0) : seed
  const idx = Math.abs(safeSeed) % HOSPITAL_IMAGES.length
  return HOSPITAL_IMAGES[idx]
}

// 12+ verified pharmaceutical and clinical medication photographs
export const MEDICINE_IMAGES = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1563213126-a4273aed2016?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=640&q=80',
]

// Check if medicine has authentic product photography
export function hasAuthenticMedicinePhoto(medicine?: { id?: number | string; image?: string; imageUrl?: string }): boolean {
  if (!medicine) return false
  const url = medicine.imageUrl || medicine.image
  if (!url || typeof url !== 'string') return false
  return url.startsWith('http://') || url.startsWith('https://')
}

export function getMedicineDosageIcon(dose?: string, category?: string): string {
  const d = (dose || '').toLowerCase()
  const c = (category || '').toLowerCase()
  if (c.includes('device') || d.includes('device') || d.includes('meter') || d.includes('monitor') || d.includes('thermometer') || d.includes('oximeter')) return '🩺'
  if (d.includes('syrup') || d.includes('susp') || d.includes('liquid') || d.includes('drops') || d.includes('ml')) return '🧴'
  if (d.includes('cream') || d.includes('gel') || d.includes('ointment')) return '🧴'
  if (d.includes('caps') || d.includes('capsule')) return '💊'
  if (d.includes('inject') || d.includes('vial') || d.includes('amp') || d.includes('syringe')) return '💉'
  if (d.includes('inhaler') || d.includes('spray')) return '🫁'
  if (d.includes('sachet') || d.includes('powder')) return '📦'
  if (d.includes('supp') || d.includes('suppository')) return '💊'
  return '💊'
}

// Dataset & curated medicine image handler: returns authentic dataset photography or null if no packaging image
export function getMedicineImage(medicine?: { id?: number | string; name?: string; category?: string; dose?: string; image?: string; imageUrl?: string }): string | null {
  if (medicine?.imageUrl && (medicine.imageUrl.startsWith('http://') || medicine.imageUrl.startsWith('https://'))) return medicine.imageUrl
  if (medicine?.image && (medicine.image.startsWith('http://') || medicine.image.startsWith('https://'))) return medicine.image
  return null
}



