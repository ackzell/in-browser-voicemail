const CONTSTRAINTS = { audio: true };
const ENCODING_TYPE = 'mp3';
const ENCODE_AFTER_RECORD = true;

new Vue({
  el: '#app',
  data: {
    logData: '',
    isRecording: false,
    audios: [],
    getUserMediaStream: null,
    recorder: null,
    input: null,
    audioContext: null,
  },
  created() {},
  methods: {
    startRecording() {
      if (navigator.mediaDevices) {
        navigator.mediaDevices
          .getUserMedia(CONTSTRAINTS)
          .then((stream) => {
            this.log(
              'getUserMedia() success, stream created, initializing WebAudioRecorder...'
            );

            var AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();

            //assign to getUserMediaStream for later use
            this.getUserMediaStream = stream;
            /* use the stream */
            this.input = this.audioContext.createMediaStreamSource(stream);

            this.recorder = new WebAudioRecorder(this.input, {
              workerDir: 'js/web-audio-recorder-js-master/lib-minified/',
              encoding: ENCODING_TYPE,
              onEncoderLoading: (recorder, encoding) => {
                // show "loading encoder..." display
                this.log('Loading ' + encoding + ' encoder...');
              },
              onEncoderLoaded: (recorder, encoding) => {
                // hide "loading encoder..." display
                this.log(encoding + ' encoder loaded');
              },
              onComplete: (recorder, blob) => {
                this.log('Encoding complete');
                let url = URL.createObjectURL(blob);
                this.audios.push(url);
                // createDownloadLink(blob, recorder.encoding);
              },
            });

            this.recorder.setOptions({
              timeLimit: 300,
              encodeAfterRecord: ENCODE_AFTER_RECORD,
              mp3: {
                bitRate: 160,
              },
            });

            this.recorder.startRecording();
            this.log('Recording started');
            this.isRecording = true;
          })
          .catch((err) => {
            console.error('something went terribly wrong', err);
          });
      }
    },
    stopRecording() {
      this.isRecording = false;
      //stop microphone access
      //! can't do this, otherwise can't record further notes

      // see https://blog.addpipe.com/using-webaudiorecorder-js-to-record-audio-on-your-website/
      // I don't understand why they initialize the recording object
      // every single time a new recording is started 🤔
      this.getUserMediaStream.getAudioTracks()[0].stop();

      //tell the recorder to finish the recording (stop recording + encode the recorded audio)
      this.recorder.finishRecording();
      this.log('Recording stopped');
    },
    log(event) {
      this.logData += event + `<br>`;
    },
  },
});
