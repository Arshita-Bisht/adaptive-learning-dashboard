from fastapi import APIRouter
from models.database import get_all_students
from ml.models import predict_future_grade, predict_risk, predict_topic_mastery

router = APIRouter()

@router.get("/grades")
def predict_grades():
    students = get_all_students()
    return [
        {"student_id": s["id"], "name": s["name"], 
         "current_avg": s["avg_score"], "predicted_grade": s["predicted_grade"],
         "future": predict_future_grade(s)}
        for s in students[:20]
    ]

@router.get("/dropout-risk")
def dropout_risk():
    students = get_all_students()
    risks = predict_risk(students)
    return sorted([
        {"student_id": s["id"], "name": s["name"], "dropout_risk": risks[i],
         "risk_level": s["risk_level"], "avg_score": s["avg_score"]}
        for i, s in enumerate(students)
    ], key=lambda x: x["dropout_risk"], reverse=True)
