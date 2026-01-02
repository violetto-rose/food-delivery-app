alter table cart enable row level security;

create policy "Users can view their own cart" on cart for
select
  using (auth.uid () = user_id);

create policy "Users can insert into their own cart" on cart for insert
with
  check (auth.uid () = user_id);

create policy "Users can delete from their own cart" on cart for delete using (auth.uid () = user_id);

create policy "Users can update their own cart" on cart
for update
  using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

alter table orders enable row level security;

create policy "Users can view their own orders" on orders for
select
  using (auth.uid () = user_id);

create policy "Users can create their own orders" on orders for insert
with
  check (auth.uid () = user_id);

alter table profiles enable row level security;

create policy "Users can view their own profile" on profiles for
select
  using (auth.uid () = id);

create policy "Users can insert their own profile" on profiles for insert
with
  check (auth.uid () = id);

create policy "Users can update their own profile" on profiles
for update
  using (auth.uid () = id);

alter table restaurants enable row level security;

create policy "Anyone can view restaurants" on restaurants for
select
  to authenticated,
  anon using (true);

alter table menu_items enable row level security;

create policy "Anyone can view menu items" on menu_items for
select
  to authenticated,
  anon using (true);

alter table order_items enable row level security;

create policy "Users can view their own order items" on order_items for
select
  using (
    exists (
      select
        1
      from
        orders
      where
        orders.id = order_items.order_id
        and orders.user_id = auth.uid ()
    )
  );

create policy "Users can create order items for their own orders" on order_items for insert
with
  check (
    exists (
      select
        1
      from
        orders
      where
        orders.id = order_items.order_id
        and orders.user_id = auth.uid ()
    )
  );

alter table ratings ENABLE row LEVEL SECURITY;

create policy "Anyone can view ratings" on ratings for
select
  using (true);

create policy "Users can create their own ratings" on ratings for INSERT
with
  check (auth.uid () = user_id);

create policy "Users can update their own ratings" on ratings
for update
  using (auth.uid () = user_id);

alter table favorites ENABLE row LEVEL SECURITY;

create policy "Users can view their own favorites" on favorites for
select
  using (auth.uid () = user_id);

create policy "Users can create their own favorites" on favorites for INSERT
with
  check (auth.uid () = user_id);

create policy "Users can delete their own favorites" on favorites for DELETE using (auth.uid () = user_id);
