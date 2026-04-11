import { defineTypeAlias, composeProtocols, Protocol, AssociatedType, extendProtocol, extendProtocolWhere } from './Protocol.js';
import { Optional, Result, Box } from './Generics.js';

export const CustomStringConvertibleAlias = defineTypeAlias('StringConvertible');
export const RawRepresentableAlias = defineTypeAlias('RawRepresentable');

export const ExpressibleByAlias = defineTypeAlias('ExpressibleBy',
    'ExpressibleByStringLiteral',
    'ExpressibleByNumberLiteral',
    'ExpressibleByBooleanLiteral'
);

export const StringLiteralConvertible = defineTypeAlias('StringLiteralConvertible',
    'CustomStringConvertible',
    'ExpressibleByStringLiteral'
);

export const NumericConvertible = defineTypeAlias('NumericConvertible',
    'CustomStringConvertible',
    'ExpressibleByNumberLiteral'
);

export const CollectionConvertible = defineTypeAlias('CollectionConvertible',
    'ExpressibleByArrayLiteral',
    'ExpressibleByDictionaryLiteral'
);

export const CodableAlias = defineTypeAlias('CodableType');

export const NetworkResponse = defineTypeAlias('NetworkResponse');
export const NetworkCompletion = defineTypeAlias('NetworkCompletion');
export const VoidResult = defineTypeAlias('VoidResult');
export const VoidCompletion = defineTypeAlias('VoidCompletion');

export function createDelegateProtocol(name, methods) {
    return Protocol.define(name, { methods });
}

export function createDataSourceProtocol(name, methods) {
    return Protocol.define(name, { methods });
}

export function createDelegationBundle(name, ...delegates) {
    return defineTypeAlias(name, ...delegates);
}

export const ScrollViewDelegate = createDelegateProtocol('ScrollViewDelegate', [
    'scrollViewDidScroll',
    'scrollViewDidZoom',
    'scrollViewWillBeginDragging',
    'scrollViewWillEndDragging',
    'scrollViewDidEndDragging',
    'scrollViewDidEndDecelerating'
]);

extendProtocol(ScrollViewDelegate, {
    scrollViewDidScroll(scrollView) {
        return null;
    },
    scrollViewDidZoom(scrollView) {
        return null;
    },
    scrollViewWillBeginDragging(scrollView) {
        return null;
    },
    scrollViewWillEndDragging(scrollView, velocity) {
        return null;
    },
    scrollViewDidEndDragging(scrollView, decelerate) {
        return null;
    },
    scrollViewDidEndDecelerating(scrollView) {
        return null;
    }
});

export const TableViewDelegate = createDelegateProtocol('TableViewDelegate', [
    'tableViewDidSelectRowAt',
    'tableView_titleForHeaderInSection',
    'tableView_titleForFooterInSection',
    'tableView_heightForRowAt',
    'tableView_heightForHeaderInSection',
    'tableView_heightForFooterInSection'
]);

extendProtocol(TableViewDelegate, {
    tableViewDidSelectRowAt(tableView, index, section) {
        return null;
    },
    tableView_titleForHeaderInSection(tableView, section) {
        return null;
    },
    tableView_titleForFooterInSection(tableView, section) {
        return null;
    },
    tableView_heightForRowAt(tableView, indexPath) {
        return tableView.rowHeight || 44;
    },
    tableView_heightForHeaderInSection(tableView, section) {
        return tableView.sectionHeaderHeight || 30;
    },
    tableView_heightForFooterInSection(tableView, section) {
        return tableView.sectionFooterHeight || 0;
    }
});

export const TableViewDataSource = createDataSourceProtocol('TableViewDataSource', [
    'tableView_numberOfRowsInSection',
    'tableView_cellForRowAt',
    'numberOfSectionsInTableView'
]);

