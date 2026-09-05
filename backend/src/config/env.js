import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  HOST: process.env.HOST,
  USER: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  DATABASE: process.env.DATABASE,
  NODE_ENV: process.env.NODE_ENV,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
};
