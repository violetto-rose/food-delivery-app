import { Link, useNavigate } from 'react-router-dom';
import {
  RiShoppingBagLine,
  RiUserLine,
  RiHomeLine,
  RiLogoutBoxLine,
  RiBox1Line
} from '@remixicon/react';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from './Button';

export default function Navbar() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className='bg-gray-50 border-b border-gray-500 sticky top-0 z-50'>
      <div className='max-w-6xl mx-auto px-4 h-16 flex justify-between items-center'>
        <Link to='/' className='text-xl font-bold text-gray-900'>
          Food Delivery App
        </Link>

        <div className='flex items-center gap-6'>
          <Link to='/' className='flex items-center gap-2 hover:text-gray-700'>
            <RiHomeLine size={20} />
            <span>Browse</span>
          </Link>

          <Link
            to='/cart'
            className='flex items-center gap-2 hover:text-gray-700 relative'>
            <RiShoppingBagLine size={20} />
            <span>Cart</span>
            {cartItems.length > 0 && (
              <span className='absolute -top-2 left-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center'>
                {cartItems.length}
              </span>
            )}
          </Link>

          <Link
            to='/orders'
            className='flex items-center gap-2 hover:text-gray-700'>
            <RiBox1Line size={20} />
            <span>Orders</span>
          </Link>

          {user && (
            <Link
              to='/profile'
              className='flex items-center gap-2 hover:text-gray-700'>
              <RiUserLine size={20} />
              <span>Profile</span>
            </Link>
          )}

          {user ? (
            <div className='flex items-center gap-4 border-l border-gray-500 pl-6'>
              <span className='text-gray-600'>
                Hi, {user.user_metadata.full_name}
              </span>
              <Button onClick={handleLogout}>
                <RiLogoutBoxLine size={20} />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <Link
              to='/login'
              className='flex items-center gap-2 hover:text-red-500'>
              <RiUserLine size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
