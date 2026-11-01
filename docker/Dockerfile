# Stage 1: Build the Maven application
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src/
RUN mvn -f backend/pom.xml clean package

# Stage 2: Run inside a Tomcat 9 lightweight container
FROM tomcat:9.0-jre17
WORKDIR /usr/local/tomcat

# Remove default ROOT application to deploy our app at the root URL path
RUN rm -rf webapps/ROOT

# Copy the built WAR to Tomcat's webapps as ROOT.war
COPY --from=build /app/backend/target/Iryotek.war webapps/ROOT.war

EXPOSE 8080
CMD ["catalina.sh", "run"]
