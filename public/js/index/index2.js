
let banners = [];
let pieChartColors = [];
let loadingGraphs = false;
let filters = {};
let graphInfoId;
let bannerInfoId;
let newQuestion = {
  type: null,
  template_id: null,
  product_id: null,
  integration_path_id_list: []
};
let newTargetGroup = {
  name: '',
  filters: []
};
let newAd = {
  name: '',
  title: '',
  text: '',
  button_text: '',
  button_url: '',
  image_url: '',
  target_group_id: '',
  created_at: ''
};
let currentUpdateQuestionId = null;
let targetGroups = [];
let currentlyOpenForm;

function getDate() {
  return ((new Date()).getDate() < 10 ? '0' : '') + (new Date()).getDate() + '.' + ((new Date()).getMonth() + 1 < 10 ? '0' : '') + ((new Date()).getMonth() + 1) + '.' + (new Date()).getFullYear();
};

function createSelectedIntegrationPath(integrationPathId, callback) {
  serverRequest('/integration?id=' + integrationPathId, 'GET', {}, res => {
    if (!res.success) return callback(res.error || 'unknown_error');

    const integrationPath = res.integration_path;

    const wrapper = document.getElementById(`${currentlyOpenForm}-integration-paths-selected-items-wrapper`);

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

function createSelectedIntegrationPathUpdate(integrationPathId, callback) {
  serverRequest('/integration?id=' + integrationPathId, 'GET', {}, res => {
    if (!res.success) return callback(res.error || 'unknown_error');

    const integrationPath = res.integration_path;

    const selectedItemsWrapper = document.getElementById('update-integration-paths-selected-items-wrapper');

    const integrationPathWrapper = document.createElement('div');
    integrationPathWrapper.classList.add('general-each-selected-item-wrapper');
    integrationPathWrapper.id = 'selected_id_' + integrationPath._id;
  
    const span = document.createElement('span');
    span.innerHTML = integrationPath.name + ' (' + integrationPath.path + ')';
    integrationPathWrapper.appendChild(span);
  
    const i = document.createElement('i');
    i.classList.add('fas');
    i.classList.add('fa-trash-alt');
    i.classList.add('update-question-selected-integration-path-delete-button');
    integrationPathWrapper.appendChild(i);
  
    selectedItemsWrapper.appendChild(integrationPathWrapper);

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



function updateIntegrationPathSelectFormDesign() {
  const stepsWrapper = document.getElementById('select-integration-path-steps-wrapper');
  
  if (newQuestion.type == 'product') {
    serverRequest('/integration/product?product_id=' + newQuestion.product_id, 'GET', {}, res => {
      if (!res.success)
        return throwError(res.error);

      const integrationPath = res.integration_path;

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
    
      if (document.getElementById('product-default-integration-path'))
        document.getElementById('product-default-integration-path').remove();

      const defaultIntegrationPath = document.createElement('div');
      defaultIntegrationPath.classList.add('general-each-selected-item-wrapper');
      defaultIntegrationPath.id = 'product-default-integration-path';
      defaultIntegrationPath.style.marginTop = '10px';
  
      const pathName = document.createElement('span');
      pathName.innerHTML = `${integrationPath.name} (${integrationPath.path})`;
      defaultIntegrationPath.appendChild(pathName);

      const pathDefault = document.createElement('span');
      pathDefault.innerHTML = 'DEFAULT';
      pathDefault.style.fontWeight = '600';
      pathDefault.style.color = 'rgb(156, 156, 156)';
      pathDefault.style.fontSize = '12px';
      defaultIntegrationPath.appendChild(pathDefault);

      const wrapper = document.getElementById('select-integration-path-inner-content');

      wrapper.appendChild(defaultIntegrationPath);

      while (!defaultIntegrationPath.previousElementSibling.classList.contains('create-integration-path-open-form-button')) {
        wrapper.insertBefore(defaultIntegrationPath, defaultIntegrationPath.previousElementSibling);
      }
      wrapper.insertBefore(defaultIntegrationPath, defaultIntegrationPath.previousElementSibling);

      const searchItems = document.getElementById('integration-paths-search-items-wrapper').childNodes;

      for (let i = 0; i < searchItems.length; i++) {
        const id = searchItems[i].id.replace('search_id_', '');
        if (id == integrationPath._id.toString())
          searchItems[i].style.display = 'none';
        else
          searchItems[i].style.display = 'flex';   
      }
    });
  } else {
    if (stepsWrapper.childElementCount == 7)  {
      stepsWrapper.childNodes[6].remove();
      stepsWrapper.childNodes[5].remove();
    }

    if (document.getElementById('product-default-integration-path'))
      document.getElementById('product-default-integration-path').remove();

    const searchItems = document.getElementById('integration-paths-search-items-wrapper').childNodes;

    for (let i = 0; i < searchItems.length; i++) {
      searchItems[i].style.display = 'flex';   
    }
  }
};

function updateQuestionIntegrationPathForm(id) {
  const form = document.getElementById('update-question-integration-form-outer-wrapper');

  serverRequest('/questions?id=' + id, 'GET', {}, res => {
    if (!res.success)
      return throwError(res.error);

    const question = res.question;
  
    if (document.getElementById('product-default-integration-path'))
      document.getElementById('product-default-integration-path').remove();

    const wrapper = document.getElementById('update-question-integration-path-inner-content');
    const selectedItemsWrapper = document.getElementById('update-integration-paths-selected-items-wrapper');

    selectedItemsWrapper.innerHTML = '';

    serverRequest('/questions/integrate?id=' + id, 'GET', {}, res => {
      if (!res.success)
        return throwError(res.error);

      const integrationPaths = res.integration_path_list;

      for (let i = 0; i < integrationPaths.length; i++) {
        const integrationPath = integrationPaths[i];

        if (!integrationPath.product_id || !question.product_id || integrationPath.product_id.toString() != question.product_id.toString()) {
          const integrationPathWrapper = document.createElement('div');
          integrationPathWrapper.classList.add('general-each-selected-item-wrapper');
          integrationPathWrapper.id = 'selected_id_' + integrationPath._id;
        
          const span = document.createElement('span');
          span.innerHTML = integrationPath.name + ' (' + integrationPath.path + ')';
          integrationPathWrapper.appendChild(span);
        
          const i = document.createElement('i');
          i.classList.add('fas');
          i.classList.add('fa-trash-alt');
          i.classList.add('update-question-selected-integration-path-delete-button');
          integrationPathWrapper.appendChild(i);
        
          selectedItemsWrapper.appendChild(integrationPathWrapper);
        }
      }

      if (question.product_id) {
        serverRequest('/integration/product?product_id=' + question.product_id, 'GET', {}, res => {
          const integrationPath = res.integration_path;
  
          const defaultIntegrationPath = document.createElement('div');
          defaultIntegrationPath.classList.add('general-each-selected-item-wrapper');
          defaultIntegrationPath.id = 'product-default-integration-path';
          defaultIntegrationPath.style.marginTop = '10px';
        
          const pathName = document.createElement('span');
          pathName.innerHTML = `${integrationPath.name} (${integrationPath.path})`;
          defaultIntegrationPath.appendChild(pathName);
      
          const pathDefault = document.createElement('span');
          pathDefault.innerHTML = 'DEFAULT';
          pathDefault.style.fontWeight = '600';
          pathDefault.style.color = 'rgb(156, 156, 156)';
          pathDefault.style.fontSize = '12px';
          defaultIntegrationPath.appendChild(pathDefault);
      
          wrapper.appendChild(defaultIntegrationPath);
  
          while (!defaultIntegrationPath.previousElementSibling.classList.contains('create-integration-path-open-form-button')) {
            wrapper.insertBefore(defaultIntegrationPath, defaultIntegrationPath.previousElementSibling);
          }
          wrapper.insertBefore(defaultIntegrationPath, defaultIntegrationPath.previousElementSibling);
  
          const searchItems = document.getElementById('update-integration-paths-search-items-wrapper').childNodes;
  
          for (let i = 0; i < searchItems.length; i++) {
            const id = searchItems[i].id.replace('search_id_', '');
  
            if (question.integration_path_id_list.includes(id.toString()) || id == integrationPath._id.toString())
              searchItems[i].style.display = 'none';
            else
              searchItems[i].style.display = 'flex';   
          }
  
          form.style.display = 'flex';
        });
      } else {
        const searchItems = document.getElementById('update-integration-paths-search-items-wrapper').childNodes;
  
        for (let i = 0; i < searchItems.length; i++) {
          const id = searchItems[i].id.replace('search_id_', '');
  
          if (question.integration_path_id_list.includes(id.toString()))
            searchItems[i].style.display = 'none';
          else
            searchItems[i].style.display = 'flex';   
        }
  
        form.style.display = 'flex';
      }
    });
  });
};

function createSelectedTargetGroupFilter(questionId, allowedAnswers) {
  serverRequest('/questions/format?id=' + questionId, 'GET', {}, res => {
    if (!res.success)
      return throwError(res.error);

    const question = res.question;

    const selectedFilter = document.createElement('div');
    selectedFilter.classList.add('general-each-selected-item-long-wrapper');
    selectedFilter.id = 'selected_id_' + questionId;

    const selectedFilterTitle = document.createElement('span');
    selectedFilterTitle.classList.add('general-each-selected-item-long-title');
    selectedFilterTitle.innerHTML = question.name;
    selectedFilter.appendChild(selectedFilterTitle);

    const selectedFilterText = document.createElement('span');
    selectedFilterText.innerHTML = 'Allowed Answers';
    selectedFilter.appendChild(selectedFilterText);

    for (let i = 0; i < allowedAnswers.length; i++) {
      const eachAllowedAnswer = document.createElement('span');
      eachAllowedAnswer.innerHTML = '- ' + allowedAnswers[i];
      selectedFilter.appendChild(eachAllowedAnswer);
    }

    const deleteButton = document.createElement('i');
    deleteButton.classList.add('fas');
    deleteButton.classList.add('fa-trash-alt');
    deleteButton.classList.add('delete-each-target-group-filter-button');
    selectedFilter.appendChild(deleteButton);

    document.getElementById('create-target-group-selected-items-wrapper').appendChild(selectedFilter);
  });
};

function createNewTargetGroup(id) {
  serverRequest('/target_groups?id=' + id, 'GET', {}, res => {
    if (!res.success)
      return throwError(res.error);

    const target_group = res.target_group;
    const wrapper = document.querySelector('.target-groups-outer-wrapper');

    targetGroups.push(target_group);

    const eachTargetGroupWrapper = document.createElement('div');
    eachTargetGroupWrapper.classList.add('each-target-group-wrapper');

    const eachTargetGroupHeaderWrapper = document.createElement('div');
    eachTargetGroupHeaderWrapper.classList.add('each-target-group-header-wrapper');

    const eachTargetGroupColor = document.createElement('div');
    eachTargetGroupColor.classList.add('each-target-group-color');
    eachTargetGroupColor.style.backgroundColor = pieChartColors[(wrapper.childElementCount + 1) % pieChartColors.length];
    eachTargetGroupHeaderWrapper.appendChild(eachTargetGroupColor);

    const eachTargetGroupName = document.createElement('span');
    eachTargetGroupName.classList.add('general-subtitle');
    eachTargetGroupName.innerHTML = `${target_group.name} - (Estimated Count: ${target_group.estimated_people_count})`;
    eachTargetGroupHeaderWrapper.appendChild(eachTargetGroupName);

    const eachTargetGroupExportButton = document.createElement('a');
    eachTargetGroupExportButton.classList.add('each-target-group-export-button');
    eachTargetGroupExportButton.href = `/target_groups/facebook?id=${target_group._id.toString()}`;
    eachTargetGroupExportButton.innerHTML = 'Facebook Export';

    eachTargetGroupWrapper.appendChild(eachTargetGroupHeaderWrapper);

    const eachTargetGroupContentWrapper = document.createElement('div');
    eachTargetGroupContentWrapper.classList.add('each-target-group-content-wrapper');

    for (let i = 0; i < target_group.filters.length; i++) {
      const filterName = document.createElement('span');
      filterName.classList.add('general-subtitle');
      filterName.innerHTML = target_group.filters[i].name;
      eachTargetGroupContentWrapper.appendChild(filterName);

      const filterAnswers = document.createElement('span');
      filterAnswers.classList.add('general-text');
      filterAnswers.innerHTML = target_group.filters[i].allowed_answers;
      eachTargetGroupContentWrapper.appendChild(filterAnswers);
    }

    eachTargetGroupWrapper.appendChild(eachTargetGroupContentWrapper);    

    wrapper.appendChild(eachTargetGroupWrapper);
  });
}

window.addEventListener('load', () => {
  pieChartColors = JSON.parse(document.getElementById('pie-chart-colors').value);
  targetGroups = JSON.parse(document.getElementById('target-groups').value);
  banners = JSON.parse(document.getElementById('banners').value);

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

    if (event.target.classList.contains('each-graph-integrate-button') || event.target.parentNode.classList.contains('each-graph-integrate-button')) {
      const target = event.target.classList.contains('each-graph-integrate-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.parentNode.parentNode.parentNode.id;

      currentUpdateQuestionId = id;
      updateQuestionIntegrationPathForm(id);
      document.getElementById('update-question-integration-form-outer-wrapper').style.display = 'flex';
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

    if (event.target.classList.contains('delete-integration-path-button')) {
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
          
          const integrationPaths = document.querySelector(`.${id}`);

          for (let i = 0; i < integrationPaths.length; i++)
            integrationPaths[i].remove();
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

    if (event.target.classList.contains('update-question-select-each-integration-path-button')) {
      const id = event.target.parentNode.parentNode.id.replace('search_id_', '');

      createSelectedIntegrationPathUpdate(id, err => {
        if (err) return throwError(err);

        event.target.parentNode.parentNode.style.display = 'none';
      });
    }

    if (event.target.classList.contains('update-question-selected-integration-path-delete-button')) {
      const selectedId = event.target.parentNode.id.replace('selected_id_', '');

      event.target.parentNode.remove();

      const searchItems = document.getElementById('update-integration-paths-search-items-wrapper').childNodes;
  
      for (let i = 0; i < searchItems.length; i++) {
        const id = searchItems[i].id.replace('search_id_', '');
  
        if (selectedId.toString() == id.toString())
          searchItems[i].style.display = 'flex';   
      }
    }

    if (event.target.id == 'update-question-integration-path-back-button') {
      document.getElementById('update-question-integration-form-outer-wrapper').style.display = 'none';
    }

    if (event.target.id == 'update-question-integration-path-save-button') {
      const integrationPathIdList = [];
      const integrationPathSelectedItems = document.getElementById('update-integration-paths-selected-items-wrapper').children;

      for (let i = 0; i < integrationPathSelectedItems.length; i++)
        integrationPathIdList.push(integrationPathSelectedItems[i].id.replace('selected_id_', ''));

      serverRequest('/questions/integrate?id=' + currentUpdateQuestionId, 'POST', {
        integration_path_id_list: integrationPathIdList
      }, res => {
        if (!res.success)
          return throwError(res.error);

        document.getElementById('update-question-integration-form-outer-wrapper').style.display = 'none';

        serverRequest('/questions?id=' + currentUpdateQuestionId, 'GET', {}, res => {
          if (!res.success)
            return throwError(res.error);

          const question = res.question;
          console.log(currentUpdateQuestionId);
          const questionWrapper = document.getElementById(currentUpdateQuestionId);
          console.log(questionWrapper);
          questionWrapper.childNodes[1].childNodes[1].childNodes[3].innerHTML = 'Integrated Path Count: ' + question.integration_path_id_list.length;
        });
      });
    }

    if (event.target.id == 'create-target-group-open-form-button') {
      document.getElementById('create-target-group-form-outer-wrapper').style.display = 'flex';
    }

    if (event.target.id == 'create-target-group-back-button') {
      document.getElementById('create-target-group-form-outer-wrapper').style.display = 'none';
    }

    if (event.target.classList.contains('create-target-group-select-each-question-button')) {
      const target = event.target.parentNode.parentNode;
      const error = event.target.previousElementSibling;

      error.innerHTML = '';

      const questionId = target.id.replace('search_id_', '');
      const allowedAnswers =
        target.querySelector('.general-checked-input-value') ?
          JSON.parse(target.querySelector('.general-checked-input-value').value) :
          Array.from({length: parseInt(target.querySelector('.select-each-question-max-value').value) - parseInt(target.querySelector('.select-each-question-min-value').value) + 1}, (_, i) => i + parseInt(target.querySelector('.select-each-question-min-value').value));
      
      if (!allowedAnswers.length) {
        if (target.querySelector('.general-checked-input-value'))
          return error.innerHTML = 'Please select at least on option to be included in your filter.'
        else
          return error.innerHTML = 'Please give a minimum and maximum value for the range your filter will cover.';
      }
      
      newTargetGroup.filters.push({
        question_id: questionId,
        allowed_answers: allowedAnswers
      });
      createSelectedTargetGroupFilter(questionId, allowedAnswers);
      target.style.display = 'none';
    }

    if (event.target.classList.contains('delete-each-target-group-filter-button')) {
      const questionId = event.target.parentNode.id.replace('selected_id_', '');

      document.getElementById('search_id_' + questionId).style.display = 'flex';
      event.target.parentNode.remove();
      newTargetGroup.filters = newTargetGroup.filters.filter(each => each.question_id != questionId);
    }

    if (event.target.id == 'create-target-group-button') {
      const error = document.getElementById('create-target-group-error');
      newTargetGroup.name = document.getElementById('target-group-name-input').value;

      if (!newTargetGroup.name || !newTargetGroup.name.length)
        return error.innerHTML = 'Please write a name for your target group.';

      if (!newTargetGroup.filters || !newTargetGroup.filters.length)
        return error.innerHTML = 'Plase include at least one filter in your target group.';

      serverRequest('/target_groups/create', 'POST', newTargetGroup, res => {
        if (!res.success)
          return throwError(res.error);

        createNewTargetGroup(res.id);
        document.getElementById('create-target-group-form-outer-wrapper').style.display = 'none';
      });
    }

    if (event.target.classList.contains('each-target-group-wrapper') || (event.target.parentNode && (event.target.parentNode.classList.contains('each-target-group-wrapper' || (event.target.parentNode.parentNode && (event.target.parentNode.parentNode.classList.contains('each-target-group-wrapper'))))))) {
      const target = event.target.classList.contains('each-target-group-wrapper') ? event.target : (event.target.parentNode.classList.contains('each-target-group-wrapper') ? event.target.parentNode : event.target.parentNode.parentNode);

      target.classList.add('each-target-group-wrapper-opened');
    }

    if (event.target.id == 'create-banner-open-form-button') {
      document.getElementById('create-banner-form-outer-wrapper').style.display = 'flex';
    }

    if (event.target.classList.contains('close-banner-form-button')) {
      document.getElementById('create-banner-form-outer-wrapper').style.display = 'none';
    }

    if (event.target.id == 'banner-continue-button') {
      const error = document.getElementById('banner-info-error');
      error.innerHTML = '';

      newAd.name = document.getElementById('banner-name-input').value;
      newAd.title = document.getElementById('banner-title-input').value;
      newAd.text = document.getElementById('banner-text-input').value;
      newAd.button_text = document.getElementById('banner-button-text-input').value;
      newAd.button_url = document.getElementById('banner-button-url-input').value;

      const bannerImageWrapper = document.getElementById('banner-image-input-outer-wrapper');
      newAd.image_url = (bannerImageWrapper.childNodes[0].classList.contains('general-image-input-wrapper') ? bannerImageWrapper.childNodes[0].childNodes[0].childNodes[0].src : '');

      if (!newAd.name || !newAd.name.length)
        return error.innerHTML = 'Please write a name for your banner.';
      
      if (!newAd.title || !newAd.title.length)
        return error.innerHTML = 'Please write a title for your banner.';
      
      if (!newAd.title || !newAd.title.length)
        return error.innerHTML = 'Please write a text for your banner.';

      if (!newAd.button_text || !newAd.button_text.length)
        return error.innerHTML = 'Please write a text for the button of your banner.';
      
      if (!newAd.button_url || !newAd.button_url.length)
        return error.innerHTML = 'Please write the URL that the button of your banner will redirect.';

      if (!newAd.image_url || !newAd.image_url.length)
        return error.innerHTML = 'Please chose an image for your banner.';

      document.getElementById('banner-info-form').style.display = 'none';
      document.getElementById('banner-target-group-form').style.display = 'flex';
    }

    if (event.target.id == 'back-banner-info-form-button') {
      document.getElementById('banner-info-form').style.display = 'flex';
      document.getElementById('banner-target-group-form').style.display = 'none';
    }

    if (event.target.id == 'banner-target-group-continue-button') {
      document.getElementById('banner-target-group-error').innerHTML = 'Please select a target group.';
    }

    if (event.target.id == 'create-banner-select-each-target-group-button') {
      document.getElementById('banner-target-group-error').innerHTML = '';
      newAd.target_group_id = event.target.parentNode.id;

      document.getElementById('banner-target-group-form').style.display = 'none';
      document.getElementById('banner-select-integration-path-form').style.display = 'flex';
      
      // newAd.created_ad = getDate();

      // serverRequest('/ads/create', 'POST', newAd, res => {
      //   if (!res.success)
      //     return throwError(res.error);

      //   document.getElementById('create-banner-form-outer-wrapper').style.display = 'none';
      // });
    }

    if (event.target.id == 'banner-integration-path-back-button') {
      newAd.target_group_id = null;
      document.getElementById('banner-target-group-form').style.display = 'flex';
      document.getElementById('banner-select-integration-path-form').style.display = 'none';
    }

    if (event.target.classList.contains('create-banner-select-each-integration-path-button')) {

    }

    if (event.target.classList.contains('each-banner-delete-button') || event.target.parentNode.classList.contains('each-banner-delete-button')) {
      const target = event.target.classList.contains('each-banner-delete-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.parentNode.parentNode.parentNode.id;

      createConfirm({
        title: 'Are you sure you want to delete this banner?',
        text: 'This action cannot be taken back. Once you delete, you will loose all the information about the analytics of the banner.',
        reject: 'Cancel',
        accept: 'Delete'
      }, res => {
        if (!res) return;

        serverRequest('/ads/delete?id=' + id, 'GET', {}, res => {
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
    // else if (event.target.classList.contains('pie-chart-color') && !event.target.classList.contains('pie-chart-color-default') && event.target.classList.contains('banner-pie-chart-color')) {
    //   const bannerWrapper = event.target.parentNode.parentNode.parentNode.parentNode;
    //   const banner = banners.find(each => each._id == bannerWrapper.id);

    //   if (bannerInfoId == banner._id)
    //     return;

    //   bannerInfoId = banner._id;

    //   let angelWithVertical; // The angle mouse makes with the vertical to center
    //   const centerPosition = {
    //     x: (event.target.getBoundingClientRect().left + event.target.getBoundingClientRect().right) / 2,
    //     y: window.innerHeight - ((event.target.getBoundingClientRect().bottom + event.target.getBoundingClientRect().top) / 2)
    //   };
    //   const mousePosition = {
    //     x: event.clientX,
    //     y: window.innerHeight - event.clientY
    //   };

    //   if (mousePosition.y > centerPosition.y && mousePosition.x > centerPosition.x) { // First quadrant
    //     angelWithVertical = 90 - (Math.atan((mousePosition.y - centerPosition.y) / (mousePosition.x - centerPosition.x)) * 180 / Math.PI);
    //   } else if (mousePosition.y < centerPosition.y && mousePosition.x > centerPosition.x) { // Second quadrant
    //     angelWithVertical = 90 + (Math.atan((centerPosition.y - mousePosition.y) / (mousePosition.x - centerPosition.x)) * 180 / Math.PI);
    //   } else if (mousePosition.y < centerPosition.y && mousePosition.x < centerPosition.x) { // Third quadrant
    //     angelWithVertical = 270 - Math.atan((centerPosition.y - mousePosition.y) / (centerPosition.x - mousePosition.x)) * 180 / Math.PI;
    //   } else { // Fourth quadrant
    //     angelWithVertical = 270 + Math.atan((mousePosition.y - centerPosition.y) / (centerPosition.x - mousePosition.x)) * 180 / Math.PI;
    //   }

    //   if (document.querySelector('.graph-info'))
    //     document.querySelector('.graph-info').remove();

    //   let currentAngel = 0.0;
    //   let percentageValue = null;

    //   for (let i = 0; i < pieChartColors.length && i < graph.data.length && graph.data[i].value > 0 && !percentageValue; i++) {
    //     currentAngel += graph.data[i].value / graph.total * 100;
    //     if (currentAngel * 360 / 100 >= angelWithVertical)
    //       percentageValue = graph.data[i].value / graph.total * 100;
    //   }

    //   if (!percentageValue)
    //     percentageValue = 100.0 - currentAngel;
      
    //   createGraphInfo(percentageValue, {
    //     x: event.clientX,
    //     y: event.clientY
    //   });
    // } 
    else if (!event.target.classList.contains('graph-info') && document.querySelector('.graph-info')) {
      document.querySelector('.graph-info').remove();
      graphInfoId = null;
    }
  });
});
