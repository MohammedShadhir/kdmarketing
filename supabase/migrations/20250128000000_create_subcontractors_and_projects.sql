CREATE TABLE IF NOT EXISTS public.subcontractors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    default_subcontractor_percentage NUMERIC DEFAULT 70,
    default_sales_percentage NUMERIC DEFAULT 15,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subcontractor_id UUID NOT NULL REFERENCES public.subcontractors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    project_price NUMERIC NOT NULL,
    subcontractor_percentage NUMERIC NOT NULL,
    sales_commission_percentage NUMERIC NOT NULL,
    sales_person TEXT,
    advance_payment_amount NUMERIC DEFAULT 0,
    mode_of_payment TEXT,
    start_date DATE,
    end_date DATE,
    notes TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_subcontractor_id ON public.projects(subcontractor_id);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON public.projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_end_date ON public.projects(end_date);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

ALTER TABLE public.subcontractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.subcontractors
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.subcontractors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.subcontractors
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.subcontractors
    FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.projects
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.projects
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON public.projects
    FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_subcontractors
    BEFORE UPDATE ON public.subcontractors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_projects
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
