const activeToastNotification = document.getElementById("toast-notification");
const defaultToastTimeout = 2700;
const resumeFadeTimeout = 10000;
function Timer(cb, delay) {
  let timerId,
    start,
    remaining = delay;

  this.pause = () => {
    window.clearTimeout(timerId);
    remaining -= Date.now() - start;
  };

  this.resume = () => {
    start = Date.now();
    window.clearTimeout(timerId);
    timerId = window.setTimeout(cb, remaining);
  };
  this.restart = () => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(cb, start);
  };
  this.stop = () => {
    window.clearTimeout(timerId);
  };

  this.resume();
}

// Do some stuff...
const fadeTimer = new Timer(() => {
  activeToastNotification.classList.add("toast-notification-off");
}, defaultToastTimeout);
const resumeTimer = new Timer(() => {
  fadeTimer.restart();
}, resumeFadeTimeout);
resumeTimer.pause();

activeToastNotification.addEventListener("mouseover", (event) => {
  fadeTimer.stop();
  resumeTimer.stop();
});
activeToastNotification.addEventListener("mouseleave", (event) => {
  resumeTimer.restart();
});

activeToastNotification.addEventListener("click", (event) => {
  fadeTimer.stop();
  resumeTimer.stop();
});
