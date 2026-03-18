import { z } from "zod";
import { eq, desc, and, gte, lte, like } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import {
  users, weeklyChallenges, challengeCompletions, leaderboardEntries,
  feedback, banList, banAppeals, donations, proTips, serverStats
} from "../drizzle/schema";
import axios from "axios";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin yetkisi gerekli" });
  return next({ ctx });
});

// ─── Gametools API helpers ───────────────────────────────────────────────────
async function fetchPlayerStats(name: string, platform = "pc") {
  const url = `https://api.gametools.network/bf1/all/?name=${encodeURIComponent(name)}&platform=${platform}`;
  const res = await axios.get(url, { timeout: 10000, headers: { "User-Agent": "IYI-Network/1.0" } });
  return res.data;
}

async function fetchServerStats() {
  // Search for IYI server
  const searchUrl = `https://api.gametools.network/bf1/servers/?name=%5BIYI%5D&platform=pc&lang=en-us&limit=5`;
  try {
    const res = await axios.get(searchUrl, { timeout: 10000, headers: { "User-Agent": "IYI-Network/1.0" } });
    const servers = res.data?.servers || [];
    // Find the IYI ALL MAP server
    const server = servers.find((s: Record<string, unknown>) =>
      typeof s.prefix === 'string' && s.prefix.includes('IYI')
    ) || servers[0];
    if (!server) return null;

    // Try to get detailed server info (owner, settings, rotation)
    let detailed = null;
    if (server.gameId) {
      try {
        const detailRes = await axios.get(
          `https://api.gametools.network/bf1/detailedserver/?gameid=${server.gameId}&platform=pc&lang=en-us`,
          { timeout: 8000, headers: { "User-Agent": "IYI-Network/1.0" } }
        );
        detailed = detailRes.data;
      } catch { /* ignore */ }
    }
    return { server, detailed };
  } catch {
    return null;
  }
}

