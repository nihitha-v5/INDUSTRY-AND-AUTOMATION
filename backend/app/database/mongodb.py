import logging
from typing import Optional, Dict, Any
from pymongo import MongoClient
from pymongo.database import Database
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# Global client instances
_sync_client: Optional[MongoClient] = None
_async_client: Optional[AsyncIOMotorClient] = None

def get_sync_mongo_client() -> Optional[MongoClient]:
    global _sync_client
    if not settings.MONGODB_URL:
        return None
    if _sync_client is None:
        try:
            _sync_client = MongoClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
        except Exception as e:
            logger.error(f"Failed to create Sync MongoDB Client: {e}")
            return None
    return _sync_client

def get_async_mongo_client() -> Optional[AsyncIOMotorClient]:
    global _async_client
    if not settings.MONGODB_URL:
        return None
    if _async_client is None:
        try:
            _async_client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000
            )
        except Exception as e:
            logger.error(f"Failed to create Async MongoDB Motor Client: {e}")
            return None
    return _async_client

def get_sync_mongo_db(db_name: Optional[str] = None) -> Optional[Database]:
    client = get_sync_mongo_client()
    if client is None:
        return None
    name = db_name or settings.MONGODB_DB_NAME
    return client[name]

def get_async_mongo_db(db_name: Optional[str] = None) -> Optional[AsyncIOMotorDatabase]:
    client = get_async_mongo_client()
    if client is None:
        return None
    name = db_name or settings.MONGODB_DB_NAME
    return client[name]

def test_mongo_connection() -> Dict[str, Any]:
    """Test ping to the MongoDB server and return connection status and available collections."""
    if not settings.MONGODB_URL:
        return {
            "status": "not_configured",
            "message": "MONGODB_URL is not set in environment."
        }
    
    try:
        client = get_sync_mongo_client()
        if client is None:
            return {"status": "error", "message": "Could not initialize MongoClient"}
        
        # Ping the server to check connectivity
        client.admin.command('ping')
        db = client[settings.MONGODB_DB_NAME]
        collections = db.list_collection_names()
        
        return {
            "status": "connected",
            "database": settings.MONGODB_DB_NAME,
            "collections": collections,
            "message": "Successfully connected to MongoDB Atlas!"
        }
    except Exception as e:
        logger.error(f"MongoDB connection test failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
