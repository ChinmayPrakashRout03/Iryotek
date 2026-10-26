# Iryotek — AI-Powered Smart Healthcare Management Platform

Iryotek is an enterprise hospital management ecosystem and telehealth clinic queue platform engineered for clinical appointment dispatch, real-time waiting room orchestration, pharmacy ecommerce fulfillment, and AI-assisted clinical symptom triage across three core stakeholder roles: patients, medical practitioners, and clinic administrators.

The platform pairs a high-throughput Java Servlet 3.1 & JSP backend with a modern React 19 + TypeScript single-page application (SPA), hardware-accelerated 3D WebGL anatomical experiences, and JSR-356 WebSockets.

---

## Technical Documentation Index

- [Project Architecture Blueprint](file:///Users/chinmayprakashrout/Iryotek-Project/docs/architecture/PROJECT_ARCHITECTURE.md)
- [Repository Audit & Discovery Report](file:///Users/chinmayprakashrout/Iryotek-Project/docs/maintenance/REPOSITORY_AUDIT.md)
- [Target Architecture Specification](file:///Users/chinmayprakashrout/Iryotek-Project/docs/maintenance/TARGET_ARCHITECTURE.md)
- [File Movement & Transformation Manifest](file:///Users/chinmayprakashrout/Iryotek-Project/docs/maintenance/FILE_MANIFEST.md)
- [Cleanup & Restructuring Report](file:///Users/chinmayprakashrout/Iryotek-Project/docs/maintenance/CLEANUP_REPORT.md)

---

## Core Capabilities

* **Appointment Booking & Smart Dispatch**: Patients search by medical specialty, select an attending physician, and book slots with automatic conflict detection.
* **Queue Token Generation**: Sequential token issuance with dynamic 15-minute consultation slot calculations starting daily at 09:00 AM.
* **Real-Time Waiting Room Updates**: Low-latency WebSocket broadcasting pushes queue advancement directly to patient screens.
* **Telehealth WebRTC Video Signaling**: WebSocket signaling plane facilitating direct doctor-patient video consultations.
* **AI Clinical Triage (Google Gemini Pro)**: Natural language symptom extraction and emergency prioritization (GREEN / YELLOW / RED) with offline heuristic fallbacks.
* **Pharmacy E-Commerce & Inventory**: Medicine catalog search, persistent cart operations, checkout processing, and PDF prescription receipt generation.
* **Role-Based Portals**: Strict session-level access control for Patients, Doctors, and Hospital Administrators.
* **Clinical Records Management**: Doctors review daily patient queues, record clinical observations, diagnoses, and update treatment progress.
* **Hospital Administration**: Administrative control plane for managing clinic branches, onboarding physicians, defining specialties, and auditing system analytics.

---

## Architecture and Tech Stack

| Layer | Technologies | Role |
|---|---|---|
| **Backend Core** | Java 17, Servlet 3.1, JSP, JSTL | Enterprise clinical logic, session management, and server rendering |
| **Persistence** | MySQL 8.0, JDBC (MySQL Connector/J 8.0.33) | Relational EHR, pharmacy inventory, and appointment records |
| **Security** | jBCrypt 0.4, HTTP Session Filters | Blowfish salt-hashed credentials, role-gated access control |
| **Real-Time** | JSR-356 Java WebSocket API 1.1 | Live consultation queue token pushes & WebRTC signaling |
| **AI Triage** | Google Gemini Pro REST API (Gson / org.json) | Automated symptom evaluation and emergency prioritization |
| **Modern Frontend** | React 19, TypeScript, TailwindCSS v4, Vite 8 | Interactive patient portal and 3D WebGL anatomical landing |
| **Legacy Marketing** | Webflow HTML5, CSS3, JavaScript | Preserved informational and brand landing website |
| **Containerization** | Docker, Docker Compose | Multi-stage production builds and local multi-service orchestration |

---

## Project Structure

```text
Iryotek-Project/
├── backend/                      # Java Servlet 3.1 & JSP backend (Maven WAR)
│   ├── pom.xml                   # Maven build specification & dependencies
│   ├── database/                 # Module SQL schema snapshots
│   └── src/
│       ├── main/
│       │   ├── java/com/hms/     # Admin, Doctor, User, AI, DAO, Entity, Util, WebSocket
│       │   ├── resources/        # Classpath configs & email templates
│       │   └── webapp/           # JSP views, CSS, JS, and media assets
│       └── test/java/com/hms/    # Unit and integration test suites
├── frontend/                     # Modern Patient Portal SPA (React 19, TypeScript, Vite)
│   ├── package.json              # Node dependencies & build scripts
│   ├── vite.config.ts            # Vite proxy & build configuration
│   ├── public/                   # Static assets & datasets
│   └── src/                      # React views, components, 3D WebGL canvas
├── legacy-website/               # Preserved legacy Webflow marketing export
├── database/                     # Centralized SQL schemas & Docker initialization
│   ├── init-scripts/             # MySQL container entrypoint initialization (.sql)
│   └── dataset/                  # Healthcare datasets & medicine catalogs
├── docs/                         # Technical documentation, diagrams & visual assets
│   ├── architecture/             # Runtime architecture models & interactive diagrams
│   ├── images/                   # System walkthrough screenshots
│   └── maintenance/              # Repository audit, manifest, and cleanup reports
├── scripts/                      # Operational automation & administrative scripts
├── ._trash_quarantine/           # Isolated duplicate/scratch assets (zero data loss)
├── Dockerfile                    # Multi-stage container build configuration
├── docker-compose.yml            # Multi-service stack (MySQL 8 + Tomcat 9)
├── .env.example                  # Environment configuration template
└── README.md
```

---

## System Walkthrough & Screenshots

### Home Landing
The public landing view displays clinic departments, doctor directories, and direct login buttons.

![Iryotek Homepage](docs/images/homepage.png)

---

### Patient Workflows
* **Sign In**: Patient authentication portal.  
  ![Patient Login](docs/images/user_login.png)

* **Booking a Consultation**: Select a doctor, pick a date, and confirm your queue spot.  
  ![Schedule Appointment](docs/images/user_appointment.png)

---

### Doctor Dashboard
* **Practitioner Sign In**: Login portal for registered medical doctors.  
  ![Doctor Login](docs/images/doctor_login.png)

---

### Admin Portal
* **Staff Sign In**: Restricted login page for system administrators.  
  ![Admin Login](docs/images/admin_login.png)

* **Metrics and Overview**: Real-time counter of registered doctors, users, bookings, specialties, and branches.  
  ![Admin Dashboard](docs/images/admin_dashboard.png)

---

### Hospital Directory
* **Branch Locator**: Directory listing hospital branches and affiliated clinics.  
  ![Find Hospital](docs/images/find_hospital.png)

---

## Setup and Local Development

### 1. Prerequisites
* **Java Development Kit (JDK)**: Version 17 or higher
* **Apache Maven**: Version 3.8 or higher
* **MySQL Server**: Version 8.0 or higher
* **Node.js**: Version 18 or higher with `npm`
* **Docker & Docker Compose** (Optional, recommended for automated setup)

---

### 2. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Default parameters are pre-configured for local development.

---

### 3. Database Initialization (Manual Setup)
If running MySQL locally without Docker:
1. Log in to MySQL client:
   ```bash
   mysql -u root -p
   ```
2. Create the target database:
   ```sql
   CREATE DATABASE hospital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Ingest initialization scripts sequentially:
   ```bash
   mysql -u root -p hospital < database/init-scripts/01_schema.sql
   mysql -u root -p hospital < database/init-scripts/02_healthcare_data.sql
   mysql -u root -p hospital < database/init-scripts/03_pharmacy_schema.sql
   mysql -u root -p hospital < database/init-scripts/04_import_medicines.sql
   ```
4. Verify database credentials in `backend/src/main/resources/config.properties` or set environment variables:
   ```bash
   export DB_URL="jdbc:mysql://localhost:3306/hospital"
   export DB_USER="root"
   export DB_PASSWORD="your_password"
   ```

---

### 4. Build and Run Backend (Maven & Tomcat)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Compile and package the WAR artifact:
   ```bash
   mvn clean package
   ```
3. Deploy the resulting `target/hospital.war` into your Apache Tomcat 9/10 `webapps/` folder, or run via embedded runner:
   ```bash
   mvn jetty:run -Djetty.http.port=8080
   ```
4. The backend portal is accessible at:
   ```
   http://localhost:8080/hospital/
   ```

---

### 5. Run Modern Frontend Client (React & Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The client application runs at `http://localhost:8443` with hot module replacement (HMR).

---

### 6. One-Command Docker Deployment

To launch the entire platform (MySQL 8 + Tomcat 9 backend) via Docker Compose:
```bash
docker compose up --build
```
The database automatically initializes all tables and seed records from `./database/init-scripts/`.

---

## Troubleshooting

1. **MySQL Connection Refused**:
   - Verify MySQL is active: `brew services status mysql` or `systemctl status mysql`.
   - Ensure `hospital` database exists and credentials in `config.properties` match your local user.
2. **Port Collisions**:
   - If port 8080 is in use, adjust port mapping in `docker-compose.yml` or run Jetty with `-Djetty.http.port=8081`.
   - If port 8443 is in use, modify `server.port` in `frontend/vite.config.ts`.
3. **Gemini AI API Unavailable**:
   - The platform includes an automated local heuristic fallback in `GeminiAiUtil.java`. Symptom triage will continue operating using local rule tables even if no external API key is configured.

---

## Security Best Practices

* **Passwords**: All patient, doctor, and admin passwords must be hashed using BCrypt (`PasswordUtil.java`).
* **Prepared Statements**: Raw SQL concatenation is strictly forbidden; all database interactions must use parameterized `PreparedStatement`.
* **Session Integrity**: Role-specific filters (`AdminFilter.java`, `DoctorFilter.java`) protect administrative routes against unauthorized access.
* **Quarantine Policy**: Suspected duplicate files or experimental code must be staged into `._trash_quarantine/` and reviewed prior to permanent removal.
