import * as dotenv from "dotenv";

dotenv.config();

export default (): Record<string, any> => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    type: process.env.TYPEORM_CONNECTION,
    host: process.env.TYPEORM_HOST,
    read_port: parseInt(process.env.TYPEORM_READ_PORT, 10),
    port: parseInt(process.env.TYPEORM_PORT, 10) || 5432,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    synchronize: process.env.TYPEORM_SYNCHRONIZE === "true",
    logging: process.env.TYPEORM_LOGGING === "true",
    entities: [process.env.TYPEORM_ENTITIES],
    migrationsTableName: process.env.TYPEORM_MIGRATIONS_TABLE_NAME,
    migrations: [process.env.TYPEORM_MIGRATIONS],
    subscribers: [process.env.TYPEORM_SUBSCRIBERS],
    cli: {
      entitiesDir: process.env.TYPEORM_ENTITIES_DIR,
      migrationsDir: process.env.TYPEORM_MIGRATIONS_DIR,
    },
    schema: process.env.TYPEORM_SCHEMA,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
  encryption: {
    secret: process.env.ENCRYPTION_SECRET,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  onboarding: {
    jwtSecret: process.env.ONBOARDING_JWT_SECRET,
  },
  corsOrigin:
    process.env.CORS_ORIGIN ||
    `http://localhost:${parseInt(process.env.PORT, 10) || 3000}/*`,
  websocketPorts: {
    agentNotification:
      parseInt(process.env.AGENT_NOTIFICATION_PORT, 10) || 3001,
    customerNotification:
      parseInt(process.env.CUSTOMER_NOTIFICATION_PORT, 10) || 3002,
    chatSupport: parseInt(process.env.CHAT_SUPPORT_PORT, 10) || 3003,
    notification: parseInt(process.env.NOTIFICATION_PORT, 10) || 3004,
    firebaseNotification:
      parseInt(process.env.FIREBASE_NOTIFICATION_PORT, 10) || 3005, 
  },
  firebase: { 
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },
});
