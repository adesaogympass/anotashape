import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Camera, Save, Lock, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { profileService, uploadService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import BottomNav from '../components/BottomNav';

/**
 * Página de configurações com edição de perfil
 */
const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Dados do perfil
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Alteração de senha
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Dias de descanso
  const [restDays, setRestDays] = useState([]);
  const [restDaysLoading, setRestDaysLoading] = useState(false);
  const [restDaysSuccess, setRestDaysSuccess] = useState('');

  const daysOfWeek = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda' },
    { value: 2, label: 'Terça' },
    { value: 3, label: 'Quarta' },
    { value: 4, label: 'Quinta' },
    { value: 5, label: 'Sexta' },
    { value: 6, label: 'Sábado' },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileService.getProfile();
      const profile = response.data.user;

      setName(profile.name || '');
      setAvatarUrl(profile.avatar_url || '');
      setWeight(profile.weight || '');
      setHeight(profile.height || '');
      setAge(profile.age || '');
      setRestDays(profile.rest_days || []);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const toggleRestDay = (day) => {
    setRestDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleUpdateRestDays = async () => {
    setRestDaysLoading(true);
    setRestDaysSuccess('');
    setError('');

    try {
      await profileService.updateProfile({ rest_days: restDays });
      setRestDaysSuccess('Dias de descanso atualizados!');
      setTimeout(() => setRestDaysSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar dias de descanso:', error);
      setError(error.response?.data?.error || 'Erro ao atualizar dias de descanso');
    } finally {
      setRestDaysLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      return;
    }

    // Validação de tipo
    if (!file.type.startsWith('image/')) {
      setError('Apenas imagens são permitidas');
      return;
    }

    setAvatarFile(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    setError('');

    try {
      const response = await uploadService.uploadAvatar(avatarFile);
      setAvatarUrl(response.data.avatar_url);
      setAvatarFile(null);
      setAvatarPreview('');
      setSuccess('Foto de perfil atualizada!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setError(error.response?.data?.error || 'Erro ao fazer upload da foto');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = {
        name,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        age: age ? parseInt(age) : null,
      };

      await profileService.updateProfile(data);
      setSuccess('Perfil atualizado com sucesso!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError(error.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setPasswordLoading(true);

    try {
      await profileService.updatePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      setTimeout(() => {
        setPasswordSuccess('');
        setShowPasswordForm(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      setPasswordError(
        error.response?.data?.error || 'Erro ao atualizar senha'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      navigate('/login');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen pb-20 bg-dark-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-800 mb-2">Perfil</h1>
          <p className="text-dark-500">Gerencie suas informações pessoais</p>
        </div>

        {/* Avatar e email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card>
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarPreview || avatarUrl ? (
                  <img
                    src={avatarPreview || avatarUrl}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {getInitials(name || user?.name || 'U')}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-dark-800">
                  {name || user?.name}
                </h2>
                <p className="text-dark-500">{user?.email}</p>
                {avatarFile && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleUploadAvatar}
                      loading={uploadingAvatar}
                      className="text-xs"
                    >
                      Salvar Foto
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview('');
                      }}
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Formulário de perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <h3 className="text-lg font-bold text-dark-800 mb-4">
              Informações Pessoais
            </h3>

            {success && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-4"
              >
                {success}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Nome"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Peso (kg)"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 75.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />

                <Input
                  label="Altura (cm)"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />

                <Input
                  label="Idade"
                  type="number"
                  placeholder="Ex: 25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Salvar Alterações
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Dias de Descanso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-dark-800">Dias de Descanso</h3>
            </div>

            {restDaysSuccess && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-4"
              >
                {restDaysSuccess}
              </motion.div>
            )}

            <p className="text-dark-500 text-sm mb-4">
              Selecione os dias da semana em que você NÃO treina
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {daysOfWeek.map((day) => {
                const isRest = restDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    onClick={() => toggleRestDay(day.value)}
                    className={`
                      p-3 rounded-lg font-medium text-sm transition-all
                      ${
                        isRest
                          ? 'bg-red-500/20 text-red-500 border-2 border-red-500'
                          : 'bg-dark-200 text-dark-600 hover:bg-dark-300 border-2 border-dark-200'
                      }
                    `}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>

            <Button
              fullWidth
              onClick={handleUpdateRestDays}
              loading={restDaysLoading}
              className="flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar Dias de Descanso
            </Button>
          </Card>
        </motion.div>

        {/* Alteração de senha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-dark-800">Segurança</h3>
              </div>
              {!showPasswordForm && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPasswordForm(true)}
                >
                  Alterar Senha
                </Button>
              )}
            </div>

            {showPasswordForm && (
              <>
                {passwordSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-4"
                  >
                    {passwordSuccess}
                  </motion.div>
                )}

                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4"
                  >
                    {passwordError}
                  </motion.div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <Input
                    label="Senha Atual"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />

                  <Input
                    label="Nova Senha"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />

                  <Input
                    label="Confirmar Nova Senha"
                    type="password"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                  />

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmNewPassword('');
                        setPasswordError('');
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      loading={passwordLoading}
                      className="flex-1"
                    >
                      Alterar Senha
                    </Button>
                  </div>
                </form>
              </>
            )}

            {!showPasswordForm && (
              <p className="text-dark-500 text-sm">
                Altere sua senha periodicamente para manter sua conta segura
              </p>
            )}
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="danger"
            fullWidth
            onClick={handleLogout}
            className="flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sair da Conta
          </Button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
