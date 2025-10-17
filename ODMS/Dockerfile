# Build stage: valid image
FROM maven:3.9.3-eclipse-temurin-20 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:24-jdk-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar ./app.jar
COPY src/main/resources/certs ./certs

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]