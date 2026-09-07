# Print Layout Pro

Print Layout Studio

Full Application Specification

1. APP OVERVIEW

Build a professional but extremely easy-to-use desktop/web application called Print Layout Studio.

The purpose of the application is to allow a user to upload images and quickly arrange them onto printable paper sizes such as A4, A3, A5, A2, etc.

The primary use case is:

Upload two A4-sized images → place them side-by-side on one A3 sheet → preview the result → export a print-ready PDF.

The application must work with physical print dimensions, not just screen dimensions.

The user should be able to visually see exactly how the final printed sheet will look.

2. CORE USE CASE

Example:

User uploads:

Image 1

Image 2

User selects:

Paper: A3

Orientation: Landscape

Layout: 2-up

Image size: A4

Margins: 0 mm

Gap: 0 mm

Bleed: 0 mm

The application creates:

A3 LANDSCAPE
420mm × 297mm

┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│                              │                              │
│           IMAGE 1            │           IMAGE 2            │
│                              │                              │
│            A4                │            A4                │
│                              │                              │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘


The final exported PDF must contain an actual 420 × 297 mm page.

3. MAIN APPLICATION STRUCTURE

Use a modern professional interface.

Recommended layout:

┌──────────────────────────────────────────────────────────────┐
│ Print Layout Studio       New   Open   Save   Export PDF     │
├───────────────┬──────────────────────────────┬───────────────┤
│               │                              │               │
│   TOOLS       │                              │   SETTINGS    │
│               │                              │               │
│ Upload        │                              │ Paper         │
│ Images        │       PRINT CANVAS           │ Orientation   │
│ Templates     │                              │ Layout        │
│               │                              │ Margins       │
│               │                              │ Bleed         │
│               │                              │ Spacing       │
│               │                              │               │
├───────────────┴──────────────────────────────┴───────────────┤
│ Zoom: 100%       Page 1 of 1                 Fit to Screen   │
└──────────────────────────────────────────────────────────────┘


The application should be responsive, but desktop should be the primary target.

4. PAPER SIZES

Include standard paper sizes.

ISO sizes

A0 — 841 × 1189 mm

A1 — 594 × 841 mm

A2 — 420 × 594 mm

A3 — 297 × 420 mm

A4 — 210 × 297 mm

A5 — 148 × 210 mm

A6 — 105 × 148 mm

Also include:

Letter — 216 × 279 mm

Legal — 216 × 356 mm

Tabloid — 279 × 432 mm

Allow:

Custom Paper

User can enter:

Width

Height

Unit

Units:

mm

cm

inches

pixels

Internally convert everything to millimetres/points for print calculations.

5. PAPER ORIENTATION

Allow:

Portrait

Landscape

Auto

Example:

A3 Portrait:

297 × 420 mm

A3 Landscape:

420 × 297 mm

When orientation changes, automatically rotate the canvas.

6. IMAGE IMPORT

Support:

JPG/JPEG

PNG

WEBP

TIFF if supported

SVG if supported

Allow:

Drag & Drop

User can drag files directly into the application.

File Picker

Button:

Add Images

Multiple Files

Allow selecting multiple images simultaneously.

After importing, show thumbnails in an image library.

Example:

IMAGES

┌─────────┐
│ Image 1 │
└─────────┘

┌─────────┐
│ Image 2 │
└─────────┘

┌─────────┐
│ Image 3 │
└─────────┘


Images can then be dragged onto the canvas.

7. IMAGE INFORMATION

When selecting an image, display:

Filename

Original width

Original height

File size

Aspect ratio

Estimated DPI

Current print width

Current print height

Effective DPI

Rotation

Example:

IMAGE INFORMATION

File:
product-label.jpg

Original:
2480 × 3508 px

Aspect Ratio:
0.707

Print Size:
210 × 297 mm

Effective DPI:
300 DPI

Status:
✓ Print quality acceptable


8. IMAGE PLACEMENT

Images must be movable around the canvas.

Allow:

Drag

Resize

Rotate

Duplicate

Delete

Images should have a selection box when selected.

