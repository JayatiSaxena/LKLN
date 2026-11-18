import React from "react";
import AccountLayout from "./AccountLayout";
import { MapPin, Plus, Home, Briefcase, Trash2, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

const Addresses: React.FC = () => {
  const sampleAddresses = [
    {
      id: 1,
      type: "Home",
      name: "Jhon Smith",
      phone: "+91 9876543210",
      address: "123, Luxury Apartments, Whitefield",
      city: "Bangalore",
      state: "Karnataka",
      zip: "560066",
      isDefault: true,
      icon: Home
    },
    {
      id: 2,
      type: "Office",
      name: "Jhon Smith",
      phone: "+91 9876543210",
      address: "456, Business Tech Park, Indiranagar",
      city: "Bangalore",
      state: "Karnataka",
      zip: "560038",
      isDefault: false,
      icon: Briefcase
    }
  ];

  return (
    <AccountLayout title="Saved Addresses">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-gray-500 italic font-medium">Manage your delivery addresses for a faster checkout experience.</p>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#FF69B4] text-white rounded-2xl font-black italic hover:bg-[#FF4081] transition-all shadow-lg shadow-pink-100 uppercase tracking-widest text-xs">
          <Plus size={16} /> Add New Address
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {sampleAddresses.map((addr, index) => (
          <motion.div
            key={addr.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-8 rounded-3xl border-2 transition-all duration-300 group ${
              addr.isDefault 
                ? "border-[#FF69B4] bg-pink-50/30" 
                : "border-gray-100 bg-white hover:border-pink-200"
            }`}
          >
            {addr.isDefault && (
              <span className="absolute -top-3 left-8 bg-[#FF69B4] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                Default Address
              </span>
            )}

            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 rounded-2xl shadow-sm ${addr.isDefault ? "bg-[#FF69B4] text-white" : "bg-gray-50 text-gray-400 group-hover:text-[#FF69B4] transition-colors"}`}>
                <addr.icon size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#FF69B4] hover:border-pink-200 shadow-sm transition-all">
                    <Edit2 size={16} />
                 </button>
                 <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all">
                    <Trash2 size={16} />
                 </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-black text-gray-900 italic mb-1">{addr.name}</h4>
                <p className="text-sm text-gray-500 font-bold italic tracking-wide">{addr.phone}</p>
              </div>
              
              <div className="flex gap-3 text-gray-600 italic font-medium">
                <MapPin size={18} className="shrink-0 text-gray-300" />
                <p className="text-sm leading-relaxed">
                  {addr.address}, {addr.city},<br />
                  {addr.state} - {addr.zip}
                </p>
              </div>
            </div>

            {!addr.isDefault && (
              <button className="mt-8 text-xs font-black text-[#FF69B4] hover:text-[#FF4081] italic uppercase tracking-widest pt-6 border-t border-gray-100 w-full text-left">
                Set as Default Address →
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </AccountLayout>
  );
};

export default Addresses;
