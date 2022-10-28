import { client } from "./db.js";

export async function createDB() {
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS Users (
        id bigint PRIMARY KEY,
        email varchar(100) UNIQUE NOT NULL,
        password varchar(100) UNIQUE NOT NULL,
        name varchar(100) NOT NULL,
        age int NOT NULL,
        role varchar(100) NOT NULL
         
      )
        `);
  } catch (error) {
    console.log(error);
  }
}