Example:

┌────────────────────────────┐
│                            │
│          IMAGE             │
│                            │
└────────────────────────────┘


Show resize handles.

Maintain aspect ratio by default.

Allow holding/unchecking:

Lock Aspect Ratio

9. IMAGE SIZING

The user must be able to specify exact physical dimensions.

Example:

WIDTH: 210 mm
HEIGHT: 297 mm


Changing width automatically changes height if aspect ratio is locked.

Also provide preset sizes:

A4

A5

A6

A3

Custom

Example:

Set Image Size → A4

Automatically set:

210 × 297 mm.

10. FIT OPTIONS

When placing an image into a defined area, support:

Fit

Entire image remains visible.

Fill

Image fills the area.

Crop

Image fills the area and excess is cropped.

Stretch

Image fills the area regardless of aspect ratio.

Default:

Fit

11. POSITIONING

Allow precise positioning.

Selected object settings:

X: 210 mm
Y: 0 mm

Width: 210 mm
Height: 297 mm

Rotation: 0°


X/Y coordinates must be relative to the top-left of the printable page.

Allow direct numerical entry.

12. ALIGNMENT TOOLS

Add alignment buttons:

Align Left

Align Centre

Align Right

Align Top

Align Middle

Align Bottom

Also:

Distribute Horizontally

Distribute Vertically

Allow:

Snap to Page

Snap to Objects

Snap to Guides

13. GRID

Provide optional grid overlay.

Settings:

Grid:
ON/OFF

Grid spacing:
1 mm
5 mm
10 mm
25 mm


The grid is only a visual aid and must never appear in exported PDFs.

14. GUIDES

Allow users to add guides.

Vertical guide:

X = 210 mm

Horizontal guide:

Y = 148.5 mm

Guides must not appear in exported files.

15. MARGINS

Allow:

Top

Bottom

Left

Right

Example:

Margins

Top:    5 mm
Bottom: 5 mm
Left:   5 mm
Right:  5 mm


Add:

Lock margins

When locked, changing one margin changes all four.

16. SPACING / GUTTER

Allow spacing between objects.

Example:

Horizontal Gap: 0 mm
Vertical Gap:   0 mm


For the A3 + two A4 example:

A3 = 420 × 297 mm

A4 = 210 × 297 mm

Image 1:
X = 0
Y = 0
W = 210
H = 297

Image 2:
X = 210
Y = 0
W = 210
H = 297


17. BLEED

Support professional print bleed.

Default:

3 mm

Allow:

0 mm

1 mm

2 mm

3 mm

5 mm

Custom

Provide:

Apply bleed

When enabled, the image extends beyond the trim boundary.

Important:

Bleed must be handled correctly during PDF generation.

18. CROP MARKS

Add option:

Show Crop Marks

Settings:

Crop mark length

Crop mark offset

Crop mark thickness

Crop marks must be generated outside the trim area.

Example:

       ─────
          │
          │
    ┌───────────────┐
    │               │
    │     IMAGE     │
    │               │
    └───────────────┘
          │
       ─────


Allow:

Include Crop Marks in PDF

19. SAFE AREA

Allow safe-area guides.

Example:

Trim
┌──────────────────────────────┐
│  ┌────────────────────────┐  │
│  │                        │  │
│  │       SAFE AREA        │  │
│  │                        │  │
│  └────────────────────────┘  │
└──────────────────────────────┘


Default safe area:

3 mm.

Do not export the safe-area guide.

20. AUTO LAYOUT

This is one of the most important features.

Provide:

Auto Arrange

The application calculates how many copies/images can fit onto the selected sheet.

Example:

Paper:

A3 Landscape

Image:

A4 Portrait

Result:

2 × A4

┌──────────────┬──────────────┐
│              │              │
│     A4       │      A4      │
│              │              │
└──────────────┴──────────────┘


The algorithm should account for:

Paper size

Orientation

Margins

Bleed

Gutter

Image dimensions

Rotation

21. AUTO N-UP

Provide preset layouts:

1-up

2-up

3-up

4-up

