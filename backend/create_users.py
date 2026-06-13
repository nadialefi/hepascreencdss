from database import SessionLocal, engine, Base
from models import User
from core.security import get_password_hash

def init_db():
    db = SessionLocal()
    
    # Check if admin exists
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin_user = User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            full_name="Administrator"
        )
        db.add(admin_user)
    
    # Check if a medis user exists
    medis = db.query(User).filter(User.username == "dr_budi").first()
    if not medis:
        medis_user = User(
            username="dr_budi",
            hashed_password=get_password_hash("medis123"),
            role="medis",
            full_name="Dr. Budi Santoso"
        )
        db.add(medis_user)

    db.commit()
    db.close()
    print("Initial users created: admin/admin123, dr_budi/medis123")

if __name__ == "__main__":
    init_db()
