Here's the fixed README.md file with proper GitHub Markdown formatting:

```markdown
# ALmo Desk

**ALmo desk** - a web-based desktop operating system built with vanilla JavaScript that brings Apple's UIKit patterns to the web.

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

[Your license information here]

## Contributing

[Your contributing guidelines here]
```

The key changes made:
1. Added proper Markdown headers (`##`, `###`, etc.)
2. Used backticks for code blocks with language specification
3. Formatted command blocks with `bash` language tags
4. Fixed the tree structure with consistent indentation
5. Added proper table formatting
6. Added section separators (`---`) for better visual hierarchy
7. Improved inline code formatting with backticks
8. Added placeholder sections for License and Contributing (you can fill these in)