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
      allergies text DEFAULT '',
      pass varchar(100)
       
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
  try {
    await client.query(`
    DO $$ BEGIN
      CREATE TYPE  USER_ROLE AS ENUM('admin', 'patient', 'professional');
      CREATE TYPE  ORG_ROLE AS ENUM('hospital', 'pharmacy', 'insurance');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    ALTER TABLE USERS
    ALTER COLUMN ROLE TYPE USER_ROLE USING (ROLE::USER_ROLE);
    ALTER TABLE ORGS
    ALTER COLUMN ROLE TYPE ORG_ROLE USING (ROLE::ORG_ROLE);`);
  } catch (error) {
    console.log(error);
  }
  try {
    await client.query(`
    DO $$ BEGIN
      CREATE TYPE  STATUS AS ENUM('pending', 'approved');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    ALTER TABLE USERS
    ADD IF NOT EXISTS status STATUS DEFAULT 'pending';`);
  } catch (error) {
    console.log(error);
  }
  try {
    await client.query(`
    ALTER TABLE ORGS
    ADD IF NOT EXISTS status STATUS DEFAULT 'pending' ;`);
  } catch (error) {
    console.log(error);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS USER_FILES (
      id BIGINT NOT NULL,
      filename varchar(50) NOT NULL,
      PRIMARY KEY(id, filename),
      CONSTRAINT fk_user_file_id
          FOREIGN KEY(id) 
        REFERENCES users(id)
        ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS ORG_FILES (
      id BIGINT NOT NULL,
      filename varchar(50) NOT NULL,
      PRIMARY KEY(id, filename),
      CONSTRAINT fk_org_file_id
          FOREIGN KEY(id) 
        REFERENCES orgs(id)
        ON DELETE CASCADE
    );
    `);
  } catch (error) {
    console.log(error);
  }
  //END
}
