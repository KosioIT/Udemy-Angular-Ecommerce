# ===========================
# stage 1: build with Maven (no mvnw/.mvn required)
# ===========================
FROM maven:3.8.8-eclipse-temurin-21-alpine AS build
WORKDIR /app

# copy pom first for better layer caching
COPY pom.xml .

# copy source
COPY src ./src

# build the project (skip tests for faster builds)
RUN mvn -B -DskipTests package

# ===========================
# stage 2: runtime
# ===========================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# expose port
EXPOSE 8080

# decode base64 keystore and start the app
ENTRYPOINT ["/bin/sh", "-c", "\
  if [ -n \"$SSL_KEY_STORE_B64\" ]; then \
    echo \"$SSL_KEY_STORE_B64\" | base64 -d > /tmp/luv2code-keystore.p12; \
    KEYSTORE_PATH=/tmp/luv2code-keystore.p12; \
  else \
    KEYSTORE_PATH=${SSL_KEY_STORE:-}; \
  fi && \
  java \
    ${KEYSTORE_PATH:+-Dserver.ssl.key-store=$KEYSTORE_PATH} \
    ${SSL_KEY_STORE_PASSWORD:+-Dserver.ssl.key-store-password=$SSL_KEY_STORE_PASSWORD} \
    ${SSL_KEY_PASSWORD:+-Dserver.ssl.key-password=$SSL_KEY_PASSWORD} \
    ${SSL_KEY_STORE_TYPE:+-Dserver.ssl.key-store-type=$SSL_KEY_STORE_TYPE} \
    ${SSL_ALIAS:+-Dserver.ssl.key-alias=$SSL_ALIAS} \
    -jar /app/app.jar \
"]
