import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../apiConfig";
import { 
  User, Mail, Phone, MapPin, 
  Shield, Key, Save, Edit2, 
  Camera, Briefcase, Building
} from "lucide-react";
import { motion } from "framer-motion";

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    email: "", 
    phone: "", 
    address: "", 
    emergency_contact: "" 
  });
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/employee-portal/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setFormData({ 
        email: res.data.email,
        phone: res.data.phone || "",
        address: res.data.address || "",
        emergency_contact: res.data.emergency_contact || ""
      });
      if (res.data.profile_photo) {
        setPreviewUrl(`${API_URL}${res.data.profile_photo}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    const formDataPhoto = new FormData();
    formDataPhoto.append("photo", selectedFile);
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${API_URL}/api/employee-portal/profile/upload-photo`, formDataPhoto, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Photo uploaded!");
      fetchProfile();
      window.dispatchEvent(new Event('profileUpdate'));
    } catch (err) {
      alert("Photo upload failed");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${API_URL}/api/employee-portal/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchProfile();
      window.dispatchEvent(new Event('profileUpdate'));
      alert("Profile updated!");
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${API_URL}/api/employee-portal/change-password`, passData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPassData({ oldPassword: "", newPassword: "" });
      alert("Password updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Password update failed");
    }
  };

  if (!profile) return <div className="p-8 font-black text-slate-400 uppercase animate-pulse">Loading Profile...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Profile Info */}
      <div className="xl:col-span-1 space-y-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 to-blue-700"></div>
          <div className="relative z-10 pt-16">
            <div className="w-32 h-32 rounded-3xl bg-white p-1 mx-auto shadow-xl group relative cursor-pointer overflow-hidden">
              <div className="w-full h-full rounded-[20px] bg-indigo-50 flex items-center justify-center text-indigo-600 border-4 border-white overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} strokeWidth={1.5} />
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
            
            {selectedFile && (
              <button 
                onClick={handleUploadPhoto}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-lg hover:bg-emerald-700 transition"
              >
                Save New Photo
              </button>
            )}

            <h2 className="text-2xl font-black text-slate-800 mt-6">{profile.name}</h2>
            <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">{profile.position}</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase">ID</p>
                <p className="text-sm font-black text-slate-800">{profile.emp_id}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase">Balance</p>
                <p className="text-sm font-black text-indigo-600">{profile.leave_balance} Days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
          <h3 className="text-lg font-black text-slate-800 border-b border-slate-50 pb-4">Job Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center"><Building size={20} /></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Department</p><p className="text-sm font-bold text-slate-700">{profile.department}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center"><Briefcase size={20} /></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Join Date</p><p className="text-sm font-bold text-slate-700">{new Date(profile.join_date).toLocaleDateString()}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Section */}
      <div className="xl:col-span-2 space-y-8">
        {/* Settings Form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800">Personal Information</h3>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-xl transition"
            >
              {isEditing ? "Cancel" : <><Edit2 size={16} /> Edit Profile</>}
            </button>
          </div>
          <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  disabled={!isEditing} 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full rounded-xl px-4 py-3 font-bold text-sm transition outline-none ${isEditing ? 'bg-white border border-indigo-200 ring-4 ring-indigo-50' : 'bg-slate-100 border-none text-slate-500 cursor-not-allowed'}`} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                <input 
                  type="text" 
                  disabled={!isEditing} 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full rounded-xl px-4 py-3 font-bold text-sm transition outline-none ${isEditing ? 'bg-white border border-indigo-200 ring-4 ring-indigo-50' : 'bg-slate-100 border-none text-slate-500 cursor-not-allowed'}`} 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                <textarea 
                  disabled={!isEditing} 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={`w-full rounded-xl px-4 py-3 font-bold text-sm transition outline-none min-h-[80px] ${isEditing ? 'bg-white border border-indigo-200 ring-4 ring-indigo-50' : 'bg-slate-100 border-none text-slate-500 cursor-not-allowed'}`} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact</label>
                <input 
                  type="text" 
                  disabled={!isEditing} 
                  value={formData.emergency_contact} 
                  onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  className={`w-full rounded-xl px-4 py-3 font-bold text-sm transition outline-none ${isEditing ? 'bg-white border border-indigo-200 ring-4 ring-indigo-50' : 'bg-slate-100 border-none text-slate-500 cursor-not-allowed'}`} 
                />
              </div>
            </div>
            {isEditing && (
              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition flex items-center gap-2">
                  <Save size={18} /> Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 bg-slate-50 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-800">Security & Password</h3>
          </div>
          <form onSubmit={handleChangePassword} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition" 
                    value={passData.oldPassword}
                    onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition" 
                    value={passData.newPassword}
                    onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-slate-800 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-slate-200 hover:bg-slate-900 transition flex items-center gap-2">
                <Shield size={18} /> Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
