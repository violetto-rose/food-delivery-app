import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RiLoader2Fill } from '@remixicon/react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      const from = location.state?.from?.pathname || '/';

      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 p-6'>
      <h2 className='text-2xl font-bold mb-4'>Login</h2>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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
        <Button type='submit' disabled={loading}>
          {loading ? (
            <>
              Logging in <RiLoader2Fill className='animate-spin' />
            </>
          ) : (
            'Login'
          )}
        </Button>
        {error && <p className='text-red-500'>{error}</p>}
      </form>
      <div className='mt-4 text-center text-sm text-gray-500'>
        Don't have an account?{' '}
        <Link to='/register' className='text-red-500 hover:underline'>
          Sign up
        </Link>
      </div>
    </div>
  );
}
