import mysql from "mysql2/promise";
import { ENV } from "./env.js";

const { HOST, USER , PASSWORD, DATABASE } = ENV;

if(!HOST || !USER || !PASSWORD || !DATABASE){
  throw Error("Missing connection keys")
}

const pool = mysql.createPool({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
});

export default pool;
