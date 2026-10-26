# Iryotek: Target Architecture Specification

**Document Version**: 2.0 (Production Blueprint)  
**Author**: Principal Software Architect  
**Status**: Implemented & Verified  

---

## 1. Architectural Philosophy & Principles

The restructuring of the Iryotek codebase follows five core engineering principles:

1. **Separation of Concerns (SoC)**:
   - Backend enterprise Java logic, modern frontend SPA code, database initialization, and static legacy marketing materials are decoupled into self-contained top-level modules.
2. **Standard Directory Layouts**:
   - The Java backend strictly complies with the standard Maven directory layout (`src/main/java`, `src/main/resources`, `src/main/webapp`, `src/test/java`).
   - The frontend adheres to standard Vite/TypeScript conventions (`src/`, `public/`, `tsconfig.json`).
3. **Zero Functional Regression**:
   - Every existing JSP path, servlet URL mapping, form submission target, session attribute, and database query remains 100% backward-compatible.
4. **Reproducible Containerized Delivery**:
   - Docker build scripts and orchestration files point directly to standardized module roots.
5. **Non-Destructive Quarantine**:
   - Suspected duplicates and dead assets are isolated in `._trash_quarantine/` rather than permanently destroyed, providing a zero-risk rollback path.

---

## 2. Target Directory Hierarchy

```
Iryotek-Project/
│
├── ._trash_quarantine/                   # Non-destructive quarantine zone (git-ignored)
├── .dockerignore                         # Container build exclusions
├── .editorconfig                         # Universal code formatting rules
├── .env.example                          # Environment configuration template
├── .gitignore                            # Repository-wide version control ignore rules
├── Dockerfile                            # Multi-stage production container build definition
├── README.md                             # Production operations & architecture guide
├── ARCHITECTURE_GUIDE.md                 # System architecture and modularization guide
├── docker-compose.yml                    # Local multi-service orchestration (DB + App)
│
├── backend/                              # Java Enterprise Healthcare Platform (Maven WAR)
│   ├── pom.xml                           # Maven project object model & dependencies
│   ├── database/                         # Module-specific SQL schema snapshots
│   │   └── schema.sql
│   └── src/
│       ├── main/
│       │   ├── java/com/hms/             # Java source tree
│       │   │   ├── admin/servlet/        # Administrator control plane servlets
│       │   │   ├── ai/                   # AI Triage engine & Gemini API integration
│       │   │   ├── dao/                  # JDBC Data Access Objects
│       │   │   ├── db/                   # Connection factory & pool management
│       │   │   ├── doctor/servlet/       # Physician portal servlets
│       │   │   ├── entity/               # Data beans & ORM-like entities
│       │   │   ├── model/                # Domain models & state containers
│       │   │   ├── service/              # Healthcare business services
│       │   │   ├── user/servlet/         # Patient & Pharmacy servlets
│       │   │   ├── util/                 # Security, Email, PDF & Date utilities
│       │   │   └── websocket/            # JSR-356 WebSocket endpoints
│       │   ├── resources/                # Classpath configuration & templates
│       │   │   ├── config.properties
│       │   │   └── email-template.html
│       │   └── webapp/                   # Web application root (JSP, CSS, JS, Media)
│       │       ├── WEB-INF/
│       │       │   └── web.xml           # Servlet 3.1 deployment descriptor
│       │       ├── admin/                # Admin portal JSP views
│       │       ├── component/            # Shared JSP navigation & layout fragments
│       │       ├── css/                  # Application stylesheets
│       │       ├── doctor/               # Doctor portal JSP views
│       │       ├── img/                  # Verified active images, icons, and logos
│       │       ├── js/                   # Client-side scripts & form validation
│       │       └── *.jsp                 # Patient portal & public landing JSPs
│       └── test/                         # Unit and integration test suites
│           └── java/
│
├── database/                             # Centralized Database Assets
│   ├── dataset/                          # Raw healthcare datasets & catalogs
│   │   ├── Healthcare_Dataset_100k.csv
│   │   └── medicines.csv
│   └── init-scripts/                     # Automated Docker entrypoint initialization
│       ├── 01_schema.sql                 # Core hospital tables, foreign keys, constraints
│       ├── 02_healthcare_data.sql        # Realistic baseline doctor & patient fixtures
│       ├── 03_pharmacy_schema.sql        # Pharmacy, medicines, orders, cart tables
│       └── 04_import_medicines.sql       # Catalog ingestion & index optimization
│
├── docs/                                 # Centralized Technical Documentation
│   ├── architecture/                     # System architecture specifications & models
│   │   ├── PROJECT_ARCHITECTURE.md
│   │   ├── iryotek-runtime.architecture.json
│   │   └── iryotek-runtime-architecture.html
│   ├── images/                           # Architecture diagrams & application previews
│   └── maintenance/                      # Refactoring logs, audits, and manifests
│       ├── FILE_MANIFEST.md
│       ├── REPOSITORY_AUDIT.md
│       └── TARGET_ARCHITECTURE.md
│
├── frontend/                             # Modern React 19 + TypeScript + Vite SPA
│   ├── index.html                        # SPA single-page application entrypoint
│   ├── package.json                      # Node dependencies & build scripts
│   ├── tsconfig.json                     # TypeScript strict compilation rules
│   ├── vite.config.ts                    # Vite build & development server config
│   ├── public/                           # Static assets served as-is
│   └── src/                              # React application source code
│       ├── App.tsx                       # Main application shell
│       ├── main.tsx                      # React root mount
│       ├── index.css                     # TailwindCSS v4 design tokens
│       ├── experience.html               # Interactive 3D WebGL experience canvas
│       ├── components/                   # Reusable UI component library
│       └── assets/                       # Component icons & media
│
├── legacy-website/                       # Preserved Marketing & Informational Webflow Site
│   ├── index.html                        # Webflow landing page
│   ├── css/                              # Webflow styles
│   ├── js/                               # Webflow interactions
│   └── images/                           # Preserved landing graphics & vectors
│
└── scripts/                              # Operational & Maintenance Tooling
    └── delete_firebase_users.js          # Admin account cleanup utility
```

