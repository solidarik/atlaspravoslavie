const mongoose = require('mongoose')

var chronosChurchSchema = new mongoose.Schema(
  {
    pageId: Number,

    startYear: {
      type: Number,
      required: 'Не задан начальный год события'
    },
    startMonth: Number,
    startDay: Number,
    startDateStr: String,
    startIsOnlyYear: Boolean,

    endYear: Number,
    endMonth: Number,
    endDay: Number,
    endDateStr: String,
    endIsOnlyYear: Boolean,

    place: String,
    point: [],
    pageUrl: {
      type: String,
      unique: true,
      required: 'Не определена уникальная ссылка',
    },
    srcUrl: String,
    shortBrief: {
      type: String,
      required: 'Нет краткого описания события',
    },
    longBrief: String,
    remark: String,
    priority: Number,
    comment: String,
  },
  {
    timestamps: false,
  }
)

chronosChurchSchema.statics.publicFields = ['place', 'startDateStr', 'endDateStr']

module.exports = mongoose.model('chronosChurch', chronosChurchSchema)
