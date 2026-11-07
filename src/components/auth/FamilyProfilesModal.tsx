import React, { useState } from 'react';
import { X, Users, UserPlus, Lock, KeyRound, Check, Shield, Trash2, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { UserProfile } from '../../types';

interface FamilyProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileSwitched: (user: UserProfile) => void;
}

const AVAILABLE_AVATARS = ['🦁', '⚡', '🦾', '🥊', '🏃', '🧘', '🏋️', '🔥', '🦅', '🐺'];

export const FamilyProfilesModal: React.FC<FamilyProfilesModalProps> = ({
  isOpen,
  onClose,
  onProfileSwitched,
}) => {
  const [users, setUsers] = useState<UserProfile[]>(authService.getUsers());
  const [activeUser, setActiveUser] = useState<UserProfile>(authService.getActiveUser());
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUserToSwitch, setSelectedUserToSwitch] = useState<UserProfile | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('1234');
  const [newAvatar, setNewAvatar] = useState('⚡');
  const [newFitnessLevel, setNewFitnessLevel] = useState<'principiante' | 'intermedio' | 'avanzado'>('intermedio');
  const [newWeight, setNewWeight] = useState<number | undefined>(70);
  const [newHeight, setNewHeight] = useState<number | undefined>(172);

  if (!isOpen) return null;

  const refreshUsers = () => {
    setUsers(authService.getUsers());
    setActiveUser(authService.getActiveUser());
  };

  const handleSelectUser = (user: UserProfile) => {
    if (user.id === activeUser.id) return;
    setSelectedUserToSwitch(user);
    setPasswordInput('');
    setErrorMessage(null);
  };

  const handleConfirmSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToSwitch) return;

    const result = authService.switchUser(selectedUserToSwitch.id, passwordInput.trim());
    if (result.success && result.user) {
      setSuccessMessage(result.message);
      setActiveUser(result.user);
      setSelectedUserToSwitch(null);
      setPasswordInput('');
      refreshUsers();
      onProfileSwitched(result.user);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 900);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = authService.createUser({
      name: newName,
      username: newUsername,
      password: newPassword,
      avatar: newAvatar,
      fitnessLevel: newFitnessLevel,
      weightKg: newWeight,
      heightCm: newHeight,
    });

    if (result.success && result.user) {
      setSuccessMessage(result.message);
      refreshUsers();
      setIsCreating(false);
      // Reset form
      setNewName('');
      setNewUsername('');
      setNewPassword('1234');
      onProfileSwitched(result.user);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1000);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el perfil de "${name}"? Sus datos locales serán eliminados.`)) {
      const res = authService.deleteUser(userId);
      if (res.success) {
        refreshUsers();
        setSuccessMessage(res.message);
        setTimeout(() => setSuccessMessage(null), 2000);
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-industrial-950/80 backdrop-blur-md animate-fadeIn font-industrial">
      <div className="relative w-full max-w-lg bg-industrial-900 border border-industrial-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-lime-accent/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-industrial-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-industrial-950 border border-lime-accent/40 flex items-center justify-center text-lime-accent shadow-lime-glow">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono text-slate-100 uppercase tracking-tight">
                Perfiles Familiares OL9
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Cuentas y contraseñas separadas para tu familia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-industrial-950 border border-industrial-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alerts */}
        {errorMessage && (
          <div className="mt-3 p-3 bg-red-500/15 border border-red-500/40 text-red-400 rounded-2xl text-xs font-mono flex items-center gap-2 animate-fadeIn shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-3 p-3 bg-lime-accent/15 border border-lime-accent/40 text-lime-accent rounded-2xl text-xs font-mono font-bold flex items-center gap-2 animate-fadeIn shrink-0">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Body Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4">
          {/* PIN PROMPT MODAL OVERLAY */}
          {selectedUserToSwitch && (
            <div className="bg-industrial-950 border border-lime-accent/40 rounded-2xl p-5 shadow-lime-glow animate-fadeIn">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{selectedUserToSwitch.avatar}</span>
                <div>
                  <h3 className="text-sm font-bold font-mono text-slate-100">
                    Cambiar a {selectedUserToSwitch.name}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Ingresa el PIN o contraseña asignada (por defecto: 1234)
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmSwitch} className="space-y-3">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    autoFocus
                    placeholder="Contraseña o PIN (ej. 1234)"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-lime-accent"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUserToSwitch(null);
                      setPasswordInput('');
                    }}
                    className="w-1/2 py-2 bg-industrial-900 text-slate-400 border border-industrial-800 font-mono text-xs font-bold rounded-xl hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 bg-lime-accent text-industrial-950 font-mono text-xs font-black rounded-xl hover:brightness-110 shadow-lime-glow"
                  >
                    Ingresar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CREATE NEW MEMBER FORM */}
          {isCreating ? (
            <div className="bg-industrial-950/80 border border-industrial-800 rounded-2xl p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-industrial-800 pb-2">
                <h3 className="text-xs font-black font-mono uppercase text-lime-accent tracking-wider">
                  Nuevo Perfil Familiar
                </h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Nombre o Apodo Familiar *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Mamá, Carlos, Hermana"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-lime-accent"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    Usuario único *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. carlos9"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-lime-accent"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    PIN / Contraseña de acceso *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="PIN numérico o clave secreta"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-lime-accent"
                  />
                </div>

                {/* Avatar Picker */}
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1.5">
                    Selecciona Avatar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_AVATARS.map((av) => (
                      <button
                        type="button"
                        key={av}
                        onClick={() => setNewAvatar(av)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-transform ${
                          newAvatar === av
                            ? 'bg-lime-accent/20 border-lime-accent scale-110 shadow-lime-glow'
                            : 'bg-industrial-900 border-industrial-800 hover:border-slate-600'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fitness Level */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(['principiante', 'intermedio', 'avanzado'] as const).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setNewFitnessLevel(lvl)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-mono font-bold uppercase border transition-all ${
                        newFitnessLevel === lvl
                          ? 'bg-gold-amber text-industrial-950 border-gold-accent font-black'
                          : 'bg-industrial-900 border-industrial-800 text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                {/* Weight & Height */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      value={newWeight || ''}
                      onChange={(e) => setNewWeight(Number(e.target.value) || undefined)}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">Altura (cm)</label>
                    <input
                      type="number"
                      value={newHeight || ''}
                      onChange={(e) => setNewHeight(Number(e.target.value) || undefined)}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 bg-gradient-to-r from-lime-accent to-lime-glow text-industrial-950 font-mono font-black text-xs uppercase tracking-wider rounded-xl shadow-lime-glow hover:brightness-110 transition-all"
                >
                  Guardar Perfil Familiar
                </button>
              </form>
            </div>
          ) : (
            /* LIST OF FAMILY PROFILES */
            <div className="space-y-2.5">
              {users.map((user) => {
                const isActive = user.id === activeUser.id;

                return (
                  <div
                    key={user.id}
                    className={`bg-industrial-950/80 border rounded-2xl p-3.5 transition-all flex items-center justify-between ${
                      isActive
                        ? 'border-lime-accent bg-lime-accent/5 shadow-lime-glow'
                        : 'border-industrial-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-industrial-900 border border-industrial-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {user.avatar}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold font-mono text-slate-100">
                            {user.name}
                          </h4>
                          {isActive && (
                            <span className="text-[9px] font-mono bg-lime-accent text-industrial-950 font-black px-1.5 py-0.5 rounded uppercase">
                              Activo
                            </span>
                          )}
                          {user.role === 'owner' && (
                            <span className="text-[9px] font-mono bg-industrial-900 border border-gold-accent/40 text-gold-accent px-1.5 py-0.5 rounded uppercase">
                              Admin
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          @{user.username} • Nivel {user.fitnessLevel}
                          {user.weightKg ? ` • ${user.weightKg}kg` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!isActive ? (
                        <button
                          onClick={() => handleSelectUser(user)}
                          className="px-3 py-1.5 bg-industrial-900 hover:bg-industrial-800 border border-industrial-700 hover:border-lime-accent text-slate-200 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3 text-lime-accent" />
                          <span>Cambiar</span>
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-lime-accent/15 border border-lime-accent flex items-center justify-center text-lime-accent">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}

                      {user.role !== 'owner' && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                          title="Eliminar este perfil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-industrial-800 flex items-center justify-between shrink-0">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 bg-industrial-950 hover:bg-industrial-800 border border-lime-accent/50 text-lime-accent text-xs font-mono font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" /> + Añadir Nuevo Miembro Familiar
            </button>
          ) : (
            <p className="text-[10px] font-mono text-slate-500 text-center w-full">
              Cada perfil guarda de forma aislada sus métricas de trote, series de pesas y abdomen.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
