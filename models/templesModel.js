import mongoose from 'mongoose'

var templesSchema = new mongoose.Schema(
  {
    pageId: Number,
    loadStatus: String,
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
    dedicated: String,
    abbots: String,
  },
  {
    timestamps: false,
  }
)

templesSchema.statics.publicFields = ['name', 'place']

export default mongoose.model('temples', templesSchema)