extendProtocol(TableViewDataSource, {
    numberOfSectionsInTableView(tableView) {
        return 1;
    },
    tableView_numberOfRowsInSection(tableView, section) {
        return 0;
    },
    tableView_cellForRowAt(tableView, index, section) {
        return null;
    }
});

export const CollectionViewDelegate = createDelegateProtocol('CollectionViewDelegate', [
    'collectionViewDidSelectItemAt',
    'collectionView_sizeForItemAt'
]);

extendProtocol(CollectionViewDelegate, {
    collectionViewDidSelectItemAt(collectionView, indexPath) {
        return null;
    },
    collectionView_sizeForItemAt(collectionView, indexPath) {
        return { width: 100, height: 100 };
    }
});

export const CollectionViewDataSource = createDataSourceProtocol('CollectionViewDataSource', [
    'numberOfSectionsInCollectionView',
    'numberOfItemsInCollectionView',
    'collectionView_cellForItemAt'
]);

extendProtocol(CollectionViewDataSource, {
    numberOfSectionsInCollectionView(collectionView) {
        return 1;
    },
    numberOfItemsInCollectionView(collectionView, section) {
        return 0;
    },
    collectionView_cellForItemAt(collectionView, indexPath) {
        return null;
    }
});

export const PickerViewDelegate = createDelegateProtocol('PickerViewDelegate', [
    'pickerView_titleForRow_forComponent',
    'pickerView_didSelectRow_inComponent'
]);

extendProtocol(PickerViewDelegate, {
    pickerView_titleForRow_forComponent(pickerView, row, component) {
        return '';
    },
    pickerView_didSelectRow_inComponent(pickerView, row, component) {
        return null;
    }
});

export const PickerViewDataSource = createDataSourceProtocol('PickerViewDataSource', [
    'numberOfComponentsInPickerView',
    'pickerView_numberOfRowsInComponent'
]);

extendProtocol(PickerViewDataSource, {
    numberOfComponentsInPickerView(pickerView) {
        return 1;
    },
    pickerView_numberOfRowsInComponent(pickerView, component) {
        return 0;
    }
});

export const TextFieldDelegate = createDelegateProtocol('TextFieldDelegate', [
    'textFieldDidBeginEditing',
    'textFieldDidEndEditing',
    'textFieldDidChange',
    'textFieldShouldReturn'
]);

extendProtocol(TextFieldDelegate, {
    textFieldDidBeginEditing(textField) {
        return null;
    },
    textFieldDidEndEditing(textField) {
        return null;
    },
    textFieldDidChange(textField) {
        return null;
    },
    textFieldShouldReturn(textField) {
        return true;
    }
});

export const TextViewDelegate = createDelegateProtocol('TextViewDelegate', [
    'textViewDidBeginEditing',
    'textViewDidEndEditing',
    'textViewDidChange'
]);

extendProtocol(TextViewDelegate, {
    textViewDidBeginEditing(textView) {
        return null;
    },
    textViewDidEndEditing(textView) {
        return null;
    },
    textViewDidChange(textView) {
        return null;
    }
});

export const SearchBarDelegate = createDelegateProtocol('SearchBarDelegate', [
    'searchBarTextDidChange',
    'searchBarSearchButtonClicked',
    'searchBarCancelButtonClicked'
]);

extendProtocol(SearchBarDelegate, {
    searchBarTextDidChange(searchBar, text) {
        return null;
    },
    searchBarSearchButtonClicked(searchBar) {
        return null;
    },
    searchBarCancelButtonClicked(searchBar) {
        return null;
    }
});

export const NavigationBarDelegate = createDelegateProtocol('NavigationBarDelegate', [
    'navigationBarDidSelectItem'
]);

extendProtocol(NavigationBarDelegate, {
    navigationBarDidSelectItem(navigationBar, item) {
        return null;
    }
});

export const TabBarDelegate = createDelegateProtocol('TabBarDelegate', [
    'tabBarDidSelectItem'
]);

extendProtocol(TabBarDelegate, {
    tabBarDidSelectItem(tabBar, item) {
        return null;
    }
});

