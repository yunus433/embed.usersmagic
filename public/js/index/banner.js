let newAd = {
  name: '',
  title: '',
  text: '',
  button_text: '',
  button_url: '',
  image_url: '',
  target_group_id: '',
  integration_path_id_list: [],
  created_at: ''
};
let banners = [];

function getDate() {
  return ((new Date()).getDate() < 10 ? '0' : '') + (new Date()).getDate() + '.' + ((new Date()).getMonth() + 1 < 10 ? '0' : '') + ((new Date()).getMonth() + 1) + '.' + (new Date()).getFullYear();
};

function createBanner(banner) {
  const eachBannerWrapper = document.createElement('div');
  eachBannerWrapper.classList.add('each-banner-wrapper');

  const eachBannerTitleWrapper = document.createElement('div');
  eachBannerTitleWrapper.classList.add('each-banner-title-wrapper');

  const name = document.createElement('span');
  name.classList.add('general-subtitle');
  name.classList.add('general-text-overflow');
  name.innerHTML = banner.name;
  eachBannerTitleWrapper.appendChild(name);

  const createdAt = document.createElement('span');
  createdAt.classList.add('general-text');
  createdAt.classList.add('general-text-overflow');
  createdAt.innerHTML = 'Created At: ' + banner.created_at;
  eachBannerTitleWrapper.appendChild(createdAt);

  eachBannerWrapper.appendChild(eachBannerTitleWrapper);

  const eachBannerContentWrapper = document.createElement('div');
  eachBannerContentWrapper.classList.add('each-banner-content-wrapper');

  const eachBannerContentDataWrapper = document.createElement('div');
  eachBannerContentDataWrapper.classList.add('each-banner-content-data-wrapper');

  if (banner.statistics.total) {
    const pieChartLabelWrapper = document.createElement('div');
    pieChartLabelWrapper.classList.add('banner-pie-chart-label-wrapper');

    const clicked = document.createElement('div');
    clicked.classList.add('banner-pie-chart-each-color-wrapper');
    const clickedColor = document.createElement('div');
    clickedColor.classList.add('banner-pie-chart-each-color');
    clickedColor.style.backgroundColor = pie_chart_colors[0];
    clicked.appendChild(clickedColor);
    const clickedSpan = document.createElement('span');
    clickedSpan.classList.add('banner-pie-chart-each-label');
    clickedSpan.innerHTML = 'Clicked';
    clicked.appendChild(clickedSpan);
    pieChartLabelWrapper.appendChild(clicked);

    const showed = document.createElement('div');
    showed.classList.add('banner-pie-chart-each-color-wrapper');
    const showedColor = document.createElement('div');
    showedColor.classList.add('banner-pie-chart-each-color');
    showedColor.style.backgroundColor = pie_chart_colors[1];
    showed.appendChild(showedColor);
    const showedSpan = document.createElement('span');
    showedSpan.classList.add('banner-pie-chart-each-label');
    showedSpan.innerHTML = 'Showed';
    showed.appendChild(showedSpan);
    pieChartLabelWrapper.appendChild(showed);

    const closed = document.createElement('div');
    closed.classList.add('banner-pie-chart-each-color-wrapper');
    const closedColor = document.createElement('div');
    closedColor.classList.add('banner-pie-chart-each-color');
    closedColor.style.backgroundColor = pie_chart_colors[2];
    closed.appendChild(closedColor);
    const closedSpan = document.createElement('span');
    closedSpan.classList.add('banner-pie-chart-each-label');
    closedSpan.innerHTML = 'Closed';
    closed.appendChild(closedSpan);
    pieChartLabelWrapper.appendChild(closed);

    eachBannerContentDataWrapper.appendChild(pieChartLabelWrapper);

    const pieChartWrapper = document.createElement('div');
    pieChartWrapper.classList.add('banner-pie-chart-wrapper');

    const pieChartColor = document.createElement('div');
    pieChartColor.classList.add('banner-pie-chart-color');
    pieChartColor.classList.add('banner-pie-chart-color');
    pieChartColor.style.background = `background: conic-gradient(at center, ${pie_chart_colors[0]} 0%, ${pie_chart_colors[0]} ${banner.statistics.clicked / banner.statistics.total * 100}%, ${pie_chart_colors[1]} ${banner.statistics.clicked / banner.statistics.total * 100}%, ${pie_chart_colors[1]} ${(banner.statistics.clicked + banner.statistics.showed) / banner.statistics.total * 100}%, ${pie_chart_colors[2]} ${(banner.statistics.clicked + banner.statistics.showed) / banner.statistics.total * 100}%, ${pie_chart_colors[2]} 100%);`
    pieChartWrapper.appendChild(pieChartColor);

    const pieChartWhite = document.createElement('div');
    pieChartWhite.classList.add('banner-pie-chart-white');
    pieChartWrapper.appendChild(pieChartWhite);

    eachBannerContentDataWrapper.appendChild(pieChartWrapper);
  } else {
    const pieChartWrapper = document.createElement('div');
    pieChartWrapper.classList.add('banner-pie-chart-wrapper');

    const pieChartColor = document.createElement('div');
    pieChartColor.classList.add('banner-pie-chart-color');
    pieChartColor.classList.add('banner-pie-chart-color-default');
    pieChartWrapper.appendChild(pieChartColor);

    const pieChartWhite = document.createElement('div');
    pieChartWhite.classList.add('banner-pie-chart-white');
    const pieChartWhiteSpan = document.createElement('span');
    pieChartWhiteSpan.classList.add('general-text');
    pieChartWhiteSpan.innerHTML = 'No Data';
    pieChartWhite.appendChild(pieChartWhiteSpan);
    pieChartWrapper.appendChild(pieChartWhite);

    eachBannerContentDataWrapper.appendChild(pieChartWrapper);
  }

  eachBannerContentWrapper.appendChild(eachBannerContentDataWrapper);

  const eachBannerContentInfoWrapper = document.createElement('div');
  eachBannerContentInfoWrapper.classList.add('each-banner-content-info-wrapper');

  const bannerTitle = document.createElement('span');
  bannerTitle.classList.add('general-text');
  bannerTitle.innerHTML = `Title: ${banner.title}`;
  eachBannerContentInfoWrapper.appendChild(bannerTitle);

  const bannerText = document.createElement('span');
  bannerText.classList.add('general-text');
  bannerText.innerHTML = `Text: ${banner.text}`;
  eachBannerContentInfoWrapper.appendChild(bannerText);
  
  const bannerButtonText = document.createElement('span');
  bannerButtonText.classList.add('general-text');
  bannerButtonText.innerHTML = `Button Text: ${banner.button_text}`;
  eachBannerContentInfoWrapper.appendChild(bannerButtonText);

  const bannerURL = document.createElement('span');
  bannerURL.classList.add('general-text');
  const bannerURLSpan = document.createElement('span');
  bannerURLSpan.innerHTML = 'Button URL: ';
  bannerURL.appendChild(bannerURLSpan);
  const bannerURLA = document.createElement('a');
  bannerURLA.href = banner.button_url;
  bannerURLA.target = '_blank';
  bannerURLA.style.color = 'rgb(140, 212, 224)';
  bannerURLA.innerHTML = banner.button_url;
  bannerURL.appendChild(bannerURLA);
  eachBannerContentInfoWrapper.appendChild(bannerURL);

  const eachBannerButtonsWrapper = document.createElement('div');
  eachBannerButtonsWrapper.classList.add('each-banner-buttons-wrapper');

  const deleteButton = document.createElement('div');
  deleteButton.classList.add('each-banner-button');
  deleteButton.classList.add('each-banner-delete-button');
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
  eachBannerButtonsWrapper.appendChild(deleteButton);

  const statusButton = document.createElement('div');
  statusButton.classList.add('each-banner-button');
  statusButton.classList.add('each-banner-status-button');
  if (banner.is_active)
    statusButton.classList.add('each-banner-deactivate-button');
  else
    statusButton.classList.add('each-banner-activate-button')
  statusButton.style.borderColor = 'rgba(254, 211, 85, 1)';
  const statusButtonI = document.createElement('i');
  statusButtonI.classList.add('fas');
  if (banner.is_active)
    statusButtonI.classList.add('fa-pause');
  else
    statusButtonI.classList.add('fa-play');
  statusButtonI.style.color = 'rgba(254, 211, 85, 1)';
  statusButton.appendChild(statusButtonI);
  const statusButtonSpan = document.createElement('span');
  if (banner.is_active)
    statusButtonSpan.innerHTML = 'Pause';
  else
    statusButtonSpan.innerHTML = 'Activate';
  statusButtonSpan.style.color = 'rgba(254, 211, 85, 1)';
  statusButton.appendChild(statusButtonSpan);
  eachBannerButtonsWrapper.appendChild(statusButton);

  // const editButton = document.createElement('div');
  // editButton.classList.add('each-banner-button');
  // editButton.classList.add('each-banner-edit-button');
  // editButton.style.borderColor = 'rgba(45, 136, 196, 1)';
  // const editButtonI = document.createElement('i');
  // editButtonI.classList.add('fas');
  // editButtonI.classList.add('fa-edit');
  // editButtonI.style.color = 'rgba(45, 136, 196, 1)';
  // editButton.appendChild(editButtonI);
  // const editButtonSpan = document.createElement('span');
  // editButtonSpan.innerHTML = 'Edit';
  // editButtonSpan.style.color = 'rgba(45, 136, 196, 1)';
  // editButton.appendChild(editButtonSpan);
  // eachBannerButtonsWrapper.appendChild(editButton);

  // const previewButton = document.createElement('span');
  // previewButton.classList.add('each-banner-button');
  // previewButton.classList.add('each-banner-preview-button');
  // previewButton.style.borderColor = 'rgba(92, 196, 110, 1)';
  // const previewButtonI = document.createElement('i');
  // previewButtonI.classList.add('far');
  // previewButtonI.classList.add('fa-eye');
  // previewButtonI.style.color = 'rgba(92, 196, 110, 1)';
  // previewButton.appendChild(previewButtonI);
  // const previewButtonSpan = document.createElement('span');
  // previewButtonSpan.innerHTML = 'Preview';
  // previewButtonSpan.style.color = 'rgba(92, 196, 110, 1)';
  // previewButton.appendChild(previewButtonSpan);
  // eachBannerButtonsWrapper.appendChild(previewButton);

  eachBannerContentInfoWrapper.appendChild(eachBannerButtonsWrapper);

  eachBannerContentWrapper.appendChild(eachBannerContentInfoWrapper);

  eachBannerWrapper.appendChild(eachBannerContentWrapper);

  document.querySelector('.banner-outer-wrapper').appendChild(eachBannerWrapper);
}

