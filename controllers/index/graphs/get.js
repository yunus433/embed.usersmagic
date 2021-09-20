const Person = require('../../../models/person/Person');

module.exports = (req, res) => {
  // res.write(JSON.stringify({ graphs: [
  //   {
  //     title: 'Age',
  //     description: 'Asked Question: What is your age?',
  //     type: 'pie_chart',
  //     question_type: 'demographics',
  //     data: [
  //       {name: '22', value: 89},
  //       {name: '20', value: 46},
  //       {name: '21', value: 45},
  //       {name: '23', value: 18},
  //       {name: '19', value: 14}
  //     ],
  //     total: 212
  //   },
  //   {
  //     title: 'Product NPS',
  //     description: 'Would you recommend this product to your friends?',
  //     type: 'bar_chart',
  //     question_type: 'brand',
  //     data: [
  //       {name: 'Definetely', value: 89},
  //       {name: 'Maybe', value: 46},
  //       {name: 'Never', value: 45}
  //     ],
  //     total: 180
  //   }
  // ], success: true }));
  // return res.end();

  Person.getCumulativeResponsesForCompanyQuestions({
    company_id: req.session.user.company._id
  }, (err, graphs) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ graphs, success: true }));
    return res.end();
  });
}
