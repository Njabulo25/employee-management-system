#!/bin/bash
./mvnw clean package -DskipTests
java -jar target/management-0.0.1-SNAPSHOT.jar