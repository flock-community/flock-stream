/** @jsxImportSource @emotion/react */
import React, {useEffect, useRef, useState} from 'react';
import logo from './logo.svg'
import {css} from '@emotion/react';
import {
  Box,
  Button,
  Container,
  createTheme,
  CssBaseline,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  ThemeProvider
} from "@mui/material";

import {useDevices} from "./hooks/DeviceHook";
import {setScreenStream, setWebcamStream} from "./services/SocketService";
import {MediaSelect} from "./components/MediaSelect";

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const logoCss = css`
  text-align: center
`

type AppState = Record<MediaDeviceKind, string>

function App() {

  const videoCameraRef = useRef<HTMLVideoElement>(null);
  const videoScreenRef = useRef<HTMLVideoElement>(null);

  const devices = useDevices()

  const [state, setState] = useState<AppState>()

  useEffect(() => {
    if (devices) {
      setState({
        videoinput: devices.filter(it => it.kind === 'videoinput').map(it => it.deviceId)[0] ?? "",
        audioinput: devices.filter(it => it.kind === 'audioinput').map(it => it.deviceId)[0] ?? "",
        audiooutput: "",
      })
    }
  }, [devices])

  useEffect(() => {
    (async function () {
      if (state) {
        const constraints = {
          audio: {deviceId: state.audioinput ? {exact: state.audioinput} : undefined},
          video: {deviceId: state.videoinput ? {exact: state.videoinput} : undefined},
        };
        const stream =  await navigator.mediaDevices.getUserMedia(constraints)
        console.log("setWebcamStream")
        setWebcamStream(stream)
        if (videoCameraRef && videoCameraRef.current && videoCameraRef.current.srcObject !== stream) {
          videoCameraRef.current.srcObject = stream
        }
      }
    })();
  }, [state])

  const handleChangeMedia = (kind: MediaDeviceKind) => (deviceId: unknown) => {
    setState(prevState => (prevState ? {...prevState, [kind]: deviceId} : undefined))
  }

  const handleShareScreen = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia()
    setScreenStream(stream)
    if (videoScreenRef && videoScreenRef.current && videoScreenRef.current.srcObject !== stream) {
      videoScreenRef.current.srcObject = stream
    }
  }

  if (!state) {
    return null
  }

  return <ThemeProvider theme={theme}>
    <CssBaseline/>
    <Container>
      <Box css={logoCss} mt={4}>
        <img src={logo} className="App-logo" alt="logo"/>
        <h1>Flock. streaming</h1>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <video ref={videoCameraRef} width="100%" playsInline autoPlay muted/>
            </Grid>
            <Grid item xs={12}>
              <MediaSelect
                value={state["videoinput"]}
                devices={devices}
                kind={"videoinput"}
                onChange={handleChangeMedia("videoinput")}/>
            </Grid>
            <Grid item xs={12}>
              <MediaSelect
                value={state["audioinput"]}
                devices={devices}
                kind={"audioinput"}
                onChange={handleChangeMedia("audioinput")}/>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <video ref={videoScreenRef} width="100%" playsInline autoPlay muted/>
          <Box width="100%" p={6} textAlign="center">
            <Button variant="contained" onClick={handleShareScreen}>Share your screen</Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  </ThemeProvider>
}

export default App;

