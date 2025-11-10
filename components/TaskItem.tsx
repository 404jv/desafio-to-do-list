'use client';

import { useState, useRef, useEffect } from 'react';
import { Task } from '@/lib/supabaseClient';
import { supabase } from '@/lib/supabaseClient';
import Button from './Button';
import Toast from './Toast';

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [editedGeneratedDescription, setEditedGeneratedDescription] = useState<string>('');
  const [showGeneratedDescription, setShowGeneratedDescription] = useState(false);
  const [isEditingGenerated, setIsEditingGenerated] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const generatedDescriptionRef = useRef<HTMLTextAreaElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Focus title input when entering edit mode
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  // Sync edit values when task changes
  useEffect(() => {
    if (!isEditing) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
    }
  }, [task.title, task.description, isEditing]);

  // Focus generated description textarea when shown
  useEffect(() => {
    if (showGeneratedDescription && generatedDescriptionRef.current) {
      generatedDescriptionRef.current.focus();
    }
  }, [showGeneratedDescription]);

  const handleToggle = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_done: !task.is_done })
        .eq('id', task.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      onUpdate(); // Refresh to get correct state
    }
  };

  const handleEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
        })
        .eq('id', task.id);

      if (error) throw error;
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      onUpdate(); // Refresh to get correct state
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    
    // Optimistic update - remove from UI immediately
    onDelete(task.id);

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      // Refresh to restore on error
      onUpdate();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleGenerateSteps = async () => {
    setIsGeneratingSteps(true);
    setToast(null);

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK || process.env.N8N_WEBHOOK;
      
      if (!webhookUrl) {
        throw new Error('Webhook URL not configured');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: task.title }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.description) {
        throw new Error('Invalid response format');
      }

      setGeneratedDescription(data.description);
      setEditedGeneratedDescription(data.description);
      setShowGeneratedDescription(true);
      setIsEditingGenerated(false);
    } catch (error: any) {
      console.error('Error generating steps:', error);
      
      if (error.name === 'AbortError') {
        setToast({ message: 'Request timed out. Please try again.', type: 'error' });
      } else {
        setToast({ message: 'Failed to generate steps. Try again.', type: 'error' });
      }
    } finally {
      setIsGeneratingSteps(false);
    }
  };

  const handleAcceptGenerated = async () => {
    if (!generatedDescription) return;

    setIsAccepting(true);
    const descriptionToSave = isEditingGenerated 
      ? editedGeneratedDescription
      : generatedDescription;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ description: descriptionToSave })
        .eq('id', task.id);

      if (error) throw error;

      setShowGeneratedDescription(false);
      setGeneratedDescription(null);
      setEditedGeneratedDescription('');
      setIsEditingGenerated(false);
      setToast({ message: 'Steps saved successfully!', type: 'success' });
      onUpdate();
    } catch (error) {
      console.error('Error saving generated steps:', error);
      setToast({ message: 'Failed to save steps. Please try again.', type: 'error' });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleEditGenerated = () => {
    setEditedGeneratedDescription(generatedDescription || '');
    setIsEditingGenerated(true);
    if (generatedDescriptionRef.current) {
      setTimeout(() => {
        generatedDescriptionRef.current?.focus();
      }, 0);
    }
  };

  const handleCancelGenerated = () => {
    setShowGeneratedDescription(false);
    setGeneratedDescription(null);
    setEditedGeneratedDescription('');
    setIsEditingGenerated(false);
  };

  if (isDeleting) {
    return (
      <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg opacity-0 animate-fade-out">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (showDeleteConfirm) {
    return (
      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg animate-fade-in">
        <p className="text-sm font-medium text-red-800 mb-3">
          Are you sure you want to delete this task?
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleDeleteConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
          <Button
            onClick={handleDeleteCancel}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-4 bg-white border-2 border-primary rounded-lg animate-fade-in">
        <div className="space-y-3">
          <input
            ref={titleInputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isSaving}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Task description (optional)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            disabled={isSaving}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !editTitle.trim()}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="secondary"
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 animate-fade-in group">
      <button
        onClick={handleToggle}
        className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
          task.is_done
            ? 'bg-primary border-primary'
            : 'border-gray-300 hover:border-primary'
        }`}
        aria-label={task.is_done ? 'Mark as undone' : 'Mark as done'}
        disabled={isDeleting}
      >
        {task.is_done && (
          <svg
            className="w-4 h-4 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <h3
          className={`text-base font-medium ${
            task.is_done
              ? 'text-gray-400 line-through'
              : 'text-gray-800'
          }`}
        >
          {task.title}
        </h3>
        {task.description && !showGeneratedDescription && (
          <div className="mt-1">
            <p
              className={`text-sm ${
                task.is_done ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {task.description}
            </p>
            <button
              onClick={handleGenerateSteps}
              disabled={isGeneratingSteps || isDeleting}
              className="mt-2 text-xs text-primary hover:text-[#B02A38] font-medium flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Generate steps for ${task.title}`}
            >
              {isGeneratingSteps ? (
                <>
                  <svg
                    className="animate-spin h-3 w-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Generate Steps
                </>
              )}
            </button>
          </div>
        )}
        {!task.description && !showGeneratedDescription && (
          <button
            onClick={handleGenerateSteps}
            disabled={isGeneratingSteps || isDeleting}
            className="mt-2 text-xs text-primary hover:text-[#B02A38] font-medium flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Generate steps for ${task.title}`}
          >
            {isGeneratingSteps ? (
              <>
                <svg
                  className="animate-spin h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate Steps
              </>
            )}
          </button>
        )}
        {showGeneratedDescription && generatedDescription && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
            <label className="block text-xs font-medium text-blue-800 mb-2">
              Generated Step-by-Step Description:
            </label>
            {isEditingGenerated ? (
              <textarea
                ref={generatedDescriptionRef}
                value={editedGeneratedDescription}
                onChange={(e) => setEditedGeneratedDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={6}
                placeholder="Edit the generated steps..."
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {generatedDescription}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleAcceptGenerated}
                disabled={isAccepting}
                className="flex-1 text-sm py-1.5"
              >
                {isAccepting ? 'Saving...' : 'Accept'}
              </Button>
              {!isEditingGenerated ? (
                <Button
                  onClick={handleEditGenerated}
                  variant="secondary"
                  className="flex-1 text-sm py-1.5"
                >
                  Edit
                </Button>
              ) : (
                <Button
                  onClick={() => setIsEditingGenerated(false)}
                  variant="secondary"
                  className="flex-1 text-sm py-1.5"
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                onClick={handleCancelGenerated}
                variant="secondary"
                className="flex-1 text-sm py-1.5"
                disabled={isAccepting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="More options"
          aria-expanded={showMenu}
          aria-haspopup="true"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fade-in">
            <button
              onClick={handleEdit}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg transition-colors focus:outline-none focus:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg transition-colors focus:outline-none focus:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
}
