const mongoose = require('mongoose');

const aparelhoSchema = new mongoose.Schema(
  {
    marca: {
      type: String,
      required: [true, 'O campo marca é obrigatório.'],
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return false;
          return /^apple$/i.test(v.trim());
        },
        message: 'A marca deve ser obrigatoriamente "Apple".',
      },
      default: 'Apple',
    },
    modelo: {
      type: String,
      required: [true, 'O campo modelo é obrigatório.'],
      trim: true,
      minlength: [2, 'O modelo deve conter no mínimo 2 caracteres.'],
      maxlength: [100, 'O modelo não pode exceder 100 caracteres.'],
    },
    preco: {
      type: Number,
      required: [true, 'O campo preço é obrigatório.'],
      min: [0.01, 'O preço deve ser um valor numérico positivo maior que zero.'],
      set: function (val) {
        if (typeof val === 'string') {
          // Trata valores recebidos no formato brasileiro com vírgula (ex: "4999,90")
          const parsed = parseFloat(val.replace(/\./g, '').replace(',', '.'));
          return isNaN(parsed) ? val : parsed;
        }
        return val;
      },
    },
    foto: {
      type: String,
      required: [true, 'O campo foto é obrigatório.'],
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return false;
          // Validação flexível para URLs HTTP/HTTPS ou data URI
          return /^(https?:\/\/|data:image\/)/i.test(v.trim());
        },
        message: 'O campo foto deve conter uma URL válida iniciada com http:// ou https://.',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Normaliza a marca para "Apple" com capitalização correta antes de salvar
aparelhoSchema.pre('save', function (next) {
  if (this.marca) {
    this.marca = 'Apple';
  }
  next();
});

module.exports = mongoose.model('Aparelho', aparelhoSchema);
