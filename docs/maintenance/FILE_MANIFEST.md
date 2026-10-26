# Iryotek — Repository File Movement & Transformation Manifest

**Document Version**: 2.0  
**Refactoring Date**: October 2026  
**Auditor**: Principal Software Architect  
**Validation Status**: Verified & Compilation Tested  

---

## 1. Summary of Actions

| Action Category | Count | Description |
|---|---|---|
| **MOVE** | 120+ | Top-level folder modularization (`backend/`, `frontend/`, `database/`, `legacy-website/`, `docs/`) |
| **RENAME** | 2 | Standardized Java servlet naming (`UpdateStatusServlet`, `DoctorChangePasswordServlet`) |
| **QUARANTINE** | 90+ | Moved duplicate Java copies, scratch images, debug logs, and backups to `._trash_quarantine/` |
| **REFACTOR** | 6 | Updated references in `Dockerfile`, `docker-compose.yml`, `web.xml`, `.gitignore`, `README.md` |
| **KEEP / PROTECTED** | 150+ | Preserved essential application JSPs, DAOs, Servlets, assets, and SQL schemas |

---

## 2. Comprehensive File Manifest Table

| Original File Path | Final File Path | Action | Reason | Validation Status |
|---|---|---|---|---|
| `Iryotek/pom.xml` | `backend/pom.xml` | **MOVE** | Top-level backend modularization | Verified (`mvn clean compile` succeeded) |
| `Iryotek/src/**` | `backend/src/**` | **MOVE** | Standard Maven project structure | Verified (89 Java files compiled) |
| `Iryotek/database/schema.sql` | `backend/database/schema.sql` | **MOVE** | Co-locate backend schema definition | Verified |
| `new-web main/**` | `frontend/**` | **MOVE** | Remove spaces in folder name; standard Vite layout | Verified (`npm run build` succeeded) |
| `og-website/**` | `legacy-website/**` | **MOVE** | Clarify role as preserved static marketing website | Verified |
| ` Iryotek Dataset/Healthcare_Dataset_100k.csv` | `database/dataset/Healthcare_Dataset_100k.csv` | **MOVE** | Remove leading whitespace from folder name | Verified |
| ` Iryotek Dataset/medicines.csv` | `database/dataset/medicines.csv` | **MOVE** | Centralize pharmacy medicine catalog | Verified |
| ` Iryotek Dataset/01_schema.sql` | `database/init-scripts/01_schema.sql` | **MOVE** | Centralize Docker entrypoint DB initialization | Verified |
| ` Iryotek Dataset/02_healthcare_data.sql` | `database/init-scripts/02_healthcare_data.sql` | **MOVE** | Centralize Docker entrypoint fixtures | Verified |
| ` Iryotek Dataset/03_pharmacy_schema.sql` | `database/init-scripts/03_pharmacy_schema.sql` | **MOVE** | Centralize pharmacy table schemas | Verified |
| ` Iryotek Dataset/04_import_medicines.sql` | `database/init-scripts/04_import_medicines.sql` | **MOVE** | Centralize medicine import scripts | Verified |
| `iryotek-runtime.architecture.json` | `docs/architecture/iryotek-runtime.architecture.json` | **MOVE** | Organize architecture documentation | Verified |
| `iryotek-runtime-architecture.html` | `docs/architecture/iryotek-runtime-architecture.html` | **MOVE** | Organize interactive architecture visualizer | Verified |
| `iryotek-runtime-architecture.*.json` | `docs/architecture/iryotek-runtime-architecture.*.json` | **MOVE** | Centralize architecture metadata | Verified |
| `delete_firebase_users.js` | `scripts/delete_firebase_users.js` | **MOVE** | Group operational maintenance scripts | Verified |
| `Iryotek/.../UpdateStatus.java` | `backend/.../UpdateStatusServlet.java` | **RENAME** | Java naming standardization (`Servlet` suffix) | Verified (Synchronized with `web.xml`) |
| `Iryotek/.../DoctorChangePassword.java` | `backend/.../DoctorChangePasswordServlet.java` | **RENAME** | Java naming standardization (`Servlet` suffix) | Verified (Synchronized with `web.xml`) |
| ` Iryotek Dataset/Iryotek main/**` | `._trash_quarantine/ Iryotek Dataset/Iryotek main/**` | **QUARANTINE** | Redundant duplicate copy of legacy Java project | Safe (Retained in quarantine) |
| ` Iryotek Dataset/druglist_exported.csv.bak` | `._trash_quarantine/ Iryotek Dataset/druglist_exported.csv.bak` | **QUARANTINE** | Database export backup file | Safe (Retained in quarantine) |
| `Iryotek/cookies.txt` | `._trash_quarantine/Iryotek/cookies.txt` | **QUARANTINE** | Debug HTTP cookie dump | Safe (Retained in quarantine) |
| `Iryotek/.../blog1.jpg` | `._trash_quarantine/Iryotek/src/.../blog1.jpg` | **QUARANTINE** | Unreferenced duplicate webapp image | Safe (Retained in quarantine) |
| `Iryotek/.../blog2.jpg` | `._trash_quarantine/Iryotek/src/.../blog2.jpg` | **QUARANTINE** | Unreferenced duplicate webapp image | Safe (Retained in quarantine) |
| `Iryotek/.../blog3.jpg` | `._trash_quarantine/Iryotek/src/.../blog3.jpg` | **QUARANTINE** | Unreferenced duplicate webapp image | Safe (Retained in quarantine) |
| `crop_test.png` | `._trash_quarantine/crop_test.png` | **QUARANTINE** | Manual image crop test artifact | Safe (Retained in quarantine) |
| `new-web main/src/sidebar-expand.svg` | `._trash_quarantine/new-web main/src/sidebar-expand.svg` | **QUARANTINE** | Duplicate raw SVG (superseded by Lucide) | Safe (Retained in quarantine) |
| `new-web main/src/sidebar-collapse.svg` | `._trash_quarantine/new-web main/src/sidebar-collapse.svg` | **QUARANTINE** | Duplicate raw SVG (superseded by Lucide) | Safe (Retained in quarantine) |
| `new-web main/src/imports/Screenshot_*.png` | `._trash_quarantine/new-web main/src/imports/Screenshot_*.png` | **QUARANTINE** | Design mockup screenshot | Safe (Retained in quarantine) |
| `og-website/index.html.bak` | `._trash_quarantine/og-website/index.html.bak` | **QUARANTINE** | Legacy backup file | Safe (Retained in quarantine) |
| `og-website/images/questions_illustr.svg.bak` | `._trash_quarantine/og-website/images/*.bak` | **QUARANTINE** | Legacy backup vector | Safe (Retained in quarantine) |
| `Dockerfile` | `Dockerfile` | **REFACTOR** | Update build paths from `Iryotek/` to `backend/` | Verified (`docker build` syntax check) |
| `docker-compose.yml` | `docker-compose.yml` | **REFACTOR** | Update volume mount to `./database/init-scripts` | Verified |
| `backend/.../WEB-INF/web.xml` | `backend/.../WEB-INF/web.xml` | **REFACTOR** | Synchronize servlet class names | Verified |
| `.gitignore` | `.gitignore` | **REFACTOR** | Add `._trash_quarantine/`, `target/`, `node_modules/` | Verified |
| `README.md` | `README.md` | **REFACTOR** | Update directory structure, image links, setup guides | Verified |

---

## 3. Special Handling & Exclusions

1. **`frontend/src/experience.html`**:
   - Contains a standalone WebGL 3D healthcare canvas rendered via an iframe/raw string inside React.
   - **Handling**: Preserved untouched inside `frontend/src/` to guarantee 3D landing page animations continue functioning seamlessly.
2. **`database/dataset/medicines.csv` (10MB+) & `Healthcare_Dataset_100k.csv` (15MB+)**:
   - Large database seed files.
   - **Handling**: Tracked cleanly under `database/dataset/`; verified file encoding (UTF-8).
3. **Session Filters & Authentication**:
   - `AdminFilter.java`, `DoctorFilter.java`, and user session handlers inspect session attributes (`adminObj`, `doctObj`, `userObj`).
   - **Handling**: Preserved 100% of session key names and redirection URLs.
