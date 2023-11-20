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
    Person.count().then(count => {
        const timestamp = new Date()
        res.send(`
            <div>
                <div>Phonebook has info for ${count} ${pluralize('person', count)}</div>
                <div>${timestamp.toDateString()} ${timestamp.toTimeString()}</div>
            </div>
        `)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body
    if (!body.name || !body.number) {
        let error = Error('ContentError')
        next(error)
    } else {
        const person = new Person({
        name: body.name,
        number: body.number,
        })

        person.save().then(savedPerson => {
            res.json(savedPerson)
        })
    }
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(req.params.id, person, { new:true })
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})


const errorHandler = (error, req, res, next) => {

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }

    if (error.message === 'ContentError') {
        return res.status(400).send({ error: 'name or number missing' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server is listening port ${PORT}`)