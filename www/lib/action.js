var lp_action = function () {};

/*
    Main action to open logbook
 */
lp_action.go_to_deck_logbook = function() {
    if (!lp_space.is_displayed_activity()) {
        alert("TODO otevřít deník");
    }
};

lp_action.go_to_live_support_system = function() {
    alert("TODO otevřít deník na systému podpory života");
};


// https://www.w3schools.com/howto/howto_js_fullscreen.asp
/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

/* View in fullscreen */
lp_action.openFullscreen = function() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
};