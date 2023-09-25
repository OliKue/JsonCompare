const customAlert = document.getElementById("customAlert");
const closeAlertButton = document.getElementById("closeAlert");
const input1 = document.getElementById("input1");
const input2 = document.getElementById("input2");

// Load the saved data when the popup is opened
chrome.storage.local.get("myTexts", function (result) {
  var textsObject = result.myTexts;

  if (textsObject) {
    input1.textContent = textsObject.text1;
    input2.textContent = textsObject.text2;
  } else {
    input1.textContent = '{"No json": "saved yet."}';
    input2.textContent = '{"No json": "saved yet."}';
  }
});

document.getElementById("compareButton").addEventListener("click", function () {
  const jsonString1 = input1.value;
  const jsonString2 = input2.value;

  try {
    var json1 = JSON.parse(jsonString1);
  } catch (error) {
    window.alert("Invalid JSON input 1: " + error.message);
    return;
  }
  try {
    var json2 = JSON.parse(jsonString2);
  } catch (error) {
    window.alert("Invalid JSON input 2: " + error.message);
    return;
  }

  // Save data
  const textsObject = {
    text1: jsonString1,
    text2: jsonString2,
  };

  chrome.storage.local.set({ myTexts: textsObject }, function () {});

  var differences = [];

  function addItem(item) {
    differences.push(item);
  }

  function compareJSONObjects(obj1, obj2) {
    // Step 1: Check if both objects have the same keys
    const keySet1 = new Set(Object.keys(obj1));
    const keySet2 = new Set(Object.keys(obj2));

    for (const item of keySet1) {
      if (!keySet2.has(item)) {
        addItem("Input 2 is missing key: " + item);
      }
    }

    for (const item of keySet2) {
      if (!keySet1.has(item)) {
        addItem("Input 1 is missing key: " + item);
      }
    }

    if (differences.length > 0) {
      return false;
    }

    // Step 2: Compare values associated with each key
    const keys1 = Object.keys(obj1).sort();
    for (const key of keys1) {
      const value1 = obj1[key];
      const value2 = obj2[key];

      // Use a recursive call if the values are objects
      if (typeof value1 === "object" && typeof value2 === "object") {
        compareJSONObjects(value1, value2);
      } else {
        // Compare primitive values directly
        if (value1 !== value2) {
          addItem(
            "Input 1: {" +
              key +
              ":" +
              value1 +
              "} <br>Input 2: {" +
              key +
              ":" +
              value2 +
              "}"
          );
        }
      }
    }
    if (differences.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  if (compareJSONObjects(json1, json2)) {
    isEqualText.textContent = "Inputs are equal";
    diffDisplay.innerHTML = JSON.stringify(json1, null, 2, '<br>');
  } else {
    isEqualText.textContent = "Inputs are not equal";
    diffDisplay.innerHTML = differences.join("<br>");
  }

  customAlert.style.display = "block";
});

closeAlertButton.addEventListener("click", function () {
  customAlert.style.display = "none";
});
