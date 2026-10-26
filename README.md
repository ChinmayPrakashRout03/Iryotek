# Iryotek: Doctor-Patient Portal and Clinic Queue System

Iryotek is a hospital management web application built for clinic queues, patient appointments, and medical record keeping across three roles: patients, doctors, and clinic administrators.

The system pairs a Java servlet and JSP backend with a modern React and Vite patient interface alongside server-rendered JSP dashboards.

---

## Core Features

* **Appointment Booking**: Patients search by department, pick a doctor and date, and reserve a visit.
* **Queue Token and Slot Generation**: The backend assigns consecutive token numbers and calculates 15-minute consultation slots starting at 09:00 AM on each clinic day.
* **Confirmation Popups**: Successful reservations immediately return the assigned token number and visit time.
* **Role-Based Portals**: Dedicated authentication flows and permission-gated sessions for patients, doctors, and administrative staff.
* **Doctor Records**: Doctors inspect their daily appointment queue and submit clinical notes, diagnoses, and prescriptions into the patient record.
* **Clinic Administration**: Admins manage hospital branches, create medical specialties, onboard practitioners, and audit system-wide appointments.

---

## Architecture and Tech Stack

* **Backend**: Java 8 Servlets, JSP, JSTL, and JDBC connection pooling via MySQL Connector/J.
* **Frontend**:
  * Single Page Application: React, TypeScript, and Vite.
  * Server-Side Views: JSP, Bootstrap 5, and FontAwesome.
* **Database**: MySQL 8.x (`hospital` schema).
* **Build Tools**: Maven for the Java servlet WAR package; npm for the Vite client.
* **Application Server**: Apache Tomcat 9 or Eclipse Jetty.

---

## Project Structure

```text
Iryotek-Project/
├── backend/                      # Java Servlet 3.1 & JSP backend (Maven WAR)
│   ├── pom.xml
│   ├── database/                 # Co-located SQL schemas & seeds
│   └── src/main/
│       ├── java/com/hms/         # Controllers, DAO, Entity, Util, WebSocket
│       └── webapp/               # JSP templates, static assets (css, js, img)
├── frontend/                     # Modern Patient Portal SPA (React 19, TypeScript, Vite)
│   ├── package.json
│   ├── public/                   # Static icons, datasets & vendor animation libraries
│   └── src/                      # React views, catalog, API client, stylesheets
├── legacy-website/               # Preserved legacy marketing export
├── database/                     # Centralized SQL schemas & Docker initialization
│   ├── init-scripts/             # MySQL container entrypoint initialization (.sql)
│   └── dataset/                  # Comprehensive healthcare datasets & generation scripts
├── docs/                         # Technical documentation, diagrams & visual assets
│   ├── architecture/             # Runtime architecture models & interactive diagrams
│   └── images/                   # System walkthrough screenshots
├── scripts/                      # Operational automation & administrative scripts
├── ._trash_quarantine/           # Isolated deprecated assets & duplicates staged for manual review
├── Dockerfile                    # Container build configuration
├── docker-compose.yml            # Multi-service stack (MySQL 8 + Tomcat 9)
└── README.md
```

---

## System Walkthrough

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

### 1. Requirements
* JDK 8 or higher
* MySQL 8.x server
* Apache Maven 3.6+
* Node.js 18+ and npm (for the React client)
* Apache Tomcat 9.x or Eclipse Jetty runner

### 2. Database Configuration
1. Log in to MySQL:
   ```bash
   mysql -u root -p
   ```
2. Create the database:
   ```sql
   CREATE DATABASE hospital;
   ```
3. Load the initial schema and seed records:
   ```bash
   mysql -u root -p hospital < database/init-scripts/1_schema.sql
   ```
   Verify database credentials match `backend/src/main/java/com/hms/db/DBConnection.java` (defaults: `root` / `admin`).

### 3. Build and Run Backend
Navigate to the backend project directory:
```bash
cd backend
mvn clean package
```
Deploy `target/Iryotek.war` to your Tomcat `webapps/` folder, or start Jetty on port 8081:
```bash
mvn jetty:run -Djetty.http.port=8081
```

Backend will be accessible at:
```
http://localhost:8081/Iryotek/
```

### 4. Run Frontend Client
From the repository root:
```bash
cd frontend
npm install
npm run dev
```
The React client runs at `http://localhost:8443` and proxies API calls to the servlet backend on port 8081.
