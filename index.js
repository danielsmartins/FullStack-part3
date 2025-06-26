const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
require('dotenv').config()


const url = process.env.MONGODB_URI

if (!url) {
  console.error('Fatal Error: variable url not defined.');
  process.exit(1); 
}

console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

//middlewares
app.use(express.static('build'))
app.use(cors())
app.use(express.json())



morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)


// Rotas

//GET: retorna todas as pessoas
app.get('/api/persons', (request, response, next) => {
  Person.find({})
  .then(persons => response.json(persons))
  .catch(error => next(error))
})

//GET: retorna quantas pessoas tem no banco de dados
app.get('/info', (request, response) => {
     Person.countDocuments({})
    .then(count => {
      const time = new Date()
      response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${time}</p>
      `)
    })
    .catch(error => next(error))
  })

//GET: retorna uma pessoa em específico 
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error)) 
})

//DELETE: deleta uma pessoa
app.delete('/api/persons/:id', (request , response, next) => {
     Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//POST: cria uma pessoa
app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({ error: 'content missing' })
  }

  const person = new Person({ name, number })
  person.save()
    .then(savedPerson => response.json(savedPerson))
    .catch(error => next(error)) 
    //  erro de validação
})

//PUT: Modifica o numero de uma pessoa existente
app.put('/api/persons/:id', (request, response, next) => {
  const { number } = request.body
  
  if (!number) {
    return response.status(400).json({ error: 'number is missing' }) 
  }

  const personUpdate = {
    number: number,
  }

  // A opção { new: true } faz com que o método retorne o documento MODIFICADO, e não o original.
  // runValidators garante que as validações do schema sejam aplicadas na atualização.
  Person.findByIdAndUpdate(request.params.id, personUpdate, { new: true, runValidators: true})
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        // Se não encontrou a pessoa para atualizar
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})


//responde com um error caso não tenha endpoints com a rota 
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

//tratamento de erros
const errorHandler = (error, request, response, next) => {
  console.error(error.name, error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'id malformatado' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  response.status(500).json({ error: 'erro interno no servidor' })
}

//middleware do tratamento de erros 
app.use(errorHandler)

const PORT =  process.env.PORT || 3001 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})