# Iryotek: Repository Audit & Discovery Report

**Audit Date**: October 2026  
**Auditor**: Principal Software Architect & Repository Maintenance Specialist  
**Project**: Iryotek: AI-Powered Smart Healthcare Management Platform  
**Target Repository**: `/Users/chinmayprakashrout/Iryotek-Project`  
**Git Branch**: `chore/project-restructure-backup`  

---

## 1. Existing Architecture Overview

Iryotek is a multi-tier hybrid healthcare management ecosystem comprising:
1. **Enterprise Java Backend (WAR Application)**:
   - Built on Java 17, Servlet 3.1, JSP, and JSTL.
   - Deployed on Apache Tomcat 9/10 / embedded container via Docker.
   - Core layers:
     - **Presentation / View**: 60+ JSP pages structured by role (`/`, `admin/`, `doctor/`, `component/`).
     - **Controller Layer**: 36 Java HTTP Servlets handling authentication, appointment scheduling, specialist assignments, doctor profile management, pharmacy transactions, cart operations, feedback, and AI triage.
     - **Service Layer**: Business logic processing triage ratings, queue token calculations, and email notifications.
     - **Data Access Layer (DAO)**: Raw JDBC persistence with prepared statements connecting to MySQL 8.0.
     - **Real-Time Layer**: Java WebSocket Server Endpoints (`QueueWebSocketServer`, `VideoConsultationWebSocketServer`) handling WebRTC signaling and live queue updates.
     - **AI Integration Layer**: REST client integration with Google Gemini Pro API (`GeminiClient`, `GeminiAiUtil`) with intelligent fallback mechanisms.
2. **Modern SPA Frontend**:
   - Built with React 19, TypeScript, and Vite 8.
   - Styling: TailwindCSS v4 with Lucide React icons.
   - Motion & Experience: Lenis smooth scrolling, GSAP ScrollTrigger, and interactive 3D WebGL canvas (`experience.html`).
3. **Legacy Webflow Landing Website**:
   - Preserved static HTML5/CSS3 marketing and informational site with responsive typography and Webflow scripts.
4. **Relational Database**:
   - MySQL 8.0 (`hospital` database) with full schema definitions, 100k+ synthetic patient-doctor-appointment datasets, and pharmacy medicine catalog.
5. **DevOps & Containerization**:
   - Multi-stage `Dockerfile` and `docker-compose.yml` orchestrating MySQL and Java application services with automated database initialization.

---

## 2. Complete Repository Directory Tree

