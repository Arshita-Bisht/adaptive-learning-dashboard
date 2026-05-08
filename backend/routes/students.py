from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from models.database import get_all_students, get_student_by_id
from ml.models import generate_recommendations, predict_future_grade, predict_topic_mastery

router = APIRouter()

@router.get("/")
def list_students(
    search: Optional[str] = None,
    grade: Optional[str] = None,
    risk_level: Optional[str] = None,
    performance_min: Optional[float] = None,
    performance_max: Optional[float] = None,
    subject: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    students = get_all_students()
    if search:
        students = [s for s in students if search.lower() in s["name"].lower() or search.lower() in s["id"].lower()]
    if grade:
        students = [s for s in students if s["grade"] == grade]
    if risk_level:
        students = [s for s in students if s["risk_level"] == risk_level]
    if performance_min is not None:
        students = [s for s in students if s["avg_score"] >= performance_min]
    if performance_max is not None:
        students = [s for s in students if s["avg_score"] <= performance_max]
    
    total = len(students)
    return {"total": total, "students": students[skip:skip+limit]}

@router.get("/leaderboard")
def get_leaderboard():
    students = get_all_students()
    ranked = sorted(students, key=lambda x: x["points"], reverse=True)[:10]
    return [{"rank": i+1, "id": s["id"], "name": s["name"], "points": s["points"], 
             "badges": s["badges"], "streak": s["streak"], "avg_score": s["avg_score"]} 
            for i, s in enumerate(ranked)]

@router.get("/{student_id}")
def get_student(student_id: str):
    student = get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.get("/{student_id}/recommendations")
def get_student_recommendations(student_id: str):
    student = get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return generate_recommendations(student)

@router.get("/{student_id}/predictions")
def get_student_predictions(student_id: str):
    student = get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {
        "future_grades": predict_future_grade(student),
        "topic_mastery_predictions": predict_topic_mastery(student),
        "dropout_risk": student["dropout_risk"],
        "predicted_final_grade": student["predicted_grade"]
    }

@router.get("/{student_id}/profile")
def get_student_profile(student_id: str):
    student = get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    strengths = []
    weaknesses = []
    for subj, data in student["subjects"].items():
        avg = (data["quiz_score"] + data["assignment_score"]) / 2
        if avg >= 75:
            strengths.append({"subject": subj, "score": round(avg, 1)})
        elif avg < 60:
            weaknesses.append({"subject": subj, "score": round(avg, 1)})
    
    return {
        **student,
        "strengths": sorted(strengths, key=lambda x: x["score"], reverse=True)[:3],
        "weaknesses": sorted(weaknesses, key=lambda x: x["score"])[:3],
        "recommendations": generate_recommendations(student),
        "future_predictions": predict_future_grade(student)
    }
