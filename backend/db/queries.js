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
