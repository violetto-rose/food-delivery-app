INSERT INTO
	restaurants (
		id,
		name,
		cuisine,
		price_range,
		delivery_time,
		image_url
	)
VALUES
	(
		1,
		'Sunrise Deli',
		'American',
		'$',
		'25-35 min',
		'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80'
	),
	(
		2,
		'Saffron & Spice',
		'Indian',
		'$$',
		'35-45 min',
		'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80'
	),
	(
		3,
		'La Piccola Pizzeria',
		'Italian',
		'$$',
		'30-40 min',
		'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80'
	),
	(
		4,
		'Green Garden Vegan',
		'Vegan',
		'$$',
		'20-30 min',
		'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80'
	),
	(
		5,
		'Tokyo Bento',
		'Japanese',
		'$$$',
		'40-50 min',
		'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80'
	),
	(
		6,
		'El Rancho Tacos',
		'Mexican',
		'$',
		'18-28 min',
		'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80'
	);

INSERT INTO
	menu_items (
		restaurant_id,
		name,
		description,
		price,
		category,
		image_url,
		vegetarian
	)
VALUES
	(
		1,
		'Classic Club Sandwich',
		'Turkey, bacon, lettuce, tomato and mayo on toasted sourdough',
		8.99,
		'Sandwiches',
		'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80',
		false
	),
	(
		1,
		'Avocado Toast',
		'Sourdough, smashed avocado, chili flakes, lemon',
		6.50,
		'Breakfast',
		'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=500&q=80',
		true
	),
	(
		1,
		'Berry Smoothie',
		'Mixed berries, yogurt, honey',
		4.75,
		'Beverages',
		'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=500&q=80',
		true
	),
	(
		2,
		'Butter Chicken',
		'Creamy tomato-based chicken curry with warm spices',
		12.50,
		'Mains',
		'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80',
		false
	),
	(
		2,
		'Paneer Tikka Masala',
		'Grilled paneer cubes in rich masala sauce',
		11.00,
		'Mains',
		'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80',
		true
	),
	(
		2,
		'Garlic Naan',
		'Hand-stretched naan with garlic butter',
		2.75,
		'Sides',
		'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80',
		true
	),
	(
		3,
		'Margherita Pizza',
		'Tomato, mozzarella, fresh basil',
		10.00,
		'Pizzas',
		'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80',
		true
	),
	(
		3,
		'Truffle Mushroom Pizza',
		'Mixed mushrooms, truffle oil, fontina',
		14.50,
		'Pizzas',
		'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
		true
	),
	(
		3,
		'Caesar Salad',
		'Romaine, parmesan, croutons, Caesar dressing',
		7.25,
		'Salads',
		'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&q=80',
		true
	),
	(
		4,
		'Quinoa Power Bowl',
		'Quinoa, roasted veggies, tahini dressing',
		9.95,
		'Bowls',
		'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
		true
	),
	(
		4,
		'BBQ Jackfruit Wrap',
		'Pulled jackfruit, slaw, vegan mayo',
		8.50,
		'Wraps',
		'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80',
		true
	),
	(
		5,
		'Salmon Teriyaki Bento',
		'Grilled salmon, rice, pickles, salad',
		16.00,
		'Bento',
		'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500&q=80',
		false
	),
	(
		5,
		'Chicken Katsu Curry',
		'Crispy katsu with rich curry and rice',
		14.25,
		'Bento',
		'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=500&q=80',
		false
	),
	(
		6,
		'Al Pastor Tacos (3)',
		'Marinated pork, pineapple, cilantro, onion',
		9.00,
		'Tacos',
		'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&q=80',
		false
	),
	(
		6,
		'Carne Asada Burrito',
		'Grilled steak, rice, beans, pico de gallo',
		10.50,
		'Burritos',
		'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80',
		false
	);
