//BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round (this.value / totalIncome * 100);
    } else {
      this.percentage = -10;
    }
  };
  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach (function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      // [1, 2, 3, 4, 5]  next ID = 6
      //[1, 2 , 4, 5, 7] next ID = 8
      //ID = last ID + 1
      //create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item based on 'inc' or 'exp'
      if (type === 'exp') {
        newItem = new Expense (ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income (ID, des, val);
      }
      //push it into the data structure
      data.allItems[type].push (newItem);
      //return the new element
      return newItem;
    },
    deleteItem: function (type, id) {
      var ids, index;

      ids = data.allItems[type].map (function (current) {
        return current.id;
      });
      index = ids.indexOf (id);
      if (index !== -1) {
        data.allItems[type].splice (index, 1);
      }
    },

    calculateBudget: function () {
      //calculate the total income and expense
      calculateTotal ('exp');
      calculateTotal ('inc');
      //calculate the budget: income - expense
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage of income and expense
      if (data.totals.inc > 0) {
        data.percentage = Math.round (data.totals.exp / data.totals.inc * 100);
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentages: function () {
      data.allItems.exp.forEach (function (cur) {
        cur.calcPercentage (data.totals.inc);
      });
    },
    getPercentages: function () {
      var allPerc = data.allItems.exp.map (function (cur) {
        return cur.getPercentage ();
      });
      return allPerc;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },
    testing: function () {
      console.log (data);
      console.log (Expense.getPercentages ());
    },
  };
}) ();
//UI CONTROLLER
var UIController = (function () {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel: '.item__percentage',
  };
  var formatNumber = function (num, type) {
    var numSplit, int, dec, sign;
    num = Math.abs (num);
    num = num.toFixed (2);

    numSplit = num.split ('.');
    int = numSplit[0];
    if (int.length > 3) {
      int =
        int.substr (0, int.length - 3) + ',' + int.substr (int.length - 3, 3);
    }
    dec = numSplit[1];
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };
  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback (list[i], i);
    }
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector (DOMstrings.inputType).value,
        description: document.querySelector (DOMstrings.inputDescription).value,
        value: +document.querySelector (DOMstrings.inputValue).value,
      };
      console.log (input);
    },
    addListItem: function (obj, type) {
      var html, newHtml, element;
      //create html strings with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else {
        element = DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      //replace the placeholder text with some actual data
      newHtml = html.replace ('%id%', obj.id);
      newHtml = newHtml.replace ('%description%', obj.description);
      newHtml = newHtml.replace ('%value%', formatNumber (obj.value, type));

      //Insert the html into the DOM
      document
        .querySelector (element)
        .insertAdjacentHTML ('beforeend', newHtml);
    },
    deleteListItem: function (selectorID) {
      var element = document.getElementById (selectorID);
      element.parentNode.removeChild (element);
    },
    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll (
        DOMstrings.inputDescription + ', ' + DOMstrings.inputValue
      );
      fieldsArr = fields.forEach (function (current, index, array) {
        current.value = '';
      });
      fields[0].focus ();
    },
    changedType: function () {
      var fields = document.querySelectorAll (
        DOMstrings.inputType +
          ', ' +
          DOMstrings.inputDescription +
          ', ' +
          DOMstrings.inputValue
      );
      nodeListForEach (fields, function (cur) {
        cur.classList.toggle ('red-focus');
      });
      document.querySelector (DOMstrings.inputBtn).classList.toggle ('red');
    },

    displayMonth: function () {
      var now, thisMonth, thisYear;
      var month = new Array ();
      month[0] = 'January';
      month[1] = 'February';
      month[2] = 'March';
      month[3] = 'April';
      month[4] = 'May';
      month[5] = 'June';
      month[6] = 'July';
      month[7] = 'August';
      month[8] = 'September';
      month[9] = 'October';
      month[10] = 'November';
      month[11] = 'December';
      now = new Date ();
      n = now.getMonth ();
      thisYear = now.getFullYear ();
      document.querySelector ('.budget__title--month').textContent =
        month[n] + ' ' + thisYear;
    },
    getDOMStrings: function () {
      return DOMstrings;
    },
    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll (
        DOMstrings.expensesPercentageLabel
      );

      nodeListForEach (fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '- -';
        }
      });
    },
    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = 'inc') : (type = 'exp');
      document.querySelector (
        DOMstrings.budgetLabel
      ).textContent = formatNumber (obj.budget, type);
      document.querySelector (
        DOMstrings.incomeLabel
      ).textContent = formatNumber (obj.totalInc, 'inc');
      document.querySelector (
        DOMstrings.expensesLabel
      ).textContent = formatNumber (obj.totalExp, 'exp');
      if (obj.percentage > 0) {
        document.querySelector (DOMstrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector (DOMstrings.percentageLabel).textContent = '- -';
      }
    },
  };
}) ();

//CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
  var setUpEventListener = function () {
    var DOM = UICtrl.getDOMStrings ();
    document
      .querySelector (DOM.inputBtn)
      .addEventListener ('click', ctrlAddItem);

    document.addEventListener ('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        event.preventDefault ();
        ctrlAddItem ();
      }
    });
    document
      .querySelector (DOM.container)
      .addEventListener ('click', ctrlDeleteItem);
    document
      .querySelector (DOM.inputType)
      .addEventListener ('change', UICtrl.changedType);
  };

  var updateBudget = function () {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget ();
    // 2. Return the budget
    var budget = budgetCtrl.getBudget ();
    // 3. Display tue budget on the UI
    UICtrl.displayBudget (budget);
  };
  var updatedPercentage = function () {
    // 1. Calculate the percentage
    budgetCtrl.calculatePercentages ();
    // 2. Read the percentage from the budgetController
    var percentages = budgetCtrl.getPercentages ();
    // 3. update the UI with new percentage
    console.log (percentages);
    UICtrl.displayPercentages (percentages);
  };
  var ctrlAddItem = function () {
    var input, newItem;
    // 1. Get the filled input data
    input = UICtrl.getInput ();

    // 2. Add the item to budget controller
    if (input.description === '') {
      input.description = 'No description';
    }
    newItem = budgetCtrl.addItem (input.type, input.description, input.value);
    // 3. Add the item to UI
    UICtrl.addListItem (newItem, input.type);
    // 4. cleard the fields
    UICtrl.clearFields ();
    // 5. Calculate and update budget
    updateBudget ();
    //6. calculate and update percentages
    updatedPercentage ();
  };
  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split ('-');
      type = splitID[0];
      ID = +splitID[1];
      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem (type, ID);
      // 2. Delete the item from the UI
      UICtrl.deleteListItem (itemID);
      // 3. Update and show the new budget
      updateBudget ();
      //4. calculate and update percentage
      updatedPercentage ();
    }
  };
  return {
    init: function () {
      console.log ('Application has started');
      UICtrl.displayMonth ();
      UICtrl.displayBudget ({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setUpEventListener ();
    },
  };
}) (budgetController, UIController);

controller.init ();
