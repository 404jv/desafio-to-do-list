'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Input from './Input';
import Button from './Button';

interface AddTaskFormProps {
  userEmail: string;
  onTaskAdded: () => void;
  onCancel: () => void;
}

export default function AddTaskForm({
  userEmail,
  onTaskAdded,
  onCancel,
}: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('tasks')
        .insert([
          {
            user_email: userEmail,
            title: title.trim(),
            description: description.trim() || null,
          },
        ]);

      if (insertError) throw insertError;

      setTitle('');
      setDescription('');
      onTaskAdded();
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Error adding task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <Input
        label="Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New Task Title"
        disabled={isLoading}
        required
      />
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description (optional)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
          rows={3}
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

