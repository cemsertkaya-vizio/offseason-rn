-- Add location_pill and address columns to studios table
-- Run in Supabase: Dashboard -> SQL Editor -> New query -> paste and run
--
-- Part 1: Schema migration
ALTER TABLE studios ADD COLUMN IF NOT EXISTS location_pill TEXT;
ALTER TABLE studios ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE studios ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Part 2: Seed V1 studios (Yoga and Pilates)
-- If re-running, first run: DELETE FROM studios;

-- Yoga Studios (display_order 1-10)
INSERT INTO studios (name, activity_type, display_order, city, url, address, location_pill) VALUES
  ('Body Temp Yoga', 'yoga', 1, 'San Francisco', 'https://www.bodytempyoga.com/schedule', '2425 Chestnut Street, San Francisco, CA 94123', 'Marina District'),
  ('Yoga Flow SF', 'yoga', 2, 'San Francisco', 'https://yogaflowsf.com/yoga-on-union-street/', '1892 Union St, San Francisco, CA 94123', 'Cow Hollow'),
  ('Karma Yoga', 'yoga', 3, 'San Francisco', 'https://www.karmayoga-studios.com/schedule', '2219 Filbert St, San Francisco, CA 94123', 'Cow Hollow'),
  ('The Pad Studios', 'yoga', 4, 'San Francisco', 'https://thepadstudios.com/yoga-schedule/', '1694 Union St, San Francisco, CA 94123', 'Cow Hollow'),
  ('Hot 8 Yoga', 'yoga', 5, 'San Francisco', 'https://www.hot8yoga.com/studio/san-francisco-marina#book-now', '3322 Fillmore St., San Francisco, CA 94123', 'Marina District'),
  ('Arise Yoga', 'yoga', 6, 'San Francisco', 'https://www.arise.yoga/sanfrancisco', '2799 California St, San Francisco, CA 94115', 'Pacific Heights'),
  ('Baptiste Yoga Flow SF', 'yoga', 7, 'San Francisco', 'https://www.baptistepoweryogasf.com/schedule', '38 Mesa St, San Francisco, CA 94129', 'The Presidio'),
  ('CorePower Yoga Cow Hollow', 'yoga', 8, 'San Francisco', 'https://www.corepoweryoga.com/yoga-studios/ca/san-francisco/cow-hollow', '2909 Webster Street, San Francisco, CA 94123', 'Cow Hollow'),
  ('Funky Door Yoga', 'yoga', 9, 'San Francisco', 'https://www.funkydoor.com/san-francisco', '1336 Polk St, San Francisco, CA 94109', 'Nob Hill'),
  ('CorePower Yoga Nob Hill', 'yoga', 10, 'San Francisco', 'https://www.corepoweryoga.com/yoga-studios/ca/san-francisco/nob-hill', '1900 Van Ness Ave, San Francisco, CA 94109', 'Nob Hill');

-- Pilates Studios (display_order 11-20)
INSERT INTO studios (name, activity_type, display_order, city, url, address, location_pill) VALUES
  ('MNT Pilates Studio', 'pilates', 11, 'San Francisco', 'https://mntstudio.co/marina-class-schedule?_mt=%2Fschedule%2Fdaily%2F48541%3Fclassroom%3D6316%2C6319%26locations%3D48751', '2154 Union St San Francisco, CA 94123', 'Cow Hollow'),
  ('Sage Pilates', 'pilates', 12, 'San Francisco', 'https://www.sagepilatessf.com/schedule?_mt=%2Fschedule%2Fdaily%2F48541%3Flocations%3D48717', '2399 Greenwich St San Francisco, CA 94123', 'Cow Hollow'),
  ('Bodyrok Marina', 'pilates', 13, 'San Francisco', 'https://bodyrok.com/studio/marina/', '2128 Lombard St San Francisco, CA 94123', 'Marina District'),
  ('Bodyrok Polk', 'pilates', 14, 'San Francisco', 'https://bodyrok.com/studio/polk/', '1850 Polk St, San Francisco, CA 94109', 'Nob Hill'),
  ('Solidcore', 'pilates', 15, 'San Francisco', 'https://solidcore.co/studios/marina?siteId=5723396&locationId=13', '3225 Fillmore St Ste TBD San Francisco, CA 94123', 'Cow Hollow'),
  ('CORE40 Marina', 'pilates', 16, 'San Francisco', 'https://core40.com/marina/', '1902 Lombard St San Francisco, CA 94123', 'Marina District'),
  ('CORE40 Nob Hill', 'pilates', 17, 'San Francisco', 'https://core40.com/nob-hill/', '1390 Larkin St San Francisco, CA 94109', 'Nob Hill'),
  ('Mighty Pilates', 'pilates', 18, 'San Francisco', 'https://www.mightypilates.com/russian-hill/#schedule-russian-hill', '2022 Polk St San Francisco, CA 94109', 'Russian Hill'),
  ('XCORE SF', 'pilates', 19, 'San Francisco', 'https://www.xcorestudio.com/polk-schedule', '2139B Polk St San Francisco, CA 94109', 'Russian Hill'),
  ('Club Pilates', 'pilates', 20, 'San Francisco', 'https://lp.clubpilates.com/try?offer_id=free-intro&utm_campaign=0125__sustained&utm_content=lead-collection_corporate&clubready_referraltypeid=156013&clubready_referraltypeid_ca=156014&utm_medium=paid&utm_source=yelp&utm_term=digital-image&nearest=1&booking=1', '1515 Union St San Francisco, CA 94123', 'Cow Hollow');

-- Part 3: Link images from Supabase Storage (studio-images bucket)
--
-- After uploading images to: studio-images/{uuid}/logo.png and studio-images/{uuid}/cover.png
-- Run this to auto-set image_url (cover) and logo_url for all studios that have uploads.
--
-- Step 1: Get studio UUIDs
-- SELECT id, name FROM studios ORDER BY display_order;
--
-- Step 2: Set image URLs using the predictable storage path
UPDATE studios
SET
  image_url = 'https://kvwxqshaiezljccbwmny.supabase.co/storage/v1/object/public/studio-images/' || id || '/cover.png',
  logo_url  = 'https://kvwxqshaiezljccbwmny.supabase.co/storage/v1/object/public/studio-images/' || id || '/logo.png'
WHERE is_active = true;
