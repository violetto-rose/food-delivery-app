import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Loading from '../components/Loading';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { RiHeart2Fill, RiHeart2Line } from '@remixicon/react';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [deliveryTimeFilter, setDeliveryTimeFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const { preferences, user } = useAuth();

  async function fetchRestaurants() {
    try {
      let query = supabase
        .from('restaurants')
        .select('*, menu_items!inner(vegetarian)');

      if (preferences?.vegetarian) {
        query = query.eq('menu_items.vegetarian', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      const uniqueRestaurants = Array.from(
        new Map(data.map((r) => [r.id, r])).values()
      );

      setRestaurants(uniqueRestaurants);
    } catch (error) {
      console.log('Error fetching restaurants: ', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFeaturedItems() {
    try {
      let query = supabase
        .from('menu_items')
        .select('*, restaurants(name)')
        .limit(10);

      if (preferences?.vegetarian) {
        query = query.eq('vegetarian', true);
      }

      const { data, error } = await query;
      if (error) throw error;

      setFeaturedItems(data);
    } catch (error) {
      console.log('Error fetching featured items: ', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRestaurants();
    fetchFeaturedItems();
  }, [preferences]);

  async function fetchFavorites() {
    const { data } = await supabase
      .from('favorites')
      .select('restaurant_id')
      .eq('user_id', user.id);

    if (data) {
      setFavoriteIds(new Set(data.map((f) => f.restaurant_id)));
    }
  }

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavoriteIds(new Set());
    }
  }, [user]);

  if (loading) return <Loading />;

  function RestaurantCard({ restaurant }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
      if (user) checkFavorite();
    }, [user, restaurant.id]);

    async function checkFavorite() {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurant.id)
        .maybeSingle();

      setIsFavorite(!!data);
    }

    async function toggleFavorite(e) {
      e.stopPropagation();
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        if (isFavorite) {
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('restaurant_id', restaurant.id);
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(restaurant.id);
            return next;
          });
          setIsFavorite(false);
        } else {
          const { error } = await supabase.from('favorites').insert({
            user_id: user.id,
            restaurant_id: restaurant.id
          });

          if (error) throw error;
          else {
            setFavoriteIds((prev) => {
              const next = new Set(prev);
              next.add(restaurant.id);
              return next;
            });
            setIsFavorite(true);
          }
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    }

    return (
      <div
        onClick={() => navigate(`/restaurant/${restaurant.id}`)}
        className='cursor-pointer w-64 p-4 rounded-lg border bg-gray-50 border-gray-400 hover:border-gray-600 shrink-0 relative'>
        <Button
          onClick={toggleFavorite}
          size='small'
          className='absolute top-6 right-6 text-2xl z-10 aspect-square rounded-full'>
          {isFavorite ? <RiHeart2Fill size={18} /> : <RiHeart2Line size={18} />}
        </Button>
        <img
          className='w-full h-64 object-cover rounded-md'
          src={restaurant.image_url}
          alt={restaurant.name}
        />
        <h3 className='pt-2 font-bold text-lg'>{restaurant.name}</h3>
        <p className='text-gray-800'>{restaurant.cuisine}</p>
      </div>
    );
  }

  function MenuItemCard({ item }) {
    const { addToCart } = useCart();
    const [buttonState, setButtonState] = useState('idle');
    const handleAddToCart = async () => {
      setButtonState('loading');
      try {
        await addToCart(item, 1);
        setButtonState('success');
        setTimeout(() => {
          setButtonState('idle');
        }, 2000);
      } catch (error) {
        setButtonState('idle');
        console.log('Error adding to cart: ', error);
      }
    };

    return (
      <div className='w-64 border rounded-lg bg-gray-50 border-gray-400 p-4 shrink-0'>
        <img
          className='w-full h-64 object-cover rounded-md'
          src={item.image_url}
          alt={item.name}
        />
        <h3 className='pt-2 font-bold text-lg'>{item.name}</h3>
        <p className='text-gray-800'>{item.restaurants?.name}</p>
        <p className='text-xl font-bold'>${item.price}</p>
        <Button
          onClick={handleAddToCart}
          disabled={buttonState === 'loading'}
          className={`w-full mt-2 ${
            buttonState === 'success' ? 'bg-green-600' : 'bg-red-500'
          }`}>
          {buttonState === 'loading' && 'Adding to cart...'}
          {buttonState === 'success' && 'Added to cart!'}
          {buttonState === 'idle' && 'Add to cart'}
        </Button>
      </div>
    );
  }

  return (
    <div className='min-h-screen max-w-7xl mx-auto flex flex-col gap-4 p-6'>
      <h1 className='text-3xl font-bold mb-6'>Welcome to Food Delivery App</h1>

      <div className='flex justify-between items-center mb-6'>
        <input
          type='text'
          placeholder='Search restaurants...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='w-full max-w-md bg-gray-50 border border-gray-300 rounded-full pl-6 p-2'
        />

        <div className='flex gap-2 flex-wrap items-center'>
          <span className='text-sm font-medium text-gray-700'>Cuisine:</span>
          {['All', 'Italian', 'Japanese', 'Indian', 'Mexican', 'American'].map(
            (cuisine) => (
              <button
                key={cuisine}
                onClick={() => setCuisineFilter(cuisine)}
                className={`px-4 py-2 rounded-full border ${
                  cuisineFilter === cuisine
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}>
                {cuisine}
              </button>
            )
          )}
        </div>
      </div>

      <div className='flex gap-4 mb-6 flex-wrap'>
        <div className='flex gap-2 items-center'>
          <span className='text-sm font-medium text-gray-700'>Delivery:</span>
          {['All', 'Under 30 min', 'Under 45 min'].map((time) => (
            <button
              key={time}
              onClick={() => setDeliveryTimeFilter(time)}
              className={`px-3 py-1 text-sm rounded-full border ${
                deliveryTimeFilter === time
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}>
              {time}
            </button>
          ))}
        </div>

        <div className='flex gap-2 items-center'>
          <span className='text-sm font-medium text-gray-700'>Price:</span>
          {['All', '$', '$$', '$$$'].map((price) => (
            <button
              key={price}
              onClick={() => setPriceFilter(price)}
              className={`px-3 py-1 text-sm rounded-full border ${
                priceFilter === price
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white border-gray-300 hover:border-gray-400'
              }`}>
              {price}
            </button>
          ))}
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
              showFavorites
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-white border-gray-300 hover:border-gray-400'
            }`}>
            {showFavorites ? (
              <RiHeart2Fill size={20} />
            ) : (
              <RiHeart2Line size={20} />
            )}
            Favorites Only
          </button>
        </div>
      </div>

      <section className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4'>Popular Restaurants</h2>
        <div className=' overflow-x-auto scroll-smooth flex gap-4 pb-4'>
          {restaurants
            .filter((r) =>
              r.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .filter((r) =>
              cuisineFilter === 'All' ? true : r.cuisine === cuisineFilter
            )
            .filter((r) => {
              if (deliveryTimeFilter === 'All') return true;
              if (!r.delivery_time) return false;

              const maxTime = parseInt(r.delivery_time.split('-')[1]);
              if (deliveryTimeFilter === 'Under 30 min') return maxTime <= 30;
              if (deliveryTimeFilter === 'Under 45 min') return maxTime <= 45;
              return true;
            })
            .filter((r) =>
              priceFilter === 'All' ? true : r.price_range === priceFilter
            )
            .filter((r) => (showFavorites ? favoriteIds.has(r.id) : true))
            .map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
        </div>
      </section>

      <section>
        <h2 className='text-2xl font-semibold mb-4'>Featured Dishes</h2>
        <div className='overflow-x-auto scroll-smooth flex gap-4 pb-4'>
          {featuredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
