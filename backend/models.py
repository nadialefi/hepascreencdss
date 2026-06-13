from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # 'admin' or 'medis'
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    examinations = relationship("Examination", back_populates="user")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    medical_record_number = Column(String, unique=True, index=True)
    name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    examinations = relationship("Examination", back_populates="patient")

class Examination(Base):
    __tablename__ = "examinations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Lab parameters
    alb = Column(Float)
    alp = Column(Float)
    alt = Column(Float)
    ast = Column(Float)
    bil = Column(Float)
    che = Column(Float)
    chol = Column(Float)
    crea = Column(Float)
    ggt = Column(Float)
    prot = Column(Float)
    
    # Model results
    prediction_result = Column(String) # 'Blood Donor', 'Hepatitis', 'Fibrosis', 'Cirrhosis'
    confidence_score = Column(Float) # 0-100
    probabilities = Column(Text) # JSON string of all 4 class probabilities
    execution_time_ms = Column(Float)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="examinations")
    user = relationship("User", back_populates="examinations")
