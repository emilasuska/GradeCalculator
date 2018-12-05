function pageLoaded() {
    // add initial first row and populate with default data
    var rows = document.getElementById("rows");
    var row0 = createNewRow();
    rows.appendChild(row0);
    row0.children[0].children[0].value = "Tests";
    row0.children[1].children[0].value = "90, 87, 78, 95";
    row0.children[2].children[0].value = "75";
    document.getElementById("examWeight").value = "25";
    document.getElementById("desiredGrade").value = "90";

    allowRowChanges();
    dataChanged();
}

function dataChanged() {
    //calculateGradeNeeded();
}

function show(element, showing) {
    if (showing) {
        element.removeAttribute("hidden");
    } else {
        element.setAttribute("hidden", "");
    }
}

function enable(element, enabled) {
    if (enabled) {
        element.removeAttribute("disabled");
    } else {
        element.setAttribute("disabled", "");
    }
}

function getColorClassForGrade(grade) {
    if (isNaN(grade)) {
        return "";
    }
    if (grade >= 90) {
        return "grade90";
    }
    if (grade >= 80) {
        return "grade80";
    }
    if (grade >= 70) {
        return "grade70";
    }
    if (grade >= 60) {
        return "grade60";
    }
    if (grade >= 50) {
        return "grade50";
    }
    if (grade >= 0) {
        return "grade00";
    }
    return "";
}

function colorRow(row, grade) {
    var colorClass = getColorClassForGrade(grade);
    row.children[0].className = colorClass;
    row.children[1].className = colorClass;
    row.children[2].className = colorClass;
}

function allowRowChanges() {
    var rows = document.getElementById("rows").children;

    // disallow removal of single last row
    enable(rows[0].children[3].children[1], rows.length > 1);

    // disallow adding more than 6 rows
    var enableAdd = rows.length < 6;
    for (var i = 0; i < rows.length; i++) {
        enable(rows[i].children[3].children[0], enableAdd);
    }
}

function createNewRow() {
    // create a new row by copying a template
    var newRow = document.getElementById("templateRow").cloneNode(true);
    newRow.removeAttribute("id");
    return newRow;
}

function addRow(button) {
    // get row that was clicked
    var currentRow = button.parentElement.parentElement;

    // add a new row after current row
    currentRow.insertAdjacentElement("afterend", createNewRow());

    allowRowChanges();
}

function removeRow(button) {
    // get row that was clicked
    var currentRow = button.parentElement.parentElement;

    // remove the current row
    currentRow.remove();

    allowRowChanges();
}

function convertStringToNumber(string) {
    string = string.trim();
    if (string == "") {
        return 0;
    }
    return parseFloat(string);
}

function convertArrayStringToNumber(string) {
    var grades = string.split(",");
    for (var i = 0; i < grades.length; i++) {
        grades[i] = convertStringToNumber(grades[i]);
    }
    return grades;
}

function averageArray(array) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}

function calculateCurrentGrade() {
    // assume no user input errors
    var gradeError = false;
    var weightError = false;
    var weightSumError = false;

    var weightedAverage = 0;
    var totalWeight = 0;

    // loop over all rows of user input
    var rows = document.getElementById("rows").children;
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var gradesElement = row.children[1].children[0];
        var weightElement = row.children[2].children[0];

        var grades = convertArrayStringToNumber(gradesElement.value);
        var weight = convertStringToNumber(weightElement.value);
        var categoryAverage = averageArray(grades);

        weightedAverage += categoryAverage * weight / 100;
        totalWeight += weight;

        // color the background based on the grade
        if (weight <= 0) {
            categoryAverage = NaN;
        }
        colorRow(row, categoryAverage);

        // check for user input errors on grades
        gradesElement.className = "";
        for (var j = 0; j < grades.length; j++) {
            if (isNaN(grades[j] || grades[j] < 0 || grades[j] > 100)) {
                gradesElement.className = "error";
                gradeError = true;
            }
        }

        // check for user input errors on weights
        weightElement.className = "";
        if (isNaN(weight) || weight < 0 || weight > 100) {
            weightElement.className = "error";
            weightError = true;
        }
    }

    // check for user input errors on exam weight
    var examWeightElement = document.getElementById("examWeight");
    var examWeight = convertStringToNumber(examWeightElement.value);
    examWeightElement.className = "";
    if (isNaN(examWeight) || examWeight < 0 || examWeight > 100) {
        examWeightElement.className = "error";
        weightError = true;
    }

    // check total weight
    document.getElementById("totalWeight").value = totalWeight + examWeight;
    if (totalWeight + examWeight != 100) {
        weightSumError = true;
    }

    // show messages for all errors encountered
    show(document.getElementById("gradeError"), gradeError);
    show(document.getElementById("weightError"), weightError);
    show(document.getElementById("weightSumError"), weightSumError);

    if (gradeError || weightError || weightSumError) {
        // calculation is no good if there are any user input errors
        return NaN;
    }

    var currentGrade = 100 * weightedAverage / totalWeight;
    document.getElementById("currentGrade").value = currentGrade;
    return currentGrade;
}

function calculateGradeNeeded() {
    // do calculations
    var currentGrade = calculateCurrentGrade();
    var desiredGrade = convertStringToNumber(document.getElementById("desiredGrade").value);
    var examWeight = convertStringToNumber(document.getElementById("examWeight").value);
    var examGrade = (100 * desiredGrade - (100 - examWeight) * currentGrade) / examWeight;

    // color output rows based on grades
    colorRow(document.getElementById("currentGrade").parentNode.parentNode, currentGrade);
    colorRow(document.getElementById("examGrade").parentNode.parentNode, examGrade);
    colorRow(document.getElementById("desiredGrade").parentNode.parentNode, desiredGrade);

    // handle calculation errors because of invalid user input
    if (isNaN(currentGrade)) {
        currentGrade = "";
    } else {
        currentGrade = currentGrade.toFixed(1)
    }
    if (isNaN(examGrade)) {
        examGrade = "";
    } else {
        examGrade = examGrade.toFixed(1)
    }

    // output calculated values
    document.getElementById("currentGrade").value = currentGrade;
    document.getElementById("examGrade").value = examGrade;
}