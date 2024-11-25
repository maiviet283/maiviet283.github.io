// Tạo các bông tuyết
function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    document.body.appendChild(snowflake);

    // Kích thước và vị trí ngẫu nhiên
    const size = Math.random() * 10 + 5;
    snowflake.style.width = `${size}px`;
    snowflake.style.height = `${size}px`;
    snowflake.style.left = `${Math.random() * 100}vw`;

    // Tốc độ rơi ngẫu nhiên
    const fallDuration = Math.random() * 5 + 3;
    snowflake.style.animationDuration = `${fallDuration}s`;

    // Sau khi rơi xong, xóa khỏi DOM
    snowflake.addEventListener('animationend', () => {
        snowflake.remove();
    });
}

// Tạo tuyết liên tục
setInterval(createSnowflake, 100);
