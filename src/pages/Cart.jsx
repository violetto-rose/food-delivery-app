import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { RiDeleteBin2Line, RiArrowRightLine } from '@remixicon/react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    updateQuantity,
    cartTotal,
    totalAmount,
    discount,
    applyDiscount
  } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  function handleApplyPromo() {
    if (promoCode === 'WELCOME10') {
      const discountAmount = cartTotal * 0.1;
      applyDiscount(discountAmount);
      setPromoMessage('10% discount applied!');
    } else if (promoCode === 'SAVE5') {
      applyDiscount(5);
      setPromoMessage('$5 discount applied!');
    } else {
      applyDiscount(0);
      setPromoMessage('Invalid promo code');
    }
  }

  async function handleCheckout() {
    if (cartItems.length === 0) return;

    try {
      setLoading(true);

      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('restaurant_id')
        .eq('id', cartItems[0].menu_item_id)
        .single();

      const { data: userData } = await supabase
        .from('profiles')
        .select('address')
        .eq('id', user.id)
        .single();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: menuItem.restaurant_id,
          total_amount: totalAmount,
          status: 'pending',
          delivery_address: userData.address,
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsData = cartItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price_at_time: item.price
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);
      if (orderItemsError) throw orderItemsError;

      alert(
        `Order placed successfully! Order ID: ${
          order.id
        } Total: $${totalAmount.toFixed(2)}`
      );
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Checkout failed:', error);
      alert(`Checkout failed: ${error.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center text-center p-4'>
        <h2 className='text-2xl mb-4'>Your cart is empty</h2>
        <p className='text-gray-600 mb-8'>
          Looks like you haven't added anything yet.
        </p>
        <Button onClick={() => navigate('/')}>Browse Restaurants</Button>
      </div>
    );
  }

  return (
    <div className='min-h-screen max-w-7xl mx-auto flex flex-col gap-4 p-6'>
      <h1 className='text-3xl font-bold mb-8'>Your Cart</h1>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='md:col-span-2 space-y-4'>
          {cartItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className='flex items-center gap-4 border rounded-lg bg-gray-50 border-gray-400 p-4'>
              <div className='w-20 h-20 rounded-lg overflow-hidden shrink-0'>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gray-400' />
                )}
              </div>

              <div className='flex-1'>
                <h3 className='font-bold'>{item.name}</h3>
                <p className='text-gray-600 text-sm'>{item.restaurant_name}</p>
                <div className='text-red-500 font-bold mt-1'>
                  ${item.price.toFixed(2)}
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <Button
                    size='small'
                    className='aspect-square rounded-full'
                    onClick={() => updateQuantity(item.menu_item_id, -1)}>
                    -
                  </Button>
                  <span>x{item.quantity}</span>
                  <Button
                    size='small'
                    className='aspect-square rounded-full'
                    onClick={() => updateQuantity(item.menu_item_id, +1)}>
                    +
                  </Button>
                </div>
                <Button
                  onClick={() => removeFromCart(item.menu_item_id)}
                  className='aspect-square'>
                  <RiDeleteBin2Line size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className='md:col-span-1'>
          <div className='border rounded-lg bg-gray-50 border-gray-400 p-4 sticky top-24'>
            <h3 className='font-bold text-lg mb-4'>Order Summary</h3>

            <div className='space-y-2 mb-6 text-gray-800 text-sm'>
              <div className='flex justify-between'>
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Delivery Fee</span>
                <span>$2.99</span>
              </div>
              {discount > 0 && (
                <div className='flex justify-between text-green-600'>
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className='flex justify-between font-bold text-lg pt-4 border-t border-gray-400 mt-4'>
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className='mb-4'>
              <label className='text-sm font-medium mb-2 block'>
                Promo Code
              </label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder='Enter code'
                  className='flex-1 border border-gray-300 rounded p-2 text-sm bg-gray-50'
                />
                <Button onClick={handleApplyPromo} size='small'>
                  Apply
                </Button>
              </div>
              {promoMessage && (
                <p
                  className={`text-xs mt-1 ${discount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {promoMessage}
                </p>
              )}
            </div>

            <div className='mb-4'>
              <label className='text-sm font-medium mb-2 block'>
                Payment Method
              </label>
              <div className='flex flex-col gap-2'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='radio'
                    name='payment'
                    value='cash'
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className='w-4 h-4'
                  />
                  <span className='text-sm'>Cash on Delivery</span>
                </label>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='radio'
                    name='payment'
                    value='card'
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className='w-4 h-4'
                  />
                  <span className='text-sm'>Credit/Debit Card</span>
                </label>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='radio'
                    name='payment'
                    value='upi'
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className='w-4 h-4'
                  />
                  <span className='text-sm'>UPI</span>
                </label>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={loading}
              className='w-full'>
              {loading ? 'Processing...' : 'Checkout'}
              <RiArrowRightLine size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