6-up

8-up

9-up

12-up

Custom

Example:

A4 on A3:

2-up

A6 on A4:

4-up

22. DUPLICATE / REPEAT

Allow user to specify quantity.

Example:

Selected Image

Quantity:
10


Click:

Auto Arrange

The application automatically places 10 copies across multiple pages.

Example:

Page 1
[Image][Image][Image][Image]

Page 2
[Image][Image][Image][Image]

Page 3
[Image][Image]


23. MULTI-PAGE DOCUMENTS

Support multiple pages.

Bottom toolbar:

◀ Page 1 / 5 ▶


Allow:

Add Page

Duplicate Page

Delete Page

Reorder Pages

Page thumbnails should appear in a sidebar when enabled.

24. IMAGE DUPLICATION

Right-click an image:

Duplicate
Delete
Bring Forward
Send Backward
Bring to Front
Send to Back
Lock
Unlock


Keyboard shortcuts:

Ctrl+C

Ctrl+V

Ctrl+D

Delete

Ctrl+Z

Ctrl+Shift+Z

25. LAYERS

Provide a simple layer/object panel.

Example:

LAYERS

👁 Image 2
🔒 Image 1
👁 Background


Allow:

Hide/show

Lock/unlock

Reorder

Rename

26. BACKGROUND

Allow page background:

White

Transparent

Custom colour

For print PDFs, default should be white.

27. RESOLUTION / DPI

The application must distinguish between:

Screen preview

and

Print output

The canvas preview can use a lower-resolution representation for performance.

The exported PDF must preserve the highest practical source-image quality.

Display warnings.

Example:

⚠ LOW RESOLUTION

Current print size:
210 × 297 mm

Effective resolution:
96 DPI

Recommended:
300 DPI


Quality indicators:

Green

300+ DPI

Yellow

150–299 DPI

Red

Below 150 DPI

These thresholds should be configurable.

28. IMAGE QUALITY WARNING

When an image is enlarged beyond its recommended print resolution:

Display:

⚠ Image may appear pixelated when printed.

Do not prevent the user from exporting.

29. PRINT PREVIEW

Provide a dedicated preview mode.

Button:

Preview Print

Preview should show:

Actual paper ratio

Images

Bleed

Crop marks

Margins

Page boundaries

Hide editing controls.

Provide:

Back to Editor

30. ZOOM

Bottom toolbar:

−   25%   50%   75%   100%   150%   200%   +


Also:

Fit Page

Fit Width

Actual Size

31. RULERS

Show horizontal and vertical rulers.

Units:

mm

inches

Default:

mm.

Example:

0    50    100    150    200    250    300    350    400
│-----│-----│-----│-----│-----│-----│-----│-----│-----│


32. SNAP SYSTEM

Implement snapping.

Options:

☑ Snap to grid
☑ Snap to objects
☑ Snap to page
☑ Snap to centre


Allow snap distance:

2 mm

33. TEMPLATE SYSTEM

Allow users to save layouts as templates.

Example template:

A3 — 2 × A4 Landscape

Another:

A4 — 4 × A6

Another:

A3 — 8 Labels

Template stores:

Paper size

Orientation

Margins

Bleed

Gutter

Object positions

Object dimensions

Crop marks

Guides

Images themselves should not necessarily be stored in the template unless explicitly requested.

34. PROJECT SAVE

Allow:

Save Project

Projects should contain:

Canvas settings

Pages

Image references/data

Positions

Dimensions

Rotation

Layout

Guides

Bleed

Crop marks

Preferred project format:

.pls

Example:

My_Product_Labels.pls

Also provide:

Save As

Open Project

Recent Projects

35. LOCAL STORAGE

For the initial version, projects can be stored locally.

Use:

IndexedDB

LocalStorage for simple preferences

Do not require a backend for the core functionality.

The application should work offline where possible.

36. EXPORT PDF

This is the most important output function.

Button:

Export PDF

Options:

PDF SETTINGS

Paper:
A3

Orientation:
Landscape

Quality:
High

Bleed:
3 mm

