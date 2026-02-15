from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Claim Verification AI Service"
    host: str = "0.0.0.0"
    port: int = 8001

    max_search_results: int = 5
    similarity_threshold_support: float = 0.75

    user_agent: str = "ClaimVerifierBot/1.0"
    request_timeout: int = 100

    class Config:
        env_file = ".env"


settings = Settings()
