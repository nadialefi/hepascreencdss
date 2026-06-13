from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class UserBase(BaseModel):
    username: str
    role: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    medical_record_number: str
    name: str
    age: int
    gender: str

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ExaminationBase(BaseModel):
    alb: float
    alp: float
    alt: float
    ast: float
    bil: float
    che: float
    chol: float
    crea: float
    ggt: float
    prot: float

class ExaminationCreate(ExaminationBase):
    patient_id: int

class ExaminationCreateWithPatientInfo(ExaminationBase):
    medical_record_number: str
    name: str
    age: int
    gender: str

class Examination(ExaminationBase):
    id: int
    patient_id: int
    user_id: int
    prediction_result: str
    confidence_score: float
    probabilities: str # We might want to parse this as dict in responses later
    execution_time_ms: float
    created_at: datetime
    patient: Optional[Patient] = None
    user: Optional[User] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class PredictionResponse(BaseModel):
    prediction: str
    confidence_score: float
    probabilities: Dict[str, float]
    execution_time_ms: float

class DashboardStats(BaseModel):
    totalPatients: int
    totalExaminations: int
    hepatitisCases: int
    cirrhosisCases: int
    fibrosisCases: int
    bloodDonorCases: int
    recentActivities: List[Examination]
