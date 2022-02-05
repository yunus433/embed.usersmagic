let graphs = [];
let pieChartColors = [];
let loadingGraphs = true;
let filters = {};
let graphInfoId;
let selectedGraphType = 'all';

function createGraph(graph) {
  const eachGraphWrapper = document.createElement('div');
  eachGraphWrapper.classList.add('each-graph-wrapper');
  eachGraphWrapper.id = graph._id;

  const eachGraphTitleWrapper = document.createElement('div');
  eachGraphTitleWrapper.classList.add('each-graph-title-wrapper');

  const eachGraphTitle = document.createElement('span');
  eachGraphTitle.classList.add('each-graph-title');
  eachGraphTitle.innerHTML = graph.title;
  eachGraphTitleWrapper.appendChild(eachGraphTitle);

  const eachGraphSubtitle = document.createElement('span');
  eachGraphSubtitle.classList.add('each-graph-subtitle');
  eachGraphSubtitle.innerHTML = graph.description;
  eachGraphTitleWrapper.appendChild(eachGraphSubtitle);

  eachGraphWrapper.appendChild(eachGraphTitleWrapper);

  const eachGraphContentWrapper = document.createElement('div');
  eachGraphContentWrapper.classList.add('each-graph-content-wrapper');

  const eachGraphTotalCount = document.createElement('span');
  eachGraphTotalCount.classList.add('each-graph-total-count')
  eachGraphTotalCount.innerHTML = (graph.total >= 1000 ? (graph.total >= 1000000 ? (Math.floor(graph.total / 1000000 * 10) / 10  + 'm') : (Math.floor(graph.total / 1000 * 10) / 10  + 'k') ) : graph.total) + ' answer' + (graph.total > 1 ? 's' : '');
  eachGraphContentWrapper.appendChild(eachGraphTotalCount);

  if (graph.type == 'pie_chart') {
    const pieChartLabelWrapper = document.createElement('div');
    pieChartLabelWrapper.classList.add('pie-chart-label-wrapper');

    let conicGradientValueArray = [];

    for (let i = 0; i < pieChartColors.length && i < graph.data.length && graph.data[i].value > 0; i++) {
      const pieChartEachColorWrapper = document.createElement('div');
      pieChartEachColorWrapper.classList.add('pie-chart-each-color-wrapper');

      const pieChartEachColor = document.createElement('div');
      pieChartEachColor.classList.add('pie-chart-each-color');
      pieChartEachColor.style.backgroundColor = pieChartColors[i];
      pieChartEachColorWrapper.appendChild(pieChartEachColor);

      const pieChartEachLabel = document.createElement('span');
      pieChartEachLabel.classList.add('pie-chart-each-label');
      pieChartEachLabel.innerHTML = graph.data[i].name;
      pieChartEachColorWrapper.appendChild(pieChartEachLabel);

      pieChartLabelWrapper.appendChild(pieChartEachColorWrapper);

      const lastPercentage = i > 0 ? conicGradientValueArray[conicGradientValueArray.length-1].percentage : 0;

      conicGradientValueArray.push({ color: pieChartColors[i], percentage: lastPercentage + (graph.data[i].value / graph.total * 100) });
    }

    if (graph.data.length > pieChartColors.length && graph.data[pieChartColors.length].value > 0) {
      const pieChartEachColorWrapper = document.createElement('div');
      pieChartEachColorWrapper.classList.add('pie-chart-each-color-wrapper');

      const pieChartEachColor = document.createElement('div');
      pieChartEachColor.classList.add('pie-chart-each-color');
      pieChartEachColor.style.backgroundColor = 'rgb(186, 183, 178)';
      pieChartEachColorWrapper.appendChild(pieChartEachColor);

      const pieChartEachLabel = document.createElement('span');
      pieChartEachLabel.classList.add('pie-chart-each-label');
      pieChartEachLabel.innerHTML = 'Others';
      pieChartEachColorWrapper.appendChild(pieChartEachLabel);

      pieChartLabelWrapper.appendChild(pieChartEachColorWrapper);
    }

    eachGraphContentWrapper.appendChild(pieChartLabelWrapper);

    let otherCount = 0;

    for (let i = pieChartColors.length; i < graph.data.length; i++)
      otherCount += graph.data[i].value;

    if (otherCount > 0) {
      const lastPercentageOther = conicGradientValueArray.length > 0 ? conicGradientValueArray[conicGradientValueArray.length-1].percentage : 0;
      conicGradientValueArray.push({ color: 'rgb(186, 183, 178)', percentage: lastPercentageOther + (otherCount / graph.total * 100) });  
    }

    const pieChartWrapper = document.createElement('div');
    pieChartWrapper.classList.add('pie-chart-wrapper');

    const pieChartColor = document.createElement('div');
    pieChartColor.classList.add('pie-chart-color');
    pieChartColor.style.background = `conic-gradient(at center, ${conicGradientValueArray.map((each, i) => each.color + ' ' + (i > 0 ? conicGradientValueArray[i-1].percentage : 0) + '% ' + conicGradientValueArray[i].percentage + '%').join(', ')}${(conicGradientValueArray[conicGradientValueArray.length-1].percentage < 100) ? ', rgb(186, 183, 178) ' + conicGradientValueArray[conicGradientValueArray.length-1].percentage + '% 100%' : ''})`;
    pieChartWrapper.appendChild(pieChartColor);

    const pieChartWhite = document.createElement('div');
    pieChartWhite.classList.add('pie-chart-white');
    pieChartWrapper.appendChild(pieChartWhite);

    eachGraphContentWrapper.appendChild(pieChartWrapper);
  } else if (graph.type == 'bar_chart') {
    const barChartWrapper = document.createElement('div');
    barChartWrapper.classList.add('bar-chart-wrapper');

    for (let i = 0; i < graph.data.length && i < 6; i++) {
      const eachBarWrapper = document.createElement('div');
      eachBarWrapper.classList.add('each-bar-wrapper');

      const eachBarName = document.createElement('span');
      eachBarName.classList.add('each-bar-name');
      eachBarName.innerHTML = graph.data[i].name;
      eachBarWrapper.appendChild(eachBarName);

      const eachBar = document.createElement('div');
      eachBar.classList.add('each-bar');

      const eachBarColor = document.createElement('div');
      eachBarColor.classList.add('each-bar-color');
      eachBarColor.style.backgroundColor = i % 2 ? 'rgba(186, 183, 178)' : 'rgba(140, 212, 224)';
      eachBarColor.style.width = (graph.data[i].value / graph.total * 100) + '%';
      eachBar.appendChild(eachBarColor);
      
      eachBarWrapper.appendChild(eachBar);

      const eachBarTotal = document.createElement('span');
      eachBarTotal.classList.add('each-bar-total');
      eachBarTotal.innerHTML = graph.data[i].value;

      eachBarWrapper.appendChild(eachBarTotal);

      barChartWrapper.appendChild(eachBarWrapper);
    }

    let othersCount = 0;

    for (let i = 6; i < graph.data.length; i++)
      othersCount += graph.data[i].value;

    if (graph.data.length > 6) {
      const eachBarWrapper = document.createElement('div');
      eachBarWrapper.classList.add('each-bar-wrapper');
      eachBarWrapper.style.marginBottom = '0px';

      const eachBarName = document.createElement('span');
      eachBarName.classList.add('each-bar-name');
      eachBarName.innerHTML = 'Others';
      eachBarWrapper.appendChild(eachBarName);

      const eachBar = document.createElement('div');
      eachBar.classList.add('each-bar');

      const eachBarColor = document.createElement('div');
      eachBarColor.classList.add('each-bar-color');
      eachBarColor.style.backgroundColor = 'rgba(140, 212, 224)';
      eachBarColor.style.width = (othersCount / graph.total * 100) + '%';
      eachBar.appendChild(eachBarColor);
      
      eachBarWrapper.appendChild(eachBar);

      const eachBarTotal = document.createElement('span');
      eachBarTotal.classList.add('each-bar-total');
      eachBarTotal.innerHTML = othersCount;

      eachBarWrapper.appendChild(eachBarTotal);
      
      barChartWrapper.appendChild(eachBarWrapper);
    }

    eachGraphContentWrapper.appendChild(barChartWrapper);
  }

  eachGraphWrapper.appendChild(eachGraphContentWrapper);

  document.querySelector('.graph-outer-wrapper').appendChild(eachGraphWrapper);
}