export const AlertDelegate = createDelegateProtocol('AlertDelegate', [
    'alertDidDismiss'
]);

extendProtocol(AlertDelegate, {
    alertDidDismiss(alertController, action) {
        return null;
    }
});

defineTypeAlias('ViewDelegate', ScrollViewDelegate);
defineTypeAlias('TableViewDelegateBundle', TableViewDelegate, TableViewDataSource);
defineTypeAlias('CollectionViewDelegateBundle', CollectionViewDelegate, CollectionViewDataSource);
defineTypeAlias('PickerViewDelegateBundle', PickerViewDelegate, PickerViewDataSource);
defineTypeAlias('InputDelegate', TextFieldDelegate, TextViewDelegate);
defineTypeAlias('SearchDelegate', SearchBarDelegate);
defineTypeAlias('NavigationDelegate', NavigationBarDelegate, TabBarDelegate);

export const Processor = Protocol.define('Processor', {
    associatedTypes: {
        Input: null,
        Output: null
    },
    methods: ['transform']
});

export const Container = Protocol.define('Container', {
    associatedTypes: {
        Item: null
    },
    properties: {
        items: { get: true, set: true }
    }
});

extendProtocol(Container, {
    get count() {
        return this.items?.length || 0;
    },
    append(item) {
        if (this.items) {
            this.items.push(item);
        }
        return this;
    },
    itemAt(index) {
        return this.items?.[index] || null;
    },
    isEmpty() {
        return this.count === 0;
    }
});

extendProtocolWhere(Container, {
    sum() {
        return this.items?.reduce((acc, item) => acc + item, 0) || 0;
    }
}, (instance) => {
    return instance.items?.every(item => typeof item === 'number') || false;
});

extendProtocolWhere(Container, {
    concatenated() {
        return this.items?.join('') || '';
    }
}, (instance) => {
    return instance.items?.every(item => typeof item === 'string') || false;
});

export const StringProcessor = Protocol.define('StringProcessor', {
    methods: ['process']
});

extendProtocol(StringProcessor, {
    process(input) {
        return String(input);
    }
});

export const NumberProcessor = Protocol.define('NumberProcessor', {
    methods: ['calculate']
});

extendProtocol(NumberProcessor, {
    calculate(input) {
        return Number(input) || 0;
    }
});

export function createProcessor(typeAlias, InputType, OutputType) {
    const processor = {
        [Symbol.for('typealias')]: typeAlias,
        _inputType: InputType,
        _outputType: OutputType
    };
    return processor;
}

export const UppercaseProcessor = createProcessor('UppercaseProcessor', String, String);
export const DoubleProcessor = createProcessor('DoubleProcessor', Number, Number);

export function executeProcess(data, processor) {
    if (typeof processor.transform === 'function') {
        return processor.transform(data);
    }
    return data;
}

export default {
    CustomStringConvertibleAlias,
    RawRepresentableAlias,
    ExpressibleByAlias,
    StringLiteralConvertible,
    NumericConvertible,
    CollectionConvertible,
    CodableAlias,
    NetworkResponse,
    NetworkCompletion,
    VoidResult,
    VoidCompletion,
    createDelegateProtocol,
    createDataSourceProtocol,
    createDelegationBundle,
    ScrollViewDelegate,
    TableViewDelegate,
    TableViewDataSource,
    CollectionViewDelegate,
    CollectionViewDataSource,
    PickerViewDelegate,
    PickerViewDataSource,
    TextFieldDelegate,
    TextViewDelegate,
    SearchBarDelegate,
    NavigationBarDelegate,
    TabBarDelegate,
    AlertDelegate,
    Processor,
    Container,
    StringProcessor,
    NumberProcessor,
    createProcessor,
    UppercaseProcessor,
    DoubleProcessor,
    executeProcess,
    extendProtocol,
    extendProtocolWhere
};
