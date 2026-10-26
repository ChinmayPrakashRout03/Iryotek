# Iryotek Repository Reorganization & Cleanup Report

**Date**: October 26, 2026  
**Safety Branch**: `chore/project-restructure`  
**Architect**: Senior Software Architect & Repository-Hygiene Specialist  
**Execution Policy**: Zero permanent deletion; all candidates for review isolated in `_cleanup_review/`.

---

## 1. Executive Summary

The Iryotek repository has been reorganized into an industry-standard, professional multi-component structure without breaking builds or runtime contracts. All files were accounted for, no code business logic was altered, and all duplicate/junk assets were segregated safely into `_cleanup_review/` preserving original relative paths for manual evaluation.

### Baseline vs. Final Verification

| Metric / Check | Baseline (Before Restructure) | Final (After Restructure) | Status |
|---|---|---|---|
| **Java Backend Compilation** (`Iryotek`) | `BUILD SUCCESS` (89 source files) | `BUILD SUCCESS` (89 source files) | PASS |
| **Java Backend Tests** (`Iryotek`) | `BUILD SUCCESS` (No tests to run) | `BUILD SUCCESS` (No tests to run) | PASS |
| **Frontend Production Build** (`new-web main`) | Vite v8.3.3 built in 930ms (`dist/`) | Vite v8.3.3 built in 971ms (`dist/`) | PASS |
| **Tracked File Deletions** | 0 | 0 (All moved via `git mv`) | PASS |
| **File Accounting** | 455 non-ignored files | 455 files (378 active + 77 cleanup review) | PASS |

---

## 2. Directory Tree: Before vs. After

### Before Restructure
```text
Iryotek-Project/
├── .DS_Store
├── .dockerignore
├── .gitignore
├── .vscode/
├── Dockerfile
├── docker-compose.yml
├── crop_test.png                                           # Unreferenced test crop image
├── iryotek-runtime-architecture.delivery-pending.json     # Architecture delivery state
├── iryotek-runtime-architecture.finalize-summary.json      # Architecture summary
├── iryotek-runtime-architecture.finalize.json              # Architecture finalize manifest
├── iryotek-runtime-architecture.html                       # 778KB standalone architecture visualizer
├── iryotek-runtime.architecture.json                       # Architecture graph specification
├── README.md
├── img/                                                    # Readme screenshot documentation
├── init-scripts/                                           # Docker MySQL initialization SQL scripts
├── scripts/
│   └── delete_firebase_users.js
├──  Iryotek Dataset/
│   ├── Iryotek main/                                      # 65 redundant duplicate files of early Java app
│   ├── druglist_exported.csv.bak                          # Backup CSV file
│   └── [comprehensive dataset, csv, py generators]
├── Iryotek/
│   ├── cookies.txt                                         # Temporary curl cookie dump
│   ├── pom.xml
│   ├── src/main/java/com/hms/doctor/servlet/
│   │   ├── DoctorChangePassword.java                       # Inconsistent naming (missing Servlet suffix)
│   │   └── UpdateStatus.java                               # Inconsistent naming (missing Servlet suffix)
│   └── src/main/webapp/img/
│       ├── blog1.jpg, blog2.jpg, blog3.jpg                 # Exact binary MD5 duplicates of hospital1..3
│       └── [hospital, logo, doc images]
├── new-web main/
│   └── src/
│       ├── imports/
│       │   └── Screenshot_2026-10-06_at_8.04.27_PM.png     # Unreferenced mockup screenshot
│       ├── sidebar-collapse.svg                            # Exact binary MD5 duplicate of public/
│       ├── sidebar-expand.svg                              # Exact binary MD5 duplicate of public/
│       └── [App, catalog, pages, data, styles]
└── og-website/
    ├── index.html.bak                                      # Backup HTML file
    └── images/
        └── questions_illustr.svg.bak                       # Backup SVG file
```

