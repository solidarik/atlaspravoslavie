import mongoose from 'mongoose'

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

export default mongoose.model('service', serviceSchema)
