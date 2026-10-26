# Iryotek System Architecture & Modularization Specification

**Date**: October 26, 2026  
**System**: Iryotek Healthcare Management Platform  
**Target Environment**: Enterprise Production & Multi-Container Cloud  

---

## 1. System Architecture Overview

The Iryotek platform is organized into a modular enterprise architecture separating client interfaces, server-side services, relational persistence, documentation, and media assets.

The repository layout enforces clear module boundaries:
1. **Application Logic Integrity**: All entry points, clinical workflows, authentication controllers, environment configs, and database schemas are preserved with strict backward compatibility.
2. **Modular Decoupling**: Frontend SPA, Java servlet backend, database schemas, and documentation are strictly segregated into distinct top-level modules.
3. **Configuration Alignment**: Container definitions (`Dockerfile`, `docker-compose.yml`), build scripts, and local proxies reflect standardized module paths with zero path conflicts.
4. **Verified Build Health**: Both frontend and backend compile and build cleanly with zero compiler or type-check errors.

### Build Verification Matrix

| Metric / Check | Target Standard | Status |
|---|---|---|
| **Java Backend Compilation** (`backend/`) | `BUILD SUCCESS` (89 enterprise source files) | **PASS** |
| **Java Backend Tests** (`backend/`) | `BUILD SUCCESS` (0 failures, 0 errors) | **PASS** |
| **Frontend TypeScript Typecheck** (`frontend/`) | `npx tsc --noEmit` (0 errors) | **PASS** |
| **Frontend Production Build** (`frontend/`) | Vite v8.3.3 (`dist/` generated in under 1s) | **PASS** |
| **Frontend Dev Server** | `http://localhost:8443` (200 OK) | **PASS** |

---

## 2. Standardized Repository Architecture

```text
Iryotek-Project/
├── backend/                                  # Java Servlet 3.1 & JSP backend
│   ├── pom.xml                               # Root Maven build descriptor
│   ├── database/                             # Database SQL schemas (schema.sql, seed_data.sql)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hms/                 # Layered Java architecture
│   │   │   │   ├── admin/servlet/            # Admin controllers
│   │   │   │   ├── api/                      # REST & JSON endpoints
│   │   │   │   ├── dao/                      # Data Access Objects (Doctor, Hospital, Patient)
│   │   │   │   ├── db/                       # Database connection pooling
│   │   │   │   ├── doctor/servlet/           # Doctor controllers (*Servlet.java)
│   │   │   │   ├── entity/                   # Data models & DTOs
│   │   │   │   ├── user/servlet/             # Patient/User controllers
│   │   │   │   ├── util/                     # Mail, AI, and helper utilities
│   │   │   │   └── websocket/                # WebSocket communication servers
│   │   │   ├── resources/                    # Application properties & configs
│   │   │   └── webapp/                       # Server-rendered JSP views & assets
│   │   │       ├── admin/                    # Admin JSP views
│   │   │       ├── doctor/                   # Doctor JSP views
│   │   │       ├── component/                # Reusable JSP partials
│   │   │       ├── css/                      # Server-side stylesheets
│   │   │       ├── js/                       # Server-side dock / UI scripts
│   │   │       ├── img/                      # Static images & icons served by Tomcat
│   │   │       └── WEB-INF/web.xml           # Servlet container deployment descriptor
│   │   └── test/java/com/hms/                # Backend unit and integration tests
│
├── frontend/                                 # Modern Patient Portal SPA (React 19 + TypeScript)
│   ├── package.json, vite.config.ts, tsconfig.json
│   ├── public/                               # Static assets served as-is by Vite
│   │   ├── assets/img/                       # Frontend photography & banners
│   │   ├── data/                             # Client JSON databases (medicines.json, etc.)
│   │   └── vendor/                           # Third-party animations (GSAP, Lenis)
│   └── src/
│       ├── components/                       # Reusable UI pieces (MedicineDropdown, YouPIModal)
│       ├── pages/                            # Screen-level views (pages.tsx, catalog.tsx, AuthView.tsx)
│       ├── styles/                           # Dedicated stylesheets (index.css, catalog.css, styles.css)
│       ├── services/                         # API & Auth integrations (api.ts, auth.ts, firestore.ts)
│       ├── data/                             # Static datasets (medicine-categories.ts, etc.)
│       └── main.tsx, App.tsx                 # Client entry points
│
├── animation/                                # 30-Second Whiteboard Video & Rendering Pipeline
│   ├── iryotek_whiteboard_animation_30s.mp4  # Full HD 1080p whiteboard video
│   ├── iryotek_whiteboard_animation.gif      # Animated preview GIF
│   ├── source_illustration.jpg               # Vector healthcare illustration source
│   └── render_whiteboard.py                  # Standalone rendering CLI tool
│
├── database/                                 # Centralized SQL schemas & Docker initialization
│   ├── init-scripts/                         # MySQL container entrypoint initialization (.sql)
│   └── dataset/                              # Medicine catalogs & dataset generation scripts
│
├── docs/                                     # Technical documentation, diagrams & visual assets
│   ├── architecture/                         # Runtime architecture models & interactive diagrams
│   ├── images/                               # System screenshots & visual media
│   └── maintenance/                          # Historical migration records & audit documentation
│
├── scripts/                                  # Operational automation & administrative scripts
│   └── delete_firebase_users.js
│
├── Dockerfile                                # Multi-stage build (Maven compiler + Tomcat runtime)
├── docker-compose.yml                        # Multi-container orchestration (MySQL 8 + Tomcat 9)
├── .env.example                              # Environment configuration template
└── README.md                                 # Project landing documentation
```

---

## 3. Structural Mapping & Module Boundaries

| Module | Primary Responsibility | Key Technologies |
|---|---|---|
| `backend/` | Hospital data access, appointment dispatch, doctor authentication, clinical servlets | Java Servlet 3.1, JSP, Maven, MySQL Connector |
| `frontend/` | Patient care interface, digital appointment scheduling, pharmacy catalog, 3D viewer | React 19, TypeScript, Vite, Tailwind tokens |
| `database/` | Relational schema definitions, initial seed datasets, migration scripts | MySQL 8.0, SQL DDL/DML |
| `animation/` | Product explainer video generation, whiteboard stroke animation pipeline | Python 3, OpenCV, Pillow, FFmpeg |
| `docs/` | System architecture specs, API flowcharts, runtime diagrams, UI screenshots | Markdown, Mermaid, PNG, GIF |
| `scripts/` | Maintenance automation, cloud sync utilities, user management scripts | Node.js, Shell |

---

## 4. Configuration & Deployment Specifications

### Docker Configuration
* **`Dockerfile`**: Implements a multi-stage build. Stage 1 compiles `backend/pom.xml` using Maven. Stage 2 packages the compiled WAR (`target/Iryotek.war`) into Apache Tomcat 9 with a hardened `webapps/` runtime.
* **`docker-compose.yml`**: Provisions an isolated bridge network linking the MySQL database service (`iryo-db`) with the Tomcat servlet container (`iryo-app`). Volume mounts map `./database/init-scripts/` directly to `/docker-entrypoint-initdb.d/`.

### Java Servlet Conventions
* All servlet controllers follow the standard Java naming convention (`*Servlet.java`).
* Servlets are mapped cleanly in `backend/src/main/webapp/WEB-INF/web.xml` and co-located with their domain entities.

### Frontend Client Architecture
* Vite config proxies `/Iryotek/*` API calls to the Java backend during local development.
* React Router manages screen-level routes (`/intro`, `/appointments`, `/pharmacy`, `/doctors`, `/hospitals`, `/login`).
