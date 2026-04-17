import { RequestHandler } from "express";
import { ApiError } from "../../utils/ApiError";
import { successResponse } from "../../utils/successResponse";
import { UserModel } from "../../models/user.model";
import { productModel } from "../../models/product.model";
import { CategoryModel } from "../../models/category.model";
import { SubscriptionModel } from "../../models/subscription/subscription.model";
import { cartModel } from "../../models/cart.model";
import Order from "../../models/order/order.model";

type CountRow = {
  _id: string | null;
  count: number;
};

type MonthlySalesRow = {
  _id: {
    year: number;
    month: number;
  };
  orders: number;
  revenue: number;
  paidOrders: number;
};

type TopProductRow = {
  productId: string;
  title: string | null;
  slug: string | null;
  thumbnail: string | null;
  categoryId: string | null;
  categoryName: string | null;
  soldQuantity: number;
  revenue: number;
  orderCount: number;
};

type TopCategoryRow = {
  categoryId: string | null;
  name: string | null;
  slug: string | null;
  thumbnail: string | null;
  soldQuantity: number;
  revenue: number;
  productsCount: number;
};

type RecentOrderRow = {
  _id: string;
  transactionId?: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: Date;
  shippingAddress: {
    fullName: string;
    email?: string;
  };
  user?: {
    _id: string;
    fullName?: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | null;
};

type RecentUserRow = {
  _id: string;
  fullName?: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  createdAt: Date;
};

type LowStockProductRow = {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  totalStock: number;
  isActive: boolean;
  isFeatured: boolean;
};

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;

const paymentMethods = ["cod", "stripe", "sslcommerz"] as const;

const userRoles = ["user", "admin", "staff"] as const;

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const buildCountMap = <T extends string>(
  rows: CountRow[],
  keys: readonly T[],
) => {
  return keys.reduce<Record<T, number>>(
    (acc, key) => {
      acc[key] = rows.find((row) => row._id === key)?.count ?? 0;
      return acc;
    },
    {} as Record<T, number>,
  );
};

const padMonth = (value: number) => String(value).padStart(2, "0");

const buildMonthlyBuckets = (monthsBack: number) => {
  const current = new Date();
  const buckets: Array<{ key: string; label: string }> = [];

  for (let offset = monthsBack - 1; offset >= 0; offset -= 1) {
    const bucketDate = new Date(
      Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - offset, 1),
    );
    buckets.push({
      key: `${bucketDate.getUTCFullYear()}-${padMonth(bucketDate.getUTCMonth() + 1)}`,
      label: `${monthNames[bucketDate.getUTCMonth()]} ${bucketDate.getUTCFullYear()}`,
    });
  }

  return buckets;
};

