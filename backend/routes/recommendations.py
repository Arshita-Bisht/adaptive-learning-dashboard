from fastapi import APIRouter
from models.database import get_all_students, get_alerts as db_alerts
from ml.models import generate_recommendations, predict_future_grade, predict_risk

router = APIRouter()

@router.get("/all")
def all_recommendations():
    students = get_all_students()
    result = []
    for s in students[:10]:
        recs = generate_recommendations(s)
        result.append({"student_id": s["id"], "name": s["name"], "recommendations": recs})
    return result

@router.get("/at-risk")
def at_risk_recommendations():
    students = get_all_students()
    at_risk = [s for s in students if s["risk_level"] == "high"]
    result = []
    for s in at_risk:
        recs = generate_recommendations(s)
        result.append({"student_id": s["id"], "name": s["name"], "risk_score": s["risk_score"], "recommendations": recs})
    return result
