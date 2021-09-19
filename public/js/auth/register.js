const MIN_PASSWORD_LENGTH = 6;

let processingRequest = false;

window.addEventListener('load', () => {
  const registerFormOne = document.getElementById('register-form-one');
  const registerFormTwo = document.getElementById('register-form-two');

  const formOneError = document.getElementById('form-one-error');
  const formTwoError = document.getElementById('form-two-error');

  const registerButton = document.getElementById('register-button');

  document.addEventListener('submit', event => {
    formOneError.innerHTML = formTwoError.innerHTML = '';

    if (event.target.id == 'register-form-one') {
      event.preventDefault();

      registerFormOne.style.display = 'none';
      registerFormTwo.style.display = 'flex';
      document.getElementById('password-input').focus();
    }

    if (event.target.id == 'register-form-two') {
      event.preventDefault();

      if (processingRequest)
        return;

      const password = document.getElementById('password-input').value;
      const confirmPassword = document.getElementById('confirm-password-input').value;

      if (password.length < MIN_PASSWORD_LENGTH)
        return formTwoError.innerHTML = `Your password should be longer than ${MIN_PASSWORD_LENGTH} characters.`;

      if (password != confirmPassword)
        return formTwoError.innerHTML = 'Please confirm your password';

      processingRequest = true;
      registerButton.style.opacity = '0.5';
      registerButton.style.cursor = 'not-allowed';

      serverRequest('/auth/register', 'POST', {
        name: document.getElementById('company-name-input').value,
        email: document.getElementById('email-input').value,
        password
      }, res => {
        if (res.success)
          return window.location = res.redirect || '/';

        processingRequest = false;
        registerButton.style.opacity = '1';
        registerButton.style.cursor = 'pointer';

        registerFormOne.style.display = 'flex';
        registerFormTwo.style.display = 'none';
        document.getElementById('email-input').focus();

        if (res.error == 'bad_request') {
          return formOneError.innerHTML = 'Please check the information your wrote and try again';
        } if (res.error == 'email_validation') {
          return formOneError.innerHTML = 'Please enter a valid email';
        } else if (res.error == 'duplicated_unique_field') {
          return formOneError.innerHTML = 'The email you have entered is already in use, please try another email';
        } else {
          return formOneError.innerHTML = 'An unknown error occured, please reload and try again';
        }
      })
    }
  })
});
