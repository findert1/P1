var context = new AudioContext()
var o = context.createOscillator()
o.type = "sine"
o.connect(context.destination)
o.start()