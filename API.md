# UIKit Web Components API Guide

A UIKit-inspired component library for web development with Swift-like APIs.

## Foundation Classes

### NSValue
Container for wrapping C-style values (points, sizes, rects).

```javascript
import { NSValue } from './src/core/index.js';

const point = NSValue.valueWithPoint({ x: 10, y: 20 });
point.pointValue(); // { x: 10, y: 20 }
point.type; // 'point'
```

### NSNumber
Container for numeric values (int, double, bool).

```javascript
import { NSNumber } from './src/core/index.js';

const num = new NSNumber(42);
num.numberValue; // 42
num.intValue; // 42
num.doubleValue; // 42
num.boolValue; // true
num.stringValue; // '42'

const boolNum = NSNumber.valueWithBool(true);
boolNum.boolValue; // true
```

### Data
Byte buffer for handling binary data.

```javascript
import { Data } from './src/core/index.js';

const data = Data.fromString('hello');
data.length; // 5
data.toArray(); // [104, 101, 108, 108, 111]
data.base64EncodedString(); // 'aGVsbG8='

const decoded = Data.fromBase64EncodedString('aGVsbG8=');
decoded.toString(0); // 'hello'
```

### NSURL
URL handling similar to Foundation's NSURL.

```javascript
import { NSURL } from './src/core/index.js';

const url = new NSURL('https://example.com/path/to/page?query=1#section');
url.scheme; // 'https'
url.host; // 'example.com'
url.path; // '/path/to/page'
url.isValid; // true

const fileUrl = NSURL.fileURLWithPath('/Users/name/file.txt');
fileUrl.isFileURL; // true

const appended = url.appendingPathComponent('new');
url.pathExtension(); // 'txt'
```

### Scanner
String parsing for extracting numbers, strings, and patterns.

```javascript
import { Scanner } from './src/core/index.js';

const scanner = new Scanner('42 is the answer');
scanner.scanInt(); // 42
scanner.scanString('is '); // 'is '
scanner.scanUpToString('answer'); // 'the '
scanner.skipSpaces();
scanner.scanDouble(); // 3.14159
```

### Codable / JSONEncoder / JSONDecoder
Encoding and decoding objects to/from JSON.

```javascript
import { CodableEncoder, CodableDecoder, encode, decode } from './src/core/index.js';

const obj = { name: 'John', age: 30 };
const json = encode(obj);
const decoded = decode(Object, json);

// With Date
const date = new Date('2024-01-15T12:00:00Z');
const encoder = new CodableEncoder();
const encoded = encoder.encode(date);
```

### CustomStringConvertible
Protocol for custom string descriptions.

```javascript
const product = {
    name: 'Apple',
    price: 0.99,
    get description() {
        return `Product: ${this.name} costs $${this.price.toFixed(2)}`;
    }
};
product.description; // 'Product: Apple costs $0.99'
```

### RawRepresentable
Protocol for types with raw values (like Swift enums).

```javascript
const UserRole = {
    admin: { rawValue: 'ADMIN_LEVEL_1' },
    editor: { rawValue: 'CONTENT_EDITOR' },
    viewer: { rawValue: 'GUEST_VIEWER' }
};
UserRole.admin.rawValue; // 'ADMIN_LEVEL_1'
```

## Foundation Integration in UIKit Components

UIKit components have been enhanced with Foundation classes:

### UIView
```javascript
// CustomStringConvertible
view.description; // "UIView(frame: {x: 0, y: 0, width: 100, height: 50})"

// NSValue helpers
view.frameValue();    // NSValue with rect
view.boundsValue();   // NSValue with rect
view.centerValue();    // NSValue with point
view.sizeValue();      // NSValue with size
view.pointValue();     // NSValue with point

// Codable
view.encode();        // { frame, bounds, center, alpha, hidden, tag, zIndex, backgroundColor }
UIView.decode(data);  // Reconstruct view from data
```

### UIColor
```javascript
// CustomStringConvertible
color.description; // "UIColor(red: 0.000, green: 0.478, blue: 1.000, alpha: 1.000)"

// NSNumber helpers
color.redValue();      // NSNumber
color.greenValue();    // NSNumber
color.blueValue();     // NSNumber
color.alphaValue();    // NSNumber

// Codable
color.encode();        // { red, green, blue, alpha }
UIColor.decode(data); // Reconstruct color
```

