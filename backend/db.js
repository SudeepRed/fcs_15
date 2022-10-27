import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const credentials = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

async function connectionPool() {
  const pool = new pg.Pool(credentials);
  try {
    const now = await pool.query("SELECT NOW()");
    await pool.end();
    return now;
  } catch (e) {
    console.log(e);
  }
}
(async () => {
  try {
    const poolResult = await connectionPool();
    console.log("Time with pool: " + poolResult.rows[0]["now"]);
  } catch (e) {
    console.log(e);
  }
})();
