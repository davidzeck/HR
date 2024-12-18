from app import create_app, db

def init_db():
    app = create_app()
    with app.app_context():
        # Create all tables
        print("Creating tables...")
        db.create_all()
        print("Database initialization completed successfully!")

if __name__ == "__main__":
    init_db() 