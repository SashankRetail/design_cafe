export const createPermissionsJson = (jsonData) => {
  let data = JSON.stringify(jsonData.permission_details);
  switch (true) {
    case data.includes("true"):
      data = replaceElementInObject(data, "true", "1");
    // falls through
    case data.includes("false"):
      data = replaceElementInObject(data, "false", "0");
    // falls through
    case data.includes("screenName"):
      data = replaceElementInObject(data, "screenName", "sn");
    // falls through
    case data.includes("isChecked"):
      data = replaceElementInObject(data, "isChecked", "ic");
    // falls through
    case data.includes("components"):
      data = replaceElementInObject(data, "components", "c");
    // falls through
    case data.includes("componentName"):
      data = replaceElementInObject(data, "componentName", "cn");
    // falls through
    case data.includes("attributes"):
      data = replaceElementInObject(data, "attributes", "a");
    // falls through
    case data.includes("attributeName"):
      data = replaceElementInObject(data, "attributeName", "an");
    // falls through
    case data.includes("isEditable"):
      data = replaceElementInObject(data, "isEditable", "ie");
    // falls through
    case data.includes("subComponents"):
      data = replaceElementInObject(data, "subComponents", "sc");
    // falls through
    case data.includes("subComponentName"):
      data = replaceElementInObject(data, "subComponentName", "scn");
    // falls through
  }
  const changedData = JSON.parse(data);
  removeEmptyArrays(changedData);
  console.log({ changedData });
  return changedData;
};

const replaceElementInObject = (data, element, changeString) => {
  return data.replace(new RegExp(element, "g"), changeString);
};

const removeEmptyArrays = (changedData) => {
  changedData.forEach((element) => {
    for (const key in element) {
      if (Array.isArray(element[key])) {
        if (!element[key].length) {
          delete element[key];
        } else {
          removeEmptyArrays(element[key]);
        }
      }
    }
  });
};
