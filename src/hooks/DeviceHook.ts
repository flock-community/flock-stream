import {useEffect, useState} from "react";

export const useDevices = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>()
  useEffect(() => {
    window.navigator.mediaDevices.enumerateDevices().then(it => setDevices(it))
  }, [])

  return devices
}