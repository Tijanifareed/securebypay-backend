import type { Request, Response } from "express";

export const dashboard = async (_req: Request, res: Response) => {
  return res.status(200).json({
    wallet: {
      balance: 3000000.28,
      currency: "NGN",
    },
    stats: {
      totalShipment: {
        count: 34,
        percentChange: 90,
        changeLabel: "vs last month",
      },
      totalExports: {
        count: 34,
        percentChange: 90,
        changeLabel: "vs last month",
      },
      totalImport: {
        count: 34,
        percentChange: 90,
        changeLabel: "vs last month",
      },
    },
    companyGrowth: {
      period: "year",
      data: [
        { label: "1", value: 320 },
        { label: "2", value: 300 },
        { label: "3", value: 340 },
        { label: "4", value: 350 },
        { label: "5", value: 300 },
        { label: "6", value: 400 },
        { label: "7", value: 350 },
        { label: "8", value: 450 },
        { label: "9", value: 380 },
        { label: "10", value: 550 },
        { label: "11", value: 150 },
        { label: "12", value: 950 },
      ],
    },
    recentShipments: {
      shipments: [
        {
          trackingId: "MAF-100-234-291",
          sender: "Bunmi Tanny",
          receiver: "Mercy",
          pickupLocation: { country: "Nigeria", city: "Lagos" },
          deliveryLocation: { country: "Nigeria", city: "Oyo" },
          amount: 3000,
          status: "in-transit",
          processingTime: "10 hours",
          isPaid: true,
        },
        {
          trackingId: "MAF-100-234-291",
          sender: "Bunmi Tanny",
          receiver: "Mercy",
          pickupLocation: { country: "Nigeria", city: "Lagos" },
          deliveryLocation: { country: "Nigeria", city: "Oyo" },
          amount: 3000,
          status: "delayed",
          processingTime: "10 hours",
          isPaid: false,
        },
        {
          trackingId: "MAF-100-234-291",
          sender: "Bunmi Tanny",
          receiver: "Mercy",
          pickupLocation: { country: "Nigeria", city: "Lagos" },
          deliveryLocation: { country: "Nigeria", city: "Oyo" },
          amount: 3000,
          status: "in-transit",
          processingTime: "10 hours",
          isPaid: false,
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 34,
      },
    },
  });
};
