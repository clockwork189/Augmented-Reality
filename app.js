var canvas = document.createElement('canvas');
var context = canvas.getContext("2d");

// Create a RGB raster object for the 2D canvas.
// JSARToolKit uses raster objects to read image data.
// Note that you need to set canvas.changed = true on every frame.
var raster = new NyARRgbRaster_Canvas2D(canvas);
document.body.appendChild(canvas);
// FLARParam is the thing used by FLARToolKit to set camera parameters.
// Here we create a FLARParam for images with 320x240 pixel dimensions.
var param = new FLARParam(320, 240);

// The FLARMultiIdMarkerDetector is the actual detection engine for marker detection.
// It detects multiple ID markers. ID markers are special markers that encode a number.
var detector = new FLARMultiIdMarkerDetector(param, 120);

// For tracking video set continue mode to true. In continue mode, the detector
// tracks markers across multiple frames.
detector.setContinueMode(true);

 var glCanvas = document.createElement('canvas');
    glCanvas.style.webkitTransform = 'scale(-1.0, 1.0)';
    glCanvas.width = 960;
    glCanvas.height = 720;
    var s = glCanvas.style;
    document.body.appendChild(glCanvas);
    display = new Magi.Scene(glCanvas);
    display.drawOnlyWhenChanged = true;

// Copy the camera perspective matrix from the FLARParam to the WebGL library camera matrix.
// The second and third parameters determine the zNear and zFar planes for the perspective matrix.
param.copyCameraMatrix(display.camera.perspectiveMatrix, 10, 10000);

var video = document.createElement('video');
video.width = 320;
video.height = 240;


// Using GetUserMedia to Access the Webcam
var getUserMedia = function (t, onsuccess, onerror) {
	if(navigator.getUserMedia) {
		return navigator.getUserMedia(t, onsuccess, onerror);
	} else if (navigator.webkitGetUserMedia) {
		return navigator.webkitGetUserMedia(t, onsuccess, onerror);
	} else if (navigator.mozGetUserMedia) {
		return navigator.mozGetUserMedia(t, onsuccess, onerror);
	} else if (navigator.msGetUserMedia) {
		return navigator.msGetUserMedia(t, onsuccess, onerror);
	} else {
		onerror(new Error("No getUserMedia implementation found."));
	}
};

var URL = window.URL || window.webkitURL;
var createObjectURL = URL.createObjectURL || webkitURL.createObjectURL;
if(!createObjectURL) {
	throw new Error("URL.createObjectURL not found");
}

getUserMedia({"video": true},
			function (stream) {
				var url = createObjectURL(stream);
				video.src = url;
			},
			function(error) {
				alert("Couldn't access webcam.");
			});

context.drawImage(video, 0, 0, 320, 240);
canvas.changed = true;

var threshold = 128;
var markerCount = detector.detectMarkerLite(raster, threshold);

var resultMatrix = new NyARTransMatResult();
var markers = {};

for(var idx = 0; idx < markerCount; idx++) {
	var id = detector.getIdMarkerData(idx);
	var currId = -1;
	if (id.packetLength <= 4) {
		currId = 0;
		for (var i = 0; i < id.packetLength; i++) {
			currId = (currId << 8) | id.getPacketData(i);
		}
	}

	if (markers[currId] === null) {
		markers[currId] = {};
	}

	detector.getTransformMatrix(idx, resultMatrix);

	markers[currId].transform = Object.asCopy(resultMatrix);
}

function copyMarkerMatrix(arMat, glMat) {
	glMat[0] = arMat.m00;
	glMat[1] = -arMat.m10;
	glMat[2] = arMat.m20;
	glMat[3] = 0;
	glMat[4] = arMat.m01;
	glMat[5] = -arMat.m11;
	glMat[6] = arMat.m21;
	glMat[7] = 0;
	glMat[8] = arMat.m02;
	glMat[9] = -arMat.m12;
	glMat[10] = arMat.m22;
	glMat[11] = 0;
	glMat[12] = arMat.m03;
	glMat[13] = -arMat.m13;
	glMat[14] = arMat.m23;
	glMat[15] = 1;
}
