import { useState, useMemo } from "react";
import {
  Search,
  Eye,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  X,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStatus } from "@/components/StatusOverlay";
import { formatPrice, cn } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";
import { dataService } from "@/lib/dataService";
import LoadingScreen from "@/components/LoadingScreen";

const ITEMS_PER_PAGE = 10;

export default function AdminOrders() {
  const { orders, isLoading, mutate } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const showStatus = useStatus((state) => state.showStatus);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await dataService.updateOrderStatus(orderId, newStatus);
      showStatus(
        "success",
        "Status Updated",
        `Order ${orderId.slice(-6).toUpperCase()} is now ${newStatus}`
      );
      mutate();
    } catch (error: any) {
      showStatus("error", "Error", error.message || "Failed to update status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "PROCESSING":
        return <RefreshCcw className="h-4 w-4" />;
      case "SHIPPED":
        return <Truck className="h-4 w-4" />;
      case "DELIVERED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "PROCESSING":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "SHIPPED":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "DELIVERED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "";
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <h1 className="text-4xl font-semibold text-black italic uppercase tracking-tighter leading-none">
          Orders
        </h1>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="bg-white border-black/5 text-black/80 font-semibold italic uppercase px-4 py-2 rounded-xl"
          >
            Total Orders: {orders.length}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm space-y-4">
        <div className="flex flex-col gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/30" />
            <Input
              placeholder="Search by ID, Customer Name or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-black/5 border-none h-12 rounded-xl text-black placeholder:text-black/30 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "h-12 border-black/5 rounded-xl px-4 gap-2",
                isFilterOpen && "bg-black text-white"
              )}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-black/5 animate-in slide-in-from-top-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase text-black/40 ml-1">
                Order Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-50 h-11 bg-black/5 border-none rounded-xl text-black">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border-black/10">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-[#0D0D0D] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-8 py-5 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                  Order Details
                </th>
                <th className="px-8 py-5 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                  Customer
                </th>
                <th className="px-8 py-5 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-4 lg:px-8 py-5 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
                  Total
                </th>
                <th className="px-8 py-5 text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-white/20" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                          {order.readableId || order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-white/80">
                      {order.customerName}
                    </p>
                    <p className="text-[10px] text-white/30 font-medium">
                      {order.customerEmail}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-3 py-1 text-[10px] font-semibold uppercase italic items-center gap-1.5",
                        getStatusColor(order.status)
                      )}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-semibold text-primary italic tracking-tight">
                      {formatPrice(order.total)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                        className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#1A1A1A] border-white/10 text-white"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(order.id, "PROCESSING")
                            }
                            className="hover:bg-white/5 font-bold uppercase italic text-[10px] tracking-widest cursor-pointer"
                          >
                            Set Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(order.id, "SHIPPED")
                            }
                            className="hover:bg-white/5 font-bold uppercase italic text-[10px] tracking-widest cursor-pointer"
                          >
                            Set Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(order.id, "DELIVERED")
                            }
                            className="hover:bg-white/5 font-bold uppercase italic text-[10px] tracking-widest cursor-pointer"
                          >
                            Set Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(order.id, "CANCELLED")
                            }
                            className="hover:bg-red-500/10 text-red-500 font-bold uppercase italic text-[10px] tracking-widest cursor-pointer"
                          >
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/5">
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
              Showing{" "}
              <span className="text-white">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="text-white">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
              </span>{" "}
              results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="h-10 w-10 border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-20 rounded-xl"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="h-10 w-10 border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-20 rounded-xl"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(val) => !val && setSelectedOrder(null)}
        modal={false}
      >
        <DialogContent
          className="bg-white border-none max-w-2xl p-0 overflow-hidden rounded-[20px]"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Order Details</DialogTitle>
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-black/5 rounded-2xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-black/20" />
                </div>
                <div>
                  <h2 className="text-lg md:text-3xl font-semibold text-black tracking-tight uppercase italic leading-none">
                    Order Details
                  </h2>
                  <p className="text-[10px] font-semibold text-black/40 uppercase tracking-[0.2em] mt-1">
                    #{selectedOrder?.readableId.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="h-8 w-8 rounded-full border border-red-500 flex items-center justify-center hover:bg-red-50 transition-all shadow-sm"
              >
                <X className="h-5 w-5 text-red-500" strokeWidth={3} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase text-black/40 ml-1">
                    Customer Info
                  </Label>
                  <div className="bg-black/5 p-4 rounded-xl space-y-1">
                    <p className="text-sm font-semibold text-black">
                      {selectedOrder?.customerName}
                    </p>
                    <p className="text-xs font-semibold text-black/40">
                      {selectedOrder?.customerEmail}
                    </p>
                    <p className="text-xs font-semibold text-black/40">
                      {selectedOrder?.shippingAddress}
                    </p>
                    <p className="text-xs font-semibold text-black/40">
                      {selectedOrder?.customerPhone}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-semibold uppercase text-black/40 ml-1">
                    Order Status
                  </Label>
                  <div className="flex">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-4 py-2 font-semibold italic uppercase text-xs rounded-xl",
                        getStatusColor(selectedOrder?.status || "")
                      )}
                    >
                      {selectedOrder?.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase text-black/40 ml-1">
                  Items Summary
                </Label>
                <div className="bg-black/5 rounded-xl overflow-hidden border border-black/5">
                  {selectedOrder?.items?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 flex items-center justify-between border-b border-black/5 last:border-none"
                    >
                      <div>
                        <p className="text-xs font-semibold text-black leading-none">
                          {item.product?.name || "Product"}
                        </p>
                        <p className="text-[10px] font-bold text-black/40 uppercase mt-1">
                          QTY: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-primary italic">
                        {formatPrice(item.quantity * item.price)}
                      </span>
                    </div>
                  ))}
                  <div className="bg-primary text-white p-4 flex justify-between items-center">
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      Total Amount
                    </span>
                    <span className="text-lg font-semibold italic">
                      {formatPrice(selectedOrder?.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="flex-1 h-14 border-black/10 rounded-xl text-white hover:text-black font-bold uppercase tracking-widest hover:bg-black/5"
              >
                Close Window
              </Button>
              {selectedOrder?.status === "PENDING" && (
                <Button
                  onClick={() =>
                    handleStatusChange(selectedOrder.id, "PROCESSING")
                  }
                  className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-semibold italic uppercase tracking-widest rounded-xl"
                >
                  Approve Order
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
