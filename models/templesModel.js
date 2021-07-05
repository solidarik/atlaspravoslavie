const mongoose = require('mongoose')

var templesSchema = new mongoose.Schema(
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

    name: String,
    place: String,
    city: String,
    point: [],
    pageUrl: {
      type: String,
      unique: true,
      required: 'Не определена уникальная ссылка',
    },
    imgUrls: [String],
    srcUrl: String,
    templesUrl: String,
    eparchyUrl: String,
    longBrief: String,
    abbots: String,
  },
  {
    timestamps: false,
  }
)

templesSchema.statics.publicFields = ['name', 'place']

module.exports = mongoose.model('temples', templesSchema)
