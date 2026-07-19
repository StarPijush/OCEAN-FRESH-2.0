import { useEffect, useState } from 'react';

import { useAdminToast } from '../components/shared/AdminToast';
import { authRepository, settingsRepository } from '../repositories';
import type { AdminProfile, DeliveryCharge } from '../repositories/types';

export function SettingsPage() {
  const { toast } = useAdminToast();

  const [admin, setAdmin] = useState<AdminProfile>({ name: '', mobile: '', password: '' });
  const [curPass, setCurPass] = useState('');
  const [newPass1, setNewPass1] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [wa, setWa] = useState('');
  const [delivery, setDelivery] = useState<DeliveryCharge>({ amount: 0, freeAbove: 0 });

  useEffect(() => {
    authRepository.getAdmin().then(setAdmin);
    settingsRepository.getWA().then(setWa);
    settingsRepository.getDeliveryCharge().then(setDelivery);
  }, []);

  const saveProfile = async () => {
    if (!admin.name.trim()) {
      toast('Name cannot be empty', 'error');
      return;
    }
    if (admin.mobile.length < 10) {
      toast('Enter a valid mobile number', 'error');
      return;
    }
    await authRepository.updateAdmin({ name: admin.name.trim(), mobile: admin.mobile.trim() });
    toast('Profile updated', 'success');
  };

  const savePassword = async () => {
    if (curPass !== admin.password) {
      toast('Current password is incorrect', 'error');
      return;
    }
    if (newPass1.length < 6) {
      toast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPass1 !== newPass2) {
      toast('Passwords do not match', 'error');
      return;
    }
    await authRepository.updateAdmin({ password: newPass1 });
    setCurPass('');
    setNewPass1('');
    setNewPass2('');
    toast('Password changed successfully', 'success');
  };

  const saveWA = async () => {
    const num = wa.replace(/\D/g, '');
    if (num.length < 10) {
      toast('Enter a valid WhatsApp number', 'error');
      return;
    }
    await settingsRepository.setWA('91' + num.slice(-10));
    toast('WhatsApp number updated', 'success');
  };

  const saveDelivery = async () => {
    if (delivery.amount < 0) {
      toast('Charge cannot be negative', 'error');
      return;
    }
    await settingsRepository.setDeliveryCharge(delivery);
    toast('Delivery charge updated', 'success');
  };

  return (
    <div id="panel-settings" className="admin-panel active">
      <div className="panel-header">
        <div className="panel-eyebrow">Configuration</div>
        <h1 className="panel-title">Settings</h1>
        <p className="panel-sub">Manage your account, password, and shop preferences.</p>
      </div>

      {/* Profile */}
      <div className="settings-card">
        <div className="settings-card-head">
          <span className="settings-card-head-icon">👤</span>
          <span className="settings-card-head-title">Profile</span>
        </div>
        <div className="settings-card-body">
          <div className="form-grp">
            <label className="form-lbl">Your Name</label>
            <input
              className="form-inp"
              type="text"
              placeholder="Shop Owner"
              value={admin.name}
              onChange={(e) => setAdmin((a) => ({ ...a, name: e.target.value }))}
            />
          </div>
          <div className="form-grp">
            <label className="form-lbl">Mobile Number (Login ID)</label>
            <div className="form-inp-prefix">
              <span className="prefix">+91</span>
              <input
                className="form-inp"
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={admin.mobile}
                onChange={(e) => setAdmin((a) => ({ ...a, mobile: e.target.value }))}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveProfile}>
            Save Profile
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="settings-card">
        <div className="settings-card-head">
          <span className="settings-card-head-icon">🔑</span>
          <span className="settings-card-head-title">Change Password</span>
        </div>
        <div className="settings-card-body">
          <div className="form-grp">
            <label className="form-lbl">Current Password</label>
            <input
              id="settings-cur-pass"
              className="form-inp"
              type="password"
              placeholder="Current password"
              value={curPass}
              onChange={(e) => setCurPass(e.target.value)}
            />
          </div>
          <div className="form-grp">
            <label className="form-lbl">New Password</label>
            <input
              id="settings-new-pass"
              className="form-inp"
              type="password"
              placeholder="New password"
              value={newPass1}
              onChange={(e) => setNewPass1(e.target.value)}
            />
          </div>
          <div className="form-grp">
            <label className="form-lbl">Confirm Password</label>
            <input
              id="settings-confirm-pass"
              className="form-inp"
              type="password"
              placeholder="Confirm password"
              value={newPass2}
              onChange={(e) => setNewPass2(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={savePassword}>
            Update Password
          </button>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="settings-card">
        <div className="settings-card-head">
          <span className="settings-card-head-icon">💬</span>
          <span className="settings-card-head-title">WhatsApp Number</span>
        </div>
        <div className="settings-card-body">
          <div className="form-grp">
            <label className="form-lbl">WhatsApp Number (with country code)</label>
            <div className="form-inp-prefix">
              <span className="prefix">+91</span>
              <input
                id="settings-wa-val"
                className="form-inp"
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={wa.replace('91', '')}
                onChange={(e) => setWa('91' + e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveWA}>
            Save WhatsApp
          </button>
        </div>
      </div>

      {/* Delivery */}
      <div className="settings-card">
        <div className="settings-card-head">
          <span className="settings-card-head-icon">🚚</span>
          <span className="settings-card-head-title">Delivery Charge</span>
        </div>
        <div className="settings-card-body">
          <div className="form-grp">
            <label className="form-lbl">Delivery Charge (₹)</label>
            <input
              id="settings-delivery-charge"
              className="form-inp"
              type="number"
              min="0"
              step="10"
              placeholder="0"
              value={delivery.amount}
              onChange={(e) =>
                setDelivery((d) => ({ ...d, amount: parseFloat(e.target.value) || 0 }))
              }
            />
          </div>
          <div className="form-grp">
            <label className="form-lbl">Free above (₹)</label>
            <input
              id="settings-delivery-free-above"
              className="form-inp"
              type="number"
              min="0"
              step="50"
              placeholder="0"
              value={delivery.freeAbove}
              onChange={(e) =>
                setDelivery((d) => ({ ...d, freeAbove: parseFloat(e.target.value) || 0 }))
              }
            />
          </div>
          <button className="btn btn-primary" onClick={saveDelivery}>
            Save Delivery
          </button>
        </div>
      </div>
    </div>
  );
}
