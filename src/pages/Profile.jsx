import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import Loading from '../components/Loading';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    phone: '',
    vegetarian: false
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          address: data.address || '',
          phone: data.phone || '',
          vegetarian: data.preferences?.vegetarian || false
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Profile not found. Please complete your profile.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            address: formData.address,
            phone: formData.phone,
            preferences: { vegetarian: formData.vegetarian }
          })
          .eq('id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('profiles').insert({
          id: user.id,
          full_name: formData.full_name,
          address: formData.address,
          phone: formData.phone,
          preferences: { vegetarian: formData.vegetarian }
        });

        if (error) throw error;
      }

      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className='min-h-screen max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 p-6'>
      <h2 className='text-3xl font-bold mb-4'>My Profile</h2>

      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-4 w-full max-w-md'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='name' className='font-medium'>
            Full Name
          </label>
          <input
            type='text'
            id='name'
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            className='border border-gray-300 rounded p-2 bg-gray-50'
            required
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label htmlFor='phone' className='font-medium'>
            Phone
          </label>
          <input
            type='tel'
            id='phone'
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className='border border-gray-300 rounded p-2 bg-gray-50'
            required
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label htmlFor='address' className='font-medium'>
            Address
          </label>
          <textarea
            id='address'
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className='border border-gray-300 rounded p-2'
            rows='3'
            required
          />
        </div>

        <div className='flex items-center gap-2'>
          <input
            type='checkbox'
            id='vegetarian'
            checked={formData.vegetarian}
            onChange={(e) =>
              setFormData({ ...formData, vegetarian: e.target.checked })
            }
            className='w-4 h-4'
          />
          <label htmlFor='vegetarian'>Vegetarian Preference</label>
        </div>

        <Button type='submit' disabled={saving} className='w-full mt-4'>
          {saving ? 'Saving...' : 'Update Profile'}
        </Button>

        {message && (
          <p
            className={`text-center ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
