// MIT License

// Copyright (c) 2016 Yury Dymov

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import getCaretCoordinates from 'textarea-caret';
import getInputSelection, { setCaretPosition } from 'get-input-selection';

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_RETURN = 13;
const KEY_ENTER = 14;
const KEY_ESCAPE = 27;
const KEY_TAB = 9;

const OPTION_LIST_Y_OFFSET = 10;
const OPTION_LIST_MIN_WIDTH = 100;

const propTypes = {
  Component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType,
  ]),
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  maxOptions: PropTypes.number,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  onRequestOptions: PropTypes.func,
  onSelect: PropTypes.func,
  options: PropTypes.arrayOf(PropTypes.object),
  regex: PropTypes.string,
  matchAny: PropTypes.bool,
  minChars: PropTypes.number,
  requestOnlyIfNoOptions: PropTypes.bool,
  spaceRemovers: PropTypes.arrayOf(PropTypes.string),
  spacer: PropTypes.string,
  trigger: PropTypes.string,
  value: PropTypes.string,
  offsetX: PropTypes.number,
  offsetY: PropTypes.number,
  passThroughEnter: PropTypes.bool,
};

const defaultProps = {
  Component: 'textarea',
  defaultValue: '',
  disabled: false,
  maxOptions: 6,
  onBlur: () => {},
  onChange: () => {},
  onKeyDown: () => {},
  onRequestOptions: () => {},
  onSelect: () => {},
  options: [],
  fullOptions: [],
  regex: '^[A-Za-z0-9\\-_]+$',
  matchAny: false,
  minChars: 0,
  requestOnlyIfNoOptions: true,
  spaceRemovers: [',', '.', '!', '?'],
  spacer: ' ',
  trigger: '@',
  offsetX: 0,
  offsetY: 0,
  value: null,
  passThroughEnter: false,
};

