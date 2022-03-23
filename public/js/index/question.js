
let newQuestion = {
  type: null,
  template_id: null,
  product_id: null,
  integration_path_id_list: []
};

function getDate() {
  return ((new Date()).getDate() < 10 ? '0' : '') + (new Date()).getDate() + '.' + ((new Date()).getMonth() + 1 < 10 ? '0' : '') + ((new Date()).getMonth() + 1) + '.' + (new Date()).getFullYear();
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

window.addEventListener('load', () => {
  document.addEventListener('click', event => {
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
      document.getElementById('create-question-form-outer-wrapper').style.display = 'none';
      
      selectIntegrationPath({
        title: 'Create a New Question',
        stepCount: 3
      }, (res, integration_path_id_list) => {
        if (!res)
          return document.getElementById('create-question-form-outer-wrapper').style.display = 'flex';; // Do nothing, clicked back button
        
        newQuestion.integration_path_id_list = integration_path_id_list;

        serverRequest('/questions/create', 'POST', {
          template_id: newQuestion.template_id,
          integration_path_id_list: newQuestion.integration_path_id_list,
          created_at: getDate()
        }, res => {
          if (!res.success)
            return throwError(res.error);

          location.reload();
        });
      })
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
      document.getElementById('create-question-form-outer-wrapper').style.display = 'none';

      selectIntegrationPath({
        title: 'Create a New Question',
        stepCount: 4,
        productId: newQuestion.product_id
      }, (res, integration_path_id_list) => {
        if (!res)
          return document.getElementById('create-question-form-outer-wrapper').style.display = 'none'; // Do nothing, clicked back button
        
        newQuestion.integration_path_id_list = integration_path_id_list;

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
      })
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

        
      } else if (newQuestion.type == 'product') {
        document.getElementById('integration-path-error').innerHTML = '';

        
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
  });
});
