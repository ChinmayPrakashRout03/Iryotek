import React, { useState, useEffect, useRef } from 'react'
import { getMedicines, type ApiMedicine } from './api'
import { medicines as mockMedicines } from './mock-data'

export interface MedicineDropdownProps {
  value: string
  onChange: (value: string, selectedMedicine?: ApiMedicine | { name: string; dose?: string; price?: number; brand?: string; category?: string }) => void
  onSelectDose?: (dose: string) => void
  placeholder?: string
  required?: boolean
  style?: React.CSSProperties
  inputStyle?: React.CSSProperties
  id?: string
}

export interface FormularyItem {
  name: string
  dose: string
  category: string
  price: number
  brand?: string
  id?: number | string
}

// Common clinical formulary staples prioritized for high-speed selection
const CLINICAL_STAPLES: FormularyItem[] = [
  { name: 'Azithromycin 500 mg (IP)', dose: '500 mg · 3 tablets', category: 'Prescription', price: 118, brand: 'Azithral' },
  { name: 'Paracetamol 650 mg (IP)', dose: '650 mg · 10 tablets', category: 'Everyday care', price: 32, brand: 'Dolo / Calpol' },
  { name: 'Ibuprofen 400 mg', dose: '400 mg · 10 tablets', category: 'Everyday care', price: 36, brand: 'Brufen' },
  { name: 'Amoxicillin + Clavulanic Acid 625 mg', dose: '625 mg · 6 tablets', category: 'Prescription', price: 175, brand: 'Augmentin' },
  { name: 'Pantoprazole 40 mg', dose: '40 mg · 10 tablets', category: 'Prescription', price: 86, brand: 'Pan 40' },
  { name: 'Cetirizine 10 mg', dose: '10 mg · 10 tablets', category: 'Everyday care', price: 38, brand: 'Cetzine' },
  { name: 'Montelukast + Levocetirizine', dose: '10mg/5mg · 10 tablets', category: 'Prescription', price: 135, brand: 'Montair LC' },
  { name: 'Metformin 500 mg (SR)', dose: '500 mg · 15 tablets', category: 'Prescription', price: 48, brand: 'Glycomet' },
  { name: 'Amlodipine 5 mg', dose: '5 mg · 10 tablets', category: 'Prescription', price: 42, brand: 'Amlong' },
  { name: 'Atorvastatin 10 mg', dose: '10 mg · 10 tablets', category: 'Prescription', price: 98, brand: 'Atorva' },
  { name: 'Ciprofloxacin 500 mg', dose: '500 mg · 10 tablets', category: 'Prescription', price: 65, brand: 'Ciplox' },
  { name: 'Oral Rehydration Salts (ORS)', dose: '21.8 g · 5 sachets', category: 'Everyday care', price: 95, brand: 'Electral' },
  { name: 'Vitamin D3 60,000 IU', dose: '60,000 IU · 4 capsules', category: 'Wellness', price: 160, brand: 'Calcirol' },
  { name: 'Vitamin C 500 mg (Chewable)', dose: '500 mg · 30 tablets', category: 'Wellness', price: 120, brand: 'Limcee' }
]

// Global cache so all prescription rows share preloaded medicines without redundant API calls
let cachedDatabaseMeds: FormularyItem[] = []
let cachedCatalogTotal = 47335
let isPreloadingCatalog = false
const catalogSubscribers: Array<() => void> = []

function preloadCatalog() {
  if (cachedDatabaseMeds.length > 0 || isPreloadingCatalog) return
  isPreloadingCatalog = true

  getMedicines({ limit: 100, page: 1 })
    .then(res => {
      if (res && Array.isArray(res.medicines) && res.medicines.length > 0) {
        if (res.total) cachedCatalogTotal = res.total
        cachedDatabaseMeds = res.medicines.map(m => ({
          id: m.id,
          name: m.name,
          dose: m.dose || 'Standard Dose',
          category: m.category || 'Clinical Medicine',
          price: Number(m.price) || 120,
          brand: m.brand || 'Iryotek Care'
        }))
        catalogSubscribers.forEach(cb => cb())
      }
    })
    .catch(() => {})
    .finally(() => {
      isPreloadingCatalog = false
    })
}

// Start preloading catalog immediately
preloadCatalog()

const POPULAR_FILTER_TAGS = [
  { label: 'All (47k+)', category: '' },
  { label: 'Staples', category: 'STAPLES' },
  { label: 'Cold & Cough', category: 'Cold Drugs' },
  { label: 'Pain & Fever', category: 'Antipyretic - Analgesic' },
  { label: 'Antibiotics', category: 'Antibiotic' },
  { label: 'Vitamins', category: 'Vitamins' }
]

