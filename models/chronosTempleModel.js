import mongoose from 'mongoose'

var chronosTempleSchema = new mongoose.Schema(
  {
    pageId: Number,
    loadStatus: String,
    isOnMap: Boolean,
    lineSource: Number,

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

chronosTempleSchema.statics.publicFields = ['place', 'start.dateStr', 'end.dateStr']

export default mongoose.model('chronosTemple', chronosTempleSchema)
