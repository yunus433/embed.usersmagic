let graphs = [];
let pieChartColors = [];
let loadingGraphs = false;
let filters = {};
let graphInfoId;
let newQuestion = {
  type: null,
  template_id: null,
  product_id: null,
  integration_path_id_list: []
};

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
};

function getDate() {
  return ((new Date()).getDate() < 10 ? '0' : '') + (new Date()).getDate() + '.' + ((new Date()).getMonth() + 1 < 10 ? '0' : '') + ((new Date()).getMonth() + 1) + '.' + (new Date()).getFullYear();
};

function loadGraphData(callback) {
  if (loadingGraphs)
    return; // Do not call callback, finish the function
  
  loadingGraphs = true;

  serverRequest('/graphs', 'POST', filters, res => {
    loadingGraphs = false;

    if (res.error || !res.success) return callback(res.error || 'unknown_error');

    graphs = res.graphs;

    return callback(null);
  });
};

function createGraphInfo(percentage, position) {
  const graphInfo = document.createElement('span');
  graphInfo.classList.add('graph-info');
  graphInfo.innerHTML = Math.round(percentage * 100) / 100 + '%';
  graphInfo.style.left = position.x + 'px';
  graphInfo.style.top = position.y + 'px';
  document.querySelector('body').appendChild(graphInfo);
};

