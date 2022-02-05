window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (event.target.classList.contains('general-form-close-button')) {
      event.target.parentNode.parentNode.parentNode.style.display = 'none';
    }

    if (event.target.classList.contains('general-form-outer-wrapper')) {
      event.target.style.display = 'none';
    }
  })
});
