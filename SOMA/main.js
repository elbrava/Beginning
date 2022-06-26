//post data
//words transcribe
let level = 1;
let word_element=document.querySelector(".words")
let words = "I love you.MOm loves me";
let count = 0;
let correct = 0;
let sentences = [];
let word = "";
let sentence = "";
let sentence_matr = [];
let word_count = 0;
let words_sentences=[];
let my_word_matrix = [];
let synth = window.speechSynthesis;
sentences = words.split(".")
let control_element = document.querySelector(".control");
function get() {
    if (word_count ==words_sentences.length) {
        sentence = sentences[count]
        words_sentences = sentence.split(" ")
        sentence_matr = new Array(...new Set(words_sentences))
        my_word_matrix=[]
        word_count = 0
        word = words_sentences[word_count]
        word_count++
    }
    else {
        word = sentences[word_count]
        word_count++


    }
    word_element.innerHTML=sentence

    my_word_matrix.push(sentence_matr.indexOf(word))
}
var mode = "Train";
var trials = 0;
var answer;
var err;
get();
let p = control_element
let voices = synth.getVoices();
console.log(voices)
function correctMessage(e) {
    
    correct += 1;
    get();
    let utterThis = new SpeechSynthesisUtterance(e);
    
    utterThis.voice=voices[4]
    utterThis.pitch = 0.7;
    utterThis.rate = 0.7;
    synth.speak(utterThis);
    alert(e);

}
function errorMessage(e) {
    err = true;

    correct += 1;

    get();
    let utterThis = new SpeechSynthesisUtterance(e);
    
    utterThis.voice=voices[4]
    utterThis.pitch = 0.7;
    utterThis.rate = 0.7;
    synth.speak(utterThis);
  
    alert(e);

    alert(e);
}
let words_grammar=[]
words.split(".").forEach((m)=>{
    words_grammar.push(...m.split(" "))

})
console.log(words_grammar)
let grammar = '#JSGF V1.0; grammar words; public <words> = ' + words_grammar.join(' | ') + ' ;'
let recording = true;
let SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
let SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;
let SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
let recognition = new SpeechRecognition();
let speechRecognitionList = new SpeechGrammarList();

speechRecognitionList.addFromString(grammar, 1);

if (recognition == null) {
    alert("Not Online")
}
console.log(recognition)
recognition.grammars = speechRecognitionList;
recognition.continuous = false;
recognition.lang = 'en-UK';
recognition.interimResults = false;
recognition.maxAlternatives = 1;


// This runs when the speech recognition service starts
recognition.onstart = function () {

    console.log("We are listening. Try speaking into the microphone.");
};

recognition.onend = function () {
    //var p=document.createElement("p");
    //p.classList.add("par");  
    // when user is done speaking
    function validate(t) {
        err = false;
        if (t == word) {
            correctMessage("YOUR ANSWER IS CORRECT");
            count++
        }
        else {
            trials += 1;
            console.log(trials);
        }
        if (trials == 4) {
            trials = 0;
            errorMessage(t)
            get();
            count++
        }
        if (mode === "Train" && (count-1) == level) {
            var perf = correct / count;
            alert(perf);
            document.getElementById("perf").value = perf;
            f = new FormData(document.getElementById("form1"));
            $.ajax({
                type: "post",
                url: "record",
                contentType: false,
                processData: false,
                mimeType: "multipart/form-data",

                data: f,
                success: function (res) {
                    alert(res);
                    window.location.replace("");
                },
                error: function (err) {
                    console.log("error" + err);
                },
            });
        }
    };
    recognition.onspeechend = function() {
        recognition.stop();
      }
    recognition.onnomatch = function(event) {
        diagnostic.textContent = 'I didn\'t recognize that color.';
      }
    if (recording) {
        recognition.start()
    }
    else{
    

    validate(word)
    }

}
var done;
// This runs when the speech recognition service returns result
recognition.onresult = function (event) {
    console.log(event)
    let text = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");


    var transcript = event.results[0][0].transcript;
    var spli = text.split(".")
    var confidence = event.results[0][0].confidence;
    p.innerHTML = text
    console.log(text)

}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {
            console.log(control_element.innerHTML);
            recording = false;
            var chunks = [];
            console.log(recording);
            control_element.onclick = function () {
                if (recording == true) {
                    recognition.stop()
                    recording = false;
                } else {
                    recording = true;
                    recognition.start()
                }
            };
        })
        .catch(function (err) {
            console.log(err);
        });
} else {
    console.log("not supported");
}