function createGraph(graph) {
  const eachGraphWrapper = document.createElement('div');
  eachGraphWrapper.classList.add('each-graph-wrapper');
  eachGraphWrapper.id = graph._id;

  const eachGraphTitleWrapper = document.createElement('div');
  eachGraphTitleWrapper.classList.add('each-graph-title-wrapper');

  const eachGraphTitle = document.createElement('span');
  eachGraphTitle.classList.add('general-subtitle');
  eachGraphTitle.classList.add('general-text-overflow');
  eachGraphTitle.innerHTML = graph.title;
  eachGraphTitleWrapper.appendChild(eachGraphTitle);

  const eachGraphSubtitle = document.createElement('span');
  eachGraphSubtitle.classList.add('general-text');
  eachGraphSubtitle.classList.add('general-text-overflow');
  eachGraphSubtitle.innerHTML = graph.description;
  eachGraphTitleWrapper.appendChild(eachGraphSubtitle);

  eachGraphWrapper.appendChild(eachGraphTitleWrapper);

  const eachGraphContentWrapper = document.createElement('div');
  eachGraphContentWrapper.classList.add('each-graph-content-wrapper');

  const eachGraphContentDataWrapper = document.createElement('div');
  eachGraphContentDataWrapper.classList.add('each-graph-content-data-wrapper');

  if (graph.data && graph.data.length && graph.data[0].value) {
    if (graph.type == 'pie_chart') {
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
  
      eachGraphContentDataWrapper.appendChild(pieChartLabelWrapper);
  
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
      pieChartColor.style.background = `conic-gradient(at center, ${
        conicGradientValueArray.map((each, i) =>
          each.color + ' ' +
          (i > 0 ?
            conicGradientValueArray[i-1].percentage
            :
            0
          ) + '% ' +
          conicGradientValueArray[i].percentage + '%').join(', ')}${(
            conicGradientValueArray[conicGradientValueArray.length-1].percentage < 100) ?
              ', rgb(186, 183, 178) ' + conicGradientValueArray[conicGradientValueArray.length-1].percentage + '% 100%'
              :
              ''})`;
      pieChartWrapper.appendChild(pieChartColor);
  
      const pieChartWhite = document.createElement('div');
      pieChartWhite.classList.add('pie-chart-white');
      pieChartWrapper.appendChild(pieChartWhite);
  
      eachGraphContentDataWrapper.appendChild(pieChartWrapper);
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
  
      eachGraphContentDataWrapper.appendChild(barChartWrapper);
    }
  } else {
    const pieChartWrapper = document.createElement('div');
    pieChartWrapper.classList.add('pie-chart-wrapper');

    const pieChartColor = document.createElement('div');
    pieChartColor.classList.add('pie-chart-color');
    pieChartColor.classList.add('pie-chart-color-default');
    pieChartColor.style.cursor = 'default';
    pieChartWrapper.appendChild(pieChartColor);

    const pieChartWhite = document.createElement('div');
    pieChartWhite.classList.add('pie-chart-white');
    
    const noDataText = document.createElement('span');
    noDataText.classList.add('general-text');
    noDataText.innerHTML = 'No Data';
    pieChartWhite.appendChild(noDataText)

    pieChartWrapper.appendChild(pieChartWhite);

    eachGraphContentDataWrapper.appendChild(pieChartWrapper);
  }

  eachGraphContentWrapper.appendChild(eachGraphContentDataWrapper);

  const eachGraphContentInfoWrapper = document.createElement('div');
  eachGraphContentInfoWrapper.classList.add('each-graph-content-info-wrapper');

  const eachGraphCreatedAt = document.createElement('span');
  eachGraphCreatedAt.classList.add('general-text');
  eachGraphCreatedAt.innerHTML = 'Created At: ' + graph.created_at;
  eachGraphContentInfoWrapper.appendChild(eachGraphCreatedAt);

  const eachGraphStatus = document.createElement('span');
  eachGraphStatus.classList.add('general-text');
  eachGraphStatus.innerHTML = 'Status: ' + (graph.is_active ? 'Active' : 'Paused');
  eachGraphContentInfoWrapper.appendChild(eachGraphStatus);

  const eachGraphTotalCount = document.createElement('span');
  eachGraphTotalCount.classList.add('general-text');
  eachGraphTotalCount.innerHTML = 'Answer Count: ' + (graph.total >= 1000 ? (graph.total >= 1000000 ? (Math.floor(graph.total / 1000000 * 10) / 10  + 'm') : (Math.floor(graph.total / 1000 * 10) / 10  + 'k') ) : graph.total);
  eachGraphContentInfoWrapper.appendChild(eachGraphTotalCount);

  const eachGraphIntegrationPathCount = document.createElement('span');
  eachGraphIntegrationPathCount.classList.add('general-text');
  eachGraphIntegrationPathCount.innerHTML = 'Integrated Path Count: ' + graph.integration_path_id_list.length;
  eachGraphContentInfoWrapper.appendChild(eachGraphIntegrationPathCount);

  const eachGraphButtonsWrapper = document.createElement('div');
  eachGraphButtonsWrapper.classList.add('each-graph-buttons-wrapper');

  const deleteButton = document.createElement('div');
  deleteButton.classList.add('each-graph-button');
  deleteButton.classList.add('each-graph-delete-button');
  deleteButton.style.borderColor = 'rgb(237, 72, 80)';
  const deleteButtonI = document.createElement('i');
  deleteButtonI.classList.add('fas');
  deleteButtonI.classList.add('fa-trash-alt');
  deleteButtonI.style.color = 'rgb(237, 72, 80)';
  deleteButton.appendChild(deleteButtonI);
  const deleteButtonSpan = document.createElement('span');
  deleteButtonSpan.innerHTML = 'Delete';
  deleteButtonSpan.style.color = 'rgb(237, 72, 80)';
  deleteButton.appendChild(deleteButtonSpan);
  eachGraphButtonsWrapper.appendChild(deleteButton);

  const statusButton = document.createElement('div');
  statusButton.classList.add('each-graph-button');
  statusButton.classList.add('each-graph-status-button');
  if (graph.is_active)
    statusButton.classList.add('each-graph-deactivate-button');
  else
    statusButton.classList.add('each-graph-activate-button')
  statusButton.style.borderColor = 'rgba(254, 211, 85, 1)';
  const statusButtonI = document.createElement('i');
  statusButtonI.classList.add('fas');
  if (graph.is_active)
    statusButtonI.classList.add('fa-pause');
  else
    statusButtonI.classList.add('fa-play');
  statusButtonI.style.color = 'rgba(254, 211, 85, 1)';
  statusButton.appendChild(statusButtonI);
  const statusButtonSpan = document.createElement('span');
  if (graph.is_active)
    statusButtonSpan.innerHTML = 'Pause';
  else
    statusButtonSpan.innerHTML = 'Activate';
  statusButtonSpan.style.color = 'rgba(254, 211, 85, 1)';
  statusButton.appendChild(statusButtonSpan);
  eachGraphButtonsWrapper.appendChild(statusButton);

  const integrateButton = document.createElement('div');
  integrateButton.classList.add('each-graph-button');
  integrateButton.classList.add('each-graph-integrate-button');
  integrateButton.style.borderColor = 'rgba(45, 136, 196, 1)';
  const integrateButtonI = document.createElement('i');
  integrateButtonI.classList.add('fas');
  integrateButtonI.classList.add('fa-plus-circle');
  integrateButtonI.style.color = 'rgba(45, 136, 196, 1)';
  integrateButton.appendChild(integrateButtonI);
  const integrateButtonSpan = document.createElement('span');
  integrateButtonSpan.innerHTML = 'Integrate';
  integrateButtonSpan.style.color = 'rgba(45, 136, 196, 1)';
  integrateButton.appendChild(integrateButtonSpan);
  eachGraphButtonsWrapper.appendChild(integrateButton);

  const exportButton = document.createElement('a');
  exportButton.href = '/questions/csv?id=' + graph._id;
  exportButton.classList.add('each-graph-button');
  exportButton.classList.add('each-graph-export-button');
  exportButton.style.borderColor = 'rgba(92, 196, 110, 1)';
  const exportButtonI = document.createElement('i');
  exportButtonI.classList.add('far');
  exportButtonI.classList.add('fa-file-excel');
  exportButtonI.style.color = 'rgba(92, 196, 110, 1)';
  exportButton.appendChild(exportButtonI);
  const exportButtonSpan = document.createElement('span');
  exportButtonSpan.innerHTML = 'Export';
  exportButtonSpan.style.color = 'rgba(92, 196, 110, 1)';
  exportButton.appendChild(exportButtonSpan);
  eachGraphButtonsWrapper.appendChild(exportButton);

  eachGraphContentInfoWrapper.appendChild(eachGraphButtonsWrapper);

  eachGraphContentWrapper.appendChild(eachGraphContentInfoWrapper);

  eachGraphWrapper.appendChild(eachGraphContentWrapper);

  document.querySelector('.graph-outer-wrapper').appendChild(eachGraphWrapper);
};