### UISlider, UIStepper
```javascript
// CustomStringConvertible
slider.description; // "UISlider(value: 0.500, range: [0, 1])"

// NSNumber helpers
slider.valueAsNumber();        // NSNumber
slider.minimumValueAsNumber(); // NSNumber
slider.maximumValueAsNumber(); // NSNumber

// Codable
slider.encode();              // { value, minimumValue, maximumValue }
UISlider.decode(data);        // Reconstruct slider
```

### UISwitch
```javascript
// CustomStringConvertible
sw.description; // "UISwitch(isOn: true)"

// NSNumber helpers
sw.isOnAsNumber(); // NSNumber (1 or 0)

// Codable
sw.encode();        // { isOn }
UISwitch.decode(data);
```

### UIProgressView
```javascript
// CustomStringConvertible
progress.description; // "UIProgressView(progress: 50.0%)"

// NSNumber helpers
progress.progressAsNumber(); // NSNumber

// Codable
progress.encode();             // { progress }
UIProgressView.decode(data);
```

### UIPageControl
```javascript
// CustomStringConvertible
pageControl.description; // "UIPageControl(currentPage: 0, numberOfPages: 5)"

// NSNumber helpers
pageControl.currentPageAsNumber();   // NSNumber
pageControl.numberOfPagesAsNumber(); // NSNumber

// Codable
pageControl.encode();               // { currentPage, numberOfPages }
UIPageControl.decode(data);
```

### UITextField
```javascript
// CustomStringConvertible
textField.description; // "UITextField(text: "hello", placeholder: "Enter text")"

// Scanner helpers
textField.scanner();      // Create Scanner from text
textField.parseInt();     // Parse integer from text
textField.parseDouble();  // Parse double from text
textField.textAsNumber(); // NSNumber or null

// Codable
textField.encode();        // { text, placeholder, fontSize, textAlignment, isSecureTextEntry, keyboardType }
UITextField.decode(data);
```

### UILabel
```javascript
// CustomStringConvertible
label.description; // "UILabel(text: "Hello World")"

// Codable
label.encode();     // { text, fontSize, fontFamily, fontWeight, textAlignment, numberOfLines, isEnabled }
UILabel.decode(data);
```

### UIImage
```javascript
// CustomStringConvertible
image.description; // "UIImage(url: "photo.jpg")"

// Data integration
image.imageData;        // Data object
image.dataValue();      // Data object

// Codable
image.encode();      // { imageUrl, contentMode, backgroundColor }
UIImage.decode(data);
```

### UIActivityIndicatorView
```javascript
// CustomStringConvertible
indicator.description; // "UIActivityIndicatorView(style: large, isAnimating: true)"

// Codable
indicator.encode();                  // { style, hidesWhenStopped }
UIActivityIndicatorView.decode(data);
```

## Core Classes

### NSValue
Container for wrapping C-style values (points, sizes, rects).

```javascript
import { NSValue } from './src/core/index.js';

const point = NSValue.valueWithPoint({ x: 10, y: 20 });
point.pointValue(); // { x: 10, y: 20 }
point.type; // 'point'
```

### NSNumber
Container for numeric values (int, double, bool).

```javascript
import { NSNumber } from './src/core/index.js';

const num = new NSNumber(42);
num.numberValue; // 42
num.intValue; // 42
num.doubleValue; // 42
num.boolValue; // true
num.stringValue; // '42'

const boolNum = NSNumber.valueWithBool(true);
boolNum.boolValue; // true
```

### Data
Byte buffer for handling binary data.

```javascript
import { Data } from './src/core/index.js';

const data = Data.fromString('hello');
data.length; // 5
data.toArray(); // [104, 101, 108, 108, 111]
data.base64EncodedString(); // 'aGVsbG8='

const decoded = Data.fromBase64EncodedString('aGVsbG8=');
decoded.toString(0); // 'hello'
```

### NSURL
URL handling similar to Foundation's NSURL.

