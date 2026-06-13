from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
from typing import List
import json

import models, schemas
from database import get_db
from core.security import verify_password, get_password_hash, create_access_token
from services.prediction import predict_hepatitis

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency to get current user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from jose import JWTError, jwt
    from core.config import settings
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username, "role": user.role, "full_name": user.full_name})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password, role=user.role, full_name=user.full_name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.put("/users/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.full_name is not None:
        db_user.full_name = user_update.full_name
    if user_update.role is not None:
        db_user.role = user_update.role
    if user_update.password:
        db_user.hashed_password = get_password_hash(user_update.password)
        
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent foreign key constraint failure and preserve medical history
    db.query(models.Examination).filter(models.Examination.user_id == user_id).update({models.Examination.user_id: None})
        
    db.delete(db_user)
    db.commit()

@router.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    total_patients = db.query(models.Patient).count()
    total_examinations = db.query(models.Examination).count()
    
    hepatitis_cases = db.query(models.Examination).filter(models.Examination.prediction_result == "Hepatitis").count()
    cirrhosis_cases = db.query(models.Examination).filter(models.Examination.prediction_result == "Cirrhosis").count()
    fibrosis_cases = db.query(models.Examination).filter(models.Examination.prediction_result == "Fibrosis").count()
    blood_donor_cases = db.query(models.Examination).filter(models.Examination.prediction_result == "Blood Donor").count()
    
    recent_activities = db.query(models.Examination).options(joinedload(models.Examination.patient), joinedload(models.Examination.user)).order_by(models.Examination.created_at.desc()).limit(5).all()
    
    return {
        "totalPatients": total_patients,
        "totalExaminations": total_examinations,
        "hepatitisCases": hepatitis_cases,
        "cirrhosisCases": cirrhosis_cases,
        "fibrosisCases": fibrosis_cases,
        "bloodDonorCases": blood_donor_cases,
        "recentActivities": recent_activities
    }

@router.get("/patients/", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    patients = db.query(models.Patient).offset(skip).limit(limit).all()
    return patients

@router.post("/predict/", response_model=schemas.Examination)
def create_prediction(exam_data: schemas.ExaminationCreateWithPatientInfo, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Check or create patient
    patient = db.query(models.Patient).filter(models.Patient.medical_record_number == exam_data.medical_record_number).first()
    if not patient:
        patient = models.Patient(
            medical_record_number=exam_data.medical_record_number,
            name=exam_data.name,
            age=exam_data.age,
            gender=exam_data.gender
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
    
    # Encode gender based on notebook: Female (0), Male (1)
    gender_encoded = 0 if str(exam_data.gender).lower() in ['f', 'female', 'perempuan', '0'] else 1

    features = [
        exam_data.age,
        gender_encoded,
        exam_data.alb,
        exam_data.alp,
        exam_data.alt,
        exam_data.ast,
        exam_data.bil,
        exam_data.che,
        exam_data.chol,
        exam_data.crea,
        exam_data.ggt,
        exam_data.prot
    ]
    
    # Predict
    pred_class, conf_score, probabilities, exec_time = predict_hepatitis(features)
    
    # Create Examination Record
    db_exam = models.Examination(
        patient_id=patient.id,
        user_id=current_user.id,
        alb=exam_data.alb,
        alp=exam_data.alp,
        alt=exam_data.alt,
        ast=exam_data.ast,
        bil=exam_data.bil,
        che=exam_data.che,
        chol=exam_data.chol,
        crea=exam_data.crea,
        ggt=exam_data.ggt,
        prot=exam_data.prot,
        prediction_result=pred_class,
        confidence_score=conf_score,
        probabilities=json.dumps(probabilities),
        execution_time_ms=exec_time
    )
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

@router.get("/examinations/", response_model=List[schemas.Examination])
def read_examinations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    examinations = db.query(models.Examination).options(joinedload(models.Examination.patient), joinedload(models.Examination.user)).order_by(models.Examination.created_at.desc()).offset(skip).limit(limit).all()
    return examinations
