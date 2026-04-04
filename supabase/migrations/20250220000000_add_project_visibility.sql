ALTER TABLE projects
ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private'));

CREATE INDEX idx_projects_visibility ON projects(visibility);
