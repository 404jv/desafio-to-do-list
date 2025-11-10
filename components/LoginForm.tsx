'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { saveUserToStorage } from '@/utils/localStorage';
import Input from './Input';
import Button from './Button';

export default function LoginForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const { data: existingUser, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      let user;

      if (existingUser) {
        // If user already exists, update name if necessary
        if (existingUser.name !== name) {
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ name })
            .eq('email', email)
            .select()
            .single();

          if (updateError) throw updateError;
          user = updatedUser;
        } else {
          user = existingUser;
        }
      } else {
        // If doesn't exist, create a new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{ name, email }])
          .select()
          .single();

        if (insertError) throw insertError;
        user = newUser;
      }

      // Save to localStorage
      saveUserToStorage({
        id: user.id,
        name: user.name,
        email: user.email,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      setErrors({ email: 'Error processing login. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <Input
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        error={errors.name}
        disabled={isLoading}
        required
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        error={errors.email}
        disabled={isLoading}
        required
      />
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-6"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}

