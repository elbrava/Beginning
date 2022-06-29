import json
import subprocess
import wave
from shlex import quote, shlex

import librosa
import numpy as np
from pydub import AudioSegment
from stt import Model
from timeit import default_timer as timer

desired_sample_rate = None
ds = None


def words_from_candidate_transcript(metadata):
    word = ""
    word_list = []
    word_start_time = 0
    # Loop through each character
    for i, token in enumerate(metadata.tokens):
        # Append character to word if it's not a space
        if token.text != " ":
            if len(word) == 0:
                # Log the start time of the new word
                word_start_time = token.start_time

            word = word + token.text
        # Word boundary is either a space or the last character in the array
        if token.text == " " or i == len(metadata.tokens) - 1:
            word_duration = token.start_time - word_start_time

            if word_duration < 0:
                word_duration = 0

            each_word = dict()
            each_word["word"] = word
            each_word["start_time"] = round(word_start_time, 4)
            each_word["duration"] = round(word_duration, 4)

            word_list.append(each_word)
            # Reset
            word = ""
            word_start_time = 0

    return word_list


def metadata_json_output(metadata):
    json_result = dict()
    json_result["transcripts"] = [
        {
            "confidence": transcript.confidence,
            "words": words_from_candidate_transcript(transcript),
        }
        for transcript in metadata.transcripts
    ]
    return json.dumps(json_result, indent=2)


def metadata_to_string(metadata):
    return "".join(token.text for token in metadata.tokens)


def main(model, scorer, beam_width=None, lm_beta=None, lm_alpha=None):
    global ds, desired_sample_rate
    model_load_start = timer()
    ds = Model(model)
    # sphinx-doc: python_ref_model_stop
    model_load_end = timer() - model_load_start
    print("Loaded model in {:.3}s.".format(model_load_end))

    if beam_width:
        ds.setBeamWidth(beam_width)

    desired_sample_rate = ds.sampleRate()

    if scorer:
        print("Loading scorer from files {}".format(scorer))
        scorer_load_start = timer()
        ds.enableExternalScorer(scorer)
        scorer_load_end = timer() - scorer_load_start
        print("Loaded scorer in {:.3}s.".format(scorer_load_end))

        if lm_alpha and lm_beta:
            ds.setScorerAlphaBeta(lm_alpha, lm_beta)


def speech(audio, json=None, extended=None, hot_words=None, candidate_transcripts=1):
    if hot_words:
        print("Adding hot-words")
        for word_boost in hot_words.split(","):
            word, boost = word_boost.split(":")
            ds.addHotWord(word, float(boost))

    fin = audio

    audio = np.frombuffer(fin, np.int16)


    print("Running inference.")
    inference_start = timer()
    # sphinx-doc: python_ref_inference_start
    if extended:
        return metadata_to_string(ds.sttWithMetadata(audio, 1).transcripts[0])
    elif json:
        return metadata_json_output(ds.sttWithMetadata(audio, candidate_transcripts))

    else:
        return ds.stt(audio)
    # sphinx-doc: python_ref_inference_stop


"""    inference_end = timer() - inference_start
    print(
        "Inference took %0.3fs for %0.3fs audio file." % (inference_end, audio_length),
    )"""

main(model=r"C:\Users\Admin\Downloads\model.tflite", scorer=r"C:\Users\Admin\Downloads\huge-vocabulary.scorer")