export const MedicineDropdownInput: React.FC<MedicineDropdownProps> = ({
  value,
  onChange,
  onSelectDose,
  placeholder = 'Type medicine or pick from formulary...',
  required = false,
  style,
  inputStyle,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<FormularyItem[]>(() => {
    return cachedDatabaseMeds.length > 0 ? [...CLINICAL_STAPLES, ...cachedDatabaseMeds] : CLINICAL_STAPLES
  })
  const [totalAvailable, setTotalAvailable] = useState<number>(cachedCatalogTotal)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Parse comma-separated medicines
  const lastCommaIndex = value.lastIndexOf(',')
  const hasComma = lastCommaIndex !== -1
  const activeToken = hasComma ? value.slice(lastCommaIndex + 1) : value
  const activeQuery = activeToken.trim()

  // Completed medicines before current cursor
  const completedMeds = value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  // Subscribe to background catalog preload
  useEffect(() => {
    const handleCatalogLoaded = () => {
      setTotalAvailable(cachedCatalogTotal)
      if (!activeQuery && !selectedTag) {
        // Merge staples + database medicines
        const seen = new Set<string>()
        const merged: FormularyItem[] = []
        for (const item of [...CLINICAL_STAPLES, ...cachedDatabaseMeds]) {
          const key = item.name.toLowerCase().trim()
          if (!seen.has(key)) {
            seen.add(key)
            merged.push(item)
          }
        }
        setResults(merged)
      }
    }

    catalogSubscribers.push(handleCatalogLoaded)
    return () => {
      const idx = catalogSubscribers.indexOf(handleCatalogLoaded)
      if (idx !== -1) catalogSubscribers.splice(idx, 1)
    }
  }, [activeQuery, selectedTag])

  // Search effect across the entire 47,335 database
  useEffect(() => {
    let active = true

    if (!activeQuery) {
      if (selectedTag === 'STAPLES') {
        setResults(CLINICAL_STAPLES)
        setTotalAvailable(CLINICAL_STAPLES.length)
        setLoading(false)
        return
      }

      setLoading(true)
      setPage(1)

      getMedicines({
        category: selectedTag || undefined,
        limit: 80,
        page: 1
      })
        .then(res => {
          if (!active) return
          if (res && Array.isArray(res.medicines) && res.medicines.length > 0) {
            setTotalAvailable(res.total || 47335)
            const dbList: FormularyItem[] = res.medicines.map(m => ({
              id: m.id,
              name: m.name,
              dose: m.dose || 'Standard Dose',
              category: m.category || 'Clinical Medicine',
              price: Number(m.price) || 120,
              brand: m.brand || 'Iryotek Care'
            }))

            // For general 'All' view, prepend clinical staples at the top for instant physician convenience
            const pool = !selectedTag ? [...CLINICAL_STAPLES, ...dbList] : dbList
            const seen = new Set<string>()
            const deduplicated: FormularyItem[] = []
            for (const item of pool) {
              const key = item.name.toLowerCase().trim()
              if (!seen.has(key)) {
                seen.add(key)
                deduplicated.push(item)
              }
            }
            setResults(deduplicated)
          } else {
            setResults(CLINICAL_STAPLES)
            setTotalAvailable(47335)
          }
        })
        .catch(() => {
          if (!active) return
          setResults(CLINICAL_STAPLES)
          setTotalAvailable(47335)
        })
        .finally(() => {
          if (active) setLoading(false)
        })

      return () => {
        active = false
      }
    }

    // Active query typed: search full 47,335 medicines in MySQL!
    setLoading(true)
    setPage(1)

    const timeout = setTimeout(async () => {
      try {
        const res = await getMedicines({
          search: activeQuery,
          category: selectedTag && selectedTag !== 'STAPLES' ? selectedTag : undefined,
          limit: 60,
          page: 1
        })

        if (active && res && Array.isArray(res.medicines)) {
          setTotalAvailable(res.total || res.medicines.length)
          const searchMeds = res.medicines.map(m => ({
            id: m.id,
            name: m.name,
            dose: m.dose || 'Standard Dose',
            category: m.category || 'Clinical Medicine',
            price: Number(m.price) || 120,
            brand: m.brand || 'Iryotek Care'
          }))

          // Also check if any clinical staples match and prioritize
          const q = activeQuery.toLowerCase()
          const matchedStaples = CLINICAL_STAPLES.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.dose.toLowerCase().includes(q) ||
            (s.brand && s.brand.toLowerCase().includes(q))
          )

          const seen = new Set<string>()
          const combined: FormularyItem[] = []
          for (const item of [...matchedStaples, ...searchMeds]) {
            const key = item.name.toLowerCase().trim()
            if (!seen.has(key)) {
              seen.add(key)
              combined.push(item)
            }
          }

          setResults(combined)
          setLoading(false)
          return
        }
      } catch {}

      if (active) {
        // Fallback in-memory search
        const q = activeQuery.toLowerCase()
        const pool = [...CLINICAL_STAPLES, ...mockMedicines]
        const seen = new Set<string>()
        const filtered: FormularyItem[] = []

        for (const item of pool) {
          const key = item.name.toLowerCase()
          if (!seen.has(key) && (key.includes(q) || item.dose.toLowerCase().includes(q) || item.category.toLowerCase().includes(q))) {
            seen.add(key)
            filtered.push({
              name: item.name,
              dose: item.dose,
              category: item.category,
              price: Number(item.price) || 120,
              brand: (item as any).brand
            })
          }
        }
        setResults(filtered)
        setTotalAvailable(filtered.length)
        setLoading(false)
      }
    }, 140)

    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [value, activeQuery, selectedTag])

  // Load next page from database for infinite catalog scrolling
  const handleLoadMore = async () => {
    if (loadingMore) return
    setLoadingMore(true)
    const nextPage = page + 1

    try {
      const res = await getMedicines({
        search: activeQuery || undefined,
        category: selectedTag && selectedTag !== 'STAPLES' ? selectedTag : undefined,
        limit: 60,
        page: nextPage
      })

      if (res && Array.isArray(res.medicines) && res.medicines.length > 0) {
        const moreMeds = res.medicines.map(m => ({
          id: m.id,
          name: m.name,
          dose: m.dose || 'Standard Dose',
          category: m.category || 'Clinical Medicine',
          price: Number(m.price) || 120,
          brand: m.brand || 'Iryotek Care'
        }))

        setResults(prev => {
          const seen = new Set(prev.map(p => p.name.toLowerCase().trim()))
          const appendList: FormularyItem[] = []
          for (const item of moreMeds) {
            const key = item.name.toLowerCase().trim()
            if (!seen.has(key)) {
              seen.add(key)
              appendList.push(item)
            }
          }
          return [...prev, ...appendList]
        })
        setPage(nextPage)
      }
    } catch {}
    finally {
      setLoadingMore(false)
    }
  }

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // When a medicine is chosen from the dropdown:
  const handleSelect = (item: FormularyItem) => {
    let newValue = ''
    if (hasComma) {
      const prefix = value.slice(0, lastCommaIndex + 1).trim()
      newValue = `${prefix} ${item.name}, `
    } else {
      newValue = `${item.name}, `
    }

    onChange(newValue, item)
    if (onSelectDose && item.dose) {
      onSelectDose(item.dose)
    }

    inputRef.current?.focus()
    setSelectedIndex(-1)
  }

  // Remove a specific medicine badge
  const handleRemovePill = (removeIdx: number) => {
    const meds = value.split(',').map(s => s.trim()).filter(Boolean)
    const remaining = meds.filter((_, idx) => idx !== removeIdx)
    const newText = remaining.length > 0 ? `${remaining.join(', ')}, ` : ''
    onChange(newText)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',') {
      setIsOpen(true)
    }

    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault()
        handleSelect(results[selectedIndex])
      } else if (activeQuery) {
        e.preventDefault()
        const prefix = hasComma ? value.slice(0, lastCommaIndex + 1).trim() : ''
        const customVal = prefix ? `${prefix} ${activeQuery}, ` : `${activeQuery}, `
        onChange(customVal, { name: activeQuery, price: 120, dose: 'As directed' })
        setSelectedIndex(-1)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Pills displaying all medicines added so far */}
      {completedMeds.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
          {completedMeds.map((medStr, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#f0fdfa',
                color: '#0f766e',
                border: '1px solid #99f6e4',
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 600
              }}
            >
              <span>💊 {medStr}</span>
              <button
                type="button"
                onClick={() => handleRemovePill(idx)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0d9488',
                  cursor: 'pointer',
                  padding: '0 2px',
                  fontSize: 12,
                  lineHeight: 1,
                  fontWeight: 700
                }}
                title={`Remove ${medStr}`}
                aria-label={`Remove ${medStr}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={e => {
            const nextVal = e.target.value
            onChange(nextVal)
            if (nextVal.endsWith(',') || nextVal.endsWith(', ') || !isOpen) {
              setIsOpen(true)
            }
          }}
          onFocus={() => {
            setIsOpen(true)
            preloadCatalog()
          }}
          onKeyDown={handleKeyDown}
          placeholder={hasComma ? 'Type next medicine after comma (e.g. Paracetamol, Ibuprofen)...' : placeholder}
          required={required && completedMeds.length === 0}
          autoComplete="off"
          style={{
            width: '100%',
            paddingRight: '36px',
            ...inputStyle
          }}
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen)
            if (!isOpen) {
              preloadCatalog()
              inputRef.current?.focus()
            }
          }}
          title={isOpen ? 'Close formulary list' : 'Browse pharmacy formulary (47,335 medicines)'}
          aria-label="Toggle medicine formulary dropdown"
          style={{
            position: 'absolute',
            right: 4,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            color: '#0f766e',
            cursor: 'pointer',
            padding: '4px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            borderRadius: 4,
            transition: 'color 0.15s ease'
          }}
        >
          <span style={{ fontSize: 13, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', display: 'inline-block' }}>
            ▼
          </span>
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 11, color: '#64748b' }}>
        <span>💡 Type <strong>"," (comma)</strong> to add next medicine</span>
        {completedMeds.length > 0 && (
          <span style={{ color: '#0f766e', fontWeight: 600 }}>{completedMeds.length} medicine(s) listed</span>
        )}
      </div>

      {isOpen && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            minWidth: 360,
            width: 'max(100%, 380px)',
            maxWidth: 'min(92vw, 480px)',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            boxShadow: '0 16px 36px -4px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            maxHeight: 330,
            overflowY: 'auto',
            zIndex: 1050,
            padding: '4px 0'
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '7px 12px',
              fontSize: 10,
              fontWeight: 700,
              color: '#0f766e',
              background: '#f0fdfa',
              borderBottom: '1px solid #ccfbf1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}
          >
            <span>
              {hasComma
                ? (activeQuery ? `Matching ("${activeQuery}")` : `Next Medicine (${completedMeds.length} Added)`)
                : (activeQuery ? `Matching Formulary ("${activeQuery}")` : 'Verified Clinical Formulary')}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 9.5, color: '#0d9488', fontWeight: 700 }}>
                {loading ? 'Searching 47,335 items...' : `${totalAvailable.toLocaleString()} AVAILABLE`}
              </span>
              {completedMeds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    border: 'none',
                    background: '#0f766e',
                    color: '#ffffff',
                    fontSize: 9,
                    borderRadius: 3,
                    padding: '2px 6px',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  Done ✓
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Filters */}
          {!activeQuery && (
            <div
              style={{
                display: 'flex',
                gap: 5,
                padding: '6px 10px',
                background: '#f8fafc',
                borderBottom: '1px solid #f1f5f9',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              {POPULAR_FILTER_TAGS.map(tag => {
                const isSelected = selectedTag === tag.category
                return (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => {
                      setSelectedTag(tag.category)
                      setSelectedIndex(-1)
                    }}
                    style={{
                      border: isSelected ? '1px solid #0f766e' : '1px solid #e2e8f0',
                      background: isSelected ? '#0f766e' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontSize: 10,
                      fontWeight: 600,
                      borderRadius: 12,
                      padding: '2px 8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tag.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Medicines List */}
          {results.length === 0 ? (
            <div style={{ padding: '14px', textAlign: 'center', fontSize: 12, color: '#64748b' }}>
              <div>No exact medicine found for "{activeQuery || value}"</div>
              {activeQuery && (
                <button
                  type="button"
                  onClick={() => {
                    const prefix = hasComma ? value.slice(0, lastCommaIndex + 1).trim() : ''
                    const customVal = prefix ? `${prefix} ${activeQuery}, ` : `${activeQuery}, `
                    onChange(customVal, { name: activeQuery, price: 120, dose: 'As directed' })
                    inputRef.current?.focus()
                  }}
                  style={{
                    marginTop: 8,
                    padding: '5px 12px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    fontSize: 11,
                    color: '#0f766e',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  + Add custom medicine: "{activeQuery}"
                </button>
              )}
            </div>
          ) : (
            <>
              {results.map((item, index) => {
                const isSelected = selectedIndex === index
                return (
                  <div
                    key={`${item.name}-${index}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      background: isSelected ? '#f0fdfa' : '#ffffff',
                      borderLeft: isSelected ? '3px solid #0f766e' : '3px solid transparent',
                      borderBottom: '1px solid #f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      transition: 'background 0.1s ease'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                          {item.name}
                        </span>
                        {item.category && (
                          <span
                            style={{
                              fontSize: 9,
                              padding: '1px 5px',
                              borderRadius: 4,
                              background: item.category.toLowerCase().includes('presc') ? '#fef2f2' : '#f0fdf4',
                              color: item.category.toLowerCase().includes('presc') ? '#b91c1c' : '#15803d',
                              fontWeight: 600
                            }}
                          >
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span>{item.dose}</span>
                        {item.brand && <span>· Brand: {item.brand}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0f766e' }}>
                        ₹{item.price}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Load More Button for Complete Database Access */}
              {results.length < totalAvailable && (
                <div style={{ padding: '8px 12px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    style={{
                      padding: '5px 14px',
                      background: '#0f766e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: loadingMore ? 'wait' : 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {loadingMore ? 'Loading more from 47,335 catalog...' : `Load more medicines (${results.length} of ${totalAvailable.toLocaleString()})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
