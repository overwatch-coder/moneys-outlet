'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStatus } from "@/components/StatusOverlay";
import { User, Lock, Mail, ShieldHalf, Loader2, Truck } from "lucide-react";
import { dataService } from "@/lib/dataService";
import { useSession } from "next-auth/react";
import { updateUserEmailAction, changeUserPasswordAction } from "@/actions/user";

function ShippingFeeSettings() {
  const [fee, setFee] = useState("0");
  const [loading, setLoading] = useState(false);
  const showStatus = useStatus((state) => state.showStatus);

  useEffect(() => {
    fetchFee();
  }, []);

  const fetchFee = async () => {
    try {
      setLoading(true);
      const val = await dataService.getStoreSetting("shipping_fee");
      if (val) {
        setFee(val);
      }
    } catch (error) {
      showStatus("error", "Error", "Failed to fetch shipping fee");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await dataService.updateStoreSetting("shipping_fee", fee);
      showStatus("success", "Saved", "Shipping fee updated");
    } catch (error: any) {
      showStatus("error", "Error", error.message || "Failed to save shipping fee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0D0D0D] rounded-[40px] p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <Truck className="h-40 w-40" />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
          <Truck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg md:text-2xl font-semibold text-white italic uppercase tracking-tight">
            Store Configuration
          </h2>
          <p className="text-white/40 text-xs md:text-sm font-bold uppercase tracking-widest">
            Manage global store settings
          </p>
        </div>
      </div>

      <div className="space-y-6 relative z-10 max-w-md">
        <div className="space-y-2">
          <Label className="text-[10px] font-semibold uppercase text-white/40 ml-1 tracking-[0.2em]">
            Shipping / Delivery Fee
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-bold">
              ₵
            </span>
            <Input
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="bg-white/5 border-white/10 text-white pl-8 h-14 rounded-2xl focus-visible:ring-blue-500 focus-visible:bg-white/10 transition-all font-bold"
              placeholder="0.00"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/80 text-white font-semibold italic uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            "Update Fee"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const [email, setEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const showStatus = useStatus((state) => state.showStatus);

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasswordForEmail) {
      showStatus(
        "error",
        "Error",
        "Current password required to update email."
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateUserEmailAction(currentPasswordForEmail, email);
      if (!res.success) {
        throw new Error(res.error);
      }

      showStatus(
        "success",
        "Account Updated",
        "Your email has been updated successfully."
      );
      setCurrentPasswordForEmail("");
    } catch (error: any) {
      showStatus("error", "Failed to update", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showStatus("error", "Error", "Current password is required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showStatus("error", "Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await changeUserPasswordAction(currentPassword, newPassword);
      if (!res.success) {
        throw new Error(res.error);
      }

      showStatus(
        "success",
        "Password Changed",
        "Your password has been updated successfully."
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showStatus("error", "Failed to update password", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2 md:p-8 space-y-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-semibold text-black italic uppercase tracking-tighter">
        Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Information */}
        <div className="bg-[#0D0D0D] rounded-[40px] p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <User className="h-40 w-40" />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-semibold text-white italic uppercase tracking-tight">
                Account Information
              </h2>
              <p className="text-white/40 text-xs md:text-sm font-bold uppercase tracking-widest">
                Update your profile details
              </p>
            </div>
          </div>

          <form
            onSubmit={handleUpdateAccount}
            className="space-y-6 relative z-10"
          >
            <div className="space-y-2">
              <Label className="text-[10px] font-semibold uppercase text-white/40 ml-1 tracking-[0.2em]">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white pl-12 h-14 rounded-2xl focus-visible:ring-primary focus-visible:bg-white/10 transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-semibold uppercase text-white/40 ml-1 tracking-[0.2em]">
                Current Password (required to save changes)
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                <Input
                  type="password"
                  value={currentPasswordForEmail}
                  onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white pl-12 h-14 rounded-2xl focus-visible:ring-primary focus-visible:bg-white/10 transition-all font-bold"
                  placeholder="Verify password to change details"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-semibold uppercase text-white/40 ml-1 tracking-[0.2em]">
                System Role
              </Label>
              <div className="relative">
                <ShieldHalf className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                <Input
                  value="ADMIN"
                  disabled
                  className="bg-white/5 border-white/10 text-white/40 pl-12 h-14 rounded-2xl cursor-not-allowed font-semibold italic uppercase tracking-wider"
                />
              </div>
            </div>

            <Button
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold italic uppercase tracking-widest h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-[#0D0D0D] rounded-[40px] p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <Lock className="h-40 w-40" />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-semibold text-white italic uppercase tracking-tight">
                Security & Access
              </h2>
              <p className="text-white/40 text-xs md:text-sm font-bold uppercase tracking-widest">
                Change your account password
              </p>
            </div>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="space-y-5 relative z-10"
          >
            <div className="space-y-2">
              <Label className="text-[10px] font-semibold uppercase text-white/40 ml-1 tracking-[0.2em]">
                Current Password
              </Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus-visible:ring-primary focus-visible:bg-white/10 transition-all font-bold"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase text-white/40 ml-1 tracking-[0.2em]">
                  New Password
                </Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus-visible:ring-primary focus-visible:bg-white/10 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-semibold uppercase text-white/40 ml-1 tracking-[0.2em]">
                  Confirm New Password
                </Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-14 rounded-2xl focus-visible:ring-primary focus-visible:bg-white/10 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-white/90 font-semibold italic uppercase tracking-widest h-14 rounded-2xl mt-2 transition-all hover:scale-[1.02] shadow-xl shadow-white/5"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Update Security"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* store settings */}
      <ShippingFeeSettings />
    </div>
  );
}
