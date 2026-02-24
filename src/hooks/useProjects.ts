import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export const useProjects = (user: User | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load projects
  const loadProjects = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return;
    const { data } = await supabase.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
    if (data) setProjects(data as Project[]);
  }, [user]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  // Load files for a project
  const loadFiles = useCallback(async (projectId: string) => {
    if (!user || !isSupabaseConfigured) return;
    setLoading(true);
    const { data } = await supabase.from('project_files').select('*').eq('project_id', projectId).eq('user_id', user.id).order('name');
    if (data) {
      setFiles(data.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type as 'file' | 'folder',
        content: f.content || '',
        language: f.language || 'plaintext',
      })));
    }
    setActiveProjectId(projectId);
    setLoading(false);
  }, [user]);

  // Create project
  const createProject = useCallback(async (name: string) => {
    if (!user || !isSupabaseConfigured) return null;
    const { data, error } = await supabase.from('projects').insert({ user_id: user.id, name }).select().single();
    if (error || !data) return null;
    await loadProjects();
    return data as Project;
  }, [user, loadProjects]);

  // Delete project
  const deleteProject = useCallback(async (projectId: string) => {
    if (!user || !isSupabaseConfigured) return;
    await supabase.from('projects').delete().eq('id', projectId).eq('user_id', user.id);
    if (activeProjectId === projectId) { setActiveProjectId(null); setFiles([]); }
    await loadProjects();
  }, [user, activeProjectId, loadProjects]);

  // Save file
  const saveFile = useCallback(async (file: ProjectFile) => {
    if (!user || !activeProjectId || !isSupabaseConfigured) return;
    setSaving(true);
    const existing = files.find(f => f.id === file.id);
    if (existing) {
      await supabase.from('project_files').update({
        name: file.name, content: file.content || '', language: file.language || 'plaintext',
      }).eq('id', file.id).eq('user_id', user.id);
    } else {
      await supabase.from('project_files').insert({
        id: file.id, project_id: activeProjectId, user_id: user.id,
        name: file.name, type: file.type, content: file.content || '', language: file.language || 'plaintext',
      });
    }
    setSaving(false);
  }, [user, activeProjectId, files]);

  // Delete file
  const deleteFile = useCallback(async (fileId: string) => {
    if (!user || !isSupabaseConfigured) return;
    await supabase.from('project_files').delete().eq('id', fileId).eq('user_id', user.id);
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, [user]);

  // Bulk save all files
  const saveAllFiles = useCallback(async (filesToSave: ProjectFile[]) => {
    if (!user || !activeProjectId || !isSupabaseConfigured) return;
    setSaving(true);
    for (const file of filesToSave) {
      if (file.type === 'file') {
        const { data } = await supabase.from('project_files').select('id').eq('id', file.id).eq('user_id', user.id).maybeSingle();
        if (data) {
          await supabase.from('project_files').update({ name: file.name, content: file.content || '', language: file.language || 'plaintext' }).eq('id', file.id);
        } else {
          await supabase.from('project_files').insert({
            id: file.id, project_id: activeProjectId, user_id: user.id,
            name: file.name, type: file.type, content: file.content || '', language: file.language || 'plaintext',
          });
        }
      }
    }
    setSaving(false);
  }, [user, activeProjectId]);

  return {
    projects, activeProjectId, files, loading, saving,
    loadProjects, loadFiles, createProject, deleteProject, saveFile, deleteFile, saveAllFiles,
    setFiles, setActiveProjectId,
  };
};
