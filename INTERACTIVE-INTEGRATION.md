# How to Add Interactive Tooltips to Your Diagram

This guide shows how to integrate the tooltip system into your existing code.

## Files Added

1. **diagram-tooltips-data.js** - Content for tooltips
2. **diagram-relationships.js** - Defines which elements highlight together
3. **diagram-interactive.js** - Handles hover interactions and display
4. **Updated diagram.html** - Includes new script files

## How to Make Elements Interactive

### In diagram-core-refactored.js

When you create SVG elements, simply call `makeInteractive()` to enable tooltips and highlighting:

```javascript
// BEFORE (existing code):
const circle = createStyledCircle(x, y, radius, {
  fill: '#3b82f6',
  stroke: '#1e3a8a'
});
circlesGroup.appendChild(circle);

// AFTER (with interactivity):
const circle = createStyledCircle(x, y, radius, {
  fill: '#3b82f6',
  stroke: '#1e3a8a'
});
makeInteractive(circle, 'dot-0'); // 'dot-0' is the element ID
circlesGroup.appendChild(circle);
```

### Real Examples from Your Code

#### 1. Making the RBA dot interactive (around line 665-677)

```javascript
// Find this code:
if (i === 0) {
  const blackCircleRadius = smallCircleRadius * 6;
  const text = createStyledText(
    actualCircleX + blackCircleRadius + 5, actualCircleY, 'RBA',
    {
      textAnchor: 'start',
      fill: '#ff0000',
      fontSize: '16',
      fontWeight: 'bold'
    }
  );
  labelsGroup.appendChild(text);

// ADD THIS LINE AFTER:
makeInteractive(text, 'rba-label');
```

#### 2. Making NPP box interactive (around line 2000-2020)

```javascript
// Find where NPP box is created:
const nppBox = createStyledRect(nppRectX, nppY, nppSwiftRectWidth, nppRectHeight + 5, {
  fill: '#063d38',
  stroke: '#00ffdf',
  strokeWidth: '2'
});
nppBox.setAttribute('id', 'npp-box');
labelsGroup.appendChild(nppBox);

// ADD THIS LINE AFTER:
makeInteractive(nppBox, 'npp-box');
```

#### 3. Making dots interactive (in the main dots loop around line 440-750)

```javascript
// Find this code in the dots loop:
const blueCircle = createStyledCircle(actualCircleX, actualCircleY, radius, {
  fill: fillColor,
  stroke: strokeColor,
  strokeWidth: borderWidth
});
circlesGroup.appendChild(blueCircle);

// ADD THIS LINE AFTER:
makeInteractive(blueCircle, `dot-${i}`); // i is the dot index
```

#### 4. Making LVSS circle interactive (in diagram-circles.js around line 170)

```javascript
// Find this code:
const redCircleInner = createStyledCircle(redCircleX, redCircleY, innerRadius, {
  fill: '#4A1942',
  stroke: 'none'
});
lvssGroup.appendChild(redCircleInner);

// ADD THIS LINE AFTER:
makeInteractive(redCircleInner, 'lvss-circle');
```

#### 5. Making boxes interactive (BECN, BECG, etc.)

```javascript
// Find box creation code like:
const rect = createStyledRect(x, y, width, height, {
  fill: '#C41E3A',
  stroke: '#ffe0e0',
  strokeWidth: '2.5'
});
labelsGroup.appendChild(rect);

// ADD THIS LINE AFTER:
makeInteractive(rect, 'becn-box'); // or 'becg-box', 'bpay-box', etc.
```

## Pattern to Follow

**For every element you want to be interactive:**

1. Create the element normally
2. Call `makeInteractive(element, 'unique-id')`
3. Append to parent

The 'unique-id' should match:
- An entry in `tooltipContent` (diagram-tooltips-data.js)
- An entry in `elementRelationships` (diagram-relationships.js)

## Adding New Content

### To add a new tooltip:

Edit `diagram-tooltips-data.js`:

```javascript
tooltipContent['my-new-element'] = {
  title: 'Element Name',
  subtitle: 'Element Type',
  description: 'What this element does',
  details: [
    'Detail point 1',
    'Detail point 2'
  ],
  hours: 'Operating hours' // optional
};
```

### To define relationships:

Edit `diagram-relationships.js`:

```javascript
elementRelationships['my-new-element'] = {
  groups: ['group-name', 'another-group'],
  related: ['element-1', 'element-2', 'element-3']
};
```

## Testing

1. Open diagram.html in your browser
2. Hover over any interactive element
3. You should see:
   - A tooltip with information
   - The element and related elements highlighted/glowing
4. Move mouse away - highlights should clear

## Performance Notes

- Only one tooltip element is created (reused for all elements)
- Event listeners are efficient (one per element)
- No performance impact on rendering
- Total code added: ~800 lines across 3 files
- All in separate modules - doesn't bloat existing code

## Next Steps

1. Start by making a few test elements interactive
2. Verify tooltips and highlighting work
3. Gradually add more elements
4. Expand tooltip content and relationships as needed

The system is designed to be added incrementally - you don't need to make everything interactive at once!
