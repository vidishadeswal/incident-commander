from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings


class LLMClient:
    def __init__(self) -> None:
        self.enabled = settings.llm_enabled
        self.base_url = settings.llm_base_url.rstrip("/")
        self.model = settings.llm_model
        self.timeout = settings.llm_timeout_seconds

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        if not self.enabled:
            return self._fallback(user_prompt)

        payload: dict[str, Any] = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
        }

        endpoints = [
            (f"{self.base_url}/v1/chat/completions", {"model": self.model, **payload}),
            (f"{self.base_url}/completion", {"prompt": f"{system_prompt}\n\n{user_prompt}"}),
        ]

        for url, request_payload in endpoints:
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    response = client.post(url, json=request_payload)
                    response.raise_for_status()
                    data = response.json()
                    parsed = self._parse_response(data)
                    if parsed:
                        return parsed
            except Exception:
                continue

        return self._fallback(user_prompt)

    def _parse_response(self, data: dict[str, Any]) -> str:
        if "choices" in data and data["choices"]:
            message = data["choices"][0].get("message", {})
            if message.get("content"):
                return message["content"]
            text = data["choices"][0].get("text")
            if text:
                return text
        if "content" in data:
            return str(data["content"])
        return ""

    def _fallback(self, prompt: str) -> str:
        return (
            "LLM output unavailable. This is a deterministic fallback based on the current incident "
            "context. Review logs, recent deploys, and GitHub activity to confirm the likely cause.\n\n"
            f"Context excerpt:\n{prompt[:1200]}"
        )