```
Iryotek-Project/
├── ._trash_quarantine/                   # Quarantined duplicate/scratch files (zero data loss)
│   ├── crop_test.png
│   ├── Iryotek Dataset/
│   │   ├── druglist_exported.csv.bak
│   │   └── Iryotek main/                 # Stale duplicate copy of legacy Java project
│   ├── Iryotek/
│   │   ├── cookies.txt
│   │   └── src/main/webapp/img/
│   │       ├── blog1.jpg
│   │       ├── blog2.jpg
│   │       └── blog3.jpg
│   ├── new-web main/
│   │   └── src/
│   │       ├── imports/Screenshot_*.png
│   │       ├── sidebar-collapse.svg
│   │       └── sidebar-expand.svg
│   └── og-website/
│       ├── images/questions_illustr.svg.bak
│       └── index.html.bak
├── .dockerignore                         # Docker build exclusions
├── .gitignore                            # Git tracking configuration
├── Dockerfile                            # Multi-stage production container build
├── README.md                             # Repository entrypoint & operations guide
├── ARCHITECTURE_GUIDE.md                 # System architecture and modularization guide
├── docker-compose.yml                    # Local multi-service orchestration (DB + App)
├── backend/                              # Java Enterprise Healthcare Platform
│   ├── pom.xml                           # Maven dependencies & build specification
│   ├── database/                         # Backend-specific SQL schemas
│   │   └── schema.sql
│   └── src/
│       ├── main/
│       │   ├── java/com/hms/             # Java source packages
│       │   │   ├── admin/servlet/        # Admin management servlets (11 classes)
│       │   │   ├── ai/                   # AI Triage & Gemini client (2 classes)
│       │   │   ├── dao/                  # JDBC Data Access Objects (12 classes)
│       │   │   ├── db/                   # Database connection provider (DBConnection.java)
│       │   │   ├── doctor/servlet/       # Doctor portal servlets (6 classes)
│       │   │   ├── entity/               # Data model beans (10 classes)
│       │   │   ├── model/                # Application domain models (4 classes)
│       │   │   ├── service/              # Healthcare business logic (2 classes)
│       │   │   ├── user/servlet/         # Patient & Pharmacy servlets (19 classes)
│       │   │   ├── util/                 # Utilities: Email, PDF, Security (5 classes)
│       │   │   └── websocket/            # Real-time WebSocket endpoints (2 classes)
│       │   ├── resources/                # Classpath resources
│       │   │   ├── config.properties
│       │   │   └── email-template.html
│       │   └── webapp/                   # Web application root (JSP, CSS, JS, Media)
│       │       ├── WEB-INF/
│       │       │   └── web.xml           # Servlet 3.1 deployment descriptor
│       │       ├── admin/                # Admin JSP management portal (11 JSPs)
│       │       ├── component/            # Reusable JSP header/nav/footer fragments (7 JSPs)
│       │       ├── css/                  # Application stylesheets (custom + Bootstrap)
│       │       ├── doctor/               # Doctor JSP consultation portal (9 JSPs)
│       │       ├── img/                  # Healthcare branding, staff photos & UI graphics
│       │       ├── js/                   # Client-side validation & dynamic UI scripts
│       │       └── *.jsp                 # Public & Patient views (20+ JSPs)
│       └── test/                         # Unit & integration test suites
│           └── java/
├── database/                             # Centralized Database Assets
│   ├── dataset/                          # Datasets (100k+ healthcare dataset, medicines.csv)
│   │   ├── Healthcare_Dataset_100k.csv
│   │   └── medicines.csv
│   └── init-scripts/                     # Docker entrypoint MySQL bootstrap scripts
│       ├── 01_schema.sql
│       ├── 02_healthcare_data.sql
│       ├── 03_pharmacy_schema.sql
│       └── 04_import_medicines.sql
├── docs/                                 # Centralized Documentation
│   ├── architecture/                     # Architecture documentation & visual graphs
│   │   ├── PROJECT_ARCHITECTURE.md
│   │   ├── iryotek-runtime.architecture.json
│   │   └── iryotek-runtime-architecture.html
│   ├── images/                           # System diagrams & UI screenshots (6 PNGs)
│   └── maintenance/                      # Refactoring, audit, and audit manifests
│       ├── FILE_MANIFEST.md
│       ├── REPOSITORY_AUDIT.md
│       └── TARGET_ARCHITECTURE.md
├── frontend/                             # Modern React 19 + TypeScript + Vite SPA
│   ├── index.html                        # SPA HTML root
│   ├── package.json                      # NPM package manifest
│   ├── tsconfig.json                     # TypeScript compiler configuration
│   ├── vite.config.ts                    # Vite build & proxy configuration
│   ├── public/                           # Static public assets
│   │   └── favicon.ico
│   └── src/                              # React application source
│       ├── App.tsx                       # Root React component
│       ├── main.tsx                      # Application DOM bootstrap
│       ├── index.css                     # TailwindCSS v4 theme tokens
│       ├── components/                   # Reusable UI components
│       └── assets/                       # Component icons & media
├── legacy-website/                       # Preserved Marketing & Informational Webflow Site
│   ├── index.html                        # Webflow landing page
│   ├── css/                              # Webflow framework styling
│   ├── js/                               # Webflow animation scripts
│   └── images/                           # Preserved landing graphics & vectors
└── scripts/                              # Utility & Maintenance Scripts
    └── delete_firebase_users.js          # Admin account maintenance utility
```

---

## 3. Technology Stack Inventory

