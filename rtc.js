// create socket
var socket = io.connect('http://' + window.location.host + ':8080/');

var sourcevid = document.getElementById('sourcevideo');
var remotevid = document.getElementById('remotevideo');
var localStream = null;
var peerConn = null;
var started = false;
var channelReady = false;
var mediaConstraints = {'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true}};
var isVideoMuted = false;

// show the local video
function startVideo() {

    navigator.webkitGetUserMedia({video: true, audio: true}, successCallback, errorCallback);
    function successCallback(stream) {
        localStream = stream;
        try {
            sourcevid.src = window.URL.createObjectURL(stream);
            sourcevid.play();
        } catch (e) {
            console.log("Error setting video src: ", e);
        }

    }
    function errorCallback(error) {
        console.error('An error occurred: [CODE ' + error.code + ']');
        return;
    }
}

// stop local video
function stopVideo() {
    sourcevid.src = "";
    localStream.stop();
}

// send SDP via socket connection
function setLocalAndSendMessage(sessionDescription) {
    peerConn.setLocalDescription(sessionDescription);
    console.log("Sending: SDP");
    console.log(sessionDescription);
    socket.json.send(sessionDescription);
}

function createOfferFailed() {
    console.log("Create Answer failed");
}

// start the connection upon user request
function connect() {
    if (!started && localStream && channelReady) {
        createPeerConnection();
        started = true;
        peerConn.createOffer(setLocalAndSendMessage, createOfferFailed, mediaConstraints);
    } else {
        alert("Local stream not running yet - try again.");
    }
}

// stop the connection upon user request
function hangUp() {
    console.log("Hang up.");
    socket.json.send({type: "bye"});
    stop();
    remotevid.src = "";
}

function stop() {
    peerConn.close();
    peerConn = null;
    started = false;
    remotevid.src = "";
}

// socket: channel connected
socket.on('connect', onChannelOpened);
socket.on('message', onMessage);

function onChannelOpened(evt) {
    console.log('Channel opened.');
    channelReady = true;
}

function createAnswerFailed() {
    console.log("Create Answer failed");
}
// socket: accept connection request
function onMessage(evt) {
    if (evt.type === 'offer') {
        console.log("Received offer...");
        if (!started) {
            createPeerConnection();
            started = true;
        }
        console.log('Creating remote session description...');
        peerConn.setRemoteDescription(new RTCSessionDescription(evt));
        console.log('Sending answer...');
        peerConn.createAnswer(setLocalAndSendMessage, createAnswerFailed, mediaConstraints);

    } else if (evt.type === 'answer' && started) {
        console.log('Received answer...');
        console.log('Setting remote session description...');
        peerConn.setRemoteDescription(new RTCSessionDescription(evt));

    } else if (evt.type === 'candidate' && started) {
        console.log('Received ICE candidate...');
        var candidate = new RTCIceCandidate({sdpMLineIndex: evt.sdpMLineIndex, sdpMid: evt.sdpMid, candidate: evt.candidate});
        console.log(candidate);
        peerConn.addIceCandidate(candidate);

    } else if (evt.type === 'bye' && started) {
        console.log("Received bye");
        stop();
    }
}

function createPeerConnection() {
    console.log("Creating peer connection");
    var pc_config = {"iceServers": []};
    try {
        peerConn = new webkitRTCPeerConnection(pc_config);
    } catch (e) {
        console.log("Failed to create PeerConnection, exception: " + e.message);
    }
    // send any ice candidates to the other peer
    peerConn.onicecandidate = function(evt) {
        if (event.candidate) {
            console.log('Sending ICE candidate...');
            console.log(evt.candidate);
            socket.json.send({type: "candidate",
                sdpMLineIndex: evt.candidate.sdpMLineIndex,
                sdpMid: evt.candidate.sdpMid,
                candidate: evt.candidate.candidate});
        } else {
            console.log("End of candidates.");
        }
    };
    console.log('Adding local stream...');
    peerConn.addStream(localStream);

    peerConn.addEventListener("addstream", onRemoteStreamAdded, false);
    peerConn.addEventListener("removestream", onRemoteStreamRemoved, false);

    // when remote adds a stream, hand it on to the local video element
    function onRemoteStreamAdded(event) {
        console.log("Added remote stream");
        remotevid.src = window.URL.createObjectURL(event.stream);
    }

    // when remote removes a stream, remove it from the local video element
    function onRemoteStreamRemoved(event) {
        console.log("Remove remote stream");
        remotevid.src = "";
    }
}