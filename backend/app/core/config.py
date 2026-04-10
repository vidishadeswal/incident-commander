from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="AI Incident Commander API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")
    api_prefix: str = Field(default="/api/v1", alias="API_PREFIX")
    debug: bool = Field(default=True, alias="DEBUG")

    database_url: str = Field(alias="DATABASE_URL")

    github_token: str = Field(default="", alias="GITHUB_TOKEN")
    github_webhook_secret: str = Field(default="", alias="GITHUB_WEBHOOK_SECRET")
    alert_webhook_secret: str = Field(default="", alias="ALERT_WEBHOOK_SECRET")
    slack_signing_secret: str = Field(default="", alias="SLACK_SIGNING_SECRET")
    slack_bot_token: str = Field(default="", alias="SLACK_BOT_TOKEN")

    llm_provider: str = Field(default="llamacpp", alias="LLM_PROVIDER")
    llm_base_url: str = Field(default="http://127.0.0.1:8080", alias="LLM_BASE_URL")
    llm_model: str = Field(default="qwen2.5-3b-instruct-q4_k_m.gguf", alias="LLM_MODEL")
    llm_timeout_seconds: int = Field(default=60, alias="LLM_TIMEOUT_SECONDS")
    llm_enabled: bool = Field(default=True, alias="LLM_ENABLED")

    max_log_lines_per_analysis: int = Field(default=300, alias="MAX_LOG_LINES_PER_ANALYSIS")
    max_context_events: int = Field(default=100, alias="MAX_CONTEXT_EVENTS")
    default_incident_confidence_threshold: float = Field(
        default=0.6,
        alias="DEFAULT_INCIDENT_CONFIDENCE_THRESHOLD",
    )


settings = Settings()

