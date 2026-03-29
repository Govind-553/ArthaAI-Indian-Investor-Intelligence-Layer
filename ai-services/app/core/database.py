from __future__ import annotations
from pymongo import MongoClient
from app.core.config import get_settings

_settings = get_settings()
_client = MongoClient(_settings.mongodb_uri)
_database = _client[_settings.mongodb_database]

def get_database():
    return _database
