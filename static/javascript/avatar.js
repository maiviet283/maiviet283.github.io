
const avatarImages = [
    "images/avatars/avatar1.jpg",
    "images/avatars/avatar2.jpg",
    "images/avatars/avatar3.jpg",
    "images/avatars/avatar4.jpg",
    "images/avatars/avatar5.jpg",
    "images/avatars/avatar6.jpg"
];

let currentAvatar = 0;
const avatarElement = document.getElementById("avatar-image");

setInterval(() => {
    avatarElement.style.opacity = 0;
    setTimeout(() => {
        currentAvatar = (currentAvatar + 1) % avatarImages.length;
        avatarElement.src = avatarImages[currentAvatar];
        avatarElement.style.opacity = 1;
    }, 300); // thời gian fade out trước khi thay ảnh
}, 2000);