| Component | Technology | Version | Purpose |
|---|---|---|---|
| **Backend Language** | Java (OpenJDK / Temurin) | 17 | Core enterprise application logic |
| **Servlet Standard** | Java Servlet API | 3.1.0 | Web request processing & session lifecycle |
| **View Engine** | JSP & JSTL | 2.3.3 / 1.2 | Dynamic server-side UI rendering |
| **Database** | MySQL Server | 8.0 | Relational healthcare database |
| **Database Driver** | MySQL Connector/J | 8.0.33 | JDBC persistence driver |
| **Security / Crypto** | jBCrypt | 0.4 | Password hashing (Blowfish salt rounds) |
| **Real-Time** | JSR-356 Java WebSocket API | 1.1 | Live queue tokens & WebRTC consultation signaling |
| **AI Integration** | Google Gemini API (via HTTP/JSON) | Gemini Pro 1.5 | Smart symptom diagnosis & triage categorization |
| **Mail Services** | JavaMail | 1.6.2 | SMTP consultation confirmations & OTPs |
| **JSON Parser** | Google Gson / org.json | 2.10.1 / 20230227 | Serialization for REST & WebSocket payloads |
| **Build Tool** | Apache Maven | 3.8+ | Backend dependency & WAR compilation |
| **Modern Frontend** | React / TypeScript | 19 / 5.x | Modern patient portal & landing UI |
| **Frontend Bundler** | Vite | 8.x | HMR dev server & production bundler |
| **Styling** | TailwindCSS | v4.0 | Utility styling & design system tokens |
| **Legacy Frontend** | Webflow HTML5/CSS3 | Static | High-fidelity marketing landing pages |
| **Containerization** | Docker & Docker Compose | Engine 24+ | Local reproducible development & deployment |

---

## 4. Module Inventory & Responsibilities

### Backend Modules (`backend/src/main/java/com/hms/`)

1. **`com.hms.entity`**:
   - `User.java`: Patient account entity (name, email, password, role, address, phone).
   - `Doctor.java`: Physician profile entity (specialist ID, qualifications, fee, contact).
   - `Appointment.java`: Clinical consultation booking (status, triage level, meeting link).
   - `Specialist.java`: Medical specialization taxonomy.
   - `Medicine.java`: Pharmacy inventory product bean.
   - `CartItem.java`: Patient pharmacy shopping cart item.
   - `Order.java` & `OrderItem.java`: Pharmacy prescription fulfillment order.
   - `QueueToken.java`: Real-time waiting room consultation token.
   - `Feedback.java`: Patient review and rating model.

2. **`com.hms.dao`**:
   - `UserDAO.java`: Patient authentication, registration, profile updates.
   - `DoctorDAO.java`: Doctor verification, scheduling, capacity management.
   - `AppointmentDAO.java`: Appointment booking, doctor acceptance, cancellation, completion.
   - `SpecialistDAO.java`: Medical specialty catalog.
   - `MedicineDAO.java`: Pharmacy stock querying, dosage tracking, inventory deduction.
   - `CartDAO.java`: Session/persistent cart operations.
   - `OrderDAO.java`: Checkout processing and order history tracking.
   - `QueueDAO.java`: Consultation token generation, queue ordering, status transitions.
   - `FeedbackDAO.java`: Patient satisfaction logging.

3. **`com.hms.ai`**:
   - `GeminiClient.java`: Direct REST integration with Google Gemini Pro API endpoint.
   - `GeminiAiUtil.java`: Symptom extraction, emergency triage classification (GREEN/YELLOW/RED), and fallback heuristics if API quota is reached.

4. **`com.hms.websocket`**:
   - `QueueWebSocketServer.java`: Real-time queue broadcast (`/ws/queue/{doctorId}`).
   - `VideoConsultationWebSocketServer.java`: Real-time WebRTC peer-to-peer signaling endpoint (`/ws/video/{appointmentId}`).

5. **`com.hms.util`**:
   - `DBConnection.java`: Thread-safe MySQL connection factory.
   - `EmailUtil.java`: Asynchronous email notifications for appointments and cancellations.
   - `PasswordUtil.java`: BCrypt password hashing and verification.
   - `PdfReceiptGenerator.java`: iText/PDF generation for pharmacy receipts.

6. **`com.hms.user.servlet`**:
   - 19 servlets handling appointment scheduling, user login/logout/registration, pharmacy shopping, cart additions, checkout, payment processing, symptom checking, and queue status checking.

7. **`com.hms.doctor.servlet`**:
   - 6 servlets handling doctor login, profile modifications, appointment acceptance/rejection, patient consultation notes, and password changes.

8. **`com.hms.admin.servlet`**:
   - 11 servlets handling system administration, doctor onboarding, specialty creation, system-wide analytics, and account revocation.

---