Crop Marks:
ON

Compression:
High Quality


Generate a true print-size PDF.

Do not simply export a screenshot of the canvas.

The PDF must use the correct physical dimensions.

37. PDF PAGE SIZE

Example:

A3 Landscape:

420 × 297 mm

Convert accurately to PDF points:

1 mm = 72 / 25.4 points

Therefore:

420 mm ≈ 1190.55 pt

297 mm ≈ 841.89 pt

Use the appropriate PDF library and ensure page dimensions are physically correct.

38. PDF OUTPUT QUALITY

The exported PDF should:

Preserve image quality

Preserve dimensions

Preserve aspect ratio

Support multiple pages

Support bleed

Support crop marks

Avoid unwanted scaling

Avoid unwanted borders

Avoid browser screenshot rendering

If the source image is JPEG, avoid unnecessary recompression where possible.

39. PRINT DIRECTLY

Provide:

Print

This should open the system/browser print dialog.

Before printing show:

Make sure printer scaling is set to 100% / Actual Size.

Never default to:

Fit to Page

when exact dimensions are required.

40. PRINT SAFETY WARNING

When printing exact-size layouts, show:

For accurate physical dimensions, select "Actual Size" or 100% scaling in your printer dialog. Do not select "Fit to Page".

41. EXPORT IMAGE

Also allow exporting the complete layout as:

PNG

JPG

But clearly distinguish this from the print-ready PDF.

PNG/JPG export is primarily for previews/sharing.

42. COPY / PASTE

Support:

Ctrl+C

Ctrl+V

Ctrl+X

Ctrl+D

Objects can be copied between pages.

43. UNDO / REDO

Full undo/redo system.

Support:

Add image

Delete image

Move image

Resize

Rotate

Change dimensions

Change layout

Add/delete page

Change settings

Keyboard:

Ctrl+Z

Ctrl+Shift+Z

44. KEYBOARD SHORTCUTS

Implement:

Ctrl + N       New Project
Ctrl + O       Open Project
Ctrl + S       Save Project
Ctrl + Shift S Save As
Ctrl + Z       Undo
Ctrl + Shift Z Redo
Ctrl + C       Copy
Ctrl + V       Paste
Ctrl + X       Cut
Ctrl + D       Duplicate
Delete         Delete Object
Ctrl + A       Select All
Escape         Deselect
Space          Pan Canvas


Arrow keys:

Move selected object.

Shift + Arrow:

Move by larger increments.

45. STATUS BAR

Bottom of screen:

Page 1 / 2
A3 Landscape
420 × 297 mm
Zoom: 100%
Objects: 4


When selecting an image:

X: 210 mm
Y: 0 mm
W: 210 mm
H: 297 mm
DPI: 300


46. DOCUMENT SETTINGS PANEL

Create a dedicated settings panel.

DOCUMENT

Paper
[A3 ▼]

Orientation
[Landscape ▼]

Width
420 mm

Height
297 mm

Margins
Top     0
Right   0
Bottom  0
Left    0

Bleed
[0 mm ▼]

Gutter
[0 mm]

Crop Marks
☐


47. QUICK LAYOUT PANEL

Add a simplified panel for inexperienced users.

QUICK SETUP

What are you printing?

○ A4 pages on A3
○ Photos
○ Labels
○ Business cards
○ Custom

Number per sheet:

[ 2 ▼ ]

[ AUTO ARRANGE ]


This should automatically configure the document.

48. A4 ON A3 QUICK ACTION

Include a prominent preset:

2 × A4 on A3

When clicked:

Paper:
A3 Landscape

Layout:
2-up

Image size:
A4

Gap:
0 mm

Margins:
0 mm

Automatically create two A4 placeholders.

49. LABEL MODE

Create a specialized label mode.

User enters:

Label Width: 100 mm
Label Height: 50 mm

Horizontal Gap: 5 mm
Vertical Gap: 5 mm

Paper: A4


Application calculates maximum number of labels that fit.

Example:

15 labels per sheet.

Allow:

Fill Page

50. BUSINESS CARD MODE