### After Restructure
```text
Iryotek-Project/
├── Dockerfile                                              # Multi-stage Docker build for Java Tomcat 9
├── docker-compose.yml                                      # Orchestrates MySQL 8.0 & Tomcat application
├── README.md                                               # Updated documentation with Project Structure
├── .gitignore                                              # Standardized ignores (Java, Vite, OS, _cleanup_review)
├── .dockerignore
├── .github/
├── docs/                                                   # Centralized project documentation
│   └── architecture/
│       ├── iryotek-runtime-architecture.html               # Visual architecture interactive canvas
│       ├── iryotek-runtime.architecture.json               # System architecture component graph
│       ├── iryotek-runtime-architecture.finalize.json
│       ├── iryotek-runtime-architecture.finalize-summary.json
│       └── iryotek-runtime-architecture.delivery-pending.json
├── Iryotek/                                                # Core Java Servlet 3.1 & JSP Web Application
│   ├── pom.xml
│   ├── schema.sql, schema_pharmacy.sql, seed_data.sql
│   └── src/main/
│       ├── java/com/hms/                                   # Layered packages (admin, api, dao, db, doctor, entity, user, util, websocket)
│       │   └── doctor/servlet/
│       │       ├── DoctorChangePasswordServlet.java        # Standardized PascalCase + Servlet suffix
│       │       └── UpdateStatusServlet.java                # Standardized PascalCase + Servlet suffix
│       └── webapp/                                         # JSP views, CSS, JS, and clean web assets
├── new-web main/                                           # Modern Patient Portal & Medicine Catalog SPA
│   ├── package.json, vite.config.ts, tsconfig.json
│   ├── public/                                             # Public static SVGs and icons
│   └── src/                                                # React components, pages, catalog, styles
├── og-website/                                             # Legacy presentation & landing site
├── init-scripts/                                           # Database initialization scripts mounted by docker-compose
├──  Iryotek Dataset/                                       # Healthcare dataset, models, and Python scripts
├── scripts/                                                # Automation & utility scripts
│   └── delete_firebase_users.js
└── _cleanup_review/                                        # Isolated review staging folder (NEVER auto-deleted)
    ├── crop_test.png
    ├── Iryotek/
    │   ├── cookies.txt
    │   └── src/main/webapp/img/
    │       ├── blog1.jpg
    │       ├── blog2.jpg
    │       └── blog3.jpg
    ├──  Iryotek Dataset/
    │   ├── druglist_exported.csv.bak
    │   └── Iryotek main/                                  # 65 duplicate files of early Java app
    ├── new-web main/
    │   └── src/
    │       ├── sidebar-collapse.svg
    │       ├── sidebar-expand.svg
    │       └── imports/
    │           └── Screenshot_2026-10-06_at_8.04.27_PM.png
    └── og-website/
        ├── index.html.bak
        └── images/
            └── questions_illustr.svg.bak
```

---

## 3. Full Move and Rename Log

All tracked files were moved strictly via `git mv` to preserve commit history.

| Original Path | New Path | Operation | Reason |
|---|---|---|---|
| `iryotek-runtime-architecture.html` | `docs/architecture/iryotek-runtime-architecture.html` | `git mv` | Documentation file relocated to `docs/architecture/` |
| `iryotek-runtime.architecture.json` | `docs/architecture/iryotek-runtime.architecture.json` | `git mv` | Architecture graph relocated to `docs/architecture/` |
| `iryotek-runtime-architecture.finalize.json` | `docs/architecture/iryotek-runtime-architecture.finalize.json` | `git mv` | Architecture manifest relocated to `docs/architecture/` |
| `iryotek-runtime-architecture.finalize-summary.json` | `docs/architecture/iryotek-runtime-architecture.finalize-summary.json` | `git mv` | Architecture summary relocated to `docs/architecture/` |
| `iryotek-runtime-architecture.delivery-pending.json` | `docs/architecture/iryotek-runtime-architecture.delivery-pending.json` | `git mv` | Architecture delivery state relocated to `docs/architecture/` |
| ` Iryotek Dataset/Iryotek main` (65 files) | `_cleanup_review/ Iryotek Dataset/Iryotek main` | `git mv` | Complete duplicate of early Java backend inside dataset folder |
| ` Iryotek Dataset/druglist_exported.csv.bak` | `_cleanup_review/ Iryotek Dataset/druglist_exported.csv.bak` | `git mv` | Deprecated backup file |
| `Iryotek/src/main/webapp/img/blog1.jpg` | `_cleanup_review/Iryotek/src/main/webapp/img/blog1.jpg` | `git mv` | 100% MD5 identical duplicate of `hospital1.jpg` (0 references) |
| `Iryotek/src/main/webapp/img/blog2.jpg` | `_cleanup_review/Iryotek/src/main/webapp/img/blog2.jpg` | `git mv` | 100% MD5 identical duplicate of `hospital2.jpg` (0 references) |
| `Iryotek/src/main/webapp/img/blog3.jpg` | `_cleanup_review/Iryotek/src/main/webapp/img/blog3.jpg` | `git mv` | 100% MD5 identical duplicate of `hospital3.jpg` (0 references) |
| `Iryotek/.../DoctorChangePassword.java` | `Iryotek/.../DoctorChangePasswordServlet.java` | `git mv` + class sync | Standardized Java naming convention (`*Servlet`) |
| `Iryotek/.../UpdateStatus.java` | `Iryotek/.../UpdateStatusServlet.java` | `git mv` + class sync | Standardized Java naming convention (`*Servlet`) |
| `crop_test.png` | `_cleanup_review/crop_test.png` | `mv` | Untracked test crop image at root |
| `Iryotek/cookies.txt` | `_cleanup_review/Iryotek/cookies.txt` | `mv` | Untracked curl session cookie file in Java tree |
| `og-website/index.html.bak` | `_cleanup_review/og-website/index.html.bak` | `mv` | Untracked backup HTML |
| `og-website/images/questions_illustr.svg.bak` | `_cleanup_review/og-website/images/questions_illustr.svg.bak` | `mv` | Untracked backup SVG |
| `new-web main/src/sidebar-collapse.svg` | `_cleanup_review/new-web main/src/sidebar-collapse.svg` | `mv` | Untracked duplicate of `new-web main/public/sidebar-collapse.svg` |
| `new-web main/src/sidebar-expand.svg` | `_cleanup_review/new-web main/src/sidebar-expand.svg` | `mv` | Untracked duplicate of `new-web main/public/sidebar-expand.svg` |
| `new-web main/src/imports/Screenshot_...png` | `_cleanup_review/new-web main/src/imports/Screenshot_...png` | `mv` | Untracked Figma screenshot inside source code |

