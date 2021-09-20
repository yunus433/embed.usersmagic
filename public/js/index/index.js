let graphs = [];
let pieChartColors = [];

function createGraph(graph) {
  const eachGraphWrapper = document.createElement('div');
  eachGraphWrapper.classList.add('each-graph-wrapper');

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

function loadGraphs(callback) {
  serverRequest('/graphs', 'GET', {}, res => {
    if (res.error || !res.success) return callback(res.error || 'unknown_error');

    graphs = res.graphs;
    return callback(null);
  });
}

function createProduct() {

};

window.addEventListener('load', () => {
  pieChartColors = JSON.parse(document.getElementById('pie-chart-colors').value);

  loadGraphs(err => {
    document.querySelector('.loading-icon-wrapper').style.display = 'none';

    if (err || !graphs.length) {
      document.querySelector('.no-graph-wrapper').style.display = 'flex';
      return;
    }

    graphs.forEach(graph => createGraph(graph));
    document.querySelector('.graph-outer-wrapper').style.display = 'initial';
  });

  const navigationButtonIcon = document.getElementById('navigation-button-icon');
  const navigationButtonsWrapper = document.querySelector('.navigation-buttons-wrapper');
  const dashboardContentWrapper = document.querySelector('.dashboard-content-wrapper');
  const questionsContentWrapper = document.querySelector('.questions-content-wrapper');

  document.addEventListener('click', event => {
    if (event.target.classList.contains('navigation-types-title') || event.target.parentNode.classList .contains('navigation-types-title')) {
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

    if (event.target.classList.contains('all-header-title') && !event.target.classList.contains('all-header-title-selected')) {
      document.querySelector('.all-header-title-selected').classList.remove('all-header-title-selected');
      event.target.classList.add('all-header-title-selected');

      if (event.target.id == 'dashboard-button') {
        dashboardContentWrapper.style.display = 'flex';
        questionsContentWrapper.style.display = 'none';
      } else {
        dashboardContentWrapper.style.display = 'none';
        questionsContentWrapper.style.display = 'flex';
      }
    }

    if (event.target.classList.contains('each-navigation-button') || event.target.parentNode.classList.contains('each-navigation-button')) {
      const target = event.target.classList.contains('each-navigation-button') ? event.target : event.target.parentNode;
      const id = target.id;

      target.parentNode.parentNode.querySelector('.selected-navigation-button').classList.remove('selected-navigation-button');
      target.classList.add('selected-navigation-button');

      if (!id.includes('-questions')) {
        const type = id;

        document.querySelector('.graph-outer-wrapper').innerHTML = '';

        for (let i = 0; i < graphs.length; i++)
          if (type == 'all' || graphs[i].question_type == type)
            createGraph(graphs[i]);
      } else {
        const type = id.split('-questions')[0];

        const questions = document.querySelector('.questions-wrapper').childNodes;

        for (let i = 0; i < questions.length;) {
          if (questions[i].classList.contains('create-product-main-button')) {
            i++;
          } else if (type != 'all' && !questions[i].id.includes(type)) {
            questions[i].style.display = 'none';
            i++;
            while (i < questions.length && !questions[i].classList.contains('questions-title')) {
              questions[i].style.display = 'none';
              i++;
            }
          } else {
            questions[i].style.display = 'flex';
            i++;
            while (i < questions.length && !questions[i].classList.contains('questions-title')) {
              questions[i].style.display = 'flex';
              i++;
            }
          }
        }
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
  })
});
