-- Katılma isteklerinin anlık düşmesi: sahip kendi sürüşlerinin isteklerini okuyabilir + Realtime yayını.
create policy "ride_requests_sahip_okur" on public.ride_requests for select to authenticated
  using (exists (select 1 from public.posts p where p.id = ride_requests.post_id and p.author_id = (select auth.uid())));

alter publication supabase_realtime add table public.ride_requests;
