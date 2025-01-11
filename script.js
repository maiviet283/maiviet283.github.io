const $ = (id) => document.getElementById(id);

document.body.addEventListener('click', function () {
    const audio = $('myAudio');
    if (audio) {
        audio.muted = false; // Tắt chế độ mute
        audio.play(); // Phát âm thanh
    }
});

const $days = $('days');
const $hours = $('hours');
const $minutes = $('minutes');
const $seconds = $('seconds');
const targetDate = new Date('2025-01-29T23:59:00');

const updateTimer = () => {
    let totalInSec = Math.floor((targetDate - new Date()) / 1000);

    if (totalInSec < 0) {
        totalInSec = 0;
    }

    const seconds = totalInSec % 60;
    const minutes = Math.floor((totalInSec / 60) % 60);
    const hours = Math.floor((totalInSec / 60 / 60) % 24);
    const days = Math.floor(totalInSec / (60 * 60 * 24));

    const format = (num) => `${num}`.padStart(2, '0');

    if ($seconds) $seconds.innerText = format(seconds);
    if ($minutes) $minutes.innerText = format(minutes);
    if ($hours) $hours.innerText = format(hours);
    if ($days) $days.innerText = format(days);
};

setInterval(updateTimer, 1000);

const createSnowFlake = () => {
    const $snow = document.createElement('i');
    $snow.classList.add('fas', 'fa-snowflake', 'snowflake');

    $snow.style.left = `${Math.random() * window.innerWidth}px`;
    $snow.style.animationDuration = `${Math.random() * 3 + 2}s`;
    $snow.style.opacity = Math.random();
    $snow.style.fontSize = `${Math.random() * 10 + 5}px`;
    $snow.style.filter = 'blur(1px)';

    document.body.appendChild($snow);
    $snow.onanimationend = () => $snow.remove();

    requestAnimationFrame(createSnowFlake);
};

requestAnimationFrame(createSnowFlake);
