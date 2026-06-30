# Re-export from summary to ensure SQLAlchemy picks up the User model
from app.models.summary import User, Summary  # noqa: F401
