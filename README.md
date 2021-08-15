# Colorpicker for ACE Editor


This project was created to implement a color picker. It implemented basic functions for color and implemented image filters.


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![](https://data.jsdelivr.com/v1/package/npm/ace-colorpicker/badge)](https://www.jsdelivr.com/package/npm/ace-colorpicker)

[![NPM](https://nodei.co/npm/ace-colorpicker.png)](https://npmjs.org/package/ace-colorpicker)



# Sample Image 

<img width="500px" src="./resources/image/ace-editor.png" />




# Install 

## npm 

```npm
npm install ace-colorpicker
```

# How to use (for  browser) 

```
<link rel="stylesheet" href="/ace-colorpicker/dist/ace-colorpicker.css/>
<script src="/ace-colorpicker/dist/ace-colorpicker.min.js"></script>
```

# How to use (for require, nodejs) 

after npm install 

## Apply colorpicker 

```html

<script type="text/javascript" src="https://ajaxorg.github.io/ace-builds/src/ace.js"></script> 

<link rel="stylesheet" href="./addon/ace-colorpicker.css" />
<script type="text/javascript" src="./addon/ace-colorpicker.js" ></script>        

<script type="text/javascript">

var editor = ace.edit("sample_text_area");
editor.setTheme("ace/theme/solarized_light");    
editor.session.setMode("ace/mode/css", () => {
  AceColorPicker.load(ace, editor);
})



</script>

```

# Developments 

## local dev 

```
git clone https://github.com/easylogic/ace-colorpicker
cd ace-colorpicker
npm install 
npm run dev 
open localhost:10001 
```

## build 

```
npm run build 
```

# License : MIT 
