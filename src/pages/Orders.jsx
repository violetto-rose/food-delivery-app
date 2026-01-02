import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { RiStarLine, RiStarFill } from '@remixicon/react';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  async function fetchOrders() {
    try {
      setLoading(true);

      const { data: orders, error } = await supabase
        .from('orders')
        .select(
          `
            *,
            restaurants (
              name
            ),
            order_items (
              quantity,
              price_at_time,
              menu_items (
                name,
                image_url
              )
            )
          `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(orders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  if (orders.length === 0) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center text-center p-4'>
        <h2 className='text-2xl mb-4'>No orders yet</h2>
        <p className='text-gray-600 mb-8'>Start ordering delicious food!</p>
        <Button onClick={() => navigate('/')}>Browse Restaurants</Button>
      </div>
    );
  }

  function StarRating({ orderId, restaurantId }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    useEffect(() => {
      fetchRating();
    }, [orderId]);

    async function fetchRating() {
      const { data } = await supabase
        .from('ratings')
        .select('rating')
        .eq('order_id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) setRating(data.rating);
    }

    async function handleRating(value) {
      try {
        const { data: existing } = await supabase
          .from('ratings')
          .select('id')
          .eq('order_id', orderId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('ratings')
            .update({ rating: value })
            .eq('id', existing.id);
        } else {
          await supabase.from('ratings').insert({
            user_id: user.id,
            restaurant_id: restaurantId,
            order_id: orderId,
            rating: value
          });
        }

        setRating(value);
      } catch (error) {
        console.error('Error saving rating:', error);
      }
    }

    return (
      <div className='flex gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className='text-2xl focus:outline-none'>
            {star <= (hover || rating) ? (
              <RiStarFill className='text-yellow-300' size={18} />
            ) : (
              <RiStarLine size={18} />
            )}
          </button>
        ))}
      </div>
    );
  }

  function OrderCard({ order }) {
    return (
      <div className='border rounded-lg p-4 mb-4 bg-gray-50'>
        <div className='flex justify-between items-center mb-2'>
          <div>
            <h3 className='font-bold'>Order #{order.id}</h3>
            <p className='text-sm text-gray-600'>
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <p className='text-sm mb-2'>From: {order.restaurants?.name}</p>
        <p className='text-sm mb-2 text-gray-600'>
          Payment:{' '}
          <span className='capitalize'>{order.payment_method || 'cash'}</span>
        </p>

        <div className='space-y-2 mb-4'>
          {order.order_items?.map((item, index) => (
            <div key={index} className='flex gap-2'>
              <img
                src={item.menu_items.image_url}
                className='w-12 h-12 rounded object-cover'
              />
              <div className='flex-1'>
                <p className='font-medium'>{item.menu_items.name}</p>
                <p className='text-sm'>
                  x{item.quantity} @ ${item.price_at_time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {order.status === 'delivered' && (
          <div className='mt-4 pb-4'>
            <p className='text-sm font-medium mb-2'>Rate this order:</p>
            <StarRating orderId={order.id} restaurantId={order.restaurant_id} />
          </div>
        )}

        <div className='border-t pt-2 flex justify-between'>
          <span className='font-bold'>Total</span>
          <span className='font-bold'>${order.total_amount.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  function StatusBadge({ status }) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      on_the_way: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span
        className={`flex items-center px-3 py-1 h-fit rounded-full text-xs font-bold ${colors[status]}`}>
        {status.replaceAll('_', ' ').toUpperCase()}
      </span>
    );
  }

  return (
    <div className='min-h-screen max-w-7xl mx-auto flex flex-col gap-4 p-6'>
      <h1 className='text-3xl font-bold mb-8'>Your Orders</h1>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
