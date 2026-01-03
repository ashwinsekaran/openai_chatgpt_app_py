from mcp.server.fastmcp import FastMCP
from pathlib import Path
import mcp.types as types

HTML_PATH = Path(__file__).parent / "pizza.html"
HTML_TEXT = HTML_PATH.read_text(encoding="utf-8")

mcp = FastMCP(name="pizza-server", stateless_http=True)

@mcp._mcp_server.list_tools()
async def list_tools():
    return [
        types.Tool(
            name="pizza-widget",
            title="Pizza Widget",
            description="A simple pizza widget",
            inputSchema={
                "type": "object",
                "properties": {
                    "pizzaTopping": {"type": "string"},
                    "cheeseType": {"type": "string"},
                },
                "required": ["pizzaTopping", "cheeseType"],
            },
            _meta={
                "openai/outputTemplate": "ui://widget/pizza.html",
                "openai/widgetAccessible": True,
                "openai/resultCanProduceWidget": True
            },
        )
    ]

@mcp._mcp_server.list_resources()
async def list_resources():
    return [
        types.Resource(
            name="pizza-widget",
            title="Pizza Widget",
            uri="ui://widget/pizza.html",
            description="A simple pizza widget",
            mimeType="text/html+skybridge"
        )
    ]

async def handle_resource(req: types.ReadResourceRequest):
    return types.ServerResult(
        types.ReadResourceResult(
            contents=[
                types.TextResourceContents(
                    uri="ui://widget/pizza.html",
                    mimeType="text/html+skybridge",
                    text=HTML_TEXT,
                )
            ]
        )
    )

mcp._mcp_server.request_handlers[types.ReadResourceRequest] = handle_resource

async def call_tool(req: types.CallToolRequest):
   args = req.params.arguments or {}
   topping = args.get("pizzaTopping", "")
   cheese = args.get("cheeseType", "")

   return types.ServerResult(
       types.CallToolResult(
           content=[types.TextContent(type="text", text=f"Pizza topping and cheese done")],
           structuredContent={
               "pizzaTopping": topping,
               "cheeseType": cheese,
           },
       )
   )

mcp._mcp_server.request_handlers[types.CallToolRequest] = call_tool

app = mcp.streamable_http_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)