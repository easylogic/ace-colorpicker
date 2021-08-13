import './scss/index.scss'

import Util from './util/index'
import ColorPicker from './colorpicker/index'
import AceExtension from './extension/ace/index'


export default {
    ...Util,
    ...ColorPicker,
    ...AceExtension
}