---

## 4. Isolation Details: Everything Staged in `_cleanup_review/`

Per Absolute Rule 1, **no files were deleted**. All items identified as redundant, duplicate, backup, or temporary were staged into `_cleanup_review/`:

1. **`_cleanup_review/ Iryotek Dataset/Iryotek main/`** (65 files):
   - **Reason**: An entire snapshot of the Java backend committed inside the dataset folder on June 26, 2024. Active development continued in `Iryotek/`. This duplicate copy was unreferenced by any build or deployment file.
2. **`_cleanup_review/ Iryotek Dataset/druglist_exported.csv.bak`**:
   - **Reason**: Static backup copy of the exported drug dataset.
3. **`_cleanup_review/Iryotek/src/main/webapp/img/blog{1,2,3}.jpg`**:
   - **Reason**: Binary exact duplicates of `hospital1.jpg`, `hospital2.jpg`, and `hospital3.jpg` (verified via MD5 hashes: `a6c2aa7145d7...`, `4659ce4f6e87...`, `0881da1f8daae...`). Verified 0 code references across entire repository.
4. **`_cleanup_review/crop_test.png`**:
   - **Reason**: Test image from manual cropping experiments; zero code references.
5. **`_cleanup_review/Iryotek/cookies.txt`**:
   - **Reason**: Generated curl cookie jar file left over from HTTP testing.
6. **`_cleanup_review/new-web main/src/sidebar-collapse.svg` & `sidebar-expand.svg`**:
   - **Reason**: Exact duplicates of `new-web main/public/sidebar-*.svg`. The React source code only loads static assets from `public/`.
7. **`_cleanup_review/new-web main/src/imports/Screenshot_2026-10-06_at_8.04.27_PM.png`**:
   - **Reason**: Standalone mockup screenshot placed in `src/imports/`; unreferenced in any module.
8. **`_cleanup_review/og-website/index.html.bak` & `questions_illustr.svg.bak`**:
   - **Reason**: Manual `.bak` files from previous web page edits.

---

## 5. Configuration & Build File Modifications

In strict compliance with Absolute Rule 2:
- **`pom.xml`**: UNTOUCHED.
- **`package.json` / lockfiles**: UNTOUCHED.
- **`tsconfig.json`**: UNTOUCHED.
- **`vite.config.ts`**: UNTOUCHED.
- **`Dockerfile`**: UNTOUCHED.
- **`docker-compose.yml`**: UNTOUCHED.
- **`.gitignore`**: Added standard rules for Node, Vite build outputs (`dist/`, `.vite/`), build logs (`*.log`), and `_cleanup_review/`.

---

## 6. Needs My Decision (User Review Items)

The following items are functional and were intentionally left in their active locations to ensure 100% stability, but are flagged for your review:

1. **Dataset Folder Leading Space (`" Iryotek Dataset"`)**:
   - **Status**: Left in place.
   - **Context**: The directory has a leading whitespace in the filesystem name. `.gitignore` currently references ` Iryotek Dataset/medicines.csv`. Renaming to `dataset/` or `data/` is recommended if no external local scripts rely on the path.
2. **`com.hms.user.servlet.MyNewServlet.java`**:
   - **Status**: Left in place.
   - **Context**: Declared in `Iryotek/src/main/webapp/WEB-INF/web.xml`. Currently acts as a skeleton servlet without business logic. Can be safely removed if not planned for future features.
3. **`com.hms.entity.DoctorHospitalDTO.java`**:
   - **Status**: Left in place.
   - **Context**: A DTO class located inside the `com.hms.entity` package instead of a dedicated `com.hms.dto` package. Left in place to prevent breaking any reflection or serialization.
4. **`og-website/` directory**:
   - **Status**: Left in place.
   - **Context**: Legacy static website export. Could be moved to `legacy/` or `docs/marketing/` if no longer used for live deployments.