function createGraphInfo(percentage, position) {
  const graphInfo = document.createElement('span');
  graphInfo.classList.add('graph-info');
  graphInfo.innerHTML = Math.round(percentage * 100) / 100 + '%';
  graphInfo.style.left = position.x + 'px';
  graphInfo.style.top = position.y + 'px';
  document.querySelector('body').appendChild(graphInfo);
}

function loadGraphs(callback) {
  serverRequest('/graphs/filters', 'POST', filters, res => {
    if (res.error || !res.success) return callback(res.error || 'unknown_error');

    graphs = res.graphs;
    loadingGraphs = false;
    return callback(null);
  });
}

function createGraphs() {
  document.querySelector('.loading-icon-wrapper').style.display = 'flex';
  document.querySelector('.graph-outer-wrapper').innerHTML = '';
  document.querySelector('.graph-outer-wrapper').style.display = 'none';
  document.querySelector('.no-graph-wrapper').style.display = 'none';
  document.querySelector('.no-graph-found-wrapper').style.display = 'none';

  loadGraphs(err => {
    document.querySelector('.loading-icon-wrapper').style.display = 'none';

    if (err || !graphs.length) {
      if ('latest_week_count' in filters)
        document.querySelector('.no-graph-found-wrapper').style.display = 'flex';
      else
        document.querySelector('.no-graph-wrapper').style.display = 'flex';

      return;
    }

    document.querySelector('.graph-outer-wrapper').innerHTML = '';

    graphs.forEach(graph => {
      if (selectedGraphType == 'all' || graph.question_type == selectedGraphType)
        createGraph(graph);
    });

    document.querySelector('.graph-outer-wrapper').style.display = 'initial';
  });
}

