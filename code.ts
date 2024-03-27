type ModifiedComponentPropertyDefinitions = {
  [K in keyof ComponentPropertyDefinitions]: ComponentPropertyDefinitions[K] & {
    id?: string;
  };
} & {
  name?: string;
  id?: string;
};

// Renames the keys which are of the form 'someString#nodeId' to 'someString'
const modifyKeys = (obj: ComponentPropertyDefinitions) => {
  const newObj = {} as ModifiedComponentPropertyDefinitions;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key.includes('#')) {
        const [newKey, prop] = key.split('#');
        newObj[newKey] = { id: prop, ...obj[key] };
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  return newObj;
};

figma.showUI(__html__);
figma.ui.onmessage = (msg: { type: string }) => {
  if (msg.type === 'export') {
    const componentSetPropDefArr = [] as ModifiedComponentPropertyDefinitions[];
    const componentSetNameIdArr = [] as string[];

    // Get variant properties from all the selected component sets
    const selectionArr = figma.currentPage.selection;
    for (const selection of selectionArr) {
      if (selection.type === 'COMPONENT_SET') {
        const componentSetPropDef = {
          name: selection.name,
          id: selection.id,
          ...modifyKeys(selection.componentPropertyDefinitions),
        } as ModifiedComponentPropertyDefinitions;
        componentSetPropDefArr.push(componentSetPropDef);
        componentSetNameIdArr.push(`${selection.id}-${selection.name}`);
      }
    }

    const fileanme = componentSetNameIdArr.join('$$');
    const json = JSON.stringify(componentSetPropDefArr);
    figma.ui.postMessage({ filename: fileanme, json: json });
  }
};
