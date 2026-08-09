import { useEffect, useState } from 'react';

import { useAdminToast } from '../components/shared/use-admin-toast.js';
import { settingsService } from '../services';
import type { DeliveryCharge } from '../types.js';

export function SettingsPage() {
  const { toast } = useAdminToast();

  const [admin, setAdmin] = useState({ name: '', mobile: '', email: '' });
  const [curPass, setCurPass] = useState('');
  const [newPass1, setNewPass1] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [wa, setWa] = useState('');
  const [delivery, setDelivery] = useState<DeliveryCharge>({ amount: 0, freeAbove: 0 });

  useEffect(() => {
    settingsService
      .getProfile()
      .then((p) => {
        if (p) setAdmin(p);
      })
      .catch(() => toast('Failed to load profile', 'error'));
    settingsService
      .getWhatsAppNumber()
      .then(setWa)
      .catch(() => toast('Failed to load WhatsApp number', 'error'));
    settingsService
      .getDeliveryCharge()
      .then(setDelivery)
      .catch(() => toast('Failed to load delivery settings', 'error'));
  }, [toast]);

  const saveProfile = async () => {
    const result = await settingsService.updateProfile({
      name: admin.name.trim(),
      mobile: admin.mobile.trim(),
    });
    if (result.success) {
      toast('Profile updated', 'success');
    } else {
      toast(result.error || 'Failed to update profile', 'error');
    }
  };

  const savePassword = async () => {
    const result = await settingsService.changePassword(curPass, newPass1, newPass2);
    if (result.success) {
      setCurPass('');
      setNewPass1('');
      setNewPass2('');
      toast('Password changed successfully', 'success');
    } else {
      toast(result.error || 'Failed to change password', 'error');
    }
  };

  const saveWA = async () => {
    const result = await settingsService.updateWhatsAppNumber(wa);
    if (result.success) {
      toast('WhatsApp number updated', 'success');
    } else {
      toast(result.error || 'Failed to update WhatsApp number', 'error');
    }
  };

  const saveDelivery = async () => {
    const result = await settingsService.updateDeliveryCharge(delivery);
    if (result.success) {
      toast('Delivery charge updated', 'success');
    } else {
      toast(result.error || 'Failed to update delivery charge', 'error');
    }
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
            <label className="form-lbl">Mobile Number (Contact)</label>
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
