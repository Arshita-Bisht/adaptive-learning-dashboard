import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
import json

random.seed(42)
np.random.seed(42)

SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Computer Science", "Economics"]
TOPICS = {
    "Mathematics": ["Algebra", "Calculus", "Geometry", "Statistics", "Trigonometry"],
    "Physics": ["Mechanics", "Thermodynamics", "Optics", "Electromagnetism", "Quantum"],
    "Chemistry": ["Organic", "Inorganic", "Physical Chemistry", "Biochemistry", "Analytical"],
    "Biology": ["Cell Biology", "Genetics", "Evolution", "Ecology", "Physiology"],
    "English": ["Grammar", "Literature", "Writing", "Reading Comprehension", "Vocabulary"],
    "History": ["Ancient", "Medieval", "Modern", "World Wars", "Contemporary"],
    "Computer Science": ["Programming", "Data Structures", "Algorithms", "Databases", "Networks"],
    "Economics": ["Microeconomics", "Macroeconomics", "Econometrics", "Finance", "International Trade"]
}

FIRST_NAMES = ["Aarav","Priya","Rohan","Ananya","Vikram","Sneha","Arjun","Kavya","Rahul","Nisha",
               "Karthik","Divya","Aditya","Pooja","Siddharth","Meera","Ishaan","Tanvi","Dhruv","Riya",
               "Akash","Shruti","Varun","Anjali","Nikhil","Simran","Manav","Kriti","Parth","Aditi"]
LAST_NAMES = ["Sharma","Patel","Singh","Gupta","Kumar","Joshi","Rao","Verma","Nair","Reddy",
              "Mishra","Agarwal","Mehta","Iyer","Chandra","Malhotra","Bose","Das","Kapoor","Shah"]

def generate_student_performance_history(base_score, weeks=12):
    trend = random.uniform(-0.5, 1.5)
    noise = random.uniform(3, 8)
    history = []
    for w in range(weeks):
        score = base_score + trend * w + np.random.normal(0, noise)
        score = max(0, min(100, score))
        history.append(round(score, 1))
    return history

def generate_students(n=50):
    students = []
    for i in range(1, n + 1):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        learning_speed = random.choice(["slow", "medium", "fast"])
        base_perf = {"slow": random.uniform(40, 65), "medium": random.uniform(55, 80), "fast": random.uniform(70, 95)}[learning_speed]
        attendance = round(random.uniform(0.55, 0.99), 2)
        study_time = round(random.uniform(1, 8), 1)
        
        subject_scores = {}
        for subj in SUBJECTS:
            quiz = round(base_perf + np.random.normal(0, 8), 1)
            assign = round(base_perf + np.random.normal(2, 6), 1)
            subject_scores[subj] = {
                "quiz_score": max(0, min(100, quiz)),
                "assignment_score": max(0, min(100, assign)),
                "topic_mastery": {
                    topic: round(max(0, min(1, (base_perf + np.random.normal(0, 15)) / 100)), 2)
                    for topic in TOPICS[subj]
                }
            }
        
        avg_score = np.mean([
            (subject_scores[s]["quiz_score"] + subject_scores[s]["assignment_score"]) / 2
            for s in SUBJECTS
        ])
        
        streak = random.randint(0, 30)
        badges = []
        if avg_score > 85: badges.append("High Achiever")
        if attendance > 0.9: badges.append("Perfect Attendance")
        if streak > 20: badges.append("Streak Master")
        if study_time > 6: badges.append("Dedicated Learner")
        if len(badges) >= 3: badges.append("All-Rounder")
        
        join_date = datetime.now() - timedelta(days=random.randint(60, 365))
        
        risk_score = round(
            (1 - attendance) * 0.3 +
            (1 - avg_score / 100) * 0.4 +
            (1 - min(study_time / 6, 1)) * 0.3,
            3
        )
        
        students.append({
            "id": f"STU{str(i).zfill(3)}",
            "name": f"{first} {last}",
            "email": f"{first.lower()}.{last.lower()}@school.edu",
            "grade": random.choice(["9", "10", "11", "12"]),
            "attendance": attendance,
            "study_time_hrs": study_time,
            "learning_speed": learning_speed,
            "subjects": subject_scores,
            "avg_score": round(avg_score, 1),
            "performance_history": generate_student_performance_history(avg_score),
            "streak": streak,
            "badges": badges,
            "points": int(avg_score * 10 + streak * 5 + attendance * 200),
            "risk_score": risk_score,
            "risk_level": "high" if risk_score > 0.5 else ("medium" if risk_score > 0.3 else "low"),
            "join_date": join_date.isoformat(),
            "last_active": (datetime.now() - timedelta(days=random.randint(0, 7))).isoformat(),
            "completion_rate": round(random.uniform(0.4, 1.0), 2),
            "predicted_grade": min(100, round(avg_score + np.random.normal(2, 5), 1)),
            "dropout_risk": round(risk_score * 0.8 + random.uniform(0, 0.1), 3),
        })
    return students

