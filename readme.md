# ALmo Desk

![ALmo Desk](./logo.png)

**ALmo desk** - a web-based desktop operating system built with vanilla JavaScript that brings Apple's UIKit patterns to the web.

[![GitHub](https://img.shields.io/badge/GitHub-jonikay89/almo_desk-181717?style=flat-square&logo=github)](https://github.com/jonikay89/almo_desk)

## What It Is

A component library mimicking iOS/macOS UIKit APIs for building desktop-like web applications with Swift-like conventions.

## What Users Gain

### 1. Familiar API Design
If you know Swift/UIKit, you'll immediately recognize:
- `UIView`, `UIButton`, `UILabel`, `UITextField`, etc.
- Property-based APIs (`view.frame`, `button.setTitle()`)
- Delegate patterns and lifecycle methods

### 2. Pattern Matching (like Swift)
Instead of verbose if-else chains:
```javascript
// Traditional approach
if (value === 'success') {
  handleSuccess();
} else if (value === 'error') {
  handleError();
}

// Now you can write:
value.match({
  success: () => handleSuccess(),
  error: () => handleError()
});
```

### 3. Comprehensive Foundation Classes
- `NSNumber`, `Data`, `NSURL`, `Scanner`
- `Codable` protocol for JSON encoding/decoding
- PropertyList serialization

### 4. Rich UI Components
- Windows, ViewControllers, Navigation bars, Tab bars
- Date pickers, Sliders, Switches, Steppers
- Tables, Collections, Pickers, Search bars
- Alerts and Action sheets

## Key Benefit

**Consistency**: Build entire web apps using the same architectural patterns and naming conventions as native iOS/macOS development - making it ideal for developers who work across Apple platforms and web.

---

## Project Architecture

```
almo_desk/
├── src/
│   ├── core/                    # UIKit & Foundation Libraries
│   │   ├── Foundation.js        # NSValue, NSNumber, Data, NSURL, Scanner, Codable
│   │   ├── Switch.js           # Swift-like switch expressions
│   │   ├── PatternMatching.js   # if let, guard let, pattern matching
│   │   │
│   │   ├── UIKit Components/
│   │   │   ├── UIView.js       # Base view class
│   │   │   ├── UIResponder.js  # First responder chain
│   │   │   ├── UIWindow.js     # Window management
│   │   │   ├── UIViewController.js
│   │   │   │
│   │   │   ├── Controls/
│   │   │   │   ├── UIControl.js
│   │   │   │   ├── UIButton.js
│   │   │   │   ├── UISwitch.js
│   │   │   │   ├── UISlider.js
│   │   │   │   ├── UIStepper.js
│   │   │   │   ├── UISegmentedControl.js
│   │   │   │   ├── UIScrollView.js
│   │   │   │   └── UISearchBar.js
│   │   │   │
│   │   │   ├── Text/
│   │   │   │   ├── UITextField.js
│   │   │   │   ├── UITextView.js
│   │   │   │   └── UILabel.js
│   │   │   │
│   │   │   ├── Pickers & Indicators/
│   │   │   │   ├── UIDatePicker.js
│   │   │   │   ├── UIPickerView.js
│   │   │   │   ├── UIActivityIndicatorView.js
│   │   │   │   ├── UIProgressView.js
│   │   │   │   └── UIPageControl.js
│   │   │   │
│   │   │   ├── Navigation/
│   │   │   │   ├── UINavigationBar.js
│   │   │   │   ├── UITabBar.js
│   │   │   │   └── UIAlertController.js
│   │   │   │
│   │   │   ├── Layout/
│   │   │   │   ├── UIStackView.js
│   │   │   │   └── UICollectionView.js
│   │   │   │
│   │   │   ├── Tables/
│   │   │   │   ├── UITableView.js
│   │   │   │   └── UITableViewCell.js
│   │   │   │
│   │   │   ├── Collections/
│   │   │   │   ├── UICollectionView.js
│   │   │   │   └── UICollectionViewCell.js
│   │   │   │
│   │   │   └── Media/
│   │   │       └── UIImage.js
│   │   │
│   │   ├── Foundation Classes/
│   │   │   ├── NSObject.js
│   │   │   ├── NSArray.js / NSMutableArray.js
│   │   │   ├── NSDictionary.js / NSMutableDictionary.js
│   │   │   ├── NSSet.js / NSMutableSet.js
│   │   │   ├── NSNotification.js
│   │   │   ├── NSNotificationCenter.js
│   │   │   └── SwiftArray.js / SwiftDictionary.js / SwiftSet.js
│   │   │
│   │   ├── Desktop OS/
│   │   │   ├── DesktopOS.js
│   │   │   └── WindowController.js
│   │   │
│   │   └── Utilities/
│   │       ├── Protocol.js
│   │       ├── Generics.js
│   │       ├── PropertyPolicy.js
│   │       └── WeakReference.js
│   │
│   ├── widgets/                 # App-level widgets
│   │   ├── WidgetView.js
│   │   ├── ClockWidget.js
│   │   ├── NotesWidget.js
│   │   ├── CodeEditorWidget.js
│   │   └── WebLinkWidget.js
│   │
│   └── utils/                   # Utilities
│       ├── dom.js
│       ├── storage.js
│       └── sanitizer.js
│
├── tests/                       # 200+ tests
│   ├── switch.test.js
│   ├── foundation.test.js
│   └── ui*.test.js (per component)
│
└── server.js                    # Express server for the desktop OS
```

## Pattern Matching Architecture

```
PatternMatching.js
├── ifCase(pattern)           # Swift's if case .pattern = value
├── ifLet(value, pattern)      # Swift's if let x = optional
├── guardCase(pattern)        # Swift's guard case .pattern = value else
├── guardLet(value, pattern)  # Swift's guard let x = optional else
├── whileCase(pattern)         # Swift's while case let x? = iterator
├── forCase(pattern)           # Swift's for case let x? in collection
└── patternMatch(pattern, value)  # Core matching logic
```

## Switch.js

```
Switch(value)              # Factory function
Switch.let('name')         # Value binding
Switch.Wildcard / Switch._ # Wildcard pattern
Switch.enumCase()          # Enum case pattern
Switch.range() / .halfOpenRange()
Switch.tuple()
```

## Class Hierarchy

```
NSObject
└── UIResponder
    ├── UIView
    │   ├── UIControl
    │   │   ├── UIButton
    │   │   ├── UISwitch
    │   │   ├── UISlider
    │   │   ├── UIStepper
    │   │   ├── UISegmentedControl
    │   │   └── UISearchBar
    │   ├── UIScrollView
    │   │   ├── UITextView
    │   │   ├── UITableView
    │   │   └── UICollectionView
    │   ├── UILabel
    │   ├── UIImage
    │   ├── UIStackView
    │   ├── UINavigationBar
    │   ├── UITabBar
    │   ├── UIProgressView
    │   ├── UIPageControl
    │   ├── UIPickerView
    │   ├── UIActivityIndicatorView
    │   ├── UIDatePicker
    │   └── UITableViewCell / UICollectionViewCell
    └── UIViewController
        ├── UIWindow
        └── UIAlertController
```

---

## Running the Project

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `node server.js` | Alternative start command |

## Stopping the Server

```bash
pkill -f "node server.js" 2>/dev/null
echo "Server stopped"
```

## Kill Process on Port 3000 & Restart

```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1
node server.js &
```

## List All Project Files

```bash
find . -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" \) | head -30
```

## Quick Server Test

```bash
# Start server
node server.js &
sleep 2

# Check homepage
curl -s http://localhost:3000 | head -20

# Expected output includes:
# 🚀 Server running at http://localhost:3000
# <!DOCTYPE html>...

# Check CSS & JavaScript
curl -s http://localhost:3000/styles/main.css | head -5
curl -s http://localhost:3000/src/index.js | head -5

# Stop server
pkill -f "node server.js" 2>/dev/null
```

## Running Tests

```bash
npm test 
# or
npm test 2>&1 | grep -E "(pass|fail|tests)"
```

Example output:
```
> node --test tests/*.test.js
ℹ tests 135
ℹ pass 135
ℹ fail 0
```

## Run Server in Background (with logging)

```bash
nohup node server.js > /tmp/server.log 2>&1 &
sleep 2
cat /tmp/server.log
```

Expected output:
```
🚀 Server running at http://localhost:3000
```

---

## License

MIT License

Copyright (c) 2024 ALmo Desk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

- Report bugs and suggest features via GitHub Issues
- Submit pull requests to fix bugs or add new features
- Improve documentation
- Share the project with others

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/almo_desk.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

### Pull Request Guidelines

- Follow the existing code style and conventions
- Include tests for new features or bug fixes
- Ensure all tests pass: `npm test`
- Keep commits atomic and well-described
- Update documentation as needed

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community

### Reporting Bugs

Before submitting a bug report:
1. Search existing issues to avoid duplicates
2. Include a minimal reproducible example
3. Specify your environment (browser, Node.js version, etc.)
