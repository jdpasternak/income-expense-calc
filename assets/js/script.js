/* 
    Entry:
    <a class="collection-item row d-flex justify-content-between">
        <span class="col s12 m4 left-align" data-description data-entryid="1">
            Description
        </span>
        <span class="col s12 m4 right-align" data-amount data-entryid="1">
            $0.00
        </span>
    </a>
*/

var currencyFormatter = Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

var entryCounter = 0;

$(document).ready(() => {
  $(".modal").modal({
    onCloseEnd: () => {
      $(".modal input").each((_, i) => {
        $(i).val("");
        $(i).removeClass("invalid");
        $(i).removeClass("valid");
      });
      $(".modal label").each((_, l) => {
        $(l).removeClass("active");
      });
    },
  });

  $("#addEntryBtn").on("click", addEntryHandler);
  $("#saveEntryBtn").on("click", saveModifiedEntryHandler);
  $("#deleteEntryBtn").on("click", deleteEntryHandler);
});

$(document).on("click", "i", (evt) => {
  console.log(evt.target.dataset.category);
  if (evt.target.dataset.category === "income") {
    $("#entryType").text("Income");
    $("#addEntryModal form").attr("data-category", "income");
  } else if (evt.target.dataset.category === "expense") {
    $("#entryType").text("Expense");
    $("#addEntryModal form").attr("data-category", "expense");
  }
  $("#addEntryModal").modal("open");
});

// Add Entry Function
var addEntry = (description, amount, category) => {
  if (category === "expense") {
    amount = -Math.abs(amount);
  }
  var newEntry = $(
    `<a class="collection-item row d-flex justify-content-between" data-entryid="${entryCounter}">`
  );
  newEntry.html(`<span class="col s12 m4 left-align" data-description data-entryid="1">
      ${description}
  </span>
  <span class="col s12 m4 right-align" data-amount data-entryid="1">
      ${currencyFormatter.format(amount)}
  </span>`);
  $(`ul.collection[data-category="${category}"]`).append(newEntry);

  newEntry.on("click", modifyEntryHandler);
  entryCounter++;
};

// Add Entry Button Handler
var addEntryHandler = (evt) => {
  // gather inputs
  var description = $("#description").val();
  var amount = $("#amount").val();
  var category = $(".modal form")[0].dataset.category;

  // Income must be a positive non-zero number

  // Expense can accept positive or negative (handling abs val on the backend)

  // Check if description is greater than 3 or more characters
  if (description.length < 3) {
    M.toast({
      html: "Enter at least 3 letters for description.",
      classes: "red",
    });
    return false;
  }

  // Check for zero amount input
  if (amount === 0 || amount === "") {
    M.toast({
      html: "Amount must not be 0.",
      classes: "red",
    });
    return false;
  }

  // Check if income amount is negative
  if (category === "income" && amount < 0) {
    M.toast({
      html: "Income amount must be a postive number.",
      classes: "red",
    });
    return false;
  }

  addEntry(description, amount, category);
  $(".modal").modal("close");
};

var modifyEntryHandler = (evt) => {
  var description = $($(evt.target).closest("a").children()[0]).text().trim();
  var amount = $($(evt.target).closest("a").children()[1]).text().trim();
  var category = $(evt.target).closest("ul")[0].dataset.category;
  var id = $(evt.target).closest("a")[0].dataset.entryid;

  $("#editDeleteEntryModal").modal("open");
  $("#editDescription").val(description).addClass("valid");
  $("#editAmount").val(convertCurrencyFormatToFloat(amount)).addClass("valid");
  $(`label[for="editAmount"]`).addClass("active");
  $(`label[for="editDescription"]`).addClass("active");
  $(`#editDeleteEntryModal form`).attr("data-category", category);
  $(`#editDeleteEntryModal form`).attr("data-entryid", id);
};

var saveModifiedEntryHandler = (evt) => {
  console.log($(`#editDeleteEntryModal form`)[0].dataset.category);
  var category = $(`#editDeleteEntryModal form`)[0].dataset.category;
  var description = $("#editDescription").val();
  var amount = $("#editAmount").val();
  var id = $(`#editDeleteEntryModal form`)[0].dataset.entryid;
  console.log(category, description, amount, id);

  if (validateInputs(description, amount, category)) {
    saveModifiedEntry(description, amount, category, id);
    $("#editDeleteEntryModal").modal("close");
  }
};

var saveModifiedEntry = (description, amount, category, id) => {
  var descriptionEl = $(`a[data-entryid="${id}"] span[data-description]`);
  var amountEl = $(`a[data-entryid="${id}"] span[data-amount]`);

  descriptionEl.text(description);
  amountEl.text(currencyFormatter.format(amount));
};

var deleteEntryHandler = (evt) => {
  var id = $("#editDeleteEntryModal form")[0].dataset.entryid;
  $(`a[data-entryid="${id}"`).hide();
  $("#editDeleteEntryModal").modal("close");
  var myToast = M.toast({
    html: `<span>Entry deleted.</span><button class="btn-flat toast-action">UNDO</button>"`,
    classes: "orange",
    // completeCallback: () => deleteEntry(id),
  });
  var deleteTimeout = setTimeout(() => {
    deleteEntry(id);
  }, myToast.options.displayLength);
  $(".toast-action").on("click", () => {
    window.clearTimeout(deleteTimeout);
    myToast.dismiss();
    $(`a[data-entryid="${id}"`).show();
  });
};

var deleteEntry = (id) => {
  $(`a[data-entryid="${id}"]`).remove();
};

// Utility Functions
var convertCurrencyFormatToFloat = (currency) => {
  currency = currency.replace("$", "");
  currency = currency.replace(",", "");
  currency = parseFloat(currency);
  return currency;
};

var validateInputs = (description, amount, category) => {
  // Check if description is greater than 3 or more characters
  if (description.length < 3) {
    M.toast({
      html: "Enter at least 3 letters for description.",
      classes: "red",
    });
    return false;
  }

  // Check for zero amount input
  if (amount === 0 || amount === "") {
    M.toast({
      html: "Amount must not be 0.",
      classes: "red",
    });
    return false;
  }

  // Check if income amount is negative
  if (category === "income" && amount < 0) {
    M.toast({
      html: "Income amount must be a postive number.",
      classes: "red",
    });
    return false;
  }

  return true;
};

/* 
  Testing
*/
addEntry("Some desc", "1234", "income");
// $(document).on("click", "#addExpenseBtn", (evt) => {
//   console.log(evt.target);
//   $("#entryType").text("Expense");
//   $(".modal").modal("open");

//   var description = $("#description").val();
//   var amount = $("#amount").val();
// });
