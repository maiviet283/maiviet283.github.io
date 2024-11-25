// Snowflake generator
function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.style.left = `${Math.random() * 100}vw`;
    snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
    snowflake.style.opacity = Math.random();
    snowflake.style.fontSize = `${Math.random() * 10 + 10}px`;
    snowflake.innerText = '❄';
    document.body.appendChild(snowflake);
  
    setTimeout(() => {
      snowflake.remove();
    }, 5000);
  }
  
  setInterval(createSnowflake, 50);
  