window.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("bg-music");
  const toggleBtn = document.getElementById("toggle-audio");
  const volumeSlider = document.getElementById("volume-slider");
  let isPlaying = false;

  const updateIcon = () => {
    const icon = toggleBtn.querySelector("i");
    icon.className = isPlaying ? "fas fa-volume-up" : "fas fa-volume-mute";
  };

  // Chỉ phát khi có tương tác đầu tiên
  const allowPlay = () => {
    music.muted = false;
    music.volume = parseFloat(volumeSlider.value);
    music.play();
    isPlaying = true;
    updateIcon();
    document.removeEventListener("click", allowPlay);
  };
  document.addEventListener("click", allowPlay);

  toggleBtn.addEventListener("click", () => {
    if (music.paused) {
      music.play();
      isPlaying = true;
    } else {
      music.pause();
      isPlaying = false;
    }
    updateIcon();
  });

  volumeSlider.addEventListener("input", () => {
    music.volume = parseFloat(volumeSlider.value);
  });
});
