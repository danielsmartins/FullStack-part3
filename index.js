const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')



let Alldata = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)


app.get('/api/persons', (request, response) => {
  response.json(Alldata)
})

app.get('/info', (request, response) => {
    const people = Alldata.length
    const time = new Date()
  response.send(`
   <p>Phonebook has info for ${people} people<p> 
   <p>${time}<p>`)
})

app.get('/api/:id', (request, response) => {
  const id = Number(request.params.id)
  const data = Alldata.find(note => note.id === id)

  if(data){
    response.json(data)
  }else {
    response.status(404).end()
  }

})

app.delete('/api/persons/:id', (request , response) => {
    const id = Number(request.params.id)
    Alldata = Alldata.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const newId = Math.floor(Math.random() * 100000) + 1
    const {name, number} = request.body

     if (!name || !number) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const personExist = Alldata.some(person => person.name === name)
  const numberExist = Alldata.some(person => person.number === number)
  if(personExist) {
    return response.status(400).json({error: 'name must be unique'})
  }

  if(numberExist) {
    return response.status(400).json({error: 'number must be unique'})
  }

    const person = {
        id: newId,
        name: name,
        number: number
    }
    Alldata = Alldata.concat(person)
    response.json(person)
})


const PORT = process.env.por || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})