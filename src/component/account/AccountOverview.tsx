import React, { useState } from "react";
import { useAuth } from "../../lib/auth/useAuth";
import AccountLayout from "./AccountLayout";
import { User, Mail, ShieldCheck, Calendar, Phone } from "lucide-react";
import userIcon from "../../assets/svgs/user.svg";
import { SmartImage } from "../common/SmartImage";
import { useAuthStore } from "../../store/useAuthStore";
import EditProfileModal from "./EditProfileModal";

const AccountOverview: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const infoItems = [
    { label: "Full Name", value: user?.name || "Not set", icon: User },
    { label: "Email Address", value: user?.email || "Not set", icon: Mail },
    { label: "Phone Number", value: user?.phone || "Not set", icon: Phone },
    { label: "Account Status", value: "Verified", icon: ShieldCheck, color: "text-green-500" },
    { label: "Member Since", value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Recently", icon: Calendar },
  ];

  return (
    <AccountLayout title="Profile Overview">
      <div className="flex items-center gap-6 mb-10 p-8 rounded-[2.5rem] bg-pink-500 text-white relative overflow-hidden shadow-xl shadow-pink-100">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck size={120} />
        </div>
        <div className="h-24 w-24 rounded-3xl overflow-hidden border-4 border-white/10 relative z-10 shadow-2xl">
          <SmartImage 
            src={user?.picture || userIcon} 
            alt={user?.name || "User"} 
            className="h-full w-full object-cover" 
          />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black tracking-tight mb-1 italic">Welcome back,</h3>
          <p className="text-3xl font-black text-pink-400 tracking-tighter italic uppercase">{user?.name || "Member"}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {infoItems.map((item, index) => (
          <div key={index} className="p-6 rounded-2xl bg-white border border-pink-50 flex items-start gap-4 hover:shadow-lg transition-all duration-300">
            <div className="p-3 bg-pink-50 rounded-xl shadow-sm text-pink-500">
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 italic">{item.label}</p>
              <p className={`font-bold italic ${item.color || "text-gray-900"}`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-pink-50 border border-pink-100 rounded-3xl p-8 mb-10">
        <h4 className="text-lg font-black text-pink-900 italic mb-2">Account Security</h4>
        <p className="text-sm text-pink-700 italic font-medium mb-6">
          Your account is protected with industry-standard encryption. You can update your password or manage linked social accounts anytime.
        </p>
        <button className="text-sm font-black text-pink-500 hover:text-pink-800 italic uppercase tracking-widest">
          Change Password →
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => logout()}
          className="px-8 py-3.5 rounded-2xl bg-red-500 text-white font-black italic shadow-lg shadow-red-100 hover:bg-red-600 transition-all uppercase tracking-wider text-sm"
        >
          Sign Out
        </button>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="px-8 py-3.5 rounded-2xl border-2 border-gray-100 text-gray-500 font-black italic hover:bg-gray-50 transition-all uppercase tracking-wider text-sm"
        >
          Edit Profile
        </button>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user} 
        onUpdate={() => {
          // The store will be updated by the modal's internal logic or via AuthProvider if we refresh session
          // For now, modal handles toast and onClose. 
          // If we want immediate UI update without refresh, we might need a store update call.
          useAuthStore.getState().refreshProfile();
        }}
      />
    </AccountLayout>
  );
};

export default AccountOverview;
