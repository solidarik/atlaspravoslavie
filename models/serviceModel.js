const mongoose = require('mongoose')

var serviceSchema = new mongoose.Schema(
    {
        name: String,
        value: String,
        kind: String,
    },
    {
        timestamps: true,
    }
)

serviceSchema.statics.publicFields = ['name', 'value']

module.exports = mongoose.model('service', serviceSchema)
