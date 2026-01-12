-- 1. Make organization_id nullable
ALTER TABLE public.prayers ALTER COLUMN organization_id DROP NOT NULL;

-- 2. Drop old policies
DROP POLICY IF EXISTS "View prayers in same organization" ON public.prayers;
DROP POLICY IF EXISTS "Insert prayers in same organization" ON public.prayers;

-- 3. Create new policies
CREATE POLICY "View prayers in same organization or own"
  ON public.prayers FOR SELECT
  USING (
    (organization_id IS NOT NULL AND organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ))
    OR user_id = auth.uid()
  );

CREATE POLICY "Insert prayers in same organization or personal"
  ON public.prayers FOR INSERT
  WITH CHECK (
    (organization_id IS NOT NULL AND organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ))
    OR (organization_id IS NULL AND user_id = auth.uid())
  );
