import { useState, type FormEvent } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/stores/AuthContext';
import { updateProfile, updatePassword } from '@/services/profile';
import { getErrorMessage } from '@/services/api';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateProfile({ name, phone: phone || undefined });
      setProfileMsg({ type: 'success', text: 'Profil berhasil diperbarui.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordMsg(null);
    try {
      await updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password berhasil diubah.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Profil Saya</h2>

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
            {user?.name?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileMsg && <Alert variant={profileMsg.type}>{profileMsg.text}</Alert>}
          <Input label="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Nomor Telepon" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button type="submit" isLoading={isSavingProfile}>Simpan Perubahan</Button>
        </form>
      </Card>

      <Card>
        <h3 className="mb-4 font-semibold text-gray-900">Ubah Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordMsg && <Alert variant={passwordMsg.type}>{passwordMsg.text}</Alert>}
          <Input
            label="Password Saat Ini"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="Password Baru"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Konfirmasi Password Baru"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="secondary" isLoading={isSavingPassword}>Ubah Password</Button>
        </form>
      </Card>
    </div>
  );
}
