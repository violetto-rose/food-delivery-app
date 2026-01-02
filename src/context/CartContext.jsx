import { createContext, useState, useEffect } from 'react';
import { useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export default function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCartFromDatabase();
    }
  }, [user]);

  async function fetchCartFromDatabase() {
    try {
      const { data } = await supabase
        .from('cart')
        .select(
          `
            *,
            menu_items (
              id,
              name,
              price,
              image_url,
              restaurant_id,
              restaurants (
                name
              )
            )
          `
        )
        .eq('user_id', user.id);

      const transformedData =
        data?.map((item) => ({
          cart_id: item.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          id: item.menu_items.id,
          name: item.menu_items.name,
          price: item.menu_items.price,
          image_url: item.menu_items.image_url,
          restaurant_name: item.menu_items.restaurants?.name,
          restaurant_id: item.menu_items.restaurant_id
        })) || [];

      setCartItems(transformedData);
    } catch (error) {
      console.log('Failed to fetch cart items: ', error);
    }
  }

  async function addToCart(item, quantity = 1) {
    try {
      let firstItemRestaurant = null;

      if (cartItems.length > 0) {
        firstItemRestaurant = cartItems[0].restaurant_id;
      }

      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('restaurant_id')
        .eq('id', item.id)
        .single();

      if (
        firstItemRestaurant &&
        menuItem.restaurant_id !== firstItemRestaurant
      ) {
        alert(
          'You can only order from one restaurant at a time. Please clear your cart first.'
        );
        return;
      }

      const { data: existing } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
        .eq('menu_item_id', item.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('cart')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);

        if (error) {
          console.log('Update error:', error);
          throw error;
        }
      } else {
        const { error } = await supabase.from('cart').insert({
          user_id: user.id,
          menu_item_id: item.id,
          quantity: quantity
        });

        if (error) {
          console.log('Insert error:', error);
          throw error;
        }
      }

      fetchCartFromDatabase();
    } catch (error) {
      console.log('Failed to add item to cart: ', error);
    }
  }

  async function removeFromCart(itemId) {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('menu_item_id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchCartFromDatabase();
    } catch (error) {
      console.log('Failed to delete item from cart: ', error);
    }
  }

  async function clearCart() {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      fetchCartFromDatabase();
    } catch (error) {
      console.log('Failed to clear cart: ', error);
    }
  }

  async function updateQuantity(itemId, change) {
    try {
      const item = cartItems.find((i) => i.menu_item_id === itemId);
      if (!item) return;
      const newQuantity = item.quantity + change;

      if (newQuantity === 0) {
        removeFromCart(itemId);
        return;
      }

      if (newQuantity > 5) {
        alert('Maximum quantity is 5');
        return;
      }

      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('user_id', user.id)
        .eq('menu_item_id', itemId);

      if (error) throw error;

      fetchCartFromDatabase();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  }

  function applyDiscount(amount) {
    setDiscount(amount);
  }

  const cartTotal = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const totalAmount = cartTotal + 2.99 - (discount || 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        cartTotal,
        totalAmount,
        discount,
        applyDiscount
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
