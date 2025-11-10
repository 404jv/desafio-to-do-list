import LoginForm from '@/components/LoginForm';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            To-Do List
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Sign in to continue
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

