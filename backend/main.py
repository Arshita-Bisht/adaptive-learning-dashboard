from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import students, analytics, recommendations, admin, predictions, alerts
import uvicorn

app = FastAPI(title="Adaptive Learning API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students.router, prefix="/api/students", tags=["students"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])

@app.get("/")
def root():
    return {"message": "Adaptive Learning API is running"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
