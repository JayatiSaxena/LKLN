import React, { useState, useEffect } from "react";
import { orderService, type Order, type OrderItem } from "../../lib/api/services/orders";
import { 
  Search, 
  ChevronRight, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminOrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    try {
      setLoadingItems(true);
      const items = await orderService.getOrderDetails(order.id);
      setOrderItems(items);
    } catch (error) {
      console.error("Error fetching order items:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-orange-500" />;
      case 'processing': return <Package size={16} className="text-blue-500" />;
      case 'shipped': return <Truck size={16} className="text-[#FF69B4]" />;
      case 'delivered': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
    }
  };

  return (
    <div className="space-y-10 min-h-screen bg-[#FFF5F7] p-8 md:p-12">
      <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Recent Orders</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">Track and manage customer purchases.</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search orders, customers..." 
                className="pl-12 pr-6 py-3 bg-white/50 rounded-2xl border-none focus:ring-2 focus:ring-pink-500 transition-all font-medium text-sm w-full md:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === status 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                    : 'bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Order ID</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                     <td colSpan={6} className="px-8 py-6">
                        <div className="h-4 w-full bg-slate-50 rounded" />
                     </td>
                  </tr>
                ))
              ) : filteredOrders.map((order) => (
                <motion.tr 
                  key={order.id}
                  layout
                  className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedOrder?.id === order.id ? 'bg-pink-50/30' : ''}`}
                  onClick={() => viewOrderDetails(order)}
                >
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-bold text-slate-900 tracking-tight">{order.profiles?.full_name || 'Guest User'}</p>
                      <p className="text-[10px] font-medium text-slate-500 line-clamp-1">{order.profiles?.email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-slate-900">
                    ₹{order.total_amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       {getStatusIcon(order.status)}
                       <span className="text-xs font-black uppercase tracking-widest text-slate-700">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-300 group-hover:text-[#FF69B4] transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredOrders.length === 0 && (
          <div className="p-20 text-center">
             <h3 className="text-xl font-black text-slate-900">No orders found</h3>
             <p className="text-slate-500 font-medium mt-2 text-black">We couldn't find any orders matching your search.</p>
          </div>
        )}
      </div>

      {/* Order Details Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
               <div>
                  <h2 className="text-3xl font-black tracking-tight">Order Details</h2>
                  <p className="text-slate-400 font-medium mt-1 uppercase tracking-widest text-xs">ID: #{selectedOrder.id}</p>
               </div>
               <div className="flex bg-white/5 p-2 rounded-2xl gap-2">
                  {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map(status => (
                    <button
                      key={status}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(selectedOrder.id, status);
                      }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedOrder.status === status 
                        ? 'bg-[#FF69B4] text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
                     <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Customer Information</h3>
                     <div className="space-y-4">
                        <div className="flex justify-between">
                           <span className="text-slate-400 text-sm">Full Name</span>
                           <span className="font-bold">{selectedOrder.profiles?.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-slate-400 text-sm">Email</span>
                           <span className="font-bold">{selectedOrder.profiles?.email}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-slate-400 text-sm">Shipping Address</span>
                           <span className="font-bold text-right max-w-[200px]">{selectedOrder.shipping_address}</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
                     <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Order Summary</h3>
                     <div className="space-y-4">
                        <div className="flex justify-between">
                           <span className="text-slate-400 text-sm">Payment Method</span>
                           <span className="font-bold uppercase tracking-widest text-xs">{selectedOrder.payment_method}</span>
                        </div>
                        <div className="flex justify-between pt-4 border-t border-white/10">
                           <span className="text-slate-200 font-black">Total Paid</span>
                           <span className="text-2xl font-black text-[#FF69B4]">₹{selectedOrder.total_amount.toLocaleString("en-IN")}</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] text-slate-900 border border-slate-100">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                     <Package size={18} />
                     Items in Order
                  </h3>
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                     {loadingItems ? (
                        <div className="py-20 flex justify-center">
                           <div className="w-8 h-8 border-2 border-slate-200 border-t-[#FF69B4] rounded-full animate-spin"></div>
                        </div>
                     ) : orderItems.map((item) => (
                        <div key={item.id} className="flex gap-4 group">
                           <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-50 shrink-0">
                              <img 
                                src={item.products?.images?.[0] || item.products?.image_url || "/placeholder.jpg"} 
                                alt={item.products?.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                              />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-black tracking-tight text-slate-900 truncate">{item.products?.name}</h4>
                              <div className="flex items-center gap-4 mt-1">
                                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Qty: {item.quantity}</span>
                                 {item.size && <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Size: {item.size}</span>}
                              </div>
                              <p className="font-black text-[#FF69B4] mt-2">₹{(item.price_at_time * item.quantity).toLocaleString("en-IN")}</p>
                           </div>
                           <button className="self-center p-3 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-900 transition-all">
                              <ExternalLink size={18} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrderList;