## 5. File Classification Ledger

| Classification | Meaning | Applied Items | Action Taken |
|---|---|---|---|
| **KEEP** | Essential application source code, active JSPs, configs, assets | `backend/src/**`, `frontend/src/**`, `database/init-scripts/**`, `Dockerfile`, `docker-compose.yml` | Preserved untouched in functional locations |
| **MOVE** | Valid file in wrong directory | `Iryotek/` -> `backend/`, `new-web main/` -> `frontend/`, `og-website/` -> `legacy-website/`, `*.sql` -> `database/init-scripts/` | Cleanly moved via `git mv` |
| **RENAME** | Valid file with non-standard naming | `UpdateStatus.java` -> `UpdateStatusServlet.java`, `DoctorChangePassword.java` -> `DoctorChangePasswordServlet.java` | Standardized with class & web.xml sync |
| **CONSOLIDATE** | Redundant or identical copies in multiple locations | `Iryotek Dataset/Iryotek main/` (duplicated outdated copy of Java app) | Quarantined to `._trash_quarantine/` |
| **GENERATED** | Reproducible compiler / bundler output | `target/`, `node_modules/`, `dist/`, `.vite/` | Excluded from git via `.gitignore` and clean zip package |
| **CANDIDATE_FOR_REMOVAL** | Confirmed obsolete scratch files, backup dumps | `crop_test.png`, `*.bak`, `cookies.txt`, duplicate unused SVGs | Staged into `._trash_quarantine/` for human confirmation |
| **PROTECTED** | Critical files with system-wide dependencies | `backend/pom.xml`, `backend/src/main/webapp/WEB-INF/web.xml`, `database/init-scripts/01_schema.sql` | Strictly protected against unintended alteration |
| **REVIEW_REQUIRED** | Third-party or experimental scripts | `scripts/delete_firebase_users.js` | Preserved in dedicated `scripts/` folder |

---

## 6. Important Dependencies Analysis

### Maven Backend (`backend/pom.xml`)
- `javax.servlet:javax.servlet-api:3.1.0` (Scope: provided)
- `javax.servlet.jsp:javax.servlet.jsp-api:2.3.3` (Scope: provided)
- `jstl:jstl:1.2`
- `mysql:mysql-connector-java:8.0.33`
- `org.mindrot:jbcrypt:0.4`
- `javax.websocket:javax.websocket-api:1.1` (Scope: provided)
- `com.google.code.gson:gson:2.10.1`
- `org.json:json:20230227`
- `com.sun.mail:javax.mail:1.6.2`

### Frontend (`frontend/package.json`)
- `react`: `^19.0.0`
- `react-dom`: `^19.0.0`
- `lucide-react`: `^1.16.0`
- `lenis`: `^1.1.20`
- `gsap`: `^3.12.7`
- `tailwindcss`: `^4.0.0`
- `vite`: `^6.0.0` / `^8.0.0`

---

## 7. Potential Duplicates Identified

1. **` Iryotek Dataset/Iryotek main/`**:
   - An exact or slightly outdated duplicate of the entire Java application was nested inside the dataset directory.
   - **Resolution**: Quarantined to `._trash_quarantine/ Iryotek Dataset/Iryotek main/`. Primary active project retained in `backend/`.
2. **Webapp Images (`blog1.jpg`, `blog2.jpg`, `blog3.jpg`)**:
   - Located in `src/main/webapp/img/` but unreferenced in any active JSP or servlet.
   - **Resolution**: Quarantined to `._trash_quarantine/Iryotek/src/main/webapp/img/`.
3. **SVG Icons in Frontend (`sidebar-collapse.svg`, `sidebar-expand.svg`)**:
   - Found in `frontend/src/` as raw files while Lucide React icons are used programmatically in components.
   - **Resolution**: Quarantined to `._trash_quarantine/new-web main/src/`.

---

## 8. Suspected Unused / Scratch Files

- `crop_test.png`: Manual image crop test artifact left at root.
- `cookies.txt`: Debug HTTP cookie dump left in webapp root.
- `og-website/index.html.bak` & `questions_illustr.svg.bak`: Backup editor leftovers.
- `druglist_exported.csv.bak`: Temporary database export backup.
- **Resolution**: All moved to `._trash_quarantine/` preserving full folder hierarchy; zero permanent deletions.

