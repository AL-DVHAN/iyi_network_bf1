import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // EA Account Linking
  eaUsername: varchar("eaUsername", { length: 128 }),
  eaVerified: boolean("eaVerified").default(false).notNull(),
  eaPlatform: mysqlEnum("eaPlatform", ["pc", "xbox", "ps4"]).default("pc"),
  // Donator system
  isDonator: boolean("isDonator").default(false).notNull(),
  donatorBadge: varchar("donatorBadge", { length: 64 }),
  nameColor: varchar("nameColor", { length: 32 }),
  donatorExpiry: timestamp("donatorExpiry"),
  // Points & badges
  points: int("points").default(0).notNull(),
  badges: json("badges").$type<string[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const weeklyChallenges = mysqlTable("weekly_challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  type: mysqlEnum("type", ["kills", "revives", "playtime", "headshots", "wins", "custom"]).notNull(),
  targetValue: int("targetValue").notNull(),
  rewardPoints: int("rewardPoints").default(100).notNull(),
  rewardBadge: varchar("rewardBadge", { length: 128 }),
  weekStart: timestamp("weekStart").notNull(),
  weekEnd: timestamp("weekEnd").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const challengeCompletions = mysqlTable("challenge_completions", {
  id: int("id").autoincrement().primaryKey(),
  challengeId: int("challengeId").notNull(),
  userId: int("userId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  proofUrl: text("proofUrl"),
});

export const leaderboardEntries = mysqlTable("leaderboard_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eaUsername: varchar("eaUsername", { length: 128 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
  kills: int("kills").default(0),
  deaths: int("deaths").default(0),
  playtimeHours: int("playtimeHours").default(0),
  score: int("score").default(0),
  kd: decimal("kd", { precision: 6, scale: 2 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  guestName: varchar("guestName", { length: 128 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  type: mysqlEnum("type", ["suggestion", "complaint", "report", "other"]).notNull(),
  subject: varchar("subject", { length: 256 }).notNull(),
  message: text("message").notNull(),
  attachmentUrls: json("attachmentUrls").$type<string[]>().default([]),
  discordSent: boolean("discordSent").default(false).notNull(),
  status: mysqlEnum("status", ["open", "in_review", "resolved", "closed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const banList = mysqlTable("ban_list", {
  id: int("id").autoincrement().primaryKey(),
  eaUsername: varchar("eaUsername", { length: 128 }).notNull(),
  reason: text("reason").notNull(),
  bannedBy: int("bannedBy"),
  bannedByName: varchar("bannedByName", { length: 128 }),
  banType: mysqlEnum("banType", ["permanent", "temporary"]).default("permanent").notNull(),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const banAppeals = mysqlTable("ban_appeals", {
  id: int("id").autoincrement().primaryKey(),
  banId: int("banId").notNull(),
  eaUsername: varchar("eaUsername", { length: 128 }).notNull(),
  message: text("message").notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  stripeSessionId: varchar("stripeSessionId", { length: 256 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("TRY").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  durationDays: int("durationDays").default(30),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const proTips = mysqlTable("pro_tips", {
  id: int("id").autoincrement().primaryKey(),
  itemType: mysqlEnum("itemType", ["weapon", "vehicle"]).notNull(),
  itemName: varchar("itemName", { length: 256 }).notNull(),
  authorId: int("authorId").notNull(),
  authorName: varchar("authorName", { length: 128 }),
  content: text("content").notNull(),
  likes: int("likes").default(0).notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const clanMembers = mysqlTable("clan_members", {
  id: int("id").autoincrement().primaryKey(),
  eaUsername: varchar("eaUsername", { length: 128 }).notNull().unique(),
  displayName: varchar("displayName", { length: 128 }),
  platform: mysqlEnum("platform", ["pc", "xbox", "ps4"]).default("pc"),
  kd: decimal("kd", { precision: 6, scale: 2 }).default("0"),
  playtimeHours: int("playtimeHours").default(0),
  kills: int("kills").default(0),
  deaths: int("deaths").default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const serverStats = mysqlTable("server_stats", {
  id: int("id").autoincrement().primaryKey(),
  playerCount: int("playerCount").default(0),
  maxPlayers: int("maxPlayers").default(64),
  queueCount: int("queueCount").default(0),
  currentMap: varchar("currentMap", { length: 256 }),
  mapImage: text("mapImage"),
  team1Score: int("team1Score").default(0),
  team2Score: int("team2Score").default(0),
  team1Name: varchar("team1Name", { length: 128 }),
  team2Name: varchar("team2Name", { length: 128 }),
  activeAdmin: varchar("activeAdmin", { length: 128 }),
  hasAdmin: boolean("hasAdmin").default(false),
  serverName: varchar("serverName", { length: 256 }),
  gameMode: varchar("gameMode", { length: 64 }),
  roundTime: int("roundTime").default(0),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type BanEntry = typeof banList.$inferSelect;
export type BanAppeal = typeof banAppeals.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type ProTip = typeof proTips.$inferSelect;
export type ClanMember = typeof clanMembers.$inferSelect;
export type InsertClanMember = typeof clanMembers.$inferInsert;
