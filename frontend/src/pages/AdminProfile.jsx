import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";

export default function AdminProfile() {
  const [profile, setProfile] = useState({});
  const [activeTab, setActiveTab] = useState("view"); // view, edit, password
  const [editData, setEditData] = useState({ name: "", phone: "", address: "" });
  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadProfile = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setEditData({ name: res.data.name, phone: res.data.phone || "", address: res.data.address || "" });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });
  const handlePassChange = (e) => setPassData({ ...passData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/admin/profile`, editData, { headers: { Authorization: `Bearer ${token}` } });
      setMessage({ type: "success", text: "Profile updated successfully!" });
      loadProfile();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile." });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      return setMessage({ type: "error", text: "New passwords do not match." });
    }
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/admin/change-password`, passData, { headers: { Authorization: `Bearer ${token}` } });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Password change failed." });
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage({ type: "error", text: "Please select an image." });
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}/api/admin/upload-photo`, formData, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      setMessage({ type: "success", text: "Photo uploaded successfully!" });
      loadProfile();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to upload photo." });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Profile</h2>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Photo & Basic Info */}
          <div className="md:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-4 border-4 border-white shadow-lg">
              {profile.profile_image ? (
                <img src={`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://salary-management-64wa.onrender.com'}${profile.profile_image}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full uppercase tracking-wide mt-1 font-semibold">{profile.role || 'Admin'}</span>
            
            <form onSubmit={handlePhotoUpload} className="mt-6 w-full flex flex-col gap-2">
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-sm w-full file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <button type="submit" className="w-full bg-gray-100 text-gray-700 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Upload Photo</button>
            </form>
          </div>

          {/* Right Column: Tabs & Forms */}
          <div className="md:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button onClick={() => setActiveTab('view')} className={`flex-1 py-4 font-semibold text-sm transition ${activeTab === 'view' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}>Overview</button>
              <button onClick={() => setActiveTab('edit')} className={`flex-1 py-4 font-semibold text-sm transition ${activeTab === 'edit' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}>Edit Profile</button>
              <button onClick={() => setActiveTab('password')} className={`flex-1 py-4 font-semibold text-sm transition ${activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}>Security</button>
            </div>

            <div className="p-6">
              {activeTab === 'view' && (
                <div className="space-y-4">
                  <div><p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Email</p><p className="font-medium text-gray-800">{profile.email}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Phone</p><p className="font-medium text-gray-800">{profile.phone || 'Not set'}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Address</p><p className="font-medium text-gray-800">{profile.address || 'Not set'}</p></div>
                  <div><p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Member Since</p><p className="font-medium text-gray-800">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p></div>
                </div>
              )}

              {activeTab === 'edit' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div><label className="block text-sm text-gray-600 mb-1">Full Name</label><input type="text" name="name" value={editData.name} onChange={handleEditChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" required /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">Phone Number</label><input type="text" name="phone" value={editData.phone} onChange={handleEditChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">Address</label><textarea name="address" value={editData.address} onChange={handleEditChange} rows="3" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"></textarea></div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition">Save Changes</button>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div><label className="block text-sm text-gray-600 mb-1">Current Password</label><input type="password" name="currentPassword" value={passData.currentPassword} onChange={handlePassChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" required /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">New Password</label><input type="password" name="newPassword" value={passData.newPassword} onChange={handlePassChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" required /></div>
                  <div><label className="block text-sm text-gray-600 mb-1">Confirm New Password</label><input type="password" name="confirmPassword" value={passData.confirmPassword} onChange={handlePassChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none" required /></div>
                  <button type="submit" className="w-full bg-red-600 text-white font-bold py-2.5 rounded-lg hover:bg-red-700 transition">Update Password</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
