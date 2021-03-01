const mongoose = require('mongoose')

var personsAggrSchema = new mongoose.Schema(
  {
    caption: {
        type: String,
        required: 'Заголовок обязателей для заполнения',
    },
    kind: {
      type: String,
      required: 'Тип события обязателен для заполнения',
    },
    groupStatus: {
        type: String,
        required: 'Статус святости обязателен для заполнения',
    },
    kindAndStatus: {
        type: String,
        required: 'Тип и статус обязательны для заполнения'
    },
    point: {
        type: [],
        required: 'Координаты обязательны'
    },
    startYear: Number,
    endYear: Number,
    startCentury: {
        type: Number,
        required: 'Начальный век обязателен'
    },
    endCentury: Number,
    info: {}
  },
  {
    timestamps: false,
  }
)

personsAggrSchema.statics.publicFields = ['caption', 'kindEvent', 'point']

module.exports = mongoose.model('personsAggrReligion', personsAggrSchema)
