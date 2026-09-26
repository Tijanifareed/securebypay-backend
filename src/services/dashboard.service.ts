import { prisma } from "../config/prisma.js";

type Period = "year" | "month" | "week";

// ─── Wallet ──────────────────────────────────────────────────────────────────

export const getWalletSummary = async (userId: number) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  return { balance: wallet?.balance ?? 0 };
};

// ─── Stats Cards ─────────────────────────────────────────────────────────────

const getDateRange = (period: Period) => {
  const now = new Date();
  const current = { from: new Date(), to: now };
  const previous = { from: new Date(), to: new Date() };

  if (period === "month") {
    // current month
    current.from = new Date(now.getFullYear(), now.getMonth(), 1);
    // previous month
    previous.from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    previous.to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  } else if (period === "week") {
    const dayOfWeek = now.getDay();
    current.from = new Date(now);
    current.from.setDate(now.getDate() - dayOfWeek);
    current.from.setHours(0, 0, 0, 0);

    previous.from = new Date(current.from);
    previous.from.setDate(current.from.getDate() - 7);
    previous.to = new Date(current.from);
    previous.to.setMilliseconds(-1);
  } else {
    // year
    current.from = new Date(now.getFullYear(), 0, 1);
    previous.from = new Date(now.getFullYear() - 1, 0, 1);
    previous.to = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
  }

  return { current, previous };
};

const calcPercentChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const getStatsCards = async (userId: number, period: Period) => {
  const { current, previous } = getDateRange(period);
  const changeLabel = `vs last ${period}`;

  const [
    currentTotal,
    previousTotal,
    currentExports,
    previousExports,
    currentImports,
    previousImports,
  ] = await Promise.all([
    prisma.shipment.count({
      where: { senderId: userId, createdAt: { gte: current.from, lte: current.to } },
    }),
    prisma.shipment.count({
      where: { senderId: userId, createdAt: { gte: previous.from, lte: previous.to } },
    }),
    prisma.shipment.count({
      where: {
        senderId: userId,
        pickupCountry: "Nigeria",
        NOT: { deliveryCountry: "Nigeria" },
        createdAt: { gte: current.from, lte: current.to },
      },
    }),
    prisma.shipment.count({
      where: {
        senderId: userId,
        pickupCountry: "Nigeria",
        NOT: { deliveryCountry: "Nigeria" },
        createdAt: { gte: previous.from, lte: previous.to },
      },
    }),
    prisma.shipment.count({
      where: {
        senderId: userId,
        NOT: { pickupCountry: "Nigeria" },
        deliveryCountry: "Nigeria",
        createdAt: { gte: current.from, lte: current.to },
      },
    }),
    prisma.shipment.count({
      where: {
        senderId: userId,
        NOT: { pickupCountry: "Nigeria" },
        deliveryCountry: "Nigeria",
        createdAt: { gte: previous.from, lte: previous.to },
      },
    }),
  ]);

  return {
    totalShipment: {
      count: currentTotal,
      percentChange: calcPercentChange(currentTotal, previousTotal),
      changeLabel,
    },
    totalExports: {
      count: currentExports,
      percentChange: calcPercentChange(currentExports, previousExports),
      changeLabel,
    },
    totalImport: {
      count: currentImports,
      percentChange: calcPercentChange(currentImports, previousImports),
      changeLabel,
    },
  };
};

// ─── Company Growth Chart ─────────────────────────────────────────────────────

export const getCompanyGrowth = async (userId: number, period: Period) => {
  const now = new Date();
  type DataPoint = { label: string; value: number };
  const data: DataPoint[] = [];

  if (period === "year") {
    // 12 months of the current year
    for (let month = 0; month < 12; month++) {
      const from = new Date(now.getFullYear(), month, 1);
      const to = new Date(now.getFullYear(), month + 1, 0, 23, 59, 59);
      const count = await prisma.shipment.count({
        where: { senderId: userId, createdAt: { gte: from, lte: to } },
      });
      data.push({ label: String(month + 1), value: count });
    }
  } else if (period === "month") {
    // each week of the current month (up to 5)
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let weekNum = 1;
    for (let day = 1; day <= daysInMonth; day += 7) {
      const from = new Date(year, month, day);
      const to = new Date(year, month, Math.min(day + 6, daysInMonth), 23, 59, 59);
      const count = await prisma.shipment.count({
        where: { senderId: userId, createdAt: { gte: from, lte: to } },
      });
      data.push({ label: `W${weekNum}`, value: count });
      weekNum++;
    }
  } else {
    // 7 days of current week
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const from = new Date(startOfWeek);
      from.setDate(startOfWeek.getDate() + i);
      const to = new Date(from);
      to.setHours(23, 59, 59);
      const count = await prisma.shipment.count({
        where: { senderId: userId, createdAt: { gte: from, lte: to } },
      });
      data.push({ label: days[i] ?? String(i + 1), value: count });
    }
  }

  return { period, data };
};

// ─── Shipments ────────────────────────────────────────────────────────────────

export const getRecentShipments = async (
  userId: number,
  page: number,
  pageSize: number,
) => {
  const skip = (page - 1) * pageSize;

  const [total, rows] = await Promise.all([
    prisma.shipment.count({ where: { senderId: userId } }),
    prisma.shipment.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
  ]);

  const shipments = rows.map((s) => ({
    trackingId: s.trackingId,
    sender: s.senderName,
    receiver: s.receiverName,
    pickupLocation: { country: s.pickupCountry, city: s.pickupCity },
    deliveryLocation: { country: s.deliveryCountry, city: s.deliveryCity },
    amount: s.amount,
    status: s.status,
    processingTime: s.processingTime,
    isPaid: s.isPaid,
  }));

  return {
    shipments,
    pagination: { page, pageSize, total },
  };
};

// ─── Full Dashboard ───────────────────────────────────────────────────────────

export const getDashboardData = async (
  userId: number,
  period: Period,
  page: number,
  pageSize: number,
) => {
  const [wallet, stats, growth, shipmentsData] = await Promise.all([
    getWalletSummary(userId),
    getStatsCards(userId, period),
    getCompanyGrowth(userId, period),
    getRecentShipments(userId, page, pageSize),
  ]);

  return {
    wallet,
    stats,
    growth,
    ...shipmentsData,
  };
};