Preset:

Business Card

Default size:

90 × 50 mm

Allow custom dimensions.

Automatically calculate how many fit on:

A4

A3

Include:

Bleed

Crop marks

Gap

51. PHOTO MODE

Presets:

6 × 4 inch

7 × 5 inch

8 × 10 inch

Passport

Custom

Auto arrange photos.

52. CATALOG / DOCUMENT MODE

Allow users to upload multiple full-page images and arrange them sequentially.

Example:

Page 1 → Product Page 1
Page 2 → Product Page 2
Page 3 → Product Page 3


This is useful for catalogs.

53. IMPORT FOLDER

For desktop version, allow:

Import Folder

Automatically load supported images.

Sort by:

Filename

Date modified

Date created

Manual

54. FILE NAMING

When exporting:

ProjectName_A3_Print.pdf


If multiple exports:

ProjectName_A3_Print_01.pdf
ProjectName_A3_Print_02.pdf


Allow custom filename.

55. APP DESIGN

Use a modern professional design.

Recommended theme:

Dark editor interface.

Background:

Dark slate/navy.

Canvas:

White.

Controls:

Dark cards.

Use clear accent colour for selected objects and active controls.

The actual print canvas must always visually resemble white paper.

56. USER EXPERIENCE PRINCIPLE

The application must NOT feel like complicated graphic-design software.

The target user should be able to perform this workflow:

1. Open app

2. Upload images

3. Select paper size

4. Select layout

5. Click Auto Arrange

6. Preview

7. Export PDF


Everything else is advanced functionality.

57. RESPONSIVE DESIGN

Desktop-first.

Support:

1920×1080

1440×900

1366×768

Laptop screens

The editor should remain usable at smaller resolutions.

On mobile/tablet, provide a simplified interface if practical, but desktop is the priority.

58. PERFORMANCE

The app should handle:

50+ images

Large images

Multi-page documents

Use thumbnails for the image library.

Do not load full-resolution versions into the editor canvas unnecessarily.

Use optimized previews.

Only use original/high-resolution files during export.

59. ERROR HANDLING

Show friendly errors.

Examples:

Unsupported file

This file type isn't supported.

Corrupt image

This image couldn't be loaded.

Low resolution

This image may appear pixelated at the current print size.

Export failure

We couldn't generate the PDF. Please try again.

Never show raw technical errors to normal users.

60. PRINT VALIDATION

Before exporting, run a validation check.

Example:

PRINT CHECK

✓ Paper size: A3
✓ Orientation: Landscape
✓ Images inside page
✓ No objects outside printable area
✓ Image resolution acceptable
✓ Bleed configured
✓ Crop marks configured

READY TO EXPORT


If there are problems:

⚠ 2 issues found

1. Image 3 extends beyond the page.
2. Image 5 is only 82 DPI.


Allow:

Export Anyway

61. PAGE BLEED LOGIC

When bleed is enabled:

Example:

Trim size:

210 × 297 mm

Bleed:

3 mm

Artwork area:

216 × 303 mm

The system must correctly account for bleed when positioning artwork.

Do not accidentally increase the final trim page size unless crop marks/outer bleed require it.

Provide an option:

PDF includes bleed area

62. IMPOSITION ENGINE

Create a reusable layout calculation engine.

Inputs:

paperWidth
paperHeight
objectWidth
objectHeight
marginTop
marginRight
marginBottom
marginLeft
horizontalGap
verticalGap
bleed
rotation
quantity


Output:

numberOfColumns
numberOfRows
positions[]
pagesRequired
unusedSpace


The engine should test both orientations automatically.

Example:

orientation A:
210 × 297

orientation B:
297 × 210


Select whichever produces the best fit.

63. AUTO ROTATION

Add:

Best Fit

The system tests:

Portrait

Landscape

Rotated objects

and chooses the configuration that fits the highest number of objects.

Example:

A4 on A3

Portrait:
2 fit

Landscape:
2 fit

Best Fit:
2


For smaller objects, it may find:

Portrait:
8

Landscape:
10

