import { UserProfile } from '../types';

const USERS_STORAGE_KEY = 'ol9_family_profiles';
const ACTIVE_USER_ID_KEY = 'ol9_active_user_id';

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr_oscar',
    username: 'oscar',
    name: 'Óscar (Principal)',
    passwordHash: '1234',
    avatar: '🦁',
    role: 'owner',
    fitnessLevel: 'avanzado',
    weightKg: 78,
    heightCm: 178,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_familiar',
    username: 'familiar',
    name: 'Familiar / Invitado',
    passwordHash: '1234',
    avatar: '⚡',
    role: 'member',
    fitnessLevel: 'intermedio',
    weightKg: 65,
    heightCm: 168,
    createdAt: new Date().toISOString(),
  },
];

class AuthService {
  private listeners: ((user: UserProfile) => void)[] = [];

  // Get all registered family members
  getUsers(): UserProfile[] {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  }

  // Save all users
  private saveUsers(users: UserProfile[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  // Get active user profile
  getActiveUser(): UserProfile {
    const users = this.getUsers();
    if (typeof window === 'undefined') return users[0];
    const activeId = localStorage.getItem(ACTIVE_USER_ID_KEY);
    if (activeId) {
      const found = users.find((u) => u.id === activeId);
      if (found) return found;
    }
    // Default to first user
    const defaultUser = users[0];
    localStorage.setItem(ACTIVE_USER_ID_KEY, defaultUser.id);
    return defaultUser;
  }

  // Switch to another family member profile
  switchUser(userId: string, passwordAttempt: string): { success: boolean; message: string; user?: UserProfile } {
    const users = this.getUsers();
    const targetUser = users.find((u) => u.id === userId);

    if (!targetUser) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    if (targetUser.passwordHash && targetUser.passwordHash !== passwordAttempt) {
      return { success: false, message: 'Contraseña o PIN incorrecto.' };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_USER_ID_KEY, targetUser.id);
    }

    // Notify listeners
    this.notifyUserChanged(targetUser);
    return { success: true, message: `¡Bienvenido de vuelta, ${targetUser.name}!`, user: targetUser };
  }

  // Register a new family member
  createUser(data: {
    name: string;
    username: string;
    password: string;
    avatar: string;
    fitnessLevel: 'principiante' | 'intermedio' | 'avanzado';
    weightKg?: number;
    heightCm?: number;
  }): { success: boolean; message: string; user?: UserProfile } {
    const users = this.getUsers();
    const normalizedUsername = data.username.trim().toLowerCase();

    if (users.some((u) => u.username.toLowerCase() === normalizedUsername)) {
      return { success: false, message: 'Ese nombre de usuario ya existe en la familia.' };
    }

    if (!data.name.trim()) {
      return { success: false, message: 'El nombre es obligatorio.' };
    }

    const newUser: UserProfile = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(7),
      username: normalizedUsername,
      name: data.name.trim(),
      passwordHash: data.password || '1234',
      avatar: data.avatar || '🦾',
      role: 'member',
      fitnessLevel: data.fitnessLevel || 'intermedio',
      weightKg: data.weightKg,
      heightCm: data.heightCm,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    this.saveUsers(updatedUsers);

    // Switch to newly created user
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_USER_ID_KEY, newUser.id);
    }
    this.notifyUserChanged(newUser);

    return { success: true, message: `Perfil familiar creado con éxito para ${newUser.name}.`, user: newUser };
  }

  // Update existing profile
  updateUser(userId: string, updates: Partial<UserProfile>): boolean {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return false;

    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);

    const activeUser = this.getActiveUser();
    if (activeUser.id === userId) {
      this.notifyUserChanged(users[index]);
    }
    return true;
  }

  // Delete family profile (owner cannot be deleted)
  deleteUser(userId: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, message: 'Perfil no encontrado.' };

    if (target.role === 'owner') {
      return { success: false, message: 'No se puede eliminar el perfil principal de la app.' };
    }

    const remaining = users.filter((u) => u.id !== userId);
    this.saveUsers(remaining);

    // If active was deleted, fallback to owner
    const active = this.getActiveUser();
    if (active.id === userId) {
      const owner = remaining.find((u) => u.role === 'owner') || remaining[0];
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_USER_ID_KEY, owner.id);
      }
      this.notifyUserChanged(owner);
    }

    return { success: true, message: 'Perfil eliminado correctamente.' };
  }

  // Subscribe to user change events
  onUserChanged(callback: (user: UserProfile) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyUserChanged(user: UserProfile) {
    this.listeners.forEach((cb) => cb(user));
  }
}

export const authService = new AuthService();
