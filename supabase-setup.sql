-- Better Reads App - Supabase Setup Script
-- This script sets up RLS policies, admin capabilities, and performance optimizations

-- ===========================================
-- 1. ADD ADMIN FIELD TO PROFILES TABLE
-- ===========================================

-- Add admin boolean field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Create a default admin user (you can change this later)
-- UPDATE public.profiles SET is_admin = true WHERE username = 'your-admin-username';

-- ===========================================
-- 2. CREATE ADMIN FUNCTION
-- ===========================================

-- Create a fast admin check function for RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookshelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookshelf_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 4. CREATE RLS POLICIES
-- ===========================================

-- PROFILES TABLE POLICIES
CREATE POLICY "Profiles are publicly readable, users can edit their own" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- BOOKS TABLE POLICIES
CREATE POLICY "Books are publicly readable" ON public.books
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create books" ON public.books
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- BOOKSHELVES TABLE POLICIES
CREATE POLICY "Users can view their own bookshelves" ON public.bookshelves
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create their own bookshelves" ON public.bookshelves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookshelves" ON public.bookshelves
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own bookshelves" ON public.bookshelves
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- BOOKSHELF_BOOKS TABLE POLICIES
CREATE POLICY "Users can manage books in their own bookshelves" ON public.bookshelf_books
  FOR SELECT USING (
    auth.uid() = (
      SELECT user_id FROM public.bookshelves WHERE id = bookshelf_id
    )
  );

CREATE POLICY "Users can add books to their own bookshelves" ON public.bookshelf_books
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM public.bookshelves WHERE id = bookshelf_id
    )
  );

CREATE POLICY "Users can remove books from their own bookshelves" ON public.bookshelf_books
  FOR DELETE USING (
    auth.uid() = (
      SELECT user_id FROM public.bookshelves WHERE id = bookshelf_id
    )
  );

-- USER_BOOKS TABLE POLICIES
CREATE POLICY "Reading progress is publicly viewable" ON public.user_books
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reading progress" ON public.user_books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress" ON public.user_books
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own reading progress" ON public.user_books
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- READING_SESSIONS TABLE POLICIES
CREATE POLICY "Reading sessions are publicly viewable" ON public.reading_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reading sessions" ON public.reading_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading sessions" ON public.reading_sessions
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own reading sessions" ON public.reading_sessions
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- REVIEWS TABLE POLICIES
CREATE POLICY "Reviews are publicly readable" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- USER_STATS TABLE POLICIES
CREATE POLICY "Stats are publicly viewable" ON public.user_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- ===========================================
-- 5. PERFORMANCE OPTIMIZATIONS
-- ===========================================

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON public.user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_user_books_status ON public.user_books(status);
CREATE INDEX IF NOT EXISTS idx_user_books_book_id ON public.user_books(book_id);
CREATE INDEX IF NOT EXISTS idx_user_books_user_status ON public.user_books(user_id, status);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON public.reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON public.reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_date ON public.reading_sessions(session_date);

CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON public.reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

CREATE INDEX IF NOT EXISTS idx_bookshelf_books_bookshelf_id ON public.bookshelf_books(bookshelf_id);
CREATE INDEX IF NOT EXISTS idx_bookshelf_books_book_id ON public.bookshelf_books(book_id);

CREATE INDEX IF NOT EXISTS idx_bookshelves_user_id ON public.bookshelves(user_id);
CREATE INDEX IF NOT EXISTS idx_bookshelves_is_default ON public.bookshelves(is_default);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- ===========================================
-- 6. VERIFICATION QUERIES
-- ===========================================

-- Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'books', 'bookshelves', 'bookshelf_books', 'user_books', 'reading_sessions', 'reviews', 'user_stats');

-- Check if policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check if indexes are created
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'; 