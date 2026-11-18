import React, { useEffect, useState } from "react";
import AccountLayout from "./AccountLayout";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth/useAuth";
import { Skeleton } from "../common/Skeleton";
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, FileText, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  product: {
    name: string;
    image_url: string;
    images?: string[];
  };
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  order_items: OrderItem[];
}

interface RawOrderItem extends Omit<OrderItem, 'product'> {
  product: Array<{ name: string; image_url: string }> | { name: string; image_url: string };
}

interface RawOrder extends Omit<Order, 'order_items'> {
  order_items: RawOrderItem[];
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnComment, setReturnComment] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            created_at,
            status,
            total_amount,
            order_items (
              id,
              quantity,
              price_at_time,
              product:products (
                name,
                image_url,
                images
              )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        // Supabase join might return product as an array or object depending on schema/version
        // We map it to ensure it matches our interface
        const formattedOrders: Order[] = (data as unknown as RawOrder[] || []).map((order) => ({
          ...order,
          order_items: (order.order_items || []).map((item) => ({
            ...item,
            product: Array.isArray(item.product) ? item.product[0] : item.product
          }))
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !user?.id || !returnReason) return;
    setSubmittingReturn(true);
    try {
      const { error } = await supabase
        .from("return_requests")
        .insert({
          order_id: selectedOrder.id,
          user_id: user.id,
          reason: returnReason,
          admin_comment: returnComment
        });

      if (error) throw error;

      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: "Return request submitted!", type: "success" } 
      }));
      setShowReturnModal(false);
      setReturnReason("");
      setReturnComment("");
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("toast:show", { 
        detail: { message: error.message || "Failed to submit return", type: "error" } 
      }));
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    // We'll create a temporary print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.order_items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price_at_time.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.quantity * item.price_at_time).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 60px; }
            .logo { font-size: 32px; font-weight: 900; letter-spacing: -2px; font-style: italic; color: #FF69B4; }
            .invoice-title { font-size: 48px; font-weight: 900; color: #eee; margin-bottom: 20px; }
            .details { margin-bottom: 40px; display: grid; grid-template-cols: 1fr 1fr; gap: 40px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; background: #f9f9f9; padding: 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
            .totals { text-align: right; }
            .total-row { font-size: 24px; font-weight: 900; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
            .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">LKLN</div>
            <div class="invoice-box text-right">
              <div class="invoice-title">INVOICE</div>
              <p>Order ID: <b>#${order.id.slice(0, 8)}</b><br>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div class="details">
            <div>
              <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #999; margin-bottom: 5px;">Billed To</p>
              <p><b>${user?.email}</b><br>Verified Account Customer</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #999; margin-bottom: 5px;">Payment Status</p>
              <p><b style="color: #10b981;">SUCCESSFULLY PAID</b><br>Credit Card / Digital Wallet</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: ₹${(order.total_amount * 0.9).toFixed(2)}</p>
            <p>Tax (GST 18%): ₹${(order.total_amount * 0.1).toFixed(2)}</p>
            <div class="total-row">Total Paid: ₹${order.total_amount.toFixed(2)}</div>
          </div>
          <div class="footer">
            <p>Thank you for choosing Euphoria. Your style is our priority.</p>
            <p>www.euphoria-store.com | support@euphoria.com</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="text-amber-500" size={16} />;
      case "processing": return <Package className="text-blue-500" size={16} />;
      case "shipped": return <Truck className="text-indigo-500" size={16} />;
      case "delivered": return <CheckCircle className="text-green-500" size={16} />;
      case "cancelled": return <XCircle className="text-red-500" size={16} />;
      default: return <Clock className="text-gray-500" size={16} />;
    }
  };

  const formattedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <AccountLayout title="My Orders">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="My Orders">
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-bold italic">You haven't placed any orders yet.</p>
          <p className="text-sm text-gray-400 italic mt-1">Start shopping and track your orders here!</p>
        </div>
      ) : (
        <div className="space-y-8">
          <AnimatePresence>
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="bg-gray-50/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Order Placed</p>
                      <p className="text-sm font-bold text-gray-700 italic">{formattedDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Total Amount</p>
                      <p className="text-sm font-black text-pink-500 italic">₹{order.total_amount.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-100 shadow-sm">
                    {getStatusIcon(order.status)}
                    <span className="text-xs font-black uppercase tracking-wider text-gray-700 italic">
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl border border-gray-50 overflow-hidden shrink-0 bg-gray-50">
                          <img 
                            src={item.product?.images?.[0] || item.product?.image_url || "/placeholder.jpg"} 
                            alt={item.product?.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-bold text-gray-900 italic line-clamp-1">{item.product?.name}</h4>
                          <p className="text-xs text-gray-500 font-medium italic mt-0.5">Quantity: {item.quantity} · ₹{item.price_at_time.toLocaleString("en-IN")}</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                      </div>
                    ))}
                  </div>

                  {/* Amazon-style Tracking Timeline */}
                  <div className="pt-8 border-t border-slate-50">
                    <div className="relative">
                      {/* Tracking Line */}
                      <div className="absolute top-4 left-0 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: order.status === 'pending' ? '12%' : 
                                   order.status === 'processing' ? '37%' : 
                                   order.status === 'shipped' ? '62%' : 
                                   order.status === 'delivered' ? '100%' : '0%' 
                          }}
                          className={`h-full rounded-full ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-pink-500 shadow-[0_0_10px_rgba(255,105,180,0.5)]'}`}
                        />
                      </div>

                      {/* Status Nodes */}
                      <div className="relative flex justify-between">
                        {[
                          { label: 'Placed', icon: Clock, key: 'pending' },
                          { label: 'Processing', icon: Package, key: 'processing' },
                          { label: 'Shipped', icon: Truck, key: 'shipped' },
                          { label: 'Delivered', icon: CheckCircle, key: 'delivered' },
                          { label: 'Returned', icon: RotateCcw, key: 'returned' }
                        ].map((node) => {
                          const steps = ['pending', 'processing', 'shipped', 'delivered', 'returned'];
                          const currentIdx = steps.indexOf(order.status);
                          const nodeIdx = steps.indexOf(node.key);
                          const isActive = nodeIdx <= currentIdx;
                          const isCurrent = nodeIdx === currentIdx;

                          return (
                            <div key={node.key} className="flex flex-col items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                                isActive 
                                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-100 scale-110' 
                                  : 'bg-white border-2 border-slate-100 text-slate-300'
                              } ${isCurrent ? 'animate-pulse ring-4 ring-pink-50' : ''}`}>
                                <node.icon size={18} />
                              </div>
                              <div className="text-center">
                                <p className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {node.label}
                                </p>
                                {isCurrent && (
                                  <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[8px] font-bold text-pink-500 italic block mt-0.5"
                                  >
                                    Current
                                  </motion.span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                   <div className="flex gap-4">
                      <button 
                        onClick={() => handleDownloadInvoice(order)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-pink-500 transition-colors italic"
                      >
                         <FileText size={14} /> Download Invoice
                      </button>
                      {order.status === 'delivered' && (
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowReturnModal(true);
                          }}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors italic"
                        >
                           <RotateCcw size={14} /> Request Return
                        </button>
                      )}
                   </div>
                   <button className="text-xs font-black text-[#FF69B4] hover:text-pink-700 italic uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                      View Track Detail
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Return Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReturnModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-xl p-10 relative z-10 shadow-2xl"
            >
              <h2 className="text-3xl font-black italic tracking-tighter mb-2">Request Return <span className="text-pink-500 text-4xl">.</span></h2>
              <p className="text-slate-400 font-bold italic uppercase tracking-widest text-[10px] mb-8">Order ID: #{selectedOrder?.id?.slice(0, 8)}</p>

              <form onSubmit={handleReturnSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Select Reason</label>
                  <select 
                    required
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold italic outline-none focus:border-[#FF69B4] transition-all"
                  >
                    <option value="">Choose a reason...</option>
                    <option value="wrong_size">Wrong Size / Fit</option>
                    <option value="defective">Defective / Damaged</option>
                    <option value="different_from_desc">Different from Description</option>
                    <option value="changed_mind">Changed my mind</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Additional Details</label>
                  <textarea 
                    value={returnComment}
                    onChange={(e) => setReturnComment(e.target.value)}
                    placeholder="Tell us more about the issue..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 h-32 font-medium italic outline-none focus:border-pink-500 transition-all"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    disabled={submittingReturn}
                    className="flex-grow bg-slate-900 text-white py-5 rounded-2xl font-black italic text-lg hover:bg-black transition-all shadow-xl disabled:bg-slate-300"
                  >
                    {submittingReturn ? "Submitting..." : "Submit Request"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowReturnModal(false)}
                    className="px-8 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AccountLayout>
  );
};

export default Orders;
