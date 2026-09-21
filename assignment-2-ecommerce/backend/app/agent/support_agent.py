import os
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from langchain_core.tools import tool
from app.models import Product, Order, OrderItem
from app.config import settings

def create_agent_tools(db: Session, current_user_email: Optional[str] = None):
    """
    Constructs LangChain tools bound to the active database session.
    """

    @tool
    def get_product_price(product_name: str) -> str:
        """Get the current price and stock for a specific product by its name or keywords."""
        name_clean = product_name.strip()
        pattern = f"%{name_clean}%"
        products = db.query(Product).filter(Product.title.ilike(pattern)).all()
        
        # If no direct match, match each significant word (>3 chars)
        if not products:
            words = [w for w in name_clean.split() if len(w) > 3]
            if words:
                filters = [Product.title.ilike(f"%{w}%") for w in words]
                from sqlalchemy import or_
                products = db.query(Product).filter(or_(*filters)).all()
        
        if not products:
            # Fallback search description
            products = db.query(Product).filter(Product.description.ilike(pattern)).all()
        
        if not products:
            return f"No product found matching '{product_name}'."
        
        results = []
        for p in products:
            price_dollars = p.price_cents / 100.0
            stock_str = f"{p.stock_quantity} units available" if p.stock_quantity > 0 else "Out of stock"
            results.append(f"• {p.title}: ${price_dollars:.2f} ({stock_str}) [Category: {p.category}]")
        return "\n".join(results)

    @tool
    def list_available_products(category: Optional[str] = None) -> str:
        """List products that are currently in stock, optionally filtered by category."""
        query = db.query(Product).filter(Product.is_active == True, Product.stock_quantity > 0)
        if category and category.strip() and category.lower() != "all":
            query = query.filter(Product.category.ilike(f"%{category.strip()}%"))
        
        products = query.limit(10).all()
        if not products:
            return f"No in-stock products found for category '{category}'."
        
        res = [f"Found {len(products)} available products:"]
        for p in products:
            res.append(f"• [ID #{p.id}] {p.title} - ${p.price_cents / 100.0:.2f} ({p.stock_quantity} left in stock)")
        return "\n".join(res)

    @tool
    def get_order_status(order_id: int) -> str:
        """Look up the status and items of an order by its numeric ID."""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return f"Order #{order_id} could not be found."
        
        # Guard user privacy: if user is logged in, confirm email match
        if current_user_email and order.customer_email.lower() != current_user_email.lower():
            return f"Order #{order_id} does not belong to the currently authenticated account ({current_user_email}). For privacy reasons, access is restricted."
        
        items_summary = ", ".join([f"{item.quantity}x {item.product_title}" for item in order.items])
        return (
            f"Order #{order.id} Details:\n"
            f"- Status: {order.status.upper()}\n"
            f"- Placed by: {order.customer_email}\n"
            f"- Total: ${order.total_amount_cents / 100.0:.2f}\n"
            f"- Items: {items_summary or 'No items'}\n"
            f"- Date: {order.created_at.strftime('%Y-%m-%d %H:%M UTC')}"
        )

    return [get_product_price, list_available_products, get_order_status]


def run_support_agent(
    message: str,
    db: Session,
    conversation_history: List[Dict[str, str]],
    current_user_email: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes the AI Support Agent using LangChain tools and database grounding.
    """
    tools = create_agent_tools(db, current_user_email)
    tools_map = {t.name: t for t in tools}
    tools_called = []

    # Check if OpenAI API key is present
    if settings.OPENAI_API_KEY:
        try:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY, temperature=0.2)
            llm_with_tools = llm.bind_tools(tools)
            
            messages = [
                ("system", (
                    "You are NovaStore's friendly, accurate AI customer support assistant. "
                    "Always retrieve actual product pricing, catalog availability, and order status "
                    "by calling the provided tools. Never guess or hallucinate product prices, stock, or order details. "
                    "Format answers clearly with bullet points and friendly tone."
                ))
            ]
            for msg in conversation_history[-6:]:
                messages.append((msg.get("role", "user"), msg.get("content", "")))
            messages.append(("user", message))
            
            ai_msg = llm_with_tools.invoke(messages)
            
            if hasattr(ai_msg, "tool_calls") and ai_msg.tool_calls:
                for tool_call in ai_msg.tool_calls:
                    t_name = tool_call["name"]
                    t_args = tool_call["args"]
                    tools_called.append(t_name)
                    if t_name in tools_map:
                        t_output = tools_map[t_name].invoke(t_args)
                        messages.append(ai_msg)
                        messages.append(("tool", str(t_output), tool_call["id"]))
                
                final_res = llm.invoke(messages)
                return {
                    "response": final_res.content,
                    "tools_called": tools_called
                }
            return {
                "response": ai_msg.content,
                "tools_called": []
            }
        except Exception as e:
            # Fall through to deterministic tool dispatcher
            pass

    # Deterministic Tool Calling Dispatcher (Runs completely offline & reliably without requiring external paid API keys)
    msg_lower = message.lower().strip()
    response_text = ""

    # Check for order status inquiry
    import re
    order_num_match = re.search(r'order\s*(?:#|number|id)?\s*(\d+)', msg_lower)
    if not order_num_match:
        order_num_match = re.search(r'status\s*(?:of)?\s*#?(\d+)', msg_lower)
    if not order_num_match and ("track" in msg_lower or "status" in msg_lower or "where is" in msg_lower):
        order_num_match = re.search(r'#?(\d+)', msg_lower)

    if ("order" in msg_lower or "track" in msg_lower) and order_num_match:
        order_id = int(order_num_match.group(1))
        tools_called.append("get_order_status")
        status_info = tools_map["get_order_status"].invoke({"order_id": order_id})
        response_text = f"Here is the verified information for your inquiry:\n\n{status_info}"

    # Check for price inquiry
    elif any(k in msg_lower for k in ["price", "cost", "how much", "rate"]):
        # Extract product query
        cleaned_query = re.sub(r'^(what is the price of|price of|how much is|cost of|what does|cost)\s*', '', msg_lower)
        cleaned_query = cleaned_query.replace("?", "").strip()
        tools_called.append("get_product_price")
        price_info = tools_map["get_product_price"].invoke({"product_name": cleaned_query or msg_lower})
        response_text = f"Here is the current live price and stock information from our catalog:\n\n{price_info}\n\nLet me know if you would like to add this to your cart or need more details!"

    # Check for available products or catalog inquiry
    elif any(k in msg_lower for k in ["available", "catalog", "products", "what do you sell", "in stock", "items"]):
        category = None
        for cat in ["audio", "wearables", "accessories", "electronics", "computers"]:
            if cat in msg_lower:
                category = cat
                break
        tools_called.append("list_available_products")
        catalog_info = tools_map["list_available_products"].invoke({"category": category})
        response_text = f"Here is our current inventory of available items:\n\n{catalog_info}\n\nCan I help you check the price of any of these items or help you with your order?"

    else:
        response_text = (
            "Hello! I am your NovaStore AI Support Agent. I can help you with:\n"
            "• **Product Prices & Specs**: Ask *'What is the price of Sony WH-1000XM5?'*\n"
            "• **Stock Availability**: Ask *'What products are available?'* or *'What audio products do you have?'*\n"
            "• **Order Tracking**: Ask *'What is the status of order #1?'*\n\n"
            "How can I assist you today?"
        )

    return {
        "response": response_text,
        "tools_called": tools_called
    }
