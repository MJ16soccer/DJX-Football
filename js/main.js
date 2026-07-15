const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
const lightbox = document.querySelector("[data-lightbox]");
const galleryBanner = document.querySelector("[data-gallery-banner]");
const galleryFilters = Array.from(document.querySelectorAll("[data-gallery-filter]"));
const gallerySections = Array.from(document.querySelectorAll("[data-gallery-category]"));

galleryItems.forEach((item) => {
  const photo = item.querySelector("img");
  const caption = document.createElement("span");
  caption.className = "gallery-caption";
  caption.textContent = photo.alt;
  item.appendChild(caption);
});

galleryFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const category = filter.dataset.galleryFilter;
    galleryFilters.forEach((button) => {
      const isSelected = button === filter;
      button.classList.toggle("is-active", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
    gallerySections.forEach((section) => {
      section.hidden = category !== "all" && section.dataset.galleryCategory !== category;
    });
  });
});


function updateHeader() {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 24);
}

if (galleryBanner) {
  const bannerSlides = Array.from(galleryBanner.querySelectorAll(".gallery-banner-slide"));
  const bannerDots = Array.from(galleryBanner.querySelectorAll(".gallery-banner-dots span"));
  let activeBannerSlide = 0;
  let bannerTimer;

  function showBannerSlide(index) {
    activeBannerSlide = (index + bannerSlides.length) % bannerSlides.length;
    bannerSlides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === activeBannerSlide));
    bannerDots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === activeBannerSlide));
  }

  function startBannerTimer() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.clearInterval(bannerTimer);
    bannerTimer = window.setInterval(() => showBannerSlide(activeBannerSlide + 1), 5000);
  }

  galleryBanner.querySelector("[data-banner-prev]").addEventListener("click", () => {
    showBannerSlide(activeBannerSlide - 1);
    startBannerTimer();
  });
  galleryBanner.querySelector("[data-banner-next]").addEventListener("click", () => {
    showBannerSlide(activeBannerSlide + 1);
    startBannerTimer();
  });
  galleryBanner.addEventListener("mouseenter", () => window.clearInterval(bannerTimer));
  galleryBanner.addEventListener("mouseleave", startBannerTimer);
  startBannerTimer();
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    document.body.classList.toggle("nav-open", nav.classList.contains("open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      document.body.classList.remove("nav-open");
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

revealItems.forEach((item) => observer.observe(item));

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "Message ready. Connect this form to your preferred email or form service.";
    contactForm.reset();
  });
}

if (galleryItems.length && lightbox) {
  const viewerImage = lightbox.querySelector("[data-lightbox-image]");
  const caption = lightbox.querySelector("[data-lightbox-caption]");
  const count = lightbox.querySelector("[data-lightbox-count]");
  let currentPhoto = 0;
  let lastFocusedItem = null;
  let activeLightboxItems = galleryItems;

  function showPhoto(index) {
    currentPhoto = (index + activeLightboxItems.length) % activeLightboxItems.length;
    const photo = activeLightboxItems[currentPhoto].querySelector("img");
    viewerImage.classList.remove("is-loaded");
    viewerImage.src = photo.currentSrc || photo.src;
    viewerImage.alt = photo.alt;
    caption.textContent = photo.alt;
    count.textContent = `${currentPhoto + 1} / ${activeLightboxItems.length}`;
    if (viewerImage.complete) requestAnimationFrame(() => viewerImage.classList.add("is-loaded"));
  }

  function openLightbox(item) {
    lastFocusedItem = item;
    activeLightboxItems = galleryItems.filter((galleryItem) => !galleryItem.closest("[data-gallery-category]")?.hidden);
    showPhoto(activeLightboxItems.indexOf(item));
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightbox.querySelector(".lightbox-close").focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (lastFocusedItem) lastFocusedItem.focus();
  }

  viewerImage.addEventListener("load", () => viewerImage.classList.add("is-loaded"));
  galleryItems.forEach((item) => item.addEventListener("click", () => openLightbox(item)));
  lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", () => showPhoto(currentPhoto - 1));
  lightbox.querySelector("[data-lightbox-next]").addEventListener("click", () => showPhoto(currentPhoto + 1));
  lightbox.querySelectorAll("[data-lightbox-close]").forEach((button) => button.addEventListener("click", closeLightbox));

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
    if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
  });
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
