import {io} from "socket.io-client";

const peerConnections: Record<string, RTCPeerConnection> = {};

const socket = io(window.location.origin);

let webcamStream: MediaStream | undefined
let screenStream: MediaStream | undefined

let context: Record<string, string> = {}

const config = {
  iceServers: [
    {
      "urls": "stun:stun.l.google.com:19302",
    },
  ]
};

socket.on("answer", (id, description) => {
  peerConnections[id].setRemoteDescription(description);
});

socket.on("watcher", id => {
  console.log("watcher", id)
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[id] = peerConnection;

  if (webcamStream !== undefined) {
    webcamStream.getTracks()
      .forEach(track => {
        webcamStream && peerConnection.addTrack(track, webcamStream)
      });
  }

  if (screenStream !== undefined) {
    screenStream.getTracks()
      .forEach(track => {
        screenStream && peerConnection.addTrack(track, screenStream)
      });
  }

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };

  peerConnection
    .createOffer()
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("offer", id, peerConnection.localDescription, context);
    });
});

socket.on("candidate", (id, candidate) => {
  peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("disconnectPeer", id => {
  peerConnections[id].close();
  delete peerConnections[id];
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};

export function setWebcamStream(stream: MediaStream) {
  webcamStream = stream
  context = {...contextMap('webcam',webcamStream), ...contextMap('screen',screenStream)}
  socket.emit("broadcaster", context);
}

export function setScreenStream(stream: MediaStream) {
  screenStream = stream
  context = {...contextMap('webcam',webcamStream), ...contextMap('screen',screenStream)}
  socket.emit("broadcaster", context);
}

const contextMap = (context: string, stream?: MediaStream): Record<string, string> => {
  return stream?.getTracks()
    ?.map(it => it.id)
    ?.reduce((acc, cur) => ({...acc, [cur]: context}), {}) ?? {}
}

