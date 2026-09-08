from pydantic import BaseModel, ConfigDict


class NotificationSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    expiry_warnings: bool
    wastage_alerts: bool
    auto_order_reminders: bool
    equipment_warnings: bool
    production_delays: bool


class NotificationSettingsUpdate(BaseModel):
    expiry_warnings: bool | None = None
    wastage_alerts: bool | None = None
    auto_order_reminders: bool | None = None
    equipment_warnings: bool | None = None
    production_delays: bool | None = None