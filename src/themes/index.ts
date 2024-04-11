// @ts-ignore
import cuckooHubTheme from './presets/cuckoohub'
import greenLightTheme from './presets/greenlight'
import darkTheme from './presets/dark'
import googlePlusTheme from './presets/googleplus'
import * as less from 'less'
import stylePattern from './stylepattern'
import { ThemeNames } from '@/constant'
import * as fileSaver from 'file-saver'
import baseColor from './basecolor'

const presetThemeInfo = {
  [ThemeNames.GOOGLE_PLUS]: {
    theme: googlePlusTheme,
    less: stylePattern(Object.assign({}, baseColor, googlePlusTheme.colorSet)),
    css: null,
  },
  [ThemeNames.DARK]: {
    theme: darkTheme,
    less: stylePattern(Object.assign({}, baseColor, darkTheme.colorSet)),
    css: null,
  },
  [ThemeNames.GREEN_LIGHT]: {
    theme: greenLightTheme,
    less: stylePattern(Object.assign({}, baseColor, greenLightTheme.colorSet)),
    css: null
  },
  [ThemeNames.CUCKOO_HUB]: {
    theme: cuckooHubTheme,
    less: stylePattern(Object.assign({}, baseColor, cuckooHubTheme.colorSet)),
    css: null
  }
}

class ThemeManager {

  public get themeInfo () {
    return Object.assign({}, presetThemeInfo, this.customThemeInfo)
  }

  private customThemeInfo = localStorage.getItem('customThemeInfo') ? JSON.parse(localStorage.getItem('customThemeInfo')) : {}

  private getThemeStyleElem (): HTMLStyleElement {
    const themeElemId = 'cuckoo-plus-theme'
    let styleElem = document.getElementById(themeElemId)

    if (styleElem) return styleElem as HTMLStyleElement

    styleElem = document.createElement('style')
    styleElem.id = themeElemId
    document.body.appendChild(styleElem)

    return styleElem as HTMLStyleElement
  }

  private setFavIconByThemeName (themeName: string) {
    Array.from(document.head.querySelectorAll('link')).forEach(el => {
      if (el.getAttribute('rel') === 'icon') {
        const size = el.getAttribute('sizes')
        if (size) {
          el.setAttribute('href', `favicon/${this.themeInfo[themeName].theme.toFavIconPath}/${size}.png`)
        }
      }
    })
  }

  private setThemeColorByThemeName (themeName: string) {
    Array.from(document.head.querySelectorAll('meta')).find(el => {
      return el.getAttribute('name') === 'theme-color'
    }).setAttribute('content', this.themeInfo[themeName].theme.colorSet['@primaryColor'])
  }

  private setThemeCssByThemeName (themeName: string) {
    // todo fix custom localStorage data error
    if (!this.themeInfo[themeName].less || this.customThemeInfo[themeName]) {
      this.themeInfo[themeName].less = stylePattern(Object.assign({}, baseColor, this.themeInfo[themeName].theme.colorSet))
    }

    if (this.themeInfo[themeName].css) {
      this.getThemeStyleElem().innerHTML = this.themeInfo[themeName].css
    } else {
      less.render(this.themeInfo[themeName].less).then(output => {
        this.getThemeStyleElem().innerHTML = output.css
        this.themeInfo[themeName].css = output.css
      })
    }
  }

  private addCustomThemeInfo (themeColorSet, themeName) {
    this.customThemeInfo[themeName] = {
      theme: { colorSet: themeColorSet, toFavIconPath: 'google_plus' },
      less: stylePattern(Object.assign({}, baseColor, themeColorSet)),
      css: null
    }

    this.updateLocalStorageData()
  }

  private deleteCustomThemeInfo (themeName) {
    delete this.customThemeInfo[themeName]
    this.updateLocalStorageData()
  }

  private updateLocalStorageData () {
    const customThemeInfo = {}
    Object.keys(this.customThemeInfo).forEach(themeName => {
      customThemeInfo[themeName] = {
        theme: { colorSet: this.customThemeInfo[themeName].theme.colorSet, toFavIconPath: 'google_plus' }
      }
    })
    localStorage.setItem('customThemeInfo', JSON.stringify(customThemeInfo))
  }

  public getThemeInfoByThemeName (themeName: string) {
    if (!this.themeInfo[themeName]) return this.themeInfo[ThemeNames.GOOGLE_PLUS]

    return this.themeInfo[themeName]
  }

  public getThemeOptionsList () {
    return Object.keys(this.themeInfo)
      .filter(themeName => typeof this.themeInfo[themeName] === 'object')
      .map(themeName => { return { 'value': themeName } })
  }

  public getCustomThemeOptionsList () {
    return Object.keys(this.customThemeInfo)
      .filter(themeName => typeof this.themeInfo[themeName] === 'object')
      .map(themeName => { return { 'value': themeName } })
  }

  public setTheme (themeName: string) {
    if (!this.themeInfo[themeName]) {
      themeName = ThemeNames.GOOGLE_PLUS
    }
    this.setThemeCssByThemeName(themeName)
    this.setFavIconByThemeName(themeName)
    this.setThemeColorByThemeName(themeName)
  }

  public exportTheme (themeName: string) {
    const blob = new Blob([JSON.stringify(this.themeInfo[themeName].theme.colorSet)], { type: "text/plain;charset=utf-8" });
    fileSaver.saveAs(blob, `${themeName}.json`);
  }

  public importTheme (themeColorSet, themeName: string) {
    this.addCustomThemeInfo(themeColorSet, themeName)
  }

  public deleteTheme (themeName: string) {
    this.deleteCustomThemeInfo(themeName)
  }

  public setTempThemeByColorSet (colorSet) {
    const finalColorSet = Object.assign({}, baseColor, colorSet)
    less.render(stylePattern(finalColorSet)).then(output => {
      this.getThemeStyleElem().innerHTML = output.css
    })
  }
}

export default new ThemeManager()
