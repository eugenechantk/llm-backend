# Auto-Backend - An ✨automagical✨ Backend-DB solution powered by LLM 
If LLM can generate code, why can't it generate an entire backend service for you? 

<a href="https://www.loom.com/share/06734d2c74234484b713002f215620db">
    <img style="max-width:600px;" src="https://cdn.loom.com/sessions/thumbnails/06734d2c74234484b713002f215620db-with-play.gif">
  </a>

Inspired by [Backend-GPT](https://github.com/RootbeerComputer/backend-GPT), Auto-Backend is an Express.js/MongoDB Backend-Database library that generates the entire backend service on runtime, powered by an LLM. It infers business logic based on the name of the API call and connects to a hosted MongoDB database.

## Why does it matter?
Quoting the team from Backend-GPT:

> - You can iterate on your frontend without knowing exactly what the backend needs to look like.
> - Backend gives you the wrong format? https://backend-gpt.com/chess/get_board_state() -> https://backend-gpt.com/chess/get_board_state_as_fen()
> - Mistype an API name? It doesn't matter!
> - Serverless w/o the cold start: The only difference between your server and someone elses is the 1KB of state and the LLM instructions, these can be swapped out in milliseconds

Auto-Backend takes Backend-GPT up a notch. Instead of storing the data in a local database, it connects to a hosted MongoDB database, making it scalable and deployable as a full-service backend server.

## How it works
Instead of writing each API route by hand, Auto-Backend only has one universal, catch-all API route, which takes in any API route and request body.

For each request, Auto-Backend will do the following:
1. It takes any API route and request body as the context to determine the user's intention with the API request
2. LLM determines what data manipulation and database operation is needed to achieve the user's intention
3. Execute the data and database manipulation, with connection to MongoDB

