# Stage 1: Build the Maven application
FROM maven:3.8.8-eclipse-temurin-11 AS build
WORKDIR /app
COPY Iryotek/pom.xml ./Iryotek/
COPY Iryotek/src ./Iryotek/src/
RUN mvn -f Iryotek/pom.xml clean package

# Stage 2: Run inside a Tomcat 9 lightweight container
FROM tomcat:9.0-jre11-slim
WORKDIR /usr/local/tomcat

# Remove default ROOT application to deploy our app at the root URL path
RUN rm -rf webapps/ROOT

# Copy the built WAR to Tomcat's webapps as ROOT.war
COPY --from=build /app/Iryotek/target/Iryotek.war webapps/ROOT.war

EXPOSE 8080
CMD ["catalina.sh", "run"]
