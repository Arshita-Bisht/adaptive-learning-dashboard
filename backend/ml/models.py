import numpy as np
from sklearn.cluster import KMeans
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings("ignore")

STUDY_MATERIALS = {
    "Mathematics": {
        "Algebra": ["Khan Academy Algebra", "MIT OCW 18.01", "Algebra Practice Set A"],
        "Calculus": ["Paul's Online Notes", "3Blue1Brown Calculus", "Calculus Problem Bank"],
        "Geometry": ["Euclid's Elements Guide", "GeoGebra Interactive", "Geometry Workbook"],
        "Statistics": ["StatQuest Videos", "R for Statistics", "Stats Problem Sets"],
        "Trigonometry": ["Trig Visualized", "Unit Circle Mastery", "Trig Applications"],
    },
    "Physics": {
        "Mechanics": ["Feynman Lectures Vol 1", "Physics Classroom", "Mechanics Simulations"],
        "Thermodynamics": ["MIT Thermo Notes", "Heat & Work Videos", "Thermo Problems"],
        "Optics": ["Optics Animations", "Light & Color Guide", "Optics Lab Manual"],
        "Electromagnetism": ["Griffiths EM", "Khan EM Series", "EM Problem Sets"],
        "Quantum": ["Quantum Basics", "Heisenberg Videos", "Quantum Exercises"],
    },
    "Chemistry": {
        "Organic": ["Organic Chemistry 101", "Reaction Mechanisms", "Orgo Practice"],
        "Inorganic": ["Inorganic Chem Guide", "Periodic Table Deep Dive", "Inorganic Problems"],
        "Physical Chemistry": ["Atkins Physical Chem", "Thermochem Videos", "PChem Sets"],
        "Biochemistry": ["Lehninger Biochem", "Enzyme Kinetics", "Biochem Problems"],
        "Analytical": ["Analytical Methods", "Spectroscopy Guide", "Lab Techniques"],
    },
}

def get_ml_clusters(students):
    features = np.array([
        [s["avg_score"], s["attendance"] * 100, s["study_time_hrs"], s["completion_rate"] * 100]
        for s in students
    ])
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    labels = kmeans.fit_predict(features_scaled)
    cluster_names = {0: "Struggling", 1: "Average", 2: "Advanced", 3: "Exceptional"}
    cluster_stats = {}
    for c in range(4):
        idxs = [i for i, l in enumerate(labels) if l == c]
        if idxs:
            cluster_stats[c] = {
                "name": cluster_names[c],
                "count": len(idxs),
                "avg_score": round(np.mean([students[i]["avg_score"] for i in idxs]), 1),
                "avg_attendance": round(np.mean([students[i]["attendance"] for i in idxs]) * 100, 1),
            }
    return [int(l) for l in labels], cluster_stats, cluster_names

def predict_risk(students):
    features = np.array([
        [s["avg_score"], s["attendance"] * 100, s["study_time_hrs"], s["completion_rate"] * 100]
        for s in students
    ])
    labels = np.array([1 if s["risk_level"] == "high" else 0 for s in students])
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    if len(set(labels)) < 2:
        return [0.1] * len(students)
    clf = LogisticRegression(random_state=42, max_iter=1000)
    clf.fit(features_scaled, labels)
    probs = clf.predict_proba(features_scaled)[:, 1]
    return [round(float(p), 3) for p in probs]

def get_weak_topics(student):
    weak = []
    for subj, data in student["subjects"].items():
        for topic, mastery in data["topic_mastery"].items():
            if mastery < 0.6:
                weak.append({
                    "subject": subj,
                    "topic": topic,
                    "mastery": mastery,
                    "priority": "high" if mastery < 0.4 else "medium"
                })
    return sorted(weak, key=lambda x: x["mastery"])[:8]

def generate_recommendations(student):
    weak_topics = get_weak_topics(student)
    recs = []
    for wt in weak_topics[:5]:
        subj = wt["subject"]
        topic = wt["topic"]
        materials = STUDY_MATERIALS.get(subj, {}).get(topic, [f"{topic} Study Guide", f"{topic} Practice Quiz"])
        recs.append({
            "type": "topic_revision",
            "subject": subj,
            "topic": topic,
            "mastery": wt["mastery"],
            "priority": wt["priority"],
            "materials": materials[:2],
            "estimated_time": f"{int((1 - wt['mastery']) * 3 + 1)} hours",
            "difficulty": "easy" if wt["mastery"] > 0.4 else "medium"
        })
    
    learning_path = []
    sorted_weak = sorted(weak_topics, key=lambda x: x["mastery"])
    for i, wt in enumerate(sorted_weak[:5]):
        learning_path.append({
            "step": i + 1,
            "subject": wt["subject"],
            "topic": wt["topic"],
            "action": f"Review {wt['topic']} fundamentals",
            "duration": f"{int((1 - wt['mastery']) * 2 + 1)} days"
        })
    
    quizzes = []
    for wt in weak_topics[:3]:
        quizzes.append({
            "subject": wt["subject"],
            "topic": wt["topic"],
            "difficulty": "easy" if wt["mastery"] < 0.4 else "medium",
            "questions": 10,
            "estimated_time": "15 min"
        })
    
    return {
        "weak_topics": weak_topics,
        "recommended_materials": recs,
        "learning_path": learning_path,
        "practice_quizzes": quizzes,
        "difficulty_level": "easy" if student["avg_score"] < 60 else ("medium" if student["avg_score"] < 80 else "hard"),
        "study_plan": {
            "daily_goal": f"{max(2, int(8 - student['study_time_hrs']))} additional hours/week",
            "focus_subjects": [wt["subject"] for wt in weak_topics[:3]],
            "milestones": [
                {"week": 1, "goal": "Complete all easy-difficulty materials"},
                {"week": 2, "goal": "Take practice quizzes for weak topics"},
                {"week": 3, "goal": "Achieve 70% mastery in priority topics"},
                {"week": 4, "goal": "Full assessment and progress review"}
            ]
        }
    }

def predict_future_grade(student):
    hist = student["performance_history"]
    if len(hist) >= 4:
        recent = hist[-4:]
        trend = (recent[-1] - recent[0]) / 3
    else:
        trend = 0
    predictions = []
    base = hist[-1] if hist else student["avg_score"]
    for w in range(1, 5):
        pred = min(100, max(0, base + trend * w + np.random.normal(0, 2)))
        predictions.append({"week": f"Week +{w}", "predicted_score": round(pred, 1)})
    return predictions

def predict_topic_mastery(student):
    results = []
    for subj, data in student["subjects"].items():
        for topic, mastery in data["topic_mastery"].items():
            growth_rate = 0.05 if student["learning_speed"] == "fast" else (0.03 if student["learning_speed"] == "medium" else 0.01)
            predicted = min(1.0, mastery + growth_rate * 4)
            results.append({
                "subject": subj,
                "topic": topic,
                "current_mastery": mastery,
                "predicted_mastery_4w": round(predicted, 2),
                "improvement": round(predicted - mastery, 2)
            })
    return sorted(results, key=lambda x: x["improvement"], reverse=True)[:10]
