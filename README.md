# OpenAI ChatGPT App with MCP (Pizza Widget Example)

This project demonstrates how to build a custom plain UI (Widget) for ChatGPT using the **Model Context Protocol (MCP)** ,Python and HTML. It specifically showcases the `text/html+skybridge` integration, allowing ChatGPT to render a local `pizza.html` file as a dynamic interface based on tool outputs.

## 🚀 Overview

The app creates an MCP server that:
1.  **Defines a Tool**: `pizza-widget` which takes toppings and cheese types as input.
2.  **Exposes a Resource**: Serves a `pizza.html` file that ChatGPT renders in a frame.
3.  **Uses Metadata**: Leverages `openai/outputTemplate` to link the tool output directly to the HTML UI.

## 🛠️ Requirements

- Python 3.12+
- `fastmcp` library
- `uvicorn` (for running the server)

## 📦 Installation

1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 🏃 Running the App

1. Start the MCP server locally:
   ```bash
   python main.py
   ```
   The server will start on `http://0.0.0.0:8080`.

2. **Expose to ChatGPT**: 
   Since ChatGPT needs a public URL to access your local server during development, use a tool like **ngrok**:
   ```bash
   ngrok http 8080
   ```

3. **Configure OpenAI**:
   Add the public URL provided by ngrok to your GPT's Actions configuration or MCP client settings.

## 🧩 Key Components

- **`main.py`**: The FastAPI-based MCP server using the `fastmcp` SDK. It handles tool calls and resource requests.
- **`pizza.html`**: A lightweight frontend that uses `window.openai.toolOutput` to reactively update the UI when ChatGPT executes the tool.
- **`requirements.txt`**: Contains the necessary `fastmcp` package.

## 📚 References

- [Model Context Protocol (MCP) Documentation](https://modelcontextprotocol.io/)
- [Apps in ChatGPT](https://openai.com/index/introducing-apps-in-chatgpt/)