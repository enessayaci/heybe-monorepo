import { storage } from "wxt/storage";

export interface User {
  email: string;
  is_guest: boolean;
}

export interface StorageData {
  token: string | null;
  user: User | null;
}

// export class StorageService {
//   // Token operations
//   async setToken(token: string | null): Promise<void> {
//     try(){

//     }
//   }

//   async getToken(): Promise<string | null> {
//     return await storage.getItem("local:token");
//   }

//   async removeToken(): Promise<void> {
//     await storage.removeItem("local:token");
//   }

//   async getIsGuest(): Promise<boolean> {
//     const user: User | null = await storage.getItem("local:user");
//     return !!user && user.is_guest === true;
//   }

//   async getUser(): Promise<any | null> {
//     return await storage.getItem("local:user");
//   }

//   // Clear all data
//   async clearAll(): Promise<void> {
//     await storage.removeItem("local:token");
//     await storage.removeItem("local:user");
//   }

//   async getAllData(): Promise<StorageData> {
//     const [token, user] = await Promise.all([this.getToken(), this.getUser()]);

//     return {
//       token: token || null,
//       user: user || null,
//     };
//   }

//   async saveData(data: StorageData): Promise<void> {
//      await this.setToken(data.token);
//       await this.setUser(data.user);
//   }
// }

export async function getToken(): Promise<string | null> {
  try {
    const token = await storage.getItem<string>("local:token");
    console.log("token get: ", token);

    return token ?? null;
  } catch (err) {
    console.error("[API SERVICE] Getting token error:", err);
    return null;
  }
}

export async function setToken(newToken: string): Promise<boolean> {
  try {
    console.log("Setting token: ", newToken);

    await storage.setItem("local:token", newToken);
    return true;
  } catch (err) {
    console.error("[API SERVICE] Setting token error:", err);
    return false;
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const user = await storage.getItem<User>("local:user");
    return user ?? null;
  } catch (err) {
    console.error("[API SERVICE] Getting user error:", err);
    return null;
  }
}

export async function setUser(newUser: User): Promise<boolean> {
  try {
    await storage.setItem("local:user", newUser);
    return true;
  } catch (err) {
    console.error("[API SERVICE] Setting user error:", err);
    return false;
  }
}
