import { useMemo } from "react";
import { DollarSign, Package, Bell, ShoppingCart } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { useCategories } from "@/hooks/useCategories";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";

const revenueConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const { products, isLoading: productsLoading } = useProducts();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { customers, isLoading: customersLoading } = useCustomers();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const navigate = useNavigate();

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const orderStatusData = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const processing = orders.filter((o) => o.status === "PROCESSING").length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const cancelled = orders.filter((o) => o.status === "CANCELLED").length;

    return [
      { status: "Delivered", count: delivered, color: "#10B981" },
      { status: "Processing", count: processing, color: "#3B82F6" },
      { status: "Pending", count: pending, color: "#F59E0B" },
      { status: "Cancelled", count: cancelled, color: "#EF4444" },
    ];
  }, [orders]);

  const productStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    // Initialize with all available categories
    categories.forEach((cat: any) => {
      counts[cat.name] = 0;
    });

    products.forEach((p) => {
      const catName = p.category?.name || "Uncategorized";
      counts[catName] = (counts[catName] || 0) + 1;
    });

    const colors = [
      "#DC2626",
      "#A3B518",
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#8B5CF6",
      "#EC4899",
      "#06B6D4",
    ];

    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value: value || 0,
      color: colors[i % colors.length],
    }));
  }, [products, categories]);

  // Group revenue by month for the chart
  const revenueTrendData = useMemo(() => {
    const months = [
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
    const currentYear = new Date().getFullYear();

    const data = months.map((month) => ({ month, revenue: 0 }));

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      if (date.getFullYear() === currentYear) {
        data[date.getMonth()].revenue += order.total;
      }
    });

    return data;
  }, [orders]);

  // Calculate trends
  const statsTrends = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const filterMonth = (date: Date, m: number, y: number) =>
      date.getMonth() === m && date.getFullYear() === y;

    // Revenue (Flow Comparison: This Month vs Last Month)
    const currentRevenue = orders
      .filter((o) =>
        filterMonth(new Date(o.createdAt), currentMonth, currentYear)
      )
      .reduce((acc, o) => acc + o.total, 0);
    const lastRevenue = orders
      .filter((o) =>
        filterMonth(new Date(o.createdAt), lastMonth, lastMonthYear)
      )
      .reduce((acc, o) => acc + o.total, 0);
    const revenueTrend =
      lastRevenue === 0
        ? 100
        : ((currentRevenue - lastRevenue) / lastRevenue) * 100;

    // Orders (Flow Comparison: This Month vs Last Month)
    const currentOrders = orders.filter((o) =>
      filterMonth(new Date(o.createdAt), currentMonth, currentYear)
    ).length;
    const lastOrders = orders.filter((o) =>
      filterMonth(new Date(o.createdAt), lastMonth, lastMonthYear)
    ).length;
    const ordersTrend =
      lastOrders === 0
        ? 100
        : ((currentOrders - lastOrders) / lastOrders) * 100;

    // Products (Stock Growth: New This Month / Start Total)
    const newProducts = products.filter((p: any) => {
      const d = new Date(p.created_at || new Date()); // Fallback if missing
      return filterMonth(d, currentMonth, currentYear);
    }).length;
    const totalProductsStart = products.length - newProducts;
    const productsTrend =
      totalProductsStart === 0 ? 100 : (newProducts / totalProductsStart) * 100;

    // Customers (Stock Growth: New This Month / Start Total)
    const newCustomers = customers.filter((c: any) => {
      const d = new Date(c.created_at || new Date());
      return filterMonth(d, currentMonth, currentYear);
    }).length;
    const totalCustomersStart = customers.length - newCustomers;
    const customersTrend =
      totalCustomersStart === 0
        ? 100
        : (newCustomers / totalCustomersStart) * 100;

    const formatTrend = (val: number) =>
      `${val > 0 ? "+" : ""}${val.toFixed(1)}%`;

    return {
      revenue: formatTrend(revenueTrend),
      orders: formatTrend(ordersTrend),
      products: formatTrend(productsTrend),
      customers: formatTrend(customersTrend),
    };
  }, [orders, products, customers]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "text-green-500 bg-green-500/10";
      case "PAID":
        return "text-blue-500 bg-blue-500/10";
      case "PENDING":
        return "text-yellow-500 bg-yellow-500/10";
      case "CANCELLED":
        return "text-red-500 bg-red-500/10";
      case "PROCESSING":
        return "text-orange-500 bg-orange-500/10";
      default:
        return "text-white bg-white/10";
    }
  };

  if (
    productsLoading ||
    ordersLoading ||
    customersLoading ||
    categoriesLoading
  ) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-black italic uppercase tracking-tighter leading-none">
            Dashboard
          </h1>
          <p className="text-sm text-black/40 font-semibold uppercase tracking-widest mt-2">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="border-black/5 bg-white text-black font-semibold italic px-4 py-2 rounded-xl shadow-sm"
          >
            SHOP STATUS: ONLINE
          </Badge>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            label: "Total Revenue",
            value: formatPrice(totalRevenue),
            icon: DollarSign,
            trend: statsTrends.revenue,
            color: "text-primary",
          },
          {
            label: "Total Orders",
            value: orders.length.toString(),
            icon: ShoppingCart,
            trend: statsTrends.orders,
            color: "text-blue-500",
          },
          {
            label: "Active Products",
            value: products.length.toString(),
            icon: Package,
            trend: statsTrends.products,
            color: "text-green-500",
          },
          {
            label: "Total Customers",
            value: customers.length.toString(),
            icon: Users,
            trend: statsTrends.customers,
            color: "text-purple-500",
          },
          {
            label: "Categories",
            value: categories.length.toString(),
            icon: Package,
            trend: "Config",
            color: "text-orange-500",
          },
          {
            label: "Pending Orders",
            value: orders
              .filter((o) => o.status === "PENDING")
              .length.toString(),
            icon: Bell,
            trend: "Action Required",
            color: "text-yellow-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#120f0f] rounded-3xl p-6 border border-white/5 relative overflow-hidden group hover:border-primary/50 transition-all shadow-xl"
          >
            <div className="relative z-10 space-y-2">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                {stat.label}
              </p>
              <p className="text-3xl font-semibold text-white italic tracking-tighter">
                {stat.value}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5",
                    stat.color
                  )}
                >
                  {stat.trend}
                </span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={120} />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Revenue Trend (Full Width) */}
      <div className="bg-[#120f0f] rounded-3xl md:rounded-4xl p-4 md:p-8 border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-semibold text-white uppercase italic tracking-tight">
              Revenue Trend
            </h3>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-1">
              Monthly performance analysis
            </p>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ChartContainer
            config={revenueConfig}
            className="h-full w-full aspect-auto"
          >
            <AreaChart
              data={revenueTrendData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "rgba(255,255,255,0.3)",
                  fontSize: 10,
                  fontWeight: 600,
                }}
                dy={10}
              />
              <YAxis hide />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="bg-[#1A1A1A] border-white/10"
                    indicator="line"
                    labelFormatter={(v) => `Month: ${v}`}
                    formatter={(v: any) => [`GHS ${v.toLocaleString()}`]}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#fillRevenue)"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>

      {/* Row 3: Category Mix & Order Status (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Percentage Pie Chart */}
        <div className="bg-[#120f0f] rounded-3xl md:rounded-4xl p-4 md:p-8 border border-white/5 flex flex-col shadow-2xl">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white uppercase italic tracking-tight">
              Category Mix
            </h3>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-1">
              Inventory distribution
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productStats}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    minAngle={5}
                    dataKey="value"
                  >
                    {productStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#1A1A1A] border border-white/10 p-3 rounded-xl shadow-2xl">
                            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1">
                              {payload[0].name}
                            </p>
                            <p className="text-sm font-bold text-white italic">
                              {payload[0].value} Items
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-4 mt-8 pt-8 border-t border-white/5">
            {productStats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                    {stat.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-white italic">
                    {Math.round((stat.value / (products.length || 1)) * 100)}%
                  </span>
                  <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        backgroundColor: stat.color,
                        width: `${
                          (stat.value / (products.length || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-[#120f0f] rounded-3xl md:rounded-4xl p-4 md:p-8 border border-white/5 flex flex-col shadow-2xl">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white uppercase italic tracking-tight">
              Order Status
            </h3>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-1">
              Lifecycle distribution
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    minAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#1A1A1A] border border-white/10 p-3 rounded-xl shadow-2xl text-white">
                            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1">
                              {payload[0].name}
                            </p>
                            <p className="text-sm font-bold italic">
                              {payload[0].value} Orders
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-4 mt-8 pt-8 border-t border-white/5">
            {orderStatusData.map((stat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                    {stat.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-white italic">
                    {Math.round(
                      (stat.count /
                        orderStatusData.reduce(
                          (acc, curr) => acc + curr.count,
                          0
                        )) *
                        100
                    )}
                    %
                  </span>
                  <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        backgroundColor: stat.color,
                        width: `${
                          (stat.count /
                            orderStatusData.reduce(
                              (acc, curr) => acc + curr.count,
                              0
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Orders List (Full Width) */}
      <div className="bg-[#0D0D0D] rounded-3xl md:rounded-4xl p-4 md:p-8 border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-semibold text-white uppercase italic tracking-tight">
              Recent Orders
            </h3>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-1">
              Latest 10 transactions
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/orders")}
            className="text-[10px] font-semibold uppercase tracking-widest text-primary hover:bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 transition-all"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto -mx-2">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.2em] text-left border-b border-white/5">
                <th className="px-4 pb-4">Order ID</th>
                <th className="px-4 pb-4">Customer</th>
                <th className="px-4 pb-4">Status</th>
                <th className="px-4 pb-4">Total</th>
                <th className="px-4 pb-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.slice(0, 10).map((order) => (
                <tr
                  key={order.id}
                  className="group hover:bg-white/2 transition-colors"
                >
                  <td className="px-4 py-4">
                    <span className="text-xs font-semibold text-white group-hover:text-primary transition-colors">
                      {order.id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white/80">
                        {order.customerName}
                      </span>
                      <span className="text-[10px] text-white/30 font-medium">
                        {order.customerEmail}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold uppercase italic border-none px-3 py-1",
                        getStatusColor(order.status)
                      )}
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-semibold text-primary italic tracking-tight">
                      {formatPrice(order.total)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications Row */}
      <div className="bg-[#120f0f] rounded-3xl md:rounded-4xl p-4 md:p-8 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Package className="h-64 w-64 text-white rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white uppercase italic tracking-tight">
                Recent Activity
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {orders.slice(0, 3).map((order, i) => (
                <div
                  key={i}
                  className="space-y-2 p-4 rounded-2xl bg-white/2 border border-white/5 group hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors leading-tight">
                      New Order #{order.id.slice(-6).toUpperCase()}
                    </h4>
                    <span className="text-[10px] font-semibold text-white/20 uppercase whitespace-nowrap">
                      Recently
                    </span>
                  </div>
                  <p className="text-xs text-white/40 font-medium leading-relaxed">
                    {order.customerName} placed an order for{" "}
                    {formatPrice(order.total)}.
                  </p>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-xs text-white/40 font-medium">
                  No recent activity yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
