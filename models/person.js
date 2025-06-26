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
        required:  [true, 'O nome é obrigatório.'],
    },
    number: {
        type: String,
        required:  [true, 'O número de telefone é obrigatório.'],
        validate: {
            validator: function(v) {
                
                const cleaned = v.replace(/\D/g, '')
        
                
                return cleaned.length >= 8 && cleaned.length <= 13
            },
            message: props => `${props.value} não é um número de telefone brasileiro válido! O número deve conter entre 8 e 13 dígitos.`
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