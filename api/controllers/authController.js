import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

/**
 * Registra um novo usuário no sistema
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validações básicas
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    // Verifica se o usuário já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          name,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Autentica um usuário existente
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Busca o usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Retorna os dados do usuário autenticado
 */
export const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, avatar_url, weight, height, age, created_at')
      .eq('id', req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza os dados do perfil do usuário
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar_url, weight, height, age } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (weight !== undefined) updateData.weight = weight;
    if (height !== undefined) updateData.height = height;
    if (age !== undefined) updateData.age = age;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.userId)
      .select('id, email, name, avatar_url, weight, height, age, created_at')
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }

    return res.status(200).json({
      message: 'Perfil atualizado com sucesso',
      user,
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Atualiza a senha do usuário
 */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Senha atual e nova senha são obrigatórias',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'A nova senha deve ter no mínimo 6 caracteres',
      });
    }

    // Busca o usuário com a senha
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verifica a senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', req.userId);

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return res.status(500).json({ error: 'Erro ao atualizar senha' });
    }

    return res.status(200).json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
