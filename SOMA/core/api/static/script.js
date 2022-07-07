//(function(){
'use strict'

let constraints = {
    audio: true,
};
let recording=false;
let recorder;
let audioStream = null;
let audioData;
let audioContext = null;
let csrftoken = getCookie('csrftoken');
let socket = null;
let interval;

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

let recordAudio;
function startRecording() {
    $("#file").val("");
    if (navigator.mediaDevices.getUserMedia === undefined) {
        displayError("This browser doesn't support getUserMedia.");
    }
    recording=true

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.getUserMedia(
          {
            audio: true,
          },
          function (stream) {
            recordAudio = RecordRTC(stream, {
              type: "audio",

              //6)
              mimeType: "audio/wav",
              sampleRate: 44100,
              // used by StereoAudioRecorder
              // the range 22050 to 96000.
              // let us force 16khz recording:
              desiredSampRate: 16000,

              // MediaStreamRecorder, StereoAudioRecorder, WebAssemblyRecorder
              // CanvasRecorder, GifRecorder, WhammyRecorder
              recorderType: StereoAudioRecorder,
              // Dialogflow / STT requires mono audio
              numberOfAudioChannels: 1,

              // 1)
              timeSlice: 7000,

              // 2)
              // as soon as the stream is available
              ondataavailable: function (blob) {
                // 3
                // making use of socket.io-stream for bi-directional
                // streaming, create a stream
                if (recording) {
                    audioData=new File([blob],"blob.wav")
                    submitToServer()
                    console.log("dentr")

                }
              },
            });

            recordAudio.startRecording();
          },
          function (error) {
            console.error(JSON.stringify(error));
          }
        );
      }
    };

function stopRecording() {

    recording=false
}

function submitToServer() {
    if (audioData == null) {
        displayError("There is no audio data here!");
        return;
    }console.log(audioData)

    $('#error-panel').hide();
    $('#progress-panel').show();
    $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
    $('.progress-bar').animate({
        width: "100%"
    }, 1500);
    $.ajax({
        url: "/stt/handleaudio/",
        type: "POST",
        contentType: 'application/octet-stream',
        data: audioData,
        processData: false,
        headers: {
            'X-CSRFTOKEN': csrftoken
        },
        success: function (response) {
            $('#result').text(response);
            $('#progress-panel').hide();
        },
        error: function (response) {
            $('#result').text(response.responseText);
            $('#progress-panel').hide();
        }
    });
    recordAudio.stopRecording()
}

var openFile = function (event) {
    var input = event.target;
    var isValid = checkValidity(input.files[0]);
    if (!isValid) {
        displayError("Only wav file type allowed.");
        return;
    }
    var url = URL.createObjectURL(input.files[0]);
    var mt = document.createElement('audio');
    audioData = input.files[0];
    console.log(audioData)
    mt.controls = true;
    mt.src = url;
    $('#player')[0].innerHTML = "";
    $('#player').append(mt);
};

function checkValidity(file) {
    var isValid = false;
    var allowedFileTypes = ['audio/x-wav', 'audio/wav'];
    isValid = allowedFileTypes.includes(file.type);
    return isValid;
}

function displayError(errorMsg) {
    $('#error-panel').addClass('alert-danger');
    $('#error-message').text(errorMsg);
    $('#error-panel').show();
}

$(window).on('load', function () {
    $("#file").val("");
    $("#file").change(openFile);
});

//})())