function createQuestion(question) {
  const eachQuestion = document.createElement('div');
  eachQuestion.classList.add('each-question');
  eachQuestion.style = 'cursor: move;';
  eachQuestion.id = question._id;

  const eachQuestionTitle = document.createElement('div');
  eachQuestionTitle.classList.add('each-question-title');

  const span = document.createElement('span');
  span.innerHTML = question.text;
  eachQuestionTitle.appendChild(span);

  const i = document.createElement('i');
  i.classList.add('delete-question-button');
  i.classList.add('fas');
  i.classList.add('fa-trash-alt');
  eachQuestionTitle.appendChild(i);

  eachQuestion.appendChild(eachQuestionTitle);

  const eachQuestionContent = document.createElement('div');
  eachQuestionContent.classList.add('each-question-content');
  eachQuestion.appendChild(eachQuestionContent);

  document.querySelector('.company-questions-wrapper').appendChild(eachQuestion);
}

function uploadImage (file, callback) {
  const formdata = new FormData();
  formdata.append('file', file);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/image/upload');
  xhr.send(formdata);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.responseText) {
      const res = JSON.parse(xhr.responseText);

      if (!res.success)
        return callback(res.error || 'unknown_error');

      return callback(null, res.url);
    }
  };
}

function createImagePicker (wrapper) {
  const settingsImagePicker = document.createElement('label');
  settingsImagePicker.classList.add('all-choose-image-input-text');

  const span = document.createElement('span');
  span.innerHTML = 'Click to choose an image from your device';
  settingsImagePicker.appendChild(span);

  const input = document.createElement('input');
  input.classList.add('display-none');
  input.classList.add('image-input');
  input.accept = 'image/*';
  input.type = 'file';

  settingsImagePicker.appendChild(input);

  wrapper.innerHTML = '';
  wrapper.appendChild(settingsImagePicker);
}

function createUploadedImage (url, wrapper) {
  const imageInputWrapper = document.createElement('div');
  imageInputWrapper.classList.add('all-image-input-wrapper');

  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('all-image-input-wrapper-image');
  const image = document.createElement('img');
  image.src = url;
  image.alt = 'usersmagic';
  imageWrapper.appendChild(image);
  imageInputWrapper.appendChild(imageWrapper);

  const i = document.createElement('i');
  i.classList.add('fas');
  i.classList.add('fa-times');
  i.classList.add('delete-image-button');
  imageInputWrapper.appendChild(i);

  wrapper.innerHTML = '';
  wrapper.appendChild(imageInputWrapper);
}

function createIntegrationRoutes () {
  document.querySelector('.integration-routes-wrapper').innerHTML = '';

  serverRequest('/company', 'GET', {}, res => {
    if (!res.success)
      return throwError();

    const integrationRoutes = res.company.integration_routes;

    integrationRoutes.forEach(integration_route => createIntegrationRoute(integration_route));
  });
}

