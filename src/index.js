const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: 'User not found' })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameAlreadyExists = users.find(user => user.username === username)

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'User already exists!' })
  }

  const user = {
    id: uuidv4(),
    name, 
    username, 
    todos: []
  }

  users.push(user);

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user

  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { todos } = request.user

  const todo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date(),
  }

  todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { todos } = request.user

  const todoIndex = todos.findIndex(todo => todo.id === id)

  if (todoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  const todo = {
    ...todos[todoIndex],
    title,
    deadline: new Date(deadline),
  }

  todos[todoIndex] = todo

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { todos } = request.user

  const todoIndex = todos.findIndex(todo => todo.id === id)

  if (todoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  const todo = todos[todoIndex]
  todo.done = true

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { todos } = request.user

  const todoIndex = todos.findIndex(todo => todo.id === id)

  if (todoIndex < 0) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  todos.splice(todoIndex, 1)

  return response.status(204).send()
});

module.exports = app;