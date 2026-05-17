from fastmcp import FastMCP
mcp = FastMCP("test")

def my_tool(x: int) -> int:
    return x

try:
    mcp.tool()(my_tool)
    print("Success")
except Exception as e:
    print(f"Failed: {e}")
