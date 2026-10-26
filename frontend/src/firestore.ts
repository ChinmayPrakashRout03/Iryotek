/**
 * Iryotek Cloud Firestore Integration Module
 * 
 * Provides unified, real-time patient health records and clinical transaction storage
 * in Firebase Firestore under project: iryotek-c7b5c
 * 
 * Collections schema:
 * - patients/{uid}                     -> Complete PatientHealthProfile (demographics, vitals, medical history, insurance)
 * - patients/{uid}/appointments/{id}  -> Booked appointments
 * - patients/{uid}/orders/{id}        -> YouPI verified pharmacy orders
 * - patients/{uid}/prescriptions/{id} -> Doctor-issued digital prescriptions
 * - appointments/{id}                 -> Global OPD queue for clinicians
 */

import { type PatientHealthProfile, initFirebase } from './auth'

export function getFirestoreDb(): any {
  if (typeof window === 'undefined') return null
  initFirebase()
  if (window.firebase && typeof window.firebase.firestore === 'function') {
    try {
      return window.firebase.firestore()
    } catch (e) {
      console.warn('[Iryotek Firestore] Init warning:', e)
    }
  }
  return null
}

export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  if (digits.length >= 10) return digits.slice(-10)
  return digits
}

/**
 * Persist or update a patient's complete health profile in Firestore & local registry
 */
