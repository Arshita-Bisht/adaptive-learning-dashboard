from fastapi import APIRouter
from models.database import get_all_students, SUBJECTS
import numpy as np

router = APIRouter()

@router.get("/dashboard")
def admin_dashboard():
    students = get_all_students()
    struggling = [s for s in students if s["avg_score"] < 60]
    top_performers = sorted(students, key=lambda x: x["avg_score"], reverse=True)[:5]
    return {
        "total_students": len(students),
        "struggling_count": len(struggling),
        "avg_performance": round(np.mean([s["avg_score"] for s in students]), 1),
        "subjects": SUBJECTS,
        "struggling_students": [{"id": s["id"], "name": s["name"], "score": s["avg_score"]} for s in struggling[:10]],
        "top_performers": [{"id": s["id"], "name": s["name"], "score": s["avg_score"]} for s in top_performers],
    }

@router.get("/export/summary")
def export_summary():
    students = get_all_students()
    return [
        {
            "id": s["id"], "name": s["name"], "grade": s["grade"],
            "avg_score": s["avg_score"], "attendance": s["attendance"],
            "risk_level": s["risk_level"], "completion_rate": s["completion_rate"]
        }
        for s in students
    ]
