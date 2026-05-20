import os
import sys

# Add Backend folder to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SyncSessionLocal
from app.models.user import User

def show_users_and_make_admin():
    print("="*60)
    print("UstadG Admin Management Script")
    print("="*60)
    
    with SyncSessionLocal() as session:
        try:
            users = session.query(User).all()
            if not users:
                print("No registered users found in the database.")
                return
                
            print("\nRegistered Users:")
            print(f"{'Name':<20} | {'Phone':<15} | {'Role':<10}")
            print("-" * 55)
            for u in users:
                print(f"{u.name:<20} | {u.phone:<15} | {u.role:<10}")
            
            print("\n" + "="*60)
            phone_input = input("Enter the Phone Number of the user you want to make ADMIN (or press Enter to exit): ").strip()
            if not phone_input:
                print("Exiting.")
                return
                
            user = session.query(User).filter_by(phone=phone_input).first()
            if not user:
                print(f"Error: User with phone number '{phone_input}' not found.")
                return
                
            user.role = "admin"
            session.commit()
            print(f"\n🎉 Success! User '{user.name}' ({user.phone}) has been upgraded to ADMIN role.")
            print("You can now log in on your device/browser and access Developer Settings!")
            
        except Exception as e:
            print(f"Error connecting to database: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        phone_input = sys.argv[1].strip()
        with SyncSessionLocal() as session:
            try:
                user = session.query(User).filter_by(phone=phone_input).first()
                if user:
                    user.role = "admin"
                    session.commit()
                    print(f"🎉 Success! Upgraded user '{user.name}' ({user.phone}) to ADMIN.")
                else:
                    print(f"Error: User with phone number '{phone_input}' not found.")
            except Exception as e:
                print(f"Database error: {e}")
    else:
        show_users_and_make_admin()