function createGraphs() {
  document.getElementById('loading-data-wrapper').style.display = 'flex';
  document.getElementById('no-data-wrapper').style.display = 'none';
  document.getElementById('graph-wrapper').style.display = 'none';

  loadGraphData(err => {
    document.getElementById('loading-data-wrapper').style.display = 'none';

    if (err || !graphs.length)
      return document.getElementById('no-data-wrapper').style.display = 'flex';

    document.getElementById('graph-wrapper').style.display = 'flex';

    graphs.forEach(graph => createGraph(graph));
  });
};

function createSelectedIntegrationPath(integrationPathId, callback) {
  serverRequest('/integration?id=' + integrationPathId, 'GET', {}, res => {
    if (!res.success) return callback(res.error || 'unknown_error');

    const integrationPath = res.integration_path;

    const wrapper = document.getElementById('integration-paths-selected-items-wrapper');

    const integrationPathWrapper = document.createElement('div');
    integrationPathWrapper.classList.add('general-each-selected-item-wrapper');
    integrationPathWrapper.id = 'selected_id_' + integrationPath._id;
  
    const span = document.createElement('span');
    span.innerHTML = integrationPath.name + ' (' + integrationPath.path + ')';
    integrationPathWrapper.appendChild(span);
  
    const i = document.createElement('i');
    i.classList.add('fas');
    i.classList.add('fa-trash-alt');
    i.classList.add('create-question-selected-integration-path-delete-button');
    integrationPathWrapper.appendChild(i);
  
    wrapper.appendChild(integrationPathWrapper);

    return callback(null);
  });
};

function createSearchIntegrationPath(integrationPathId, callback) {
  serverRequest('/integration?id=' + integrationPathId, 'GET', {}, res => {
    if (!res.success) return callback(res.error || 'unknown_error');

    const integrationPath = res.integration_path;

    const wrapper = document.getElementById('integration-paths-search-items-wrapper');

    const integrationPathWrapper = document.createElement('div');
    integrationPathWrapper.classList.add('general-each-search-item-wrapper');
    integrationPathWrapper.id = 'search_id_' + integrationPath._id;
  
    const name = document.createElement('span');
    name.classList.add('general-each-search-item-name');
    name.innerHTML = integrationPath.name;
    integrationPathWrapper.appendChild(name);

    const path = document.createElement('span');
    path.classList.add('general-text');
    path.innerHTML = 'Path: ' + integrationPath.path;
    integrationPathWrapper.appendChild(path);

    const generalTextLine = document.createElement('div');
    generalTextLine.classList.add('general-text-line');

    const smallButton = document.createElement('div');
    smallButton.classList.add('general-small-button');
    smallButton.classList.add('create-question-select-each-integration-path-button');
    smallButton.innerHTML = 'Select';
    generalTextLine.appendChild(smallButton);

    if (integrationPath.type != 'product') {
      const i = document.createElement('i');
      i.classList.add('fas');
      i.classList.add('fa-trash-alt');
      i.classList.add('general-each-search-item-delete-button');
      i.classList.add('create-question-delete-integration-path-button');
      generalTextLine.appendChild(i);
    }

    integrationPathWrapper.appendChild(generalTextLine);
  
    wrapper.appendChild(integrationPathWrapper);

    while(integrationPathWrapper.previousElementSibling)
      wrapper.insertBefore(integrationPathWrapper, integrationPathWrapper.previousElementSibling);

    return callback(null);
  });
};