---

## 3. Module Mapping & Rationales

### 3.1 Backend: `Iryotek/` -> `backend/`
- **Previous State**: The Java backend was located in an identically named folder `Iryotek/` alongside various legacy folders, creating confusion between the repository root and the application.
- **Target State**: Explicitly named `backend/`. Contains pure Maven WAR project files.
- **Impact**:
  - `Dockerfile` updated: `COPY backend/pom.xml .` and `COPY backend/src ./src`.
  - Maven commands run cleanly inside `backend/` (`mvn clean package`).

### 3.2 Frontend: `new-web main/` -> `frontend/`
- **Previous State**: Folder named with spaces `new-web main/`, causing issues with terminal paths and build automation tools.
- **Target State**: Renamed to standard `frontend/`.
- **Impact**: Clean CI/CD paths, standard `cd frontend && npm run dev` command execution.

### 3.3 Database: ` Iryotek Dataset/` -> `database/`
- **Previous State**: Contained a leading space (` Iryotek Dataset/`), breaking bash globbing and path parsing. Contained both raw CSV datasets, SQL scripts, and an accidental nested copy of the entire Java application (`Iryotek main/`).
- **Target State**:
  - Cleaned and organized into `database/dataset/` and `database/init-scripts/`.
  - Nested Java duplicate moved to `._trash_quarantine/`.
  - `docker-compose.yml` updated to mount `./database/init-scripts:/docker-entrypoint-initdb.d`.

### 3.4 Static Landing: `og-website/` -> `legacy-website/`
- **Previous State**: Informally named `og-website/`.
- **Target State**: Renamed to descriptive `legacy-website/` so future maintainers understand its role as a preserved static Webflow asset.

### 3.5 Documentation: Root scattering -> `docs/`
- **Previous State**: Multiple architecture JSON files, HTML model reports, and screenshot PNGs were placed at the root level or in ad-hoc folders.
- **Target State**: Structured cleanly under `docs/architecture/`, `docs/images/`, and `docs/maintenance/`.

---

## 4. Naming Standardization within Java Packages

Two doctor servlet classes were named without the standard `Servlet` suffix:
- `com.hms.doctor.servlet.UpdateStatus` -> `com.hms.doctor.servlet.UpdateStatusServlet`
- `com.hms.doctor.servlet.DoctorChangePassword` -> `com.hms.doctor.servlet.DoctorChangePasswordServlet`

**Synchronization Rules Applied**:
1. Class declarations updated in source `.java` files.
2. Servlet mappings in `backend/src/main/webapp/WEB-INF/web.xml` updated from:
   ```xml
   <servlet-class>com.hms.doctor.servlet.UpdateStatus</servlet-class>
   <!-- to -->
   <servlet-class>com.hms.doctor.servlet.UpdateStatusServlet</servlet-class>
   ```
   and
   ```xml
   <servlet-class>com.hms.doctor.servlet.DoctorChangePassword</servlet-class>
   <!-- to -->
   <servlet-class>com.hms.doctor.servlet.DoctorChangePasswordServlet</servlet-class>
   ```
3. URL mappings (`/updateStatus`, `/doctorChangePassword`) remained completely unchanged.
4. Verified compilation: `mvn clean compile` succeeded with 89 source files.

---

## 5. Security Architecture

1. **Configuration & Secrets**:
   - Secrets are externalized using `.env.example`.
   - `DBConnection.java` supports dynamic fallback to system environment variables (`DB_URL`, `DB_USER`, `DB_PASSWORD`).
   - `GeminiClient.java` supports `GEMINI_API_KEY` environment variable.
2. **Access Control**:
   - `AdminFilter.java` and `DoctorFilter.java` intercept role-specific routes.
   - Authentication tokens and user sessions are stored securely in HTTP session scope with BCrypt hashed credential verification.
3. **Quarantine Safety**:
   - `._trash_quarantine/` is registered in `.gitignore` to prevent committing experimental or scratch artifacts into Git history.
