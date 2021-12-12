const mongoose = require('mongoose')

var personsSchema = new mongoose.Schema(
  {
    pageId: Number,

    surname: String,
    name: String,
    middlename: String,
    monkname: String,
    sitename: String,

    birth: {
      year: Number,
      month: Number,
      day: Number,
      dateStr: String,
      isOnlyYear: Boolean,
      isOnlyCentury: Boolean,
      century: Number,
      place: String,
      placeCoord: [],
      isIndirectDate: Boolean,
      isIndirectPlace: Boolean
    },

    death: {
      year: Number,
      month: Number,
      day: Number,
      dateStr: String,
      century: Number,
      place: String,
      placeCoord: [],
      isOnlyYear: Boolean,
      isOnlyCentury: Boolean,
      isIndirectDate: Boolean,
      isIndirectPlace: Boolean
    },

    achievements: [{
      place: String,
      placeCoord: [],
      dateStr: String,
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
    }],

    status: {
      type: String,
      required: 'Статус святости обязателен для заполнения',
    },

    groupStatus: {
      type: String,
      required: 'Статус святости по группам обязателен для заполнения',
    },

    worshipDays: [{
      day: Number,
      month: Number,
      dateStr: String
    }],

    canonizationDate: {
      year: Number,
      month: Number,
      day: Number,
      dateStr: String,
      isOnlyYear: Boolean,
      isOnlyCentury: Boolean,
      century: Number,
    },

    profession: String,

    description: String,
    fullDescription: String,

    pageUrl: {
      type: String,
      unique: true,
      required: 'Не определена уникальная ссылка',
    },

    isShowOnMap: Boolean,

    srcUrl: String,
    photoUrl: String,
    linkUrl: String,
  },
  {
    timestamps: false,
  }
)

personsSchema.pre('save', function (next) {
  this.isShowOnMap = this.birth && this.birth.place && this.birth.placeCoord
    && this.death && this.death.place && this.death.placeCoord
  next();
});

personsSchema.statics.publicFields = ['surname', 'name', 'middlename']

// personsSchema.statics.getUrl

module.exports = mongoose.model('personsReligion', personsSchema)
