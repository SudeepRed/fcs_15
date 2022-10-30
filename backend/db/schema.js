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
      role varchar(100) NOT NULL,
      height int DEFAULT 0,
      weight int DEFAULT 0,
      address text DEFAULT '',
      allergies text DEFAULT ''
       
    );

        `);
  } catch (error) {
    console.log(error);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS orgs(
      id bigint PRIMARY KEY,
      name varchar(100) NOT NULL,
      domain varchar(100) UNIQUE NOT NULL,
      role varchar(100) NOT NULL,
      password varchar(100) UNIQUE NOT NULL,
      description text DEFAULT '',
      location text DEFAULT '',
      contactDetails text DEFAULT ''
    );`);
  } catch (error) {
    console.log(error);
  }
  //END
}
