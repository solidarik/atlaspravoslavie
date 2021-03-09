const mongoose = require('mongoose')

var chronosChurchSchema = new mongoose.Schema(
  {
    pageId: Number,

    start: {
      year: Number,
      month: Number,
      day: Number,
      dateStr: String,
      isOnlyYear: Boolean,
      isOnlyCentury: Boolean,
      century: Number
    },
    end: {
      year: Number,
      month: Number,
      day: Number,
      dateStr: String,
      isOnlyYear: Boolean,
      isOnlyCentury: Boolean,
      century: Number
    },

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

chronosChurchSchema.statics.publicFields = ['place', 'start.dateStr', 'end.dateStr']

module.exports = mongoose.model('chronosChurch', chronosChurchSchema)
