const images = document.querySelectorAll(".background-carousel img");

// Pick a random index to start from
let current = Math.floor(Math.random() * images.length);
images[current].classList.add("active");

setInterval(() => {
  images[current].classList.remove("active");
  current = (current + 1) % images.length;
  images[current].classList.add("active");
}, 8000);
