from fastapi import FastAPI, APIRouter, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import httpx


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    doc = status_obj.model_dump()
    doc['timestamp'] = status_obj.timestamp.isoformat()

    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)

    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])

    return status_checks

# Include the router in the main app
app.include_router(api_router)

# ─── Next.js API proxy ────────────────────────────────────────────────────────
# The platform ingress forwards ALL /api/* traffic to this FastAPI service
# (port 8001). The SHYNISH Next.js app serves its own API routes on port 3000,
# so anything not handled above is transparently proxied there.
NEXT_ORIGIN = "http://127.0.0.1:3000"
HOP_BY_HOP = {"host", "content-length", "accept-encoding", "connection", "transfer-encoding", "content-encoding", "keep-alive"}


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy_to_next(path: str, request: Request):
    target = f"{NEXT_ORIGIN}/api/{path}"
    if request.url.query:
        target += f"?{request.url.query}"

    body = await request.body()
    headers = {k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP}

    async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0), follow_redirects=False) as client:
        upstream = await client.request(request.method, target, content=body, headers=headers)

    content = await upstream.aread()
    response = Response(content=content, status_code=upstream.status_code)
    for key, value in upstream.headers.multi_items():
        if key.lower() in HOP_BY_HOP:
            continue
        response.headers.append(key, value)
    return response


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
