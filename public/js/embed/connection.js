// This file is created for usersmagic.com server connections
// File is public, however the access is only granted through usersmagic.com TXT record verified domains
// For more information visit usersmagic.com
// The project is open source, visit https://github.com/usersmagic

window.addEventListener('load', event => {
  usersmagic();
});

function usersmagic() {
  // Constant variables
  // const URL_PREFIX = 'https://usersmagic.com/embed'; // The url the requests will be made to
  const URL_PREFIX = 'http://localhost:3000/embed';
  const COOKIE_PREFIX = 'usersmagic_'; // All cookies start with usersmagic_ prefix to avoid confusion
  const DEFAULT_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // Default cookie maxAge property, equal to 1 day
  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000, ONE_HOUR_IN_MS = 60 * 60 * 1000;

  // Global variables
  let isPopupOn = false;
  let contentOuterWrapper = null;
  let email = null;

  

  // Check the domain, call functions in necessary order
  start = function() {
    // if (window.location.hostname == 'localhost') // Not work on localhost
    //   return;

    // if (getCookie("forceEnd")) // Use forceEnd to stop all process on this client for 1h
    //   return;

    // const nextActionTime = getCookie('nextActionTime');

    // if (nextActionTime && nextActionTime > (new Date).getTime())
    //   return;

    checkConnection(res => { // Check if the domain is verified with a TXT record
      if (!res) return;

      document.addEventListener('click', event => {
        if (event.target.classList.contains('usersmagic-close-button') || event.target.parentNode.classList.contains('usersmagic-close-button'))
          closeContent();
      });

      getEmail(err => { // Get the email of user, either from cookie or input
        if (err) return throwError(err);
  
        askQuestion(err => { // Ask a question. Recursive function.
          if (err) return throwError(err);

          endContent();
        });
      });
    });
  }

  // Get questions and ask them to user on by one
  askQuestion = function(callback) {
    serverRequest('/question?email=' + email, 'GET', {}, res => {
      if (!res.success) return callback(res.error || 'unknown_error');
      if (!res.question) return callback(null);

      createContent({
        type: 'question',
        question: res.question
      }, err => {
        if (err) return callback(err);

        askQuestion(err => callback(err));
      });
    });
  }

  // Check if the domain is valid for Usersmagic
  checkConnection = function(callback) {
    serverRequest('/connection', 'GET', {}, res => callback(res.success));
  }

  // Get email of the user, either from cookie or input
  getEmail = function(callback) {
    email = getCookie("email");

    validateEmail(email, err => {
      if (!err) return callback(null);

      createContent({
        type: 'email'
      }, err => callback(err));
    });
  }

  // Create or edit the usersmagic content wrapper
  createContent = function(data, callback) {
    if (isPopupOn) {
      const contentInnerWrapper = contentOuterWrapper.childNodes[1];
      contentInnerWrapper.innerHTML = '';

      if (data.type == 'email') {
        const usersmagicTitle = document.createElement('span');
        usersmagicTitle.classList.add('usersmagic');
        usersmagicTitle.classList.add('usersmagic-title');
        usersmagicTitle.innerHTML = 'Enter your email';
        contentInnerWrapper.appendChild(usersmagicTitle);

        const usersmagicText = document.createElement('span');
        usersmagicText.classList.add('usersmagic');
        usersmagicText.classList.add('usersmagic-text');
        usersmagicText.innerHTML = 'We need your email to recognize you for your discounts. Don\'t worry, your email won\'t ever be shared with or used by any third-party. You won\'t receive any email from us either.';
        contentInnerWrapper.appendChild(usersmagicText);

        const usersmagicInput = document.createElement('input');
        usersmagicInput.type = 'email';
        usersmagicInput.autocomplete = 'none';
        usersmagicInput.classList.add('usersmagic');
        usersmagicInput.classList.add('usersmagic-input');
        usersmagicInput.id = 'usersmagic-email-input';
        usersmagicInput.placeholder = 'E-mail';
        contentInnerWrapper.appendChild(usersmagicInput);

        const usersmagicButton = document.createElement('span');
        usersmagicButton.classList.add('usersmagic');
        usersmagicButton.classList.add('usersmagic-button');
        usersmagicButton.id = 'usersmagic-approve-email-button';
        usersmagicButton.innerHTML = 'Approve';
        contentInnerWrapper.appendChild(usersmagicButton);

        document.addEventListener('click', function listenForEmailInput(event) {
          if (event.target.id == 'usersmagic-approve-email-button') {
            if (email && email.length) {
              document.removeEventListener('click', listenForEmailInput);
              return callback(null);
            }

            const emailData = document.getElementById('usersmagic-email-input').value.trim();

            validateEmail(emailData, err => {
              if (err) {
                return callback(err);
              } else {
                email = emailData.trim();
                setCookie("email", email, 7 * ONE_DAY_IN_MS);
                document.removeEventListener('click', listenForEmailInput);
                callback(null);
              }
            });
          }
        });
      } else if (data.type == 'question') {
        if (!data.question) return callback('bad_request');

        const questionText = document.createElement('span');
        questionText.classList.add('usersmagic');
        questionText.classList.add('usersmagic-question-text');
        questionText.innerHTML = data.question.text;
      } else if (data.type == 'end') {
  
      } else {
        return callback('bad_request');
      }
    } else {
      contentOuterWrapper = document.createElement('div');
      contentOuterWrapper.classList.add('usersmagic');
      contentOuterWrapper.classList.add('usersmagic-content-outer-wrapper');

      const headerWrapper = document.createElement('div');
      headerWrapper.classList.add('usersmagic');
      headerWrapper.classList.add('usersmagic-header-wrapper');

      const closeButton = document.createElement('div');
      closeButton.classList.add('usersmagic');
      closeButton.classList.add('usersmagic-close-button');

      const closeButtonI = document.createElement('i');
      closeButtonI.classList.add('usersmagic');
      closeButtonI.classList.add('fas');
      closeButtonI.classList.add('fa-times');
      closeButton.appendChild(closeButtonI);

      const closeButtonSpan = document.createElement('span');
      closeButtonSpan.classList.add('usersmagic');
      closeButton.appendChild(closeButtonSpan);

      headerWrapper.appendChild(closeButton);
      contentOuterWrapper.appendChild(headerWrapper);

      const contentInnerWrapper = document.createElement('div');
      contentInnerWrapper.classList.add('usersmagic');
      contentInnerWrapper.classList.add('usersmagic-content-inner-wrapper');

      const usersmagicTitle = document.createElement('span');
      usersmagicTitle.classList.add('usersmagic');
      usersmagicTitle.classList.add('usersmagic-title');
      usersmagicTitle.innerHTML = 'Hey there!';
      contentInnerWrapper.appendChild(usersmagicTitle);

      const usersmagicText = document.createElement('span');
      usersmagicText.classList.add('usersmagic');
      usersmagicText.classList.add('usersmagic-text');
      usersmagicText.innerHTML = 'Would you like to answer some questions to receive custom discounts on the products you interest?';
      contentInnerWrapper.appendChild(usersmagicText);

      const usersmagicButton = document.createElement('span');
      usersmagicButton.classList.add('usersmagic');
      usersmagicButton.classList.add('usersmagic-button');
      usersmagicButton.id = 'usersmagic-start-button';
      usersmagicButton.innerHTML = 'Continue';
      contentInnerWrapper.appendChild(usersmagicButton);

      contentOuterWrapper.appendChild(contentInnerWrapper);

      const footerWrapper = document.createElement('div');
      footerWrapper.classList.add('usersmagic');
      footerWrapper.classList.add('usersmagic-footer-wrapper')
      
      const footerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      footerSvg.setAttributeNS(null, 'width', '98');
      footerSvg.setAttributeNS(null, 'height', '20');
      footerSvg.setAttributeNS(null, 'viewBox', '0 0 138 30');
      footerSvg.setAttributeNS(null, 'fill', 'none');

      const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path1.setAttributeNS(null, 'd', 'M6.87299 7.75923C7.30241 6.80346 7.34387 5.24615 6.89705 3.60269C6.44986 1.95962 5.63063 0.654616 4.78326 0.0738463C4.35383 1.02962 4.31274 2.58692 4.75956 4.23038C5.20638 5.87346 6.02599 7.17846 6.87299 7.75923ZM10.8637 4.15269C11.2527 2.49385 11.1565 0.938846 10.6941 0C9.86785 0.612692 9.09451 1.94731 8.70544 3.60654C8.31637 5.26539 8.41225 6.82038 8.87462 7.75923C9.70089 7.14654 10.4746 5.81154 10.8637 4.15269ZM11.1058 11.5385C11.1058 9.63 9.6113 8.07692 7.77404 8.07692C5.93677 8.07692 4.44231 9.63 4.44231 11.5385V12.6923H11.1058V11.5385ZM7.95913 11.5385C7.88503 11.5405 7.81129 11.5271 7.74226 11.499C7.67323 11.4709 7.61031 11.4288 7.5572 11.375C7.50409 11.3213 7.46188 11.2571 7.43305 11.1861C7.40422 11.1152 7.38935 11.0389 7.38933 10.9619C7.3893 10.8849 7.40412 10.8087 7.43291 10.7377C7.46169 10.6667 7.50386 10.6025 7.55693 10.5487C7.61001 10.4949 7.6729 10.4527 7.74192 10.4246C7.81093 10.3965 7.88466 10.383 7.95876 10.385C8.10351 10.3888 8.24108 10.4513 8.34217 10.559C8.44325 10.6667 8.49985 10.8111 8.4999 10.9615C8.49995 11.112 8.44344 11.2565 8.34243 11.3642C8.24141 11.472 8.10387 11.5345 7.95913 11.5385ZM9.8101 11.5385C9.66282 11.5385 9.52158 11.4777 9.41745 11.3695C9.31331 11.2613 9.25481 11.1145 9.25481 10.9615C9.25481 10.8085 9.31331 10.6618 9.41745 10.5536C9.52158 10.4454 9.66282 10.3846 9.8101 10.3846C9.95737 10.3846 10.0986 10.4454 10.2027 10.5536C10.3069 10.6618 10.3654 10.8085 10.3654 10.9615C10.3654 11.1145 10.3069 11.2613 10.2027 11.3695C10.0986 11.4777 9.95737 11.5385 9.8101 11.5385ZM15.5481 13.8462H0V16.1538H3.33173L2.22115 30H13.3269L12.2163 16.1538H15.5481V13.8462Z');
      path1.setAttributeNS(null, 'fill', '#99D0DE');
      footerSvg.appendChild(path1);

      const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path2.setAttributeNS(null, 'd', 'M30 17.1962V9.77306H32.6632V16.7862C32.6632 17.9771 33.25 18.5725 34.4238 18.5725C35.42 18.5725 36.1795 18.1625 36.7023 17.3426V9.77306H39.395V17.5622L39.5726 20.6369H37.1905L36.939 19.202C36.1499 20.3343 34.9614 20.9004 33.3733 20.9004C32.239 20.9004 31.3908 20.5539 30.8285 19.8609C30.2762 19.1581 30 18.2699 30 17.1962ZM46.0233 18.836C46.6447 18.836 47.1182 18.714 47.4437 18.47C47.7593 18.2162 47.9171 17.8843 47.9171 17.4744C47.9171 17.0156 47.7642 16.6886 47.4585 16.4934C47.1527 16.2884 46.6053 16.1518 45.8162 16.0835C44.2972 15.9663 43.2171 15.6784 42.576 15.2196C41.925 14.7609 41.5995 14.0532 41.5995 13.0966V12.9356C41.5995 11.8131 42.0039 10.959 42.8127 10.3734C43.6215 9.79746 44.6917 9.50952 46.0233 9.50952C48.9922 9.50952 50.4767 10.7443 50.4767 13.2138V13.3163H47.8579C47.8579 12.1547 47.2464 11.5739 46.0233 11.5739C45.4611 11.5739 45.0271 11.6911 44.7213 11.9253C44.4057 12.1596 44.2479 12.4719 44.2479 12.8624C44.2479 13.2918 44.3909 13.6042 44.6769 13.7994C44.9531 13.9946 45.4808 14.1215 46.26 14.1801C47.7494 14.307 48.8443 14.5852 49.5446 15.0146C50.2548 15.4539 50.6099 16.1957 50.6099 17.2401V17.3719C50.6099 18.4651 50.2203 19.3289 49.441 19.9634C48.6618 20.5881 47.5226 20.9004 46.0233 20.9004C44.5241 20.9004 43.3848 20.5686 42.6056 19.9048C41.8362 19.2313 41.4516 18.3675 41.4516 17.3133V17.2401H44.1295C44.1295 18.3041 44.7608 18.836 46.0233 18.836ZM62.165 14.9414V16.1859H54.9153C55.0139 17.9527 55.8375 18.836 57.3861 18.836C58.0766 18.836 58.6191 18.6701 59.0136 18.3382C59.418 17.9966 59.6202 17.6013 59.6202 17.1523H62.165V17.2401C62.165 18.265 61.7409 19.1288 60.8926 19.8316C60.0443 20.5442 58.8656 20.9004 57.3565 20.9004C55.66 20.9004 54.3827 20.4026 53.5245 19.407C52.6565 18.4114 52.2226 17.0986 52.2226 15.4685V14.9414C52.2226 13.3114 52.6516 11.9985 53.5097 11.0029C54.3679 10.0073 55.6156 9.50952 57.253 9.50952C58.8706 9.50952 60.0937 10.0073 60.9222 11.0029C61.7507 11.9985 62.165 13.3114 62.165 14.9414ZM57.1938 11.5739C55.7833 11.5739 55.0238 12.4573 54.9153 14.224H59.4575C59.3687 12.4573 58.6141 11.5739 57.1938 11.5739ZM69.5183 9.50952C69.5577 9.50952 69.6169 9.5144 69.6958 9.52416C69.7747 9.52416 69.8191 9.52416 69.829 9.52416V12.1157H69.3703C68.1867 12.1157 67.3384 12.4963 66.8255 13.2577V20.6369H64.1328V12.8477L63.9404 9.77306H66.3225L66.5592 11.0908C67.2891 10.0366 68.2755 9.50952 69.5183 9.50952ZM75.9986 18.836C76.62 18.836 77.0885 18.714 77.4042 18.47C77.7297 18.2162 77.8924 17.8843 77.8924 17.4744C77.8924 17.0156 77.7395 16.6886 77.4337 16.4934C77.128 16.2884 76.5806 16.1518 75.7915 16.0835C74.2725 15.9663 73.1875 15.6784 72.5365 15.2196C71.8954 14.7609 71.5748 14.0532 71.5748 13.0966V12.9356C71.5748 11.8131 71.9743 10.959 72.7732 10.3734C73.582 9.79746 74.6572 9.50952 75.9986 9.50952C78.9675 9.50952 80.452 10.7443 80.452 13.2138V13.3163H77.8184C77.8184 12.1547 77.2118 11.5739 75.9986 11.5739C75.4364 11.5739 74.9975 11.6911 74.6818 11.9253C74.3761 12.1596 74.2232 12.4719 74.2232 12.8624C74.2232 13.2918 74.3662 13.6042 74.6522 13.7994C74.9284 13.9946 75.4561 14.1215 76.2353 14.1801C77.7247 14.307 78.8196 14.5852 79.5199 15.0146C80.2301 15.4539 80.5851 16.1957 80.5851 17.2401V17.3719C80.5851 18.4651 80.1955 19.3289 79.4163 19.9634C78.6272 20.5881 77.488 20.9004 75.9986 20.9004C74.4993 20.9004 73.3601 20.5686 72.5809 19.9048C71.8115 19.2313 71.4269 18.3675 71.4269 17.3133V17.2401H74.09C74.09 18.3041 74.7262 18.836 75.9986 18.836ZM97.8809 13.0381V20.6369H95.1881V13.448C95.1881 12.3646 94.6703 11.8228 93.6346 11.8228C92.8061 11.8228 92.1255 12.2133 91.5929 12.9941V20.6369H88.9297V13.448C88.9297 12.3646 88.402 11.8228 87.3466 11.8228C86.5082 11.8228 85.8424 12.2133 85.3492 12.9941V20.6369H82.6565V12.8477L82.4641 9.77306H84.8462L85.0681 11.1201C85.8473 10.0464 86.9619 9.50952 88.4119 9.50952C89.8026 9.50952 90.7495 10.0805 91.2526 11.2225C91.9923 10.0805 93.1316 9.50952 94.6703 9.50952C95.7257 9.50952 96.5246 9.83163 97.0671 10.4758C97.6096 11.1103 97.8809 11.9644 97.8809 13.0381ZM109.125 20.6369H106.743L106.536 19.3924C105.648 20.3978 104.455 20.9004 102.956 20.9004C101.851 20.9004 101.022 20.6027 100.47 20.0073C99.9177 19.4021 99.6415 18.6359 99.6415 17.7086V17.5037C99.6415 16.4104 99.9769 15.6149 100.648 15.1171C101.308 14.6193 102.25 14.2777 103.473 14.0922L106.27 13.6676V13.6237C106.27 12.9112 106.132 12.3938 105.856 12.0717C105.589 11.7399 105.116 11.5739 104.435 11.5739C103.222 11.5739 102.615 12.1694 102.615 13.3602H100.056V13.1698C100.056 12.1254 100.396 11.2518 101.077 10.549C101.757 9.85603 102.901 9.50952 104.509 9.50952C106.137 9.50952 107.286 9.85603 107.956 10.549C108.627 11.2518 108.963 12.2767 108.963 13.6237V17.5622L109.125 20.6369ZM103.888 18.7042C104.904 18.7042 105.698 18.3285 106.27 17.5769V15.2928L103.962 15.6589C102.877 15.8346 102.334 16.3519 102.334 17.2108V17.3719C102.334 17.7428 102.462 18.06 102.719 18.3236C102.985 18.5774 103.375 18.7042 103.888 18.7042ZM117.869 20.4758V18.9531C117.159 19.7926 116.183 20.2123 114.94 20.2123C113.529 20.2123 112.494 19.7584 111.833 18.8507C111.162 17.9527 110.827 16.7081 110.827 15.1171V14.59C110.827 13.0576 111.162 11.8277 111.833 10.9004C112.513 9.97316 113.549 9.50952 114.94 9.50952C116.36 9.50952 117.416 10.0415 118.106 11.1054L118.343 9.77306H120.725L120.562 12.8477V20.5198C120.562 23.5066 118.949 25 115.724 25C114.067 25 112.873 24.6388 112.144 23.9165C111.404 23.1942 111.034 22.2328 111.034 21.0322V20.6369H113.579C113.579 21.3494 113.736 21.8912 114.052 22.2621C114.368 22.6232 114.905 22.8038 115.665 22.8038C116.444 22.8038 117.006 22.6232 117.351 22.2621C117.697 21.8912 117.869 21.2958 117.869 20.4758ZM117.869 16.6545V13.0673C117.327 12.2377 116.602 11.8228 115.694 11.8228C114.984 11.8228 114.442 12.0717 114.067 12.5695C113.702 13.0673 113.52 13.7408 113.52 14.59V15.1171C113.52 16.9619 114.244 17.8843 115.694 17.8843C116.592 17.8843 117.317 17.4744 117.869 16.6545ZM125.666 20.6369H122.974V9.77306H125.666V20.6369ZM122.855 5H125.8V7.88433H122.855V5ZM130.357 14.8829V15.5271C130.357 17.5573 131.096 18.5725 132.576 18.5725C133.217 18.5725 133.7 18.3968 134.026 18.0454C134.351 17.694 134.514 17.2401 134.514 16.6837H137.059V17.1083C137.059 18.2211 136.669 19.1288 135.89 19.8316C135.111 20.5442 133.981 20.9004 132.502 20.9004C130.894 20.9004 129.686 20.4124 128.877 19.4363C128.068 18.4602 127.664 17.1571 127.664 15.5271V14.8829C127.664 13.243 128.068 11.9351 128.877 10.959C129.686 9.99268 130.894 9.50952 132.502 9.50952C134.001 9.50952 135.135 9.87555 135.905 10.6076C136.674 11.3494 137.059 12.3011 137.059 13.4627V13.9165H134.514C134.514 13.2626 134.351 12.7501 134.026 12.3792C133.7 12.0083 133.217 11.8228 132.576 11.8228C131.096 11.8228 130.357 12.8429 130.357 14.8829Z');
      path2.setAttributeNS(null, 'fill', '#748297');
      footerSvg.appendChild(path2);
      
      footerWrapper.appendChild(footerSvg);
      
      contentOuterWrapper.appendChild(footerWrapper);

      document.querySelector('body').appendChild(contentOuterWrapper);

      isPopupOn = true;

      document.addEventListener('click', function listenForContentStart(event) {
        if (event.target.id == 'usersmagic-start-button') {
          document.removeEventListener('click', listenForContentStart);
          createContent(data, err => callback(err));
        }
      });
    }
  }

  // Validate the email with usersmagic servers to validate
  validateEmail = function(email, callback) {
    if (!email || !email.length)
      return callback('bad_request');

    serverRequest(`/person?email=${email}`, 'GET', {}, res => {
      if (res.success)
        return callback(null);

      return callback(res.error || true);
    });
  }

  // Close usersmagic content wrapper. Stop process for a day
  closeContent = function() {
    isPopupOn = false;
    contentOuterWrapper.remove();
    contentOuterWrapper = null;
    setCookie("nextActionTime", (new Date).getTime() + ONE_DAY_IN_MS, ONE_DAY_IN_MS);
  }

  // End usersmagic content wrapper. Stop process for a day
  endContent = function() {
    createContent({
      type: 'end'
    }, err => {
      if (err) return closeContent();

      return;
    });
  }

  // Throw an error on the console. Stop the process for an hour
  throwError = function(errorMessage) {
    if (!errorMessage)
      errorMessage = 'unknown_error';

    setCookie("forceEnd", true, ONE_HOUR_IN_MS);
    console.error('Usersmagic Error: Stopping all process for an hour. Error Message: ' + errorMessage);
  }

  // Throw an error on the console. Stop the process for a day
  throwLongError = function(errorMessage) {
    if (!errorMessage)
      errorMessage = 'unknown_error';

    setCookie("forceEnd", true, ONE_DAY_IN_MS);
    console.error('Usersmagic Error: Stopping all process for an hour. Error Message: ' + errorMessage);
  }

  // GET/POST request to the given url, return the json objet
  serverRequest = function (url, method, data, callback) {
    if (!url || typeof url != 'string' || !method || typeof method != 'string' || (method != 'GET' && method != 'POST') || !data || typeof data != 'object')
      return callback({ success: false, error: 'bad_request' });
  
    url = URL_PREFIX + url;

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
  
    if (method == 'POST') {
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send();
    }
  
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status != 200)
        return callback({ success: false, error: 'network_error' })
      else if (xhr.readyState == 4 && xhr.responseText)
        return callback(JSON.parse(xhr.responseText));
    };
  }

  // Find the given cookie, return it as JSON or undefined
  getCookie = function (cookieName) {
    const name = COOKIE_PREFIX + cookieName + '=';
    const cookies = decodeURIComponent(document.cookie);
    const cookieArray = cookies.split(';').map(each => each.trim());
    let findCookie = cookieArray.find(each => each.indexOf(name) == 0);
    if (findCookie)
      findCookie = JSON.parse(findCookie.substring(name.length));

    return findCookie;
  }

  // Set the given cookie
  setCookie = function (cookieName, cookieValue, cookieMaxAge) {
    if (!cookieMaxAge || !Number.isInteger(cookieMaxAge) || cookieMaxAge < 0)
      cookieMaxAge = DEFAULT_COOKIE_MAX_AGE;

    document.cookie = `${COOKIE_PREFIX}${cookieName}=${JSON.stringify(cookieValue)}; Max-Age=${cookieMaxAge}`;
  }

  // Delete the given cookie
  deleteCookie = function (cookieName) {
    setCookie(cookieName, "", 0);
  }

  setTimeout(() => {
    start();
  }, 00);
}