```javascript
import { NSURL } from './src/core/index.js';

const url = new NSURL('https://example.com/path/to/page?query=1#section');
url.scheme; // 'https'
url.host; // 'example.com'
url.path; // '/path/to/page'
url.isValid; // true

const fileUrl = NSURL.fileURLWithPath('/Users/name/file.txt');
fileUrl.isFileURL; // true

const appended = url.appendingPathComponent('new');
url.pathExtension(); // 'txt'
```

### Scanner
String parsing for extracting numbers, strings, and patterns.

```javascript
import { Scanner } from './src/core/index.js';

const scanner = new Scanner('42 is the answer');
scanner.scanInt(); // 42
scanner.scanString('is '); // 'is '
scanner.scanUpToString('answer'); // 'the '
scanner.skipSpaces();
scanner.scanDouble(); // 3.14159
```

### Codable / JSONEncoder / JSONDecoder
Encoding and decoding objects to/from JSON.

```javascript
import { CodableEncoder, CodableDecoder, encode, decode } from './src/core/index.js';

const obj = { name: 'John', age: 30 };
const json = encode(obj);
const decoded = decode(Object, json);

// With Date
const date = new Date('2024-01-15T12:00:00Z');
const encoder = new CodableEncoder();
const encoded = encoder.encode(date);
```

### CustomStringConvertible
Protocol for custom string descriptions.

```javascript
const product = {
    name: 'Apple',
    price: 0.99,
    get description() {
        return `Product: ${this.name} costs $${this.price.toFixed(2)}`;
    }
};
product.description; // 'Product: Apple costs $0.99'
```

### RawRepresentable
Protocol for types with raw values (like Swift enums).

```javascript
const UserRole = {
    admin: { rawValue: 'ADMIN_LEVEL_1' },
    editor: { rawValue: 'CONTENT_EDITOR' },
    viewer: { rawValue: 'GUEST_VIEWER' }
};
UserRole.admin.rawValue; // 'ADMIN_LEVEL_1'
```

## Core Classes

### NSObject
Base class with hash, equality, and KVO support.

```javascript
import { NSObject } from './src/core/index.js';

class MyClass extends NSObject {
    constructor() {
        super();
    }
}
```

### NSArray / NSMutableArray
Ordered collections with Foundation-style API.

```javascript
import { NSArray, NSMutableArray } from './src/core/index.js';

const arr = new NSArray([1, 2, 3]);
arr.count; // 3
arr.firstObject; // 1
arr.lastObject; // 3

const mutable = new NSMutableArray([1, 2, 3]);
mutable.addObject(4);
mutable.insertObjectAtIndex(0, 0);
mutable.removeObjectAtIndex(1);
```

### NSDictionary / NSMutableDictionary
Key-value collections.

```javascript
import { NSDictionary, NSMutableDictionary } from './src/core/index.js';

const dict = new NSDictionary({ name: 'John', age: 30 });
dict.objectForKey('name'); // 'John'
dict.allKeys; // ['name', 'age']
dict.allValues; // ['John', 30]
```

### SwiftArray
Modern array with Swift-style methods.

```javascript
import { SwiftArray } from './src/core/index.js';

const arr = new SwiftArray([1, 2, 3, 4, 5]);
arr.filter(x => x > 2); // [3, 4, 5]
arr.map(x => x * 2); // [2, 4, 6, 8, 10]
arr.reduce(0, (acc, x) => acc + x); // 15
```

Note: Swift syntax like `(where predicate)`, `(of element)`, `(at index)` are Swift-specific and not valid JavaScript. Use JavaScript equivalents like `firstIndex(predicate)`, `indexOfElement(element)`, `removeAt(index)`.

### Optional<T>
Nullable values with safe unwrapping.

```javascript
import { Optional } from './src/core/index.js';

const value = Optional.of(null);
value.isPresent; // false
value.isEmpty; // true

const str = Optional.of('hello');
str.getOrElse('default'); // 'hello'
str.map(s => s.toUpperCase()).getOrElse(''); // 'HELLO'
```

### Result<T>
Success/Failure handling.

```javascript
import { Result } from './src/core/index.js';

const success = Result.success('data');
const failure = Result.failure(new Error('error'));

success.isSuccess; // true
failure.isFailure; // true

success.getOrElse('default'); // 'data'
failure.getOrElse('default'); // 'default'
```

