const activeToastNotification = document.getElementById("toast-notification");
const activeToastNotificationClose = document.getElementById(
  "toast-notification-close"
);
const defaultToastTimeout = 2700;
const resumeFadeTimeout = 5000;
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
    timerId = window.setTimeout(cb, delay);
  };
  this.stop = () => {
    window.clearTimeout(timerId);
  };

  this.resume();
}
// Do some stuff...
const toastCycle = (hideTimeout, resumeTimeout) => {
  const fadeTimer = new Timer(() => {
    activeToastNotification.classList.add("toast-notification-off");
  }, hideTimeout);
  const resumeTimer = new Timer(() => {
    fadeTimer.restart();
  }, resumeTimeout);
  resumeTimer.pause();
  const leaveEvent = (event) => {
    resumeTimer.restart();
  };
  activeToastNotification.addEventListener("mouseover", (event) => {
    fadeTimer.pause();
  });
  activeToastNotification.addEventListener("mouseleave", leaveEvent);
  activeToastNotification.addEventListener("click", (event) => {
    fadeTimer.stop();
    resumeTimer.stop();
    activeToastNotification.removeEventListener("mouseleave", leaveEvent);
  });
  activeToastNotificationClose.addEventListener("click", () => {
    activeToastNotification.classList.add("toast-notification-off");
  });
};
toastCycle(defaultToastTimeout, resumeFadeTimeout);
