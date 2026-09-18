# Muted — Antigravity Build Prompts

Run these as **separate tasks**, in order. Wait for each to finish and verify it (open the simulator, click through) before starting the next — don't queue them all at once. Attach the relevant screenshots to each task where noted; Antigravity's agents use images as ground truth for spacing, color, and copy.

---

## Task 1 — Project Scaffold

```
Create a new Expo (TypeScript) app called "muted".

Set up:
- React Navigation: a native-stack navigator for the auth/onboarding flow, 
  nested inside it a bottom-tab navigator for the main app (Home, Explore, Profile tabs).
- A Supabase client in lib/supabase.ts, reading SUPABASE_URL and SUPABASE_ANON_KEY 
  from environment variables (use expo-constants / app.config.ts for env injection).
- A design tokens file (theme.ts) with:
  - Primary gradient: radial blue gradient from a lighter sky blue center to a deeper 
    blue edge (used as the background on splash/onboarding screens)
  - Primary button: solid black background, white text, fully rounded (pill) corners
  - Secondary button: transparent/dark-blue outline, same pill shape
  - Headings: a rounded, hand-lettered/bubbly display font (use "Baloo 2" or "Fredoka" 
    from Google Fonts via expo-google-fonts as a stand-in for a custom script wordmark)
  - Body text: a clean rounded sans-serif (e.g. "Nunito" or system default)
- Empty placeholder screens for every screen in this flow so navigation is wired 
  end-to-end before we build each one:
  SignIn -> Splash -> CategoryPicker -> CategoryConfirm -> ProfileSetupBasics -> 
  ProfileSetupPicture -> NotificationPermission -> (main tabs) Home, Explore, Profile, 
  WallpaperDetail, SearchByGenre

Don't build any real UI yet — just get the navigation skeleton running in the 
iOS simulator and confirm each placeholder screen is reachable.
```

---

## Task 2 — Auth

```
Attach: sign-in screenshot

Build the SignIn screen to match the attached design:
- "Muted" wordmark in the hand-lettered display font, large, centered above a 
  collage-style header image area (use 6 placeholder colored tiles arranged in a 
  slightly rotated grid for now — real artwork comes later)
- "Sign In" label, an email input styled as a light rounded pill, a black "Continue" 
  button, a divider with "Or" text, a white "Continue with Google" button with the 
  Google logo, a "Don't have an account? Create one" link, and Terms/Privacy text 
  at the bottom

Wire it to Supabase Auth:
- Email flow: use Supabase's signInWithOtp or password-based signIn (magic link is 
  fine if simpler) 
- Google flow: use Supabase's signInWithOAuth with Google provider, using 
  expo-auth-session for the native redirect

Add a session listener at the app root: 
- if no session -> SignIn
- if session exists but profiles.onboarding_complete is false or missing -> 
  onboarding flow starting at Splash
- if session exists and onboarding_complete is true -> main tabs

Create the `profiles` table in Supabase now (id uuid references auth.users, 
name text, birth_month text, birth_year text, country text, avatar_url text, 
categories text[], onboarding_complete boolean default false, created_at timestamp).
Add a row-level security policy so users can only read/write their own profile row.
```

---

## Task 3 — Onboarding

```
Attach: splash screenshot, category picker screenshot (12-category version with 
search fallback), "nice you have some options" screenshot, profile step 1 
screenshot (name/DOB/country), profile step 2 screenshot (upload picture), 
notification permission screenshot

Build these screens in sequence, matching the attached designs exactly for layout, 
copy, and spacing:

1. Splash — "M" logo mark, tagline "a wallpaper feed built around your taste" below it, 
   on the blue radial gradient, auto-advances after ~1.5s or on tap

2. CategoryPicker — "What are you looking for" heading, a 3-column grid of 12 category 
   tiles (Chess, Minimal, Cars, Dark, Abstract, Nature, Calligraphy, Comic, Animals, 
   Anime, Illustration, Sport — plus room for Cartoon/Money/Space if space allows), 
   each tile is an image with a label and a checkmark toggle in the corner, multi-select. 
   Below the grid: "Not your taste huh…" text and a search input with a search icon 
   for typing in a custom interest. A black "Next" button at the bottom, disabled 
   until at least one category is selected.

3. CategoryConfirm — "Nice you have some options" heading, a 2x2 grid preview of 
   wallpapers matching the user's selected categories (pull real category tags, use 
   placeholder images for now), black "Next" button.

4. ProfileSetupBasics — "Complete your Profile" heading with a 2-dot page indicator, 
   "What's your name" label + text input, "How old are you?" label with month + year 
   dropdowns, "Where you from?" label with a country dropdown (flag + name), black 
   "Next" button, and a "Skip" outline button below it.

5. ProfileSetupPicture — same header style, "Upload a profile Picture" label, a large 
   circular image picker (use expo-image-picker), black "Finish" button, "Skip" 
   outline button below it.

6. NotificationPermission — bell icon illustration, "Turn on notifications so that you 
   don't miss new wallpapers" heading, black "Allow" button that triggers the actual 
   Expo notifications permission request, and a "Skip" button.

Wire the flow so:
- Selected categories from step 2 save to profiles.categories
- Name/DOB/country from step 4 save to profiles.name / birth_month / birth_year / country
- Picture from step 5 uploads to Supabase Storage bucket "avatars" and saves the URL 
  to profiles.avatar_url
- On finishing (or skipping) step 6, set profiles.onboarding_complete = true and 
  navigate into the main tab flow
```

