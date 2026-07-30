import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const signups = pgTable("signups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  employmentType: text("employment_type").notNull(),
  equityTypes: text("equity_types").array(),
  incomeRange: text("income_range").notNull(),
  hasCpa: boolean("has_cpa"),
  sourcePage: text("source_page"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSignupSchema = createInsertSchema(signups).omit({
  id: true,
  createdAt: true,
});

export type InsertSignup = z.infer<typeof insertSignupSchema>;
export type Signup = typeof signups.$inferSelect;

export const businessSignups = pgTable("business_signups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  formType: text("form_type").notNull(),
  annualRevenue: text("annual_revenue").notNull(),
  stateOfIncorporation: text("state_of_incorporation"),
  hasFiledBefore: boolean("has_filed_before"),
  sourcePage: text("source_page"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBusinessSignupSchema = createInsertSchema(businessSignups).omit({
  id: true,
  createdAt: true,
});

export type InsertBusinessSignup = z.infer<typeof insertBusinessSignupSchema>;
export type BusinessSignup = typeof businessSignups.$inferSelect;
