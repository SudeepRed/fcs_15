import { client } from "./db.js";

export async function createUser(user, role) {
  try {
    await client.query(
      `
        INSERT INTO USERS (id, name, email, password, age, role) VALUES ($1, $2 , $3, $4, $5, $6);`,
      [user.id, user.name, user.email, user.password, user.age, role]
    );
  } catch (e) {
    console.log(e);
  }
}
export async function getUserbyEmail(email) {
  try {
    const result =  await client.query(`SELECT * FROM USERS WHERE email = $1;`, [email]);
    return result.rows[0];
  } catch (e) {
    console.log(e);
  }
}
export async function getUserbyId(id) {
  try {
    const result = await client.query(`SELECT * FROM USERS WHERE id = $1;`, [id]);
    return result.rows[0];
  } catch (e) {
    console.log(e);
  }
}
