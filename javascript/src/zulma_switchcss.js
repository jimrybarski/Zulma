(function (switch_css) {
    //Constants
    const THEME_KEY = "ZULMA_THEME";
    const STOP_BLINK_CSS_ID = "stop-blink";
    const STYLESHEET_CLASSNAME = "stylesheet"

    //Variables
    let link = null;
    let previousLink = null;
    let theme = localStorage.getItem(THEME_KEY);

    //Private Methods
    /* Called when the theme is changed */
    function changeTheme(themeName, firstLoad) {
        //create the css link element
        var fileref = document.createElement("link");
        fileref.rel = "stylesheet";
        fileref.type = "text/css";
        fileref.href = `/${themeName}.css`;
        fileref.id = themeName;

        //append it to the head
        link = document.getElementsByTagName("head")[0].appendChild(fileref);

        //when it's loaded, call onLinkLoad
        link.addEventListener('load', onLinkLoad);
        //if it errors, call onLinkError
        link.addEventListener('error', onLinkError);

        //if this is the first load of the page, remove the current stylesheet early to avoid flash of wrongly styled content
        if (firstLoad) {
            //keep the old link in case something goes wrong
            previousLink = document.querySelectorAll(`.${STYLESHEET_CLASSNAME}`)[0];
            removeStylesheets();
        }

        saveTheme(themeName);
    };

    /* Removes all current stylesheets on the page */
    function removeStylesheets() {
        document.querySelectorAll(`.${STYLESHEET_CLASSNAME}`).forEach((el) => {
            el.remove();
        });
    }

    /* The function called when the css has finished loading */
    function onLinkLoad() {
        //remove event listeners
        link.removeEventListener('load', onLinkLoad);
        link.removeEventListener('error', onLinkError);
        //remove the previous stylesheet(s)
        removeStylesheets();
        //add stylesheet class
        link.className += STYLESHEET_CLASSNAME;
        //everything is good, so we don't need this
        previousLink = null;
        //make body visible again if it was hidden
        showBody();
    };

    function onLinkError() {
        //remove event listeners
        link.removeEventListener('load', onLinkLoad);
        link.removeEventListener('error', onLinkError);
        //remove theme from localstorage
        clearTheme();
        //remove theme from dropdown list
        removeFromThemeSelect(link.id);
        //remove link from page
        link.remove();
        //re-add the previous stylesheet (if any)
        if (previousLink) {
            document.getElementsByTagName("head")[0].appendChild(previousLink);
        }
        //set the theme select to the previous stylesheet
        setThemeSelect(document.querySelectorAll(`.${STYLESHEET_CLASSNAME}`)[0].id)
        //make body visible again if it was hidden
        showBody();
    };

    /* Saves the current theme in localstorage */
    function saveTheme(themeName) {
        localStorage.setItem(THEME_KEY, themeName);
    };

    /* Clears the current theme in localstorage */
    function clearTheme() {
        localStorage.removeItem(THEME_KEY);
    };

    /* Hides the body of the page */
    function hideBody() {
        var head = document.getElementsByTagName('head')[0];
        var style = document.createElement('style');

        style.id = STOP_BLINK_CSS_ID;
        style.setAttribute('type', 'text/css');

        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode('body{visibility:hidden;}'));
        }
        head.appendChild(style);
    };

    /* Shows the body of the page */
    function showBody() {
        let css = document.getElementById(STOP_BLINK_CSS_ID);
        if (css)
            css.remove();
    };

    /* Sets the theme selection to the given theme */
    function setThemeSelect(theme) {
        //get all select options
        let elements = document.querySelectorAll('#theme-select>option');
        //if there are elements, the page is loaded and continue
        if (elements.length) {
            elements.forEach(element => {
                if (element.value === theme) {
                    element.selected = 'selected';
                }
            });
        } else {
            //if there are no elements, the page is not yet loaded; wait for loaded event and try again.
            window.addEventListener('DOMContentLoaded', () => {
                setThemeSelect(theme)
            });
        }
    }

    function removeFromThemeSelect(theme) {
        //get all select options
        let elements = document.querySelectorAll('#theme-select>option');
        //if there are elements, the page is loaded
        if (elements.length) {
            elements.forEach(element => {
                if (element.value === theme) {
                    element.remove();
                }
            });
        } else {
            //if there are no elements, the page is not yet loaded; wait for loaded event and try again.
            window.addEventListener('DOMContentLoaded', () => {
                removeFromThemeSelect(theme)
            });
        }
    }

    //Public Methods
    switch_css.init = function () {
        //if user has selected and theme and it is not the current theme
        if (theme && !document.getElementById(theme)) {
            //hide the body to stop FOUC
            hideBody();
            //change the theme
            changeTheme(theme, true);
            //when the DOM is loaded, change the select to their current choice
            setThemeSelect(theme);
        }
        //when the DOM is loaded, set the dropdown to trigger the theme change
        window.addEventListener('DOMContentLoaded', () => {
            document.getElementById('theme-select').onchange = function () {
                changeTheme(this.value);
            }
        });
    }
}(switch_css = window.switch_css || {}));

switch_css.init();