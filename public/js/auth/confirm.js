let processingRequest = false;
let expUnixTime, autoSendIsMade = false;

function countDownLeftTime() {
  document.getElementById('time-left').innerHTML = `Time Left: 0${Math.max(0, Math.floor((expUnixTime - ((new Date).getTime())) / 1000 / 60))}:${Math.max(0, (Math.floor((expUnixTime - ((new Date).getTime())) / 1000)) % 60 ) <= 9 ? '0' : ''}${Math.max(0, (Math.floor((expUnixTime - ((new Date).getTime())) / 1000)) % 60 )}`;
  
  if ((new Date).getTime() > expUnixTime) {
    document.getElementById('form-error').innerHTML = 'The last code you have received is expired. Please reload the page to get a new email.';
    autoSendIsMade = true;
    processingRequest = true;
    document.getElementById('confirm-button').style.opacity = '0.5';
    document.getElementById('confirm-button').style.cursor = 'not-allowed';
  } else {
    setTimeout(() => {
      countDownLeftTime();
    }, 500);
  }
}

function getCode() {
  const codeInputs = document.querySelectorAll('.each-code-input');
  let code = "";

  for (let i = 0; i < codeInputs.length; i++)
    code += codeInputs[i].value;

  return code;
}

function confirmCode() {
  const code = getCode();

  if (isNaN(parseInt(code)) || !parseInt(code) || code.length != 6)
    return;

  if (processingRequest)
    return;

  processingRequest = true;
  document.getElementById('confirm-button').style.opacity = '0.5';
  document.getElementById('confirm-button').style.cursor = 'not-allowed';

  serverRequest('/auth/confirm', 'POST', { code }, res => {
    if (res.success)
      return window.location.reload();

    processingRequest = false;
    document.getElementById('confirm-button').style.opacity = '1';
    document.getElementById('confirm-button').style.cursor = 'pointer';

    if (res.error == 'bad_request')
      document.getElementById('form-error').innerHTML = 'Please check the code you wrote and try again';
    else if (res.error == 'request_timeout')
      document.getElementById('form-error').innerHTML = 'The code you have received is expired. Please reload the page to get a new email';
    else
      document.getElementById('form-error').innerHTML = 'An unknown error occured. Please try again later or contact us at info@usersmagic.com';
  });
}

window.addEventListener('load', () => {
  expUnixTime = isNaN(parseInt(document.getElementById('exp-unix-time').innerHTML)) ? 0 : parseInt(document.getElementById('exp-unix-time').innerHTML);

  countDownLeftTime();
  
  document.addEventListener('input', event => {
    if (event.target.parentNode.id == 'code-input-wrapper') {
      const input = event.target;

      if (isNaN(parseInt(input.value)) || parseInt(input.value) < 0 || parseInt(input.value) > 9)
        input.value = '';

      if (input.value.length) {
        if (input.nextElementSibling)
          input.nextElementSibling.focus();
        else if (!autoSendIsMade) {
          autoSendIsMade = true;
          confirmCode();
        }
      }
    }
  });

  document.addEventListener('keydown', event => {
    if (event.target.parentNode.id == 'code-input-wrapper') {
      const input = event.target;
      const key = event.key;

      if (!input.value.length && key == 'Backspace' && input.previousElementSibling)
        input.previousElementSibling.focus();
    }
  });

  document.addEventListener('submit', event => {
    if (event.target.id == 'confirm-form') {
      event.preventDefault();

      confirmCode();
    }
  });
});
