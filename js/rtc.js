/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
console.log("rtc.js loaded");

// define video elements for stream output
var localView = document.getElementById("localView");
var remoteView = document.getElementById("remoteView");
var servers = null; // Can also be an specific one
var localstream;
var isCaller = false;

var mediaConstraints = {'mandatory': {
                          'OfferToReceiveAudio':true, 
                          'OfferToReceiveVideo':true }};
var isVideoMuted = false;
var isAudioMuted = false;

var pc;
//var signalingChannel = createSignalingChannel();

function log(text) {
    console.log(text);
}

function call(isCaller) {
    pc = new webkitRTCPeerConnection({"iceServers":[{"url":"stun:stun.l.google.com:19302"}]}, mediaConstraints);

    // send any ice candidates to the other peer
    pc.onicecandidate = iceCallback;

    function iceCallback(event) {
        if (event.candidate) {
            pc.addIceCandidate(new RTCIceCandidate(event.candidate));
            log("ICE candidate: \n" + event.candidate.candidate);
        }
    }

    // once remote stream arrives, show it in the remote video element
    pc.onaddstream = function(evt) {
        remoteView.src = URL.createObjectURL(evt.stream);
    };

    // get the local stream, show it in the local video element and send it
    navigator.webkitGetUserMedia({"audio": true, "video": true}, function(stream) {
        localView.src = URL.createObjectURL(stream);
        pc.addStream(stream);

        if (isCaller) {
            pc.createOffer(gotDescription);
            log("createOffer");
        }
        else {
            pc.createAnswer(gotDescription);
            log("createAnswer");
        }

        function gotDescription(desc) {
            pc.setLocalDescription(desc);
            //signalingChannel.send(JSON.stringify({ "sdp": desc }));
        }
    });
}

function hangup() {
    log("Ending call");
    pc.close();
    pc = null;
}

function iceCallback(event) {
    if (event.candidate) {
        pc.addIceCandidate(new RTCIceCandidate(event.candidate));
        log("Local ICE candidate: \n" + event.candidate.candidate);
    }
}