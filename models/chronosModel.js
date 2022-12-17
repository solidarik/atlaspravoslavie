import mongoose from 'mongoose'

var chronosSchema = new mongoose.Schema(
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

chronosSchema.statics.publicFields = ['place', 'start.dateStr', 'end.dateStr']

export default mongoose.model('chronosReligion', chronosSchema)
