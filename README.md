# Layout Agent

A chat-based AI layout agent that lets you manipulate design JSON 
through natural language. Built as part of the Compra AI Engineer 
Intern assignment.

## What it does

You chat with an AI agent and describe layout changes in plain English:

- "Convert this design to 9:16"
- "Move the headline to the top"
- "Make the headline smaller"
- "Move the offer badge higher"
- "Keep the product large"

The agent understands the design's semantic structure (headline, 
product, offer badge, CTA, etc.) and updates the layout JSON 
accordingly. Changes are reflected instantly in the wireframe 
preview and JSON panel.

## Features

- Chat interface with suggestion buttons
- Live wireframe preview (color-coded by semantic role)
- Real-time JSON panel with copy button
- Follow-up instruction support (conversation history maintained)
- Supports 1:1 and 9:16 aspect ratio conversion

## Tech Stack

- React + Vite
- Anthropic Claude Sonnet API
- Vanilla CSS (no UI libraries)

## Setup

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file:

4. Run `npm run dev`
5. Open `http://localhost:5173`

Get your API key at https://console.anthropic.com

## Approach

The agent works by embedding the full design JSON and a semantic 
role map into the system prompt. When the user sends an instruction, 
Claude identifies which nodes to change by semantic role (not by ID), 
applies coordinate transformations, recalculates normalized values 
(nx, ny, nw, nh), and returns the complete updated JSON. The app 
parses the response and hot-swaps the React state, updating both 
the wireframe and JSON panel instantly.
