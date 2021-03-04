function Toaster() {
  const activeToastNotification = document.getElementById("toast-notification");
  const activeToastMessage = document.getElementById("toast-message");
  const activeToastNotificationClose = document.getElementById(
    "toast-notification-close"
  );
  const defaultFadeTimeout = 2700;
  const defaultResumeTimeout = 2000;
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
  this.defaultCycle = () => {
    this.toastCycle(defaultFadeTimeout, defaultResumeTimeout);
  };
  this.toastCycle = (hideTimeout, resumeTimeout) => {
    const fadeTimer = new Timer(() => {
      if (activeToastNotification.classList.contains("toast-notification-on"))
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
  this.doToast = (message, type, hideTimeout, resumeTimeout) => {
    if (type) {
      activeToastNotification.classList.add(`toast-${type.toLowerCase()}`);
    }
    activeToastMessage.innerHTML = message;
    activeToastNotification.classList.add("toast-notification-on");
    this.toastCycle(hideTimeout, resumeTimeout);
  };
  this.defaultToast = (message, type) => {
    this.doToast(message, type, defaultFadeTimeout, defaultResumeTimeout);
  };
  this.doPageToast = () => {
    if (activeToastNotification != undefined) this.defaultCycle();
  };
}
new Toaster().doPageToast();
