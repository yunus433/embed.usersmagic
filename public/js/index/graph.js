let graphs = [];
let loadingGraphs = false;
let filters = {};
let graphInfoId;

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

window.addEventListener('load', () => {
  createGraphs();

  document.addEventListener('click', event => {
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

    if (event.target.classList.contains('each-graph-integrate-button') || event.target.parentNode.classList.contains('each-graph-integrate-button')) {
      const target = event.target.classList.contains('each-graph-integrate-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.parentNode.parentNode.parentNode.id;

      selectIntegrationPath({
        title: 'Update Question',
        stepCount: 0,
        questionId: id
      }, (res, integration_paths) => {
        if (!res) return;

        serverRequest('/questions/integrate?id=' + id, 'POST', {
          integration_path_id_list: integration_paths
        }, res => {
          if (!res.success)
            return throwError(res.error);

          serverRequest('/questions?id=' + id, 'GET', {}, res => {
            if (!res.success)
              return throwError(res.error);
  
            const question = res.question;
            const questionWrapper = document.getElementById(id);
            questionWrapper.childNodes[1].childNodes[1].childNodes[3].innerHTML = 'Integrated Path Count: ' + question.integration_path_id_list.length;
          });
        })
      });
    }
  });

  document.addEventListener('mouseover', event => {
    if (event.target.classList.contains('pie-chart-color') && !event.target.classList.contains('pie-chart-color-default') && !event.target.classList.contains('banner-pie-chart-color')) {
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
    }
    else if (!event.target.classList.contains('graph-info') && document.querySelector('.graph-info')) {
      document.querySelector('.graph-info').remove();
      graphInfoId = null;
    }
  });
});