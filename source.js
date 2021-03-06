function makePattern(color, bg) {
  // Create a pattern, offscreen
  const patternCanvas = document.createElement("canvas");
  const patternContext = patternCanvas.getContext("2d");

  // Make some random values using the crypto API
  var array = new Uint8Array(2);
  window.crypto.getRandomValues(array);

  // Give the pattern a width and height dependent on the array
  if (array[0] > 50) {
    array[0] = array[0] / 2;
  }
  if (array[1] > 50) {
    array[1] = array[1] / 2;
  }
  patternCanvas.width = array[0] > 15 ? array[0] / 2 : 10;
  console.log("Pattern width", patternCanvas.width);
  patternCanvas.height = array[1] > 5 ? array[1] / 2 : 10;
  console.log("Pattern height:", patternCanvas.height);

  // Give the pattern a background color and draw an arc
  if (bg) {
    patternContext.fillStyle = bg;
  }
  patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
  patternContext.arc(0, 0, 10, 0, Math.sin(array[0]) * 2);
  patternContext.strokeStyle = color;
  patternContext.stroke();
  patternContext.arc(0, 0, 25, 0, Math.cos(array[1]) * 2);
  patternContext.stroke();
  patternContext.arc(0, 0, 25, 0, Math.cos(array[0]) * 2);
  patternContext.stroke();
  patternContext.arc(0, 0, 25, 0, Math.sin(array[1]) * 2);
  patternContext.stroke();
  return patternCanvas;
}
function drawViz(randomness) {
  // Sample randomness: 14cc25f8c8b7ffa8b47a036030f2d7ad0e97775a61c12752ad900d58de995a7e
  const regex = /[a-z]/gi;
  const colorRegex = /[g-z]/gi;
  // Generate a number from the random value
  var rNum = randomness.replaceAll(regex, "");
  // Generate a color from the random value
  var color = "#" + randomness.replaceAll(colorRegex, "").slice(0, 6);
  var color2 = "#" + randomness.replaceAll(colorRegex, "").slice(3, 9);
  console.log("Color:", color);

  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    const pattern = ctx.createPattern(makePattern(color, "#eee"), "repeat");
    ctx.fillStyle = pattern;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
  }
}

document.getElementById("stop").addEventListener("click", function(e) {
  if (cancelPoll) {
    cancelPoll = false;
    e.target.textContent = "Stop changing";
    poll();
  } else {
    cancelPoll = true;
    e.target.textContent = "Start changing";
  }
});

// A global variable so we can abort the polling
var cancelPoll = false;
var interval = 5;
// set a window timeout to update the pattern based
// on the value of data
function poll() {
  console.log("starting polling every " + interval + " seconds");
  var randomness = "ff0000"; // default, but we should get the fetch on the first go
  var start = 0;
  const runPoll = function() {
    if (cancelPoll) {
      console.log("Stopping polling");
      return;
    }
    // Every minute, run fetch. There are 12 5-sec intervals in one minute
    if (start == 0) {
      fetch("https://drand.cloudflare.com/public/latest")
        .then(response => response.json())
        .then(data => {
          // Have the random data, run an update function
          console.log("Drand value: ", data.randomness);
          randomness = data.randomness;
          drawViz(randomness);
          setTimeout(runPoll, interval * 1000);
        });
    } else {
      drawViz(randomness);
      setTimeout(runPoll, interval * 1000);
    }
    start++;
    if (start == 12) {
      start = 0;
    }
    console.log(start)
  };
  return runPoll();
}

poll();
