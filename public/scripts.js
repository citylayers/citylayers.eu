/*const slider = document.querySelector(".slider");
const slides = document.querySelectorAll(".slide");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let currentIndex = 0;

function getSlideWidth() {
    return document.querySelector(".slider-container").offsetWidth / 2;
}

nextBtn.addEventListener("click", () => {
    if (currentIndex < slides.length - 2) {
        currentIndex++;
    } else {
        currentIndex = 0; // Loop back to start
    }
    updateSlider();
});

prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = slides.length - 2; // Loop back to last viewable set
    }
    updateSlider();
});

function updateSlider() {
    const offset = currentIndex * -getSlideWidth();
    slider.style.transform = `translateX(${offset}px)`;
}

// Adjust slider on window resize
window.addEventListener("resize", updateSlider);
*/

const scrollIntoViewWithOffset = (selector, offset) => {
  window.scrollTo({
    behavior: 'smooth',
    top:
      document.querySelector(selector).getBoundingClientRect().top -
      document.body.getBoundingClientRect().top -
      offset,
  })
}

document.addEventListener("DOMContentLoaded", function () {
  const swiperContainer = document.querySelector(".projects-slider");

  if (!swiperContainer) {
    console.error("Swiper container not found!");
    return;
  }

  const swiper = new Swiper(".projects-slider", {
    slidesPerView: 1,
    loop: true,
    navigation: {
      nextEl: ".projects-slider-button-next",
      prevEl: ".projects-slider-button-prev",
    },
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const swiperContainer = document.querySelector(".acc-slider");

  if (!swiperContainer) {
    console.error("Swiper container not found!");
    return;
  }

  const swiper = new Swiper(".acc-slider", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    navigation: {
      nextEl: ".acc-slider-button-next",
      prevEl: ".acc-slider-button-prev",
    },
    breakpoints: {
      600: {
        slidesPerView: 2,
      },
    },
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const SwiperContainer = document.querySelector(".sponsors-slider");

  if (!SwiperContainer) {
    console.error("Swiper container not found!");
    return;
  }

  const swiper = new Swiper(".sponsors-slider", {
    slidesPerView: 2,
    spaceBetween: 20,
    loop: true,
    speed: 3000,
    freeMode: true,
    allowTouchMove: false,
    preventClicks: true,
    simulateTouch: false,
    cssMode: false,
    preventClicksPropagation: true,
    autoplay: {
      delay: 0,
    },
    breakpoints: {
      600: {
        slidesPerView: 5,
      },
    },
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const SwiperContainer = document.querySelector(".fade-slider");

  if (!SwiperContainer) {
    console.error("Swiper container not found!");
    return;
  }

  const swiper = new Swiper(".fade-slider", {
    effect: "fade",
    fadeEffect: { crossFade: true },
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    speed: 1000,
    allowTouchMove: false,
    preventClicks: true,
    preventClicksPropagation: true,
    autoHeight: false,
    navigation: {
        nextEl: ".fade-slider-button-next",
        prevEl: ".fade-slider-button-prev",
    },
  });
});

function adjustHeaderAndNav() {
  const header = document.querySelector(".header");
  const heroSection = document.querySelector(".hero");
  const navSection = document.querySelector(".nav-links");
  const isMobile = window.innerWidth <= 768;

  if (header && heroSection) {
    const headerHeight = header.offsetHeight;
        heroSection.style.marginTop = `${headerHeight}px`;
        navSection.style.top = `${headerHeight}px`;
    /*
    if (isMobile) {
        heroSection.style.marginTop = `${headerHeight}px`;
        navSection.style.top = `${headerHeight}px`;
    } else {
        heroSection.style.marginTop = 'unset';
    }
    */
  } else {
    console.error("Header or hero section not found!");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks = document.querySelector(".nav-links");

  if (!hamburgerMenu || !navLinks) {
    console.error("Hamburger menu or nav links not found!");
    return;
  }

  hamburgerMenu.addEventListener("click", function () {
    navLinks.classList.toggle("active");
    hamburgerMenu.classList.toggle("active");
  });

    adjustHeaderAndNav();
});

window.addEventListener("resize", function () {
    adjustHeaderAndNav();
});
