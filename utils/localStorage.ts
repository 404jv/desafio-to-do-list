export interface StoredUser {
  id: string;
  name: string;
  email: string;
}

export const getUserFromStorage = (): StoredUser | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const saveUserToStorage = (user: StoredUser): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUserFromStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
};

