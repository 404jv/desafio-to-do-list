'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, Task } from '@/lib/supabaseClient';
import TaskItem from './TaskItem';
import AddTaskForm from './AddTaskForm';
import Button from './Button';

interface TaskListProps {
  userEmail: string;
}

export default function TaskList({ userEmail }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskAdded = () => {
    setShowAddForm(false);
    fetchTasks();
  };

  const handleTaskUpdate = () => {
    fetchTasks();
  };

  const handleTaskDelete = (taskId: string) => {
    // Optimistic update - remove from UI immediately
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-600 py-8">Loading tasks...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
      </div>

      {showAddForm ? (
        <AddTaskForm
          userEmail={userEmail}
          onTaskAdded={handleTaskAdded}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <Button
          onClick={() => setShowAddForm(true)}
          className="w-full border-2 border-dashed border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-primary"
        >
          + Add Task
        </Button>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-lg">No tasks yet. Add your first one!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

