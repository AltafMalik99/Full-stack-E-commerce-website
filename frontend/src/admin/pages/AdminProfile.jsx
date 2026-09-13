import { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { adminUpdateProfile, adminChangePassword } from "../../services/adminApi";
import { resolveImageUrl } from "../../services/api";
import { fetchCurrentUser } from "../../redux/authSlice";
import PageHeader from "../components/PageHeader";
import Toast from "../../components/Toast";

export default function AdminProfile() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState({ name: user?.name || "", email: user?.email || "" });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const [toastMsg, setToastMsg] = useState("");

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError(null);
    const fd = new FormData();
    fd.append("name", profileData.name);
    fd.append("email", profileData.email);
    if (profileImageFile) fd.append("profileImage", profileImageFile);

    try {
      setProfileSaving(true);
      await adminUpdateProfile(fd);
      dispatch(fetchCurrentUser());
      setToastMsg("Profile updated successfully!");
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError(null);

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordSaving(true);
      await adminChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setToastMsg("Password changed successfully!");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div>
      <Toast open={Boolean(toastMsg)} message={toastMsg} onClose={() => setToastMsg("")} />

      <PageHeader title="Admin Profile" subtitle="Manage your account information" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile info */}
        <form onSubmit={handleProfileSubmit} className="admin-card space-y-4">
          <h3 className="text-white font-semibold mb-2">Account Information</h3>

          {profileError && (
            <p className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2">{profileError}</p>
          )}

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-admin-accent flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={resolveImageUrl(user.profileImage)}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="admin-input text-xs"
              onChange={(e) => setProfileImageFile(e.target.files[0])}
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Name</label>
            <input
              className="admin-input"
              value={profileData.name}
              onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Email</label>
            <input
              type="email"
              className="admin-input"
              value={profileData.email}
              onChange={(e) => setProfileData((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          <button type="submit" className="admin-btn-primary" disabled={profileSaving}>
            {profileSaving ? "Saving..." : "Update Profile"}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={handlePasswordSubmit} className="admin-card space-y-4">
          <h3 className="text-white font-semibold mb-2">Change Password</h3>

          {passwordError && (
            <p className="bg-red-500/10 text-red-400 text-sm rounded-lg px-3 py-2">{passwordError}</p>
          )}

          <div>
            <label className="block text-sm text-white/70 mb-1">Current Password</label>
            <input
              type="password"
              className="admin-input"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">New Password</label>
            <input
              type="password"
              className="admin-input"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Confirm New Password</label>
            <input
              type="password"
              className="admin-input"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
            />
          </div>

          <button type="submit" className="admin-btn-primary" disabled={passwordSaving}>
            {passwordSaving ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