## Protocols

### Protocol Definition
```javascript
import { Protocol } from './src/core/index.js';

const Drawable = new Protocol('Drawable');
Drawable.property('color');
Drawable.method('draw');

class Circle extends Drawable {
    draw() { /* ... */ }
}
```

### Built-in Protocols
- `Identifiable` - For types with a unique identifier
- `Equatable` - For value equality
- `Hashable` - For use as dictionary keys
- `Comparable` - For sorting
- `Codable` - For encoding/decoding

## UIKit Components

### UIView
Base view class with frame, bounds, and center properties.

```javascript
import { UIView, UIColor } from './src/core/index.js';

const view = new UIView();
view.init();
view.frame = { x: 100, y: 100, width: 200, height: 150 };
view.backgroundColor = UIColor.systemBlue();
view.alpha = 0.8;
view.hidden = false;

view.addSubview(childView);
view.removeFromSuperview();
```

### UIViewController
View controller with lifecycle methods.

```javascript
import { UIViewController } from './src/core/index.js';

class MyViewController extends UIViewController {
    loadView() {
        this.view = new UIView();
        this.view.element = this.createView();
        this.isViewLoaded = true;
    }

    viewDidLoad() {
        // Called after view is loaded
    }

    viewWillAppear(animated) {
        // Called before view appears
    }

    viewDidAppear(animated) {
        // Called after view appears
    }
}
```

### UIScrollView
Scrollable view with delegate support (weak delegate).

```javascript
import { UIScrollView } from './src/core/index.js';

const scrollView = new UIScrollView();
scrollView.init();
scrollView.frame = { x: 0, y: 0, width: 300, height: 400 };

scrollView.delegate = myDelegate; // Weak reference
scrollView.contentSize = { width: 300, height: 1000 };
scrollView.setContentOffset({ x: 0, y: 100 }, true);
```

### UITableView
Table view with weak delegate/dataSource.

```javascript
import { UITableView, UITableViewCell } from './src/core/index.js';

const tableView = new UITableView();
tableView.init();
tableView.frame = { x: 0, y: 0, width: 300, height: 400 };
tableView.rowHeight = 44;

tableView.delegate = myDelegate; // Weak reference
tableView.dataSource = myDataSource; // Weak reference

tableView.dataSource = {
    tableView_numberOfRowsInSection: (tv, section) => 10,
    tableView_cellForRowAt: (tv, row, section) => {
        const cell = new UITableViewCell();
        cell.text = `Item ${row + 1}`;
        return cell;
    }
};

tableView.reloadData();
```

### UICollectionView
Collection view with weak delegate/dataSource.

```javascript
import { UICollectionView, UICollectionViewCell, UICollectionViewFlowLayout } from './src/core/index.js';

const layout = new UICollectionViewFlowLayout();
layout.itemSize = { width: 100, height: 100 };
layout.minimumInteritemSpacing = 10;

const collectionView = new UICollectionView({ x: 0, y: 0, width: 300, height: 400 }, layout);
collectionView.init();
collectionView.delegate = myDelegate; // Weak reference
collectionView.dataSource = myDataSource; // Weak reference
collectionView.reloadData();
```

### UIPickerView
Picker view with weak delegate/dataSource.

```javascript
import { UIPickerView } from './src/core/index.js';

const pickerView = new UIPickerView();
pickerView.init();
pickerView.frame = { x: 0, y: 0, width: 300, height: 150 };

pickerView.delegate = myDelegate; // Weak reference
pickerView.dataSource = myDataSource; // Weak reference

pickerView.dataSource = {
    numberOfComponentsInPickerView: (pv) => 2,
    pickerView_numberOfRowsInComponent: (pv, component) => component === 0 ? 5 : 10,
    pickerView_titleForRow_forComponent: (pv, row, component) => `Item ${row}`
};

pickerView.reloadAllComponents();
pickerView.selectRow(2, 0, true);
```

### UIControl
Base control class with target-action pattern (weak targets).

