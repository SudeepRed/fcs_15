import { client } from "./db.js";

export async function createUser(user) {
  try {
    await client.query(
      `
        INSERT INTO USERS (id, name, email, password, age, role) VALUES ($1, $2 , $3, $4, $5, $6);`,
      [user.id, user.name, user.email, user.password, user.age, user.role]
    );
  } catch (e) {
    console.log(e);
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
  }
}
export async function getUserbyEmail(email) {
  try {
    const result = await client.query(`SELECT * FROM USERS WHERE email = $1;`, [
      email,
    ]);
    return result.rows[0];
  } catch (e) {
    console.log(e);
    return null;
  }
}
export async function getUserbyId(id) {
  try {
    const result = await client.query(`SELECT * FROM USERS WHERE id = $1;`, [
      id,
    ]);
    return result.rows[0];
  } catch (e) {
    console.log(e);
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
        user.contactDetails,
      ]
    );
  } catch (e) {
    console.log(e);
  }
}

export async function getOrgbyDomain(domain) {
  try {
    const result = await client.query(`SELECT * FROM ORGS WHERE domain = $1;`, [
      domain,
    ]);
    return result.rows[0];
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function getOrgs() {
  try {
    const result = await client.query(`SELECT * FROM ORGS`);
    return result.rows;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function getUsersByRole(role) {
  try {
    const result = await client.query(`SELECT * FROM USERS WHERE ROLE = $1;`, [
      role,
    ]);
    return result.rows;
  } catch (e) {
    console.log(e);
    return null;
  }
}
export async function getOrgsByRole(role) {
  try {
    const result = await client.query(`SELECT * FROM ORGS WHERE ROLE = $1;`, [
      role,
    ]);
    return result.rows;
  } catch (e) {
    console.log(e);
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
    } catch (e) {
      console.log(e);
      return null;
    }
  } else if (type == "org") {
    try {
      const result = await client.query(
        `SELECT * FROM ORGS WHERE status = 'pending';`
      );
      return result.rows;
    } catch (e) {
      console.log(e);
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
    } catch (e) {
      console.log(e);
      return null;
    }
  } else if (type == "org") {
    try {
      const result = await client.query(
        `UPDATE ORGS SET status = 'approved' WHERE id = $1;`,
        [id]
      );
      return;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
export async function insertFile(type, id, filename, hash) {
  if (type == "user") {
    try {
      const result = await client.query(
        `INSERT INTO USER_FILES VALUES ($1,$2,$3) ON CONFLICT DO NOTHING; `,
        [id, filename, hash]
      );
      return result.rows;
    } catch (e) {
      console.log(e);
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
    } catch (e) {
      console.log(e);
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
    } catch (e) {
      console.log(e);
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
    } catch (e) {
      console.log(e);
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
    } catch (e) {
      console.log(e);
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
    } catch (e) {
      console.log(e);
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
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
export async function getFiles(rid) {
  try {
    const result = await client.query(
      `SELECT sid, filename FROM user_share_user where rid = $1`,
      [rid]
    );
    return result.rows;
  } catch (e) {
    console.log(e);
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
      return result.rows;
    } catch (e) {
      console.log(e);
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
    } catch (e) {
      console.log(e);
      return { status: "failed" };
    }
}

export async function getUsers() {
  try {
    const result = await client.query(`SELECT id, name, email FROM USERS;`);
    return result.rows;
  } catch (e) {
    console.log(e);
    return { status: "failed" };
  }
}
export async function getOgs() {
  try {
    const result = await client.query(`SELECT id, name, domain FROM ORGS;`);
    return result.rows;
  } catch (e) {
    console.log(e);
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
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  if (type == "org") {
    try {
      const result = await client.query(`DELETE FROM ORGS WHERE id= $1;`, [id]);
      return result;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
export async function getDrugs() {
  try {
    const result = await client.query(`SELECT * FROM DRUGS;`);
    return result.rows;
  } catch (e) {
    console.log(e);
  }
}
export async function buyDrug(did, uid, wallet) {
  try {
    let data = await client.query(`SELECT * FROM DRUGS WHERE id = $1;`, [did]);
    let cost = data.rows[0].price;
    const updatedWallet = wallet - cost;

    if (updatedWallet < 0) return { status: "Low balance" };
    const walletData = await client.query(
      `UPDATE USERS SET WALLET = $1 WHERE id = $2`,
      [updatedWallet, uid]
    );

    const date = Date.now();
    const vid = data.rows[0].vid;
    const claim = await client.query(
      `INSERT INTO CLAIMS ( bid, mid, time, vid, amount ) VALUES ($1, $2, $3, $4, $5);`[
        (uid, did, date, vid, cost)
      ]
    );
    return { status: "Successful" };
  } catch (e) {
    console.log(e);
  }
}
export async function showClaims(vid) {
  try {
    const data = await client.query(`SELECT * FROM CLAIMS WHERE vid = $1 and status = 'pending';`, [
      vid,
    ]);

    return data.rows;
  } catch (e) {
    console.log(e);
  }
}
export async function refundAmount(time) {
  try {
    const data = await client.query(`SELECT * FROM CLAIMS WHERE time = $1;`, [
      time,
    ]);

    const cost = data.rows[0].amount;

    const wallet = await client.query(`SELECT * FROM USERS WHERE id = $1;`, [ data.rows[0].bid]);

    const updatedWallet = wallet.rows[0].wallet+cost;

    const updateUser = await client.query(`UPDATE USERS SET WALLET = $1 WHERE id = $2;`, [ updatedWallet, data.rows[0].bid]);
    const updatedClaim = await client.query(`UPDATE CLAIMS SET status = 'approved' WHERE time = $1;`, [time]);

    return data.rows;
  } catch (e) {
    console.log(e);
  }
}
export async function insertPOI(id, filename, type) {
  try {
    await client.query(`INSERT INTO POI VALUES ($1, $2, $3)`,[id, filename, type]);
  } catch (e) {
    console.log(e);
  }
}
export async function getPOI(id) {
  try {
    const res = await client.query(`SELECT filename from POI WHERE id = $1`,[id]);
    return res.rows;
  } catch (e) {
    console.log(e);
  }
}
export async function verifyHash(hash) {
  try {
    const result = await client.query(
      `select hash from user_files where hash = $1`,
      [hash]
    );
    console.log(result);
    return result.rows.length > 0;
  } catch (e) {
    console.log(e);
    return null;
  }
}

