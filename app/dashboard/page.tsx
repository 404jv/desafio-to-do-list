'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserFromStorage, removeUserFromStorage, StoredUser } from '@/utils/localStorage';
import Button from '@/components/Button';
import TaskList from '@/components/TaskList';
import ChatAssistant from '@/components/ChatAssistant';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const storedUser = getUserFromStorage();
    
    if (!storedUser) {
      router.push('/');
      return;
    }

    setUser(storedUser);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    removeUserFromStorage();
    router.push('/');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#CA3040]">
        <div className="text-white">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#CA3040] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Hello, <span className="text-primary">{user.name}</span>!
              </h1>
              <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="secondary"
            >
              Logout
            </Button>
          </div>
          
          <TaskList key={refreshKey} userEmail={user.email} />
        </div>
      </div>
      <ChatAssistant
        userEmail={user.email}
        onTaskCreated={() => {
          // Refresh task list after a delay to allow tasks to be created
          setTimeout(() => {
            setRefreshKey((prev) => prev + 1);
          }, 2000);
        }}
      />
    </main>
  );
}

