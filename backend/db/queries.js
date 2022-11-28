import { client } from "./db.js";
import * as logs from "logger";
let sysLogger = logs.createLogger("./Bhamlo.log");

export async function createUser(user) {
  try {
    await client.query(
      `
        INSERT INTO USERS (id, name, email, password, age, role) VALUES ($1, $2 , $3, $4, $5, $6);`,
      [user.id, user.name, user.email, user.password, user.age, user.role]
    );
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
  }
}
export async function updateUser(user) {
  try {
    await client.query(
      `UPDATE users
    SET 
    name = $1, 
    age= $2,
    height= $3,
    weight = $4, 
    address= $5,
    allergies = $6 
    WHERE id = $7;`,
      [
        user.name,
        user.age,
        user.height,
        user.weight,
        user.address,
        user.allergies,
        user.id,
      ]
    );
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
  }
}
export async function getUserbyEmail(email) {
  try {
    const result = await client.query(`SELECT * FROM USERS WHERE email = $1;`, [
      email,
    ]);
    return result.rows[0];
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function getUserbyId(id) {
  try {
    const result = await client.query(`SELECT * FROM USERS WHERE id = $1;`, [
      id,
    ]);
    return result.rows[0];
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}

export async function createOrg(user) {
  try {
    await client.query(
      `
        INSERT INTO Orgs VALUES ($1, $2 , $3, $4, $5, $6, $7, $8);`,
      [
        user.id,
        user.name,
        user.domain,
        user.role,
        user.password,
        user.description,
        user.location,
        user.contactDetail,
      ]
    );
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
  }
}

export async function getOrgbyDomain(domain) {
  try {
    const result = await client.query(`SELECT * FROM ORGS WHERE domain = $1;`, [
      domain,
    ]);
    return result.rows[0];
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}

export async function getOrgs() {
  try {
    const result = await client.query(`SELECT * FROM ORGS`);
    return result.rows;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}

export async function getUsersByRole(role) {
  try {
    const result = await client.query(`SELECT * FROM USERS WHERE ROLE = $1;`, [
      role,
    ]);
    return result.rows;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function getOrgsByRole(role) {
  try {
    const result = await client.query(`SELECT * FROM ORGS WHERE ROLE = $1;`, [
      role,
    ]);
    return result.rows;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function getApplications(type) {
  if (type == "user") {
    try {
      const result = await client.query(
        `SELECT * FROM USERS WHERE status = 'pending';`
      );
      return result.rows;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  } else if (type == "org") {
    try {
      const result = await client.query(
        `SELECT * FROM ORGS WHERE status = 'pending';`
      );
      return result.rows;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
}
export async function approveApplication(id, type) {
  if (type == "user") {
    try {
      const result = await client.query(
        `UPDATE USERS SET status = 'approved' WHERE id = $1;`,
        [id]
      );
      return;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  } else if (type == "org") {
    try {
      const result = await client.query(
        `UPDATE ORGS SET status = 'approved' WHERE id = $1;`,
        [id]
      );
      return;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
}
export async function insertFile(type, id, filename, hash) {
  if (type == "user") {
    try {
      const result = await client.query(
        `INSERT INTO USER_FILES VALUES ($1,$2,$3)
        ON CONFLICT (hash)
        DO 
          UPDATE SET hash = $3;`,
        [id, filename, hash]
      );
      return result.rows;
    } catch (err) {
      console.log(err, "insertFile");
      sysLogger.error(err);
      return null;
    }
  }
  if (type == "org") {
    try {
      const result = await client.query(
        `INSERT INTO ORG_FILES VALUES ($1,$2);`,
        [id, filename]
      );
      return result.rows;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
}
export async function updatePassphrase(pass, type, id) {
  if (type == "user") {
    try {
      const result = await client.query(
        `UPDATE USERS SET PASS = $1 WHERE id = $2;`,
        [pass, id]
      );
      return result.rows;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
  if (type == "org") {
    try {
      const result = await client.query(
        `UPDATE ORGS SET PASS = $1 WHERE id = $2;`,
        [pass, id]
      );
      return result.rows;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
}
export async function getPassphrase(type, id) {
  if (type == "user") {
    try {
      const result = await client.query(
        `SELECT PASS FROM USERS WHERE id = $1;`,
        [id]
      );
      return result.rows[0];
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
  if (type == "org") {
    try {
      const result = await client.query(
        `SELECT PASS FROM ORGS WHERE id = $1;`,
        [id]
      );
      return result.rows[0];
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
}
export async function shareFile(Stype, Rtype, sid, rid, filename, hash) {
  if (Stype == "user" && Rtype == "user") {
    try {
      const result = await client.query(
        `INSERT INTO USER_SHARE_USER VALUES ($1,$2,$3, $4) 
        ON CONFLICT (sid,rid,filename,hash)
        DO 
          UPDATE SET sid = $1, rid = $2, filename = $3, hash = $4;`,
        [sid, rid, filename, hash]
      );
      return result;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
  if (Stype == "user" && Rtype == "org") {
    try {
      const result = await client.query(
        `INSERT INTO USER_SHARE_ORG VALUES ($1,$2,$3, $4) 
        ON CONFLICT (sid,rid,filename,hash)
        DO 
          UPDATE SET sid = $1, rid = $2, filename = $3, hash = $4;`,
        [sid, rid, filename, hash]
      );
      return result;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
  if (Rtype == "user" && Stype == "org") {
    try {
      const result = await client.query(
        `INSERT INTO ORG_SHARE_USER VALUES ($1,$2,$3, $4) 
        ON CONFLICT (sid,rid,filename,hash)
        DO 
          UPDATE SET sid = $1, rid = $2, filename = $3, hash = $4;`,
        [sid, rid, filename, hash]
      );
      return result;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
}
export async function getFiles(rid) {
  try {
    const result1 = await client.query(
      `SELECT sid, filename FROM user_share_user where rid = $1`,
      [rid]
    );
    const result2 = await client.query(
      `SELECT sid, filename FROM user_share_org where rid = $1`,
      [rid]
    );
    const result3 = await client.query(
      `SELECT sid, filename FROM org_share_user where rid = $1`,
      [rid]
    );
    const result = [...result1.rows, ...result2.rows, ...result3.rows];
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function getMyfiles(type, id) {
  if (type == "user")
    try {
      const result = await client.query(
        `SELECT filename FROM user_files where id = $1`,
        [id]
      );
      console.log(result.rows);
      return result.rows;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
}
export async function deleteMyFile(type, name) {
  if (type == "user")
    try {
      const result = await client.query(
        `DELETE FROM USER_FILES WHERE filename = $1;`,
        [name]
      );

      return { status: "done" };
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return { status: "failed" };
    }
}

export async function getUsers() {
  try {
    const result = await client.query(`SELECT id, name, email FROM USERS;`);
    return result.rows;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return { status: "failed" };
  }
}
export async function getOgs() {
  try {
    const result = await client.query(`SELECT id, name, domain FROM ORGS;`);
    return result.rows;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return { status: "failed" };
  }
}

export async function deleteEntity(type, id) {
  if (type == "user") {
    try {
      const result = await client.query(
        `DELETE FROM USERS WHERE id = $1 AND role != 'admin';`,
        [id]
      );
      return result;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
  if (type == "org") {
    try {
      const result = await client.query(`DELETE FROM ORGS WHERE id= $1;`, [id]);
      return result;
    } catch (err) {
      console.log(err);
      sysLogger.error(err);
      return null;
    }
  }
}
export async function getDrugs() {
  try {
    const result = await client.query(`SELECT * FROM DRUGS;`);
    return result.rows;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
  }
}
export async function insertDrug(name, price, vid) {
  try {
    const id = Date.now();
    const result = await client.query(
      `INSERT INTO DRUGS VALUES ($1, $2, $3, $4);`,
      [id, name, price, vid]
    );
    return;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
  }
}
export async function getTransaction(id, role) {
  try {
    if (role == "pharmacy") {
      let data = await client.query(
        `SELECT time as transaction_id, uid, vid, did, price, status FROM TRANSACTIONS_DRUG WHERE vid = $1 and status = $2;`,
        [id, "pending"]
      );

      return data.rows;
    } else {
      let data = await client.query(
        `SELECT time as transaction_id, uid, vid, did, price, status FROM TRANSACTIONS_DRUG WHERE uid = $1 ORDER BY status;`,
        [id]
      );
      return data.rows;
    }
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function storeTransaction(uid, did, vid, wallet) {
  try {
    let data = await client.query(`SELECT * FROM DRUGS WHERE id = $1;`, [did]);
    let cost = data.rows[0].price;
    const updatedWallet = wallet - cost;

    if (updatedWallet < 0) return { status: "Low balance" };
    const time = Date.now();
    const result = await client.query(
      `INSERT INTO TRANSACTIONS_DRUG VALUES($1, $2, $3, $4, $5, $6)`,
      [uid, vid, did, time, cost, "pending"]
    );
    return;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}

export async function buyDrug(time) {
  try {
    let data = await client.query(
      `SELECT * FROM TRANSACTIONS_DRUG WHERE time = $1 AND status = 'pending';`,
      [time]
    );
    if (data.rows.length == 0) {
      return { status: "Not a valid transaction" };
    }
    let userData = await client.query(`SELECT * FROM users WHERE id = $1;`, [
      data.rows[0].uid,
    ]);
    let cost = data.rows[0].price;
    let wallet = userData.rows[0].wallet;
    const updatedWallet = wallet - cost;

    if (updatedWallet < 0) {
      await client.query(
        `UPDATE TRANSACTIONS_DRUG SET STATUS = $1 WHERE time = $2`,
        ["failed", time]
      );
      return { status: "Failed due to Low funds in USERS WALLET" };
    } else {
      await client.query(
        `UPDATE TRANSACTIONS_DRUG SET STATUS = $1 WHERE time = $2`,
        ["approved", time]
      );
    }
    const walletData = await client.query(
      `UPDATE USERS SET WALLET = $1 WHERE id = $2`,
      [updatedWallet, data.rows[0].uid]
    );
    let orgwallet = await client.query(
      `SELECT WALLET FROM ORGS WHERE id = $1`,
      [data.rows[0].vid]
    );
    orgwallet = orgwallet.rows[0].wallet + cost;
    const orgupdate = await client.query(
      `UPDATE ORGS SET WALLET = $1 WHERE id = $2`,
      [orgwallet, data.rows[0].vid]
    );

    // const date = Date.now();
    // const vid = data.rows[0].vid;
    // const claim = await client.query(
    //   `INSERT INTO CLAIMS ( bid, mid, time, vid, amount ) VALUES ($1, $2, $3, $4, $5);`[
    //     (uid, did, date, vid, cost)
    //   ]
    // );
    return {
      status:
        "Successful Transaction! please login again to see your updated wallet :)",
    };
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function raiseClaim(tid, vid) {
  try {
    let tdata = await client.query(
      `SELECT * FROM TRANSACTIONS_DRUG WHERE time = $1;`,
      [tid]
    );
    console.log(tdata);
    console.log(tid);
    if (tdata.rows.length == 0 || tdata.rows[0].status == "pending") {
      return { message: "OOPS seems like the transaction is still pending!" };
    }
    tdata = tdata.rows[0];
    // uid BIGINT NOT NULL,
    //   did BIGINT NOT NULL,
    //   id BIGINT PRIMARY KEY NOT NULL,
    //   tid BIGINT NOT NULL,
    //   vid BIGINT NOT NULL,
    //   amount int not null,
    //   status status NOT NULL DEFAULT 'pending',
    const data = await client.query(
      `INSERT INTO CLAIMS VALUES ($1, $2, $3, $4, $5, $6, $7); `,
      [tdata.uid, tdata.did, Date.now(), tid, vid, tdata.price, "pending"]
    );

    return data.rows;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function showClaims(id, role) {
  try {
    if (role == "patient") {
      const data = await client.query(
        `SELECT * FROM CLAIMS WHERE uid = $1 and status = 'pending';`,
        [id]
      );
      return data.rows;
    } else {
      const data = await client.query(
        `SELECT * FROM CLAIMS WHERE vid = $1 and status = 'pending';`,
        [id]
      );
      return data.rows;
    }
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function refundAmount(id) {
  try {
    const data = await client.query(`SELECT * FROM CLAIMS WHERE id = $1;`, [
      id,
    ]);

    const cost = data.rows[0].amount;

    const wallet = await client.query(`SELECT * FROM USERS WHERE id = $1;`, [
      data.rows[0].uid,
    ]);
    const walletOrg = await client.query(`SELECT * FROM ORGS WHERE id = $1;`, [
      data.rows[0].vid,
    ]);
    const updatedOrgWallet = walletOrg.rows[0].wallet - cost;
    const updatedUserWallet = wallet.rows[0].wallet + cost;
    if (updatedOrgWallet < 0) {
      return { msg: "Low Funds cannot refund claim!" };
    }
    const updateUser = await client.query(
      `UPDATE USERS SET WALLET = $1 WHERE id = $2;`,
      [updatedUserWallet, data.rows[0].uid]
    );
    const updateOrg = await client.query(
      `UPDATE ORGS SET WALLET = $1 WHERE id = $2;`,
      [updatedOrgWallet, data.rows[0].vid]
    );
    const updatedClaim = await client.query(
      `UPDATE CLAIMS SET status = 'approved' WHERE id = $1;`,
      [id]
    );

    return {msg: "Successfully refund the claim! Log in again to view Updated Wallet :)"};
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function insertPOI(id, filename, type) {
  try {
    await client.query(`INSERT INTO POI VALUES ($1, $2, $3)`, [
      id,
      filename,
      type,
    ]);
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
  }
}
export async function getPOI(id) {
  try {
    const res = await client.query(`SELECT filename from POI WHERE id = $1`, [
      id,
    ]);
    return res.rows;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
  }
}
export async function verifyHash(hash) {
  try {
    const result = await client.query(`select hash from hash where hash = $1`, [
      hash,
    ]);
    return result.rows.length > 0;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function insertHash(hash) {
  try {
    const result = await client.query(`INSERT INTO HASH VALUES ($1)`, [hash]);
    return;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function getFileNameFromHash(hash) {
  try {
    const result = await client.query(
      `SELECT filename FROM user_files WHERE hash = $1`,
      [hash]
    );
    return result.rows[0].filename;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function updateFileName(oldName, newName) {
  try {
    const result = await client.query(
      `UPDATE USER_FILES SET FILENAME = $2 WHERE FILENAME=$1;`,
      [oldName, newName]
    );
    return;
  } catch (err) {
    console.log(err);
    sysLogger.error(err);
    return null;
  }
}
export async function insertOTP(otp, time, email) {
  try {
    const result = await client.query(`INSERT INTO OTP VALUES($1, $2, $3);`, [
      otp,
      time,
      email,
    ]);
    return;
  } catch (err) {
    console.log(err, "insertOTP");
    sysLogger.error(err, "insertOTP");
    return null;
  }
}

export async function getOTPTime(otp, email) {
  try {
    const result = await client.query(
      `SELECT starttime from OTP WHERE OTP = $1 AND EMAIL =$2
      ORDER BY starttime DESC LIMIT 1;`,
      [otp, email]
    );
    console.log(result.rows, "Not found");
    return result.rows[0].starttime;
  } catch (err) {
    console.log(err, "insertOTP");
    sysLogger.error(err, "insertOTP");
    return null;
  }
}