function createSearchProduct(id) {
  serverRequest('/product?id=' + id, 'GET', {}, res => {
    if (!res.success)
      return throwError(res.error);

    const product = res.product;

    const wrapper = document.getElementById('products-search-items-wrapper');

    const productWrapper = document.createElement('div');
    productWrapper.classList.add('general-each-search-item-wrapper');
    productWrapper.id = product._id;
  
    const name = document.createElement('span');
    name.classList.add('general-each-search-item-name');
    name.innerHTML = product.name;
    productWrapper.appendChild(name);

    const path = document.createElement('span');
    path.classList.add('general-text');
    path.innerHTML = 'Path: ' + product.path;
    productWrapper.appendChild(path);

    const generalTextLine = document.createElement('div');
    generalTextLine.classList.add('general-text-line');

    const smallButton = document.createElement('div');
    smallButton.classList.add('general-small-button');
    smallButton.classList.add('create-question-select-each-product-button');
    smallButton.innerHTML = 'Select';
    generalTextLine.appendChild(smallButton);

    const i = document.createElement('i');
    i.classList.add('fas');
    i.classList.add('fa-trash-alt');
    i.classList.add('general-each-search-item-delete-button');
    i.classList.add('create-question-delete-product-button');
    generalTextLine.appendChild(i);

    productWrapper.appendChild(generalTextLine);
  
    wrapper.appendChild(productWrapper);

    while(productWrapper.previousElementSibling)
      wrapper.insertBefore(productWrapper, productWrapper.previousElementSibling);
  });
};

function createProductTemplates(id) {
  const wrapper = document.getElementById('product-templates-wrapper');
  wrapper.innerHTML = '';

  serverRequest('/product/templates?id=' + id, 'GET', {}, res => {
    if (!res.success)
      return throwError(res.error);

    const templates = res.templates;

    templates.forEach(template => {
      const templateWrapper = document.createElement('div');
      templateWrapper.classList.add('general-each-search-item-wrapper');
      templateWrapper.id = template._id;

      const templateName = document.createElement('span');
      templateName.classList.add('general-each-search-item-name');
      templateName.innerHTML = template.name;
      templateWrapper.appendChild(templateName);

      const templateRefreshingTime = document.createElement('span');
      templateRefreshingTime.classList.add('general-text');
      templateRefreshingTime.innerHTML = `Template Refreshing Time: ${template.timeout_duration_in_week} weeks`;
      templateWrapper.appendChild(templateRefreshingTime);

      const templateQuestion = document.createElement('span');
      templateQuestion.classList.add('general-text');
      templateQuestion.innerHTML = `Question Asked: ${template.text}`;
      templateWrapper.appendChild(templateQuestion);

      if (template.subtype == 'single' || template.subtype == 'multiple') {
        template.choices.forEach(choice => {
          const eachChoice = document.createElement('span');
          eachChoice.classList.add('general-text');
          eachChoice.style.marginLeft = '5px';
          eachChoice.innerHTML = `• ${choice}`;
          templateWrapper.appendChild(eachChoice);
        });
      }

      if (template.min_value && template.max_value) {
        const templateRange = document.createElement('span');
        templateRange.classList.add('general-text');
        templateRange.style.marginLeft = '5px';
        templateRange.innerHTML = `Answer should be in range from ${template.min_value} to #{template.max_value}, inclusive`;
        templateWrapper.appendChild(templateRange);
      }

      const templateSelectButton = document.createElement('div');
      templateSelectButton.classList.add('general-small-button');
      templateSelectButton.classList.add('create-question-select-each-product-template-button')
      templateSelectButton.innerHTML = 'Select';
      templateWrapper.appendChild(templateSelectButton);

      wrapper.appendChild(templateWrapper);
    });
  });
};

