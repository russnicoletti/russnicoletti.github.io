var controls = document.getElementById('controls');

controls.addEventListener('play', function() {
  console.log('<fxos-media-controls>::play');
});

controls.addEventListener('pause', function() {
  console.log('<fxos-media-controls>::pause');
});

controls.addEventListener('previous', function() {
  console.log('<fxos-media-controls>::previous');
});

controls.addEventListener('next', function() {
  console.log('<fxos-media-controls>::next');
});

controls.addEventListener('startseek', function(evt) {
  console.log('<fxos-media-controls>::startseek (reverse: ' + evt.detail.reverse + ')');
});

controls.addEventListener('stopseek', function() {
  console.log('<fxos-media-controls>::stopseek');
});