class AutocompleteTextField extends React.Component {
  constructor(props) {
    super(props);

    this.isTrigger = this.isTrigger.bind(this);
    this.getMatch = this.getMatch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
    this.updateCaretPosition = this.updateCaretPosition.bind(this);
    this.updateHelper = this.updateHelper.bind(this);
    this.resetHelper = this.resetHelper.bind(this);
    this.renderAutocompleteList = this.renderAutocompleteList.bind(this);

    this.state = {
      helperVisible: false,
      left: 0,
      matchLength: 0,
      matchStart: 0,
      options: [],
      fullOptions: [],
      selection: 0,
      top: 0,
      value: null,
    };

    this.recentValue = props.defaultValue;
    this.enableSpaceRemovers = false;
    this.refInput = createRef();
  }
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    // console.log("Autocomplete");
    // console.log(this.recentValue);
    // console.log(this.state.fullOptions);
  }

  componentDidUpdate(prevProps) {
    const { options } = this.props;
    const { fullOptions } = this.props;
    const { caret } = this.state;

    if (options.length !== prevProps.options.length) {
      this.updateHelper(this.recentValue, caret, options, fullOptions);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  getMatch(str, caret, providedOptions, fullOptions) {
    const { trigger, matchAny, regex } = this.props;
    const re = new RegExp(regex);
    const triggerLength = trigger.length;
    const triggerMatch = trigger.match(re);

    for (let i = caret - 1; i >= 0; --i) {
      const substr = str.substring(i, caret);
      const match = substr.match(re);
      let matchStart = -1;

      if (triggerLength > 0) {
        const triggerIdx = triggerMatch ? i : i - triggerLength + 1;

        if (triggerIdx < 0) { // out of input
          return null;
        }

        if (this.isTrigger(str, triggerIdx)) {
          matchStart = triggerIdx + triggerLength;
        }

        if (!match && matchStart < 0) {
          return null;
        }
      } else {
        if (match && i > 0) { // find first non-matching character or begin of input
          continue;
        }
        matchStart = i === 0 && match ? 0 : i + 1;

        if (caret - matchStart === 0) { // matched slug is empty
          return null;
        }
      }

      if (matchStart >= 0) {
        const matchedSlug = str.substring(matchStart, caret);
        
        const options = providedOptions.filter((slug) => {
          const idx = slug.toLowerCase().indexOf(matchedSlug.toLowerCase());
          return idx !== -1 && (matchAny || idx === 0);
        });
        var newFullOptions = [];
        for(var j=0;j<providedOptions.length;j++) {
            const matchIdx = providedOptions[j].toLowerCase().indexOf(matchedSlug.toLowerCase());
            if(matchIdx !== -1 && (matchAny || matchIdx === 0))
            // console.log(j);
            newFullOptions.push(this.props.fullOptions[j]);
        }
        this.setState({"fullOptions": newFullOptions});
        const matchLength = matchedSlug.length;
        // console.log("returning slug:")
        // console.log(options);
        // console.log(newFullOptions);
        // console.log(this.props.fullOptions);

        return { matchStart, matchLength, options };
      }
    }

    return null;
  }

  isTrigger(str, i) {
    const { trigger } = this.props;

    if (!trigger || !trigger.length) {
      return true;
    }

    if (str.substr(i, trigger.length) === trigger) {
      return true;
    }

    return false;
  }

  handleChange(e) {
    const {
      onChange,
      options,
      fullOptions,
      spaceRemovers,
      spacer,
      value,
    } = this.props;

    const old = this.recentValue;
    const str = e.target.value;
    const caret = getInputSelection(e.target).end;

    if (!str.length) {
      this.setState({ helperVisible: false });
    }

    this.recentValue = str;

    this.setState({ caret, value: e.target.value });

    if (!str.length || !caret) {
      return onChange(e.target.value);
    }

    // '@wonderjenny ,|' -> '@wonderjenny, |'
    if (this.enableSpaceRemovers && spaceRemovers.length && str.length > 2 && spacer.length) {
      for (let i = 0; i < Math.max(old.length, str.length); ++i) {
        if (old[i] !== str[i]) {
          if (
            i >= 2
            && str[i - 1] === spacer
            && spaceRemovers.indexOf(str[i - 2]) === -1
            && spaceRemovers.indexOf(str[i]) !== -1
            && this.getMatch(str.substring(0, i - 2), caret - 3, options, fullOptions)
          ) {
            const newValue = (`${str.slice(0, i - 1)}${str.slice(i, i + 1)}${str.slice(i - 1, i)}${str.slice(i + 1)}`);

            this.updateCaretPosition(i + 1);
            this.refInput.current.value = newValue;

            if (!value) {
              this.setState({ value: newValue });
            }

            return onChange(newValue);
          }

          break;
        }
      }

      this.enableSpaceRemovers = false;
    }

    this.updateHelper(str, caret, options, fullOptions);

    if (!value) {
      this.setState({ value: e.target.value });
    }

    return onChange(e.target.value);
  }

  handleKeyDown(event) {
    const { helperVisible, options, selection } = this.state;
    const { onKeyDown, passThroughEnter } = this.props;

    if (helperVisible) {
      switch (event.keyCode) {
        case KEY_ESCAPE:
          event.preventDefault();
          this.resetHelper();
          break;
        case KEY_UP:
          event.preventDefault();
          this.setState({ selection: ((options.length + selection) - 1) % options.length });
          break;
        case KEY_DOWN:
          event.preventDefault();
          this.setState({ selection: (selection + 1) % options.length });
          break;
        case KEY_ENTER:
        case KEY_RETURN:
          if (!passThroughEnter) { event.preventDefault(); }
          this.handleSelection(selection);
          break;
        case KEY_TAB:
          this.handleSelection(selection);
          break;
        default:
          onKeyDown(event);
          break;
      }
    } else {
      onKeyDown(event);
    }
  }

  handleResize() {
    this.setState({ helperVisible: false });
  }

  handleSelection(idx) {
    const { matchStart, matchLength, fullOptions } = this.state;
    const { spacer, onSelect } = this.props;
    // console.log("handleSelection");
    // console.log(idx);
    // console.log(fullOptions);
    const slug = fullOptions[idx];
    const value = this.recentValue;
    const part1 = value.substring(0, matchStart);
    const part2 = value.substring(matchStart + matchLength);

    const event = { target: this.refInput.current };

    event.target.value = `${part1}${slug}${spacer}${part2}`;
    this.handleChange(event);
    onSelect(event.target.value);

    this.resetHelper();

    this.updateCaretPosition(part1.length + slug.length + 1);

    this.enableSpaceRemovers = true;
  }

  updateCaretPosition(caret) {
    this.setState({ caret }, () => setCaretPosition(this.refInput.current, caret));
  }

  updateHelper(str, caret, options, fullOptions) {
    const input = this.refInput.current;

    const slug = this.getMatch(str, caret, options, fullOptions);
    // console.log("updateHelper");
    // console.log(slug);
    if (slug) {
      const caretPos = getCaretCoordinates(input, caret);
      const rect = input.getBoundingClientRect();

      const top = caretPos.top + input.offsetTop;
      const left = Math.min(
        caretPos.left + input.offsetLeft - OPTION_LIST_Y_OFFSET,
        input.offsetLeft + rect.width - OPTION_LIST_MIN_WIDTH,
      );

      const { minChars, onRequestOptions, requestOnlyIfNoOptions } = this.props;

      if (
        slug.matchLength >= minChars
        && (
          slug.options.length > 1
          || (
            slug.options.length === 1
            && slug.options[0].length !== slug.matchLength
          )
        )
      ) {
        this.setState({
          helperVisible: true,
          top,
          left,
          ...slug,
        });
      } else {
        if (!requestOnlyIfNoOptions || !slug.options.length) {
          onRequestOptions(str.substr(slug.matchStart, slug.matchLength));
        }

        this.resetHelper();
      }
    } else {
      this.resetHelper();
    }
  }

  resetHelper() {
    this.setState({ helperVisible: false, selection: 0 });
  }

  renderAutocompleteList() {
    const {
      helperVisible,
      left,
      matchStart,
      matchLength,
      options,
      fullOptions,
      selection,
      top,
      value,
    } = this.state;

    if (!helperVisible) {
      return null;
    }

    const { maxOptions, offsetX, offsetY } = this.props;

    if (options.length === 0) {
      return null;
    }

    if (selection >= options.length) {
      this.setState({ selection: 0 });

      return null;
    }

    const optionNumber = maxOptions === 0 ? options.length : maxOptions;

    const helperOptions = options.slice(0, optionNumber).map((val, idx) => {
      const highlightStart = val.toLowerCase().indexOf(value.substr(matchStart, matchLength).toLowerCase());

      return (
        <li
          className={idx === selection ? 'active' : null}
          key={val}
          onClick={() => { this.handleSelection(idx); }}
          onMouseEnter={() => { this.setState({ selection: idx }); }}
        >
          {val.slice(0, highlightStart)}
          <strong>{val.substr(highlightStart, matchLength)}</strong>
          {val.slice(highlightStart + matchLength)}
        </li>
      );
    });

    return (
      <ul className="react-autocomplete-input" style={{ left: left + offsetX, top: top + offsetY }}>
        {helperOptions}
      </ul>
    );
  }

  render() {
    const {
      Component,
      defaultValue,
      disabled,
      onBlur,
      value,
      ...rest
    } = this.props;

    const { value: stateValue } = this.state;

    const propagated = Object.assign({}, rest);
    Object.keys(this.constructor.propTypes).forEach((k) => { delete propagated[k]; });

    let val = '';

    if (typeof value !== 'undefined' && value !== null) {
      val = value;
    } else if (stateValue) {
      val = stateValue;
    } else if (defaultValue) {
      val = defaultValue;
    }

    return (
      <span>
        <Component
          disabled={disabled}
          onBlur={onBlur}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          ref={this.refInput}
          value={val}
          {...propagated}
        />
        {this.renderAutocompleteList()}
      </span>
    );
  }
}

AutocompleteTextField.propTypes = propTypes;
AutocompleteTextField.defaultProps = defaultProps;

export default AutocompleteTextField;