STUDENTS_DB = generate_students(50)

def get_all_students():
    return STUDENTS_DB

def get_student_by_id(student_id: str):
    return next((s for s in STUDENTS_DB if s["id"] == student_id), None)

def get_overview_stats():
    total = len(STUDENTS_DB)
    avg_perf = round(np.mean([s["avg_score"] for s in STUDENTS_DB]), 1)
    active = sum(1 for s in STUDENTS_DB if (datetime.now() - datetime.fromisoformat(s["last_active"])).days <= 2)
    avg_completion = round(np.mean([s["completion_rate"] for s in STUDENTS_DB]) * 100, 1)
    at_risk = sum(1 for s in STUDENTS_DB if s["risk_level"] == "high")
    
    weeks = [f"W{i}" for i in range(1, 13)]
    weekly_trends = []
    for w in range(12):
        avg = round(np.mean([s["performance_history"][w] for s in STUDENTS_DB]), 1)
        weekly_trends.append({"week": weeks[w], "avg_score": avg})
    
    return {
        "total_students": total,
        "avg_performance": avg_perf,
        "active_learners": active,
        "completion_rate": avg_completion,
        "at_risk_count": at_risk,
        "weekly_trends": weekly_trends
    }

def get_subject_analytics():
    result = {}
    for subj in SUBJECTS:
        quizzes = [s["subjects"][subj]["quiz_score"] for s in STUDENTS_DB]
        assigns = [s["subjects"][subj]["assignment_score"] for s in STUDENTS_DB]
        result[subj] = {
            "avg_quiz": round(np.mean(quizzes), 1),
            "avg_assignment": round(np.mean(assigns), 1),
            "min_score": round(min(quizzes + assigns), 1),
            "max_score": round(max(quizzes + assigns), 1),
            "passing_rate": round(sum(1 for q in quizzes if q >= 60) / len(quizzes) * 100, 1)
        }
    return result

def get_scatter_data():
    return [
        {
            "student_id": s["id"],
            "name": s["name"],
            "study_time": s["study_time_hrs"],
            "avg_score": s["avg_score"],
            "risk_level": s["risk_level"]
        }
        for s in STUDENTS_DB
    ]

def get_heatmap_data():
    rows = []
    for s in STUDENTS_DB[:20]:
        row = {"student": s["name"][:12]}
        for subj in SUBJECTS:
            avg = (s["subjects"][subj]["quiz_score"] + s["subjects"][subj]["assignment_score"]) / 2
            row[subj[:4]] = round(avg, 1)
        rows.append(row)
    return rows

def get_alerts():
    alerts_list = []
    for s in STUDENTS_DB:
        if s["risk_level"] == "high":
            alerts_list.append({
                "type": "danger",
                "title": "At-Risk Student",
                "message": f"{s['name']} has a high dropout risk ({round(s['dropout_risk']*100, 1)}%)",
                "student_id": s["id"],
                "timestamp": datetime.now().isoformat()
            })
        last_active = datetime.fromisoformat(s["last_active"])
        if (datetime.now() - last_active).days > 5:
            alerts_list.append({
                "type": "warning",
                "title": "Learning Stagnation",
                "message": f"{s['name']} has not been active for {(datetime.now() - last_active).days} days",
                "student_id": s["id"],
                "timestamp": datetime.now().isoformat()
            })
        hist = s["performance_history"]
        if len(hist) >= 3 and hist[-1] < hist[-3] - 10:
            alerts_list.append({
                "type": "warning",
                "title": "Performance Drop",
                "message": f"{s['name']}'s score dropped by {round(hist[-3] - hist[-1], 1)} points recently",
                "student_id": s["id"],
                "timestamp": datetime.now().isoformat()
            })
        if len(hist) >= 3 and hist[-1] > hist[-3] + 10:
            alerts_list.append({
                "type": "success",
                "title": "Improvement Detected",
                "message": f"{s['name']} improved by {round(hist[-1] - hist[-3], 1)} points!",
                "student_id": s["id"],
                "timestamp": datetime.now().isoformat()
            })
    return sorted(alerts_list, key=lambda x: x["type"])[:20]
