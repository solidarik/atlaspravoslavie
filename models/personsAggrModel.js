import mongoose from 'mongoose'

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
    livePoints: {
      type: [],
      required: 'Линия жизни обязательна для заполнения'
    },
    startYear: Number,
    endYear: Number,
    startCentury: {
      type: Number,
      required: 'Начальный век обязателен'
    },
    endCentury: Number,
    info: {},
    shortDescription: String
  },
  {
    timestamps: false,
  }
)

personsAggrSchema.statics.publicFields = ['caption', 'kindEvent', 'point']

export default mongoose.model('personsAggrReligion', personsAggrSchema)
