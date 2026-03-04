# Quick Start Guide - SQLite Setup

## Getting Started in 5 Minutes

This guide will help you quickly set up and run the backend with SQLite database.

### 1. Install Dependencies

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# The default configuration uses SQLite - no changes needed!
```

Your `.env` file should have:
```env
DATABASE_TYPE=sqlite
SQLITE_DB_PATH=./db.sqlite3
```

### 3. Initialize Database

```bash
# Initialize Aerich (database migration tool)
aerich init -t src.app.db.setup_database.TORTOISE_ORM

# Create database schema
aerich init-db
```

This will create a `db.sqlite3` file in your project root.

### 4. Run the Application

```bash
# Start the FastAPI server
uvicorn src.app.main:app --reload --host localhost --port 8082
```

### 5. Access the API

- **API Docs**: http://localhost:8082/docs
- **ReDoc**: http://localhost:8082/redocs
- **Health Check**: http://localhost:8082/

## Next Steps

### View Your Database

You can use any SQLite browser to view your database:
- [DB Browser for SQLite](https://sqlitebrowser.org/) (Free, Desktop)
- [SQLite Viewer](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer) (VS Code Extension)
- Command line: `sqlite3 db.sqlite3`

### Make Database Changes

1. Modify your models in `src/app/db/tables/`
2. Generate migration:
   ```bash
   aerich migrate --name "describe_your_changes"
   ```
3. Apply migration:
   ```bash
   aerich upgrade
   ```

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html
```

### Run Worker (Background Tasks)

```bash
taskiq worker src.app.worker:broker -fsd -tp 'src/**/*_tasks.py' --reload
```

## Docker Setup

### Using Docker Compose

```bash
# Build and start services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

The SQLite database will be automatically mounted and persisted.

## Switching to PostgreSQL Later

When you're ready to use PostgreSQL, see [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md) for detailed instructions.

Quick summary:
1. Install and configure PostgreSQL
2. Update `.env`:
   ```env
   DATABASE_TYPE=postgresql
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=your_user
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=your_database
   ```
3. Run migrations: `aerich upgrade`
4. Restart application

## Troubleshooting

### "Database is locked" error
- Make sure only one instance of the app is running
- Restart the application

### "No module named 'aiosqlite'" error
- Run: `pip install -r requirements.txt`

### API not accessible
- Check if port 8082 is already in use
- Try a different port: `uvicorn src.app.main:app --reload --port 8083`

### Migration errors
- Delete the `migrations/` folder (except `models/0_*.py`)
- Reinitialize: `aerich init-db`

## Additional Resources

- [Full README](README.md)
- [Database Migration Guide](DATABASE_MIGRATION_GUIDE.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tortoise ORM Documentation](https://tortoise.github.io/)
