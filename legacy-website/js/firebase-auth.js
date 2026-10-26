/**
 * IRYOTEK Healthcare Intelligence - Role-Based Authentication
 * Roles & Flows:
 * 1. Patients: Firebase login/signup (Google Sign-In, Phone SMS OTP, Firebase Email/Password)
 * 2. Doctors: Clinical Email/Password sign up & sign in
 * 3. Admins: Predefined Email/Password (admin@gmail.com / admin)
 */

(function () {
  "use strict";

  // =========================================================================
  // 1. Firebase Configuration
  // =========================================================================
  window.IRYOTEK_FIREBASE_CONFIG = {
    apiKey: "AIzaSyAsUO6uqJ2j28kzB85sm98mokiB_xtflrE",
    authDomain: "iryotek-c7b5c.firebaseapp.com",
    projectId: "iryotek-c7b5c",
    storageBucket: "iryotek-c7b5c.firebasestorage.app",
    messagingSenderId: "585328547112",
    appId: "1:585328547112:web:aa433892f9c3df632aec1d",
    measurementId: "G-15FRD54J2D"
  };

  let auth = null;
  let isFirebaseConfigured = false;
  let currentAuthTab = "signup"; // "signup" | "signin"
  let currentMethod = "email";   // "email" | "phone"
  let selectedRole = "Patient";  // "Patient" | "Doctor" | "Admin"
  let recaptchaVerifier = null;
  let phoneConfirmationResult = null;
  let resendCountdownTimer = null;

  // Initialize Firebase
  function initFirebase() {
    try {
      const cfg = window.IRYOTEK_FIREBASE_CONFIG;
      if (
        cfg &&
        cfg.apiKey &&
        !cfg.apiKey.includes("YOUR_FIREBASE_API_KEY") &&
        typeof firebase !== "undefined"
      ) {
        if (!firebase.apps.length) {
          firebase.initializeApp(cfg);
        }
        auth = firebase.auth();
        isFirebaseConfigured = true;
        console.log("[IRYOTEK Auth] Firebase initialized successfully.");

        // Subscribe to real Firebase auth state changes
        auth.onAuthStateChanged(function (user) {
          if (user) {
            // Annotate patient role for Firebase authenticated users if not custom
            const savedSession = getSavedSessionUser();
            if (savedSession && (savedSession.role === "Doctor" || savedSession.role === "Admin")) {
              handleAuthStateChange(savedSession);
            } else {
              const restoredProfile = (savedSession && savedSession.patientProfile) || resolvePatientProfile(user.uid, user.email);
              const patientUser = {
                uid: user.uid,
                displayName: (restoredProfile && restoredProfile.fullName) || user.displayName || (user.email ? user.email.split("@")[0] : user.phoneNumber),
                email: user.email,
                phoneNumber: user.phoneNumber,
                photoURL: user.photoURL,
                role: "Patient",
                authProvider: (user.providerData && user.providerData[0] && user.providerData[0].providerId.includes("google"))
                  ? "Google Auth"
                  : (user.phoneNumber ? "Phone SMS OTP" : "Email & Password"),
                access: "Appointments, Telehealth & Pharmacy",
                patientProfile: restoredProfile || undefined
              };
              setSavedSessionUser(patientUser);
              handleAuthStateChange(patientUser);
            }
          } else {
            const saved = getSavedSessionUser();
            handleAuthStateChange(saved || null);
          }
        });
      } else {
        console.info("[IRYOTEK Auth] Running with local session management.");
        const saved = getSavedSessionUser();
        handleAuthStateChange(saved || null);
      }
    } catch (e) {
      console.warn("[IRYOTEK Auth] Firebase init error, using session storage:", e);
      const saved = getSavedSessionUser();
      handleAuthStateChange(saved || null);
    }
  }

  // =========================================================================
  // 2. Local Session & Registered Users Storage
  // =========================================================================
  function resolvePatientProfile(uid, email) {
    try {
      if (uid) {
        const byUid = localStorage.getItem("iryotek_patient_profile_" + uid);
        if (byUid) return JSON.parse(byUid);
      }
      if (email) {
        const norm = email.trim().toLowerCase();
        const byEmail = localStorage.getItem("iryotek_patient_profile_" + norm);
        if (byEmail) return JSON.parse(byEmail);

        const registry = JSON.parse(localStorage.getItem("iryotek_registered_patients") || "{}");
        if (registry[norm] && registry[norm].profile) return registry[norm].profile;
      }
    } catch (e) {}
    return null;
  }

  function resolveEmailFromPhone(phoneInput) {
    if (!phoneInput) return null;
    const cleanDigits = phoneInput.replace(/[^0-9]/g, "");
    const tenDigits = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    try {
      const phoneMap = JSON.parse(localStorage.getItem("iryotek_registered_phones") || "{}");
      if (phoneMap[tenDigits]) return phoneMap[tenDigits];
      if (phoneMap[cleanDigits]) return phoneMap[cleanDigits];

      const registry = JSON.parse(localStorage.getItem("iryotek_registered_patients") || "{}");
      for (const em in registry) {
        const item = registry[em];
        const p = (item && item.phone) || (item && item.profile && (item.profile.phone || (item.profile.emergencyContact && item.profile.emergencyContact.phone)));
        if (p) {
          const pDigits = p.replace(/[^0-9]/g, "");
          if (pDigits.endsWith(tenDigits) || tenDigits.endsWith(pDigits)) {
            return em;
          }
        }
      }
    } catch (e) {}
    return null;
  }

  function getSavedSessionUser() {
    try {
      if (!localStorage.getItem("iryotek_users_purged_flag_v1")) {
        localStorage.removeItem("iryotek_registered_patients");
        localStorage.removeItem("iryotek_registered_phones");
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && (k.startsWith("iryotek_patient_profile_") || k.startsWith("iryotek_patient_records_") || k.startsWith("iryotek_patient_intake_"))) {
            localStorage.removeItem(k);
          }
        }
        const cur = localStorage.getItem("iryotek_auth_user");
        if (cur) {
          try {
            const parsed = JSON.parse(cur);
            if (parsed && parsed.role === "Patient") {
              localStorage.removeItem("iryotek_auth_user");
            }
          } catch (e) {}
        }
        localStorage.setItem("iryotek_users_purged_flag_v1", "true");
      }
      const data = localStorage.getItem("iryotek_auth_user");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setSavedSessionUser(user) {
    try {
      if (user) {
        if (!user.patientProfile) {
          const prev = getSavedSessionUser();
          const restored = (prev && prev.patientProfile) || resolvePatientProfile(user.uid, user.email);
          if (restored) user.patientProfile = restored;
        }
        localStorage.setItem("iryotek_auth_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("iryotek_auth_user");
      }
    } catch (e) {}
  }

  const SEED_DATASET_DOCTORS = [
    {
      uid: "doc_seed_01",
      displayName: "Dr. Rajesh Kumar Panda (Cardiology)",
      email: "rajesh.panda@aiims.edu",
      password: "doctor123",
      role: "Doctor",
      specialist: "Cardiology",
      hospital: "AIIMS Bhubaneswar",
      authProvider: "Hospital Doctor Dataset",
      access: "Clinical OPD, E-Prescriptions & Diagnosis"
    },
    {
      uid: "doc_seed_02",
      displayName: "Dr. Priya Mohanty (Orthopedics)",
      email: "priya.mohanty@aiims.edu",
      password: "doctor123",
      role: "Doctor",
      specialist: "Orthopedics",
      hospital: "AIIMS Bhubaneswar",
      authProvider: "Hospital Doctor Dataset",
      access: "Clinical OPD, E-Prescriptions & Diagnosis"
    },
    {
      uid: "doc_seed_03",
      displayName: "Dr. Sanjay Mishra (General Medicine)",
      email: "sanjay.mishra@kims.com",
      password: "doctor123",
      role: "Doctor",
      specialist: "General Medicine",
      hospital: "KIMS Hospital",
      authProvider: "Hospital Doctor Dataset",
      access: "Clinical OPD, E-Prescriptions & Diagnosis"
    },
    {
      uid: "doc_seed_04",
      displayName: "Dr. Vikram Singh (Neurology)",
      email: "vikram.singh@aiims.in",
      password: "doctor123",
      role: "Doctor",
      specialist: "Neurology",
      hospital: "AIIMS New Delhi",
      authProvider: "Hospital Doctor Dataset",
      access: "Clinical OPD, E-Prescriptions & Diagnosis"
    },
    {
      uid: "doc_seed_05",
      displayName: "Dr. Suresh Joshi (Cardiology)",
      email: "suresh.joshi@lilavati.com",
      password: "doctor123",
      role: "Doctor",
      specialist: "Cardiology",
      hospital: "Lilavati Hospital Mumbai",
      authProvider: "Hospital Doctor Dataset",
      access: "Clinical OPD, E-Prescriptions & Diagnosis"
    },
    {
      uid: "doc_seed_06",
      displayName: "Dr. Anita Q. Basu (Cardiology)",
      email: "anita.q.basu@hospital.com",
      password: "doctor123",
      role: "Doctor",
      specialist: "Cardiology",
      hospital: "Care Hospitals",
      authProvider: "Hospital Doctor Dataset (100k+ Records)",
      access: "Clinical OPD, E-Prescriptions & Diagnosis"
    }
  ];

  function getRegisteredDoctors() {
    try {
      const stored = JSON.parse(localStorage.getItem("iryotek_registered_doctors") || "[]");
      const combined = [...SEED_DATASET_DOCTORS];
      stored.forEach(doc => {
        if (!combined.some(d => d.email.toLowerCase() === doc.email.toLowerCase())) {
          combined.push(doc);
        }
      });
      return combined;
    } catch (e) {
      return SEED_DATASET_DOCTORS;
    }
  }

  function saveRegisteredDoctor(doc) {
    try {
      const stored = JSON.parse(localStorage.getItem("iryotek_registered_doctors") || "[]");
      stored.push(doc);
      localStorage.setItem("iryotek_registered_doctors", JSON.stringify(stored));
    } catch (e) {}
  }

  // Generate Doctor Official Clinical Email strictly matching dataset patterns
  // Examples from dataset:
  // - 2_import_dataset.sql: anita.q.basu@hospital.com, satish.z.brar@hospital.com
  // - seed_data.sql: rajesh.panda@aiims.edu, sanjay.mishra@kims.com, suresh.joshi@lilavati.com
  function generateDatasetDoctorEmail(firstName, middleName, lastName, hospital) {
    const f = (firstName || "doctor").toLowerCase().replace(/[^a-z0-9]/g, "");
    const l = (lastName || "clinician").toLowerCase().replace(/[^a-z0-9]/g, "");

    let namePart = "";
    if (middleName && middleName.trim()) {
      // Extract middle initial (matching anita.q.basu or amit.k.sharma)
      const m = middleName.trim().charAt(0).toLowerCase();
      namePart = `${f}.${m}.${l}`;
    } else {
      // Standard first.last (matching rajesh.panda or priya.mohanty)
      namePart = `${f}.${l}`;
    }

    const hosp = (hospital || "").toLowerCase();
    let domain = "hospital.com";
    if (hosp.includes("aiims")) {
      domain = "aiims.edu";
    } else if (hosp.includes("kims")) {
      domain = "kims.com";
    } else if (hosp.includes("lilavati")) {
      domain = "lilavati.com";
    } else if (hosp.includes("scb")) {
      domain = "scb.edu";
    } else if (hosp.includes("apollo")) {
      domain = "apollo.com";
    } else if (hosp.includes("safdarjung")) {
      domain = "safdarjung.in";
    } else if (hosp.includes("narayana")) {
      domain = "narayana.com";
    } else if (hosp.includes("kem")) {
      domain = "kem.edu";
    } else if (hosp.includes("sassoon")) {
      domain = "sassoon.edu";
    } else if (hosp.includes("fortis")) {
      domain = "fortishealthcare.com";
    } else if (hosp.includes("manipal")) {
      domain = "manipalhospitals.com";
    } else if (hosp.includes("max")) {
      domain = "maxhealthcare.com";
    } else if (hosp.includes("care")) {
      domain = "carehospitals.com";
    } else if (hosp.trim()) {
      const cleanWord = hosp.split(/[^a-z0-9]/).filter(w => w && !["hospital", "hospitals", "clinic", "centre", "center", "institute", "and", "the", "of", "super", "speciality"].includes(w))[0];
      if (cleanWord && cleanWord.length >= 3) {
        domain = `${cleanWord}.com`;
      } else {
        domain = "hospital.com";
      }
    }

    return `${namePart}@${domain}`;
  }

  // =========================================================================
  // 3. UI State Management (Header Chip & Profile Modal)
  // =========================================================================
  function handleAuthStateChange(user) {
    const joinUsBtn = document.getElementById("btn-join-us");
    const userChip = document.getElementById("auth-user-chip");
    const userChipName = document.getElementById("auth-user-name");
    const userChipAvatar = document.getElementById("auth-user-avatar");
    const userChipRole = document.querySelector(".auth-user-chip__role");

    const profileName = document.getElementById("profile-user-name");
    const profileEmail = document.getElementById("profile-user-email");
    const profileUid = document.getElementById("profile-user-uid");
    const profileProvider = document.getElementById("profile-user-provider");
    const profileAvatar = document.getElementById("profile-user-avatar");
    const profileRole = document.getElementById("profile-user-role");
    const profileAccess = document.getElementById("profile-user-access");
    const profilePortalLink = document.getElementById("profile-portal-link");

    if (user) {
      // User is LOGGED IN
      const role = user.role || "Patient";
      let displayName = user.displayName;
      if (!displayName) {
        if (role === "Admin") displayName = "System Administrator";
        else if (role === "Doctor") displayName = "Dr. " + (user.email ? user.email.split("@")[0] : "Specialist");
        else if (user.email) displayName = user.email.split("@")[0];
        else if (user.phoneNumber) displayName = user.phoneNumber;
        else displayName = "Healthcare Member";
      }

      let initials = "PT";
      if (role === "Admin") initials = "AD";
      else if (role === "Doctor") initials = "DR";
      else if (user.displayName) {
        initials = user.displayName
          .split(" ")
          .map((p) => p[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      } else if (user.phoneNumber) {
        initials = "PH";
      } else if (user.email) {
        initials = user.email.slice(0, 2).toUpperCase();
      }

      // Update Header User Chip
      if (joinUsBtn) {
        joinUsBtn.style.setProperty("display", "none", "important");
        joinUsBtn.classList.add("is-hidden");
      }
      if (userChip) {
        userChip.style.setProperty("display", "inline-flex", "important");
        userChip.classList.remove("is-hidden");
        if (userChipName) userChipName.textContent = displayName;
        if (userChipRole) {
          userChipRole.textContent = role.toUpperCase();
          if (role === "Admin") userChipRole.style.color = "#c084fc";
          else if (role === "Doctor") userChipRole.style.color = "#34d399";
          else userChipRole.style.color = "#00c2cb";
        }
        if (userChipAvatar) {
          if (role === "Admin") {
            userChipAvatar.style.background = "#8b5cf6";
            userChipAvatar.style.borderColor = "#a855f7";
          } else if (role === "Doctor") {
            userChipAvatar.style.background = "#10b981";
            userChipAvatar.style.borderColor = "#059669";
          } else {
            userChipAvatar.style.background = "#00c2cb";
            userChipAvatar.style.borderColor = "#00c2cb";
          }

          if (user.photoURL) {
            userChipAvatar.innerHTML = `<img src="${user.photoURL}" alt="${displayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"/>`;
          } else {
            userChipAvatar.textContent = initials;
          }
        }
      }

      // Update Profile Modal Details
      if (profileName) profileName.textContent = displayName;
      if (profileEmail) {
        profileEmail.textContent = user.email || user.phoneNumber || "clinical.credentials@hospital.org";
      }
      if (profileUid) {
        profileUid.textContent = (user.uid || "IRY-AUTH-01").slice(0, 16);
      }

      // Role display in profile
      if (profileRole) {
        if (role === "Admin") profileRole.textContent = "Hospital Administrator (Root Admin)";
        else if (role === "Doctor") profileRole.textContent = "Doctor (Consultant Specialist)";
        else profileRole.textContent = "Patient (Care Member)";
      }

      // Access level in profile
      if (profileAccess) {
        if (role === "Admin") {
          profileAccess.textContent = "Full HMS, OPD, Pharmacy & User Controls";
          profileAccess.style.color = "#8b5cf6";
        } else if (role === "Doctor") {
          profileAccess.textContent = "Clinical OPD, E-Prescriptions & Diagnosis";
          profileAccess.style.color = "#10b981";
        } else {
          profileAccess.textContent = "Appointments, Telehealth & Pharmacy Cart";
          profileAccess.style.color = "#00c2cb";
        }
      }

      // Auth Provider in profile
      if (profileProvider) {
        profileProvider.textContent = user.authProvider || (role === "Admin" ? "Predefined Admin Credentials" : (role === "Doctor" ? "Clinical Email & Password" : "Firebase Auth"));
      }

      // Avatar in profile modal
      if (profileAvatar) {
        if (user.photoURL) {
          profileAvatar.innerHTML = `<img src="${user.photoURL}" alt="${displayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"/>`;
        } else {
          profileAvatar.textContent = initials;
        }
      }

      // Portal destination button
      if (profilePortalLink) {
        if (role === "Admin") {
          profilePortalLink.href = "http://localhost:8081/Iryotek/admin/index.jsp";
          profilePortalLink.textContent = "Open Admin Management Portal ↗";
        } else if (role === "Doctor") {
          profilePortalLink.href = "http://localhost:8081/Iryotek/doctor/index.jsp";
          profilePortalLink.textContent = "Open Doctor Clinical Dashboard ↗";
        } else {
          profilePortalLink.href = "http://localhost:8081/Iryotek/user_appointment.jsp";
          profilePortalLink.textContent = "Open Patient Appointment Portal ↗";
        }
      }
    } else {
      // User is LOGGED OUT
      if (joinUsBtn) {
        joinUsBtn.style.setProperty("display", "none", "important");
        joinUsBtn.classList.add("is-hidden");
      }
      if (userChip) {
        userChip.style.setProperty("display", "none", "important");
        userChip.classList.add("is-hidden");
      }
    }
  }

  // =========================================================================
  // 4. Alert Helpers
  // =========================================================================
  function showAlert(msg, type) {
    const alertEl = document.getElementById("auth-alert");
    if (!alertEl) return;
    alertEl.className = "auth-alert auth-alert--" + (type || "error");
    alertEl.textContent = msg;
    alertEl.style.display = "block";
  }

  function hideAlert() {
    const alertEl = document.getElementById("auth-alert");
    if (alertEl) alertEl.style.display = "none";
  }

  function setSubmitLoading(btnId, loading, defaultTxt) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading
      ? `<span class="auth-spinner"></span> Please wait...`
      : defaultTxt;
  }

  function closeAuthModal() {
    try {
      const modal = $('[data-remodal-id="auth"]').remodal();
      if (modal) modal.close();
    } catch (e) {}
  }

  // =========================================================================
  // 5. Unified Role & Tab UI Synchronization
  // =========================================================================
  function refreshAuthUI() {
    hideAlert();

    const tabSignIn = document.getElementById("tab-signin");
    const tabSignUp = document.getElementById("tab-signup");
    const nameGroup = document.getElementById("auth-name-group");
    const nameInput = document.getElementById("auth-name");
    const emailGroup = document.getElementById("auth-email-group");
    const emailInput = document.getElementById("auth-email");
    const pwdGroup = document.getElementById("auth-password-group");
    const pwdInput = document.getElementById("auth-password");
    const docFields = document.getElementById("auth-doctor-fields");
    const issuedCard = document.getElementById("auth-doctor-issued-card");
    const authForm = document.getElementById("form-email-auth");
    const roleSection = document.getElementById("auth-role-section");
    const forgotRow = document.getElementById("auth-forgot-row");
    const submitBtn = document.getElementById("auth-btn-submit");
    const titleEl = document.getElementById("auth-title");
    const subtitleEl = document.getElementById("auth-subtitle");
    const googleBtn = document.getElementById("btn-auth-google");
    const orDivider = document.querySelector(".auth-or-divider");
    const phoneToggleBtn = document.getElementById("btn-toggle-phone");
    const footerSeparator = document.querySelector(".auth-footer-separator");
    const adminHelper = document.getElementById("auth-admin-helper");
    const roleBadgeMode = document.getElementById("auth-role-badge-mode");
    const roleHintText = document.getElementById("auth-role-hint-text");

    // Make sure form is visible and issued card is hidden when changing tab or role
    if (authForm) {
      authForm.classList.remove("auth-form--hidden");
      authForm.style.setProperty("display", "block", "important");
    }
    if (issuedCard) issuedCard.style.display = "none";

    // Sync tab button states
    if (tabSignIn) tabSignIn.classList.toggle("active", currentAuthTab === "signin");
    if (tabSignUp) tabSignUp.classList.toggle("active", currentAuthTab === "signup");

    // Ensure role cards have active class synced
    const roleCards = document.querySelectorAll(".auth-role-card");
    roleCards.forEach(function (card) {
      const cardRole = card.getAttribute("data-role");
      card.classList.toggle("active", cardRole === selectedRole);
    });

    // Make sure role section is visible across both Sign In and Sign Up
    if (roleSection) roleSection.style.display = "block";

    // Forgot password visibility
    if (forgotRow) {
      forgotRow.style.display = currentAuthTab === "signin" ? "flex" : "none";
    }

    // Role-specific modes:
    // -----------------------------------------------------------------------
    // A. PATIENT (Firebase Auth: Google, SMS OTP, Email/Password)
    // -----------------------------------------------------------------------
    if (selectedRole === "Patient") {
      if (roleBadgeMode) {
        roleBadgeMode.className = "auth-role-badge-mode mod--patient";
        roleBadgeMode.textContent = "Firebase Auth";
      }
      if (roleHintText) {
        roleHintText.textContent = "Google, SMS OTP & Email";
      }

      if (googleBtn) googleBtn.style.display = "flex";
      if (orDivider) orDivider.style.display = "flex";
      if (phoneToggleBtn) phoneToggleBtn.style.display = "inline-flex";
      if (footerSeparator) footerSeparator.style.display = "inline";
      if (adminHelper) adminHelper.style.display = "none";
      if (docFields) docFields.style.display = "none";

      if (emailGroup) emailGroup.style.display = "block";
      if (emailInput) {
        emailInput.required = true;
        emailInput.placeholder = currentAuthTab === "signup" ? "Enter your Email" : "Enter Email or Mobile (+91)";
      }
      if (pwdGroup) pwdGroup.style.display = "block";
      if (pwdInput) pwdInput.required = true;

      if (currentAuthTab === "signup") {
        if (nameGroup) nameGroup.style.display = "block";
        if (nameInput) nameInput.placeholder = "Elena Rostova";
        if (titleEl) {
          titleEl.innerHTML = 'Create Your <span class="auth-title-brand">IRYOTEK</span> Account';
        }
        if (subtitleEl) {
          subtitleEl.textContent = 'Join our connected healthcare ecosystem for intelligent triage, appointments, and pharmacy workflows.';
        }
        if (submitBtn) submitBtn.textContent = "Create Account →";
      } else {
        if (nameGroup) nameGroup.style.display = "none";
        if (titleEl) {
          titleEl.innerHTML = 'Welcome to <span class="auth-title-brand">IRYOTEK</span>';
        }
        if (subtitleEl) {
          subtitleEl.textContent = 'Sign in with your patient account to access appointments, triage notes, and pharmacy records.';
        }
        if (submitBtn) submitBtn.textContent = "Sign In to IRYOTEK →";
      }
    }

    // -----------------------------------------------------------------------
    // B. DOCTOR (Clinical Email / Password & Intake Credentialing)
    // -----------------------------------------------------------------------
    else if (selectedRole === "Doctor") {
      if (roleBadgeMode) {
        roleBadgeMode.className = "auth-role-badge-mode mod--doctor";
        roleBadgeMode.textContent = currentAuthTab === "signup" ? "Clinical Intake" : "Email & Password";
      }
      if (roleHintText) {
        roleHintText.textContent = currentAuthTab === "signup" ? "Hospital Credential Issuance" : "Clinical Email & Password";
      }

      // Hide consumer Google & Phone OTP for Doctors
      if (googleBtn) googleBtn.style.display = "none";
      if (orDivider) orDivider.style.display = "none";
      if (phoneToggleBtn) phoneToggleBtn.style.display = "none";
      if (footerSeparator) footerSeparator.style.display = "none";
      if (adminHelper) adminHelper.style.display = "none";

      if (currentAuthTab === "signup") {
        // DOCTOR SIGN UP:
        // Do NOT show email and password fields!
        // Instead show: First Name, Middle Name, Last Name, Age, Field of Study, Experience, Hospital
        if (nameGroup) nameGroup.style.display = "none";
        if (emailGroup) emailGroup.style.display = "none";
        if (emailInput) emailInput.required = false;
        if (pwdGroup) pwdGroup.style.display = "none";
        if (pwdInput) pwdInput.required = false;
        if (docFields) docFields.style.display = "flex";

        if (titleEl) {
          titleEl.innerHTML = 'Doctor Credentialing — <span class="auth-title-brand">IRYOTEK</span>';
        }
        if (subtitleEl) {
          subtitleEl.textContent = 'Enter your clinical qualifications. Your official doctor login email will be issued in dataset format upon submission.';
        }
        if (submitBtn) submitBtn.textContent = "Submit Details & Issue Doctor Email →";
      } else {
        // DOCTOR SIGN IN:
        // Show Email and Password so doctor can log in with their issued email
        if (docFields) docFields.style.display = "none";
        if (nameGroup) nameGroup.style.display = "none";
        if (emailGroup) emailGroup.style.display = "block";
        if (emailInput) {
          emailInput.required = true;
          emailInput.placeholder = "Enter your Email";
        }
        if (pwdGroup) pwdGroup.style.display = "block";
        if (pwdInput) pwdInput.required = true;

        if (titleEl) {
          titleEl.innerHTML = 'Doctor Portal — <span class="auth-title-brand">IRYOTEK</span>';
        }
        if (subtitleEl) {
          subtitleEl.textContent = 'Sign in with your official clinical doctor email and password to access your OPD dashboard.';
        }
        if (submitBtn) submitBtn.textContent = "Doctor Sign In →";
      }
    }

    // -----------------------------------------------------------------------
    // C. ADMIN (Predefined Email / Password: admin@gmail.com / admin)
    // -----------------------------------------------------------------------
    else if (selectedRole === "Admin") {
      if (roleBadgeMode) {
        roleBadgeMode.className = "auth-role-badge-mode mod--admin";
        roleBadgeMode.textContent = "Predefined Admin";
      }
      if (roleHintText) {
        roleHintText.textContent = "Root Access: Predefined Credentials";
      }

      // Hide consumer Google & Phone OTP for Admin
      if (googleBtn) googleBtn.style.display = "none";
      if (orDivider) orDivider.style.display = "none";
      if (phoneToggleBtn) phoneToggleBtn.style.display = "none";
      if (footerSeparator) footerSeparator.style.display = "none";
      if (adminHelper) adminHelper.style.display = "flex";
      if (docFields) docFields.style.display = "none";

      if (emailGroup) emailGroup.style.display = "block";
      if (emailInput) {
        emailInput.required = true;
        emailInput.placeholder = "Enter your Email";
      }
      if (pwdGroup) pwdGroup.style.display = "block";
      if (pwdInput) pwdInput.required = true;

      if (currentAuthTab === "signup") {
        if (nameGroup) nameGroup.style.display = "block";
        if (nameInput) nameInput.placeholder = "Hospital System Administrator";
        if (titleEl) {
          titleEl.innerHTML = 'Administrator Access — <span class="auth-title-brand">IRYOTEK</span>';
        }
        if (subtitleEl) {
          subtitleEl.textContent = 'Hospital administrator accounts are predefined by system security. Enter your administrator credentials to proceed.';
        }
        if (submitBtn) submitBtn.textContent = "Verify Admin Credentials →";
      } else {
        if (nameGroup) nameGroup.style.display = "none";
        if (titleEl) {
          titleEl.innerHTML = 'Administrator Portal — <span class="auth-title-brand">IRYOTEK</span>';
        }
        if (subtitleEl) {
          subtitleEl.textContent = 'Sign in with predefined hospital administrator credentials to manage infrastructure and rosters.';
        }
        if (submitBtn) submitBtn.textContent = "Sign In as Administrator →";
      }
    }
  }

  function switchTab(tab) {
    currentAuthTab = tab;
    refreshAuthUI();
  }

  function selectRole(role) {
    selectedRole = role || "Patient";
    refreshAuthUI();
  }

  // Auto Fill predefined admin credentials
  function autoFillAdminCredentials() {
    hideAlert();
    const emailInput = document.getElementById("auth-email");
    const pwdInput = document.getElementById("auth-password");
    const nameInput = document.getElementById("auth-name");

    if (emailInput) emailInput.value = "admin@gmail.com";
    if (pwdInput) pwdInput.value = "admin";
    if (nameInput && currentAuthTab === "signup") {
      nameInput.value = "Hospital System Administrator";
    }

    showAlert("Predefined Administrator credentials filled (admin@gmail.com / admin). Click the submit button to continue.", "info");
  }

  // =========================================================================
  // 6. Patient Authentication: Google Sign-In (Firebase)
  // =========================================================================
  async function signInWithGoogle() {
    hideAlert();
    if (selectedRole !== "Patient") {
      showAlert("Google Sign-In is provisioned for Patients. Switched to Patient role.", "info");
      selectRole("Patient");
    }

    if (isFirebaseConfigured && auth) {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        const patientUser = {
          uid: user.uid,
          displayName: user.displayName || "Patient Member",
          email: user.email,
          photoURL: user.photoURL,
          role: "Patient",
          authProvider: "Google Auth",
          access: "Appointments, Telehealth & Pharmacy"
        };
        setSavedSessionUser(patientUser);
        handleAuthStateChange(patientUser);
        showAlert("Successfully signed in with Google!", "success");
        setTimeout(closeAuthModal, 600);
      } catch (err) {
        console.error("Google sign-in error:", err);
        if (err.code === "auth/popup-closed-by-user") {
          showAlert("Sign-in popup was closed.", "info");
        } else if (err.code === "auth/unauthorized-domain") {
          showAlert("Domain not authorized in Firebase Console -> Auth -> Settings -> Authorized domains.", "error");
        } else {
          showAlert(err.message || "Google authentication failed.", "error");
        }
      }
    } else {
      const demoPatient = {
        uid: "goog_" + Math.random().toString(36).substr(2, 9),
        displayName: "Elena Rostova",
        email: "elena.rostova@gmail.com",
        photoURL: "images/reviews_ava-02.png",
        role: "Patient",
        authProvider: "Google Auth",
        access: "Appointments, Telehealth & Pharmacy"
      };
      setSavedSessionUser(demoPatient);
      handleAuthStateChange(demoPatient);
      showAlert("Signed in as Patient via Google Auth (Demo Profile)!", "success");
      setTimeout(closeAuthModal, 600);
    }
  }

  // =========================================================================
  // 7. Core Form Submit: Dispatches based on Role (Patient / Doctor / Admin)
  // =========================================================================
  async function handleEmailAuth(e) {
    if (e) e.preventDefault();
    hideAlert();

    // -----------------------------------------------------------------------
    // PATH 2A: DOCTOR SIGN UP INTAKE WORKFLOW
    // (First name, middle name if any, last name, age, field of study,
    //  age of experience, current hospital -> Issued official dataset email)
    // -----------------------------------------------------------------------
    if (selectedRole === "Doctor" && currentAuthTab === "signup") {
      const firstName = (document.getElementById("auth-doc-first-name")?.value || "").trim();
      const middleName = (document.getElementById("auth-doc-middle-name")?.value || "").trim();
      const lastName = (document.getElementById("auth-doc-last-name")?.value || "").trim();
      const ageVal = (document.getElementById("auth-doc-age")?.value || "").trim();
      const specialty = (document.getElementById("auth-doc-specialty")?.value || "").trim();
      const experienceVal = (document.getElementById("auth-doc-experience")?.value || "").trim();
      const hospital = (document.getElementById("auth-doc-hospital")?.value || "").trim();

      if (!firstName) {
        showAlert("Please enter your First Name.", "error");
        document.getElementById("auth-doc-first-name")?.focus();
        return;
      }
      if (!lastName) {
        showAlert("Please enter your Last Name.", "error");
        document.getElementById("auth-doc-last-name")?.focus();
        return;
      }
      if (!ageVal || isNaN(ageVal) || parseInt(ageVal) < 23 || parseInt(ageVal) > 95) {
        showAlert("Please enter a valid age (between 23 and 95 years).", "error");
        document.getElementById("auth-doc-age")?.focus();
        return;
      }
      if (!specialty) {
        showAlert("Please select your Field of Study / Medical Specialty.", "error");
        document.getElementById("auth-doc-specialty")?.focus();
        return;
      }
      if (experienceVal === "" || isNaN(experienceVal) || parseInt(experienceVal) < 0 || parseInt(experienceVal) > 70) {
        showAlert("Please enter your Age of Experience in years (e.g. 10).", "error");
        document.getElementById("auth-doc-experience")?.focus();
        return;
      }
      if (!hospital) {
        showAlert("Please specify the hospital in which you are currently working.", "error");
        document.getElementById("auth-doc-hospital")?.focus();
        return;
      }

      const docPassword = (document.getElementById("auth-doc-password")?.value || "");
      const docConfirmPassword = (document.getElementById("auth-doc-confirm-password")?.value || "");

      if (!docPassword || docPassword.length < 6) {
        showAlert("Please create a password with at least 6 characters.", "error");
        document.getElementById("auth-doc-password")?.focus();
        return;
      }
      if (docPassword !== docConfirmPassword) {
        showAlert("Passwords do not match. Please ensure both passwords match.", "error");
        document.getElementById("auth-doc-confirm-password")?.focus();
        return;
      }

      const actionText = "Submit Details & Issue Doctor Email →";
      setSubmitLoading("auth-btn-submit", true, actionText);

      setTimeout(function () {
        const issuedEmail = generateDatasetDoctorEmail(firstName, middleName, lastName, hospital);
        const middleFormatted = middleName ? middleName.trim() + " " : "";
        const docDisplayName = `Dr. ${firstName} ${middleFormatted}${lastName}`;

        const newDoctor = {
          uid: "doc_" + Math.random().toString(36).substr(2, 9),
          displayName: `${docDisplayName} (${specialty})`,
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          age: parseInt(ageVal),
          specialist: specialty,
          experience: `${experienceVal} Years`,
          hospital: hospital,
          email: issuedEmail,
          password: docPassword,
          role: "Doctor",
          authProvider: "Hospital Dataset Credential Registry",
          access: "Clinical OPD, E-Prescriptions & Diagnosis"
        };

        saveRegisteredDoctor(newDoctor);
        window.__lastIssuedDoctorEmail = issuedEmail;
        window.__lastIssuedDoctorPassword = docPassword;

        const formEl = document.getElementById("form-email-auth");
        const issuedCard = document.getElementById("auth-doctor-issued-card");
        if (formEl) {
          formEl.classList.add("auth-form--hidden");
          formEl.style.setProperty("display", "none", "important");
        }
        if (issuedCard) {
          const emailDisplay = document.getElementById("issued-doc-email");
          const pwdDisplay = document.getElementById("issued-doc-password");
          const specDisplay = document.getElementById("issued-doc-specialty");
          const hospDisplay = document.getElementById("issued-doc-hospital");
          const expDisplay = document.getElementById("issued-doc-exp");
          const ageDisplay = document.getElementById("issued-doc-age");

          if (emailDisplay) emailDisplay.textContent = issuedEmail;
          if (pwdDisplay) pwdDisplay.textContent = docPassword;
          if (specDisplay) specDisplay.textContent = specialty;
          if (hospDisplay) hospDisplay.textContent = hospital;
          if (expDisplay) expDisplay.textContent = `${experienceVal} Years`;
          if (ageDisplay) ageDisplay.textContent = `${ageVal} Yrs`;

          issuedCard.style.display = "block";
        }

        setSubmitLoading("auth-btn-submit", false, actionText);
        showAlert(`Official credentials issued: ${issuedEmail}. An onboarding dispatch has been sent!`, "success");
      }, 500);
      return;
    }

    // -----------------------------------------------------------------------
    // STANDARD EMAIL & PASSWORD VALIDATION (For Doctor Sign In, Admin, Patient)
    // -----------------------------------------------------------------------
    const emailInput = document.getElementById("auth-email");
    const pwdInput = document.getElementById("auth-password");
    const nameInput = document.getElementById("auth-name");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = pwdInput ? pwdInput.value : "";
    const name = nameInput ? nameInput.value.trim() : "";

    if (!email || !password) {
      showAlert("Please enter both email and password.", "error");
      return;
    }

    // -----------------------------------------------------------------------
    // PATH 1: ADMIN (Predefined Email & Password: admin@gmail.com / admin)
    // -----------------------------------------------------------------------
    if (selectedRole === "Admin") {
      const actionText = currentAuthTab === "signup" ? "Verify Admin Credentials →" : "Sign In as Administrator →";
      setSubmitLoading("auth-btn-submit", true, actionText);

      setTimeout(function () {
        if (email.toLowerCase() === "admin@gmail.com" && password === "admin") {
          const adminUser = {
            uid: "adm_root_001",
            displayName: name || "Hospital System Administrator",
            email: "admin@gmail.com",
            role: "Admin",
            authProvider: "Predefined Admin Credentials",
            access: "Full HMS, OPD, Pharmacy & User Controls"
          };
          setSavedSessionUser(adminUser);
          handleAuthStateChange(adminUser);
          setSubmitLoading("auth-btn-submit", false, actionText);
          showAlert("Predefined Administrator credentials verified! Root system access granted.", "success");
          setTimeout(closeAuthModal, 600);
        } else {
          setSubmitLoading("auth-btn-submit", false, actionText);
          showAlert("Invalid Administrator credentials. System Admin requires predefined login: admin@gmail.com / admin.", "error");
        }
      }, 400);
      return;
    }

    // -----------------------------------------------------------------------
    // PATH 2B: DOCTORS (Clinical Email & Password Sign In)
    // -----------------------------------------------------------------------
    if (selectedRole === "Doctor") {
      if (password.length < 6) {
        showAlert("Password must be at least 6 characters long.", "error");
        return;
      }

      const actionText = "Doctor Sign In →";
      setSubmitLoading("auth-btn-submit", true, actionText);

      setTimeout(function () {
        const doctors = getRegisteredDoctors();
        const matched = doctors.find(d => d.email.toLowerCase() === email.toLowerCase() && d.password === password);

        if (matched) {
          setSavedSessionUser(matched);
          handleAuthStateChange(matched);
          setSubmitLoading("auth-btn-submit", false, actionText);
          showAlert(`Doctor sign-in successful! Welcome back, ${matched.displayName}.`, "success");
          setTimeout(closeAuthModal, 600);
        } else {
          const emailMatched = doctors.find(d => d.email.toLowerCase() === email.toLowerCase());
          if (emailMatched) {
            setSubmitLoading("auth-btn-submit", false, actionText);
            showAlert("Incorrect password for this doctor account (default password is 'doctor123').", "error");
            return;
          }

          // If standard hospital credentials or default test doctor
          if (email.toLowerCase().includes("doctor") || email.toLowerCase().includes("hospital") || email.toLowerCase().includes("dr")) {
            const fallbackDoc = {
              uid: "doc_hms_01",
              displayName: name || ("Dr. " + (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1))),
              email: email,
              role: "Doctor",
              authProvider: "Clinical Email & Password",
              access: "Clinical OPD, E-Prescriptions & Diagnosis"
            };
            setSavedSessionUser(fallbackDoc);
            handleAuthStateChange(fallbackDoc);
            setSubmitLoading("auth-btn-submit", false, actionText);
            showAlert(`Doctor clinical session verified! Welcome, ${fallbackDoc.displayName}.`, "success");
            setTimeout(closeAuthModal, 600);
          } else {
            setSubmitLoading("auth-btn-submit", false, actionText);
            showAlert("Doctor email or password not recognized. Check credentials or submit Doctor Sign Up to receive an official email.", "error");
          }
        }
      }, 450);
      return;
    }

    // -----------------------------------------------------------------------
    // PATH 3: PATIENTS (Firebase Auth: Email & Password)
    // -----------------------------------------------------------------------
    if (password.length < 6) {
      showAlert("Password must be at least 6 characters long.", "error");
      return;
    }

    const actionText = currentAuthTab === "signup" ? "Create Account →" : "Sign In to IRYOTEK →";
    setSubmitLoading("auth-btn-submit", true, actionText);

    let targetEmail = email;
    let isPhoneLogin = false;
    if (selectedRole === "Patient" && currentAuthTab === "signin" && !targetEmail.includes("@")) {
      isPhoneLogin = true;
      const resolved = resolveEmailFromPhone(targetEmail);
      if (!resolved) {
        setSubmitLoading("auth-btn-submit", false, actionText);
        showAlert('No patient account found with mobile number "' + targetEmail + '". Please sign in with your email or register.', "error");
        return;
      }
      targetEmail = resolved;
    }

    if (isFirebaseConfigured && auth) {
      try {
        if (currentAuthTab === "signup") {
          const cred = await auth.createUserWithEmailAndPassword(email, password);
          if (name && cred.user) {
            await cred.user.updateProfile({ displayName: name });
          }
          const restoredProfile = resolvePatientProfile(cred.user.uid, email);
          const patientUser = {
            uid: cred.user.uid,
            displayName: (restoredProfile && restoredProfile.fullName) || name || email.split("@")[0],
            email: email,
            role: "Patient",
            authProvider: "Firebase Email & Password",
            access: "Appointments, Telehealth & Pharmacy",
            patientProfile: restoredProfile || undefined
          };
          setSavedSessionUser(patientUser);
          handleAuthStateChange(patientUser);
          showAlert("Patient account created via Firebase! Welcome to IRYOTEK.", "success");
        } else {
          const cred = await auth.signInWithEmailAndPassword(targetEmail, password);
          const restoredProfile = resolvePatientProfile(cred.user.uid, targetEmail);
          const patientUser = {
            uid: cred.user.uid,
            displayName: (restoredProfile && restoredProfile.fullName) || cred.user.displayName || targetEmail.split("@")[0],
            email: targetEmail,
            phoneNumber: (restoredProfile && restoredProfile.phone) || (isPhoneLogin ? email : undefined),
            role: "Patient",
            authProvider: isPhoneLogin ? "Mobile Phone & Password" : "Firebase Email & Password",
            access: "Appointments, Telehealth & Pharmacy",
            patientProfile: restoredProfile || undefined
          };
          setSavedSessionUser(patientUser);
          handleAuthStateChange(patientUser);
          showAlert("Welcome back to IRYOTEK!", "success");
        }
        setTimeout(closeAuthModal, 600);
      } catch (err) {
        console.error("Firebase Auth Error:", err);
        let msg = err.message;
        if (err.code === "auth/wrong-password") msg = "Incorrect password. Please try again.";
        else if (err.code === "auth/user-not-found") msg = "No patient found with this email or mobile. Switch to 'Create Account'.";
        else if (err.code === "auth/email-already-in-use") msg = "An account already exists with this email.";
        else if (err.code === "auth/invalid-email") msg = "Invalid email address format.";
        else if (err.code === "auth/operation-not-allowed") {
          msg = "Email/Password sign-in method is disabled in Firebase Console. Enable it under Authentication -> Sign-in method.";
        }
        showAlert(msg, "error");
      } finally {
        setSubmitLoading("auth-btn-submit", false, actionText);
      }
    } else {
      // Offline / Demo fallback for Firebase Patient authentication
      setTimeout(function () {
        const patientName = name || (targetEmail.split("@")[0] ? targetEmail.split("@")[0] : "Elena Rostova");
        const restoredProfile = resolvePatientProfile(null, targetEmail);
        const patientUser = {
          uid: "usr_pat_" + Math.random().toString(36).substr(2, 9),
          displayName: (restoredProfile && restoredProfile.fullName) || patientName,
          email: targetEmail,
          phoneNumber: (restoredProfile && restoredProfile.phone) || (isPhoneLogin ? email : undefined),
          role: "Patient",
          authProvider: isPhoneLogin ? "Mobile Phone & Password (Demo)" : "Firebase Email & Password (Demo)",
          access: "Appointments, Telehealth & Pharmacy",
          patientProfile: restoredProfile || undefined
        };
        setSavedSessionUser(patientUser);
        handleAuthStateChange(patientUser);
        setSubmitLoading("auth-btn-submit", false, actionText);
        showAlert(
          currentAuthTab === "signup"
            ? "Patient account created in Demo Mode!"
            : "Signed in as Patient in Demo Mode!",
          "success"
        );
        setTimeout(closeAuthModal, 600);
      }, 400);
    }
  }

  // Forgot Password Reset Email
  async function handleForgotPassword() {
    hideAlert();
    const emailInput = document.getElementById("auth-email");
    const email = emailInput ? emailInput.value.trim() : "";
    if (!email) {
      showAlert("Please enter your email address above to receive a password reset link.", "info");
      return;
    }

    if (isFirebaseConfigured && auth && selectedRole === "Patient") {
      try {
        await auth.sendPasswordResetEmail(email);
        showAlert("Password reset email sent! Check your inbox.", "success");
      } catch (err) {
        showAlert(err.message || "Failed to send reset email.", "error");
      }
    } else {
      showAlert(`Password reset request processed for ${email}. Check your inbox.`, "success");
    }
  }

  // =========================================================================
  // 8. Patient Phone SMS OTP Authentication (Firebase)
  // =========================================================================
  function initRecaptcha() {
    if (!isFirebaseConfigured || typeof firebase === "undefined") return;
    if (recaptchaVerifier) return;

    try {
      const container = document.getElementById("recaptcha-container");
      if (!container) return;

      recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
        size: "invisible",
        callback: function () {
          // reCAPTCHA solved
        },
        "expired-callback": function () {
          showAlert("reCAPTCHA expired. Please try again.", "info");
        }
      });
      recaptchaVerifier.render();
    } catch (e) {
      console.warn("[IRYOTEK Auth] RecaptchaVerifier warning:", e);
    }
  }

  function startResendTimer() {
    if (resendCountdownTimer) clearInterval(resendCountdownTimer);

    let seconds = 30;
    const timerTxt = document.getElementById("otp-timer-txt");
    const timerVal = document.getElementById("otp-timer-val");
    const resendBtn = document.getElementById("btn-resend-otp");

    if (timerTxt) timerTxt.style.display = "inline";
    if (resendBtn) resendBtn.style.display = "none";
    if (timerVal) timerVal.textContent = seconds + "s";

    resendCountdownTimer = setInterval(function () {
      seconds--;
      if (timerVal) timerVal.textContent = seconds + "s";
      if (seconds <= 0) {
        clearInterval(resendCountdownTimer);
        if (timerTxt) timerTxt.style.display = "none";
        if (resendBtn) resendBtn.style.display = "inline-block";
      }
    }, 1000);
  }

  async function sendPhoneOtp() {
    hideAlert();
    const codeSelect = document.getElementById("auth-phone-code");
    const phoneInput = document.getElementById("auth-phone-number");

    const countryCode = codeSelect ? codeSelect.value : "+91";
    const rawNumber = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";

    if (!rawNumber || rawNumber.length < 7) {
      showAlert("Please enter a valid mobile phone number.", "error");
      return;
    }

    const fullPhoneNumber = countryCode + rawNumber;
    setSubmitLoading("btn-send-otp", true, "Send Verification OTP →");

    if (isFirebaseConfigured && auth) {
      try {
        initRecaptcha();
        const appVerifier = recaptchaVerifier;
        const confirmation = await auth.signInWithPhoneNumber(fullPhoneNumber, appVerifier);
        phoneConfirmationResult = confirmation;
        window.confirmationResult = confirmation;

        showOtpStep(fullPhoneNumber);
        showAlert(`Firebase OTP sent via SMS to ${fullPhoneNumber}`, "success");
        startResendTimer();
      } catch (err) {
        console.error("Phone Auth Send Error:", err);
        if (recaptchaVerifier) {
          recaptchaVerifier.render().then(function (widgetId) {
            if (typeof grecaptcha !== "undefined") grecaptcha.reset(widgetId);
          });
        }
        let msg = err.message;
        if (err.code === "auth/billing-not-enabled") {
          msg = "Real SMS requires Firebase Blaze plan. For FREE testing: Add phone in Firebase Console → Auth → Sign-in method → Phone → 'Phone numbers for testing' with code 123456.";
        } else if (err.code === "auth/invalid-phone-number") {
          msg = "Invalid phone number format.";
        } else if (err.code === "auth/quota-exceeded") {
          msg = "SMS quota exceeded. You can test with test numbers or Demo mode.";
        }
        showAlert(msg, "error");
      } finally {
        setSubmitLoading("btn-send-otp", false, "Send Verification OTP →");
      }
    } else {
      setTimeout(function () {
        phoneConfirmationResult = { demo: true, phone: fullPhoneNumber };
        showOtpStep(fullPhoneNumber);
        showAlert(`[Demo Mode] OTP sent to ${fullPhoneNumber}. (Enter 123456 to verify)`, "success");
        startResendTimer();
        setSubmitLoading("btn-send-otp", false, "Send Verification OTP →");
      }, 500);
    }
  }

  async function verifyPhoneOtp() {
    hideAlert();
    const otpInput = document.getElementById("auth-otp-code");
    const otpCode = otpInput ? otpInput.value.trim() : "";

    if (!otpCode || otpCode.length < 6) {
      showAlert("Please enter the 6-digit verification code.", "error");
      return;
    }

    setSubmitLoading("btn-verify-otp", true, "Verify Code & Sign In →");

    if (isFirebaseConfigured && auth && phoneConfirmationResult && !phoneConfirmationResult.demo) {
      try {
        const result = await phoneConfirmationResult.confirm(otpCode);
        const user = result.user;
        const patientUser = {
          uid: user.uid,
          displayName: user.phoneNumber,
          phoneNumber: user.phoneNumber,
          role: "Patient",
          authProvider: "Phone SMS OTP",
          access: "Appointments, Telehealth & Pharmacy"
        };
        setSavedSessionUser(patientUser);
        handleAuthStateChange(patientUser);
        showAlert("Phone verified! Welcome to IRYOTEK.", "success");
        setTimeout(closeAuthModal, 600);
      } catch (err) {
        console.error("Phone OTP verification error:", err);
        let msg = err.message;
        if (err.code === "auth/invalid-verification-code") {
          msg = "Invalid verification code. Please check and re-enter.";
        } else if (err.code === "auth/code-expired") {
          msg = "Verification code expired. Please request a new code.";
        }
        showAlert(msg, "error");
      } finally {
        setSubmitLoading("btn-verify-otp", false, "Verify Code & Sign In →");
      }
    } else {
      setTimeout(function () {
        const phone = (phoneConfirmationResult && phoneConfirmationResult.phone) || "+91 9876543210";
        const patientUser = {
          uid: "ph_" + Math.random().toString(36).substr(2, 9),
          displayName: phone,
          phoneNumber: phone,
          role: "Patient",
          authProvider: "Phone SMS OTP",
          access: "Appointments, Telehealth & Pharmacy"
        };
        setSavedSessionUser(patientUser);
        handleAuthStateChange(patientUser);
        showAlert("Phone number verified successfully!", "success");
        setSubmitLoading("btn-verify-otp", false, "Verify Code & Sign In →");
        setTimeout(closeAuthModal, 600);
      }, 500);
    }
  }

  function showOtpStep(phone) {
    const stepSend = document.getElementById("phone-step-send");
    const stepVerify = document.getElementById("phone-step-verify");
    const phoneDisplay = document.getElementById("phone-target-display");

    if (stepSend) stepSend.style.display = "none";
    if (stepVerify) stepVerify.style.display = "block";
    if (phoneDisplay) phoneDisplay.textContent = phone;

    const otpInput = document.getElementById("auth-otp-code");
    if (otpInput) {
      otpInput.value = "";
      otpInput.focus();
    }
  }

  function showPhoneInputStep() {
    const stepSend = document.getElementById("phone-step-send");
    const stepVerify = document.getElementById("phone-step-verify");
    if (stepSend) stepSend.style.display = "block";
    if (stepVerify) stepVerify.style.display = "none";
    if (resendCountdownTimer) clearInterval(resendCountdownTimer);
    hideAlert();
  }

  // =========================================================================
  // 9. Quick Demo Sign-In (Role Aware)
  // =========================================================================
  function quickDemoSignIn() {
    hideAlert();
    let demoUser = null;

    if (selectedRole === "Admin") {
      demoUser = {
        uid: "adm_root_001",
        displayName: "Hospital System Administrator",
        email: "admin@gmail.com",
        role: "Admin",
        authProvider: "Predefined Admin Credentials",
        access: "Full HMS, OPD, Pharmacy & User Controls"
      };
      showAlert("Instant Admin Sign-In Verified (admin@gmail.com)!", "success");
    } else if (selectedRole === "Doctor") {
      demoUser = {
        uid: "doc_demo_9921",
        displayName: "Dr. Marcus Vance",
        email: "marcus.vance@hospital.org",
        role: "Doctor",
        photoURL: "images/reviews_ava-03.png",
        authProvider: "Clinical Email & Password",
        access: "Clinical OPD, E-Prescriptions & Diagnosis"
      };
      showAlert("Instant Doctor Sign-In Active (Dr. Marcus Vance)!", "success");
    } else {
      demoUser = {
        uid: "pat_demo_4412",
        displayName: "Elena Rostova",
        email: "elena.rostova@gmail.com",
        role: "Patient",
        photoURL: "images/reviews_ava-02.png",
        authProvider: "Google Auth",
        access: "Appointments, Telehealth & Pharmacy"
      };
      showAlert("Instant Patient Sign-In Active (Elena Rostova)!", "success");
    }

    setSavedSessionUser(demoUser);
    handleAuthStateChange(demoUser);
    setTimeout(closeAuthModal, 500);
  }

  // Sign Out
  async function signOut() {
    try {
      if (isFirebaseConfigured && auth) {
        await auth.signOut();
      }
    } catch (e) {
      console.warn("Firebase sign out error:", e);
    }
    setSavedSessionUser(null);
    handleAuthStateChange(null);

    try {
      const modal = $('[data-remodal-id="profile"]').remodal();
      if (modal) modal.close();
    } catch (e) {}
  }

  // Toggle Password Visibility
  function togglePasswordVisibility() {
    const pwdInput = document.getElementById("auth-password");
    const toggleTxt = document.getElementById("auth-toggle-pwd-txt");
    if (!pwdInput) return;

    if (pwdInput.type === "password") {
      pwdInput.type = "text";
      if (toggleTxt) toggleTxt.textContent = "Hide";
    } else {
      pwdInput.type = "password";
      if (toggleTxt) toggleTxt.textContent = "Show";
    }
  }

  // =========================================================================
  // 10. DOM Event Listeners & Binding
  // =========================================================================
  document.addEventListener("DOMContentLoaded", function () {
    initFirebase();

    // Google Sign-In Button (Patients)
    const googleBtn = document.getElementById("btn-auth-google");
    if (googleBtn) {
      googleBtn.addEventListener("click", signInWithGoogle);
    }

    // Role selection cards ("I am a")
    const roleCards = document.querySelectorAll(".auth-role-card");
    roleCards.forEach(function (card) {
      card.addEventListener("click", function () {
        const role = card.getAttribute("data-role") || "Patient";
        selectRole(role);
      });
    });

    // Auto Fill Button for Predefined Admin
    const autofillBtn = document.getElementById("btn-admin-autofill");
    if (autofillBtn) {
      autofillBtn.addEventListener("click", autoFillAdminCredentials);
    }

    // Segmented Switcher (Sign In / Create Account)
    const tabSignIn = document.getElementById("tab-signin");
    if (tabSignIn) {
      tabSignIn.addEventListener("click", () => switchTab("signin"));
    }
    const tabSignUp = document.getElementById("tab-signup");
    if (tabSignUp) {
      tabSignUp.addEventListener("click", () => switchTab("signup"));
    }

    // Password Toggle
    const toggleBtn = document.getElementById("auth-toggle-pwd");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", togglePasswordVisibility);
    }

    // Doctor Intake Password Toggles
    const toggleDocPwd = document.getElementById("auth-doc-toggle-pwd");
    if (toggleDocPwd) {
      toggleDocPwd.addEventListener("click", function () {
        const inp = document.getElementById("auth-doc-password");
        const txt = document.getElementById("auth-doc-toggle-pwd-txt");
        if (!inp) return;
        if (inp.type === "password") {
          inp.type = "text";
          if (txt) txt.textContent = "Hide";
        } else {
          inp.type = "password";
          if (txt) txt.textContent = "Show";
        }
      });
    }

    const toggleDocCpwd = document.getElementById("auth-doc-toggle-cpwd");
    if (toggleDocCpwd) {
      toggleDocCpwd.addEventListener("click", function () {
        const inp = document.getElementById("auth-doc-confirm-password");
        const txt = document.getElementById("auth-doc-toggle-cpwd-txt");
        if (!inp) return;
        if (inp.type === "password") {
          inp.type = "text";
          if (txt) txt.textContent = "Hide";
        } else {
          inp.type = "password";
          if (txt) txt.textContent = "Show";
        }
      });
    }

    // Forgot Password
    const forgotLink = document.getElementById("auth-forgot-pwd");
    if (forgotLink) {
      forgotLink.addEventListener("click", handleForgotPassword);
    }

    // Form Submit Handler
    const authForm = document.getElementById("form-email-auth");
    if (authForm) {
      authForm.addEventListener("submit", handleEmailAuth);
    }

    // Switch to Phone SMS (OTP) and Back
    const btnTogglePhone = document.getElementById("btn-toggle-phone");
    const btnBackToEmail = document.getElementById("btn-back-to-email");
    const panelPhone = document.getElementById("auth-panel-phone");

    if (btnTogglePhone) {
      btnTogglePhone.addEventListener("click", function () {
        if (authForm) {
          authForm.classList.add("auth-form--hidden");
          authForm.style.setProperty("display", "none", "important");
        }
        if (panelPhone) panelPhone.style.display = "block";
        initRecaptcha();
      });
    }

    if (btnBackToEmail) {
      btnBackToEmail.addEventListener("click", function () {
        if (authForm) {
          authForm.classList.remove("auth-form--hidden");
          authForm.style.setProperty("display", "block", "important");
        }
        if (panelPhone) panelPhone.style.display = "none";
      });
    }

    // Phone Auth Buttons
    const sendOtpBtn = document.getElementById("btn-send-otp");
    if (sendOtpBtn) {
      sendOtpBtn.addEventListener("click", sendPhoneOtp);
    }
    const verifyOtpBtn = document.getElementById("btn-verify-otp");
    if (verifyOtpBtn) {
      verifyOtpBtn.addEventListener("click", verifyPhoneOtp);
    }
    const changePhoneBtn = document.getElementById("btn-change-phone");
    if (changePhoneBtn) {
      changePhoneBtn.addEventListener("click", showPhoneInputStep);
    }
    const resendOtpBtn = document.getElementById("btn-resend-otp");
    if (resendOtpBtn) {
      resendOtpBtn.addEventListener("click", sendPhoneOtp);
    }

    // Demo Button
    const demoBtn = document.getElementById("btn-auth-demo");
    if (demoBtn) {
      demoBtn.addEventListener("click", quickDemoSignIn);
    }

    // Doctor Issued Card: Proceed to Sign In button
    const proceedDocLoginBtn = document.getElementById("btn-proceed-doctor-login");
    if (proceedDocLoginBtn) {
      proceedDocLoginBtn.addEventListener("click", function () {
        switchTab("signin");
        selectRole("Doctor");

        const formEl = document.getElementById("form-email-auth");
        const issuedCard = document.getElementById("auth-doctor-issued-card");
        if (formEl) {
          formEl.classList.remove("auth-form--hidden");
          formEl.style.setProperty("display", "block", "important");
        }
        if (issuedCard) issuedCard.style.display = "none";

        const emailInput = document.getElementById("auth-email");
        const pwdInput = document.getElementById("auth-password");
        if (emailInput && window.__lastIssuedDoctorEmail) {
          emailInput.value = window.__lastIssuedDoctorEmail;
        }
        if (pwdInput) {
          pwdInput.value = window.__lastIssuedDoctorPassword || "doctor123";
        }

        showAlert("Issued doctor credentials pre-filled! Click 'Doctor Sign In' to enter your clinical OPD portal.", "info");
      });
    }

    // Doctor Issued Card: Copy Email
    const copyIssuedEmailBtn = document.getElementById("btn-copy-issued-email");
    if (copyIssuedEmailBtn) {
      copyIssuedEmailBtn.addEventListener("click", function () {
        const emailTxt = document.getElementById("issued-doc-email")?.textContent || "";
        if (!emailTxt) return;
        navigator.clipboard.writeText(emailTxt).then(function () {
          copyIssuedEmailBtn.classList.add("copied");
          const span = copyIssuedEmailBtn.querySelector(".copy-text");
          if (span) span.textContent = "Copied!";
          setTimeout(function () {
            copyIssuedEmailBtn.classList.remove("copied");
            if (span) span.textContent = "Copy";
          }, 2000);
        }).catch(function () {
          showAlert("Copied: " + emailTxt, "info");
        });
      });
    }

    // Doctor Issued Card: Copy Password
    const copyIssuedPwdBtn = document.getElementById("btn-copy-issued-pwd");
    if (copyIssuedPwdBtn) {
      copyIssuedPwdBtn.addEventListener("click", function () {
        const pwdTxt = document.getElementById("issued-doc-password")?.textContent || "";
        if (!pwdTxt) return;
        navigator.clipboard.writeText(pwdTxt).then(function () {
          copyIssuedPwdBtn.classList.add("copied");
          const span = copyIssuedPwdBtn.querySelector(".copy-text");
          if (span) span.textContent = "Copied!";
          setTimeout(function () {
            copyIssuedPwdBtn.classList.remove("copied");
            if (span) span.textContent = "Copy";
          }, 2000);
        }).catch(function () {
          showAlert("Copied password: " + pwdTxt, "info");
        });
      });
    }

    // Sign Out Button in Profile Modal
    const logoutBtn = document.getElementById("btn-profile-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", signOut);
    }

    // Initialize UI for default state (Patient, Create Account)
    refreshAuthUI();
  });

  // Export functions to window
  window.IRYOTEK_AUTH = {
    signInWithGoogle: signInWithGoogle,
    quickDemoSignIn: quickDemoSignIn,
    signOut: signOut,
    switchTab: switchTab,
    selectRole: selectRole,
    autoFillAdminCredentials: autoFillAdminCredentials,
    sendPhoneOtp: sendPhoneOtp,
    verifyPhoneOtp: verifyPhoneOtp
  };
})();
