import { getStoredUser } from './auth'

export const IMAGES = {
  hero: '/assets/img/clinical-consultation.jpg',
  doctor: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1920&q=85',
  doctor2: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=1920&q=85',
  waiting: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=85',
  hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=85',
  hospitalExterior: 'https://images.unsplash.com/photo-1764885517847-79d62138cc58?auto=format&fit=crop&w=1920&q=85',
  pharmacy: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1920&q=85',
}

/* Production imagery: download each IMAGES URL with curl -L into
   public/assets/img/<key>.jpg, then change its value to /assets/img/<key>.jpg.
   For locally generated responsive variants, update initImages to use
   /assets/img/<key>-<width>.jpg rather than Unsplash's width parameter.
   The experience is a product demonstration; it sends no clinical data.
*/

export function initExperience(root, navigate = (path) => { window.location.href = path }) {
  const $ = (selector) => root.querySelector(selector)
  const $$ = (selector) => [...root.querySelectorAll(selector)]
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const touch = window.matchMedia('(pointer: coarse)').matches
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || navigator.connection?.saveData
  const cleanups = []
  const timers = new Set()
  const observers = []
  let gsap, ScrollTrigger, lenis, context, disposed = false, tier = lowPower ? 1 : 0
  let petalCount = reduced ? 0 : touch || lowPower ? 18 : 48
  let toastTimer
  const later = (fn, delay) => { const timer = setTimeout(() => { timers.delete(timer); if (!disposed) fn() }, delay); timers.add(timer); return timer }
  const listen = (element, event, handler, options) => { element?.addEventListener(event, handler, options); cleanups.push(() => element?.removeEventListener(event, handler, options)) }
  const toast = (message) => { clearTimeout(toastTimer); $('.toast').textContent = message; $('.toast').classList.add('show'); toastTimer = later(() => $('.toast').classList.remove('show'), 4000) }
  const observe = (elements, callback, options) => { const observer = new IntersectionObserver(callback, options); elements.forEach(element => observer.observe(element)); observers.push(observer); return observer }
  const perfNames = ['high', 'medium', 'low']
  document.documentElement.dataset.perf = perfNames[tier]

  function initImages() {
    const fallback = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#d8e5da"/><stop offset="1" stop-color="#107980"/></linearGradient></defs><rect width="1000" height="800" fill="url(#g)"/><circle cx="740" cy="210" r="95" fill="#f6f3ec" opacity=".4"/><path d="M0 800L340 290 630 660 820 440 1000 800Z" fill="#083344" opacity=".35"/><path d="M520 560V270M420 310H620M390 275H650M440 310V560M600 310V560" stroke="#083344" stroke-width="14" opacity=".5"/><text x="65" y="700" font-family="serif" font-size="45" fill="#f6f3ec">iryotek / connected care</text></svg>')
    $$('img[data-image]').forEach(image => {
      const source = IMAGES[image.dataset.image]
      image.onerror = () => { image.onerror = null; image.removeAttribute('srcset'); image.src = fallback; image.classList.add('loaded') }
      image.onload = () => image.classList.add('loaded')
      image.decoding = 'async'
      if (source) {
        image.src = source
        if (source.startsWith('https://images.unsplash.com')) image.srcset = [640, 1024, 1600, 2400].map(width => `${source.replace(/w=\d+/, `w=${width}`)} ${width}w`).join(', ')
        image.sizes = image.closest('.hero-art') ? '(max-width: 800px) 100vw, 65vw' : image.closest('.journey-image') ? '235px' : image.closest('.avatar-stack,.doctor-mini,.doctor-result') ? '52px' : '(max-width: 800px) 100vw, 50vw'
      }
      if (image.complete && image.naturalWidth) image.classList.add('loaded')
      cleanups.push(() => { image.onload = null; image.onerror = null })
    })
  }

  function initNavigation() {
    const toggle = $('.menu-toggle')
    listen(toggle, 'click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); $('.desktop-nav').classList.toggle('open', open) })
    $$('a[href^="#"]').forEach(anchor => listen(anchor, 'click', event => {
      const target = $(anchor.getAttribute('href'))
      if (!target) return
      event.preventDefault()
      $('.desktop-nav').classList.remove('open'); toggle.setAttribute('aria-expanded', 'false')
      if (lenis) lenis.scrollTo(target, { offset: -35, duration: 1.5 })
      else target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
      history.replaceState(null, '', anchor.getAttribute('href'))
    }))
    observe($$('main>section[id]'), entries => { entries.forEach(entry => { if (!entry.isIntersecting) return; $$('.section-nav a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`)) }) }, { rootMargin: '-20% 0px -55% 0px' })
  }

  function initEcosystem() {
    const roles = {
      patient: ['Your health.<br>Your world.', 'Book with confidence. Understand your symptoms. Meet your doctor. Keep your health story close. Every step connected, every moment considered.', ['Intelligent booking', 'Personal health records', 'Doorstep delivery']],
      doctor: ['Your expertise.<br>More connected.', 'A clearer clinical picture, before the consultation begins. Patient history, symptom reports, video care, and e-prescriptions in one thoughtful workspace.', ['Clinical queue', 'Video consultations', 'Digital prescriptions']],
      admin: ['Your operations.<br>In perfect focus.', 'Bring your entire organization into view. Monitor appointments, coordinate insurance claims, and share actionable reports with your team.', ['Insurance claims', 'Live analytics', 'Spreadsheet & PDF export']],
    }
    const showRole = role => { const data = roles[role]; $('#role-title').innerHTML = data[0]; $('#role-copy').textContent = data[1]; $('#role-features').replaceChildren(...data[2].map(text => { const span = document.createElement('span'); span.textContent = text; return span })); $$('.orbit-node').forEach(node => { node.classList.toggle('active', node.dataset.role === role); node.setAttribute('aria-pressed', String(node.dataset.role === role)) }); if (gsap && !reduced) gsap.fromTo('.role-detail', { opacity: .5, y: 8 }, { opacity: 1, y: 0, duration: .5 }) }
    $$('.orbit-node').forEach(node => { listen(node, 'click', () => showRole(node.dataset.role)); listen(node, 'mouseenter', () => showRole(node.dataset.role)); listen(node, 'focus', () => showRole(node.dataset.role)) })
    showRole('patient')
    $$('[data-entry]').forEach(button => listen(button, 'click', () => {
      $('#entry-dialog').close()
      const user = getStoredUser()
      if (!user) {
        toast(`Please sign in or sign up to access the ${button.dataset.entry} workspace.`)
        navigate(`/login?role=${button.dataset.entry}&redirect=${button.dataset.entry}`)
      } else {
        navigate(`/${button.dataset.entry}`)
      }
    }))
  }

  function initQueue() {
    $$('.slot:not(.served):not(.current)').forEach(slot => listen(slot, 'click', () => {
      const user = getStoredUser()
      if (!user) {
        toast('Sign in or sign up required to reserve and confirm an appointment slot.')
        navigate('/login?redirect=appointments')
        return
      }
      $$('.slot.reserved').forEach(previous => { previous.classList.remove('reserved'); previous.querySelector('b').textContent = 'Reserve this slot ↗' })
      slot.classList.add('reserved')
      slot.querySelector('b').textContent = 'Reserved for you ✓'
      $('#queue-feed').textContent = `${slot.querySelector('time').textContent}:00 · Token ${slot.querySelector('span').textContent} reserved. No collision.`
      toast(`${slot.querySelector('time').textContent} slot selected. Appointment confirmed.`)
    }))
    let token = 42
    const update = () => { token = token >= 49 ? 42 : token + 1; const el = $('#live-token'); if (el) { el.textContent = String(token).padStart(3, '0'); later(update, 15000) } }
    if ($('#live-token')) later(update, 15000)
  }

  function initTriage() {
    let typingGeneration = 0
    $$('[data-scenario]').forEach(button => listen(button, 'click', () => {
      const emergency = button.dataset.scenario === 'emergency'
      $$('[data-scenario]').forEach(other => other.classList.toggle('active', other === button))
      const text = emergency ? 'I have chest pain and shortness of breath.' : "I've had a headache and sinus pressure for two days."
      const generation = ++typingGeneration
      $('#symptom-message').textContent = ''
      const result = $('#triage-result'); result.style.opacity = '.3'
      const finish = () => {
        result.classList.toggle('emergency', emergency)
        result.innerHTML = emergency ? '<span class="eyebrow">EMERGENCY SIGNAL DETECTED</span><h3>Please seek help now.</h3><p>Chest pain with shortness of breath may be serious. Call 112 immediately or visit the nearest emergency department. Do not wait for an online consultation.</p><div class="report-line"><span>Instant rule-based safety filter</span><span>0 ms design target</span></div><span class="triage-note">Safety demonstration, not live medical assessment.</span>' : '<span class="eyebrow">RECOMMENDED SPECIALTY</span><h3>Ear, Nose & Throat</h3><p>Your symptoms may be consistent with sinusitis or a tension headache.</p><div class="report-line"><span>Differential report</span><span>2 possibilities ↗</span></div><span class="triage-note">AI guidance, not a diagnosis. A clinician makes the final call.</span>'
        result.style.opacity = '1'
        if (gsap && !reduced) gsap.fromTo(result, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .5 })
      }
      if (reduced || emergency) { $('#symptom-message').textContent = text; finish(); return }
      let index = 0
      const type = () => { if (generation !== typingGeneration) return; $('#symptom-message').textContent = text.slice(0, ++index); if (index < text.length) later(type, 23); else finish() }
      type()
    }))
  }

  function initPharmacy() {
    listen($('#sync-cart'), 'click', () => {
      const user = getStoredUser()
      if (!user) {
        toast('Please sign in or sign up to access pharmacy & digital prescriptions.')
        navigate('/login?redirect=pharmacy')
        return
      }
      navigate('/pharmacy')
    })
    listen($('#place-order'), 'click', () => {
      const user = getStoredUser()
      if (!user) {
        toast('Please sign in or sign up to view the pharmacy catalog.')
        navigate('/login?redirect=pharmacy')
        return
      }
      navigate('/pharmacy')
    })
  }

  function initConsultation() {
    $$('[data-consent]').forEach(button => listen(button, 'click', () => { $('.consent-modal').hidden = true; toast(button.dataset.consent === 'allow' ? 'Recording consent granted for this preview. No video is actually recorded.' : 'Your choice is respected. Recording stays off.') }))
    $$('[data-control]').forEach(button => listen(button, 'click', () => { const active = button.getAttribute('aria-pressed') !== 'true'; button.setAttribute('aria-pressed', String(active)); if (button.dataset.control === 'chat') $('.call-chat').hidden = !active; else toast(`${button.dataset.control === 'camera' ? 'Camera' : 'Microphone'} ${active ? 'muted' : 'enabled'} in the preview.`) }))
    listen($('.end-call'), 'click', () => { toast('Preview consultation ended. Your care stays connected.'); $('#call-time').textContent = 'ENDED' })
    listen($('#screen-share'), 'click', () => { const visible = $('.share-overlay').hidden; $('.share-overlay').hidden = !visible; $('#screen-share').textContent = visible ? 'Return to consultation ↗' : 'Preview screen sharing ↗' })
    let seconds = 0, callVisible = false
    observe([$('.video-call')], entries => { callVisible = entries[0].isIntersecting })
    const tick = () => { if (callVisible && !document.hidden && $('#call-time').textContent !== 'ENDED') { seconds++; $('#call-time').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` } later(tick, 1000) }
    later(tick, 1000)
  }

  function initDirectory() {
    const doctors = [
      { name: 'Dr. Arjun Mehta', specialty: 'General physician', city: 'New Delhi', image: 'doctor' },
      { name: 'Dr. Priya Sharma', specialty: 'Cardiologist', city: 'Mumbai', image: 'doctor2' },
      { name: 'Dr. Ananya Rao', specialty: 'ENT specialist', city: 'Bengaluru', image: 'doctor2' },
    ]
    const render = () => {
      const query = $('#doctor-search').value.toLowerCase().trim()
      const matches = doctors.filter(doctor => `${doctor.name} ${doctor.specialty} ${doctor.city}`.toLowerCase().includes(query))
      $('#doctor-results').replaceChildren(...matches.map(doctor => {
        const article = document.createElement('article'); article.className = 'doctor-result'
        article.innerHTML = `<img src="${IMAGES[doctor.image].replace('w=1920', 'w=640')}" width="43" height="43" loading="lazy" decoding="async" alt="${doctor.name}"/><div><h4>${doctor.name}</h4><p>${doctor.specialty} · ${doctor.city}</p></div><a href="#queue" aria-label="View appointment preview for ${doctor.name}">↗</a>`
        const image = article.querySelector('img'); image.onerror = () => { image.onerror = null; image.replaceWith(Object.assign(document.createElement('span'), { textContent: '+', className: 'mini-seal' })) }
        listen(article.querySelector('a'), 'click', event => {
          event.preventDefault()
          const user = getStoredUser()
          if (!user) {
            toast(`Sign in or sign up required to book an appointment with ${doctor.name}.`)
            navigate(`/login?redirect=${encodeURIComponent(`appointments?doctor=${encodeURIComponent(doctor.name)}`)}`)
          } else {
            navigate(`/appointments?doctor=${encodeURIComponent(doctor.name)}`)
          }
        })
        return article
      }))
      if (!matches.length) { const message = document.createElement('p'); message.className = 'empty-results'; message.textContent = 'No preview matches. Try Delhi, Mumbai, ENT, or a doctor name.'; $('#doctor-results').append(message) }
      if (gsap && !reduced && matches.length) gsap.fromTo('.doctor-result', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .35, stagger: .06 })
    }
    render(); listen($('#doctor-search'), 'input', render)
    const counts = { 'New Delhi': '12,480', Mumbai: '9,620', Bengaluru: '8,240', Kolkata: '7,310' }
    $$('.map-point').forEach(point => { const show = () => { $('#map-tooltip').textContent = `${point.dataset.city.toUpperCase()} · ${counts[point.dataset.city]} DOCTORS CONNECTED` }; listen(point, 'mouseenter', show); listen(point, 'focus', show); listen(point, 'click', () => { show(); $('#doctor-search').value = point.dataset.city; render() }); listen(point, 'keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); point.dispatchEvent(new Event('click')) } }) })
  }

  function initDialogsAndExports() {
    const open = () => $('#entry-dialog').showModal()
    listen($('#begin-button'), 'click', open)
    
    const currentUser = getStoredUser()
    const cta = $('.header-cta')
    const authLink = $('.header-auth-link')
    if (currentUser) {
      if (cta) {
        cta.innerHTML = `Workspace (${currentUser.role}) <span>↗</span>`
        listen(cta, 'click', event => {
          event.preventDefault()
          navigate(`/${currentUser.role.toLowerCase()}`)
        })
      }
      if (authLink) {
        authLink.textContent = currentUser.displayName ? currentUser.displayName.split(' ')[0] : 'Profile'
        authLink.href = '/profile'
        listen(authLink, 'click', event => {
          event.preventDefault()
          navigate('/profile')
        })
      }
    } else {
      if (cta) listen(cta, 'click', event => { event.preventDefault(); open() })
      if (authLink) listen(authLink, 'click', event => { event.preventDefault(); navigate('/login') })
    }

    $$('.button').forEach(button => listen(button, 'pointerdown', event => {
      if (reduced || !gsap) return
      const rect = button.getBoundingClientRect(), ripple = document.createElement('span')
      ripple.className = 'ripple'; ripple.style.left = `${event.clientX - rect.left}px`; ripple.style.top = `${event.clientY - rect.top}px`; button.append(ripple)
      gsap.to(ripple, { scale: 4, opacity: 0, duration: .85, onComplete: () => ripple.remove() })
    }))
    $$('dialog').forEach(dialog => { listen(dialog.querySelector('.dialog-close'), 'click', () => dialog.close()); listen(dialog, 'click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close() } }) })
    $$('[data-info]').forEach(button => listen(button, 'click', () => navigate(button.dataset.info === 'privacy' ? '/privacy' : '/contact')))
    const destinations = { queue: ['Open appointment booking', '/appointments'], sakura: ['Talk with Iryo', '/triage'], pharmacy: ['Explore the pharmacy', '/pharmacy'], consult: ['View appointments & queue', '/appointments'], records: ['Open your health records', '/records'], directory: ['Search the full demo directory', '/directory'], admin: ['Open admin center', '/admin'] }
    Object.entries(destinations).forEach(([id, [label, path]]) => {
      const section = $(`#${id}`), link = document.createElement('a')
      link.className = 'text-link feature-route'; link.href = path; link.textContent = `${label} ↗`; section.append(link)
      listen(link, 'click', event => {
        event.preventDefault()
        const user = getStoredUser()
        if (!user) {
          toast(`Please sign in or sign up to explore ${label.toLowerCase()}.`)
          navigate(`/login?redirect=${encodeURIComponent(path.slice(1))}`)
        } else {
          navigate(path)
        }
      })
      cleanups.push(() => link.remove())
    })

    const extraLinks = [[$('#directory'), 'Explore hospitals', '/hospitals'], [$('.footer-top>div:last-child'), 'Demo sign in', '/login'], [$('.footer-top>div:last-child'), 'Get started', '/register']]
    extraLinks.forEach(([container, label, path]) => {
      const link = document.createElement('a'); link.className = 'text-link feature-route'; link.href = path; link.textContent = `${label} ↗`; container.append(link)
      listen(link, 'click', event => {
        event.preventDefault()
        if (path === '/login' || path === '/register') {
          navigate(path)
          return
        }
        const user = getStoredUser()
        if (!user) {
          toast(`Please sign in or create an account to access ${label.toLowerCase()}.`)
          navigate(`/login?redirect=${encodeURIComponent(path.slice(1))}`)
        } else {
          navigate(path)
        }
      })
      cleanups.push(() => link.remove())
    })
    $$('[data-export]').forEach(button => listen(button, 'click', () => {
      if (button.dataset.export === 'pdf') { $('.export-status').textContent = 'Use your browser dialog to save as PDF.'; window.print(); return }
      const blob = new Blob(['\ufeffMetric,Value\nAppointments,1248\nClaims processed,386\nPatient satisfaction,98.6%\n'], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'iryotek-care-overview.csv'; anchor.click(); later(() => URL.revokeObjectURL(url), 1000); $('.export-status').textContent = 'Spreadsheet downloaded. Ready for Excel.'; toast('Your overview is ready. Open the CSV in Excel.')
    }))
  }

  function initMotion() {
    gsap = window.gsap; ScrollTrigger = window.ScrollTrigger
    if (!gsap || !ScrollTrigger) { $('.intro').hidden = true; initCountsFallback(); return }
    gsap.registerPlugin(ScrollTrigger)
    if (window.Lenis && !reduced) {
      lenis = new window.Lenis({ duration: 1.25, smoothWheel: true, anchors: false })
      lenis.on('scroll', ScrollTrigger.update)
      cleanups.push(() => lenis?.destroy())
    }
    gsap.ticker.lagSmoothing(0)
    context = gsap.context(() => {
      gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: .6 } })
      $$('[data-count]').forEach(element => { const counter = { value: 0 }; gsap.to(counter, { value: Number(element.dataset.count), duration: reduced ? 0 : 2, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 95%', once: true }, onUpdate: () => { element.textContent = Math.round(counter.value).toLocaleString('en-US') } }) })
      if (reduced) return
      $$('.section-heading,.section-copy h2,.section-label,.role-detail,.final-section h2').forEach(element => { gsap.from(element, { y: 30, opacity: 0, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } }) })
      $$('.photo-frame:not(.hero-art),.product-panel,.vitals-grid article').forEach(frame => {
        gsap.fromTo(frame, { clipPath: 'inset(14% 0 100% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 1.3, ease: 'power4.out', scrollTrigger: { trigger: frame, start: 'top 92%', once: true } })
        const image = frame.querySelector('img')
        if (image) gsap.fromTo(image, { scale: 1.15 }, { scale: 1, duration: 1.7, ease: 'power3.out', scrollTrigger: { trigger: frame, start: 'top 95%', once: true } })
      })
      $$('.draw-line').forEach(path => { const length = path.getTotalLength(); gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.7, ease: 'power2.out', scrollTrigger: { trigger: path.closest('section'), start: 'top 65%', once: true } }) })
      gsap.from('.bars i', { scaleY: 0, stagger: .08, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.bars', start: 'top 90%', once: true } })
      gsap.to('.chaos-tokens span', { x: 0, y: 0, rotation: 0, stagger: .08, ease: 'none', scrollTrigger: { trigger: '.problem-layout', start: 'top 65%', end: 'bottom 75%', scrub: .8 } })
      gsap.from('.problem-stack article', { opacity: .2, y: 15, stagger: .18, scrollTrigger: { trigger: '.problem-stack', start: 'top 75%', end: 'bottom 85%', scrub: .8 } })
      gsap.from('.slot', { x: 40, opacity: 0, stagger: .16, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '.queue-board', start: 'top 75%', once: true } })
      gsap.to('.footer-wordmark', { color: '#8fb9ad', duration: 1, scrollTrigger: { trigger: '.site-footer', start: 'top 90%', end: 'bottom bottom', scrub: .8 } })
      const match = gsap.matchMedia()
      match.add('(min-width: 801px)', () => {
        const track = $('.journey-cards')
        const distance = () => Math.max(0, track.scrollWidth - $('.journey-track').clientWidth)
        const timeline = gsap.timeline({ scrollTrigger: { trigger: '#journey', start: 'top top', end: () => `+=${distance() + 450}`, pin: true, scrub: .8, anticipatePin: 1, fastScrollEnd: true, invalidateOnRefresh: true } })
        timeline.to(track, { x: () => -distance(), ease: 'none' }, 0)
        const river = $('#river'), dot = $('#river-dot'), length = river.getTotalLength(), riverState = { progress: 0 }
        timeline.to(riverState, { progress: 1, ease: 'none', onUpdate: () => { const point = river.getPointAtLength(length * riverState.progress); dot.setAttribute('cx', String(point.x)); dot.setAttribute('cy', String(point.y)) } }, 0)
      })
      cleanups.push(() => match.revert())
    }, root)
    initIntro(); initPointer(); initTicker()
    later(() => ScrollTrigger.refresh(), 800)
  }

  function initCountsFallback() { $$('[data-count]').forEach(element => { element.textContent = Number(element.dataset.count).toLocaleString('en-US') }) }

  function initIntro() {
    let seen = false
    try { seen = sessionStorage.getItem('iryotek-intro') === 'seen' } catch {}
    const intro = $('.intro')
    let timeline, finished = false
    const finish = () => { if (finished) return; finished = true; timeline?.kill(); intro.hidden = true; document.body.style.overflow = ''; lenis?.start(); try { sessionStorage.setItem('iryotek-intro', 'seen') } catch {}; ScrollTrigger.refresh(); if (!reduced) gsap.fromTo('.hero-char', { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .026, duration: 1.1, ease: 'power4.out' }) }
    listen($('.skip-intro'), 'click', finish)
    if (reduced || seen) { finish(); return }
    document.body.style.overflow = 'hidden'; lenis?.stop()
    later(finish, 5000)
    const counter = { value: 0 }
    timeline = gsap.timeline({ onComplete: finish })
    timeline.to('.enso-stroke', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 0)
      .fromTo('.intro-kanji', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .8 }, .3)
      .to(counter, { value: 100, duration: 2.5, ease: 'power2.inOut', onUpdate: () => { $('.intro-counter').textContent = String(Math.round(counter.value)).padStart(3, '0') } }, 0)
      .to('.intro-progress', { scaleX: 1, duration: 2.5 }, 0)
      .fromTo('.intro-center .hanko', { scale: 1.6, rotation: -15 }, { scale: 1, rotation: -7, opacity: 1, duration: .45, ease: 'back.out(3)' }, 1.9)
      .to('.intro-center', { scale: 1.5, opacity: 0, duration: .65, ease: 'power4.in' }, 2.6)
      .to('.shoji', { opacity: 1, duration: .2 }, 2.7)
      .set(intro, { background: 'transparent' }, 2.9)
      .to('.shoji-left', { xPercent: -100, duration: 1.1, ease: 'power4.inOut' }, 2.9)
      .to('.shoji-right', { xPercent: 100, duration: 1.1, ease: 'power4.inOut' }, 2.9)
      .to('.skip-intro,.intro-progress', { opacity: 0, duration: .3 }, 3)
    cleanups.push(() => { timeline?.kill(); document.body.style.overflow = '' })
  }

  let pointerX = -100, pointerY = -100, ringX = -100, ringY = -100
  function initPointer() {
    if (touch || reduced) return
    $('.cursor').style.display = 'block'; $('.cursor-ring').style.display = 'flex'
    listen(window, 'pointermove', event => { pointerX = event.clientX; pointerY = event.clientY })
    $$('a,button,.tilt').forEach(element => { listen(element, 'mouseenter', () => { $('.cursor-ring').classList.add('hover'); $('.cursor-ring span').textContent = element.classList.contains('tilt') ? 'VIEW' : 'OPEN' }); listen(element, 'mouseleave', () => { $('.cursor-ring').classList.remove('hover'); $('.cursor-ring span').textContent = '' }) })
    const rects = new Map(), cache = () => { $$('.magnetic,.tilt').forEach(element => rects.set(element, element.getBoundingClientRect())) }
    cache(); listen(window, 'resize', () => later(cache, 180)); ScrollTrigger.addEventListener('refresh', cache); cleanups.push(() => ScrollTrigger.removeEventListener('refresh', cache))
    $$('.magnetic').forEach(button => { const xTo = gsap.quickTo(button, 'x', { duration: .35 }), yTo = gsap.quickTo(button, 'y', { duration: .35 }); listen(button, 'pointerenter', () => rects.set(button, button.getBoundingClientRect())); listen(button, 'pointermove', event => { const rect = rects.get(button); xTo((event.clientX - rect.left - rect.width / 2) * .13); yTo((event.clientY - rect.top - rect.height / 2) * .2) }); listen(button, 'pointerleave', () => { xTo(0); yTo(0) }) })
    $$('.tilt').forEach(card => { const rotateX = gsap.quickTo(card, 'rotationX', { duration: .4 }), rotateY = gsap.quickTo(card, 'rotationY', { duration: .4 }); listen(card, 'pointerenter', () => rects.set(card, card.getBoundingClientRect())); listen(card, 'pointermove', event => { const rect = rects.get(card); rotateY((event.clientX - rect.left - rect.width / 2) / rect.width * 9); rotateX(-(event.clientY - rect.top - rect.height / 2) / rect.height * 9) }); listen(card, 'pointerleave', () => { rotateX(0); rotateY(0) }) })
  }

  function initTicker() {
    const canvas = $('#petals'), ctx = canvas.getContext('2d'), sprite = document.createElement('canvas')
    sprite.width = 40; sprite.height = 40
    const spriteContext = sprite.getContext('2d'); spriteContext.fillStyle = '#e4bfc3'; spriteContext.beginPath(); spriteContext.moveTo(20, 4); spriteContext.bezierCurveTo(40, 12, 33, 33, 20, 35); spriteContext.bezierCurveTo(7, 33, 0, 12, 20, 4); spriteContext.fill()
    let width = 0, height = 0, heroVisible = true
    const resize = () => { const rect = $('.hero').getBoundingClientRect(); width = rect.width; height = rect.height; const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    resize(); let resizeTimer
    listen(window, 'resize', () => { clearTimeout(resizeTimer); resizeTimer = later(resize, 200) })
    observe([$('.hero')], entries => { heroVisible = entries[0].isIntersecting })
    const pool = Array.from({ length: 48 }, () => ({ x: Math.random() * width, y: Math.random() * height, size: 4 + Math.random() * 10, velocity: 9 + Math.random() * 22, rotation: Math.random() * 6.28, alpha: .25 + Math.random() * .4 }))
    const heroY = gsap.quickSetter($('.hero-art img'), 'y', 'px')
    const cursorX = gsap.quickSetter($('.cursor'), 'x', 'px'), cursorY = gsap.quickSetter($('.cursor'), 'y', 'px'), ringSetX = gsap.quickSetter($('.cursor-ring'), 'x', 'px'), ringSetY = gsap.quickSetter($('.cursor-ring'), 'y', 'px')
    let average = 16.67, slowTime = 0, lastUpdate = 0, tierChanged = 0
    const update = (time, deltaMs) => {
      if (document.hidden) return
      if (lenis) lenis.raf(time * 1000)
      const delta = Math.min(deltaMs || 16.67, 100), step = delta / 1000
      average += (delta - average) * .025
      if (average > 20.5) slowTime += delta; else slowTime = Math.max(0, slowTime - delta * .5)
      if (slowTime > 1500 && time - tierChanged > 4 && tier < 2) { tier++; tierChanged = time; slowTime = 0; petalCount = Math.floor(petalCount / 2); document.documentElement.dataset.perf = perfNames[tier] }
      if (time - lastUpdate > .5) { $('.fps-meter').textContent = `${Math.round(1000 / average)} FPS / ${perfNames[tier].toUpperCase()}`; lastUpdate = time }
      if (!touch && !reduced) { const smoothing = 1 - Math.exp(-step * 12); ringX += (pointerX - ringX) * smoothing; ringY += (pointerY - ringY) * smoothing; cursorX(pointerX - 2); cursorY(pointerY - 2); const size = $('.cursor-ring').classList.contains('hover') ? 29 : 15; ringSetX(ringX - size); ringSetY(ringY - size) }
      if (!heroVisible || !ctx || !petalCount) return
      if (tier < 2 && !touch && !reduced) { const scroll = lenis ? lenis.scroll : window.scrollY; heroY(Math.min(scroll * .1, 75) + Math.sin(time * .13) * 5) }
      ctx.clearRect(0, 0, width, height)
      const wind = tier < 2 ? (pointerX / Math.max(width, 1) - .5) * 14 : 0
      for (let index = 0; index < petalCount; index++) { const petal = pool[index]; petal.x += (petal.velocity * .7 + wind) * step; petal.y += petal.velocity * step; petal.rotation += step * .3; if (petal.y > height + 20) { petal.y = -20; petal.x = Math.random() * width } if (petal.x > width + 20) petal.x = -20; ctx.save(); ctx.globalAlpha = petal.alpha; ctx.translate(petal.x, petal.y); ctx.rotate(petal.rotation); ctx.drawImage(sprite, -petal.size / 2, -petal.size / 2, petal.size, petal.size); ctx.restore() }
    }
    gsap.ticker.add(update); cleanups.push(() => gsap.ticker.remove(update))
    listen(window, 'keydown', event => { if (event.key.toLowerCase() === 'f' && !event.ctrlKey && !event.metaKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) $('.fps-meter').hidden = !$('.fps-meter').hidden })
  }

  function initSplitText() {
    $$('.headline-line').forEach(line => {
      const target = line.querySelector('em') || line
      const text = target.textContent
      line.setAttribute('aria-label', text)
      target.replaceChildren(...Array.from(text).map(character => { const span = document.createElement('span'); span.className = 'hero-char'; span.setAttribute('aria-hidden', 'true'); span.textContent = character === ' ' ? '\u00a0' : character; return span }))
    })
  }

  initSplitText(); initImages(); initNavigation(); initEcosystem(); initQueue(); initTriage(); initPharmacy(); initConsultation(); initDirectory(); initDialogsAndExports()
  let attempts = 0
  const waitForMotion = () => { if (window.gsap && window.ScrollTrigger) initMotion(); else if (++attempts < 60) later(waitForMotion, 100); else { $('.intro').hidden = true; initCountsFallback() } }
  waitForMotion()
  return () => { disposed = true; timers.forEach(clearTimeout); observers.forEach(observer => observer.disconnect()); cleanups.forEach(cleanup => cleanup()); context?.revert(); gsap?.killTweensOf(root.querySelectorAll('*')); document.body.style.overflow = '' }
}
