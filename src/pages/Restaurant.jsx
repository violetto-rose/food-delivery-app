import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import {
  RiAddLine,
  RiStarFill,
  RiHeart2Fill,
  RiHeart2Line
} from '@remixicon/react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function Restaurant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { preferences, user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, [id, preferences, user]);

  async function fetchRestaurant() {
    try {
      setLoading(true);

      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (restaurantError) throw restaurantError;

      let menuQuery = supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', id);

      if (preferences?.vegetarian) {
        menuQuery = menuQuery.eq('vegetarian', true);
      }

      const { data: menuData, error: menuError } = await menuQuery;

      if (menuError) throw menuError;

      setRestaurant({ ...restaurantData, menu_items: menuData });

      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('rating')
        .eq('restaurant_id', id);

      if (!ratingsError && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, curr) => acc + curr.rating, 0);
        setAvgRating(sum / ratingsData.length);
        setReviewCount(ratingsData.length);
      }

      if (user) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('restaurant_id', id)
          .maybeSingle();

        setIsFavorite(!!favData);
      }

      setLoading(false);
    } catch (error) {
      console.log('Error fetching data: ', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite() {
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
          .eq('restaurant_id', id);
        setIsFavorite(false);
      } else {
        const { error } = await supabase.from('favorites').insert({
          user_id: user.id,
          restaurant_id: id
        });

        if (error) {
          if (error.code === '23505') {
            setIsFavorite(true);
          } else {
            throw error;
          }
        } else {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  if (loading) return <Loading />;

  if (!restaurant)
    return (
      <div className='p-8 text-center text-red-500'>Restaurant Not Found</div>
    );

  return (
    <div className='min-h-screen max-w-7xl mx-auto flex flex-col gap-4 p-6'>
      <div className='relative h-80 rounded-2xl overflow-hidden mb-8'>
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-linear-to-t from-black/80 to-transparent flex flex-col justify-end p-8'>
          <div className='absolute top-6 right-6 z-10'>
            <Button
              onClick={toggleFavorite}
              size='small'
              className='text-2xl aspect-square rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border-none text-white'>
              {isFavorite ? (
                <RiHeart2Fill size={24} className='text-red-500' />
              ) : (
                <RiHeart2Line size={24} />
              )}
            </Button>
          </div>
          <h1 className='text-4xl font-bold text-white mb-2'>
            {restaurant.name}
          </h1>
          <p className='text-gray-200 font-medium'>
            {restaurant.cuisine} • {restaurant.delivery_time} delivery
            {reviewCount > 0 && (
              <span className='items-center gap-1 ml-2 inline-flex'>
                • <RiStarFill className='text-yellow-400' size={16} />{' '}
                {avgRating.toFixed(1)} ({reviewCount}+)
              </span>
            )}
          </p>
        </div>
      </div>

      <div>
        <h2 className='text-2xl font-bold text-gray-800 mb-6'>Menu</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {restaurant.menu_items?.map((item) => (
            <div
              key={item.id}
              className='bg-gray-50 rounded-xl border border-gray-400 p-6 flex justify-between items-start'>
              <div className='flex flex-col h-full flex-1 pr-4'>
                <h3 className='font-bold text-lg mb-1'>{item.name}</h3>
                <p className='text-gray-800 text-sm mb-3 line-clamp-2 flex-1'>
                  {item.description}
                </p>
                <span className='font-bold'>${item.price}</span>
              </div>

              <Button
                onClick={() => addToCart(item)}
                className='rounded-full aspect-square'>
                <RiAddLine size={20} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