export const getDashboardStats: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const startDate = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 11, 1),
  );

  const [
    totalUsers,
    totalProducts,
    totalCategories,
    totalSubscriptions,
    totalCarts,
    verifiedUsers,
    activeProducts,
    featuredProducts,
    activeCategories,
    totalOrders,
    orderStatusRows,
    paymentStatusRows,
    paymentMethodRows,
    userRoleRows,
    cartStatsRows,
    revenueRows,
    itemSoldRows,
    monthlySalesRows,
    topProductsRows,
    topCategoriesRows,
    recentOrdersRows,
    recentUsers,
    lowStockProducts,
  ] = await Promise.all([
    UserModel.countDocuments(),
    productModel.countDocuments(),
    CategoryModel.countDocuments(),
    SubscriptionModel.countDocuments(),
    cartModel.countDocuments(),
    UserModel.countDocuments({ isVerified: true }),
    productModel.countDocuments({ isActive: true }),
    productModel.countDocuments({ isFeatured: true }),
    CategoryModel.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate<CountRow>([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate<CountRow>([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate<CountRow>([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
        },
      },
    ]),
    UserModel.aggregate<CountRow>([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]),
    cartModel.aggregate<{ totalCarts: number; totalItems: number }>([
      {
        $group: {
          _id: null,
          totalCarts: { $sum: 1 },
          totalItems: { $sum: "$totalItems" },
        },
      },
      {
        $project: {
          _id: 0,
          totalCarts: 1,
          totalItems: 1,
        },
      },
    ]),
    Order.aggregate<{ revenue: number; paidOrders: number }>([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
          paidOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          revenue: 1,
          paidOrders: 1,
        },
      },
    ]),
    Order.aggregate<{ itemsSold: number }>([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: null,
          itemsSold: { $sum: "$items.quantity" },
        },
      },
      {
        $project: {
          _id: 0,
          itemsSold: 1,
        },
      },
    ]),
    Order.aggregate<MonthlySalesRow>([
      {
        $match: {
          createdAt: {
            $gte: startDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
            },
          },
          paidOrders: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),
    Order.aggregate<TopProductRow>([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.product",
          soldQuantity: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subTotal" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          soldQuantity: -1,
          revenue: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          productId: { $toString: "$_id" },
          title: "$product.title",
          slug: "$product.slug",
          thumbnail: "$product.thumbnail",
          categoryId: { $toString: "$product.category" },
          categoryName: "$category.name",
          soldQuantity: 1,
          revenue: 1,
          orderCount: 1,
        },
      },
    ]),
    Order.aggregate<TopCategoryRow>([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$product.category",
          soldQuantity: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subTotal" },
          products: { $addToSet: "$product._id" },
        },
      },
      {
        $sort: {
          soldQuantity: -1,
          revenue: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: { $toString: "$_id" },
          name: "$category.name",
          slug: "$category.slug",
          thumbnail: "$category.thumbnail",
          soldQuantity: 1,
          revenue: 1,
          productsCount: { $size: "$products" },
        },
      },
    ]),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "fullName email role avatar")
      .lean<RecentOrderRow[]>(),
    UserModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName email role isVerified avatar createdAt")
      .lean<RecentUserRow[]>(),
    productModel.aggregate<LowStockProductRow>([
      {
        $addFields: {
          totalStock: { $sum: "$variants.stock" },
        },
      },
      {
        $match: {
          totalStock: {
            $lte: 10,
          },
        },
      },
      {
        $sort: {
          totalStock: 1,
          updatedAt: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          title: 1,
          slug: 1,
          thumbnail: 1,
          totalStock: 1,
          isActive: 1,
          isFeatured: 1,
        },
      },
    ]),
  ]);

  const orderStatusMap = buildCountMap(orderStatusRows, orderStatuses);
  const paymentStatusMap = buildCountMap(paymentStatusRows, paymentStatuses);
  const paymentMethodMap = buildCountMap(paymentMethodRows, paymentMethods);
  const userRoleMap = buildCountMap(userRoleRows, userRoles);

  const cartSummary = cartStatsRows[0] ?? { totalCarts: 0, totalItems: 0 };
  const revenueSummary = revenueRows[0] ?? { revenue: 0, paidOrders: 0 };
  const itemSoldSummary = itemSoldRows[0] ?? { itemsSold: 0 };

  const monthlyBuckets = buildMonthlyBuckets(12);
  const monthlySalesByKey = new Map(
    monthlySalesRows.map((row) => [
      `${row._id.year}-${padMonth(row._id.month)}`,
      row,
    ]),
  );

  const monthlySales = monthlyBuckets.map((bucket) => {
    const row = monthlySalesByKey.get(bucket.key);

    return {
      period: bucket.label,
      orders: row?.orders ?? 0,
      paidOrders: row?.paidOrders ?? 0,
      revenue: row?.revenue ?? 0,
    };
  });

  const averageOrderValue =
    revenueSummary.paidOrders > 0
      ? revenueSummary.revenue / revenueSummary.paidOrders
      : 0;

  const recentOrders = recentOrdersRows.map((order) => ({
    id: order._id,
    transactionId: order.transactionId ?? null,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount,
    currency: order.currency,
    createdAt: order.createdAt,
    customer: {
      id: order.user?._id ?? null,
      name: order.user?.fullName ?? order.shippingAddress.fullName,
      email: order.user?.email ?? order.shippingAddress.email ?? null,
      role: order.user?.role ?? null,
      avatar: order.user?.avatar ?? null,
    },
  }));

  const summary = {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      roles: userRoleMap,
    },
    products: {
      total: totalProducts,
      active: activeProducts,
      featured: featuredProducts,
      lowStock: lowStockProducts.length,
    },
    categories: {
      total: totalCategories,
      active: activeCategories,
    },
    orders: {
      total: totalOrders,
      statuses: orderStatusMap,
      paymentStatuses: paymentStatusMap,
      paymentMethods: paymentMethodMap,
    },
    subscriptions: {
      total: totalSubscriptions,
    },
    carts: {
      total: totalCarts,
      items: cartSummary.totalItems ?? 0,
    },
    revenue: {
      paidRevenue: revenueSummary.revenue,
      paidOrders: revenueSummary.paidOrders,
      averageOrderValue,
      itemsSold: itemSoldSummary.itemsSold,
    },
  };

  return successResponse(res, "Dashboard stats retrieved successfully", 200, {
    generatedAt: new Date().toISOString(),
    summary,
    charts: {
      monthlySales,
    },
    topProducts: topProductsRows,
    topCategories: topCategoriesRows,
    recentOrders,
    recentUsers,
    lowStockProducts,
  });
};
