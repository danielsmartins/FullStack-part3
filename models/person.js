/* eslint-disable no-unused-vars */
const mongoose = require('mongoose')
require('dotenv').config()

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        maxLength: 32,
        required:  [true, 'name is required'],
    },
    number: {
        type: String,
        required:  [true, 'number is required'],
        validate: {
            validator: function(v) {
                
                const cleaned = v.replace(/\D/g, '')
        
                
                return cleaned.length >= 8 && cleaned.length <= 13
            },
            message: props => `${props.value} isn't a valid brazilian number! It must have between 8 and 13 digits`
        }
    },
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)