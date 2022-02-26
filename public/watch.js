let peerConnection;
let contextMap = {}

const config = {
  iceServers: [
      {
        "urls": "stun:stun.l.google.com:19302",
      },
  ]
};

const socket = io.connect(window.location.origin);
const videoWebcam = document.querySelector("video#watchWebcam");
const videoScreen = document.querySelector("video#watchScreen");
const enableAudioButton = document.querySelector("#enable-audio");

if(enableAudioButton){
  enableAudioButton.addEventListener("click", enableAudio)
}

socket.on("offer", (id, description, context) => {
  console.log("offer", id, description, context)
  contextMap = context
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = event => {
    if(videoWebcam && contextMap[event.track.id] === 'webcam'){
      videoWebcam.srcObject = event.streams[0];
    }
    if(videoScreen && contextMap[event.track.id] === 'screen'){
      videoScreen.srcObject = event.streams[0];
    }
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});

socket.on("candidate", (id, candidate) => {
  console.log("candidate", id, candidate)
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  console.log("connect")
  socket.emit("watcher");
});

socket.on("broadcaster", (context) => {
  console.log("broadcaster", context)
  contextMap = context
  socket.emit("watcher");
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};

function enableAudio() {
  console.log("Enabling audio")
  videoWebcam.muted = !videoWebcam.muted;
}