---

## Task 4 — Data Model & Seed

```
In Supabase, create these tables (in addition to the existing profiles table):

- categories (id uuid, name text, cover_image_url text)
- wallpapers (id uuid, title text, image_url text, category_id uuid references 
  categories, uploader_id uuid references profiles, download_count int default 0, 
  created_at timestamp)
- favorites (id uuid, user_id uuid references profiles, wallpaper_id uuid references 
  wallpapers, created_at timestamp, unique on (user_id, wallpaper_id))
- downloads (id uuid, user_id uuid references profiles, wallpaper_id uuid references 
  wallpapers, created_at timestamp)
- collections (id uuid, user_id uuid references profiles, name text, created_at timestamp)
- collection_items (id uuid, collection_id uuid references collections, wallpaper_id 
  uuid references wallpapers)

Add row-level security: 
- categories and wallpapers are publicly readable by any authenticated user
- favorites, downloads, collections, collection_items are only readable/writable 
  by the owning user_id

Seed the categories table with these 12: Chess, Minimal, Cars, Dark, Abstract, 
Nature, Calligraphy, Comic, Animals, Anime, Illustration, Sport — use royalty-free 
placeholder images from Unsplash/Lorem Picsum for cover_image_url for now.

Seed the wallpapers table with ~20 placeholder wallpapers spread across those 
categories, again using placeholder image URLs, so the browsing screens have 
real data to render.
```

---

## Task 5 — Main Browsing Screens

```
Attach: Home screenshot, Discover screenshot, Explore screenshot, 
Search-by-genre screenshot, Search-by-keyword screenshot

Build the three main tabs plus the search screens, all reading live from Supabase:

1. Home — "Home" heading, 2-column masonry-style grid of wallpaper cards pulled 
   from wallpapers table (mix categories), each card has a heart icon (favorite 
   toggle) in the bottom-right corner that writes/deletes a row in `favorites`.

2. Discover — "Discover" heading + "Curated wallpapers to match your mood" subtitle, 
   same 2-column grid style but pull wallpapers matching the current user's 
   profiles.categories first, then fill in with others.

3. Explore — "Explore" heading, same grid, plus a floating search icon button 
   bottom-right that opens SearchByGenre, and a small floating tag/filter icon 
   bottom-left.

4. SearchByGenre — "Search by genre" heading with "Muted" wordmark, same 12-category 
   grid as onboarding (tap a category to filter wallpapers by it), plus a 
   "Search by Keyword" input pinned near the bottom that does a text search 
   against wallpapers.title.

Add pull-to-refresh and basic loading/empty states to all three grids. Favorite 
state (filled vs outline heart) should reflect whether a `favorites` row exists 
for that user + wallpaper.
```

---

## Task 6 — Wallpaper Detail

```
Attach: wallpaper detail screenshots (both the dark panther example and the 
light/tiger example)

Build the WallpaperDetail screen:
- Full-bleed wallpaper image as the background
- Top bar: back arrow (left), heart/favorite toggle and an "expand" (fullscreen) 
  icon (right)
- Bottom sheet-style overlay: uploader avatar + name, a black "Download Wallpaper" 
  button with a download icon

Wire it so:
- Tapping the heart toggles a `favorites` row for this wallpaper
- Tapping "Download Wallpaper" uses expo-media-library to save the image to the 
  device's photo library, and on success writes a row to `downloads` and increments 
  wallpapers.download_count
- Tapping the expand icon opens the image in a true fullscreen zoomable view 
  (react-native-image-zoom-viewer or similar)
- Navigating here from Home/Discover/Explore/Search passes the wallpaper id so 
  the screen fetches full details from Supabase
```

---

## Task 7 — Profile

```
Attach: profile screenshot(s)

Build the Profile screen:
- Circular avatar (from profiles.avatar_url) with an edit pencil icon overlay, 
  the user's name below it, a sign-out icon button top-right
- Three stat numbers across the top: saved (count of favorites), downloads 
  (count of downloads), collections (count of collections) — each tappable, 
  scrolling to the matching tab below
- Three tabs: "favorites", "downloads", "collections" — each showing the same 
  2-column wallpaper grid style as Home, but scoped to that data:
  - favorites tab: wallpapers joined through the favorites table for this user
  - downloads tab: wallpapers joined through the downloads table for this user
  - collections tab: list of the user's named collections; tapping one shows 
    its wallpapers via collection_items

Sign-out button should call supabase.auth.signOut() and let the root navigator's 
session listener route back to SignIn automatically.
```

---

### Before you start
- Supabase project created, URL + anon key in hand
- Decide: real "Muted" script font file, or accept the Baloo 2 / Fredoka stand-in in Task 1
- Real wallpaper artwork ready to swap in for the Task 4 placeholders, or plan to keep placeholders through launch
