from pydantic import BaseModel, ConfigDict


class FacilityStateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    emergency_active: bool