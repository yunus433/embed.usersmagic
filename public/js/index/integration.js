let integrationPathIdList = [];

function createSelectedIntegrationPath(integrationPathId, callback) {
  serverRequest('/integration?id=' + integrationPathId, 'GET', {}, res => {
    if (!res.success) return callback(res.error || 'unknown_error');

    const integrationPath = res.integration_path;

    const wrapper = document.getElementById(`integration-path-selected-items-wrapper`);

    const integrationPathWrapper = document.createElement('div');
    integrationPathWrapper.classList.add('general-each-selected-item-wrapper');
    integrationPathWrapper.id = 'selected_id_' + integrationPath._id;
  
    const span = document.createElement('span');
    span.innerHTML = integrationPath.name + ' (' + integrationPath.path + ')';
    integrationPathWrapper.appendChild(span);
  
    const i = document.createElement('i');
    i.classList.add('fas');
    i.classList.add('fa-trash-alt');
    i.classList.add('selected-integration-path-delete-button');
    integrationPathWrapper.appendChild(i);
  
    wrapper.appendChild(integrationPathWrapper);

    return callback(null);
  });
};

function createSearchIntegrationPath(integrationPathId, callback) {
  serverRequest('/integration?id=' + integrationPathId, 'GET', {}, res => {
    if (!res.success) return callback(res.error || 'unknown_error');

    const integrationPath = res.integration_path;

    const wrapper = document.getElementById('integration-path-search-items-wrapper');

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
    smallButton.classList.add('select-each-integration-path-button');
    smallButton.innerHTML = 'Select';
    generalTextLine.appendChild(smallButton);

    if (integrationPath.type != 'product') {
      const i = document.createElement('i');
      i.classList.add('fas');
      i.classList.add('fa-trash-alt');
      i.classList.add('general-each-search-item-delete-button');
      i.classList.add('integration-path-delete-button');
      generalTextLine.appendChild(i);
    }

    integrationPathWrapper.appendChild(generalTextLine);
  
    wrapper.appendChild(integrationPathWrapper);

    while(integrationPathWrapper.previousElementSibling)
      wrapper.insertBefore(integrationPathWrapper, integrationPathWrapper.previousElementSibling);

    return callback(null);
  });
};

function resetIntegrationPathForm(callback) {
  integrationPathIdList = [];

  while (document.getElementById('integration-path-selected-items-wrapper').childElementCount) {
    const node = document.getElementById('integration-path-selected-items-wrapper').childNodes[0];
    const id = node.id.replace('selected_id_', '');
    node.remove();
    createSearchIntegrationPath(id, err => {
      if (err) return callback(err);
    });
  }

  if (document.getElementById('product-default-integration-path'))
    document.getElementById('product-default-integration-path').remove();

  return callback(null);
}

function updateIntegrationPathForm(data, callback) {
  resetIntegrationPathForm(err => {
    if (err) throwError(err);

    document.getElementById('select-integration-path-title').innerHTML = data.title;
    document.getElementById('select-integration-path-steps-wrapper').innerHTML = '';
  
    if (data.stepCount)
      for (let i = 0; i < data.stepCount; i++) {
        const eachStep = document.createElement('span');
        eachStep.classList.add('general-form-each-step');
        eachStep.classList.add('general-form-each-step-finished');
        eachStep.innerHTML = i+1;
        document.getElementById('select-integration-path-steps-wrapper').appendChild(eachStep);

        if (i < data.stepCount-1) {
          const eachStepLine = document.createElement('div');
          eachStepLine.classList.add('general-form-each-step-line');
          eachStepLine.classList.add('general-form-each-step-line-finished');
          document.getElementById('select-integration-path-steps-wrapper').appendChild(eachStepLine);
        }
      }

    if (data.questionId)
      serverRequest('/questions?id=' + data.questionId, 'GET', {}, res => {
        if (!res.success)
          return callback(res.error || 'unknown_error');
    
        const question = res.question;
    
        serverRequest('/questions/integrate?id=' + data.questionId, 'GET', {}, res => {
          if (!res.success)
            return callback(res.error || 'unknown_error');
    
          const integrationPaths = res.integration_path_list;
    
          for (let i = 0; i < integrationPaths.length; i++) {
            const integrationPath = integrationPaths[i];
    
            if (!integrationPath.product_id || !question.product_id || integrationPath.product_id.toString() != question.product_id.toString()) {
              createSelectedIntegrationPath(integrationPath._id, err => {
                if (err) return callback(err);

                document.getElementById('search_id_' + integrationPath._id).remove();
              });
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
      
              const wrapper = document.getElementById('integration-path-inner-content-wrapper');
      
              wrapper.appendChild(defaultIntegrationPath);
      
              while (defaultIntegrationPath && defaultIntegrationPath.previousElementSibling && !defaultIntegrationPath.previousElementSibling.classList.contains('create-integration-path-open-form-button')) {
                wrapper.insertBefore(defaultIntegrationPath, defaultIntegrationPath.previousElementSibling);
              }
              wrapper.insertBefore(defaultIntegrationPath, defaultIntegrationPath.previousElementSibling);
      
              const searchItems = document.getElementById('integration-path-search-items-wrapper').childNodes;
      
              for (let i = 0; i < searchItems.length; i++) {
                const id = searchItems[i].id.replace('search_id_', '');
                if (id == integrationPath._id.toString())
                  searchItems[i].style.display = 'none';
                else
                  searchItems[i].style.display = 'flex';   
              }
      
              return callback(null);
            });
          } else {
            return callback(null);
          }
        });
      });
    else if (data.bannerId)
      serverRequest('/ads/integrate?id=' + data.questionId, 'GET', {}, res => {
        if (!res.success)
          return callback(res.error || 'unknown_error');

        const integrationPaths = res.integration_path_list;

        for (let i = 0; i < integrationPaths.length; i++) {
          const integrationPath = integrationPaths[i];

          createSelectedIntegrationPath(integrationPath._id, err => {
            if (err) return callback(err);

            document.getElementById('search_id_' + integrationPath._id).remove();
          });
        }

        return callback(null);
      });
    else if (data.productId)
      serverRequest('/integration/product?product_id=' + data.productId, 'GET', {}, res => {
        if (!res.success)
          return callback(res.error || 'unknown_error');

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

        const wrapper = document.getElementById('integration-path-inner-content-wrapper');

        wrapper.appendChild(defaultIntegrationPath);

        while (defaultIntegrationPath && defaultIntegrationPath.previousElementSibling && !defaultIntegrationPath.previousElementSibling.classList.contains('create-integration-path-open-form-button')) {
          wrapper.insertBefore(defaultIntegrationPath, defaultIntegrationPath.previousElementSibling);
        }
        wrapper.insertBefore(defaultIntegrationPath, defaultIntegrationPath.previousElementSibling);

        const searchItems = document.getElementById('integration-path-search-items-wrapper').childNodes;

        for (let i = 0; i < searchItems.length; i++) {
          const id = searchItems[i].id.replace('search_id_', '');
          if (id == integrationPath._id.toString())
            searchItems[i].style.display = 'none';
          else
            searchItems[i].style.display = 'flex';   
        }

        return callback(null);
      });
    else
      return callback(null);
  });
};

