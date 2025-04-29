import io
import subprocess
import imageio_ffmpeg as ffmpeg

def convert_wav_to_mp3(wav_data: bytes) -> bytes:
    input_wav_io = io.BytesIO(wav_data)
    input_wav_io.seek(0)

    # Build FFmpeg command
    command = [
        ffmpeg.get_ffmpeg_exe(),
        "-i", "pipe:0",
        "-f", "mp3",
        "-codec:a", "libmp3lame",
        "pipe:1"
    ]

    # Run the command
    process = subprocess.Popen(
        command,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    mp3_data, error = process.communicate(input=input_wav_io.read())

    if process.returncode != 0:
        raise RuntimeError(f"FFmpeg conversion failed: {error.decode()}")

    return mp3_data
