import {
  allIndianHospitals,
  allIndianStates,
  citiesByStateMap,
  sampleRealDoctorsByHospital,
  type HospitalItem,
  type RealDoctorItem
} from './data/hospitals-dataset'

import { getDoctorImage } from './images'
import { featuredMedicines } from './data/medicines-featured'

export type Medicine = { id: number; name: string; dose: string; price: number; quantity: number; category: string; brand: string; stock: number; prescription: boolean; description: string; image?: string; imageUrl?: string }
export type DemoOrder = { id: string; date: string; status: string; items: { name: string; quantity: number; price: number }[]; total: number; address: string; paymentMethod?: string; transactionId?: string }
export type Hospital = HospitalItem

// 1,130 Real Indian Hospitals across all 31 States and 113 Cities from MySQL database
export const hospitals: HospitalItem[] = allIndianHospitals

// All 31 Indian States & 113 Cities from dataset
export const allStates = allIndianStates
export const citiesByState = citiesByStateMap

import { allMedicalFields } from './data/medical-fields'

// 12,415 Real Doctors across all 1,130 hospitals from dataset
export const doctors = Object.values(sampleRealDoctorsByHospital).flat().map((doc, index) => {
  const hosp = allIndianHospitals.find(h => h.numericId === doc.numericHospitalId) || allIndianHospitals[0]
  const field = allMedicalFields[index % allMedicalFields.length]
  return {
    id: doc.id,
    numericId: doc.numericId,
    name: doc.name,
    fullName: doc.fullName,
    specialty: field.name,
    specialist: field.specialistTitle,
    hospitalId: hosp.id,
    numericHospitalId: hosp.numericId,
    hospital: hosp.name,
    city: hosp.city,
    state: hosp.state,
    rating: doc.rating,
    price: doc.price,
    experience: doc.experience,
    timing: doc.timing,
    phone: doc.phone,
    email: doc.email,
    qualification: field.qualification,
    image: getDoctorImage({ id: doc.id, numericId: doc.numericId, name: doc.name, specialty: field.name }),
    languages: ['English', 'Hindi'],
    bio: `${field.qualification} with ${doc.experience} years of clinical practice as a ${field.specialistTitle} at ${hosp.name}.`,
    reviews: 50 + (index % 120),
  }
})

const medicineRows = [
  ['Paracetamol', '500 mg · 10 tablets', 24, 'Everyday care', false],
  ['Cetirizine', '10 mg · 10 tablets', 38, 'Everyday care', false],
  ['Vitamin D3', '1000 IU · 30 tablets', 180, 'Wellness', false],
  ['Oral rehydration salts', '21 g · 5 sachets', 95, 'Everyday care', false],
  ['Digital thermometer', '1 device · clinical grade', 249, 'Devices', false],
  ['Pulse oximeter', '1 device · fingertip', 899, 'Devices', false],
  ['Amoxicillin', '500 mg · 10 capsules', 112, 'Prescription', true],
  ['Metformin', '500 mg · 15 tablets', 48, 'Prescription', true],
  ['Amlodipine', '5 mg · 10 tablets', 42, 'Prescription', true],
  ['Atorvastatin', '10 mg · 10 tablets', 98, 'Prescription', true],
  ['Pantoprazole', '40 mg · 10 tablets', 86, 'Prescription', true],
  ['Saline nasal spray', '20 ml · isotonic solution', 145, 'Everyday care', false],
  ['Multivitamin', '30 tablets · daily wellness', 220, 'Wellness', false],
  ['Vitamin C', '500 mg · 30 tablets', 160, 'Wellness', false],
  ['Calcium + D3', '30 tablets · supplement', 190, 'Wellness', false],
  ['Zinc supplement', '20 mg · 30 tablets', 135, 'Wellness', false],
  ['Sterile gauze', '10 pads · 10 × 10 cm', 65, 'First aid', false],
  ['Adhesive bandages', '20 strips · assorted', 55, 'First aid', false],
  ['Antiseptic solution', '100 ml · topical', 125, 'First aid', false],
  ['Medical tape', '2.5 cm × 9 m · 1 roll', 45, 'First aid', false],
  ['Blood pressure monitor', '1 device · upper arm', 1799, 'Devices', false],
  ['Glucometer starter kit', '1 meter · 10 test strips', 1199, 'Devices', false],
  ['Hot water bag', '2 L · reusable', 299, 'Devices', false],
  ['Hand sanitizer', '100 ml · alcohol-based', 75, 'Everyday care', false],
] as const

export const medicines: Medicine[] = featuredMedicines.map(m => ({
  id: m.id,
  name: m.name,
  dose: m.dose,
  price: m.price,
  quantity: 1,
  category: m.category,
  brand: m.brand,
  stock: m.stock,
  prescription: m.prescription,
  description: m.description,
  image: m.image,
  imageUrl: m.imageUrl,
}))

export const demoOrders: DemoOrder[] = []

export const prescriptions: { id: string; doctor: string; date: string; medicines: number[]; note: string }[] = []

