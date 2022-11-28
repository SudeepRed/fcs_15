import { client } from "./db.js";
import * as logs from "logger";
let logger = logs.createLogger("./Bhamlo.log");

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
      pass varchar(100),
      wallet int DEFAULT 100
       
    );

        `);
  } catch (err) {
    console.log(err);
    logger.error(err);
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
      contactDetails text DEFAULT '',
      pass varchar(100)
    );
    ALTER TABLE ORGS
    ADD IF NOT EXISTS WALLET INT DEFAULT 100;`);
  } catch (err) {
    console.log(err);
    logger.error(err);
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
  } catch (err) {
    console.log(err);
    logger.error(err);
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
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
  try {
    await client.query(`
    ALTER TABLE ORGS
    ADD IF NOT EXISTS status STATUS DEFAULT 'pending' ;`);
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS HASH (
      hash varchar(512),
      PRIMARY KEY (HASH)
      );

    `);
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS USER_FILES (
      id BIGINT NOT NULL,
      filename varchar(50) NOT NULL,
      hash varchar(512)  NOT NULL,
      PRIMARY KEY(id, filename, hash),
      CONSTRAINT fk_user_file_id
          FOREIGN KEY(id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_file_hash
        FOREIGN KEY(hash) 
      REFERENCES hash(hash)
      ON DELETE CASCADE    
    );
    CREATE TABLE IF NOT EXISTS ORG_FILES (
      id BIGINT NOT NULL,
      filename varchar(50) NOT NULL,
      hash varchar(512) UNIQUE NOT NULL,
      PRIMARY KEY(id, filename, hash),
      CONSTRAINT fk_org_file_id
          FOREIGN KEY(id) 
        REFERENCES orgs(id)
        ON DELETE CASCADE
    );
    `);
  } catch (err) {
    console.log(err, "user_files");
    logger.error(err);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS user_share_user(
      sid bigint not null,
      rid bigint not null,
      filename varchar(50) not null,
      hash varchar(512) not null,
      PRIMARY KEY(sid, rid, filename, hash),
      CONSTRAINT fk_sid_user
          FOREIGN KEY(sid) 
        REFERENCES users(id),
      CONSTRAINT fk_rid_user
          FOREIGN KEY(rid) 
        REFERENCES users(id)
      
    )
    `);
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS org_share_user(
      sid bigint not null,
      rid bigint not null,
      filename varchar(50) not null,
      hash varchar(512) not null,
      PRIMARY KEY(sid, rid, filename, hash),
      CONSTRAINT fk_sid_org
          FOREIGN KEY(sid) 
        REFERENCES orgs(id),
      CONSTRAINT fk_rid_user
          FOREIGN KEY(rid) 
        REFERENCES users(id)
      
    )
    `);
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS user_share_org(
      sid bigint not null,
      rid bigint not null,
      filename varchar(50) not null,
      hash varchar(512) not null,
      PRIMARY KEY(sid, rid, filename, hash),
      CONSTRAINT fk_sid_user
          FOREIGN KEY(sid) 
        REFERENCES users(id),
      CONSTRAINT fk_rid_org
          FOREIGN KEY(rid) 
        REFERENCES orgs(id)
      
    )
    `);
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS drugs (
      id BIGINT PRIMARY KEY NOT NULL, 
      name text NOT NULL, 
      price int NOT NULL,
      vid bigint NOT NULL
    );
    `);
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS TRANSACTIONS_DRUG(
      uid bigint not null,
      vid bigint not null,
      did varchar(50) not null,
      time bigint UNIQUE not null,
      price int  not null,
      status varchar(50) NOT NULL DEFAULT 'pending',
      PRIMARY KEY(time)
      
      
    )
    `);
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS CLAIMS (
      uid BIGINT NOT NULL,
      did BIGINT NOT NULL, 
      id BIGINT PRIMARY KEY NOT NULL,
      tid BIGINT NOT NULL,
      vid BIGINT NOT NULL,
      amount int not null,
      status status NOT NULL DEFAULT 'pending',
      CONSTRAINT fk_bid_claim
              FOREIGN KEY(uid) 
            REFERENCES users(id),
          CONSTRAINT fk_mid_claim
              FOREIGN KEY(did) 
            REFERENCES drugs(id),
      CONSTRAINT fk_vid_claim
              FOREIGN KEY(vid) 
            REFERENCES orgs(id)
      
    );
    `);
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS POI (
      id bigint ,
      filename varchar(100) ,
      type varchar(50),
      PRIMARY KEY (id, filename, type)
      )

    `);
  } catch (err) {
    console.log(err);
    logger.error(err);
  }
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS OTP (
      otp varchar(10) NOT NULL,
      starttime bigint NOT NULL,
      email varchar(100) NOT NULL
      );
    `);
  } catch (err) {
    console.log(err);
    logger.error(err);
  }

  //END
}
