const express = require('express')
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
    res.send(`<div><div>Phonebook has info for ${personCount}</div><div>${timestamp.toDateString()} ${timestamp.toTimeString()}</div></div>`)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server is listening port ${PORT}`)