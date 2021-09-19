let processingRequest = false;

window.addEventListener('load', () => {
  const loginForm = document.getElementById('login-form');
  const formError = document.getElementById('form-error');
  const loginButton = document.getElementById('login-button');

  loginForm.onsubmit = event => {
    event.preventDefault();

    if (processingRequest)
      return;

    processingRequest = true;
    loginButton.style.opacity = '0.5';
    loginButton.style.cursor = 'not-allowed';

    serverRequest('/auth/login', 'POST', {
      email: document.getElementById('email-input').value,
      password: document.getElementById('password-input').value
    }, res => {
      if (res.success)
        return window.location = res.redirect || '/';

      processingRequest = false;
      loginButton.style.opacity = '1';
      loginButton.style.cursor = 'pointer';

      if (res.error == 'document_not_found')
        return formError.innerHTML = 'This account does not exist';
      else if (res.error == 'password_verification')
        return formError.innerHTML = 'Your password does not match';
      else
        return formError.innerHTML = 'An unknown error occurred, please try again later';
    })
  }
});
