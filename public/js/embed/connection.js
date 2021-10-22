// This file is created for usersmagic.com server connections
// File is public, however the access is only granted through usersmagic.com TXT record verified domains
// For more information visit usersmagic.com
// The project is open source, visit https://github.com/usersmagic

window.addEventListener('load', event => {
  usersmagic();
});

function usersmagic() {
  // Constant variables
  const URL_PREFIX = 'https://embed.usersmagic.com/embed'; // The url the requests will be made to
  const COOKIE_PREFIX = 'usersmagic_'; // All cookies start with usersmagic_ prefix to avoid confusion
  const DEFAULT_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // Default cookie maxAge property, equal to 1 day
  const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000, ONE_DAY_IN_MS = 24 * 60 * 60 * 1000, ONE_HOUR_IN_MS = 60 * 60 * 1000;

  // Global variables
  let isPopupOn = false;
  let contentOuterWrapper = null;
  let email = null;
  let question;
  let answer;

  // Check the domain, call functions in necessary order
  start = function() {
    if (window.location.hostname == 'localhost') // Not work on localhost
      return;

    if (getCookie('forceEnd')) // Use forceEnd to stop all process on this client for 1h
      return;

    const nextActionTime = getCookie('nextActionTime');

    if (nextActionTime && nextActionTime > (new Date).getTime())
      return;

    checkConnection(res => { // Check if the domain is verified with a TXT record
      if (!res) return;

      document.addEventListener('click', event => {
        if (event.target.classList.contains('usersmagic-close-button') || event.target.parentNode.classList.contains('usersmagic-close-button'))
          closeContent();

        if (event.target.classList.contains('usersmagic-each-choice') || event.target.classList.contains('usersmagic-choice-text')) {
          const target = event.target.classList.contains('usersmagic-choice-text') ? event.target.parentNode : event.target;
      
          if (question.subtype == 'multiple') {
            const choice = target.childNodes[0].innerHTML;
      
            if (answer.includes(choice)) {
              target.classList.remove('usersmagic-selected-choice');
              answer = answer.filter(each => each != choice);
            } else {
              target.classList.add('usersmagic-selected-choice');
              answer.push(choice);
            }
          } else {
            if (document.querySelector('.usersmagic-selected-choice'))
              document.querySelector('.usersmagic-selected-choice').classList.remove('usersmagic-selected-choice');
            target.classList.add('usersmagic-selected-choice');
            answer = question.subtype == 'yes_no' ? (target.childNodes[0].innerHTML == 'Yes' ? 'yes' : 'no') : target.childNodes[0].innerHTML;
          }
        }

        if (event.target.classList.contains('usersmagic-each-scale-choice')) {
          const target = event.target;
          
          answer = target.innerHTML;
      
          if (document.querySelector('.usersmagic-selected-choice'))
            document.querySelector('.usersmagic-selected-choice').classList.remove('usersmagic-selected-choice');
          target.classList.add('usersmagic-selected-choice');
        }
      });

      document.addEventListener('mouseover', event => {
        if (event.target.classList.contains('usersmagic')) {
          document.querySelector('.usersmagic-content-outer-wrapper').style.height = 'fit-content';
          document.querySelector('.usersmagic-content-outer-wrapper').style.minHeight = 'fit-content';
        } else if (document.querySelector('.usersmagic-content-outer-wrapper')) {
          document.querySelector('.usersmagic-content-outer-wrapper').style.height = '100px';
          document.querySelector('.usersmagic-content-outer-wrapper').style.minHeight = '100px';
        }
      });

      document.addEventListener('input', event => {
        if (event.target.id == 'usersmagic-answer-input') {
          answer = event.target.value;
        }
      });

      getEmail(err => { // Get the email of user, either from cookie or input
        if (err) return throwError(err);
  
        askQuestion(0, err => { // Ask a question. Recursive function.
          if (err) return throwError(err);

          closeContent();
        });
      });
    });
  }

  // Get questions and ask them to user on by one
  askQuestion = function(count, callback) {
    if (count == 5)
      return callback(null);

    serverRequest('/question?email=' + email, 'GET', {}, res => {
      if (!res.success) return callback(res.error || 'unknown_error');
      if (!res.question) return callback(null);

      createContent({
        type: 'question',
        question: res.question
      }, err => {
        if (err) return callback(err);

        askQuestion(count + 1, err => callback(err));
      });
    });
  }

  // Create error message and append it under contentInnerWrapper
  createErrorMessage = function(message) {
    const errorMessage = document.createElement('span');
    errorMessage.classList.add('usersmagic');
    errorMessage.classList.add('usersmagic-error-message');
    errorMessage.innerHTML = message;
    document.querySelector('.usersmagic-content-inner-wrapper').appendChild(errorMessage);
  }

  // Check if there is an error with the current answer, create error message if it exist
  checkError = function(callback) {
    if (!answer || !answer.length) {
      createErrorMessage('Please give an answer before continue.');
      return callback(false);
    } else if (question.subtype == 'number') {
      if (isNaN(parseInt(answer)) || parseInt(answer) < question.min_value || parseInt(answer) > question.max_value) {
        createErrorMessage(`Your answer must be from ${question.min_value} to ${question.max_value}, inclusive.`);
        return callback(false);
      } else {
        return callback(true);
      }
    } else if (question.subtype == 'multiple') {
      if (answer.find(each => !question.choices.includes(each))) {
        createErrorMessage('Please choose a valid answer.');
        return callback(false);
      } else {
        return callback(true);
      }
    } else if (question.subtype == 'yes_no') {
      if (!['Yes', 'No'].includes(answer)) {
        createErrorMessage('Please choose a valid answer.');
        return callback(false);
      } else {
        answer = answer == 'Yes' ? 'yes' : 'no';
        return callback(true);
      }
    } else if (question.subtype == 'scale') {
      if (isNaN(parseInt(answer)) || parseInt(answer) < question.min_value || parseInt(answer) > question.max_value) {
        createErrorMessage('Please choose a valid answer.');
        return callback(false);
      } else {
        return callback(true);
      }
    } else {
      if (!question.choices.includes(answer)) {
        createErrorMessage('Please choose a valid answer.');
        return callback(false);
      } else {
        return callback(true);
      }
    }
  }

  // Check if the domain is valid for Usersmagic
  checkConnection = function(callback) {
    serverRequest('/connection', 'GET', {}, res => callback(res.success));
  }

  // Get email of the user, either from cookie or input
  getEmail = function(callback) {
    email = getCookie('email');

    validateEmail(email, err => {
      if (!err) {
        createContent({
          type: 'start',
        }, (err, res) => callback(err));
      } else {
        createContent({
          type: 'email'
        }, err => callback(err));
      }
    });
  }

  // Create each choice, append it under wrapper
  createChoice = function(choice, wrapper) {
    const eachChoiceWrapper = document.createElement('div');
    eachChoiceWrapper.classList.add('usersmagic');
    eachChoiceWrapper.classList.add('usersmagic-each-choice');

    const choiceText = document.createElement('span');
    choiceText.classList.add('usersmagic');
    choiceText.classList.add('usersmagic-choice-text');
    choiceText.innerHTML = choice;

    eachChoiceWrapper.appendChild(choiceText);
    wrapper.appendChild(eachChoiceWrapper);
  }

  saveAnswers = function(callback) {
    serverRequest(`/answer?email=${email}`, 'POST', {
      answer_given_to_question: answer,
      question_id: question._id.toString()
    }, res => {
      if (!res.success)
        return callback(res.error || 'unknown_error');

      return callback(null);
    });
  }

  // Create or edit the usersmagic content wrapper
  createContent = function(data, callback) {
    if (isPopupOn) {
      const contentInnerWrapper = contentOuterWrapper.childNodes[1];
      contentInnerWrapper.innerHTML = '';

      if (data.type == 'start') {
        const usersmagicTitle = document.createElement('span');
        usersmagicTitle.classList.add('usersmagic');
        usersmagicTitle.classList.add('usersmagic-title');
        usersmagicTitle.innerHTML = 'Would you like to answer some questions to receive personalized discount codes?';
        contentInnerWrapper.appendChild(usersmagicTitle);

        const usersmagicButton = document.createElement('span');
        usersmagicButton.classList.add('usersmagic');
        usersmagicButton.classList.add('usersmagic-button');
        usersmagicButton.id = 'usersmagic-start-questions-button';
        usersmagicButton.innerHTML = 'Next';
        contentInnerWrapper.appendChild(usersmagicButton);

        document.addEventListener('click', function listenForStartButton(event) {
          if (event.target.id == 'usersmagic-start-questions-button') {
            document.removeEventListener('click', listenForStartButton);
            callback(null);
          }
        });
      } else if (data.type == 'email') {
        const usersmagicTitle = document.createElement('span');
        usersmagicTitle.classList.add('usersmagic');
        usersmagicTitle.classList.add('usersmagic-title');
        usersmagicTitle.innerHTML = 'Enter your email here for a chance to receive personalized discount codes!';
        contentInnerWrapper.appendChild(usersmagicTitle);

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
                setCookie('email', email, 10 * ONE_YEAR_IN_MS);
                document.removeEventListener('click', listenForEmailInput);
                callback(null);
              }
            });
          }
        });
      } else if (data.type == 'question') {
        if (!data.question) return callback('bad_request');
        question = data.question;
        answer = null;

        const questionText = document.createElement('span');
        questionText.classList.add('usersmagic');
        questionText.classList.add('usersmagic-title');
        questionText.innerHTML = question.text;
        contentInnerWrapper.appendChild(questionText);

        if (question.subtype == 'yes_no' || question.subtype == 'single' || question.subtype == 'multiple') {
          if (question.subtype == 'yes_no')
            question.choices = ['Yes', 'No'];
          if (question.subtype == 'multiple')
            answer = [];
          
          const choicesWrapper = document.createElement('div');
          choicesWrapper.classList.add('usersmagic');
          choicesWrapper.classList.add('usersmagic-choices-wrapper');

          for (let i = 0; i < question.choices.length; i++)
            createChoice(question.choices[i], choicesWrapper);

          contentInnerWrapper.appendChild(choicesWrapper);
        } else if (question.subtype == 'scale') {
          for (let j = 0; j < (question.max_value - question.min_value) / 5; j++) {
            const scaleWrapper = document.createElement('div');
            scaleWrapper.classList.add('usersmagic');
            scaleWrapper.classList.add('usersmagic-scale-wrapper');

            for (let i = j*5 + question.min_value; i <= Math.min(j*5 + question.min_value + 5, question.max_value); i++) {
              const eachScale = document.createElement('div');
              eachScale.classList.add('usersmagic');
              eachScale.classList.add('usersmagic-each-scale-choice');
              eachScale.innerHTML = i.toString();
              scaleWrapper.appendChild(eachScale);
            }
  
            contentInnerWrapper.appendChild(scaleWrapper);
          }
        } else if (question.subtype == 'number') {
          const usersmagicInput = document.createElement('input');
          usersmagicInput.type = 'number';
          usersmagicInput.autocomplete = 'none';
          usersmagicInput.classList.add('usersmagic');
          usersmagicInput.classList.add('usersmagic-input');
          usersmagicInput.id = 'usersmagic-answer-input';
          usersmagicInput.placeholder = 'Your answer';
          contentInnerWrapper.appendChild(usersmagicInput);
        } else {
          return callback('bad_request');
        }

        const usersmagicButton = document.createElement('span');
        usersmagicButton.classList.add('usersmagic');
        usersmagicButton.classList.add('usersmagic-button');
        usersmagicButton.id = 'next-question-button';
        usersmagicButton.innerHTML = 'Next';
        contentInnerWrapper.appendChild(usersmagicButton);

        document.addEventListener('click', function listenForQuestionEvents(event) {
          if (event.target.id == 'next-question-button') {
            if (document.querySelector('.usersmagic-error-message'))
              document.querySelector('.usersmagic-error-message').remove();

            checkError(res => {
              if (!res) return;

              saveAnswers(err => {
                document.removeEventListener('click', listenForQuestionEvents);

                if (err) {
                  createErrorMessage('An unknown error occured, please try again later :(');
                  return callback(err);
                }

                return callback(null);
              });
            });
          }
        });
      } else if (data.type == 'end') {
        const usersmagicTitle = document.createElement('span');
        usersmagicTitle.classList.add('usersmagic');
        usersmagicTitle.classList.add('usersmagic-title');
        usersmagicTitle.innerHTML = 'Thank you for answering our questions, see you later :)';
        contentInnerWrapper.appendChild(usersmagicTitle);

        const usersmagicButton = document.createElement('span');
        usersmagicButton.classList.add('usersmagic');
        usersmagicButton.classList.add('usersmagic-button');
        usersmagicButton.id = 'usersmagic-end-questions-button';
        usersmagicButton.innerHTML = 'Next';
        contentInnerWrapper.appendChild(usersmagicButton);

        document.addEventListener('click', function listenForEndButton(event) {
          if (event.target.id == 'usersmagic-end-questions-button') {
            document.removeEventListener('click', listenForEndButton);
            callback(null);
          }
        });
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
      closeButtonSpan.innerHTML = 'Close';
      closeButton.appendChild(closeButtonSpan);

      headerWrapper.appendChild(closeButton);
      contentOuterWrapper.appendChild(headerWrapper);

      const contentInnerWrapper = document.createElement('div');
      contentInnerWrapper.classList.add('usersmagic');
      contentInnerWrapper.classList.add('usersmagic-content-inner-wrapper');

      contentOuterWrapper.appendChild(contentInnerWrapper);

      const footerWrapper = document.createElement('div');
      footerWrapper.classList.add('usersmagic');
      footerWrapper.classList.add('usersmagic-footer-wrapper')
      
      const footerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      footerSvg.classList.add('usersmagic');
      footerSvg.setAttributeNS(null, 'width', '20');
      footerSvg.setAttributeNS(null, 'height', '40');
      footerSvg.setAttributeNS(null, 'viewBox', '0 0 20 40');
      footerSvg.setAttributeNS(null, 'fill', 'none');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('usersmagic');
      path.setAttributeNS(null, 'd', 'M8.55804 10.1338C9.09275 8.88554 9.14437 6.85164 8.588 4.70523C8.03117 2.55932 7.01109 0.854949 5.95597 0.0964456C5.42126 1.34471 5.37009 3.3786 5.92646 5.52502C6.48283 7.67093 7.50338 9.3753 8.55804 10.1338ZM13.5271 5.42355C14.0116 3.25704 13.8917 1.22616 13.316 0C12.2871 0.800196 11.3242 2.54325 10.8398 4.71025C10.3553 6.87676 10.4747 8.90764 11.0504 10.1338C12.0793 9.33361 13.0426 7.59005 13.5271 5.42355ZM13.8286 15.0696C13.8286 12.5771 11.9677 10.5487 9.68 10.5487C7.39229 10.5487 5.53143 12.5771 5.53143 15.0696V16.5766H13.8286V15.0696ZM9.91047 15.0696C9.8182 15.0722 9.72639 15.0547 9.64043 15.018C9.55447 14.9814 9.47612 14.9264 9.41 14.8562C9.34387 14.786 9.29131 14.7021 9.25541 14.6094C9.21951 14.5168 9.201 14.4172 9.20097 14.3166C9.20094 14.216 9.21939 14.1165 9.25523 14.0238C9.29107 13.9311 9.34359 13.8471 9.40967 13.7769C9.47575 13.7067 9.55407 13.6516 9.64 13.6149C9.72593 13.5782 9.81774 13.5606 9.91001 13.5631C10.0902 13.5681 10.2615 13.6497 10.3874 13.7903C10.5133 13.931 10.5838 14.1197 10.5838 14.3161C10.5839 14.5126 10.5135 14.7013 10.3877 14.8421C10.262 14.9828 10.0907 15.0645 9.91047 15.0696ZM12.2152 15.0696C12.0319 15.0696 11.856 14.9902 11.7263 14.8489C11.5967 14.7076 11.5238 14.516 11.5238 14.3161C11.5238 14.1163 11.5967 13.9246 11.7263 13.7833C11.856 13.642 12.0319 13.5626 12.2152 13.5626C12.3986 13.5626 12.5745 13.642 12.7042 13.7833C12.8338 13.9246 12.9067 14.1163 12.9067 14.3161C12.9067 14.516 12.8338 14.7076 12.7042 14.8489C12.5745 14.9902 12.3986 15.0696 12.2152 15.0696ZM19.36 18.0835H0V21.0974H4.14857L2.76571 39.181H16.5943L15.2114 21.0974H19.36V18.0835Z');
      path.setAttributeNS(null, 'fill', '#2EC5CE');
      footerSvg.appendChild(path);
      
      footerWrapper.appendChild(footerSvg);
      
      contentOuterWrapper.appendChild(footerWrapper);

      document.querySelector('body').appendChild(contentOuterWrapper);

      isPopupOn = true;
      createContent(data, err => callback(err));
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
    setCookie('nextActionTime', (new Date).getTime() + ONE_DAY_IN_MS, ONE_DAY_IN_MS);
  }

  // Throw an error on the console. Stop the process for an hour
  throwError = function(errorMessage) {
    if (!errorMessage)
      errorMessage = 'unknown_error';

    setCookie('forceEnd', true, ONE_HOUR_IN_MS);
    console.error('Usersmagic Error: Stopping all process for an hour. Error Message: ' + errorMessage);
  }

  // Throw an error on the console. Stop the process for a day
  throwLongError = function(errorMessage) {
    if (!errorMessage)
      errorMessage = 'unknown_error';

    setCookie('forceEnd', true, ONE_DAY_IN_MS);
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
    setCookie(cookieName, '', 0);
  }

  setTimeout(() => {
    start();
  }, 3000);
}
