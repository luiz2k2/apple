const mongoose = require('mongoose');
const Aparelho = require('../models/Aparelho');

/**
 * Health check da API
 * GET /api
 */
exports.healthCheck = (req, res) => {
  return res.status(200).json({
    sucesso: true,
    mensagem: 'API de Aparelhos Apple funcionando com sucesso!',
    versao: '1.0.0',
    timestamp: new Date().toISOString(),
    banco: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
  });
};

/**
 * Listar todos os aparelhos
 * GET /api/aparelhos
 */
exports.listar = async (req, res, next) => {
  try {
    const aparelhos = await Aparelho.find().sort({ createdAt: -1 });
    return res.status(200).json(aparelhos);
  } catch (error) {
    return next(error);
  }
};

/**
 * Buscar aparelho por ID
 * GET /api/aparelhos/:id
 */
exports.buscarPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do aparelho fornecido é inválido.',
      });
    }

    const aparelho = await Aparelho.findById(id);

    if (!aparelho) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Aparelho não encontrado.',
      });
    }

    return res.status(200).json(aparelho);
  } catch (error) {
    return next(error);
  }
};

/**
 * Cadastrar novo aparelho
 * POST /api/aparelhos
 */
exports.criar = async (req, res, next) => {
  try {
    let { marca, modelo, preco, foto } = req.body;

    // Se marca não for enviada, assume "Apple" por padrão
    if (!marca) {
      marca = 'Apple';
    }

    // Validação da marca: deve ser exclusivamente "Apple"
    if (typeof marca !== 'string' || !/^apple$/i.test(marca.trim())) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Apenas aparelhos da marca "Apple" são permitidos neste sistema.',
      });
    }

    // Validação do modelo
    if (!modelo || typeof modelo !== 'string' || modelo.trim().length < 2) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "O campo 'modelo' é obrigatório e deve conter ao menos 2 caracteres.",
      });
    }

    // Validação e conversão do preço
    if (preco === undefined || preco === null || preco === '') {
      return res.status(400).json({
        sucesso: false,
        mensagem: "O campo 'preco' é obrigatório.",
      });
    }

    const precoNumerico = typeof preco === 'string'
      ? parseFloat(preco.replace(/\./g, '').replace(',', '.'))
      : Number(preco);

    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "O campo 'preco' deve ser um valor numérico positivo maior que zero.",
      });
    }

    // Validação da foto
    if (!foto || typeof foto !== 'string' || !/^(https?:\/\/|data:image\/)/i.test(foto.trim())) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "O campo 'foto' é obrigatório e deve conter uma URL válida iniciada com http:// ou https://.",
      });
    }

    const novoAparelho = new Aparelho({
      marca: 'Apple',
      modelo: modelo.trim(),
      preco: precoNumerico,
      foto: foto.trim(),
    });

    const aparelhoSalvo = await novoAparelho.save();

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Aparelho cadastrado com sucesso!',
      dados: aparelhoSalvo,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const primeiroErro = Object.values(error.errors)[0]?.message || 'Dados inválidos.';
      return res.status(400).json({
        sucesso: false,
        mensagem: primeiroErro,
      });
    }
    return next(error);
  }
};

/**
 * Atualizar aparelho existente
 * PUT /api/aparelhos/:id
 */
exports.atualizar = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do aparelho fornecido é inválido.',
      });
    }

    const updates = {};
    const { marca, modelo, preco, foto } = req.body;

    if (marca !== undefined) {
      if (typeof marca !== 'string' || !/^apple$/i.test(marca.trim())) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Apenas aparelhos da marca "Apple" são permitidos neste sistema.',
        });
      }
      updates.marca = 'Apple';
    }

    if (modelo !== undefined) {
      if (typeof modelo !== 'string' || modelo.trim().length < 2) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "O campo 'modelo' deve conter ao menos 2 caracteres.",
        });
      }
      updates.modelo = modelo.trim();
    }

    if (preco !== undefined) {
      const precoNumerico = typeof preco === 'string'
        ? parseFloat(preco.replace(/\./g, '').replace(',', '.'))
        : Number(preco);

      if (isNaN(precoNumerico) || precoNumerico <= 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "O campo 'preco' deve ser um valor numérico positivo maior que zero.",
        });
      }
      updates.preco = precoNumerico;
    }

    if (foto !== undefined) {
      if (typeof foto !== 'string' || !/^(https?:\/\/|data:image\/)/i.test(foto.trim())) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "O campo 'foto' deve conter uma URL válida iniciada com http:// ou https://.",
        });
      }
      updates.foto = foto.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nenhum campo válido para atualização foi fornecido.',
      });
    }

    const aparelhoAtualizado = await Aparelho.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!aparelhoAtualizado) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Aparelho não encontrado.',
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Aparelho atualizado com sucesso!',
      dados: aparelhoAtualizado,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const primeiroErro = Object.values(error.errors)[0]?.message || 'Dados inválidos.';
      return res.status(400).json({
        sucesso: false,
        mensagem: primeiroErro,
      });
    }
    return next(error);
  }
};

/**
 * Remover aparelho
 * DELETE /api/aparelhos/:id
 */
exports.excluir = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'ID do aparelho fornecido é inválido.',
      });
    }

    const aparelhoRemovido = await Aparelho.findByIdAndDelete(id);

    if (!aparelhoRemovido) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Aparelho não encontrado.',
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Aparelho removido com sucesso!',
    });
  } catch (error) {
    return next(error);
  }
};
