export var utils = {
		isUSLocal: (function () {
			var number = 3500.5,
				string = number.toLocaleString();
			
			// 3,500.5
			return string.substring(1, 2) === ',' && string.substring(5, 6) === '.';
		})(),
		
		verifyIsNumber: function (value, isInteger) {
			// remove any non decimal characters
			var isNegative = value.length > 0 && value[0] === '-';
			if (isInteger) {
				value = value.replace(/(\D)+/g, '');
			}
			else {
				if (!utils.isUSLocal) {
					// Convert to US Local
					value = value.replace(/([.])+/g, '').replace(/([,])+/g, '.').replace(/([^\d.])+/g, '');
					var index = value.indexOf('.');
					value = value.substring(0, index + 1) + value.substring(index).replace(/([.])+/g, '');
				} else {
					value = value.replace(/([,])+/g, '').replace(/([^\d.])+/g, '');
					var index = value.indexOf('.');
					value = value.substring(0, index + 1) + value.substring(index).replace(/([.])+/g, '');
				}
			}
			return isNegative ? '-' + value : value;
		},
		
		verifyShort: function (el) {
			var value = utils.verifyIsNumber(el.value, true),
				shortVal = parseInt(value);
			
			if (!isNaN(shortVal)) {
				if (shortVal > Math.pow(2, 15) - 1)
					value = '' + (Math.pow(2, 15) - 1);
				else if (shortVal < -Math.pow(2, 15))
					value = '' + (-Math.pow(2, 15));
			} 
			
			return value;
		},
		
		verifyInteger: function (el) {
			var value = utils.verifyIsNumber(el.value, true),
				intVal = parseInt(value);
			
			if (!isNaN(intVal)) {
				if (intVal > Math.pow(2, 31) - 1)
					value = '' + (Math.pow(2, 31) - 1);
				else if (intVal < -Math.pow(2, 31))
					value = '' + (-Math.pow(2, 31));
			} 
			
			return value;
		},
		
		verifyLong: function (el) {
			var value = utils.verifyIsNumber(el.value, true);
			
			if (value.length > 14) {
				var longMostSignificant = parseInt(value.substring(0, value.length - 14)),
					longLeastSignificant = parseInt((value.length - 14).toString());
			} else {
				var longMostSignificant = 0,
					longLeastSignificant = parseInt(value);
			}
				

			if (!isNaN(longMostSignificant) && !isNaN(longLeastSignificant)) {
				if (longMostSignificant > 9223 && longLeastSignificant > 372036854775807)
					value = '9223372036854775807';
				else if (longMostSignificant < -9223 && longLeastSignificant > 372036854775808)
					value = '-9223372036854775808';
			} 

			return value;
		},
		
		verifyFloat: function (el) {
			var value = utils.verifyIsNumber(el.value, false),
				floatVal = parseFloat(this);
			
			if (!isNaN(floatVal)) {
				if (floatVal > (2 - Math.pow(2, -23)) * Math.pow(2, 127))
					value = '' + (2 - Math.pow(2, -23)) * Math.pow(2, 127);
				else if (floatVal < -(2 - Math.pow(2, -23)) * Math.pow(2, 127))
					value = '' + (-(2 - Math.pow(2, -23)) * Math.pow(2, 127));
			}
			
			var numStr = value.replace(/(\D)+/g, ''),
				index = value.indexOf('.'),
				isNegative = value.length > 0 && value[0] === '-';

			if (numStr.length > this.maxDigits - this.precision)
				value = numStr.substring(0, this.maxDigits - this.precision) + '.' + numStr.substring(this.maxDigits - this.precision, this.maxDigits);
			else if (index !== -1 && value.length - index - 1 > 8) 
				value = numStr.substring(0, index) + '.' + numStr.substring(index, index + this.precision);
			
			return isNegative && value[0] !== '-' ? '-' + value : value;
		},
		
		verifyDouble: function (el) {
			var value = utils.verifyIsNumber(el.value, false),
				doubleVal = parseFloat(this);
			
			if (!isNaN(doubleVal)) {
				if (doubleVal > (2 - Math.pow(2, -52)) * Math.pow(2, 1023))
					value = '' + (2 - Math.pow(2, -52)) * Math.pow(2, 1023);
				else if (doubleVal < -(2 - Math.pow(2, -52)) * Math.pow(2, 1023))
					value = '' + (-(2 - Math.pow(2, -52)) * Math.pow(2, 1023));
			}
			
			var numStr = value.replace(/(\D)+/g, ''),
				index = value.indexOf('.');
			
			if (numStr.length > this.maxDigits - this.precision) {
				value = numStr.substring(0, this.maxDigits - this.precision) + '.' + numStr.substring(this.maxDigits - this.precision, this.maxDigits);
			}
			else if (index !== -1 && value.length - index - 1 > 8) {
				value = numStr.substring(0, index) + '.' + numStr.substring(index, index + this.precision);
			}
			
			return value;
		},
		
		verifyBigDecimal:  function (el) {
			var value = utils.verifyIsNumber(el.value, false),
				numStr = value.replace(/(\D)+/g, ''),
				index = value.indexOf('.');
			
			if (numStr.length > this.maxDigits - this.precision) {
				value = numStr.substring(0, this.maxDigits - this.precision) + '.' + numStr.substring(this.maxDigits - this.precision, this.maxDigits);
			}
			else if (index !== -1 && value.length - index - 1 > 8) {
				value = numStr.substring(0, index) + '.' + numStr.substring(index, index + this.precision);
			}
			
			return value;
		},
		
		verifyString: function (el) {
			var val = el.value;
			if (val.length > this.maxCharacters)
				val = val.substring(0, this.maxCharacters);
			return val;
		},
		
		verifyBeNumber: function (el, isRequired) {
			var ret = utils.verifyString.call(this, el).toUpperCase();
			
			if (isRequired && ret.length === 0)
				el.className = 'required';
			else if (ret.length !== 0 && !/[0,1][0-8]\d{2}[A-Z,-][A-Z,0-9]\d{4}/.test(ret))
				el.className = 'wrong';
			else
				el.className = '';
			
			return ret;
		},
		
		verifyOSuffix: function (el, isRequired) {
			var ret = utils.verifyString.call(this, el).toUpperCase();
			
			if (isRequired && ret.length === 0)
				el.className = 'required';
			else if (ret.length !== 0 && !/[A-Z]{2}\d{3}/.test(ret))
				el.className = 'wrong';
			else
				el.className = '';
			
			return ret;
		},
		
		verifyTgtCoord: function (el, isRequired) {
			var ret = utils.verifyString.call(this, el).toUpperCase();
			
			if (isRequired && ret.length === 0)
				el.className = 'required';
			else if (ret.length !== 0 && !/^(\d{1,2}[\d.]{0,1}\d{0,3})[NS][ ](\d{1,3}[\d.]{0,1}\d{0,3})[EW]/.test(ret))
				el.className = 'wrong';
			else
				el.className = '';
			
			return ret;
		},
		
		isValidDate: function (val) {
			var index1 = val.indexOf('/');
			if (index1 < 0)
				return false;
			
			var index2 = val.substring(index1 + 1).indexOf('/') + index1 + 1;
			if (index2 === index1)
				return false;
			
			var m = parseInt(val.substring(0, index1));
			if (isNaN(m))
				return false;
			
			var d = parseInt(val.substring(index1 + 1, index2));
			if (isNaN(d))
				return false;
			
			var y = parseInt(val.substring(index2 + 1, index2 + 5));
			if (isNaN(y))
				return false;
			
			if (m > 12)
				return false;
			
			var daysInMonth = new Date(y, m, 0).getDate();
			if (daysInMonth < d)
				return false;
			
			return true;
		},
		
		verifyDate: function (el, isRequired) {
			var ret = el.value;
			
			if (isRequired && ret.length === 0)
				el.className = 'required';
			else if (ret.length !== 0 && (!/([0-1]{0,1}\d{0,1}[/][0-3]{0,1}\d{0,1}[/]\d{4})(?![^\0])/.test(ret) || !utils.isValidDate(ret)))
				el.className = 'wrong';
			else
				el.className = '';
			
			return ret;
		},
		
		verifyDropdown: function (el) {
			return el.value || '';
		},
		
		verifyFloatColumn: function (el, isRequired) {
			var ret = utils.verifyFloat.call(this, el),
				val = parseFloat(ret);
			
			if (!isNaN(val))
				el.className = '';
			else if (isRequired)
				el.className = 'required';
			
			return ret;
		},
		
		verifyStringColumn: function (el, isRequired) {
			var ret = utils.verifyString.call(this, el);
			
			if (isRequired && ret.length === 0)
				el.className = 'required';
			else
				el.className = '';
			
			return ret;
		},
		
		verifyAlphaNumericColumn: function (el, isRequired) {
			var ret = utils.verifyString.call(this, el).toUpperCase().replace(/[^A-Z0-9 -.]/g, '');
			
			if (isRequired && ret.length === 0)
				el.className = 'required';
			else
				el.className = '';
			
			return ret;
		},
		
		verifyCatcode: function (el, isRequired) {
			var ret = utils.verifyString.call(this, el).replace(/[^0-9]/g, '');
			
			if (isRequired && ret.length === 0) 
				el.className = 'required';
			else if (ret.length !== 0 && !/\d{5}/.test(ret))
				el.className = 'wrong';
			else
				el.className = '';
			
			return ret;
		},
		
		verifyCountry: function (el, isRequired) {
			var ret = utils.verifyString.call(this, el).toUpperCase().replace(/[^A-Z]/g, '');
			
			if (isRequired && ret.length === 0) 
				el.className = 'required';
			else if (ret.length !== 2 || !/[A-Z]{2}/.test(ret)) 
				el.className = 'wrong';
			else
				el.className = '';
			
			return ret;
		},
		
		verifyTwoNumericCharactersColumn: function (el, isRequired) {
			var ret = utils.verifyShort.call(this, el).substring(0, 2);
			
			if (isRequired && ret.length === 0)
				el.className = 'required';
			else
				el.className = '';
				
			return ret;
		},
		
		verifyTimeOverTarget: function (el, isRequired) {
			var ret = el.value;
			
			if (isRequired && ret.length === 0) 
				el.className = 'required';
			else if (ret.length !== 0 && !/\d{4}[Z]/.test(ret)) 
				el.className = 'wrong';
			else
				el.className = '';
			
			return ret;
		},
		
		verifyDeclassifyOn: function (el, isRequired) {
			var ret = utils.verifyStringColumn.call(this, el);
			
			if (isRequired && ret.length === 0)
				el.className = 'required';
			else if (ret.length !== 0 && !/[2][5][x][1][,][ ]\d{8}/.test(ret))
				el.className = 'wrong';
			else
				el.className = '';
			
			return ret;
		}
	};
	