/**
 * affect given settings to every input on the document.
 *
 * @param settings inputs settings object
 * @param targetedWindow targeted window: ```main``` | ```ga-cp```
 */
function affectSettings(settings: object, targetedWindow: 'main' | 'ga-cp') {
  Array.from(document.getElementsByTagName('input')).forEach(input => {
    // console.log(input);
    if (input.type == 'checkbox') {
      let type: 'enabled' | 'pin' = <'enabled' | 'pin'>(
        input.id.match(/(?<=-)[^-]*$/)[0]
      );

      input.checked = settings[input.id.replace(`-${type}`, '')][type];

      if (input.id == 'force-tf-enabled') {
        Array.from(document.getElementsByClassName('textfieldable')).forEach(
          (textfieldable: HTMLInputElement) => {
            textfieldable.type = input.checked ? 'text' : 'range';
          }
        );
      } else if (targetedWindow == 'main') {
        if ((type == 'pin' || type == 'enabled') && input.id != 'lr-enabled') {
          let complexParam = <HTMLDivElement>(
            (type == 'pin'
              ? input.parentElement.parentElement.parentElement.parentElement
                  .parentElement
              : input.parentElement)
          );

          if (!input.checked) {
            complexParam.classList.add('hide');
          } else if (
            type == 'pin' &&
            (!(complexParam.children.length > 1) ||
              (<HTMLInputElement>complexParam.firstElementChild).checked)
          ) {
            complexParam.classList.remove('hide');
          }
        }
      }
    } else {
      input.value = settings[input.id]['value'];
      if (targetedWindow == 'main' && settings[input.id]['disable-on-run']) {
        input.classList.add('disable-on-run');
      }
    }
  });
}

module.exports = affectSettings;