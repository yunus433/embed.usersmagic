let newTargetGroup = {
  name: '',
  filters: []
};
let targetGroups = [];

function getDate() {
  return ((new Date()).getDate() < 10 ? '0' : '') + (new Date()).getDate() + '.' + ((new Date()).getMonth() + 1 < 10 ? '0' : '') + ((new Date()).getMonth() + 1) + '.' + (new Date()).getFullYear();
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
  targetGroups = JSON.parse(document.getElementById('target-groups').value);

  document.addEventListener('click', event => {
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
  });
});
