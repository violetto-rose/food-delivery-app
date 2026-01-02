import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RiLoader2Fill } from '@remixicon/react'
import Button from '../components/Button';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    preferences: { vegetarian: false }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone
          }
        }
      });

      if (error) throw error;

      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        preferences: formData.preferences
      });

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        throw new Error(
          `Profile creation failed: ${profileError.message}. Please contact support.`
        );
      }

      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 p-6'>
      <h2 className='text-2xl font-bold mb-4'>Register</h2>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label htmlFor='fullName'>Full Name</label>
          <input
            type='text'
            id='fullName'
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className='border border-gray-300 rounded p-2 w-96 bg-gray-50'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            id='email'
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className='border border-gray-300 rounded p-2 w-96 bg-gray-50'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            id='password'
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className='border border-gray-300 rounded p-2 w-96 bg-gray-50'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='phone'>Phone</label>
          <input
            type='text'
            id='phone'
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className='border border-gray-300 rounded p-2 w-96 bg-gray-50'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='address'>Address</label>
          <input
            type='text'
            id='address'
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className='border border-gray-300 rounded p-2 w-96 bg-gray-50'
          />
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor='preferences'>Preferences</label>
          <div className='flex gap-2'>
            <input
              type='checkbox'
              id='preferences'
              value='vegetarian'
              onChange={(e) =>
                setFormData({
                  ...formData,
                  preferences: {
                    ...formData.preferences,
                    vegetarian: e.target.checked
                  }
                })
              }
            />
            <label htmlFor='preferences'>Vegetarian</label>
          </div>
        </div>

        <Button type='submit' disabled={loading}>
          {loading ? (
            <>
              Registering <RiLoader2Fill className='animate-spin' />
            </>
          ) : (
            'Register'
          )}
        </Button>
        {error && <p className='text-red-500'>{error}</p>}
      </form>
      <div className='mt-4 text-center text-sm text-gray-500'>
        Already have an account?{' '}
        <Link to='/login' className='text-red-500 hover:underline'>
          Sign in
        </Link>
      </div>
    </div>
  );
}