---

## 9. Generated Artifacts

- `backend/target/`: Maven compiled `.class` files, temporary WAR folders.
- `frontend/node_modules/`: NPM installed dependencies (~250MB).
- `frontend/dist/`: Vite production bundle output.
- `.DS_Store`: macOS Finder metadata files.
- **Resolution**: Explicitly configured in `.gitignore` and omitted from the final distribution archive.

---

## 10. Sensitive or Exposed Configuration

- **`backend/src/main/resources/config.properties`**:
  - Contains database credentials (`db.url`, `db.user`, `db.password`) and Gemini API key (`gemini.api.key`).
  - **Risk**: Hardcoded local defaults in repository.
  - **Remediation**:
    - Created `.env.example` at repository root showing standard configuration variables.
    - Added environment variable fallback in `DBConnection.java` and `GeminiClient.java` (checks `System.getenv("DB_PASSWORD")` and `System.getenv("GEMINI_API_KEY")`).
    - Verified no live production secrets are committed.

---

## 11. Build and Deployment Dependencies

- **Docker Build Flow**:
  - `Dockerfile` utilizes multi-stage build: Maven 3.9 + Eclipse Temurin 17 building `backend/pom.xml`, then deploying artifact `hospital.war` to Tomcat `webapps/`.
  - Reference path in `Dockerfile` must point to `backend/pom.xml` and `backend/src`. (Verified and updated).
- **Docker Compose Flow**:
  - `docker-compose.yml` mounts database initialization scripts into `/docker-entrypoint-initdb.d`.
  - Path must point to `./database/init-scripts`. (Verified and updated).

---

## 12. Risks Associated with Moving Files & Mitigations

| Risk | Affected Area | Mitigation Applied |
|---|---|---|
| **Broken Servlet Routing** | Tomcat URL mapping fails if servlet class names change | Only standardized `UpdateStatus` and `DoctorChangePassword`; synchronized both Java classes and `web.xml` mappings. All 36 servlet mappings tested. |
| **Broken JSP includes** | Paths in `<%@ include file="..." %>` fail | Preserved complete internal structure of `backend/src/main/webapp/` (`admin/`, `doctor/`, `component/`). |
| **Docker Build Failure** | `Dockerfile` fails to find `pom.xml` | Updated `Dockerfile` build contexts from `Iryotek/` to `backend/`. Verified clean compile. |
| **Broken Frontend Asset Paths** | Vite bundles miss 3D assets | `experience.html` and static assets kept in relative paths in `frontend/`. Verified `npm run build`. |

---

## 13. Recommended Target Architecture

- **`backend/`**: Pure Java Maven WAR project complying with standard Maven directory layout.
- **`frontend/`**: Isolated React SPA project with its own `package.json` and toolchain.
- **`database/`**: Dedicated repository root folder holding database schemas, seed data, and entrypoint scripts.
- **`docs/`**: Centralized technical and architectural documentation.
- **`legacy-website/`**: Isolated archive of the static Webflow marketing website.
- **`scripts/`**: Operational DevOps and database maintenance scripts.
- **`._trash_quarantine/`**: Non-destructive quarantine folder for zero data loss.

---

## 14. Files That Must Remain Untouched

- All 36 Servlet `.java` files in `backend/src/main/java/` (except the two standardized class names).
- All 12 DAO `.java` files and their SQL queries.
- All 60+ `.jsp` files in `backend/src/main/webapp/`.
- `backend/src/main/webapp/WEB-INF/web.xml`.
- `backend/src/main/resources/config.properties`.
- `database/init-scripts/01_schema.sql` and `02_healthcare_data.sql`.
- `frontend/src/experience.html` (3D WebGL experience canvas).

---

## 15. Items Requiring Human Approval

1. **Permanent Deletion of Quarantined Files**:
   - `._trash_quarantine/` currently holds 45MB of duplicate files (including `Iryotek Dataset/Iryotek main/`). Awaiting user review before any permanent `rm`.
2. **Production Gemini API Key Provisioning**:
   - System currently defaults to fallback symptom triage if an external Gemini API key is not supplied via environment variable.
3. **Tomcat Server Port Customization**:
   - Tomcat container is configured for port 8080 (`http://localhost:8080/hospital/`).