function createIntegrationRoute (route) {
  const eachIntegrationRoute = document.createElement('div');
  eachIntegrationRoute.classList.add('each-integration-route');
  eachIntegrationRoute.id = route._id.toString();
  
  const eachIntegrationRouteName = document.createElement('span');
  eachIntegrationRouteName.classList.add('each-integration-route-name');
  eachIntegrationRouteName.innerHTML = route.name;
  eachIntegrationRoute.appendChild(eachIntegrationRouteName);

  const eachIntegrationRouteUrl = document.createElement('span');
  eachIntegrationRouteUrl.classList.add('each-integration-route-url');
  eachIntegrationRouteUrl.innerHTML = route.route;
  eachIntegrationRoute.appendChild(eachIntegrationRouteUrl);

  const eachIntegrationRouteDeleteButton = document.createElement('i');
  eachIntegrationRouteDeleteButton.classList.add('fas');
  eachIntegrationRouteDeleteButton.classList.add('fa-trash-alt');
  eachIntegrationRouteDeleteButton.classList.add('each-integration-route-delete-button');
  eachIntegrationRoute.appendChild(eachIntegrationRouteDeleteButton);

  document.querySelector('.integration-routes-wrapper').appendChild(eachIntegrationRoute);
}

function throwError (err) {
  if (err)
    return createConfirm({
      title: 'An error occured',
      text: `An error occured, please reload the page and try again. Error Message: ${err}`,
      reject: 'Close'
    }, res => {});

  return createConfirm({
    title: 'An unknown error occured',
    text: 'An unknown error occured, please reload the page and try again',
    reject: 'Close'
  }, res => {});
}

