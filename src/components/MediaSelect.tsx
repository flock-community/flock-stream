import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import React from "react";

type MediaSelectProps =
  {
    value: string
    devices?: MediaDeviceInfo[]
    kind: MediaDeviceKind
    onChange: (deviceId: unknown) => void
  }
export const MediaSelect = (
  {
    value, devices, kind, onChange
  }
    : MediaSelectProps) => {
  return <FormControl fullWidth>
    <InputLabel>{kind}</InputLabel>
    <Select
      value={value}
      onChange={it => onChange(it.target.value)}>
      {devices
        ?.filter(it => it.kind === kind)
        .map(it => <MenuItem key={`${it.deviceId}-${kind}-select-option`} value={it.deviceId}>{it.label}</MenuItem>)}
    </Select>
  </FormControl>
}
