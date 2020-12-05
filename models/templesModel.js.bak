const mongoose = require('mongoose')

var templesSchema = new mongoose.Schema(
  {
    pageId: Number,

    startYear: Number,
    startMonth: Number,
    startDay: Number,
    startDateStr: String,
    startIsOnlyYear: Boolean,

    endYear: Number,
    endMonth: Number,
    endDay: Number,
    endDateStr: String,
    endIsOnlyYear: Boolean,

    name: String,
    place: String,
    point: [],
    pageUrl: {
      type: String,
      unique: true,
      required: 'Не определена уникальная ссылка',
    },
    srcUrl: String,
    eparchyUrl: String,
    shortBrief: String,
    longBrief: String,
    abbots: String,
  },
  {
    timestamps: false,
  }
)

templesSchema.statics.publicFields = ['name', 'place']

module.exports = mongoose.model('temples', templesSchema)
