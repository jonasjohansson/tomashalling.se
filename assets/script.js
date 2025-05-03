const carousel = document.querySelector(".background-carousel");
const images = Array.from(carousel.querySelectorAll("img"));

// Shuffle images using Fisher-Yates
for (let i = images.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [images[i], images[j]] = [images[j], images[i]];
}

// Re-append in shuffled order
images.forEach((img) => carousel.appendChild(img));

// Pick a random starting index
let current = Math.floor(Math.random() * images.length);
images[current].classList.add("active");

// Function to go to the next image
function nextImage() {
  images[current].classList.remove("active");
  current = (current + 1) % images.length;
  images[current].classList.add("active");
}

// Start the timer
let interval = setTimeout(() => {
  nextImage();
  interval = setInterval(nextImage, 12000);
}, 12000);

// Manual change
function userNextImage() {
  clearTimeout(interval);
  clearInterval(interval);
  nextImage();
  interval = setInterval(nextImage, 12000);
}

document.addEventListener("click", userNextImage);
document.addEventListener("touchstart", userNextImage);
