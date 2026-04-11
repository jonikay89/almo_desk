import { defineTypeAlias, composeProtocols, Protocol, AssociatedType } from './Protocol.js';
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

export const TableViewDelegate = createDelegateProtocol('TableViewDelegate', [
    'tableViewDidSelectRowAt',
    'tableView_titleForHeaderInSection',
    'tableView_titleForFooterInSection',
    'tableView_heightForRowAt',
    'tableView_heightForHeaderInSection',
    'tableView_heightForFooterInSection'
]);

export const TableViewDataSource = createDataSourceProtocol('TableViewDataSource', [
    'tableView_numberOfRowsInSection',
    'tableView_cellForRowAt',
    'numberOfSectionsInTableView'
]);

export const CollectionViewDelegate = createDelegateProtocol('CollectionViewDelegate', [
    'collectionViewDidSelectItemAt',
    'collectionView_sizeForItemAt'
]);

export const CollectionViewDataSource = createDataSourceProtocol('CollectionViewDataSource', [
    'numberOfSectionsInCollectionView',
    'numberOfItemsInCollectionView',
    'collectionView_cellForItemAt'
]);

export const PickerViewDelegate = createDelegateProtocol('PickerViewDelegate', [
    'pickerView_titleForRow_forComponent',
    'pickerView_didSelectRow_inComponent'
]);

export const PickerViewDataSource = createDataSourceProtocol('PickerViewDataSource', [
    'numberOfComponentsInPickerView',
    'pickerView_numberOfRowsInComponent'
]);

export const TextFieldDelegate = createDelegateProtocol('TextFieldDelegate', [
    'textFieldDidBeginEditing',
    'textFieldDidEndEditing',
    'textFieldDidChange',
    'textFieldShouldReturn'
]);

export const TextViewDelegate = createDelegateProtocol('TextViewDelegate', [
    'textViewDidBeginEditing',
    'textViewDidEndEditing',
    'textViewDidChange'
]);

export const SearchBarDelegate = createDelegateProtocol('SearchBarDelegate', [
    'searchBarTextDidChange',
    'searchBarSearchButtonClicked',
    'searchBarCancelButtonClicked'
]);

export const NavigationBarDelegate = createDelegateProtocol('NavigationBarDelegate', [
    'navigationBarDidSelectItem'
]);

export const TabBarDelegate = createDelegateProtocol('TabBarDelegate', [
    'tabBarDidSelectItem'
]);

export const AlertDelegate = createDelegateProtocol('AlertDelegate', [
    'alertDidDismiss'
]);

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

export const StringProcessor = Protocol.define('StringProcessor', {
    methods: ['process']
});

export const NumberProcessor = Protocol.define('NumberProcessor', {
    methods: ['calculate']
});

export const Container = Protocol.define('Container', {
    associatedTypes: {
        Item: null
    },
    properties: {
        items: { get: true, set: true }
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
    StringProcessor,
    NumberProcessor,
    Container,
    createProcessor,
    UppercaseProcessor,
    DoubleProcessor,
    executeProcess
};