export async function savePatientProfileFirestore(uid: string, profile: PatientHealthProfile): Promise<boolean> {
  const phone = profile.phone || profile.emergencyContact?.phone || ''
  const cleanPhone = cleanPhoneNumber(phone)
  const normalizedEmail = (profile.email || '').trim().toLowerCase()

  // Persist locally for offline resilience and fast session restore
  try {
    if (typeof localStorage !== 'undefined') {
      if (uid) {
        localStorage.setItem('iryotek_patient_profile_' + uid, JSON.stringify(profile))
      }
      if (normalizedEmail) {
        localStorage.setItem('iryotek_patient_profile_' + normalizedEmail, JSON.stringify(profile))
      }
      const registry = JSON.parse(localStorage.getItem('iryotek_registered_patients') || '{}')
      const key = normalizedEmail || uid.toLowerCase()
      registry[key] = {
        uid,
        email: normalizedEmail,
        phone,
        profile,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('iryotek_registered_patients', JSON.stringify(registry))

      // Also maintain reverse lookup: phone -> email
      if (cleanPhone && normalizedEmail) {
        const phoneMap = JSON.parse(localStorage.getItem('iryotek_registered_phones') || '{}')
        phoneMap[cleanPhone] = normalizedEmail
        localStorage.setItem('iryotek_registered_phones', JSON.stringify(phoneMap))
      }
    }
  } catch (err) {
    console.warn('[Iryotek Persistence] Local profile backup error:', err)
  }

  // Sync to remote Firestore when available
  const db = getFirestoreDb()
  if (!db || !uid) {
    return true
  }

  try {
    const patientRef = db.collection('patients').doc(uid)
    const payload = {
      ...profile,
      uid,
      phone,
      updatedAt: window.firebase?.firestore?.FieldValue?.serverTimestamp() || new Date().toISOString()
    }
    await patientRef.set(payload, { merge: true })
    console.log('[Iryotek Firestore] Patient health profile synced to cloud:', uid)

    // Also sync to phone_index in Firestore for O(1) phone lookup during sign-in
    if (cleanPhone && normalizedEmail) {
      try {
        await db.collection('phone_index').doc(cleanPhone).set({
          uid,
          email: normalizedEmail,
          phone,
          updatedAt: window.firebase?.firestore?.FieldValue?.serverTimestamp() || new Date().toISOString()
        }, { merge: true })
      } catch (err) {
        console.warn('[Iryotek Firestore] phone_index sync note:', err)
      }
    }

    return true
  } catch (error) {
    console.warn('[Iryotek Firestore] Error saving profile to Firestore (local copy preserved):', error)
    return true
  }
}

/**
 * Find patient account and profile by phone number across Cloud Firestore & local registry
 */
export async function findPatientProfileByPhoneFirestore(phone: string): Promise<{ email: string; uid?: string; profile?: PatientHealthProfile; password?: string } | null> {
  const clean = cleanPhoneNumber(phone)
  if (!clean || clean.length < 10) return null

  // Check local index first
  if (typeof localStorage !== 'undefined') {
    try {
      const phoneMap = JSON.parse(localStorage.getItem('iryotek_registered_phones') || '{}')
      if (phoneMap[clean]) {
        const email = phoneMap[clean]
        const registry = JSON.parse(localStorage.getItem('iryotek_registered_patients') || '{}')
        const entry = registry[email.toLowerCase()]
        const profile = entry?.profile || await getPatientProfileFirestore(entry?.uid || '', email)
        return { email, uid: entry?.uid, profile: profile || undefined, password: entry?.password }
      }

      // Check registered patients registry scan
      const registry = JSON.parse(localStorage.getItem('iryotek_registered_patients') || '{}')
      for (const [em, entry] of Object.entries(registry) as any) {
        const entryPhone = cleanPhoneNumber(entry?.phone || entry?.profile?.phone || entry?.profile?.emergencyContact?.phone)
        if (entryPhone === clean) {
          return { email: em, uid: entry?.uid, profile: entry?.profile, password: entry?.password }
        }
      }

      // Scan individual profile keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('iryotek_patient_profile_')) {
          const raw = localStorage.getItem(key)
          if (raw) {
            try {
              const prof = JSON.parse(raw)
              const p = cleanPhoneNumber(prof.phone || prof.emergencyContact?.phone)
              if (p === clean && prof.email) {
                return { email: prof.email, uid: prof.uid, profile: prof }
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      console.warn('[Iryotek Persistence] Phone lookup warning:', err)
    }
  }

  // Query Firestore if locally unmatched
  const db = getFirestoreDb()
  if (db) {
    try {
      // Direct doc lookup in phone_index
      const phoneDoc = await db.collection('phone_index').doc(clean).get()
      if (phoneDoc.exists) {
        const data = phoneDoc.data()
        if (data?.email) {
          const profile = await getPatientProfileFirestore(data.uid || '', data.email)
          return { email: data.email, uid: data.uid, profile: profile || undefined }
        }
      }

      // Query patients collection
      const snap = await db.collection('patients').where('phone', '==', phone.trim()).limit(1).get()
      if (!snap.empty) {
        const data = snap.docs[0].data()
        return { email: data.email, uid: data.uid, profile: data as PatientHealthProfile }
      }
    } catch (e) {
      console.warn('[Iryotek Firestore] Phone query warning:', e)
    }
  }

  return null
}

/**
 * Retrieve patient health profile from Cloud Firestore with multi-tier fallback
 */
export async function getPatientProfileFirestore(uid: string, email?: string): Promise<PatientHealthProfile | null> {
  let profile: PatientHealthProfile | null = null

  // Fetch remote document
  const db = getFirestoreDb()
  if (db && uid) {
    try {
      const doc = await db.collection('patients').doc(uid).get()
      if (doc.exists) {
        profile = doc.data() as PatientHealthProfile
      }
    } catch (error) {
      console.warn('[Iryotek Firestore] Error fetching profile from Firestore:', error)
    }
  }

  // Fallback to local storage if cloud record is unavailable
  if (!profile && typeof localStorage !== 'undefined') {
    try {
      if (uid) {
        const raw = localStorage.getItem('iryotek_patient_profile_' + uid)
        if (raw) profile = JSON.parse(raw)
      }
      if (!profile && email) {
        const raw = localStorage.getItem('iryotek_patient_profile_' + email.toLowerCase())
        if (raw) profile = JSON.parse(raw)
      }
      if (!profile && email) {
        const registry = JSON.parse(localStorage.getItem('iryotek_registered_patients') || '{}')
        const entry = registry[email.toLowerCase()]
        if (entry?.profile) profile = entry.profile
      }
    } catch (err) {
      console.warn('[Iryotek Persistence] Local profile restore error:', err)
    }
  }

  return profile
}

/**
 * Subscribe to real-time updates for a patient's health profile & vitals
 */
export function subscribePatientProfile(uid: string, onUpdate: (profile: PatientHealthProfile | null) => void): () => void {
  const db = getFirestoreDb()
  if (!db || !uid) return () => {}

  try {
    const unsubscribe = db.collection('patients').doc(uid).onSnapshot(
      (doc: any) => {
        if (doc && doc.exists) {
          onUpdate(doc.data() as PatientHealthProfile)
        }
      },
      (err: any) => {
        console.warn('[Iryotek Firestore] Snapshot listener error:', err)
      }
    )
    return unsubscribe
  } catch (e) {
    console.warn('[Iryotek Firestore] Failed to attach listener:', e)
    return () => {}
  }
}

/**
 * Save an appointment into Firestore (both patient subcollection and global clinician queue)
 */
export async function saveAppointmentFirestore(uid: string, appointment: {
  doctor: string
  doctorId?: number
  specialty: string
  date: string
  time: string
  patientName: string
  diseases?: string
  status?: string
  hospital?: string
  hospitalCity?: string
  state?: string
  type?: string
  fee?: number
  paymentStatus?: string
  paymentMethod?: string
  utr?: string
  [key: string]: any
}): Promise<string | null> {
  const db = getFirestoreDb()
  if (!db || !uid) return null

  try {
    const apptData = {
      ...appointment,
      userId: uid,
      status: appointment.status || 'Confirmed',
      createdAt: window.firebase?.firestore?.FieldValue?.serverTimestamp() || new Date().toISOString()
    }

    // Save to patient collection and global appointment queue
    const patientApptRef = await db.collection('patients').doc(uid).collection('appointments').add(apptData)
    await db.collection('appointments').doc(patientApptRef.id).set({
      ...apptData,
      id: patientApptRef.id
    })

    console.log('[Iryotek Firestore] Appointment recorded with ID:', patientApptRef.id)
    return patientApptRef.id
  } catch (error) {
    console.warn('[Iryotek Firestore] Error saving appointment:', error)
    return null
  }
}

/**
 * Fetch patient appointments from Firestore
 */
export async function getPatientAppointmentsFirestore(uid: string): Promise<any[]> {
  const db = getFirestoreDb()
  if (!db || !uid) return []

  try {
    const snapshot = await db.collection('patients').doc(uid).collection('appointments').get()
    const appts: any[] = []
    snapshot.forEach((doc: any) => {
      appts.push({ id: doc.id, ...doc.data() })
    })
    return appts
  } catch (error) {
    console.warn('[Iryotek Firestore] Error fetching appointments:', error)
    return []
  }
}

/**
 * Save pharmacy order into Firestore
 */
export async function saveOrderFirestore(uid: string, order: {
  orderId: string
  date: string
  status: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  address: string
  paymentMethod?: string
  transactionId?: string
}): Promise<boolean> {
  const db = getFirestoreDb()
  if (!db || !uid) return false

  try {
    const orderData = {
      ...order,
      userId: uid,
      createdAt: window.firebase?.firestore?.FieldValue?.serverTimestamp() || new Date().toISOString()
    }
    await db.collection('patients').doc(uid).collection('orders').doc(order.orderId).set(orderData)
    console.log('[Iryotek Firestore] Order saved to cloud:', order.orderId)
    return true
  } catch (error) {
    console.warn('[Iryotek Firestore] Error saving order:', error)
    return false
  }
}

/**
 * Fetch patient orders from Firestore
 */
export async function getPatientOrdersFirestore(uid: string): Promise<any[]> {
  const db = getFirestoreDb()
  if (!db || !uid) return []

  try {
    const snapshot = await db.collection('patients').doc(uid).collection('orders').get()
    const orders: any[] = []
    snapshot.forEach((doc: any) => {
      orders.push({ id: doc.id, ...doc.data() })
    })
    return orders
  } catch (error) {
    console.warn('[Iryotek Firestore] Error fetching orders:', error)
    return []
  }
}
