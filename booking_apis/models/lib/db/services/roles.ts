import pool from "../index";

export type Role = {
  role_name: string;
  permissions: string[];
};

export const CreateRole = async(role: Role) => {
  const result = await pool.query<Role>(
    "INSERT INTO roles (role_name , permissions) values ($1 , $2) RETURNING *",
    [role.role_name, role.permissions]
  );
  return result.rows
};

export const DeleteRole = async(id : number) => {
  const result = await pool.query<Role>(
    "DELETE FROM roles WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows
};