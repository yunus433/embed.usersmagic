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
  // const URL_PREFIX = 'http://localhost:3000/embed';
  const COOKIE_PREFIX = 'usersmagic_'; // All cookies start with usersmagic_ prefix to avoid confusion
  const DEFAULT_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // Default cookie maxAge property, equal to 1 day
  const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000, ONE_DAY_IN_MS = 24 * 60 * 60 * 1000, ONE_HOUR_IN_MS = 60 * 60 * 1000;

  // Global variables
  let isPopupOn = false;
  let contentClickerWrapper = null, contentOuterWrapper = null;
  let email = null;
  let question;
  let answer;
  let language;
  const allowedLanguageValues = ['en', 'tr'];
  const defaultContentText = {
    en: {
      openButtonText: 'Let us know you !',
      startTitle: 'Would you like to answer some questions to receive personalized discount codes?',
      agreementsTextOne: 'By clicking the box, I accept the ',
      privacyPolicy: 'Privacy Policy',
      agreementsTextTwo: ' and ',
      userAgreement: 'User Agreement',
      agreementsTextThree: ' of Usersmagic Inc.',
      nextButtonText: 'Next',
      emailTitle: 'Enter your email here for a chance to receive personalized discount codes!',
      emailPlaceholder: 'E-mail',
      approveButtonText: 'Approve',
      yesChoice: 'Yes',
      noChoice: 'No',
      endTitle: 'Thank you for answering our questions, see you later :)',
      searchAnswerPlaceholder: 'Type your answer to search',
      yourAnswerPlaceholder: 'Your answer',
      closeButtonText: 'Close'
    },
    tr: {
      openButtonText: 'Seni tanıyalım !',
      startTitle: 'Kişiselleştirilmiş indirim kodlarına erişmek için bir ankete katılmak ister misiniz?',
      agreementsTextOne: 'Kutuyu işaretleyerek Usersmagic Inc.\'nin ',
      privacyPolicy: 'Gizlilik Sözleşmesini',
      agreementsTextTwo: ' ve ',
      userAgreement: 'Kullanıcı Sözleşmesini',
      agreementsTextThree: ' kabul ediyorum.',
      nextButtonText: 'Devam Et',
      emailTitle: 'Kişiselleştirilmiş indirim kodları için e-posta adresinizi buraya girin',
      emailPlaceholder: 'E-posta',
      approveButtonText: 'Onayla',
      yesChoice: 'Evet',
      noChoice: 'Hayır',
      endTitle: 'Sorularımıza cevap verdiğiniz için teşekkür ederiz, görüşmek üzere :)',
      searchAnswerPlaceholder: 'Listeden seçmek için cevabınızı yazın',
      yourAnswerPlaceholder: 'Cevabınız',
      closeButtonText: 'Kapat'
    }
  }

  // Check the domain, call functions in necessary order
  start = function() {
    if (window.location.hostname == 'localhost') // Not work on localhost
      return;

    if (getCookie('forceEnd')) // Use forceEnd to stop all process on this client for 1h
      return;

    const nextActionTime = getCookie('nextActionTime');

    if (nextActionTime && nextActionTime > (new Date).getTime())
      return;

    getLanguage(res => { // Check if the domain is verified with a TXT record
      if (!res) return;

      document.addEventListener('click', event => {
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
            answer = question.subtype == 'yes_no' ? (target.childNodes[0].innerHTML == defaultContentText[language].yesChoice ? 'yes' : 'no') : target.childNodes[0].innerHTML;
          }
        }

        if (event.target.classList.contains('usersmagic-each-scale-choice')) {
          const target = event.target;
          
          answer = target.innerHTML;
      
          if (document.querySelector('.usersmagic-selected-choice'))
            document.querySelector('.usersmagic-selected-choice').classList.remove('usersmagic-selected-choice');
          target.classList.add('usersmagic-selected-choice');
        }

        if (event.target.classList.contains('usersmagic-close-button') || event.target.parentNode.classList.contains('usersmagic-close-button')) {
          document.querySelector('.usersmagic-content-clicker-wrapper').style.transform = 'translateX(calc(100% - 30px))';
        } else if (event.target.classList.contains('usersmagic')) {
          document.querySelector('.usersmagic-content-clicker-wrapper').style.transform = 'translateX(0px)';
        } else if (isPopupOn) {
          document.querySelector('.usersmagic-content-clicker-wrapper').style.transform = 'translateX(calc(100% - 30px))';
        }
      });

      document.addEventListener('input', event => {
        if (event.target.id == 'usersmagic-answer-input') {
          answer = event.target.value;
        }
      });

      document.addEventListener('focusin', event => {
        if (event.target.classList.contains('usersmagic-list-input')) {
          event.target.parentNode.classList.add('usersmagic-list-input-wrapper-focused');
          event.target.parentNode.style.overflow = 'visible';
          event.target.parentNode.style.borderBottom = 'none';
          event.target.parentNode.style.borderBottomLeftRadius = '0px';
          event.target.parentNode.style.borderBottomRightRadius = '0px';
        }
      });

      document.addEventListener('focusout', event => {
        if (event.target.classList.contains('usersmagic-list-input')) {
          setTimeout(() => {
            event.target.parentNode.classList.remove('usersmagic-list-input-wrapper-focused');
            event.target.parentNode.style.overflow = 'hidden';
            event.target.parentNode.style.borderBottom = '1px solid rgb(134, 146, 166)';
            event.target.parentNode.style.borderBottomLeftRadius = '10px';
            event.target.parentNode.style.borderBottomRightRadius = '10px';
          }, 100);
        }
      });

      document.addEventListener('input', event => {
        if (event.target.classList.contains('usersmagic-list-input')) {
          const choicesWrapper = event.target.parentNode.childNodes[1];
          const text = event.target.value.toLocaleLowerCase().trim();
          const nodes = choicesWrapper.childNodes;
          const newNodes = [];

          for (let i = 0; i < nodes.length; i++)
            newNodes.push(nodes[i].cloneNode(true));

          newNodes.forEach(each => {
            if (each.innerHTML.toLocaleLowerCase().indexOf(text) > -1)
              each.style.display = 'flex';
            else 
              each.style.display = 'none';
          });

          choicesWrapper.innerHTML = '';

          newNodes.sort((x, y) => {
            if (x.innerHTML.toLocaleLowerCase().indexOf(text) < y.innerHTML.toLocaleLowerCase().indexOf(text))
              return -1;
            else if (x.innerHTML.toLocaleLowerCase().indexOf(text) > y.innerHTML.toLocaleLowerCase().indexOf(text))
              return 1;
            else
              return 0;
          });

          newNodes.forEach(node => {
            choicesWrapper.appendChild(node);
          });
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

  // Check if the domain is valid for Usersmagic and get preferred language of Company
  getLanguage = function(callback) {
    serverRequest('/language', 'GET', {}, res => {
      if (res.error || !res.success || !res.language || !allowedLanguageValues.includes(res.language))
        return callback(false);

      language = res.language;

      serverRequest('/integration_routes', 'GET', {}, res => {
        if (!res.success)
          return callback(false);

        const path = location.href.replace(location.origin, '')
        const integration_routes = res.integration_routes;
        
        if (!integration_routes.find(each => path.includes(each.route)))
          return callback(false);

        return callback(true);
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
        let isCheckboxChecked = false;

        const usersmagicTitle = document.createElement('span');
        usersmagicTitle.classList.add('usersmagic');
        usersmagicTitle.classList.add('usersmagic-title');
        usersmagicTitle.innerHTML = defaultContentText[language].startTitle;
        contentInnerWrapper.appendChild(usersmagicTitle);

        const usersmagicButton = document.createElement('span');
        usersmagicButton.classList.add('usersmagic');
        usersmagicButton.classList.add('usersmagic-button');
        usersmagicButton.id = 'usersmagic-start-questions-button';
        usersmagicButton.innerHTML = defaultContentText[language].nextButtonText;
        contentInnerWrapper.appendChild(usersmagicButton);

        const usersmagicCheckBoxWrapper = document.createElement('div');
        usersmagicCheckBoxWrapper.classList.add('usersmagic');
        usersmagicCheckBoxWrapper.classList.add('usersmagic-check-box-wrapper');

        const usersmagicCheckBox = document.createElement('div');
        usersmagicCheckBox.classList.add('usersmagic');
        usersmagicCheckBox.classList.add('usersmagic-check-box');

        const usersmagicCheckBoxI = document.createElement('i');
        usersmagicCheckBoxI.classList.add('usersmagic');
        usersmagicCheckBoxI.classList.add('fas');
        usersmagicCheckBoxI.classList.add('fa-check');

        usersmagicCheckBox.appendChild(usersmagicCheckBoxI);
        usersmagicCheckBoxWrapper.appendChild(usersmagicCheckBox);

        const usersmagicCheckBoxSpan = document.createElement('span');
        usersmagicCheckBoxSpan.classList.add('usersmagic');

        const span1 = document.createElement('span');
        span1.classList.add('usersmagic');
        span1.innerHTML = defaultContentText[language].agreementsTextOne;
        usersmagicCheckBoxSpan.appendChild(span1);

        const a1 = document.createElement('a');
        a1.classList.add('usersmagic');
        a1.href = 'https://usersmagic.com/agreement/privacy';
        a1.target = '_blank';
        a1.innerHTML = defaultContentText[language].privacyPolicy;
        usersmagicCheckBoxSpan.appendChild(a1);

        const span2 = document.createElement('span');
        span2.classList.add('usersmagic');
        span2.innerHTML = defaultContentText[language].agreementsTextTwo;
        usersmagicCheckBoxSpan.appendChild(span2);

        const a2 = document.createElement('a');
        a2.classList.add('usersmagic');
        a2.href = 'https://usersmagic.com/agreement/user';
        a2.target = '_blank';
        a2.innerHTML = defaultContentText[language].userAgreement;
        usersmagicCheckBoxSpan.appendChild(a2);

        const span3 = document.createElement('span');
        span3.classList.add('usersmagic');
        span3.innerHTML = defaultContentText[language].agreementsTextThree;
        usersmagicCheckBoxSpan.appendChild(span3);

        usersmagicCheckBoxWrapper.appendChild(usersmagicCheckBoxSpan);

        contentInnerWrapper.appendChild(usersmagicCheckBoxWrapper);

        document.addEventListener('click', function listenForStartButton(event) {
          if (event.target.classList.contains('usersmagic-check-box-wrapper') || (event.target.parentNode && event.target.parentNode.classList.contains('usersmagic-check-box-wrapper')) || (event.target.parentNode && event.target.parentNode.parentNode && event.target.parentNode.parentNode.classList.contains('usersmagic-check-box-wrapper'))) {
            if (isCheckboxChecked) {
              usersmagicCheckBox.style.backgroundColor = 'rgb(254, 254, 254)';
            } else {
              usersmagicCheckBox.style.backgroundColor = 'rgb(46, 197, 206)';
            }
            
            isCheckboxChecked = !isCheckboxChecked;
          }

          if (event.target.id == 'usersmagic-start-questions-button' && isCheckboxChecked) {
            document.removeEventListener('click', listenForStartButton);
            callback(null);
          }
        });
      } else if (data.type == 'email') {
        const usersmagicTitle = document.createElement('span');
        usersmagicTitle.classList.add('usersmagic');
        usersmagicTitle.classList.add('usersmagic-title');
        usersmagicTitle.innerHTML = defaultContentText[language].emailTitle;
        contentInnerWrapper.appendChild(usersmagicTitle);

        const usersmagicInput = document.createElement('input');
        usersmagicInput.type = 'email';
        usersmagicInput.autocomplete = 'none';
        usersmagicInput.classList.add('usersmagic');
        usersmagicInput.classList.add('usersmagic-input');
        usersmagicInput.id = 'usersmagic-email-input';
        usersmagicInput.placeholder = defaultContentText[language].emailPlaceholder;
        contentInnerWrapper.appendChild(usersmagicInput);

        const usersmagicButton = document.createElement('span');
        usersmagicButton.classList.add('usersmagic');
        usersmagicButton.classList.add('usersmagic-button');
        usersmagicButton.id = 'usersmagic-approve-email-button';
        usersmagicButton.innerHTML = defaultContentText[language].approveButtonText;
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

        if (question.subtype == 'yes_no' || question.subtype == 'single' || question.subtype == 'multiple' || question.subtype == 'time') {
          if (question.subtype == 'yes_no')
            question.choices = [defaultContentText[language].yesChoice, defaultContentText[language].noChoice];
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
          usersmagicInput.placeholder = defaultContentText[language].yourAnswerPlaceholder;
          contentInnerWrapper.appendChild(usersmagicInput);
        } else if (question.subtype == 'list') {
          const usersmagicListInputWrapper = document.createElement('div');
          usersmagicListInputWrapper.classList.add('usersmagic');
          usersmagicListInputWrapper.classList.add('usersmagic-list-input-wrapper');

          const usersmagicListInput = document.createElement('input');
          usersmagicListInput.classList.add('usersmagic');
          usersmagicListInput.classList.add('usersmagic-list-input');
          usersmagicListInput.type = 'text';
          usersmagicListInput.placeholder = defaultContentText[language].searchAnswerPlaceholder;
          usersmagicListInputWrapper.appendChild(usersmagicListInput);

          const usersmagicListInputChoicesWrapper = document.createElement('div');
          usersmagicListInputChoicesWrapper.classList.add('usersmagic');
          usersmagicListInputChoicesWrapper.classList.add('usersmagagic-list-input-choices-wrapper');

          for (let i = 0; i < question.choices.length; i++) {
            const usersmagicListInputEachChoice = document.createElement('span');
            usersmagicListInputEachChoice.classList.add('usersmagic');
            usersmagicListInputEachChoice.classList.add('usersmagic-list-input-each-choice');
            usersmagicListInputEachChoice.innerHTML = question.choices[i];
            usersmagicListInputChoicesWrapper.appendChild(usersmagicListInputEachChoice);
          }

          usersmagicListInputWrapper.appendChild(usersmagicListInputChoicesWrapper);
          contentInnerWrapper.appendChild(usersmagicListInputWrapper);
        } else {
          return callback('bad_request');
        }

        const usersmagicButton = document.createElement('span');
        usersmagicButton.classList.add('usersmagic');
        usersmagicButton.classList.add('usersmagic-button');
        usersmagicButton.id = 'next-question-button';
        usersmagicButton.innerHTML = defaultContentText[language].nextButtonText;
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
        usersmagicTitle.innerHTML = defaultContentText[language].endTitle;
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
      contentClickerWrapper = document.createElement('div');
      contentClickerWrapper.classList.add('usersmagic');
      contentClickerWrapper.classList.add('usersmagic-content-clicker-wrapper');

      const openButton = document.createElement('div');
      openButton.classList.add('usersmagic');
      openButton.classList.add('usersmagic-open-button');

      const openButtonSpan = document.createElement('span');
      openButtonSpan.classList.add('usersmagic');
      openButtonSpan.innerHTML = defaultContentText[language].openButtonText;
      openButton.appendChild(openButtonSpan);

      contentClickerWrapper.appendChild(openButton);

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
      closeButtonSpan.innerHTML = defaultContentText[language].closeButtonText;
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
      footerSvg.setAttributeNS(null, 'width', '72');
      footerSvg.setAttributeNS(null, 'height', '14');
      footerSvg.setAttributeNS(null, 'viewBox', '0 0 72 14');
      footerSvg.setAttributeNS(null, 'fill', 'none');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('usersmagic');
      path.setAttributeNS(null, 'd', 'M0 8.8204V3.89339H1.76763V8.54829C1.76763 9.33869 2.15717 9.73389 2.93623 9.73389C3.59746 9.73389 4.10156 9.46178 4.44854 8.91758V3.89339H6.23582V9.06335L6.35366 11.1041H4.77261L4.60567 10.1518C4.08192 10.9033 3.29303 11.279 2.239 11.279C1.48612 11.279 0.923097 11.049 0.54993 10.5891C0.18331 10.1226 0 9.53305 0 8.8204ZM10.6353 9.90881C11.0477 9.90881 11.362 9.82783 11.578 9.66586C11.7875 9.49742 11.8922 9.27714 11.8922 9.00504C11.8922 8.70054 11.7908 8.48351 11.5878 8.35394C11.3849 8.21788 11.0215 8.12718 10.4978 8.08183C9.48957 8.00409 8.7727 7.81297 8.34715 7.50847C7.91507 7.20398 7.69902 6.73428 7.69902 6.09937V5.99247C7.69902 5.24743 7.96744 4.68055 8.50428 4.29183C9.04111 3.90959 9.75144 3.71847 10.6353 3.71847C12.6058 3.71847 13.5911 4.53802 13.5911 6.17711V6.24514H11.853C11.853 5.47418 11.4471 5.0887 10.6353 5.0887C10.2621 5.0887 9.97403 5.16645 9.77108 5.32193C9.56158 5.47742 9.45683 5.68474 9.45683 5.94388C9.45683 6.22894 9.55176 6.43626 9.74162 6.56583C9.92493 6.6954 10.2752 6.77963 10.7924 6.8185C11.7809 6.90272 12.5076 7.08736 12.9725 7.37242C13.4438 7.66396 13.6795 8.15634 13.6795 8.84955V8.93701C13.6795 9.66262 13.4209 10.236 12.9037 10.6571C12.3865 11.0717 11.6304 11.279 10.6353 11.279C9.64015 11.279 8.88399 11.0588 8.3668 10.6182C7.85615 10.1712 7.60082 9.59783 7.60082 8.89814V8.84955H9.37827C9.37827 9.55572 9.79727 9.90881 10.6353 9.90881ZM21.3491 7.32383V8.14986H16.5372C16.6027 9.32249 17.1493 9.90881 18.1772 9.90881C18.6354 9.90881 18.9955 9.79867 19.2574 9.5784C19.5258 9.35165 19.66 9.08926 19.66 8.79124H21.3491V8.84955C21.3491 9.52981 21.0676 10.1032 20.5045 10.5696C19.9415 11.0426 19.1592 11.279 18.1575 11.279C17.0315 11.279 16.1837 10.9486 15.6141 10.2878C15.038 9.62699 14.7499 8.75561 14.7499 7.67368V7.32383C14.7499 6.2419 15.0347 5.37052 15.6043 4.7097C16.1738 4.04888 17.002 3.71847 18.0888 3.71847C19.1624 3.71847 19.9742 4.04888 20.5242 4.7097C21.0741 5.37052 21.3491 6.2419 21.3491 7.32383ZM18.0495 5.0887C17.1133 5.0887 16.6092 5.67502 16.5372 6.84765H19.552C19.4931 5.67502 18.9922 5.0887 18.0495 5.0887ZM26.2297 3.71847C26.2559 3.71847 26.2952 3.72171 26.3475 3.72819C26.3999 3.72819 26.4294 3.72819 26.4359 3.72819V5.44827H26.1315C25.3459 5.44827 24.7829 5.70093 24.4424 6.20627V11.1041H22.6552V5.93417L22.5275 3.89339H24.1085L24.2657 4.76801C24.7501 4.06832 25.4048 3.71847 26.2297 3.71847ZM30.5309 9.90881C30.9434 9.90881 31.2544 9.82783 31.4639 9.66586C31.6799 9.49742 31.7879 9.27714 31.7879 9.00504C31.7879 8.70054 31.6865 8.48351 31.4835 8.35394C31.2806 8.21788 30.9172 8.12718 30.3935 8.08183C29.3853 8.00409 28.6651 7.81297 28.233 7.50847C27.8075 7.20398 27.5947 6.73428 27.5947 6.09937V5.99247C27.5947 5.24743 27.8599 4.68055 28.3901 4.29183C28.927 3.90959 29.6406 3.71847 30.5309 3.71847C32.5015 3.71847 33.4868 4.53802 33.4868 6.17711V6.24514H31.7388C31.7388 5.47418 31.3362 5.0887 30.5309 5.0887C30.1578 5.0887 29.8664 5.16645 29.6569 5.32193C29.454 5.47742 29.3525 5.68474 29.3525 5.94388C29.3525 6.22894 29.4475 6.43626 29.6373 6.56583C29.8206 6.6954 30.1709 6.77963 30.6881 6.8185C31.6766 6.90272 32.4033 7.08736 32.8681 7.37242C33.3395 7.66396 33.5752 8.15634 33.5752 8.84955V8.93701C33.5752 9.66262 33.3166 10.236 32.7994 10.6571C32.2757 11.0717 31.5195 11.279 30.5309 11.279C29.5358 11.279 28.7797 11.0588 28.2625 10.6182C27.7518 10.1712 27.4965 9.59783 27.4965 8.89814V8.84955H29.2641C29.2641 9.55572 29.6864 9.90881 30.5309 9.90881ZM45.055 6.0605V11.1041H43.2677V6.3326C43.2677 5.61347 42.924 5.25391 42.2366 5.25391C41.6867 5.25391 41.2349 5.51305 40.8814 6.03134V11.1041H39.1138V6.3326C39.1138 5.61347 38.7635 5.25391 38.063 5.25391C37.5065 5.25391 37.0646 5.51305 36.7373 6.03134V11.1041H34.95V5.93417L34.8224 3.89339H36.4034L36.5507 4.78745C37.0679 4.0748 37.8077 3.71847 38.7701 3.71847C39.6932 3.71847 40.3217 4.09747 40.6556 4.85547C41.1466 4.09747 41.9027 3.71847 42.924 3.71847C43.6245 3.71847 44.1548 3.93227 44.5149 4.35986C44.875 4.78097 45.055 5.34785 45.055 6.0605ZM52.5183 11.1041H50.9373L50.7998 10.2781C50.2106 10.9454 49.4184 11.279 48.4233 11.279C47.6901 11.279 47.1401 11.0814 46.7735 10.6862C46.4069 10.2846 46.2236 9.776 46.2236 9.16053V9.02447C46.2236 8.29887 46.4462 7.77086 46.8914 7.44045C47.33 7.11004 47.9552 6.88329 48.767 6.76019L50.623 6.47837V6.44922C50.623 5.97628 50.5314 5.63291 50.3481 5.41911C50.1713 5.19884 49.8571 5.0887 49.4053 5.0887C48.6001 5.0887 48.1975 5.4839 48.1975 6.27429H46.4986V6.14796C46.4986 5.45475 46.7244 4.87491 47.1762 4.40845C47.6279 3.94846 48.3873 3.71847 49.4544 3.71847C50.5347 3.71847 51.2974 3.94846 51.7425 4.40845C52.1877 4.87491 52.4103 5.55516 52.4103 6.44922V9.06335L52.5183 11.1041ZM49.042 9.82135C49.7163 9.82135 50.2433 9.57192 50.623 9.07306V7.55706L49.0911 7.80001C48.3709 7.91663 48.0109 8.26 48.0109 8.83012V8.93701C48.0109 9.1832 48.096 9.39376 48.2662 9.56868C48.443 9.73713 48.7016 9.82135 49.042 9.82135ZM58.3221 10.9972V9.98655C57.8507 10.5437 57.2026 10.8223 56.3777 10.8223C55.4415 10.8223 54.7541 10.521 54.3154 9.91853C53.8702 9.32249 53.6477 8.49647 53.6477 7.44045V7.0906C53.6477 6.07346 53.8702 5.25715 54.3154 4.64168C54.7672 4.02621 55.4546 3.71847 56.3777 3.71847C57.3204 3.71847 58.0209 4.07156 58.4792 4.77773L58.6363 3.89339H60.2174L60.1093 5.93417V11.0264C60.1093 13.0088 59.0389 14.0001 56.8981 14.0001C55.7983 14.0001 55.0061 13.7604 54.5217 13.2809C54.0306 12.8015 53.7851 12.1634 53.7851 11.3665V11.1041H55.4742C55.4742 11.5771 55.579 11.9366 55.7885 12.1828C55.998 12.4225 56.3548 12.5424 56.8589 12.5424C57.376 12.5424 57.7492 12.4225 57.9784 12.1828C58.2075 11.9366 58.3221 11.5414 58.3221 10.9972ZM58.3221 8.46083V6.07993C57.962 5.52925 57.4808 5.25391 56.8785 5.25391C56.4071 5.25391 56.0471 5.41911 55.7983 5.74952C55.556 6.07993 55.4349 6.52696 55.4349 7.0906V7.44045C55.4349 8.66491 55.9161 9.27714 56.8785 9.27714C57.4743 9.27714 57.9554 9.00504 58.3221 8.46083ZM63.4973 11.1041H61.71V3.89339H63.4973V11.1041ZM61.6315 0.725342H63.5857V2.63978H61.6315V0.725342ZM66.6103 7.28496V7.71255C66.6103 9.06011 67.1013 9.73389 68.0833 9.73389C68.5089 9.73389 68.8297 9.61727 69.0457 9.38404C69.2617 9.15081 69.3698 8.84955 69.3698 8.48027H71.0588V8.76209C71.0588 9.50065 70.8002 10.1032 70.283 10.5696C69.7658 11.0426 69.0162 11.279 68.0342 11.279C66.9671 11.279 66.1651 10.9551 65.6283 10.3072C65.0914 9.65938 64.823 8.79448 64.823 7.71255V7.28496C64.823 6.19655 65.0914 5.32841 65.6283 4.68055C66.1651 4.03916 66.9671 3.71847 68.0342 3.71847C69.0293 3.71847 69.7822 3.96142 70.2929 4.44732C70.8035 4.93969 71.0588 5.57136 71.0588 6.34232V6.64358H69.3698C69.3698 6.20951 69.2617 5.86938 69.0457 5.62319C68.8297 5.377 68.5089 5.25391 68.0833 5.25391C67.1013 5.25391 66.6103 5.93093 66.6103 7.28496Z');
      path.setAttributeNS(null, 'fill', '#748297');
      footerSvg.appendChild(path);
      
      footerWrapper.appendChild(footerSvg);
      
      contentOuterWrapper.appendChild(footerWrapper);

      contentClickerWrapper.appendChild(contentOuterWrapper);

      document.querySelector('html').appendChild(contentClickerWrapper);

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
  }, 2000);
}
