FROM openjdk:17-jdk-slim
WORKDIR /app
COPY . .
RUN chmod +x mvnw && ./mvnw clean package -DskipTests
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "target/management-0.0.1-SNAPSHOT.jar"]