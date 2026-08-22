import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const genToken = (res, id) => {
  const token = jwt.sign({ id }, ENV.JWT_SECRET, { expiresIn: "7d" });

  const isDev = ENV.NODE_ENV === "development";

  res.cookie("token", token, {
    httpOnly: true,
    secure: !isDev,
    sameSite: isDev ? "lax" : "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};
