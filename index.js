const express = require('express')
const pluralize = require('pluralize')
const app = express()

app.use(express.json())

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }

]

app.get('/api/persons', (req, res) => {
    res.json(persons)
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
    console.log(generatedId)
    return generatedId
}

app.post('/api/persons', (req, res) => {
    const body = req.body
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }
    console.log(persons.find(person => person.name === body.name))
    if (persons.find(person => person.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons.concat(person)
    res.json(persons)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server is listening port ${PORT}`)