// ─── Discord Webhook helper ──────────────────────────────────────────────────
async function sendDiscordWebhook(webhookUrl: string, payload: object) {
  try {
    await axios.post(webhookUrl, payload, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateEaAccount: protectedProcedure
      .input(z.object({ eaUsername: z.string().min(1).max(128), platform: z.enum(["pc", "xbox", "ps4"]) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(users).set({ eaUsername: input.eaUsername, eaPlatform: input.platform, eaVerified: false }).where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
  }),

  // ─── Stats ────────────────────────────────────────────────────────────────
  stats: router({
    getPlayer: publicProcedure
      .input(z.object({ name: z.string().min(1), platform: z.string().default("pc") }))
      .query(async ({ input }) => {
        try {
          const data = await fetchPlayerStats(input.name, input.platform);
          return { success: true, data };
        } catch (err: unknown) {
          const error = err as { response?: { status: number } };
          if (error?.response?.status === 404) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Oyuncu bulunamadı" });
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "API hatası" });
        }
      }),
  }),

  // ─── Server ───────────────────────────────────────────────────────────────
  server: router({
    getLive: publicProcedure.query(async () => {
      const db = await getDb();
      // Try to fetch from Gametools API
      const apiData = await fetchServerStats();
      if (apiData && apiData.server) {
        const s = apiData.server;
        const d = apiData.detailed;
        // teams is an object: { teamOne: {name, key, image}, teamTwo: {name, key, image} }
        const teams = s.teams || {};
        const teamOne = teams.teamOne || {};
        const teamTwo = teams.teamTwo || {};
        // Gametools API does NOT provide live ticket scores - only available in active games
        // We show null scores when server is empty, so UI can display "Oyun aktif değil"
        const statsData = {
          serverName: (s.prefix || "[IYI] ALL MAP 200DMG/CQ").replace(/^[\s'"]+/, "").trim(),
          currentMap: s.currentMap || d?.currentMap || "Bilinmiyor",
          gameMode: s.mode || d?.mode || "Conquest",
          playerCount: Number(s.playerAmount) || 0,
          maxPlayers: Number(s.maxPlayers) || 64,
          queueCount: Number(s.inQue || s.inQueue) || 0,
          // No live ticket scores available from API - null means "not in active game"
          team1Score: null as number | null,
          team2Score: null as number | null,
          team1Name: teamOne.name || "Takım 1",
          team2Name: teamTwo.name || "Takım 2",
          team1Image: teamOne.image || null,
          team2Image: teamTwo.image || null,
          hasAdmin: !!(d?.owner?.name),
          activeAdmin: d?.owner?.name || null as string | null,
          mapImage: s.url || d?.currentMapImage || null,
          serverId: s.serverId || d?.serverId || null,
          gameId: s.gameId || d?.gameId || null,
          region: s.region || d?.region || "EU",
          country: s.country || d?.country || "DE",
          settings: d?.settings || null,
          rotation: d?.rotation || [],
          fetchedAt: new Date(),
        };
        if (db) {
          // Only save numeric-compatible fields to DB
          await db.insert(serverStats).values({
            serverName: statsData.serverName,
            currentMap: statsData.currentMap,
            gameMode: statsData.gameMode,
            playerCount: statsData.playerCount,
            maxPlayers: statsData.maxPlayers,
            queueCount: statsData.queueCount,
            team1Score: statsData.team1Score,
            team2Score: statsData.team2Score,
            team1Name: statsData.team1Name,
            team2Name: statsData.team2Name,
            hasAdmin: statsData.hasAdmin,
            activeAdmin: statsData.activeAdmin,
            mapImage: statsData.mapImage,
            fetchedAt: statsData.fetchedAt,
          }).catch(() => {});
        }
        return statsData;
      }
      // Fallback: return real server info without fake scores
      return {
        serverName: "[IYI] ALL MAP 200DMG/CQ",
        currentMap: "Bilinmiyor",
        gameMode: "Conquest",
        playerCount: 0,
        maxPlayers: 64,
        queueCount: 0,
        team1Score: null as number | null,
        team2Score: null as number | null,
        team1Name: "Takım 1",
        team2Name: "Takım 2",
        team1Image: null as string | null,
        team2Image: null as string | null,
        hasAdmin: false,
        activeAdmin: null as string | null,
        mapImage: null as string | null,
        serverId: null as string | null,
        gameId: null as string | null,
        region: "EU",
        country: "DE",
        settings: null,
        rotation: [] as unknown[],
        fetchedAt: new Date(),
      };
    }),
  }),

  // ─── Encyclopedia ─────────────────────────────────────────────────────────
  encyclopedia: router({
    getProTips: publicProcedure
      .input(z.object({ itemName: z.string(), itemType: z.enum(["weapon", "vehicle"]) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(proTips).where(
          and(eq(proTips.itemName, input.itemName), eq(proTips.itemType, input.itemType), eq(proTips.isApproved, true))
        ).orderBy(desc(proTips.likes));
      }),
    addProTip: protectedProcedure
      .input(z.object({ itemName: z.string(), itemType: z.enum(["weapon", "vehicle"]), content: z.string().min(10).max(1000) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(proTips).values({
          itemName: input.itemName,
          itemType: input.itemType,
          content: input.content,
          authorId: ctx.user.id,
          authorName: ctx.user.name || ctx.user.email || "Anonim",
          isApproved: ctx.user.role === "admin",
        });
        return { success: true };
      }),
  }),

  // ─── Leaderboard ──────────────────────────────────────────────────────────
  leaderboard: router({
    getTop: publicProcedure
      .input(z.object({ limit: z.number().default(20), sortBy: z.enum(["kills", "kd", "playtimeHours", "score"]).default("kills") }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const currentMonth = new Date().toISOString().slice(0, 7);
        const entries = await db.select().from(leaderboardEntries)
          .where(eq(leaderboardEntries.month, currentMonth))
          .orderBy(desc(leaderboardEntries.kills))
          .limit(input.limit);
        return entries;
      }),
    upsertEntry: adminProcedure
      .input(z.object({
        eaUsername: z.string(),
        kills: z.number().default(0),
        deaths: z.number().default(0),
        playtimeHours: z.number().default(0),
        score: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const currentMonth = new Date().toISOString().slice(0, 7);
        const kd = input.deaths > 0 ? (input.kills / input.deaths).toFixed(2) : input.kills.toFixed(2);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.insert(leaderboardEntries) as any).values({
          userId: ctx.user.id,
          eaUsername: input.eaUsername,
          month: currentMonth,
          kills: input.kills,
          deaths: input.deaths,
          playtimeHours: input.playtimeHours,
          score: input.score,
          kd: kd,
        }).onDuplicateKeyUpdate({ set: { kills: input.kills, deaths: input.deaths, playtimeHours: input.playtimeHours, score: input.score, kd: kd } });
        return { success: true };
      }),
  }),

  // ─── Challenges ───────────────────────────────────────────────────────────
  challenges: router({
    getActive: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const now = new Date();
      return db.select().from(weeklyChallenges)
        .where(and(eq(weeklyChallenges.isActive, true), lte(weeklyChallenges.weekStart, now), gte(weeklyChallenges.weekEnd, now)))
        .orderBy(desc(weeklyChallenges.createdAt));
    }),
    getAll: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(weeklyChallenges).orderBy(desc(weeklyChallenges.createdAt)).limit(20);
    }),
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(256),
        description: z.string().min(1),
        type: z.enum(["kills", "revives", "playtime", "headshots", "wins", "custom"]),
        targetValue: z.number().min(1),
        rewardPoints: z.number().default(100),
        rewardBadge: z.string().optional(),
        weekStart: z.string(),
        weekEnd: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(weeklyChallenges).values({
          title: input.title,
          description: input.description,
          type: input.type,
          targetValue: input.targetValue,
          rewardPoints: input.rewardPoints,
          rewardBadge: input.rewardBadge,
          weekStart: new Date(input.weekStart),
          weekEnd: new Date(input.weekEnd),
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),
    complete: protectedProcedure
      .input(z.object({ challengeId: z.number(), proofUrl: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // Check if already completed
        const existing = await db.select().from(challengeCompletions)
          .where(and(eq(challengeCompletions.challengeId, input.challengeId), eq(challengeCompletions.userId, ctx.user.id)))
          .limit(1);
        if (existing.length > 0) throw new TRPCError({ code: "CONFLICT", message: "Bu görevi zaten tamamladınız" });
        await db.insert(challengeCompletions).values({
          challengeId: input.challengeId,
          userId: ctx.user.id,
          proofUrl: input.proofUrl,
        });
        // Add points
        const challenge = await db.select().from(weeklyChallenges).where(eq(weeklyChallenges.id, input.challengeId)).limit(1);
        if (challenge[0]) {
          await db.update(users).set({ points: ctx.user.points + challenge[0].rewardPoints }).where(eq(users.id, ctx.user.id));
        }
        return { success: true };
      }),
  }),

  // ─── Feedback ─────────────────────────────────────────────────────────────
  feedback: router({
    submit: publicProcedure
      .input(z.object({
        guestName: z.string().optional(),
        guestEmail: z.string().email().optional(),
        type: z.enum(["suggestion", "complaint", "report", "other"]),
        subject: z.string().min(1).max(256),
        message: z.string().min(10).max(5000),
        attachmentUrls: z.array(z.string()).default([]),
        discordWebhookUrl: z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const entry = await db.insert(feedback).values({
          userId: ctx.user?.id,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          type: input.type,
          subject: input.subject,
          message: input.message,
          attachmentUrls: input.attachmentUrls,
        });
        // Send Discord webhook
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL || input.discordWebhookUrl;
        let discordSent = false;
        if (webhookUrl) {
          const typeLabels: Record<string, string> = { suggestion: "💡 Öneri", complaint: "⚠️ Şikayet", report: "🚨 Rapor", other: "📝 Diğer" };
          const payload = {
            embeds: [{
              title: `${typeLabels[input.type] || input.type}: ${input.subject}`,
              description: input.message.slice(0, 2000),
              color: input.type === "complaint" ? 0xFF4444 : input.type === "report" ? 0xFF8800 : 0xC8A84B,
              fields: [
                { name: "Gönderen", value: ctx.user?.name || input.guestName || "Misafir", inline: true },
                { name: "E-posta", value: ctx.user?.email || input.guestEmail || "Belirtilmedi", inline: true },
                ...(input.attachmentUrls.length > 0 ? [{ name: "Ekler", value: input.attachmentUrls.join("\n"), inline: false }] : []),
              ],
              timestamp: new Date().toISOString(),
              footer: { text: "IYI Network Geri Bildirim Sistemi" },
            }],
          };
          discordSent = await sendDiscordWebhook(webhookUrl, payload);
          if (discordSent && db) {
            await db.update(feedback).set({ discordSent: true }).where(eq(feedback.id, (entry as unknown as { insertId: number }).insertId));
          }
        }
        return { success: true, discordSent };
      }),
    getAll: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(feedback).orderBy(desc(feedback.createdAt)).limit(50);
    }),
  }),

  // ─── Ban List ─────────────────────────────────────────────────────────────
  bans: router({
    getAll: publicProcedure
      .input(z.object({ search: z.string().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        if (input.search) {
          return db.select().from(banList)
            .where(and(eq(banList.isActive, true), like(banList.eaUsername, `%${input.search}%`)))
            .orderBy(desc(banList.createdAt));
        }
        return db.select().from(banList).where(eq(banList.isActive, true)).orderBy(desc(banList.createdAt));
      }),
    add: adminProcedure
      .input(z.object({
        eaUsername: z.string().min(1),
        reason: z.string().min(1),
        banType: z.enum(["permanent", "temporary"]),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(banList).values({
          eaUsername: input.eaUsername,
          reason: input.reason,
          bannedBy: ctx.user.id,
          bannedByName: ctx.user.name || ctx.user.email || "Admin",
          banType: input.banType,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        });
        return { success: true };
      }),
    submitAppeal: publicProcedure
      .input(z.object({
        banId: z.number(),
        eaUsername: z.string(),
        message: z.string().min(20).max(2000),
        contactEmail: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(banAppeals).values({
          banId: input.banId,
          eaUsername: input.eaUsername,
          message: input.message,
          contactEmail: input.contactEmail,
        });
        return { success: true };
      }),
    getAppeals: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(banAppeals).orderBy(desc(banAppeals.createdAt));
    }),
  }),

  // ─── Donations ────────────────────────────────────────────────────────────
  donations: router({
    getDonators: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({ id: users.id, name: users.name, donatorBadge: users.donatorBadge, nameColor: users.nameColor, donatorExpiry: users.donatorExpiry })
        .from(users)
        .where(eq(users.isDonator, true))
        .orderBy(desc(users.createdAt))
        .limit(20);
    }),
    createCheckout: protectedProcedure
      .input(z.object({
        tierId: z.string(),
        amountUSD: z.number().min(150), // cents
        durationDays: z.number().default(30),
        badge: z.string(),
        origin: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe henüz yapılandırılmadı. Discord üzerinden iletişime geçin." });
        }
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(stripeKey);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: {
                name: `IYI Network - ${input.badge}`,
                description: `${input.durationDays} günlük destekçi rozeti`,
              },
              unit_amount: input.amountUSD,
            },
            quantity: 1,
          }],
          mode: "payment",
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
            tier_id: input.tierId,
            badge: input.badge,
            duration_days: input.durationDays.toString(),
          },
          allow_promotion_codes: true,
          success_url: `${input.origin}/destek?success=1`,
          cancel_url: `${input.origin}/destek?cancelled=1`,
        });
        const db = await getDb();
        if (db) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (db.insert(donations) as any).values({
            userId: ctx.user.id,
            amount: String(input.amountUSD / 100),
            durationDays: input.durationDays,
            status: "pending",
            stripeSessionId: session.id,
          }).catch(() => {});
        }
        return { checkoutUrl: session.url };
      }),
    createSession: protectedProcedure
      .input(z.object({ amount: z.number().min(10), durationDays: z.number().default(30) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.insert(donations) as any).values({
          userId: ctx.user.id,
          amount: String(input.amount),
          durationDays: input.durationDays,
          status: "pending",
        });
        return { success: true, message: "Stripe entegrasyonu yakında aktif olacak. Şimdilik Discord üzerinden iletişime geçin." };
      }),
  }),

  // ─── Profile ──────────────────────────────────────────────────────────────
  profile: router({
    getMe: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return ctx.user;
      const result = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return result[0] || ctx.user;
    }),
  }),
});

export type AppRouter = typeof appRouter;
