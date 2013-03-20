<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title></title>
    </head>
    <body>
        <style>
            * {
                font-family: Arial;
            }
            #videoWrap {
                background-color: gray;
            }

            #videoWrap video {
                margin: 3px;
                border: 1px solid orangered;
                min-width: 200px;
                min-height: 150px;
            }
            #localView {
                width: 200px;
            }
            #remoteView {
                max-width: 400px;
            }
            .videoElement {
                position: relative;
                float: left;
            }
            .videoElement span {
                position: absolute;
                top: 6px;
                right: 6px;
                background-color: rgba(255,255,255, 0.5);
                color: black;
                padding: 2px;
                font-size: 10px;
            }

        </style>

        <div id="videoWrap">
            <div class="videoElement"><video controls autoplay id="remoteView"></video>
                <span>remoteview</span></div>

            <div class="videoElement"><video controls autoplay id="localView">test</video>
                <span>localview</span></div>

            <div style="clear: both"></div>

            <button onClick="call(true)">Call</button> <button onClick="hangup()">Hang up</button>
        </div>

        <script type="text/javascript" src="js/rtc.js"></script>
    </body>
</html>