window.addEventListener('load', () => {
  banners = JSON.parse(document.getElementById('banners').value);

  document.addEventListener('click', event => {
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

    if (event.target.classList.contains('each-banner-deactivate-button') || event.target.parentNode.classList.contains('each-banner-deactivate-button')) {
      const target = event.target.classList.contains('each-banner-deactivate-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.parentNode.parentNode.parentNode.id;

      serverRequest('/ads/deactivate?id=' + id, 'GET', {}, res => {
        if (!res.success)
          return throwError(res.error);

        target.classList.remove('each-banner-deactivate-button');
        target.classList.add('each-banner-activate-button');
        target.childNodes[0].classList.remove('fa-pause');
        target.childNodes[0].classList.add('fa-play');
        target.childNodes[1].innerHTML = 'Activate';
      });
    }

    if (event.target.classList.contains('each-banner-activate-button') || event.target.parentNode.classList.contains('each-banner-activate-button')) {
      const target = event.target.classList.contains('each-banner-activate-button') ? event.target : event.target.parentNode;
      const id = target.parentNode.parentNode.parentNode.parentNode.id;

      serverRequest('/ads/activate?id=' + id, 'GET', {}, res => {
        if (!res.success)
          return throwError(res.error);

        target.classList.remove('each-banner-activate-button');
        target.classList.add('each-banner-deactivate-button');
        target.childNodes[0].classList.remove('fa-play');
        target.childNodes[0].classList.add('fa-pause');
        target.childNodes[1].innerHTML = 'Pause';
      });
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

    if (event.target.classList.contains('create-banner-select-each-target-group-button')) {
      document.getElementById('banner-target-group-error').innerHTML = '';
      newAd.target_group_id = event.target.parentNode.id;

      document.getElementById('create-banner-form-outer-wrapper').style.display = 'none';

      selectIntegrationPath({
        title: 'Create a New Banner',
        stepCount: 3
      }, (res, integration_path_id_list) => {
        if (!res)
          document.getElementById('create-banner-form-outer-wrapper').style.display = 'flex';

        serverRequest('/ads/create', 'POST', {
          name: newAd.name,
          title: newAd.title,
          text: newAd.text,
          button_text: newAd.button_text,
          button_url: newAd.button_url,
          image_url: newAd.image_url,
          target_group_id: newAd.target_group_id,
          integration_path_id_list,
          created_at: getDate()
        }, res => {
          if (!res.success)
            return throwError(res.error);

          serverRequest('/ads?id=' + res.id, 'GET', {}, res => {
            if (!res.success)
              return throwError(res.error);

            banners.push(res.ad);
            createBanner(res.ad);
          });
        });
      });
    }
  });

  document.addEventListener('mouseover', event => {
    // if (event.target.classList.contains('pie-chart-color') && !event.target.classList.contains('pie-chart-color-default') && event.target.classList.contains('banner-pie-chart-color')) {
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

    //   if (document.querySelector('.banner-info'))
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
      
    //   createBannerInfo(percentageValue, {
    //     x: event.clientX,
    //     y: event.clientY
    //   });
    // }
  });
});
