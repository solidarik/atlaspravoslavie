const mongoose = require('mongoose')

var personsSchema = new mongoose.Schema(
  {
    pageId: Number,
    surname: String,
    name: String,
    middlename: String,
    monkname: String,

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
    },

    death: {
      year: Number,
      month: Number,
      day: Number,
      dateStr: String,
      isOnlyYear: Boolean,
      isOnlyCentury: Boolean,
      century: Number,
      place: String,
      placeCoord: [],
    },

    achievements: [{
      place: String,
      placeCoord: [],
      date: {
        year: Number,
        month: Number,
        day: Number,
        dateStr: String,
        isOnlyYear: Boolean,
        isOnlyCentury: Boolean,
        century: Number,
        place: String,
        placeCoord: [],
      }
    }],

    holyStatus: {
      type: String,
      required: 'Статус святости обязателен для заполнения',
    },

    worshipDates: [{
      month: Number,
      day: Number,
      dateStr: String,
      isOnlyYear: Boolean
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

    /*
    pageUrl: {
      type: String,
      unique: true,
      required: 'Не определена уникальная ссылка',
    },*/

    srcUrl: String,
    photoUrl: String,
    linkUrl: String,
  },
  {
    timestamps: false,
  }
)

personsSchema.statics.publicFields = ['surname', 'name', 'middlename']

module.exports = mongoose.model('personsReligion', personsSchema)
