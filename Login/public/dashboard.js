const track = document.querySelector(".banner-track");
const images = document.querySelectorAll(".banner-img");

let index = 0;
let startX = 0;
let isDragging = false;

/* TOUCH */
track.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
});

track.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    handleSwipe(startX - endX);
});

/* MOUSE */
track.addEventListener("mousedown", e => {
    isDragging = true;
    startX = e.clientX;
});

track.addEventListener("mouseup", e => {
    if (!isDragging) return;
    isDragging = false;
    handleSwipe(startX - e.clientX);
});

function handleSwipe(distance) {
    if (distance > 50 && index < images.length - 1) index++;
    if (distance < -50 && index > 0) index--;
    track.style.transform = `translateX(-${index * 100}%)`;
}
