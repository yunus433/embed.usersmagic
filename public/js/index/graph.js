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
  document.querySelector('.graph-outer-wrapper').appendChild(eachGraphWrapper);

  const eachGraphTitleWrapper = document.createElement('div');
  eachGraphTitleWrapper.classList.add('each-graph-title-wrapper');

  const eachGraphPausedIcon = document.createElement('span');
  eachGraphPausedIcon.classList.add('each-graph-paused-icon');
  eachGraphPausedIcon.innerHTML = 'Paused';
  eachGraphTitleWrapper.appendChild(eachGraphPausedIcon);

  const eachGraphTitleInnerWrapper = document.createElement('div');
  eachGraphTitleInnerWrapper.classList.add('each-graph-title-inner-wrapper');

  if (graph.is_active) {
    eachGraphPausedIcon.style.width = '0px';
    eachGraphPausedIcon.style.marginRight = '0px';
    eachGraphPausedIcon.style.border = 'none';
    eachGraphTitleInnerWrapper.style.width = (eachGraphWrapper.offsetWidth - 30 - 44) + 'px';
  }

  const eachGraphTitle = document.createElement('span');
  eachGraphTitle.classList.add('general-subtitle');
  eachGraphTitle.classList.add('general-text-overflow');
  eachGraphTitle.innerHTML = graph.title;
  eachGraphTitleInnerWrapper.appendChild(eachGraphTitle);

  const eachGraphSubtitle = document.createElement('span');
  eachGraphSubtitle.classList.add('general-text');
  eachGraphSubtitle.classList.add('general-text-overflow');
  eachGraphSubtitle.innerHTML = graph.description;
  eachGraphTitleInnerWrapper.appendChild(eachGraphSubtitle);

  eachGraphTitleWrapper.appendChild(eachGraphTitleInnerWrapper);

  const eachGraphOptionsButton = document.createElement('span');
  eachGraphOptionsButton.classList.add('each-graph-options-button');
  eachGraphOptionsButton.innerHTML = '•••';
  eachGraphTitleWrapper.appendChild(eachGraphOptionsButton);

  eachGraphWrapper.appendChild(eachGraphTitleWrapper);

  const eachGraphContentWrapper = document.createElement('div');
  eachGraphContentWrapper.classList.add('each-graph-content-wrapper');

  const eachGraphContentDataWrapper = document.createElement('div');
  eachGraphContentDataWrapper.classList.add('each-graph-content-data-wrapper');

  if (graph.data && graph.data.length && graph.data[0].value) {
    if (graph.type == 'pie_chart') {
      let conicGradientValueArray = [];
  
      for (let i = 0; i < graph.data.length && graph.data[i].value > 0; i++) {
        const lastPercentage = i > 0 ? conicGradientValueArray[conicGradientValueArray.length-1].percentage : 0;
  
        conicGradientValueArray.push({ color: pieChartColors[i % pieChartColors.length], percentage: lastPercentage + (graph.data[i].value / graph.total * 100) });
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
          ) + '% ' + (conicGradientValueArray[i].percentage - 0.5) + '%'
        ).join(', ')}`;
      pieChartWrapper.appendChild(pieChartColor);
  
      const pieChartWhite = document.createElement('div');
      pieChartWhite.classList.add('pie-chart-white');
      const pieChartAnswerCount = document.createElement('span');
      pieChartAnswerCount.classList.add('pie-chart-answer-count');
      pieChartAnswerCount.innerHTML = graph.total;
      pieChartWhite.appendChild(pieChartAnswerCount);
      const pieChartAnswersText = document.createElement('span');
      pieChartAnswersText.classList.add('general-text');
      pieChartAnswersText.innerHTML = graph.total > 1 ? 'answers' : 'answer';
      pieChartWhite.appendChild(pieChartAnswersText);
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

  if (graph.data && graph.data.length && graph.data[0].value) {
    const eachGraphContentInfoTitle = document.createElement('div');
    eachGraphContentInfoTitle.classList.add('each-graph-content-info-title');
    const countTitle = document.createElement('span');
    countTitle.innerHTML = 'count';
    eachGraphContentInfoTitle.appendChild(countTitle);
    const percentTitle = document.createElement('span');
    percentTitle.innerHTML = 'rate (%)';
    eachGraphContentInfoTitle.appendChild(percentTitle);
    eachGraphContentInfoWrapper.appendChild(eachGraphContentInfoTitle);

    const eachGraphContentInfoItemOuterWrapper = document.createElement('div');
    eachGraphContentInfoItemOuterWrapper.classList.add('each-graph-content-info-item-outer-wrapper');

    for (let i = 0; i < graph.data.length; i++) {
      const eachGraphContentInfoItemWrapper = document.createElement('div');
      eachGraphContentInfoItemWrapper.classList.add('each-graph-content-info-item-wrapper');

      const eachGraphContentInfoItemColor = document.createElement('div');
      eachGraphContentInfoItemColor.classList.add('each-graph-content-info-item-color');
      eachGraphContentInfoItemColor.style.backgroundColor = pieChartColors[i % pieChartColors.length];
      eachGraphContentInfoItemWrapper.appendChild(eachGraphContentInfoItemColor);

      const eachGraphContentInfoItemTitle = document.createElement('span');
      eachGraphContentInfoItemTitle.classList.add('each-graph-content-info-item-title');
      eachGraphContentInfoItemTitle.innerHTML = graph.data[i].name;
      eachGraphContentInfoItemWrapper.appendChild(eachGraphContentInfoItemTitle);

      const eachGraphContentInfoItemCount = document.createElement('span');
      eachGraphContentInfoItemCount.classList.add('each-graph-content-info-item-count');
      eachGraphContentInfoItemCount.innerHTML = graph.data[i].value;
      eachGraphContentInfoItemWrapper.appendChild(eachGraphContentInfoItemCount);

      const eachGraphContentInfoItemRate = document.createElement('span');
      eachGraphContentInfoItemRate.classList.add('each-graph-content-info-item-rate');
      eachGraphContentInfoItemRate.innerHTML = Math.round(graph.data[i].value / graph.total * 1000) / 10;
      eachGraphContentInfoItemWrapper.appendChild(eachGraphContentInfoItemRate);

      eachGraphContentInfoItemOuterWrapper.appendChild(eachGraphContentInfoItemWrapper);
    }

    eachGraphContentInfoWrapper.appendChild(eachGraphContentInfoItemOuterWrapper);

    // const eachGraphGoDetailsButton = document.createElement('div');
    // eachGraphGoDetailsButton.classList.add('each-graph-go-details-button');
    // const eachGraphGoDetailsButtonSpan = document.createElement('span');
    // eachGraphGoDetailsButtonSpan.innerHTML = 'See Details';
    // eachGraphGoDetailsButton.appendChild(eachGraphGoDetailsButtonSpan);
    // const eachGraphGoDetailsButtonI = document.createElement('span');
    // eachGraphGoDetailsButtonI.classList.add('fas');
    // eachGraphGoDetailsButtonI.classList.add('fa-chevron-right');
    // eachGraphGoDetailsButton.appendChild(eachGraphGoDetailsButtonI);
    // eachGraphContentInfoWrapper.appendChild(eachGraphGoDetailsButton);
  } else {
    const eachGraphInfoNoDataText = document.createElement('span');
    eachGraphInfoNoDataText.classList.add('each-graph-info-no-data-text');
    eachGraphInfoNoDataText.innerHTML = 'Integrating your question on more pages may help you collect more responses.';
    eachGraphContentInfoWrapper.appendChild(eachGraphInfoNoDataText);
  }

  eachGraphContentWrapper.appendChild(eachGraphContentInfoWrapper);

  eachGraphWrapper.appendChild(eachGraphContentWrapper);
};

function createGraphTitle(graph) {
  const wrapper = document.getElementById('graph-navigation-bar-title-wrapper');

  const eachGraphTitle = document.createElement('span');
  eachGraphTitle.id = 'graph-navigation-bar-title-id-' + graph._id;
  eachGraphTitle.classList.add('each-navigation-bar-title');
  eachGraphTitle.classList.add('general-text-overflow');
  eachGraphTitle.innerHTML = '-> ' + graph.title;
  wrapper.appendChild(eachGraphTitle);
}

function createGraphs() {
  document.getElementById('loading-data-wrapper').style.display = 'flex';
  document.getElementById('no-data-wrapper').style.display = 'none';
  document.getElementById('graph-wrapper').style.display = 'none';

  loadGraphData(err => {
    document.getElementById('loading-data-wrapper').style.display = 'none';

    if (err || !graphs.length)
      return document.getElementById('no-data-wrapper').style.display = 'flex';

    document.getElementById('graph-wrapper').style.display = 'flex';

    graphs.forEach(graph => {
      createGraph(graph);
      createGraphTitle(graph);
    });
  });
};

function createGraphOptionsMenu(id, x, y) {
  const graph = graphs.find(each => each._id == id);

  const eachGraphOptionsMenu = document.createElement('div');
  eachGraphOptionsMenu.id = 'graph-options-id-' + id;
  eachGraphOptionsMenu.classList.add('each-graph-options-menu');
  eachGraphOptionsMenu.style.left = (x - 120) + 'px';
  eachGraphOptionsMenu.style.top = (y + 10) + 'px';

  const eachGraphStatusButton = document.createElement('div');
  if (graph.is_active)
    eachGraphStatusButton.classList.add('each-graph-deactivate-button');
  else
    eachGraphStatusButton.classList.add('each-graph-activate-button');
  eachGraphStatusButton.classList.add('each-graph-option-button');
  const eachGraphStatusButtonI = document.createElement('i');
  eachGraphStatusButtonI.classList.add('fas');
  if (graph.is_active)
    eachGraphStatusButtonI.classList.add('fa-pause');
  else
    eachGraphStatusButtonI.classList.add('fa-play');
  const eachGraphStatusButtonText = document.createElement('span');
  eachGraphStatusButton.appendChild(eachGraphStatusButtonI);
  if (graph.is_active)
    eachGraphStatusButtonText.innerHTML = 'Pause';
  else
    eachGraphStatusButtonText.innerHTML = 'Activate';
  eachGraphStatusButton.appendChild(eachGraphStatusButtonText);
  eachGraphOptionsMenu.appendChild(eachGraphStatusButton);

  // const eachGraphEditButton = document.createElement('div');
  // eachGraphEditButton.classList.add('each-graph-edit-button');
  // eachGraphEditButton.classList.add('each-graph-option-button');
  // const eachGraphEditButtonI = document.createElement('i');
  // eachGraphEditButtonI.classList.add('fas');
  // eachGraphEditButtonI.classList.add('fa-edit');
  // const eachGraphEditButtonText = document.createElement('span');
  // eachGraphEditButton.appendChild(eachGraphEditButtonI);
  // eachGraphEditButtonText.innerHTML = 'Edit';
  // eachGraphEditButton.appendChild(eachGraphEditButtonText);
  // eachGraphOptionsMenu.appendChild(eachGraphEditButton);

  const eachGraphExportButton = document.createElement('div');
  eachGraphExportButton.classList.add('each-graph-export-button');
  eachGraphExportButton.classList.add('each-graph-option-button');
  const eachGraphExportButtonI = document.createElement('i');
  eachGraphExportButtonI.classList.add('far');
  eachGraphExportButtonI.classList.add('fa-file-excel');
  const eachGraphExportButtonText = document.createElement('span');
  eachGraphExportButton.appendChild(eachGraphExportButtonI);
  eachGraphExportButtonText.innerHTML = 'Export';
  eachGraphExportButton.appendChild(eachGraphExportButtonText);
  eachGraphOptionsMenu.appendChild(eachGraphExportButton);

  // const eachGraphReloadButton = document.createElement('div');
  // eachGraphReloadButton.classList.add('each-graph-reload-button');
  // eachGraphReloadButton.classList.add('each-graph-option-button');
  // const eachGraphReloadButtonI = document.createElement('i');
  // eachGraphReloadButtonI.classList.add('fas');
  // eachGraphReloadButtonI.classList.add('fa-redo');
  // const eachGraphReloadButtonText = document.createElement('span');
  // eachGraphReloadButton.appendChild(eachGraphReloadButtonI);
  // eachGraphReloadButtonText.innerHTML = 'Reload';
  // eachGraphReloadButton.appendChild(eachGraphReloadButtonText);
  // eachGraphOptionsMenu.appendChild(eachGraphReloadButton);

  const eachGraphDeleteButton = document.createElement('div');
  eachGraphDeleteButton.classList.add('each-graph-delete-button');
  eachGraphDeleteButton.classList.add('each-graph-delete-button');
  const eachGraphDeleteButtonI = document.createElement('i');
  eachGraphDeleteButtonI.classList.add('fas');
  eachGraphDeleteButtonI.classList.add('fa-trash');
  const eachGraphDeleteButtonText = document.createElement('span');
  eachGraphDeleteButton.appendChild(eachGraphDeleteButtonI);
  eachGraphDeleteButtonText.innerHTML = 'Delete';
  eachGraphDeleteButton.appendChild(eachGraphDeleteButtonText);
  eachGraphOptionsMenu.appendChild(eachGraphDeleteButton);

  document.querySelector('body').appendChild(eachGraphOptionsMenu);
}

window.addEventListener('load', () => {
  setTimeout(() => {
    createGraphs();
  }, 200);

  document.addEventListener('click', event => {
    if (event.target.classList.contains('each-graph-options-button')) {
      const id = event.target.parentNode.parentNode.id;

      if (document.querySelector('.each-graph-options-menu'))
        document.querySelector('.each-graph-options-menu').remove();

      createGraphOptionsMenu(id, event.target.getBoundingClientRect().right, event.target.getBoundingClientRect().bottom)
    } else if (!event.target.classList.contains('each-graph-options-menu') && !event.target.parentNode.classList.contains('each-graph-options-menu') && !event.target.parentNode.parentNode.classList.contains('each-graph-options-menu')) {
      if (document.querySelector('.each-graph-options-menu'))
        document.querySelector('.each-graph-options-menu').remove();
    }

    if (event.target.classList.contains('each-graph-delete-button') || event.target.parentNode.classList.contains('each-graph-delete-button')) {
      const target = event.target.classList.contains('each-graph-delete-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.id.replace('graph-options-id-', '');

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

          const graph = document.getElementById(id);
          graph.remove();
        });
      });
    }

    if (event.target.classList.contains('each-graph-deactivate-button') || event.target.parentNode.classList.contains('each-graph-deactivate-button')) {
      const target = event.target.classList.contains('each-graph-deactivate-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.id.replace('graph-options-id-', '');

      serverRequest('/questions/deactivate?id=' + id, 'GET', {}, res => {
        if (!res.success)
          return throwError(res.error);

        target.classList.remove('each-graph-deactivate-button');
        target.classList.add('each-graph-activate-button');
        target.childNodes[0].classList.remove('fa-pause');
        target.childNodes[0].classList.add('fa-play');
        target.childNodes[1].innerHTML = 'Activate';
        const graph = document.getElementById(id);
        graph.childNodes[0].childNodes[0].style.width = '60px';
        graph.childNodes[0].childNodes[0].style.marginRight = '10px';
        graph.childNodes[0].childNodes[0].style.border = '2px solid rgb(140, 212, 224)';
        graph.childNodes[0].childNodes[1].style.width = (graph.offsetWidth - 30 - 114) + 'px';
      });
    }

    if (event.target.classList.contains('each-graph-activate-button') || event.target.parentNode.classList.contains('each-graph-activate-button')) {
      const target = event.target.classList.contains('each-graph-activate-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.id.replace('graph-options-id-', '');

      serverRequest('/questions/activate?id=' + id, 'GET', {}, res => {
        if (!res.success)
          return throwError(res.error);

        target.classList.remove('each-graph-activate-button');
        target.classList.add('each-graph-deactivate-button');
        target.childNodes[0].classList.remove('fa-play');
        target.childNodes[0].classList.add('fa-pause');
        target.childNodes[1].innerHTML = 'Pause';
        const graph = document.getElementById(id);
        graph.childNodes[0].childNodes[0].style.width = '0px';
        graph.childNodes[0].childNodes[0].style.marginRight = '0px';
        graph.childNodes[0].childNodes[0].style.border = 'none';
        graph.childNodes[0].childNodes[1].style.width = (graph.offsetWidth - 30 - 44) + 'px';
      });
    }

    if (event.target.classList.contains('each-graph-export-button') || event.target.parentNode.classList.contains('each-graph-export-button')) {
      const target = event.target.classList.contains('each-graph-activate-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.id.replace('graph-options-id-', '');

      if (is_demo)
        location.href = '/questions/csv/demo?id=' + id;
      else
        location.href = '/questions/csv?id=' + id;
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
    }
    else if (!event.target.classList.contains('graph-info') && document.querySelector('.graph-info')) {
      document.querySelector('.graph-info').remove();
      graphInfoId = null;
    }
  });

  document.querySelector('.graph-outer-wrapper').addEventListener('scroll', event => {
    if (document.querySelector('.each-graph-options-menu'))
      document.querySelector('.each-graph-options-menu').remove();
  });
});
