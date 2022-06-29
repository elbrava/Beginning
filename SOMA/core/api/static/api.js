let control_element = document.querySelector(".control");
let f;
let socket=io("http://127.0.0.1:8000");
socket.on("connect", () => {
    alert("conneccted"); // true
});

socket.on("disconnect", () => {
    alert("Disconnected")
})
let recording= true;
socket.on("sig",(m)=>{
    control_element.innerHTML(m.data)
})
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.getUserMedia({
        audio: true
    }, function (stream) {
        recordAudio = RecordRTC(stream, {
            type: 'audio',

            //6)
            mimeType: 'audio/webm',
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
            timeSlice: ,

            // 2)
            // as soon as the stream is available
            ondataavailable: function (blob) {

                // 3
                // making use of socket.io-stream for bi-directional
                // streaming, create a stream
                if (recording) {

                   socket.emit("sig",blob)
                }
            }
        });

    }, function (error) {
        console.log(error);
    });
};
