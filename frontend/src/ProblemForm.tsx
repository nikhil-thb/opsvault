import MarkdownEditor from "./MarkdownEditor";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function ProblemForm({ user }: { user: any }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fix, setFix] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories/');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && !category) {
          setCategory(data[0].name);
        } else if (data.length === 0) {
          setCategory('General');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetch('/api/projects/')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        if (data.length > 0) {
          setProjectId(data[0].id);
        }
      });
  }, []);

  const handleAddCategory = async () => {
    const newCat = window.prompt("Enter new category name:");
    if (!newCat) return;
    
    try {
      const res = await fetch('/api/categories/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCat })
      });
      if (res.ok) {
        await fetchCategories();
        setCategory(newCat);
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to add category");
      }
    } catch (e) {
      alert("Network error while adding category.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError('You must select a project.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/problems/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          title,
          description,
          category,
          status: 'OPEN',
          symptoms: '',
          investigation: '',
          root_cause: fix,
          prevention: '',
          technology: '',
          references: '',
          tags: []
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        navigate(`/problems/${data.id}`);
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to create incident');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Record New Incident</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm">{error}</div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Incident Title</label>
            <div className="mt-2">
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 px-3"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Project</label>
            <div className="mt-2">
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 px-3"
              >
                <option value="" disabled>Select a project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Category</label>
          <div className="mt-2 flex gap-2">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6 px-3"
            >
              {categories.length === 0 && <option>General</option>}
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            {user?.role === 'ORG_ADMIN' && (
              <button
                type="button"
                onClick={handleAddCategory}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-600 shadow-sm hover:bg-teal-100"
              >
                <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                Add
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Description</label>
          <p className="text-xs text-red-500 mb-2">WARNING: Do not store passwords, API keys, access tokens, private keys, or credentials here.</p>
          <div className="mt-2">
            <MarkdownEditor value={description} onChange={setDescription} required placeholder="Describe the incident..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Fix / Solution</label>
          <p className="text-xs text-gray-500 mb-2">Document the commands, configuration changes, or steps taken to resolve the incident.</p>
          <div className="mt-2">
            <MarkdownEditor value={fix} onChange={setFix} placeholder="Document the fix..." />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/problems')}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            {loading ? 'Saving...' : 'Save Incident'}
          </button>
        </div>
      </form>
    </div>
  );
}
