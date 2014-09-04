Scroll Active
===============
This plugin will automate animation, activate sections in the menu & the content & correctly assign hashes to the browsers window. created by [shannon hochkins].
[shannon hochkins]: http://www.shannonhochkins.com/

Usage
--------------

```javascript
$('.element').scrollActive({
    scanItems: '.post', // CLASS of elements you want to scan to see if it's in the set area
    scanLimit: 200, // The distance from the top that the plugin scans from
    startScanningAfter: 50, // used so that the first item in the list can be activated on page load
    itemTopOffset: 0, // You can add or even subtract, where the plugin thinks the top of each item is.
    activeClass: 'active',
    pageAnimationSpeed: 300,
    updateHash: true, // If the browser should set the hash when scrolling or clicking he sidebar
    hashPrefix: 'menu_', // Used so that the browser doesn't automatically jump to the id on the page and cause our animation to lag
    debug: true, // enables a visual representation of when items become active
    onScroll: function(settings) {},
});
```


Options
--------------


| Options               | Default                               | Description  |
| --------------------- |:-------------------------------------:| ------------:|
| scanItems             | '.post'                               | CLASS of elements you want to scan to see if it's in the scan area |
| scanLimit             | 200                                   | The distance from the top that the plugin scans from, everything after this position from the top of the WINDOW not the document, will be activated. |
| startScanningAfter    | 50                                    | Disable the scanning until the user has scrolled a certain amount of pixels. |
| itemTopOffset         | 0                                     | You have an option to push the scan field down by an offset as well |
| activeClass           | 'active'                              | The class that will be appended to the menu items & the content on the page |
| pageAnimationSpeed    | 300                                   | How fast the plugin will scroll to sections when clicked from the menu |
| updateHash            | true                                  | If the plugin should update the browsers hash |
| hashPrefix            | 'menu_'                               | We prefix the hash, so that the browser doesn't automatically jump to a position on the page |
| debug                 | false                                 | will draw some helpful html on the page to indicate where the active sections will start being activated |
| onScroll              | function() {settings}                 | Callback when the users has scrolled |


``Note: if you set the hashPrefix to an empty string you will see jumping if the animation speed is greater than 0.``


Debug mode.
--------------

- The red section toward the top that is drawn indicates that any items who's top position falls inside the redZone, it's nolonger classed as active.
- The green section indicates that scan area, so the first item it finds who's top position is closest to the top of the green zone but NOT in the redZone, is classed as the active item.
- If the greenZone is PINK it means that the startScanningAfter variable is currently set to a larger pixel value than the user has scrolled, once the scroll count is larger than the startScanningAfter variable, it will start scanning.


