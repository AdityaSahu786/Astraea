"""Pydantic request/response validation schemas for the Astraea API."""

from __future__ import annotations
from pydantic import BaseModel, Field, field_validator

from app.data.venues import VENUES_BY_ID
from app.ml.features import EVENT_TYPES, Event


class SimulateRequest(BaseModel):
    venueId: str = Field("chinnaswamy", description="Venue ID from /api/venues")
    eventType: str = Field("cricket", description="Event type key from /api/event-types")
    attendance: int = Field(36000, ge=100, le=200000, description="Expected attendee count")
    startHour: float = Field(19.5, ge=0.0, le=23.75, description="Event start hour (0-23.75)")
    dow: int = Field(5, ge=0, le=6, description="Day of week (0=Mon ... 6=Sun)")
    isHoliday: bool = Field(False, description="Is public holiday")
    rain: int = Field(0, ge=0, le=2, description="Rain level: 0 clear, 1 light, 2 heavy")
    tempC: float = Field(28.0, ge=10.0, le=45.0, description="Ambient temperature (°C)")
    durationMin: int = Field(210, ge=30, le=600, description="Event duration in minutes")
    manpowerBudget: int = Field(60, ge=0, le=300, description="Max police officers available")

    @field_validator("venueId")
    @classmethod
    def check_venue(cls, v: str) -> str:
        if v not in VENUES_BY_ID:
            raise ValueError(f"Unknown venueId '{v}'. Valid: {list(VENUES_BY_ID.keys())}")
        return v

    @field_validator("eventType")
    @classmethod
    def check_event_type(cls, v: str) -> str:
        if v not in EVENT_TYPES:
            raise ValueError(f"Unknown eventType '{v}'. Valid: {list(EVENT_TYPES.keys())}")
        return v

    def to_event(self) -> Event:
        return Event(
            venue_id=self.venueId,
            event_type=self.eventType,
            attendance=self.attendance,
            start_hour=self.startHour,
            dow=self.dow,
            is_holiday=self.isHoliday,
            rain=self.rain,
            temp_c=self.tempC,
            duration_min=self.durationMin,
        )