function updateIntegrationPathSelectFormDesign() {
  const stepsWrapper = document.getElementById('select-integration-path-steps-wrapper');
  
  if (newQuestion.type == 'product') {
    if (stepsWrapper.childElementCount == 5) {
      const stepLine = document.createElement('div');
      stepLine.classList.add('general-form-each-step-line');
      stepLine.classList.add('general-form-each-step-line-finished');
      stepsWrapper.appendChild(stepLine);

      const step = document.createElement('span');
      step.classList.add('general-form-each-step');
      step.classList.add('general-form-each-step-finished');
      step.innerHTML = 4;
      stepsWrapper.appendChild(step);
    }
  } else {
    if (stepsWrapper.childElementCount == 7)  {
      stepsWrapper.childNodes[6].remove();
      stepsWrapper.childNodes[5].remove();
    }
  }
}

window.addEventListener('load', () => {
  pieChartColors = JSON.parse(document.getElementById('pie-chart-colors').value);

  createGraphs();

  const dataContentWrapper = document.getElementById('data-content-wrapper');
  const analysisContentWrapper = document.getElementById('analysis-content-wrapper');
  const bannerContentWrapper = document.getElementById('banner-content-wrapper');

  document.addEventListener('click', event => {
    if (event.target.classList.contains('each-all-header-button') && !event.target.classList.contains('each-all-header-button-selected')) {
      document.querySelector('.each-all-header-button-selected').classList.remove('each-all-header-button-selected');
      event.target.classList.add('each-all-header-button-selected');

      dataContentWrapper.style.display = 'none';
      analysisContentWrapper.style.display = 'none';
      bannerContentWrapper.style.display = 'none';

      if (event.target.id == 'data-button')
        dataContentWrapper.style.display = 'flex';
      else if (event.target.id == 'analysis-button')
        analysisContentWrapper.style.display = 'flex';
      else if (event.target.id == 'banner-button')
        bannerContentWrapper.style.display = 'flex';
    }

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

    if (event.target.classList.contains('each-graph-delete-button') || event.target.parentNode.classList.contains('each-graph-delete-button')) {
      const target = event.target.classList.contains('each-graph-delete-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.parentNode.parentNode.parentNode.id;

      createConfirm({
        title: 'Are you sure you want to delete this question?',
        text: 'This action cannot be taken back. Once you delete, you will loose access to all of the data that Usersmagic has collected from your customers. If you have a Target Group using this question, it will continue to exist, but new customers will no longer be selected for this Target Group.',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (!res) return;

        serverRequest('/questions/delete?id=' + id, 'GET', {}, res => {
          if (!res.success)
            return throwError(res.error);

          target.parentNode.parentNode.parentNode.parentNode.remove();
        });
      });
    }

    if (event.target.classList.contains('each-graph-deactivate-button') || event.target.parentNode.classList.contains('each-graph-deactivate-button')) {
      const target = event.target.classList.contains('each-graph-deactivate-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.parentNode.parentNode.parentNode.id;

      serverRequest('/questions/deactivate?id=' + id, 'GET', {}, res => {
        if (!res.success)
          return throwError(res.error);

        target.classList.remove('each-graph-deactivate-button');
        target.classList.add('each-graph-activate-button');
        target.childNodes[0].classList.remove('fa-pause');
        target.childNodes[0].classList.add('fa-play');
        target.childNodes[1].innerHTML = 'Activate';
      });
    }

    if (event.target.classList.contains('each-graph-activate-button') || event.target.parentNode.classList.contains('each-graph-activate-button')) {
      const target = event.target.classList.contains('each-graph-activate-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.parentNode.parentNode.parentNode.id;

      serverRequest('/questions/activate?id=' + id, 'GET', {}, res => {
        if (!res.success)
          return throwError(res.error);

        target.classList.remove('each-graph-activate-button');
        target.classList.add('each-graph-deactivate-button');
        target.childNodes[0].classList.remove('fa-play');
        target.childNodes[0].classList.add('fa-pause');
        target.childNodes[1].innerHTML = 'Pause';
      });
    }

    if (event.target.classList.contains('create-question-button')) {
      document.getElementById('create-question-form-outer-wrapper').style.display = 'flex';
    }

    if (event.target.classList.contains('each-question-type-wrapper') || event.target.parentNode.classList.contains('each-question-type-wrapper')) {
      const target = event.target.classList.contains('each-question-type-wrapper') ? event.target : event.target.parentNode;

      document.getElementById('question-type-form').style.display = 'none';

      if (target.id == 'question-type-demographics-button') {
        newQuestion.type = 'demographics';
        document.getElementById('demographics-template-form').style.display = 'flex';
      } else if (target.id == 'question-type-brand-button') {
        newQuestion.type = 'brand';
        document.getElementById('brand-template-form').style.display = 'flex';
      } else if (target.id == 'question-type-product-button') {
        newQuestion.type = 'product';
        document.getElementById('product-select-form').style.display = 'flex';
      }
    }

    if (event.target.classList.contains('create-question-back-to-question-type-button')) {
      document.getElementById('demographics-template-form').style.display = 'none';
      document.getElementById('brand-template-form').style.display = 'none';
      document.getElementById('product-select-form').style.display = 'none';
      document.getElementById('question-type-form').style.display = 'flex';
    }

    if (event.target.classList.contains('create-question-select-each-template-button')) {
      newQuestion.template_id = event.target.parentNode.id;
      document.getElementById('demographics-template-form').style.display = 'none';
      document.getElementById('brand-template-form').style.display = 'none';
      document.getElementById('select-integration-path-form').style.display = 'flex';
      updateIntegrationPathSelectFormDesign();
    }

    if (event.target.classList.contains('create-integration-path-open-form-button')) {
      document.getElementById('create-question-form-outer-wrapper').style.display = 'none';
      document.getElementById('create-integration-path-form-outer-wrapper').style.display = 'flex';
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

    if (event.target.id == 'create-integration-path-button') {
      const name = document.getElementById('integration-path-name-input').value.trim();
      const path = document.getElementById('integration-path-link-input').value.trim();
      const error = document.getElementById('create-integration-path-error');

      error.innerHTML = '';

      if (!name || !name.length)
        return error.innerHTML = 'Please write a name for your integration path.';

      if (!path || !path.link)
        return error.innerHTML = 'Please write the link of your integration path.'

      serverRequest('/integration/create', 'POST', {
        type: 'page',
        name,
        path
      }, res => {
        if (!res.success && res.error == 'duplicated_unique_field')
          return error.innerHTML = 'An integration path with this name alreadt exists.';
        if (!res.success)
          return error.innerHTML = 'An unknown error occured, please try again later.';

        createSelectedIntegrationPath(res.id, err => {
          if (err) return throwError(err);

          document.getElementById('create-integration-path-form-outer-wrapper').style.display = 'none';
          document.getElementById('create-question-form-outer-wrapper').style.display = 'flex';
        });
      });
    }

    if (event.target.id == 'create-integration-path-back-button') {
      document.getElementById('create-question-form-outer-wrapper').style.display = 'flex';
      document.getElementById('create-integration-path-form-outer-wrapper').style.display = 'none';
    }

    if (event.target.classList.contains('create-question-select-each-integration-path-button')) {
      const id = event.target.parentNode.parentNode.id.replace('search_id_', '');

      createSelectedIntegrationPath(id, err => {
        if (err) return throwError(err);

        newQuestion.integration_path_id_list.push(id);
        event.target.parentNode.parentNode.remove();
      });
    }

    if (event.target.classList.contains('create-question-selected-integration-path-delete-button')) {
      const id = event.target.parentNode.id.replace('selected_id_', '');

      createSearchIntegrationPath(id, err => {
        if (err) return throwError(err);

        newQuestion.integration_path_id_list = newQuestion.integration_path_id_list.filter(each => each != id);
        event.target.parentNode.remove();
      });
    }

    if (event.target.classList.contains('create-question-delete-integration-path-button')) {
      createConfirm({
        title: 'Are you sure you want to delete this integration path?',
        text: 'This action cannot be taken back. Please make sure you will not use this integation path.',
        accept: 'Delete',
        reject: 'Cancel'
      }, res => {
        if (!res) return;

        const id = event.target.parentNode.parentNode.id.replace('search_id_', '');

        serverRequest('/integration/delete?id=' + id, 'GET', {}, res => {
          if (res.error == 'document_still_used')
            return createConfirm({
              title: 'This integration path cannot be deleted',
              text: 'Apparently one or more questions are still using this integration path. Please remove this path from every question before you delete it.',
              reject: 'Close'
            }, res => {});
          if (!res.success)
            return throwError(res.error);
          
          event.target.parentNode.parentNode.remove();
        });
      });
    }

    if (event.target.id == 'create-product-open-form-button') {
      document.getElementById('create-question-form-outer-wrapper').style.display = 'none';
      document.getElementById('create-product-form-outer-wrapper').style.display = 'flex';
    }

    if (event.target.id == 'create-product-back-button') {
      document.getElementById('create-question-form-outer-wrapper').style.display = 'flex';
      document.getElementById('create-product-form-outer-wrapper').style.display = 'none';
    }

    if (event.target.id == 'create-product-button') {
      const name = document.getElementById('product-name-input').value.trim();
      const path = document.getElementById('product-link-input').value.trim();
      const error = document.getElementById('create-product-error');

      error.innerHTML = '';

      if (!name || !name.length)
        return error.innerHTML = 'Please write a name for your product.';

      if (!path || !path.link)
        return error.innerHTML = 'Please write the link of your product.'

      serverRequest('/product/create', 'POST', {
        name,
        path
      }, res => {
        if (!res.success)
          return error.innerHTML = 'An unknown error occured, please try again later.';

        newQuestion.product_id = res.id;
        document.getElementById('create-question-form-outer-wrapper').style.display = 'flex';
        document.getElementById('create-product-form-outer-wrapper').style.display = 'none';
        document.getElementById('product-template-form').style.display = 'flex';
        document.getElementById('product-select-form').style.display = 'none';
        createProductTemplates(res.id);
        createSearchProduct(res.id);
      });
    }

    if (event.target.classList.contains('create-question-select-each-product-button')) {
      const id = event.target.parentNode.parentNode.id;
      newQuestion.product_id = id;
      createProductTemplates(id);
      document.getElementById('product-template-form').style.display = 'flex';
      document.getElementById('product-select-form').style.display = 'none';
    }

    if (event.target.classList.contains('create-question-product-template-back-button')) {
      document.getElementById('product-template-form').style.display = 'none';
      document.getElementById('product-select-form').style.display = 'flex';
    }

    if (event.target.classList.contains('create-question-select-each-product-template-button')) {
      const id = event.target.parentNode.id;
      newQuestion.template_id = id;
      document.getElementById('product-template-form').style.display = 'none';
      document.getElementById('select-integration-path-form').style.display = 'flex';
      updateIntegrationPathSelectFormDesign();
    }

    if (event.target.id == 'create-question-integration-path-back-button') {
      document.getElementById(`${newQuestion.type}-template-form`).style.display = 'flex';
      document.getElementById('select-integration-path-form').style.display = 'none';
    }

    if (event.target.classList.contains('create-question-finish-button')) {
      if (newQuestion.type == 'demographics' || newQuestion.type == 'brand') {
        document.getElementById('integration-path-error').innerHTML = '';

        if (!newQuestion.integration_path_id_list || !newQuestion.integration_path_id_list.length)
          return document.getElementById('integration-path-error').innerHTML = 'Please select at least one integration path to ask your question';

        serverRequest('/questions/create', 'POST', {
          template_id: newQuestion.template_id,
          integration_path_id_list: newQuestion.integration_path_id_list,
          created_at: getDate()
        }, res => {
          if (!res.success)
            return throwError(res.error);

          location.reload();
        });
      } else if (newQuestion.type == 'product') {
        document.getElementById('integration-path-error').innerHTML = '';

        serverRequest('/questions/create', 'POST', {
          template_id: newQuestion.template_id,
          product_id: newQuestion.product_id,
          integration_path_id_list: newQuestion.integration_path_id_list,
          created_at: getDate()
        }, res => {
          if (!res.success)
            return throwError(res.error);

          location.reload();
        });
      }
    }

    // if (event.target.id == 'create-target-group-button') {
    //   document.getElementById('create-target-group-form-outer-wrapper').style.display = 'flex';
    // }
  });

  document.addEventListener('mouseover', event => {
    if (event.target.classList.contains('pie-chart-color') && !event.target.classList.contains('pie-chart-color-default')) {
      const graphWrapper = event.target.parentNode.parentNode.parentNode.parentNode;
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
});