window.addEventListener('load', () => {
  pieChartColors = JSON.parse(document.getElementById('pie-chart-colors').value);

  createGraphs();
  createIntegrationRoutes();

  const dashboardContentWrapper = document.querySelector('.dashboard-content-wrapper');
  const integrationContentWrapper = document.querySelector('.integration-content-wrapper');
  const questionsContentWrapper = document.querySelector('.questions-content-wrapper');
  const adsContentWrapper = document.querySelector('.ads-content-wrapper');

  const addTargetGroupWrapper = document.querySelector('.add-target-group-wrapper');
  const createTargetGroupWrapper = document.getElementById('create-target-group-wrapper');
  const createIntegrationRouteWrapper = document.getElementById('create-integration-route-wrapper');

  document.addEventListener('click', event => {
    if (event.target.classList.contains('navigation-types-title') || event.target.parentNode.classList .contains('navigation-types-title')) {
      const target = event.target.classList.contains('navigation-types-title') ? event.target : event.target.parentNode;
      const icon = target.childNodes[0];
      const buttonsWrapper = target.nextElementSibling;
      const isNavigationButtonsWrapperOpen = icon.classList.contains('fa-chevron-down');

      if (isNavigationButtonsWrapperOpen) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-right');
        buttonsWrapper.classList.remove('open-bottom-animation-class');
        buttonsWrapper.classList.add('close-up-animation-class');
      } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-down');
        buttonsWrapper.classList.remove('close-up-animation-class');
        buttonsWrapper.classList.add('open-bottom-animation-class');
      }
    }

    if ((event.target.classList.contains('each-navigation-button') && !event.target.classList.contains('selected-navigation-button')) || (event.target.parentNode.classList.contains('each-navigation-button') && !event.target.parentNode.classList.contains('selected-navigation-button'))) {
      const target = event.target.classList.contains('each-navigation-button') ? event.target : event.target.parentNode;
      
      document.querySelector('.selected-navigation-button').classList.remove('selected-navigation-button');
      target.classList.add('selected-navigation-button');

      if (target.id == 'dashboard') {
        dashboardContentWrapper.style.display = 'flex';
        integrationContentWrapper.style.display = 'none';
        questionsContentWrapper.style.display = 'none';
        adsContentWrapper.style.display = 'none';
      } else if (target.id == 'integration') {
        dashboardContentWrapper.style.display = 'none';
        integrationContentWrapper.style.display = 'flex';
        questionsContentWrapper.style.display = 'none';
        adsContentWrapper.style.display = 'none';
      } else if (target.id == 'questions') {
        dashboardContentWrapper.style.display = 'none';
        integrationContentWrapper.style.display = 'none';
        questionsContentWrapper.style.display = 'flex';
        adsContentWrapper.style.display = 'none';
      } else if (target.id == 'ads') {
        dashboardContentWrapper.style.display = 'none';
        integrationContentWrapper.style.display = 'none';
        questionsContentWrapper.style.display = 'none';
        adsContentWrapper.style.display = 'flex';
      }
    }

    if (event.target.classList.contains('copy-code-button') || event.target.parentNode.classList.contains('copy-code-button')) {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('copy-data'));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      document.querySelector('.copy-code-button').childNodes[0].innerHTML = 'Copied!';
      setTimeout(() => {
        document.querySelector('.copy-code-button').childNodes[0].innerHTML = 'Copy';
      }, 1500);
    }

    if (event.target.classList.contains('add-product-outer-wrapper') || event.target.classList.contains('add-product-close-button') || event.target.parentNode.classList.contains('add-product-close-button')) {
      document.querySelector('.add-product-outer-wrapper').style.display = 'none';
    }

    if (event.target.classList.contains('create-product-button') || event.target.parentNode.classList.contains('create-product-button') || event.target.classList.contains('create-product-main-button')) {
      document.querySelector('.add-product-outer-wrapper').style.display = 'flex';
    }

    if (event.target.classList.contains('delete-question-button')) {
      const id = event.target.parentNode.parentNode.id;

      createConfirm({
        title: 'Are you sure you want to delete this question?',
        text: 'Once you delete, your users won\'t be able to see and answer this question on your website. Your old data will be preserved until the answers are expired, but you won\'t be able to see the graphs anymore. You can retake this action whenever you like.',
        accept: 'Confirm',
        reject: 'Cancel'
      }, res => {
        if (res) {
          serverRequest(`/questions/delete?id=${id}`, 'GET', {}, res => {
            if (!res.success)
              return throwError(res.error);
    
            event.target.parentNode.parentNode.remove();
          }); 
        }
      });
    }

    if (event.target.classList.contains('delete-image-button')) {
      const wrapper = event.target.parentNode.parentNode;
      const url = event.target.parentNode.childNodes[0].childNodes[0].src;

      serverRequest(`/image/delete?url=${url}`, 'GET', {}, res => {
        if (!res.success) return throwError(res.error);

        createImagePicker(wrapper);
      });
    }

    if (event.target.classList.contains('add-template-button')) {
      const id = event.target.parentNode.parentNode.id;

      createConfirm({
        title: 'Are you sure you want to add this question?',
        text: 'Once you add, your users will be able to see and answer this question on your website.',
        accept: 'Confirm',
        reject: 'Cancel'
      }, res => {
        if (res) {
          serverRequest('/questions/create', 'POST', {
            template_id: id
          }, res => {
            if (!res.success)
              return throwError(res.error);

            serverRequest(`/questions?id=${res.id}`, 'GET', {}, res => {
              if (!res.success)
                return throwError(res.error);

              event.target.parentNode.parentNode.remove();
              createQuestion(res.question);
            });
          });
        }
      });
    }

    if (event.target.classList.contains('add-new-item-close-button') || event.target.parentNode.classList.contains('add-new-item-close-button')) {
      const id = event.target.classList.contains('add-new-item-close-button') ? event.target.id : event.target.parentNode.id;

      if (id == 'create-target-group-close-button') {
        createTargetGroupWrapper.style.display = 'none';
      } else if (id == 'create-integration-route-close-button') {
        createIntegrationRouteWrapper.style.display = 'none';
      }
    }

    if (event.target.classList.contains('add-new-item-outer-wrapper')) {
      event.target.style.display = 'none';
    }

    if (event.target.id == 'create-integration-route-open-button') {
      createIntegrationRouteWrapper.style.display = 'flex';
    }

    if (event.target.classList.contains('each-integration-route-delete-button')) {
      const id = event.target.parentNode.id;

      console.log(id);

      createConfirm({
        title: 'Are you sure you want to delete this route?',
        text: 'Please confirm you want to delete this route. The Usersmagic pop-ups will be deactivated from this page. You may retake this action whenever you like.',
        accept: 'Delete',
        reject: 'Cancel'
      }, res => {
        if (res) {
          serverRequest('/integration/delete', 'POST', {
            integration_route_id: id
          }, res => {
            if (!res.success)
              return throwError(res.error);

            event.target.parentNode.remove();
          });
        }
      });
    }

    if (event.target.classList.contains('create-target-group-button') || event.target.parentNode.classList.contains('create-target-group-button')) {
      createTargetGroupWrapper.style.display = 'flex';
      addTargetGroupWrapper.style.overflow = 'hidden';
      addTargetGroupWrapper.style.borderColor = 'rgb(186, 183, 178)';
      addTargetGroupWrapper.style.boxShadow = 'none';
    }
    
    if (!event.target.classList.contains('add-target-group-wrapper') && event.target.parentNode && !event.target.parentNode.classList.contains('add-target-group-wrapper')  && event.target.parentNode.parentNode && !event.target.parentNode.parentNode.classList.contains('add-target-group-wrapper') && event.target.parentNode.parentNode.parentNode && !event.target.parentNode.parentNode.parentNode.classList.contains('add-target-group-wrapper')) {
      addTargetGroupWrapper.style.overflow = 'hidden';
      addTargetGroupWrapper.style.borderColor = 'rgb(186, 183, 178)';
      addTargetGroupWrapper.style.boxShadow = 'none';
    }  

    if (event.target.classList.contains('each-target-group-filter') || event.target.parentNode.classList.contains('each-target-group-filter')) {
      const target = event.target.classList.contains('each-target-group-filter') ? event.target : event.target.parentNode;

      target.style.height = 'fit-content';
      target.style.minHeight = 'fit-content';
    }
  });

  // Don't allow these actions while graphs are loading
  document.addEventListener('click', event => {
    if (loadingGraphs)
      return;

    if (event.target.classList.contains('each-time-filter-button') && !event.target.classList.contains('each-time-filter-button-selected') && event.target.id != 'custom-time-filter-button') {
      let weekFilter;

      document.querySelector('.each-time-filter-button-selected').classList.remove('each-time-filter-button-selected');
      event.target.classList.add('each-time-filter-button-selected');

      if (event.target.id == 'all-time-filter-button') weekFilter = null;
      else if (event.target.id == 'this-week-filter-button') weekFilter = 0;
      else if (event.target.id == 'last-week-filter-button') weekFilter = -1;
      else if (event.target.id == 'two-weeks-filter-button') weekFilter = -2;
      else if (event.target.id == 'four-weeks-filter-button') weekFilter = -4;
      else if (event.target.id == 'three-months-time-filter-button') weekFilter = -12;
      else if (event.target.id == 'six-months-time-filter-button') weekFilter = -24;
      else if (event.target.id == 'twelve-months-time-filter-button') weekFilter = -52;

      if (isNaN(weekFilter) && 'latest_week_count' in filters)
        delete filters.latest_week_count;
      else
        filters.latest_week_count = weekFilter;

      createGraphs();
    }
  });

  document.addEventListener('mouseover', event => {
    if (event.target.classList.contains('pie-chart-color')) {
      const graphWrapper = event.target.parentNode.parentNode.parentNode;
      const graph = graphs.find(each => each._id == graphWrapper.id);

      if (graphInfoId == graph._id)
        return;

      graphInfoId = graph._id;

      let angelWithVertical; // The angle mouse makes with the vertical to center
      const centerPosition = {
        x: (event.target.getBoundingClientRect().left + event.target.getBoundingClientRect().right) / 2,
        y: window.innerHeight - ((event.target.getBoundingClientRect().bottom + event.target.getBoundingClientRect().top) / 2)
      };
      const mousePosition = {
        x: event.clientX,
        y: window.innerHeight - event.clientY
      };

      if (mousePosition.y > centerPosition.y && mousePosition.x > centerPosition.x) { // First quadrant
        angelWithVertical = 90 - (Math.atan((mousePosition.y - centerPosition.y) / (mousePosition.x - centerPosition.x)) * 180 / Math.PI);
      } else if (mousePosition.y < centerPosition.y && mousePosition.x > centerPosition.x) { // Second quadrant
        angelWithVertical = 90 + (Math.atan((centerPosition.y - mousePosition.y) / (mousePosition.x - centerPosition.x)) * 180 / Math.PI);
      } else if (mousePosition.y < centerPosition.y && mousePosition.x < centerPosition.x) { // Third quadrant
        angelWithVertical = 270 - Math.atan((centerPosition.y - mousePosition.y) / (centerPosition.x - mousePosition.x)) * 180 / Math.PI;
      } else { // Fourth quadrant
        angelWithVertical = 270 + Math.atan((mousePosition.y - centerPosition.y) / (centerPosition.x - mousePosition.x)) * 180 / Math.PI;
      }

      if (document.querySelector('.graph-info'))
        document.querySelector('.graph-info').remove();

      let currentAngel = 0.0;
      let percentageValue = null;

      for (let i = 0; i < pieChartColors.length && i < graph.data.length && graph.data[i].value > 0 && !percentageValue; i++) {
        currentAngel += graph.data[i].value / graph.total * 100;
        if (currentAngel * 360 / 100 >= angelWithVertical)
          percentageValue = graph.data[i].value / graph.total * 100;
      }

      if (!percentageValue)
        percentageValue = 100.0 - currentAngel;
      
      createGraphInfo(percentageValue, {
        x: event.clientX,
        y: event.clientY
      });
    } else if (!event.target.classList.contains('graph-info') && document.querySelector('.graph-info')) {
      document.querySelector('.graph-info').remove();
      graphInfoId = null;
    }
  });

  document.addEventListener('submit', event => {
    if (event.target.classList.contains('add-product-wrapper')) {
      event.preventDefault();

      const name = document.getElementById('product-name-input').value;
      const link = document.getElementById('product-link-input').value;

      serverRequest('/product/create', 'POST', {
        name,
        link
      }, res => {
        console.log(res);
        if (!res.success) return createConfirm({
          title: 'An error occured',
          text: 'Please make sure all the information you gave is correct. If the problem continues, please reload the page and try again later. Error code: ' + (res.error || 'unknown_error'),
          reject: 'Confirm'
        }, res => {});

        return location.reload();
      });
    }

    if (event.target.id == 'create-integration-route-form') {
      event.preventDefault();

      const integrationRouteName = document.getElementById('integration-route-name-input').value;
      const integrationRouteURL = document.getElementById('integration-route-url-input').value;

      serverRequest('/integration/create', 'POST', {
        name: integrationRouteName,
        route: integrationRouteURL
      }, res => {
        if (!res.success) return throwError(res.error);

        createIntegrationRoutes();
        createIntegrationRouteWrapper.style.display = 'none';
      })
    }
  });

  document.addEventListener('input', event => {
    if (event.target.classList.contains('template-search-input')) {
      const text = event.target.value.toLocaleLowerCase().trim();
      const templatesWrapper = document.querySelector('.templates-wrapper');
      const nodes = templatesWrapper.childNodes;
      const newNodes = [];

      for (let i = 0; i < nodes.length; i++)
        newNodes.push(nodes[i].cloneNode(true));

      newNodes.forEach(each => {
        if (each.innerHTML.toLocaleLowerCase().indexOf(text) > -1)
          each.style.display = 'flex';
        else 
          each.style.display = 'none';
      });

      templatesWrapper.innerHTML = '';

      newNodes.sort((x, y) => {
        if (x.innerHTML.toLocaleLowerCase().indexOf(text) < y.innerHTML.toLocaleLowerCase().indexOf(text))
          return -1;
        else if (x.innerHTML.toLocaleLowerCase().indexOf(text) > y.innerHTML.toLocaleLowerCase().indexOf(text))
          return 1;
        else
          return 0;
      });

      newNodes.forEach(node => {
        templatesWrapper.appendChild(node);
      });
    }
  });

  document.addEventListener('focusin', event => {
    if (event.target.classList.contains('add-target-group-input')) {
      addTargetGroupWrapper.style.overflow = 'visible';
      addTargetGroupWrapper.style.borderColor = 'rgb(140, 212, 224)';
      addTargetGroupWrapper.style.boxShadow = '0px 4px 10px 3px rgba(0, 0, 0, 0.05)';
    }
  });

  document.addEventListener('change', event => {
    if (event.target.classList.contains('image-input')) {
      const file = event.target.files[0];

      event.target.parentNode.style.cursor = 'progress';
      event.target.parentNode.childNodes[0].innerHTML = 'Uploading...';
      event.target.parentNode.childNodes[1].type = 'text';

      uploadImage(file, (err, url) => {
        if (err) return throwError(err);

        createUploadedImage(url, event.target.parentNode.parentNode);
      });
    }
  });
});
