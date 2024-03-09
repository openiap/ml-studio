const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// https://github.com/microsoft/monaco-editor/issues/2730
// https://user-images.githubusercontent.com/1812093/95696109-cbf9ab00-0c31-11eb-862e-ccc60fd39380.png
module.exports = {
  configureWebpack: {
    devtool: 'source-map',
    optimization: {
      minimize: false,
    },
    resolve: {
      symlinks: false
    },
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['typescript'],
        // features: [ '!diffEditor', '!browser', '!inPlaceReplace', '!accessibilityHelp', '!coreCommands', '!find']
        features: ['!accessibilityHelp',
				// '!bracketMatching',
				'!caretOperations',
				// '!clipboard',
				'!codeAction',
				'!codelens',
				'!colorDetector',
				// '!comment',
				'!contextmenu',
				'!coreCommands',
				'!cursorUndo',
				'!dnd',
				// '!find',
				// '!folding',
				'!fontZoom',
				// '!format',
				'!gotoError',
				'!gotoLine',
				'!gotoSymbol',
				'!hover',
				'!iPadShowKeyboard',
				'!inPlaceReplace',
				'!inspectTokens',
				// '!linesOperations',
				'!links',
				'!multicursor',
				'!parameterHints',
				'!quickCommand',
				'!quickOutline',
				'!referenceSearch',
				'!rename',
				'!smartSelect',
				'!snippets',
				'!suggest',
				'!toggleHighContrast',
				'!toggleTabFocusMode',
				'!transpose',
				'!wordHighlighter',
				'!wordOperations',
				'!wordPartOperations'],
        // features: [
        //   'anchorSelect' | 'bracketMatching' | 'browser' | 'caretOperations' | 'clipboard' | 'codeAction' | 'codelens' | 
        //   'colorPicker' | 'comment' | 'contextmenu' | 'cursorUndo' | 'diffEditor' | 'dnd' | 'documentSymbols' | 'dropOrPasteInto' | 
        //   'find' | 'folding' | 'fontZoom' | 'format' | 'gotoError' | 'gotoLine' | 'gotoSymbol' | 'hover' | 'iPadShowKeyboard' | 'inPlaceReplace' | 
        //   'indentation' | 'inlayHints' | 'inlineCompletions' | 'inlineProgress' | 'inspectTokens' | 'lineSelection' | 'linesOperations' | 'linkedEditing' | 
        //   'links' | 'longLinesHelper' | 'multicursor' | 'parameterHints' | 'quickCommand' | 'quickHelp' | 'quickOutline' | 'readOnlyMessage' | 'referenceSearch' | 
        //   'rename' | 'semanticTokens' | 'smartSelect' | 'snippet' | 'stickyScroll' | 'suggest' | 'toggleHighContrast' | 'toggleTabFocusMode' | 'tokenization' | 
        //   'unicodeHighlighter' | 'unusualLineTerminators' | 'wordHighlighter' | 'wordOperations' | 'wordPartOperations']
      })
    ]
  },
  transpileDependencies: true,
  chainWebpack: config => {
    // Set the public path for serving static assets
    if (process.env.NODE_ENV === 'production') {
      config.output.publicPath('/');
    } else {
      config.output.publicPath('/'); // adjust according to your dev setup
    }
    config.devtool('source-map');

    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      })
      return definitions
    })
  }
};



// const { defineConfig } = require('@vue/cli-service')
// // https://github.com/suren-atoyan/monaco-loader


// const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// module.exports = defineConfig({

//   chainWebpack: (config) => {
//     config.plugin('define').tap((definitions) => {
//       Object.assign(definitions[0], {
//         __VUE_OPTIONS_API__: 'true',
//         __VUE_PROD_DEVTOOLS__: 'false',
//         __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
//       })
//       return definitions
//     })
//     // https://github.com/FE-Mars/monaco-editor-vue

//   },
//   transpileDependencies: true,

//   configureWebpack: {
//     devtool: 'source-map',
//     optimization: {
//       minimize: false,
//     },
//     resolve: {
//     symlinks: false
//     },
//     plugins: [
//       new MonacoWebpackPlugin({
//         languages:["javascript" ,"json"]
//       })
//     ],

//   },
// })
