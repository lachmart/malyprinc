var lp_action = function () {};

/*
    Main action to open logbook
 */
lp_action.go_to_deck_logbook = function() {
    if (!lp_space.is_displayed_activity()) {
        location.href = "http://www.malyprincolomouc.cz.neuron.blueboard.cz/denik/";
    }
};

lp_action.go_to_live_support_system = function() {
    location.href = "http://www.malyprincolomouc.cz.neuron.blueboard.cz/denik/zivot";
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

// Main onload initialization
window.addEventListener("load", function(){
    lp_space.init();
});