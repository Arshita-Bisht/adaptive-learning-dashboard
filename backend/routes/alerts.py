from fastapi import APIRouter
from models.database import get_alerts

router = APIRouter()

@router.get("/")
def alerts():
    return get_alerts()
