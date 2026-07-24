import { type User, type InsertUser, type Signup, type InsertSignup, type BusinessSignup, type InsertBusinessSignup } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSignup(signup: InsertSignup): Promise<Signup>;
  getSignups(): Promise<Signup[]>;
  createBusinessSignup(signup: InsertBusinessSignup): Promise<BusinessSignup>;
  getBusinessSignups(): Promise<BusinessSignup[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private signups: Map<string, Signup>;
  private businessSignups: Map<string, BusinessSignup>;

  constructor() {
    this.users = new Map();
    this.signups = new Map();
    this.businessSignups = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSignup(insertSignup: InsertSignup): Promise<Signup> {
    const id = randomUUID();
    const signup: Signup = {
      ...insertSignup,
      id,
      equityTypes: insertSignup.equityTypes ?? null,
      hasCpa: insertSignup.hasCpa ?? null,
      sourcePage: insertSignup.sourcePage ?? null,
      createdAt: new Date(),
    };
    this.signups.set(id, signup);
    return signup;
  }

  async getSignups(): Promise<Signup[]> {
    return Array.from(this.signups.values());
  }

  async createBusinessSignup(insertSignup: InsertBusinessSignup): Promise<BusinessSignup> {
    const id = randomUUID();
    const signup: BusinessSignup = {
      ...insertSignup,
      id,
      stateOfIncorporation: insertSignup.stateOfIncorporation ?? null,
      hasFiledBefore: insertSignup.hasFiledBefore ?? null,
      sourcePage: insertSignup.sourcePage ?? null,
      createdAt: new Date(),
    };
    this.businessSignups.set(id, signup);
    return signup;
  }

  async getBusinessSignups(): Promise<BusinessSignup[]> {
    return Array.from(this.businessSignups.values());
  }
}

export const storage = new MemStorage();
