let pieChartColors = [];
let company;
let state;
let is_demo;

window.addEventListener('load', () => {
  is_demo = document.getElementById('is-demo') ? true : false;
  state = JSON.stringify(document.getElementById('state').value);
  company = JSON.stringify(document.getElementById('company').value);
  pieChartColors = JSON.parse(document.getElementById('pie-chart-colors').value);
  
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
  });
});
