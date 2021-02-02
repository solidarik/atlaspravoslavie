const mongoose = require('mongoose')

var templesSchema = new mongoose.Schema(
  {
    pageId: Number,

    startYear: {type: Number, index: true},
    startMonth: Number,
    startDay: Number,
    startDateStr: String,
    startIsOnlyYear: Boolean,
    startIsOnlyCentury: Boolean,
    startCentury: Number,

    endYear: Number,
    endMonth: Number,
    endDay: Number,
    endDateStr: String,
    endIsOnlyYear: Boolean,
    endIsOnlyCentury: Boolean,
    endCentury: Number,

    name: String,
    place: String,
    point: [],
    pageUrl: {
      type: String,
      unique: true,
      required: 'Не определена уникальная ссылка',
    },
    imgUrl: String,
    imgUrl_1: String,
    imgUrl_2: String,
    imgUrl_3: String,
    imgUrl_4: String,
    imgUrl_5: String,
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
