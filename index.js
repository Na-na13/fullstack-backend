require('dotenv').config()
const express = require('express')
const pluralize = require('pluralize')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

morgan.token('body', function(req, res) { return JSON.stringify(req.body) })

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', (req, res) => {
    const personCount = persons.length
    const timestamp = new Date()
    res.send(`
        <div>
            <div>Phonebook has info for ${personCount} ${pluralize('person', personCount)}</div>
            <div>${timestamp.toDateString()} ${timestamp.toTimeString()}</div>
        </div>
    `)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})

const generateId = () => {
    const idCount = persons.length
    let generatedId = 1
    while (persons.find(person => person.id === generatedId)) {
        generatedId = Math.floor(Math.random() * idCount * 10)
    }
    return generatedId
}

app.post('/api/persons', (req, res) => {
    const body = req.body
    if (body.name === undefined || body.number === undefined) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    /*if (persons.find(person => person.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }*/

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
    
})

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server is listening port ${PORT}`)