Best Fit:
Landscape


64. WASTE CALCULATION

Display:

Paper usage

Used area:
87%

Waste:
13%


This is especially useful for labels and business cards.

65. MULTIPLE OBJECT TYPES

The engine must allow different-sized objects on the same page.

Example:

A3

┌──────────────┬──────────────┐
│              │              │
│     A4       │     A4       │
│              │              │
├──────────────┴──────────────┤
│      Smaller label          │
└─────────────────────────────┘


66. OBJECT LOCKING

Each object can be locked.

Locked objects cannot be:

moved

resized

rotated

until unlocked.

67. OBJECT NAMING

Allow:

Rename

Example:

Product Label
Front Cover
Back Cover
Price List


68. CONTEXT MENU

Right-click canvas:

Add Image
Paste
Select All
Deselect
Add Guide
Add Text


Right-click object:

Duplicate
Delete
Lock
Rename
Bring Forward
Send Backward
Set Size
Set Position


69. OPTIONAL TEXT TOOL

Add a basic text tool.

Allow:

Text

Font

Size

Bold

Italic

Alignment

Colour

Text must be exported as vector text in the PDF where possible.

This allows users to add:

Product codes

Prices

Batch numbers

Notes

Titles

70. OPTIONAL SHAPES

Basic shapes:

Rectangle

Line

Circle

Useful for:

Borders

Cutting guides

Design elements

71. EXPORT OPTIONS

Export dialog:

EXPORT PDF

Filename:
[ My_Print_Job ]

PDF Quality:
○ Standard
● High
○ Maximum

Bleed:
3 mm

Crop Marks:
☑

Include Guides:
☐

Include Background:
☑

[ CANCEL ]     [ EXPORT PDF ]


Guides/grid should default to OFF.

72. PRINT PROFILE

Allow users to create print profiles.

Example:

Print Profile:
My Printer

Paper:
A3

Margins:
5 mm

Bleed:
3 mm

Crop Marks:
ON

Default PDF:
High Quality


Save these locally.

73. SETTINGS

Application settings:

General

Default paper

Default units

Default zoom

Auto-save

Appearance

Dark

Light

System

Print

Default bleed

Default DPI warning

Default PDF quality

Grid

Grid size

Snap distance

74. AUTO-SAVE

Automatically save project state periodically.

Example:

Saved 10 seconds ago

If application closes unexpectedly:

Recover previous project?

75. TECH STACK

Recommended:

Frontend

React

TypeScript

Vite

Tailwind CSS

shadcn/ui

Canvas

Use a robust 2D canvas library such as:

Fabric.js

Konva.js

Choose the library that provides the best combination of:

object manipulation

scaling

rotation

snapping

serialization

performance

PDF

Use a PDF-generation library capable of creating true physical page sizes.

Potential choices:

pdf-lib

jsPDF

Prefer whichever gives better control over image quality and page dimensions.

Storage

Initially:

IndexedDB

Use LocalStorage for preferences.

No backend is required for the first version.

76. ARCHITECTURE

Separate the application into:

/src

/components
  Canvas
  Toolbar
  Sidebar
  ImageLibrary
  PropertiesPanel
  PageManager
  ExportDialog
  PrintPreview

/engine
  layoutEngine
  measurementEngine
  dpiEngine
  bleedEngine
  cropMarkEngine
  pdfEngine

/services
  projectStorage
  imageLoader
  exportService

/types
  project
  page
  image
  layout


Keep layout calculations independent from UI.

77. IMPORTANT MEASUREMENT RULE

Never use CSS pixels as the source of truth for print dimensions.

The internal document model must use physical units.

Recommended internal unit:

millimetres

Convert to:

screen pixels for preview

PDF points for PDF output

Example:

Document:
420 × 297 mm

Canvas:
scaled representation

PDF:
1190.55 × 841.89 points


78. DOCUMENT DATA MODEL

Use a structure similar to:

