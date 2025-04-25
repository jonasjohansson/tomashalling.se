const images = document.querySelectorAll(".background-carousel img");

// Pick a random starting index
let current = Math.floor(Math.random() * images.length);
images[current].classList.add("active");

// Function to go to the next image
function nextImage() {
  images[current].classList.remove("active");
  current = (current + 1) % images.length;
  images[current].classList.add("active");
}

// Start the timer **only after initial random image is shown**
let interval = setTimeout(() => {
  nextImage();
  interval = setInterval(nextImage, 12000);
}, 12000);

// Also change on click or tap
function userNextImage() {
  clearTimeout(interval);
  clearInterval(interval);
  nextImage();
  interval = setInterval(nextImage, 12000);
}

document.addEventListener("click", userNextImage);
document.addEventListener("touchstart", userNextImage);
