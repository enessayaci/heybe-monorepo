import { pool } from "../database/db";
import { v4 as uuidv4 } from "uuid";

export interface User {
  id: number;
  email: string;
  password: string;
  is_guest: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  is_guest?: boolean;
}

export const createUser = async (userData: CreateUserData): Promise<User> => {
  const { email, password, is_guest = false } = userData;

  const query = `
    INSERT INTO users (email, password, is_guest, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *
  `;

  const result = await pool.query(query, [email, password, is_guest]);
  return result.rows[0];
};

export const createGuestUser = async (): Promise<User> => {
  const guestId = `guest_${uuidv4()}`;
  const guestEmail = `${guestId}@guest.heybe.app`;
  const guestPassword = "guest-password"; // Misafir kullanıcılar için dummy password

  const query = `
    INSERT INTO users (email, password, is_guest, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING *
  `;

  const result = await pool.query(query, [guestEmail, guestPassword, true]);
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);

  return result.rows[0] || null;
};

export const findUserById = async (id: number): Promise<User | null> => {
  const query = "SELECT * FROM users WHERE id = $1";
  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
};

export const deleteUserById = async (id: number): Promise<boolean> => {
  const query = "DELETE FROM users WHERE id = $1 AND is_guest = true";
  const result = await pool.query(query, [id]);

  return result.rowCount ? result.rowCount > 0 : false;
};
