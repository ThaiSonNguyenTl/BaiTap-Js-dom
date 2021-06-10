function Validator(params) {
    var formElement = document.querySelector(params.form)
    var btn_submit = formElement.querySelector(params.btn_disable)
    var selectorRules = {}
        // ham lay phan tu cha 
    var getParent = (element, selector) => {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement;
        }
    }

    // hàm thực hiện validate field
    var validateFeild = (inputElement, rule) => {
        // console.log(selectorRules)
        var errorElement = getParent(inputElement, params.formGroup).querySelector(params.msg_error_selector)
        var errorMessage;
        // lay cac rule cua selector
        var rules = selectorRules[rule.selector] // rules la 1 array
            // lap qua tung rule va kiem tra, neu xay ra loi thi dưng ktra
        for (var i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value)
            if (errorMessage) break;
        }
        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, params.formGroup).classList.add('invalid')
            btn_submit.disabled = true;
        } else {
            errorElement.innerText = ''
            getParent(inputElement, params.formGroup).classList.remove('invalid')
            btn_submit.disabled = false;
        }
        return !errorMessage;
    }

    if (formElement) {
        formElement.onsubmit = function(e) {
            e.preventDefault()
            var isFormValid = true; // thop ko co loi o form : 
            params.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validateFeild(inputElement, rule)
                if (!isValid) {
                    isFormValid = false;
                }
            })
            if (isFormValid) {
                if (typeof params.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce((Values_Obj, input) => {
                        Values_Obj[input.name] = input.value
                        return Values_Obj
                    }, {})
                    params.onSubmit(formValues)
                }
            }
        }

        // lap qua cac rule va xu ly(lang nghe su kien : blur , oninput)
        params.rules.forEach(rule => {
            // Lưu lại rule cho mỗi ô input
            // console.log(rule)
            // console.log(selectorRules[rule.selector])
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
                    // console.log([rule.test])
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector)
            if (inputElement) {
                // trường hợp blur khỏi input
                inputElement.onblur = () => {
                        validateFeild(inputElement, rule)
                    }
                    // trường hợp người dùng bắt đầu nhập 
                inputElement.oninput = () => {
                    var errorElement = getParent(inputElement, params.formGroup).querySelector(params.msg_error_selector)
                    errorElement.innerText = ''
                    getParent(inputElement, params.formGroup).classList.remove('invalid')
                }
            }
        })
    }
}

// định nghĩa các rules
// Khi có unvalid => message lỗi
// Khi valid => ẩn message lỗi (ko trả ra gì (return undefine))
Validator.isRequired = selector => {
    return {
        selector,
        test: value => value ? undefined : 'Please fill out this field!'
    }
}
Validator.isName = (selector, message) => {
    return {
        selector,
        test: value => {
            const regex_vietnamese = new RegExp("^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\W|_]+$");
            const regex_special_character = new RegExp('[!@#$%^&*(),.?":{}|<>]')
            if (regex_vietnamese.test(value) || !regex_special_character.test(value) && value.trim()) {
                return undefined
            } else {
                return message || 'Please fill out this field!'
            }

        }
    }
}
Validator.isEmail = (selector, message) => {
    return {
        selector,
        test: value => {
            const regex_mail = new RegExp("^[a-z][a-z0-9_\.]{5,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$");
            return regex_mail.test(value) ? undefined : message || 'Please fill out this field!'
        }
    }
}

Validator.isPassword = (selector, message) => {
    return {
        selector,
        test: value => {
            const regex_password = new RegExp("^(?=.*[a-z])(?=.*[A-Z]).{8,32}$")
            return regex_password.test(value) ? undefined : message || 'Please fill out this field!'
        }
    }
}

Validator.confirmedPassword = (selector, getConfirmValue, message) => {
    return {
        selector,
        test: value => value === getConfirmValue() ? undefined : message || 'Not match! Please try again'
    }
}