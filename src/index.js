const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.status(404).json({ error: 'Usuário não encontrado'})
  }

  request.user = user

  return next()
}

function verifyExistsUsername(request, response, next) {
  const { username } = request.body

  const user = users.find((user) => user.username === username)

  if (user) {
    return response.status(400).json({ error: 'Já existe um usuário cadastrado com esse "username"' + username })
  }

  return next()
}

app.post('/users', verifyExistsUsername, (request, response) => {
  const { name, username } = request.body

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).send(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { user } = request

  const todo = user.todos.find((todo) => {
    if (todo.id === id) {
      todo.title = title
      todo.deadline = deadline
      return todo
    }
  })

  if (!todo) {
    response.status(404).json({ error: 'Todo não encontrado para atualizar' })
  }

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const todo = user.todos.find((todo) => {
    if (todo.id === id) {
      todo.done = true
      return todo
    }
  })

  if (!todo) {
    return response.status(404).json({ error: 'Todo não encontrado para finalizar' })
  }

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;