function selectIntegrationPath(data, callback) {
  updateIntegrationPathForm(data, () => {
    document.getElementById('select-integration-path-form').style.display = 'flex';

    document.addEventListener('click', function listenCreateButton(event) {
      if (event.target.id == 'select-integration-path-create-button') {
        if ((integrationPathIdList && integrationPathIdList.length) || data.productId) {
          document.getElementById('select-integration-path-form').style.display = 'none';
          document.removeEventListener('click', listenCreateButton);
          return callback(true, integrationPathIdList);
        }

        if (!data.questionId)
          return document.getElementById('select-integration-path-error').innerHTML = 'You must select/create at least one integration path before you continue.';

        serverRequest('/questions?id=' + data.questionId, 'GET', {}, res => {
          if (!res.success)
            return callback(res.error || 'unknown_error');
          
          if (!res.question.product_id)
            return document.getElementById('select-integration-path-error').innerHTML = 'You must select/create at least one integration path before you continue.';

          document.getElementById('select-integration-path-form').style.display = 'none';
          document.removeEventListener('click', listenCreateButton);
          return callback(true, integrationPathIdList);
        });
      }
  
      if (event.target.id == 'select-integration-path-close-button') {
        document.getElementById('select-integration-path-form').style.display = 'none';
        document.removeEventListener('click', listenCreateButton);
        // Do not call callback
      }

      if (event.target.id == 'select-integration-path-back-button') {
        document.getElementById('select-integration-path-form').style.display = 'none';
        document.removeEventListener('click', listenCreateButton);
        callback(false); // Return empty array, do nothing
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

      if (event.target.classList.contains('create-integration-path-open-form-button')) {
        document.getElementById('select-integration-path-form').style.display = 'none';
        document.getElementById('create-integration-path-form-outer-wrapper').style.display = 'flex';
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
  
            integrationPathIdList.push(res.id);
            document.getElementById('select-integration-path-form').style.display = 'flex';
            document.getElementById('create-integration-path-form-outer-wrapper').style.display = 'none';
          });
        });
      }
  
      if (event.target.id == 'create-integration-path-back-button') {
        document.getElementById('select-integration-path-form').style.display = 'flex';
        document.getElementById('create-integration-path-form-outer-wrapper').style.display = 'none';
      }
    });
  });
};

window.addEventListener('load', () => {
  document.addEventListener('click', event => {
    if (event.target.classList.contains('select-each-integration-path-button')) {
      const id = event.target.parentNode.parentNode.id.replace('search_id_', '');

      createSelectedIntegrationPath(id, err => {
        if (err) return throwError(err);

        integrationPathIdList.push(id);
        event.target.parentNode.parentNode.remove();
      });
    }

    if (event.target.classList.contains('selected-integration-path-delete-button')) {
      const id = event.target.parentNode.id.replace('selected_id_', '');

      createSearchIntegrationPath(id, err => {
        if (err) return throwError(err);

        integrationPathIdList = integrationPathIdList.filter(each => each != id);
        event.target.parentNode.remove();
      });
    }

    if (event.target.classList.contains('integration-path-delete-button')) {
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
  });
});
