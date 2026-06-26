Iryotek – Smart Doctor-Patient Portal

Iryotek is a modern Java-based healthcare management system designed to simplify hospital operations through intelligent appointment scheduling, automated queue management, and secure role-based access. The platform provides dedicated portals for Patients, Doctors, and Administrators, enabling efficient communication, appointment management, and hospital administration.

⸻

✨ Features

* Smart Appointment Scheduling
    * Book appointments with doctors based on hospital and specialty.
    * Automatic appointment confirmation with queue token generation.
* Intelligent Queue Management
    * Collision-free queue allocation using synchronized booking.
    * Automatic 15-minute time-slot assignment starting from 09:00 AM.
* Secure Multi-Role Access
    * Separate dashboards for Patients, Doctors, and Administrators.
    * Secure authentication and profile management.
* Doctor Workspace
    * View daily appointments.
    * Add consultation remarks and prescriptions.
    * Update appointment status.
* Hospital Administration
    * Manage hospitals, doctors, specialties, and patient records.
    * Monitor appointments through a centralized dashboard.

⸻

🛠 Technology Stack

Category	Technologies
Backend	Java, Servlets, JSP, JSTL, JDBC
Frontend	HTML5, CSS3, Bootstrap 5, JavaScript
Database	MySQL
Build Tool	Maven
Server	Apache Tomcat 9

⸻

📂 Project Structure

src/
 ├── main/
 │   ├── java/
 │   └── webapp/
 ├── pom.xml
 └── target/

⸻

🚀 Getting Started

Prerequisites

* Java JDK 8+
* Apache Maven
* MySQL
* Apache Tomcat 9

Database Setup

CREATE DATABASE hospital;

Import the database:

mysql -u root -p hospital < seed_data.sql

Build the Project

mvn clean package

Deploy

Copy the generated WAR file to Tomcat’s webapps directory:

cp target/Iryotek.war /path/to/tomcat/webapps/

Start Tomcat and open:

http://localhost:8080/Iryotek/

⸻

📌 Core Modules

* Patient Portal
* Doctor Portal
* Administrator Dashboard
* Hospital Management
* Appointment Management
* Queue Management
* Authentication & Authorization

⸻

🎯 Highlights

* Intelligent queue token generation
* Automatic time-slot allocation
* Role-based authentication
* Responsive Bootstrap UI
* Hospital and specialist management
* Appointment history tracking
* Prescription and consultation records

⸻

👨‍💻 Developer

Chinmay Prakash Rout

Built as a full-stack Java web application to demonstrate practical implementation of healthcare workflow automation using Java Servlets, JSP, JDBC, MySQL, and Apache Tomcat.