```javascript
import { UIControl } from './src/core/index.js';

// Button with target-action
const button = new UIButton('Click Me');
button.init();
button.frame = { x: 100, y: 100, width: 120, height: 44 };
button.backgroundColor = UIColor.systemBlue();
button.titleColor = UIColor.white();
button.cornerRadius = 8;

button.addTarget({
    onTap: () => console.log('Button tapped!')
}, 'onTap', 'click');
```

### UIButton
```javascript
import { UIButton } from './src/core/index.js';

const button = new UIButton('Submit');
button.init();
button.frame = { x: 0, y: 0, width: 100, height: 44 };
button.backgroundColor = UIColor.systemBlue();
button.titleColor = UIColor.white();
button.cornerRadius = 8;
button.fontSize = 16;
```

### UISwitch
```javascript
import { UISwitch } from './src/core/index.js';

const toggle = new UISwitch();
toggle.init();
toggle.frame = { x: 0, y: 0, width: 51, height: 31 };
toggle.onTintColor = UIColor.systemGreen();
toggle.isOn = true;
```

### UISlider
```javascript
import { UISlider } from './src/core/index.js';

const slider = new UISlider();
slider.init();
slider.frame = { x: 0, y: 0, width: 200, height: 30 };
slider.minimumValue = 0;
slider.maximumValue = 100;
slider.value = 50;
slider.minimumTrackTintColor = UIColor.systemBlue();
```

### UIStepper
```javascript
import { UIStepper } from './src/core/index.js';

const stepper = new UIStepper();
stepper.init();
stepper.frame = { x: 0, y: 0, width: 120, height: 36 };
stepper.minimumValue = 0;
stepper.maximumValue = 100;
stepper.stepValue = 1;
stepper.value = 10;
```

### UISegmentedControl
```javascript
import { UISegmentedControl } from './src/core/index.js';

const segment = new UISegmentedControl(['Low', 'Medium', 'High']);
segment.init();
segment.frame = { x: 0, y: 0, width: 280, height: 36 };
segment.selectedSegmentIndex = 1;
segment.tintColor = UIColor.systemBlue();
```

### UITextField
```javascript
import { UITextField } from './src/core/index.js';

const textField = new UITextField('Enter text');
textField.init();
textField.frame = { x: 0, y: 0, width: 200, height: 36 };
textField.borderStyle = 'rounded';
textField.placeholder = 'Username';
textField.keyboardType = 'emailAddress';
textField.isSecureTextEntry = false;
```

### UITextView
```javascript
import { UITextView } from './src/core/index.js';

const textView = new UITextView('Initial text');
textView.init();
textView.frame = { x: 0, y: 0, width: 300, height: 150 };
textView.isEditable = true;
textView.fontSize = 16;
```

### UIDatePicker
```javascript
import { UIDatePicker } from './src/core/index.js';

const datePicker = new UIDatePicker();
datePicker.init();
datePicker.frame = { x: 0, y: 0, width: 300, height: 200 };
datePicker.datePickerMode = 'date';
datePicker.date = new Date();
datePicker.minimumDate = new Date(2020, 0, 1);
datePicker.maximumDate = new Date(2030, 11, 31);
```

### UIProgressView
```javascript
import { UIProgressView } from './src/core/index.js';

const progressView = new UIProgressView();
progressView.init();
progressView.frame = { x: 0, y: 0, width: 200, height: 20 };
progressView.progress = 0.5; // 0.0 to 1.0
progressView.progressTintColor = UIColor.systemGreen();
progressView.trackTintColor = UIColor.lightGray();
```

### UIActivityIndicatorView
```javascript
import { UIActivityIndicatorView } from './src/core/index.js';

const indicator = new UIActivityIndicatorView();
indicator.init();
indicator.frame = { x: 0, y: 0, width: 40, height: 40 };
indicator.style = 'large';
indicator.color = UIColor.systemBlue();
indicator.startAnimating();
indicator.stopAnimating();
```

### UIPageControl
```javascript
import { UIPageControl } from './src/core/index.js';

const pageControl = new UIPageControl();
pageControl.init();
pageControl.frame = { x: 0, y: 0, width: 150, height: 30 };
pageControl.numberOfPages = 5;
pageControl.currentPage = 0;
pageControl.pageIndicatorTintColor = UIColor.lightGray();
pageControl.currentPageIndicatorTintColor = UIColor.systemBlue();
```

