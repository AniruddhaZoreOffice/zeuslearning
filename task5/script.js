function toggleRadio() {
  const radioBtn = document.getElementById('radio-btn');
  const currentSrc = radioBtn.getAttribute('src');

  if (currentSrc.includes('icons\radio-button-on.svg')) {
    radioBtn.setAttribute('src', 'icons\radio-button-on.svg');
  } else {
    radioBtn.setAttribute('src', 'icons\radio-button-off.svg');
  }
}

function togglePassword() {
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.src = 'icons/preview.svg'; 
  } else {
    passwordInput.type = 'password';
    eyeIcon.src = 'icons/preview.svg'; }
}