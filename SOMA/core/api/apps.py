from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'


# These constants control the beam search decoder

# Beam width used in the CTC decoder when building candidate transcriptions
from stt import Model

BEAM_WIDTH = 500

# The alpha hyperparameter of the CTC decoder. Language Model weight
LM_ALPHA = 0.75

# The beta hyperparameter of the CTC decoder. Word insertion bonus.
LM_BETA = 1.85

# These constants are tied to the shape of the graph used (changing them changes
# the geometry of the first layer), so make sure you use the same constants that
# were used during training

# Number of MFCC features to use
# N_FEATURES = 26

# Size of the context window used for producing timesteps in the input vector
# N_CONTEXT = 9


import wave
from io import BytesIO

import ffmpeg
import numpy as np



def normalize_audio(audio):
    out, err = (
        ffmpeg.input("pipe:0")
            .output(
            "pipe:1",
            f="WAV",
            acodec="pcm_s16le",
            ac=1,
            ar="16k",
            loglevel="error",
            hide_banner=None,
        )
            .run(input=audio, capture_stdout=True, capture_stderr=True)
    )
    if err:
        raise Exception(err)
    return out


class SpeechToTextEngine:
    def __init__(self, model_path, scorer_path):
        self.model = Model(model_path)
        self.model.enableExternalScorer(scorer_path)
        self.model.setScorerAlphaBeta(LM_ALPHA, LM_BETA)
        self.model.setBeamWidth(BEAM_WIDTH)
        print(model_path)

    def run(self, audio,sio,sid):
        audio = normalize_audio(audio)
        audio = BytesIO(audio)
        with wave.Wave_read(audio) as wav:
            audio = np.frombuffer(wav.readframes(wav.getnframes()), np.int16)
        result = self.model.stt(audio)
        print(result)
        sio.emit("sig", {"data": result}, room=sid)


model = r"C:\Users\Admin\Downloads\model.tflite"
scorer = r"C:\Users\Admin\Downloads\huge-vocabulary.scorer"

s = SpeechToTextEngine(model_path=model, scorer_path=scorer)