### UINavigationBar
```javascript
import { UINavigationBar, UINavigationItem } from './src/core/index.js';

const navBar = new UINavigationBar();
navBar.init();
navBar.frame = { x: 0, y: 0, width: 300, height: 44 };

const item = new UINavigationItem('Title');
item.rightBarButtonItem = { title: 'Edit', action: () => {} };
item.leftBarButtonItem = { title: 'Back', action: () => {} };
navBar.pushNavigationItem(item, false);
```

### UITabBar
```javascript
import { UITabBar, UITabBarItem } from './src/core/index.js';

const tabBar = new UITabBar();
tabBar.init();
tabBar.frame = { x: 0, y: 0, width: 300, height: 100 };

const items = [
    new UITabBarItem('Home'),
    new UITabBarItem('Search'),
    new UITabBarItem('Profile')
];
items[0].emoji = '🏠';
items[1].emoji = '🔍';
items[2].emoji = '👤';

tabBar.items = items;
tabBar.selectedItem = items[0];
```

### UISearchBar
```javascript
import { UISearchBar } from './src/core/index.js';

const searchBar = new UISearchBar('Search...');
searchBar.init();
searchBar.frame = { x: 0, y: 0, width: 300, height: 44 };
searchBar.placeholder = 'Enter search term';
```

### UIAlertController
```javascript
import { UIAlertController } from './src/core/index.js';

// Alert
const alert = new UIAlertController('Title', 'Message', 'alert');
alert.addAction('Cancel', 'cancel');
alert.addAction('OK', 'default', () => console.log('OK clicked'));
alert.init();
alert.present();

// Action Sheet
const sheet = new UIAlertController('Actions', 'Choose one', 'actionSheet');
sheet.addAction('Option 1');
sheet.addAction('Option 2', 'destructive');
sheet.addAction('Cancel', 'cancel');
sheet.init();
sheet.present();
```

### UIStackView
```javascript
import { UIStackView, UILabel } from './src/core/index.js';

const stackView = new UIStackView();
stackView.init();
stackView.frame = { x: 0, y: 0, width: 300, height: 100 };
stackView.axis = 'horizontal'; // or 'vertical'
stackView.distribution = 'fillEqually';
stackView.spacing = 8;
stackView.alignment = 'center';

stackView.addArrangedSubview(label1);
stackView.addArrangedSubview(label2);
stackView.removeArrangedSubview(label1);
```

### UILabel
```javascript
import { UILabel } from './src/core/index.js';

const label = new UILabel('Hello World');
label.init();
label.frame = { x: 0, y: 0, width: 200, height: 30 };
label.fontSize = 18;
label.fontWeight = 'bold';
label.textColor = UIColor.black();
label.textAlignment = 'center';
label.numberOfLines = 0;
```

## Weak References

### WeakRef
Non-owning reference that becomes null when target is deallocated.

```javascript
import { WeakRef } from './src/core/index.js';

let obj = { name: 'test' };
const weakRef = new WeakRef(obj);

weakRef.deref(); // { name: 'test' }
obj = null;
// weakRef.deref() may return undefined depending on GC
```

### ReferenceManager
ARC-style reference counting.

```javascript
import { ReferenceManager } from './src/core/index.js';

const refManager = new ReferenceManager();
refManager.retain(obj);
refManager.retain(obj);
refManager.release(obj);
refManager.release(obj); // obj may be GC'd now
```

## Property-Based API

All components use property-based API (Swift style) rather than setter methods:

```javascript
// Correct - Property-based API
view.frame = { x: 100, y: 100, width: 200, height: 150 };
view.backgroundColor = UIColor.systemBlue();
button.title = 'Submit';
switch.isOn = true;
slider.value = 0.5;

// Avoid - Setter methods (deprecated)
view.setFrame(100, 100, 200, 150);
view.setBackgroundColor(UIColor.systemBlue());
button.setTitle('Submit');
switch.setIsOn(true);
slider.setValue(0.5);
```

## Running Tests

```bash
npm test
```

All 172 tests should pass.