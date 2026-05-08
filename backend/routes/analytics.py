from fastapi import APIRouter
from models.database import (get_all_students, get_overview_stats, 
                              get_subject_analytics, get_scatter_data, get_heatmap_data)
from ml.models import get_ml_clusters, predict_risk

router = APIRouter()

@router.get("/overview")
def overview():
    return get_overview_stats()

@router.get("/subjects")
def subject_analytics():
    return get_subject_analytics()

@router.get("/scatter")
def scatter_data():
    return get_scatter_data()

@router.get("/heatmap")
def heatmap_data():
    return get_heatmap_data()

@router.get("/clusters")
def cluster_data():
    students = get_all_students()
    labels, stats, names = get_ml_clusters(students)
    cluster_list = []
    for i, s in enumerate(students):
        cluster_list.append({
            "student_id": s["id"],
            "name": s["name"],
            "cluster": labels[i],
            "cluster_name": names.get(labels[i], "Unknown"),
            "avg_score": s["avg_score"],
            "attendance": s["attendance"]
        })
    return {"clusters": cluster_list, "stats": stats}

@router.get("/risk")
def risk_analysis():
    students = get_all_students()
    risk_probs = predict_risk(students)
    return [
        {
            "student_id": s["id"],
            "name": s["name"],
            "risk_probability": risk_probs[i],
            "risk_level": s["risk_level"],
            "avg_score": s["avg_score"],
            "attendance": s["attendance"]
        }
        for i, s in enumerate(students)
    ]

@router.get("/performance-distribution")
def performance_distribution():
    students = get_all_students()
    buckets = {"0-40": 0, "40-60": 0, "60-75": 0, "75-90": 0, "90-100": 0}
    for s in students:
        sc = s["avg_score"]
        if sc < 40: buckets["0-40"] += 1
        elif sc < 60: buckets["40-60"] += 1
        elif sc < 75: buckets["60-75"] += 1
        elif sc < 90: buckets["75-90"] += 1
        else: buckets["90-100"] += 1
    return [{"range": k, "count": v} for k, v in buckets.items()]

@router.get("/attendance-impact")
def attendance_impact():
    students = get_all_students()
    return [
        {"attendance": round(s["attendance"] * 100, 1), "avg_score": s["avg_score"], "name": s["name"]}
        for s in students
    ]
