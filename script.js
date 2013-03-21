var socket = io.connect('http://' + window.location.host + ':8080/'); //:1337/
var channelReady = false;
var pc_config = null;
var peerConn = new webkitRTCPeerConnection(pc_config);
var started;
var localStream;
var userId = Math.floor(Math.random()*11);

var mediaConstraints = {'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true}};


socket.on('connect', onChannelOpened);

function onChannelOpened(evt) {
    channelReady = true;
}

function createPeerConnection() {
    var pc_config = {"iceServers": []};
    peerConn = new webkitRTCPeerConnection(pc_config);

    peerConn.onicecandidate = function(evt) {
        socket.json.send({type: "candidate"}, evt.candidate);
    };

    peerConn.onaddstream = function(evt) {
        remoteVideo.src = window.URL.createObjectURL(evt.stream);
    };

    peerConn.addStream(localStream);
}

function log(text) {
    console.log(text);
}

function start() {
    navigator.webkitGetUserMedia({audio: true, video: true},
    function(stream) {
        localVideo.src = webkitURL.createObjectURL(stream);
        localstream = stream;
    },
            function() {
                log('no success');
            }
    );
}

function setLocalAndSendMessage(sessionDescription) {
    peerConn.setLocalDescription(sessionDescription);
    socket.json.send(sessionDescription);
}

function connect() {
    peerConn.createOffer(setLocalAndSendMessage,
            function() {
                log('error');
            },
            mediaConstraints);

    socket.on('message', onMessage);

    function onMessage(evt) {
        if (evt.type === 'offer') {
            if (!started) {
                createPeerConnection();
                started = true;
            }
            peerConn.setRemoteDescription(new RTCSessionDescription(evt));
            peerConn.createAnswer(setLocalAndSendMessage,
                    errorCallback,
                    mediaConstraints);

        } else if (evt.type === 'answer' && started) {
            peerConn.setRemoteDescription(new RTCSessionDescription(evt));

        } else if (evt.type === 'candidate' && started) {
            var candidate = new RTCIceCandidate(evt.candidate);
            peerConn.addIceCandidate(candidate);
        }
    }

}

var data = document.getElementById('input').value;

socket.on('connect', function() {
    console.log("Connect");
});
socket.on('disconnect', function() {
    alert("Disconnected");
});

var newdata;

function sendMsg(data) {
    log("Trying to send");
    socket.emit('message', data);
    newdata = document.getElementById('output').value + '\n' + 'You: ' +data;
    document.getElementById('output').value = newdata;
}

socket.on('message', function(data) {
    console.log("Received: " + data);
    newdata = document.getElementById('output').value + '\n' + 'Partner: ' + data;
    document.getElementById('output').value = newdata;
});