Project
 ├── name
 ├── documentSettings
 │    ├── width
 │    ├── height
 │    ├── unit
 │    ├── orientation
 │    ├── margins
 │    ├── bleed
 │    └── background
 │
 ├── pages[]
 │    ├── id
 │    ├── objects[]
 │    │    ├── type
 │    │    ├── sourceImage
 │    │    ├── x
 │    │    ├── y
 │    │    ├── width
 │    │    ├── height
 │    │    ├── rotation
 │    │    ├── locked
 │    │    └── visible
 │
 └── settings


79. SECURITY

If the application is browser-based:

Process images locally whenever possible.

Do not upload images to a server unless required.

Do not store user images remotely by default.

Do not transmit files unnecessarily.

The user should be able to use the application without creating an account.

80. OFFLINE FUNCTIONALITY

Core functionality should work without an internet connection:

Import images

Arrange images

Resize

Rotate

Create pages

Save project locally

Export PDF

81. FUTURE FEATURES

Design the architecture so these can be added later:

Cloud storage

User accounts

Team sharing

Printer presets

Barcode generation

QR code generation

Variable data printing

CSV import

Automated label generation

Batch PDF generation

Cut-file export

SVG export

Adobe-compatible formats

CMYK workflow

ICC colour profiles

PDF/X export

Professional prepress checks

Do NOT implement all of these in the first version unless specifically requested.

82. MVP PRIORITY

The first working version MUST prioritize:

P0 — Essential

Upload images

A3/A4/A5 paper sizes

Portrait/Landscape

Drag images onto canvas

Exact image dimensions

Move/resize/rotate

2-up layout

Auto Arrange

Multiple pages

Margins

Gap

Basic bleed

Crop marks

DPI warning

Undo/redo

Save project

Export print-ready PDF

Print preview

P1 — Important

Templates

N-up layouts

Guides

Grid

Snapping

Layer panel

Duplicate

Alignment tools

Image library

Print validation

P2 — Advanced

Labels

Business cards

Photo presets

Text

Shapes

Print profiles

Waste calculation

Advanced imposition

83. PRIMARY WORKFLOW TO TEST

The application is not complete until this workflow works correctly:

Step 1

Open application.

Step 2

Create new project.

Step 3

Select:

Paper: A3
Orientation: Landscape


Step 4

Click:

2 × A4

Step 5

Two A4 placeholders appear:

┌─────────────────────┬─────────────────────┐
│                     │                     │
│        A4           │         A4          │
│                     │                     │
└─────────────────────┴─────────────────────┘


Step 6

Upload two images.

Step 7

Drop one image into each placeholder.

Step 8

The images are automatically fitted to:

210 × 297 mm.

Step 9

Click:

Print Preview

Step 10

Click:

Export PDF

Step 11

Open the PDF in a PDF viewer.

The PDF page must physically be:

420 × 297 mm

and the two images must each physically be:

210 × 297 mm

with no unintended scaling.

84. ACCEPTANCE CRITERIA

The application is considered successful when:

Accuracy

A 210 × 297 mm object exported to PDF measures 210 × 297 mm when measured in a PDF/prepress application.

A3

A3 export measures:

420 × 297 mm in landscape.

Positioning

An object positioned at X = 210 mm begins exactly at the centre of a 420 mm-wide A3 page.

Quality

Images are exported using their original/highest available resolution where practical.

Bleed

3 mm bleed is correctly applied.

Crop marks

Crop marks are positioned correctly outside the trim area.

Multi-page

Multiple pages export correctly in a single PDF.

No scaling

The application does not accidentally scale objects during PDF export.

85. FINAL PRODUCT GOAL

The application should feel like:

"Canva simplicity + professional print layout accuracy."

A normal user should not need to understand DPI, PDF points, bleed, imposition or physical units.

They should simply be able to say:

"I have two A4 images and want them next to each other on A3."

The application handles the technical work automatically.

Advanced users should still have complete control over:

exact dimensions

positioning

bleed

crop marks

DPI

margins

spacing

page layout

PDF output

The final product should be fast, clean, intuitive and reliable enough to prepare files for actual commercial printing.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/de7198ad-456f-4bc2-bcf7-090996cda3fa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
