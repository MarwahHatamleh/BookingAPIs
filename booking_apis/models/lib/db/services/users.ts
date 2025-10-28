import pool from "..";
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import redisClient from "@/models/lib/db/redis";

/*
CREATE TABLE users (
   id SERIAL PRIMARY KEY NOT NULL,
   username VARCHAR(225),
   age INTEGER,
   country VARCHAR(225),
   region_id CHAR(4) NOT NULL,
   phoneNumber INTEGER NOT NULL ,
   email VARCHAR(225) NOT NULL ,
   password VARCHAR(225) NOT NULL,
   role_id INTEGER,
   FOREIGN KEY (role_id) REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE (phoneNumber , email , id)
)
*/
export type RegisterUser = {
  id?: number;
  userName: string;
  age: number;
  country: string;
  region_id: string;
  phoneNumber: number;
  email: string;
  password: string;
  role_id: number;
};

const hashPassword = async (password: string) => {
  const result = await bcrypt.hash(password, 10);
  return result;
};

const comparePasswords = async (password: string, hashedPassword: string) => {
  const result = await bcrypt.compare(password, hashedPassword);
  return result;
};

export const Register = async (newUser: RegisterUser) => {
  const results = await pool.query<RegisterUser>(
    "INSERT INTO users (userName , age ,country , region_id ,phoneNumber , email , password , role_id) VALUES ($1 , $2 , $3 , $4 , $5 , $6  , $7, $8 ) RETURNING *",
    [
      newUser.userName.toLowerCase(),
      newUser.age,
      newUser.country,
      newUser.region_id.trim(),
      newUser.phoneNumber,
      newUser.email.toLowerCase().trim(),
      await hashPassword(newUser.password),
      newUser.role_id,
    ]
  );

  const user = results.rows[0];
  // const token = jwt.sign(
  //   {
  //     userId: user.id,
  //     email: user.email,
  //     role: user.role_id,
  //     permissions: user.permissions,
  //   },
  //   process.env.NEXTAUTH_SECRET as Secret,
  //   {
  //     expiresIn: "7d",
  //   }
  // );
  const token = await generateTokens(user);
  if (user) {
    await redisClient.set(
      `user:${user.id}`,
      JSON.stringify({
        id: user.id,
        userName: user.userName,
        email: user.email,
        role_id: user.role_id,
        country: user.country,
        region_id: user.region_id,
        age: user.age,
         token: token,
      })
    );

    return {
      id: user.id,
      userName: user.userName,
      age: user.age,
      country: user.country,
      region_id: user.region_id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: user.password,
      role_id: user.role_id,
      token: token,
    };
  }
};

export const Login = async (email: string, password: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase().trim(),
  ]);

  const user = result.rows[0];
  const hashedPassword = user.password;
  const isMatch = await comparePasswords(password, hashedPassword);
  if (!isMatch) {
    throw new Error("Please Check Password");
  } else {
    const token = await generateTokens(user);
    await redisClient.set(
      `token:${user.id}`,
      JSON.stringify({
        id: user.id,
        userName: user.userName,
        email: user.email,
        role_id: user.role_id,
        country: user.country,
        region_id: user.region_id,
        age: user.age,
        token: token,
      })
    );
    return {
      id: user.id,
      userName: user.userName,
      age: user.age,
      country: user.country,
      region_id: user.region_id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      password: user.password,
      role_id: user.role_id,
      token: token,
    };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateTokens = async (user: any) => {
  let returnValue;
  if (user !== null) {
    const id = user.role_id;
    const result = await pool.query(`SELECT * FROM roles WHERE id = ${id}`);
    const payload = {
      country: user.country,
      userID: user.id,
      role: {
        role: result.rows[0].role_id,
        permissions: result.rows[0].permissions,
      },
    };
    returnValue = jwt.sign(
      payload,
      process.env.JWT_SECRET as Secret,

      {
        expiresIn: "7d",
      }
    );
  } else {
    returnValue = "Sorry there is no any role for this user";
  }
  return returnValue;
};
