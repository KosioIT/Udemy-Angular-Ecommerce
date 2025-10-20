# ===========================
# stage 1: build with Maven
# ===========================
FROM maven:3.8.7-eclipse-temurin-17 AS build
WORKDIR /app

# копирай pom и .mvn за кеширане на зависимости
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN mvn -B -q dependency:go-offline

# копирай изходния код
COPY src src

# билдни проекта (без тестове)
RUN mvn -B -DskipTests package

# ===========================
# stage 2: runtime
# ===========================
FROM eclipse-temurin:17-jre
WORKDIR /app

# копирай готовия jar
COPY --from=build /app/target/*.jar app.jar

# задаване на порт (Spring Boot по подразбиране 8080)
EXPOSE 8080

# ENTRYPOINT с декодиране на base64 keystore
ENTRYPOINT ["/bin/sh", "-c", "\
  echo $SSL_KEY_STORE_B64 | base64 -d > /tmp/luv2code-keystore.p12 && \
  java -Dserver.ssl.key-store=/tmp/luv2code-keystore.p12 \
       -Dserver.ssl.key-store-password=$SSL_KEY_STORE_PASSWORD \
       -Dserver.ssl.key-password=$SSL_KEY_PASSWORD \
       -Dserver.ssl.key-store-type=$SSL_KEY_STORE_TYPE \
       -Dserver.ssl.key-alias=$SSL_ALIAS \
       -jar /app/app.jar \
"]
