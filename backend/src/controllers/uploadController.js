import { supabase } from '../config/supabase.js';

/**
 * Faz upload de avatar para o Supabase Storage
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.file;
    const userId = req.userId;

    // Gera nome único para o arquivo
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('Erro ao fazer upload:', error);
      return res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
    }

    // Gera URL pública
    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const avatarUrl = publicData.publicUrl;

    // Atualiza o usuário com a nova URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError);
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }

    return res.status(200).json({
      message: 'Avatar atualizado com sucesso',
      avatar_url: avatarUrl,
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
