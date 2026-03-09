-- Policies for the 'conversation' table
ALTER TABLE public.conversation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert conversations they create" 
ON public.conversation 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "Users can view conversations they belong to" 
ON public.conversation 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_member 
    WHERE conversation_member.conversation_id = conversation.id 
    AND conversation_member.user_id = auth.uid()
  )
);

-- Policies for the 'conversation_member' table
ALTER TABLE public.conversation_member ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can join conversations" 
ON public.conversation_member 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own memberships" 
ON public.conversation_member 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);


-- 1. Reset existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert conversations they create" ON public.conversation;
DROP POLICY IF EXISTS "Users can view conversations they belong to" ON public.conversation;
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_member;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.conversation_member;

-- 2. Allow ALL operations for authenticated users on 'conversation'
CREATE POLICY "Allow all for auth users" 
ON public.conversation 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Allow ALL operations for authenticated users on 'conversation_member'
CREATE POLICY "Allow all for auth users" 
ON public.conversation_member 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Allow ALL operations for authenticated users on 'message' (you'll need this next!)
ALTER TABLE public.message ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for auth users" 
ON public.message 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);